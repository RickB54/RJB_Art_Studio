export const PRICE_LISTS = [
  {
    id: 'product-price-list',
    title: 'Prints & Originals',
    cardTitle: 'Custom Commissioned Paintings',
    label: 'Custom Commissioned Paintings Price List',
    pdf: '/docs/Product-Price-List.pdf',
    preview: '/images/price-lists/product-price-list-preview.webp',
    thumb: '/images/price-lists/product-price-list-thumb.webp',
    alt: 'Prints & Originals Product Price List'
  },
  {
    id: 'prints-price-list',
    title: 'Prints',
    cardTitle: 'High-Quality Prints',
    label: 'High-Quality Prints Price List',
    pdf: '/docs/Prints-Price-List.pdf',
    preview: '/images/price-lists/prints-price-list-preview.webp',
    thumb: '/images/price-lists/prints-price-list-thumb.webp',
    alt: 'High-Quality Prints Price List'
  },
  {
    id: 'painted-portrait-prices',
    title: 'Painted Portraits',
    cardTitle: 'Oil & Acrylic Painted Portraits',
    label: 'Oil & Acrylic Painted Portraits Price List',
    pdf: '/docs/Painted-Portrait-Prices.pdf',
    preview: '/images/price-lists/painted-portrait-prices-preview.webp',
    thumb: '/images/price-lists/painted-portrait-prices-thumb.webp',
    alt: 'Oil & Acrylic Painted Portraits Price List'
  },
  {
    id: 'charcoal-portrait-prices',
    title: 'Charcoal Portraits',
    cardTitle: 'Charcoal & Graphite Portraits',
    label: 'Charcoal & Graphite Portraits Price List',
    pdf: '/docs/Charcoal-Portrait-Prices.pdf',
    preview: '/images/price-lists/charcoal-portrait-prices-preview.webp',
    thumb: '/images/price-lists/charcoal-portrait-prices-thumb.webp',
    alt: 'Charcoal & Graphite Portraits Price List'
  }
]

export const PRICE_LISTS_MAP = Object.fromEntries(
  PRICE_LISTS.map(item => [item.id, item])
)

export const PRICE_LIST_ALIASES = {
  'charcoal-portraits': 'charcoal-portrait-prices',
  'painted-portraits': 'painted-portrait-prices',
  'custom-paintings': 'product-price-list',
  'archival-prints': 'prints-price-list'
}

export function getPriceList(idOrCard) {
  if (!idOrCard) return null
  const id = typeof idOrCard === 'string' ? idOrCard : (idOrCard.priceListId || idOrCard.id)
  const canonicalId = PRICE_LIST_ALIASES[id] || id
  return PRICE_LISTS_MAP[canonicalId] || null
}
