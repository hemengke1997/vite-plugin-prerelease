import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { prerelease } from 'vite-plugin-prerelease/remix'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [prerelease(), reactRouter(), tsconfigPaths()],
})
