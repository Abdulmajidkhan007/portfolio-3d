import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { content, projectCategories } from '@/data/content'

const publicPath = (assetPath: string) =>
  fileURLToPath(new URL(`../../public${assetPath}`, import.meta.url))

/** Every `/…` path in content.ts must resolve to a committed file under public/. */
const assetPaths = [
  content.profile.resume,
  content.profile.avatarImage,
  content.hero.videoSrc,
  content.hero.videoPoster,
  ...content.projects.map((project) => project.image),
].filter((value): value is string => typeof value === 'string' && value.startsWith('/'))

describe('asset paths', () => {
  it.each(assetPaths)('%s exists under public/', (path) => {
    expect(existsSync(publicPath(path))).toBe(true)
  })
})

describe('projects', () => {
  it('has unique ids', () => {
    const ids = content.projects.map((project) => project.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses categories the filter knows about', () => {
    for (const project of content.projects) {
      expect(projectCategories).toContain(project.category)
    }
  })

  it('gives every project at least one tag and a plausible year', () => {
    for (const project of content.projects) {
      expect(project.tags.length).toBeGreaterThan(0)
      expect(project.year).toBeGreaterThanOrEqual(2015)
      expect(project.year).toBeLessThanOrEqual(new Date().getFullYear() + 1)
    }
  })
})

describe('project kinds', () => {
  it('names what each project consists of', () => {
    for (const project of content.projects) {
      expect(project.kinds.length).toBeGreaterThan(0)
    }
  })

  it('Atoyo does not claim a server-cost reason for the pause', () => {
    const atoyo = content.projects.find((project) => project.id === 'atoyo')
    expect(JSON.stringify(atoyo?.description)).not.toMatch(/server uchun|pay for the server/i)
  })
})

describe('skills', () => {
  it('carries names only: no proficiency numbers', () => {
    for (const skill of content.skills) {
      expect(Object.keys(skill)).not.toContain('level')
    }
  })

  it('uses hex colours, which the sphere materials require', () => {
    for (const skill of content.skills) {
      expect(skill.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('outbound links', () => {
  // A portfolio that links to example.com or to a bare profile host is worse
  // than one that shows no link at all, so those never ship.
  const placeholder = /^https?:\/\/(www\.)?(example\.(com|org)|linkedin\.com\/in\/?|t\.me\/?|twitter\.com\/?|x\.com\/?)$|example\.(com|org)/i

  const urls = [
    ...content.projects.flatMap((project) => [project.live, project.repo]),
    ...content.socials.map((social) => social.href),
  ].filter((value): value is string => typeof value === 'string')

  it('has no placeholder or profile-less URLs', () => {
    expect(urls.filter((url) => placeholder.test(url))).toEqual([])
  })

  it.each(urls)('%s is absolute and parseable', (url) => {
    expect(() => new URL(url)).not.toThrow()
  })
})

describe('socials', () => {
  it('always shows a handle, even when there is no URL yet', () => {
    for (const social of content.socials) {
      expect(social.handle.trim()).not.toBe('')
    }
  })
})

describe('localized strings', () => {
  type Pair = [path: string, uz: string | string[], en: string | string[]]

  // Walks every { uz, en } pair reachable from content — both the plain
  // `Localized` strings and the array-valued ones (bio, typewriter) — because a
  // missing translation silently renders as an empty node.
  const walk = (value: unknown, path: string, found: Pair[]) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`, found))
      return
    }
    if (value === null || typeof value !== 'object') return

    const record = value as Record<string, unknown>
    if ('uz' in record || 'en' in record) {
      found.push([path, record.uz as string | string[], record.en as string | string[]])
      return
    }
    for (const [key, child] of Object.entries(record)) walk(child, `${path}.${key}`, found)
  }

  const pairs: Pair[] = []
  walk(content, 'content', pairs)

  const text = (value: string | string[]) => (Array.isArray(value) ? value.join('') : value)

  it('finds localized pairs to check', () => {
    expect(pairs.length).toBeGreaterThan(10)
  })

  it.each(pairs)('%s has non-empty uz and en', (_path, uz, en) => {
    expect(text(uz ?? '').trim()).toBeTruthy()
    expect(text(en ?? '').trim()).toBeTruthy()
  })

  it.each(pairs.filter(([, uz]) => Array.isArray(uz)))(
    '%s has the same number of uz and en entries',
    (_path, uz, en) => {
      expect((en as string[]).length).toBe((uz as string[]).length)
    },
  )
})
