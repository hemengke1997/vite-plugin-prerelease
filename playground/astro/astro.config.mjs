import node from '@astrojs/node'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { prerelease } from 'vite-plugin-prerelease/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), prerelease()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
