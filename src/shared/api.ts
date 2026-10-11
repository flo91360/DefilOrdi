import type { AppData } from './data'

export type ImportResult = { status: 'ok'; data: AppData } | { status: 'annule' } | { status: 'invalide' }

// Fonctions exposées par Electron à l'interface (voir src/preload/index.ts).
export interface DefilOrdiApi {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  exportBackup(data: AppData): Promise<'ok' | 'annule'>
  importBackup(): Promise<ImportResult>
  openDataFolder(): Promise<void>
  toggleFullscreen(): Promise<void>
}
