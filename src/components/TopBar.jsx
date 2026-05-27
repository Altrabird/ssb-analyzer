import { Moon, Search, Sun } from 'lucide-react'
import Logo from './Logo'

export default function TopBar({ title, subtitle, search, onSearch, theme, setTheme, right }) {
  return (
    <header className="sticky top-0 z-10 border-b border-ink-200/70 bg-white/85 backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/85">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Logo size={28} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white sm:text-xl">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSearch && (
            <div className="relative flex-1 sm:w-72 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={search || ''}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Cari nama, kelas, alasan…"
                className="input pl-9"
              />
            </div>
          )}
          {right}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost h-10 w-10 p-0"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
