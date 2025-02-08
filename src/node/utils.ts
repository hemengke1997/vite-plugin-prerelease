import fsp from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { transformWithEsbuild } from 'vite'

export async function resolveJsCookie() {
  const require = createRequire(import.meta.url)

  const jsCookie = await transformWithEsbuild(
    await fsp.readFile(path.join(path.dirname(require.resolve('js-cookie')), 'js.cookie.js'), 'utf-8'),
    '',
  )

  return jsCookie.code
}
