/**
 * Static stand-ins for the WebGL scenes.
 *
 * These live outside the lazily-imported three/ modules on purpose: they have
 * to render *before* anything pulls in the WebGL bundle, and while a visitor
 * who prefers reduced motion never pulls it in at all.
 */

export function ParticleFallback() {
  return (
    <div className="h-full w-full bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(0,255,136,0.12),transparent_70%),radial-gradient(ellipse_50%_40%_at_70%_60%,rgba(0,212,255,0.1),transparent_70%)]" />
  )
}

export function AvatarFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-48 w-48 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(0,255,136,0.35),rgba(0,212,255,0.18)_45%,transparent_70%)] ring-1 ring-neon/30" />
    </div>
  )
}

export function SphereFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="aspect-square w-4/5 rounded-full border border-cyan/15 bg-[radial-gradient(circle_at_50%_45%,rgba(0,255,136,0.08),transparent_65%)]" />
    </div>
  )
}
