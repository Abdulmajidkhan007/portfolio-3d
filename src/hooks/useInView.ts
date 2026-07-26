import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Start observing this far outside the viewport. */
  rootMargin?: string
  threshold?: number
  /** Stop observing after the first intersection. */
  once?: boolean
}

/**
 * IntersectionObserver as a hook. Used to defer mounting 3D canvases and to
 * pause their render loop once they scroll away.
 */
export function useInView<T extends Element = HTMLDivElement>({
  rootMargin = '200px',
  threshold = 0,
  once = false,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}
