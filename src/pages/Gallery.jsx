import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, X, ChevronLeft, ChevronRight, Play, ShoppingBag, Eye, ExternalLink } from 'lucide-react'
import siteData from '../data/site.json'
import paintingsDataInitial from '../data/paintings.json'

export default function Gallery() {
  const [paintings, setPaintings] = useState(paintingsDataInitial)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMedium, setSelectedMedium] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All') // 'All' | 'Available' | 'Sold'
  const [searchQuery, setSearchQuery] = useState('')

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Sync with latest data if dev API is active
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings) setPaintings(data.paintings)
      })
      .catch(() => {})
  }, [])

  // Extract unique mediums and years
  const mediums = ['All', ...Array.from(new Set(paintings.map(p => p.medium).filter(Boolean)))]
  const years = ['All', ...Array.from(new Set(paintings.map(p => p.year).filter(Boolean))).sort().reverse()]

  // Filtered list
  const filteredPaintings = paintings.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false
    if (selectedMedium !== 'All' && p.medium !== selectedMedium) return false
    if (selectedYear !== 'All' && p.year !== selectedYear) return false
    if (selectedStatus === 'Available' && p.sold) return false
    if (selectedStatus === 'Sold' && !p.sold) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const inTitle = p.title?.toLowerCase().includes(q)
      const inDesc = p.description?.toLowerCase().includes(q)
      const inMedium = p.medium?.toLowerCase().includes(q)
      if (!inTitle && !inDesc && !inMedium) return false
    }

    return true
  })

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % filteredPaintings.length)
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + filteredPaintings.length) % filteredPaintings.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, filteredPaintings.length])

  const activePainting = lightboxIndex !== null ? filteredPaintings[lightboxIndex] : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
          Original Fine Art Collection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Artwork Gallery
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Original oil and acrylic landscapes, seascapes, wildlife, florals, portraits, and sketches. Click any artwork to view its creation video, complete story, and purchase options.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
        
        {/* Search & Status Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, medium, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Medium Selector */}
            <select
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="bg-[#13111c] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-studio-magenta"
            >
              <option value="All">All Mediums</option>
              {mediums.filter(m => m !== 'All').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#13111c] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-studio-magenta"
            >
              <option value="All">All Years</option>
              {years.filter(y => y !== 'All').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Availability Filter Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSelectedStatus('All')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatus === 'All' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('Available')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatus === 'Available' ? 'bg-emerald-950/80 text-emerald-300' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('Sold')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatus === 'Sold' ? 'bg-rose-950/80 text-rose-300' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Sold
              </button>
            </div>

          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {siteData.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-studio-magenta text-white shadow-glow-magenta'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Gallery Grid */}
      {filteredPaintings.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
          <p className="text-base text-slate-400">No paintings match your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All')
              setSelectedMedium('All')
              setSelectedYear('All')
              setSelectedStatus('All')
              setSearchQuery('')
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaintings.map((painting, index) => {
            const displayImg = painting.customImage || painting.thumbnail
            return (
              <div
                key={painting.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300"
              >
                
                {/* Image Container with Hover Lightbox / Detail triggers */}
                <div className="relative aspect-[4/3] bg-studio-surface overflow-hidden">
                  <img
                    src={displayImg}
                    alt={painting.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow ${
                      painting.sold
                        ? 'bg-rose-950/85 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {painting.sold ? 'Sold' : 'Available'}
                    </span>
                  </div>

                  {/* Video Indicator */}
                  {painting.youtubeUrl && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-black/70 text-red-400 border border-red-500/30 flex items-center gap-1 backdrop-blur-sm">
                        <Play className="w-3 h-3 fill-red-500 text-red-500" />
                        <span>Video</span>
                      </span>
                    </div>
                  )}

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="p-3 rounded-full bg-white/20 hover:bg-studio-magenta text-white transition transform hover:scale-110 shadow-lg"
                      title="Enlarge Photo"
                      aria-label="Enlarge artwork photo"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/painting/${painting.id}`}
                      className="p-3 rounded-full bg-studio-magenta hover:bg-studio-fuchsia text-white transition transform hover:scale-110 shadow-lg"
                      title="View Details & Video"
                      aria-label="View painting details and video"
                    >
                      <Play className="w-5 h-5" />
                    </Link>
                  </div>

                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider block">
                      {painting.category}
                    </span>
                    <Link to={`/painting/${painting.id}`}>
                      <h3 className="font-serif text-lg font-bold text-white mt-1 hover:text-studio-gold transition-colors line-clamp-1">
                        {painting.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {painting.medium} • {painting.size} ({painting.year})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      {painting.price && !painting.sold ? (
                        <span className="font-bold text-studio-gold text-sm">${painting.price}</span>
                      ) : (
                        <span className="text-slate-400">{painting.sold ? 'Private Collection' : 'Inquire for Price'}</span>
                      )}
                      <Link
                        to={`/painting/${painting.id}`}
                        className="text-xs font-semibold text-studio-magenta hover:underline"
                      >
                        Story & Video →
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/contact?inquiry=${encodeURIComponent(painting.title)}`}
                        className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-white/5 hover:bg-studio-magenta hover:text-white text-slate-200 transition"
                      >
                        Inquire / Buy
                      </Link>
                      {painting.fineArtAmericaUrl && (
                        <a
                          href={painting.fineArtAmericaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-studio-gold/15 hover:bg-studio-gold hover:text-black text-studio-gold transition flex items-center gap-1"
                          title="Prints on Fine Art America"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>FAA Prints</span>
                        </a>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePainting && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={activePainting.title}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
            aria-label="Close Lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          <button
            type="button"
            onClick={() => setLightboxIndex((prev) => (prev - 1 + filteredPaintings.length) % filteredPaintings.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-studio-magenta text-white transition z-50"
            aria-label="Previous artwork (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={() => setLightboxIndex((prev) => (prev + 1) % filteredPaintings.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-studio-magenta text-white transition z-50"
            aria-label="Next artwork (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Card */}
          <div className="max-w-4xl w-full bg-studio-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
              <img
                src={activePainting.customImage || activePainting.thumbnail}
                alt={activePainting.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-studio-card/95 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-studio-magenta uppercase">{activePainting.category}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">{activePainting.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activePainting.medium} • {activePainting.size} ({activePainting.year})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/painting/${activePainting.id}`}
                  onClick={() => setLightboxIndex(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition flex items-center gap-2 shadow-glow-magenta"
                >
                  <Play className="w-4 h-4" />
                  <span>View Video & Story</span>
                </Link>
                {activePainting.fineArtAmericaUrl && (
                  <a
                    href={activePainting.fineArtAmericaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-studio-gold/15 border border-studio-gold/30 text-studio-gold hover:bg-studio-gold hover:text-black transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Prints</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
