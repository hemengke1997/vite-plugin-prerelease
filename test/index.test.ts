import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { transformHtml } from '../src/node/utils'

function transform() {
  const originHtml = fs.readFileSync(path.join(__dirname, './fixtures/test.html'), 'utf-8')
  const prereleaseHtml = fs.readFileSync(path.join(__dirname, './fixtures/prerelease.html'), 'utf-8')

  const result = transformHtml(originHtml, prereleaseHtml)
  return result
}

describe('transform html', () => {
  test('should match snapshot', () => {
    const result = transform()

    expect(result).toMatchSnapshot()
  })
  test('should transform match result', async () => {
    const result = transform()

    await expect(result).toMatchFileSnapshot('./fixtures/index.html')
  })
})
