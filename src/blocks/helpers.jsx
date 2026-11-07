// src/blocks/helpers.jsx
import React from 'react'
import MediaEmbed, { normalizeMediaUrl } from '../components/MediaEmbed'

export function cleanPhotoUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const t = raw.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
  return '/' + t.replace(/^(\.\/)?(public\/)?/, '').replace(/^\/+/, '')
}

export function cleanVideoUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let t = raw.trim()
  if (!t) return ''
  // Extract URL from iframe, object, or data-link snippets
  const snippetMatch = t.match(/(?:src|data)=["']([^"']+)["']/i)
  if (snippetMatch) {
    t = snippetMatch[1].trim()
  } else {
    const dlMatch = t.match(/data-link=["']([^"']+)["']/i)
    if (dlMatch) {
      t = `https://www.publicalbum.org/carousel/embed?url=${encodeURIComponent(dlMatch[1].trim())}`
    }
  }
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
  // Normalize Windows backslashes
  t = t.replace(/\\/g, '/')
  // If user pasted a local file path containing 'public/'
  const publicIdx = t.toLowerCase().lastIndexOf('/public/')
  if (publicIdx !== -1) {
    return t.substring(publicIdx + '/public'.length)
  }
  if (t.toLowerCase().startsWith('public/')) {
    return '/' + t.substring('public/'.length)
  }
  // If it's an absolute path with drive letter like C:/...
  if (/^[a-zA-Z]:\//.test(t)) {
    const filename = t.substring(t.lastIndexOf('/') + 1)
    return '/' + filename
  }
  if (!t.startsWith('/')) {
    return '/' + t
  }
  return t
}

export function parseVideoEmbed(url) {
  return normalizeMediaUrl(url)
}

export function BlockVideoEmbed({
  url,
  poster,
  title = 'Video',
  aspectRatio = '16:9',
  height,
  fallbackLinkText,
  hideFallbackLink = false,
  className = ''
}) {
  return (
    <MediaEmbed
      url={url}
      poster={poster}
      title={title}
      aspectRatio={aspectRatio}
      height={height}
      fallbackLinkText={fallbackLinkText}
      hideFallbackLink={hideFallbackLink}
      className={className}
    />
  )
}

/**
 * Extract all locally-stored photo URLs (/images/...) from a block.
 * Returns an array of URL strings (full-size only, no thumbs).
 * Works with gallery (items[].url), photo (images[].url or image),
 * and image-text (images[].url or image) block types.
 */
export function getBlockLocalPhotos(block) {
  if (!block) return []
  const LOCAL_RE = /^\/images\//
  const urls = new Set()

  const addUrl = (u) => {
    if (u && typeof u === 'string' && LOCAL_RE.test(u) && !u.includes('-thumb.')) {
      urls.add(u)
    }
  }

  // gallery block: block.items[].url
  if (Array.isArray(block.items)) {
    block.items.forEach(item => {
      if (item && item.type !== 'video') addUrl(item.url)
    })
  }
  // photo block: block.images[].url or block.image
  if (Array.isArray(block.images)) {
    block.images.forEach(img => addUrl(img?.url))
  }
  if (block.image) addUrl(block.image)

  // image-text block: block.images[].url or block.image
  // (same fields handled above)

  return Array.from(urls)
}

