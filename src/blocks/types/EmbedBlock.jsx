// src/blocks/types/EmbedBlock.jsx
import React from 'react'
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
    height: 850
  }
}

export function Component({ block }) {
  if (!block.url) return null
  const isGoogleForm = block.url.includes('docs.google.com/forms')

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
      <p className="text-[11px] text-slate-400">
        💡 Paste any Google Slides link, Google Forms link, or full <code className="text-slate-300">&lt;iframe&gt;</code> embed code.
      </p>
    </div>
  )
}
