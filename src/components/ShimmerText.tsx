export function ShimmerText({
  text,
  className,
  delayStep = 0.06,
}: {
  text: string
  className?: string
  delayStep?: number
}) {
  return (
    <span className={className}>
      {[...text].map((char, i) =>
        char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span key={i} className="logo-letter" style={{ animationDelay: `${i * delayStep}s` }}>
            {char}
          </span>
        ),
      )}
    </span>
  )
}
