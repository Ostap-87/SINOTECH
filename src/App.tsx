import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Industries } from '@/pages/Industries'
import { Tours } from '@/pages/Tours'
import { Blog } from '@/pages/Blog'
import { Cases } from '@/pages/Cases'
import { Contacts } from '@/pages/Contacts'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-bone-white">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
