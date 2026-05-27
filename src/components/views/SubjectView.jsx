import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BookOpen, Download } from 'lucide-react'
import { bySubjek, bySubjekAndClass } from '../../lib/aggregate'
import { deltaFooter, makeBarGradient, thresholdAnnotations } from '../../lib/chartConfig'

const PALETTE = ['#3b63ff', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#ef4444', '#14b8a6', '#6366f1', '#f97316']

function subjectColor(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export default function SubjectView({ reports }) {
  const data = useMemo(() => bySubjek(reports), [reports])
  const matrix = useMemo(() => bySubjekAndClass(reports), [reports])
  const [sortBy, setSortBy] = useState('rate')

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'rate') return b.rate - a.rate
      if (sortBy === 'reports') return b.reports - a.reports
      return a.subjek.localeCompare(b.subjek)
    })
  }, [data, sortBy])

  const avg = useMemo(() => {
    if (!sorted.length) return 0
    return sorted.reduce((a, b) => a + b.rate, 0) / sorted.length
  }, [sorted])

  if (!reports.length || data.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 text-brand-600 dark:from-brand-950/60 dark:to-accent-950/60 dark:text-brand-300">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
            Tiada data subjek
          </h3>
          <p className="mt-1 max-w-md text-sm text-ink-500 dark:text-ink-400">
            Pastikan setiap laporan SSB diisi dengan medan "Subjek" supaya analisis ini dapat dijana.
          </p>
        </div>
      </div>
    )
  }

  const chart = {
    labels: sorted.map((d) => d.subjek),
    datasets: [
      {
        label: 'Pematuhan',
        data: sorted.map((d) => d.rate),
        backgroundColor: (ctx) =>
          makeBarGradient(ctx, subjectColor(ctx.chart.data.labels[ctx.dataIndex] || ''), 'horizontal'),
        hoverBackgroundColor: (ctx) => subjectColor(ctx.chart.data.labels[ctx.dataIndex] || ''),
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 56,
      },
    ],
  }
  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => sorted[items[0].dataIndex].subjek,
          label: (ctx) => {
            const row = sorted[ctx.dataIndex]
            return [
              `${row.rate}% siap hantar`,
              `${row.siap}/${row.jumlah} rekod murid`,
              `${row.reports} laporan · ${row.kelas.length} kelas`,
            ]
          },
          footer: deltaFooter(avg),
        },
      },
      annotation: { annotations: thresholdAnnotations({ axis: 'x' }) },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        offset: 6,
        clamp: true,
        clip: false,
        formatter: (v) => `${v}%`,
        color: (ctx) => {
          const v = ctx.dataset.data[ctx.dataIndex]
          if (v >= 75) return '#059669'
          if (v >= 50) return '#d97706'
          return '#dc2626'
        },
        font: { weight: '700', size: 11 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, padding: 4 },
        grid: { color: 'rgba(148,163,184,0.15)', drawBorder: false },
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { weight: 600 }, padding: 6 },
      },
    },
    maintainAspectRatio: false,
    layout: { padding: { right: 48 } },
    animation: { duration: 700, easing: 'easeOutCubic' },
  }

  function exportCsv() {
    const header = 'Subjek,Laporan,Kelas,Murid,Siap,Tidak,Peratusan\n'
    const body = sorted
      .map((d) =>
        [`"${d.subjek}"`, d.reports, `"${d.kelas.join('; ')}"`, d.jumlah, d.siap, d.tidak, d.rate].join(','),
      )
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ssb-by-subject.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              Pematuhan mengikut Subjek
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {sorted.length} subjek · purata pematuhan{' '}
              <span className="font-semibold text-ink-700 dark:text-ink-200">{avg.toFixed(1)}%</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-ink-100 p-1 text-xs font-semibold dark:bg-ink-800">
              {[
                ['rate', '% Hantar'],
                ['reports', 'Bil. Laporan'],
                ['name', 'Nama'],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setSortBy(k)}
                  className={
                    'cursor-pointer rounded-lg px-3 py-1 transition-colors duration-200 ' +
                    (sortBy === k
                      ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300'
                      : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white')
                  }
                >
                  {l}
                </button>
              ))}
            </div>
            <button className="btn-outline cursor-pointer" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
        <div className="mt-4" style={{ height: Math.max(280, sorted.length * 52 + 60) }}>
          <Bar data={chart} options={options} />
        </div>
      </div>

      <div className="card-pad">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">
          Heatmap Subjek × Kelas
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Pematuhan setiap kombinasi subjek dan kelas — boleh kenal pasti masalah spesifik
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-500 dark:text-ink-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded bg-emerald-500" /> ≥ 75%</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded bg-amber-400" /> 50–74%</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded bg-rose-500" /> &lt; 50%</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded bg-ink-200 dark:bg-ink-700" /> tiada data</span>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white px-3 py-2 text-left text-[11px] uppercase tracking-wider text-ink-500 dark:bg-ink-900 dark:text-ink-400">
                  Subjek
                </th>
                {matrix.classes.map((k) => (
                  <th key={k} className="px-3 py-2 text-center text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.subjeks.map((s) => (
                <tr key={s}>
                  <td className="sticky left-0 bg-white px-3 py-1.5 text-sm font-semibold text-ink-800 dark:bg-ink-900 dark:text-ink-100">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: subjectColor(s) }} />
                    {s}
                  </td>
                  {matrix.classes.map((k) => {
                    const cell = matrix.matrix[s][k]
                    const v = cell?.rate
                    const tone = v == null
                      ? 'bg-ink-100 text-ink-400 dark:bg-ink-800/60'
                      : v >= 75
                      ? 'bg-emerald-500/90 text-white'
                      : v >= 50
                      ? 'bg-amber-400/90 text-amber-950'
                      : 'bg-rose-500/90 text-white'
                    return (
                      <td key={k} className="px-1 py-1">
                        <div
                          className={`flex h-9 w-16 cursor-help items-center justify-center rounded-lg text-xs font-semibold tabular-nums shadow-sm transition-transform duration-200 hover:scale-110 ${tone}`}
                          title={v == null
                            ? `${s} × ${k}: tiada data`
                            : `${s} × ${k}: ${v}% (${cell.siap}/${cell.jumlah} murid, ${cell.count} laporan)`}
                        >
                          {v == null ? '—' : `${v}%`}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-pad">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">Pecahan terperinci</h3>
        <div className="mt-3 overflow-auto rounded-xl border border-ink-200/70 dark:border-ink-800/70">
          <table className="min-w-full divide-y divide-ink-200/70 text-sm dark:divide-ink-800/70">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                <th className="px-4 py-2.5">Subjek</th>
                <th className="px-4 py-2.5">Kelas</th>
                <th className="px-4 py-2.5 text-right">Laporan</th>
                <th className="px-4 py-2.5 text-right">Murid</th>
                <th className="px-4 py-2.5 text-right">Siap</th>
                <th className="px-4 py-2.5 text-right">Tidak</th>
                <th className="px-4 py-2.5 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800/70">
              {sorted.map((d) => (
                <tr key={d.subjek} className="text-ink-700 transition-colors duration-200 hover:bg-ink-50/60 dark:text-ink-200 dark:hover:bg-ink-800/40">
                  <td className="px-4 py-2.5 font-semibold">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: subjectColor(d.subjek) }} />
                    {d.subjek}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {d.kelas.slice(0, 5).map((k) => (
                        <span key={k} className="chip text-[10px]">{k}</span>
                      ))}
                      {d.kelas.length > 5 && (
                        <span className="chip text-[10px]">+{d.kelas.length - 5}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.reports}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.jumlah}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{d.siap}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">{d.tidak}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{d.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
