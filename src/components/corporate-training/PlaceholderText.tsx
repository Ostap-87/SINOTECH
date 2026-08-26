import { PLACEHOLDER } from '@/data/corporateTraining'

/** Renders text that may contain the "[уточнить]" marker, highlighting the
 * marker itself so unfilled fields are easy to spot on the live page
 * rather than reading like real, final copy. */
export function PlaceholderText({ text }: { text: string }) {
  if (!text.includes(PLACEHOLDER)) return <>{text}</>
  const parts = text.split(PLACEHOLDER)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="rounded border border-dashed border-saffron-spark/60 px-1.5 py-0.5 text-xs font-semibold text-saffron-spark">
              {PLACEHOLDER}
            </span>
          )}
        </span>
      ))}
    </>
  )
}
