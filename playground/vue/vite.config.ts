import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { prerelease } from 'vite-plugin-prerelease'

export default defineConfig(() => ({
  base: '/vite-plugin-prerelease-vue/',
  plugins: [vue(), prerelease()],
}))
