import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { type AppData, COPIES_MAX, defaultAppData, estPlusAncienne, estPlusRecente, normalizeAppData } from '../shared/data'

export type RaisonCopie = 'demarrage' | 'avant-mise-a-jour' | 'version-plus-recente' | 'avant-restauration'

// Les données sont dans %APPDATA%\DefilOrdi\donnees.json. Chaque écriture passe
// par un fichier temporaire, et la version précédente est gardée à côté pour
// pouvoir repartir de là si le fichier principal est abîmé.
// En plus, une copie datée du fichier est faite dans « sauvegardes » au premier
// démarrage de la journée, avant une mise à jour des données, si elles viennent
// d'une version plus récente du logiciel, et avant une restauration : une
// mauvaise manipulation ou une erreur du logiciel reste réparable.
export class Storage {
  private readonly file: string
  private readonly previous: string
  readonly copies: string
  private queue: Promise<void> = Promise.resolve()
  // Vrai si le dernier fichier lu venait d'une version plus récente du
  // logiciel : l'interface prévient alors l'ergothérapeute.
  plusRecente = false

  constructor(
    readonly dir: string,
    private readonly maintenant: () => Date = () => new Date()
  ) {
    this.file = join(dir, 'donnees.json')
    this.previous = join(dir, 'donnees.precedent.json')
    this.copies = join(dir, 'sauvegardes')
  }

  async load(): Promise<AppData> {
    await fs.mkdir(this.dir, { recursive: true })
    const main = await readJson(this.file)
    this.plusRecente = main.ok && estPlusRecente(main.value)
    if (main.ok) {
      if (this.plusRecente) await this.copier('version-plus-recente')
      else if (estPlusAncienne(main.value)) await this.copier('avant-mise-a-jour')
      else if (!(await this.copieDuJour())) await this.copier('demarrage')
      return normalizeAppData(main.value)
    }
    const prev = await readJson(this.previous)
    if (main.exists) {
      // Fichier illisible : on le met de côté plutôt que de l'écraser.
      const stamp = this.maintenant().toISOString().replace(/[:.]/g, '-')
      await fs.rename(this.file, join(this.dir, `donnees.illisible-${stamp}.json`)).catch(() => {})
    }
    if (prev.ok) return normalizeAppData(prev.value)
    return defaultAppData()
  }

  save(data: AppData): Promise<void> {
    const run = this.queue.then(() => this.write(normalizeAppData(data)))
    this.queue = run.catch(() => {})
    return run
  }

  // Copie datée du fichier de données tel qu'il est sur le disque (après les
  // écritures en attente). Une copie ratée n'empêche jamais de continuer.
  copier(raison: RaisonCopie): Promise<void> {
    const run = this.queue.then(() => this.faireCopie(raison))
    this.queue = run.catch(() => {})
    return run.catch(() => {})
  }

  private async faireCopie(raison: RaisonCopie): Promise<void> {
    await fs.mkdir(this.copies, { recursive: true })
    const stamp = this.maintenant().toISOString().replace(/[:.]/g, '-')
    try {
      await fs.copyFile(this.file, join(this.copies, `donnees-${stamp}-${raison}.json`))
    } catch {
      return // pas encore de fichier de données : rien à copier
    }
    const anciennes = (await this.listeCopies()).slice(0, -COPIES_MAX)
    await Promise.all(anciennes.map((f) => fs.rm(join(this.copies, f), { force: true })))
  }

  // Noms des copies, de la plus ancienne à la plus récente (la date est au début du nom).
  async listeCopies(): Promise<string[]> {
    const noms = await fs.readdir(this.copies).catch(() => [] as string[])
    return noms.filter((f) => f.startsWith('donnees-') && f.endsWith('.json')).sort()
  }

  private async copieDuJour(): Promise<boolean> {
    const jour = this.maintenant().toISOString().slice(0, 10)
    return (await this.listeCopies()).some((f) => f.startsWith(`donnees-${jour}`))
  }

  private async write(data: AppData): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true })
    const tmp = `${this.file}.tmp`
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
    await fs.copyFile(this.file, this.previous).catch(() => {})
    await fs.rename(tmp, this.file)
  }
}

async function readJson(path: string): Promise<{ ok: true; value: unknown } | { ok: false; exists: boolean }> {
  let text: string
  try {
    text = await fs.readFile(path, 'utf8')
  } catch {
    return { ok: false, exists: false }
  }
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch {
    return { ok: false, exists: true }
  }
}
