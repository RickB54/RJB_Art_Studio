import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Youtube, Facebook, Instagram, Pin, Heart } from 'lucide-react'
import siteData from '../data/site.json'
import { PRICE_LISTS } from '../data/priceLists'
import PriceListModal from './PriceListModal'

export default function Footer() {
  const [activePriceList, setActivePriceList] = useState(null)
  return (
    <footer className="mt-24 border-t border-white/5 bg-studio-surface/80 backdrop-blur-md">
      
      {/* Site Migration Notice Bar */}
      <div className="border-b border-white/5 bg-studio-purple/10 py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm text-slate-300">
          <span className="font-semibold text-studio-gold mr-1.5">Notice:</span>
          {siteData.artist.siteMigrationNotice}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-studio-card flex items-center justify-center border border-white/10">
                <img src="/palette-icon.svg" alt="RJB" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">{siteData.artist.studioName}</h3>
                <p className="text-xs text-studio-gold font-medium">{siteData.artist.location}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {siteData.artist.tagline} {siteData.artist.bioShort}
            </p>
            {siteData.contact?.email && (
              <div className="inline-flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="text-studio-gold font-semibold">Artist Direct Email:</span>
                <a
                  href={`mailto:${siteData.contact.email}`}
                  className="text-white hover:text-studio-magenta font-mono transition underline decoration-studio-magenta/40"
                  title="Click to email Rick directly"
                >
                  {siteData.contact.email}
                </a>
              </div>
            )}
            {siteData.artist?.announcement && siteData.artist.announcement.trim() !== '' && (
              <div className="inline-block p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="text-studio-magenta font-semibold">Studio Update: </span>
                {siteData.artist.announcement}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/gallery" className="hover:text-studio-magenta transition">Original Art Gallery</Link></li>
              <li><Link to="/about" className="hover:text-studio-magenta transition">About the Artist & Studio</Link></li>
              <li><Link to="/commissions" className="hover:text-studio-magenta transition">Commissions & Pricing</Link></li>
              <li><Link to="/videos" className="hover:text-studio-magenta transition">YouTube Painting Tutorials</Link></li>
              <li><Link to="/contact" className="hover:text-studio-magenta transition">Contact Rick</Link></li>
            </ul>
          </div>

          {/* Socials & Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Connect</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={siteData.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-white/10 transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={siteData.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-white/10 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={siteData.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-white/10 transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={siteData.socials.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest Boards"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-white/10 transition"
              >
                <Pin className="w-5 h-5" />
              </a>
              <a
                href={siteData.socials.x || siteData.socials.twitter || 'https://x.com/rjbartstudio'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={siteData.socials.fineArtAmerica}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fine Art America Prints"
                className="w-10 h-10 rounded-lg bg-studio-gold/15 border border-studio-gold/30 flex items-center justify-center text-studio-gold hover:bg-studio-gold hover:text-black transition"
                title="Fine Art America Prints"
              >
                <span className="font-serif font-black text-xs">FAA</span>
              </a>
            </div>
            <a
              href={siteData.socials.fineArtAmerica}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-studio-gold hover:bg-white/10 transition mt-2"
            >
              <span>Prints on Fine Art America</span>
              <span className="text-[10px] text-slate-400">↗</span>
            </a>
            <p className="text-xs text-slate-500 pt-2">
              All links can be edited in <code className="text-slate-400">src/data/site.json</code>.
            </p>
          </div>

        </div>

        {/* Price Lists Quick Thumbnails */}
        <div className="mt-10 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-studio-gold">
                Official Price Lists
              </h4>
              <p className="text-xs text-slate-400">
                Click any price list to view full screen, download PDF, or print
              </p>
            </div>
            <Link to="/commissions" className="text-xs text-studio-magenta hover:underline">
              View Commissions & Prints page →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRICE_LISTS.map((pl) => (
              <button
                type="button"
                key={pl.id}
                onClick={() => setActivePriceList(pl)}
                className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-studio-gold/50 transition flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-studio-gold text-left"
              >
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/60 border border-white/5 mb-2 relative">
                  <img
                    src={pl.thumb}
                    alt={pl.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <span className="text-xs font-serif font-bold text-white group-hover:text-studio-gold transition line-clamp-1">
                  {pl.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">View Price List</span>
              </button>
            ))}
          </div>
        </div>

        {activePriceList && (
          <PriceListModal item={activePriceList} onClose={() => setActivePriceList(null)} />
        )}

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Rick J Berube Art Studio. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Fine Art from Methuen, MA
          </p>
        </div>
      </div>
    </footer>
  )
}
