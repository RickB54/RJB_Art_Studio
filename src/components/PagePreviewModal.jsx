// src/components/PagePreviewModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ExternalLink,
  X,
  Eye,
  FileEdit,
  CheckCircle2
} from 'lucide-react'

const PAGE_ROUTES = {
  home: '/',
  about: '/about',
  commissions: '/commissions',
  gallery: '/gallery',
  videos: '/videos',
  contact: '/contact',
  memorial: '/memorial'
}

const PAGE_NAMES = {
  home: 'Home Page',
  about: 'About Page',
  commissions: 'Commissions Page',
  gallery: 'Gallery Page',
  videos: 'Videos Page',
  contact: 'Contact Page',
  memorial: 'Memorial Page'
}

export default function PagePreviewModal({
  isOpen,
  onClose,
  pageKey = 'home',
  pagesData = {},
  hasUnsaved = false
}) {
  const [device, setDevice] = useState('desktop') // 'phone' | 'tablet' | 'desktop'
  const [mode, setMode] = useState('draft') // 'draft' | 'saved'
  const [refreshKey, setRefreshKey] = useState(Date.now())
  const [isSyncing, setIsSyncing] = useState(false)
  const debounceTimerRef = useRef(null)

  const route = PAGE_ROUTES[pageKey] || '/'
  const pageTitle = PAGE_NAMES[pageKey] || 'Page'

  // Push draft to dev API
  const syncDraftToServer = async (dataToSync) => {
    try {
      setIsSyncing(true)
      await fetch('/__api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: dataToSync })
      })
      setRefreshKey(Date.now())
    } catch (e) {
      console.warn('Failed to sync draft:', e)
    } finally {
      setIsSyncing(false)
    }
  }

  // Initial sync when opening draft mode
  useEffect(() => {
    if (isOpen && mode === 'draft') {
      syncDraftToServer(pagesData)
    }
  }, [isOpen, mode])

  // Auto-refresh 1s after editing changes
  useEffect(() => {
    if (!isOpen || mode !== 'draft') return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      syncDraftToServer(pagesData)
    }, 1000)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [pagesData, isOpen, mode])

  // Close handler: delete draft on close/cancel
  const handleClose = () => {
    fetch('/__api/draft', { method: 'DELETE' }).catch(() => {})
    onClose()
  }

  // Manual refresh button handler
  const handleManualRefresh = () => {
    if (mode === 'draft') {
      syncDraftToServer(pagesData)
    } else {
      setRefreshKey(Date.now())
    }
  }

  if (!isOpen) return null

  const iframeSrc = `${route}?preview=${mode === 'draft' ? 'draft' : 'saved'}&_key=${refreshKey}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-fade-in">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 bg-[#0d0b14]/90">
        {/* Page Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-serif font-bold text-white text-base sm:text-lg truncate flex items-center gap-2">
            <span className="text-studio-gold">Preview:</span>
            <span>{pageTitle}</span>
          </span>
          {isSyncing && (
            <span className="text-[11px] text-studio-gold flex items-center gap-1 animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>Syncing draft...</span>
            </span>
          )}
        </div>

        {/* Center Controls: Mode Toggle & Device Width */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Draft vs Saved Mode */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode('draft')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                mode === 'draft'
                  ? 'bg-studio-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Preview unsaved changes live as you edit"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unsaved Draft</span>
              <span className="sm:hidden">Draft</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('saved')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                mode === 'saved'
                  ? 'bg-studio-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Preview currently saved version"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved Version</span>
              <span className="sm:hidden">Saved</span>
            </button>
          </div>

          {/* Device Toggles */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setDevice('phone')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition ${
                device === 'phone'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Phone View (390px)"
            >
              <Smartphone className="w-4 h-4 text-studio-gold" />
              <span className="hidden md:inline">Phone</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition ${
                device === 'tablet'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4 text-studio-gold" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition ${
                device === 'desktop'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-4 h-4 text-studio-gold" />
              <span className="hidden md:inline">Desktop</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Refresh, Open in Tab, Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Refresh preview"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition hidden sm:inline-flex"
            title="Open in new window/tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* Preview Viewport */}
      <div className="flex-grow overflow-auto p-4 flex items-center justify-center bg-black/60">
        <div
          className={`h-full transition-all duration-300 flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/15 relative ${
            device === 'phone'
              ? 'w-[390px] max-w-full'
              : device === 'tablet'
              ? 'w-[768px] max-w-full'
              : 'w-full'
          }`}
        >
          {/* Simulated Device Header (Phone / Tablet) */}
          {device !== 'desktop' && (
            <div className="h-6 bg-slate-950/80 border-b border-white/10 flex items-center justify-between px-4 text-[10px] text-slate-400 select-none">
              <span>9:41</span>
              <div className="w-16 h-2.5 bg-black rounded-full" />
              <span>100%</span>
            </div>
          )}

          {/* Iframe displaying the preview */}
          <iframe
            key={`${refreshKey}-${mode}`}
            src={iframeSrc}
            title={`${pageTitle} Preview`}
            className="w-full flex-grow border-0 bg-slate-950"
          />
        </div>
      </div>
    </div>
  )
}
