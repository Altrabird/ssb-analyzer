import {
  BarChart3, Boxes, LineChart, ListTodo, LogOut, Plus, RefreshCcw, Users,
} from 'lucide-react'
import Logo from './Logo'

const NAV = [
  { id: 'overview', label: 'Ringkasan', icon: Boxes },
  { id: 'compliance', label: 'Pematuhan ikut Kelas', icon: BarChart3 },
  { id: 'trend', label: 'Tren ikut Tarikh', icon: LineChart },
  { id: 'students', label: 'Jejak Murid', icon: Users },
  { id: 'reasons', label: 'Alasan & Leaderboard', icon: ListTodo },
]

export default function Sidebar({ view, onView, onAddMore, onRefresh, onSignOut, source, reportCount }) {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-ink-200/70 bg-white/80 backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/80 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-ink-200/70 px-5 dark:border-ink-800/70">
        <Logo size={32} />
        <div>
          <div className="font-display text-sm font-bold leading-tight text-ink-900 dark:text-white">SSB Analyzer</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">Buku Kerja Murid</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => onView(item.id)}
              className={active ? 'nav-link-active w-full' : 'nav-link w-full'}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-ink-200/70 p-3 dark:border-ink-800/70">
        <div className="mb-3 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 p-3 text-xs dark:from-brand-950/30 dark:to-accent-950/30">
          <div className="font-semibold text-brand-700 dark:text-brand-300">
            {source === 'drive' ? 'Disambung ke Drive' : source === 'demo' ? 'Mod Demo' : 'Fail Tempatan'}
          </div>
          <div className="mt-0.5 text-ink-600 dark:text-ink-400">{reportCount} laporan dimuat</div>
        </div>
        <button className="nav-link w-full" onClick={onAddMore}>
          <Plus className="h-4 w-4" />
          Tambah laporan
        </button>
        <button className="nav-link w-full" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4" />
          Muat semula
        </button>
        <button
          className="nav-link w-full text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Log keluar
        </button>
      </div>
    </aside>
  )
}

export function MobileNav({ view, onView }) {
  return (
    <nav className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-ink-200/70 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/95 lg:hidden">
      {NAV.map((item) => {
        const Icon = item.icon
        const active = view === item.id
        return (
          <button
            key={item.id}
            onClick={() => onView(item.id)}
            className={
              'inline-flex flex-shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ' +
              (active
                ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-glow'
                : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200')
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
