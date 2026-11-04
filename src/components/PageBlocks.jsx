import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight, ExternalLink, Sparkles, X, Play } from 'lucide-react'
import GoogleFormEmbed from './GoogleFormEmbed'

import MediaEmbed, { normalizeMediaUrl } from './MediaEmbed'

export { MediaEmbed, normalizeMediaUrl }

export function cleanPhotoUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const t = raw.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
  return '/' + t.replace(/^(\.\/)?(public\/)?/, '').replace(/^\/+/, '')
}

export function cleanVideoUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let t = raw.trim()
  if (!t) return ''
  // Extract URL from iframe, object, or data-link snippets
  const snippetMatch = t.match(/(?:src|data)=["']([^"']+)["']/i)
  if (snippetMatch) {
    t = snippetMatch[1].trim()
  } else {
    const dlMatch = t.match(/data-link=["']([^"']+)["']/i)
    if (dlMatch) {
      t = `https://www.publicalbum.org/carousel/embed?url=${encodeURIComponent(dlMatch[1].trim())}`
    }
  }
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
  // Normalize Windows backslashes
  t = t.replace(/\\/g, '/')
  // If user pasted a local file path containing 'public/'
  const publicIdx = t.toLowerCase().lastIndexOf('/public/')
  if (publicIdx !== -1) {
    return t.substring(publicIdx + '/public'.length)
  }
  if (t.toLowerCase().startsWith('public/')) {
    return '/' + t.substring('public/'.length)
  }
  // If it's an absolute path with drive letter like C:/...
  if (/^[a-zA-Z]:\//.test(t)) {
    const filename = t.substring(t.lastIndexOf('/') + 1)
    return '/' + filename
  }
  if (!t.startsWith('/')) {
    return '/' + t
  }
  return t
}

export function parseVideoEmbed(url) {
  return normalizeMediaUrl(url)
}

export function BlockVideoEmbed({
  url,
  poster,
  title = 'Video',
  aspectRatio = '16:9',
  height,
  fallbackLinkText,
  hideFallbackLink = false,
  className = ''
}) {
  return (
    <MediaEmbed
      url={url}
      poster={poster}
      title={title}
      aspectRatio={aspectRatio}
      height={height}
      fallbackLinkText={fallbackLinkText}
      hideFallbackLink={hideFallbackLink}
      className={className}
    />
  )
}

export default function PageBlocks({ blocks }) {
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    if (!lightboxImg) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxImg(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxImg])

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <div className="space-y-12">
      {blocks.filter(b => b && b.visible !== false).map((block, idx) => {
        const key = block.id || `block-${idx}`

        // 1. Text Section (with optional video URL)
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
              {block.videoUrl && (
                <div className="pt-2 max-w-4xl">
                  <BlockVideoEmbed
                    url={block.videoUrl}
                    poster={block.videoPoster}
                    title={block.heading || 'Text Section Video'}
                  />
                </div>
              )}
            </div>
          )
        }

        // 2. Image + Text
        if (block.type === 'image-text') {
          const isRight = block.imagePosition === 'right'
          const itImages = (Array.isArray(block.images) && block.images.length > 0)
            ? block.images.filter(img => img && img.url)
            : (block.image ? [{ id: 'it-1', url: block.image, caption: block.imageAlt || '' }] : [])

          return (
            <div key={key} className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isRight ? 'md:grid-flow-dense' : ''}`}>
                {/* Media column: photo(s) OR video based on mediaType switch */}
                {(block.mediaType === 'video' ? block.videoUrl : (itImages.length > 0 || block.videoUrl)) && (
                  <div className={`space-y-3 ${isRight ? 'md:col-start-2' : ''}`}>
                    {block.mediaType === 'video' ? (
                      <MediaEmbed
                        url={block.videoUrl}
                        poster={block.videoPoster}
                        aspectRatio={block.aspectRatio || '16:9'}
                        title={block.heading || 'Section Video'}
                        fallbackLinkText={block.fallbackLinkText}
                        hideFallbackLink={block.hideFallbackLink}
                      />
                    ) : (
                      <>
                        {itImages.length === 1 && (
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl">
                            <img
                              src={cleanPhotoUrl(itImages[0].url)}
                              alt={itImages[0].caption || itImages[0].alt || block.imageAlt || block.heading || 'Custom Section Image'}
                              className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                              onClick={() => setLightboxImg({ url: cleanPhotoUrl(itImages[0].url), caption: itImages[0].caption || itImages[0].alt || block.heading })}
                              loading="lazy"
                            />
                            {itImages[0].caption && (
                              <p className="p-2 text-xs text-slate-400 italic bg-black/40 text-center">{itImages[0].caption}</p>
                            )}
                          </div>
                        )}
                        {itImages.length > 1 && (
                          <div className={`grid ${itImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-3`}>
                            {itImages.map((img, i) => {
                              const imgUrl = cleanPhotoUrl(img.url)
                              return (
                                <div
                                  key={img.id || i}
                                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-md group cursor-zoom-in relative"
                                  onClick={() => setLightboxImg({ url: imgUrl, caption: img.caption || img.alt || block.heading })}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={img.caption || img.alt || `${block.heading || 'Section'} photo ${i + 1}`}
                                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                  {img.caption && (
                                    <p className="p-1.5 text-[11px] text-slate-300 italic truncate bg-black/60 text-center">{img.caption}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {block.videoUrl && (
                          <div className="pt-1">
                            <BlockVideoEmbed
                              url={block.videoUrl}
                              poster={block.videoPoster}
                              title={block.heading || 'Section Video'}
                              fallbackLinkText={block.fallbackLinkText}
                              hideFallbackLink={block.hideFallbackLink}
                            />
                          </div>
                        )}
                      </>
                    )}
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
              {block.videoUrl && (
                <div className="max-w-4xl mx-auto pt-2">
                  <BlockVideoEmbed
                    url={block.videoUrl}
                    poster={block.videoPoster}
                    title={block.heading || 'Cards Video'}
                  />
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
                      {card.videoUrl && (
                        <div className="py-2">
                          <BlockVideoEmbed
                            url={card.videoUrl}
                            poster={card.videoPoster}
                            title={card.title || 'Card Video'}
                          />
                        </div>
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
                {block.videoUrl && (
                  <div className="pt-2 max-w-2xl">
                    <BlockVideoEmbed
                      url={block.videoUrl}
                      poster={block.videoPoster}
                      title={block.title || 'Notice Video'}
                    />
                  </div>
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

        // 6. Embed Block (URL + height for Google Drive videos, Google Forms, YouTube, Vimeo, etc.)
        if (block.type === 'embed') {
          const embedUrl = block.url || block.embedUrl
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
              {embedUrl ? (
                <MediaEmbed
                  url={embedUrl}
                  poster={block.poster || block.videoPoster}
                  aspectRatio={block.aspectRatio || (block.height ? 'custom' : '16:9')}
                  height={block.height}
                  title={block.heading || 'Embedded Content'}
                  fallbackLinkText={block.fallbackLinkText}
                  hideFallbackLink={block.hideFallbackLink}
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                  Please enter an embed or video URL to display this block.
                </div>
              )}
            </div>
          )
        }

        // 7. Video Block (Responsive video embed for Drive, YouTube, Vimeo, direct MP4)
        if (block.type === 'video') {
          const rawUrl = block.url || block.youtubeUrl || block.videoUrl || ''
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
              {rawUrl ? (
                <MediaEmbed
                  url={rawUrl}
                  poster={block.poster || block.videoPoster}
                  aspectRatio={block.aspectRatio || '16:9'}
                  height={block.height}
                  title={block.heading || 'Video'}
                  fallbackLinkText={block.fallbackLinkText}
                  hideFallbackLink={block.hideFallbackLink}
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                  Please enter a valid video URL to display this video block.
                </div>
              )}
            </div>
          )
        }

        // 8. Photo Block (1 or multiple images with per-photo caption, size small/medium/large, align left/center/right)
        if (block.type === 'photo') {
          const photos = (Array.isArray(block.images) && block.images.length > 0)
            ? block.images.filter(p => p && p.url && p.url.trim())
            : (block.image ? [{
                id: 'img-1',
                url: block.image,
                caption: block.caption || '',
                size: block.size || 'medium',
                align: block.align || 'center'
              }] : [])

          const layout = block.layout || 'row'
          const videoPosition = block.videoPosition || 'below'
          const renderBlockVideo = () => block.videoUrl ? (
            <div className="max-w-4xl mx-auto my-4">
              <BlockVideoEmbed
                url={block.videoUrl}
                poster={block.videoPoster}
                title={block.caption || 'Video in Photo Block'}
              />
            </div>
          ) : null

          if (photos.length === 0) {
            if (block.videoUrl) {
              return (
                <div key={key} className="py-2 max-w-4xl mx-auto space-y-2">
                  <BlockVideoEmbed
                    url={block.videoUrl}
                    poster={block.videoPoster}
                    title={block.caption || 'Video in Photo Block'}
                  />
                  {block.caption && (
                    <p className="text-xs text-slate-400 italic pt-1 text-center">{block.caption}</p>
                  )}
                </div>
              )
            }
            return (
              <div key={key} className="py-2 max-w-2xl mx-auto">
                <div className="p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No photo or video selected
                </div>
              </div>
            )
          }

          let photosContent = null

          // Single photo
          if (photos.length === 1) {
            const photo = photos[0]
            const pSize = photo.size || block.size || 'medium'
            const pAlign = photo.align || block.align || 'center'
            const sizeClass = pSize === 'small' ? 'max-w-md' : pSize === 'large' ? 'max-w-5xl' : 'max-w-2xl'
            const alignClass = pAlign === 'left' ? 'mr-auto' : pAlign === 'right' ? 'ml-auto' : 'mx-auto'
            const textAlignClass = pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'
            const photoUrl = cleanPhotoUrl(photo.url)

            photosContent = (
              <figure className={`${sizeClass} ${alignClass} space-y-2`}>
                <div
                  className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
                  onClick={() => setLightboxImg({ url: photoUrl, caption: photo.caption })}
                >
                  <img
                    src={photoUrl}
                    alt={photo.caption || 'Studio Photo'}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            )
          } else if (layout === 'stacked') {
            // Multiple photos: Stacked Layout
            photosContent = (
              <div className="space-y-6">
                {photos.map((photo, pIdx) => {
                  const pSize = photo.size || 'medium'
                  const pAlign = photo.align || 'center'
                  const sizeClass = pSize === 'small' ? 'max-w-md' : pSize === 'large' ? 'max-w-5xl' : 'max-w-2xl'
                  const alignClass = pAlign === 'left' ? 'mr-auto' : pAlign === 'right' ? 'ml-auto' : 'mx-auto'
                  const textAlignClass = pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'
                  const photoUrl = cleanPhotoUrl(photo.url)
                  return (
                    <figure key={photo.id || pIdx} className={`${sizeClass} ${alignClass} space-y-2`}>
                      <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
                        onClick={() => setLightboxImg({ url: photoUrl, caption: photo.caption })}
                      >
                        <img
                          src={photoUrl}
                          alt={photo.caption || `Photo ${pIdx + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      {photo.caption && (
                        <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            )
          } else if (layout === 'grid') {
            // Multiple photos: Grid Layout
            const gridCols = photos.length === 2 ? 'sm:grid-cols-2 max-w-4xl' : 'sm:grid-cols-2 lg:grid-cols-3 max-w-6xl'
            photosContent = (
              <div className={`grid grid-cols-1 ${gridCols} gap-6 mx-auto`}>
                {photos.map((photo, pIdx) => {
                  const photoUrl = cleanPhotoUrl(photo.url)
                  const textAlignClass = (photo.align || 'center') === 'left' ? 'text-left' : (photo.align || 'center') === 'right' ? 'text-right' : 'text-center'
                  return (
                    <figure key={photo.id || pIdx} className="space-y-2">
                      <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in aspect-square sm:aspect-[4/3]"
                        onClick={() => setLightboxImg({ url: photoUrl, caption: photo.caption })}
                      >
                        <img
                          src={photoUrl}
                          alt={photo.caption || `Photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      {photo.caption && (
                        <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            )
          } else {
            // Multiple photos: Default Row / Side-by-Side Layout
            const hasLeft = photos.some(p => (p.align || 'center') === 'left')
            const hasRight = photos.some(p => (p.align || 'center') === 'right')
            const allLeft = photos.every(p => (p.align || 'center') === 'left')
            const allRight = photos.every(p => (p.align || 'center') === 'right')

            const justifyClass = (hasLeft && hasRight)
              ? 'justify-between'
              : allLeft
              ? 'justify-start'
              : allRight
              ? 'justify-end'
              : 'justify-center'

            photosContent = (
              <div className={`w-full flex flex-wrap items-start ${justifyClass} gap-6 sm:gap-8`}>
                {photos.map((photo, pIdx) => {
                  const pSize = photo.size || 'medium'
                  const pAlign = photo.align || 'center'
                  const photoUrl = cleanPhotoUrl(photo.url)
                  const widthClass = pSize === 'small'
                    ? 'w-full sm:w-[320px] max-w-full'
                    : pSize === 'large'
                    ? 'w-full sm:w-[680px] max-w-full'
                    : 'w-full sm:w-[480px] max-w-full'
                  const textAlignClass = pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'

                  return (
                    <figure key={photo.id || pIdx} className={`${widthClass} space-y-2 shrink-0`}>
                      <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
                        onClick={() => setLightboxImg({ url: photoUrl, caption: photo.caption })}
                      >
                        <img
                          src={photoUrl}
                          alt={photo.caption || `Photo ${pIdx + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      {photo.caption && (
                        <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            )
          }

          return (
            <div key={key} className="py-2 space-y-4">
              {videoPosition === 'above' && renderBlockVideo()}
              {photosContent}
              {videoPosition === 'below' && renderBlockVideo()}
            </div>
          )
        }

        // 9. Divider Block
        if (block.type === 'divider') {
          return (
            <div key={key} className="py-6 flex items-center justify-center">
              <div className="w-full border-t border-white/10 relative flex items-center justify-center">
                <span className="absolute bg-studio-surface px-3 text-studio-gold text-xs">◆</span>
              </div>
            </div>
          )
        }

        return null
      })}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            onClick={() => setLightboxImg(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.caption || 'Enlarged photo'}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            {lightboxImg.caption && (
              <p className="text-sm text-slate-300 mt-3 text-center italic">{lightboxImg.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
