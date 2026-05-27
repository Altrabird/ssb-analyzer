import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { byDate, byDateAndClass } from '../../lib/aggregate'
import { classColor, fmtDateShort } from '../../lib/utils'
import { deltaFooter, makeAreaGradient, thresholdAnnotations } from '../../lib/chartConfig'

export default function TrendView({ reports }) {
  const matrix = byDateAndClass(reports)
  const overall = byDate(reports)
  const [mode, setMode] = useState('classes')

  const avg = useMemo(() => {
    if (!overall.length) return 0
    return overall.reduce((a, b) => a + b.rate, 0) / overall.length
  }, [overall])

  const datasetsClasses = matrix.classes.map((k, i) => {
    const color = classColor(k)
    return {
      label: k,
      data: matrix.dates.map((d) => matrix.matrix[k][d] ?? null),
      borderColor: color,
      backgroundColor: (ctx) => makeAreaGradient(ctx, color),
      tension: 0.4,
      spanGaps: true,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
      borderDash: i > 4 ? [6, 4] : undefined, // dash for 6th+ series — colourblind aid
      fill: false,
    }
  })
  const datasetOverall = [
    {
      label: 'Pematuhan keseluruhan',
      data: overall.map((d) => d.rate),
      borderColor: '#3b63ff',
      backgroundColor: (ctx) => makeAreaGradient(ctx, '#3b63ff'),
      tension: 0.45,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#3b63ff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
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
      legend: {
        display: mode !== 'overall',
        position: 'bottom',
        labels: { padding: 14, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Tarikh: ${items[0].label}`,
          label: (ctx) => {
            if (ctx.parsed.y == null) return ` ${ctx.dataset.label}: tiada data`
            return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
          },
          footer: mode === 'overall' ? deltaFooter(avg) : undefined,
        },
      },
      annotation: { annotations: thresholdAnnotations({ axis: 'y' }) },
    },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { padding: 6 } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, padding: 6 },
        grid: { color: 'rgba(148,163,184,0.15)', drawBorder: false },
      },
    },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 700, easing: 'easeOutCubic' },
  }

  const trendDelta = overall.length >= 2 ? overall[overall.length - 1].rate - overall[0].rate : 0

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              Tren mengikut Tarikh
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {overall.length} titik tarikh ·{' '}
              <span className={trendDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {trendDelta >= 0 ? '+' : ''}{trendDelta.toFixed(1)}% sejak laporan pertama
              </span>{' '}
              · purata {avg.toFixed(1)}%
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-ink-100 p-1 text-xs font-semibold dark:bg-ink-800">
            <button
              onClick={() => setMode('classes')}
              className={
                'cursor-pointer rounded-lg px-3 py-1 transition-colors duration-200 ' +
                (mode === 'classes'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300'
                  : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white')
              }
            >
              Setiap kelas
            </button>
            <button
              onClick={() => setMode('overall')}
              className={
                'cursor-pointer rounded-lg px-3 py-1 transition-colors duration-200 ' +
                (mode === 'overall'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-900 dark:text-brand-300'
                  : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white')
              }
            >
              Keseluruhan
            </button>
          </div>
        </div>
        <div className="mt-4 h-[380px]">
          <Line data={chart} options={options} />
        </div>
      </div>

      <div className="card-pad">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">Heatmap pematuhan</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Setiap sel = peratusan siap hantar bagi kelas pada tarikh berkenaan
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
                    const tone = v == null
                      ? 'bg-ink-100 text-ink-400 dark:bg-ink-800/60'
                      : v >= 75
                      ? 'bg-emerald-500/90 text-white'
                      : v >= 50
                      ? 'bg-amber-400/90 text-amber-950'
                      : 'bg-rose-500/90 text-white'
                    return (
                      <td key={d} className="px-1 py-1">
                        <div
                          className={`flex h-9 w-16 cursor-help items-center justify-center rounded-lg text-xs font-semibold tabular-nums shadow-sm transition-transform duration-200 hover:scale-110 ${tone}`}
                          title={v == null ? `${k} pada ${fmtDateShort(d)}: tiada data` : `${k} pada ${fmtDateShort(d)}: ${v}% siap hantar`}
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
    </div>
  )
}
