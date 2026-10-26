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
// Har loyihaning to'liq tavsifi profil reposida yuritiladi — kartada qisqasi.
const DOCS = 'https://github.com/Abdulmajidkhan007/Abdulmajidkhan007/blob/main/docs'

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
    resume: '/Abdulmajid_Sharipov_Frontend_CV.pdf',
    avatarImage: null,
    // No generated portrait: a photoreal AI face reads as a picture of a real
    // person, which this is not. The 3D neon avatar renders instead (2026-10-09).
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
    // Faqat tekshirsa bo'ladigan raqamlar (2026-10-26): dasturlash 2024-yil
    // sentyabrdan (Pro Teach); jonli saytlar — Organick, Lumina, KidsWear,
    // Suhbat (veb), shu sayt (atoyo.uz 2026-10-26 da to'xtatildi); botlar —
    // telegram-bots reposi; real do'kon — atoyo.uz (oktabrgacha ishlatilgan).
    stats: [
      { value: '2', label: { uz: 'yil dasturlashda', en: 'years of coding' } },
      { value: '5', label: { uz: 'jonli sayt', en: 'live websites' } },
      { value: '15', label: { uz: 'Telegram bot', en: 'Telegram bots' } },
      { value: '1', label: { uz: 'real doʻkonda ishlatilgan', en: 'real store used it' } },
    ],
  },

  projects: [
    {
      id: 'atoyo',
      title: 'ATOYO Santexnika',
      description: {
        uz: 'Qoʻqondagi santexnika doʻkonida ishlatilgan (2026-yil oktabrgacha; hozir server xarajati sababli toʻxtatilgan, kod ochiq): Next.js 16 sayti, React Native ilovasi, desktop va doʻkon TV ekrani bitta Firestore bazasida. Buyurtmalar Telegram guruhida boshqariladi, eʼlonlar (broadcast) bot, email va kanal orqali tarqatiladi; typo-tolerant qidiruv, ikki qatlamli himoyalangan admin panel.',
        en: 'Used at a plumbing store in Qoqon until October 2026 (paused now over server costs; the code is open): a Next.js 16 site, a React Native app, a desktop app and an in-store TV screen on one Firestore database. Orders are handled in a Telegram group, announcements are broadcast over the bot, email and channel; typo-tolerant search and an admin panel behind two authorisation layers.',
      },
      category: 'web',
      platform: { uz: 'Ilova + Veb', en: 'App + Web' },
      tags: ['Next.js 16', 'React Native', 'Firebase', 'Telegram API'],
      // The APK link lands here once the CI publishes a Release (see the repo).
      image: '/images/projects/project-1.svg',
      imageHd: '/images/projects/project-1.webp',
      // `app` goes here once the build has a store page or a release to link to.
      repo: 'https://github.com/Abdulmajidkhan007/atoyo-e-commerce',
      details: `${DOCS}/atoyo-e-commerce.md`,
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
      live: 'https://lumina-007app.web.app',
      repo: 'https://github.com/Abdulmajidkhan007/lumina',
      details: `${DOCS}/lumina.md`,
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
      live: 'https://organick-e1c5a.web.app',
      repo: 'https://github.com/Abdulmajidkhan007/Organick_org',
      details: `${DOCS}/organick_org.md`,
      year: 2026,
    },
    {
      id: 'telegram-bots',
      title: 'Telegram Bots',
      description: {
        uz: '15 ta bot bitta monorepoda, bitta buyruq bilan ishga tushadi: spam filtri, video yuklovchi, virus tekshiruvi, xarajat hisobi (ovozli xabar ham), Gemini bilan savol-javob va IT testlari. Har commitdan oldin testlar va kalit skaneri.',
        en: '15 bots in one monorepo, started with a single command: spam filter, video downloader, virus check, expense tracker (voice messages too), Gemini Q&A and IT quizzes. Tests and a secret scanner run before every commit.',
      },
      category: 'tool',
      tags: ['Node.js', 'Python', 'aiogram 3', 'Gemini API'],
      image: '/images/projects/project-2.svg',
      repo: 'https://github.com/Abdulmajidkhan007/telegram-bots',
      details: `${DOCS}/telegram-bots.md`,
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
      live: 'https://abdulmajidkhan-portfolio.web.app',
      details: `${DOCS}/portfolio-3d.md`,
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
    { name: 'Git', level: 88, group: 'tooling', tab: 'tools', short: 'Git', color: '#f05033' },
    { name: 'GitHub', level: 90, group: 'tooling', tab: 'tools', short: 'GH', color: '#e8ecf4' },
    { name: 'Vite', level: 91, group: 'tooling', tab: 'tools', short: 'Vt', color: '#bd34fe' },
    { name: 'Node.js', level: 78, group: 'tooling', tab: 'tools', short: 'Nd', color: '#5fa04e' },
    { name: 'Expo', level: 80, group: 'tooling', tab: 'tools', short: 'Ex', color: '#e8ecf4' },
    { name: 'Turborepo', level: 75, group: 'tooling', tab: 'tools', short: 'Tb', color: '#ef4444' },
    { name: 'TanStack Query', level: 84, group: 'tooling', tab: 'tools', short: 'TQ', color: '#ff4154' },
    { name: 'Zustand', level: 82, group: 'tooling', tab: 'tools', short: 'Zu', color: '#f59e0b' },
    { name: 'Zod', level: 85, group: 'tooling', tab: 'tools', short: 'Zod', color: '#3068b7' },
    { name: 'Cloud Functions', level: 80, group: 'tooling', tab: 'tools', short: 'CF', color: '#ffa000' },
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
      stack: ['React Native', 'Zod', 'Turborepo', 'TanStack Query'],
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
      label: 'Telegram',
      href: 'https://t.me/Abdulloh_77700',
      handle: '@Abdulloh_77700',
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
