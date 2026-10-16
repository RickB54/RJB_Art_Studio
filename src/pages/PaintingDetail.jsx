import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, ArrowLeft, ArrowRight, ShoppingBag, MessageSquare, Sparkles } from 'lucide-react'
import initialPaintings from '../data/paintings.json'
import initialPlaylists from '../data/playlists.json'

// Helper function to turn URLs in text into clickable links while preserving whitespace
function renderDescriptionWithLinks(text) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-studio-gold hover:text-white underline break-all transition"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default function PaintingDetail() {
  const { id } = useParams()
  const [paintings, setPaintings] = useState(initialPaintings)
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Sync with latest data
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings && Array.isArray(data.paintings)) setPaintings(data.paintings)
        if (data.playlists && Array.isArray(data.playlists)) setPlaylists(data.playlists)
      })
      .catch(() => {})
  }, [])

  // Reset video state when route changes
  useEffect(() => {
    setVideoPlaying(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Build unified items list
  const unifiedItems = useMemo(() => {
    const paintingByVideoId = new Map()
    for (const pt of paintings) {
      const vid = pt.videoId || (pt.youtubeUrl ? pt.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)?.[1] : null)
      if (vid) paintingByVideoId.set(vid, pt)
    }

    const visiblePlaylists = (playlists || []).filter(p => p.show !== false)
    const items = []
    const seen = new Set()

    for (const pl of visiblePlaylists) {
      const validVideos = (pl.videos || []).filter(v => !v.hide)
      for (const v of validVideos) {
        if (seen.has(v.id)) continue
        seen.add(v.id)

        const matched = paintingByVideoId.get(v.id)
        const hasRealPaintingData = !!(
          matched && (
            (matched.price !== null && matched.price !== undefined && matched.price !== '') ||
            matched.sold === true ||
            (matched.originalImage && matched.originalImage.trim() !== '') ||
            (matched.customImage && matched.customImage.trim() !== '')
          )
        )

        let ytYear = null
        const yearMatch = v.title?.match(/\b(19\d\d|20\d\d)\b/) || v.description?.match(/\b(19\d\d|20\d\d)\b/)
        if (yearMatch) ytYear = yearMatch[1]

        const originalImg = matched?.originalImage || matched?.customImage || null

        items.push({
          id: matched?.id || `video-${v.id}`,
          videoId: v.id,
          title: v.title,
          description: matched?.description || v.description,
          category: pl.title,
          hasPaintingData: hasRealPaintingData,
          sold: hasRealPaintingData ? !!matched.sold : false,
          price: hasRealPaintingData ? matched.price : null,
          medium: hasRealPaintingData ? matched.medium : null,
          size: hasRealPaintingData ? matched.size : null,
          year: hasRealPaintingData ? (matched.year || ytYear) : ytYear,
          displayImage: originalImg || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          fineArtAmericaUrl: matched?.fineArtAmericaUrl || null,
          youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`
        })
      }
    }
    return items
  }, [paintings, playlists])

  const currentIndex = unifiedItems.findIndex(p => p.id === id || p.videoId === id || p.id === `video-${id}`)
  const painting = currentIndex !== -1 ? unifiedItems[currentIndex] : null

  if (!painting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-white">Artwork Not Found</h1>
        <p className="text-slate-400 text-sm">The requested artwork could not be located.</p>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gallery</span>
        </Link>
      </div>
    )
  }

  // Previous & Next paintings
  const prevPainting = unifiedItems[(currentIndex - 1 + unifiedItems.length) % unifiedItems.length]
  const nextPainting = unifiedItems[(currentIndex + 1) % unifiedItems.length]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-4">
        <Link
          to="/gallery"
          className="hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Artworks</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to={`/painting/${prevPainting.id}`}
            className="hover:text-studio-magenta flex items-center gap-1 transition"
            title={`Previous: ${prevPainting.title}`}
          >
            <span>← Previous</span>
          </Link>
          <span className="text-white/20">|</span>
          <Link
            to={`/painting/${nextPainting.id}`}
            className="hover:text-studio-magenta flex items-center gap-1 transition"
            title={`Next: ${nextPainting.title}`}
          >
            <span>Next →</span>
          </Link>
        </div>
      </div>

      {/* Main Feature: Video / Artwork Player */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
        <div className="relative aspect-video w-full bg-studio-surface flex items-center justify-center overflow-hidden">
          {painting.videoId && videoPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${painting.videoId}?autoplay=1&rel=0`}
              title={painting.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setVideoPlaying(true)}>
              <img
                src={painting.displayImage}
                alt={painting.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-6 text-center backdrop-blur-[1px]">
                {painting.videoId ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-glow-magenta group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                      <Play className="w-9 h-9 fill-white translate-x-0.5" />
                    </div>
                    <span className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10">
                      Click to Watch Creation Video
                    </span>
                  </>
                ) : (
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10">
                    High Resolution Artwork View
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Artwork Header & Core Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Title, Story & Description */}
        <div className="lg:col-span-2 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-studio-magenta uppercase tracking-wider">
                {painting.category}
              </span>
              {painting.year && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{painting.year}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              {painting.title}
            </h1>
          </div>

          {/* Story & Description Box */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-studio-gold" />
              <span>About This Demonstration</span>
            </h2>
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {renderDescriptionWithLinks(painting.description)}
            </div>
          </div>

          {/* Bottom Next/Prev Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
            <Link
              to={`/painting/${prevPainting.id}`}
              className="flex items-center gap-1.5 hover:text-studio-magenta transition max-w-[45%]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">{prevPainting.title}</span>
            </Link>
            <Link
              to={`/painting/${nextPainting.id}`}
              className="flex items-center gap-1.5 hover:text-studio-magenta transition max-w-[45%] text-right justify-end"
            >
              <span className="truncate">{nextPainting.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>

        </div>

        {/* Right Column: Specifications & Purchasing Panel */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 space-y-6 sticky top-28">
          
          {/* Price & Availability: only if real painting data */}
          {painting.hasPaintingData ? (
            <div className="border-b border-white/10 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  painting.sold
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {painting.sold ? 'Sold / Permanent Collection' : 'Available for Purchase'}
                </span>
              </div>
              {painting.price && !painting.sold ? (
                <div className="mt-3">
                  <span className="text-3xl font-bold text-studio-gold font-serif">${painting.price}</span>
                  <span className="text-xs text-slate-400 ml-2">USD (Original Piece)</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  {painting.sold ? 'Inquire for similar custom commission' : 'Contact for purchase inquiry and shipping details.'}
                </p>
              )}
            </div>
          ) : (
            <div className="border-b border-white/10 pb-5">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/70 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>YouTube Studio Demo</span>
              </span>
              <p className="text-xs text-slate-400 mt-3">
                Watch full video tutorial and time lapse above. You can contact Rick for custom commissions or prints.
              </p>
            </div>
          )}

          {/* Specifications List */}
          <div className="space-y-3 text-xs">
            {painting.hasPaintingData && painting.medium && (
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Medium</span>
                <span className="text-white font-medium text-right">{painting.medium}</span>
              </div>
            )}
            {painting.hasPaintingData && painting.size && (
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Dimensions</span>
                <span className="text-white font-medium text-right">{painting.size}</span>
              </div>
            )}
            {painting.year && (
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Year</span>
                <span className="text-white font-medium text-right">{painting.year}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Category</span>
              <span className="text-white font-medium text-right">{painting.category}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to={`/contact?inquiry=${encodeURIComponent(painting.title)}`}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{painting.hasPaintingData && !painting.sold ? 'Buy / Inquire About This Piece' : 'Inquire / Contact Studio'}</span>
            </Link>

            {painting.fineArtAmericaUrl && (
              <a
                href={painting.fineArtAmericaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl text-xs sm:text-sm font-semibold bg-studio-gold/15 border border-studio-gold/40 text-studio-gold hover:bg-studio-gold hover:text-black transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Prints on Fine Art America</span>
              </a>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            All original paintings are packaged with archival care directly from Rick's Methuen studio.
          </p>

        </div>

      </div>

    </div>
  )
}
