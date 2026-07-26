import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface Options {
  typeSpeed?: number
  deleteSpeed?: number
  /** How long a completed phrase stays on screen before it is erased. */
  holdMs?: number
}

/**
 * Types the given phrases one after another, looping forever.
 * Changing `phrases` (e.g. switching language) restarts cleanly.
 */
export function useTypewriter(
  phrases: string[],
  { typeSpeed = 65, deleteSpeed = 32, holdMs = 1700 }: Options = {},
) {
  const reducedMotion = useReducedMotion()
  const [text, setText] = useState(() => (reducedMotion ? (phrases[0] ?? '') : ''))

  useEffect(() => {
    if (reducedMotion || phrases.length === 0) {
      setText(phrases[0] ?? '')
      return
    }

    let index = 0
    let charCount = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const phrase = phrases[index] ?? ''

      if (!deleting) {
        charCount += 1
        setText(phrase.slice(0, charCount))
        if (charCount === phrase.length) {
          deleting = true
          timer = setTimeout(tick, holdMs)
          return
        }
      } else {
        charCount -= 1
        setText(phrase.slice(0, charCount))
        if (charCount === 0) {
          deleting = false
          index = (index + 1) % phrases.length
        }
      }

      timer = setTimeout(tick, deleting ? deleteSpeed : typeSpeed)
    }

    setText('')
    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [phrases, reducedMotion, typeSpeed, deleteSpeed, holdMs])

  return text
}
