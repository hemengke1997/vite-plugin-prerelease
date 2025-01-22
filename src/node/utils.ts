import * as cheerio from 'cheerio'
import { type Element } from 'domhandler'

export function transformHtml(originHtml: string, prereleaseHtml: string) {
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

  const createInsertScript = (dynamicTags: Element[]) => {
    return dynamicTags.map((e) => ({
      ...e.attribs,
      'data-tag': e.tagName,
    }))
  }

  const code = /* js */ `
    !(function() {
      function insertTags(attrs) {
        attrs.forEach((attr) => {
          const element = document.createElement(attr['data-tag'])
          for (const key in attr) {
            element.setAttribute(key, attr[key])
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
