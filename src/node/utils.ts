import * as cheerio from 'cheerio'
import { type Element } from 'domhandler'
import { parse } from 'dotenv'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import serialize from 'serialize-javascript'
import { normalizePath, type ResolvedConfig, transformWithEsbuild } from 'vite'

export function transformHtml(originHtml: string, prereleaseHtml: string) {
  if (!originHtml || !prereleaseHtml) return
  const $ = cheerio.load(originHtml)
  const pre$ = cheerio.load(prereleaseHtml)

  const generateDynamicTags = ($: cheerio.CheerioAPI) => {
    return [
      ...$('script').filter((_, el) => Boolean($(el).attr('src'))),
      ...$('link').filter((_, el) => Boolean($(el).attr('href'))),
      // legacy
      ...$('script').filter((_, el) => Boolean($(el).data('src') && $(el).attr('id') === 'vite-legacy-entry')),
      // log-time
      ...$('script').filter((_, el) => typeof $(el).data('log-time') !== 'undefined'),
    ]
  }

  const dynamicTags = generateDynamicTags($)
  const dynamicTagsOfPre = generateDynamicTags(pre$)

  dynamicTags.forEach((el) => {
    $(el).remove()
  })

  const createInsertScript = (
    dynamicTags: Element[],
  ): {
    attribs: {
      [name: string]: string
    }
    tag: string
    children: string | null
  }[] => {
    return dynamicTags.map((e) => {
      return {
        attribs: e.attribs,
        tag: e.tagName,
        children: $(e).html(),
      }
    })
  }

  const code = /* js */ `
    !(function() {
      function insertTags(tags) {
        tags.forEach(({ attribs, tag, children }) => {
          const element = document.createElement(tag)
          for (const key in attribs) {
            element.setAttribute(key, attribs[key])
          }
          if(children) {
            element.innerHTML = children
          }

          document.head.appendChild(element)
        })
      }
      const isPrerelease = window.Cookies.get('prerelease') === 'true'
      const attrs = isPrerelease ? ${JSON.stringify(createInsertScript(dynamicTagsOfPre))} : ${JSON.stringify(createInsertScript(dynamicTags))}
      insertTags(attrs)
    })()
  `

  $('body').after(`<script>${code}</script>`)

  return $.html().replace(/^\s*$(?:\r\n?|\n)/gm, '')
}

export async function resolveJsCookie() {
  const require = createRequire(import.meta.url)

  const jsCookie = await transformWithEsbuild(
    await fsp.readFile(path.join(path.dirname(require.resolve('js-cookie')), 'js.cookie.js'), 'utf-8'),
    '',
  )

  return jsCookie.code
}

export function runtimeEnvCode(env: { prerelease: Record<string, any>; current: Record<string, any> }) {
  return /*js*/ `
    if(window.Cookies?.get('prerelease') === 'true') {
      window.__env__ = ${serialize(env.prerelease)}
    } else {
      window.__env__ = ${serialize(env.current)}
    }
  `
}

function arraify<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target]
}

function getEnvFilesForMode(mode: string, envDir: string): string[] {
  return [
    /** default file */ `.env`,
    /** local file */ `.env.local`,
    /** mode file */ `.env.${mode}`,
    /** mode local file */ `.env.${mode}.local`,
  ].map((file) => normalizePath(path.join(envDir, file)))
}

function tryStatSync(file: string): fs.Stats | undefined {
  try {
    // The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
    return fs.statSync(file, { throwIfNoEntry: false })
  } catch {
    // Ignore errors
  }
}

export function loadEnv(mode: string, envDir: string, prefixes: string | string[] = 'VITE_'): Record<string, string> {
  prefixes = arraify(prefixes)
  const env: Record<string, string> = {}
  const envFiles = getEnvFilesForMode(mode, envDir)

  const parsed = Object.fromEntries(
    envFiles.flatMap((filePath) => {
      if (!tryStatSync(filePath)?.isFile()) return []

      return Object.entries(parse(fs.readFileSync(filePath)))
    }),
  )

  // only keys that start with prefix are exposed to client
  for (const [key, value] of Object.entries(parsed)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      env[key] = value
    }
  }

  return env
}

export function resolveEnvFromConfig(config: ResolvedConfig, prereleaseEnv: string) {
  const env = {
    prerelease: {
      ...config.env,
      ...loadEnv(prereleaseEnv, config.envDir, config.envPrefix),
      // define import.meta.env.PRERELEASE
      PRERELEASE: true,
      MODE: prereleaseEnv,
    },
    current: {
      ...config.env,
      ...loadEnv(config.mode, config.envDir, config.envPrefix),
    },
  }

  // @ts-ignore
  global.__env__ = {}

  return env
}
