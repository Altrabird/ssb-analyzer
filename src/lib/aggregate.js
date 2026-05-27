import { groupBy, normalizeName, pct, sortByKey, uniq } from './utils'

export function summarize(reports) {
  const totals = reports.reduce(
    (acc, r) => {
      acc.jumlah += r.summary.jumlahMurid || 0
      acc.siap += r.summary.siapHantar || 0
      acc.tidak += r.summary.tidakHantar || 0
      return acc
    },
    { jumlah: 0, siap: 0, tidak: 0 },
  )
  return {
    reports: reports.length,
    classes: uniq(reports.map((r) => r.header.kelas).filter(Boolean)).length,
    students: uniq(reports.flatMap((r) => r.students.map((s) => normalizeName(s.nama)))).length,
    overallRate: pct(totals.siap, totals.jumlah),
    ...totals,
  }
}

export function byClass(reports) {
  const grouped = groupBy(reports, (r) => r.header.kelas || 'Tanpa Kelas')
  const out = []
  for (const [kelas, list] of grouped) {
    const totals = list.reduce(
      (a, r) => {
        a.jumlah += r.summary.jumlahMurid || 0
        a.siap += r.summary.siapHantar || 0
        a.tidak += r.summary.tidakHantar || 0
        return a
      },
      { jumlah: 0, siap: 0, tidak: 0 },
    )
    out.push({
      kelas,
      reports: list.length,
      jumlah: totals.jumlah,
      siap: totals.siap,
      tidak: totals.tidak,
      rate: pct(totals.siap, totals.jumlah),
    })
  }
  return sortByKey(out, (x) => x.rate, 'desc')
}

export function byDate(reports) {
  const grouped = groupBy(reports, (r) => r.header.tarikh || 'undated')
  const out = []
  for (const [tarikh, list] of grouped) {
    const totals = list.reduce(
      (a, r) => {
        a.jumlah += r.summary.jumlahMurid || 0
        a.siap += r.summary.siapHantar || 0
        return a
      },
      { jumlah: 0, siap: 0 },
    )
    out.push({
      tarikh,
      reports: list.length,
      jumlah: totals.jumlah,
      siap: totals.siap,
      rate: pct(totals.siap, totals.jumlah),
    })
  }
  return sortByKey(out, (x) => x.tarikh, 'asc')
}

export function byDateAndClass(reports) {
  const dates = uniq(reports.map((r) => r.header.tarikh).filter(Boolean)).sort()
  const classes = uniq(reports.map((r) => r.header.kelas).filter(Boolean))
  const matrix = {}
  for (const k of classes) matrix[k] = {}
  for (const r of reports) {
    if (!r.header.kelas || !r.header.tarikh) continue
    matrix[r.header.kelas][r.header.tarikh] = r.summary.peratusan
  }
  return { dates, classes, matrix }
}

export function studentRoster(reports) {
  const map = new Map()
  for (const r of reports) {
    for (const s of r.students) {
      const key = normalizeName(s.nama)
      if (!map.has(key)) {
        map.set(key, {
          key,
          nama: s.nama,
          jantina: s.jantina,
          classes: new Set(),
          totals: { siap: 0, tidak: 0, belum: 0, total: 0 },
          records: [],
          reasons: {},
        })
      }
      const entry = map.get(key)
      if (r.header.kelas) entry.classes.add(r.header.kelas)
      entry.totals.total += 1
      if (s.status === 'Siap Hantar') entry.totals.siap += 1
      else if (s.status === 'Tidak Hantar') entry.totals.tidak += 1
      else entry.totals.belum += 1
      if (s.alasan) {
        entry.reasons[s.alasan] = (entry.reasons[s.alasan] || 0) + 1
      }
      entry.records.push({
        tarikh: r.header.tarikh,
        kelas: r.header.kelas,
        subjek: r.header.subjek,
        guru: r.header.guru,
        catatan: r.header.catatan,
        status: s.status,
        alasan: s.alasan,
        evidens: s.evidens,
      })
    }
  }
  const out = []
  for (const v of map.values()) {
    out.push({
      ...v,
      classes: Array.from(v.classes),
      rate: pct(v.totals.siap, v.totals.total),
    })
  }
  return out
}

export function bySubjek(reports) {
  const grouped = groupBy(reports, (r) => r.header.subjek || 'Tanpa Subjek')
  const out = []
  for (const [subjek, list] of grouped) {
    const totals = list.reduce(
      (a, r) => {
        a.jumlah += r.summary.jumlahMurid || 0
        a.siap += r.summary.siapHantar || 0
        a.tidak += r.summary.tidakHantar || 0
        return a
      },
      { jumlah: 0, siap: 0, tidak: 0 },
    )
    const kelasSet = new Set(list.map((r) => r.header.kelas).filter(Boolean))
    out.push({
      subjek,
      reports: list.length,
      kelas: Array.from(kelasSet),
      jumlah: totals.jumlah,
      siap: totals.siap,
      tidak: totals.tidak,
      rate: pct(totals.siap, totals.jumlah),
    })
  }
  return sortByKey(out, (x) => x.rate, 'desc')
}

export function bySubjekAndClass(reports) {
  const subjeks = uniq(reports.map((r) => r.header.subjek || 'Tanpa Subjek'))
  const classes = uniq(reports.map((r) => r.header.kelas).filter(Boolean))
  const matrix = {}
  for (const s of subjeks) matrix[s] = {}
  for (const r of reports) {
    const s = r.header.subjek || 'Tanpa Subjek'
    const k = r.header.kelas
    if (!k) continue
    if (matrix[s][k] == null) matrix[s][k] = { jumlah: 0, siap: 0, count: 0 }
    matrix[s][k].jumlah += r.summary.jumlahMurid || 0
    matrix[s][k].siap += r.summary.siapHantar || 0
    matrix[s][k].count += 1
  }
  // Compute rate per cell
  for (const s of subjeks) {
    for (const k of classes) {
      const cell = matrix[s][k]
      if (cell) cell.rate = pct(cell.siap, cell.jumlah)
    }
  }
  return { subjeks, classes, matrix }
}

export function reasonsBreakdown(reports) {
  const counts = {}
  let total = 0
  for (const r of reports) {
    for (const s of r.students) {
      if (s.alasan) {
        counts[s.alasan] = (counts[s.alasan] || 0) + 1
        total += 1
      }
    }
  }
  const items = Object.entries(counts).map(([alasan, count]) => ({
    alasan,
    count,
    share: pct(count, total),
  }))
  return sortByKey(items, (x) => x.count, 'desc')
}
