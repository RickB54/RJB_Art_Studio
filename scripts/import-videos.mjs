// scripts/import-videos.mjs
// Bulk importer for YouTube videos: "URL | Name"
// If Name matches a playlist (case-insensitive) adds the video to it; otherwise warns.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const urlsFilePath = path.join(rootDir, 'paintings-urls.txt')
const playlistsFilePath = path.join(rootDir, 'src', 'data', 'playlists.json')

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

async function main() {
  console.log('\n========================================')
  console.log('  RJB Art Studio - Bulk Video Importer')
  console.log('  Format: URL | Name')
  console.log('========================================\n')

  if (!fs.existsSync(urlsFilePath)) {
    console.error(`[ERROR] File not found: ${urlsFilePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(urlsFilePath, 'utf-8')
  const lines = fileContent.split('\n')

  let playlists = []
  if (fs.existsSync(playlistsFilePath)) {
    try {
      playlists = JSON.parse(fs.readFileSync(playlistsFilePath, 'utf-8'))
    } catch (e) {
      console.error('[ERROR] Could not parse existing playlists.json:', e.message)
      process.exit(1)
    }
  }

  const availablePlaylists = playlists.map(p => p.title)
  let addedCount = 0
  let skippedCount = 0
  let warnCount = 0

  for (let rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    // Handle "URL | Name" format
    let [urlPart, namePart] = line.split('|').map(s => s ? s.trim() : '')
    const videoId = extractVideoId(urlPart)

    if (!videoId) {
      console.warn(`[WARN] Could not detect a valid YouTube Video ID in: "${line}"`)
      warnCount++
      continue
    }

    if (!namePart) {
      console.warn(`[WARN] Missing playlist Name for URL "${urlPart}". Format must be "URL | Name"`)
      warnCount++
      continue
    }

    // Match playlist name case-insensitively
    const targetPl = playlists.find(p => p.title && p.title.trim().toLowerCase() === namePart.toLowerCase())
    if (!targetPl) {
      console.warn(`[WARN] No playlist matches "${namePart}" (case-insensitive) for video ${videoId}. Available: ${availablePlaylists.join(', ')}`)
      warnCount++
      continue
    }

    if (!targetPl.videos) targetPl.videos = []
    if (targetPl.videos.some(v => v.id === videoId)) {
      console.log(`[INFO] Video ${videoId} already exists in playlist "${targetPl.title}".`)
      skippedCount++
      continue
    }

    let videoTitle = `Painting ${videoId}`
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const oembedRes = await fetch(oembedUrl)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        if (data.title) videoTitle = data.title
      }
    } catch (e) {}

    targetPl.videos.unshift({
      id: videoId,
      title: videoTitle,
      description: '',
      hide: false
    })
    targetPl.videoCount = targetPl.videos.length
    if (!targetPl.coverVideoId) targetPl.coverVideoId = videoId

    addedCount++
    console.log(`[ADDED] "${videoTitle}" -> Playlist "${targetPl.title}"`)
  }

  if (addedCount > 0) {
    fs.writeFileSync(playlistsFilePath, JSON.stringify(playlists, null, 2), 'utf-8')
  }

  console.log('\n----------------------------------------')
  console.log(`Done! Added: ${addedCount} video(s), Skipped: ${skippedCount}, Warnings: ${warnCount}`)
  if (addedCount > 0) console.log(`Saved updated playlists to: src/data/playlists.json`)
  console.log('----------------------------------------\n')
}

main().catch(err => {
  console.error('[ERROR] Importer failed:', err)
  process.exit(1)
})
