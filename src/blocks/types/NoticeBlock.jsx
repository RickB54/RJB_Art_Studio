// src/blocks/types/NoticeBlock.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight } from 'lucide-react'

export const id = 'notice'
export const label = '🔔 Notice Box'
export const icon = '🔔'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    title: 'Notice',
    text: 'Important notice or update message.',
    linkText: '',
    linkUrl: ''
  }
}

export function Component({ block }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-studio-magenta/15 via-studio-purple/20 to-studio-surface border border-studio-magenta/40 flex items-start gap-4 shadow-lg">
      <div className="p-2.5 rounded-xl bg-studio-magenta/20 text-studio-magenta shrink-0">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1.5 flex-1">
        {block.title && (
          <h4 className="font-serif text-lg font-bold text-white tracking-tight">
            {block.title}
          </h4>
        )}
        {block.text && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {block.text}
          </p>
        )}
        {block.linkUrl && (
          <div className="pt-2">
            {block.linkUrl.startsWith('http') ? (
              <a
                href={block.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-studio-gold hover:text-white transition"
              >
                <span>{block.linkText || 'Learn More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                to={block.linkUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-studio-gold hover:text-white transition"
              >
                <span>{block.linkText || 'Learn More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Editor({ block, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Notice Title</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={e => onUpdateField('title', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Link URL (Optional)</label>
          <input
            type="text"
            value={block.linkUrl || ''}
            onChange={e => onUpdateField('linkUrl', e.target.value)}
            placeholder="/contact or https://..."
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Notice Text</label>
        <textarea
          rows={2}
          value={block.text || ''}
          onChange={e => onUpdateField('text', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-y"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Link Button Text</label>
        <input
          type="text"
          value={block.linkText || ''}
          onChange={e => onUpdateField('linkText', e.target.value)}
          placeholder="Learn More"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
    </div>
  )
}
