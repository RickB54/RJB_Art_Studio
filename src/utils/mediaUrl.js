/**
 * src/utils/mediaUrl.js
 * Pure JS helper to normalize and detect any video, form, document, or audio/video embed URL.
 * Works seamlessly in both Vite/browser and Node.js environments.
 */

/**
 * Normalizes any video or embed URL into a unified embed descriptor.
 * Supports:
 * - Google Drive: /file/d/ID/view, /edit, /preview, open?id=ID, uc?id=ID -> /preview
 * - YouTube: watch?v=, youtu.be/, shorts/, embed/ -> youtube-nocookie
 * - Vimeo: vimeo.com/ID -> player.vimeo.com/video/ID
 * - Google Forms / Docs / Slides -> keeps or appends embedded=true
 * - Direct video files: .mp4, .webm, .ogv, .mov, .m4v
 * - Generic: any other URL loaded via iframe
 *
 * @param {string} raw - Raw input URL or iframe embed code
 * @returns {object|null} Embed descriptor or null if invalid
 */
export function normalizeMediaUrl(raw) {
  if (!raw || typeof raw !== 'string') return null
  let trimmed = raw.trim()
  if (!trimmed) return null

  // If user pasted an entire <iframe>, <object>, or widget snippet, extract the embed URL
  const iframeMatch = trimmed.match(/(?:src|data)=["']([^"']+)["']/i)
  if (iframeMatch) {
    trimmed = iframeMatch[1].trim()
  } else {
    const dataLinkMatch = trimmed.match(/data-link=["']([^"']+)["']/i)
    if (dataLinkMatch) {
      trimmed = `https://www.publicalbum.org/carousel/embed?url=${encodeURIComponent(dataLinkMatch[1].trim())}`
    }
  }

  // 1. Google Drive
  // Matches:
  //   https://drive.google.com/file/d/ID/view
  //   https://drive.google.com/file/d/ID/edit
  //   https://drive.google.com/file/d/ID/preview
  //   https://drive.google.com/open?id=ID
  //   https://drive.google.com/uc?id=ID (or uc?export=download&id=ID)
  const gdriveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)))/i)
  if (gdriveMatch) {
    const id = gdriveMatch[1] || gdriveMatch[2]
    return {
      type: 'gdrive',
      id,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      originalUrl: `https://drive.google.com/file/d/${id}/view`,
      isIframe: true,
      label: 'Google Drive Video'
    }
  }

  // 2. YouTube (watch, youtu.be, shorts, embed, youtube-nocookie)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      type: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      originalUrl: `https://www.youtube.com/watch?v=${id}`,
      isIframe: true,
      label: 'YouTube Video'
    }
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeoMatch) {
    const id = vimeoMatch[1]
    return {
      type: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      originalUrl: `https://vimeo.com/${id}`,
      isIframe: true,
      label: 'Vimeo Video'
    }
  }

  // 4. Google Forms / Docs / Slides
  if (/docs\.google\.com\/(?:forms|document|presentation|spreadsheets)/i.test(trimmed)) {
    let embedUrl = trimmed
    if (/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+/i.test(embedUrl)) {
      if (!/embedded=true/i.test(embedUrl)) {
        embedUrl = embedUrl.includes('?') ? `${embedUrl}&embedded=true` : `${embedUrl}?embedded=true`
      }
    } else if (/presentation\/d\/[a-zA-Z0-9_-]+/i.test(embedUrl)) {
      if (!/\/embed/i.test(embedUrl)) {
        embedUrl = embedUrl.replace(/\/(?:pub|edit|preview).*/i, '') + '/embed'
      }
    }
    return {
      type: 'gforms',
      embedUrl,
      originalUrl: trimmed,
      isIframe: true,
      label: 'Google Document / Form'
    }
  }

  // 5. PublicAlbum / Google Photos Album Embed
  if (/publicalbum\.org\/(?:carousel|webapp)/i.test(trimmed)) {
    let embedUrl = trimmed
    if (/publicalbum\.org\/carousel(?!\/embed)/i.test(embedUrl)) {
      embedUrl = embedUrl.replace(/publicalbum\.org\/carousel/i, 'publicalbum.org/carousel/embed')
    }
    return {
      type: 'publicalbum',
      embedUrl,
      originalUrl: trimmed,
      isIframe: true,
      label: 'Google Photos Album (PublicAlbum)'
    }
  }

  // 6. Direct Google Photos shared link (automatically route through PublicAlbum embed player)
  if (/(?:photos\.app\.goo\.gl|photos\.google\.com\/(?:share|album))/i.test(trimmed)) {
    return {
      type: 'publicalbum',
      embedUrl: `https://www.publicalbum.org/carousel/embed?url=${encodeURIComponent(trimmed)}`,
      originalUrl: trimmed,
      isIframe: true,
      label: 'Google Photos Album'
    }
  }

  // 5. Direct video files (.mp4, .webm, .ogv, .mov, .m4v) or local clean path
  let cleanedDirect = trimmed.replace(/\\/g, '/')
  const pubIdx = cleanedDirect.toLowerCase().lastIndexOf('/public/')
  if (pubIdx !== -1) {
    cleanedDirect = cleanedDirect.substring(pubIdx + '/public'.length)
  } else if (cleanedDirect.toLowerCase().startsWith('public/')) {
    cleanedDirect = '/' + cleanedDirect.substring('public/'.length)
  } else if (/^[a-zA-Z]:\//.test(cleanedDirect)) {
    cleanedDirect = '/' + cleanedDirect.substring(cleanedDirect.lastIndexOf('/') + 1)
  } else if (!cleanedDirect.startsWith('http://') && !cleanedDirect.startsWith('https://') && !cleanedDirect.startsWith('/')) {
    cleanedDirect = '/' + cleanedDirect
  }

  if (/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(cleanedDirect)) {
    return {
      type: 'direct',
      url: cleanedDirect,
      originalUrl: cleanedDirect,
      isIframe: false,
      label: 'Direct Video File'
    }
  }

  // 6. Generic embed URL (anything else)
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return {
      type: 'generic',
      embedUrl: trimmed,
      originalUrl: trimmed,
      isIframe: true,
      label: 'Web Embed'
    }
  }

  return null
}
