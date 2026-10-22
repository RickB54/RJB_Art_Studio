import React, { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Layers, Type, Image as ImageIcon, LayoutGrid, Info, ExternalLink } from 'lucide-react'
import PhotoDropZone from './PhotoDropZone'

export default function AdminBlockEditor({ blocks = [], onChange }) {
  const [selectedType, setSelectedType] = useState('text')

  const updateBlocks = (newBlocks) => {
    onChange(newBlocks)
  }

  const handleAddBlock = (type) => {
    const id = `block-${Date.now()}`
    let newBlock = { id, type, visible: true }

    if (type === 'text') {
      newBlock = { ...newBlock, heading: 'Section Title', subtitle: 'Section Subtitle', text: 'Enter your custom paragraph text here.' }
    } else if (type === 'image-text') {
      newBlock = { ...newBlock, heading: 'Image Section', subtitle: 'Visual Story', text: 'Enter your description here.', image: '', imageAlt: '', imagePosition: 'left', linkUrl: '', linkText: '' }
    } else if (type === 'cards') {
      newBlock = {
        ...newBlock,
        heading: 'Feature Highlights',
        subtitle: 'Highlights',
        cards: [
          { title: 'Feature 1', subtitle: 'Label', text: 'Feature description text.', badge: '', linkUrl: '', linkText: '', visible: true },
          { title: 'Feature 2', subtitle: 'Label', text: 'Feature description text.', badge: '', linkUrl: '', linkText: '', visible: true }
        ]
      }
    } else if (type === 'notice') {
      newBlock = { ...newBlock, title: 'Important Announcement', text: 'Notice details or update message.', linkText: '', linkUrl: '' }
    } else if (type === 'button') {
      newBlock = { ...newBlock, text: 'Explore Now', url: '/gallery', subtitle: '', align: 'center' }
    }

    updateBlocks([...blocks, newBlock])
  }

  const handleMove = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= blocks.length) return
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    updateBlocks(updated)
  }

  const handleRemove = (index) => {
    if (window.confirm('Delete this custom block?')) {
      const updated = blocks.filter((_, i) => i !== index)
      updateBlocks(updated)
    }
  }

  const handleToggleVisible = (index) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], visible: updated[index].visible === false ? true : false }
    updateBlocks(updated)
  }

  const handleUpdateField = (index, field, value) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], [field]: value }
    updateBlocks(updated)
  }

  const handleUpdateCard = (blockIndex, cardIndex, field, value) => {
    const updated = [...blocks]
    const cardList = [...(updated[blockIndex].cards || [])]
    cardList[cardIndex] = { ...cardList[cardIndex], [field]: value }
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    updateBlocks(updated)
  }

  const handleAddCardToBlock = (blockIndex) => {
    const updated = [...blocks]
    const cardList = [...(updated[blockIndex].cards || [])]
    cardList.push({
      title: 'New Card',
      subtitle: 'Card Subtitle',
      text: 'Description for this card.',
      badge: '',
      linkUrl: '',
      linkText: '',
      visible: true
    })
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    updateBlocks(updated)
  }

  const handleRemoveCardFromBlock = (blockIndex, cardIndex) => {
    const updated = [...blocks]
    const cardList = (updated[blockIndex].cards || []).filter((_, i) => i !== cardIndex)
    updated[blockIndex] = { ...updated[blockIndex], cards: cardList }
    updateBlocks(updated)
  }

  return (
    <div className="space-y-4 pt-6 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-studio-gold" />
            <span>Extra Page Blocks</span>
          </h4>
          <p className="text-xs text-slate-400">
            Add custom sections (text, cards, image + text, notice, or buttons) anywhere on this page without code.
          </p>
        </div>

        {/* Add Block Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-[#13111c] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="text">📄 Text Section</option>
            <option value="image-text">🖼 Image + Text</option>
            <option value="cards">🗂 Cards Row</option>
            <option value="notice">🔔 Notice Box</option>
            <option value="button">🔘 Button Link</option>
          </select>
          <button
            type="button"
            onClick={() => handleAddBlock(selectedType)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-400">
          No extra blocks added yet on this page. Use the button above to add custom sections.
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, idx) => {
            const isHidden = block.visible === false
            return (
              <div
                key={block.id || idx}
                className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                  isHidden ? 'bg-black/30 border-white/5 opacity-60' : 'bg-white/5 border-white/10'
                }`}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-studio-gold uppercase tracking-wider">
                      Block #{idx + 1}:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white uppercase">
                      {block.type}
                    </span>
                    {isHidden && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300">
                        Hidden on site
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
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

                {/* TYPE 1: Text Section */}
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
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Paragraph Text (Line breaks kept)</label>
                      <textarea
                        rows={3}
                        value={block.text || ''}
                        onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* TYPE 2: Image + Text */}
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

                {/* TYPE 3: Cards Row */}
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
                        <span className="text-xs font-semibold text-slate-300">Cards in this row:</span>
                        <button
                          type="button"
                          onClick={() => handleAddCardToBlock(idx)}
                          className="text-[11px] font-semibold text-studio-magenta hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Card</span>
                        </button>
                      </div>

                      {(block.cards || []).map((card, cIdx) => (
                        <div key={cIdx} className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-studio-gold">Card #{cIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCardFromBlock(idx, cIdx)}
                              className="text-slate-400 hover:text-red-400 p-0.5"
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
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={card.subtitle || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'subtitle', e.target.value)}
                              placeholder="Subtitle / Label"
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={card.text || ''}
                            onChange={e => handleUpdateCard(idx, cIdx, 'text', e.target.value)}
                            placeholder="Card text..."
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={card.badge || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'badge', e.target.value)}
                              placeholder="Badge (Optional)"
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={card.linkUrl || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'linkUrl', e.target.value)}
                              placeholder="Link URL (Optional)"
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={card.linkText || ''}
                              onChange={e => handleUpdateCard(idx, cIdx, 'linkText', e.target.value)}
                              placeholder="Link Text"
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TYPE 4: Notice Box */}
                {block.type === 'notice' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Notice Title</label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={e => handleUpdateField(idx, 'title', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Link Target URL (Optional)</label>
                        <input
                          type="text"
                          value={block.linkUrl || ''}
                          onChange={e => handleUpdateField(idx, 'linkUrl', e.target.value)}
                          placeholder="/contact or https://..."
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Notice Text</label>
                      <textarea
                        rows={2}
                        value={block.text || ''}
                        onChange={e => handleUpdateField(idx, 'text', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Link Text (Optional)</label>
                      <input
                        type="text"
                        value={block.linkText || ''}
                        onChange={e => handleUpdateField(idx, 'linkText', e.target.value)}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* TYPE 5: Button Link */}
                {block.type === 'button' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Button Text</label>
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
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Alignment</label>
                        <select
                          value={block.align || 'center'}
                          onChange={e => handleUpdateField(idx, 'align', e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtext / Note (Optional)</label>
                      <input
                        type="text"
                        value={block.subtitle || ''}
                        onChange={e => handleUpdateField(idx, 'subtitle', e.target.value)}
                        placeholder="e.g. Opens in new tab"
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
