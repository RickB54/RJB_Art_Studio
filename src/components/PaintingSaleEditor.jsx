// src/components/PaintingSaleEditor.jsx
import React, { useState } from 'react'
import { Plus, Trash2, ExternalLink, AlertTriangle, DollarSign, Check, HelpCircle } from 'lucide-react'
import { DEFAULT_MARKETPLACES, detectMarketplace, validateArtworkUrl, getMarketplace } from '../utils/marketplaces'

/**
 * Reusable Sale / Marketplace Question Editor Component
 * Used in:
 * 1. Add Single Painting (both photo & youtube modes)
 * 2. Paintings Tab Edit
 * 3. Home Showcase customize panel
 * 4. Gallery Block photo items
 */
export default function PaintingSaleEditor({
  status = '',
  onStatusChange,
  sale = {},
  onSaleChange,
  marketplaces = DEFAULT_MARKETPLACES,
  compact = false
}) {
  const mList = Array.isArray(marketplaces) && marketplaces.length > 0 ? marketplaces : DEFAULT_MARKETPLACES

  // Normalized safe sale object
  const currentSale = {
    price: sale?.price !== undefined && sale?.price !== null ? sale.price : '',
    showPrice: Boolean(sale?.showPrice),
    needsSaleInfo: Boolean(sale?.needsSaleInfo),
    contactOnly: Boolean(sale?.contactOnly),
    links: Array.isArray(sale?.links) ? sale.links : []
  }

  const [urlErrors, setUrlErrors] = useState({})
  const [askLaterDismissed, setAskLaterDismissed] = useState(false)

  const updateSale = (patch) => {
    onSaleChange({
      ...currentSale,
      ...patch
    })
  }

  const handleStatusSelect = (newStatus) => {
    onStatusChange(newStatus)
    // If setting to For Sale and no links or contactOnly, flag needsSaleInfo
    if (newStatus === 'For Sale' && currentSale.links.length === 0 && !currentSale.contactOnly) {
      updateSale({ needsSaleInfo: true })
    }
  }

  const handleAddLink = () => {
    const newLinks = [
      ...currentSale.links,
      {
        marketplaceId: 'fineartamerica',
        kind: 'both',
        url: '',
        label: ''
      }
    ]
    updateSale({ links: newLinks, needsSaleInfo: false })
  }

  const handleRemoveLink = (index) => {
    const newLinks = currentSale.links.filter((_, i) => i !== index)
    updateSale({ links: newLinks })
    setUrlErrors(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const handleLinkChange = (index, field, value) => {
    const updated = currentSale.links.map((link, i) => {
      if (i !== index) return link
      const next = { ...link, [field]: value }

      // Auto-detect marketplace when URL changes
      if (field === 'url') {
        const detected = detectMarketplace(value, mList)
        if (detected && detected !== 'other') {
          next.marketplaceId = detected
        }
        // Validation check
        if (value.trim()) {
          const res = validateArtworkUrl(value)
          if (!res.valid) {
            setUrlErrors(prev => ({ ...prev, [index]: res.error }))
          } else {
            setUrlErrors(prev => {
              const cp = { ...prev }
              delete cp[index]
              return cp
            })
          }
        } else {
          setUrlErrors(prev => {
            const cp = { ...prev }
            delete cp[index]
            return cp
          })
        }
      }
      return next
    })

    // If user added a valid link, clear needsSaleInfo
    const hasAnyValid = updated.some(l => l.url && !validateArtworkUrl(l.url).error)
    updateSale({
      links: updated,
      needsSaleInfo: hasAnyValid ? false : currentSale.needsSaleInfo
    })
  }

  const handleTestLink = (url) => {
    if (!url) return
    const target = url.startsWith('http') ? url : `https://${url}`
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  const isForSale = status === 'For Sale'
  const isSold = status === 'Sold'
  const showLinksSection = isForSale || currentSale.links.length > 0 || isSold

  return (
    <div className={`space-y-4 rounded-xl border border-white/10 bg-white/[0.02] ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      
      {/* 1. THE MAIN QUESTION */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-sm font-semibold text-studio-gold">
          Is this painting for sale?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 'For Sale', label: 'For Sale', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
            { value: 'Sold', label: 'Sold', color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' },
            { value: 'Reserved', label: 'Reserved', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
            { value: 'Not for sale', label: 'Not for sale', color: 'border-slate-500/40 text-slate-400 bg-slate-500/10' }
          ].map(opt => {
            const isSelected = status === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusSelect(isSelected ? '' : opt.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? `${opt.color} ring-2 ring-studio-gold shadow-md font-bold`
                    : 'border-white/10 text-slate-300 bg-white/5 hover:bg-white/10'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. "NEEDS SALE INFO" ALERT BANNER */}
      {currentSale.needsSaleInfo && !askLaterDismissed && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Needs sale info:</strong> Please provide a direct marketplace artwork link or choose "No online link: people contact me".
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setAskLaterDismissed(true)
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition"
              title="Dismiss this reminder for now"
            >
              Ask me later
            </button>
            <button
              type="button"
              onClick={() => updateSale({ needsSaleInfo: false })}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. FOR SALE CONFIGURATION: PRICE & PURCHASE DESTINATIONS */}
      {showLinksSection && (
        <div className="space-y-4 pt-2 border-t border-white/10">

          {/* Contact-Only Option */}
          <div className="flex items-center gap-2.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <input
              type="checkbox"
              id={`contact-only-${status}`}
              checked={currentSale.contactOnly}
              onChange={e => updateSale({
                contactOnly: e.target.checked,
                needsSaleInfo: e.target.checked ? false : currentSale.needsSaleInfo
              })}
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-studio-gold focus:ring-studio-gold cursor-pointer"
            />
            <label htmlFor={`contact-only-${status}`} className="text-xs font-semibold text-slate-200 cursor-pointer">
              No online link: people contact me directly
              <span className="block text-[11px] font-normal text-slate-400">
                Shows an "Inquire / Buy" button pointing directly to your contact form.
              </span>
            </label>
          </div>

          {/* Price to show on site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-studio-gold" />
                <span>Price to show on my site (optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 250 or 250.00"
                value={currentSale.price || ''}
                onChange={e => updateSale({ price: e.target.value })}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Hint: Keep it the same as the marketplace.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-3 sm:pt-0">
                <input
                  type="checkbox"
                  checked={currentSale.showPrice}
                  onChange={e => updateSale({ showPrice: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-slate-900 text-studio-gold focus:ring-studio-gold cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Show price publicly on website
                </span>
              </label>
              <p className="text-[10px] text-slate-400 ml-6">
                When turned off, the price is kept in your records but not displayed on public cards.
              </p>
            </div>
          </div>

          {/* Repeatable Marketplace Links */}
          {!currentSale.contactOnly && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Where can people buy it?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Add direct artwork links. Marketplace is auto-detected when you paste a URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-studio-gold/20 hover:bg-studio-gold/30 text-studio-gold border border-studio-gold/30 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add another place</span>
                </button>
              </div>

              {currentSale.links.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    No marketplace purchase links added yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Purchase Place</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSale.links.map((link, idx) => {
                    const mp = getMarketplace(mList, link.marketplaceId)
                    const err = urlErrors[idx]

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#13111c] border border-white/10 space-y-2 relative group hover:border-white/20 transition"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          {/* Marketplace Select */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] text-slate-400 mb-0.5">Marketplace</label>
                            <select
                              value={link.marketplaceId || 'other'}
                              onChange={e => handleLinkChange(idx, 'marketplaceId', e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                            >
                              {mList.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* What it sells: Original / Prints / Both */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] text-slate-400 mb-0.5">What it sells</label>
                            <select
                              value={link.kind || 'both'}
                              onChange={e => handleLinkChange(idx, 'kind', e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value="original">Original Only</option>
                              <option value="prints">Prints Only</option>
                              <option value="both">Both (Original & Prints)</option>
                            </select>
                          </div>

                          {/* URL Input */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] text-slate-400 mb-0.5">Direct Artwork URL (https://)</label>
                            <input
                              type="text"
                              value={link.url || ''}
                              onChange={e => handleLinkChange(idx, 'url', e.target.value)}
                              placeholder="https://..."
                              className={`w-full bg-slate-900 border rounded px-2.5 py-1.5 text-xs text-white ${
                                err ? 'border-rose-500 focus:ring-rose-500' : 'border-white/10'
                              }`}
                            />
                          </div>

                          {/* Actions: Test & Remove */}
                          <div className="sm:col-span-2 flex items-center justify-end gap-1.5 pt-4 sm:pt-3">
                            <button
                              type="button"
                              onClick={() => handleTestLink(link.url)}
                              disabled={!link.url}
                              className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
                              title="Test link in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="hidden sm:inline">Test</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Remove this purchase place"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Validation Error Message */}
                        {err && (
                          <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded p-2 flex items-start gap-1.5 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{err}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
