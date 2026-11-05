import type { Lang } from '@/types'

/**
 * Strings for the 3D Lab. They live with the feature rather than in the site
 * dictionaries so the portfolio bundle does not carry them. Uzbek defines the
 * shape; English must match it.
 */
const uz = {
  title: 'Okean',
  pageTitle: '3D Lab · Okean | Abdulmajid Sharipov',
  back: 'Portfolioga qaytish',
  loading: 'Okean yuklanmoqda…',
  cameraFollow: 'Kuzatuvchi kamera',
  cameraFree: 'Erkin kamera',
  cameraToggle: 'Kamera rejimini almashtirish (C)',
  helpTitle: 'Boshqaruv',
  helpShow: 'Yoʻriqnoma',
  helpHide: 'Yoʻriqnomani yopish',
  keysMove: 'W / ↑ — oldinga, S / ↓ — orqaga',
  keysSteer: 'A / ← va D / → — burilish',
  keysCamera: 'C — kamera rejimi',
  keysOrbit: 'Erkin kamera: sichqoncha bilan aylantiring, gʻildirak — masofa',
  touchMove: 'Joystik: yuqoriga — oldinga, chap/oʻng — burilish',
  touchOrbit: 'Erkin kamera: barmoq bilan aylantiring, ikki barmoq — masofa',
  joystick: 'Qayiq boshqaruvi joystigi',
  reducedMotion: 'Kam harakat rejimi: toʻlqinlar sokin',
  liteMode: 'Yengil grafika rejimi',
  noWebglTitle: 'Brauzeringiz 3D sahnani chiqara olmaydi',
  errorTitle: '3D sahna ishga tushmadi',
  noWebglBody: 'Bu — sahnaning surati. WebGL ishlaydigan brauzerda oching.',
  posterAlt: 'Orol yonida suzayotgan qayiq — okean sahnasining surati',
}

export type OceanStrings = typeof uz

const en: OceanStrings = {
  title: 'Ocean',
  pageTitle: '3D Lab · Ocean | Abdulmajid Sharipov',
  back: 'Back to portfolio',
  loading: 'Loading the ocean…',
  cameraFollow: 'Follow camera',
  cameraFree: 'Free camera',
  cameraToggle: 'Switch camera mode (C)',
  helpTitle: 'Controls',
  helpShow: 'Controls',
  helpHide: 'Hide controls',
  keysMove: 'W / ↑ — ahead, S / ↓ — astern',
  keysSteer: 'A / ← and D / → — steer',
  keysCamera: 'C — camera mode',
  keysOrbit: 'Free camera: drag to orbit, wheel to zoom',
  touchMove: 'Joystick: up for ahead, left/right to steer',
  touchOrbit: 'Free camera: drag to orbit, pinch to zoom',
  joystick: 'Boat control joystick',
  reducedMotion: 'Reduced motion: calm sea',
  liteMode: 'Lite graphics mode',
  noWebglTitle: 'Your browser cannot show the 3D scene',
  errorTitle: 'The 3D scene failed to start',
  noWebglBody: 'This is a still of the scene. Open it in a browser with WebGL.',
  posterAlt: 'A rowing boat off a small island — still of the ocean scene',
}

export const oceanStrings: Record<Lang, OceanStrings> = { uz, en }
