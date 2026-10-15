import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Youtube, ExternalLink, PlaySquare, Layers, AlertCircle, ArrowRight } from 'lucide-react'
import siteData from '../data/site.json'
import initialPlaylists from '../data/playlists.json'

export default function Videos() {
  const [playlists, setPlaylists] = useState(initialPlaylists)

  // Sync with dev API if running
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.playlists && Array.isArray(data.playlists)) {
          setPlaylists(data.playlists)
        }
      })
      .catch(() => {})
  }, [])

  // Filter visible playlists and sort by order
  const visiblePlaylists = playlists
    .filter(p => p.show !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-red-500 flex items-center justify-center gap-1.5">
          <Youtube className="w-4 h-4" />
          <span>YouTube Studio Playlists</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Video Gallery & Playlists
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Select any collection below to browse full-length demonstrations, time lapses, and painting techniques categorized directly from my YouTube channel.
        </p>
      </div>

      {/* Featured Channel Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/30 via-studio-card to-studio-surface flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Youtube className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Rick J Berube Art Studio</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Subscribe on YouTube for weekly tutorials, techniques, and studio demonstrations.
            </p>
          </div>
        </div>
        <a
          href={siteData.socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <span>Subscribe on YouTube</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Playlists Grid: EXACTLY ONE CARD PER PLAYLIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-studio-magenta" />
            <span>Featured Playlists</span>
          </h3>
          <span className="text-xs text-slate-400">{visiblePlaylists.length} Playlists</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePlaylists.map((pl) => {
            const coverVideoId = pl.coverVideoId || (pl.videos && pl.videos[0]?.id)
            const hasVideos = pl.videos && pl.videos.length > 0
            const totalCount = pl.videoCount || (pl.videos ? pl.videos.length : 0)
            const coverThumbnail = coverVideoId
              ? `https://i.ytimg.com/vi/${coverVideoId}/mqdefault.jpg`
              : null

            return (
              <Link
                key={pl.playlistId}
                to={`/videos/${pl.playlistId}`}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300"
              >
                {/* Single Cover Thumbnail */}
                <div className="relative aspect-video bg-studio-surface overflow-hidden flex items-center justify-center">
                  {coverThumbnail ? (
                    <img
                      src={coverThumbnail}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-studio-card via-studio-surface to-black flex flex-col items-center justify-center p-4 text-center">
                      <PlaySquare className="w-10 h-10 text-white/20 mb-2" />
                      <span className="text-xs text-slate-400 font-serif">{pl.title}</span>
                    </div>
                  )}

                  {/* Video count overlay badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center gap-1.5 shadow">
                      <Layers className="w-3 h-3 text-studio-gold" />
                      <span>{totalCount} {totalCount === 1 ? 'video' : 'videos'}</span>
                    </span>
                  </div>

                  {/* Sync status overlay */}
                  {!hasVideos && (
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Sync needed</span>
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-studio-magenta text-white shadow-glow-magenta flex items-center gap-1.5 transform group-hover:scale-105 transition-transform">
                      <span>Browse Playlist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white group-hover:text-studio-gold transition-colors">
                      {pl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {totalCount} videos in playlist
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-studio-magenta font-semibold">
                    <span>View Videos</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
