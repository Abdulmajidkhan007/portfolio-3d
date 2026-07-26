import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/**
 * Installs Lenis smooth scrolling and drives it from the GSAP ticker so
 * ScrollTrigger and Lenis never disagree about the scroll position.
 * Mount once, at the app root.
 */
export function useLenis() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native momentum scrolling on touch feels better than an emulated one.
      syncTouch: false,
      touchMultiplier: 1.6,
    })
    lenis = instance

    const onScroll = () => ScrollTrigger.update()
    instance.on('scroll', onScroll)

    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      instance.off('scroll', onScroll)
      instance.destroy()
      lenis = null
    }
  }, [reducedMotion])
}

/** Scrolls to a section id, falling back to native scrolling without Lenis. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return

  if (lenis) {
    lenis.scrollTo(target, { offset: -72, duration: 1.2 })
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Lenis must be stopped while the loading screen and mobile menu are open. */
export function setScrollLocked(locked: boolean) {
  if (locked) {
    lenis?.stop()
    document.body.style.overflow = 'hidden'
  } else {
    lenis?.start()
    document.body.style.overflow = ''
  }
}
