import MagicString from 'magic-string'
import serialize from 'serialize-javascript'
import { type PluginOption, type ResolvedConfig } from 'vite'
import { type Options } from '..'

export function runtimeEnv(options: Pick<Required<Options>, 'excludeEnvs'>): PluginOption[] {
  const { excludeEnvs } = options

  let config: ResolvedConfig

  const runtimeEnvPlugin: PluginOption = {
    name: 'vite:plugin-runtime-env',
    async configResolved(_config) {
      config = _config
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

        const replaceCode = {
          ssr: /*js*/ `(() => {
            let isPreRelease = false
            if (global.__isPrerelease__) {
              isPreRelease = true
            }
            return ${serialize(global.__env__)}?.[isPreRelease ? 'prerelease' : 'current']${name ? `.${name}` : ''}
          })()`,
          crs: /*js*/ `(() => {
            let isPreRelease = false
            if (window.Cookies?.get('prerelease') === 'true') {
              isPreRelease = true
            }
            return window.__env__?.[isPreRelease ? 'prerelease' : 'current']${name ? `.${name}` : ''}
          })()`,
        }

        magicString.overwrite(start, end, ssr ? replaceCode.ssr : replaceCode.crs)
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
  }

  return [runtimeEnvPlugin]
}
