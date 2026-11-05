import type { BoatControls } from '../types'
import { clamp } from './math'

/**
 * Collects controls from every source (keyboard, on-screen joystick) without
 * going through React state: the boat reads it once per frame, and a re-render
 * per key press would be wasted work.
 */
export class BoatInput {
  private keyboard: BoatControls = { throttle: 0, steer: 0 }
  private touch: BoatControls = { throttle: 0, steer: 0 }

  setKeyboard(controls: BoatControls): void {
    this.keyboard = controls
  }

  setTouch(controls: BoatControls): void {
    this.touch = controls
  }

  reset(): void {
    this.keyboard = { throttle: 0, steer: 0 }
    this.touch = { throttle: 0, steer: 0 }
  }

  read(): BoatControls {
    return {
      throttle: clamp(this.keyboard.throttle + this.touch.throttle, -1, 1),
      steer: clamp(this.keyboard.steer + this.touch.steer, -1, 1),
    }
  }
}
