const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'
const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

let gapiReady = false
let gisReady = false
let tokenClient = null
let accessToken = null

const env = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
}

export function getEnvStatus() {
  return {
    hasClientId: !!env.clientId && env.clientId.length > 10,
    hasApiKey: !!env.apiKey && env.apiKey.length > 10,
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.defer = true
    s.setAttribute('data-src', src)
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export function stringifyError(e) {
  if (!e) return 'Ralat tidak diketahui'
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message || e.toString()
  if (typeof e === 'object') {
    if (e.result?.error?.message) return e.result.error.message
    if (e.error && e.error_description) return `${e.error}: ${e.error_description}`
    if (e.error && typeof e.error === 'string') return e.error
    if (e.message) return e.message
    if (e.details) return e.details
    if (e.type) return e.type
    try {
      const j = JSON.stringify(e)
      return j === '{}' ? 'Ralat kosong daripada Google API' : j
    } catch {
      return String(e)
    }
  }
  return String(e)
}

async function initGapi() {
  if (gapiReady) return
  try {
    await loadScript('https://apis.google.com/js/api.js')
    await new Promise((resolve) => window.gapi.load('client:picker', resolve))
    await window.gapi.client.init({
      apiKey: env.apiKey,
      discoveryDocs: [DISCOVERY],
    })
    gapiReady = true
  } catch (e) {
    console.error('initGapi failed', e)
    throw new Error('Gagal memulakan Google API: ' + stringifyError(e))
  }
}

async function initGis() {
  if (gisReady) return
  try {
    await loadScript('https://accounts.google.com/gsi/client')
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: env.clientId,
      scope: SCOPES,
      callback: () => {},
      error_callback: (err) => {
        console.error('GIS error_callback', err)
      },
    })
    gisReady = true
  } catch (e) {
    console.error('initGis failed', e)
    throw new Error('Gagal memuat Google Identity Services: ' + stringifyError(e))
  }
}

export async function initGoogleApis() {
  const s = getEnvStatus()
  if (!s.hasClientId || !s.hasApiKey) {
    throw new Error(
      'Missing Google credentials. Copy .env.example to .env and paste your CLIENT_ID and API_KEY, then restart npm run dev.',
    )
  }
  await Promise.all([initGapi(), initGis()])
}

export function signIn() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Auth belum dimulakan'))
    tokenClient.callback = (resp) => {
      if (resp.error) {
        console.error('OAuth token callback error', resp)
        return reject(new Error(stringifyError(resp)))
      }
      accessToken = resp.access_token
      window.gapi.client.setToken({ access_token: resp.access_token })
      resolve(resp)
    }
    tokenClient.error_callback = (err) => {
      console.error('OAuth error_callback', err)
      reject(new Error('Log masuk dibatalkan atau gagal: ' + stringifyError(err)))
    }
    try {
      tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' })
    } catch (e) {
      console.error('requestAccessToken threw', e)
      reject(new Error(stringifyError(e)))
    }
  })
}

export function signOut() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {})
  }
  accessToken = null
  if (window.gapi?.client) window.gapi.client.setToken(null)
}

export function isSignedIn() {
  return !!accessToken
}

export function openPicker({ folderOnly = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!accessToken) return reject(new Error('Not signed in'))
    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes(folderOnly ? 'application/vnd.google-apps.folder' : 'application/pdf')
    const folderView = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder')

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setOAuthToken(accessToken)
      .setDeveloperKey(env.apiKey)
      .setAppId(env.clientId.split('-')[0])
      .setTitle('Pilih fail PDF SSB atau folder')
      .addView(docsView)
      .addView(folderView)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          resolve(data.docs || [])
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve([])
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export async function listPdfsInFolder(folderId) {
  let pageToken = undefined
  const files = []
  do {
    const resp = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'nextPageToken, files(id, name, modifiedTime, size)',
      pageSize: 200,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })
    if (resp.result.files) files.push(...resp.result.files)
    pageToken = resp.result.nextPageToken
  } while (pageToken)
  return files
}

export function extractFolderId(input) {
  if (!input) return null
  const s = String(input).trim()
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s
  const m = s.match(/folders\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

export async function getFolderMeta(folderId) {
  const resp = await window.gapi.client.drive.files.get({
    fileId: folderId,
    fields: 'id, name, mimeType',
    supportsAllDrives: true,
  })
  return resp.result
}

export async function downloadFile(fileId) {
  const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!resp.ok) {
    let body = ''
    try { body = await resp.text() } catch {}
    throw new Error(`Gagal muat turun fail (${resp.status}): ${body.slice(0, 200)}`)
  }
  return await resp.arrayBuffer()
}

export async function resolvePickerSelections(docs) {
  const out = []
  for (const d of docs) {
    if (d.mimeType === 'application/vnd.google-apps.folder') {
      const files = await listPdfsInFolder(d.id)
      for (const f of files) {
        out.push({ id: f.id, name: f.name, modifiedTime: f.modifiedTime, fromFolder: d.name })
      }
    } else if (d.mimeType === 'application/pdf') {
      out.push({ id: d.id, name: d.name, modifiedTime: d.lastEditedUtc ? new Date(d.lastEditedUtc).toISOString() : null })
    }
  }
  return out
}
