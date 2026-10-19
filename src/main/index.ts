import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import type { ImportResult } from '../shared/api'
import { type AppData, estPlusRecente, looksLikeAppData, normalizeAppData } from '../shared/data'
import { Storage } from './storage'

const storage = new Storage(app.getPath('userData'))

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#f6f4ef',
    title: 'DefilOrdi',
    icon: join(__dirname, '../../resources/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  })

  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  // Aucun lien ne doit ouvrir de fenêtre ni quitter l'application.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (event) => event.preventDefault())

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return win
}

function registerIpc(): void {
  ipcMain.handle('data:load', async () => {
    const data = await storage.load()
    return { data, plusRecente: storage.plusRecente }
  })
  ipcMain.handle('data:save', (_e, data: AppData) => storage.save(data))

  ipcMain.handle('data:export', async (e, data: AppData) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const date = new Date().toISOString().slice(0, 10)
    const options = {
      title: 'Enregistrer une sauvegarde',
      defaultPath: join(app.getPath('documents'), `DefilOrdi-sauvegarde-${date}.json`),
      filters: [{ name: 'Sauvegarde DefilOrdi', extensions: ['json'] }]
    }
    const res = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
    if (res.canceled || !res.filePath) return 'annule'
    await fs.writeFile(res.filePath, JSON.stringify(normalizeAppData(data), null, 2), 'utf8')
    return 'ok'
  })

  ipcMain.handle('data:import', async (e): Promise<ImportResult> => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const options = {
      title: 'Ouvrir une sauvegarde',
      properties: ['openFile' as const],
      filters: [{ name: 'Sauvegarde DefilOrdi', extensions: ['json'] }]
    }
    const res = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (res.canceled || res.filePaths.length === 0) return { status: 'annule' }
    try {
      const raw: unknown = JSON.parse(await fs.readFile(res.filePaths[0], 'utf8'))
      if (!looksLikeAppData(raw)) return { status: 'invalide' }
      // Copie des données actuelles avant qu'elles soient remplacées.
      await storage.copier('avant-restauration')
      return { status: 'ok', data: normalizeAppData(raw), plusRecente: estPlusRecente(raw) }
    } catch {
      return { status: 'invalide' }
    }
  })

  ipcMain.handle('file:export-csv', async (e, nomFichier: string, contenu: string) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const nom = String(nomFichier).replace(/[\\/:*?"<>|]/g, '_')
    const options = {
      title: 'Exporter',
      defaultPath: join(app.getPath('documents'), nom),
      filters: [{ name: 'Tableau (CSV)', extensions: ['csv'] }]
    }
    const res = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
    if (res.canceled || !res.filePath) return 'annule'
    // BOM pour qu'Excel lise correctement les accents.
    await fs.writeFile(res.filePath, '\ufeff' + String(contenu), 'utf8')
    return 'ok'
  })

  ipcMain.handle('app:open-data-folder', async () => {
    await shell.openPath(storage.dir)
  })

  ipcMain.handle('app:toggle-fullscreen', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) win.setFullScreen(!win.isFullScreen())
  })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    registerIpc()
    createWindow()
  })

  app.on('window-all-closed', () => app.quit())
}
