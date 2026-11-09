import React, { useEffect } from 'react'
import { X, Calendar, MapPin, DollarSign, Snowflake, Info, Navigation, ExternalLink } from 'lucide-react'

export default function AttendShowModal({ show, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!show) return null

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    show.address || show.location || show.title
  )}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Attend ${show.title}`}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-studio-magenta via-studio-gold to-studio-purple" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-studio-gold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Visitor & Attendee Guide</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              {show.title}
            </h3>
            {show.date && (
              <p className="text-xs sm:text-sm text-studio-magenta font-semibold">
                {show.date}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Location & Directions */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-studio-gold font-semibold uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location & Venue</span>
            </div>
            <p className="text-slate-200 font-medium">
              {show.address || show.location || 'See event website'}
            </p>
            {show.distanceMiles !== undefined && show.distanceMiles !== null && (
              <p className="text-[11px] text-slate-400">
                ~{show.distanceMiles} miles from Methuen, MA
              </p>
            )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-studio-magenta hover:underline pt-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Get Directions / Google Maps</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          </div>

          {/* Cost to Attend */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Admission / Cost to Attend</span>
            </div>
            <p className="text-slate-200 font-medium">
              {show.cost || 'Free Admission / Open to Public'}
            </p>
            <p className="text-[11px] text-slate-400">
              Original artwork & prints available for purchase directly at the booth.
            </p>
          </div>

          {/* Snow & Weather Policy */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">
              <Snowflake className="w-3.5 h-3.5" />
              <span>Snow Dates & Weather Policy</span>
            </div>
            <p className="text-slate-200 font-medium">
              {show.snowPolicy || show.weatherPolicy || 'Operates Rain or Shine unless severe weather warning is declared.'}
            </p>
          </div>
        </div>

        {/* Important Notes & Details */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-studio-gold font-semibold uppercase tracking-wider text-[10px]">
            <Info className="w-3.5 h-3.5" />
            <span>Important Notes for Visitors</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {show.notes || show.details || 'Come say hello in person! Rick will have a curated selection of original oil and acrylic paintings, demonstrations, and fine art prints available. Custom commissions can also be discussed on-site.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-studio-gold" />
            <span>Open in Maps</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  )
}
