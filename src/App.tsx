import { Routes, Route, Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { Home } from '@/pages/Home'
import { Industries } from '@/pages/Industries'
import { Tours } from '@/pages/Tours'
import { Cases } from '@/pages/Cases'
import { Contacts } from '@/pages/Contacts'

function LocaleToggle() {
  const { locale, toggleLocale } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
    >
      {locale === 'ru' ? 'EN' : 'RU'}
    </button>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-bone-white">
      <header className="flex items-center justify-between px-6 py-6">
        <Link to="/" className="text-sm font-semibold tracking-[-0.02em]">
          Sinotech Voyage
        </Link>
        <LocaleToggle />
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </main>
    </div>
  )
}
