import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Youtube, Palette } from 'lucide-react'
import siteData from '../data/site.json'
import initialPages from '../data/pages.json'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pages, setPages] = useState(initialPages)
  const location = useLocation()

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => { if (data.pages) setPages(data.pages) })
      .catch(() => {})
  }, [])

  const hd = pages.header || {}

  const navLinks = [
    { name: hd.navHome || 'Home', path: '/' },
    { name: hd.navGallery || 'Gallery', path: '/gallery' },
    { name: hd.navAbout || 'About', path: '/about' },
    { name: hd.navCommissions || 'Commissions & Prints', path: '/commissions' },
    { name: hd.navVideos || 'Videos', path: '/videos' },
    { name: hd.navContact || 'Contact', path: '/contact' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Wordmark */}
          <Link 
            to="/" 
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-magenta rounded-lg"
          >
            <div className="w-10 h-10 rounded-full bg-studio-card flex items-center justify-center border border-white/10 group-hover:border-studio-magenta/60 transition-colors shadow-inner">
              <img 
                src="/palette-icon.svg" 
                alt="RJB Palette Icon" 
                className="w-7 h-7 transform group-hover:rotate-6 transition-transform duration-300" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-studio-magenta transition-colors">
                Rick J Berube
              </span>
              <span className="text-[10px] sm:text-xs font-sans tracking-[0.25em] uppercase text-studio-gold font-medium -mt-1">
                Art Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-white bg-white/10 shadow-sm border border-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Social Call to Action */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={siteData.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Rick J Berube on YouTube"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <Youtube className="w-4 h-4" />
              <span>{hd.youtubeBtn || 'YouTube'}</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'text-white bg-white/10 border border-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-white/10">
            <a
              href={siteData.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              <Youtube className="w-4 h-4" />
              <span>Subscribe on YouTube</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
