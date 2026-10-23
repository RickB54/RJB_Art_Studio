import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brush, CheckCircle2, ShieldCheck, AlertCircle, FileText, Info } from 'lucide-react'
import siteData from '../data/site.json'
import pagesData from '../data/pages.json'
import { PRICE_LISTS, getPriceList } from '../data/priceLists'
import PriceListModal from '../components/PriceListModal'
import PageBlocks from '../components/PageBlocks'
import GoogleFormEmbed from '../components/GoogleFormEmbed'

export default function Commissions() {
  const [pageText, setPageText] = useState(pagesData.commissions || {})
  const [site, setSite] = useState(siteData)
  const [activePriceList, setActivePriceList] = useState(null)
  const [thumbErrors, setThumbErrors] = useState({})

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.pages?.commissions) setPageText(data.pages.commissions)
        if (data.site) setSite(data.site)
      })
      .catch(() => {})
  }, [])

  const cardsList = pageText.cards || site.services || []
  const formEmbedUrl = site.contact?.googleCommissionEmbedUrl || site.contact?.googleCommissionFormUrl || ''
  const formHeight = site.contact?.googleCommissionEmbedHeight || 1100

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Slot: Top of page */}
      <PageBlocks blocks={pageText.blockSlots?.top} />

      {/* Header */}
      {pageText.heroVisible !== false && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
            {pageText.badge || 'Custom Artwork & Portrait Services'}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {pageText.title || 'Commissions & Prints'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {pageText.intro || 'Order a personalized original oil painting, acrylic artwork, or expressive charcoal portrait of loved ones or pets. Every custom commission includes a signed and dated Certificate of Authenticity.'}
          </p>
        </div>
      )}

      {/* Services Grid with In-Card Thumbnails */}
      {pageText.cardsVisible !== false && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cardsList.filter(svc => svc && svc.visible !== false).map((svc) => {
            const pl = getPriceList(svc)
            return (
              <div key={svc.id || svc.title} className="glass-panel p-7 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider">{svc.subtitle}</span>
                  <h3 className="font-serif text-xl font-bold text-white mt-1">{svc.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">{svc.description}</p>
                </div>

                {/* Price list thumbnail inside the card */}
                {pl && (
                  <button
                    type="button"
                    onClick={() => setActivePriceList(pl)}
                    className="group/thumb p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-studio-gold/60 transition flex items-center gap-3 text-left w-full focus:outline-none focus:ring-2 focus:ring-studio-gold"
                    title={`View ${pl.title} Price List`}
                  >
                    {thumbErrors[pl.id] ? (
                      <div className="w-16 h-12 rounded bg-studio-card border border-white/10 flex flex-col items-center justify-center text-studio-gold text-[10px] font-medium p-1 text-center shrink-0">
                        <FileText className="w-4 h-4 mb-0.5 text-studio-gold" />
                        <span className="line-clamp-1 leading-tight">{pl.title}</span>
                      </div>
                    ) : (
                      <img
                        src={svc.priceListThumb || pl.thumb}
                        alt={pl.alt || pl.title}
                        onError={() => setThumbErrors(prev => ({ ...prev, [pl.id]: true }))}
                        className="w-16 h-12 rounded object-cover border border-white/10 shrink-0 group-hover/thumb:scale-105 transition-transform"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-white group-hover/thumb:text-studio-gold transition block truncate">
                        {svc.priceListTitle || `${pl.title} Price List`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Click to view full screen, print, or download</span>
                    </div>
                    <FileText className="w-4 h-4 text-studio-gold shrink-0 opacity-70 group-hover/thumb:opacity-100" />
                  </button>
                )}

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-studio-gold font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{svc.badgeTitle || 'Certificate of Authenticity'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{svc.badgeSubtitle || 'Offered on all paintings'}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Watercolor Note */}
      {(pageText.watercolorNotice?.visible !== false) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-studio-purple/15 border border-studio-purple/30 flex items-start sm:items-center gap-3 text-xs sm:text-sm text-slate-200">
          <Info className="w-5 h-5 text-studio-gold shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="text-studio-gold font-semibold">
              {pageText.watercolorNotice?.prefix ?? 'Watercolor Note: '}
            </strong>
            {pageText.watercolorNotice?.text ?? 'Watercolor commissions are also available. If interested, please '}
            <Link
              to={pageText.watercolorNotice?.linkUrl || '/contact?inquiry=Watercolor%20commission%20inquiry'}
              className="text-studio-gold underline hover:text-white font-medium transition"
            >
              {pageText.watercolorNotice?.linkText || 'contact me for details'}
            </Link>
            {pageText.watercolorNotice?.suffix ?? '.'}
          </p>
        </div>
      )}

      {/* The 4-Step Commission Process */}
      {pageText.processVisible !== false && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {pageText.processTitle || 'How The Commission Process Works'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {pageText.processSubtitle || 'Simple, collaborative, and tailored to your vision'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(pageText.processSteps || []).map((step, sIdx) => {
              const colors = [
                'bg-studio-magenta/20 text-studio-magenta border-studio-magenta/40',
                'bg-studio-cobalt/20 text-studio-cobalt border-studio-cobalt/40',
                'bg-studio-purple/20 text-studio-purple border-studio-purple/40',
                'bg-studio-gold/20 text-studio-gold border-studio-gold/40'
              ]
              const colorClass = colors[sIdx % colors.length]
              return (
                <div key={sIdx} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${colorClass}`}>
                    {step.num || sIdx + 1}
                  </span>
                  <h4 className="font-serif text-base font-bold text-white">{step.title}</h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pricing Policy Notice */}
      {(pageText.pricingPolicyVisible !== false) && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-studio-gold/30 space-y-3">
          <div className="flex items-center gap-2 text-studio-gold font-semibold text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pageText.pricingPolicyTitle || 'Pricing Policy Notice'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {pageText.pricingPolicy || 'Pricing follows my price lists: choose the size price, then add the commission fee for each extra subject. Watercolor commissions are quoted individually. Every quote is confirmed before painting begins.'}
          </p>
        </div>
      )}

      {/* Commission Request Form (Embedded Google Form) */}
      {pageText.formVisible !== false && (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-studio-magenta/30 shadow-glow-magenta space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
              {pageText.formBadge || 'Interactive Request'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              {pageText.formTitle || 'Commission Request Form'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {pageText.formSubtitle || 'Fill out the details below to receive a personalized quote and timeline directly from Rick.'}
            </p>
          </div>

          <GoogleFormEmbed
            url={formEmbedUrl}
            height={formHeight}
            title="Commission Request Form"
            fallbackEmail={site.contact?.email || 'rjbartstudio@gmail.com'}
          />
        </div>
      )}

      {/* Slot: Bottom of page */}
      <PageBlocks blocks={pageText.blockSlots?.bottom || pageText.extraBlocks} />

      {activePriceList && (
        <PriceListModal item={activePriceList} onClose={() => setActivePriceList(null)} />
      )}

    </div>
  )
}
