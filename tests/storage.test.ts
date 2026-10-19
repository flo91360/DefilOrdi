import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { COPIES_MAX, DATA_VERSION, defaultAppData, newProfile } from '../src/shared/data'
import { Storage } from '../src/main/storage'

let dir: string

beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'defilordi-'))
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true })
})

const withProfile = (prenom: string) => ({
  ...defaultAppData(),
  profiles: [{ ...newProfile(prenom, '2026-01-01T00:00:00.000Z', 'CM1'), prenom }]
})

describe('Storage', () => {
  it('démarre vide puis relit ce qui a été enregistré', async () => {
    const s = new Storage(dir)
    expect(await s.load()).toEqual(defaultAppData())
    await s.save(withProfile('Léa'))
    expect((await new Storage(dir).load()).profiles[0].prenom).toBe('Léa')
  })

  it('repart de la version précédente si le fichier est abîmé, sans le supprimer', async () => {
    const s = new Storage(dir)
    await s.save(withProfile('Léa'))
    await s.save(withProfile('Tom'))
    await fs.writeFile(join(dir, 'donnees.json'), '{ abîmé', 'utf8')

    const data = await new Storage(dir).load()
    expect(data.profiles[0].prenom).toBe('Léa')
    const files = await fs.readdir(dir)
    expect(files.some((f) => f.startsWith('donnees.illisible-'))).toBe(true)
  })

  it('enregistre les sauvegardes dans l’ordre', async () => {
    const s = new Storage(dir)
    await Promise.all(['A', 'B', 'C'].map((p) => s.save(withProfile(p))))
    expect((await s.load()).profiles[0].prenom).toBe('C')
  })

  it('fait une copie datée au premier démarrage de la journée seulement', async () => {
    await new Storage(dir).save(withProfile('Léa'))
    const jour = (h: number) => () => new Date(Date.UTC(2026, 9, 19, h))
    await new Storage(dir, jour(8)).load()
    await new Storage(dir, jour(9)).load()
    const s = new Storage(dir, () => new Date(Date.UTC(2026, 9, 20, 8)))
    await s.load()
    const copies = await s.listeCopies()
    expect(copies).toHaveLength(2)
    expect(copies.every((f) => f.endsWith('-demarrage.json'))).toBe(true)
    const copie = JSON.parse(await fs.readFile(join(s.copies, copies[0]), 'utf8'))
    expect(copie.profiles[0].prenom).toBe('Léa')
  })

  it('garde le fichier d’origine avant une mise à jour ou s’il vient d’une version plus récente', async () => {
    const ancien = { ...withProfile('Léa'), version: DATA_VERSION - 1 }
    await fs.writeFile(join(dir, 'donnees.json'), JSON.stringify(ancien), 'utf8')
    const s = new Storage(dir)
    await s.load()
    expect(s.plusRecente).toBe(false)
    await fs.writeFile(join(dir, 'donnees.json'), JSON.stringify({ ...ancien, version: DATA_VERSION + 1, nouveauJeu: { a: 1 } }), 'utf8')
    await s.load()
    expect(s.plusRecente).toBe(true)
    const copies = await s.listeCopies()
    expect(copies.some((f) => f.endsWith('-avant-mise-a-jour.json'))).toBe(true)
    const recente = copies.find((f) => f.endsWith('-version-plus-recente.json'))!
    expect(JSON.parse(await fs.readFile(join(s.copies, recente), 'utf8')).nouveauJeu).toEqual({ a: 1 })
  })

  it('copie les données actuelles avant une restauration, après les écritures en attente', async () => {
    const s = new Storage(dir)
    void s.save(withProfile('Tom'))
    await s.copier('avant-restauration')
    const [copie] = await s.listeCopies()
    expect(copie).toMatch(/-avant-restauration\.json$/)
    expect(JSON.parse(await fs.readFile(join(s.copies, copie), 'utf8')).profiles[0].prenom).toBe('Tom')
  })

  it(`ne garde que les ${COPIES_MAX} copies les plus récentes`, async () => {
    let t = Date.UTC(2026, 0, 1)
    const s = new Storage(dir, () => new Date((t += 60_000)))
    await s.save(withProfile('Léa'))
    for (let i = 0; i < COPIES_MAX + 5; i++) await s.copier('avant-restauration')
    const copies = await s.listeCopies()
    expect(copies).toHaveLength(COPIES_MAX)
    expect(copies[0]).toContain('T00-06-00')
  })

  it('ne fait rien sans fichier de données', async () => {
    const s = new Storage(dir)
    await s.copier('avant-restauration')
    expect(await s.listeCopies()).toEqual([])
  })
})

describe('remplacement du fichier de données', () => {
  const erreur = (code: string) => Object.assign(new Error(code), { code })

  it('retente quand Windows verrouille le fichier un instant', async () => {
    const { remplacer } = await import('../src/main/storage')
    let essais = 0
    await remplacer('a', 'b', 1, async () => {
      essais++
      if (essais < 3) throw erreur('EPERM')
    })
    expect(essais).toBe(3)
  })

  it('abandonne après plusieurs essais, ou tout de suite pour une autre erreur', async () => {
    const { ESSAIS_REMPLACEMENT, remplacer } = await import('../src/main/storage')
    let essais = 0
    await expect(remplacer('a', 'b', 1, async () => { essais++; throw erreur('EBUSY') })).rejects.toThrow('EBUSY')
    expect(essais).toBe(ESSAIS_REMPLACEMENT)
    essais = 0
    await expect(remplacer('a', 'b', 1, async () => { essais++; throw erreur('ENOSPC') })).rejects.toThrow('ENOSPC')
    expect(essais).toBe(1)
  })
})
