import MagicString from 'magic-string'
import serialize from 'serialize-javascript'
import ts from 'typescript'
import { type Plugin, type ResolvedConfig } from 'vite'
import { type Options } from '../index'
import { prerelease as main } from '../index'
import { resolveEnvFromConfig, runtimeEnvCode } from '../runtime-env/utils'
import { resolveJsCookie } from '../utils'
import { resolvedVirtualModuleId, runtimeId, serverId, vmods } from './virtual'

export function prerelease(options?: Pick<Options, 'prereleaseWidget' | 'prereleaseEnv'>): any {
  const { prereleaseWidget = {}, prereleaseEnv = 'production' } = options || {}
  if (process.env.NODE_ENV === prereleaseEnv || process.env.NODE_ENV === 'production') {
    return
  }

  let config: ResolvedConfig
  let env: ReturnType<typeof resolveEnvFromConfig>

  return [
    {
      name: 'vite:plugin-prerelease-remix',
      enforce: 'pre',
      configResolved: {
        order: 'pre',
        handler(_config) {
          config = _config
          env = resolveEnvFromConfig(config, prereleaseEnv)
        },
      },
      transform: {
        order: 'pre',
        async handler(code, id) {
          if (/.+\/root\.[t|j]sx?$/.test(id)) {
            const app = 'AppExportIdentifier'

            const s = new MagicString(code)
            const sourceFile = ts.createSourceFile('source.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

            function visit(node: ts.Node) {
              if (ts.isFunctionDeclaration(node)) {
                const defaultNode = node.modifiers?.find((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
                if (defaultNode) {
                  s.remove(defaultNode.pos, defaultNode.end)
                  if (node.name) {
                    s.overwrite(node.name.pos + 1, node.name.end, app)
                  } else {
                    s.prependLeft(node.pos, `\nconst ${app} =`)
                  }
                }
              } else if (ts.isExportAssignment(node)) {
                s.overwrite(node.pos, node.expression.pos, `\nconst ${app} =`)
              }
              ts.forEachChild(node, visit)
            }

            visit(sourceFile)

            const imports = [/*js*/ `import { withPrereleaseWidget } from "vite-plugin-prerelease/remix/client";`]
            const defaultExport = /*js*/ `export default withPrereleaseWidget(${app}, ${serialize(prereleaseWidget)})();`

            code = `${imports.join('\n')}\n${s.toString()}\n${defaultExport}`

            return {
              code,
              map: null,
            }
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
              if(typeof window !== 'undefined') {
                ${jsCookie}
                ${envCode}
              }
            `
          }
          case resolvedVirtualModuleId(serverId): {
            return /*js*/ `
              import cookie from 'cookie'
              export default function server(request) {
                const cookies = cookie.parse(request.headers.get('Cookie') ?? '')
                global.isPreRelease = cookies.prerelease === 'true'
              }
            `
          }
          default:
            break
        }
      },
    },
    main({
      mode: 'runtime',
      prereleaseEnv,
      prereleaseWidget,
    }),
  ] as Plugin[]
}
