import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { companiesData, toursData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'

export function Home() {
  const { locale } = useLanguage()
  const { counts } = companiesData.meta
  const tour = toursData.tours[0]

  return (
    <section className="relative min-h-[920px] overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0">
        <ParticleCanvas shape="china" />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-16 lg:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
          {locale === 'ru' ? 'Бизнес-делегации в Китай' : 'Business delegations to China'}
        </p>
        <h1 className="mt-6 max-w-2xl text-[42px] font-normal leading-[1.02] tracking-[-0.04em] sm:text-[56px] lg:text-[64px]">
          {locale === 'ru'
            ? 'Приветствуем, какую индустрию хотели бы изучить?'
            : 'Welcome — which industry would you like to explore?'}
        </h1>
        <p className="mt-6 max-w-xl text-lg font-extralight text-silver-mist">
          {locale === 'ru'
            ? 'Sinotech Voyage · by Aura Robotics — закрытые визиты на производства лидеров индустрии Китая.'
            : 'Sinotech Voyage · by Aura Robotics — private visits to the production sites of China’s industry leaders.'}
        </p>

        <Link
          to="/industries"
          className="pointer-events-auto mt-10 inline-block w-fit rounded-[24px] bg-electric-iris px-6 py-3 text-sm font-medium text-bone-white transition-opacity hover:opacity-90"
        >
          {locale === 'ru' ? 'Индустрии' : 'Industries'}
        </Link>

        <dl className="mt-16 grid max-w-xl grid-cols-3 gap-8 border-t border-white/10 pt-8 text-sm text-ash-gray">
          <div>
            <dt>{locale === 'ru' ? 'компаний в каталоге' : 'companies in catalogue'}</dt>
            <dd className="mt-1 text-2xl font-normal text-bone-white">{counts.companies}</dd>
          </div>
          <div>
            <dt>{locale === 'ru' ? 'отраслей' : 'sectors'}</dt>
            <dd className="mt-1 text-2xl font-normal text-bone-white">{counts.sectors}</dd>
          </div>
          <div>
            <dt>{locale === 'ru' ? 'готовый тур' : 'ready-made tour'}</dt>
            <dd className="mt-1 text-2xl font-normal text-bone-white">
              {locale === 'ru' ? tour.title_ru : tour.title_en}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
