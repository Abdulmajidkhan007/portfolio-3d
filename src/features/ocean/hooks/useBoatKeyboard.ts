import { useEffect } from 'react'
import type { BoatInput } from '../lib/boatInput'

const AHEAD = new Set(['KeyW', 'ArrowUp'])
const ASTERN = new Set(['KeyS', 'ArrowDown'])
const PORT = new Set(['KeyA', 'ArrowLeft'])
const STARBOARD = new Set(['KeyD', 'ArrowRight'])
const STEERING = new Set([...AHEAD, ...ASTERN, ...PORT, ...STARBOARD])

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const anyHeld = (held: Set<string>, keys: Set<string>): boolean => {
  for (const key of keys) if (held.has(key)) return true
  return false
}

/**
 * WASD / arrow keys into `input`, plus `C` for the camera toggle. Keys are
 * matched by `code` so the layout (QWERTY, ЙЦУКЕН) does not matter.
 */
export function useBoatKeyboard(input: BoatInput, onToggleCamera: () => void): void {
  useEffect(() => {
    const held = new Set<string>()

    const publish = () =>
      input.setKeyboard({
        throttle: Number(anyHeld(held, AHEAD)) - Number(anyHeld(held, ASTERN)),
        steer: Number(anyHeld(held, STARBOARD)) - Number(anyHeld(held, PORT)),
      })

    const onDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.code === 'KeyC' && !event.repeat) {
        onToggleCamera()
        return
      }
      if (!STEERING.has(event.code)) return
      // Arrow keys would otherwise scroll the page under the canvas.
      event.preventDefault()
      held.add(event.code)
      publish()
    }

    const onUp = (event: KeyboardEvent) => {
      if (!held.delete(event.code)) return
      publish()
    }

    // A key released while the window is unfocused never sends keyup; without
    // this the boat would keep sailing on its own.
    const onBlur = () => {
      held.clear()
      publish()
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [input, onToggleCamera])
}
