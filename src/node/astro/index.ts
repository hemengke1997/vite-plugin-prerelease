import { type AstroIntegration } from 'astro'
import { prerelease as main, type Options } from '..'

export function prerelease(
  options?: Pick<Options, 'excludeEnvs' | 'prereleaseEnv' | 'prereleaseWidget' | 'enable'>,
): any {
  const { enable } = options || {}
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

        if (!enable) {
          return
        }
        injectScript('page', '')
      },
    },
  } as AstroIntegration
}
