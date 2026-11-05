// src/blocks/types/DividerBlock.jsx
import React from 'react'

export const id = 'divider'
export const label = '➖ Divider'
export const icon = '➖'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    style: 'standard'
  }
}

export function Component() {
  return (
    <div className="py-6 flex items-center justify-center">
      <div className="w-full border-t border-white/10 relative flex items-center justify-center">
        <span className="absolute bg-studio-surface px-3 text-studio-gold text-xs">◆</span>
      </div>
    </div>
  )
}

export function Editor() {
  return (
    <div className="py-2 text-center text-xs text-slate-400 border border-white/5 rounded-xl bg-black/20">
      <span className="text-studio-gold">◆</span> Clean separator line with studio accent
    </div>
  )
}
