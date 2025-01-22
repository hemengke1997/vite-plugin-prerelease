import fsp from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import serialize from 'serialize-javascript'
import {
  build,
  type ConfigEnv,
  type HtmlTagDescriptor,
  normalizePath,
  type PluginOption,
  type ResolvedConfig,
  transformWithEsbuild,
} from 'vite'
import { type PrereleaseWidgetOptions } from '../client/core/types'
import { transformHtml } from './utils'

type Options = {
  /**
   * 预发布环境名称
   * @default 'production'
   */
  prereleaseEnv?: string

  /**
   * 预发布小组件配置
   */
  prereleaseWidget?: PrereleaseWidgetOptions

  /**
   * debug
   * @internal
   */
  __debug?: boolean
}

declare global {
  interface ImportMetaEnv {
    PRERELEASE: string
  }
  interface Window {
    Cookies: typeof import('js-cookie')
  }
}

export function prerelease(options?: Options): any {
  const { prereleaseEnv = 'production', prereleaseWidget = {}, __debug = false } = options || {}

  if (process.env.NODE_ENV === prereleaseEnv || process.env.NODE_ENV === 'production') {
    return
  }

  // Insert the pre-release widget when building test and pre-release
  let env: ConfigEnv
  const configPlugin: PluginOption = {
    name: 'vite:plugin-prerelease-config',
    enforce: 'pre',
    apply(_, env) {
      return env.command === 'build' || __debug
    },
    config(_, configEnv) {
      env = configEnv
    },
    transformIndexHtml: {
      // pre for base url
      order: 'pre',
      async handler(html) {
        const require = createRequire(import.meta.url)
        const __dirname = path.dirname(fileURLToPath(import.meta.url))

        const prereleaseWidgetPath = normalizePath(`/@fs/${path.join(__dirname, './client/index.js')}`)

        const prereleaseWidgetScript = /*js*/ `
          import { PrereleaseWidget } from '${prereleaseWidgetPath}'
          if(typeof window !== 'undefined' && typeof document !== 'undefined') {
            const timer = setTimeout(() => {
              new PrereleaseWidget(${serialize(prereleaseWidget)})
            })
          }
        `

        const tags: HtmlTagDescriptor[] = [
          {
            tag: 'script',
            injectTo: 'body',
            attrs: {
              type: 'module',
            },
            children: prereleaseWidgetScript,
          },
        ]

        if (env.mode !== prereleaseEnv) {
          const jsCookie = await transformWithEsbuild(
            await fsp.readFile(path.join(path.dirname(require.resolve('js-cookie')), 'js.cookie.js'), 'utf-8'),
            '',
          )

          tags.push({
            tag: 'script',
            injectTo: 'head-prepend',
            children: jsCookie.code,
          })
        }

        return {
          html,
          tags,
        }
      },
    },
  }

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
      await fsp.writeFile(path.join(config.build.outDir, 'index.html'), transformedHtml)
      config.logger.info('Prerelease build complete')
    },
  }

  return [configPlugin, definePlugin, buildPlugin]
}
