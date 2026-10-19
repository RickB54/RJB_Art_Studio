import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-20 right-6 z-40 p-3 rounded-full bg-studio-card/90 border border-studio-magenta/40 text-studio-magenta hover:text-white hover:bg-studio-magenta hover:border-studio-magenta shadow-glow-magenta backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-studio-magenta group ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="Back to top"
    >
      <ArrowUp className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform" />
    </button>
  )
}
