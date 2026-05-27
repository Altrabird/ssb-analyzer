import Logo from './Logo'

export default function LoadingScreen({ message, progress }) {
  return (
    <div className="grid min-h-screen place-items-center bg-grid">
      <div className="card w-full max-w-md p-8 text-center">
        <Logo size={56} className="mx-auto" />
        <h2 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-white">{message || 'Memuatkan…'}</h2>
        {typeof progress === 'object' && progress && (
          <>
            <div className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              {progress.current} daripada {progress.total} fail
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
                style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
            {progress.currentName && (
              <div className="mt-3 truncate text-xs text-ink-500 dark:text-ink-400">
                {progress.currentName}
              </div>
            )}
          </>
        )}
        {!progress && (
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
          </div>
        )}
      </div>
    </div>
  )
}
