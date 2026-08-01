export function ShimmerText({
  text,
  className,
  delayStep = 0.06,
  variant = 'iris',
}: {
  text: string
  className?: string
  delayStep?: number
  variant?: 'iris' | 'saffron'
}) {
  const letterClass = variant === 'saffron' ? 'eyebrow-letter' : 'logo-letter'
  return (
    <span className={className}>
      {[...text].map((char, i) =>
        char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span key={i} className={letterClass} style={{ animationDelay: `${i * delayStep}s` }}>
            {char}
          </span>
        ),
      )}
    </span>
  )
}
