import React, { useState, useEffect } from 'react'
import { Mail, ShoppingBag, ShieldCheck, Youtube, Facebook, Instagram } from 'lucide-react'
import siteData from '../data/site.json'
import { EmailChooser } from '../components/Footer'
import GoogleFormEmbed from '../components/GoogleFormEmbed'
import PageBlocks from '../components/PageBlocks'
import initialPages from '../data/pages.json'

export default function Contact() {
  const [pages, setPages] = useState(initialPages)
  const [site, setSite] = useState(siteData)

  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.pages) setPages(data.pages)
        if (data.site) setSite(data.site)
      })
      .catch(() => {})
  }, [])

  const ct = pages.contact || {}
  const formEmbedUrl = site.contact?.googleContactEmbedUrl || site.contact?.googleContactFormUrl || ''
  const formHeight = site.contact?.googleContactEmbedHeight || 850

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Slot: Top of page */}
      <PageBlocks blocks={ct.blockSlots?.top} />

      {/* Header */}
      {ct.headerVisible !== false && (
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
            {ct.badge || 'Studio Inquiries'}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {ct.title || 'Contact Rick'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {ct.intro || 'Inquire about available paintings, fine art prints, upcoming exhibitions, or general artistic collaborations.'}
          </p>
        </div>
      )}

      {/* Slot: After header */}
      <PageBlocks blocks={ct.blockSlots?.after_header} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Direct Email & Studio Channels */}
        <div className="space-y-6">
          
          {/* Direct Email Card */}
          <div className="glass-panel p-6 rounded-2xl border border-studio-gold/30 bg-gradient-to-br from-studio-card to-studio-surface space-y-3">
            <div className="flex items-center gap-2 text-studio-gold">
              <Mail className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-white">{ct.directEmailTitle || 'Direct Email'}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ct.directEmailDesc || 'Prefer to use email directly? Click your address below and choose Gmail or your default email app:'}
            </p>
            <div className="flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-studio-gold/15 border border-studio-gold/30">
              <EmailChooser
                email={site.contact?.email || 'rjbartstudio@gmail.com'}
                className="text-studio-gold text-xs font-semibold"
              />
            </div>
          </div>

          {/* Studio Channels */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">{ct.channelsTitle || 'Studio Channels'}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For public inquiries and video questions, feel free to reach out via my official studio channels:
            </p>

            <div className="space-y-2 pt-1">
              {site.socials?.youtube && (
                <a
                  href={site.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs transition border border-white/5"
                >
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>YouTube Channel</span>
                </a>
              )}

              {site.socials?.facebook && (
                <a
                  href={site.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 text-xs transition border border-white/5"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook Page</span>
                </a>
              )}

              {site.socials?.instagram && (
                <a
                  href={site.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-pink-600/20 hover:text-pink-400 text-slate-300 text-xs transition border border-white/5"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Instagram Profile</span>
                </a>
              )}

              {site.socials?.fineArtAmerica && (
                <a
                  href={site.socials.fineArtAmerica}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-studio-gold/10 hover:bg-studio-gold hover:text-black text-studio-gold text-xs transition border border-studio-gold/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Fine Art America Prints</span>
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-studio-gold font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Studio Privacy Protection</span>
            </div>
            <p>
              Your contact details are encrypted and used solely for responding to your art inquiries.
            </p>
          </div>
        </div>

        {/* Right Column: Embedded Google Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-studio-magenta/20 shadow-glow-magenta space-y-4">
            {(ct.formTitle || ct.formSubtitle) && (
              <div className="space-y-1">
                {ct.formTitle && (
                  <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                    {ct.formTitle}
                  </h2>
                )}
                {ct.formSubtitle && (
                  <p className="text-xs sm:text-sm text-slate-300">
                    {ct.formSubtitle}
                  </p>
                )}
              </div>
            )}
            
            <GoogleFormEmbed
              url={formEmbedUrl}
              height={formHeight}
              title="Rick J Berube Art Studio - Contact Form"
              fallbackEmail={site.contact?.email || 'rjbartstudio@gmail.com'}
            />
          </div>
        </div>

      </div>

      {/* Slot: After form */}
      <PageBlocks blocks={ct.blockSlots?.after_form} />

      {/* Slot: Bottom of page */}
      <PageBlocks blocks={ct.blockSlots?.bottom || ct.blocks} />

    </div>
  )
}
