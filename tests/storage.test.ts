import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defaultAppData, newProfile } from '../src/shared/data'
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
})
