/**
 * The site has no router: one page plus the 3D Lab. Paths live here so the
 * navbar can link to the lab without importing any of it.
 */
export const OCEAN_PATH = '/ocean'

export const isOceanPath = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '') === OCEAN_PATH
