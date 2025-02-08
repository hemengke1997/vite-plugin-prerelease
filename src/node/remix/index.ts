import MagicString from 'magic-string'
import serialize from 'serialize-javascript'
import ts from 'typescript'
import { type Plugin, type ResolvedConfig } from 'vite'
import { type Options } from '..'
import { prerelease as main } from '..'
import { resolveEnvFromConfig, runtimeEnvCode } from '../runtime-env/utils'
import { resolveJsCookie } from '../utils'
import { resolvedVirtualModuleId, runtimeId, vmods } from './virtual'

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
            const app = 'AppExport'

            const s = new MagicString(code)
            const sourceFile = ts.createSourceFile('source.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

            function visit(node: ts.Node) {
              if (
                ts.isFunctionDeclaration(node) &&
                node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
              ) {
                s.remove(node.modifiers.pos, node.modifiers.end)
                if (node.name) {
                  s.overwrite(node.name.pos + 1, node.name.end, app)
                } else {
                  s.prependLeft(node.pos, `\nconst ${app} =`)
                }
              } else if (ts.isExportAssignment(node)) {
                s.overwrite(node.pos, node.expression.pos, `\nconst ${app} =`)
              }
              ts.forEachChild(node, visit)
            }

            visit(sourceFile)

            const jsCookie = await resolveJsCookie()
            const envCode = runtimeEnvCode(env)

            const imports = [/*js*/ `import { withPrereleaseWidget } from "vite-plugin-prerelease/remix/client";`]
            const defaultExport = /*js*/ `export default withPrereleaseWidget(${app}, ${serialize(prereleaseWidget)}, {
              jsCookie: ${serialize(jsCookie)},
              env: ${serialize(envCode)},
            })();`

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
            return `export default ${serialize(`${jsCookie}\n${envCode}`)}`
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
