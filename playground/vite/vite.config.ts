import { defineConfig } from 'vite'
import { preset } from 'vite-config-preset'
import { prerelease } from 'vite-plugin-prerelease'

// https://vitejs.dev/config/
export default defineConfig((env) => {
  return preset(
    {
      env,
      base: '/vite-plugin-prerelease/',
      plugins: [prerelease()],
    },
    {
      legacy: false,
    },
  )
})
