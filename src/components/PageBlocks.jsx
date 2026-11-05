// src/components/PageBlocks.jsx
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import MediaEmbed, { normalizeMediaUrl } from './MediaEmbed'
import { cleanPhotoUrl, cleanVideoUrl, parseVideoEmbed, BlockVideoEmbed } from '../blocks/helpers'
import { getBlockDefinition } from '../blocks/registry'
import BlockWrap from '../blocks/BlockWrap'

export { MediaEmbed, normalizeMediaUrl, cleanPhotoUrl, cleanVideoUrl, parseVideoEmbed, BlockVideoEmbed }

export default function PageBlocks({ blocks }) {
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    if (!lightboxImg) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxImg(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxImg])

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <div className="space-y-12">
      {blocks.filter(b => b && b.visible !== false).map((block, idx) => {
        const key = block.id || `block-${idx}`
        const def = getBlockDefinition(block.type)

        if (!def || !def.Component) {
          return null
        }

        const BlockComp = def.Component
        return (
          <div key={key}>
            <BlockWrap block={block}>
              <BlockComp
                block={block}
                onOpenLightbox={setLightboxImg}
              />
            </BlockWrap>
          </div>
        )
      })}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            onClick={() => setLightboxImg(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.caption || 'Enlarged photo'}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            {lightboxImg.caption && (
              <p className="text-sm text-slate-300 mt-3 text-center italic">{lightboxImg.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
