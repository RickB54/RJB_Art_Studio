import React, { useState, useEffect, useMemo } from 'react'
import {
  Image as ImageIcon, Trash2, RotateCcw, AlertTriangle, CheckCircle,
  RefreshCw, Folder, CheckSquare, Square, HardDrive, DollarSign,
  Search, ExternalLink, ShieldAlert
} from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function AdminMediaLibrary() {
  const [data, setData] = useState({ items: [], trashItems: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unused' | 'trash'
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [folderFilter, setFolderFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  // Netlify credits rate editable (default 20 credits per GB)
  const [creditsPerGb, setCreditsPerGb] = useState(20)

  const fetchMedia = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/__api/media-library')
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const json = await res.json()
      setData(json)
      setSelectedIds(new Set())
    } catch (err) {
      setError(err.message || 'Failed to load media library')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const { items = [], trashItems = [] } = data

  const folders = useMemo(() => {
    const list = new Set()
    items.forEach(i => list.add(i.folder))
    trashItems.forEach(i => list.add(i.folder))
    return Array.from(list)
  }, [items, trashItems])

  const displayedList = useMemo(() => {
    let list = []
    if (activeTab === 'trash') {
      list = trashItems
    } else if (activeTab === 'unused') {
      list = items.filter(i => i.isUnused)
    } else {
      list = items
    }

    if (folderFilter !== 'all') {
      list = list.filter(i => i.folder === folderFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(i =>
        i.baseName.toLowerCase().includes(q) ||
        i.folder.toLowerCase().includes(q) ||
        (i.usedIn && i.usedIn.some(u => u.toLowerCase().includes(q)))
      )
    }

    return list
  }, [items, trashItems, activeTab, folderFilter, searchQuery])

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllDisplayed = () => {
    setSelectedIds(new Set(displayedList.map(i => i.id)))
  }

  const selectAllUnused = () => {
    const unused = items.filter(i => i.isUnused)
    setSelectedIds(new Set(unused.map(i => i.id)))
    setActiveTab('unused')
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Move selected to Trash
  const handleMoveToTrash = async () => {
    if (selectedIds.size === 0) return
    const itemsToTrash = items
      .filter(i => selectedIds.has(i.id))
      .filter(i => i.isUnused) // Safety: only unused

    if (itemsToTrash.length === 0) {
      setMessage('No unreferenced media items selected. Files referenced anywhere cannot be moved.')
      return
    }

    const confirmMsg = `Move ${itemsToTrash.length} unused media item(s) to Trash (removed-media/)?`
    if (!window.confirm(confirmMsg)) return

    setIsProcessing(true)
    setMessage('')
    try {
      const res = await fetch('/__api/media-trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToTrash.map(i => ({ folder: i.folder, file: i.file, thumb: i.thumb }))
        })
      })
      const result = await res.json()
      if (result.success) {
        setMessage(`Moved ${result.moved.length} item(s) to removed-media/ (Trash).`)
        await fetchMedia()
      } else {
        setError(result.error || 'Failed to move items to trash')
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server')
    } finally {
      setIsProcessing(false)
    }
  }

  // Restore selected from Trash
  const handleRestore = async () => {
    if (selectedIds.size === 0) return
    const itemsToRestore = trashItems.filter(i => selectedIds.has(i.id))
    if (itemsToRestore.length === 0) return

    setIsProcessing(true)
    setMessage('')
    try {
      const res = await fetch('/__api/media-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToRestore.map(i => ({ folder: i.folder, file: i.file, thumb: i.thumb }))
        })
      })
      const result = await res.json()
      if (result.success) {
        setMessage(`Restored ${result.restored.length} item(s) to active media folders.`)
        await fetchMedia()
      } else {
        setError(result.error || 'Failed to restore items')
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server')
    } finally {
      setIsProcessing(false)
    }
  }

  // Media Budget calculations
  const totalActiveBytes = data.stats?.totalActiveBytes || 0
  const totalActiveCount = items.length
  const estimatedTransferGbPerVisit = (totalActiveBytes / (1024 * 1024 * 1024))
  const netlifyCreditsPer1k = (estimatedTransferGbPerVisit * 1000 * (Number(creditsPerGb) || 20)).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-studio-gold" />
            <span>Media Library & Asset Manager</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse all images across upload folders. Full images and thumbs are grouped as single items with usage tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMedia}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Media Budget Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-studio-gold/30 bg-gradient-to-r from-studio-purple/20 via-studio-card to-studio-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-studio-gold" />
            <h3 className="text-sm font-bold text-white">Media Budget & Bandwidth Estimation</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Netlify Credit Rate:</span>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <input
                type="number"
                min="1"
                step="1"
                value={creditsPerGb}
                onChange={e => setCreditsPerGb(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 bg-transparent text-center font-mono text-studio-gold font-bold focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">credits / GB</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Files</p>
            <p className="text-xl font-bold text-white mt-1">{totalActiveCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{items.filter(i => i.isUnused).length} unused</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Media Size</p>
            <p className="text-xl font-bold text-studio-gold mt-1">{formatBytes(totalActiveBytes)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{((totalActiveBytes / (1024 * 1024)) || 0).toFixed(2)} MB total</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Est. First-View</p>
            <p className="text-xl font-bold text-sky-300 mt-1">
              {formatBytes(items.filter(i => !i.isUnused).reduce((s, i) => s + (i.thumbSize || i.totalSize), 0))}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Initial referenced thumbs</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Est. Netlify Credits</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">~{netlifyCreditsPer1k}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">per 1,000 visits @ {creditsPerGb} cr/GB</p>
          </div>
        </div>

        {totalActiveBytes > 2 * 1024 * 1024 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Total active media footprint exceeds 2 MB. Clean up unused photos or optimize large assets to minimize bandwidth usage.
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation, Filters & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); clearSelection() }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-studio-magenta text-white shadow-glow-magenta'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Media ({items.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('unused'); clearSelection() }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'unused'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'bg-white/5 text-amber-300 hover:bg-white/10'
            }`}
          >
            <span>Unused Media</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200">
              {items.filter(i => i.isUnused).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('trash'); clearSelection() }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white/5 text-rose-300 hover:bg-white/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash ({trashItems.length})</span>
          </button>
        </div>

        {/* Search & Folder filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by filename or usage..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-studio-gold w-48 sm:w-60"
            />
          </div>

          <select
            value={folderFilter}
            onChange={e => setFolderFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-black/40 border border-white/15 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-studio-gold cursor-pointer"
          >
            <option value="all">All Folders</option>
            {folders.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action buttons bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectedIds.size === displayedList.length && displayedList.length > 0 ? clearSelection : selectAllDisplayed}
            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-xs text-slate-300 flex items-center gap-1.5 transition"
          >
            {selectedIds.size === displayedList.length && displayedList.length > 0 ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-studio-gold" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Select Displayed ({displayedList.length})</span>
              </>
            )}
          </button>

          {activeTab !== 'trash' && (
            <button
              type="button"
              onClick={selectAllUnused}
              className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 border border-amber-500/30 transition"
            >
              Select All Unused ({items.filter(i => i.isUnused).length})
            </button>
          )}

          {selectedIds.size > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'trash' ? (
            <button
              type="button"
              onClick={handleMoveToTrash}
              disabled={selectedIds.size === 0 || isProcessing}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
              title="Move selected unused photos to removed-media/"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move Selected Unused to Trash</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestore}
              disabled={selectedIds.size === 0 || isProcessing}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
              title="Restore selected photos back to public media folders"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Selected</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of media items */}
      {displayedList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">
            {activeTab === 'trash' ? 'Trash is empty.' : 'No media items found matching criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedList.map(item => {
            const isSelected = selectedIds.has(item.id)
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between transition cursor-pointer select-none ${
                  isSelected
                    ? 'border-studio-gold bg-studio-gold/10 shadow-glow-gold/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                }`}
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-video w-full rounded-lg bg-black/50 overflow-hidden flex items-center justify-center mb-2.5">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.baseName}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition group-hover:scale-105 duration-300"
                    onError={(e) => {
                      if (item.url && e.currentTarget.src !== item.url) {
                        e.currentTarget.src = item.url
                      }
                    }}
                  />
                  {/* Select Checkbox overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-studio-gold border-studio-gold text-black'
                        : 'bg-black/60 border-white/30 text-transparent hover:border-white'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  {/* Folder tag */}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-slate-300 border border-white/10 backdrop-blur-sm">
                    {item.folder}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white truncate" title={item.baseName}>
                      {item.baseName}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                      <span>{formatBytes(item.totalSize)}</span>
                      {item.thumb && item.file && (
                        <span className="text-[10px] text-slate-500">
                          {formatBytes(item.fullSize)} + {formatBytes(item.thumbSize)} thumb
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Usage Badges */}
                  <div className="pt-2 border-t border-white/5">
                    {activeTab === 'trash' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>In Trash</span>
                      </span>
                    ) : item.isUnused ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Unused (safe to trash)</span>
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-slate-400 mr-1 self-center">Used in:</span>
                        {item.usedIn.slice(0, 2).map((use, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 truncate max-w-[150px]"
                            title={use}
                          >
                            {use}
                          </span>
                        ))}
                        {item.usedIn.length > 2 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{item.usedIn.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
