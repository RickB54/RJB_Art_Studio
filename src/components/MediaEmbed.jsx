import React, { useState } from 'react'
import { Play, ExternalLink, AlertCircle } from 'lucide-react'

import { normalizeMediaUrl } from '../utils/mediaUrl.js'
export { normalizeMediaUrl }

/**
 * Aspect ratio classes or style helper
 */
function getAspectRatioStyle(aspectRatio = '16:9', customHeight) {
  if (aspectRatio === 'custom' || customHeight) {
    const h = typeof customHeight === 'number' ? `${customHeight}px` : customHeight || '500px'
    return { className: 'relative w-full', style: { height: h, minHeight: h } }
  }
  if (aspectRatio === '4:3') {
    return { className: 'relative w-full aspect-[4/3]', style: {} }
  }
  if (aspectRatio === '9:16') {
    return { className: 'relative w-full aspect-[9/16] max-w-sm mx-auto', style: {} }
  }
  // Default: 16:9
  return { className: 'relative w-full aspect-video', style: {} }
}

/**
 * Shared MediaEmbed component used by EVERY block and page.
 */
export default function MediaEmbed({
  url,
  poster,
  title = 'Embedded Media',
  aspectRatio = '16:9',
  height,
  fallbackLinkText,
  hideFallbackLink = false,
  className = '',
  autoPlayOnClick = true
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const media = normalizeMediaUrl(url)

  if (!media) return null

  const posterUrl = poster ? (poster.startsWith('http') || poster.startsWith('data:') ? poster : (poster.startsWith('/') ? poster : `/${poster}`)) : ''
  const aspectConfig = getAspectRatioStyle(aspectRatio, height)

  const effectiveFallbackText = fallbackLinkText || (
    media.type === 'gdrive'
      ? 'Open video in Google Drive ↗'
      : media.type === 'youtube'
      ? 'Watch on YouTube ↗'
      : media.type === 'vimeo'
      ? 'Watch on Vimeo ↗'
      : media.type === 'gforms'
      ? 'Open in new tab ↗'
      : 'Open media in a new tab ↗'
  )

  const renderContent = () => {
    // A. Direct HTML5 Video
    if (!media.isIframe && media.type === 'direct') {
      const videoSrc = posterUrl
        ? media.url
        : (media.url.includes('#t=') ? media.url : `${media.url}#t=1`)

      return (
        <video
          src={videoSrc}
          poster={posterUrl || undefined}
          controls
          playsInline
          preload={posterUrl ? 'none' : 'metadata'}
          className="w-full h-full object-contain bg-black"
        >
          Your browser does not support the video tag.
        </video>
      )
    }

    // B. Iframe with poster and click-to-load
    if (posterUrl && !isPlaying) {
      return (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer group overflow-hidden bg-black flex items-center justify-center select-none"
          title="Click to play video"
        >
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-studio-magenta/90 text-white flex items-center justify-center shadow-glow-magenta group-hover:scale-110 group-hover:bg-studio-magenta transition-all duration-300">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
            </div>
          </div>
        </div>
      )
    }

    // C. Live Iframe
    let srcUrl = media.embedUrl
    if (isPlaying && autoPlayOnClick) {
      if (media.type === 'youtube' && !srcUrl.includes('autoplay=')) {
        srcUrl += (srcUrl.includes('?') ? '&' : '?') + 'autoplay=1'
      } else if (media.type === 'vimeo' && !srcUrl.includes('autoplay=')) {
        srcUrl += (srcUrl.includes('?') ? '&' : '?') + 'autoplay=1'
      }
    }

    return (
      <iframe
        src={srcUrl}
        title={title}
        className="w-full h-full border-0 absolute inset-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className={`${aspectConfig.className} rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl`}
        style={aspectConfig.style}
      >
        {renderContent()}
      </div>

      {!hideFallbackLink && media.originalUrl && (
        <div className="flex items-center justify-end px-1">
          <a
            href={media.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-studio-gold transition font-medium"
          >
            <span>{effectiveFallbackText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}
