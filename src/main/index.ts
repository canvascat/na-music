import { app, BrowserWindow } from 'electron'
import './dialog'
import { Logger } from './logger'
import { initialize } from './services'
import createBaseWorker from './workers/index?worker'
import createNMServer from './neteaseMusicServer'
import indexPreload from '/@preload/index'
import indexHtmlUrl from '/@renderer/index.html'
import logoUrl from '/@static/logo.png'

async function main() {
  const logger = new Logger()
  logger.initialize(app.getPath('userData'))
  initialize(logger)
  global.__logger = logger
  createNMServer(10754, '127.0.0.1')
  app.whenReady().then(() => {
    createWindow()
  })
  // thread_worker example
  createBaseWorker({ workerData: 'worker world' }).on('message', (message) => {
    logger.log(`Message from worker: ${message}`)
  }).postMessage('')
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 1080,
    minHeight: 720,
    // titleBarStyle: 'hidden',
    // transparent: true,
    frame: false,
    webPreferences: {
      preload: indexPreload,
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: logoUrl
  })

  mainWindow.loadURL(indexHtmlUrl)
  return mainWindow
}

// ensure app start as single instance
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.nextTick(main)
