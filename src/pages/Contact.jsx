import React from 'react'
import siteData from '../data/site.json'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactPlaceholder() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Contact Rick</h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          Inquire about available paintings, upcoming art shows, or custom commissions.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            {siteData.contact.instructions}
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
            <span className="font-semibold text-studio-gold">Privacy Note: </span>
            Per studio privacy settings, phone numbers and street addresses are kept private. The Netlify contact form will be fully connected in Stage 5.
          </div>
        </div>
      </div>
    </div>
  )
}
