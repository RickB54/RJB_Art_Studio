#!/usr/bin/env node
// scripts/sync-playlists.mjs
// YouTube Data API v3 playlist sync — runs in Node, never in the browser bundle.
// Usage: npm run sync-playlists
// Requires YOUTUBE_API_KEY in .env (or set in shell)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env manually (no dotenv dep needed)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}
loadEnv()

const API_KEY = process.env.YOUTUBE_API_KEY
const PLAYLISTS_PATH = path.resolve(__dirname, '../src/data/playlists.json')

// Fetch all pages from a YouTube API endpoint
async function fetchAllPages(baseUrl) {
  const items = []
  let pageToken = ''
  do {
    const url = pageToken ? `${baseUrl}&pageToken=${pageToken}` : baseUrl
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`YouTube API error ${res.status}: ${text}`)
    }
    const data = await res.json()
    if (data.error) throw new Error(`YouTube API: ${data.error.message}`)
    items.push(...(data.items || []))
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  return items
}

// Fetch video descriptions in batches of 50
async function fetchDescriptions(videoIds) {
  const descMap = {}
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(',')}&key=${API_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    for (const item of data.items || []) {
      descMap[item.id] = item.snippet?.description || ''
    }
  }
  return descMap
}

async function syncPlaylist(playlist) {
  console.log(`  Syncing: ${playlist.title} (${playlist.playlistId})`)
  const baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=50&playlistId=${playlist.playlistId}&key=${API_KEY}`

  let rawItems
  try {
    rawItems = await fetchAllPages(baseUrl)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
    return playlist
  }

  // Filter out private/deleted videos
  const validItems = rawItems.filter(item => {
    const status = item.status?.privacyStatus
    return status === 'public' || status === 'unlisted'
  })

  console.log(`    Found ${rawItems.length} items, ${validItems.length} public/unlisted`)

  // Build a map of existing videos (preserve user edits)
  const existingMap = {}
  for (const v of playlist.videos || []) existingMap[v.id] = v

  // Fetch descriptions for NEW videos only (no API key wasted on already-fetched)
  const newIds = validItems.map(i => i.snippet.resourceId.videoId).filter(id => !existingMap[id] || !existingMap[id].description)
  let descMap = {}
  if (newIds.length > 0) {
    try {
      descMap = await fetchDescriptions(newIds)
    } catch (err) {
      console.warn('    Could not fetch descriptions:', err.message)
    }
  }

  // Merge: update titles, add new, skip private, NEVER overwrite user edits
  const updatedVideos = []
  const seen = new Set()
  for (const item of validItems) {
    const id = item.snippet.resourceId.videoId
    if (seen.has(id)) continue
    seen.add(id)

    const existing = existingMap[id]
    if (existing) {
      // Update title only (never overwrite description, photos, hide flag, etc.)
      updatedVideos.push({
        ...existing,
        title: item.snippet.title || existing.title
      })
    } else {
      // Brand new video
      const desc = descMap[id] || ''
      updatedVideos.push({
        id,
        title: item.snippet.title || id,
        description: desc,
        hide: false
      })
    }
  }

  // Pick coverVideoId from first public video if not already set
  const coverVideoId = playlist.coverVideoId || (updatedVideos[0]?.id || '')

  return {
    ...playlist,
    videoCount: updatedVideos.length,
    coverVideoId,
    videos: updatedVideos
  }
}

async function main() {
  if (!API_KEY) {
    console.error('\n✗ YOUTUBE_API_KEY not set in .env')
    console.error('  See HOW-TO.md for instructions to get your free API key.\n')
    process.exit(1)
  }

  // Optional: sync only one playlist ID passed as argument
  const targetId = process.argv[2]

  const playlists = JSON.parse(fs.readFileSync(PLAYLISTS_PATH, 'utf-8'))
  const toSync = targetId ? playlists.filter(p => p.playlistId === targetId) : playlists.filter(p => p.show !== false)

  if (toSync.length === 0) {
    console.log('No playlists to sync.')
    process.exit(0)
  }

  console.log(`\nSyncing ${toSync.length} playlist(s)...\n`)

  const updated = [...playlists]
  for (const pl of toSync) {
    const idx = updated.findIndex(p => p.playlistId === pl.playlistId)
    const synced = await syncPlaylist(pl)
    if (idx >= 0) updated[idx] = synced
  }

  fs.writeFileSync(PLAYLISTS_PATH, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`\n✓ Saved to src/data/playlists.json`)
  console.log('  Run: npm run publish to push changes live.\n')
}

main().catch(err => {
  console.error('\n✗ Sync failed:', err.message)
  process.exit(1)
})
