import { Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import {
  Award, Calendar, CheckCircle2, FileText, GraduationCap, Users, XCircle,
} from 'lucide-react'
import KpiCard from '../KpiCard'
import { byClass, byDate, summarize } from '../../lib/aggregate'
import { fmtDate } from '../../lib/utils'

export default function OverviewView({ reports }) {
  const s = summarize(reports)
  const cls = byClass(reports)
  const dates = byDate(reports)
  const lastDate = dates.length ? dates[dates.length - 1].tarikh : null

  const doughnut = {
    labels: ['Siap Hantar', 'Tidak Hantar', 'Belum Semak'],
    datasets: [
      {
        data: [
          s.siap,
          s.tidak,
          Math.max(0, s.jumlah - s.siap - s.tidak),
        ],
        backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
        borderColor: 'transparent',
        borderRadius: 4,
        spacing: 2,
      },
    ],
  }
  const doughnutOpts = {
    cutout: '70%',
    plugins: { legend: { position: 'bottom' } },
    maintainAspectRatio: false,
  }

  const topClass = cls[0]
  const bottomClass = cls[cls.length - 1]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Jumlah laporan" value={s.reports} sub={`${s.classes} kelas`} icon={FileText} accent="brand" />
        <KpiCard label="Murid unik" value={s.students} sub={`${s.jumlah} rekod serahan`} icon={Users} accent="accent" />
        <KpiCard
          label="Kadar pematuhan"
          value={`${s.overallRate}%`}
          sub={`${s.siap} siap · ${s.tidak} tidak hantar`}
          icon={CheckCircle2}
          accent="emerald"
        />
        <KpiCard
          label="Laporan terkini"
          value={fmtDate(lastDate)}
          sub={lastDate ? 'tarikh paling akhir' : '—'}
          icon={Calendar}
          accent="purple"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-pad lg:col-span-2"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Senarai laporan</h2>
            <span className="chip">{reports.length} fail</span>
          </div>
          <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-ink-200/70 dark:border-ink-800/70">
            <table className="min-w-full divide-y divide-ink-200/70 text-sm dark:divide-ink-800/70">
              <thead className="bg-ink-50 dark:bg-ink-900/60">
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  <th className="px-4 py-2.5">Tarikh</th>
                  <th className="px-4 py-2.5">Kelas</th>
                  <th className="px-4 py-2.5">Guru</th>
                  <th className="px-4 py-2.5">Subjek</th>
                  <th className="px-4 py-2.5 text-right">Murid</th>
                  <th className="px-4 py-2.5 text-right">% Hantar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800/70">
                {[...reports]
                  .sort((a, b) => (a.header.tarikh || '').localeCompare(b.header.tarikh || ''))
                  .map((r) => (
                    <tr key={r.id} className="text-ink-700 hover:bg-ink-50/60 dark:text-ink-200 dark:hover:bg-ink-800/40">
                      <td className="px-4 py-2.5 font-medium">{fmtDate(r.header.tarikh)}</td>
                      <td className="px-4 py-2.5">{r.header.kelas || '—'}</td>
                      <td className="px-4 py-2.5">{r.header.guru || '—'}</td>
                      <td className="px-4 py-2.5">{r.header.subjek || '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.summary.jumlahMurid}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={
                            'inline-block min-w-[3rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums ' +
                            (r.summary.peratusan >= 75
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : r.summary.peratusan >= 50
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300')
                          }
                        >
                          {r.summary.peratusan ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-pad"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Taburan status</h2>
          <div className="mt-2 text-xs text-ink-500 dark:text-ink-400">Keseluruhan rekod murid</div>
          <div className="mt-4 h-56">
            <Doughnut data={doughnut} options={doughnutOpts} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row icon={CheckCircle2} color="text-emerald-500" label="Siap Hantar" value={s.siap} />
            <Row icon={XCircle} color="text-rose-500" label="Tidak Hantar" value={s.tidak} />
            <Row icon={Users} color="text-ink-400" label="Belum Semak" value={Math.max(0, s.jumlah - s.siap - s.tidak)} />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HighlightCard
          icon={Award}
          tone="emerald"
          eyebrow="Kelas terbaik"
          title={topClass ? topClass.kelas : '—'}
          value={topClass ? `${topClass.rate}%` : '—'}
          desc={topClass ? `${topClass.siap}/${topClass.jumlah} murid siap hantar` : 'Tiada data'}
        />
        <HighlightCard
          icon={GraduationCap}
          tone="rose"
          eyebrow="Kelas perlu perhatian"
          title={bottomClass ? bottomClass.kelas : '—'}
          value={bottomClass ? `${bottomClass.rate}%` : '—'}
          desc={bottomClass ? `${bottomClass.tidak} tidak hantar daripada ${bottomClass.jumlah}` : 'Tiada data'}
        />
      </div>
    </div>
  )
}

function Row({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
        <Icon className={`h-4 w-4 ${color}`} />
        {label}
      </div>
      <div className="font-semibold tabular-nums text-ink-900 dark:text-white">{value}</div>
    </div>
  )
}

function HighlightCard({ icon: Icon, tone, eyebrow, title, value, desc }) {
  const tones = {
    emerald: 'from-emerald-500 to-teal-600 text-emerald-50',
    rose: 'from-rose-500 to-orange-500 text-rose-50',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 sm:p-6 ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{eyebrow}</span>
        <Icon className="h-5 w-5 opacity-80" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold leading-tight">{title}</div>
      <div className="mt-1 font-display text-4xl font-bold tabular-nums">{value}</div>
      <div className="mt-2 text-sm opacity-90">{desc}</div>
    </motion.div>
  )
}
