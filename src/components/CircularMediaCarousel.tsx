import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

export interface CaseMediaItem {
  id: string
  kind: 'photo' | 'video'
  gradient: string
  caption: string
}

const AUTO_ROTATE_SPEED = 6 // deg/s
const DRAG_SENSITIVITY = 0.35 // deg per px
const WHEEL_SENSITIVITY = 0.28 // deg per wheel-delta unit
const ITEM_W = 220
const ITEM_H = 300

function useRingRadius(count: number) {
  return useMemo(() => {
    if (count < 2) return 0
    const theta = (2 * Math.PI) / count
    // Chord between neighbours should comfortably clear the item width.
    return (ITEM_W / 2 / Math.sin(theta / 2)) * 1.18
  }, [count])
}

/**
 * Circular (ring) media carousel — items sit around a vertical-axis circle
 * (CSS 3D, not a flat strip), so the set visibly travels from one edge of
 * the screen to the other as it turns, like a rotating drum rather than a
 * sliding track. Drag or scroll to spin it; click an item to open it full
 * screen.
 */
export function CircularMediaCarousel({
  items,
  title,
  onClose,
}: {
  items: CaseMediaItem[]
  title: string
  onClose: () => void
}) {
  const radius = useRingRadius(items.length)
  const step = 360 / Math.max(items.length, 1)

  const [angle, setAngle] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const angleRef = useRef(0)
  const dragStartX = useRef(0)
  const dragStartAngle = useRef(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    angleRef.current = angle
  }, [angle])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) setLightboxIndex(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, onClose])

  useEffect(() => {
    pausedRef.current = dragging || lightboxIndex !== null
  }, [dragging, lightboxIndex])

  useEffect(() => {
    let frameId: number
    let last = performance.now()
    function tick(now: number) {
      const delta = (now - last) / 1000
      last = now
      if (!pausedRef.current) {
        angleRef.current += AUTO_ROTATE_SPEED * delta
        setAngle(angleRef.current)
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragStartX.current = e.clientX
    dragStartAngle.current = angleRef.current
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - dragStartX.current
    angleRef.current = dragStartAngle.current + dx * DRAG_SENSITIVITY
    setAngle(angleRef.current)
  }

  function onPointerUp() {
    setDragging(false)
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    angleRef.current += delta * WHEEL_SENSITIVITY
    setAngle(angleRef.current)
  }

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.025em] text-white/70">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="relative flex-1 touch-none select-none overflow-hidden"
        style={{ perspective: 1600 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius}px) rotateY(${-angle}deg)`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              onClick={() => !dragging && setLightboxIndex(i)}
              className="absolute cursor-pointer overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow hover:shadow-[0_20px_60px_rgba(56,189,248,0.35)]"
              style={{
                width: ITEM_W,
                height: ITEM_H,
                marginLeft: -ITEM_W / 2,
                marginTop: -ITEM_H / 2,
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              }}
            >
              <div className="h-full w-full" style={{ background: item.gradient }} />
              {item.kind === 'video' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                    <Play size={22} fill="currentColor" />
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                <p className="text-sm font-medium text-white">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-white/50">
        Перетащите или прокрутите колесом, чтобы повернуть карусель — нажмите на фото или видео, чтобы открыть в полном размере
      </p>

      {activeItem && (
        <div
          className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black/95 p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(null)
            }}
            className="absolute right-6 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((lightboxIndex! - 1 + items.length) % items.length)
            }}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 sm:left-8"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((lightboxIndex! + 1) % items.length)
            }}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 sm:right-8"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          <div
            className="flex max-h-[80vh] w-full max-w-3xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-2xl"
              style={{ background: activeItem.gradient }}
            >
              {activeItem.kind === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                    <Play size={32} fill="currentColor" />
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-white/80">{activeItem.caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}
