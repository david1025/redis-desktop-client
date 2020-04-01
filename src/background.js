'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : `file://${__dirname}/index.html`
let welcomeWin

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWelcomeWindow () {
  welcomeWin = new BrowserWindow({
    width: 640,
    height: 400,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    welcomeWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) welcomeWin.webContents.openDevTools()
  } else {
    createProtocol('app')
    welcomeWin.loadURL(winURL)
  }

  welcomeWin.on('closed', () => {
    welcomeWin = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (welcomeWin === null && mainWin === null) {
    createWelcomeWindow()
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
  }
  createWelcomeWindow()
})

app.setAppUserModelId('RedisDesktopClient')

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

let mainWin

function createMainWindow () {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 30 },
    webPreferences: {
      nodeIntegration: true,
      experimentalFeatures: true
    }
  })
  if (!process.env.IS_TEST) mainWin.webContents.openDevTools()
  mainWin.loadURL(winURL + '#/Home')
  mainWin.on('closed', () => {
    mainWin = null
  })
}

ipcMain.on('show', e =>
  welcomeWin.show()
)
ipcMain.on('close', e =>
  welcomeWin === null ? '' : welcomeWin.close()
)

ipcMain.on('openMainWin', e =>
  createMainWindow()
)

ipcMain.on('showMainWin', e =>
  mainWin.show()
)

ipcMain.on('minimize', e =>
  mainWin.minimize()
)
ipcMain.on('maximize', e =>
  mainWin.maximize()
)
ipcMain.on('unmaximize', e =>
  mainWin.unmaximize()
)
ipcMain.on('closeMainWin', e =>
  mainWin === null ? '' : mainWin.close()
)
