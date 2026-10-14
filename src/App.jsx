import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PainterlyBackground from './components/PainterlyBackground'

import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Commissions from './pages/Commissions'
import Videos from './pages/Videos'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

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
          <Route path="/about" element={<About />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  )
}
