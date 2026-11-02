import assert from 'node:assert'
import { normalizeMediaUrl } from '../src/utils/mediaUrl.js'

console.log('--- Testing normalizeMediaUrl ---')

const testDriveId = '1bNea0tffhVG-Qi31rRjzKDRlVGsjItXp'

// 1. Google Drive Form 1: /view
const driveView = normalizeMediaUrl(`https://drive.google.com/file/d/${testDriveId}/view`)
assert.strictEqual(driveView?.type, 'gdrive', 'Drive /view should have type gdrive')
assert.strictEqual(driveView?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`, 'Drive /view should normalize to /preview')
assert.strictEqual(driveView?.isIframe, true)
console.log('✓ Google Drive /view form passes')

// 2. Google Drive Form 2: /edit
const driveEdit = normalizeMediaUrl(`https://drive.google.com/file/d/${testDriveId}/edit?usp=sharing`)
assert.strictEqual(driveEdit?.type, 'gdrive')
assert.strictEqual(driveEdit?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`)
console.log('✓ Google Drive /edit form passes')

// 3. Google Drive Form 3: open?id=
const driveOpen = normalizeMediaUrl(`https://drive.google.com/open?id=${testDriveId}`)
assert.strictEqual(driveOpen?.type, 'gdrive')
assert.strictEqual(driveOpen?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`)
console.log('✓ Google Drive open?id= form passes')

// 4. Google Drive Form 4: uc?id=
const driveUc = normalizeMediaUrl(`https://drive.google.com/uc?id=${testDriveId}`)
assert.strictEqual(driveUc?.type, 'gdrive')
assert.strictEqual(driveUc?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`)
console.log('✓ Google Drive uc?id= form passes')

// Also test uc?export=download&id=
const driveUcExport = normalizeMediaUrl(`https://drive.google.com/uc?export=download&id=${testDriveId}`)
assert.strictEqual(driveUcExport?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`)
console.log('✓ Google Drive uc?export=download&id= form passes')

// Also test /preview directly
const drivePreview = normalizeMediaUrl(`https://drive.google.com/file/d/${testDriveId}/preview`)
assert.strictEqual(drivePreview?.embedUrl, `https://drive.google.com/file/d/${testDriveId}/preview`)
console.log('✓ Google Drive /preview form passes')

// 5. YouTube formats
const ytWatch = normalizeMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
assert.strictEqual(ytWatch?.type, 'youtube')
assert.strictEqual(ytWatch?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')

const ytShort = normalizeMediaUrl('https://youtu.be/dQw4w9WgXcQ')
assert.strictEqual(ytShort?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')

const ytShorts = normalizeMediaUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')
assert.strictEqual(ytShorts?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')

const ytEmbed = normalizeMediaUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
assert.strictEqual(ytEmbed?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')
console.log('✓ YouTube (watch, youtu.be, shorts, embed) formats pass')

// 6. Vimeo
const vimeo = normalizeMediaUrl('https://vimeo.com/76979871')
assert.strictEqual(vimeo?.type, 'vimeo')
assert.strictEqual(vimeo?.embedUrl, 'https://player.vimeo.com/video/76979871')
console.log('✓ Vimeo form passes')

// 7. Google Forms / Docs
const gform = normalizeMediaUrl('https://docs.google.com/forms/d/e/1FAIpQLSc_Example/viewform')
assert.strictEqual(gform?.type, 'gforms')
assert.strictEqual(gform?.embedUrl, 'https://docs.google.com/forms/d/e/1FAIpQLSc_Example/viewform?embedded=true')

const gformExisting = normalizeMediaUrl('https://docs.google.com/forms/d/e/1FAIpQLSc_Example/viewform?embedded=true')
assert.strictEqual(gformExisting?.embedUrl, 'https://docs.google.com/forms/d/e/1FAIpQLSc_Example/viewform?embedded=true')
console.log('✓ Google Forms (with embedded=true) pass')

// 8. Direct Video file
const directMp4 = normalizeMediaUrl('Henry_E._Berube.mp4')
assert.strictEqual(directMp4?.type, 'direct')
assert.strictEqual(directMp4?.isIframe, false)
assert.strictEqual(directMp4?.url, '/Henry_E._Berube.mp4')
console.log('✓ Direct mp4/webm video file passes')

// 9. Generic embed
const generic = normalizeMediaUrl('https://example.com/interactive-widget')
assert.strictEqual(generic?.type, 'generic')
assert.strictEqual(generic?.isIframe, true)
console.log('✓ Generic iframe passes')

console.log('All normalizeMediaUrl unit tests passed successfully!\n')
