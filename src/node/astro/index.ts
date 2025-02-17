import { type AstroIntegration } from 'astro'
import { prerelease as main, type Options } from '..'

export function prerelease(options?: Pick<Options, 'excludeEnvs' | 'prereleaseEnv' | 'prereleaseWidget'>): any {
  const { prereleaseEnv = 'production' } = options || {}
  return {
    name: 'vite-plugin-prerelease-integration',
    hooks: {
      'astro:config:setup': ({ injectScript, updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              main({
                ...options,
                mode: 'runtime',
                entry: 'astro:scripts/page.js',
              }),
            ],
          },
        })

        if (process.env.NODE_ENV === prereleaseEnv || process.env.NODE_ENV === 'production') {
          return
        }
        injectScript('page', '')
      },
    },
  } as AstroIntegration
}
