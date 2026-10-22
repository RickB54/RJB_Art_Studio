import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env manually so YOUTUBE_API_KEY is available in the Vite dev server
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env')
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

function adminApiPlugin() {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/__api/')) return next()

        const paintingsPath = path.resolve(__dirname, 'src/data/paintings.json')
        const sitePath = path.resolve(__dirname, 'src/data/site.json')
        const playlistsPath = path.resolve(__dirname, 'src/data/playlists.json')
        const pagesPath = path.resolve(__dirname, 'src/data/pages.json')

        res.setHeader('Content-Type', 'application/json')

        // Helper to read JSON request body
        const readBody = () => new Promise((resolve) => {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try { resolve(JSON.parse(body || '{}')) } catch { resolve({}) }
          })
        })

        // GET /__api/data
        if (req.method === 'GET' && req.url === '/__api/data') {
          const paintings = JSON.parse(fs.readFileSync(paintingsPath, 'utf-8'))
          const site = JSON.parse(fs.readFileSync(sitePath, 'utf-8'))
          const playlists = fs.existsSync(playlistsPath) ? JSON.parse(fs.readFileSync(playlistsPath, 'utf-8')) : []
          const pages = fs.existsSync(pagesPath) ? JSON.parse(fs.readFileSync(pagesPath, 'utf-8')) : {}
          res.end(JSON.stringify({ paintings, site, playlists, pages }))
          return
        }

        // GET /__api/playlist/:id  — lazy load single playlist
        const plMatch = req.method === 'GET' && req.url.match(/^\/__api\/playlist\/(.+)$/)
        if (plMatch) {
          const plId = plMatch[1]
          const singlePlFile = path.resolve(__dirname, `src/data/playlists/${plId}.json`)
          if (fs.existsSync(singlePlFile)) {
            res.end(fs.readFileSync(singlePlFile, 'utf-8'))
            return
          }
          const playlists = fs.existsSync(playlistsPath) ? JSON.parse(fs.readFileSync(playlistsPath, 'utf-8')) : []
          const pl = playlists.find(p => p.playlistId === plId)
          if (pl) { res.end(JSON.stringify(pl)); return }
          res.statusCode = 404; res.end(JSON.stringify({ error: 'Not found' })); return
        }

        // POST /__api/paintings
        if (req.method === 'POST' && req.url === '/__api/paintings') {
          const { paintings } = await readBody()
          if (Array.isArray(paintings)) {
            fs.writeFileSync(paintingsPath, JSON.stringify(paintings, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true, count: paintings.length }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected paintings array' })) }
          return
        }

        // POST /__api/playlists
        if (req.method === 'POST' && req.url === '/__api/playlists') {
          const { playlists } = await readBody()
          if (Array.isArray(playlists)) {
            const plDir = path.resolve(__dirname, 'src/data/playlists')
            fs.mkdirSync(plDir, { recursive: true })
            const summaries = []
            for (const p of playlists) {
              if (p.videos) {
                fs.writeFileSync(path.join(plDir, `${p.playlistId}.json`), JSON.stringify(p, null, 2), 'utf-8')
              }
              const { videos, ...sum } = p
              summaries.push(sum)
            }
            fs.writeFileSync(playlistsPath, JSON.stringify(summaries, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true, count: playlists.length }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected playlists array' })) }
          return
        }

        // POST /__api/site
        if (req.method === 'POST' && req.url === '/__api/site') {
          const { site } = await readBody()
          if (site && typeof site === 'object') {
            fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected site object' })) }
          return
        }

        // POST /__api/pages
        if (req.method === 'POST' && req.url === '/__api/pages') {
          const { pages } = await readBody()
          if (pages && typeof pages === 'object') {
            fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected pages object' })) }
          return
        }

        // POST /__api/sync-playlist  — YouTube API call runs server-side; key never in browser
        if (req.method === 'POST' && req.url === '/__api/sync-playlist') {
          const { playlistId } = await readBody()
          const apiKey = process.env.YOUTUBE_API_KEY

          if (!apiKey) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'YOUTUBE_API_KEY not set in .env — see HOW-TO.md', missingKey: true }))
            return
          }
          if (!playlistId) { res.statusCode = 400; res.end(JSON.stringify({ error: 'playlistId required' })); return }

          try {
            const rawItems = []
            let pageToken = ''
            do {
              const ptParam = pageToken ? `&pageToken=${pageToken}` : ''
              const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=50&playlistId=${playlistId}&key=${apiKey}${ptParam}`)
              const d = await r.json()
              if (d.error) throw new Error(d.error.message)
              rawItems.push(...(d.items || []))
              pageToken = d.nextPageToken || ''
            } while (pageToken)

            const validItems = rawItems.filter(i => {
              const s = i.status?.privacyStatus
              return s === 'public' || s === 'unlisted'
            })

            const singlePlPath = path.resolve(__dirname, `src/data/playlists/${playlistId}.json`)
            let pl = fs.existsSync(singlePlPath) ? JSON.parse(fs.readFileSync(singlePlPath, 'utf-8')) : null
            const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf-8'))
            if (!pl) pl = playlists.find(p => p.playlistId === playlistId)
            if (!pl) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Playlist not found' })); return }

            const existingMap = {}
            for (const v of pl.videos || []) existingMap[v.id] = v

            const newIds = validItems.map(i => i.snippet.resourceId.videoId).filter(id => !existingMap[id])
            let descMap = {}
            for (let i = 0; i < newIds.length; i += 50) {
              const batch = newIds.slice(i, i + 50)
              const dr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(',')}&key=${apiKey}`)
              const dd = await dr.json()
              for (const item of dd.items || []) descMap[item.id] = item.snippet?.description || ''
            }

            const mergedVideos = []
            const seen = new Set()
            for (const item of validItems) {
              const id = item.snippet.resourceId.videoId
              if (seen.has(id)) continue
              seen.add(id)
              const existing = existingMap[id]
              if (existing) {
                mergedVideos.push({ ...existing, title: existing.title || item.snippet.title })
              } else {
                mergedVideos.push({ id, title: item.snippet.title || id, description: descMap[id] || '', hide: false })
              }
            }

            const coverVideoId = pl.coverVideoId || (mergedVideos[0]?.id || '')
            const updatedPl = { ...pl, videoCount: mergedVideos.length, coverVideoId, videos: mergedVideos }
            fs.mkdirSync(path.dirname(singlePlPath), { recursive: true })
            fs.writeFileSync(singlePlPath, JSON.stringify(updatedPl, null, 2), 'utf-8')

            const { videos: _v, ...summary } = updatedPl
            const updatedPlaylists = playlists.map(p => p.playlistId === playlistId ? summary : p)
            fs.writeFileSync(playlistsPath, JSON.stringify(updatedPlaylists, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true, count: mergedVideos.length, added: newIds.length }))
          } catch (err) {
            res.statusCode = 500; res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/upload-photo  — resize with sharp: 1600px WebP + 500px thumb in public/images/paintings/
        if (req.method === 'POST' && (req.url === '/__api/upload-photo' || req.url === '/__api/upload-original')) {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { filename, dataBase64 } = JSON.parse(body)
              if (!filename || !dataBase64) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'filename and dataBase64 required' }))
                return
              }
              let sharp
              try {
                sharp = (await import('sharp')).default
              } catch {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'sharp not installed' }))
                return
              }
              const buffer = Buffer.from(dataBase64, 'base64')
              const outDir = path.resolve(__dirname, 'public/images/paintings')
              fs.mkdirSync(outDir, { recursive: true })
              const rawBase = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
              const base = `${rawBase}-${Date.now().toString().slice(-6)}`
              const fullPath = path.join(outDir, `${base}.webp`)
              const thumbPath = path.join(outDir, `${base}-thumb.webp`)

              await sharp(buffer)
                .resize({ width: 1600, withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(fullPath)

              await sharp(buffer)
                .resize({ width: 500, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(thumbPath)

              const fullSize = fs.statSync(fullPath).size
              const warning = fullSize > 500 * 1024 ? `File is over 500 KB (${Math.round(fullSize / 1024)} KB)` : null

              res.end(JSON.stringify({
                success: true,
                url: `/images/paintings/${base}.webp`,
                thumbnailUrl: `/images/paintings/${base}-thumb.webp`,
                size: fullSize,
                warning
              }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // POST /__api/fetch-youtube
        if (req.method === 'POST' && req.url === '/__api/fetch-youtube') {
          const { url } = await readBody()
          if (!url) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing url' })); return }
          const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
          const videoId = match ? match[1] : null
          if (!videoId) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Invalid YouTube URL' })); return }

          let title = `Painting ${videoId}`
          try {
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            if (oembedRes.ok) {
              const data = await oembedRes.json()
              if (data.title) title = data.title
            }
          } catch {}

          let thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          try {
            const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            const check = await fetch(maxres, { method: 'HEAD' })
            if (check.ok) thumbnail = maxres
          } catch {}

          res.end(JSON.stringify({ videoId, title, thumbnail, youtubeUrl: `https://www.youtube.com/watch?v=${videoId}` }))
          return
        }

        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Endpoint not found' }))
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  server: {
    port: 5180,
    strictPort: true,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide'
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('@remix-run') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
