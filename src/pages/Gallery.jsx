import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ChevronLeft, ChevronRight, Play, ShoppingBag, Eye, ChevronDown } from 'lucide-react'
import initialPaintings from '../data/paintings.json'
import initialPlaylists from '../data/playlists.json'
import initialSite from '../data/site.json'
import pagesData from '../data/pages.json'
import PageBlocks from '../components/PageBlocks'
import { matchesSearch } from '../utils/search'

const PAGE_SIZE = 24
const playlistLoaders = import.meta.glob('../data/playlists/*.json')

export default function Gallery() {
  const [paintings, setPaintings] = useState(initialPaintings)
  const [playlists, setPlaylists] = useState([])
  const [site, setSite] = useState(initialSite)
  const [galleryText, setGalleryText] = useState(pagesData.gallery || {})
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All') // 'All' | 'For Sale' | 'Sold' | 'Not for Sale'
  const [selectedMedia, setSelectedMedia] = useState('All') // 'All' | 'With video' | 'Photos only'
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Debounce search query by 150ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Lazy-load all visible playlists' full video JSON files
  useEffect(() => {
    const visible = (initialPlaylists || []).filter(p => p.show !== false)
    const promises = visible.map(pl => {
      const loaderKey = `../data/playlists/${pl.playlistId}.json`
      if (playlistLoaders[loaderKey]) {
        return playlistLoaders[loaderKey]()
          .then(mod => mod?.default || mod)
          .catch(() => pl)
      }
      return fetch(`/__api/playlist/${pl.playlistId}`)
        .then(r => r.ok ? r.json() : pl)
        .catch(() => pl)
    })

    Promise.all(promises).then(fullPlaylists => {
      setPlaylists(fullPlaylists)
    })

    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings && Array.isArray(data.paintings)) setPaintings(data.paintings)
        if (data.site) setSite(data.site)
        if (data.pages?.gallery) setGalleryText(data.pages.gallery)
      })
      .catch(() => {})
  }, [])

  // Visible playlists only
  const visiblePlaylists = useMemo(() => {
    return (playlists || [])
      .filter(p => p.show !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [playlists])

  // Merge visible playlists' non-hidden videos with paintings.json by videoId, plus photo-only paintings
  const allGalleryItems = useMemo(() => {
    const paintingByVideoId = new Map()
    const usedPaintingIds = new Set()

    for (const pt of paintings) {
      const vid = pt.videoId || (pt.youtubeUrl ? pt.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)?.[1] : null)
      if (vid) {
        paintingByVideoId.set(vid, pt)
      }
    }

    const items = []
    const seenVideoIds = new Set()

    // 1. Process visible playlists
    for (const pl of visiblePlaylists) {
      const validVideos = (pl.videos || []).filter(v => !v.hide)
      for (const v of validVideos) {
        if (seenVideoIds.has(v.id)) {
          const existing = items.find(it => it.videoId === v.id)
          if (existing && !existing.categories.includes(pl.title)) {
            existing.categories.push(pl.title)
          }
          continue
        }
        seenVideoIds.add(v.id)

        const matched = paintingByVideoId.get(v.id)
        if (matched) {
          usedPaintingIds.add(matched.id)
        }

        const hasRealPaintingData = !!(
          matched && (
            (matched.price !== null && matched.price !== undefined && matched.price !== '') ||
            matched.sold === true ||
            matched.status ||
            (matched.photo && matched.photo.trim() !== '') ||
            (matched.originalImage && matched.originalImage.trim() !== '') ||
            (matched.customImage && matched.customImage.trim() !== '')
          )
        )

        let ytYear = null
        const yearMatch = v.title?.match(/\b(19\d\d|20\d\d)\b/) || v.description?.match(/\b(19\d\d|20\d\d)\b/)
        if (yearMatch) ytYear = yearMatch[1]

        const originalImg = matched?.photo || matched?.originalImage || matched?.customImage || null
        const displayImg = originalImg || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
        const thumbImg = matched?.thumbnailUrl || matched?.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`

        const extraCats = Array.isArray(matched?.categories) ? matched.categories : (matched?.category ? [matched.category] : [])
        const allCats = Array.from(new Set([pl.title, ...extraCats]))

        const status = matched?.status || (matched?.sold ? 'Sold' : (matched?.price ? 'For Sale' : ''))

        items.push({
          id: matched?.id || `video-${v.id}`,
          videoId: v.id,
          title: matched?.title || v.title,
          description: matched?.description || v.description,
          category: pl.title,
          categories: allCats,
          playlistId: pl.playlistId,
          hasPaintingData: hasRealPaintingData,
          sold: Boolean(matched?.sold || status === 'Sold'),
          status: status,
          price: hasRealPaintingData ? matched.price : null,
          medium: hasRealPaintingData ? matched.medium : null,
          size: hasRealPaintingData ? matched.size : null,
          year: hasRealPaintingData ? (matched.year || ytYear) : ytYear,
          thumbnail: thumbImg,
          displayImage: displayImg,
          originalImage: originalImg,
          photo: originalImg,
          hasVideo: true,
          fineArtAmericaUrl: matched?.fineArtAmericaUrl || null,
          youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`
        })
      }
    }

    // 2. Add paintings from paintings.json that were NOT in any visible playlist (e.g. photo-only)
    for (const pt of paintings) {
      if (usedPaintingIds.has(pt.id)) continue
      const vid = pt.videoId || (pt.youtubeUrl ? pt.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)?.[1] : null)
      if (vid && seenVideoIds.has(vid)) continue

      usedPaintingIds.add(pt.id)
      if (vid) seenVideoIds.add(vid)

      const cats = Array.isArray(pt.categories) && pt.categories.length
        ? pt.categories
        : (pt.category ? [pt.category] : ['Paintings'])

      const status = pt.status || (pt.sold ? 'Sold' : (pt.price ? 'For Sale' : ''))
      const photoImg = pt.photo || pt.originalImage || pt.customImage || null
      const displayImg = photoImg || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : pt.thumbnail || '/images/placeholder.webp')
      const thumbImg = pt.thumbnailUrl || pt.thumbnail || photoImg || displayImg

      items.push({
        id: pt.id || (vid ? `video-${vid}` : `painting-${Date.now()}`),
        videoId: vid || null,
        title: pt.title || 'Untitled',
        description: pt.description || '',
        category: cats[0] || 'Paintings',
        categories: cats,
        hasPaintingData: true,
        sold: Boolean(pt.sold || status === 'Sold'),
        status: status,
        price: pt.price || null,
        medium: pt.medium || null,
        size: pt.size || null,
        year: pt.year || null,
        thumbnail: thumbImg,
        displayImage: displayImg,
        originalImage: photoImg,
        photo: photoImg,
        hasVideo: Boolean(vid || pt.youtubeUrl),
        fineArtAmericaUrl: pt.fineArtAmericaUrl || null,
        youtubeUrl: pt.youtubeUrl || (vid ? `https://www.youtube.com/watch?v=${vid}` : null)
      })
    }

    return items
  }, [visiblePlaylists, paintings])

  // Category pills: visible playlists PLUS editable extra-categories from site.json
  const categoryPills = useMemo(() => {
    const list = [
      { name: 'All', count: allGalleryItems.length }
    ]
    const addedNames = new Set(['All'])

    for (const pl of visiblePlaylists) {
      if (!addedNames.has(pl.title)) {
        addedNames.add(pl.title)
        const count = allGalleryItems.filter(item => item.categories.includes(pl.title)).length
        list.push({ name: pl.title, count })
      }
    }

    const extras = site?.extraCategories || []
    for (const cat of extras) {
      if (!addedNames.has(cat)) {
        addedNames.add(cat)
        const count = allGalleryItems.filter(item => item.categories.includes(cat)).length
        list.push({ name: cat, count })
      }
    }

    return list
  }, [visiblePlaylists, site?.extraCategories, allGalleryItems])

  // Filtered list by category, status, media, and search query
  const filteredPaintings = useMemo(() => {
    return allGalleryItems.filter(item => {
      if (selectedCategory !== 'All' && !item.categories.includes(selectedCategory)) {
        return false
      }

      // Media filter: All | With video | Photos only
      if (selectedMedia === 'With video' && !item.hasVideo) {
        return false
      }
      if (selectedMedia === 'Photos only' && item.hasVideo) {
        return false
      }

      // Status filter: All | For Sale | Sold | Not for Sale
      if (selectedStatus === 'For Sale') {
        const isForSale = item.status === 'For Sale' || (item.price && !item.sold && item.status !== 'Sold' && item.status !== 'Not Available for Sale')
        if (!isForSale) return false
      }
      if (selectedStatus === 'Sold') {
        if (!item.sold && item.status !== 'Sold') return false
      }
      if (selectedStatus === 'Not for Sale') {
        if (item.status !== 'Not Available for Sale' && item.status !== 'Reserved') return false
      }

      if (debouncedQuery.trim()) {
        if (!matchesSearch(item, debouncedQuery)) return false
      }

      return true
    })
  }, [allGalleryItems, selectedCategory, selectedStatus, selectedMedia, debouncedQuery])

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategory, selectedStatus, selectedMedia, debouncedQuery])

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

      {/* Slot: Top of page */}
      <PageBlocks blocks={galleryText.blockSlots?.top} />

      {/* Page Header */}
      {galleryText.headerVisible !== false && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
            {galleryText.badge || "Original Fine Art Collection & Demos"}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {galleryText.title || "Artwork Gallery"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {galleryText.description || "Explore original paintings, demonstrations, and tutorials from Rick J Berube Art Studio. Click any piece to watch the creation video, view details, or inquire."}
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      {galleryText.filtersVisible !== false && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          
          {/* Search & Status Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={galleryText.searchPlaceholder || "Search by title, playlist or keywords..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition focus:outline-none focus:ring-1 focus:ring-studio-magenta"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls: Media filter + Status filter */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Media Filter: All / With video / Photos only */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMedia('All')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedMedia === 'All' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {galleryText.allMediaBtn || "All Media"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMedia('With video')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedMedia === 'With video' ? 'bg-red-950/80 text-red-300' : 'text-slate-400 hover:text-red-300'
                  }`}
                >
                  {galleryText.withVideoBtn || "With video"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMedia('Photos only')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedMedia === 'Photos only' ? 'bg-studio-magenta/80 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {galleryText.photosOnlyBtn || "Photos only"}
                </button>
              </div>

              {/* Status Filter Buttons: All / For Sale / Sold / Not for Sale */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('All')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedStatus === 'All' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {galleryText.allStatusBtn || "All Status"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('For Sale')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedStatus === 'For Sale' ? 'bg-emerald-950/80 text-emerald-300' : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  {galleryText.forSaleBtn || "For Sale"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Sold')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedStatus === 'Sold' ? 'bg-rose-950/80 text-rose-300' : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  {galleryText.soldBtn || "Sold"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Not for Sale')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    selectedStatus === 'Not for Sale' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {galleryText.notForSaleBtn || "Not for Sale"}
                </button>
              </div>

            </div>

          </div>

        {/* Active Search / Match indicator */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-studio-card/80 border border-studio-magenta/30">
            <span className="text-slate-200">
              Showing <strong className="text-studio-gold">{filteredPaintings.length}</strong> artwork result{filteredPaintings.length === 1 ? '' : 's'} for "<span className="text-white font-medium">{searchQuery}</span>"
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-white transition bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-500/30"
              title="Clear search"
            >
              <X className="w-3 h-3" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* Category Pills with Counts from Visible Playlists + extraCategories */}
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
      )}

      {/* Gallery Grid */}
      {filteredPaintings.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/10 space-y-3">
          {debouncedQuery.trim() ? (
            <>
              <p className="text-base text-slate-300">
                No results for &quot;<span className="text-white font-semibold">{debouncedQuery}</span>&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setSelectedStatus('All')
                  setSelectedMedia('All')
                }}
                className="mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition inline-flex items-center gap-1.5 shadow-glow-magenta"
              >
                <span>Reset Search & Filters</span>
              </button>
            </>
          ) : (
            <>
              <p className="text-base text-slate-400">{galleryText.noResultsText || "No artwork matches your current filters."}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedStatus('All')
                  setSelectedMedia('All')
                  setSearchQuery('')
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
              >
                {galleryText.resetFiltersBtn || "Reset All Filters"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {visibleItems.length} of {filteredPaintings.length} artworks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, index) => {
              const isForSale = item.status === 'For Sale' || (item.price && !item.sold && item.status !== 'Sold' && item.status !== 'Not Available for Sale')
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
                    
                    {/* Status Badge: ONLY shown when set */}
                    {item.status && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow border ${
                          item.status === 'Sold' || item.sold
                            ? 'bg-rose-950/85 text-rose-300 border-rose-500/30'
                            : item.status === 'For Sale'
                            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/30'
                            : item.status === 'Reserved'
                            ? 'bg-amber-950/85 text-amber-300 border-amber-500/30'
                            : 'bg-slate-900/85 text-slate-300 border-slate-600/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    )}

                    {/* Video Tag & Year Indicator */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      {item.hasVideo && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-black/70 text-red-400 border border-red-500/30 flex items-center gap-1 backdrop-blur-sm">
                          <Play className="w-3 h-3 fill-red-500 text-red-500" />
                          <span>Video</span>
                        </span>
                      )}
                      {item.year && (
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
                      {item.hasVideo ? (
                        <Link
                          to={`/painting/${item.id}`}
                          className="p-3 rounded-full bg-studio-magenta hover:bg-studio-fuchsia text-white transition transform hover:scale-110 shadow-lg"
                          title="Watch Video"
                          aria-label="Watch video"
                        >
                          <Play className="w-5 h-5" />
                        </Link>
                      ) : (
                        <Link
                          to={`/painting/${item.id}`}
                          className="p-3 rounded-full bg-white/20 hover:bg-studio-magenta text-white transition transform hover:scale-110 shadow-lg"
                          title="View Artwork Details"
                          aria-label="View artwork details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      )}
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
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {[item.medium, item.size, item.year ? `(${item.year})` : null].filter(Boolean).join(' • ') || (item.hasVideo ? 'Painting Demonstration' : 'Original Artwork')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        {item.price && isForSale ? (
                          <span className="font-bold text-studio-gold text-sm">${item.price}</span>
                        ) : (
                          <span className="text-slate-400">{item.status || (item.hasVideo ? 'Video Tutorial' : 'Original Artwork')}</span>
                        )}
                        <Link
                          to={`/painting/${item.id}`}
                          className="text-xs font-semibold text-studio-magenta hover:underline"
                        >
                          {item.hasVideo ? 'Story & Video →' : 'Artwork Details →'}
                        </Link>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {isForSale ? (
                          <Link
                            to={`/contact?inquiry=${encodeURIComponent(item.title)}`}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-white/5 hover:bg-studio-magenta hover:text-white text-slate-200 transition"
                          >
                            {galleryText.inquireBuyBtn || "Inquire / Buy"}
                          </Link>
                        ) : (
                          <Link
                            to={`/painting/${item.id}`}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-white/5 hover:bg-white/10 text-slate-300 transition"
                          >
                            {galleryText.viewArtworkBtn || "View Artwork"}
                          </Link>
                        )}
                        {item.fineArtAmericaUrl && (
                          <a
                            href={item.fineArtAmericaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-studio-gold/15 hover:bg-studio-gold hover:text-black text-studio-gold transition flex items-center gap-1"
                            title="Prints on Fine Art America"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{galleryText.faaPrintsBtn || "FAA Prints"}</span>
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
                <span>{galleryText.loadMoreBtn || "Load More Artwork"} ({filteredPaintings.length - visibleCount} remaining)</span>
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

      {/* Slot: Bottom of page */}
      <PageBlocks blocks={galleryText.blockSlots?.bottom || galleryText.extraBlocks} />

    </div>
  )
}
