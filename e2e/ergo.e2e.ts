import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { donnees, ouvrir, PROFIL } from './outils'

const dactylo = (jour: number, frappes: number) => ({
  id: `d${jour}`,
  profileId: PROFIL.id,
  jeu: 'dactylo',
  date: `2026-09-${String(jour).padStart(2, '0')}T10:00:00.000Z`,
  listeNom: 'Premiers mots',
  phrases: 5,
  dureeMs: 60000,
  caracteres: frappes,
  frappes,
  erreurs: 2,
  erreursParTouche: { e: 2 }
})

const quiz = {
  id: 'q1',
  profileId: PROFIL.id,
  jeu: 'quiz',
  complete: true,
  date: '2026-09-10T10:00:00.000Z',
  themeNom: 'Le matériel',
  dureeMs: 90000,
  questions: 10,
  justes: 7,
  ratees: []
}

async function entrerErgo(page: import('@playwright/test').Page, code = '1234') {
  await page.getByText('Espace ergothérapeute').click()
  await page.keyboard.type(code)
}

test('Code par défaut : l’espace ergo impose d’en choisir un autre avant de s’afficher', async ({ page }) => {
  await ouvrir(page, { settings: { codeErgo: '0000', volume: 0 } })
  await page.getByText('Espace ergothérapeute').click()
  await expect(page.getByText('Code par défaut')).toHaveCount(0)
  await page.keyboard.type('0000')
  await expect(page.getByRole('dialog', { name: 'Choisissez votre code' })).toBeVisible()
  await expect(page.getByText(PROFIL.prenom)).toHaveCount(0)
  const champs = page.getByRole('dialog').locator('input')
  await champs.nth(0).fill('4321')
  await champs.nth(1).fill('4321')
  await page.getByRole('button', { name: 'Changer le code' }).click()
  await expect(page.getByText(PROFIL.prenom)).toBeVisible()
  expect((await donnees(page)).settings.codeErgo).toBe('4321')
})

test('Statistiques : bilan imprimable et export de toutes les parties', async ({ page }) => {
  await ouvrir(page, { resultats: [dactylo(1, 100), dactylo(2, 120), dactylo(3, 140), dactylo(4, 160), quiz] })
  await entrerErgo(page)
  await page.getByRole('button', { name: 'Statistiques' }).click()

  const telechargement = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tout exporter (Excel)' }).click()
  const csv = await readFile(await (await telechargement).path(), 'utf8')
  expect(csv).toContain('"Dactylo"')
  expect(csv).toContain('"Quiz de l’ordinateur"')

  await page.getByRole('button', { name: 'Bilan imprimable' }).click()
  const bilan = page.locator('.bilan')
  await expect(bilan.getByRole('heading', { name: 'Bilan de Léo' })).toBeVisible()
  await expect(bilan.getByText('5 parties sur 5 jours')).toBeVisible()
  await expect(bilan.getByRole('heading', { name: /Dactylo/ })).toBeVisible()
  await expect(bilan.getByRole('heading', { name: /Quiz de l’ordinateur/ })).toBeVisible()
  // Vitesse : (frappes - erreurs) par minute, moyenne des 2 premières puis des 2 dernières parties.
  const vitesse = bilan.getByRole('row', { name: /Vitesse/ })
  await expect(vitesse.getByRole('cell').nth(1)).toHaveText('108')
  await expect(vitesse.getByRole('cell').nth(2)).toHaveText('148')

  // Période sans partie.
  await page.getByLabel('Du').fill('2026-10-01')
  await expect(bilan.getByText('Aucune partie jouée sur cette période.')).toBeVisible()
})

test('Réglages : le volume est enregistré une fois le curseur arrêté', async ({ page }) => {
  await ouvrir(page)
  await entrerErgo(page)
  await page.getByLabel('Sections').getByRole('button', { name: 'Réglages' }).click()
  const curseur = page.getByLabel('Volume')
  await curseur.focus()
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight')
  await expect(page.getByText('20 %')).toBeVisible()
  await expect.poll(async () => (await donnees(page)).settings.volume).toBe(0.2)
})

test('Données d’une version plus récente : l’ergo est prévenue au démarrage', async ({ page }) => {
  await ouvrir(page, { version: 99 })
  const alerte = page.getByRole('dialog', { name: 'Version plus récente des données' })
  await expect(alerte).toBeVisible()
  await page.getByRole('button', { name: 'Continuer quand même' }).click()
  await expect(alerte).toBeHidden()
  await expect(page.getByText(PROFIL.prenom)).toBeVisible()
})

test('Phrases des enfants : relues avant d’être partagées, réglage modifiable', async ({ page }) => {
  const phrase = { id: 'ph1', texte: 'le chat dort', niveau: 1, profileId: PROFIL.id, prenom: PROFIL.prenom, date: '2026-10-01T10:00:00.000Z', statut: 'a_verifier', motifs: [] }
  await ouvrir(page, { phrasesEnfants: [phrase] })
  await entrerErgo(page)
  await page.getByLabel('Sections').getByRole('button', { name: /Phrases des enfants/ }).click()
  await expect(page.getByText('Phrase correcte : elle attend votre accord')).toBeVisible()
  const relecture = page.getByRole('checkbox', { name: /Relire chaque phrase/ })
  await expect(relecture).toBeChecked()
  await relecture.uncheck()
  await expect.poll(async () => (await donnees(page)).settings.relirePhrasesEnfants).toBe(false)
  await page.getByRole('button', { name: 'Valider cette phrase' }).click()
  await expect(page.getByText('Phrases ajoutées (1)')).toBeVisible()
})
