// src/blocks/types/CardsBlock.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import PhotoDropZone from '../../components/PhotoDropZone'
import AdminMediaField from '../../components/AdminMediaField'
import { cleanPhotoUrl, cleanVideoUrl, BlockVideoEmbed } from '../helpers'

export const id = 'cards'
export const label = '🗂 Cards Row'
export const icon = '🗂'

export function defaultData(blockId) {
  return {
    id: blockId,
    type: id,
    visible: true,
    heading: '',
    subtitle: '',
    cards: [
      { title: 'Feature 1', subtitle: '', text: 'Description text.', badge: '', linkUrl: '', linkText: '', visible: true },
      { title: 'Feature 2', subtitle: '', text: 'Description text.', badge: '', linkUrl: '', linkText: '', visible: true }
    ],
    videoUrl: '',
    videoPoster: '',
    aspectRatio: '16:9'
  }
}

export function Component({ block }) {
  const visibleCards = (block.cards || []).filter(c => c && c.visible !== false)
  if (visibleCards.length === 0 && !block.videoUrl) return null

  const gridCols = visibleCards.length === 1
    ? 'max-w-md mx-auto grid-cols-1'
    : visibleCards.length === 2
    ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
    : visibleCards.length === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="space-y-6">
      {(block.heading || block.subtitle) && (
        <div className="text-center space-y-2">
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
        </div>
      )}

      {block.videoUrl && (
        <div className="max-w-4xl mx-auto">
          <BlockVideoEmbed
            url={block.videoUrl}
            poster={block.videoPoster}
            title={block.heading || 'Cards Section Video'}
          />
        </div>
      )}

      <div className={`grid ${gridCols} gap-6`}>
        {visibleCards.map((card, cIdx) => (
          <div
            key={card.id || cIdx}
            className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-studio-magenta/40 transition-all duration-300 group"
          >
            <div className="space-y-3">
              {(card.image || card.photo) && (
                <div className="overflow-hidden rounded-xl border border-white/10 aspect-video bg-black/40">
                  <img
                    src={cleanPhotoUrl(card.image || card.photo)}
                    alt={card.title || 'Card illustration'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}

              {card.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <BlockVideoEmbed
                    url={card.videoUrl}
                    poster={card.videoPoster}
                    title={card.title || 'Card Video'}
                    aspectRatio="16:9"
                  />
                </div>
              )}

              {card.badge && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-studio-magenta/20 text-studio-fuchsia border border-studio-magenta/30">
                  {card.badge}
                </span>
              )}
              {card.subtitle && (
                <span className="text-[11px] uppercase tracking-wider font-semibold text-studio-gold block">
                  {card.subtitle}
                </span>
              )}
              {card.title && (
                <h4 className="font-serif text-lg font-bold text-white group-hover:text-studio-gold transition-colors">
                  {card.title}
                </h4>
              )}
              {card.text && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {card.text}
                </p>
              )}
            </div>

            {card.linkUrl && (
              <div className="pt-4 mt-auto">
                {card.linkUrl.startsWith('http') ? (
                  <a
                    href={card.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-studio-gold hover:text-white transition"
                  >
                    <span>{card.linkText || 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={card.linkUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-studio-gold hover:text-white transition"
                  >
                    <span>{card.linkText || 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Editor({ block, onUpdateField, onUpdateBlock }) {
  const cards = block.cards || []

  const handleUpdateCard = (cardIndex, field, value) => {
    const cardList = [...cards]
    const finalVal = field === 'videoUrl' ? cleanVideoUrl(value) : value
    cardList[cardIndex] = { ...cardList[cardIndex], [field]: finalVal }
    onUpdateBlock({ ...block, cards: cardList })
  }

  const handleAddCard = () => {
    onUpdateBlock({
      ...block,
      cards: [
        ...cards,
        {
          title: 'New Card',
          subtitle: '',
          text: 'Description for this card.',
          badge: '',
          linkUrl: '',
          linkText: '',
          visible: true
        }
      ]
    })
  }

  const handleRemoveCard = (cardIndex) => {
    onUpdateBlock({
      ...block,
      cards: cards.filter((_, i) => i !== cardIndex)
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Heading (Optional)</label>
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

      <div className="pt-2 border-t border-white/5">
        <AdminMediaField
          label="Optional Section Video Above Cards"
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

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-studio-gold uppercase tracking-wider">
            Cards in this Row ({cards.length})
          </label>
          <button
            type="button"
            onClick={handleAddCard}
            className="px-2 py-1 rounded-lg bg-studio-magenta/20 hover:bg-studio-magenta text-white text-[11px] font-medium flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Card</span>
          </button>
        </div>

        {cards.map((card, cIdx) => (
          <div key={card.id || cIdx} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-xs font-bold text-studio-magenta">Card #{cIdx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveCard(cIdx)}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Remove this card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Title</label>
                <input
                  type="text"
                  value={card.title || ''}
                  onChange={e => handleUpdateCard(cIdx, 'title', e.target.value)}
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Subtitle</label>
                <input
                  type="text"
                  value={card.subtitle || ''}
                  onChange={e => handleUpdateCard(cIdx, 'subtitle', e.target.value)}
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Description Text</label>
              <textarea
                rows={2}
                value={card.text || ''}
                onChange={e => handleUpdateCard(cIdx, 'text', e.target.value)}
                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Badge (Optional)</label>
                <input
                  type="text"
                  value={card.badge || ''}
                  onChange={e => handleUpdateCard(cIdx, 'badge', e.target.value)}
                  placeholder="NEW"
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Link URL</label>
                <input
                  type="text"
                  value={card.linkUrl || ''}
                  onChange={e => handleUpdateCard(cIdx, 'linkUrl', e.target.value)}
                  placeholder="/gallery"
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Link Text</label>
                <input
                  type="text"
                  value={card.linkText || ''}
                  onChange={e => handleUpdateCard(cIdx, 'linkText', e.target.value)}
                  placeholder="Learn More"
                  className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <label className="block text-[10px] text-slate-400">Card Photo (Optional)</label>
              <PhotoDropZone
                currentUrl={card.image || card.photo || ''}
                onUploadComplete={url => handleUpdateCard(cIdx, 'image', url)}
              />
            </div>

            <div className="pt-2 border-t border-white/5">
              <AdminMediaField
                label="Optional Video on this Card"
                url={card.videoUrl || ''}
                poster={card.videoPoster || ''}
                aspectRatio="16:9"
                onUrlChange={val => handleUpdateCard(cIdx, 'videoUrl', cleanVideoUrl(val))}
                onPosterChange={val => handleUpdateCard(cIdx, 'videoPoster', val)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
