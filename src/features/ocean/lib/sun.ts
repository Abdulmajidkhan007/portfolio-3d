import { MathUtils, Vector3 } from 'three'
import { SUN } from '../config'

/** Unit vector pointing from the scene towards the sun. */
export function sunDirection(): Vector3 {
  const phi = MathUtils.degToRad(90 - SUN.elevation)
  const theta = MathUtils.degToRad(SUN.azimuth)
  return new Vector3().setFromSphericalCoords(1, phi, theta)
}
