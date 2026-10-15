import React from 'react'
import { Link } from 'react-router-dom'
import { Award, Palette, Home, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'
import siteData from '../data/site.json'

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
          The Artist & Studio
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          About Rick J Berube
        </h1>
        <p className="font-serif italic text-xl text-studio-gold">
          "{siteData.artist.tagline}"
        </p>
      </div>

      {/* Main Bio Card */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-full bg-studio-magenta/20 flex items-center justify-center text-studio-magenta border border-studio-magenta/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Artistic Journey</h2>
            <p className="text-xs text-slate-400">Methuen, Massachusetts • Self-Taught Painter</p>
          </div>
        </div>

        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            {siteData.artist.bioExtended}
          </p>
          <p>
            Over the past decades, I have painted more than 500 original works—capturing the dramatic coastal cliffs of Maine, peaceful New England forests, majestic wildlife, delicate florals, and intimate portraits of loved ones and pets.
          </p>
        </div>

        {/* Knee surgery personal note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-studio-card/80 border border-studio-magenta/30 flex items-start gap-3.5">
          <Heart className="w-5 h-5 text-studio-magenta shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-200">
            <span className="font-semibold text-studio-magenta block mb-0.5">Studio Health Update:</span>
            {siteData.artist.recoveryNotice}
          </div>
        </div>
      </div>

      {/* Mayoral Awards & Honors */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-studio-gold" />
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Awards & Recognition</h2>
            <p className="text-xs text-slate-400">Honors bestowed by the City of Methuen Mayor's Office</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {siteData.awards.map((award, i) => (
            <div
              key={i}
              className="glass-panel p-6 sm:p-7 rounded-2xl border border-studio-gold/20 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-studio-gold text-black uppercase tracking-wider">
                  {award.title}
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-2">
                  Featured Artwork: "{award.artwork}"
                </h3>
                <p className="text-xs text-studio-gold/90 font-medium">
                  {award.conferredBy} • {award.medium}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 pt-2 leading-relaxed">
                  {award.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Display Location: Methuen City Hall Rotunda</span>
                <span className="text-studio-gold font-serif">★</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Studio Story */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-full bg-studio-cobalt/20 flex items-center justify-center text-studio-cobalt border border-studio-cobalt/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">The Studio ("Where The Magic Happens")</h2>
            <p className="text-xs text-slate-400">Dedicated Art & Video Recording Facility</p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
          In 2019, I designed and custom-built my own dedicated 33' x 17' painting and video recording studio in Methuen. Equipped with natural lighting, multiple DSLR overhead video angles, and specialized wet-on-wet easels, this studio is where every painting comes to life and where each YouTube demonstration video is produced.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block font-serif text-xl font-bold text-white">33' × 17'</span>
            <span className="text-xs text-slate-400">Dedicated Creative Space</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block font-serif text-xl font-bold text-studio-gold">4K DSLR</span>
            <span className="text-xs text-slate-400">Video Capture Setup</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block font-serif text-xl font-bold text-studio-magenta">Oil & Acrylic</span>
            <span className="text-xs text-slate-400">Custom Easel Stations</span>
          </div>
        </div>
      </div>

      {/* Call to Action Bar */}
      <div className="glass-panel p-8 rounded-2xl border border-studio-magenta/30 bg-gradient-to-r from-studio-purple/20 via-studio-card to-studio-surface text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-white">Interested in working together or purchasing art?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Browse the gallery of paintings, inquire about custom portrait commissions, or reach out with any questions.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to="/gallery"
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition shadow-glow-magenta"
          >
            Browse The Gallery
          </Link>
          <Link
            to="/contact"
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
          >
            Contact Rick Directly
          </Link>
        </div>
      </div>

    </div>
  )
}
