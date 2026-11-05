// src/blocks/BlockStyleEditor.jsx
import React, { useState } from 'react'
import { Sliders, ChevronDown, ChevronRight } from 'lucide-react'

export default function BlockStyleEditor({ style = {}, onChange }) {
  const [open, setOpen] = useState(false)

  const update = (field, value) => {
    onChange({
      ...style,
      [field]: value
    })
  }

  const hasCustomSettings = Object.keys(style).some(k => style[k])

  return (
    <div className="pt-2 border-t border-white/5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02] hover:bg-white/5 text-[11px] text-slate-400 hover:text-white transition"
      >
        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-studio-gold" />
          <span>Layout & Spacing</span>
          {hasCustomSettings && (
            <span className="w-1.5 h-1.5 rounded-full bg-studio-gold ml-1" title="Has custom styles" />
          )}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
          {/* Spacing Above & Below */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-1">Space Above</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={style.spaceAbove || ''}
                  onChange={e => update('spaceAbove', e.target.value)}
                  className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="">Default (Auto)</option>
                  <option value="none">None (0px)</option>
                  <option value="xs">XS (8px)</option>
                  <option value="s">S (16px)</option>
                  <option value="m">M (32px)</option>
                  <option value="l">L (48px)</option>
                  <option value="xl">XL (64px)</option>
                  <option value="custom">Custom px</option>
                </select>
                {style.spaceAbove === 'custom' && (
                  <input
                    type="number"
                    min="0"
                    max="300"
                    placeholder="px"
                    value={style.customSpaceAbove || ''}
                    onChange={e => update('customSpaceAbove', e.target.value)}
                    className="w-16 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-1">Space Below</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={style.spaceBelow || ''}
                  onChange={e => update('spaceBelow', e.target.value)}
                  className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="">Default (Auto)</option>
                  <option value="none">None (0px)</option>
                  <option value="xs">XS (8px)</option>
                  <option value="s">S (16px)</option>
                  <option value="m">M (32px)</option>
                  <option value="l">L (48px)</option>
                  <option value="xl">XL (64px)</option>
                  <option value="custom">Custom px</option>
                </select>
                {style.spaceBelow === 'custom' && (
                  <input
                    type="number"
                    min="0"
                    max="300"
                    placeholder="px"
                    value={style.customSpaceBelow || ''}
                    onChange={e => update('customSpaceBelow', e.target.value)}
                    className="w-16 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Width & Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-1">Block Width</label>
              <select
                value={style.width || ''}
                onChange={e => update('width', e.target.value)}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="">Default Width</option>
                <option value="narrow">Narrow (max 2xl)</option>
                <option value="medium">Medium (max 4xl)</option>
                <option value="wide">Wide (max 6xl)</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-1">Alignment</label>
              <select
                value={style.align || ''}
                onChange={e => update('align', e.target.value)}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="">Default (Center)</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1">Background Style</label>
            <div className="flex items-center gap-2">
              <select
                value={style.background || 'none'}
                onChange={e => update('background', e.target.value)}
                className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="none">None (Transparent)</option>
                <option value="card">Card (Studio Glass Panel with padding)</option>
                <option value="custom">Custom Color with padding</option>
              </select>
              {style.background === 'custom' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={style.customBgColor || '#1c1729'}
                    onChange={e => update('customBgColor', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    placeholder="#1c1729"
                    value={style.customBgColor || ''}
                    onChange={e => update('customBgColor', e.target.value)}
                    className="w-24 bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Visibility on Devices & Anchor ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-slate-300">Device Visibility</label>
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={style.hideOnMobile || false}
                  onChange={e => update('hideOnMobile', e.target.checked)}
                  className="accent-studio-magenta"
                />
                <span>Hide on phone (Mobile)</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={style.hideOnDesktop || false}
                  onChange={e => update('hideOnDesktop', e.target.checked)}
                  className="accent-studio-magenta"
                />
                <span>Hide on computer (Desktop)</span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-1">
                Anchor ID (direct link target, e.g. <code>my-block</code>)
              </label>
              <input
                type="text"
                placeholder="my-section-id"
                value={style.anchorId || ''}
                onChange={e => update('anchorId', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
