import React, { useState } from 'react'
import { Loader2, Mail, ExternalLink, HelpCircle } from 'lucide-react'

export function extractEmbedUrl(input) {
  if (!input) return ''
  const trimmed = input.trim()
  const match = trimmed.match(/src=["']([^"']+)["']/i)
  if (match) return match[1]
  return trimmed
}

export default function GoogleFormEmbed({ url, height = 850, title = 'Form', fallbackEmail = 'rjbartstudio@gmail.com' }) {
  const [loading, setLoading] = useState(true)
  const embedUrl = extractEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-studio-gold/30 bg-gradient-to-b from-studio-gold/5 to-transparent text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-studio-gold/15 border border-studio-gold/30 flex items-center justify-center mx-auto text-studio-gold">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="font-serif text-lg font-bold text-white">Google Form Ready to Connect</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please paste your Google Form embed URL in the <strong>Admin Console</strong> (Site Settings &rarr; Contact &amp; Forms).
          </p>
        </div>
        {fallbackEmail && (
          <div className="pt-2">
            <a
              href={`mailto:${fallbackEmail}?subject=Art Studio Inquiry`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-studio-gold text-black hover:bg-studio-gold-light transition shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Email Rick Directly ({fallbackEmail})</span>
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-studio-surface/60 overflow-hidden shadow-2xl">
      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-studio-surface/90 backdrop-blur-sm p-6 text-center">
          <Loader2 className="w-8 h-8 text-studio-magenta animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            Loading Google Form...
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Connecting securely directly to Google. You may also email directly if preferred.
          </p>
        </div>
      )}

      {/* Embedded iframe */}
      <iframe
        src={embedUrl}
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        onLoad={() => setLoading(false)}
        className="w-full bg-white rounded-2xl transition-opacity duration-300"
        style={{ minHeight: `${height}px`, display: 'block' }}
      >
        Loading…
      </iframe>
    </div>
  )
}
