import fsp from 'node:fs/promises'
import path from 'node:path'
import { build, normalizePath, type PluginOption, type ResolvedConfig } from 'vite'
import { type Options } from '..'
import { transformHtml } from './utils'

export function buildtimeEnv(options: Pick<Required<Options>, 'prereleaseEnv' | '__debug'>): PluginOption[] {
  const { prereleaseEnv, __debug } = options || {}

  // Define environment variables when building pre-release
  const definePlugin: PluginOption = {
    name: 'vite:plugin-prerelease-define',
    apply(_, env) {
      return (env.mode === prereleaseEnv && env.command === 'build') || __debug
    },
    config() {
      return {
        define: {
          'import.meta.env.PRERELEASE': 'true',
        },
      }
    },
  }

  let config: ResolvedConfig
  let originalHtml: string
  let prereleaseHtml: string
  // Build pre-release after building test
  const buildPlugin: PluginOption = {
    name: 'vite:plugin-prerelease-build',
    enforce: 'post',
    apply(_, env) {
      if (env.mode === prereleaseEnv) return false
      return env.command === 'build'
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        originalHtml = html
      },
    },
    async closeBundle() {
      config.logger.info('Building prerelease...')

      await build({
        configFile: config.configFile,
        mode: prereleaseEnv,
        base: normalizePath(`${config.base}/prerelease`),
        build: {
          outDir: normalizePath(`${config.build.outDir}/prerelease`),
        },
        plugins: [
          {
            name: 'vite:plugin-prerelease-html',
            enforce: 'post',
            transformIndexHtml: {
              order: 'post',
              handler(html) {
                prereleaseHtml = html
              },
            },
          },
        ],
      })

      const transformedHtml = transformHtml(originalHtml, prereleaseHtml)
      if (transformedHtml) {
        await fsp.writeFile(path.join(config.build.outDir, 'index.html'), transformedHtml)
      }
      config.logger.info('Prerelease build complete')
    },
  }

  return [definePlugin, buildPlugin]
}
