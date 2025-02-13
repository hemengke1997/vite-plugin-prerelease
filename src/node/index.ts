import serialize from 'serialize-javascript'
import { normalizePath, type PluginOption, type ResolvedConfig } from 'vite'
import { type PrereleaseWidgetOptions } from '../client/core/types'
import { resolveEnvFromConfig, runtimeEnvCode } from './runtime-env/utils'
import { resolveJsCookie } from './utils'
import { id, resolvedVirtualModuleId, runtimeId, vmods } from './virtual'

export type Options = {
  /**
   * 预发布插件类型
   * @default 'runtime'
   * @description
   * runtime 动态修改环境变量，一个输出不同环境
   * buildtime 构建预发布环境代码，多个输出多个环境
   */
  mode?: 'runtime' | 'buildtime'

  /**
   * 需要排除的环境变量，排除之后，环境变量不再被动态修改
   */
  excludeEnvs?: string[]

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
   * 入口文件
   * 对于 csr 项目，入口通常是 src/main
   * 对于 remix/rr7 项目，入口通常是 app/root
   */
  entry?: string

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
  const {
    mode = 'runtime',
    excludeEnvs = [],
    prereleaseEnv = 'production',
    prereleaseWidget = {},
    entry = 'src/main',
    __debug = false,
  } = options || {}
  if (process.env.NODE_ENV === prereleaseEnv || process.env.NODE_ENV === 'production') {
    return
  }

  // Insert the pre-release widget
  let config: ResolvedConfig
  let env: ReturnType<typeof resolveEnvFromConfig>

  const configPlugin: PluginOption = {
    name: 'vite:plugin-prerelease-config',
    enforce: 'pre',
    config() {
      return {
        ssr: {
          noExternal: ['vite-plugin-prerelease'],
        },
        optimizeDeps: {
          exclude: [id('*')],
        },
      }
    },
    configResolved: {
      order: 'pre',
      handler(_config) {
        config = _config
        env = resolveEnvFromConfig(config, prereleaseEnv)
      },
    },
    transform: {
      order: 'pre',
      handler(code, id) {
        let isEntry = false
        if (entry.startsWith(config.root)) {
          isEntry = normalizePath(id).endsWith(normalizePath(entry))
        } else if (new RegExp(entry).test(id)) {
          isEntry = true
        }

        if (isEntry) {
          return /*js*/ `
            import '${runtimeId}';
            ${code}
          `
        }
      },
    },
    resolveId(id) {
      if (vmods.includes(id)) {
        return resolvedVirtualModuleId(id)
      }
      return null
    },
    async load(id) {
      switch (id) {
        case resolvedVirtualModuleId(runtimeId): {
          const jsCookie = await resolveJsCookie()
          const envCode = runtimeEnvCode(env)
          return /*js*/ `
            import { PrereleaseWidget } from 'vite-plugin-prerelease/client'

            if(typeof window !== 'undefined') {
              ${jsCookie}
              ${envCode}

              new PrereleaseWidget(${serialize(prereleaseWidget)})
            }
          `
        }
        default:
          break
      }
    },
  }

  const commonPlugins = [configPlugin]

  if (mode === 'runtime') {
    const { runtimeEnv } = await import('./runtime-env')
    return [
      ...commonPlugins,
      ...runtimeEnv({
        prereleaseEnv,
        excludeEnvs,
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
