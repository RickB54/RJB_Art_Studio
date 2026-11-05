// src/blocks/types/GooglePhotosBlock.jsx
import React from 'react'
import GooglePhotosAlbum from '../../components/GooglePhotosAlbum'

export const id = 'google-photos'
export const label = '📸 Google Photos Album'
export const icon = '📸'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    albumUrl: '',
    mode: 'player',
    height: 480,
    delay: 3,
    repeat: true,
    background: '#000000',
    heading: '',
    title: '',
    tips: 'Click any photo to view it full size. Use the arrows to browse.',
    hideTips: false,
    fallbackLinkText: 'Open the album in Google Photos',
    hideFallbackLink: false
  }
}

export function Component({ block }) {
  return (
    <div className="py-4">
      <GooglePhotosAlbum
        albumUrl={block.albumUrl || ''}
        mode={block.mode || 'player'}
        height={block.height ?? 480}
        delay={block.delay ?? 3}
        repeat={block.repeat !== false}
        background={block.background || '#000'}
        heading={block.heading || ''}
        title={block.title || ''}
        tips={block.tips ?? 'Click any photo to view it full size. Use the arrows to browse.'}
        hideTips={block.hideTips || false}
        fallbackLinkText={block.fallbackLinkText || 'Open the album in Google Photos'}
        hideFallbackLink={block.hideFallbackLink || false}
      />
    </div>
  )
}

export function Editor({ block, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-500/20 text-[11px] text-blue-300">
        📸 Paste a <strong>Google Photos shared album</strong> link (<code>photos.app.goo.gl/…</code> or <code>photos.google.com/share/…</code>) or a full snippet from <a href="https://www.publicalbum.org/webapp/embed-player/" target="_blank" rel="noopener" className="underline text-studio-gold">publicalbum.org</a>. The album must be shared with &quot;Anyone with the link&quot;.
      </div>

      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Album URL / PublicAlbum Snippet</label>
        <textarea
          rows={3}
          value={block.albumUrl || ''}
          onChange={e => onUpdateField('albumUrl', e.target.value)}
          placeholder="https://photos.app.goo.gl/... or the full PublicAlbum embed snippet"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono resize-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Mode</label>
          <select
            value={block.mode || 'player'}
            onChange={e => onUpdateField('mode', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            <option value="player">Slideshow Player</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Height (px)</label>
          <input
            type="number"
            min={200}
            max={1200}
            value={block.height ?? 480}
            onChange={e => onUpdateField('height', parseInt(e.target.value) || 480)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Slide Delay (sec)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={block.delay ?? 3}
            onChange={e => onUpdateField('delay', parseInt(e.target.value) || 3)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={block.background || '#000000'}
              onChange={e => onUpdateField('background', e.target.value)}
              className="w-8 h-7 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={block.background || '#000000'}
              onChange={e => onUpdateField('background', e.target.value)}
              className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id={`gp-repeat-${block.id}`}
            checked={block.repeat !== false}
            onChange={e => onUpdateField('repeat', e.target.checked)}
            className="accent-studio-magenta"
          />
          <label htmlFor={`gp-repeat-${block.id}`} className="text-[11px] text-slate-300">Auto-repeat</label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading above album (optional)</label>
          <input
            type="text"
            value={block.heading || ''}
            onChange={e => onUpdateField('heading', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Widget title (optional)</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={e => onUpdateField('title', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-slate-300">Quick Tips text</label>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={block.hideTips || false}
              onChange={e => onUpdateField('hideTips', e.target.checked)}
              className="accent-studio-magenta"
            />
            Hide tips
          </label>
        </div>
        <input
          type="text"
          value={block.tips ?? 'Click any photo to view it full size. Use the arrows to browse.'}
          onChange={e => onUpdateField('tips', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-slate-300">Fallback link text</label>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={block.hideFallbackLink || false}
              onChange={e => onUpdateField('hideFallbackLink', e.target.checked)}
              className="accent-studio-magenta"
            />
            Hide fallback link
          </label>
        </div>
        <input
          type="text"
          value={block.fallbackLinkText || 'Open the album in Google Photos'}
          onChange={e => onUpdateField('fallbackLinkText', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
    </div>
  )
}
