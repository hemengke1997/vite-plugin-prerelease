import serialize from 'serialize-javascript'
import { type ConfigEnv, type HtmlTagDescriptor, type PluginOption } from 'vite'
import { type PrereleaseWidgetOptions } from '../client/core/types'
import { id } from './remix/virtual'
import { resolveJsCookie } from './utils'

export type Options = {
  /**
   * 预发布插件类型
   * @default 'runtime'
   * @description
   * runtime 动态修改环境变量，一个输出不同环境
   * buildtime 构建预发布环境代码，多个输出多个环境
   */
  mode: 'runtime' | 'buildtime'

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

export async function prerelease(options?: Options): Promise<any> {
  const { mode = 'runtime', prereleaseEnv = 'production', prereleaseWidget = {}, __debug = false } = options || {}
  if (process.env.NODE_ENV === prereleaseEnv || process.env.NODE_ENV === 'production') {
    return
  }

  // Insert the pre-release widget
  let env: ConfigEnv
  const configPlugin: PluginOption = {
    name: 'vite:plugin-prerelease-config',
    enforce: 'pre',
    config(_, configEnv) {
      env = configEnv
      return {
        ssr: {
          noExternal: ['vite-plugin-prelease'],
        },
        optimizeDeps: {
          exclude: [id('*')],
        },
      }
    },
    transformIndexHtml: {
      // pre for base url
      order: 'pre',
      async handler() {
        const prereleaseWidgetScript = /*js*/ `
           import { PrereleaseWidget } from 'vite-plugin-prerelease/client'
           if(typeof window !== 'undefined' && typeof document !== 'undefined') {
             setTimeout(() => {
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
          tags.push({
            tag: 'script',
            injectTo: 'head-prepend',
            children: await resolveJsCookie(),
          })
        }

        return tags
      },
    },
  }

  const commonPlugins = [configPlugin]

  if (mode === 'runtime') {
    const { runtimeEnv } = await import('./runtime-env')
    return [
      ...commonPlugins,
      ...runtimeEnv({
        prereleaseEnv,
      }),
    ]
  } else {
    const { buildtimeEnv } = await import('./buildtime-env')
    return [
      ...commonPlugins,
      ...buildtimeEnv({
        prereleaseEnv,
        __debug,
      }),
    ]
  }
}
