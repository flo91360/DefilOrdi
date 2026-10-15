import { describe, expect, it } from 'vitest'
import { normaliserReponse } from '../src/renderer/src/games/commun'
import { GROUPES_IMAGES, IMAGES_REPLI, imageConnue, imageDuMot } from '../src/renderer/src/games/memoire/images'
import { defaultListesMots } from '../src/shared/phrases'

describe('Images des mots (Mots à retenir)', () => {
  it('donne une image connue à tous les mots d’origine', () => {
    for (const liste of defaultListesMots()) {
      for (const mot of liste.phrases) expect(imageConnue(mot), mot).not.toBeNull()
    }
  })

  it('donne des images différentes à des mots de thèmes variés', () => {
    const mots = ['chat', 'pomme', 'bus', 'fenêtre', 'guitare', 'football', 'soleil', 'robe', 'astronaute', 'château', 'crayon', 'sapin']
    const images = mots.map(imageDuMot)
    expect(new Set(images).size).toBe(mots.length)
  })

  it('ignore accents, majuscules et pluriels', () => {
    expect(imageDuMot('Zèbre')).toBe(imageDuMot('zebre'))
    expect(imageDuMot('chats')).toBe(imageDuMot('chat'))
    expect(imageDuMot('chevaux')).toBe(imageDuMot('cheval'))
    expect(imageDuMot('bateaux')).toBe(imageDuMot('bateau'))
  })

  it('reconnaît une expression par un de ses mots', () => {
    expect(imageConnue('salle de bain')).toBe(imageDuMot('baignoire'))
    expect(imageConnue('le petit chat')).toBe(imageDuMot('chat'))
  })

  it('donne toujours un visuel de repli, stable, à un mot inconnu', () => {
    expect(imageConnue('zorglub')).toBeNull()
    const repli = imageDuMot('zorglub')
    expect(IMAGES_REPLI).toContain(repli)
    expect(imageDuMot('zorglub')).toBe(repli)
    expect(imageDuMot('')).not.toBe('')
  })

  it('n’associe jamais un même mot à deux images', () => {
    const vus = new Map<string, string>()
    for (const [emoji, mots] of GROUPES_IMAGES) {
      for (const mot of mots.split('|')) {
        const k = normaliserReponse(mot).replace(/’/g, "'")
        if (vus.has(k)) expect(vus.get(k), mot).toBe(emoji)
        vus.set(k, emoji)
      }
    }
  })
})
