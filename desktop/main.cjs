const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const CONFIG_FILE = () => path.join(app.getPath('userData'), 'server.json')
let windowRef
let serverOrigin = null

function normalizeServer(value) {
  let url
  try { url = new URL(String(value).trim()) } catch { throw new Error('أدخل عنوان الخادم كاملًا، مثل https://gym.example.com') }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('استخدم عنوان خادم يبدأ بـ https:// أو http://، من دون مسار أو بيانات دخول.')
  }
  const host = url.hostname.toLowerCase()
  const local = host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  if (url.protocol === 'http:' && !local) throw new Error('للاتصال عبر الإنترنت استخدم https:// لحماية بيانات تسجيل الدخول.')
  return url.origin
}

function readServer() {
  try { return normalizeServer(JSON.parse(fs.readFileSync(CONFIG_FILE(), 'utf8')).server) } catch { return null }
}

function showConnectionForm(error = '') {
  serverOrigin = null
  windowRef.loadFile(path.join(__dirname, 'connect.html'), { query: { error } })
}

function connectTo(value) {
  const origin = normalizeServer(value)
  fs.mkdirSync(path.dirname(CONFIG_FILE()), { recursive: true })
  fs.writeFileSync(CONFIG_FILE(), JSON.stringify({ server: origin }), { mode: 0o600 })
  serverOrigin = origin
  windowRef.loadURL(origin)
}

function createWindow() {
  windowRef = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 820,
    minHeight: 600,
    title: 'Coach Gado Gym',
    backgroundColor: '#1A1A1B',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  windowRef.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  windowRef.webContents.on('will-navigate', (event, target) => {
    if (target.startsWith('file://') && target.endsWith('/connect.html')) return
    if (!serverOrigin || new URL(target).origin !== serverOrigin) {
      event.preventDefault()
      if (/^https?:\/\//i.test(target)) shell.openExternal(target)
    }
  })
  const saved = readServer()
  if (saved) {
    serverOrigin = saved
    windowRef.loadURL(saved)
  } else showConnectionForm()
}

ipcMain.handle('server:connect', (event, value) => {
  const senderPath = new URL(event.senderFrame.url).pathname
  if (!senderPath.endsWith('/connect.html')) throw new Error('غير مسموح بهذا الطلب.')
  try { connectTo(value); return { ok: true } }
  catch (error) { return { ok: false, error: error.message } }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Coach Gado Gym', submenu: [
      { label: 'تغيير عنوان الخادم', click: () => showConnectionForm() },
      { type: 'separator' },
      { role: 'quit', label: 'خروج' }
    ] },
    { label: 'عرض', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }] }
  ]))
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
