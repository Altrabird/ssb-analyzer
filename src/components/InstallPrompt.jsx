import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [evt, setEvt] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('ssb-install-dismissed') === '1')
  const [installed, setInstalled] = useState(
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault()
      setEvt(e)
    }
    function onInstalled() {
      setInstalled(true)
      setEvt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || dismissed || !evt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="card flex items-start gap-3 p-4 shadow-glow">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink-900 dark:text-white">Pasang SSB Analyzer</div>
          <div className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            Lancarkan dari skrin utama, buka serta-merta, kelihatan seperti aplikasi asli.
          </div>
          <div className="mt-2.5 flex gap-2">
            <button
              className="btn-primary !px-3 !py-1.5 text-xs"
              onClick={async () => {
                evt.prompt()
                const result = await evt.userChoice
                if (result.outcome === 'dismissed') {
                  setDismissed(true)
                  localStorage.setItem('ssb-install-dismissed', '1')
                }
                setEvt(null)
              }}
            >
              <Download className="h-3.5 w-3.5" /> Pasang
            </button>
            <button
              className="btn-ghost !px-3 !py-1.5 text-xs"
              onClick={() => {
                setDismissed(true)
                localStorage.setItem('ssb-install-dismissed', '1')
              }}
            >
              Nanti
            </button>
          </div>
        </div>
        <button
          className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
          onClick={() => {
            setDismissed(true)
            localStorage.setItem('ssb-install-dismissed', '1')
          }}
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
