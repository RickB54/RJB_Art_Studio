import React from 'react'
import { Link } from 'react-router-dom'
import siteData from '../data/site.json'
import paintingsData from '../data/paintings.json'

export default function GalleryPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Artwork Gallery</h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Browse original oil, acrylic, and watercolor paintings across categories.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {siteData.categories.map((cat) => (
          <span key={cat} className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
            {cat}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paintingsData.map((painting) => (
          <div key={painting.id} className="glass-panel rounded-2xl overflow-hidden p-4">
            <img src={painting.thumbnail} alt={painting.title} className="w-full aspect-[4/3] object-cover rounded-xl mb-3" />
            <span className="text-[11px] text-studio-magenta uppercase font-semibold">{painting.category}</span>
            <h3 className="font-serif text-lg font-bold text-white">{painting.title}</h3>
            <p className="text-xs text-slate-400">{painting.medium} • {painting.size}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
