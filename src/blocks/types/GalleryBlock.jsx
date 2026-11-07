// src/blocks/types/GalleryBlock.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Image as ImageIcon,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  Layers
} from 'lucide-react'
import { parseVideoEmbed, BlockVideoEmbed } from '../helpers'

const GAP_CLASSES = {
  none: 'gap-0',
  xs: 'gap-1.5',
  s: 'gap-3',
  m: 'gap-5',
  l: 'gap-8',
  xl: 'gap-12'
}

const COLUMN_GRID_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
}

const COLUMN_MASONRY_CLASSES = {
  1: 'columns-1',
  2: 'columns-1 sm:columns-2',
  3: 'columns-1 sm:columns-2 lg:columns-3',
  4: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
  5: 'columns-2 sm:columns-3 md:columns-4 lg:columns-5',
  6: 'columns-2 sm:columns-3 md:columns-4 lg:columns-6'
}

async function uploadGalleryImage(file) {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error(`"${file.name}" exceeds 20 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Upload rejected.`)
  }

  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  try {
    const res = await fetch('/__api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, dataBase64, folder: 'gallery' })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.url) return data
    }
  } catch {
    // Dev API unavailable, fall through to client-side canvas resize
  }

  // Client-side canvas fallback
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // 1600px max
      const scale1600 = Math.min(1, 1600 / Math.max(img.width, img.height))
      const c1 = document.createElement('canvas')
      c1.width = Math.round(img.width * scale1600)
      c1.height = Math.round(img.height * scale1600)
      const ctx1 = c1.getContext('2d')
      ctx1.drawImage(img, 0, 0, c1.width, c1.height)
      const fullUrl = c1.toDataURL('image/webp', 0.85)

      // 500px thumb
      const scale500 = Math.min(1, 500 / Math.max(img.width, img.height))
      const c2 = document.createElement('canvas')
      c2.width = Math.round(img.width * scale500)
      c2.height = Math.round(img.height * scale500)
      const ctx2 = c2.getContext('2d')
      ctx2.drawImage(img, 0, 0, c2.width, c2.height)
      const thumbUrl = c2.toDataURL('image/webp', 0.80)

      resolve({
        url: fullUrl,
        thumbnailUrl: thumbUrl,
        warning: file.size > 500 * 1024 ? `File is over 500 KB (${Math.round(file.size / 1024)} KB)` : null
      })
    }
    img.onerror = () => reject(new Error('Failed to load image for resizing'))
    img.src = `data:${file.type};base64,${dataBase64}`
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN EDITOR
// ─────────────────────────────────────────────────────────────────────────────
export function GalleryBlockEditor({ block, onUpdateField, onUpdateBlock }) {
  const items = block.items || []
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [warningMsg, setWarningMsg] = useState('')
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [videoCaptionInput, setVideoCaptionInput] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setErrorMsg('')
    setWarningMsg('')
    setIsUploading(true)

    try {
      const newItems = []
      const warnings = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        try {
          const res = await uploadGalleryImage(file)
          if (res.warning) warnings.push(`"${file.name}": ${res.warning}`)
          newItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'photo',
            url: res.url,
            thumbUrl: res.thumbnailUrl || res.url,
            caption: ''
          })
        } catch (err) {
          setErrorMsg(err.message)
        }
      }
      if (warnings.length > 0) {
        setWarningMsg(warnings.join(' • '))
      }
      if (newItems.length > 0) {
        onUpdateField('items', [...items, ...newItems])
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddVideo = () => {
    if (!videoUrlInput.trim()) return
    const newVideoItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'video',
      videoUrl: videoUrlInput.trim(),
      caption: videoCaptionInput.trim()
    }
    onUpdateField('items', [...items, newVideoItem])
    setVideoUrlInput('')
    setVideoCaptionInput('')
    setShowAddVideo(false)
  }

  const handleMove = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    onUpdateField('items', updated)
  }

  const handleDelete = (index) => {
    if (window.confirm('Remove this item from the gallery?')) {
      onUpdateField('items', items.filter((_, i) => i !== index))
    }
  }

  const handleUpdateCaption = (index, caption) => {
    const updated = [...items]
    updated[index] = { ...updated[index], caption }
    onUpdateField('items', updated)
  }

  const isOver60 = items.length >= 60
  const photoItems = items.filter(it => it.type !== 'video')
  const photoCount = photoItems.length
  const isSlideshow = block.layout === 'slideshow'
  const WARN_LIMIT = isSlideshow ? 30 : 40
  const isOverLimit = photoCount > WARN_LIMIT

  // Budget: estimate sizes (use item.size if stored, else assume avg 200 KB full + 40 KB thumb)
  const AVG_FULL = 200 * 1024
  const AVG_THUMB = 40 * 1024
  const estimatedBytes = photoCount * (AVG_FULL + AVG_THUMB)
  const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(1)
  const creditsPerGb = 20
  const gbPerVisit = estimatedBytes / (1024 * 1024 * 1024)
  const creditsPer1k = (gbPerVisit * 1000 * creditsPerGb).toFixed(2)

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Gallery Title (Optional)</label>
          <input
            type="text"
            value={block.title || ''}
            onChange={e => onUpdateField('title', e.target.value)}
            placeholder="e.g. Studio Showcase 2026"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Layout Mode</label>
          <select
            value={block.layout || 'grid'}
            onChange={e => onUpdateField('layout', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="grid">Grid (Equal Aspect Squares/Rectangles)</option>
            <option value="masonry">Masonry (Natural Image Heights)</option>
            <option value="slideshow">Slideshow (Carousel with Arrows & Dots)</option>
          </select>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Columns</label>
          <select
            value={block.columns || 3}
            onChange={e => onUpdateField('columns', parseInt(e.target.value))}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'column' : 'columns'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Gap Spacing</label>
          <select
            value={block.gap || 'm'}
            onChange={e => onUpdateField('gap', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
          >
            <option value="none">None (0px)</option>
            <option value="xs">XS (6px)</option>
            <option value="s">S (12px)</option>
            <option value="m">M (20px)</option>
            <option value="l">L (32px)</option>
            <option value="xl">XL (48px)</option>
          </select>
        </div>

        {block.layout === 'slideshow' && (
          <>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Autoplay</label>
              <select
                value={block.autoplay ? 'yes' : 'no'}
                onChange={e => onUpdateField('autoplay', e.target.value === 'yes')}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <option value="no">Disabled</option>
                <option value="yes">Enabled</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Delay (Seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={block.delaySeconds || 4}
                onChange={e => onUpdateField('delaySeconds', parseInt(e.target.value) || 4)}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
          </>
        )}
      </div>

      {/* Media Budget Panel */}
      {photoCount > 0 && (
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-studio-gold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Media Budget</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[10px] text-slate-400">Photos</p>
              <p className="text-sm font-bold text-white">{photoCount}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[10px] text-slate-400">Est. Size</p>
              <p className="text-sm font-bold text-studio-gold">~{estimatedMB} MB</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[10px] text-slate-400">Transfer / Visit</p>
              <p className="text-sm font-bold text-sky-300">~{(gbPerVisit * 1024).toFixed(0)} KB</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[10px] text-slate-400">Credits / 1k Visits</p>
              <p className="text-sm font-bold text-emerald-400">~{creditsPer1k}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Estimates based on avg 200 KB full + 40 KB thumb per photo, {creditsPerGb} Netlify credits/GB.</p>
        </div>
      )}

      {/* Item count warnings */}
      {isOverLimit && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Performance Warning:</strong> This {isSlideshow ? 'slideshow' : 'gallery'} has {photoCount} photos (limit: {WARN_LIMIT}). Consider splitting into multiple galleries for better performance.
          </span>
        </div>
      )}
      {isOver60 && !isOverLimit && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span><strong>Heavy Gallery:</strong> {items.length} items may significantly impact page load. Split into multiple blocks.</span>
        </div>
      )}

      {warningMsg && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
          ⚠️ {warningMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          ✗ {errorMsg}
        </div>
      )}

      {/* Batch Upload Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'))
          handleFiles(files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className="p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-studio-magenta/60 bg-white/[0.02] hover:bg-white/[0.04] transition text-center cursor-pointer space-y-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-studio-magenta/20 text-studio-magenta flex items-center justify-center mx-auto">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-white">
          {isUploading ? 'Resizing and uploading photos...' : 'Drag & drop photos here, or click to browse'}
        </p>
        <p className="text-[11px] text-slate-400">
          Auto-resized to 1400px ≤250 KB WebP + 480px ≤50 KB thumb. Max 20 MB per file. Duplicates are detected automatically.
        </p>
      </div>

      {/* Add Video Button & Form */}
      <div>
        {!showAddVideo ? (
          <button
            type="button"
            onClick={() => setShowAddVideo(true)}
            className="text-xs font-medium text-studio-gold hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <Film className="w-3.5 h-3.5" />
            <span>+ Add Video (YouTube or Google Drive link)</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-500" />
                <span>Add Video Link (Never self-hosted)</span>
              </span>
              <button type="button" onClick={() => setShowAddVideo(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">YouTube or Google Drive URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or Drive link"
                  value={videoUrlInput}
                  onChange={e => setVideoUrlInput(e.target.value)}
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Video Caption / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Oil painting demonstration timelapse"
                  value={videoCaptionInput}
                  onChange={e => setVideoCaptionInput(e.target.value)}
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddVideo}
              disabled={!videoUrlInput.trim()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-40"
            >
              Add Video to Gallery
            </button>
          </div>
        )}
      </div>

      {/* Items List (Photos & Videos) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Gallery Items ({items.length})</span>
          <span>Reorder or add captions</span>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-white/10 rounded-xl">
            No photos or videos in this gallery yet. Drop files above or add a video link.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {items.map((it, idx) => (
              <div
                key={it.id || idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition"
              >
                {/* Thumb Preview */}
                <div className="w-14 h-12 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  {it.type === 'video' ? (
                    <div className="flex flex-col items-center justify-center text-red-400">
                      <Film className="w-5 h-5" />
                      <span className="text-[9px] uppercase font-bold">Video</span>
                    </div>
                  ) : (
                    <img
                      src={it.thumbUrl || it.url}
                      alt={it.caption || 'Thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Caption / Details */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={it.caption || ''}
                    onChange={e => handleUpdateCaption(idx, e.target.value)}
                    placeholder={it.type === 'video' ? (it.videoUrl || 'Video caption') : 'Add optional photo caption...'}
                    className="w-full bg-[#13111c] border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    #{idx + 1} • {it.type === 'video' ? it.videoUrl : it.url}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC RENDERER
// ─────────────────────────────────────────────────────────────────────────────
export function GalleryBlockRenderer({ block }) {
  const items = block.items || []
  if (items.length === 0) return null

  const layout = block.layout || 'grid'
  const cols = block.columns || 3
  const gapKey = block.gap || 'm'
  const gapClass = GAP_CLASSES[gapKey] || GAP_CLASSES.m

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [touchStart, setTouchStart] = useState(null)

  // Slideshow carousel state
  const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(Boolean(block.autoplay))
  const [isHovered, setIsHovered] = useState(false)

  const delayMs = (block.delaySeconds || 4) * 1000

  // Slideshow autoplay
  useEffect(() => {
    if (layout !== 'slideshow' || !isPlaying || isHovered || items.length <= 1) return
    const interval = setInterval(() => {
      setSlideshowIndex(prev => (prev + 1) % items.length)
    }, delayMs)
    return () => clearInterval(interval)
  }, [layout, isPlaying, isHovered, items.length, delayMs])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % items.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, items.length])

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e, onSwipeLeft, onSwipeRight) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 40) {
      if (diff > 0) onSwipeLeft()
      else onSwipeRight()
    }
    setTouchStart(null)
  }

  const activeLightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <div className="space-y-6">
      {/* Title / Description */}
      {(block.title || block.description) && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          {block.title && (
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {block.title}
            </h3>
          )}
          {block.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {block.description}
            </p>
          )}
        </div>
      )}

      {/* ── LAYOUT: SLIDESHOW ── */}
      {layout === 'slideshow' && (
        <div
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={e => handleTouchEnd(
            e,
            () => setSlideshowIndex(prev => (prev + 1) % items.length),
            () => setSlideshowIndex(prev => (prev - 1 + items.length) % items.length)
          )}
        >
          {/* Main Slide */}
          <div className="relative aspect-[16/10] bg-black/60 flex items-center justify-center">
            {items[slideshowIndex]?.type === 'video' ? (
              <div className="w-full h-full p-4 flex items-center justify-center">
                <BlockVideoEmbed url={items[slideshowIndex].videoUrl} title={items[slideshowIndex].caption || 'Video'} />
              </div>
            ) : (
              <img
                src={items[slideshowIndex]?.url}
                alt={items[slideshowIndex]?.caption || `Slide ${slideshowIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer"
                loading="lazy"
                onClick={() => setLightboxIndex(slideshowIndex)}
              />
            )}

            {/* Expand icon overlay */}
            {items[slideshowIndex]?.type !== 'video' && (
              <button
                type="button"
                onClick={() => setLightboxIndex(slideshowIndex)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-studio-magenta transition opacity-0 group-hover:opacity-100"
                title="View full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {/* Prev / Next Buttons */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSlideshowIndex(prev => (prev - 1 + items.length) % items.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-studio-magenta text-white transition shadow-lg opacity-80 hover:opacity-100"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideshowIndex(prev => (prev + 1) % items.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-studio-magenta text-white transition shadow-lg opacity-80 hover:opacity-100"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Slide Footer / Caption & Controls */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-medium truncate max-w-md">
              {items[slideshowIndex]?.caption || `Slide ${slideshowIndex + 1} of ${items.length}`}
            </span>

            <div className="flex items-center gap-3">
              {block.autoplay && (
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-white/5"
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? <Pause className="w-3 h-3 text-studio-gold" /> : <Play className="w-3 h-3 text-studio-gold" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              )}

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlideshowIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      slideshowIndex === i ? 'w-5 bg-studio-magenta' : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT: MASONRY ── */}
      {layout === 'masonry' && (
        <div className={`${COLUMN_MASONRY_CLASSES[cols] || COLUMN_MASONRY_CLASSES[3]} ${gapClass} space-y-4`}>
          {items.map((it, idx) => (
            <div
              key={it.id || idx}
              className="break-inside-avoid rounded-2xl overflow-hidden glass-panel border border-white/10 group cursor-pointer relative mb-4 transition-transform duration-300 hover:scale-[1.01]"
              onClick={() => setLightboxIndex(idx)}
            >
              {it.type === 'video' ? (
                <div className="p-2 bg-black/40">
                  <BlockVideoEmbed url={it.videoUrl} title={it.caption || 'Video'} />
                </div>
              ) : (
                <div className="relative overflow-hidden bg-black/40">
                  <img
                    src={it.thumbUrl || it.url}
                    alt={it.caption || `Gallery item ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
              )}
              {it.caption && (
                <div className="p-3 bg-black/30 border-t border-white/5">
                  <p className="text-xs text-slate-300 leading-snug">{it.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT: GRID ── */}
      {layout === 'grid' && (
        <div className={`grid ${COLUMN_GRID_CLASSES[cols] || COLUMN_GRID_CLASSES[3]} ${gapClass}`}>
          {items.map((it, idx) => (
            <div
              key={it.id || idx}
              className="rounded-2xl overflow-hidden glass-panel border border-white/10 group cursor-pointer relative flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => setLightboxIndex(idx)}
            >
              {it.type === 'video' ? (
                <div className="aspect-video bg-black/60 flex items-center justify-center p-2">
                  <BlockVideoEmbed url={it.videoUrl} title={it.caption || 'Video'} />
                </div>
              ) : (
                <div className="relative aspect-square sm:aspect-[4/3] bg-black/40 overflow-hidden">
                  <img
                    src={it.thumbUrl || it.url}
                    alt={it.caption || `Gallery item ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
              )}

              {it.caption && (
                <div className="p-3 bg-black/30 border-t border-white/5">
                  <p className="text-xs text-slate-300 line-clamp-2">{it.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── LIGHTBOX MODAL ── */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={e => handleTouchEnd(
            e,
            () => setLightboxIndex((lightboxIndex + 1) % items.length),
            () => setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)
          )}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-studio-magenta text-white transition z-50"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex + 1) % items.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-studio-magenta text-white transition z-50"
              aria-label="Next item"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Lightbox Content */}
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center justify-center space-y-3">
            <div className="max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl">
              {activeLightboxItem.type === 'video' ? (
                <div className="w-[80vw] max-w-3xl aspect-video">
                  <BlockVideoEmbed url={activeLightboxItem.videoUrl} title={activeLightboxItem.caption || 'Video'} />
                </div>
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.caption || 'Gallery photo'}
                  className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Caption & Counter */}
            <div className="text-center space-y-1 px-4">
              {activeLightboxItem.caption && (
                <p className="text-sm sm:text-base text-white font-serif">
                  {activeLightboxItem.caption}
                </p>
              )}
              <p className="text-xs text-slate-400">
                Item {lightboxIndex + 1} of {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const id = 'gallery'
export const label = 'Gallery'
export const icon = '🖼️'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'gallery',
  visible: true,
  title: '',
  description: '',
  layout: 'grid',
  columns: 3,
  gap: 'm',
  autoplay: false,
  delaySeconds: 4,
  items: [],
  style: {}
})
export const Editor = GalleryBlockEditor
export const Component = GalleryBlockRenderer

