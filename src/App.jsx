import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ConnectScreen from './components/ConnectScreen'
import Sidebar, { MobileNav } from './components/Sidebar'
import TopBar from './components/TopBar'
import LoadingScreen from './components/LoadingScreen'
import OverviewView from './components/views/OverviewView'
import ComplianceView from './components/views/ComplianceView'
import TrendView from './components/views/TrendView'
import StudentsView from './components/views/StudentsView'
import ReasonsView from './components/views/ReasonsView'
import { useTheme } from './hooks/useTheme'
import { applyTheme } from './lib/chartConfig'
import { parseSsbPdf } from './lib/pdfParser'
import { demoReports } from './lib/demoData'
import {
  downloadFile, getFolderMeta, initGoogleApis, isSignedIn, listPdfsInFolder,
  openPicker, resolvePickerSelections, signIn, signOut,
} from './lib/googleDrive'

const TITLES = {
  overview: { title: 'Ringkasan', subtitle: 'Pandangan tahap tinggi semua laporan dimuat' },
  compliance: { title: 'Pematuhan ikut Kelas', subtitle: 'Bandingkan kadar serahan antara kelas' },
  trend: { title: 'Tren ikut Tarikh', subtitle: 'Lihat perubahan pematuhan merentas masa' },
  students: { title: 'Jejak Murid', subtitle: 'Rekod individu setiap murid' },
  reasons: { title: 'Alasan & Leaderboard', subtitle: 'Punca tidak hantar dan murid menonjol' },
}

export default function App() {
  const [theme, setTheme] = useTheme()
  const [phase, setPhase] = useState('connect') // connect | loading | ready
  const [view, setView] = useState('overview')
  const [reports, setReports] = useState([])
  const [source, setSource] = useState(null) // 'drive' | 'demo' | 'upload'
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [progress, setProgress] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const fileInputRef = useRef(null)
  const [savedFolderId, setSavedFolderId] = useState(null)

  useEffect(() => {
    applyTheme(theme === 'dark')
  }, [theme])

  async function handleSignIn(opts = {}) {
    setError(null)
    setIsConnecting(true)
    try {
      await initGoogleApis()
      await signIn()
      if (opts.folderId) {
        setSavedFolderId(opts.folderId)
        await loadFromFolder(opts.folderId)
      } else {
        await pickFromDrive()
      }
    } catch (e) {
      setError(e.message || String(e))
      setIsConnecting(false)
    }
  }

  async function loadFromFolder(folderId) {
    try {
      let folderName = null
      try {
        const meta = await getFolderMeta(folderId)
        folderName = meta.name
      } catch (e) {
        // tolerate — meta is just for display
      }
      const files = await listPdfsInFolder(folderId)
      if (!files.length) {
        setError(`Folder ${folderName ? `"${folderName}"` : ''} tidak mengandungi sebarang fail PDF.`)
        setIsConnecting(false)
        return
      }
      await ingestDriveFiles(files)
    } catch (e) {
      setError(e.message || String(e))
      setIsConnecting(false)
      setPhase('connect')
    }
  }

  async function ingestDriveFiles(files) {
    setIsConnecting(false)
    setPhase('loading')
    setProgress({ current: 0, total: files.length, currentName: null })
    const parsed = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      setProgress({ current: i, total: files.length, currentName: f.name })
      try {
        const buf = await downloadFile(f.id)
        const report = await parseSsbPdf(buf, { id: f.id, name: f.name, source: 'drive' })
        parsed.push(report)
      } catch (e) {
        console.warn('Skip fail:', f.name, e)
      }
    }
    setProgress({ current: files.length, total: files.length, currentName: null })
    if (!parsed.length) {
      setError('Tiada laporan SSB sah dapat diuraikan daripada fail-fail dalam folder.')
      setPhase('connect')
      return
    }
    setReports((prev) => [...prev, ...parsed])
    setSource('drive')
    setPhase('ready')
  }

  async function pickFromDrive() {
    try {
      const docs = await openPicker()
      if (!docs.length) {
        setIsConnecting(false)
        return
      }
      const files = await resolvePickerSelections(docs)
      if (!files.length) {
        setError('Tiada fail PDF dijumpai dalam pilihan anda.')
        setIsConnecting(false)
        return
      }
      await ingestDriveFiles(files)
    } catch (e) {
      setError(e.message || String(e))
      setIsConnecting(false)
      setPhase('connect')
    }
  }

  function handleDemo() {
    setReports(demoReports)
    setSource('demo')
    setPhase('ready')
  }

  async function handleFileUpload(e) {
    const list = Array.from(e.target.files || [])
    if (!list.length) return
    setPhase('loading')
    setProgress({ current: 0, total: list.length, currentName: null })
    const parsed = []
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      setProgress({ current: i, total: list.length, currentName: f.name })
      try {
        const buf = await f.arrayBuffer()
        const report = await parseSsbPdf(buf, { id: `${f.name}_${f.lastModified}`, name: f.name, source: 'upload' })
        parsed.push(report)
      } catch (err) {
        console.warn('Skip', f.name, err)
      }
    }
    setReports((prev) => [...prev, ...parsed])
    setSource((s) => s || 'upload')
    setPhase('ready')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSignOut() {
    if (source === 'drive') signOut()
    setReports([])
    setSource(null)
    setPhase('connect')
    setView('overview')
    setSearch('')
  }

  function handleAddMore() {
    if (source === 'drive' && isSignedIn()) {
      pickFromDrive()
    } else if (source === 'drive') {
      handleSignIn()
    } else {
      fileInputRef.current?.click()
    }
  }

  function handleRefresh() {
    if (source === 'drive') {
      if (savedFolderId && isSignedIn()) {
        setReports([])
        loadFromFolder(savedFolderId)
      } else {
        pickFromDrive()
      }
    }
  }

  function handleAddMoreFromFolder() {
    if (savedFolderId && isSignedIn()) {
      loadFromFolder(savedFolderId)
    }
  }

  const title = TITLES[view]
  const showSearch = view === 'students'

  const ViewComponent = useMemo(() => {
    switch (view) {
      case 'compliance': return ComplianceView
      case 'trend': return TrendView
      case 'students': return StudentsView
      case 'reasons': return ReasonsView
      default: return OverviewView
    }
  }, [view])

  if (phase === 'connect') {
    return (
      <>
        <ConnectScreen
          onSignIn={handleSignIn}
          onDemo={handleDemo}
          error={error}
          isConnecting={isConnecting}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </>
    )
  }

  if (phase === 'loading') {
    return <LoadingScreen message="Memuat & menguraikan PDF…" progress={progress} />
  }

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      <Sidebar
        view={view}
        onView={setView}
        onAddMore={handleAddMore}
        onRefresh={handleRefresh}
        onSignOut={handleSignOut}
        source={source}
        reportCount={reports.length}
      />
      <main className="min-w-0 flex-1">
        <MobileNav view={view} onView={setView} />
        <TopBar
          title={title.title}
          subtitle={title.subtitle}
          search={showSearch ? search : null}
          onSearch={showSearch ? setSearch : null}
          theme={theme}
          setTheme={setTheme}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ViewComponent reports={reports} search={search} />
          </motion.div>
        </AnimatePresence>
      </main>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  )
}
