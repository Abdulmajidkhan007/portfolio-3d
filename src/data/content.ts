import type { SiteContent } from '@/types'

/**
 * Single source of truth for everything personal on the site.
 * Edit this file to make the portfolio yours — no component needs to change.
 *
 * Swapping in generated/real imagery:
 *   drop files into public/images/... and point `image`, `avatarImage` or
 *   `hero.videoSrc` at them. `null` keeps the procedural 3D version.
 *
 * `imageHd` / `avatarImageHd` are the Higgsfield-generated versions, fetched
 * during the build by scripts/fetch-assets.mjs rather than committed. They are
 * preferred when they load; `image` (a committed SVG) and the 3D avatar are
 * the fallbacks. Set `avatarImageHd: null` to keep the 3D avatar always.
 */
export const content: SiteContent = {
  profile: {
    name: 'Abdullohkhan Sharipov',
    role: {
      uz: 'Frontend Developer & 3D Enthusiast',
      en: 'Frontend Developer & 3D Enthusiast',
    },
    location: { uz: 'Toshkent, Oʻzbekiston', en: 'Tashkent, Uzbekistan' },
    email: 'santexnika.atoyo@gmail.com',
    resume: '/resume.pdf',
    avatarImage: null,
    avatarImageHd: '/images/avatar.webp',
  },

  hero: {
    videoSrc: null,
    videoPoster: null,
    typewriter: {
      uz: [
        'Frontend Developer',
        '3D veb tajribalar quraman',
        'React va Three.js oshigʻi',
        'Interfeyslarni jonlantiraman',
      ],
      en: [
        'Frontend Developer',
        'I build 3D web experiences',
        'React & Three.js enthusiast',
        'I bring interfaces to life',
      ],
    },
  },

  about: {
    bio: {
      uz: [
        'Men brauzerda ishlaydigan tez, silliq va esda qoladigan interfeyslar quraman. Asosiy qurollarim — React, TypeScript va WebGL.',
        'Soʻnggi yillarda 3D grafika va scroll asosidagi animatsiyalarga chuqur kirdim: Three.js shaderlari, GSAP ScrollTrigger va performance optimizatsiyasi kundalik ishim.',
        'Dizaynerlar bilan tildan tez topishaman va Figma maketni pikselgacha aniq, lekin jonli koda aylantiraman.',
      ],
      en: [
        'I build fast, smooth and memorable interfaces that run in the browser. React, TypeScript and WebGL are my daily tools.',
        'Over the last few years I went deep into 3D graphics and scroll-driven motion: Three.js shaders, GSAP ScrollTrigger and performance work are routine for me.',
        'I speak the same language as designers and turn a Figma file into pixel-accurate — but alive — code.',
      ],
    },
    stats: [
      { value: '5+', label: { uz: 'yillik tajriba', en: 'years of experience' } },
      { value: '40+', label: { uz: 'yakunlangan loyiha', en: 'projects shipped' } },
      { value: '18', label: { uz: 'mamnun mijoz', en: 'happy clients' } },
      { value: '96', label: { uz: 'oʻrtacha Lighthouse', en: 'avg. Lighthouse' } },
    ],
  },

  projects: [
    {
      id: 'nebula-commerce',
      title: 'Nebula Commerce',
      description: {
        uz: '3D mahsulot konfiguratori bilan headless e-commerce platformasi. Real vaqtda material almashtirish va AR koʻrish.',
        en: 'Headless e-commerce platform with a 3D product configurator, real-time material swapping and AR preview.',
      },
      category: 'web',
      tags: ['React', 'Three.js', 'Stripe', 'Edge'],
      image: '/images/projects/project-1.svg',
      imageHd: '/images/projects/project-1.webp',
      repo: 'https://github.com/abdulmajidkhan007',
      year: 2025,
      featured: true,
    },
    {
      id: 'orbit-analytics',
      title: 'Orbit Analytics',
      description: {
        uz: 'Realtime dashboard: WebSocket oqimlari, 200k+ nuqtali grafiklar va virtualizatsiyalangan jadvallar.',
        en: 'Realtime dashboard with WebSocket streams, 200k-point charts and virtualised data tables.',
      },
      category: 'web',
      tags: ['TypeScript', 'D3', 'WebSocket', 'Vite'],
      image: '/images/projects/project-2.svg',
      imageHd: '/images/projects/project-2.webp',
      repo: 'https://github.com/abdulmajidkhan007',
      year: 2025,
    },
    {
      id: 'voxel-studio',
      title: 'Voxel Studio',
      description: {
        uz: 'Brauzerdagi voxel muharriri: GPU instancing, undo/redo tarixi va GLTF eksport.',
        en: 'In-browser voxel editor with GPU instancing, a full undo/redo history and GLTF export.',
      },
      category: '3d',
      tags: ['Three.js', 'WebGL', 'Zustand', 'GLTF'],
      image: '/images/projects/project-3.svg',
      imageHd: '/images/projects/project-3.webp',
      repo: 'https://github.com/abdulmajidkhan007',
      year: 2024,
      featured: true,
    },
    {
      id: 'shader-lab',
      title: 'Shader Lab',
      description: {
        uz: 'GLSL oʻrgatuvchi playground: jonli kod muharriri, 30+ misol va shader kompilyatsiya xatolarini koʻrsatish.',
        en: 'A GLSL teaching playground with a live editor, 30+ examples and inline shader compile diagnostics.',
      },
      category: '3d',
      tags: ['GLSL', 'React', 'CodeMirror'],
      image: '/images/projects/project-4.svg',
      imageHd: '/images/projects/project-4.webp',
      year: 2024,
    },
    {
      id: 'pulse-fit',
      title: 'Pulse Fit',
      description: {
        uz: 'Offline-first fitnes ilovasi: mashq kuzatuvi, animatsiyali statistika va PWA push bildirishnomalari.',
        en: 'Offline-first fitness app with workout tracking, animated statistics and PWA push notifications.',
      },
      category: 'mobile',
      tags: ['React Native', 'Expo', 'SQLite'],
      image: '/images/projects/project-5.svg',
      imageHd: '/images/projects/project-5.webp',
      repo: 'https://github.com/abdulmajidkhan007',
      year: 2023,
    },
    {
      id: 'kit-cli',
      title: 'Kit CLI',
      description: {
        uz: 'Frontend jamoalar uchun scaffolding CLI: shablonlar, kod generatsiyasi va bundle byudjet tekshiruvi.',
        en: 'Scaffolding CLI for frontend teams: templates, code generation and bundle-budget checks.',
      },
      category: 'tool',
      tags: ['Node.js', 'TypeScript', 'Rollup'],
      image: '/images/projects/project-6.svg',
      imageHd: '/images/projects/project-6.webp',
      repo: 'https://github.com/abdulmajidkhan007',
      year: 2023,
    },
  ],

  skills: [
    { name: 'React', level: 95, group: 'core', short: 'Re', color: '#61dafb' },
    { name: 'TypeScript', level: 92, group: 'core', short: 'TS', color: '#3178c6' },
    { name: 'JavaScript', level: 94, group: 'core', short: 'JS', color: '#f7df1e' },
    { name: 'CSS / Tailwind', level: 90, group: 'core', short: 'CSS', color: '#38bdf8' },
    { name: 'Next.js', level: 84, group: 'core', short: 'Nx', color: '#e8ecf4' },
    { name: 'Three.js', level: 88, group: 'threed', short: '3JS', color: '#00ff88' },
    { name: 'React Three Fiber', level: 85, group: 'threed', short: 'R3F', color: '#00d4ff' },
    { name: 'GLSL', level: 74, group: 'threed', short: 'GL', color: '#a78bfa' },
    { name: 'GSAP', level: 89, group: 'threed', short: 'GS', color: '#88ce02' },
    { name: 'Vite', level: 91, group: 'tooling', short: 'Vt', color: '#bd34fe' },
    { name: 'Node.js', level: 78, group: 'tooling', short: 'Nd', color: '#5fa04e' },
    { name: 'Git / CI', level: 86, group: 'tooling', short: 'Git', color: '#f05033' },
  ],

  experience: [
    {
      id: 'exp-1',
      role: { uz: 'Senior Frontend Developer', en: 'Senior Frontend Developer' },
      company: 'Nebula Labs',
      period: { uz: '2024 — hozir', en: '2024 — present' },
      description: {
        uz: 'Mahsulot konfiguratorining 3D yadrosini boshqaraman. Render byudjetini 40% qisqartirdim va dizayn tizimini 6 ta jamoaga tarqatdim.',
        en: 'I lead the 3D core of the product configurator. Cut the render budget by 40% and rolled the design system out to six teams.',
      },
      stack: ['React', 'Three.js', 'TypeScript', 'Turborepo'],
    },
    {
      id: 'exp-2',
      role: { uz: 'Frontend Developer', en: 'Frontend Developer' },
      company: 'Orbit Digital',
      period: { uz: '2022 — 2024', en: '2022 — 2024' },
      description: {
        uz: 'Realtime analitika dashboardlarini qurdim. SSR migratsiyasidan keyin LCP 4.1s dan 1.3s ga tushdi.',
        en: 'Built realtime analytics dashboards. After the SSR migration LCP dropped from 4.1s to 1.3s.',
      },
      stack: ['Next.js', 'D3', 'WebSocket', 'Playwright'],
    },
    {
      id: 'exp-3',
      role: { uz: 'Frontend Developer', en: 'Frontend Developer' },
      company: 'Studio Kvant',
      period: { uz: '2021 — 2022', en: '2021 — 2022' },
      description: {
        uz: 'Agentlik loyihalarida award-style landinglar: scroll animatsiyalari, WebGL effektlari, aniq maket koʻchirish.',
        en: 'Award-style landing pages for agency clients: scroll animation, WebGL effects, pixel-accurate delivery.',
      },
      stack: ['GSAP', 'WebGL', 'Vue', 'Sass'],
    },
    {
      id: 'exp-4',
      role: { uz: 'Junior Frontend Developer', en: 'Junior Frontend Developer' },
      company: 'Freelance',
      period: { uz: '2020 — 2021', en: '2020 — 2021' },
      description: {
        uz: 'Kichik biznes uchun 20+ sayt. Shu yerda performance va accessibility bilan jiddiy shugʻullana boshladim.',
        en: '20+ sites for small businesses. This is where I started taking performance and accessibility seriously.',
      },
      stack: ['JavaScript', 'Sass', 'WordPress'],
    },
  ],

  // `href: null` renders the handle as plain text instead of a dead link — fill in
  // the real profile URL and it turns into a link with no component change.
  socials: [
    { label: 'GitHub', href: 'https://github.com/abdulmajidkhan007', handle: '@abdulmajidkhan007' },
    { label: 'LinkedIn', href: null, handle: '/in/abdullohkhan' },
    { label: 'Telegram', href: null, handle: '@abdullohkhan' },
    { label: 'Email', href: 'mailto:santexnika.atoyo@gmail.com', handle: 'santexnika.atoyo@gmail.com' },
  ],
}

export const projectCategories = ['all', 'web', '3d', 'mobile', 'tool'] as const
export type ProjectFilter = (typeof projectCategories)[number]
