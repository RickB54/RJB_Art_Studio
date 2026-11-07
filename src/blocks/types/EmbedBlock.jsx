// src/blocks/types/EmbedBlock.jsx
import React from 'react'
import { ExternalLink } from 'lucide-react'
import GoogleFormEmbed from '../../components/GoogleFormEmbed'
import MediaEmbed from '../../components/MediaEmbed'
import AdminMediaField from '../../components/AdminMediaField'
import { cleanVideoUrl } from '../helpers'

export const id = 'embed'
export const label = '📋 Embed (Slides, Forms, iFrame URL)'
export const icon = '📋'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    heading: '',
    subtitle: '',
    text: '',
    url: '',
    height: 850,
    showFullScreenLink: false
  }
}

/**
 * Detect and convert Google Slides presentation URLs to embed format.
 * Accepts any of:
 *   - https://docs.google.com/presentation/d/<ID>/edit
 *   - https://docs.google.com/presentation/d/<ID>/pub
 *   - https://docs.google.com/presentation/d/<ID>/present
 *   - https://docs.google.com/presentation/d/<ID>/embed
 * Returns { embedUrl, pubUrl } or null if not a slides URL.
 */
function getGoogleSlidesUrls(raw, delayMs = 3000) {
  if (!raw || !raw.includes('docs.google.com/presentation')) return null
  // Extract presentation ID
  const idMatch = raw.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/)
  if (!idMatch) return null
  const presId = idMatch[1]
  const embedUrl = `https://docs.google.com/presentation/d/${presId}/embed?start=true&loop=true&delayms=${delayMs}`
  const pubUrl = `https://docs.google.com/presentation/d/${presId}/pub?start=true&loop=true&delayms=${delayMs}`
  return { embedUrl, pubUrl }
}

export function Component({ block }) {
  if (!block.url) return null

  const isGoogleForm = block.url.includes('docs.google.com/forms')
  const slidesUrls = getGoogleSlidesUrls(block.url, (block.delaySeconds || 3) * 1000)

  return (
    <div className="space-y-4">
      {(block.heading || block.subtitle || block.text) && (
        <div className="text-center space-y-2 max-w-3xl mx-auto">
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
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {block.text}
            </p>
          )}
        </div>
      )}

      {isGoogleForm ? (
        <GoogleFormEmbed
          url={block.url}
          title={block.heading || 'Online Form'}
          height={block.height || 850}
          className="rounded-3xl border border-white/10 shadow-2xl bg-black/40"
        />
      ) : slidesUrls ? (
        /* Google Slides — use dedicated iframe with autoplay allow, no sandbox, no lazy */
        <div className="space-y-3">
          <div
            className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40"
            style={{ paddingBottom: '56.25%', height: 0 }}
          >
            <iframe
              src={slidesUrls.embedUrl}
              title={block.heading || 'Google Slides Presentation'}
              allowFullScreen
              allow="autoplay; fullscreen"
              frameBorder="0"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
          {block.showFullScreenLink && (
            <div className="text-center">
              <a
                href={slidesUrls.pubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-studio-gold text-black hover:bg-studio-gold-light transition shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Watch full screen
              </a>
            </div>
          )}
        </div>
      ) : (
        <MediaEmbed
          url={block.url}
          poster={block.videoPoster}
          aspectRatio={block.aspectRatio || (block.height ? 'custom' : '16:9')}
          height={block.height || 850}
          title={block.heading || 'Embedded Content'}
          fallbackLinkText={block.fallbackLinkText}
          hideFallbackLink={block.hideFallbackLink}
        />
      )}
    </div>
  )
}

export function Editor({ block, onUpdateField }) {
  const slidesUrls = getGoogleSlidesUrls(block.url || '')
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Heading</label>
          <input
            type="text"
            value={block.heading || ''}
            onChange={e => onUpdateField('heading', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
          <input
            type="text"
            value={block.subtitle || ''}
            onChange={e => onUpdateField('subtitle', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>
      <AdminMediaField
        label="Embed URL / Code (Google Slides, Google Forms, iFrame URL, etc.)"
        url={block.url || ''}
        poster={block.videoPoster || ''}
        aspectRatio={block.aspectRatio || (block.height ? 'custom' : '16:9')}
        customHeight={block.height || 850}
        fallbackLinkText={block.fallbackLinkText || ''}
        hideFallbackLink={block.hideFallbackLink || false}
        onUrlChange={val => onUpdateField('url', cleanVideoUrl(val))}
        onPosterChange={val => onUpdateField('videoPoster', val)}
        onAspectRatioChange={val => onUpdateField('aspectRatio', val)}
        onCustomHeightChange={val => onUpdateField('height', val)}
        onFallbackLinkTextChange={val => onUpdateField('fallbackLinkText', val)}
        onHideFallbackLinkChange={val => onUpdateField('hideFallbackLink', val)}
      />

      {/* Google Slides-specific options */}
      {slidesUrls && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <p className="text-[11px] font-semibold text-blue-300">
            🎞️ Google Slides detected — will embed with autoplay &amp; loop enabled.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Auto-advance Delay (seconds)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={block.delaySeconds || 3}
                onChange={e => onUpdateField('delaySeconds', Math.max(1, parseInt(e.target.value) || 3))}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={block.showFullScreenLink || false}
                  onChange={e => onUpdateField('showFullScreenLink', e.target.checked)}
                  className="accent-studio-gold"
                />
                Show "Watch full screen" button
              </label>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        💡 Paste any Google Slides link, Google Forms link, or full <code className="text-slate-300">&lt;iframe&gt;</code> embed code.
      </p>
    </div>
  )
}
