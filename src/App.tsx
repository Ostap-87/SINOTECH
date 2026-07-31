import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Industries } from '@/pages/Industries'
import { IndustryFork } from '@/pages/IndustryFork'
import { Constructor } from '@/pages/Constructor'
import { ExpeditionsReady } from '@/pages/ExpeditionsReady'
import { ExpeditionsRecommended } from '@/pages/ExpeditionsRecommended'
import { ExpeditionDetail } from '@/pages/ExpeditionDetail'
import { Blog } from '@/pages/Blog'
import { Cases } from '@/pages/Cases'
import { Faq } from '@/pages/Faq'
import { Partners } from '@/pages/Partners'
import { Consulting } from '@/pages/Consulting'
import { Contacts } from '@/pages/Contacts'
import { CountryPreview } from '@/pages/CountryPreview'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-bone-white">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/industries/:sector" element={<IndustryFork />} />
          <Route path="/constructor" element={<Constructor />} />
          <Route path="/expeditions" element={<ExpeditionsReady />} />
          <Route path="/expeditions/recommended" element={<ExpeditionsRecommended />} />
          <Route path="/expeditions/:tourId" element={<ExpeditionDetail />} />
          <Route path="/tours" element={<Navigate to="/expeditions" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/countries/:code" element={<CountryPreview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
