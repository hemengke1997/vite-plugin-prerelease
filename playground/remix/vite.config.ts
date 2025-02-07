import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import { prerelease } from 'vite-plugin-prerelease/remix'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig(() => {
  return {
    plugins: [
      prerelease(),
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
  }
})
