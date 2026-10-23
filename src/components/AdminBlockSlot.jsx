import React, { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Layers, X, ExternalLink, Sparkles } from 'lucide-react'
import PhotoDropZone from './PhotoDropZone'

const BLOCK_TYPES = [
  { type: 'text', label: '📄 Text Section' },
  { type: 'photo', label: '📷 Photo' },
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
      newBlock = { ...newBlock, image: '', caption: '', size: 'medium', align: 'center' }
    } else if (type === 'image-text') {
      newBlock = { ...newBlock, heading: 'Section Title', subtitle: '', text: 'Enter description here.', image: '', imageAlt: '', imagePosition: 'left', linkUrl: '', linkText: '' }
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
    updated[index] = { ...updated[index], [field]: value }
    onUpdate(updated)
  }

  const handleUpdateCard = (blockIndex, cardIndex, field, value) => {
    const updated = [...blocks]
    const cardList = [...(updated[blockIndex].cards || [])]
    cardList[cardIndex] = { ...cardList[cardIndex], [field]: value }
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
                  </div>
                )}

                {/* 2. Photo Block */}
                {block.type === 'photo' && (
                  <div className="space-y-3">
                    <div>
                      <PhotoDropZone
                        value={block.image || ''}
                        onChange={url => handleUpdateField(idx, 'image', url)}
                        label="Upload or Drop Photo"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Caption (Optional)</label>
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={e => handleUpdateField(idx, 'caption', e.target.value)}
                          placeholder="e.g. Rick in the Methuen studio"
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Size</label>
                        <select
                          value={block.size || 'medium'}
                          onChange={e => handleUpdateField(idx, 'size', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Alignment</label>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        {['left', 'center', 'right'].map(align => (
                          <label key={align} className="flex items-center gap-1.5 cursor-pointer capitalize">
                            <input
                              type="radio"
                              name={`photo-align-${block.id || idx}`}
                              value={align}
                              checked={(block.align || 'center') === align}
                              onChange={() => handleUpdateField(idx, 'align', align)}
                              className="accent-studio-magenta"
                            />
                            <span>{align}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Image + Text */}
                {block.type === 'image-text' && (
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
                    <div>
                      <PhotoDropZone
                        value={block.image || ''}
                        onChange={url => handleUpdateField(idx, 'image', url)}
                        label="Section Image (Drop or Browse)"
                      />
                    </div>
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
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Image Position</label>
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
                )}

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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Embed URL (or &lt;iframe&gt; code)</label>
                        <input
                          type="text"
                          value={block.url || ''}
                          onChange={e => {
                            const val = e.target.value
                            const match = val.match(/src=["']([^"']+)["']/i)
                            handleUpdateField(idx, 'url', match ? match[1] : val.trim())
                          }}
                          placeholder="https://docs.google.com/forms/..."
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={block.height || 850}
                          onChange={e => handleUpdateField(idx, 'height', parseInt(e.target.value, 10) || 850)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
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
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">YouTube Video URL</label>
                      <input
                        type="url"
                        value={block.url || ''}
                        onChange={e => handleUpdateField(idx, 'url', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
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
