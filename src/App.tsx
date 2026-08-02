import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'

const Industries = lazy(() => import('@/pages/Industries').then((m) => ({ default: m.Industries })))
const IndustryFork = lazy(() => import('@/pages/IndustryFork').then((m) => ({ default: m.IndustryFork })))
const Constructor = lazy(() => import('@/pages/Constructor').then((m) => ({ default: m.Constructor })))
const ExpeditionsReady = lazy(() => import('@/pages/ExpeditionsReady').then((m) => ({ default: m.ExpeditionsReady })))
const ExpeditionsRecommended = lazy(() =>
  import('@/pages/ExpeditionsRecommended').then((m) => ({ default: m.ExpeditionsRecommended })),
)
const ExpeditionDetail = lazy(() => import('@/pages/ExpeditionDetail').then((m) => ({ default: m.ExpeditionDetail })))
const Companies = lazy(() => import('@/pages/Companies').then((m) => ({ default: m.Companies })))
const CompanyDetail = lazy(() => import('@/pages/CompanyDetail').then((m) => ({ default: m.CompanyDetail })))
const Blog = lazy(() => import('@/pages/Blog').then((m) => ({ default: m.Blog })))
const BlogArticle = lazy(() => import('@/pages/BlogArticle').then((m) => ({ default: m.BlogArticle })))
const Cases = lazy(() => import('@/pages/Cases').then((m) => ({ default: m.Cases })))
const Faq = lazy(() => import('@/pages/Faq').then((m) => ({ default: m.Faq })))
const Partners = lazy(() => import('@/pages/Partners').then((m) => ({ default: m.Partners })))
const Consulting = lazy(() => import('@/pages/Consulting').then((m) => ({ default: m.Consulting })))
const Contacts = lazy(() => import('@/pages/Contacts').then((m) => ({ default: m.Contacts })))
const CountryPreview = lazy(() => import('@/pages/CountryPreview').then((m) => ({ default: m.CountryPreview })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-bone-white">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:sector" element={<IndustryFork />} />
            <Route path="/constructor" element={<Constructor />} />
            <Route path="/expeditions" element={<ExpeditionsReady />} />
            <Route path="/expeditions/recommended" element={<ExpeditionsRecommended />} />
            <Route path="/expeditions/:tourId" element={<ExpeditionDetail />} />
            <Route path="/tours" element={<Navigate to="/expeditions" replace />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/countries/:code" element={<CountryPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
