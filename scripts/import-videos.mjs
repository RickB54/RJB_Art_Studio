// scripts/import-videos.mjs
// Automated importer for YouTube video paintings
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const urlsFilePath = path.join(rootDir, 'paintings-urls.txt')
const paintingsFilePath = path.join(rootDir, 'src', 'data', 'paintings.json')

function extractVideoId(url) {
  if (!url) return null
  const cleanUrl = url.trim()
  
  // youtu.be/<id>
  const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i)
  if (shortMatch) return shortMatch[1]

  // youtube.com/watch?v=<id>
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i)
  if (watchMatch) return watchMatch[1]

  // youtube.com/shorts/<id>
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i)
  if (shortsMatch) return shortsMatch[1]

  // youtube.com/embed/<id>
  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i)
  if (embedMatch) return embedMatch[1]

  return null
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

async function verifyThumbnail(videoId) {
  const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  try {
    const res = await fetch(maxResUrl, { method: 'HEAD' })
    if (res.ok) {
      return maxResUrl
    }
  } catch (err) {
    // fallback
  }
  return hqUrl
}

async function main() {
  console.log('\n========================================')
  console.log('  RJB Art Studio - Video Importer')
  console.log('========================================\n')

  if (!fs.existsSync(urlsFilePath)) {
    console.error(`[ERROR] File not found: ${urlsFilePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(urlsFilePath, 'utf-8')
  const lines = fileContent.split('\n')

  let paintings = []
  if (fs.existsSync(paintingsFilePath)) {
    try {
      paintings = JSON.parse(fs.readFileSync(paintingsFilePath, 'utf-8'))
    } catch (e) {
      console.warn('[WARN] Could not parse existing paintings.json, starting with empty list.')
      paintings = []
    }
  }

  const existingIds = new Set(paintings.map(p => p.videoId).filter(Boolean))
  let addedCount = 0
  let skippedCount = 0

  for (let rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    // Handle "URL | Category" format
    let [urlPart, categoryPart] = line.split('|').map(s => s.trim())
    const videoId = extractVideoId(urlPart)

    if (!videoId) {
      console.warn(`[SKIP] Could not detect a valid YouTube Video ID in: "${line}"`)
      continue
    }

    if (existingIds.has(videoId)) {
      skippedCount++
      continue
    }

    const assignedCategory = categoryPart || 'Landscapes & Seascapes'
    const fullWatchUrl = `https://www.youtube.com/watch?v=${videoId}`

    let videoTitle = `Painting ${videoId}`
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(fullWatchUrl)}&format=json`
      const oembedRes = await fetch(oembedUrl)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        if (data.title) videoTitle = data.title
      }
    } catch (e) {
      console.warn(`[INFO] Could not fetch oEmbed metadata for ${videoId}, using fallback title.`)
    }

    const thumbnailUrl = await verifyThumbnail(videoId)
    const baseSlug = slugify(videoTitle).slice(0, 50) || `video-${videoId}`
    let uniqueId = baseSlug
    let counter = 1
    while (paintings.some(p => p.id === uniqueId)) {
      uniqueId = `${baseSlug}-${counter++}`
    }

    // Try to detect year if mentioned in title (e.g. 2018, 2019, 2021)
    const yearMatch = videoTitle.match(/\b(20\d{2})\b/)
    const detectedYear = yearMatch ? yearMatch[1] : new Date().getFullYear().toString()

    const newPainting = {
      id: uniqueId,
      title: videoTitle,
      category: assignedCategory,
      year: detectedYear,
      medium: "Oil or Acrylic on Canvas",
      size: "Custom",
      description: "Original artwork by Rick J Berube. Watch the complete creation process in the embedded video.",
      sold: false,
      price: null,
      youtubeUrl: fullWatchUrl,
      videoId: videoId,
      thumbnail: thumbnailUrl,
      customImage: "",
      draft: true,
      featured: false
    }

    paintings.push(newPainting)
    existingIds.add(videoId)
    addedCount++
    console.log(`[ADDED] "${videoTitle}" (${assignedCategory})`)
  }

  fs.writeFileSync(paintingsFilePath, JSON.stringify(paintings, null, 2), 'utf-8')

  console.log('\n----------------------------------------')
  console.log(`Done! Added: ${addedCount} new painting(s), Skipped: ${skippedCount} existing.`)
  console.log(`Saved updated entries to: src/data/paintings.json`)
  console.log('----------------------------------------\n')
}

main().catch(err => {
  console.error('[ERROR] Importer failed:', err)
  process.exit(1)
})
