import React, { useState } from 'react'
import { Youtube, ExternalLink, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import PhotoDropZone from './PhotoDropZone'
import MediaEmbed, { normalizeMediaUrl } from './MediaEmbed'

export default function AdminMediaField({
  label = 'Video / Media URL (Optional)',
  url = '',
  poster = '',
  aspectRatio = '16:9',
  height,
  fallbackLinkText = '',
  hideFallbackLink = false,
  onUrlChange,
  onPosterChange,
  onAspectRatioChange,
  onHeightChange,
  onFallbackLinkTextChange,
  onHideFallbackLinkChange,
  showAspectSelector = true,
  showPosterDrop = true,
  showFallbackControls = true
}) {
  const [showPreview, setShowPreview] = useState(true)
  const trimmedUrl = (url || '').trim()
  const media = trimmedUrl ? normalizeMediaUrl(trimmedUrl) : null

  return (
    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
      {/* URL Input */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
            <Youtube className="w-3.5 h-3.5 text-rose-400" />
            <span>{label}</span>
          </label>
          {trimmedUrl && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          )}
        </div>

        <input
          type="text"
          value={url || ''}
          onChange={e => {
            let val = e.target.value
            // If user pasted an iframe tag, extract src
            const iframeMatch = val.match(/src=["']([^"']+)["']/i)
            if (iframeMatch) val = iframeMatch[1]
            onUrlChange(val)
          }}
          placeholder="https://drive.google.com/file/d/... or https://www.youtube.com/watch?v=..."
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
        />

        {/* Required one-line hint */}
        <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
          Paste a YouTube, Google Drive, Vimeo, or Google Form link. Drive files must be shared as Anyone with the link.
        </p>

        {/* Status detection or warning */}
        {trimmedUrl && !media && (
          <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>URL not recognized as a supported media link. Please verify the link starts with http:// or https://.</span>
          </div>
        )}
        {trimmedUrl && media && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detected: <strong>{media.label || media.type}</strong></span>
          </div>
        )}
      </div>

      {/* Aspect Ratio and Height */}
      {showAspectSelector && trimmedUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio || '16:9'}
              onChange={e => onAspectRatioChange && onAspectRatioChange(e.target.value)}
              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="16:9">16:9 Widescreen (Standard Video)</option>
              <option value="4:3">4:3 Standard</option>
              <option value="9:16">9:16 Vertical / Short / Reel</option>
              <option value="custom">Custom Height (Forms / Documents)</option>
            </select>
          </div>
          {aspectRatio === 'custom' && onHeightChange && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Height (px)</label>
              <input
                type="number"
                value={height || 500}
                onChange={e => onHeightChange(parseInt(e.target.value, 10) || 500)}
                placeholder="500"
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
          )}
        </div>
      )}

      {/* Poster / Thumbnail Dropzone */}
      {showPosterDrop && (
        <div className="pt-1 border-t border-white/5">
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Video Thumbnail / Poster Image (Optional — click-to-load play screen)
          </label>
          <PhotoDropZone
            value={poster || ''}
            onChange={url => onPosterChange && onPosterChange(url)}
            label="Upload Thumbnail Poster (Optional)"
          />
        </div>
      )}

      {/* Fallback "Open in a new tab" link controls */}
      {showFallbackControls && trimmedUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-white/5 items-center">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              "Open in new tab" Link Text (Fallback)
            </label>
            <input
              type="text"
              value={fallbackLinkText || ''}
              onChange={e => onFallbackLinkTextChange && onFallbackLinkTextChange(e.target.value)}
              placeholder="e.g. Open video in Google Drive ↗"
              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500"
            />
          </div>
          <div className="pt-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={!!hideFallbackLink}
                onChange={e => onHideFallbackLinkChange && onHideFallbackLinkChange(e.target.checked)}
                className="rounded bg-[#13111c] border-white/20 text-studio-magenta focus:ring-0"
              />
              <span>Hide fallback link</span>
            </label>
          </div>
        </div>
      )}

      {/* Live Preview */}
      {trimmedUrl && showPreview && media && (
        <div className="pt-2 border-t border-white/5">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Live Preview:</span>
          <div className="max-w-xl mx-auto">
            <MediaEmbed
              url={trimmedUrl}
              poster={poster}
              aspectRatio={aspectRatio || '16:9'}
              height={height}
              fallbackLinkText={fallbackLinkText}
              hideFallbackLink={hideFallbackLink}
            />
          </div>
        </div>
      )}
    </div>
  )
}
