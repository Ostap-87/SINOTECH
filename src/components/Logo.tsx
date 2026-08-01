import { useEffect, useState } from 'react'
import { LogoMark } from './LogoMark'
import { ShimmerText } from './ShimmerText'

/** Below this width the enlarged homepage logo would overflow the header
 * next to the mobile menu button, so it falls back to the compact size. */
const SMALL_SCREEN_QUERY = '(max-width: 639px)'

function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(SMALL_SCREEN_QUERY).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(SMALL_SCREEN_QUERY)
    const onChange = () => setIsSmall(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isSmall
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const isSmallScreen = useIsSmallScreen()
  const large = !compact && !isSmallScreen

  return (
    <span
      className={`flex shrink-0 items-center whitespace-nowrap font-semibold tracking-[-0.02em] text-bone-white ${
        large ? 'gap-2.5 text-[24px]' : 'gap-2 text-base'
      }`}
    >
      <LogoMark size={large ? 82 : 40} />
      <ShimmerText text="GLOBAL TECH TOUR" />
    </span>
  )
}
