import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { companiesData, toursData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'

const EXIT_TRANSITION_MS = 900

export function Home() {
  const { locale } = useLanguage()
  const { counts } = companiesData.meta
  const tour = toursData.tours[0]
  const navigate = useNavigate()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  function handleIndustriesClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (open in new tab, etc.) behave normally.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      navigate('/industries')
      return
    }

    setIsLeaving(true)
    canvasHandleRef.current?.disperse(EXIT_TRANSITION_MS)
    setTimeout(() => navigate('/industries'), EXIT_TRANSITION_MS)
  }

  return (
    <section className="relative min-h-[920px] overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape="china" />
      </div>

      <div
        className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-16 transition-opacity duration-700 lg:py-24"
        style={{ opacity: isLeaving ? 0 : 1 }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
          {locale === 'ru' ? 'Бизнес-экспедиции в Китай и не только' : 'Business expeditions to China and beyond'}
        </p>
        <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
          {locale === 'ru'
            ? 'Приветствуем, какую индустрию хотели бы изучить?'
            : 'Welcome — which industry would you like to explore?'}
        </h1>
        <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
          {locale === 'ru'
            ? 'Sinotech Voyage · by Aura Robotics — закрытые визиты на производства лидеров индустрии Китая.'
            : 'Sinotech Voyage · by Aura Robotics — private visits to the production sites of China’s industry leaders.'}
        </p>

        <Link
          to="/industries"
          onClick={handleIndustriesClick}
          className="pointer-events-auto mt-10 inline-block w-fit rounded-[24px] bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {locale === 'ru' ? 'Индустрии' : 'Industries'}
        </Link>

        <dl className="mt-16 grid max-w-xl grid-cols-3 gap-8 border-t border-black/10 pt-8 text-sm text-ash-gray">
          <div>
            <dt>{locale === 'ru' ? 'компаний в каталоге' : 'companies in catalogue'}</dt>
            <dd className="mt-1 text-2xl font-semibold text-bone-white">
              {Math.floor(counts.companies / 50) * 50}+
            </dd>
          </div>
          <div>
            <dt>{locale === 'ru' ? 'отраслей' : 'sectors'}</dt>
            <dd className="mt-1 text-2xl font-semibold text-bone-white">{counts.sectors}</dd>
          </div>
          <div>
            <dt>{locale === 'ru' ? 'готовый тур' : 'ready-made tour'}</dt>
            <dd className="mt-1 text-2xl font-semibold text-bone-white">
              {locale === 'ru' ? tour.title_ru : tour.title_en}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
