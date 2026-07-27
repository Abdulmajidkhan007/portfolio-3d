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
    name: 'Abdulmajid Sharipov',
    role: {
      uz: 'Frontend Developer',
      en: 'Frontend Developer',
    },
    location: { uz: 'Qoʻqon, Oʻzbekiston', en: 'Qoqon, Uzbekistan' },
    email: 'abdulmajidsharipovlc@gmail.com',
    phone: '+998 90 854 56 03',
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
        'React va TypeScript bilan ishlayman',
        'Veb va mobil ilovalar quraman',
        'Interfeyslarni jonlantiraman',
      ],
      en: [
        'Frontend Developer',
        'I work with React & TypeScript',
        'I build web and mobile apps',
        'I bring interfaces to life',
      ],
    },
  },

  about: {
    bio: {
      uz: [
        'React va TypeScript asosida toza, qayta ishlatiluvchi va miqyoslanuvchi veb-ilovalar yarataman. Komponentlar arxitekturasi, holatni boshqarish va API integratsiyasi kundalik ishim.',
        'TailwindCSS, MUI va Bootstrap yordamida piksel darajasida aniq responsiv interfeyslar; Framer Motion va GSAP bilan silliq animatsiyalar. Soʻnggi loyihalarimda React Native va Three.js ham qoʻshildi.',
        'Real vaqt rejimidagi ilovalar, autentifikatsiya tizimlari va admin panellarni noldan toʻliq ishlab chiqqanman. Performans va kod sifatiga alohida eʼtibor beraman.',
      ],
      en: [
        'I build clean, reusable and scalable web applications on React and TypeScript. Component architecture, state management and API integration are my daily work.',
        'Pixel-accurate responsive interfaces with TailwindCSS, MUI and Bootstrap; smooth motion with Framer Motion and GSAP. React Native and Three.js joined the toolkit on recent projects.',
        'I have shipped realtime applications, authentication systems and admin panels end to end. Performance and code quality get particular attention.',
      ],
    },
    // Derived from the public GitHub account: 26 repositories of my own, one of
    // which is still in progress.
    stats: [
      { value: '2', label: { uz: 'yillik tajriba', en: 'years of experience' } },
      { value: '25', label: { uz: 'tugallangan loyiha', en: 'projects completed' } },
      { value: '7', label: { uz: 'mamnun mijoz', en: 'happy clients' } },
      { value: '26', label: { uz: 'jami loyiha', en: 'projects in total' } },
    ],
  },

  projects: [
    {
      id: 'atoyo',
      title: 'ATOYO Santexnika',
      description: {
        uz: '10 000+ mahsulotli e-commerce platformasi — bitta repoda Next.js sayti va React Native ilovasi. Typo-tolerant qidiruv, Telegram bot orqali buyurtma boshqaruvi, rolga asoslangan admin panel va CI’da yigʻiladigan release APK.',
        en: 'E-commerce platform with 10,000+ products — a Next.js site and a React Native app in one repo. Typo-tolerant search, order management over a Telegram bot, a role-based admin panel and a release APK built in CI.',
      },
      category: 'web',
      platform: { uz: 'Ilova + Veb', en: 'App + Web' },
      tags: ['Next.js 16', 'React Native', 'Firebase', 'Telegram API'],
      image: '/images/projects/project-1.svg',
      imageHd: '/images/projects/project-1.webp',
      live: 'https://atoyo-uz.netlify.app',
      // `app` goes here once the build has a store page or a release to link to.
      repo: 'https://github.com/Abdulmajidkhan007/atoyo-e-commerce',
      year: 2026,
      featured: true,
    },
    {
      id: 'kidswear',
      title: 'KidsWear',
      description: {
        uz: 'Bolalar kiyimi platformasi — bitta monorepoda React veb va React Native mobil ilova. Umumiy design token tizimi, FCM push, Cloud Functions va biometrik AppLock.',
        en: 'Kids clothing platform — a React web app and a React Native app from one monorepo. Shared design tokens, FCM push, Cloud Functions and a biometric app lock.',
      },
      category: 'mobile',
      platform: { uz: 'Ilova + Veb', en: 'App + Web' },
      tags: ['React Native', 'React', 'Firebase', 'Turborepo'],
      image: '/images/projects/project-5.svg',
      imageHd: '/images/projects/project-5.webp',
      repo: 'https://github.com/Abdulmajidkhan007/rn-r-e-commerce',
      year: 2026,
      featured: true,
    },
    {
      id: 'lumina',
      title: 'Lumina',
      description: {
        uz: 'Bare React Native CLI asosidagi ijtimoiy tarmoq ilovasi. New Architecture, tipli navigatsiya, offline saqlanuvchi server holati va Reanimated animatsiyalari.',
        en: 'A social media app on bare React Native CLI: New Architecture, fully typed navigation, offline-persisted server state and Reanimated motion.',
      },
      category: 'mobile',
      platform: { uz: 'Ilova + Veb', en: 'App + Web' },
      tags: ['React Native', 'React', 'TanStack Query', 'Zustand'],
      image: '/images/projects/project-3.svg',
      imageHd: '/images/projects/project-3.webp',
      repo: 'https://github.com/Abdulmajidkhan007/lumina',
      year: 2026,
      featured: true,
    },
    {
      id: 'organick',
      title: 'Organick',
      description: {
        uz: 'Organik oziq-ovqat onlayn-doʻkoni: 3 tilli interfeys, Firebase autentifikatsiyasining 3 usuli (Google, email, SMS OTP), dark/light rejim va himoyalangan admin panel.',
        en: 'Organic food store: a trilingual interface, three Firebase sign-in methods (Google, email, SMS OTP), dark/light mode and a protected admin dashboard.',
      },
      category: 'web',
      tags: ['React 19', 'Redux Toolkit', 'Firebase', 'i18next'],
      image: '/images/projects/project-4.svg',
      imageHd: '/images/projects/project-4.webp',
      repo: 'https://github.com/Abdulmajidkhan007/Organick_org',
      year: 2026,
    },
    {
      id: 'portfolio-3d',
      title: '3D Portfolio',
      description: {
        uz: 'Shu saytning oʻzi. Three.js zarrachalar maydoni, oʻz shaderlarim, GSAP ScrollTrigger animatsiyalari va WebGL bundleni kritik yoʻldan chiqarib tashlash.',
        en: 'This very site. A Three.js particle field with hand-written shaders, GSAP ScrollTrigger motion and a WebGL bundle kept off the critical path.',
      },
      category: '3d',
      tags: ['React 19', 'Three.js', 'GSAP', 'Tailwind v4'],
      image: '/images/projects/project-6.svg',
      imageHd: '/images/projects/project-6.webp',
      live: 'https://abdullohkhan-portfolio.netlify.app',
      year: 2026,
    },
  ],

  skills: [
    // Languages and frameworks — the "Skills" pill.
    { name: 'React', level: 95, group: 'core', tab: 'skills', short: 'Re', color: '#61dafb' },
    { name: 'TypeScript', level: 92, group: 'core', tab: 'skills', short: 'TS', color: '#3178c6' },
    { name: 'JavaScript', level: 94, group: 'core', tab: 'skills', short: 'JS', color: '#f7df1e' },
    { name: 'React Native', level: 85, group: 'core', tab: 'skills', short: 'RN', color: '#61dafb' },
    { name: 'Next.js', level: 88, group: 'core', tab: 'skills', short: 'Nx', color: '#e8ecf4' },
    { name: 'Redux Toolkit', level: 88, group: 'core', tab: 'skills', short: 'RTK', color: '#764abc' },
    { name: 'TailwindCSS', level: 92, group: 'core', tab: 'skills', short: 'TW', color: '#38bdf8' },
    { name: 'HTML5', level: 95, group: 'core', tab: 'skills', short: 'H5', color: '#e34f26' },
    { name: 'CSS3', level: 93, group: 'core', tab: 'skills', short: 'C3', color: '#1572b6' },
    { name: 'MUI', level: 84, group: 'core', tab: 'skills', short: 'MUI', color: '#007fff' },
    { name: 'Framer Motion', level: 89, group: 'threed', tab: 'skills', short: 'FM', color: '#a78bfa' },
    { name: 'GSAP', level: 86, group: 'threed', tab: 'skills', short: 'GS', color: '#88ce02' },
    { name: 'Three.js', level: 82, group: 'threed', tab: 'skills', short: '3JS', color: '#00ff88' },
    { name: 'React Three Fiber', level: 80, group: 'threed', tab: 'skills', short: 'R3F', color: '#00d4ff' },

    // Everything I reach for around the code — the "Tools" pill.
    { name: 'Firebase', level: 90, group: 'tooling', tab: 'tools', short: 'FB', color: '#ffca28' },
    { name: 'Supabase', level: 76, group: 'tooling', tab: 'tools', short: 'SB', color: '#3ecf8e' },
    { name: 'Git', level: 88, group: 'tooling', tab: 'tools', short: 'Git', color: '#f05033' },
    { name: 'GitHub', level: 90, group: 'tooling', tab: 'tools', short: 'GH', color: '#e8ecf4' },
    { name: 'Vite', level: 91, group: 'tooling', tab: 'tools', short: 'Vt', color: '#bd34fe' },
    { name: 'Node.js', level: 78, group: 'tooling', tab: 'tools', short: 'Nd', color: '#5fa04e' },
    { name: 'Expo', level: 80, group: 'tooling', tab: 'tools', short: 'Ex', color: '#e8ecf4' },
    { name: 'Turborepo', level: 75, group: 'tooling', tab: 'tools', short: 'Tb', color: '#ef4444' },
    { name: 'TanStack Query', level: 84, group: 'tooling', tab: 'tools', short: 'TQ', color: '#ff4154' },
    { name: 'Zustand', level: 82, group: 'tooling', tab: 'tools', short: 'Zu', color: '#f59e0b' },
    { name: 'Zod', level: 85, group: 'tooling', tab: 'tools', short: 'Zod', color: '#3068b7' },
    { name: 'Netlify', level: 86, group: 'tooling', tab: 'tools', short: 'Nt', color: '#00c7b7' },
    { name: 'VS Code', level: 92, group: 'tooling', tab: 'tools', short: 'VSC', color: '#007acc' },
    { name: 'Figma', level: 74, group: 'tooling', tab: 'tools', short: 'Fig', color: '#f24e1e' },
  ],

  experience: [
    {
      id: 'exp-frontend',
      role: { uz: 'Frontend Developer', en: 'Frontend Developer' },
      company: 'Freelance',
      period: { uz: 'Sentyabr 2025 — hozir', en: 'September 2025 — present' },
      description: {
        uz: 'Mijoz talablariga mos piksel-aniq interfeyslarni React va TypeScript bilan ishlab chiqaman. Firebase (Auth, Firestore, Storage) integratsiyasi orqali real vaqtda ishlovchi funksiyalarni joriy etdim, Framer Motion bilan foydalanuvchi tajribasini yaxshilovchi animatsiyalar qoʻshdim.',
        en: 'I build pixel-accurate interfaces to client requirements with React and TypeScript. Shipped realtime features through Firebase (Auth, Firestore, Storage) and added motion with Framer Motion to sharpen the user experience.',
      },
      stack: ['React', 'TypeScript', 'Firebase', 'Framer Motion'],
    },
    {
      id: 'exp-monorepo',
      role: { uz: 'Mustaqil loyihalar', en: 'Personal projects' },
      company: 'GitHub',
      period: { uz: '2025 — hozir', en: '2025 — present' },
      description: {
        uz: 'Monorepo arxitekturasini amalda oʻrgandim: KidsWear va ATOYO loyihalarida veb va mobil ilova bitta kod bazasidan chiqadi. Zod bilan yagona domen modeli, TanStack Query bilan server holati, Turborepo bilan build orkestratsiyasi.',
        en: 'Learned monorepo architecture in practice: on KidsWear and ATOYO the web and mobile apps ship from one codebase. A single Zod-defined domain model, server state via TanStack Query, build orchestration with Turborepo.',
      },
      stack: ['React Native', 'Expo', 'Turborepo', 'TanStack Query'],
    },
    {
      id: 'exp-proteach',
      role: { uz: 'Frontend yoʻnalishi talabasi', en: 'Frontend student' },
      company: 'Pro Teach',
      period: { uz: 'Sentyabr 2024 — Avgust 2025', en: 'September 2024 — August 2025' },
      description: {
        uz: 'Oʻquv markazda avval kompyuter savodxonligini, keyin frontend dasturlashni oʻrgandim. Shu yerda HTML, CSS, JavaScript va Reactni noldan oʻzlashtirdim.',
        en: 'Studied computer literacy and then frontend development at the training centre. This is where I picked up HTML, CSS, JavaScript and React from scratch.',
      },
      stack: ['HTML', 'CSS', 'JavaScript', 'React'],
    },
  ],

  // `href: null` renders the handle as plain text instead of a dead link — fill in
  // the real profile URL and it turns into a link with no component change.
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/Abdulmajidkhan007',
      handle: '@Abdulmajidkhan007',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/abdulmajid-sharipov-profile',
      handle: '/in/abdulmajid-sharipov-profile',
    },
    {
      label: 'Telefon',
      href: 'tel:+998908545603',
      handle: '+998 90 854 56 03',
    },
    {
      label: 'Email',
      href: 'mailto:abdulmajidsharipovlc@gmail.com',
      handle: 'abdulmajidsharipovlc@gmail.com',
    },
  ],
}

export const projectCategories = ['all', 'web', '3d', 'mobile', 'tool'] as const
export type ProjectFilter = (typeof projectCategories)[number]
