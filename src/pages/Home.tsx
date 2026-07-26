import { useLanguage } from '@/i18n/LanguageContext'
import { companiesData, toursData } from '@/data'

export function Home() {
  const { locale } = useLanguage()
  const { counts } = companiesData.meta
  const tour = toursData.tours[0]

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[1280px] flex-col justify-center px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
        {locale === 'ru' ? 'Бизнес-делегации в Китай' : 'Business delegations to China'}
      </p>
      <h1 className="mt-6 max-w-3xl text-[42px] font-normal leading-[1.02] tracking-[-0.04em] sm:text-[64px] lg:text-[78px]">
        {locale === 'ru'
          ? 'Приветствуем, какую индустрию хотели бы изучить?'
          : 'Welcome — which industry would you like to explore?'}
      </h1>
      <p className="mt-6 max-w-xl text-lg font-extralight text-silver-mist">
        {locale === 'ru'
          ? 'Sinotech Voyage · by Aura Robotics — закрытые визиты на производства лидеров индустрии Китая.'
          : 'Sinotech Voyage · by Aura Robotics — private visits to the production sites of China’s industry leaders.'}
      </p>

      <button
        type="button"
        className="mt-10 w-fit rounded-[24px] bg-electric-iris px-6 py-3 text-sm font-medium text-bone-white transition-opacity hover:opacity-90"
      >
        {locale === 'ru' ? 'Индустрии' : 'Industries'}
      </button>

      <dl className="mt-20 grid max-w-xl grid-cols-3 gap-8 border-t border-white/10 pt-8 text-sm text-ash-gray">
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
    </section>
  )
}
