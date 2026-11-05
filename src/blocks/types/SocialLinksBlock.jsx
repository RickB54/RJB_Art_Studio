// src/blocks/types/SocialLinksBlock.jsx
import React from 'react'
import { Youtube, Facebook, Instagram, Mail, Globe, ExternalLink } from 'lucide-react'

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'mailto:rick@example.com' },
  { id: 'faa', label: 'Fine Art America', icon: Globe, placeholder: 'https://fineartamerica.com/profiles/...' },
  { id: 'custom', label: 'Custom Link', icon: ExternalLink, placeholder: 'https://...' }
]

export function SocialLinksBlockEditor({ block, onUpdateField }) {
  const links = block.links || [
    { platform: 'youtube', url: '' },
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'email', url: '' },
    { platform: 'faa', url: '' }
  ]

  const updateLink = (idx, url) => {
    const next = [...links]
    next[idx] = { ...next[idx], url }
    onUpdateField('links', next)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Display Style</label>
          <select
            value={block.linkStyle || 'pills'}
            onChange={e => onUpdateField('linkStyle', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="pills">Pills (Icon + Label)</option>
            <option value="icons">Icon Circles</option>
            <option value="minimal">Minimal Text Links</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Alignment</label>
          <select
            value={block.align || 'center'}
            onChange={e => onUpdateField('align', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Links (leave empty to hide from page)
        </label>
        {links.map((item, idx) => {
          const cfg = PLATFORMS.find(p => p.id === item.platform) || PLATFORMS[5]
          const Icon = cfg.icon
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-studio-gold flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={item.url || ''}
                onChange={e => updateLink(idx, e.target.value)}
                placeholder={cfg.placeholder}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SocialLinksBlockRenderer({ block }) {
  const links = (block.links || []).filter(l => l.url && l.url.trim())
  if (links.length === 0) return null

  const style = block.linkStyle || 'pills'
  const align = block.align || 'center'
  const justifyClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div className={`flex flex-wrap items-center gap-3 ${justifyClass}`}>
      {links.map((item, idx) => {
        const cfg = PLATFORMS.find(p => p.id === item.platform) || PLATFORMS[5]
        const Icon = cfg.icon
        const label = cfg.label

        if (style === 'icons') {
          return (
            <a
              key={idx}
              href={item.url}
              target={item.url.startsWith('mailto:') ? '_self' : '_blank'}
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-studio-gold hover:text-slate-950 hover:border-studio-gold shadow-sm transition-all hover:scale-105"
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        }

        if (style === 'minimal') {
          return (
            <a
              key={idx}
              href={item.url}
              target={item.url.startsWith('mailto:') ? '_self' : '_blank'}
              rel="noreferrer noopener"
              className="text-xs font-semibold text-slate-300 hover:text-studio-gold underline underline-offset-4 transition-colors"
            >
              {label}
            </a>
          )
        }

        // Pills
        return (
          <a
            key={idx}
            href={item.url}
            target={item.url.startsWith('mailto:') ? '_self' : '_blank'}
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-studio-gold hover:text-slate-950 hover:border-studio-gold shadow-sm transition-all hover:scale-105"
          >
            <Icon className="w-4 h-4 text-studio-gold" />
            <span>{label}</span>
          </a>
        )
      })}
    </div>
  )
}

export const id = 'social_links'
export const label = 'Social Links Row'
export const icon = '🔗'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'social_links',
  visible: true,
  linkStyle: 'pills',
  align: 'center',
  links: [
    { platform: 'youtube', url: '' },
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'email', url: '' },
    { platform: 'faa', url: '' }
  ],
  style: {}
})
export const Editor = SocialLinksBlockEditor
export const Component = SocialLinksBlockRenderer
