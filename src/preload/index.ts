import { contextBridge, ipcRenderer } from 'electron'
import type { DefilOrdiApi } from '../shared/api'

const api: DefilOrdiApi = {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data) => ipcRenderer.invoke('data:save', data),
  exportBackup: (data) => ipcRenderer.invoke('data:export', data),
  importBackup: () => ipcRenderer.invoke('data:import'),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  toggleFullscreen: () => ipcRenderer.invoke('app:toggle-fullscreen')
}

contextBridge.exposeInMainWorld('defilordi', api)
