// src/blocks/types/ColumnsBlock.jsx
import React from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

export function ColumnsBlockEditor({ block, onUpdateField, onUpdateBlock }) {
  const count = block.columnsCount || 2
  const cols = block.columns || [
    { title: 'Column 1', text: 'Column content description or details.', image: '', buttonText: '', buttonUrl: '' },
    { title: 'Column 2', text: 'Second column description or details.', image: '', buttonText: '', buttonUrl: '' }
  ]

  const setColumnCount = (newCount) => {
    let updated = [...cols]
    if (newCount === 3 && updated.length < 3) {
      while (updated.length < 3) {
        updated.push({ title: `Column ${updated.length + 1}`, text: '', image: '', buttonText: '', buttonUrl: '' })
      }
    } else if (newCount === 2 && updated.length > 2) {
      updated = updated.slice(0, 2)
    }
    onUpdateBlock({
      ...block,
      columnsCount: newCount,
      columns: updated
    })
  }

  const updateCol = (idx, field, val) => {
    const updated = [...cols]
    updated[idx] = { ...updated[idx], [field]: val }
    onUpdateField('columns', updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Number of Columns</label>
        <div className="flex gap-2">
          {[2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setColumnCount(num)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                count === num
                  ? 'bg-studio-gold text-slate-950 border-studio-gold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {num} Columns
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {cols.slice(0, count).map((col, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <span className="text-[10px] font-bold text-studio-gold uppercase tracking-wider block">
              Column #{idx + 1}
            </span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={col.title || ''}
                onChange={e => updateCol(idx, 'title', e.target.value)}
                placeholder="Column Title"
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Image URL (optional)</label>
              <input
                type="text"
                value={col.image || ''}
                onChange={e => updateCol(idx, 'image', e.target.value)}
                placeholder="/images/example.jpg or https://..."
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Text</label>
              <textarea
                rows={3}
                value={col.text || ''}
                onChange={e => updateCol(idx, 'text', e.target.value)}
                placeholder="Column text..."
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Button Label (optional)</label>
                <input
                  type="text"
                  value={col.buttonText || ''}
                  onChange={e => updateCol(idx, 'buttonText', e.target.value)}
                  placeholder="e.g. Learn More"
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Button URL</label>
                <input
                  type="text"
                  value={col.buttonUrl || ''}
                  onChange={e => updateCol(idx, 'buttonUrl', e.target.value)}
                  placeholder="/gallery or https://..."
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ColumnsBlockRenderer({ block }) {
  const cols = block.columns || []
  const count = Number(block.columnsCount) || (cols.length === 3 ? 3 : 2)
  const visibleCols = cols.slice(0, count)

  if (visibleCols.length === 0) return null

  const gridClass = count === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-6 md:gap-8`}>
      {visibleCols.map((col, idx) => (
        <div
          key={idx}
          className="flex flex-col glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 backdrop-blur-md"
        >
          {col.image && (
            <div className="mb-4 rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10">
              <img
                src={col.image}
                alt={col.title || `Column ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          {col.title && (
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              {col.title}
            </h3>
          )}
          {col.text && (
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed flex-grow">
              {col.text}
            </p>
          )}
          {col.buttonText && col.buttonUrl && (
            <div className="mt-5 pt-2">
              <a
                href={col.buttonUrl}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-studio-gold text-slate-950 hover:bg-studio-gold/90 shadow-sm transition-all hover:scale-[1.02]"
              >
                {col.buttonText}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const id = 'columns'
export const label = 'Columns (2 or 3)'
export const icon = '🏛️'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'columns',
  visible: true,
  columnsCount: 2,
  columns: [
    { title: 'Fine Art Originals', text: 'Original oil paintings created with meticulous glaze layers and luminous depth.', image: '', buttonText: 'View Gallery', buttonUrl: '/gallery' },
    { title: 'Custom Commissions', text: 'Commission a one-of-a-kind landscape, memorial, or portrait tailored to your space.', image: '', buttonText: 'Commission Art', buttonUrl: '/commissions' }
  ],
  style: {}
})
export const Editor = ColumnsBlockEditor
export const Component = ColumnsBlockRenderer
