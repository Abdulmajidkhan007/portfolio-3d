/** Fog and output chunks every custom material here shares, so it fades into the scene's fog. */
export const FOG_VERTEX_PARS = '#include <fog_pars_vertex>'
export const FOG_FRAGMENT_PARS = '#include <fog_pars_fragment>'
export const FRAGMENT_OUTPUT = `#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>`
