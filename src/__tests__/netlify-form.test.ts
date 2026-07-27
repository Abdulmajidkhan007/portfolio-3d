import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), 'utf8')

const html = read('index.html')
const contactSource = read('src/components/Contact.tsx')

/**
 * Field names declared by the input/textarea elements of a form. Scoped to those
 * tags so the form element's own `name` attribute is not counted as a field.
 */
const fieldNames = (source: string) =>
  [...source.matchAll(/<(?:input|textarea)\b[^>]*?\bname="([^"]+)"/g)].map((match) => match[1])

/**
 * Netlify registers a form by parsing the HTML it receives at build time, so the
 * hidden twin in index.html is the only thing it ever sees. If the two forms
 * drift, submissions silently 404 in production — which no local run catches.
 */
describe('netlify form twin', () => {
  const staticForm = html.match(/<form name="contact"[\s\S]*?<\/form>/)?.[0]

  it('still exists in index.html', () => {
    expect(staticForm).toBeTruthy()
  })

  it('is marked for Netlify with a honeypot', () => {
    expect(staticForm).toContain('data-netlify="true"')
    expect(staticForm).toContain('netlify-honeypot="bot-field"')
  })

  it('declares the same fields as the React form', () => {
    const staticFields = new Set(fieldNames(staticForm ?? ''))
    const reactFields = new Set(fieldNames(contactSource))

    // The React form names itself via the FORM_NAME constant, which the regex
    // above skips, so compare only the data fields.
    for (const name of ['form-name', 'bot-field', 'name', 'email', 'message']) {
      expect(staticFields, `index.html is missing "${name}"`).toContain(name)
      expect(reactFields, `Contact.tsx is missing "${name}"`).toContain(name)
    }

    expect([...staticFields].sort()).toEqual([...reactFields].sort())
  })

  it('posts to a form name that matches the static twin', () => {
    const formName = contactSource.match(/const FORM_NAME = '([^']+)'/)?.[1]
    expect(formName).toBe('contact')
  })
})
