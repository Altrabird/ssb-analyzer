import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, CheckCircle2, FileText, FolderOpen, KeyRound, Link2,
  LineChart, ShieldCheck, Sparkles, TriangleAlert, Users,
} from 'lucide-react'
import Logo from './Logo'
import { extractFolderId, getEnvStatus } from '../lib/googleDrive'

const FEATURES = [
  { icon: BarChart3, title: 'Pematuhan ikut kelas', desc: 'Bandingkan kadar serahan antara kelas serta-merta.' },
  { icon: LineChart, title: 'Tren ikut tarikh', desc: 'Lihat pola serahan merentas masa untuk setiap kelas.' },
  { icon: Users, title: 'Jejak per murid', desc: 'Rekod individu dengan carian, isih dan eksport CSV.' },
  { icon: Sparkles, title: 'Analisis alasan', desc: 'Sebab utama tidak hantar dan murid yang perlu perhatian.' },
]

export default function ConnectScreen({ onSignIn, onDemo, error, isConnecting }) {
  const [env, setEnv] = useState({ hasClientId: false, hasApiKey: false })
  const [folderUrl, setFolderUrl] = useState(() => localStorage.getItem('ssb-folder-url') || '')
  useEffect(() => {
    setEnv(getEnvStatus())
  }, [])

  const envReady = env.hasClientId && env.hasApiKey
  const parsedFolderId = extractFolderId(folderUrl)
  const handleConnectFolder = () => {
    if (!parsedFolderId) return
    localStorage.setItem('ssb-folder-url', folderUrl)
    onSignIn({ folderId: parsedFolderId })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade-b" />
      <div className="absolute -top-32 left-1/2 -z-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/30 via-accent-400/20 to-purple-500/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col px-6 py-10 sm:py-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white">
                SSB Analyzer
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">Laporan Semakan Buku Kerja</div>
            </div>
          </div>
          <span className="chip">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data dianalisis dalam pelayar
          </span>
        </header>

        <main className="mt-16 grid items-center gap-12 lg:mt-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="chip mb-5 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Versi 1.0 · Disambungkan ke Google Drive
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
              Lihat data{' '}
              <span className="bg-gradient-to-br from-brand-600 to-accent-500 bg-clip-text text-transparent">
                SSB
              </span>{' '}
              dalam bentuk visual.
            </h1>
            <p className="mt-4 max-w-xl text-balance text-ink-600 dark:text-ink-300">
              Sambung ke folder Drive yang menyimpan Laporan Semakan Buku Kerja anda — dapatkan analisis pematuhan,
              tren, jejak murid dan punca utama dalam beberapa saat.
            </p>

            <div className="mt-8 space-y-3">
              <div className="card-pad bg-gradient-to-br from-white to-brand-50/50 dark:from-ink-900 dark:to-brand-950/30">
                <label className="stat-label flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" />
                  Pintasan folder Drive (pilihan)
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Tampal URL folder Google Drive di sini…"
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                  />
                  <button
                    className="btn-primary"
                    disabled={!envReady || isConnecting || !parsedFolderId}
                    onClick={handleConnectFolder}
                    title={parsedFolderId ? `Folder ID: ${parsedFolderId}` : 'URL tidak sah'}
                  >
                    <FolderOpen className="h-4 w-4" />
                    Sambung folder
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  {parsedFolderId
                    ? `✓ Folder dikenal pasti · ID: ${parsedFolderId.slice(0, 12)}…`
                    : 'Atau gunakan Picker biasa di bawah'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-primary group"
                  onClick={() => onSignIn()}
                  disabled={!envReady || isConnecting}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.6 4.1-5.35 4.1-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.5 0 2.85.55 3.9 1.5l2.7-2.7C16.95 4.4 14.65 3.5 12 3.5 6.75 3.5 2.5 7.75 2.5 13s4.25 9.5 9.5 9.5c5.5 0 9.15-3.85 9.15-9.3 0-.65-.05-1.3-.15-2.1z"/>
                  </svg>
                  {isConnecting ? 'Menyambung…' : 'Log masuk + Picker'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button className="btn-outline" onClick={onDemo}>
                  <FileText className="h-4 w-4" />
                  Cuba dengan data demo
                </button>
              </div>
            </div>

            {!envReady && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Kelayakan Google Cloud belum ditetapkan.</div>
                  <div className="mt-1 text-amber-800/90 dark:text-amber-300/90">
                    Salin <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">.env.example</code> kepada{' '}
                    <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">.env</code> dan tampal{' '}
                    <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">VITE_GOOGLE_CLIENT_ID</code> &{' '}
                    <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">VITE_GOOGLE_API_KEY</code>. Mulakan
                    semula <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">npm run dev</code>.
                  </div>
                  <div className="mt-2 flex gap-3">
                    <span className={`chip ${env.hasClientId ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}`}>
                      <KeyRound className="h-3 w-3" /> CLIENT_ID {env.hasClientId ? '✓' : '✗'}
                    </span>
                    <span className={`chip ${env.hasApiKey ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}`}>
                      <KeyRound className="h-3 w-3" /> API_KEY {env.hasApiKey ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Tidak dapat menyambung</div>
                  <div className="mt-1">{error}</div>
                </div>
              </div>
            )}

            <ul className="mt-8 space-y-2 text-sm text-ink-600 dark:text-ink-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sokongan format dengan/tanpa Jantina &amp; Evidens
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Fail tidak dimuat naik — diuraikan secara tempatan
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Eksport tabular ke CSV bila-bila masa
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/40 via-accent-200/40 to-purple-200/30 blur-2xl dark:from-brand-900/40 dark:via-accent-900/30 dark:to-purple-900/20" />
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-200/70 px-5 py-3 dark:border-ink-800/70">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-ink-500 dark:text-ink-400">Pratonton dasbor</span>
                <FolderOpen className="h-4 w-4 text-ink-400" />
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Murid', value: '142' },
                    { label: 'Laporan', value: '14' },
                    { label: 'Pematuhan', value: '68.2%' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/60">
                      <div className="stat-label">{s.label}</div>
                      <div className="mt-1 font-display text-xl font-bold text-ink-900 dark:text-white">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-ink-200/70 p-3 dark:border-ink-800/70">
                  <div className="stat-label mb-2">Pematuhan ikut kelas</div>
                  {[
                    ['3 INTELEK', 78, '#3b63ff'],
                    ['2 KRITIS', 64, '#06b6d4'],
                    ['1 Amanah', 91, '#10b981'],
                    ['4 INOVATIF', 52, '#f59e0b'],
                    ['6 INOVATIF', 70, '#8b5cf6'],
                  ].map(([k, v, c]) => (
                    <div key={k} className="mb-1.5 last:mb-0">
                      <div className="flex justify-between text-xs text-ink-600 dark:text-ink-300">
                        <span className="font-medium">{k}</span>
                        <span>{v}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="card-pad">
                  <f.icon className="h-5 w-5 text-brand-500" />
                  <div className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">{f.title}</div>
                  <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">{f.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/70 pt-6 text-xs text-ink-500 dark:border-ink-800/70 dark:text-ink-400">
          <div>Dibina dengan React, Vite, Tailwind &amp; Chart.js</div>
          <div>© 2026 SSB Analyzer</div>
        </footer>
      </div>
    </div>
  )
}
