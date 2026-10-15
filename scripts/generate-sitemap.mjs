#!/usr/bin/env node
// scripts/generate-sitemap.mjs
// Generates public/sitemap.xml at build time, including all playlist pages.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'https://rjb-art-studio.netlify.app'

const PLAYLISTS_PATH = path.resolve(__dirname, '../src/data/playlists.json')
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml')

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/gallery', changefreq: 'weekly', priority: '0.9' },
  { loc: '/videos', changefreq: 'weekly', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/commissions', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
]

function urlEntry({ loc, changefreq, priority }) {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

const playlists = fs.existsSync(PLAYLISTS_PATH)
  ? JSON.parse(fs.readFileSync(PLAYLISTS_PATH, 'utf-8'))
  : []

const playlistEntries = playlists
  .filter(p => p.show !== false)
  .map(p => urlEntry({ loc: `/videos/${p.playlistId}`, changefreq: 'weekly', priority: '0.7' }))

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticPages.map(urlEntry),
  ...playlistEntries,
  '</urlset>'
].join('\n')

fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8')
console.log(`✓ sitemap.xml written with ${staticPages.length + playlistEntries.length} URLs`)
