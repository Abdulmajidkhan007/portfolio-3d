export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/**
 * Frame-rate independent smoothing factor for `lerp(current, target, factor)`.
 * A plain constant factor would make the camera twice as stiff at 120 Hz.
 */
export const damp = (stiffness: number, dt: number): number => 1 - Math.exp(-stiffness * dt)

/** Wraps an angle into (-PI, PI]. */
export const wrapAngle = (angle: number): number => {
  const tau = Math.PI * 2
  const wrapped = ((((angle + Math.PI) % tau) + tau) % tau) - Math.PI
  return wrapped === -Math.PI ? Math.PI : wrapped
}
