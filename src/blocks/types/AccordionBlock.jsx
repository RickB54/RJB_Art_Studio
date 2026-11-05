// src/blocks/types/AccordionBlock.jsx
import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react'

export function AccordionBlockEditor({ block, onUpdateField }) {
  const items = block.items || []

  const handleAddItem = () => {
    const newItem = {
      id: `acc-${Date.now()}`,
      title: 'New Question / Item',
      content: 'Detailed answer or explanation text...'
    }
    onUpdateField('items', [...items, newItem])
  }

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onUpdateField('items', updated)
  }

  const handleMoveItem = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    onUpdateField('items', updated)
  }

  const handleDeleteItem = (index) => {
    if (window.confirm('Delete this accordion item?')) {
      onUpdateField('items', items.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Section Title (Optional)</label>
        <input
          type="text"
          value={block.title || ''}
          onChange={e => onUpdateField('title', e.target.value)}
          placeholder="Frequently Asked Questions"
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Accordion Items ({items.length})</span>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs text-studio-gold hover:text-white flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {items.map((it, idx) => (
          <div key={it.id || idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-studio-gold uppercase tracking-wider">
                Item #{idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveItem(idx, -1)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => handleMoveItem(idx, 1)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={it.title || ''}
              onChange={e => handleUpdateItem(idx, 'title', e.target.value)}
              placeholder="Question or Title"
              className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white font-medium"
            />
            <textarea
              rows={2}
              value={it.content || ''}
              onChange={e => handleUpdateItem(idx, 'content', e.target.value)}
              placeholder="Answer or content..."
              className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccordionBlockRenderer({ block }) {
  const items = block.items || []
  const [openIndices, setOpenIndices] = useState(new Set([0])) // First item open by default

  const toggle = (idx) => {
    setOpenIndices(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {block.title && (
        <h3 className="font-serif text-2xl font-bold text-white text-center">
          {block.title}
        </h3>
      )}

      <div className="space-y-2">
        {items.map((it, idx) => {
          const isOpen = openIndices.has(idx)
          return (
            <div
              key={it.id || idx}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
              >
                <span className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                  <span className="text-studio-gold text-xs font-sans">0{idx + 1}.</span>
                  <span>{it.title}</span>
                </span>
                <span className="p-1 rounded-full bg-white/5 text-slate-300">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-studio-gold" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5 whitespace-pre-line">
                  {it.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const id = 'accordion'
export const label = 'Accordion / FAQ'
export const icon = '📑'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'accordion',
  visible: true,
  title: 'Frequently Asked Questions',
  items: [
    {
      id: `acc-1`,
      title: 'How are paintings shipped and protected?',
      content: 'Every original artwork is professionally wrapped in moisture-resistant archival paper, secured with heavy-duty corner protectors, and shipped fully insured with tracking.'
    },
    {
      id: `acc-2`,
      title: 'Do custom commissions include a Certificate of Authenticity?',
      content: 'Yes! Every commissioned oil painting, acrylic artwork, or portrait includes an embossed, signed and dated Certificate of Authenticity.'
    }
  ],
  style: {}
})
export const Editor = AccordionBlockEditor
export const Component = AccordionBlockRenderer
