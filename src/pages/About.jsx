import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, Palette, Home, Heart, ArrowRight, Play, ExternalLink, Film } from 'lucide-react'
import siteData from '../data/site.json'
import pagesData from '../data/pages.json'
import PageBlocks from '../components/PageBlocks'

function getYouTubeVideoId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
  return m ? m[1] : null
}

export default function About() {
  const [aboutText, setAboutText] = useState(pagesData.about || {})

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.pages?.about) setAboutText(data.pages.about)
      })
      .catch(() => {})
  }, [])

  const awards = aboutText.awards || siteData.awards || []
  const studioStats = aboutText.studioStats || [
    { value: "33' × 17'", label: "Dedicated Creative Space" },
    { value: "4K DSLR", label: "Video Capture Setup →", link: "/videos" },
    { value: "Oil & Acrylic", label: "Custom Easel Stations →", link: "/gallery" }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Slot: Top */}
      <PageBlocks blocks={aboutText.blockSlots?.top} />

      {/* Header */}
      {aboutText.headerVisible !== false && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
            {aboutText.badge || "The Artist & Studio"}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {aboutText.title || "About Rick J Berube"}
          </h1>
          <p className="font-serif italic text-xl text-studio-gold">
            "{aboutText.tagline || siteData.artist.tagline}"
          </p>
        </div>
      )}

      {/* Slot: After Header */}
      <PageBlocks blocks={aboutText.blockSlots?.after_header} />

      {/* Main Bio Card */}
      {aboutText.journeyVisible !== false && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-full bg-studio-magenta/20 flex items-center justify-center text-studio-magenta border border-studio-magenta/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {aboutText.journeyTitle || "Artistic Journey"}
              </h2>
              <p className="text-xs text-slate-400">
                {aboutText.journeySubtitle || "Methuen, Massachusetts • Self-Taught Painter"}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            <p>
              {aboutText.bioExtended || siteData.artist.bioExtended}
            </p>
            {(aboutText.aboutPhoto || siteData.artist.aboutPhoto) && (
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black/40 border border-white/10 my-4">
                <img 
                  src={aboutText.aboutPhoto || siteData.artist.aboutPhoto} 
                  alt={aboutText.title || "Rick J Berube in Studio"} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            {aboutText.storyParagraph2 && (
              <p>
                {aboutText.storyParagraph2}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Slot: Under Artistic Journey */}
      <PageBlocks blocks={aboutText.blockSlots?.after_journey} />

      {/* Mayoral Awards & Honors */}
      {aboutText.awardsVisible !== false && awards.length > 0 && (
        <div id="awards" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-studio-gold" />
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {aboutText.awardsTitle || "Awards & Recognition"}
              </h2>
              <p className="text-xs text-slate-400">
                {aboutText.awardsSubtitle || "Honors bestowed by the City of Methuen Mayor's Office"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, i) => (
              <div
                key={i}
                className="glass-panel p-6 sm:p-7 rounded-2xl border border-studio-gold/20 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-studio-gold text-black uppercase tracking-wider">
                    {award.title}
                  </span>

                  {award.image && (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-white/10 my-2">
                      <img src={award.image} alt={award.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-serif text-xl font-bold text-white">
                    Featured Artwork: "{award.artwork}"
                  </h3>
                  <p className="text-xs text-studio-gold/90 font-medium">
                    {award.conferredBy} • {award.medium}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed whitespace-pre-line">
                    {award.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>{aboutText.awardsFooter || "Display Location: Methuen City Hall Rotunda"}</span>
                  <span className="text-studio-gold font-serif">★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slot: After Awards & Recognition */}
      <PageBlocks blocks={aboutText.blockSlots?.after_awards} />

      {/* The Studio Story */}
      {aboutText.studioVisible !== false && (
        <div id="the-studio" className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-full bg-studio-cobalt/20 flex items-center justify-center text-studio-cobalt border border-studio-cobalt/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {aboutText.studioTitle || "The Studio (\"Where The Magic Happens\")"}
              </h2>
              <p className="text-xs text-slate-400">
                {aboutText.studioSubtitle || "Dedicated Art & Video Recording Facility"}
              </p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {aboutText.studioDescription || "In 2019, I designed and custom-built my own dedicated 33' x 17' painting and video recording studio in Methuen. Equipped with natural lighting, multiple DSLR overhead video angles, and specialized wet-on-wet easels, this studio is where every painting comes to life and where each YouTube demonstration video is produced."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {studioStats.map((stat, idx) => {
              const videoId = getYouTubeVideoId(stat.link)
              const thumbUrl = stat.thumbnail || stat.image || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '')
              const isExternal = stat.link && (stat.link.startsWith('http://') || stat.link.startsWith('https://') || stat.link.startsWith('//'))

              const cardContent = (
                <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 h-full border border-white/10 hover:border-studio-gold/50 shadow-md hover:shadow-xl">
                  {/* Thumbnail / Media Container */}
                  <div className="relative aspect-video bg-studio-surface overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={stat.value || stat.label || 'Studio Video'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-slate-500">
                        <Film className="w-8 h-8" />
                      </div>
                    )}

                    {/* Play Button Overlay (when video link present) */}
                    {stat.link && (
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-transform">
                          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-studio-gold transition-colors">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {stat.label}
                      </p>
                    </div>

                    {stat.link && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-studio-gold font-semibold">
                        <span className="flex items-center gap-1">
                          <span>Watch Video</span>
                          {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    )}
                  </div>
                </div>
              )

              if (stat.link) {
                if (isExternal) {
                  return (
                    <a
                      key={idx}
                      href={stat.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block focus:outline-none focus:ring-2 focus:ring-studio-gold rounded-2xl h-full"
                      title={`Watch: ${stat.value}`}
                    >
                      {cardContent}
                    </a>
                  )
                }
                return (
                  <Link
                    key={idx}
                    to={stat.link}
                    className="block focus:outline-none focus:ring-2 focus:ring-studio-gold rounded-2xl h-full"
                    title={stat.value}
                  >
                    {cardContent}
                  </Link>
                )
              }

              return (
                <div key={idx} className="block h-full">
                  {cardContent}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Slot: After Studio */}
      <PageBlocks blocks={aboutText.blockSlots?.after_studio} />

      {/* Call to Action Bar */}
      {aboutText.ctaVisible !== false && (
        <div className="glass-panel p-8 rounded-2xl border border-studio-magenta/30 bg-gradient-to-r from-studio-purple/20 via-studio-card to-studio-surface text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold text-white">
            {aboutText.ctaTitle || "Interested in working together or purchasing art?"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto whitespace-pre-line">
            {aboutText.ctaDescription || "Browse the gallery of paintings, inquire about custom portrait commissions, or reach out with any questions."}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/gallery"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition shadow-glow-magenta"
            >
              {aboutText.ctaGalleryBtn || "Browse The Gallery"}
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
            >
              {aboutText.ctaContactBtn || "Contact Rick Directly"}
            </Link>
          </div>
        </div>
      )}

      {/* Slot: After CTA */}
      <PageBlocks blocks={aboutText.blockSlots?.after_cta} />

      {/* Slot: Bottom */}
      <PageBlocks blocks={aboutText.blockSlots?.bottom || aboutText.extraBlocks} />

    </div>
  )
}
