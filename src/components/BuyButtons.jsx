// src/components/BuyButtons.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Tag, Mail, ExternalLink } from 'lucide-react'
import siteData from '../data/site.json'
import { getMarketplaces, getMarketplace } from '../utils/marketplaces'

/**
 * Shared Public Purchase Buttons Component
 * Used on:
 * - Home cards (Home.jsx)
 * - Gallery cards & Lightbox (Gallery.jsx)
 * - Painting detail pages (PaintingDetail.jsx)
 * - Block layouts (GalleryBlock.jsx)
 *
 * Rules:
 * - For Sale with a link of kind original or both: primary button (label from marketplace or override).
 * - Prints or both links: secondary button, e.g. "Prints & more".
 * - For Sale with no links: "Inquire / Buy" to /contact?painting=<id>.
 * - Sold: a "Sold" badge and no original button, but prints links stay.
 * - Not for sale / none: no buy button; prints links still allowed.
 * - Buttons open in new tab with rel="noopener noreferrer".
 * - Show price only when showPrice is on.
 */
export default function BuyButtons({
  painting,
  marketplaces = null,
  compact = false,
  className = ''
}) {
  if (!painting) return null

  const mList = Array.isArray(marketplaces) && marketplaces.length > 0
    ? marketplaces
    : getMarketplaces(siteData)

  const status = painting.status || (painting.sold ? 'Sold' : (painting.badge || ''))
  const isSold = status === 'Sold' || Boolean(painting.sold)
  const isForSale = status === 'For Sale'

  const sale = painting.sale || {}
  const contactOnly = Boolean(sale.contactOnly)
  const showPrice = Boolean(sale.showPrice)
  const price = sale.price !== undefined && sale.price !== null && sale.price !== ''
    ? sale.price
    : (painting.price || null)

  // Links: array of { marketplaceId, kind: 'original' | 'prints' | 'both', label?, url }
  let links = Array.isArray(sale.links) ? sale.links.filter(l => l && l.url) : []

  // Fallback for older items with fineArtAmericaUrl that isn't a profile link
  if (links.length === 0 && painting.fineArtAmericaUrl && !painting.fineArtAmericaUrl.includes('/profiles/')) {
    links = [{
      marketplaceId: 'fineartamerica',
      kind: 'both',
      url: painting.fineArtAmericaUrl
    }]
  }

  // Filter links for Original: (kind === 'original' || kind === 'both') AND not sold
  const originalLinks = isSold ? [] : links.filter(l => l.kind === 'original' || l.kind === 'both')

  // Filter links for Prints: (kind === 'prints' || kind === 'both')
  // Prints links stay even if Sold or Not for sale!
  const printsLinks = links.filter(l => l.kind === 'prints' || (isSold && l.kind === 'both') || (!isForSale && l.kind === 'both'))

  // Formatted price string if showPrice is on
  const priceText = showPrice && price ? (String(price).startsWith('$') ? String(price) : `$${price}`) : null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. Sold Badge */}
      {isSold && (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap">
          Sold
        </span>
      )}

      {/* 2. For Sale with Original / Both Link(s) */}
      {isForSale && !isSold && !contactOnly && originalLinks.length > 0 && (
        originalLinks.map((link, idx) => {
          const mp = getMarketplace(mList, link.marketplaceId)
          const label = link.label || mp.originalLabel || `Buy original on ${mp.name}`
          const displayText = priceText ? `${label} • ${priceText}` : label

          return (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold rounded-xl text-white transition inline-flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 ${
                compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
              }`}
              style={{ backgroundColor: mp.color || '#d4af37' }}
              title={`Purchase original artwork on ${mp.name}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{displayText}</span>
              <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
            </a>
          )
        })
      )}

      {/* 3. For Sale with no links (or contactOnly === true): "Inquire / Buy" to /contact?painting=<id> */}
      {isForSale && !isSold && (contactOnly || originalLinks.length === 0) && (
        <Link
          to={`/contact?painting=${encodeURIComponent(painting.id || painting.videoId || painting.title || '')}`}
          className={`font-semibold rounded-xl bg-studio-gold text-slate-950 hover:bg-studio-gold-light transition inline-flex items-center gap-1.5 shadow-md ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
          }`}
          title="Inquire directly about purchasing this artwork"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>{priceText ? `Inquire / Buy • ${priceText}` : 'Inquire / Buy'}</span>
        </Link>
      )}

      {/* 4. Prints & more secondary button(s) */}
      {printsLinks.length > 0 && (
        printsLinks.map((link, idx) => {
          const mp = getMarketplace(mList, link.marketplaceId)
          const label = link.label || mp.printsLabel || `Prints on ${mp.name}`

          return (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold rounded-xl bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/20 transition inline-flex items-center gap-1.5 ${
                compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm'
              }`}
              title={`Order prints & merchandise on ${mp.name}`}
            >
              <Tag className="w-3.5 h-3.5 text-studio-gold shrink-0" />
              <span>{label}</span>
              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
            </a>
          )
        })
      )}
    </div>
  )
}
