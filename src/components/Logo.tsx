import { LogoMark } from './LogoMark'
import { ShimmerText } from './ShimmerText'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center whitespace-nowrap font-semibold tracking-[-0.02em] text-bone-white ${
        compact ? 'gap-2 text-base' : 'gap-2.5 text-[24px]'
      }`}
    >
      <LogoMark size={compact ? 40 : 82} />
      <ShimmerText text="GLOBAL TECH TOUR" />
    </span>
  )
}
