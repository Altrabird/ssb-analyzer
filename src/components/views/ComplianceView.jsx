import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Download } from 'lucide-react'
import { byClass } from '../../lib/aggregate'
import { classColor } from '../../lib/utils'
import { deltaFooter, makeBarGradient, thresholdAnnotations } from '../../lib/chartConfig'

export default function ComplianceView({ reports }) {
  const [sortBy, setSortBy] = useState('rate')
  const data = byClass(reports)
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'rate') return b.rate - a.rate
      if (sortBy === 'students') return b.jumlah - a.jumlah
      return a.kelas.localeCompare(b.kelas)
    })
  }, [data, sortBy])

  const avg = useMemo(() => {
    if (!sorted.length) return 0
    return sorted.reduce((a, b) => a + b.rate, 0) / sorted.length
  }, [sorted])

  const chart = {
    labels: sorted.map((d) => d.kelas),
    datasets: [
      {
        label: 'Peratusan Siap Hantar',
        data: sorted.map((d) => d.rate),
        backgroundColor: (ctx) => makeBarGradient(ctx, classColor(ctx.chart.data.labels[ctx.dataIndex] || ''), 'horizontal'),
        hoverBackgroundColor: (ctx) => classColor(ctx.chart.data.labels[ctx.dataIndex] || ''),
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
          title: (items) => sorted[items[0].dataIndex].kelas,
          label: (ctx) => {
            const row = sorted[ctx.dataIndex]
            return [
              `${row.rate}% siap hantar`,
              `${row.siap} murid hantar, ${row.tidak} tidak hantar`,
              `${row.reports} laporan · ${row.jumlah} rekod`,
            ]
          },
          labelTextColor: () => '#e2e8f0',
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
    interaction: { mode: 'nearest', intersect: true },
  }

  function exportCsv() {
    const header = 'Kelas,Laporan,Murid,Siap Hantar,Tidak Hantar,Peratusan\n'
    const body = sorted
      .map((d) => `"${d.kelas}",${d.reports},${d.jumlah},${d.siap},${d.tidak},${d.rate}`)
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ssb-compliance-by-class.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              Pematuhan mengikut Kelas
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Purata pematuhan keseluruhan:{' '}
              <span className="font-semibold text-ink-700 dark:text-ink-200">{avg.toFixed(1)}%</span>{' '}
              · garis putus-putus = sasaran 75% & amaran 50%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-ink-100 p-1 text-xs font-semibold dark:bg-ink-800">
              {[
                ['rate', '% Hantar'],
                ['students', 'Bil. Murid'],
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
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">Pecahan terperinci</h3>
        <div className="mt-3 overflow-auto rounded-xl border border-ink-200/70 dark:border-ink-800/70">
          <table className="min-w-full divide-y divide-ink-200/70 text-sm dark:divide-ink-800/70">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                <th className="px-4 py-2.5">Kelas</th>
                <th className="px-4 py-2.5 text-right">Laporan</th>
                <th className="px-4 py-2.5 text-right">Murid</th>
                <th className="px-4 py-2.5 text-right">Siap</th>
                <th className="px-4 py-2.5 text-right">Tidak</th>
                <th className="px-4 py-2.5">Visual</th>
                <th className="px-4 py-2.5 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800/70">
              {sorted.map((d) => (
                <tr
                  key={d.kelas}
                  className="text-ink-700 transition-colors duration-200 hover:bg-ink-50/60 dark:text-ink-200 dark:hover:bg-ink-800/40"
                >
                  <td className="px-4 py-2.5 font-semibold">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: classColor(d.kelas) }} />
                    {d.kelas}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.reports}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{d.jumlah}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{d.siap}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">{d.tidak}</td>
                  <td className="px-4 py-2.5">
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${d.rate}%`, background: classColor(d.kelas) }}
                      />
                    </div>
                  </td>
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
