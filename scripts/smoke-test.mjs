#!/usr/bin/env node
// scripts/smoke-test.mjs
// Run: npm run check
// Verifies data integrity, build output, and key site features — no browser needed.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

let passed = 0
let failed = 0
const errors = []

function ok(label) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label, detail = '') {
  console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`)
  failed++
  errors.push({ label, detail })
}

function check(label, condition, detail = '') {
  if (condition) ok(label)
  else fail(label, detail)
}

function readJSON(relPath) {
  const abs = path.join(ROOT, relPath)
  if (!fs.existsSync(abs)) return null
  try { return JSON.parse(fs.readFileSync(abs, 'utf-8')) } catch { return null }
}

// ─────────────────────────────────────────────
console.log('\n════════════════════════════════════════')
console.log('  RJB Art Studio — Site Health Check')
console.log('════════════════════════════════════════\n')

// ── 1. JSON DATA FILES ──────────────────────
console.log('── 1. Data files ──────────────────────')

const paintings = readJSON('src/data/paintings.json')
check('paintings.json parses', paintings !== null)
check('paintings.json is an array', Array.isArray(paintings), `got ${typeof paintings}`)
check('paintings.json has entries', Array.isArray(paintings) && paintings.length > 0, `length=${paintings?.length}`)

const playlists = readJSON('src/data/playlists.json')
check('playlists.json parses', playlists !== null)
check('playlists.json is an array', Array.isArray(playlists))

const site = readJSON('src/data/site.json')
check('site.json parses', site !== null)
check('site.json has artist info', !!site?.artist?.name, `name="${site?.artist?.name}"`)
check('site.json has categories', Array.isArray(site?.categories) && site.categories.length > 0)
check('site.json has contact.email', !!(site?.contact?.email), `email="${site?.contact?.email}"`)

const pages = readJSON('src/data/pages.json')
check('pages.json parses', pages !== null)

// ── 2. PLACEHOLDER TEXT CHECK ─────────────────
console.log('\n── 2. Placeholder text ─────────────────')

const siteStr = JSON.stringify(site || {})
const placeholders = ['Lorem ipsum', 'placeholder', 'TODO', 'FIXME', 'your-email@example.com']
for (const ph of placeholders) {
  check(`No "${ph}" in site.json`, !siteStr.toLowerCase().includes(ph.toLowerCase()))
}
check('Artist name set (not empty)', !!(site?.artist?.name?.trim()))
check('Contact email set', !!(site?.contact?.email?.trim()))

// ── 3. STATUS CHECK ──────────────────────────
console.log('\n── 3. Painting status integrity ────────')

if (Array.isArray(paintings)) {
  const sold = paintings.filter(p => p.status === 'Sold' || p.sold)
  const forSale = paintings.filter(p => p.status === 'For Sale')
  ok(`${paintings.length} total paintings in catalog`)
  ok(`${sold.length} marked Sold`)
  ok(`${forSale.length} marked For Sale`)

  // Sold items should not have sold=false
  const inconsistent = paintings.filter(p => p.status === 'Sold' && p.sold === false)
  check('No Sold items with sold=false flag', inconsistent.length === 0, `${inconsistent.length} inconsistent`)

  // Photo-only paintings should have a photo field
  const photoOnly = paintings.filter(p => !p.videoId)
  const photoMissing = photoOnly.filter(p => !p.photo && !p.customImage && !p.thumbnail)
  if (photoOnly.length > 0) {
    check(
      `Photo-only paintings have image (${photoOnly.length} total)`,
      photoMissing.length === 0,
      `${photoMissing.length} missing photo`
    )
  } else {
    ok('No photo-only paintings yet (skipped)')
  }
}

// ── 4. KEY SOURCE FILES ──────────────────────
console.log('\n── 4. Key source files ─────────────────')

const requiredFiles = [
  'src/pages/Admin.jsx',
  'src/pages/Gallery.jsx',
  'src/pages/Home.jsx',
  'src/pages/Commissions.jsx',
  'src/pages/About.jsx',
  'src/pages/Contact.jsx',
  'src/pages/Videos.jsx',
  'src/components/Footer.jsx',
  'src/components/PhotoDropZone.jsx',
  'src/components/PriceListModal.jsx',
  'scripts/publish.mjs',
  'scripts/sync-playlists.mjs',
  'HOW-TO.md',
  'public/docs',
  'public/images/price-lists',
]
for (const f of requiredFiles) {
  check(`${f} exists`, fs.existsSync(path.join(ROOT, f)))
}

// ── 5. PRICE LIST ASSETS ──────────────────────
console.log('\n── 5. Price list assets ─────────────────')

const priceListsDir = path.join(ROOT, 'public/images/price-lists')
const pdfDir = path.join(ROOT, 'public/docs')

const plImages = fs.existsSync(priceListsDir) ? fs.readdirSync(priceListsDir) : []
const plPdfs = fs.existsSync(pdfDir) ? fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf')) : []

check('Price list images directory exists', fs.existsSync(priceListsDir))
check('At least 4 price list images', plImages.length >= 4, `found ${plImages.length}`)
check('PDF docs directory exists', fs.existsSync(pdfDir))
check('At least 1 price list PDF', plPdfs.length >= 1, `found ${plPdfs.length}`)

// ── 6. FOOTER SOCIAL LINKS ────────────────────
console.log('\n── 6. Footer social links ──────────────')

const footerFile = path.join(ROOT, 'src/components/Footer.jsx')
const footerSrc = fs.existsSync(footerFile) ? fs.readFileSync(footerFile, 'utf-8') : ''
check('Footer renders YouTube social icon', footerSrc.includes('Youtube') && footerSrc.includes('socials.youtube'))
check('Footer renders Facebook social icon', footerSrc.includes('Facebook') && footerSrc.includes('socials.facebook'))
check('Footer imports PRICE_LISTS', footerSrc.includes('PRICE_LISTS'))
check('Footer renders price list thumbnails (PRICE_LISTS.map)', footerSrc.includes('PRICE_LISTS.map'))

// ── 7. PRODUCTION BUILD ───────────────────────
console.log('\n── 7. Production build artifacts ───────')

const distDir = path.join(ROOT, 'dist')
const distExists = fs.existsSync(distDir)
check('dist/ directory exists (build ran)', distExists)

if (distExists) {
  const distFiles = fs.readdirSync(distDir)
  check('dist/index.html exists', distFiles.includes('index.html'))

  const assetsDir = path.join(distDir, 'assets')
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir)
    const jsFiles = assets.filter(f => f.endsWith('.js'))
    const cssFiles = assets.filter(f => f.endsWith('.css'))
    check('Built JS assets present', jsFiles.length > 0, `found ${jsFiles.length}`)
    check('Built CSS assets present', cssFiles.length > 0, `found ${cssFiles.length}`)

    // Bundle size check: largest JS chunk should be under 500 KB
    let largestChunkKB = 0
    let largestChunkName = ''
    for (const f of jsFiles) {
      const sz = fs.statSync(path.join(assetsDir, f)).size
      const kb = Math.round(sz / 1024)
      if (kb > largestChunkKB) { largestChunkKB = kb; largestChunkName = f }
    }
    check(
      `Largest JS chunk under 500 KB (${largestChunkName}: ${largestChunkKB} KB)`,
      largestChunkKB < 500
    )
  }

  // Check dist/index.html has no dev-mode artifacts
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')
  check('dist/index.html has <title>', indexHtml.includes('<title>'))
  check('No Vite dev hint in dist HTML', !indexHtml.includes('@vite/client'))
}

// ── 8. SITEMAP ───────────────────────────────
console.log('\n── 8. Sitemap ──────────────────────────')

const sitemapPath = path.join(ROOT, 'public/sitemap.xml')
const hasSitemap = fs.existsSync(sitemapPath)
check('public/sitemap.xml exists', hasSitemap)
if (hasSitemap) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8')
  check('Sitemap has gallery URL', sitemapContent.includes('/gallery'))
  check('Sitemap has contact URL', sitemapContent.includes('/contact'))
}

// ── SUMMARY ───────────────────────────────────
console.log('\n════════════════════════════════════════')
console.log(`  Results: ${passed} passed, ${failed} failed`)
if (errors.length > 0) {
  console.log('\n  Issues to fix:')
  errors.forEach((e, i) => console.log(`    ${i + 1}. ${e.label}${e.detail ? ' — ' + e.detail : ''}`))
  console.log('')
}
console.log('════════════════════════════════════════\n')

if (failed > 0) process.exit(1)
