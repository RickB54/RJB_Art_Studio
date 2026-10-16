import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PainterlyBackground from './components/PainterlyBackground'
import FloatingAdminButton from './components/FloatingAdminButton'

const Home = React.lazy(() => import('./pages/Home'))
const Gallery = React.lazy(() => import('./pages/Gallery'))
const PaintingDetail = React.lazy(() => import('./pages/PaintingDetail'))
const About = React.lazy(() => import('./pages/About'))
const Commissions = React.lazy(() => import('./pages/Commissions'))
const Videos = React.lazy(() => import('./pages/Videos'))
const PlaylistDetail = React.lazy(() => import('./pages/PlaylistDetail'))
const Contact = React.lazy(() => import('./pages/Contact'))

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
        <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
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
                element={<Admin />}
              />
            )}
          </Routes>
        </React.Suspense>
      </main>

      {/* Floating local-dev only admin button */}
      <FloatingAdminButton />

      {/* Site Footer */}
      <Footer />
    </div>
  )
}
