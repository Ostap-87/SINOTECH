import { LogoMark } from './LogoMark'
import { ShimmerText } from './ShimmerText'

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[24px] font-semibold tracking-[-0.02em] text-bone-white">
      <LogoMark size={82} />
      <ShimmerText text="GLOBAL TECH TOUR" />
    </span>
  )
}
