import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PainterlyBackground from './components/PainterlyBackground'
import FloatingAdminButton from './components/FloatingAdminButton'

import Home from './pages/Home'
import Gallery from './pages/Gallery'
import PaintingDetail from './pages/PaintingDetail'
import About from './pages/About'
import Commissions from './pages/Commissions'
import Videos from './pages/Videos'
import PlaylistDetail from './pages/PlaylistDetail'
import Contact from './pages/Contact'

// Load Admin ONLY in local development
const Admin = import.meta.env.DEV ? React.lazy(() => import('./pages/Admin')) : null

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative selection:bg-studio-magenta selection:text-white">
      {/* Dynamic Painterly Fluid Background */}
      <PainterlyBackground />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/painting/:id" element={<PaintingDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/videos/:playlistId" element={<PlaylistDetail />} />
          <Route path="/contact" element={<Contact />} />
          {import.meta.env.DEV && Admin && (
            <Route
              path="/admin"
              element={
                <React.Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Studio Admin...</div>}>
                  <Admin />
                </React.Suspense>
              }
            />
          )}
        </Routes>
      </main>

      {/* Floating local-dev only admin button */}
      <FloatingAdminButton />

      {/* Site Footer */}
      <Footer />
    </div>
  )
}
