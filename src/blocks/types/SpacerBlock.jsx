// src/blocks/types/SpacerBlock.jsx
import React from 'react'

const PRESETS = [
  { id: 'xs', label: 'XS (16px)', px: 16 },
  { id: 's', label: 'S (32px)', px: 32 },
  { id: 'm', label: 'M (48px)', px: 48 },
  { id: 'l', label: 'L (64px)', px: 64 },
  { id: 'xl', label: 'XL (96px)', px: 96 },
  { id: '2xl', label: '2XL (128px)', px: 128 },
  { id: 'custom', label: 'Custom', px: null }
]

export function SpacerBlockEditor({ block, onUpdateField }) {
  const preset = block.preset || 'm'

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-slate-300">
        Vertical Space Height
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onUpdateField('preset', p.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              preset === p.id
                ? 'bg-studio-gold text-slate-950 border-studio-gold font-semibold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Custom Height (pixels)
          </label>
          <input
            type="number"
            min={4}
            max={500}
            value={block.customPx || 48}
            onChange={e => onUpdateField('customPx', Number(e.target.value) || 0)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      )}
    </div>
  )
}

export function SpacerBlockRenderer({ block }) {
  const preset = block.preset || 'm'
  const found = PRESETS.find(p => p.id === preset)
  const height = preset === 'custom' ? Number(block.customPx) || 48 : (found?.px || 48)

  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full pointer-events-none select-none"
      aria-hidden="true"
    />
  )
}

export const id = 'spacer'
export const label = 'Spacer / Blank Space'
export const icon = '↕️'
export const defaultData = (blockId) => ({
  id: blockId,
  type: 'spacer',
  visible: true,
  preset: 'm',
  customPx: 48,
  style: {}
})
export const Editor = SpacerBlockEditor
export const Component = SpacerBlockRenderer
