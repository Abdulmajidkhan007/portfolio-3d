import { describe, expect, it } from 'vitest'
import { uz } from '@/i18n/uz'
import { en } from '@/i18n/en'
import { content } from '@/data/content'

/** Flattens a nested dictionary into "a.b.c" -> value entries. */
const flatten = (value: unknown, prefix = ''): Record<string, string> => {
  if (typeof value === 'string') return { [prefix]: value }
  if (value === null || typeof value !== 'object') return {}

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, child]) => Object.assign(acc, flatten(child, prefix ? `${prefix}.${key}` : key)),
    {},
  )
}

const flatUz = flatten(uz)
const flatEn = flatten(en)

describe('dictionaries', () => {
  it('has a meaningful number of keys', () => {
    expect(Object.keys(flatUz).length).toBeGreaterThan(30)
  })

  // uz.ts defines the shape and TypeScript enforces it at build time, but a key
  // can still be typed correctly and left empty.
  it('defines exactly the same keys in both languages', () => {
    expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatUz).sort())
  })

  it.each(Object.entries(flatUz))('uz.%s is not empty', (_key, value) => {
    expect(value.trim()).not.toBe('')
  })

  it.each(Object.entries(flatEn))('en.%s is not empty', (_key, value) => {
    expect(value.trim()).not.toBe('')
  })
})

describe('uzbek orthography', () => {
  // Latin Uzbek writes oʻ and gʻ with U+02BB. A straight quote is the usual slip
  // and renders as a different glyph; dropping the mark entirely makes it a
  // different word. Both shipped once, so both are guarded here.
  const straightQuote = /[og]['’`´]/i

  // Each pattern matches the *misspelling* only: the optional group covers a
  // dropped mark and the wrong quote characters, and U+02BB is deliberately not
  // in that class, so a correctly spelled "oʻzbek" never matches.
  const missingTutuq = [
    /\bo['’`´]?zbek/,
    /\bko['’`´]?nikma/,
    /\bko['’`´]?rish\b/,
    /\bko['’`´]?rsat/,
    /\bo['’`´]?rgat/,
    /\bo['’`´]?rtacha\b/,
    /\bso['’`´]?nggi\b/,
    /\bbog['’`´]?lanish\b/,
    /\bo['’`´]?tish\b/,
    /\boshig['’`´]?i\b/,
  ]

  // Both the UI dictionary and the personal content are user-visible Uzbek.
  const uzbekStrings: [string, string][] = [
    ...Object.entries(flatUz).map(([key, value]): [string, string] => [`uz.${key}`, value]),
    ...Object.entries(flatten(content))
      .filter(([key]) => key === 'uz' || key.endsWith('.uz') || key.includes('.uz.'))
      .map(([key, value]): [string, string] => [`content.${key}`, value]),
  ]

  it('collects Uzbek strings from both sources', () => {
    expect(uzbekStrings.length).toBeGreaterThan(40)
  })

  it.each(uzbekStrings)('%s uses ʻ rather than a straight quote', (key, value) => {
    expect(value, `${key}: "${value}"`).not.toMatch(straightQuote)
  })

  it.each(uzbekStrings)('%s spells known ʻ-words correctly', (key, value) => {
    const offenders = missingTutuq.filter((pattern) => pattern.test(value.toLowerCase()))
    expect(offenders.map(String), `${key}: "${value}"`).toEqual([])
  })
})
