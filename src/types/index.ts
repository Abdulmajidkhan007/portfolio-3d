export type Lang = 'uz' | 'en'

/** A string that exists in both site languages. */
export type Localized = Record<Lang, string>

export type ProjectCategory = 'web' | '3d' | 'mobile' | 'tool'

export interface Project {
  id: string
  title: string
  description: Localized
  category: ProjectCategory
  tags: string[]
  /** Path under /public. Always committed, so it is the guaranteed baseline. */
  image: string
  /**
   * Richer artwork fetched at build time by scripts/fetch-assets.mjs. Preferred
   * when present; the card falls back to `image` if the file never arrived.
   */
  imageHd?: string
  live?: string
  repo?: string
  year: number
  featured?: boolean
}

export type SkillGroup = 'core' | 'threed' | 'tooling'

export interface Skill {
  name: string
  /** Self-assessed proficiency, 0-100. Drives the About progress bars. */
  level: number
  group: SkillGroup
  /** Short label rendered inside the 3D sphere nodes. */
  short: string
  color: string
}

export interface ExperienceItem {
  id: string
  role: Localized
  company: string
  period: Localized
  description: Localized
  stack: string[]
}

export interface SocialLink {
  label: string
  /** null -> render `handle` as plain text rather than a link that goes nowhere. */
  href: string | null
  handle: string
}

export interface SiteContent {
  profile: {
    name: string
    /** Used for the typewriter subtitle and SEO. */
    role: Localized
    location: Localized
    email: string
    phone?: string
    resume: string
    /** null -> render the 3D avatar. Set a path to render an image instead. */
    avatarImage: string | null
    /**
     * Build-time portrait (see scripts/fetch-assets.mjs). Used when
     * `avatarImage` is null; if the fetch failed, the 3D avatar renders.
     */
    avatarImageHd?: string
  }
  hero: {
    /** null -> render the particle field. Set a path to render a video instead. */
    videoSrc: string | null
    videoPoster: string | null
    /** Rotating strings for the typewriter. */
    typewriter: Record<Lang, string[]>
  }
  about: {
    bio: Record<Lang, string[]>
    stats: { value: string; label: Localized }[]
  }
  projects: Project[]
  skills: Skill[]
  experience: ExperienceItem[]
  socials: SocialLink[]
}
