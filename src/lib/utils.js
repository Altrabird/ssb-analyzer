export function cx(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .map((a) => (typeof a === 'object' ? Object.entries(a).filter(([, v]) => v).map(([k]) => k).join(' ') : a))
    .join(' ')
}

export function pct(num, den) {
  if (!den) return 0
  return Math.round((num / den) * 1000) / 10
}

export function fmtDate(d) {
  if (!d) return '—'
  try {
    const dt = typeof d === 'string' ? new Date(d) : d
    return dt.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return String(d)
  }
}

export function fmtDateShort(d) {
  if (!d) return '—'
  try {
    const dt = typeof d === 'string' ? new Date(d) : d
    return dt.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })
  } catch {
    return String(d)
  }
}

export function groupBy(arr, keyFn) {
  const out = new Map()
  for (const item of arr) {
    const k = keyFn(item)
    if (!out.has(k)) out.set(k, [])
    out.get(k).push(item)
  }
  return out
}

export function uniq(arr) {
  return Array.from(new Set(arr))
}

export function sortByKey(arr, keyFn, dir = 'asc') {
  const m = dir === 'asc' ? 1 : -1
  return [...arr].sort((a, b) => {
    const va = keyFn(a)
    const vb = keyFn(b)
    if (va < vb) return -1 * m
    if (va > vb) return 1 * m
    return 0
  })
}

export function classColor(kelas) {
  const palette = [
    '#3b63ff', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
    '#ec4899', '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  ]
  let hash = 0
  for (let i = 0; i < kelas.length; i++) hash = (hash * 31 + kelas.charCodeAt(i)) | 0
  return palette[Math.abs(hash) % palette.length]
}

export function statusColor(status) {
  if (status === 'Siap Hantar') return '#10b981'
  if (status === 'Tidak Hantar') return '#ef4444'
  if (status === 'Belum Semak') return '#94a3b8'
  return '#64748b'
}

export function normalizeName(s) {
  return (s || '')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
