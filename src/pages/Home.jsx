import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ExternalLink, Brush, Calendar, ShoppingBag, Ticket, Edit3 } from 'lucide-react'
import siteData from '../data/site.json'
import paintingsData from '../data/paintings.json'
import pagesData from '../data/pages.json'
import PageBlocks, { BlockVideoEmbed, MediaEmbed } from '../components/PageBlocks'
import SectionWrap from '../components/SectionWrap'
import BuyButtons from '../components/BuyButtons'
import AttendShowModal from '../components/AttendShowModal'
import ArtShowsManagerModal from '../components/ArtShowsManagerModal'

const isLocalhost = Boolean(
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  ))
)

export default function Home() {
  const [paintings, setPaintings] = useState(paintingsData)
  const [homeText, setHomeText] = useState(pagesData.home || {})
  const [selectedAttendShow, setSelectedAttendShow] = useState(null)
  const [showAdminShowsModal, setShowAdminShowsModal] = useState(false)

  const handleSaveShows = async ({ activeShows, allDiscoveredShows }) => {
    const updatedHome = {
      ...homeText,
      artShows: activeShows,
      allDiscoveredShows: allDiscoveredShows
    }
    const updatedPages = {
      ...pagesData,
      home: updatedHome
    }
    setHomeText(updatedHome)

    try {
      await fetch('/__api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: updatedPages })
      })
    } catch (e) {
      console.error('Failed to save art shows to server:', e)
    }
  }

  useEffect(() => {
    fetch('/__api/data' + (window.location.search || ''))
      .then(res => res.json())
      .then(data => {
        if (data.paintings && Array.isArray(data.paintings)) setPaintings(data.paintings)
        if (data.pages?.home) setHomeText(data.pages.home)
      })
      .catch(() => {})
  }, [])

  const cleanPhotoUrl = (raw) => {
    if (!raw || typeof raw !== 'string') return ''
    const t = raw.trim()
    if (!t) return ''
    if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
    return '/' + t.replace(/^(\.\/)?(public\/)?/, '').replace(/^\/+/, '')
  }

  // Use new unified featuredItems if configured, else fall back to legacy featured flag on paintings
  const featuredItems = homeText.featuredItems
  const featuredPaintings = featuredItems && featuredItems.length > 0
    ? featuredItems.slice(0, 4).map(fi => {
        // Merge with live painting data if available
        const livePainting = paintings.find(p => p.id === fi.id)
        const rawPhoto = fi.highlightPhoto || livePainting?.highlightPhoto || livePainting?.photo || livePainting?.originalImage || livePainting?.customImage || livePainting?.thumbnail || livePainting?.thumbnailUrl || fi.thumb || ''
        const cleanPhoto = rawPhoto && typeof rawPhoto === 'string' && !rawPhoto.startsWith('http://') && !rawPhoto.startsWith('https://') && !rawPhoto.startsWith('data:')
          ? ('/' + rawPhoto.replace(/^(\.\/)?(public\/)?/, '').replace(/^\/+/, ''))
          : rawPhoto

        return {
          ...(livePainting || {}),
          ...fi,
          // Override display fields from featuredItems
          title: fi.title || livePainting?.title || '(Untitled)',
          highlightPhoto: cleanPhoto,
          price: fi.price !== undefined && fi.price !== '' ? fi.price : livePainting?.price,
          status: fi.badge || livePainting?.status,
          fineArtAmericaUrl: fi.fineArtAmericaUrl || livePainting?.fineArtAmericaUrl || '',
          category: fi.category || livePainting?.category || '',
          medium: fi.medium || livePainting?.medium || '',
          size: fi.size || livePainting?.size || '',
          sale: fi.sale || livePainting?.sale || null,
        }
      })
    : paintings.filter(p => p.featured || p.highlighted).slice(0, 4)

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
      <SectionWrap
        id="hero"
        spaceAbove={homeText.sectionSpacing?.hero?.spaceAbove}
        spaceBelow={homeText.sectionSpacing?.hero?.spaceBelow}
        customSpaceAbove={homeText.sectionSpacing?.hero?.customSpaceAbove}
        customSpaceBelow={homeText.sectionSpacing?.hero?.customSpaceBelow}
        visible={homeText.heroVisible !== false}
      >
        <section className="relative pt-12 pb-6 sm:pt-20 sm:pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
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
      </SectionWrap>

      {/* Slot: After Hero */}
      <PageBlocks blocks={homeText.blockSlots?.after_hero} />

      {/* Featured Paintings Section */}
      <SectionWrap
        id="featured"
        spaceAbove={homeText.sectionSpacing?.featured?.spaceAbove}
        spaceBelow={homeText.sectionSpacing?.featured?.spaceBelow}
        customSpaceAbove={homeText.sectionSpacing?.featured?.customSpaceAbove}
        customSpaceBelow={homeText.sectionSpacing?.featured?.customSpaceBelow}
        visible={homeText.featuredVisible !== false}
      >
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
                    src={painting.highlightPhoto || painting.photo || painting.originalImage || painting.customImage || painting.thumbnail || painting.thumbnailUrl || painting.thumb} 
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
                    
                    <BuyButtons painting={painting} compact className="pt-1" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
      </SectionWrap>

      {/* Slot: After Featured */}
      <PageBlocks blocks={homeText.blockSlots?.after_featured} />

      {/* Commissions & Prints Teaser Banner */}
      {(() => {
        const teaserImg1 = cleanPhotoUrl(homeText.teaserImage)
        const teaserImg2 = cleanPhotoUrl(homeText.teaserImage2)
        const teaserImages = [teaserImg1, teaserImg2].filter(Boolean)
        const teaserPos = homeText.teaserImagePosition || 'right'

        const renderTeaserContent = () => (
          <div className="space-y-4">
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
        )

        const teaserVideo = homeText.teaserVideoUrl
        const hasTeaserMedia = teaserImages.length > 0 || !!teaserVideo

        const renderTeaserMedia = () => {
          if (!hasTeaserMedia) return null
          return (
            <div className="space-y-4 w-full">
              {teaserImages.length > 0 && (
                <div className={teaserImages.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full" : "w-full"}>
                  {teaserImages.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-xl group">
                      <img
                        src={img}
                        alt={`${homeText.teaserTitle || 'Custom portrait'} - ${i + 1}`}
                        className="w-full h-56 sm:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
              {teaserVideo && (
                <div className="w-full">
                  <MediaEmbed
                    url={teaserVideo}
                    poster={homeText.teaserVideoPoster}
                    title={homeText.teaserTitle || 'Portrait Video'}
                  />
                </div>
              )}
            </div>
          )
        }

        return (
          <SectionWrap
            id="teaser"
            spaceAbove={homeText.sectionSpacing?.teaser?.spaceAbove}
            spaceBelow={homeText.sectionSpacing?.teaser?.spaceBelow}
            customSpaceAbove={homeText.sectionSpacing?.teaser?.customSpaceAbove}
            customSpaceBelow={homeText.sectionSpacing?.teaser?.customSpaceBelow}
            visible={homeText.teaserVisible !== false}
          >
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-studio-magenta/20 bg-gradient-to-r from-studio-purple/10 via-studio-card to-studio-surface relative overflow-hidden">
                {!hasTeaserMedia ? (
                  <div className="max-w-2xl relative z-10">
                    {renderTeaserContent()}
                  </div>
                ) : teaserPos === 'above' ? (
                  <div className="relative z-10 space-y-8">
                    {renderTeaserMedia()}
                    <div className="max-w-3xl">{renderTeaserContent()}</div>
                  </div>
                ) : teaserPos === 'below' ? (
                  <div className="relative z-10 space-y-8">
                    <div className="max-w-3xl">{renderTeaserContent()}</div>
                    {renderTeaserMedia()}
                  </div>
                ) : teaserPos === 'left' ? (
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="order-2 lg:order-1">{renderTeaserMedia()}</div>
                    <div className="order-1 lg:order-2">{renderTeaserContent()}</div>
                  </div>
                ) : (
                  /* default: right */
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="order-1">{renderTeaserContent()}</div>
                    <div className="order-2">{renderTeaserMedia()}</div>
                  </div>
                )}
              </div>
            </section>
          </SectionWrap>
        )
      })()}

      {/* Slot: After Teaser */}
      <PageBlocks blocks={homeText.blockSlots?.after_teaser} />

      {/* Upcoming Shows & Events */}
      <SectionWrap
        id="artShows"
        spaceAbove={homeText.sectionSpacing?.artShows?.spaceAbove}
        spaceBelow={homeText.sectionSpacing?.artShows?.spaceBelow}
        customSpaceAbove={homeText.sectionSpacing?.artShows?.customSpaceAbove}
        customSpaceBelow={homeText.sectionSpacing?.artShows?.customSpaceBelow}
        visible={homeText.artShowsVisible !== false && (artShows.length > 0 || isLocalhost)}
      >
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Admin Action: Button on home page for Admin use only */}
          {isLocalhost && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-studio-gold/15 via-studio-card to-studio-magenta/15 border border-studio-gold/40 shadow-lg">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-studio-gold text-slate-950 uppercase tracking-wider">
                    Admin Only
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Local Art Shows Finder (30-Mile Radius)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Search & check off shows within 30 miles of 54 Boston St, Methuen MA to publish to this section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminShowsModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-studio-gold hover:bg-studio-gold-light text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shrink-0"
                title="Open Admin Art Shows Manager"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find & Manage Shows (Admin)</span>
              </button>
            </div>
          )}

          {artShows.length === 0 && isLocalhost && (
            <div className="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400 border border-dashed border-white/15 space-y-3">
              <p>No art shows are currently checked off to show on the live site.</p>
              <button
                type="button"
                onClick={() => setShowAdminShowsModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-studio-gold text-slate-950 hover:bg-studio-gold-light transition inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Shows Spreadsheet & Check Off Shows</span>
              </button>
            </div>
          )}

          {artShows.map((show, idx) => {
            const showImg1 = cleanPhotoUrl(show.image)
            const showImg2 = cleanPhotoUrl(show.image2)
            const showImages = [showImg1, showImg2].filter(Boolean)
            const showVideo = show.videoUrl
            const hasShowMedia = showImages.length > 0 || !!showVideo
            const showPos = show.imagePosition || homeText.artShowsImagePosition || 'right'

            const renderShowText = () => (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-studio-gold">
                  <Calendar className="w-4 h-4" />
                  <span>{homeText.artShowsBadge || "Art Shows & In-Person Appearances"}</span>
                  {show.distanceMiles !== undefined && show.distanceMiles !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                      {show.distanceMiles} mi away
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {show.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {show.date} • {show.location}
                </p>
                {show.cost && (
                  <p className="text-xs text-emerald-300 font-medium">
                    Admission: {show.cost}
                  </p>
                )}
              </div>
            )

            const renderShowBtn = () => (
              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAttendShow(show)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple hover:opacity-95 text-white transition whitespace-nowrap shadow-glow-magenta flex items-center gap-1.5"
                  title="View attendee details, cost, snow dates, directions"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Attend / Show Details</span>
                </button>
                <Link
                  to={homeText.artShowsLink || "/contact"}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition whitespace-nowrap"
                >
                  {homeText.artShowsBtn || "Inquire About Future Booths"}
                </Link>
                {isLocalhost && (
                  <button
                    type="button"
                    onClick={() => setShowAdminShowsModal(true)}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-studio-gold/15 text-studio-gold hover:bg-studio-gold hover:text-black transition border border-studio-gold/30"
                    title="Edit in Admin Shows Spreadsheet"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )

            const renderShowMedia = () => {
              if (!hasShowMedia) return null
              return (
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 max-w-full sm:max-w-md">
                  {showImages.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-md group shrink-0">
                      <img
                        src={img}
                        alt={`${show.title} photo ${i + 1}`}
                        className="w-32 sm:w-40 h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  {showVideo && (
                    <div className="w-full sm:w-48 aspect-video shrink-0">
                      <MediaEmbed
                        url={showVideo}
                        poster={show.videoPoster}
                        title={show.title}
                      />
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div key={idx} className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
                {!hasShowMedia ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {renderShowText()}
                    {renderShowBtn()}
                  </div>
                ) : showPos === 'above' ? (
                  <div className="space-y-4">
                    {renderShowMedia()}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {renderShowText()}
                      {renderShowBtn()}
                    </div>
                  </div>
                ) : showPos === 'below' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {renderShowText()}
                      {renderShowBtn()}
                    </div>
                    {renderShowMedia()}
                  </div>
                ) : showPos === 'left' ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {renderShowMedia()}
                      {renderShowText()}
                    </div>
                    {renderShowBtn()}
                  </div>
                ) : (
                  /* default: right */
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">{renderShowText()}</div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {renderShowMedia()}
                      {renderShowBtn()}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </SectionWrap>

      {/* Slot: After Shows / Bottom */}
      <PageBlocks blocks={homeText.blockSlots?.bottom || homeText.extraBlocks} />

      {/* Attend Show Modal */}
      {selectedAttendShow && (
        <AttendShowModal
          show={selectedAttendShow}
          onClose={() => setSelectedAttendShow(null)}
        />
      )}

      {/* Admin Art Shows Manager Modal */}
      {showAdminShowsModal && (
        <ArtShowsManagerModal
          currentShows={artShows}
          savedCatalog={homeText.allDiscoveredShows || []}
          onSave={handleSaveShows}
          onClose={() => setShowAdminShowsModal(false)}
        />
      )}

    </div>
  )
}
