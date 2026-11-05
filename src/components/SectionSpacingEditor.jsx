// src/components/SectionSpacingEditor.jsx
import React, { useState } from 'react'
import { Sliders, ChevronDown, ChevronRight } from 'lucide-react'
import { SPACING_OPTIONS } from './SectionWrap'

export default function SectionSpacingEditor({
  sections = [],
  spacing = {},
  onChange
}) {
  const [open, setOpen] = useState(false)

  const update = (secId, field, val) => {
    const curSec = spacing[secId] || {}
    onChange({
      ...spacing,
      [secId]: {
        ...curSec,
        [field]: val
      }
    })
  }

  const hasAnySpacing = Object.keys(spacing).some(k => spacing[k]?.spaceAbove || spacing[k]?.spaceBelow)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-studio-gold uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-studio-gold" />
          <span>Section Spacing (Top & Bottom Padding)</span>
          {hasAnySpacing && (
            <span className="w-1.5 h-1.5 rounded-full bg-studio-gold" title="Has custom spacing" />
          )}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 text-xs">
          <p className="text-[11px] text-slate-400">
            Adjust the top and bottom spacing for each built-in section on this page. Default preserves existing layout.
          </p>

          <div className="space-y-3">
            {sections.map(sec => {
              const cur = spacing[sec.id] || {}
              return (
                <div key={sec.id} className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-white block">
                    {sec.label}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Space Above</label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={cur.spaceAbove || 'default'}
                          onChange={e => update(sec.id, 'spaceAbove', e.target.value)}
                          className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          {SPACING_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                        {cur.spaceAbove === 'custom' && (
                          <input
                            type="number"
                            min="0"
                            max="300"
                            placeholder="px"
                            value={cur.customSpaceAbove || ''}
                            onChange={e => update(sec.id, 'customSpaceAbove', e.target.value)}
                            className="w-16 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Space Below</label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={cur.spaceBelow || 'default'}
                          onChange={e => update(sec.id, 'spaceBelow', e.target.value)}
                          className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          {SPACING_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                        {cur.spaceBelow === 'custom' && (
                          <input
                            type="number"
                            min="0"
                            max="300"
                            placeholder="px"
                            value={cur.customSpaceBelow || ''}
                            onChange={e => update(sec.id, 'customSpaceBelow', e.target.value)}
                            className="w-16 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
