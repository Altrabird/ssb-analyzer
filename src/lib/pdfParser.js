import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

// Status patterns. Longer/more-specific first so "Tidak Hantar" matches before "Hantar".
// `canonical` = label used everywhere downstream (UI, aggregation, exports).
const STATUS_PATTERNS = [
  { pattern: 'Belum Semak', canonical: 'Belum Semak' },
  { pattern: 'Tidak Hantar', canonical: 'Tidak Hantar' },
  { pattern: 'Belum Hantar', canonical: 'Tidak Hantar' },
  { pattern: 'Hantar Lewat', canonical: 'Hantar Lewat' },
  { pattern: 'Siap Hantar', canonical: 'Siap Hantar' },
  { pattern: 'Hantar', canonical: 'Siap Hantar' },
  { pattern: 'Selesai', canonical: 'Siap Hantar' },
]

const HEADER_LABELS = ['Tarikh', 'Kelas', 'Guru', 'Subjek', 'Catatan', 'Dihasilkan pada', 'Dihasilkan']

async function extractLines(buffer) {
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const lines = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    const items = content.items
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: viewport.height - it.transform[5],
      }))
      .filter((it) => it.str && it.str.trim().length > 0)
      .sort((a, b) => a.y - b.y || a.x - b.x)

    const rows = []
    for (const item of items) {
      const last = rows[rows.length - 1]
      if (last && Math.abs(last.y - item.y) < 4) {
        last.items.push(item)
        last.y = (last.y + item.y) / 2
      } else {
        rows.push({ y: item.y, items: [item] })
      }
    }
    for (const r of rows) {
      r.items.sort((a, b) => a.x - b.x)
      lines.push({
        page: p,
        y: r.y,
        text: r.items.map((i) => i.str.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
        cells: r.items,
      })
    }
  }
  return lines
}

function detectColumns(lines) {
  const header = lines.find((l) => /\bNama Murid\b/i.test(l.text) && /\bStatus\b/i.test(l.text))
  if (!header) return null
  const hasJantina = /\bJantina\b/i.test(header.text)
  const hasEvidens = /\bEvidens\b/i.test(header.text)
  return { headerY: header.y, headerPage: header.page, hasJantina, hasEvidens }
}

function extractField(fullText, label) {
  // Find "Label:" (case-sensitive — these are Malay field names with consistent casing)
  const startRe = new RegExp(`(^|\\n|\\s)${label}:\\s*`)
  const m = startRe.exec(fullText)
  if (!m) return null
  const start = m.index + m[0].length
  // Find the earliest stop: another known label OR end-of-line
  let end = fullText.length
  // Newline always stops the field
  const nlIdx = fullText.indexOf('\n', start)
  if (nlIdx !== -1) end = Math.min(end, nlIdx)
  // Any other known label terminates the field too (handles inline same-line fields)
  for (const otherLabel of HEADER_LABELS) {
    if (otherLabel === label) continue
    const stopRe = new RegExp(`\\s+${otherLabel}:`)
    const sm = stopRe.exec(fullText.slice(start, end))
    if (sm) end = Math.min(end, start + sm.index)
  }
  const value = fullText.slice(start, end).trim()
  return value || null
}

function cleanValue(v) {
  if (!v) return null
  const t = v.trim()
  if (!t || t === '-' || t === '—') return null
  return t.replace(/\s+/g, ' ')
}

function parseHeader(lines) {
  const fullText = lines.map((l) => l.text).join('\n')
  const tarikh = extractField(fullText, 'Tarikh')
  const kelas = extractField(fullText, 'Kelas')
  const guru = extractField(fullText, 'Guru')
  const subjek = extractField(fullText, 'Subjek')
  const catatan = extractField(fullText, 'Catatan')
  const dihasilkan = extractField(fullText, 'Dihasilkan pada') || extractField(fullText, 'Dihasilkan')
  // Tarikh strictly ISO YYYY-MM-DD
  const tarikhClean = tarikh && /^\d{4}-\d{2}-\d{2}/.test(tarikh) ? tarikh.match(/^\d{4}-\d{2}-\d{2}/)[0] : tarikh
  return {
    tarikh: tarikhClean,
    kelas: cleanValue(kelas),
    guru: cleanValue(guru),
    subjek: cleanValue(subjek),
    catatan: cleanValue(catatan),
    dihasilkan: cleanValue(dihasilkan),
  }
}

function parseSummary(lines) {
  const fullText = lines.map((l) => l.text).join('\n')
  const num = (re) => {
    const m = fullText.match(re)
    return m ? Number(m[1]) : null
  }
  return {
    jumlahMurid: num(/Jumlah Murid:\s*(\d+)/),
    siapHantar: num(/Siap Hantar:\s*(\d+)/),
    tidakHantar: num(/Tidak Hantar:\s*(\d+)/),
    peratusan: num(/Peratusan:\s*(\d+(?:\.\d+)?)%/),
  }
}

function findStatusInText(text) {
  // STATUS_PATTERNS is ordered longest/most-specific first.
  // For each pattern, ensure it is followed by a word boundary so "Hantar" doesn't
  // greedily match inside "Tidak Hantar" — though our ordering already prevents that.
  for (const { pattern, canonical } of STATUS_PATTERNS) {
    const idx = text.indexOf(pattern)
    if (idx < 0) continue
    // Word boundary check: char after the pattern must not be a letter
    const after = text[idx + pattern.length]
    if (after !== undefined && /[a-zA-Z]/.test(after)) continue
    return { key: pattern, canonical, idx, length: pattern.length }
  }
  return null
}

function parseStudentLine(line, cols) {
  const text = line.text
  const status = findStatusInText(text)
  if (!status) return null
  const before = text.slice(0, status.idx).trim()
  const afterRaw = text.slice(status.idx + status.length).trim()

  const numMatch = before.match(/^(\d+)\s+(.*)$/s)
  if (!numMatch) return null
  const no = Number(numMatch[1])
  let rest = numMatch[2].replace(/\s+/g, ' ').trim()

  let jantina = null
  if (cols.hasJantina) {
    const jm = rest.match(/^(.*)\s+([LP])$/)
    if (jm) {
      rest = jm[1].trim()
      jantina = jm[2]
    }
  }
  const nama = rest.replace(/\s+/g, ' ').trim()

  let alasan = afterRaw
  let evidens = null
  if (cols.hasEvidens) {
    const parts = afterRaw.split(/\s+/)
    if (parts.length >= 2) {
      evidens = parts[parts.length - 1]
      alasan = parts.slice(0, -1).join(' ').trim()
    } else if (parts.length === 1) {
      alasan = parts[0]
      evidens = '-'
    } else {
      evidens = '-'
    }
  }

  return {
    no,
    nama,
    jantina,
    status: status.canonical,
    statusRaw: status.key,
    alasan: alasan && alasan !== '-' && alasan !== '—' ? alasan : null,
    evidens: evidens && evidens !== '-' && evidens !== '—' ? evidens : null,
  }
}

export async function parseSsbPdf(buffer, fileMeta = {}) {
  const lines = await extractLines(buffer)
  const cols = detectColumns(lines)
  if (!cols) {
    throw new Error('Tidak dapat mengenal pasti jadual murid dalam PDF ini')
  }
  const header = parseHeader(lines)
  const summary = parseSummary(lines)

  const students = []
  for (const line of lines) {
    if (line.page < cols.headerPage) continue
    if (line.page === cols.headerPage && line.y <= cols.headerY) continue
    if (/^RUMUSAN:?$/i.test(line.text)) break
    if (/Jumlah Murid:/i.test(line.text)) break
    const row = parseStudentLine(line, cols)
    if (row) students.push(row)
  }

  if (summary.jumlahMurid == null && students.length > 0) summary.jumlahMurid = students.length
  if (summary.siapHantar == null) summary.siapHantar = students.filter((s) => s.status === 'Siap Hantar').length
  if (summary.tidakHantar == null)
    summary.tidakHantar = students.filter((s) => s.status === 'Tidak Hantar').length
  if (summary.peratusan == null && summary.jumlahMurid)
    summary.peratusan = Math.round((summary.siapHantar / summary.jumlahMurid) * 1000) / 10

  return {
    id: fileMeta.id || `${header.kelas || 'unknown'}_${header.tarikh || 'undated'}_${Date.now()}`,
    fileName: fileMeta.name || null,
    source: fileMeta.source || 'upload',
    header,
    summary,
    students,
    raw: { hasJantina: cols.hasJantina, hasEvidens: cols.hasEvidens },
  }
}
