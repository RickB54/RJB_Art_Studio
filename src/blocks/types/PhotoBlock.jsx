// src/blocks/types/PhotoBlock.jsx
import React from 'react'
import { Plus, Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react'
import PhotoDropZone from '../../components/PhotoDropZone'
import AdminMediaField from '../../components/AdminMediaField'
import { cleanPhotoUrl, cleanVideoUrl, BlockVideoEmbed } from '../helpers'

export const id = 'photo'
export const label = '📷 Photo(s)'
export const icon = '📷'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    images: [],
    image: '',
    caption: '',
    size: 'medium',
    align: 'center',
    layout: 'row',
    videoUrl: '',
    videoPoster: '',
    videoPosition: 'below',
    aspectRatio: '16:9'
  }
}

export function getBlockPhotos(b) {
  if (Array.isArray(b?.images) && b.images.length > 0) {
    return b.images
  }
  if (b?.image) {
    return [{
      id: b.id ? `${b.id}-img-1` : 'img-1',
      url: b.image,
      caption: b.caption || '',
      size: b.size || 'medium',
      align: b.align || 'center'
    }]
  }
  return []
}

export function Component({ block, onOpenLightbox }) {
  const photos = getBlockPhotos(block).filter(p => p && p.url)
  if (photos.length === 0 && !block.videoUrl) return null

  const layout = block.layout || 'row'
  const videoPosition = block.videoPosition || 'below'

  const renderBlockVideo = () => {
    if (!block.videoUrl) return null
    return (
      <div className="max-w-4xl mx-auto w-full">
        <BlockVideoEmbed
          url={block.videoUrl}
          poster={block.videoPoster}
          title={block.caption || 'Photo Block Video'}
        />
      </div>
    )
  }

  let photosContent = null

  if (photos.length === 1) {
    const photo = photos[0]
    const size = photo.size || block.size || 'medium'
    const align = photo.align || block.align || 'center'
    const sizeClass = size === 'small' ? 'max-w-md' : size === 'large' ? 'max-w-5xl' : size === 'full' ? 'max-w-full' : 'max-w-2xl'
    const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto'
    const textAlignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
    const photoUrl = cleanPhotoUrl(photo.url)

    photosContent = (
      <figure className={`${sizeClass} ${alignClass} space-y-2`}>
        <div
          className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
          onClick={() => onOpenLightbox && onOpenLightbox({ url: photoUrl, caption: photo.caption })}
        >
          <img
            src={photoUrl}
            alt={photo.caption || 'Custom Block Photo'}
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
        {photo.caption && (
          <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
            {photo.caption}
          </figcaption>
        )}
      </figure>
    )
  } else if (layout === 'stacked') {
    photosContent = (
      <div className="space-y-6">
        {photos.map((photo, pIdx) => {
          const pSize = photo.size || 'medium'
          const pAlign = photo.align || 'center'
          const sizeClass = pSize === 'small' ? 'max-w-md' : pSize === 'large' ? 'max-w-5xl' : 'max-w-2xl'
          const alignClass = pAlign === 'left' ? 'mr-auto' : pAlign === 'right' ? 'ml-auto' : 'mx-auto'
          const textAlignClass = pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'
          const photoUrl = cleanPhotoUrl(photo.url)
          return (
            <figure key={photo.id || pIdx} className={`${sizeClass} ${alignClass} space-y-2`}>
              <div
                className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
                onClick={() => onOpenLightbox && onOpenLightbox({ url: photoUrl, caption: photo.caption })}
              >
                <img
                  src={photoUrl}
                  alt={photo.caption || `Photo ${pIdx + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {photo.caption && (
                <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    )
  } else if (layout === 'grid') {
    const gridCols = photos.length === 2 ? 'sm:grid-cols-2 max-w-4xl' : 'sm:grid-cols-2 lg:grid-cols-3 max-w-6xl'
    photosContent = (
      <div className={`grid grid-cols-1 ${gridCols} gap-6 mx-auto`}>
        {photos.map((photo, pIdx) => {
          const photoUrl = cleanPhotoUrl(photo.url)
          const textAlignClass = (photo.align || 'center') === 'left' ? 'text-left' : (photo.align || 'center') === 'right' ? 'text-right' : 'text-center'
          return (
            <figure key={photo.id || pIdx} className="space-y-2">
              <div
                className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in aspect-square sm:aspect-[4/3]"
                onClick={() => onOpenLightbox && onOpenLightbox({ url: photoUrl, caption: photo.caption })}
              >
                <img
                  src={photoUrl}
                  alt={photo.caption || `Photo ${pIdx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {photo.caption && (
                <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    )
  } else {
    // Row / side-by-side
    const hasLeft = photos.some(p => (p.align || 'center') === 'left')
    const hasRight = photos.some(p => (p.align || 'center') === 'right')
    const allLeft = photos.every(p => (p.align || 'center') === 'left')
    const allRight = photos.every(p => (p.align || 'center') === 'right')

    const justifyClass = (hasLeft && hasRight)
      ? 'justify-between'
      : allLeft
      ? 'justify-start'
      : allRight
      ? 'justify-end'
      : 'justify-center'

    photosContent = (
      <div className={`flex flex-wrap items-end ${justifyClass} gap-6 max-w-6xl mx-auto`}>
        {photos.map((photo, pIdx) => {
          const pSize = photo.size || 'medium'
          const pAlign = photo.align || 'center'
          const flexBasis = pSize === 'small' ? 'sm:flex-1 sm:max-w-xs' : pSize === 'large' ? 'sm:flex-[2] sm:max-w-2xl' : 'sm:flex-1 sm:max-w-md'
          const textAlignClass = pAlign === 'left' ? 'text-left' : pAlign === 'right' ? 'text-right' : 'text-center'
          const photoUrl = cleanPhotoUrl(photo.url)
          return (
            <figure key={photo.id || pIdx} className={`w-full ${flexBasis} space-y-2`}>
              <div
                className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl group cursor-zoom-in"
                onClick={() => onOpenLightbox && onOpenLightbox({ url: photoUrl, caption: photo.caption })}
              >
                <img
                  src={photoUrl}
                  alt={photo.caption || `Photo ${pIdx + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {photo.caption && (
                <figcaption className={`text-xs text-slate-400 italic pt-1 ${textAlignClass}`}>
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    )
  }

  return (
    <div className="py-2 space-y-4">
      {videoPosition === 'above' && renderBlockVideo()}
      {photosContent}
      {videoPosition === 'below' && renderBlockVideo()}
    </div>
  )
}

export function Editor({ block, onUpdateField, onUpdateBlock }) {
  const photos = getBlockPhotos(block)

  const handleUpdateBlockPhotos = (newPhotos, extra = {}) => {
    const first = newPhotos[0]
    onUpdateBlock({
      ...block,
      images: newPhotos,
      image: first ? first.url : '',
      caption: first ? (first.caption || '') : '',
      size: first ? (first.size || 'medium') : (block.size || 'medium'),
      align: first ? (first.align || 'center') : (block.align || 'center'),
      ...extra
    })
  }

  const handleUpdatePhotoItem = (photoIndex, field, value) => {
    const newPhotos = [...photos]
    if (!newPhotos[photoIndex]) return
    newPhotos[photoIndex] = { ...newPhotos[photoIndex], [field]: value }
    handleUpdateBlockPhotos(newPhotos)
  }

  const handleAddPhotoItem = (photoData = {}) => {
    const newId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const newPhotos = [
      ...photos,
      {
        id: newId,
        url: photoData.url || '',
        caption: photoData.caption || '',
        size: photoData.size || 'medium',
        align: photoData.align || 'center'
      }
    ]
    handleUpdateBlockPhotos(newPhotos)
  }

  const handleMovePhotoItem = (photoIndex, direction) => {
    const target = photoIndex + direction
    if (target < 0 || target >= photos.length) return
    const newPhotos = [...photos]
    const temp = newPhotos[photoIndex]
    newPhotos[photoIndex] = newPhotos[target]
    newPhotos[target] = temp
    handleUpdateBlockPhotos(newPhotos)
  }

  const handleRemovePhotoItem = (photoIndex) => {
    const newPhotos = photos.filter((_, i) => i !== photoIndex)
    handleUpdateBlockPhotos(newPhotos)
  }

  const handleBatchAddPhotos = (results) => {
    if (!results || results.length === 0) return
    const newItems = results.map((r, i) => ({
      id: `img-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      url: r.url,
      caption: '',
      size: 'medium',
      align: 'center'
    }))
    handleUpdateBlockPhotos([...photos, ...newItems])
  }

  return (
    <div className="space-y-4">
      {/* Top Bar for Photo Block */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">
            📷 {photos.length === 0 ? 'No Photos Added Yet' : `${photos.length} Photo${photos.length === 1 ? '' : 's'} in this Block`}
          </span>
          {photos.length > 1 && (
            <span className="text-[11px] text-studio-gold">
              (Set size & position per photo, or reorder with arrows)
            </span>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex items-center gap-1.5 bg-[#13111c] border border-white/10 rounded-lg p-1 text-[11px]">
            <span className="text-slate-400 px-1.5">Layout:</span>
            {[
              { id: 'row', label: 'Side-by-Side (Row)' },
              { id: 'stacked', label: 'Stacked (Column)' },
              { id: 'grid', label: 'Grid' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateField('layout', opt.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  (block.layout || 'row') === opt.id
                    ? 'bg-studio-magenta text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Render list of photos */}
      {photos.map((photo, pIdx) => (
        <div
          key={photo.id || pIdx}
          className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3 relative group"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-studio-gold">
                Photo #{pIdx + 1}
              </span>
              {photo.url && (
                <span className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {photo.url}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pIdx === 0}
                onClick={() => handleMovePhotoItem(pIdx, -1)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title={block.layout === 'stacked' ? 'Move Up' : 'Move Left / Earlier'}
              >
                {block.layout === 'stacked' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                disabled={pIdx === photos.length - 1}
                onClick={() => handleMovePhotoItem(pIdx, 1)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title={block.layout === 'stacked' ? 'Move Down' : 'Move Right / Later'}
              >
                {block.layout === 'stacked' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleRemovePhotoItem(pIdx)}
                className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 ml-1"
                title="Delete this photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Upload or Drop Image
              </label>
              <PhotoDropZone
                currentUrl={photo.url || ''}
                onUploadComplete={url => handleUpdatePhotoItem(pIdx, 'url', url)}
              />
            </div>

            <div className="sm:col-span-7 space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Or Paste External Image URL
                </label>
                <input
                  type="text"
                  value={photo.url || ''}
                  onChange={e => handleUpdatePhotoItem(pIdx, 'url', e.target.value)}
                  placeholder="https://... or /images/..."
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={photo.caption || ''}
                  onChange={e => handleUpdatePhotoItem(pIdx, 'caption', e.target.value)}
                  placeholder="Photo caption or description..."
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Size</label>
                  <select
                    value={photo.size || 'medium'}
                    onChange={e => handleUpdatePhotoItem(pIdx, 'size', e.target.value)}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    {photos.length === 1 && <option value="full">Full Width</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Position / Align</label>
                  <select
                    value={photo.align || 'center'}
                    onChange={e => handleUpdatePhotoItem(pIdx, 'align', e.target.value)}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Drop zone for adding more / batch */}
      <div className="p-3 rounded-xl border border-dashed border-white/15 bg-white/[0.01] space-y-2">
        <span className="text-[11px] font-medium text-slate-300 block">
          ➕ Add Another Photo (Drop file or click Browse to append)
        </span>
        <PhotoDropZone
          label="Drop an image here to add to this block"
          onUploadComplete={url => handleAddPhotoItem({ url })}
          onBatchUploadComplete={handleBatchAddPhotos}
        />
      </div>

      {/* Video in Photo Block */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-studio-gold uppercase tracking-wider">
            Optional Video in Photo Block
          </span>
          {block.videoUrl && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Position:</span>
              <button
                type="button"
                onClick={() => onUpdateField('videoPosition', 'above')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  (block.videoPosition || 'below') === 'above'
                    ? 'bg-studio-magenta text-white'
                    : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                Above Photos
              </button>
              <button
                type="button"
                onClick={() => onUpdateField('videoPosition', 'below')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  (block.videoPosition || 'below') === 'below'
                    ? 'bg-studio-magenta text-white'
                    : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                Below Photos
              </button>
            </div>
          )}
        </div>
        <AdminMediaField
          label="Video URL (YouTube, Vimeo, Google Drive, MP4, etc.)"
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
