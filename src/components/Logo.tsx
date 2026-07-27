import { LogoMark } from './LogoMark'

const WORDMARK = 'SINOTECH VOYAGE'

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-bone-white">
      <LogoMark size={24} />
      <span>
        {[...WORDMARK].map((char, i) => (
          <span
            key={i}
            className="logo-letter"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </span>
  )
}
