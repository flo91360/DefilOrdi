import { expect, test } from '@playwright/test'
import { donnees, jouer, ouvrir, quitterFenetre } from './outils'

test('Mots à retenir : « Arrêter » juste après la fin n’enregistre la partie qu’une fois', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Mots à retenir')
  await page.locator('.liste-card').first().click()
  const mots = (await page.locator('.memoire-main .mot-carte, .memoire-main .mot').allInnerTexts()).map((m) => m.trim().split('\n').pop()!)
  await page.getByText('Je suis prêt !').click()
  const saisie = page.getByLabel('Ta réponse')
  for (const m of mots) {
    await saisie.fill(m)
    await saisie.press('Enter')
  }
  await page.getByRole('button', { name: 'Arrêter' }).click()
  await expect(page.getByText('Bravo Léo !')).toBeVisible()
  const { resultats } = await donnees(page)
  expect(resultats.map((r) => r.reussie)).toEqual([true])
})

test('Chasse aux lettres : « Arrêter » juste après la fin n’enregistre la partie qu’une fois', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Chasse aux lettres')
  await page.locator('.aventure-card').first().click()
  await page.getByRole('radio', { name: '3 vies' }).click()
  await page.locator('.liste-card').first().click()
  // Fin du compte à rebours 3, 2, 1 : le bouton Pause devient actif.
  await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled()
  // Fautes jusqu'à la dernière vie (une touche n'est comptée qu'avec une lettre à l'écran).
  const plusDeVie = page.getByLabel('0 vie')
  await expect
    .poll(
      async () => {
        await page.keyboard.press('9')
        return plusDeVie.isVisible()
      },
      { timeout: 15_000, intervals: [100] }
    )
    .toBe(true)
  await page.getByRole('button', { name: 'Arrêter' }).click()
  await expect(page.getByText('Bravo Léo !')).toBeVisible()
  expect((await donnees(page)).resultats).toHaveLength(1)
})

test('Petit bac : « Arrêter » enregistre la grille commencée', async ({ page }) => {
  await ouvrir(page, { petitBac: { categories: ['Animal', 'Fruit ou légume', 'Métier'], lettres: ['C'] } })
  await jouer(page, 'Petit bac')
  await page.getByRole('button', { name: 'Tirer une lettre !' }).click()
  const premiere = page.locator('.bac-grille input').first()
  await expect(premiere).toBeFocused({ timeout: 10_000 })
  await premiere.fill('chat')
  await page.getByRole('button', { name: 'Arrêter' }).click()
  await expect(page.getByText('Salut Léo !')).toBeVisible()
  const [r] = (await donnees(page)).resultats as { jeu: string; complete: boolean; justes: number; reponses: { mot: string }[] }[]
  expect(r.jeu).toBe('petitbac')
  expect(r.complete).toBe(false)
  expect(r.justes).toBe(1)
  expect(r.reponses.map((x) => x.mot)).toContain('chat')
})

test('Couleurs piégées timer : le chrono s’arrête pendant la pause automatique', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Couleurs piégées')
  await page.locator('.mode-card', { hasText: 'timer' }).click()
  const chrono = page.getByLabel('Temps restant')
  await page.waitForTimeout(1200)
  await quitterFenetre(page)
  const pendant = await chrono.innerText()
  await page.waitForTimeout(2000)
  expect(await chrono.innerText()).toBe(pendant)
  // Pendant la pause, les touches ne vont pas au jeu.
  await page.keyboard.type('rouge')
  await page.getByRole('button', { name: 'Reprendre' }).click()
  await expect(page.getByRole('dialog', { name: 'Pause' })).toBeHidden()
  await expect(page.getByLabel('Ta réponse')).toHaveValue('')
  await expect(chrono).not.toHaveText(pendant, { timeout: 3000 })
})

test('Dactylo : la frappe est ignorée pendant la pause', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Dactylo')
  await page.locator('.liste-card').first().click()
  await quitterFenetre(page)
  await page.keyboard.type('abc')
  await page.getByRole('button', { name: 'Reprendre' }).click()
  await expect(page.getByLabel('Zone de frappe')).toBeFocused()
  await expect(page.locator('.phrase .ch-ok, .phrase .ch-faux')).toHaveCount(0)
})

test('Quiz : bouton Pause et touche Échap', async ({ page }) => {
  await ouvrir(page)
  await jouer(page, 'Quiz de l’ordinateur')
  await page.locator('.liste-card').first().click()
  const pause = page.getByRole('dialog', { name: 'Pause' })
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(pause).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(pause).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(pause).toBeVisible()
  await page.getByRole('button', { name: 'Reprendre' }).click()
  await expect(pause).toBeHidden()
})
