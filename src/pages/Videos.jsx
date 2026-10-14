import React from 'react'
import siteData from '../data/site.json'
import { Youtube, ExternalLink } from 'lucide-react'

export default function VideosPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">YouTube Painting Tutorials</h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          Step-by-step videos, time lapses, and painting demonstrations from my studio.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-red-500/20 max-w-xl mx-auto space-y-4">
        <Youtube className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-white">Rick J Berube Art Studio</h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Subscribe on YouTube to watch wet-on-wet oil painting techniques, acrylic studies, and portraits.
        </p>
        <a 
          href={siteData.socials.youtube} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
        >
          <span>Visit YouTube Channel</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
