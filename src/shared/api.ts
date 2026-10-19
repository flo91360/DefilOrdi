import type { AppData } from './data'

// plusRecente : sauvegarde faite avec une version plus récente du logiciel
// (certaines informations ne seront pas reprises).
export type ImportResult = { status: 'ok'; data: AppData; plusRecente: boolean } | { status: 'annule' } | { status: 'invalide' }

// Données lues au démarrage. plusRecente : elles ont été enregistrées par une
// version plus récente du logiciel (une copie est gardée dans « sauvegardes »).
export interface Chargement {
  data: AppData
  plusRecente: boolean
}

// Fonctions exposées par Electron à l'interface (voir src/preload/index.ts).
export interface DefilOrdiApi {
  load(): Promise<Chargement>
  save(data: AppData): Promise<void>
  exportBackup(data: AppData): Promise<'ok' | 'annule'>
  importBackup(): Promise<ImportResult>
  // Enregistre un tableau (CSV) là où l'utilisateur le choisit.
  exportCsv(nomFichier: string, contenu: string): Promise<'ok' | 'annule'>
  openDataFolder(): Promise<void>
  toggleFullscreen(): Promise<void>
}
