import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ExternalLink, Brush, Calendar, ShoppingBag } from 'lucide-react'
import siteData from '../data/site.json'
import paintingsData from '../data/paintings.json'

export default function Home() {
  const featuredPaintings = paintingsData.filter(p => p.featured).slice(0, 4)

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studio-card/80 border border-studio-magenta/30 text-xs sm:text-sm font-medium text-studio-magenta mb-8 shadow-glow-magenta backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-studio-gold" />
          <span>Original Fine Art • Methuen, Massachusetts</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Rick J Berube
        </h1>

        <p className="mt-4 font-serif italic text-xl sm:text-2xl text-studio-gold font-normal">
          "{siteData.artist.tagline}"
        </p>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {siteData.artist.bioShort}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/gallery"
            className="px-7 py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Explore The Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={siteData.socials.fineArtAmerica}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full text-sm font-semibold bg-studio-gold/15 border border-studio-gold/40 text-studio-gold hover:bg-studio-gold hover:text-black transition-all flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Prints on Fine Art America</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/commissions"
            className="px-6 py-3.5 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
          >
            <span>Request A Commission</span>
          </Link>
        </div>

        {/* Studio Highlights Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-xl text-center">
            <span className="block font-serif text-2xl font-bold text-white">500+</span>
            <span className="text-xs text-slate-400">Paintings Created</span>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <span className="block font-serif text-2xl font-bold text-studio-gold">2x</span>
            <span className="text-xs text-slate-400">Artist of the Month</span>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <span className="block font-serif text-2xl font-bold text-studio-magenta">Oil & Acrylic</span>
            <span className="text-xs text-slate-400">Fine Art Mediums</span>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <span className="block font-serif text-2xl font-bold text-studio-cobalt">YouTube</span>
            <span className="text-xs text-slate-400">Video Tutorials</span>
          </div>
        </div>

      </section>

      {/* Featured Paintings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-studio-magenta font-semibold">Featured Works</h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">Explore Highlighted Paintings</h3>
          </div>
          <Link 
            to="/gallery" 
            className="text-sm font-medium text-studio-gold hover:text-white flex items-center gap-1.5 transition"
          >
            <span>View All Categories</span>
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
                  src={painting.thumbnail} 
                  alt={painting.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${
                    painting.sold 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {painting.sold ? 'Sold' : 'Available'}
                  </span>
                </div>
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
                      Inquire / Buy
                    </Link>
                    {painting.fineArtAmericaUrl && (
                      <a
                        href={painting.fineArtAmericaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-center bg-studio-gold/10 hover:bg-studio-gold hover:text-black text-studio-gold transition"
                        title="Prints on Fine Art America"
                      >
                        FAA Print
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commissions & Prints Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-studio-magenta/20 bg-gradient-to-r from-studio-purple/10 via-studio-card to-studio-surface relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-studio-magenta/20 text-studio-magenta border border-studio-magenta/30">
              <Brush className="w-3.5 h-3.5" />
              <span>Custom Art Orders</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
              Looking for a custom portrait of family or a beloved pet?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              I create one-of-a-kind original painted and charcoal portraits from your photo references, signed and accompanied by a Certificate of Authenticity. Archival prints of original works are also available directly on Fine Art America.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link 
                to="/commissions"
                className="px-6 py-3 rounded-full text-sm font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition shadow-glow-magenta"
              >
                Learn About Commissions & Sizing
              </Link>
              <a 
                href={siteData.socials.fineArtAmerica}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-studio-gold hover:bg-white/10 transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Visit Fine Art America Shop</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows & Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-studio-gold">
              <Calendar className="w-4 h-4" />
              <span>Art Shows & In-Person Appearances</span>
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {siteData.upcomingEvents[0].title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              {siteData.upcomingEvents[0].date} • {siteData.upcomingEvents[0].location}
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition whitespace-nowrap"
          >
            Inquire About Future Booths
          </Link>
        </div>
      </section>

    </div>
  )
}
