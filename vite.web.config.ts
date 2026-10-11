// Lance uniquement l'interface dans un navigateur (sans Electron), pour le
// développement et les tests visuels. Les données vont alors dans localStorage.
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

export default defineConfig({
  root: resolve('src/renderer'),
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react()]
})
