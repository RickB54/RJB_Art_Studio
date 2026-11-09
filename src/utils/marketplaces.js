/**
 * Marketplace definitions, auto-detection from domains, and artwork URL validation.
 */

export const DEFAULT_MARKETPLACES = [
  {
    id: 'fineartamerica',
    name: 'Fine Art America',
    domains: ['fineartamerica.com', 'pixels.com'],
    originalLabel: 'Buy original on Fine Art America',
    printsLabel: 'Prints on Fine Art America',
    otherLabel: 'Buy on Fine Art America',
    color: '#e05a47'
  },
  {
    id: 'etsy',
    name: 'Etsy',
    domains: ['etsy.com'],
    originalLabel: 'Buy original on Etsy',
    printsLabel: 'Prints on Etsy',
    otherLabel: 'Buy on Etsy',
    color: '#f1641e'
  },
  {
    id: 'saatchiart',
    name: 'Saatchi Art',
    domains: ['saatchiart.com'],
    originalLabel: 'Buy original on Saatchi Art',
    printsLabel: 'Prints on Saatchi Art',
    otherLabel: 'Buy on Saatchi Art',
    color: '#1f7a8c'
  },
  {
    id: 'artpal',
    name: 'ArtPal',
    domains: ['artpal.com'],
    originalLabel: 'Buy original on ArtPal',
    printsLabel: 'Prints on ArtPal',
    otherLabel: 'Buy on ArtPal',
    color: '#2a9d8f'
  },
  {
    id: 'ebay',
    name: 'eBay',
    domains: ['ebay.com'],
    originalLabel: 'Buy original on eBay',
    printsLabel: 'Prints on eBay',
    otherLabel: 'Buy on eBay',
    color: '#0064d2'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    domains: ['facebook.com'],
    originalLabel: 'View on Facebook',
    printsLabel: 'Prints on Facebook',
    otherLabel: 'View on Facebook',
    color: '#1877f2'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    domains: ['paypal.com', 'paypal.me'],
    originalLabel: 'Buy with PayPal',
    printsLabel: 'Pay with PayPal',
    otherLabel: 'Pay with PayPal',
    color: '#003087'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    domains: ['buy.stripe.com', 'stripe.com'],
    originalLabel: 'Buy with Card (Stripe)',
    printsLabel: 'Pay with Stripe',
    otherLabel: 'Pay with Stripe',
    color: '#635bff'
  },
  {
    id: 'other',
    name: 'Other',
    domains: [],
    originalLabel: 'Buy original',
    printsLabel: 'Prints & more',
    otherLabel: 'Buy online',
    color: '#d4af37'
  }
]

/**
 * Returns marketplaces from site object with fallback to DEFAULT_MARKETPLACES
 */
export function getMarketplaces(site) {
  if (site && Array.isArray(site.marketplaces) && site.marketplaces.length > 0) {
    return site.marketplaces
  }
  return DEFAULT_MARKETPLACES
}

/**
 * Finds a marketplace by id
 */
export function getMarketplace(marketplaces, id) {
  const list = Array.isArray(marketplaces) && marketplaces.length > 0 ? marketplaces : DEFAULT_MARKETPLACES
  const found = list.find(m => m.id === id)
  if (found) return found
  return list.find(m => m.id === 'other') || DEFAULT_MARKETPLACES[DEFAULT_MARKETPLACES.length - 1]
}

/**
 * Auto-detect marketplace from a pasted URL's hostname.
 */
export function detectMarketplace(url, marketplaces) {
  if (!url || typeof url !== 'string') return 'other'
  try {
    const raw = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    const parsed = new URL(raw)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    const list = Array.isArray(marketplaces) && marketplaces.length > 0 ? marketplaces : DEFAULT_MARKETPLACES

    for (const m of list) {
      if (Array.isArray(m.domains)) {
        for (const dom of m.domains) {
          const d = dom.toLowerCase().replace(/^www\./, '')
          if (hostname === d || hostname.endsWith(`.${d}`)) {
            return m.id
          }
        }
      }
    }
  } catch (_) {}
  return 'other'
}

/**
 * Validates an artwork URL.
 * Refuses profile, storefront, and search addresses.
 * Requires https://.
 */
export function validateArtworkUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { valid: false, error: 'URL is required.' }
  }
  const trimmed = url.trim()

  if (!trimmed.startsWith('https://')) {
    return {
      valid: false,
      error: 'URL must start with https:// for security.'
    }
  }

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch (_) {
    return { valid: false, error: 'Please enter a valid web address (https://...).' }
  }

  const host = parsed.hostname.toLowerCase()
  const path = parsed.pathname.toLowerCase()
  const search = parsed.search.toLowerCase()

  // Fine Art America / Pixels profile or artists page
  if (host.includes('fineartamerica.com') || host.includes('pixels.com')) {
    if (path.startsWith('/profiles/') || path.startsWith('/artists/')) {
      return {
        valid: false,
        error: 'This is an artist profile link. Please paste the direct link to this specific artwork (e.g. fineartamerica.com/featured/your-painting.html).'
      }
    }
  }

  // Etsy shop/storefront
  if (host.includes('etsy.com')) {
    if (path.startsWith('/shop/') && !path.includes('/listing/')) {
      return {
        valid: false,
        error: 'This is a storefront link. Please paste the direct listing URL for this artwork (e.g. etsy.com/listing/...).'
      }
    }
  }

  // Generic Search pages
  if (path.includes('/search') || search.includes('search=') || search.includes('query=') || search.includes('q=')) {
    return {
      valid: false,
      error: 'This is a search results page. Please paste the link directly to this specific artwork.'
    }
  }

  return { valid: true }
}
