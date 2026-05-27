import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, desc, action }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 text-brand-600 dark:from-brand-950/60 dark:to-accent-950/60 dark:text-brand-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
      {desc && <p className="mt-1 max-w-md text-sm text-ink-500 dark:text-ink-400">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
