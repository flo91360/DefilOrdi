import { expect, type Page } from '@playwright/test'

const CLE = 'defilordi-donnees'

export const PROFIL = { id: 'p1', prenom: 'Léo', classe: 'CM1', creeLe: '2026-01-01T00:00:00.000Z' }

// Ouvre le logiciel avec ces données (code ergo déjà choisi, son coupé).
export async function ouvrir(page: Page, donnees: Record<string, unknown> = {}) {
  await page.goto('/')
  await page.evaluate(
    ([cle, d]) => localStorage.setItem(cle as string, JSON.stringify(d)),
    [CLE, { version: 5, profiles: [PROFIL], settings: { codeErgo: '1234', volume: 0 }, ...donnees }]
  )
  await page.reload()
}

export async function donnees(page: Page): Promise<{ resultats: Record<string, unknown>[]; settings: Record<string, unknown> }> {
  return page.evaluate((cle) => JSON.parse(localStorage.getItem(cle) ?? '{}'), CLE)
}

export async function jouer(page: Page, jeu: string) {
  await page.getByText(PROFIL.prenom).click()
  await page.getByRole('button', { name: jeu }).click()
}

// Simule le passage à une autre fenêtre (Alt+Tab).
export async function quitterFenetre(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(page.getByRole('dialog', { name: 'Pause' })).toBeVisible()
}
