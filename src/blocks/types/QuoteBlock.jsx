// src/blocks/types/QuoteBlock.jsx
import React from 'react'
import { Quote } from 'lucide-react'

export function QuoteBlockEditor({ block, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Quote Text</label>
        <textarea
          rows={3}
          value={block.quote || ''}
          onChange={e => onUpdateField('quote', e.target.value)}
          placeholder="Enter the quote text..."
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Author</label>
          <input
            type="text"
            value={block.author || ''}
            onChange={e => onUpdateField('author', e.target.value)}
            placeholder="e.g. Thomas Merton"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Citation / Role</label>
          <input
            type="text"
            value={block.citation || ''}
            onChange={e => onUpdateField('citation', e.target.value)}
            placeholder="e.g. Art Collector"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Avatar / Photo URL (optional)</label>
          <input
            type="text"
            value={block.avatar || ''}
            onChange={e => onUpdateField('avatar', e.target.value)}
            placeholder="/images/avatar.jpg or https://..."
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Display Style</label>
          <select
            value={block.quoteStyle || 'classic'}
            onChange={e => onUpdateField('quoteStyle', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="classic">Classic (Large quotation mark)</option>
            <option value="card">Card (Boxed glass panel)</option>
            <option value="minimal">Minimal (Centered quote)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export function QuoteBlockRenderer({ block }) {
  if (!block.quote) return null
  const style = block.quoteStyle || 'classic'

  if (style === 'minimal') {
    return (
      <figure className="max-w-3xl mx-auto text-center px-4 py-6">
        <blockquote className="font-serif text-xl sm:text-2xl italic text-white/95 leading-relaxed">
          "{block.quote}"
        </blockquote>
        {(block.author || block.citation) && (
          <figcaption className="mt-4 flex items-center justify-center gap-3">
            {block.avatar && (
              <img
                src={block.avatar}
                alt={block.author || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover border border-studio-gold/40"
                loading="lazy"
              />
            )}
            <div className="text-left text-xs">
              {block.author && <div className="font-bold text-white">{block.author}</div>}
              {block.citation && <div className="text-slate-400">{block.citation}</div>}
            </div>
          </figcaption>
        )}
      </figure>
    )
  }

  if (style === 'card') {
    return (
      <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative">
        <Quote className="w-8 h-8 text-studio-gold/25 absolute top-5 right-5 pointer-events-none" />
        <blockquote className="font-serif text-lg sm:text-xl italic text-white/95 leading-relaxed pr-6">
          "{block.quote}"
        </blockquote>
        {(block.author || block.citation) && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3.5">
            {block.avatar && (
              <img
                src={block.avatar}
                alt={block.author || 'Avatar'}
                className="w-11 h-11 rounded-full object-cover border border-studio-gold/40 shadow-sm"
                loading="lazy"
              />
            )}
            <div>
              {block.author && <div className="font-bold text-sm text-white">{block.author}</div>}
              {block.citation && <div className="text-xs text-slate-400">{block.citation}</div>}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Classic style
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 relative">
      <div className="flex gap-4 sm:gap-6 items-start">
        <span className="font-serif text-6xl sm:text-7xl font-bold text-studio-gold/30 leading-none select-none -mt-2">
          “
        </span>
        <div className="flex-grow">
          <blockquote className="font-serif text-lg sm:text-2xl italic text-white/95 leading-relaxed">
            {block.quote}
          </blockquote>
          {(block.author || block.citation) && (
            <div className="mt-4 flex items-center gap-3.5">
              {block.avatar && (
                <img
                  src={block.avatar}
                  alt={block.author || 'Avatar'}
                  className="w-10 h-10 rounded-full object-cover border border-studio-gold/40 shadow-sm"
                  loading="lazy"
                />
              )}
              <div>
                {block.author && <div className="font-bold text-sm text-white">— {block.author}</div>}
                {block.citation && <div className="text-xs text-slate-400">{block.citation}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const id = 'quote'
export const label = 'Quote / Testimonial'
export const icon = '💬'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'quote',
  visible: true,
  quote: 'Art enables us to find ourselves and lose ourselves at the same time.',
  author: 'Thomas Merton',
  citation: 'Writer & Artist',
  avatar: '',
  quoteStyle: 'classic',
  style: {}
})
export const Editor = QuoteBlockEditor
export const Component = QuoteBlockRenderer
