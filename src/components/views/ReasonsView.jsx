import { useMemo, useState } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { ChevronRight, Crown, Filter, Frown } from 'lucide-react'
import { reasonsBreakdown, studentRoster } from '../../lib/aggregate'
import { sortByKey } from '../../lib/utils'

const PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#3b63ff', '#8b5cf6', '#ec4899']

export default function ReasonsView({ reports }) {
  const reasons = reasonsBreakdown(reports)
  const roster = studentRoster(reports)

  // Sample-size bias fix: leaderboard requires reasonable number of records.
  // Default threshold = max(3, ceil(maxRecords * 0.5)) — so a student who only
  // appeared in 6/15 reports doesn't outrank one who appeared in 14/15.
  const maxRecords = useMemo(
    () => roster.reduce((m, r) => Math.max(m, r.totals.total), 0),
    [roster],
  )
  const defaultMin = Math.max(3, Math.ceil(maxRecords * 0.5))
  const [minRecords, setMinRecords] = useState(defaultMin)

  const eligible = useMemo(
    () => roster.filter((r) => r.totals.total >= minRecords),
    [roster, minRecords],
  )
  const top = useMemo(() => sortByKey(eligible, (r) => r.rate, 'desc').slice(0, 10), [eligible])
  const bottom = useMemo(() => sortByKey(eligible, (r) => r.rate, 'asc').slice(0, 10), [eligible])

  const totalReasons = reasons.reduce((a, b) => a + b.count, 0)
  const donut = {
    labels: reasons.map((r) => r.alasan),
    datasets: [
      {
        data: reasons.map((r) => r.count),
        backgroundColor: PALETTE.slice(0, reasons.length || 1),
        hoverBackgroundColor: PALETTE.slice(0, reasons.length || 1).map((c) => c),
        borderColor: 'transparent',
        spacing: 3,
        borderRadius: 6,
        hoverOffset: 8,
      },
    ],
  }
  const donutOpts = {
    cutout: '64%',
    plugins: {
      legend: { position: 'right', labels: { padding: 12, font: { size: 11 }, boxWidth: 10 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = totalReasons ? ((ctx.parsed / totalReasons) * 100).toFixed(1) : 0
            return [` ${ctx.label}`, ` ${ctx.parsed} kes (${pct}%)`]
          },
        },
      },
    },
    maintainAspectRatio: false,
    animation: { animateRotate: true, animateScale: true, duration: 800 },
  }

  const barReasons = {
    labels: reasons.map((r) => r.alasan),
    datasets: [
      {
        label: 'Bilangan kes',
        data: reasons.map((r) => r.count),
        backgroundColor: reasons.map((_, i) => PALETTE[i % PALETTE.length]),
        hoverBackgroundColor: reasons.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 32,
      },
    ],
  }
  const barOpts = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => reasons[items[0].dataIndex].alasan,
          label: (ctx) => {
            const r = reasons[ctx.dataIndex]
            return [` ${r.count} kes`, ` ${r.share}% daripada jumlah alasan`]
          },
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        offset: 4,
        formatter: (v) => v,
        color: '#475569',
        font: { weight: '700', size: 11 },
      },
    },
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)', drawBorder: false }, ticks: { precision: 0 } },
      y: { grid: { display: false, drawBorder: false } },
    },
    layout: { padding: { right: 24 } },
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutCubic' },
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-pad">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Sebab Tidak Hantar</h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            {reasons.reduce((a, b) => a + b.count, 0)} jumlah kes direkodkan
          </p>
          {reasons.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
              Tiada alasan direkodkan dalam laporan.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="h-64">
                <Doughnut data={donut} options={donutOpts} />
              </div>
              <div className="h-64">
                <Bar data={barReasons} options={barOpts} />
              </div>
            </div>
          )}
        </div>

        <div className="card-pad">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Senarai alasan</h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">Disusun mengikut kekerapan</p>
          <div className="mt-4 space-y-2">
            {reasons.length === 0 && (
              <div className="text-sm text-ink-500 dark:text-ink-400">Belum ada data.</div>
            )}
            {reasons.map((r, i) => (
              <div key={r.alasan} className="flex items-center gap-3">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: PALETTE[i % PALETTE.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink-800 dark:text-ink-100">{r.alasan}</span>
                    <span className="tabular-nums text-ink-600 dark:text-ink-300">{r.count} kes · {r.share}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div className="h-full rounded-full" style={{ width: `${r.share}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink-900 dark:text-white">
                Ambang minimum rekod
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Hanya kira murid dengan ≥ {minRecords} rekod (maksimum {maxRecords})
                · {eligible.length} dari {roster.length} murid layak
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-72">
            <input
              type="range"
              min={1}
              max={Math.max(1, maxRecords)}
              value={minRecords}
              onChange={(e) => setMinRecords(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-500 dark:bg-ink-800"
              aria-label="Ambang minimum rekod"
            />
            <span className="min-w-[3rem] rounded-full bg-brand-100 px-3 py-0.5 text-center text-sm font-bold tabular-nums text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
              {minRecords}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderTable
          icon={Crown}
          title="Top 10 Murid Terbaik"
          accent="emerald"
          rows={top}
          emptyText={`Tiada murid memenuhi ambang ≥ ${minRecords} rekod. Turunkan ambang.`}
        />
        <LeaderTable
          icon={Frown}
          title="10 Murid Perlu Perhatian"
          accent="rose"
          rows={bottom}
          emptyText={`Tiada murid memenuhi ambang ≥ ${minRecords} rekod. Turunkan ambang.`}
        />
      </div>
    </div>
  )
}

function LeaderTable({ icon: Icon, title, accent, rows, emptyText }) {
  const tone = {
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-orange-500',
  }
  const bar = accent === 'emerald' ? '#10b981' : '#ef4444'
  return (
    <div className="card overflow-hidden">
      <div className={`flex items-center gap-3 bg-gradient-to-r p-5 text-white ${tone[accent]}`}>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          <p className="text-xs opacity-80">{rows.length} murid disenaraikan</p>
        </div>
      </div>
      <div className="divide-y divide-ink-100 dark:divide-ink-800/70">
        {rows.length === 0 && (
          <div className="p-6 text-center text-sm text-ink-500 dark:text-ink-400">{emptyText}</div>
        )}
        {rows.map((r, i) => (
          <div key={r.key} className="flex items-center gap-4 px-5 py-3">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-bold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink-900 dark:text-white">{r.nama}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                {r.classes.join(', ')} · {r.totals.siap}/{r.totals.total} siap
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div className="h-full rounded-full" style={{ width: `${r.rate}%`, background: bar }} />
              </div>
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-ink-900 dark:text-white">
                {r.rate}%
              </span>
              <ChevronRight className="hidden h-4 w-4 text-ink-300 sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
