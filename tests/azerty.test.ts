import { describe, expect, it } from 'vitest'
import { geste, toucheDe } from '../src/renderer/src/keyboard/azerty'

describe('geste', () => {
  it('lettres, chiffres et ponctuation', () => {
    expect(geste('a')?.etapes).toEqual([['a']])
    expect(geste('A')?.etapes).toEqual([['maj-d', 'a']])
    expect(geste('k')?.etapes).toEqual([['k']])
    expect(geste('K')?.etapes).toEqual([['maj-g', 'k']])
    expect(geste('é')?.etapes).toEqual([['é']])
    expect(geste('2')?.etapes).toEqual([['maj-d', 'é']])
    expect(geste('.')?.etapes).toEqual([['maj-g', ';']])
    expect(geste('?')?.etapes).toEqual([['maj-g', ',']])
    expect(geste(' ')?.etapes).toEqual([['espace']])
  })

  it('touches mortes et Alt Gr', () => {
    expect(geste('ê')).toEqual({ etapes: [['^'], ['e']], aide: '^ puis e' })
    expect(geste('ï')?.etapes).toEqual([['maj-g', '^'], ['i']])
    expect(geste('@')?.etapes).toEqual([['altgr', 'à']])
  })

  it('majuscules accentuées : la majuscule simple', () => {
    expect(geste('É')?.etapes).toEqual([['maj-d', 'e']])
    expect(toucheDe('É')).toBe('e')
  })

  it('toucheDe donne la touche principale', () => {
    expect(toucheDe('M')).toBe('m')
    expect(toucheDe('ê')).toBe('e')
    expect(toucheDe(' ')).toBe('espace')
    expect(toucheDe('☺')).toBeNull()
  })
})
