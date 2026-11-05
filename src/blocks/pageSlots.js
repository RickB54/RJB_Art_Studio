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

export function getPageBuiltinSections(pageKey) {
  return PAGE_BUILTIN_SECTIONS[pageKey] || []
}

