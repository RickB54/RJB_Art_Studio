import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, AlertCircle, ShoppingBag, MessageSquare, Image as ImageIcon, Sparkles, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import initialPlaylists from '../data/playlists.json'
import initialPaintings from '../data/paintings.json'

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

export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [paintings, setPaintings] = useState(initialPaintings)

  // Active playing video state
  const [activeVideo, setActiveVideo] = useState(null)
  const [isVideoIframeLoaded, setIsVideoIframeLoaded] = useState(false)

  // Pagination state ("Load more")
  const PAGE_SIZE = 24
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Sync latest data from dev API
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.playlists) setPlaylists(data.playlists)
        if (data.paintings) setPaintings(data.paintings)
      })
      .catch(() => {})
  }, [])

  // Find playlist
  const playlist = playlists.find(p => p.playlistId === playlistId)

  // When playlistId changes, reset active video and pagination
  useEffect(() => {
    setActiveVideo(null)
    setIsVideoIframeLoaded(false)
    setVisibleCount(PAGE_SIZE)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [playlistId])

  if (!playlist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-white">Playlist Not Found</h1>
        <p className="text-slate-400 text-sm">The requested video collection does not exist.</p>
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Playlists</span>
        </Link>
      </div>
    )
  }

  const allVideos = playlist.videos || []
  const visibleVideos = allVideos.slice(0, visibleCount)
  const hasMore = visibleCount < allVideos.length

  // Match active video with paintings.json
  const matchedPainting = activeVideo
    ? paintings.find(p => p.videoId === activeVideo.id || (p.youtubeUrl && p.youtubeUrl.includes(activeVideo.id)))
    : null

  const originalPhoto = matchedPainting?.originalImage || matchedPainting?.customImage || matchedPainting?.thumbnail || null

  const handleSelectVideo = (video) => {
    setActiveVideo(video)
    setIsVideoIframeLoaded(false)
    // Scroll up smoothly to the player
    const playerEl = document.getElementById('video-player-section')
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Playlists</span>
        </Link>
        <span className="text-xs text-studio-gold font-medium">
          {playlist.videoCount || allVideos.length} Total Videos
        </span>
      </div>

      {/* Playlist Title & Meta */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-studio-magenta">
          YouTube Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {playlist.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Watch time-lapse demonstrations and instructional videos. Click any video thumbnail below to load the player with its painting details and high-resolution photo.
        </p>
      </div>

      {/* ACTIVE VIDEO PLAYER & ORIGINAL PAINTING PHOTO SECTION */}
      {activeVideo && (
        <div id="video-player-section" className="glass-panel rounded-3xl p-6 sm:p-8 border border-studio-magenta/30 shadow-glow-magenta space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Now Playing</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Close Player</span>
            </button>
          </div>

          {/* TWO-COLUMN DESKTOP / STACKED MOBILE LAYOUT: VIDEO + ORIGINAL PAINTING PHOTO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Column: YouTube Video Embed (click-to-load) */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center">
              {isVideoIframeLoaded ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setIsVideoIframeLoaded(true)}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${activeVideo.id}/hqdefault.jpg`}
                    alt={activeVideo.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-white translate-x-0.5" />
                    </div>
                    <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10">
                      Click to Play Video
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Original Painting Photo */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-studio-surface border border-white/10 shadow-lg flex items-center justify-center group">
              {originalPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={originalPhoto}
                    alt={matchedPainting?.title || activeVideo.title}
                    className="w-full h-full object-contain bg-black/50"
                  />
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/80 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-studio-gold" />
                      <span>Original Painting Photograph</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-6 bg-gradient-to-br from-studio-card to-black flex flex-col items-center justify-center text-center space-y-3">
                  <ImageIcon className="w-12 h-12 text-white/20" />
                  <div>
                    <h5 className="font-serif text-sm font-bold text-white">Original Painting Photo</h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      {matchedPainting ? 'Photo can be uploaded or linked in the Studio Admin.' : 'Direct photo attachment available once synced.'}
                    </p>
                  </div>
                  <img
                    src={`https://i.ytimg.com/vi/${activeVideo.id}/hqdefault.jpg`}
                    alt=""
                    className="w-24 h-14 object-cover rounded-lg opacity-40 border border-white/10"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Details, Description & Inquire Actions */}
          <div className="pt-2 border-t border-white/5 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {matchedPainting?.title || activeVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  {matchedPainting?.medium && <span>{matchedPainting.medium}</span>}
                  {matchedPainting?.size && <span>• {matchedPainting.size}</span>}
                  {matchedPainting?.year && <span>• {matchedPainting.year}</span>}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    matchedPainting?.sold
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {matchedPainting?.sold ? 'Sold' : 'Available'}
                  </span>
                  {matchedPainting?.price && !matchedPainting.sold && (
                    <span className="font-bold text-studio-gold text-sm">${matchedPainting.price}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/contact?inquiry=${encodeURIComponent(matchedPainting?.title || activeVideo.title)}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition flex items-center gap-1.5 shadow-glow-magenta"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Buy / Inquire</span>
                </Link>

                {matchedPainting?.fineArtAmericaUrl && (
                  <a
                    href={matchedPainting.fineArtAmericaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-studio-gold/15 border border-studio-gold/30 text-studio-gold hover:bg-studio-gold hover:text-black transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Prints on FAA</span>
                  </a>
                )}
              </div>
            </div>

            {/* Description Area */}
            {matchedPainting?.description && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-gold">Artwork Story & Details</span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {renderDescriptionWithLinks(matchedPainting.description)}
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIDEOS GRID / EMPTY STATE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-serif text-xl font-bold text-white">
            Playlist Videos ({allVideos.length})
          </h3>
          {allVideos.length > 0 && (
            <span className="text-xs text-slate-400">
              Showing {visibleVideos.length} of {allVideos.length}
            </span>
          )}
        </div>

        {allVideos.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border border-studio-gold/30 text-center max-w-2xl mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-studio-gold mx-auto" />
            <h4 className="font-serif text-xl font-bold text-white">Sync Needed from YouTube</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This playlist has <span className="font-bold text-studio-gold">{playlist.videoCount}</span> public videos on your YouTube channel. When you are ready for Part B, our YouTube API sync tool will fetch all {playlist.videoCount} video titles and IDs directly into this list.
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition"
              >
                <span>Open Studio Admin</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleVideos.map((video) => {
                const isActive = activeVideo?.id === video.id
                const paintingMatch = paintings.find(p => p.videoId === video.id || (p.youtubeUrl && p.youtubeUrl.includes(video.id)))

                return (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 group ${
                      isActive ? 'ring-2 ring-studio-magenta border-studio-magenta/60' : ''
                    }`}
                  >
                    {/* Thumbnail: mqdefault from YouTube image server */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Play overlay button */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>

                      {/* Sold / Available indicator if in paintings.json */}
                      {paintingMatch && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md ${
                            paintingMatch.sold ? 'bg-rose-950/90 text-rose-300' : 'bg-emerald-950/90 text-emerald-300'
                          }`}>
                            {paintingMatch.sold ? 'Sold' : 'Available'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Title */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <h4 className="font-serif text-xs font-bold text-white line-clamp-2 group-hover:text-studio-gold transition-colors">
                        {video.title}
                      </h4>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-studio-magenta font-semibold flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          <span>Watch Demo</span>
                        </span>
                        {paintingMatch?.price && !paintingMatch.sold && (
                          <span className="text-studio-gold font-bold">${paintingMatch.price}</span>
                        )}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* "Load More" Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="px-8 py-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-studio-magenta text-white transition flex items-center gap-2 mx-auto shadow-md"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Load More Videos ({allVideos.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}
