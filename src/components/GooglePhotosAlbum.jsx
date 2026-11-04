import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, Info, AlertCircle, RefreshCw } from 'lucide-react'

// Cache script loading promise across all component instances
let publicAlbumScriptPromise = null

export function loadPublicAlbumScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.WidgetDecorator && window.GalleryPlayerWidget) {
    return Promise.resolve()
  }
  if (publicAlbumScriptPromise) return publicAlbumScriptPromise

  publicAlbumScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="publicalbum"]')
    if (existing) {
      if (existing.dataset.loaded === 'true' || window.WidgetDecorator) {
        resolve()
      } else {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', (e) => reject(e), { once: true })
      }
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/publicalbum@latest/embed-ui.min.js'
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = (e) => {
      publicAlbumScriptPromise = null
      reject(e)
    }
    document.body.appendChild(script)
  })

  return publicAlbumScriptPromise
}

/**
 * Parses a raw URL or full PublicAlbum snippet (script + div + object)
 * and extracts all configuration fields. Never inserts <script> tags.
 */
export function parsePublicAlbumInput(raw) {
  if (!raw || typeof raw !== 'string') return {}
  const trimmed = raw.trim()
  if (!trimmed) return {}

  // If simple URL
  if (!trimmed.includes('<')) {
    return { albumUrl: trimmed }
  }

  const result = {}

  // 1. Extract data-link or href
  const linkMatch = trimmed.match(/data-link=["']([^"']+)["']/i) || trimmed.match(/href=["']([^"']+)["']/i)
  if (linkMatch) result.albumUrl = linkMatch[1].trim()

  // 2. Extract data-title
  const titleMatch = trimmed.match(/data-title=["']([^"']+)["']/i)
  if (titleMatch) result.title = titleMatch[1].trim()

  // 3. Extract mode from class
  if (/pa-carousel-widget/i.test(trimmed)) {
    result.mode = 'carousel'
  } else if (/pa-gallery-player-widget/i.test(trimmed)) {
    result.mode = 'slideshow'
  }

  // 4. Extract data-delay
  const delayMatch = trimmed.match(/data-delay=["']?(\d+)["']?/i)
  if (delayMatch) result.delay = parseInt(delayMatch[1], 10)

  // 5. Extract data-repeat
  const repeatMatch = trimmed.match(/data-repeat=["']?(true|false)["']?/i)
  if (repeatMatch) result.repeat = repeatMatch[1].toLowerCase() === 'true'

  // 6. Extract data-background-color
  const bgMatch = trimmed.match(/data-background-color=["']([^"']+)["']/i)
  if (bgMatch) result.background = bgMatch[1].trim()

  // 7. Extract height from style
  const heightMatch = trimmed.match(/height\s*:\s*(\d+)px/i)
  if (heightMatch) result.height = parseInt(heightMatch[1], 10)

  // If albumUrl wasn't extracted from data-link, check for object data or raw link
  if (!result.albumUrl) {
    const objectMatch = trimmed.match(/data=["'](https?:\/\/[^"']+)["']/i)
    if (objectMatch) {
      // Check if it has ?url= parameter
      const urlParamMatch = objectMatch[1].match(/[?&]url=([^&]+)/)
      if (urlParamMatch) {
        try {
          result.albumUrl = decodeURIComponent(urlParamMatch[1])
        } catch (_) {
          result.albumUrl = urlParamMatch[1]
        }
      } else {
        result.albumUrl = objectMatch[1]
      }
    }
  }

  return result
}

export const DEFAULT_QUICK_TIPS =
  'Quick tips: Click or tap Play to start the slideshow. Use the arrows (or swipe) to move between photos. Tap the full-screen button for a bigger view. Press Esc or tap X to close. The photos load from Google Photos, so give them a moment.'

export default function GooglePhotosAlbum({
  albumUrl = '',
  mode = 'slideshow', // 'slideshow' | 'carousel'
  height = 480,
  delay = 5,
  repeat = true,
  background = '#000000',
  heading = '',
  title = '',
  tips = DEFAULT_QUICK_TIPS,
  hideTips = false,
  fallbackLinkText = 'Open the album in Google Photos',
  hideFallbackLink = false,
  className = ''
}) {
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const cleanAlbumUrl = (albumUrl || '').trim()
  const widgetClass = mode === 'carousel' ? 'pa-carousel-widget' : 'pa-gallery-player-widget'
  const h = typeof height === 'number' ? height : parseInt(height, 10) || 480

  // 1. IntersectionObserver: only initialize when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return
    if (inView) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [inView])

  // 2. Initialize widget once in view and when props change
  useEffect(() => {
    if (!inView || !cleanAlbumUrl) return

    setIsTimedOut(false)
    setIsRendered(false)
    setLoadError(false)

    let isMounted = true
    let timeoutId = null

    // 8-second fallback timeout
    timeoutId = setTimeout(() => {
      if (isMounted) {
        // If the widget has not populated children or still has display:none, trigger timeout fallback
        const node = widgetRef.current
        const hasContent = node && (node.children.length > 0 || node.style.display !== 'none')
        if (!hasContent) {
          setIsTimedOut(true)
        }
      }
    }, 8000)

    loadPublicAlbumScript()
      .then(() => {
        if (!isMounted) return
        const node = widgetRef.current
        if (!node) return

        // Decorate widget
        try {
          if (window.WidgetDecorator && typeof window.WidgetDecorator.decorateAll === 'function') {
            if (mode === 'carousel' && window.CarouselWidget) {
              window.WidgetDecorator.decorateAll('pa-carousel-widget', () => new window.CarouselWidget())
            } else if (window.GalleryPlayerWidget) {
              window.WidgetDecorator.decorateAll('pa-gallery-player-widget', () => new window.GalleryPlayerWidget())
            }
          }

          // Monitor if widget renders
          const checkRender = () => {
            if (!isMounted) return
            const current = widgetRef.current
            if (current && (current.children.length > 0 || current.style.display !== 'none')) {
              setIsRendered(true)
              if (timeoutId) clearTimeout(timeoutId)
            } else {
              requestAnimationFrame(checkRender)
            }
          }
          requestAnimationFrame(checkRender)
        } catch (err) {
          console.error('PublicAlbum decoration error:', err)
          if (isMounted) setLoadError(true)
        }
      })
      .catch((err) => {
        console.error('PublicAlbum script load error:', err)
        if (isMounted) {
          setLoadError(true)
          setIsTimedOut(true)
        }
      })

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      // Cleanup widget container on unmount
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ''
      }
    }
  }, [inView, cleanAlbumUrl, mode, h, delay, repeat, background, title])

  if (!cleanAlbumUrl) {
    return (
      <div className={`p-8 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 ${className}`}>
        No Google Photos album link provided.
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* Optional Block Heading */}
      {heading && (
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {heading}
        </h3>
      )}

      {/* Album Widget Container */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
        style={{ minHeight: `${h}px` }}
      >
        {/* Loading placeholder while script / images initialize */}
        {!isRendered && !isTimedOut && !loadError && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-10 text-slate-400 p-4 text-center"
            style={{ height: `${h}px` }}
          >
            <RefreshCw className="w-6 h-6 animate-spin text-studio-gold" />
            <p className="text-xs text-slate-300">Loading Google Photos album...</p>
            <p className="text-[11px] text-slate-500">Connecting to Google Photos via PublicAlbum</p>
          </div>
        )}

        {/* 8-second Timeout or Load Error Fallback Message */}
        {(isTimedOut || loadError) && !isRendered && (
          <div
            className="flex flex-col items-center justify-center p-8 text-center bg-black/90 space-y-3"
            style={{ minHeight: `${h}px` }}
          >
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Album is taking longer than usual to load</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Google Photos servers may be busy, or this album link is restricted. Make sure the album is shared as "Anyone with the link".
            </p>
            <a
              href={cleanAlbumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-studio-gold text-black hover:bg-amber-300 transition shadow"
            >
              <span>{fallbackLinkText || 'Open the album in Google Photos'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* PublicAlbum container rendered exactly per specification */}
        {(!isTimedOut || isRendered) && (
          <div
            ref={widgetRef}
            className={widgetClass}
            style={{
              width: '100%',
              height: `${h}px`,
              display: 'none',
              backgroundColor: background || '#000000'
            }}
            data-link={cleanAlbumUrl}
            data-title={title || heading || ''}
            data-delay={String(delay || 5)}
            data-repeat={repeat !== false ? 'true' : 'false'}
            data-background-color={background || '#000000'}
          />
        )}
      </div>

      {/* Fallback Link (shown unless hidden) */}
      {!hideFallbackLink && (
        <div className="flex items-center justify-end px-1">
          <a
            href={cleanAlbumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-studio-gold transition font-medium"
          >
            <span>{fallbackLinkText || 'Open the album in Google Photos'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Quick Tips Box directly under the album */}
      {!hideTips && tips && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3 text-xs text-slate-300 leading-relaxed shadow-sm">
          <Info className="w-4 h-4 text-studio-gold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Viewer Guide</span>
            <p className="text-slate-300">{tips}</p>
          </div>
        </div>
      )}
    </div>
  )
}
