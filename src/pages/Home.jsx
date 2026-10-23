import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ExternalLink, Brush, Calendar, ShoppingBag } from 'lucide-react'
import siteData from '../data/site.json'
import paintingsData from '../data/paintings.json'
import pagesData from '../data/pages.json'
import PageBlocks from '../components/PageBlocks'

export default function Home() {
  const [paintings, setPaintings] = useState(paintingsData)
  const [homeText, setHomeText] = useState(pagesData.home || {})

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings && Array.isArray(data.paintings)) setPaintings(data.paintings)
        if (data.pages?.home) setHomeText(data.pages.home)
      })
      .catch(() => {})
  }, [])

  const featuredPaintings = paintings.filter(p => p.featured || p.highlighted).slice(0, 4)

  const highlights = homeText.highlights || [
    { stat: "500+", label: "Paintings Created →", link: "/gallery" },
    { stat: "2x", label: "Artist of the Month →", link: "/about#awards" },
    { stat: "Oil & Acrylic", label: "Fine Art Mediums →", link: "/gallery" },
    { stat: "YouTube", label: "Video Tutorials →", link: "/videos" }
  ]

  const artShows = homeText.artShows || siteData.upcomingEvents || []

  return (
    <div className="space-y-24 sm:space-y-32">

      {/* Slot: Top of page */}
      <PageBlocks blocks={homeText.blockSlots?.top} />

      {/* Hero Section */}
      {homeText.heroVisible !== false && (
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studio-card/80 border border-studio-magenta/30 text-xs sm:text-sm font-medium text-studio-magenta mb-8 shadow-glow-magenta backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-studio-gold" />
            <span>{homeText.pillBadge || "Original Fine Art • Methuen, Massachusetts"}</span>
          </div>

          {/* Primary Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            {homeText.headline || "Rick J Berube"}
          </h1>

          <p className="mt-4 font-serif italic text-xl sm:text-2xl text-studio-gold font-normal">
            "{homeText.tagline || siteData.artist.tagline}"
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {homeText.bioShort || siteData.artist.bioShort}
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/gallery"
              className="px-7 py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>{homeText.primaryBtn || "Explore The Gallery"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={siteData.socials.fineArtAmerica}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full text-sm font-semibold bg-studio-gold/15 border border-studio-gold/40 text-studio-gold hover:bg-studio-gold hover:text-black transition-all flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{homeText.faaBtn || "Prints on Fine Art America"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/commissions"
              className="px-6 py-3.5 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <span>{homeText.commissionBtn || "Request A Commission"}</span>
            </Link>
          </div>

          {/* Studio Highlights Bar */}
          {homeText.highlightsVisible !== false && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {highlights.map((h, idx) => (
                <Link 
                  key={idx}
                  to={h.link || "/gallery"} 
                  className="glass-panel p-4 rounded-xl text-center hover:border-white/30 hover:scale-[1.03] transition-all duration-200 group block focus:outline-none focus:ring-2 focus:ring-studio-magenta"
                >
                  <span className="block font-serif text-2xl font-bold text-white group-hover:text-studio-magenta transition-colors">{h.stat}</span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{h.label}</span>
                </Link>
              ))}
            </div>
          )}

        </section>
      )}

      {/* Slot: After Hero */}
      <PageBlocks blocks={homeText.blockSlots?.after_hero} />

      {/* Featured Paintings Section */}
      {homeText.featuredVisible !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-studio-magenta font-semibold">
                {homeText.featuredHeading || "Featured Works"}
              </h2>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                {homeText.featuredTitle || "Explore Highlighted Paintings"}
              </h3>
            </div>
            <Link 
              to="/gallery" 
              className="text-sm font-medium text-studio-gold hover:text-white flex items-center gap-1.5 transition"
            >
              <span>{homeText.featuredLink || "View All Categories"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPaintings.map((painting) => (
              <div 
                key={painting.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group"
              >
                <div className="relative aspect-[4/3] bg-studio-surface overflow-hidden">
                  <img 
                    src={painting.highlightPhoto || painting.photo || painting.originalImage || painting.customImage || painting.thumbnail} 
                    alt={painting.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {painting.status ? (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow border ${
                        painting.status === 'Sold' || painting.sold
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                          : painting.status === 'For Sale'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : painting.status === 'Reserved'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-600/30'
                      }`}>
                        {painting.status}
                      </span>
                    </div>
                  ) : painting.sold ? (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-rose-950/80 text-rose-300 border border-rose-500/30">
                        Sold
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-studio-magenta uppercase tracking-wider">
                      {painting.category}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white mt-1 group-hover:text-studio-gold transition-colors">
                      {painting.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {painting.medium} • {painting.size}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{painting.year}</span>
                      {painting.price && !painting.sold && (
                        <span className="font-semibold text-studio-gold text-sm">${painting.price}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/contact?inquiry=${encodeURIComponent(painting.title)}`}
                        className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium text-center bg-white/5 hover:bg-studio-magenta hover:text-white text-slate-300 transition"
                      >
                        {homeText.inquireBtn || "Inquire / Buy"}
                      </Link>
                      {painting.fineArtAmericaUrl && (
                        <a
                          href={painting.fineArtAmericaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-center bg-studio-gold/10 hover:bg-studio-gold hover:text-black text-studio-gold transition"
                          title="Prints on Fine Art America"
                        >
                          {homeText.faaPrintBtn || "FAA Print"}
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Slot: After Featured */}
      <PageBlocks blocks={homeText.blockSlots?.after_featured} />

      {/* Commissions & Prints Teaser Banner */}
      {homeText.teaserVisible !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-studio-magenta/20 bg-gradient-to-r from-studio-purple/10 via-studio-card to-studio-surface relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-studio-magenta/20 text-studio-magenta border border-studio-magenta/30">
                <Brush className="w-3.5 h-3.5" />
                <span>{homeText.teaserBadge || "Custom Art Orders"}</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                {homeText.teaserTitle || "Looking for a custom portrait of family or a beloved pet?"}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {homeText.teaserText || "I create one-of-a-kind original painted and charcoal portraits from your photo references, signed and accompanied by a Certificate of Authenticity. Archival prints of original works are also available directly on Fine Art America."}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link 
                  to="/commissions"
                  className="px-6 py-3 rounded-full text-sm font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition shadow-glow-magenta"
                >
                  {homeText.teaserPrimaryBtn || "Learn About Commissions & Sizing"}
                </Link>
                <a 
                  href={siteData.socials.fineArtAmerica}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-studio-gold hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{homeText.teaserSecondaryBtn || "Visit Fine Art America Shop"}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slot: After Teaser */}
      <PageBlocks blocks={homeText.blockSlots?.after_teaser} />

      {/* Upcoming Shows & Events */}
      {homeText.artShowsVisible !== false && artShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {artShows.map((show, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-studio-gold">
                  <Calendar className="w-4 h-4" />
                  <span>{homeText.artShowsBadge || "Art Shows & In-Person Appearances"}</span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {show.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  {show.date} • {show.location}
                </p>
              </div>
              <Link
                to={homeText.artShowsLink || "/contact"}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition whitespace-nowrap"
              >
                {homeText.artShowsBtn || "Inquire About Future Booths"}
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Slot: After Shows / Bottom */}
      <PageBlocks blocks={homeText.blockSlots?.bottom || homeText.extraBlocks} />

    </div>
  )
}
