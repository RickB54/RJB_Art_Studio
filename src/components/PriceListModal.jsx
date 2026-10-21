import React, { useEffect, useRef, useState } from 'react'
import { X, Maximize2, Minimize2, Download, Printer } from 'lucide-react'

export default function PriceListModal({ item, onClose }) {
  const modalRef = useRef(null)
  const iframeRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!item) return

    // Focus trap & escape key handler
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          last.focus()
          e.preventDefault()
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }

    const prevActive = document.activeElement
    window.addEventListener('keydown', handleKeyDown)
    modalRef.current?.focus()

    // Prevent body scroll
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.body.style.overflow = origOverflow
      prevActive?.focus?.()
    }
  }, [item, onClose])

  if (!item) return null

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  const handlePrint = () => {
    try {
      if (iframeRef.current) {
        iframeRef.current.src = item.pdf
        iframeRef.current.onload = () => {
          try {
            iframeRef.current.contentWindow?.focus()
            iframeRef.current.contentWindow?.print()
          } catch {
            window.open(item.pdf, '_blank')
          }
        }
      } else {
        window.open(item.pdf, '_blank')
      }
    } catch {
      window.open(item.pdf, '_blank')
    }
  }

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Price List Viewer'}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md text-white select-none focus:outline-none"
    >
      {/* Hidden iframe for PDF printing */}
      <iframe
        ref={iframeRef}
        title="Print Document"
        className="hidden"
        style={{ position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 0 }}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-studio-surface/90 shrink-0">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
            {item.title} — Official Price List
          </h3>
          <p className="text-[11px] text-studio-gold">Rick J Berube Art Studio • Source of Truth</p>
        </div>

        {/* 3 Main Action Buttons + Close */}
        <div className="flex items-center gap-2">
          {/* 1. Full Screen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 hover:text-white transition flex items-center gap-1.5"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>

          {/* 2. Download (PDF) */}
          <a
            href={item.pdf}
            download
            className="px-3 py-1.5 rounded-lg bg-studio-gold text-black hover:bg-studio-gold-light text-xs font-semibold transition flex items-center gap-1.5 shadow"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </a>

          {/* 3. Print (Hidden iframe / new tab fallback) */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 hover:text-white transition flex items-center gap-1.5"
            title="Print Price List"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-white transition ml-2"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container with touch pinch-zoom support */}
      <div
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center"
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <img
          src={item.preview}
          alt={item.alt || item.title}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
        />
      </div>
    </div>
  )
}
