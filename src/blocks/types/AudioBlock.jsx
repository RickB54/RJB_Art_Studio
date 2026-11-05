// src/blocks/types/AudioBlock.jsx
import React from 'react'
import { Music, Volume2 } from 'lucide-react'

function parseAudioSource(url) {
  if (!url) return { type: 'none', src: '' }
  const trimmed = url.trim()

  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
  }

  return { type: 'direct', src: trimmed }
}

export function AudioBlockEditor({ block, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Audio URL (MP3, WAV, or Google Drive link)
        </label>
        <input
          type="text"
          value={block.url || ''}
          onChange={e => onUpdateField('url', e.target.value)}
          placeholder="https://example.com/audio.mp3 or Google Drive share link"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Supports direct audio files (.mp3, .wav, .ogg, .m4a) and Google Drive file links.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Track Title</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={e => onUpdateField('title', e.target.value)}
            placeholder="e.g. Studio Session Audio"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Artist / Performer</label>
          <input
            type="text"
            value={block.artist || ''}
            onChange={e => onUpdateField('artist', e.target.value)}
            placeholder="e.g. Rick Berube"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Caption / Notes (optional)</label>
        <input
          type="text"
          value={block.caption || ''}
          onChange={e => onUpdateField('caption', e.target.value)}
          placeholder="e.g. Background recording from the painting studio"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>
    </div>
  )
}

export function AudioBlockRenderer({ block }) {
  if (!block.url) return null
  const source = parseAudioSource(block.url)

  if (source.type === 'drive') {
    return (
      <div className="max-w-xl mx-auto glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        {(block.title || block.artist) && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-studio-gold/15 text-studio-gold flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              {block.title && <h4 className="font-serif font-bold text-base text-white">{block.title}</h4>}
              {block.artist && <p className="text-xs text-slate-400">{block.artist}</p>}
            </div>
          </div>
        )}
        <iframe
          src={source.src}
          title={block.title || 'Audio Player'}
          className="w-full h-24 rounded-2xl border border-white/10 bg-black/40"
          allow="autoplay"
        />
        {block.caption && (
          <p className="text-xs text-slate-400 text-center italic">{block.caption}</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-studio-gold/15 text-studio-gold flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-grow">
          <h4 className="font-serif font-bold text-base text-white truncate">
            {block.title || 'Audio Track'}
          </h4>
          {block.artist && (
            <p className="text-xs text-slate-400 truncate">{block.artist}</p>
          )}
        </div>
      </div>
      <audio
        controls
        className="w-full rounded-xl"
        src={source.src}
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>
      {block.caption && (
        <p className="text-xs text-slate-400 text-center italic">{block.caption}</p>
      )}
    </div>
  )
}

export const id = 'audio'
export const label = 'Audio Player'
export const icon = '🎵'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'audio',
  visible: true,
  title: 'Studio Audio Track',
  artist: 'Rick Berube',
  url: '',
  caption: '',
  style: {}
})
export const Editor = AudioBlockEditor
export const Component = AudioBlockRenderer
