import React from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import GoogleFormEmbed from './GoogleFormEmbed'

export default function PageBlocks({ blocks }) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <div className="space-y-12">
      {blocks.filter(b => b && b.visible !== false).map((block, idx) => {
        const key = block.id || `block-${idx}`

        // 1. Text Section
        if (block.type === 'text') {
          return (
            <div key={key} className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 space-y-4">
              {block.subtitle && (
                <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta block">
                  {block.subtitle}
                </span>
              )}
              {block.heading && (
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {block.heading}
                </h3>
              )}
              {block.text && (
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
                  {block.text}
                </div>
              )}
            </div>
          )
        }

        // 2. Image + Text
        if (block.type === 'image-text') {
          const isRight = block.imagePosition === 'right'
          return (
            <div key={key} className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isRight ? 'md:grid-flow-dense' : ''}`}>
                {block.image && (
                  <div className={`overflow-hidden rounded-2xl border border-white/10 bg-black/40 ${isRight ? 'md:col-start-2' : ''}`}>
                    <img
                      src={block.image}
                      alt={block.imageAlt || block.heading || 'Custom Section Image'}
                      className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {block.subtitle && (
                    <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta block">
                      {block.subtitle}
                    </span>
                  )}
                  {block.heading && (
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      {block.heading}
                    </h3>
                  )}
                  {block.text && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                      {block.text}
                    </p>
                  )}
                  {block.linkUrl && block.linkText && (
                    <div className="pt-2">
                      {block.linkUrl.startsWith('http') ? (
                        <a
                          href={block.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-studio-gold hover:text-white transition"
                        >
                          <span>{block.linkText}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link
                          to={block.linkUrl}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-studio-gold hover:text-white transition"
                        >
                          <span>{block.linkText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        // 3. Cards Row
        if (block.type === 'cards') {
          const items = Array.isArray(block.cards) ? block.cards : []
          return (
            <div key={key} className="space-y-6">
              {(block.heading || block.subtitle) && (
                <div className="text-center max-w-2xl mx-auto space-y-1">
                  {block.subtitle && (
                    <span className="text-xs uppercase tracking-widest font-semibold text-studio-gold block">
                      {block.subtitle}
                    </span>
                  )}
                  {block.heading && (
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      {block.heading}
                    </h3>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.filter(c => c && c.visible !== false).map((card, cIdx) => (
                  <div key={card.id || cIdx} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {card.subtitle && (
                        <span className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider block">
                          {card.subtitle}
                        </span>
                      )}
                      {card.title && (
                        <h4 className="font-serif text-lg font-bold text-white">
                          {card.title}
                        </h4>
                      )}
                      {card.text && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                          {card.text}
                        </p>
                      )}
                    </div>
                    {card.badge && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-studio-gold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{card.badge}</span>
                      </div>
                    )}
                    {card.linkUrl && card.linkText && (
                      <div className="pt-2">
                        {card.linkUrl.startsWith('http') ? (
                          <a
                            href={card.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-studio-gold hover:text-white transition"
                          >
                            <span>{card.linkText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            to={card.linkUrl}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-studio-gold hover:text-white transition"
                          >
                            <span>{card.linkText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // 4. Notice Box
        if (block.type === 'notice') {
          return (
            <div key={key} className="p-5 rounded-2xl bg-studio-purple/15 border border-studio-purple/30 flex items-start gap-3 text-xs sm:text-sm text-slate-200">
              <Info className="w-5 h-5 text-studio-gold shrink-0 mt-0.5" />
              <div className="space-y-1">
                {block.title && (
                  <strong className="text-studio-gold font-semibold block">{block.title}</strong>
                )}
                {block.text && (
                  <span className="leading-relaxed whitespace-pre-line">{block.text}</span>
                )}
                {block.linkUrl && block.linkText && (
                  <span className="block pt-1">
                    {block.linkUrl.startsWith('http') ? (
                      <a href={block.linkUrl} target="_blank" rel="noopener noreferrer" className="text-studio-gold underline hover:text-white transition font-medium">
                        {block.linkText}
                      </a>
                    ) : (
                      <Link to={block.linkUrl} className="text-studio-gold underline hover:text-white transition font-medium">
                        {block.linkText}
                      </Link>
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        }

        // 5. Button Link
        if (block.type === 'button') {
          const alignClass = block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'
          return (
            <div key={key} className={`py-4 ${alignClass}`}>
              {block.url?.startsWith('http') ? (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition"
                >
                  <span>{block.text || 'Learn More'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  to={block.url || '/'}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition"
                >
                  <span>{block.text || 'Learn More'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {block.subtitle && (
                <p className="text-xs text-slate-400 mt-2">{block.subtitle}</p>
              )}
            </div>
          )
        }

        // 6. Embed Block (URL + height for Google Forms, etc.)
        if (block.type === 'embed') {
          return (
            <div key={key} className="glass-panel p-4 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              {(block.heading || block.subtitle) && (
                <div className="space-y-1">
                  {block.subtitle && (
                    <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta block">
                      {block.subtitle}
                    </span>
                  )}
                  {block.heading && (
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {block.heading}
                    </h3>
                  )}
                </div>
              )}
              {block.text && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{block.text}</p>
              )}
              <GoogleFormEmbed
                url={block.url || block.embedUrl}
                height={parseInt(block.height, 10) || 850}
                title={block.heading || 'Embedded Form'}
              />
            </div>
          )
        }

        // 7. Video Block (YouTube responsive)
        if (block.type === 'video') {
          const rawUrl = block.url || block.youtubeUrl || ''
          const vidMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
          const videoId = vidMatch ? vidMatch[1] : (block.videoId || '')
          return (
            <div key={key} className="glass-panel p-4 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              {(block.heading || block.subtitle) && (
                <div className="space-y-1">
                  {block.subtitle && (
                    <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta block">
                      {block.subtitle}
                    </span>
                  )}
                  {block.heading && (
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {block.heading}
                    </h3>
                  )}
                </div>
              )}
              {block.text && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{block.text}</p>
              )}
              {videoId ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title={block.heading || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                  Please enter a valid YouTube video URL to display this video block.
                </div>
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
