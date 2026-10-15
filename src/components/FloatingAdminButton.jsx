import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'

export default function FloatingAdminButton() {
  const location = useLocation()

  // Only render during local development (npm run dev)
  if (!import.meta.env.DEV) {
    return null
  }

  // Hide when already on /admin
  if (location.pathname === '/admin') {
    return null
  }

  return (
    <Link
      to="/admin"
      title="Open Local Studio Admin Backend"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-studio-card/90 border border-studio-gold/50 text-studio-gold hover:bg-studio-gold hover:text-black shadow-lg backdrop-blur-md transition-all text-xs font-semibold group"
    >
      <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
      <span>Studio Admin</span>
    </Link>
  )
}
