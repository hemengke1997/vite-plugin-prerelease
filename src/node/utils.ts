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
