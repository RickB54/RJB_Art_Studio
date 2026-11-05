// src/blocks/pageSlots.js
// Single source of truth for custom block slots on every page.

export const HOME_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page (Above Hero)' },
  { id: 'after_hero', label: 'After Hero Section' },
  { id: 'after_featured', label: 'After Featured Artworks' },
  { id: 'after_teaser', label: 'After About Rick Teaser' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const ABOUT_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header / Bio' },
  { id: 'after_journey', label: 'After Artistic Journey' },
  { id: 'after_awards', label: 'After Awards & Recognitions' },
  { id: 'after_studio', label: 'After Studio Tour & Process' },
  { id: 'after_cta', label: 'After Inquiries & Commissions Banner' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const COMMISSIONS_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'after_cards', label: 'After Service Cards' },
  { id: 'after_watercolor', label: 'After Watercolor Notice' },
  { id: 'after_process', label: 'After 4-Step Process' },
  { id: 'after_pricing_notice', label: 'After Pricing Notice' },
  { id: 'after_form', label: 'After Request Form' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const GALLERY_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_filters', label: 'After Search & Filters' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const VIDEOS_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const CONTACT_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'after_form', label: 'After Form & Channels' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const MEMORIAL_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page (Above Hero Video)' },
  { id: 'after_video', label: 'After Hero Video' },
  { id: 'after_dedication', label: 'After Dedication / Quote' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export const PAGE_SLOTS = {
  home: HOME_BLOCK_SLOTS,
  about: ABOUT_BLOCK_SLOTS,
  commissions: COMMISSIONS_BLOCK_SLOTS,
  gallery: GALLERY_BLOCK_SLOTS,
  videos: VIDEOS_BLOCK_SLOTS,
  contact: CONTACT_BLOCK_SLOTS,
  memorial: MEMORIAL_BLOCK_SLOTS,
}

export const PAGE_BUILTIN_SECTIONS = {
  home: [
    { id: 'hero', label: 'Hero & Studio Highlights' },
    { id: 'featured', label: 'Featured Artworks Showcase' },
    { id: 'teaser', label: 'About Rick Teaser' },
    { id: 'artShows', label: 'Art Shows & Appearances' },
  ],
  about: [
    { id: 'header', label: 'Page Header & Badge' },
    { id: 'journey', label: 'Artistic Journey Card' },
    { id: 'awards', label: 'Awards & Recognition' },
    { id: 'studio', label: 'Studio Story & Video Cards' },
    { id: 'cta', label: 'Inquiries & Commissions Banner' },
  ],
  commissions: [
    { id: 'header', label: 'Page Header & Intro' },
    { id: 'cards', label: 'Service Cards & Price Lists' },
    { id: 'watercolor', label: 'Watercolor Notice' },
    { id: 'process', label: '4-Step Commission Process' },
    { id: 'pricing', label: 'Pricing Policy Notice' },
    { id: 'form', label: 'Commission Request Form' },
  ],
  gallery: [
    { id: 'header', label: 'Page Header' },
    { id: 'filters', label: 'Search & Category Filters' },
    { id: 'grid', label: 'Artworks Gallery Grid' },
  ],
  videos: [
    { id: 'header', label: 'Page Header' },
    { id: 'banner', label: 'YouTube Channel Banner' },
    { id: 'grid', label: 'Playlists Grid' },
  ],
  contact: [
    { id: 'header', label: 'Page Header' },
    { id: 'channels', label: 'Direct Email & Channels' },
    { id: 'form', label: 'Contact Form' },
  ],
  memorial: [
    { id: 'header', label: 'Memorial Header & Dedication' },
    { id: 'heroVideo', label: 'Memorial Hero Video' },
  ],
}

export function getPageSlots(pageKey) {
  return PAGE_SLOTS[pageKey] || []
}

export const PAGE_OUTLINE_SCHEMAS = {
  home: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'hero', label: 'Hero & Studio Highlights', visibilityKey: 'heroVisible' },
    { kind: 'slot', id: 'after_hero', label: 'After Hero Section' },
    { kind: 'section', id: 'featured', label: 'Featured Artworks Showcase', visibilityKey: 'featuredVisible' },
    { kind: 'slot', id: 'after_featured', label: 'After Featured Artworks' },
    { kind: 'section', id: 'teaser', label: 'About Rick Teaser', visibilityKey: 'teaserVisible' },
    { kind: 'slot', id: 'after_teaser', label: 'After About Rick Teaser' },
    { kind: 'section', id: 'artShows', label: 'Art Shows & Appearances', visibilityKey: 'artShowsVisible' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  about: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Page Header & Badge', visibilityKey: 'headerVisible' },
    { kind: 'slot', id: 'after_header', label: 'After Header / Bio' },
    { kind: 'section', id: 'journey', label: 'Artistic Journey Card', visibilityKey: 'journeyVisible' },
    { kind: 'slot', id: 'after_journey', label: 'After Artistic Journey' },
    { kind: 'section', id: 'awards', label: 'Awards & Recognition', visibilityKey: 'awardsVisible' },
    { kind: 'slot', id: 'after_awards', label: 'After Awards & Recognitions' },
    { kind: 'section', id: 'studio', label: 'Studio Story & Video Cards', visibilityKey: 'studioVisible' },
    { kind: 'slot', id: 'after_studio', label: 'After Studio Tour & Process' },
    { kind: 'section', id: 'cta', label: 'Inquiries & Commissions Banner', visibilityKey: 'ctaVisible' },
    { kind: 'slot', id: 'after_cta', label: 'After Inquiries & Commissions Banner' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  commissions: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Page Header & Intro', visibilityKey: 'heroVisible' },
    { kind: 'slot', id: 'after_header', label: 'After Header' },
    { kind: 'section', id: 'cards', label: 'Service Cards & Price Lists', visibilityKey: 'cardsVisible' },
    { kind: 'slot', id: 'after_cards', label: 'After Service Cards' },
    { kind: 'section', id: 'watercolor', label: 'Watercolor Notice', visibilityKey: 'watercolorNoticeVisible' },
    { kind: 'slot', id: 'after_watercolor', label: 'After Watercolor Notice' },
    { kind: 'section', id: 'process', label: '4-Step Commission Process', visibilityKey: 'processVisible' },
    { kind: 'slot', id: 'after_process', label: 'After 4-Step Process' },
    { kind: 'section', id: 'pricing', label: 'Pricing Policy Notice', visibilityKey: 'pricingPolicyVisible' },
    { kind: 'slot', id: 'after_pricing_notice', label: 'After Pricing Notice' },
    { kind: 'section', id: 'form', label: 'Commission Request Form', visibilityKey: 'formVisible' },
    { kind: 'slot', id: 'after_form', label: 'After Request Form' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  gallery: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Page Header', visibilityKey: 'headerVisible' },
    { kind: 'section', id: 'filters', label: 'Search & Category Filters', visibilityKey: 'filtersVisible' },
    { kind: 'slot', id: 'after_filters', label: 'After Search & Filters' },
    { kind: 'section', id: 'grid', label: 'Artworks Gallery Grid', visibilityKey: 'gridVisible' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  videos: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Page Header', visibilityKey: 'headerVisible' },
    { kind: 'slot', id: 'after_header', label: 'After Header' },
    { kind: 'section', id: 'banner', label: 'YouTube Channel Banner', visibilityKey: 'bannerVisible' },
    { kind: 'section', id: 'grid', label: 'Playlists Grid', visibilityKey: 'gridVisible' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  contact: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Page Header', visibilityKey: 'headerVisible' },
    { kind: 'slot', id: 'after_header', label: 'After Header' },
    { kind: 'section', id: 'channels', label: 'Direct Email & Channels', visibilityKey: 'channelsVisible' },
    { kind: 'section', id: 'form', label: 'Contact Form', visibilityKey: 'formVisible' },
    { kind: 'slot', id: 'after_form', label: 'After Form & Channels' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
  memorial: [
    { kind: 'slot', id: 'top', label: 'Top of Page' },
    { kind: 'section', id: 'header', label: 'Memorial Header & Dedication', visibilityKey: 'headerVisible' },
    { kind: 'section', id: 'heroVideo', label: 'Memorial Hero Video', visibilityKey: 'heroVideoVisible' },
    { kind: 'slot', id: 'after_video', label: 'After Hero Video' },
    { kind: 'slot', id: 'after_dedication', label: 'After Dedication / Quote' },
    { kind: 'slot', id: 'bottom', label: 'Bottom of Page' },
  ],
}

export function getPageBuiltinSections(pageKey) {
  return PAGE_BUILTIN_SECTIONS[pageKey] || []
}

export function getPageOutlineSchema(pageKey) {
  return PAGE_OUTLINE_SCHEMAS[pageKey] || []
}


