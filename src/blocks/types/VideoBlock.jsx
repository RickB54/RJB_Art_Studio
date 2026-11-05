// src/blocks/types/VideoBlock.jsx
import React from 'react'
import MediaEmbed from '../../components/MediaEmbed'
import AdminMediaField from '../../components/AdminMediaField'
import { cleanVideoUrl } from '../helpers'

export const id = 'video'
export const label = '🎬 Video (YouTube)'
export const icon = '🎬'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    heading: '',
    subtitle: '',
    text: '',
    url: '',
    videoPoster: '',
    aspectRatio: '16:9'
  }
}

export function Component({ block }) {
  if (!block.url) return null

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {(block.heading || block.subtitle || block.text) && (
        <div className="text-center space-y-2">
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

      <MediaEmbed
        url={block.url}
        poster={block.videoPoster}
        aspectRatio={block.aspectRatio || '16:9'}
        title={block.heading || 'Featured Video'}
        fallbackLinkText={block.fallbackLinkText}
        hideFallbackLink={block.hideFallbackLink}
      />
    </div>
  )
}

export function Editor({ block, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading</label>
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
        label="Video URL"
        url={block.url || ''}
        poster={block.videoPoster || ''}
        aspectRatio={block.aspectRatio || '16:9'}
        fallbackLinkText={block.fallbackLinkText || ''}
        hideFallbackLink={block.hideFallbackLink || false}
        onUrlChange={val => onUpdateField('url', cleanVideoUrl(val))}
        onPosterChange={val => onUpdateField('videoPoster', val)}
        onAspectRatioChange={val => onUpdateField('aspectRatio', val)}
        onFallbackLinkTextChange={val => onUpdateField('fallbackLinkText', val)}
        onHideFallbackLinkChange={val => onUpdateField('hideFallbackLink', val)}
      />
    </div>
  )
}
