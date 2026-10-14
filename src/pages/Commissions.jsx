import React from 'react'
import siteData from '../data/site.json'

export default function CommissionsPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Commissions & Services</h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">Custom portraits, paintings to order, and archival prints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {siteData.services.map((svc) => (
          <div key={svc.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-studio-magenta">{svc.subtitle}</span>
            <h3 className="font-serif text-xl font-bold text-white">{svc.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{svc.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-studio-magenta/30 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white">Commission Form Setup</h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          The full interactive commission questionnaire (item type, size, medium, orientation, photo description) will be connected with Netlify Forms in Stage 5.
        </p>
      </div>
    </div>
  )
}
