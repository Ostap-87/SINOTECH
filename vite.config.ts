import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // nginx on the VPS serves dist/ straight from disk while the deploy is
    // building into that same folder. Vite's default (emptyOutDir: true)
    // deletes every file in dist/ first — the hashed JS/CSS in dist/assets
    // and ~2200 prerendered pages — and only then writes the new build. If the
    // build dies in between (seen live 26.10.2026 on the 1 GB VPS: dist/assets
    // and part of the pages gone, the remaining HTML pointing at deleted
    // /assets/index-*.js → no styles, no 3D, no JS on the whole site), the
    // site stays broken until the next successful deploy. With false, the new
    // build is written next to the old one: old pages keep working with their
    // own assets until prerender replaces them, and a failed build leaves the
    // previous version live. scripts/dist-assets.mjs (see `npm run build`)
    // repairs pages left pointing at missing assets and prunes old ones.
    emptyOutDir: false,
  },
})
