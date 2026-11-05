import { ASSETS } from '../config'
import { useOceanStrings } from '../hooks/useOceanStrings'

interface Props {
  reason: 'webgl' | 'error'
}

/**
 * What a device without WebGL — or one whose context failed — gets instead of
 * the scene: a still of it, and a way back.
 */
export default function OceanFallback({ reason }: Props) {
  const copy = useOceanStrings()

  return (
    <div className="absolute inset-0 flex items-end justify-center bg-bg">
      <img
        src={ASSETS.poster}
        alt={copy.posterAlt}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div className="relative m-4 mb-8 max-w-md rounded-2xl border border-line bg-surface/85 p-5 text-center text-ink shadow-xl backdrop-blur-md">
        <p className="font-display text-lg font-semibold">
          {reason === 'webgl' ? copy.noWebglTitle : copy.errorTitle}
        </p>
        <p className="mt-2 text-sm text-muted">{copy.noWebglBody}</p>
      </div>
    </div>
  )
}
