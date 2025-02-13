import MagicString from 'magic-string'
import { type PluginOption, type ResolvedConfig } from 'vite'
import { type Options } from '..'
import { resolveEnvFromConfig, runtimeEnvCode } from './utils'

export function runtimeEnv(options: Pick<Required<Options>, 'prereleaseEnv' | 'excludeEnvs'>): PluginOption[] {
  const { prereleaseEnv, excludeEnvs } = options

  let env: ReturnType<typeof resolveEnvFromConfig>

  let config: ResolvedConfig

  const runtimeEnvPlugin: PluginOption = {
    name: 'vite:plugin-runtime-env',
    async configResolved(_config) {
      config = _config

      env = resolveEnvFromConfig(config, prereleaseEnv)
    },
    transform(code, _, options) {
      const { ssr } = options || {}

      const magicString = new MagicString(code)

      const importMetaPattern = /import\.meta\.env(?:\.([A-Z0-9_]+))?/g
      let match: RegExpExecArray | null

      while ((match = importMetaPattern.exec(code))) {
        const start = match.index
        const end = start + match[0].length
        const name = match[1]

        if (name && excludeEnvs.includes(name)) {
          continue
        }

        magicString.overwrite(
          start,
          end,
          /*js*/ `(() => { 
              let isPreRelease = false
              if(typeof window !== 'undefined' && window.Cookies?.get('prerelease') === 'true') {
                isPreRelease = true
              }
              if(typeof global !== 'undefined' && global.__isPrerelease__) {
                isPreRelease = true
              }
              return ${ssr ? 'global' : 'window'}.__env__?.[isPreRelease ? 'prerelease' : 'current']${name ? `.${name}` : ''}
            })()`,
        )
      }

      if (!magicString.hasChanged()) {
        return {
          code,
          map: null,
        }
      }

      if (!config.build.sourcemap) {
        return {
          code: magicString.toString(),
          map: null,
        }
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      }
    },
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/javascript' },
          injectTo: 'head',
          children: runtimeEnvCode(env),
        },
      ]
    },
  }

  return [runtimeEnvPlugin]
}
