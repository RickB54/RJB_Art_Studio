// src/blocks/types/ButtonBlock.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'

export const id = 'button'
export const label = '🔘 Button Link'
export const icon = '🔘'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    text: 'Learn More',
    url: '/gallery',
    subtitle: '',
    align: 'center'
  }
}

export function Component({ block }) {
  const alignClass = block.align === 'left' ? 'justify-start' : block.align === 'right' ? 'justify-end' : 'justify-center'
  const isExternal = block.url && block.url.startsWith('http')

  return (
    <div className={`py-4 flex flex-col items-center ${block.align === 'left' ? 'sm:items-start' : block.align === 'right' ? 'sm:items-end' : 'sm:items-center'}`}>
      <div className={`flex ${alignClass} w-full`}>
        {isExternal ? (
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-studio-magenta to-studio-fuchsia hover:from-studio-fuchsia hover:to-studio-magenta text-white font-bold text-sm tracking-wide shadow-glow-magenta hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
          >
            <span>{block.text || 'Explore'}</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <Link
            to={block.url || '/gallery'}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-studio-magenta to-studio-fuchsia hover:from-studio-fuchsia hover:to-studio-magenta text-white font-bold text-sm tracking-wide shadow-glow-magenta hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
          >
            <span>{block.text || 'Explore'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      {block.subtitle && (
        <p className="text-xs text-slate-400 mt-2 italic text-center">
          {block.subtitle}
        </p>
      )}
    </div>
  )
}

export function Editor({ block, onUpdateField }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Button Text</label>
        <input
          type="text"
          value={block.text || ''}
          onChange={e => onUpdateField('text', e.target.value)}
          placeholder="Explore The Gallery"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Link URL</label>
        <input
          type="text"
          value={block.url || ''}
          onChange={e => onUpdateField('url', e.target.value)}
          placeholder="/gallery or https://..."
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Caption Below (Optional)</label>
        <input
          type="text"
          value={block.subtitle || ''}
          onChange={e => onUpdateField('subtitle', e.target.value)}
          placeholder="Free shipping in US"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Alignment</label>
        <select
          value={block.align || 'center'}
          onChange={e => onUpdateField('align', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
}
