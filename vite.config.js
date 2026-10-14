import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function adminApiPlugin() {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/__api/')) {
          return next()
        }

        const paintingsPath = path.resolve(__dirname, 'src/data/paintings.json')
        const sitePath = path.resolve(__dirname, 'src/data/site.json')

        res.setHeader('Content-Type', 'application/json')

        // GET /__api/data
        if (req.method === 'GET' && req.url === '/__api/data') {
          const paintings = JSON.parse(fs.readFileSync(paintingsPath, 'utf-8'))
          const site = JSON.parse(fs.readFileSync(sitePath, 'utf-8'))
          res.end(JSON.stringify({ paintings, site }))
          return
        }

        // Helper to read JSON request body
        const readBody = () => new Promise((resolve) => {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              resolve(JSON.parse(body || '{}'))
            } catch (e) {
              resolve({})
            }
          })
        })

        // POST /__api/paintings
        if (req.method === 'POST' && req.url === '/__api/paintings') {
          const { paintings } = await readBody()
          if (Array.isArray(paintings)) {
            fs.writeFileSync(paintingsPath, JSON.stringify(paintings, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true, count: paintings.length }))
          } else {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Expected paintings array' }))
          }
          return
        }

        // POST /__api/site
        if (req.method === 'POST' && req.url === '/__api/site') {
          const { site } = await readBody()
          if (site && typeof site === 'object') {
            fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } else {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Expected site object' }))
          }
          return
        }

        // POST /__api/fetch-youtube
        if (req.method === 'POST' && req.url === '/__api/fetch-youtube') {
          const { url } = await readBody()
          if (!url) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing url' }))
            return
          }

          // Extract video ID
          const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
          const videoId = match ? match[1] : null

          if (!videoId) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid YouTube URL' }))
            return
          }

          let title = `Painting ${videoId}`
          let author = 'Rick J Berube Art Studio'
          try {
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            if (oembedRes.ok) {
              const data = await oembedRes.json()
              if (data.title) title = data.title
              if (data.author_name) author = data.author_name
            }
          } catch (e) {
            // fallback
          }

          // Check maxres thumbnail
          let thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          try {
            const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            const check = await fetch(maxres, { method: 'HEAD' })
            if (check.ok) thumbnail = maxres
          } catch (e) {}

          res.end(JSON.stringify({
            videoId,
            title,
            thumbnail,
            author,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
          }))
          return
        }

        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Endpoint not found' }))
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  server: {
    port: 5180,
    open: false
  }
})
