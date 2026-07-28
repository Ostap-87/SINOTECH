import { LogoMark } from './LogoMark'
import { ShimmerText } from './ShimmerText'

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-bone-white">
      <LogoMark size={48} />
      <ShimmerText text="SINOTECH VOYAGE" />
    </span>
  )
}
