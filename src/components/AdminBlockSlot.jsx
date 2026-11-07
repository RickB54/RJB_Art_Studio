// src/components/AdminBlockSlot.jsx
import React, { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, X } from 'lucide-react'
import { cleanVideoUrl, getBlockLocalPhotos } from '../blocks/helpers'
import { BLOCK_REGISTRY, getBlockDefinition, createDefaultBlock } from '../blocks/registry'
import BlockStyleEditor from '../blocks/BlockStyleEditor'

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
    const newBlock = createDefaultBlock(type)
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
    const block = blocks[index]
    const localPhotos = getBlockLocalPhotos(block)
    const hasPhotos = localPhotos.length > 0
    const mediaTypes = ['gallery', 'photo', 'image-text']
    const isMediaBlock = block && mediaTypes.includes(block.type)

    let deleteConfirmed = false
    let trashPhotos = false

    if (isMediaBlock && hasPhotos) {
      deleteConfirmed = window.confirm(
        `Delete this ${block.type} block?\n\nIt contains ${localPhotos.length} local photo(s).\nClick OK to continue, then you'll be asked about the photos.`
      )
      if (deleteConfirmed) {
        trashPhotos = window.confirm(
          `Also move its ${localPhotos.length} photo(s) to Trash (removed-media/)?\n\nPhotos used elsewhere in the site will be kept automatically.\n\nClick OK to move photos to Trash, or Cancel to keep them.`
        )
      }
    } else {
      deleteConfirmed = window.confirm('Delete this custom block?')
    }

    if (!deleteConfirmed) return
    onUpdate(blocks.filter((_, i) => i !== index))

    if (trashPhotos && localPhotos.length > 0) {
      const trashItems = []
      localPhotos.forEach(url => {
        const parts = url.replace(/^\/images\//, '').split('/')
        if (parts.length >= 2) {
          const folder = parts[0]
          const file = parts[1]
          const thumb = file.replace(/\.webp$/, '-thumb.webp')
          trashItems.push({ folder, file, thumb })
        }
      })
      if (trashItems.length > 0) {
        fetch('/__api/media-trash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: trashItems })
        }).catch(() => {})
      }
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

  const handleUpdateBlock = (index, updatedBlock) => {
    const updated = [...blocks]
    updated[index] = updatedBlock
    onUpdate(updated)
  }

  return (
    <div className="space-y-3">
      {/* List of Blocks in this Slot */}
      {blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const isHidden = block.visible === false
            const def = getBlockDefinition(block.type)
            const EditorComp = def?.Editor

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
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white uppercase flex items-center gap-1">
                      <span>{def?.icon || '📦'}</span>
                      <span>{block.type}</span>
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

                {/* Render block-specific editor from registry */}
                {EditorComp ? (
                  <EditorComp
                    block={block}
                    onUpdateField={(field, value) => handleUpdateField(idx, field, value)}
                    onUpdateBlock={(updatedBlock) => handleUpdateBlock(idx, updatedBlock)}
                  />
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Unknown block type: {block.type}
                  </div>
                )}

                {/* Shared Layout & Spacing Settings */}
                <BlockStyleEditor
                  style={block.style || {}}
                  onChange={(newStyle) => handleUpdateField(idx, 'style', newStyle)}
                />
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
            {BLOCK_REGISTRY.map(bt => (
              <button
                key={bt.id}
                type="button"
                onClick={() => handleAdd(bt.id)}
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
