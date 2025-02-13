import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { prerelease } from 'vite-plugin-prerelease'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [prerelease({ entry: 'app/root.tsx' }), reactRouter(), tsconfigPaths()],
})
