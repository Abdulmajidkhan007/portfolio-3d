export const uz = {
  meta: {
    title: 'Abdulmajid Sharipov | Frontend Developer &amp; 3D Enthusiast',
    description:
      'Zamonaviy veb-ilovalar va 3D tajribalar yaratuvchi frontend dasturchi. React, TypeScript, Three.js va WebGL.',
  },

  nav: {
    home: 'Bosh sahifa',
    about: 'Men haqimda',
    projects: 'Loyihalar',
    skills: 'Koʻnikmalar',
    experience: 'Tajriba',
    contact: 'Bogʻlanish',
    menu: 'Menyu',
    close: 'Yopish',
    switchLanguage: 'Tilni almashtirish',
    switchTheme: 'Mavzuni almashtirish',
  },

  loading: {
    booting: 'Tizim ishga tushmoqda',
    ready: 'Tayyor',
    hint: 'Yuklanmoqda…',
  },

  hero: {
    greeting: 'Salom, men',
    scroll: 'Pastga suring',
    cta: 'Mening ishlarimni koʻrish',
    ctaSecondary: 'Bogʻlanish',
    available: 'Yangi loyihalar uchun ochiqman',
  },

  about: {
    eyebrow: '01 / Men haqimda',
    title: 'Kod va vizual tajriba oraligʻida',
    skillsTitle: 'Asosiy koʻnikmalar',
    skillsHint: 'Ikonka ustiga bosing yoki suring',
    avatarBadge: 'AI avatar',
    resume: 'Rezyumeni yuklab olish',
  },

  projects: {
    eyebrow: '02 / Loyihalar',
    title: 'Tanlangan ishlar',
    subtitle: 'Har biri alohida muammoni yechish uchun qurilgan.',
    filters: {
      all: 'Barchasi',
      web: 'Veb',
      '3d': '3D',
      mobile: 'Mobil',
      tool: 'Asboblar',
    },
    live: 'Jonli koʻrish',
    app: 'Ilovani yuklab olish',
    code: 'Kod',
    details: 'Batafsil',
    featured: 'Tanlangan',
    empty: 'Bu kategoriyada loyiha yoʻq.',
  },

  skills: {
    eyebrow: '03 / Koʻnikmalar',
    title: 'Texnologiyalar sferasi',
    subtitle: 'Sferani aylantiring yoki koʻnikma ustiga bosing.',
    hint: 'Sudrab aylantiring',
    groups: {
      core: 'Asosiy',
      threed: '3D va animatsiya',
      tooling: 'Asboblar',
    },
    tabs: {
      skills: 'Koʻnikmalar',
      tools: 'Asboblar',
    },
  },

  experience: {
    eyebrow: '04 / Tajriba',
    title: 'Yoʻlim',
    stack: 'Stack',
  },

  contact: {
    eyebrow: '05 / Bogʻlanish',
    title: 'Keling, birga ishlaymiz',
    subtitle: 'Loyihangiz haqida yozing — 24 soat ichida javob beraman.',
    name: 'Ismingiz',
    namePlaceholder: 'Ism Familya',
    email: 'Email',
    emailPlaceholder: 'siz@example.com',
    phone: 'Telefon (ixtiyoriy)',
    phonePlaceholder: '+998 90 123 45 67',
    message: 'Xabar',
    messagePlaceholder: 'Loyihangiz haqida qisqacha…',
    submit: 'Yuborish',
    sending: 'Yuborilmoqda…',
    successTitle: 'Xabar yuborildi',
    successBody: 'Rahmat! Tez orada javob beraman.',
    sendAnother: 'Yana yuborish',
    errorGeneric: 'Xabar yuborilmadi. Iltimos, qayta urinib koʻring',
    errorFallback: 'yoki Telegramda yozing:',
    errors: {
      nameRequired: 'Ismingizni kiriting',
      emailRequired: 'Emailingizni kiriting',
      emailInvalid: 'Email notoʻgʻri koʻrinadi',
      phoneInvalid: 'Telefon raqami notoʻgʻri',
      messageRequired: 'Xabar yozing',
      messageShort: 'Kamida 10 ta belgi kiriting',
    },
    directTitle: 'Toʻgʻridan-toʻgʻri',
  },

  footer: {
    tagline: 'React, Three.js va juda koʻp qahva bilan qurilgan.',
    rights: 'Barcha huquqlar himoyalangan.',
    backToTop: 'Yuqoriga',
  },
}

/** The Uzbek dictionary defines the shape; every other language must satisfy it. */
export type Dictionary = typeof uz
