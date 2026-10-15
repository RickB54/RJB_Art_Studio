import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Youtube, Play, ExternalLink, ArrowRight, Sparkles } from 'lucide-react'
import siteData from '../data/site.json'
import paintingsDataInitial from '../data/paintings.json'

export default function Videos() {
  const [paintings, setPaintings] = useState(paintingsDataInitial)
  const [activeVideoId, setActiveVideoId] = useState(null)

  // Sync with latest data
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings) setPaintings(data.paintings)
      })
      .catch(() => {})
  }, [])

  // Filter paintings that have video IDs
  const videoPaintings = paintings.filter(p => p.videoId || p.youtubeUrl)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-red-500 flex items-center justify-center gap-1.5">
          <Youtube className="w-4 h-4" />
          <span>YouTube Studio Demos</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Painting Tutorials & Time Lapses
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Step-by-step demonstrations, full-length wet-on-wet landscape tutorials, acrylic techniques, and portrait time lapses filmed directly in my Methuen studio.
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
              Subscribe on YouTube for weekly tutorials, techniques, and studio vlogs.
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

      {/* Videos Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-serif text-xl font-bold text-white">Latest Studio Videos</h3>
          <span className="text-xs text-slate-400">{videoPaintings.length} Videos Available</span>
        </div>

        {videoPaintings.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <p className="text-sm text-slate-400">
              No video links added yet. Paste YouTube links into <code className="text-studio-gold">paintings-urls.txt</code> or use the <Link to="/admin" className="text-studio-magenta underline">Admin Importer</Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoPaintings.map((painting) => {
              const isPlaying = activeVideoId === painting.videoId
              const displayImg = painting.customImage || painting.thumbnail

              return (
                <div
                  key={painting.id}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300"
                >
                  {/* Video Player / Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {isPlaying && painting.videoId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${painting.videoId}?autoplay=1&rel=0`}
                        title={painting.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div
                        className="relative w-full h-full cursor-pointer group"
                        onClick={() => setActiveVideoId(painting.videoId)}
                      >
                        <img
                          src={displayImg}
                          alt={painting.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-white translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold text-studio-magenta uppercase tracking-wider block">
                        {painting.category}
                      </span>
                      <h4 className="font-serif text-base font-bold text-white mt-1 line-clamp-2 group-hover:text-studio-gold transition-colors">
                        {painting.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {painting.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <Link
                        to={`/painting/${painting.id}`}
                        className="text-xs font-semibold text-studio-magenta hover:underline flex items-center gap-1"
                      >
                        <span>View Painting Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {painting.youtubeUrl && (
                        <a
                          href={painting.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>YouTube</span>
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
