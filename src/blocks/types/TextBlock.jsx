// src/blocks/types/TextBlock.jsx
import React from 'react'
import AdminMediaField from '../../components/AdminMediaField'
import { BlockVideoEmbed, cleanVideoUrl } from '../helpers'

export const id = 'text'
export const label = '📄 Text Section'
export const icon = '📄'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    heading: '',
    subtitle: '',
    text: 'Enter your custom paragraph text here.',
    videoUrl: '',
    videoPoster: '',
    aspectRatio: '16:9'
  }
}

export function Component({ block }) {
  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 space-y-4">
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
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Text Content</label>
        <textarea
          rows={3}
          value={block.text || ''}
          onChange={e => onUpdateField('text', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-y font-mono"
        />
      </div>

      <div className="pt-2 border-t border-white/5">
        <span className="text-[11px] font-bold text-studio-gold uppercase tracking-wider block mb-2">
          Optional Video Below Text
        </span>
        <AdminMediaField
          label="Video (YouTube, Vimeo, Google Drive, MP4, etc.)"
          url={block.videoUrl || ''}
          poster={block.videoPoster || ''}
          aspectRatio={block.aspectRatio || '16:9'}
          fallbackLinkText={block.fallbackLinkText || ''}
          hideFallbackLink={block.hideFallbackLink || false}
          onUrlChange={val => onUpdateField('videoUrl', cleanVideoUrl(val))}
          onPosterChange={val => onUpdateField('videoPoster', val)}
          onAspectRatioChange={val => onUpdateField('aspectRatio', val)}
          onFallbackLinkTextChange={val => onUpdateField('fallbackLinkText', val)}
          onHideFallbackLinkChange={val => onUpdateField('hideFallbackLink', val)}
        />
      </div>
    </div>
  )
}
