import React from 'react'
import siteData from '../data/site.json'
import { Award, Heart } from 'lucide-react'

export default function AboutPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">About Rick J Berube</h1>
        <p className="mt-2 text-studio-gold font-serif italic text-lg">"{siteData.artist.tagline}"</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white">My Artistic Journey</h2>
        <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
          {siteData.artist.bioExtended}
        </p>
        <div className="p-4 rounded-xl bg-studio-magenta/10 border border-studio-magenta/20 text-xs sm:text-sm text-slate-200">
          <span className="font-bold text-studio-magenta">Personal Note: </span>
          {siteData.artist.recoveryNotice}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-studio-gold" />
          <span>Awards & Mayoral Honors</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {siteData.awards.map((award, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
              <span className="text-xs font-semibold text-studio-gold">{award.title}</span>
              <h3 className="font-serif text-lg font-bold text-white">{award.artwork}</h3>
              <p className="text-xs text-slate-400">{award.conferredBy}</p>
              <p className="text-xs text-slate-300 pt-1">{award.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
