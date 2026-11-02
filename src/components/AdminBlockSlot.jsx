import React, { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, EyeOff, Layers, X, ExternalLink, Sparkles, Youtube } from 'lucide-react'
import PhotoDropZone from './PhotoDropZone'
import AdminMediaField from './AdminMediaField'
import { cleanVideoUrl } from './PageBlocks'

const BLOCK_TYPES = [
  { type: 'text', label: '📄 Text Section' },
  { type: 'photo', label: '📷 Photo(s)' },
  { type: 'image-text', label: '🖼 Image + Text' },
  { type: 'cards', label: '🗂 Cards Row' },
  { type: 'notice', label: '🔔 Notice Box' },
  { type: 'button', label: '🔘 Button Link' },
  { type: 'embed', label: '📋 Embed (Google Forms / URL)' },
  { type: 'video', label: '🎬 Video (YouTube)' },
  { type: 'divider', label: '➖ Divider' }
]

export default function AdminBlockSlot({
  slotId,
  label = '',
  blocks = [],
  onUpdate,
  onMoveToPrevSlot,
  onMoveToNextSlot
}) {
  const [showPicker, setShowPicker] = useState(false)

  const handleAdd = (type) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    let newBlock = { id, type, visible: true }

    if (type === 'text') {
      newBlock = { ...newBlock, heading: '', subtitle: '', text: 'Enter your custom paragraph text here.' }
    } else if (type === 'photo') {
      newBlock = { ...newBlock, images: [], image: '', caption: '', size: 'medium', align: 'center', layout: 'row' }
    } else if (type === 'image-text') {
      newBlock = { ...newBlock, heading: 'Section Title', subtitle: '', text: 'Enter description here.', images: [], image: '', imageAlt: '', imagePosition: 'left', linkUrl: '', linkText: '' }
    } else if (type === 'cards') {
      newBlock = {
        ...newBlock,
        heading: '',
        subtitle: '',
        cards: [
          { title: 'Feature 1', subtitle: '', text: 'Description text.', badge: '', linkUrl: '', linkText: '', visible: true },
          { title: 'Feature 2', subtitle: '', text: 'Description text.', badge: '', linkUrl: '', linkText: '', visible: true }
        ]
      }
    } else if (type === 'notice') {
      newBlock = { ...newBlock, title: 'Notice', text: 'Important notice or update message.', linkText: '', linkUrl: '' }
    } else if (type === 'button') {
      newBlock = { ...newBlock, text: 'Learn More', url: '/gallery', subtitle: '', align: 'center' }
    } else if (type === 'embed') {
      newBlock = { ...newBlock, heading: '', subtitle: '', text: '', url: '', height: 850 }
    } else if (type === 'video') {
      newBlock = { ...newBlock, heading: '', subtitle: '', text: '', url: '' }
    } else if (type === 'divider') {
      newBlock = { ...newBlock, style: 'standard' }
    }

    onUpdate([...blocks, newBlock])
    setShowPicker(false)
  }

  const handleMove = (index, direction) => {
    const target = index + direction
    if (target < 0) {
      if (onMoveToPrevSlot) onMoveToPrevSlot(index)
      return
    }
    if (target >= blocks.length) {
      if (onMoveToNextSlot) onMoveToNextSlot(index)
      return
    }
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    onUpdate(updated)
  }

  const handleRemove = (index) => {
    if (window.confirm('Delete this custom block?')) {
      onUpdate(blocks.filter((_, i) => i !== index))
    }
  }

  const handleToggleVisible = (index) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], visible: updated[index].visible === false ? true : false }
    onUpdate(updated)
  }

  const handleUpdateField = (index, field, value) => {
    const updated = [...blocks]
    const finalVal = field === 'videoUrl' ? cleanVideoUrl(value) : value
    updated[index] = { ...updated[index], [field]: finalVal }
    onUpdate(updated)
  }

  const handleUpdateCard = (blockIndex, cardIndex, field, value) => {
    const updated = [...blocks]
    const cardList = [...(updated[blockIndex].cards || [])]
    const finalVal = field === 'videoUrl' ? cleanVideoUrl(value) : value
    cardList[cardIndex] = { ...cardList[cardIndex], [field]: finalVal }
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    onUpdate(updated)
  }

  const handleAddCard = (blockIndex) => {
    const updated = [...blocks]
    const cardList = [...(updated[blockIndex].cards || [])]
    cardList.push({
      title: 'New Card',
      subtitle: '',
      text: 'Description for this card.',
      badge: '',
      linkUrl: '',
      linkText: '',
      visible: true
    })
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    onUpdate(updated)
  }

  const handleRemoveCard = (blockIndex, cardIndex) => {
    const updated = [...blocks]
    const cardList = (updated[blockIndex].cards || []).filter((_, i) => i !== cardIndex)
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    onUpdate(updated)
  }

  // --- Photo Block Helpers ---
  const getBlockPhotos = (b) => {
    if (Array.isArray(b.images) && b.images.length > 0) {
      return b.images
    }
    if (b.image) {
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

  const handleUpdateBlockPhotos = (blockIndex, newPhotos, extra = {}) => {
    const updated = [...blocks]
    const first = newPhotos[0]
    updated[blockIndex] = {
      ...updated[blockIndex],
      images: newPhotos,
      image: first ? first.url : '',
      caption: first ? (first.caption || '') : '',
      size: first ? (first.size || 'medium') : (updated[blockIndex].size || 'medium'),
      align: first ? (first.align || 'center') : (updated[blockIndex].align || 'center'),
      ...extra
    }
    onUpdate(updated)
  }

  const handleUpdatePhotoItem = (blockIndex, photoIndex, field, value) => {
    const current = getBlockPhotos(blocks[blockIndex])
    const newPhotos = [...current]
    if (!newPhotos[photoIndex]) return
    newPhotos[photoIndex] = { ...newPhotos[photoIndex], [field]: value }
    handleUpdateBlockPhotos(blockIndex, newPhotos)
  }

  const handleAddPhotoItem = (blockIndex, photoData = {}) => {
    const current = getBlockPhotos(blocks[blockIndex])
    const newId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const newPhotos = [
      ...current,
      {
        id: newId,
        url: photoData.url || '',
        caption: photoData.caption || '',
        size: photoData.size || 'medium',
        align: photoData.align || 'center'
      }
    ]
    handleUpdateBlockPhotos(blockIndex, newPhotos)
  }

  const handleMovePhotoItem = (blockIndex, photoIndex, direction) => {
    const current = getBlockPhotos(blocks[blockIndex])
    const target = photoIndex + direction
    if (target < 0 || target >= current.length) return
    const newPhotos = [...current]
    const temp = newPhotos[photoIndex]
    newPhotos[photoIndex] = newPhotos[target]
    newPhotos[target] = temp
    handleUpdateBlockPhotos(blockIndex, newPhotos)
  }

  const handleRemovePhotoItem = (blockIndex, photoIndex) => {
    const current = getBlockPhotos(blocks[blockIndex])
    const newPhotos = current.filter((_, i) => i !== photoIndex)
    handleUpdateBlockPhotos(blockIndex, newPhotos)
  }

  const handleBatchAddPhotos = (blockIndex, results) => {
    if (!results || results.length === 0) return
    const current = getBlockPhotos(blocks[blockIndex])
    const newItems = results.map((r, i) => ({
      id: `img-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      url: r.url,
      caption: '',
      size: 'medium',
      align: 'center'
    }))
    handleUpdateBlockPhotos(blockIndex, [...current, ...newItems])
  }

  // --- Image + Text Block Photo Helpers ---
  const getImageTextPhotos = (b) => {
    if (Array.isArray(b.images) && b.images.length > 0) {
      return b.images
    }
    if (b.image) {
      return [{
        id: b.id ? `${b.id}-it-1` : 'it-1',
        url: b.image,
        alt: b.imageAlt || '',
        caption: ''
      }]
    }
    return []
  }

  const handleUpdateImageTextPhotos = (blockIndex, newPhotos) => {
    const updated = [...blocks]
    const first = newPhotos[0]
    updated[blockIndex] = {
      ...updated[blockIndex],
      images: newPhotos,
      image: first ? first.url : '',
      imageAlt: first ? (first.alt || '') : ''
    }
    onUpdate(updated)
  }

  const handleAddImageTextPhoto = (blockIndex, photoData = {}) => {
    const current = getImageTextPhotos(blocks[blockIndex])
    const newId = `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const next = [...current, { id: newId, url: photoData.url || '', alt: photoData.alt || '', caption: photoData.caption || '' }]
    handleUpdateImageTextPhotos(blockIndex, next)
  }

  const handleUpdateImageTextPhotoItem = (blockIndex, photoIndex, field, val) => {
    const current = getImageTextPhotos(blocks[blockIndex])
    const next = [...current]
    if (!next[photoIndex]) return
    next[photoIndex] = { ...next[photoIndex], [field]: val }
    handleUpdateImageTextPhotos(blockIndex, next)
  }

  const handleMoveImageTextPhoto = (blockIndex, photoIndex, dir) => {
    const current = getImageTextPhotos(blocks[blockIndex])
    const target = photoIndex + dir
    if (target < 0 || target >= current.length) return
    const next = [...current]
    const temp = next[photoIndex]
    next[photoIndex] = next[target]
    next[target] = temp
    handleUpdateImageTextPhotos(blockIndex, next)
  }

  const handleRemoveImageTextPhoto = (blockIndex, photoIndex) => {
    const current = getImageTextPhotos(blocks[blockIndex])
    const next = current.filter((_, i) => i !== photoIndex)
    handleUpdateImageTextPhotos(blockIndex, next)
  }

  return (
    <div className="py-2 space-y-3">
      {blocks.length > 0 && (
        <div className="space-y-4">
          {blocks.map((block, idx) => {
            const isHidden = block.visible === false
            return (
              <div
                key={block.id || idx}
                className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                  isHidden ? 'bg-black/30 border-white/5 opacity-60' : 'bg-white/5 border-studio-magenta/20 shadow-sm'
                }`}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-studio-gold uppercase tracking-wider">
                      {label ? `${label} • ` : ''}Block #{idx + 1}:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white uppercase">
                      {block.type}
                    </span>
                    {isHidden && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 && !onMoveToPrevSlot}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                      title={idx === 0 && onMoveToPrevSlot ? "Move to previous section slot" : "Move Up"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1 && !onMoveToNextSlot}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                      title={idx === blocks.length - 1 && onMoveToNextSlot ? "Move to next section slot" : "Move Down"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(idx)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title={isHidden ? 'Show on page' : 'Hide from page'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1. Text Section */}
                {block.type === 'text' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={e => handleUpdateField(idx, 'heading', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle / Badge</label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Paragraph Text</label>
                      <textarea
                        rows={3}
                        value={block.text || ''}
                        onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <AdminMediaField
                        label="Video URL in Text Section (Optional)"
                        url={block.videoUrl || ''}
                        poster={block.videoPoster || ''}
                        aspectRatio={block.aspectRatio || '16:9'}
                        fallbackLinkText={block.fallbackLinkText || ''}
                        hideFallbackLink={block.hideFallbackLink || false}
                        onUrlChange={val => handleUpdateField(idx, 'videoUrl', cleanVideoUrl(val))}
                        onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                        onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                        onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                        onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Photo Block */}
                {block.type === 'photo' && (() => {
                  const photos = getBlockPhotos(block)
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

                        {/* Layout selector when multiple photos */}
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
                                onClick={() => handleUpdateField(idx, 'layout', opt.id)}
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
                          {/* Photo Header */}
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
                              {/* Move Left / Earlier */}
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => handleMovePhotoItem(idx, pIdx, -1)}
                                title="Move Left / Earlier"
                                className={`p-1 rounded text-slate-400 hover:text-white transition flex items-center gap-0.5 ${pIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span className="text-[10px] hidden sm:inline">Left</span>
                              </button>

                              {/* Move Right / Later */}
                              <button
                                type="button"
                                disabled={pIdx === photos.length - 1}
                                onClick={() => handleMovePhotoItem(idx, pIdx, 1)}
                                title="Move Right / Later"
                                className={`p-1 rounded text-slate-400 hover:text-white transition flex items-center gap-0.5 ${pIdx === photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                              >
                                <span className="text-[10px] hidden sm:inline">Right</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove Photo */}
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoItem(idx, pIdx)}
                                title="Remove this photo from block"
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Photo DropZone / Preview */}
                          <PhotoDropZone
                            value={photo.url || ''}
                            onChange={url => handleUpdatePhotoItem(idx, pIdx, 'url', url)}
                            label="Upload or Drop Photo"
                          />

                          {/* Caption & Size Controls */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-medium text-slate-300 mb-1">Caption (Optional)</label>
                              <input
                                type="text"
                                value={photo.caption || ''}
                                onChange={e => handleUpdatePhotoItem(idx, pIdx, 'caption', e.target.value)}
                                placeholder="e.g. Rick in the Methuen studio"
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-300 mb-1">Size</label>
                              <select
                                value={photo.size || 'medium'}
                                onChange={e => handleUpdatePhotoItem(idx, pIdx, 'size', e.target.value)}
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                              >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                              </select>
                            </div>
                          </div>

                          {/* Alignment Controls */}
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Position / Alignment within block
                            </label>
                            <div className="flex items-center gap-4 text-xs text-slate-300">
                              {['left', 'center', 'right'].map(align => (
                                <label key={align} className="flex items-center gap-1.5 cursor-pointer capitalize">
                                  <input
                                    type="radio"
                                    name={`photo-align-${block.id || idx}-${photo.id || pIdx}`}
                                    value={align}
                                    checked={(photo.align || 'center') === align}
                                    onChange={() => handleUpdatePhotoItem(idx, pIdx, 'align', align)}
                                    className="accent-studio-magenta"
                                  />
                                  <span>{align}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Photo Button & Drop Zone */}
                      <div className="pt-1">
                        {photos.length === 0 ? (
                          <PhotoDropZone
                            value=""
                            allowMultiple={true}
                            onChange={url => { if (url) handleAddPhotoItem(idx, { url }) }}
                            onMultipleUpload={results => handleBatchAddPhotos(idx, results)}
                            label="Upload or Drop Photo(s)"
                          />
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10">
                            <button
                              type="button"
                              onClick={() => handleAddPhotoItem(idx, {})}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-studio-magenta/20 hover:bg-studio-magenta text-studio-magenta hover:text-white border border-studio-magenta/30 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Another Photo to this Block</span>
                            </button>
                            <span className="text-[11px] text-slate-400">
                              Each photo can be moved to left, right, or center, resized, and reordered.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Video URL in Photo Block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-semibold text-slate-200">Video in this Block:</span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-300">
                            <span className="text-slate-400">Position:</span>
                            <select
                              value={block.videoPosition || 'below'}
                              onChange={e => handleUpdateField(idx, 'videoPosition', e.target.value)}
                              className="bg-[#13111c] border border-white/15 rounded px-2 py-0.5 text-xs text-white"
                            >
                              <option value="below">Below Photos</option>
                              <option value="above">Above Photos</option>
                            </select>
                          </div>
                        </div>
                        <AdminMediaField
                          label="Block Video URL (YouTube, Drive, Vimeo, MP4)"
                          url={block.videoUrl || ''}
                          poster={block.videoPoster || ''}
                          aspectRatio={block.aspectRatio || '16:9'}
                          fallbackLinkText={block.fallbackLinkText || ''}
                          hideFallbackLink={block.hideFallbackLink || false}
                          onUrlChange={val => handleUpdateField(idx, 'videoUrl', cleanVideoUrl(val))}
                          onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                          onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                          onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                          onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Image + Text */}
                {block.type === 'image-text' && (() => {
                  const itPhotos = getImageTextPhotos(block)
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading</label>
                          <input
                            type="text"
                            value={block.heading || ''}
                            onChange={e => handleUpdateField(idx, 'heading', e.target.value)}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Photo vs Video Switch */}
                      <div className="flex items-center gap-2 p-1 bg-[#13111c] border border-white/10 rounded-xl w-fit">
                        <button
                          type="button"
                          onClick={() => handleUpdateField(idx, 'mediaType', 'photo')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            (block.mediaType || 'photo') === 'photo'
                              ? 'bg-studio-magenta text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          📷 Photo(s) next to text
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateField(idx, 'mediaType', 'video')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            block.mediaType === 'video'
                              ? 'bg-studio-magenta text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🎬 Video next to text
                        </button>
                      </div>

                      {/* Media next to text */}
                      {block.mediaType === 'video' ? (
                        <AdminMediaField
                          label="Section Video (displayed next to text)"
                          url={block.videoUrl || ''}
                          poster={block.videoPoster || ''}
                          aspectRatio={block.aspectRatio || '16:9'}
                          fallbackLinkText={block.fallbackLinkText || ''}
                          hideFallbackLink={block.hideFallbackLink || false}
                          onUrlChange={val => handleUpdateField(idx, 'videoUrl', cleanVideoUrl(val))}
                          onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                          onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                          onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                          onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                        />
                      ) : (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-medium text-slate-300">
                              Section Photo{itPhotos.length > 1 ? 's' : ''} ({itPhotos.length})
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddImageTextPhoto(idx, {})}
                              className="text-[11px] text-studio-magenta hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Photo</span>
                            </button>
                          </div>

                          {itPhotos.map((img, iIdx) => (
                            <div key={img.id || iIdx} className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-studio-gold">
                                  Photo #{iIdx + 1}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={iIdx === 0}
                                    onClick={() => handleMoveImageTextPhoto(idx, iIdx, -1)}
                                    className={`p-1 rounded text-slate-400 hover:text-white transition ${iIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={iIdx === itPhotos.length - 1}
                                    onClick={() => handleMoveImageTextPhoto(idx, iIdx, 1)}
                                    className={`p-1 rounded text-slate-400 hover:text-white transition ${iIdx === itPhotos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImageTextPhoto(idx, iIdx)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition ml-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <PhotoDropZone
                                value={img.url || ''}
                                onChange={url => handleUpdateImageTextPhotoItem(idx, iIdx, 'url', url)}
                                label="Upload or Drop Photo"
                              />
                              <input
                                type="text"
                                value={img.caption || img.alt || ''}
                                onChange={e => {
                                  handleUpdateImageTextPhotoItem(idx, iIdx, 'caption', e.target.value)
                                  handleUpdateImageTextPhotoItem(idx, iIdx, 'alt', e.target.value)
                                }}
                                placeholder="Photo caption / alt description (Optional)"
                                className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                              />
                            </div>
                          ))}

                          {itPhotos.length === 0 && (
                            <PhotoDropZone
                              value=""
                              onChange={url => { if (url) handleAddImageTextPhoto(idx, { url }) }}
                              label="Upload or Drop Section Photo"
                            />
                          )}

                          <div className="pt-2">
                            <AdminMediaField
                              label="Additional Video (Optional - alongside pics & text)"
                              url={block.videoUrl || ''}
                              poster={block.videoPoster || ''}
                              aspectRatio={block.aspectRatio || '16:9'}
                              fallbackLinkText={block.fallbackLinkText || ''}
                              hideFallbackLink={block.hideFallbackLink || false}
                              onUrlChange={val => handleUpdateField(idx, 'videoUrl', cleanVideoUrl(val))}
                              onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                              onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                              onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                              onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Description Text</label>
                        <textarea
                          rows={3}
                          value={block.text || ''}
                          onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Media Position</label>
                          <select
                            value={block.imagePosition || 'left'}
                            onChange={e => handleUpdateField(idx, 'imagePosition', e.target.value)}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Link URL (Optional)</label>
                          <input
                            type="text"
                            value={block.linkUrl || ''}
                            onChange={e => handleUpdateField(idx, 'linkUrl', e.target.value)}
                            placeholder="/gallery or https://..."
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Link Text (Optional)</label>
                          <input
                            type="text"
                            value={block.linkText || ''}
                            onChange={e => handleUpdateField(idx, 'linkText', e.target.value)}
                            placeholder="Explore →"
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Cards Row */}
                {block.type === 'cards' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Row Heading</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={e => handleUpdateField(idx, 'heading', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Row Subtitle</label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Cards:</span>
                        <button
                          type="button"
                          onClick={() => handleAddCard(idx)}
                          className="px-2.5 py-1 rounded bg-studio-magenta/20 text-studio-magenta hover:bg-studio-magenta hover:text-white text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Card</span>
                        </button>
                      </div>

                      {(block.cards || []).map((card, cIdx) => (
                        <div key={card.id || cIdx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-studio-gold">Card #{cIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCard(idx, cIdx)}
                              className="text-slate-400 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={card.title || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'title', e.target.value)}
                              placeholder="Card Title"
                              className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={card.subtitle || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'subtitle', e.target.value)}
                              placeholder="Subtitle / Label"
                              className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={card.text || ''}
                            onChange={e => handleUpdateCard(idx, cIdx, 'text', e.target.value)}
                            placeholder="Description text"
                            className="w-full bg-[#13111c] border border-white/10 rounded p-2 text-xs text-white"
                          />
                          <div>
                            <AdminMediaField
                              label="Card Video (Optional - YouTube, Drive, Vimeo, MP4)"
                              url={card.videoUrl || ''}
                              poster={card.videoPoster || ''}
                              aspectRatio={card.aspectRatio || '16:9'}
                              fallbackLinkText={card.fallbackLinkText || ''}
                              hideFallbackLink={card.hideFallbackLink || false}
                              onUrlChange={val => handleUpdateCard(idx, cIdx, 'videoUrl', cleanVideoUrl(val))}
                              onPosterChange={val => handleUpdateCard(idx, cIdx, 'videoPoster', val)}
                              onAspectRatioChange={val => handleUpdateCard(idx, cIdx, 'aspectRatio', val)}
                              onFallbackLinkTextChange={val => handleUpdateCard(idx, cIdx, 'fallbackLinkText', val)}
                              onHideFallbackLinkChange={val => handleUpdateCard(idx, cIdx, 'hideFallbackLink', val)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Notice Box */}
                {block.type === 'notice' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Notice Title / Label</label>
                      <input
                        type="text"
                        value={block.title || ''}
                        onChange={e => handleUpdateField(idx, 'title', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Message Text</label>
                      <textarea
                        rows={2}
                        value={block.text || ''}
                        onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Link URL (Optional)</label>
                        <input
                          type="text"
                          value={block.linkUrl || ''}
                          onChange={e => handleUpdateField(idx, 'linkUrl', e.target.value)}
                          placeholder="/contact or https://..."
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Link Text</label>
                        <input
                          type="text"
                          value={block.linkText || ''}
                          onChange={e => handleUpdateField(idx, 'linkText', e.target.value)}
                          placeholder="Contact me →"
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <AdminMediaField
                      label="Notice Video (Optional - YouTube, Drive, Vimeo, MP4)"
                      url={block.videoUrl || ''}
                      poster={block.videoPoster || ''}
                      aspectRatio={block.aspectRatio || '16:9'}
                      fallbackLinkText={block.fallbackLinkText || ''}
                      hideFallbackLink={block.hideFallbackLink || false}
                      onUrlChange={val => handleUpdateField(idx, 'videoUrl', cleanVideoUrl(val))}
                      onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                      onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                      onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                      onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                    />
                  </div>
                )}

                {/* 6. Button Link */}
                {block.type === 'button' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Button Label</label>
                        <input
                          type="text"
                          value={block.text || ''}
                          onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Target URL</label>
                        <input
                          type="text"
                          value={block.url || ''}
                          onChange={e => handleUpdateField(idx, 'url', e.target.value)}
                          placeholder="/gallery or https://..."
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle / Note (Optional)</label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Alignment</label>
                        <select
                          value={block.align || 'center'}
                          onChange={e => handleUpdateField(idx, 'align', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="center">Center</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Embed Block */}
                {block.type === 'embed' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={e => handleUpdateField(idx, 'heading', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <AdminMediaField
                      label="Embed / Video / Form URL"
                      url={block.url || ''}
                      poster={block.videoPoster || ''}
                      aspectRatio={block.aspectRatio || (block.height ? 'custom' : '16:9')}
                      customHeight={block.height || 850}
                      fallbackLinkText={block.fallbackLinkText || ''}
                      hideFallbackLink={block.hideFallbackLink || false}
                      onUrlChange={val => {
                        const match = (val || '').match(/src=["']([^"']+)["']/i)
                        handleUpdateField(idx, 'url', cleanVideoUrl(match ? match[1] : (val || '').trim()))
                      }}
                      onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                      onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                      onCustomHeightChange={val => handleUpdateField(idx, 'height', val)}
                      onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                      onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                    />
                  </div>
                )}

                {/* 8. Video Block */}
                {block.type === 'video' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={e => handleUpdateField(idx, 'heading', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <AdminMediaField
                      label="Video URL"
                      url={block.url || ''}
                      poster={block.videoPoster || ''}
                      aspectRatio={block.aspectRatio || '16:9'}
                      fallbackLinkText={block.fallbackLinkText || ''}
                      hideFallbackLink={block.hideFallbackLink || false}
                      onUrlChange={val => handleUpdateField(idx, 'url', cleanVideoUrl(val))}
                      onPosterChange={val => handleUpdateField(idx, 'videoPoster', val)}
                      onAspectRatioChange={val => handleUpdateField(idx, 'aspectRatio', val)}
                      onFallbackLinkTextChange={val => handleUpdateField(idx, 'fallbackLinkText', val)}
                      onHideFallbackLinkChange={val => handleUpdateField(idx, 'hideFallbackLink', val)}
                    />
                  </div>
                )}

                {/* 9. Divider Block */}
                {block.type === 'divider' && (
                  <div className="py-2 text-center text-xs text-slate-400 border border-white/5 rounded-xl bg-black/20">
                    <span className="text-studio-gold">◆</span> Clean separator line with studio accent
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* Add Block Button / Picker */}
      {!showPicker ? (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-studio-magenta/70 hover:bg-studio-magenta/5 text-slate-400 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 group"
        >
          <Plus className="w-3.5 h-3.5 text-studio-magenta group-hover:scale-110 transition-transform" />
          <span>+ Add block here {label ? `(${label})` : ''}</span>
        </button>
      ) : (
        <div className="p-3 rounded-2xl bg-studio-surface border border-studio-magenta/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-studio-gold uppercase tracking-wider">
              Choose Block Type to Add {label ? `(${label})` : ''}
            </span>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {BLOCK_TYPES.map(bt => (
              <button
                key={bt.type}
                type="button"
                onClick={() => handleAdd(bt.type)}
                className="p-2 rounded-xl bg-white/5 hover:bg-studio-magenta hover:text-white text-slate-300 text-xs font-medium text-left transition flex items-center gap-2 border border-white/5"
              >
                <span>{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
