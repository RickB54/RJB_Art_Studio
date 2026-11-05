// src/blocks/types/ImageTextBlock.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'
import PhotoDropZone from '../../components/PhotoDropZone'
import AdminMediaField from '../../components/AdminMediaField'
import MediaEmbed from '../../components/MediaEmbed'
import { cleanPhotoUrl, cleanVideoUrl, BlockVideoEmbed } from '../helpers'

export const id = 'image-text'
export const label = '🖼 Image + Text'
export const icon = '🖼'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    heading: 'Section Title',
    subtitle: '',
    text: 'Enter description here.',
    images: [],
    image: '',
    imageAlt: '',
    imagePosition: 'left',
    linkUrl: '',
    linkText: '',
    mediaType: 'photo',
    videoUrl: '',
    videoPoster: '',
    aspectRatio: '16:9'
  }
}

export function getImageTextPhotos(b) {
  if (Array.isArray(b?.images) && b.images.length > 0) {
    return b.images
  }
  if (b?.image) {
    return [{
      id: b.id ? `${b.id}-it-1` : 'it-1',
      url: b.image,
      alt: b.imageAlt || '',
      caption: ''
    }]
  }
  return []
}

export function Component({ block, onOpenLightbox }) {
  const isRight = block.imagePosition === 'right'
  const itImages = (Array.isArray(block.images) && block.images.length > 0)
    ? block.images.filter(img => img && img.url)
    : (block.image ? [{ id: 'it-1', url: block.image, caption: block.imageAlt || '' }] : [])

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isRight ? 'md:grid-flow-dense' : ''}`}>
        {(block.mediaType === 'video' ? block.videoUrl : (itImages.length > 0 || block.videoUrl)) && (
          <div className={`space-y-3 ${isRight ? 'md:col-start-2' : ''}`}>
            {block.mediaType === 'video' ? (
              <MediaEmbed
                url={block.videoUrl}
                poster={block.videoPoster}
                aspectRatio={block.aspectRatio || '16:9'}
                title={block.heading || 'Section Video'}
                fallbackLinkText={block.fallbackLinkText}
                hideFallbackLink={block.hideFallbackLink}
              />
            ) : (
              <>
                {itImages.length === 1 && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl">
                    <img
                      src={cleanPhotoUrl(itImages[0].url)}
                      alt={itImages[0].caption || itImages[0].alt || block.imageAlt || block.heading || 'Custom Section Image'}
                      className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      onClick={() => onOpenLightbox && onOpenLightbox({ url: cleanPhotoUrl(itImages[0].url), caption: itImages[0].caption || itImages[0].alt || block.heading })}
                      loading="lazy"
                    />
                    {itImages[0].caption && (
                      <p className="p-2 text-xs text-slate-400 italic bg-black/40 text-center">{itImages[0].caption}</p>
                    )}
                  </div>
                )}
                {itImages.length > 1 && (
                  <div className={`grid ${itImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-3`}>
                    {itImages.map((img, i) => {
                      const imgUrl = cleanPhotoUrl(img.url)
                      return (
                        <div
                          key={img.id || i}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-md group cursor-zoom-in relative"
                          onClick={() => onOpenLightbox && onOpenLightbox({ url: imgUrl, caption: img.caption || img.alt || block.heading })}
                        >
                          <img
                            src={imgUrl}
                            alt={img.caption || img.alt || `${block.heading || 'Section'} photo ${i + 1}`}
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {img.caption && (
                            <p className="p-1.5 text-[11px] text-slate-300 italic truncate bg-black/60 text-center">{img.caption}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {block.videoUrl && (
                  <div className="pt-1">
                    <BlockVideoEmbed
                      url={block.videoUrl}
                      poster={block.videoPoster}
                      title={block.heading || 'Section Video'}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className={`space-y-4 ${isRight ? 'md:col-start-1' : ''}`}>
          {block.subtitle && (
            <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta block">
              {block.subtitle}
            </span>
          )}
          {block.heading && (
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {block.heading}
            </h3>
          )}
          {block.text && (
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {block.text}
            </div>
          )}
          {block.linkUrl && (
            <div className="pt-2">
              <Link
                to={block.linkUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-studio-magenta text-white transition duration-300 shadow-sm"
              >
                <span>{block.linkText || 'Learn More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Editor({ block, onUpdateField, onUpdateBlock }) {
  const itPhotos = getImageTextPhotos(block)

  const handleUpdateImageTextPhotos = (newPhotos) => {
    const first = newPhotos[0]
    onUpdateBlock({
      ...block,
      images: newPhotos,
      image: first ? first.url : '',
      imageAlt: first ? (first.alt || '') : ''
    })
  }

  const handleAddImageTextPhoto = (photoData = {}) => {
    const newId = `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    handleUpdateImageTextPhotos([...itPhotos, { id: newId, url: photoData.url || '', alt: photoData.alt || '', caption: '' }])
  }

  const handleRemoveImageTextPhoto = (pIdx) => {
    handleUpdateImageTextPhotos(itPhotos.filter((_, i) => i !== pIdx))
  }

  const handleUpdatePhotoField = (pIdx, field, val) => {
    const updated = [...itPhotos]
    if (!updated[pIdx]) return
    updated[pIdx] = { ...updated[pIdx], [field]: val }
    handleUpdateImageTextPhotos(updated)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Heading</label>
          <input
            type="text"
            value={block.heading || ''}
            onChange={e => onUpdateField('heading', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
          <input
            type="text"
            value={block.subtitle || ''}
            onChange={e => onUpdateField('subtitle', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-300 mb-1">Description Text</label>
        <textarea
          rows={3}
          value={block.text || ''}
          onChange={e => onUpdateField('text', e.target.value)}
          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white resize-y font-mono"
        />
      </div>

      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <label className="block text-[11px] font-medium text-slate-300">Media Column Type</label>
        <div className="flex items-center gap-1 bg-[#13111c] border border-white/10 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onUpdateField('mediaType', 'photo')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              (block.mediaType || 'photo') === 'photo'
                ? 'bg-studio-magenta text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📷 Photo(s)
          </button>
          <button
            type="button"
            onClick={() => onUpdateField('mediaType', 'video')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              block.mediaType === 'video'
                ? 'bg-studio-magenta text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🎬 Video Only
          </button>
        </div>
      </div>

      {(block.mediaType || 'photo') === 'photo' ? (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white">
              Photos in this Section ({itPhotos.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Multiple photos appear in a tidy side-by-side / grid column
            </span>
          </div>

          {itPhotos.map((p, pIdx) => (
            <div key={p.id || pIdx} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-studio-gold">Photo #{pIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImageTextPhoto(pIdx)}
                  className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                  title="Remove this photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-5">
                  <PhotoDropZone
                    currentUrl={p.url || ''}
                    onUploadComplete={url => handleUpdatePhotoField(pIdx, 'url', url)}
                  />
                </div>
                <div className="sm:col-span-7 space-y-2">
                  <input
                    type="text"
                    value={p.url || ''}
                    onChange={e => handleUpdatePhotoField(pIdx, 'url', e.target.value)}
                    placeholder="Image URL"
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={p.caption || p.alt || ''}
                    onChange={e => handleUpdatePhotoField(pIdx, 'caption', e.target.value)}
                    placeholder="Caption or description"
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="p-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.01]">
            <PhotoDropZone
              label="Drop an image here to add another photo"
              onUploadComplete={url => handleAddImageTextPhoto({ url })}
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <AdminMediaField
              label="Optional Video Below Photos"
              url={block.videoUrl || ''}
              poster={block.videoPoster || ''}
              aspectRatio={block.aspectRatio || '16:9'}
              fallbackLinkText={block.fallbackLinkText || ''}
              hideFallbackLink={block.hideFallbackLink || false}
              onUrlChange={val => onUpdateField('videoUrl', cleanVideoUrl(val))}
              onPosterChange={val => onUpdateField('videoPoster', val)}
              onAspectRatioChange={val => onUpdateField('aspectRatio', val)}
              onFallbackLinkTextChange={val => onUpdateField('fallbackLinkText', val)}
              onHideFallbackLinkChange={val => onUpdateField('hideFallbackLink', val)}
            />
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <AdminMediaField
            label="Video URL (YouTube, Vimeo, Google Drive, MP4, etc.)"
            url={block.videoUrl || ''}
            poster={block.videoPoster || ''}
            aspectRatio={block.aspectRatio || '16:9'}
            fallbackLinkText={block.fallbackLinkText || ''}
            hideFallbackLink={block.hideFallbackLink || false}
            onUrlChange={val => onUpdateField('videoUrl', cleanVideoUrl(val))}
            onPosterChange={val => onUpdateField('videoPoster', val)}
            onAspectRatioChange={val => onUpdateField('aspectRatio', val)}
            onFallbackLinkTextChange={val => onUpdateField('fallbackLinkText', val)}
            onHideFallbackLinkChange={val => onUpdateField('hideFallbackLink', val)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Image / Media Position</label>
          <select
            value={block.imagePosition || 'left'}
            onChange={e => onUpdateField('imagePosition', e.target.value)}
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            <option value="left">Left (Text on Right)</option>
            <option value="right">Right (Text on Left)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Button / Link URL</label>
          <input
            type="text"
            value={block.linkUrl || ''}
            onChange={e => onUpdateField('linkUrl', e.target.value)}
            placeholder="/gallery or https://..."
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Button Text</label>
          <input
            type="text"
            value={block.linkText || ''}
            onChange={e => onUpdateField('linkText', e.target.value)}
            placeholder="Learn More"
            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>
    </div>
  )
}
