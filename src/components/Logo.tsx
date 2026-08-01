import { LogoMark } from './LogoMark'
import { ShimmerText } from './ShimmerText'

export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`flex items-center font-semibold tracking-[-0.02em] text-bone-white ${
        large ? 'gap-2.5 text-[24px]' : 'gap-2 text-sm'
      }`}
    >
      <LogoMark size={large ? 82 : 48} />
      <ShimmerText text="GLOBAL TECH TOUR" />
    </span>
  )
}
