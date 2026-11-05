// src/components/PageLayoutOutline.jsx
import React, { useState } from 'react'
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trash2,
  Plus,
  X,
  Sparkles,
  Edit2
} from 'lucide-react'
import { BLOCK_REGISTRY, getBlockDefinition, createDefaultBlock } from '../blocks/registry'
import { getPageOutlineSchema } from '../blocks/pageSlots'
import BlockStyleEditor from '../blocks/BlockStyleEditor'
import { cleanVideoUrl } from '../blocks/helpers'

function getBlockSummary(block) {
  if (!block) return 'Empty block'
  switch (block.type) {
    case 'text':
      return block.heading || (block.content ? block.content.slice(0, 40) + '...' : 'Text block')
    case 'photo':
      return block.caption || (block.photos?.length ? `${block.photos.length} photos` : (block.url ? block.url.split('/').pop() : 'Photo'))
    case 'image_text':
      return block.title || (block.text ? block.text.slice(0, 40) + '...' : 'Image + Text')
    case 'cards':
      return block.title || (block.cards?.length ? `${block.cards.length} cards` : 'Cards grid')
    case 'notice':
      return block.title || (block.message ? block.message.slice(0, 40) + '...' : 'Notice')
    case 'button':
      return block.label ? `Button: "${block.label}"` : 'Action button'
    case 'embed':
      return block.title || 'Embed / Widget'
    case 'google_photos':
      return block.title || 'Google Photos Album'
    case 'video':
      return block.title || 'Video player'
    case 'divider':
      return 'Divider line'
    default:
      return block.title || block.heading || `${block.type || 'Custom'} block`
  }
}

export default function PageLayoutOutline({
  pageKey,
  pageData = {},
  onUpdatePage
}) {
  const [open, setOpen] = useState(true)
  const [expandedBlockKey, setExpandedBlockKey] = useState(null)
  const [activePickerSlot, setActivePickerSlot] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)

  const schema = getPageOutlineSchema(pageKey)
  const blockSlots = pageData.blockSlots || {}

  const getSlotBlocks = (slotId) => {
    return blockSlots[slotId] || (slotId === 'bottom' ? pageData.extraBlocks || pageData.blocks : []) || []
  }

  const setSlotBlocks = (slotId, newBlocks) => {
    const updatedSlots = { ...blockSlots, [slotId]: newBlocks }
    const updatedPage = { ...pageData, blockSlots: updatedSlots }
    if (slotId === 'bottom') {
      if (pageData.extraBlocks) updatedPage.extraBlocks = newBlocks
      if (pageData.blocks) updatedPage.blocks = newBlocks
    }
    onUpdatePage(updatedPage)
  }

  // Find all slots in order
  const slotList = schema.filter(item => item.kind === 'slot')

  // Move block up/down within slot or to adjacent slot
  const handleMoveBlock = (slotId, blockIndex, direction) => {
    const curBlocks = [...getSlotBlocks(slotId)]
    const targetIdx = blockIndex + direction
    const currentSlotIdx = slotList.findIndex(s => s.id === slotId)

    if (targetIdx < 0) {
      // Move to previous slot end
      if (currentSlotIdx > 0) {
        const prevSlotId = slotList[currentSlotIdx - 1].id
        const blockToMove = curBlocks[blockIndex]
        const remaining = curBlocks.filter((_, i) => i !== blockIndex)
        const prevBlocks = [...getSlotBlocks(prevSlotId), blockToMove]
        const updatedSlots = { ...blockSlots, [slotId]: remaining, [prevSlotId]: prevBlocks }
        onUpdatePage({ ...pageData, blockSlots: updatedSlots })
      }
      return
    }

    if (targetIdx >= curBlocks.length) {
      // Move to next slot start
      if (currentSlotIdx < slotList.length - 1) {
        const nextSlotId = slotList[currentSlotIdx + 1].id
        const blockToMove = curBlocks[blockIndex]
        const remaining = curBlocks.filter((_, i) => i !== blockIndex)
        const nextBlocks = [blockToMove, ...getSlotBlocks(nextSlotId)]
        const updatedSlots = { ...blockSlots, [slotId]: remaining, [nextSlotId]: nextBlocks }
        onUpdatePage({ ...pageData, blockSlots: updatedSlots })
      }
      return
    }

    // Swap within same slot
    const temp = curBlocks[blockIndex]
    curBlocks[blockIndex] = curBlocks[targetIdx]
    curBlocks[targetIdx] = temp
    setSlotBlocks(slotId, curBlocks)
  }

  const handleToggleBlockVisible = (slotId, blockIndex) => {
    const curBlocks = [...getSlotBlocks(slotId)]
    curBlocks[blockIndex] = {
      ...curBlocks[blockIndex],
      visible: curBlocks[blockIndex].visible === false ? true : false
    }
    setSlotBlocks(slotId, curBlocks)
  }

  const handleDeleteBlock = (slotId, blockIndex) => {
    if (window.confirm('Delete this block from the page?')) {
      const curBlocks = getSlotBlocks(slotId).filter((_, i) => i !== blockIndex)
      setSlotBlocks(slotId, curBlocks)
      if (expandedBlockKey === `${slotId}-${blockIndex}`) {
        setExpandedBlockKey(null)
      }
    }
  }

  const handleUpdateBlockField = (slotId, blockIndex, field, value) => {
    const curBlocks = [...getSlotBlocks(slotId)]
    const finalVal = field === 'videoUrl' ? cleanVideoUrl(value) : value
    curBlocks[blockIndex] = { ...curBlocks[blockIndex], [field]: finalVal }
    setSlotBlocks(slotId, curBlocks)
  }

  const handleUpdateFullBlock = (slotId, blockIndex, updatedBlock) => {
    const curBlocks = [...getSlotBlocks(slotId)]
    curBlocks[blockIndex] = updatedBlock
    setSlotBlocks(slotId, curBlocks)
  }

  const handleAddBlockToSlot = (slotId, blockType, insertIndex = null) => {
    const newBlock = createDefaultBlock(blockType)
    const curBlocks = [...getSlotBlocks(slotId)]
    if (insertIndex === null || insertIndex === undefined || insertIndex >= curBlocks.length) {
      curBlocks.push(newBlock)
    } else {
      curBlocks.splice(insertIndex + 1, 0, newBlock)
    }
    setSlotBlocks(slotId, curBlocks)
    setActivePickerSlot(null)
    setExpandedBlockKey(`${slotId}-${insertIndex !== null ? insertIndex + 1 : curBlocks.length - 1}`)
  }

  // Toggle built-in section visibility
  const handleToggleSectionVisible = (visibilityKey) => {
    if (!visibilityKey) return
    const curVal = pageData[visibilityKey] !== false
    onUpdatePage({
      ...pageData,
      [visibilityKey]: !curVal
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e, slotId, blockIndex) => {
    setDraggedItem({ slotId, blockIndex })
    e.dataTransfer.setData('text/plain', `${slotId}:${blockIndex}`)
  }

  const handleDropOnBlock = (e, targetSlotId, targetBlockIndex) => {
    e.preventDefault()
    if (!draggedItem) return
    const { slotId: srcSlotId, blockIndex: srcIndex } = draggedItem
    if (srcSlotId === targetSlotId && srcIndex === targetBlockIndex) return

    const srcBlocks = [...getSlotBlocks(srcSlotId)]
    const [movedBlock] = srcBlocks.splice(srcIndex, 1)

    if (srcSlotId === targetSlotId) {
      srcBlocks.splice(targetBlockIndex, 0, movedBlock)
      setSlotBlocks(srcSlotId, srcBlocks)
    } else {
      const destBlocks = [...getSlotBlocks(targetSlotId)]
      destBlocks.splice(targetBlockIndex, 0, movedBlock)
      const updatedSlots = { ...blockSlots, [srcSlotId]: srcBlocks, [targetSlotId]: destBlocks }
      onUpdatePage({ ...pageData, blockSlots: updatedSlots })
    }
    setDraggedItem(null)
  }

  return (
    <div className="rounded-2xl border border-studio-magenta/30 bg-gradient-to-br from-studio-card/90 to-studio-surface/90 overflow-hidden shadow-lg shadow-black/40">
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 bg-studio-magenta/10 hover:bg-studio-magenta/15 flex items-center justify-between text-left transition border-b border-studio-magenta/20"
      >
        <span className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white tracking-wide">
          <Layers className="w-4 h-4 text-studio-magenta" />
          <span>Page Layout & Outline</span>
          <span className="text-[11px] font-normal text-slate-400">
            (All built-in sections & custom blocks in visual order)
          </span>
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
      </button>

      {open && (
        <div className="p-4 sm:p-5 space-y-2 text-xs">
          <p className="text-[11px] text-slate-400 pb-2">
            View every section and custom block in the exact order they appear on the page. Use the switches to show/hide sections, up/down arrows or drag handles to reorder blocks across slots, or expand any block to edit inline.
          </p>

          <div className="space-y-1.5">
            {schema.map((item, itemIdx) => {
              if (item.kind === 'section') {
                const isVisible = pageData[item.visibilityKey] !== false
                const isPickerOpen = activePickerSlot === `section-${item.id}`
                // Find next slot to add to
                const nextSlot = schema.slice(itemIdx + 1).find(s => s.kind === 'slot')?.id || 'bottom'

                return (
                  <div key={`section-${item.id}`} className="space-y-1.5">
                    {/* Fixed Section Row */}
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-studio-purple/30 border border-studio-purple/40 flex items-center justify-center text-studio-gold shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Built-in section
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.visibilityKey && (
                          <button
                            type="button"
                            onClick={() => handleToggleSectionVisible(item.visibilityKey)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                              isVisible
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            }`}
                            title={isVisible ? 'Visible on page (click to hide)' : 'Hidden from page (click to show)'}
                          >
                            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Add block row after section */}
                    <div className="flex justify-center py-0.5 relative">
                      <button
                        type="button"
                        onClick={() => setActivePickerSlot(isPickerOpen ? null : `section-${item.id}`)}
                        className="text-[10px] text-slate-400 hover:text-studio-gold flex items-center gap-1 px-2.5 py-0.5 rounded-full hover:bg-white/5 border border-dashed border-white/10 hover:border-studio-gold/40 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add block after section</span>
                      </button>

                      {isPickerOpen && (
                        <div className="absolute top-6 z-30 p-2 rounded-xl bg-[#171424] border border-studio-magenta/40 shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-72 sm:w-96 text-left">
                          <div className="col-span-full flex items-center justify-between pb-1 border-b border-white/10 mb-1">
                            <span className="text-[10px] font-bold text-studio-gold uppercase">Choose Block Type:</span>
                            <button type="button" onClick={() => setActivePickerSlot(null)} className="text-slate-400 hover:text-white">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {BLOCK_REGISTRY.map(reg => (
                            <button
                              key={reg.id}
                              type="button"
                              onClick={() => handleAddBlockToSlot(nextSlot, reg.id, 0)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-studio-magenta/20 hover:text-white text-slate-300 text-[11px] flex items-center gap-1.5 transition text-left"
                            >
                              <span>{reg.icon}</span>
                              <span className="truncate">{reg.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Kind === 'slot'
              const slotBlocks = getSlotBlocks(item.id)
              return (
                <div key={`slot-${item.id}`} className="space-y-1.5">
                  {slotBlocks.map((block, bIdx) => {
                    const blockKey = `${item.id}-${bIdx}`
                    const isExpanded = expandedBlockKey === blockKey
                    const def = getBlockDefinition(block.type)
                    const EditorComp = def?.Editor
                    const isHidden = block.visible === false
                    const isPickerOpen = activePickerSlot === `block-${blockKey}`

                    return (
                      <div
                        key={block.id || blockKey}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id, bIdx)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDropOnBlock(e, item.id, bIdx)}
                        className={`rounded-xl border transition-all ${
                          isHidden
                            ? 'bg-black/40 border-white/5 opacity-65'
                            : isExpanded
                            ? 'bg-studio-magenta/10 border-studio-magenta/50 shadow-md'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Block Summary Row */}
                        <div
                          onClick={() => setExpandedBlockKey(isExpanded ? null : blockKey)}
                          className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5"
                              title="Drag to reorder or move between slots"
                              onClick={e => e.stopPropagation()}
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-xs shrink-0">
                              {def?.icon || '📦'}
                            </span>
                            <span className="font-medium text-white truncate max-w-xs sm:max-w-md">
                              {getBlockSummary(block)}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.2 rounded bg-white/5 shrink-0 hidden sm:inline">
                              {def?.label || block.type}
                            </span>
                            {isHidden && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 font-semibold shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(item.id, bIdx, -1)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(item.id, bIdx, 1)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBlockVisible(item.id, bIdx)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              title={isHidden ? 'Show block' : 'Hide block'}
                            >
                              {isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(item.id, bIdx)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                              title="Delete block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedBlockKey(isExpanded ? null : blockKey)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white ml-0.5"
                              title={isExpanded ? 'Collapse inline editor' : 'Expand inline editor'}
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-studio-gold" /> : <Edit2 className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Inline Editor Drawer */}
                        {isExpanded && (
                          <div className="p-4 border-t border-white/10 space-y-3 bg-black/40 rounded-b-xl">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                              <span className="text-[11px] font-bold text-studio-gold uppercase tracking-wider flex items-center gap-1.5">
                                <span>{def?.icon}</span>
                                <span>Editing {def?.label || block.type} Block (Slot: {item.label})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedBlockKey(null)}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Close</span>
                              </button>
                            </div>

                            {EditorComp ? (
                              <EditorComp
                                block={block}
                                onUpdateField={(field, val) => handleUpdateBlockField(item.id, bIdx, field, val)}
                                onUpdateBlock={(updatedBlock) => handleUpdateFullBlock(item.id, bIdx, updatedBlock)}
                              />
                            ) : (
                              <p className="text-xs text-slate-400 italic">No editor component found for {block.type}</p>
                            )}

                            {/* Layout & Spacing */}
                            <BlockStyleEditor
                              style={block.style || {}}
                              onChange={newStyle => handleUpdateBlockField(item.id, bIdx, 'style', newStyle)}
                            />
                          </div>
                        )}

                        {/* "+ Add block" row after block */}
                        <div className="flex justify-center py-0.5 relative">
                          <button
                            type="button"
                            onClick={() => setActivePickerSlot(isPickerOpen ? null : `block-${blockKey}`)}
                            className="text-[10px] text-slate-500 hover:text-studio-gold flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/5 border border-dashed border-white/5 hover:border-studio-gold/30 transition"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add block here</span>
                          </button>

                          {isPickerOpen && (
                            <div className="absolute top-6 z-30 p-2 rounded-xl bg-[#171424] border border-studio-magenta/40 shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-72 sm:w-96 text-left">
                              <div className="col-span-full flex items-center justify-between pb-1 border-b border-white/10 mb-1">
                                <span className="text-[10px] font-bold text-studio-gold uppercase">Choose Block Type:</span>
                                <button type="button" onClick={() => setActivePickerSlot(null)} className="text-slate-400 hover:text-white">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {BLOCK_REGISTRY.map(reg => (
                                <button
                                  key={reg.id}
                                  type="button"
                                  onClick={() => handleAddBlockToSlot(item.id, reg.id, bIdx)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-studio-magenta/20 hover:text-white text-slate-300 text-[11px] flex items-center gap-1.5 transition text-left"
                                >
                                  <span>{reg.icon}</span>
                                  <span className="truncate">{reg.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
