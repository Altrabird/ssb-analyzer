import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Download, X } from 'lucide-react'
import { studentRoster } from '../../lib/aggregate'
import { fmtDate, sortByKey } from '../../lib/utils'

export default function StudentsView({ reports, search }) {
  const roster = useMemo(() => studentRoster(reports), [reports])
  const [sort, setSort] = useState({ key: 'rate', dir: 'desc' })
  const [classFilter, setClassFilter] = useState('all')
  const [open, setOpen] = useState(null)

  const allClasses = useMemo(() => Array.from(new Set(roster.flatMap((r) => r.classes))).sort(), [roster])

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase()
    return roster.filter((r) => {
      if (classFilter !== 'all' && !r.classes.includes(classFilter)) return false
      if (q) {
        const hay = (r.nama + ' ' + r.classes.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [roster, search, classFilter])

  const sortedRows = useMemo(() => {
    const dir = sort.dir
    return sortByKey(filtered, (r) => {
      if (sort.key === 'nama') return r.nama
      if (sort.key === 'classes') return r.classes.join(', ')
      if (sort.key === 'siap') return r.totals.siap
      if (sort.key === 'tidak') return r.totals.tidak
      if (sort.key === 'total') return r.totals.total
      if (sort.key === 'rate') return r.rate
      return 0
    }, dir)
  }, [filtered, sort])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
  }

  function exportCsv() {
    const header = 'Nama,Kelas,Jumlah,Siap,Tidak,Belum,Peratusan\n'
    const body = sortedRows
      .map((r) =>
        [`"${r.nama}"`, `"${r.classes.join('; ')}"`, r.totals.total, r.totals.siap, r.totals.tidak, r.totals.belum, r.rate].join(','),
      )
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ssb-students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Jejak Murid</h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {filtered.length} daripada {roster.length} murid · klik baris untuk lihat sejarah
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input w-44"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">Semua kelas</option>
              {allClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="btn-outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border border-ink-200/70 dark:border-ink-800/70">
          <table className="min-w-full divide-y divide-ink-200/70 text-sm dark:divide-ink-800/70">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                <Th k="nama" sort={sort} on={toggleSort} className="min-w-[14rem]">Nama</Th>
                <Th k="classes" sort={sort} on={toggleSort}>Kelas</Th>
                <Th k="total" sort={sort} on={toggleSort} align="right">Rekod</Th>
                <Th k="siap" sort={sort} on={toggleSort} align="right">Siap</Th>
                <Th k="tidak" sort={sort} on={toggleSort} align="right">Tidak</Th>
                <Th k="rate" sort={sort} on={toggleSort} align="right">% Hantar</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800/70">
              {sortedRows.map((r) => (
                <Fragment key={r.key}>
                  <tr
                    className="cursor-pointer text-ink-700 hover:bg-ink-50/60 dark:text-ink-200 dark:hover:bg-ink-800/40"
                    onClick={() => setOpen(open === r.key ? null : r.key)}
                  >
                    <td className="px-4 py-2.5 font-medium">{r.nama}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {r.classes.map((c) => (
                          <span key={c} className="chip text-[10px]">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.totals.total}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{r.totals.siap}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">{r.totals.tidak}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.rate}%`,
                              background:
                                r.rate >= 75 ? '#10b981' : r.rate >= 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="font-semibold tabular-nums">{r.rate}%</span>
                      </div>
                    </td>
                  </tr>
                  {open === r.key && (
                    <tr className="bg-ink-50/60 dark:bg-ink-900/40">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                            Sejarah serahan
                          </div>
                          <button
                            className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpen(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {sortByKey(r.records, (rec) => rec.tarikh || '', 'desc').map((rec, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-ink-200/70 bg-white p-3 text-xs dark:border-ink-800/70 dark:bg-ink-900"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{fmtDate(rec.tarikh)}</span>
                                <span
                                  className={
                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
                                    (rec.status === 'Siap Hantar'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                      : rec.status === 'Tidak Hantar'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                      : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300')
                                  }
                                >
                                  {rec.status}
                                </span>
                              </div>
                              <div className="mt-1 text-ink-500 dark:text-ink-400">
                                {rec.kelas} {rec.subjek ? `· ${rec.subjek}` : ''}
                              </div>
                              {rec.alasan && (
                                <div className="mt-1 italic text-ink-600 dark:text-ink-300">"{rec.alasan}"</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ k, sort, on, align = 'left', children, className = '' }) {
  const active = sort.key === k
  return (
    <th className={`px-4 py-2.5 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      <button onClick={() => on(k)} className="inline-flex items-center gap-1 hover:text-ink-700 dark:hover:text-white">
        {children}
        {active && (sort.dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </button>
    </th>
  )
}
