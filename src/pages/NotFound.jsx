import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Image as ImageIcon, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-studio-magenta/30 max-w-lg w-full text-center space-y-6 shadow-glow-magenta">
        <div className="w-16 h-16 rounded-full bg-studio-magenta/20 border border-studio-magenta/40 flex items-center justify-center mx-auto text-studio-magenta font-serif text-2xl font-bold">
          404
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The easel is empty here. The page you are looking for might have been moved, renamed, or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/gallery"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2 border border-white/10"
          >
            <ImageIcon className="w-4 h-4 text-studio-gold" />
            <span>Explore The Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
