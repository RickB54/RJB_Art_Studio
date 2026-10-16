import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ChevronLeft, ChevronRight, Play, ShoppingBag, Eye, ChevronDown } from 'lucide-react'
import initialPaintings from '../data/paintings.json'
import initialPlaylists from '../data/playlists.json'

const PAGE_SIZE = 24

export default function Gallery() {
  const [paintings, setPaintings] = useState(initialPaintings)
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All') // 'All' | 'Available' | 'Sold'
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Sync with latest data if dev API is active
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings && Array.isArray(data.paintings)) setPaintings(data.paintings)
        if (data.playlists && Array.isArray(data.playlists)) setPlaylists(data.playlists)
      })
      .catch(() => {})
  }, [])

  // Visible playlists only
  const visiblePlaylists = useMemo(() => {
    return (playlists || [])
      .filter(p => p.show !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [playlists])

  // Merge visible playlists' non-hidden videos with paintings.json by videoId
  const allGalleryItems = useMemo(() => {
    const paintingByVideoId = new Map()
    for (const pt of paintings) {
      const vid = pt.videoId || (pt.youtubeUrl ? pt.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)?.[1] : null)
      if (vid) {
        paintingByVideoId.set(vid, pt)
      }
    }

    const items = []
    const seenVideoIds = new Set()

    for (const pl of visiblePlaylists) {
      const validVideos = (pl.videos || []).filter(v => !v.hide)
      for (const v of validVideos) {
        if (seenVideoIds.has(v.id)) {
          // If video appears in multiple playlists, record all playlist titles in categories for filtering
          const existing = items.find(it => it.videoId === v.id)
          if (existing && !existing.categories.includes(pl.title)) {
            existing.categories.push(pl.title)
          }
          continue
        }
        seenVideoIds.add(v.id)

        const matched = paintingByVideoId.get(v.id)
        const hasRealPaintingData = !!(
          matched && (
            (matched.price !== null && matched.price !== undefined && matched.price !== '') ||
            matched.sold === true ||
            (matched.originalImage && matched.originalImage.trim() !== '') ||
            (matched.customImage && matched.customImage.trim() !== '')
          )
        )

        // YouTube year from title or description
        let ytYear = null
        const yearMatch = v.title?.match(/\b(19\d\d|20\d\d)\b/) || v.description?.match(/\b(19\d\d|20\d\d)\b/)
        if (yearMatch) {
          ytYear = yearMatch[1]
        }

        const originalImg = matched?.originalImage || matched?.customImage || null
        const displayImg = originalImg || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`

        items.push({
          id: matched?.id || `video-${v.id}`,
          videoId: v.id,
          title: v.title,
          description: matched?.description || v.description,
          category: pl.title,
          categories: [pl.title],
          playlistId: pl.playlistId,
          hasPaintingData: hasRealPaintingData,
          sold: hasRealPaintingData ? !!matched.sold : false,
          price: hasRealPaintingData ? matched.price : null,
          medium: hasRealPaintingData ? matched.medium : null,
          size: hasRealPaintingData ? matched.size : null,
          year: hasRealPaintingData ? (matched.year || ytYear) : ytYear,
          thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          displayImage: displayImg,
          originalImage: originalImg,
          fineArtAmericaUrl: matched?.fineArtAmericaUrl || null,
          youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`
        })
      }
    }

    return items
  }, [visiblePlaylists, paintings])

  // Playlist pills with counts
  const categoryPills = useMemo(() => {
    const list = [
      { name: 'All', count: allGalleryItems.length }
    ]
    for (const pl of visiblePlaylists) {
      const count = (pl.videos || []).filter(v => !v.hide).length
      list.push({ name: pl.title, count })
    }
    return list
  }, [visiblePlaylists, allGalleryItems])

  // Filtered list
  const filteredPaintings = useMemo(() => {
    return allGalleryItems.filter(item => {
      if (selectedCategory !== 'All' && !item.categories.includes(selectedCategory)) {
        return false
      }
      if (selectedStatus === 'Available') {
        if (!item.hasPaintingData || item.sold) return false
      }
      if (selectedStatus === 'Sold') {
        if (!item.hasPaintingData || !item.sold) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const inTitle = item.title?.toLowerCase().includes(q)
        const inDesc = item.description?.toLowerCase().includes(q)
        const inCat = item.categories.some(c => c.toLowerCase().includes(q))
        if (!inTitle && !inDesc && !inCat) return false
      }

      return true
    })
  }, [allGalleryItems, selectedCategory, selectedStatus, searchQuery])

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategory, selectedStatus, searchQuery])

  const visibleItems = useMemo(() => {
    return filteredPaintings.slice(0, visibleCount)
  }, [filteredPaintings, visibleCount])

  const hasMore = visibleCount < filteredPaintings.length

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
          Original Fine Art Collection & Demos
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Artwork Gallery
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Explore original paintings, demonstrations, and tutorials from Rick J Berube Art Studio. Click any piece to watch the creation video, view details, or inquire.
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
              placeholder="Search by title, playlist or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatus('All')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                selectedStatus === 'All' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Artwork
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Available')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                selectedStatus === 'Available' ? 'bg-emerald-950/80 text-emerald-300' : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Available Paintings
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

        {/* Category Pills with Counts from Visible Playlists */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {categoryPills.map((pill) => (
            <button
              key={pill.name}
              type="button"
              onClick={() => setSelectedCategory(pill.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === pill.name
                  ? 'bg-studio-magenta text-white shadow-glow-magenta'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              <span>{pill.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === pill.name ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Gallery Grid */}
      {filteredPaintings.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
          <p className="text-base text-slate-400">No artwork matches your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All')
              setSelectedStatus('All')
              setSearchQuery('')
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {visibleItems.length} of {filteredPaintings.length} artworks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300"
                >
                  
                  {/* Image Container with Hover Lightbox / Detail triggers */}
                  <div className="relative aspect-[4/3] bg-studio-surface overflow-hidden">
                    <img
                      src={item.displayImage}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Status Badge: ONLY shown if real painting data exists, NEVER for synced videos without painting data */}
                    {item.hasPaintingData && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow ${
                          item.sold
                            ? 'bg-rose-950/85 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.sold ? 'Sold' : 'Available'}
                        </span>
                      </div>
                    )}

                    {/* Video Tag & Year Indicator */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-black/70 text-red-400 border border-red-500/30 flex items-center gap-1 backdrop-blur-sm">
                        <Play className="w-3 h-3 fill-red-500 text-red-500" />
                        <span>Video</span>
                      </span>
                      {!item.hasPaintingData && item.year && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-black/70 text-slate-300 border border-white/10 backdrop-blur-sm">
                          {item.year}
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="p-3 rounded-full bg-white/20 hover:bg-studio-magenta text-white transition transform hover:scale-110 shadow-lg"
                        title="Enlarge Image"
                        aria-label="Enlarge artwork photo"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/painting/${item.id}`}
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
                        {item.category}
                      </span>
                      <Link to={`/painting/${item.id}`}>
                        <h3 className="font-serif text-lg font-bold text-white mt-1 hover:text-studio-gold transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      {item.hasPaintingData ? (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {[item.medium, item.size, item.year ? `(${item.year})` : null].filter(Boolean).join(' • ')}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-slate-400">YouTube Studio Demo</span>
                          {item.year && <span>• {item.year}</span>}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        {item.hasPaintingData ? (
                          item.price && !item.sold ? (
                            <span className="font-bold text-studio-gold text-sm">${item.price}</span>
                          ) : (
                            <span className="text-slate-400">{item.sold ? 'Private Collection' : 'Inquire for Price'}</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs">Full Video Tutorial</span>
                        )}
                        <Link
                          to={`/painting/${item.id}`}
                          className="text-xs font-semibold text-studio-magenta hover:underline"
                        >
                          Story & Video →
                        </Link>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/contact?inquiry=${encodeURIComponent(item.title)}`}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-white/5 hover:bg-studio-magenta hover:text-white text-slate-200 transition"
                        >
                          Inquire / Buy
                        </Link>
                        {item.fineArtAmericaUrl && (
                          <a
                            href={item.fineArtAmericaUrl}
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

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4 pb-6">
              <button
                type="button"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                className="px-8 py-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-studio-magenta text-white transition inline-flex items-center gap-2 mx-auto shadow-md"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Load More Artwork ({filteredPaintings.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
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
                src={activePainting.displayImage}
                alt={activePainting.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-studio-card/95 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-studio-magenta uppercase">{activePainting.category}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">{activePainting.title}</h3>
                {activePainting.hasPaintingData ? (
                  <p className="text-xs text-slate-400 mt-1">
                    {[activePainting.medium, activePainting.size, activePainting.year ? `(${activePainting.year})` : null].filter(Boolean).join(' • ')}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    YouTube Studio Demonstration {activePainting.year ? `(${activePainting.year})` : ''}
                  </p>
                )}
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
