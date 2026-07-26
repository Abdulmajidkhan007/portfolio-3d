import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Shared ScrollTrigger config: play once when the section enters the viewport. */
export const revealTrigger = (trigger: Element | string) => ({
  trigger,
  start: 'top 78%',
  toggleActions: 'play none none none' as const,
})

/** Fades an element up into place when its section scrolls in. */
export function fadeUp(
  target: gsap.TweenTarget,
  trigger: Element | string,
  { delay = 0, y = 36, duration = 0.85 } = {},
) {
  return gsap.from(target, {
    opacity: 0,
    y,
    duration,
    delay,
    ease: 'power3.out',
    scrollTrigger: revealTrigger(trigger),
  })
}

/** Same as fadeUp, but staggered across a list of children. */
export function staggerUp(
  targets: gsap.TweenTarget,
  trigger: Element | string,
  { stagger = 0.09, y = 30, duration = 0.7 } = {},
) {
  return gsap.from(targets, {
    opacity: 0,
    y,
    duration,
    stagger,
    ease: 'power3.out',
    scrollTrigger: revealTrigger(trigger),
  })
}

/**
 * Splits a text node into word spans and reveals them in sequence.
 * Returns a restore function so the original markup can be put back.
 */
export function revealWords(element: HTMLElement, trigger: Element | string, stagger = 0.03) {
  const original = element.innerHTML
  const words = (element.textContent ?? '').split(/(\s+)/)

  element.innerHTML = words
    .map((word) =>
      word.trim() === ''
        ? word
        : `<span class="inline-block will-change-transform" data-word>${word}</span>`,
    )
    .join('')

  const tween = gsap.from(element.querySelectorAll('[data-word]'), {
    opacity: 0,
    y: '0.5em',
    duration: 0.6,
    stagger,
    ease: 'power2.out',
    scrollTrigger: revealTrigger(trigger),
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    element.innerHTML = original
  }
}

/**
 * Counts a number up from zero. Used by the About stats.
 * Non-numeric prefixes/suffixes (e.g. "40+") are preserved.
 */
export function countUp(element: HTMLElement, trigger: Element | string) {
  const raw = element.textContent ?? ''
  const match = raw.match(/(\d+)/)
  if (!match) return
  const value = Number(match[1])
  const counter = { current: 0 }

  gsap.to(counter, {
    current: value,
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: revealTrigger(trigger),
    onUpdate: () => {
      element.textContent = raw.replace(/\d+/, String(Math.round(counter.current)))
    },
  })
}
