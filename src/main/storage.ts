import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { type AppData, defaultAppData, normalizeAppData } from '../shared/data'

// Les données sont dans %APPDATA%\DefilOrdi\donnees.json. Chaque écriture passe
// par un fichier temporaire, et la version précédente est gardée à côté pour
// pouvoir repartir de là si le fichier principal est abîmé.
export class Storage {
  private readonly file: string
  private readonly previous: string
  private queue: Promise<void> = Promise.resolve()

  constructor(readonly dir: string) {
    this.file = join(dir, 'donnees.json')
    this.previous = join(dir, 'donnees.precedent.json')
  }

  async load(): Promise<AppData> {
    await fs.mkdir(this.dir, { recursive: true })
    const main = await readJson(this.file)
    if (main.ok) return normalizeAppData(main.value)
    const prev = await readJson(this.previous)
    if (main.exists) {
      // Fichier illisible : on le met de côté plutôt que de l'écraser.
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
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
