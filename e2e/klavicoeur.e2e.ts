import { expect, test } from '@playwright/test'
import { RANGEES_KLAVICOEUR } from '../src/renderer/src/games/klavicoeur/engine'
import { donnees, jouer, ouvrir } from './outils'

const RANGEE_1 = RANGEES_KLAVICOEUR[0]

test('Klavicoeur : une lettre mal placée est mise de côté, puis replacée ; le niveau 2 se débloque', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Klavicoeur')
  // Seul le niveau 1 est ouvert au départ.
  await expect(page.getByRole('button', { name: 'Niveau 2 (verrouillé)' })).toBeDisabled()
  await page.getByRole('button', { name: 'Jouer au niveau 1' }).click()
  const touches = page.locator('.kc-rangee').first().locator('.kc-touche')
  await expect(touches).toHaveCount(10)
  const enCours = page.locator('.kc-en-cours')

  // Première lettre posée au mauvais endroit : elle part de côté.
  const premiere = (await enCours.innerText()).trim()
  const fausse = (indexDans(premiere) + 1) % RANGEE_1.length
  await touches.nth(fausse).click()
  await expect(page.locator('.kc-de-cote .kc-lettre')).toHaveText([premiere])

  for (let i = 0; i < RANGEE_1.length; i++) {
    const l = (await enCours.innerText()).trim()
    await touches.nth(indexDans(l)).click()
  }
  await expect(page.getByText('Niveau 2 débloqué !')).toBeVisible()
  await expect(page.locator('.kc-recap')).toContainText(premiere)
  const d = (await donnees(page)) as unknown as { resultats: Record<string, unknown>[]; profiles: { klavicoeur: unknown }[] }
  expect(d.resultats).toHaveLength(1)
  expect(d.resultats[0]).toMatchObject({ jeu: 'klavicoeur', niveau: 1, reussi: true, hesitations: 1, placees: 10, hesitationsParLettre: { [premiere]: 1 } })
  expect(d.profiles[0].klavicoeur).toEqual({ debloque: 2, niveau: 2, echecs: 0 })
})

function indexDans(l: string): number {
  return RANGEE_1.indexOf(l)
}
