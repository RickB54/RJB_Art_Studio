import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
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
        const pagesDraftPath = path.resolve(__dirname, 'src/data/pages.draft.json')
        const backupsDir = path.resolve(__dirname, 'backups')
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true })
        }

        const createBackup = (name, targetFilePath) => {
          if (!fs.existsSync(targetFilePath)) return
          if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true })
          }
          const now = new Date()
          const pad = (n) => String(n).padStart(2, '0')
          const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
          const backupFileName = `${name}-${timestamp}.json`
          const backupFilePath = path.join(backupsDir, backupFileName)
          try {
            fs.copyFileSync(targetFilePath, backupFilePath)
            const prefix = `${name}-`
            const files = fs.readdirSync(backupsDir)
              .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
              .sort()
              .reverse()
            if (files.length > 30) {
              for (const oldFile of files.slice(30)) {
                try { fs.unlinkSync(path.join(backupsDir, oldFile)) } catch {}
              }
            }
          } catch (err) {
            console.error('Backup error:', err)
          }
        }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        res.setHeader('Pragma', 'no-cache')

        // Helper to read JSON request body
        const readBody = () => new Promise((resolve) => {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try { resolve(JSON.parse(body || '{}')) } catch { resolve({}) }
          })
        })

        // GET /__api/data
        if (req.method === 'GET' && req.url.startsWith('/__api/data')) {
          const paintings = JSON.parse(fs.readFileSync(paintingsPath, 'utf-8'))
          const site = JSON.parse(fs.readFileSync(sitePath, 'utf-8'))
          const playlists = fs.existsSync(playlistsPath) ? JSON.parse(fs.readFileSync(playlistsPath, 'utf-8')) : []
          
          let pages = {}
          const isDraft = req.url.includes('preview=draft')
          if (isDraft && fs.existsSync(pagesDraftPath)) {
            try {
              pages = JSON.parse(fs.readFileSync(pagesDraftPath, 'utf-8'))
            } catch {
              pages = fs.existsSync(pagesPath) ? JSON.parse(fs.readFileSync(pagesPath, 'utf-8')) : {}
            }
          } else {
            pages = fs.existsSync(pagesPath) ? JSON.parse(fs.readFileSync(pagesPath, 'utf-8')) : {}
          }

          res.end(JSON.stringify({ paintings, site, playlists, pages }))
          return
        }

        // GET /__api/draft
        if (req.method === 'GET' && req.url === '/__api/draft') {
          if (fs.existsSync(pagesDraftPath)) {
            try {
              const draft = JSON.parse(fs.readFileSync(pagesDraftPath, 'utf-8'))
              res.end(JSON.stringify({ exists: true, draft }))
              return
            } catch {
              res.end(JSON.stringify({ exists: false, draft: null }))
              return
            }
          }
          res.end(JSON.stringify({ exists: false, draft: null }))
          return
        }

        // POST /__api/draft
        if (req.method === 'POST' && req.url === '/__api/draft') {
          const { pages } = await readBody()
          if (pages && typeof pages === 'object') {
            fs.writeFileSync(pagesDraftPath, JSON.stringify(pages, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } else {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Expected pages object' }))
          }
          return
        }

        // DELETE /__api/draft
        if (req.method === 'DELETE' && req.url === '/__api/draft') {
          if (fs.existsSync(pagesDraftPath)) {
            try { fs.unlinkSync(pagesDraftPath) } catch {}
          }
          res.end(JSON.stringify({ success: true }))
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
            createBackup('site', sitePath)
            fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected site object' })) }
          return
        }

        // POST /__api/pages
        if (req.method === 'POST' && req.url === '/__api/pages') {
          const { pages } = await readBody()
          if (pages && typeof pages === 'object') {
            createBackup('pages', pagesPath)
            fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf-8')
            if (fs.existsSync(pagesDraftPath)) {
              try { fs.unlinkSync(pagesDraftPath) } catch {}
            }
            res.end(JSON.stringify({ success: true }))
          } else { res.statusCode = 400; res.end(JSON.stringify({ error: 'Expected pages object' })) }
          return
        }

        // GET /__api/backups
        if (req.method === 'GET' && req.url === '/__api/backups') {
          if (!fs.existsSync(backupsDir)) {
            res.end(JSON.stringify({ backups: [] }))
            return
          }
          try {
            const files = fs.readdirSync(backupsDir)
              .filter(f => f.startsWith('pages-') && f.endsWith('.json'))
              .sort()
              .reverse()

            const backups = files.map(filename => {
              const filePath = path.join(backupsDir, filename)
              const stat = fs.statSync(filePath)
              let dateFormatted = stat.mtime.toLocaleString()
              const match = filename.match(/^pages-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/)
              if (match) {
                const [, Y, M, D, h, m, s] = match
                const d = new Date(Number(Y), Number(M) - 1, Number(D), Number(h), Number(m), Number(s))
                if (!isNaN(d.getTime())) {
                  dateFormatted = d.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                }
              }

              let summary = ''
              try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                const pageKeys = Object.keys(data).filter(k => k !== 'footer' && k !== 'header')
                let totalBlocks = 0
                for (const k of Object.keys(data)) {
                  const slots = data[k]?.blockSlots || {}
                  for (const s of Object.keys(slots)) {
                    if (Array.isArray(slots[s])) totalBlocks += slots[s].length
                  }
                }
                summary = `${pageKeys.length} page${pageKeys.length === 1 ? '' : 's'}, ${totalBlocks} block${totalBlocks === 1 ? '' : 's'}`
              } catch {
                summary = `${(stat.size / 1024).toFixed(1)} KB`
              }

              return {
                filename,
                dateFormatted,
                summary,
                mtime: stat.mtimeMs
              }
            })

            res.end(JSON.stringify({ backups }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/restore-backup
        if (req.method === 'POST' && req.url === '/__api/restore-backup') {
          const { filename } = await readBody()
          if (!filename || typeof filename !== 'string' || !filename.match(/^pages-\d{8}-\d{6}\.json$/)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid backup filename' }))
            return
          }
          const targetBackup = path.join(backupsDir, filename)
          if (!fs.existsSync(targetBackup)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Backup not found' }))
            return
          }
          try {
            createBackup('pages', pagesPath)
            const backupContent = fs.readFileSync(targetBackup, 'utf-8')
            fs.writeFileSync(pagesPath, backupContent, 'utf-8')
            if (fs.existsSync(pagesDraftPath)) {
              try { fs.unlinkSync(pagesDraftPath) } catch {}
            }
            const restoredPages = JSON.parse(backupContent)
            res.end(JSON.stringify({ success: true, pages: restoredPages }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/delete-backup
        if (req.method === 'POST' && req.url === '/__api/delete-backup') {
          const { filename } = await readBody()
          if (!filename || typeof filename !== 'string' || !filename.match(/^pages-\d{8}-\d{6}\.json$/)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid backup filename' }))
            return
          }
          const targetBackup = path.join(backupsDir, filename)
          if (fs.existsSync(targetBackup)) {
            try {
              fs.unlinkSync(targetBackup)
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Backup not found' }))
          }
          return
        }

        // POST /__api/delete-all-backups
        if (req.method === 'POST' && req.url === '/__api/delete-all-backups') {
          try {
            if (fs.existsSync(backupsDir)) {
              const files = fs.readdirSync(backupsDir).filter(f => f.startsWith('pages-') && f.endsWith('.json'))
              for (const file of files) {
                try { fs.unlinkSync(path.join(backupsDir, file)) } catch {}
              }
            }
            res.end(JSON.stringify({ success: true }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
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

        // Helper to collect references to media files across all site data
        const getMediaReferences = () => {
          const refs = {}
          const record = (val, desc) => {
            if (!val || typeof val !== 'string') return
            const match = val.match(/([a-zA-Z0-9_\-\.]+\.(?:webp|jpg|jpeg|png|gif|svg))/i)
            if (match) {
              const fn = match[1].toLowerCase()
              const baseFn = fn.replace(/-thumb\.webp$/, '.webp')
              if (!refs[fn]) refs[fn] = new Set()
              refs[fn].add(desc)
              if (baseFn !== fn) {
                if (!refs[baseFn]) refs[baseFn] = new Set()
                refs[baseFn].add(desc)
              }
            }
          }

          const walk = (obj, desc) => {
            if (!obj) return
            if (typeof obj === 'string') {
              record(obj, desc)
            } else if (Array.isArray(obj)) {
              obj.forEach(item => walk(item, desc))
            } else if (typeof obj === 'object') {
              for (const v of Object.values(obj)) {
                walk(v, desc)
              }
            }
          }

          if (fs.existsSync(pagesPath)) {
            try {
              const p = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'))
              for (const [k, v] of Object.entries(p)) walk(v, `Page: ${k}`)
            } catch {}
          }
          if (fs.existsSync(pagesDraftPath)) {
            try {
              const d = JSON.parse(fs.readFileSync(pagesDraftPath, 'utf-8'))
              for (const [k, v] of Object.entries(d)) walk(v, `Draft: ${k}`)
            } catch {}
          }
          if (fs.existsSync(sitePath)) {
            try {
              walk(JSON.parse(fs.readFileSync(sitePath, 'utf-8')), 'Site settings')
            } catch {}
          }
          if (fs.existsSync(paintingsPath)) {
            try {
              const pt = JSON.parse(fs.readFileSync(paintingsPath, 'utf-8'))
              pt.forEach(p => walk(p, `Painting: ${p.title || p.id || 'Untitled'}`))
            } catch {}
          }
          if (fs.existsSync(playlistsPath)) {
            try {
              walk(JSON.parse(fs.readFileSync(playlistsPath, 'utf-8')), 'Playlists')
            } catch {}
          }
          const plDir = path.resolve(__dirname, 'src/data/playlists')
          if (fs.existsSync(plDir)) {
            try {
              fs.readdirSync(plDir).forEach(f => {
                if (f.endsWith('.json')) {
                  try {
                    const pl = JSON.parse(fs.readFileSync(path.join(plDir, f), 'utf-8'))
                    walk(pl, `Playlist: ${pl.title || f}`)
                  } catch {}
                }
              })
            } catch {}
          }
          return refs
        }

        // GET /__api/media-library
        if (req.method === 'GET' && req.url === '/__api/media-library') {
          try {
            const refs = getMediaReferences()
            const imagesRoot = path.resolve(__dirname, 'public/images')
            const uploadFolders = ['gallery', 'showcase', 'paintings', 'price-lists']
            if (fs.existsSync(imagesRoot)) {
              fs.readdirSync(imagesRoot).forEach(d => {
                if (!uploadFolders.includes(d) && !d.startsWith('.')) {
                  try {
                    if (fs.statSync(path.join(imagesRoot, d)).isDirectory()) uploadFolders.push(d)
                  } catch {}
                }
              })
            }

            const items = []
            uploadFolders.forEach(folder => {
              const folderDir = path.join(imagesRoot, folder)
              if (!fs.existsSync(folderDir)) {
                if (['gallery', 'showcase', 'paintings'].includes(folder)) {
                  fs.mkdirSync(folderDir, { recursive: true })
                }
                return
              }
              const files = fs.readdirSync(folderDir).filter(f => !f.startsWith('.'))
              const groupMap = new Map()

              files.forEach(f => {
                const isThumb = f.endsWith('-thumb.webp')
                const baseName = isThumb ? f.replace(/-thumb\.webp$/, '.webp') : f
                if (!groupMap.has(baseName)) {
                  groupMap.set(baseName, { baseName, folder, file: null, thumb: null, fullSize: 0, thumbSize: 0, mtime: 0 })
                }
                const entry = groupMap.get(baseName)
                const fullFp = path.join(folderDir, f)
                try {
                  const stat = fs.statSync(fullFp)
                  if (stat.mtimeMs > entry.mtime) entry.mtime = stat.mtimeMs
                  if (isThumb) {
                    entry.thumb = f
                    entry.thumbSize = stat.size
                  } else {
                    entry.file = f
                    entry.fullSize = stat.size
                  }
                } catch {}
              })

              groupMap.forEach(entry => {
                const f1 = entry.file ? entry.file.toLowerCase() : null
                const f2 = entry.thumb ? entry.thumb.toLowerCase() : null
                const usedSet = new Set()
                if (f1 && refs[f1]) refs[f1].forEach(r => usedSet.add(r))
                if (f2 && refs[f2]) refs[f2].forEach(r => usedSet.add(r))
                const usedIn = Array.from(usedSet)
                const totalSize = entry.fullSize + entry.thumbSize
                items.push({
                  id: `${folder}/${entry.baseName}`,
                  folder,
                  baseName: entry.baseName,
                  file: entry.file,
                  thumb: entry.thumb,
                  fullSize: entry.fullSize,
                  thumbSize: entry.thumbSize,
                  totalSize,
                  url: entry.file ? `/images/${folder}/${entry.file}` : `/images/${folder}/${entry.thumb}`,
                  thumbnailUrl: entry.thumb ? `/images/${folder}/${entry.thumb}` : (entry.file ? `/images/${folder}/${entry.file}` : ''),
                  mtime: entry.mtime,
                  usedIn,
                  isUnused: usedIn.length === 0
                })
              })
            })

            // Scan trash
            const trashRoot = path.resolve(__dirname, 'removed-media')
            const trashItems = []
            if (fs.existsSync(trashRoot)) {
              const trashFolders = fs.readdirSync(trashRoot).filter(d => !d.startsWith('.'))
              trashFolders.forEach(folder => {
                const folderDir = path.join(trashRoot, folder)
                try {
                  if (!fs.statSync(folderDir).isDirectory()) return
                  const files = fs.readdirSync(folderDir).filter(f => !f.startsWith('.'))
                  const groupMap = new Map()
                  files.forEach(f => {
                    const isThumb = f.endsWith('-thumb.webp')
                    const baseName = isThumb ? f.replace(/-thumb\.webp$/, '.webp') : f
                    if (!groupMap.has(baseName)) {
                      groupMap.set(baseName, { baseName, folder, file: null, thumb: null, fullSize: 0, thumbSize: 0, mtime: 0 })
                    }
                    const entry = groupMap.get(baseName)
                    try {
                      const stat = fs.statSync(path.join(folderDir, f))
                      if (stat.mtimeMs > entry.mtime) entry.mtime = stat.mtimeMs
                      if (isThumb) { entry.thumb = f; entry.thumbSize = stat.size }
                      else { entry.file = f; entry.fullSize = stat.size }
                    } catch {}
                  })
                  groupMap.forEach(entry => {
                    trashItems.push({
                      id: `trash/${folder}/${entry.baseName}`,
                      folder,
                      baseName: entry.baseName,
                      file: entry.file,
                      thumb: entry.thumb,
                      fullSize: entry.fullSize,
                      thumbSize: entry.thumbSize,
                      totalSize: entry.fullSize + entry.thumbSize,
                      mtime: entry.mtime
                    })
                  })
                } catch {}
              })
            }

            res.end(JSON.stringify({
              items,
              trashItems,
              stats: {
                totalActiveCount: items.length,
                totalActiveBytes: items.reduce((s, i) => s + i.totalSize, 0),
                unusedCount: items.filter(i => i.isUnused).length,
                unusedBytes: items.filter(i => i.isUnused).reduce((s, i) => s + i.totalSize, 0),
                trashCount: trashItems.length,
                trashBytes: trashItems.reduce((s, i) => s + i.totalSize, 0)
              }
            }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/media-trash
        if (req.method === 'POST' && req.url === '/__api/media-trash') {
          try {
            const { items } = await readBody()
            const refs = getMediaReferences()
            const moved = []
            const skipped = []
            const trashRoot = path.resolve(__dirname, 'removed-media')
            const imagesRoot = path.resolve(__dirname, 'public/images')

            for (const item of (items || [])) {
              const f1 = item.file ? item.file.toLowerCase() : null
              const f2 = item.thumb ? item.thumb.toLowerCase() : null
              const isReferenced = (f1 && refs[f1] && refs[f1].size > 0) || (f2 && refs[f2] && refs[f2].size > 0)
              if (isReferenced) {
                skipped.push({ ...item, reason: 'Referenced in site content' })
                continue
              }
              const destDir = path.join(trashRoot, item.folder)
              fs.mkdirSync(destDir, { recursive: true })
              const srcDir = path.join(imagesRoot, item.folder)
              if (item.file && fs.existsSync(path.join(srcDir, item.file))) {
                fs.renameSync(path.join(srcDir, item.file), path.join(destDir, item.file))
              }
              if (item.thumb && fs.existsSync(path.join(srcDir, item.thumb))) {
                fs.renameSync(path.join(srcDir, item.thumb), path.join(destDir, item.thumb))
              }
              moved.push(item)
            }
            res.end(JSON.stringify({ success: true, moved, skipped }))
          } catch (err) {
            res.statusCode = 500; res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/media-restore
        if (req.method === 'POST' && req.url === '/__api/media-restore') {
          try {
            const { items } = await readBody()
            const restored = []
            const trashRoot = path.resolve(__dirname, 'removed-media')
            const imagesRoot = path.resolve(__dirname, 'public/images')

            for (const item of (items || [])) {
              const srcDir = path.join(trashRoot, item.folder)
              const destDir = path.join(imagesRoot, item.folder)
              fs.mkdirSync(destDir, { recursive: true })
              if (item.file && fs.existsSync(path.join(srcDir, item.file))) {
                fs.renameSync(path.join(srcDir, item.file), path.join(destDir, item.file))
              }
              if (item.thumb && fs.existsSync(path.join(srcDir, item.thumb))) {
                fs.renameSync(path.join(srcDir, item.thumb), path.join(destDir, item.thumb))
              }
              restored.push(item)
            }
            res.end(JSON.stringify({ success: true, restored }))
          } catch (err) {
            res.statusCode = 500; res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // POST /__api/upload-photo  — content-hash deduplication, 20MB limit, 1400px <=250KB + 480px thumb <=50KB
        if (req.method === 'POST' && (req.url === '/__api/upload-photo' || req.url === '/__api/upload-original')) {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { filename, dataBase64, folder } = JSON.parse(body)
              if (!filename || !dataBase64) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'filename and dataBase64 required' }))
                return
              }

              const buffer = Buffer.from(dataBase64, 'base64')
              const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 // 20 MB
              if (buffer.length > MAX_UPLOAD_BYTES) {
                res.statusCode = 413
                res.end(JSON.stringify({ error: `File exceeds 20 MB limit (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Upload rejected.` }))
                return
              }

              // De-duplicate uploads by content hash so the same photo is stored once
              const contentHash = crypto.createHash('sha256').update(buffer).digest('hex')
              const hashesPath = path.resolve(__dirname, 'public/images/.upload-hashes.json')
              let hashes = {}
              if (fs.existsSync(hashesPath)) {
                try { hashes = JSON.parse(fs.readFileSync(hashesPath, 'utf-8')) } catch {}
              }
              if (hashes[contentHash]) {
                const existing = hashes[contentHash]
                const checkFile = path.resolve(__dirname, 'public', existing.url.replace(/^\//, ''))
                if (fs.existsSync(checkFile)) {
                  res.end(JSON.stringify({
                    success: true,
                    url: existing.url,
                    thumbnailUrl: existing.thumbnailUrl,
                    size: existing.size,
                    deduplicated: true
                  }))
                  return
                }
              }

              let sharp
              try {
                sharp = (await import('sharp')).default
              } catch {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'sharp not installed' }))
                return
              }

              const subFolder = folder === 'gallery'
                ? 'images/gallery'
                : (folder === 'showcase' ? 'images/showcase' : 'images/paintings')
              const outDir = path.resolve(__dirname, 'public', subFolder)
              fs.mkdirSync(outDir, { recursive: true })
              const rawBase = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
              const base = `${rawBase}-${Date.now().toString().slice(-6)}`
              const fullPath = path.join(outDir, `${base}.webp`)
              const thumbPath = path.join(outDir, `${base}-thumb.webp`)

              // 1400px long side targeting <= 250 KB (lower quality step by step, minimum 60)
              let q = 85
              let fullBuf
              while (q >= 60) {
                fullBuf = await sharp(buffer)
                  .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
                  .webp({ quality: q })
                  .toBuffer()
                if (fullBuf.length <= 250 * 1024 || q === 60) break
                q -= 5
              }
              await fs.promises.writeFile(fullPath, fullBuf)

              // 480px thumb targeting <= 50 KB (lower quality step by step, minimum 60)
              let tq = 80
              let thumbBuf
              while (tq >= 60) {
                thumbBuf = await sharp(buffer)
                  .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
                  .webp({ quality: tq })
                  .toBuffer()
                if (thumbBuf.length <= 50 * 1024 || tq === 60) break
                tq -= 5
              }
              await fs.promises.writeFile(thumbPath, thumbBuf)

              const fullSize = fullBuf.length
              const warning = fullSize > 250 * 1024 ? `File is over 250 KB (${Math.round(fullSize / 1024)} KB)` : null
              const uploadedUrl = `/${subFolder}/${base}.webp`
              const thumbUrl = `/${subFolder}/${base}-thumb.webp`

              hashes[contentHash] = {
                url: uploadedUrl,
                thumbnailUrl: thumbUrl,
                size: fullSize
              }
              try {
                fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2), 'utf-8')
              } catch {}

              res.end(JSON.stringify({
                success: true,
                url: uploadedUrl,
                thumbnailUrl: thumbUrl,
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

function excludeGuideFromBuildPlugin() {
  return {
    name: 'exclude-guide-from-build',
    apply: 'build',
    closeBundle() {
      const guideFiles = [
        'Website-Update-Guide.pdf',
        'website-update-guide-preview.webp',
        'website-update-guide-thumb.webp'
      ]
      const distDocs = path.resolve(__dirname, 'dist/docs')
      if (fs.existsSync(distDocs)) {
        for (const file of guideFiles) {
          const filePath = path.join(distDocs, file)
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath)
            } catch {}
          }
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), adminApiPlugin(), excludeGuideFromBuildPlugin()],
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
