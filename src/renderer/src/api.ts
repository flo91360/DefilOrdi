import type { DefilOrdiApi } from '../../shared/api'
import { type AppData, defaultAppData, estPlusRecente, looksLikeAppData, normalizeAppData } from '../../shared/data'

declare global {
  interface Window {
    defilordi?: DefilOrdiApi
  }
}

// Hors d'Electron (npm run dev:web), l'interface tourne dans un simple
// navigateur : les données vont alors dans localStorage.
const KEY = 'defilordi-donnees'

const browserApi: DefilOrdiApi = {
  async load() {
    try {
      const text = localStorage.getItem(KEY)
      const raw: unknown = text ? JSON.parse(text) : null
      return { data: raw ? normalizeAppData(raw) : defaultAppData(), plusRecente: estPlusRecente(raw) }
    } catch {
      return { data: defaultAppData(), plusRecente: false }
    }
  },
  async save(data: AppData) {
    localStorage.setItem(KEY, JSON.stringify(normalizeAppData(data)))
  },
  async exportBackup(data: AppData) {
    const blob = new Blob([JSON.stringify(normalizeAppData(data), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `DefilOrdi-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    return 'ok'
  },
  importBackup() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return resolve({ status: 'annule' })
        try {
          const raw: unknown = JSON.parse(await file.text())
          resolve(looksLikeAppData(raw) ? { status: 'ok', data: normalizeAppData(raw), plusRecente: estPlusRecente(raw) } : { status: 'invalide' })
        } catch {
          resolve({ status: 'invalide' })
        }
      }
      input.oncancel = () => resolve({ status: 'annule' })
      input.click()
    })
  },
  async exportCsv(nomFichier: string, contenu: string) {
    const blob = new Blob(['\ufeff' + contenu], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = nomFichier
    a.click()
    URL.revokeObjectURL(a.href)
    return 'ok'
  },
  async openDataFolder() {},
  async toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }
}

export const api: DefilOrdiApi = window.defilordi ?? browserApi
export const isDesktop = window.defilordi !== undefined
