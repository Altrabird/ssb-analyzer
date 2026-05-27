import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { byDate, byDateAndClass } from '../../lib/aggregate'
import { classColor, fmtDateShort } from '../../lib/utils'

export default function TrendView({ reports }) {
  const matrix = byDateAndClass(reports)
  const overall = byDate(reports)
  const [mode, setMode] = useState('classes')

  const datasetsClasses = matrix.classes.map((k) => ({
    label: k,
    data: matrix.dates.map((d) => matrix.matrix[k][d] ?? null),
    borderColor: classColor(k),
    backgroundColor: classColor(k) + '22',
    tension: 0.35,
    spanGaps: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2.5,
    fill: false,
  }))
  const datasetOverall = [
    {
      label: 'Pematuhan keseluruhan',
      data: overall.map((d) => d.rate),
      borderColor: '#3b63ff',
      backgroundColor: 'rgba(59,99,255,0.18)',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
      fill: true,
    },
  ]

  const chart = {
    labels: (mode === 'overall' ? overall.map((d) => d.tarikh) : matrix.dates).map(fmtDateShort),
    datasets: mode === 'overall' ? datasetOverall : datasetsClasses,
  }
  const options = {
    plugins: {
      legend: { display: mode !== 'overall', position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y ?? '—'}%`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: 'rgba(148,163,184,0.15)' },
      },
    },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
  }

  const trendDelta = overall.length >= 2 ? overall[overall.length - 1].rate - overall[0].rate : 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              Tren ikut Tarikh
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {overall.length} titik tarikh ·{' '}
              <span className={trendDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {trendDelta >= 0 ? '+' : ''}{trendDelta.toFixed(1)}% sejak laporan pertama
              </span>
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-ink-100 p-1 text-xs font-semibold dark:bg-ink-800">
            <button
              onClick={() => setMode('classes')}
              className={
                'rounded-lg px-3 py-1 transition ' +
                (mode === 'classes'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300'
                  : 'text-ink-600 dark:text-ink-300')
              }
            >
              Setiap kelas
            </button>
            <button
              onClick={() => setMode('overall')}
              className={
                'rounded-lg px-3 py-1 transition ' +
                (mode === 'overall'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300'
                  : 'text-ink-600 dark:text-ink-300')
              }
            >
              Keseluruhan
            </button>
          </div>
        </div>
        <div className="mt-4 h-[360px]">
          <Line data={chart} options={options} />
        </div>
      </div>

      <div className="card-pad">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">Heatmap pematuhan</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400">Setiap sel = peratusan siap hantar bagi kelas pada tarikh berkenaan</p>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white px-3 py-2 text-left text-[11px] uppercase tracking-wider text-ink-500 dark:bg-ink-900 dark:text-ink-400">
                  Kelas
                </th>
                {matrix.dates.map((d) => (
                  <th key={d} className="px-3 py-2 text-center text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    {fmtDateShort(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.classes.map((k) => (
                <tr key={k}>
                  <td className="sticky left-0 bg-white px-3 py-1.5 text-sm font-semibold text-ink-800 dark:bg-ink-900 dark:text-ink-100">
                    {k}
                  </td>
                  {matrix.dates.map((d) => {
                    const v = matrix.matrix[k][d]
                    const bg = v == null
                      ? 'bg-ink-100 dark:bg-ink-800/60 text-ink-400'
                      : v >= 75
                      ? 'bg-emerald-500/90 text-white'
                      : v >= 50
                      ? 'bg-amber-400/90 text-amber-950'
                      : 'bg-rose-500/90 text-white'
                    return (
                      <td key={d} className="px-1 py-1">
                        <div className={`h-9 w-16 rounded-lg ${bg} flex items-center justify-center text-xs font-semibold tabular-nums`}>
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
    </div>
  )
}
