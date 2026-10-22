import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brush, CheckCircle2, ShieldCheck, ShoppingBag, Send, AlertCircle, ArrowRight, HeartHandshake, FileText, Info } from 'lucide-react'
import siteData from '../data/site.json'
import pagesData from '../data/pages.json'
import { PRICE_LISTS } from '../data/priceLists'
import PriceListModal from '../components/PriceListModal'
import PageBlocks from '../components/PageBlocks'

export default function Commissions() {
  const [pageText, setPageText] = useState(pagesData.commissions || {})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [activePriceList, setActivePriceList] = useState(null)

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.pages?.commissions) setPageText(data.pages.commissions)
      })
      .catch(() => {})
  }, [])

  const [formData, setFormData] = useState({
    itemType: pageText.formItemTypeOptions?.[0] || 'Painted Portrait',
    size: pageText.formSizeOptions?.[2] || '11x14',
    numberOfSubjects: '1',
    medium: 'Oil',
    orientation: 'Landscape (Horizontal)',
    sceneryDescription: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    imageTitle: '',
    comments: '',
    'bot-field': ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const encode = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&')
    }

    try {
      if (siteData.contact?.googleCommissionFormUrl) {
        // Send to Rick's Google Form response endpoint silently
        const gfData = new FormData()
        Object.entries(formData).forEach(([k, v]) => {
          if (k !== 'bot-field') gfData.append(k, v)
        })
        await fetch(siteData.contact.googleCommissionFormUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: gfData
        }).catch(() => {})
      }

      // Also submit via Netlify static form
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'commission',
          ...formData
        })
      }).catch(() => {})

      setSubmitted(true)
    } catch (err) {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  // Map service card ID or priceListId to corresponding PRICE_LIST item
  const getServicePriceList = (card) => {
    if (!card) return null
    if (card.priceListId) {
      const match = PRICE_LISTS.find(p => p.id === card.priceListId)
      if (match) return match
    }
    const id = card.id
    if (id === 'charcoal-portraits') return PRICE_LISTS.find(p => p.id === 'charcoal-portrait-prices')
    if (id === 'painted-portraits') return PRICE_LISTS.find(p => p.id === 'painted-portrait-prices')
    if (id === 'custom-paintings') return PRICE_LISTS.find(p => p.id === 'product-price-list')
    if (id === 'archival-prints') return PRICE_LISTS.find(p => p.id === 'prints-price-list')
    return null
  }

  const cardsList = pageText.cards || siteData.services || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
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
            const pl = getServicePriceList(svc)
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
                    <img
                      src={svc.priceListThumb || pl.thumb}
                      alt={pl.alt || pl.title}
                      className="w-16 h-12 rounded object-cover border border-white/10 shrink-0 group-hover/thumb:scale-105 transition-transform"
                    />
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

      {/* Commission Request Form */}
      {pageText.formVisible !== false && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-studio-magenta/30 shadow-glow-magenta space-y-8">
          
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

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-white">
                {pageText.thankYouTitle || 'Thank You for Your Commission Request!'}
              </h3>
              <p className="text-sm text-emerald-200 max-w-md mx-auto">
                {pageText.thankYouMessage || 'Your inquiry has been received. Rick will review your specifications and get in touch with you shortly.'}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-600 transition"
              >
                {pageText.thankYouResetBtn || 'Submit Another Inquiry'}
              </button>
            </div>
          ) : (
            <form
              name="commission"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Netlify hidden identity fields */}
              <input type="hidden" name="form-name" value="commission" />
              <p className="hidden">
                <label>Don’t fill this out if you're human: <input name="bot-field" value={formData['bot-field']} onChange={handleChange} /></label>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Item Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formItemTypeLabel || 'Item you would like me to paint or draw'} <span className="text-studio-magenta">*</span>
                  </label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  >
                    {(pageText.formItemTypeOptions || [
                      'Painted Portrait',
                      'Charcoal Portrait',
                      'Original Oil Painting',
                      'Original Acrylic Painting',
                      'Other Drawing',
                      'Prints',
                      'Other'
                    ]).map((opt, i) => (
                      <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Size */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formSizeLabel || 'Size preferred'} <span className="text-studio-magenta">*</span>
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  >
                    {(pageText.formSizeOptions || ['8x10', '9x12', '11x14', '16x20', '18x24', '22x28', '24x36']).map((opt, i) => (
                      <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Subjects Field */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formSubjectsLabel || 'Number of Subjects'} <span className="text-studio-magenta">*</span>
                  </label>
                  <select
                    name="numberOfSubjects"
                    value={formData.numberOfSubjects}
                    onChange={handleChange}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  >
                    {(pageText.formSubjectsOptions || [
                      { value: '1', label: '1 Subject (Single Person / Pet / Scenery)' },
                      { value: '2', label: '2 Subjects' },
                      { value: '3', label: '3 Subjects' },
                      { value: '4', label: '4 Subjects' },
                      { value: '5+', label: '5+ Subjects' }
                    ]).map((opt, i) => (
                      <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Medium */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formMediumLabel || 'What medium do you prefer?'}
                  </label>
                  <select
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  >
                    {(pageText.formMediumOptions || [
                      'Oil',
                      'Acrylics',
                      'Charcoal',
                      'Graphite',
                      'Color Pencil',
                      'Mixed Media',
                      'Pastel',
                      'Let the artist choose'
                    ]).map((opt, i) => (
                      <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orientation */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formOrientationLabel || 'What Orientation would you prefer?'}
                  </label>
                  <select
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleChange}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  >
                    {(pageText.formOrientationOptions || [
                      'Let the artist choose',
                      'Portrait (Vertical)',
                      'Landscape (Horizontal)'
                    ]).map((opt, i) => (
                      <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Scenery / Subject Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {pageText.formSceneryLabel || 'What scenery would you like?'} <span className="text-studio-magenta">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  name="sceneryDescription"
                  value={formData.sceneryDescription}
                  onChange={handleChange}
                  placeholder={pageText.formSceneryPlaceholder || 'Please describe what it is you want me to paint or draw for you. (Please be as specific as possible.)'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formNameLabel || 'Name'} <span className="text-studio-magenta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formEmailLabel || 'Email'} <span className="text-studio-magenta">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formPhoneLabel || 'Phone (Optional)'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={pageText.formPhonePlaceholder || '(Optional)'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formAddressLabel || 'Address (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={pageText.formAddressPlaceholder || 'City, State / Shipping'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
              </div>

              {/* Image Title & Comments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formImageTitleLabel || 'Image Title (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="imageTitle"
                    value={formData.imageTitle}
                    onChange={handleChange}
                    placeholder={pageText.formImageTitlePlaceholder || 'e.g. Reference photo title or favorite painting name'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {pageText.formCommentsLabel || 'Questions and comments'}
                  </label>
                  <input
                    type="text"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder={pageText.formCommentsPlaceholder || 'Target date, gift recipient, framing questions...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs text-rose-400">{formError || pageText.errorMessage}</p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <a
                  href={`mailto:${siteData.contact?.email || 'rberube54@gmail.com'}?subject=${encodeURIComponent(`Commission Request: ${formData.itemType} (${formData.size})`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nAddress: ${formData.address}\n\nItem: ${formData.itemType}\nSize: ${formData.size}\nNumber of Subjects: ${formData.numberOfSubjects}\nMedium: ${formData.medium}\nOrientation: ${formData.orientation}\nImage Title: ${formData.imageTitle}\n\nScenery:\n${formData.sceneryDescription}\n\nQuestions/Comments:\n${formData.comments}`)}`}
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition text-center flex items-center justify-center gap-2"
                  title="Send this commission request directly through your email client"
                >
                  <span>{pageText.formEmailAppBtn || 'Open in Email App'}</span>
                </a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (pageText.formSubmittingBtn || 'Submitting Request...') : (pageText.formSubmitBtn || 'Submit Commission Request')}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* Dynamic Extra Blocks */}
      <PageBlocks blocks={pageText.extraBlocks} />

      {activePriceList && (
        <PriceListModal item={activePriceList} onClose={() => setActivePriceList(null)} />
      )}

    </div>
  )
}
