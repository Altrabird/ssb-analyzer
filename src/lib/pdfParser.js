import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

const STATUSES = ['Belum Semak', 'Siap Hantar', 'Tidak Hantar', 'Hantar Lewat']

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

function parseHeader(lines) {
  const fullText = lines.map((l) => l.text).join('\n')
  const get = (re) => {
    const m = fullText.match(re)
    return m ? m[1].trim() : null
  }
  const tarikh = get(/Tarikh:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/)
  const kelas = get(/Kelas:\s*([^\n|]+?)(?=\s*(?:Guru:|Dihasilkan|\||$))/)
  const guruRaw = get(/Guru:\s*([^\n]+?)(?=\s+Subjek:|$)/)
  const subjekRaw = get(/Subjek:\s*([^\n]+?)(?=\s+Dihasilkan|$)/)
  const catatanRaw = get(/Catatan:\s*([^\n]+?)(?=\s+Dihasilkan|$)/)
  const dihasilkan = get(/Dihasilkan pada:\s*([0-9/]+,\s*[0-9:]+)/)
  return {
    tarikh,
    kelas: kelas ? kelas.replace(/\s+/g, ' ').trim() : null,
    guru: guruRaw && guruRaw.trim() !== '-' ? guruRaw.trim() : null,
    subjek: subjekRaw && subjekRaw.trim() !== '-' ? subjekRaw.trim() : null,
    catatan: catatanRaw && catatanRaw.trim() !== '-' ? catatanRaw.trim() : null,
    dihasilkan,
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
  for (const s of STATUSES) {
    const idx = text.indexOf(s)
    if (idx >= 0) return { key: s, idx }
  }
  return null
}

function parseStudentLine(line, cols) {
  const text = line.text
  const status = findStatusInText(text)
  if (!status) return null
  const before = text.slice(0, status.idx).trim()
  const afterRaw = text.slice(status.idx + status.key.length).trim()

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
    status: status.key,
    alasan: alasan && alasan !== '-' ? alasan : null,
    evidens: evidens && evidens !== '-' ? evidens : null,
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
