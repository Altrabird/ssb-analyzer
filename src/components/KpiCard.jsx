import { motion } from 'framer-motion'

export default function KpiCard({ label, value, sub, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-500 to-brand-700',
    emerald: 'from-emerald-500 to-emerald-700',
    rose: 'from-rose-500 to-rose-700',
    amber: 'from-amber-500 to-amber-600',
    accent: 'from-accent-500 to-accent-700',
    purple: 'from-purple-500 to-purple-700',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-pad relative overflow-hidden"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accents[accent]} opacity-10 blur-xl`}
      />
      <div className="flex items-start justify-between">
        <div className="stat-label">{label}</div>
        {Icon && (
          <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-sm`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">{sub}</div>}
    </motion.div>
  )
}
