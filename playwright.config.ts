import { defineConfig } from '@playwright/test'

// Tests de parcours : l'interface tourne dans Chromium, sans Electron
// (npm run dev:web), avec les données dans localStorage.
const PORT = 5199

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  timeout: 45_000,
  retries: 0,
  reporter: process.env.CI ? 'list' : 'line',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 800 }
  },
  webServer: {
    command: `npm run dev:web -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
