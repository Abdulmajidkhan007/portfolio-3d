import {
  siCss,
  siExpo,
  siFigma,
  siFirebase,
  siFramer,
  siGit,
  siGithub,
  siGreensock,
  siHtml5,
  siJavascript,
  siMui,
  siNetlify,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siReactquery,
  siRedux,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTurborepo,
  siTypescript,
  siVite,
  siZod,
} from 'simple-icons'

export interface SkillIcon {
  /** 24x24 viewBox path from simple-icons. */
  path: string
  /** The brand's official hex. Usually the right colour on a light surface. */
  hex: string
}

/**
 * Brand marks for the skill grid, keyed by the `name` in content.ts.
 *
 * Imported one by one on purpose: `import * as icons` would pull the whole
 * ~2 MB simple-icons barrel into the bundle, while named imports let Rollup
 * drop every icon that is not listed here.
 *
 * A skill with no entry is not a problem — the grid falls back to its `short`
 * monogram, which is what Zustand and VS Code use (simple-icons carries no
 * mark for either).
 */
export const SKILL_ICONS: Record<string, SkillIcon> = {
  React: siReact,
  // simple-icons dropped the separate React Native mark; the React atom is
  // what the RN docs use as well.
  'React Native': siReact,
  'React Three Fiber': siReact,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  'Next.js': siNextdotjs,
  'Redux Toolkit': siRedux,
  TailwindCSS: siTailwindcss,
  HTML5: siHtml5,
  CSS3: siCss,
  MUI: siMui,
  'Framer Motion': siFramer,
  GSAP: siGreensock,
  'Three.js': siThreedotjs,

  Firebase: siFirebase,
  Supabase: siSupabase,
  Git: siGit,
  GitHub: siGithub,
  Vite: siVite,
  'Node.js': siNodedotjs,
  Expo: siExpo,
  Turborepo: siTurborepo,
  'TanStack Query': siReactquery,
  Zod: siZod,
  Netlify: siNetlify,
  Figma: siFigma,
}
