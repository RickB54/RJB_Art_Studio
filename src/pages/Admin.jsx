import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Youtube, Save, Trash2, Edit3, CheckCircle2, AlertCircle, RefreshCw, Upload, Globe, Film, Layers, Eye, EyeOff, ArrowUp, ArrowDown, Link as LinkIcon, RotateCcw, Search, X, ChevronDown, Mail, FileText, Award, Sparkles, Image as ImageIcon, Maximize2, Download } from 'lucide-react'
import siteDataInitial from '../data/site.json'
import paintingsDataInitial from '../data/paintings.json'
import pagesDataInitial from '../data/pages.json'
import pagesDefaultInitial from '../data/pages.default.json'
import PhotoDropZone from '../components/PhotoDropZone'
import AdminBlockSlot from '../components/AdminBlockSlot'
import PriceListModal from '../components/PriceListModal'

const HOME_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page (Above Hero)' },
  { id: 'after_hero', label: 'After Hero Section' },
  { id: 'after_featured', label: 'After Featured Artworks' },
  { id: 'after_teaser', label: 'After About Rick Teaser' },
  { id: 'bottom', label: 'Bottom of Page' },
]

const ABOUT_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header / Bio' },
  { id: 'after_journey', label: 'After Artistic Journey' },
  { id: 'after_awards', label: 'After Awards & Recognitions' },
  { id: 'after_studio', label: 'After Studio Tour & Process' },
  { id: 'after_cta', label: 'After Inquiries & Commissions Banner' },
  { id: 'bottom', label: 'Bottom of Page' },
]

const COMMISSIONS_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'after_cards', label: 'After Service Cards' },
  { id: 'after_watercolor', label: 'After Watercolor Notice' },
  { id: 'after_process', label: 'After 4-Step Process' },
  { id: 'after_pricing_notice', label: 'After Pricing Notice' },
  { id: 'after_form', label: 'After Request Form' },
  { id: 'bottom', label: 'Bottom of Page' },
]

const GALLERY_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_filters', label: 'After Search & Filters' },
  { id: 'bottom', label: 'Bottom of Page' },
]

const VIDEOS_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'bottom', label: 'Bottom of Page' },
]

const CONTACT_BLOCK_SLOTS = [
  { id: 'top', label: 'Top of Page' },
  { id: 'after_header', label: 'After Header' },
  { id: 'after_form', label: 'After Form & Channels' },
  { id: 'bottom', label: 'Bottom of Page' },
]

export default function Admin() {
  const [paintings, setPaintings] = useState(paintingsDataInitial)
  const [site, setSite] = useState(siteDataInitial)
  const [pages, setPages] = useState(pagesDataInitial)
  const [playlists, setPlaylists] = useState([])
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'bulk' | 'manage' | 'playlists' | 'site'
  const [paintingMode, setPaintingMode] = useState('photo') // 'youtube' | 'photo'
  const [editPageSection, setEditPageSection] = useState('home') // 'home' | 'about' | 'commissions' | 'contact'
  const [siteSaveSuccess, setSiteSaveSuccess] = useState('')
  const [savedPagesSnapshot, setSavedPagesSnapshot] = useState(() => JSON.stringify(pagesDataInitial))
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkStatusValue, setBulkStatusValue] = useState('For Sale')
  const [quickPhotoId, setQuickPhotoId] = useState(null)
  const [newExtraCat, setNewExtraCat] = useState('')
  const [showcaseSearch, setShowcaseSearch] = useState('')
  const [showcaseExpandedId, setShowcaseExpandedId] = useState(null)
  const [activeGuideModal, setActiveGuideModal] = useState(null)
  
  // Single painting form state
  const [inputUrl, setInputUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    category: 'Landscapes & Seascapes',
    categories: ['Landscapes & Seascapes'],
    year: new Date().getFullYear().toString(),
    medium: 'Oil on Canvas',
    size: '16x20',
    description: '',
    status: 'For Sale',
    sold: false,
    price: '',
    youtubeUrl: '',
    videoId: '',
    thumbnail: '',
    thumbnailUrl: '',
    photo: '',
    customImage: '',
    originalImage: '',
    fineArtAmericaUrl: '',
    featured: false
  })

  // Bulk input state
  const [bulkText, setBulkText] = useState('')
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkResult, setBulkResult] = useState('')

  // Playlist tab state
  const [plSyncing, setPlSyncing] = useState({})
  const [plSyncMsg, setPlSyncMsg] = useState('')
  const [missingKey, setMissingKey] = useState(false)
  const [domainReplaceCount, setDomainReplaceCount] = useState(null)
  const [newPlaylistInput, setNewPlaylistInput] = useState('')
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [addingPlaylist, setAddingPlaylist] = useState(false)

  // Load latest data on mount
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings) setPaintings(data.paintings)
        if (data.site) setSite(data.site)
        if (data.playlists) setPlaylists(data.playlists)
        if (data.pages) {
          setPages(data.pages)
          setSavedPagesSnapshot(JSON.stringify(data.pages))
        }
      })
      .catch(() => {})
  }, [])

  // Save playlists helper
  const savePlaylists = async (updated) => {
    await fetch('/__api/playlists', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists: updated })
    })
    setPlaylists(updated)
  }

  // Sync single playlist
  const syncPlaylist = async (playlistId) => {
    setPlSyncing(prev => ({ ...prev, [playlistId]: true }))
    setPlSyncMsg(''); setMissingKey(false)
    try {
      const res = await fetch('/__api/sync-playlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId })
      })
      const data = await res.json()
      if (data.missingKey) { setMissingKey(true); setPlSyncMsg(data.error); return }
      if (data.error) throw new Error(data.error)
      setPlSyncMsg(`✓ Synced "${playlists.find(p=>p.playlistId===playlistId)?.title}" — ${data.count} videos (${data.added} new)`)
      // Reload
      const fresh = await fetch('/__api/data').then(r => r.json())
      if (fresh.playlists) setPlaylists(fresh.playlists)
    } catch (err) { setPlSyncMsg(`✗ ${err.message}`) }
    setPlSyncing(prev => ({ ...prev, [playlistId]: false }))
  }

  // Sync all visible playlists sequentially
  const syncAllPlaylists = async () => {
    for (const pl of playlists.filter(p => p.show !== false)) {
      await syncPlaylist(pl.playlistId)
    }
  }

  // Extract YouTube playlist ID from URL or raw ID
  const extractPlaylistId = (str) => {
    if (!str) return null
    const trimmed = str.trim()
    const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i)
    if (match) return match[1]
    if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed
    return null
  }

  // Add a playlist by pasting its YouTube playlist URL or ID, then sync fills it
  const handleAddPlaylist = async (e) => {
    e?.preventDefault()
    const id = extractPlaylistId(newPlaylistInput)
    if (!id) {
      alert('Please enter a valid YouTube Playlist URL or ID (e.g. PL...)')
      return
    }

    if (playlists.some(p => p.playlistId === id)) {
      alert('Playlist already exists in manager!')
      return
    }

    setAddingPlaylist(true)
    let title = newPlaylistTitle.trim() || `Playlist ${id}`
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/playlist?list=${id}`)
      if (res.ok) {
        const d = await res.json()
        if (d.title && !newPlaylistTitle.trim()) title = d.title
      }
    } catch {}

    const newPl = {
      playlistId: id,
      title,
      order: playlists.length + 1,
      show: true,
      videoCount: 0,
      coverVideoId: '',
      videos: []
    }

    const updated = [...playlists, newPl]
    await savePlaylists(updated)
    setNewPlaylistInput('')
    setNewPlaylistTitle('')
    setAddingPlaylist(false)

    // Sync fills it
    await syncPlaylist(id)
  }

  // Move playlist up/down
  const movePl = (idx, dir) => {
    const arr = [...playlists]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
    arr.forEach((p, i) => { p.order = i + 1 })
    savePlaylists(arr)
  }

  // Count rjbartstudio.com mentions in all descriptions
  const countOldDomain = () => {
    let count = 0
    for (const pl of playlists) {
      for (const v of pl.videos || []) {
        if (v.description && v.description.includes('rjbartstudio.com')) count++
      }
    }
    for (const p of paintings) {
      if (p.description && p.description.includes('rjbartstudio.com')) count++
    }
    setDomainReplaceCount(count)
  }

  // Replace old domain
  const replaceOldDomain = async () => {
    const OLD = 'rjbartstudio.com'
    const NEW = siteData.artist?.siteUrl || 'https://rjbart.netlify.app'
    const updatedPlaylists = playlists.map(pl => ({
      ...pl,
      videos: (pl.videos || []).map(v => ({
        ...v,
        description: v.description ? v.description.replace(new RegExp(OLD, 'g'), NEW) : v.description
      }))
    }))
    const updatedPaintings = paintings.map(p => ({
      ...p,
      description: p.description ? p.description.replace(new RegExp(OLD, 'g'), NEW) : p.description
    }))
    await savePlaylists(updatedPlaylists)
    await fetch('/__api/paintings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paintings: updatedPaintings })
    })
    setPaintings(updatedPaintings)
    setDomainReplaceCount(0)
    setPlSyncMsg('✓ Old domain replaced in all descriptions.')
  }

  // Handle single URL fetch
  const handleFetchUrl = async () => {
    if (!inputUrl.trim()) return
    setFetching(true)
    setFetchError('')
    setSaveSuccess('')

    try {
      const res = await fetch('/__api/fetch-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl })
      })

      if (!res.ok) {
        throw new Error('Could not fetch YouTube video details. Check the link.')
      }

      const data = await res.json()
      
      // Auto-detect year if in title
      const yearMatch = data.title.match(/\b(20\d{2})\b/)
      const detectedYear = yearMatch ? yearMatch[1] : form.year

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        youtubeUrl: data.youtubeUrl || inputUrl,
        videoId: data.videoId || prev.videoId,
        thumbnail: data.thumbnail || prev.thumbnail,
        year: detectedYear
      }))
    } catch (err) {
      setFetchError(err.message || 'Fetch failed')
    } finally {
      setFetching(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      category: 'Landscapes & Seascapes',
      categories: ['Landscapes & Seascapes'],
      year: new Date().getFullYear().toString(),
      medium: 'Oil on Canvas',
      size: '16x20',
      description: '',
      status: 'For Sale',
      sold: false,
      price: '',
      youtubeUrl: '',
      videoId: '',
      thumbnail: '',
      thumbnailUrl: '',
      photo: '',
      customImage: '',
      originalImage: '',
      fineArtAmericaUrl: '',
      featured: false
    })
    setEditingId(null)
    setInputUrl('')
  }

  // Save single painting
  const handleSavePainting = async (e) => {
    e.preventDefault()
    setSaveSuccess('')

    const paintingId = editingId || (form.videoId ? `video-${form.videoId}` : `photo-${Date.now()}`)
    const primaryCategory = Array.isArray(form.categories) && form.categories.length ? form.categories[0] : (form.category || 'Landscapes & Seascapes')
    const finalCategories = Array.isArray(form.categories) && form.categories.length ? form.categories : [primaryCategory]
    const status = form.status || (form.sold ? 'Sold' : (form.price ? 'For Sale' : ''))
    const sold = status === 'Sold'

    const newEntry = {
      id: paintingId,
      ...form,
      category: primaryCategory,
      categories: finalCategories,
      status: status,
      sold: sold,
      price: form.price ? Number(form.price) : null,
      photo: form.photo || form.customImage || '',
      customImage: form.photo || form.customImage || '',
      originalImage: form.photo || form.customImage || '',
      thumbnail: form.thumbnailUrl || form.thumbnail || form.photo || '',
      thumbnailUrl: form.thumbnailUrl || form.thumbnail || form.photo || ''
    }

    let updatedList
    if (editingId) {
      updatedList = paintings.map(p => p.id === editingId ? newEntry : p)
    } else {
      updatedList = [newEntry, ...paintings.filter(p => p.id !== paintingId)]
    }

    try {
      const res = await fetch('/__api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: updatedList })
      })

      if (res.ok) {
        setPaintings(updatedList)
        setSaveSuccess(`Painting "${form.title}" saved successfully!`)
        resetForm()
      }
    } catch (err) {
      alert('Error saving painting: ' + err.message)
    }
  }

  // Handle multiple photos upload at once
  const handleMultiplePhotoUpload = async (results) => {
    const primaryCategory = Array.isArray(form.categories) && form.categories.length ? form.categories[0] : (form.category || 'Landscapes & Seascapes')
    const finalCategories = Array.isArray(form.categories) && form.categories.length ? form.categories : [primaryCategory]
    
    const newItems = results.map((r, i) => {
      const raw = r.filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
      const title = raw.charAt(0).toUpperCase() + raw.slice(1)
      const id = `photo-${Date.now()}-${i}`
      return {
        id,
        title,
        category: primaryCategory,
        categories: finalCategories,
        year: form.year || new Date().getFullYear().toString(),
        medium: form.medium || 'Oil on Canvas',
        size: form.size || '16x20',
        description: form.description || '',
        status: form.status || 'For Sale',
        sold: form.status === 'Sold',
        price: form.price ? Number(form.price) : null,
        photo: r.url,
        customImage: r.url,
        originalImage: r.url,
        thumbnail: r.thumbnailUrl || r.url,
        thumbnailUrl: r.thumbnailUrl || r.url,
        youtubeUrl: '',
        videoId: '',
        fineArtAmericaUrl: form.fineArtAmericaUrl || '',
        featured: false
      }
    })

    const updatedList = [...newItems, ...paintings]
    try {
      const res = await fetch('/__api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: updatedList })
      })
      if (res.ok) {
        setPaintings(updatedList)
        setSaveSuccess(`Added ${newItems.length} new photo paintings to catalog!`)
      }
    } catch (err) {
      alert('Error saving paintings: ' + err.message)
    }
  }

  // Quick status change from catalog list
  const handleQuickStatusChange = async (item, newStatus) => {
    const isSold = newStatus === 'Sold'
    const updated = paintings.map(p => {
      if (p.id === item.id || (item.videoId && p.videoId === item.videoId)) {
        return { ...p, status: newStatus, sold: isSold }
      }
      return p
    })
    setPaintings(updated)
    await fetch('/__api/paintings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paintings: updated })
    })
  }

  // Quick photo upload directly onto catalog item
  const handleQuickPhotoUpload = async (item, file) => {
    try {
      const { uploadImageFile } = await import('../components/PhotoDropZone')
      const res = await uploadImageFile(file)
      const updated = paintings.map(p => {
        if (p.id === item.id || (item.videoId && p.videoId === item.videoId)) {
          return {
            ...p,
            photo: res.url,
            customImage: res.url,
            originalImage: res.url,
            thumbnail: res.thumbnailUrl || res.url,
            thumbnailUrl: res.thumbnailUrl || res.url
          }
        }
        return p
      })
      setPaintings(updated)
      await fetch('/__api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: updated })
      })
      alert(`Photo attached to "${item.title}"!`)
    } catch (e) {
      alert('Upload failed: ' + e.message)
    }
  }

  // Update item photo directly (from PhotoDropZone)
  const handleUpdateItemPhoto = async (item, url, thumb) => {
    const updated = paintings.map(p => {
      if (p.id === item.id || (item.videoId && p.videoId === item.videoId)) {
        return {
          ...p,
          photo: url,
          customImage: url,
          originalImage: url,
          thumbnail: thumb || url,
          thumbnailUrl: thumb || url
        }
      }
      return p
    })
    setPaintings(updated)
    await fetch('/__api/paintings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paintings: updated })
    })
  }

  // Bulk status update
  const handleApplyBulkStatus = async () => {
    if (selectedIds.size === 0) return
    const isSold = bulkStatusValue === 'Sold'
    const updated = paintings.map(p => {
      if (selectedIds.has(p.id)) {
        return { ...p, status: bulkStatusValue, sold: isSold }
      }
      return p
    })
    setPaintings(updated)
    await fetch('/__api/paintings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paintings: updated })
    })
    alert(`Updated status to "${bulkStatusValue || 'None'}" for ${selectedIds.size} artwork item(s)!`)
    setSelectedIds(new Set())
  }

  const toggleSelectId = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paintings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paintings.map(p => p.id)))
    }
  }

  // Toggle hide / show
  const handleToggleHide = async (item) => {
    const updated = paintings.map(p => {
      if (p.id === item.id) {
        return { ...p, hide: !p.hide }
      }
      return p
    })
    setPaintings(updated)
    await fetch('/__api/paintings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paintings: updated })
    })
  }

  // Delete painting
  const handleDeletePainting = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    const updated = paintings.filter(p => p.id !== id)
    try {
      const res = await fetch('/__api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: updated })
      })
      if (res.ok) setPaintings(updated)
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  // Edit painting (populate form)
  const handleEditClick = (p) => {
    setEditingId(p.id)
    const pCats = Array.isArray(p.categories) && p.categories.length ? p.categories : (p.category ? [p.category] : ['Landscapes & Seascapes'])
    setForm({
      title: p.title || '',
      category: pCats[0] || 'Landscapes & Seascapes',
      categories: pCats,
      year: p.year || new Date().getFullYear().toString(),
      medium: p.medium || 'Oil on Canvas',
      size: p.size || '16x20',
      description: p.description || '',
      status: p.status || (p.sold ? 'Sold' : (p.price ? 'For Sale' : '')),
      sold: !!(p.sold || p.status === 'Sold'),
      price: p.price ? p.price.toString() : '',
      youtubeUrl: p.youtubeUrl || (p.videoId ? `https://www.youtube.com/watch?v=${p.videoId}` : ''),
      videoId: p.videoId || '',
      thumbnail: p.thumbnail || '',
      thumbnailUrl: p.thumbnailUrl || p.thumbnail || '',
      photo: p.photo || p.customImage || p.originalImage || '',
      customImage: p.customImage || p.photo || '',
      originalImage: p.originalImage || p.photo || '',
      fineArtAmericaUrl: p.fineArtAmericaUrl || '',
      featured: !!p.featured
    })
    setInputUrl(p.youtubeUrl || (p.videoId ? `https://www.youtube.com/watch?v=${p.videoId}` : ''))
    setPaintingMode(p.videoId ? 'youtube' : 'photo')
    setActiveTab('single')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Bulk Process "URL | Name": if Name matches a playlist (case-insensitive) add video to it, otherwise warn
  const handleBulkProcess = async () => {
    if (!bulkText.trim()) return
    setBulkProcessing(true)
    setBulkResult('')

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    let addedCount = 0
    let warnings = []
    let currentPlaylists = [...playlists]

    for (let line of lines) {
      let [url, name] = line.split('|').map(s => s ? s.trim() : '')
      if (!url) continue

      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
      const videoId = match ? match[1] : null

      if (!videoId) {
        warnings.push(`✗ Invalid YouTube URL: "${line}"`)
        continue
      }

      if (!name) {
        warnings.push(`⚠ Warning: Missing playlist name for URL "${url}". Required format: "URL | Name"`)
        continue
      }

      const targetPlaylistIndex = currentPlaylists.findIndex(
        p => p.title && p.title.trim().toLowerCase() === name.toLowerCase()
      )

      if (targetPlaylistIndex === -1) {
        warnings.push(`⚠ Warning: Playlist "${name}" does not match any existing playlist (case-insensitive). Video ${videoId} was NOT added. Available playlists: ${currentPlaylists.map(p => p.title).join(', ')}`)
        continue
      }

      const targetPlaylist = { ...currentPlaylists[targetPlaylistIndex] }
      const videos = targetPlaylist.videos ? [...targetPlaylist.videos] : []
      if (videos.some(v => v.id === videoId)) {
        warnings.push(`ℹ Video ${videoId} is already in playlist "${targetPlaylist.title}".`)
        continue
      }

      let title = `Painting ${videoId}`
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          if (data.title) title = data.title
        }
      } catch (e) {}

      videos.unshift({
        id: videoId,
        title,
        description: '',
        hide: false
      })

      targetPlaylist.videos = videos
      targetPlaylist.videoCount = videos.length
      if (!targetPlaylist.coverVideoId) targetPlaylist.coverVideoId = videoId
      currentPlaylists[targetPlaylistIndex] = targetPlaylist
      addedCount++
    }

    if (addedCount > 0) {
      try {
        await savePlaylists(currentPlaylists)
      } catch (e) {
        warnings.push('Error saving playlists: ' + e.message)
      }
    }

    let summary = `Successfully added ${addedCount} video(s) to matching playlists.`
    if (warnings.length > 0) {
      summary += '\n\n' + warnings.join('\n')
    }
    setBulkResult(summary)
    if (addedCount > 0 && warnings.length === 0) setBulkText('')
    setBulkProcessing(false)
  }

  // Save Site Settings & Page Content
  const handleSaveSite = async (e) => {
    e.preventDefault()
    setSiteSaveSuccess('')
    try {
      const [resSite, resPages] = await Promise.all([
        fetch('/__api/site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site })
        }),
        fetch('/__api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages })
        })
      ])
      if (resSite.ok && resPages.ok) {
        setSavedPagesSnapshot(JSON.stringify(pages))
        setSiteSaveSuccess('✓ Site content and page text successfully saved to src/data/pages.json!')
        setTimeout(() => setSiteSaveSuccess(''), 6000)
      } else {
        throw new Error('Save failed')
      }
    } catch (e) {
      alert('Failed to save data: ' + e.message)
    }
  }

  const hasUnsavedChangesForSection = (sectionKey) => {
    try {
      const snap = JSON.parse(savedPagesSnapshot)
      if (sectionKey === 'footerHeader') {
        const currentF = pages.footer || {}
        const savedF = snap.footer || {}
        const currentH = pages.header || {}
        const savedH = snap.header || {}
        return JSON.stringify(currentF) !== JSON.stringify(savedF) || JSON.stringify(currentH) !== JSON.stringify(savedH)
      }
      const current = pages[sectionKey] || {}
      const saved = snap[sectionKey] || {}
      return JSON.stringify(current) !== JSON.stringify(saved)
    } catch (_) {
      return false
    }
  }

  const handleSwitchPageSection = (nextSection) => {
    if (nextSection === editPageSection) return
    if (hasUnsavedChangesForSection(editPageSection)) {
      const proceed = window.confirm(
        `You have unsaved changes on "${editPageSection.toUpperCase()}" page. Do you want to switch pages without saving?`
      )
      if (!proceed) return
    }
    setEditPageSection(nextSection)
  }

  const handleSwitchTab = (nextTab) => {
    if (activeTab === 'site' && nextTab !== 'site') {
      if (hasUnsavedChangesForSection(editPageSection)) {
        const proceed = window.confirm(
          `You have unsaved changes on "${editPageSection.toUpperCase()}" page. Do you want to leave without saving?`
        )
        if (!proceed) return
      }
    }
    setActiveTab(nextTab)
  }

  const handleChoosePageFromDropdown = (nextSection) => {
    if (!nextSection) return
    if (activeTab === 'site' && nextSection === editPageSection) return
    if (hasUnsavedChangesForSection(editPageSection)) {
      const proceed = window.confirm(
        `You have unsaved changes on "${editPageSection.toUpperCase()}" page. Do you want to switch pages without saving?`
      )
      if (!proceed) return
    }
    setEditPageSection(nextSection)
    setActiveTab('site')
  }

  const updatePageBlockSlot = (sectionKey, slotId, newBlocks) => {
    const curSection = pages[sectionKey] || {}
    const curSlots = curSection.blockSlots || {}
    setPages({
      ...pages,
      [sectionKey]: {
        ...curSection,
        blockSlots: {
          ...curSlots,
          [slotId]: newBlocks
        }
      }
    })
  }

  const moveBlockBetweenSlots = (sectionKey, fromSlotId, toSlotId, blockIndex, insertAt) => {
    const curSection = pages[sectionKey] || {}
    const curSlots = curSection.blockSlots || {}
    const fromList = [...(curSlots[fromSlotId] || (fromSlotId === 'bottom' ? curSection.extraBlocks || curSection.blocks : []) || [])]
    const toList = [...(curSlots[toSlotId] || (toSlotId === 'bottom' ? curSection.extraBlocks || curSection.blocks : []) || [])]
    const [moved] = fromList.splice(blockIndex, 1)
    if (!moved) return
    if (insertAt === 'start') {
      toList.unshift(moved)
    } else {
      toList.push(moved)
    }
    setPages({
      ...pages,
      [sectionKey]: {
        ...curSection,
        blockSlots: {
          ...curSlots,
          [fromSlotId]: fromList,
          [toSlotId]: toList
        }
      }
    })
  }

  const renderBlockSlotsEditor = (sectionKey, slotsList, sectionTitle) => (
    <div className="pt-6 border-t border-white/10 space-y-4">
      <div>
        <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
          Custom Content Blocks Between Sections
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Add custom content blocks (photos, text, cards, notices, buttons, videos, embeds) between sections on the {sectionTitle}. Changes save when you click Save Page Content Changes.
        </p>
      </div>
      <div className="space-y-4">
        {slotsList.map((slot, sIdx) => {
          const pageObj = pages[sectionKey] || {}
          const slotBlocks = pageObj.blockSlots?.[slot.id] || (slot.id === 'bottom' ? pageObj.extraBlocks || pageObj.blocks : []) || []
          const prevSlot = sIdx > 0 ? slotsList[sIdx - 1] : null
          const nextSlot = sIdx < slotsList.length - 1 ? slotsList[sIdx + 1] : null
          return (
            <div key={slot.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="px-3.5 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider flex items-center gap-1.5">
                  <span>Slot:</span>
                  <span className="text-white">{slot.label}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {slotBlocks.length} block{slotBlocks.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="p-3">
                <AdminBlockSlot
                  slotId={slot.id}
                  label={slot.label}
                  blocks={slotBlocks}
                  onUpdate={newBlocks => updatePageBlockSlot(sectionKey, slot.id, newBlocks)}
                  onMoveToPrevSlot={prevSlot ? (bIdx) => moveBlockBetweenSlots(sectionKey, slot.id, prevSlot.id, bIdx, 'end') : null}
                  onMoveToNextSlot={nextSlot ? (bIdx) => moveBlockBetweenSlots(sectionKey, slot.id, nextSlot.id, bIdx, 'start') : null}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const restoreDefaultSection = (sectionKey, sectionName) => {
    if (window.confirm(`Restore original shipped text for ${sectionName}? Any unsaved changes on this page will be replaced with defaults.`)) {
      if (sectionKey === 'footerHeader' || sectionKey === 'footer') {
        setPages(prev => ({
          ...prev,
          footer: JSON.parse(JSON.stringify(pagesDefaultInitial.footer || {})),
          header: JSON.parse(JSON.stringify(pagesDefaultInitial.header || {}))
        }))
      } else if (pagesDefaultInitial[sectionKey]) {
        setPages(prev => ({
          ...prev,
          [sectionKey]: JSON.parse(JSON.stringify(pagesDefaultInitial[sectionKey]))
        }))
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner with Exit Admin & View Website */}
      <div className="glass-panel p-6 rounded-2xl border border-studio-gold/30 bg-gradient-to-r from-studio-purple/20 via-studio-card to-studio-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-studio-gold text-black uppercase tracking-wider">
              Local Admin
            </span>
            <span className="text-xs text-slate-400">Only runs on your computer</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Studio Backend & Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Edit page text, manage paintings, sync playlists, and update contact settings without writing code.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-rose-950/80 hover:border-rose-500/40 hover:text-rose-200 border border-white/10 text-white transition flex items-center justify-center gap-2 shadow-sm"
            title="Exit Admin Console and return to public website"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Exit Admin</span>
          </Link>
          <a
            href="http://localhost:5180/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-studio-magenta hover:bg-studio-fuchsia text-white shadow-glow-magenta transition flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>View Website</span>
            <span className="text-[10px] text-white/70">↗</span>
          </a>
          <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs space-y-1">
            <p className="text-studio-gold font-semibold">Publish changes to live site:</p>
            <p className="text-slate-300">Run <code className="text-studio-magenta font-mono bg-white/5 px-1 py-0.5 rounded">npm run publish</code></p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[['single', editingId ? 'Edit Painting' : 'Add Single Painting'],
            ['bulk', 'Bulk Importer'],
            ['manage', `Paintings (${paintings.length})`],
            ['playlists', `Playlists (${playlists.length})`],
            ['help', '? Help']
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => handleSwitchTab(key)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === key
                  ? (key === 'help' ? 'bg-studio-gold text-black shadow' : 'bg-studio-magenta text-white shadow-glow-magenta')
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Page Editor Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="admin-page-select" className="text-xs text-slate-300 font-semibold hidden sm:inline">
            Edit a page:
          </label>
          <select
            id="admin-page-select"
            value={activeTab === 'site' ? editPageSection : ''}
            onChange={e => handleChoosePageFromDropdown(e.target.value)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
              activeTab === 'site'
                ? 'bg-studio-magenta text-white border-studio-magenta shadow-glow-magenta'
                : 'bg-[#13111c] text-slate-300 border-white/15 hover:border-studio-magenta/60 hover:text-white'
            }`}
          >
            <option value="" disabled>Edit a page...</option>
            <option value="home">Home</option>
            <option value="gallery">Gallery</option>
            <option value="about">About</option>
            <option value="commissions">Commissions & Prints</option>
            <option value="videos">Videos</option>
            <option value="contact">Contact</option>
            <option value="footerHeader">Header & Footer</option>
          </select>
        </div>
      </div>

      {/* TAB 1: Single Painting Form */}
      {activeTab === 'single' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                {editingId ? `Editing: ${form.title}` : (paintingMode === 'photo' ? 'Add Photo-Only Painting' : 'Add Painting from YouTube')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {paintingMode === 'photo'
                  ? 'Upload high-resolution painting photos. Multiple photos can be uploaded at once to create multiple entries.'
                  : 'Paste any video link from your channel. The title and highest-quality thumbnail will be fetched automatically.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mode switch: From YouTube video / Photo only */}
              {!editingId && (
                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaintingMode('photo')}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                      paintingMode === 'photo' ? 'bg-studio-magenta text-white shadow-glow-magenta' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaintingMode('youtube')}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                      paintingMode === 'youtube' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>From YouTube video</span>
                  </button>
                </div>
              )}

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-studio-gold hover:underline whitespace-nowrap"
                >
                  Cancel Edit Mode
                </button>
              )}
            </div>
          </div>

          {/* Quick URL Fetch Bar for YouTube mode */}
          {paintingMode === 'youtube' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                YouTube Video URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={fetching || !inputUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                  <span>Fetch Info</span>
                </button>
              </div>
              {fetchError && <p className="text-xs text-rose-400">{fetchError}</p>}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Painting Details Form */}
          <form onSubmit={handleSavePainting} className="space-y-6 pt-2">
            
            {/* PhotoDropZone Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-studio-gold uppercase tracking-wider">
                  {paintingMode === 'photo' ? 'Artwork Photo Upload (Required for Photo Paintings)' : 'High-Resolution Artwork Photo (Optional Override for Thumbnail)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Resized to 1600px WebP + 500px thumb (JPG, PNG, WebP)
                </span>
              </div>
              <PhotoDropZone
                value={form.photo || form.customImage || ''}
                label="Artwork Photo"
                allowMultiple={!editingId}
                onChange={(url, thumb, filename) => {
                  let nextTitle = form.title
                  if ((!nextTitle || nextTitle.startsWith('Untitled')) && filename) {
                    const raw = filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
                    nextTitle = raw.charAt(0).toUpperCase() + raw.slice(1)
                  }
                  setForm(prev => ({
                    ...prev,
                    title: nextTitle || prev.title,
                    photo: url,
                    customImage: url,
                    originalImage: url,
                    thumbnail: thumb || url,
                    thumbnailUrl: thumb || url
                  }))
                }}
                onMultipleUpload={handleMultiplePhotoUpload}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Thumbnail / Image Preview */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-300">Image Preview</span>
                <div className="aspect-[4/3] rounded-xl bg-studio-surface border border-white/10 overflow-hidden flex items-center justify-center relative">
                  {(form.photo || form.customImage || form.thumbnail) ? (
                    <img src={form.photo || form.customImage || form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">No image yet</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Video ID: <span className="font-mono text-studio-magenta">{form.videoId || 'None (Photo-only)'}</span>
                </p>
              </div>

              {/* Title & Basic Meta */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Painting Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    placeholder="e.g. Autumn Sunrise in the White Mountains"
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>

                {/* Categories: Multi-select pill checkboxes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Categories (Select one or more for gallery pills)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 max-h-36 overflow-y-auto">
                    {Array.from(new Set([
                      ...site.categories.filter(c => c !== 'All'),
                      ...(site.extraCategories || []),
                      ...playlists.map(p => p.title)
                    ])).map(cat => {
                      const selected = (form.categories || []).includes(cat) || form.category === cat
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => {
                            const cur = form.categories || [form.category].filter(Boolean)
                            const next = selected
                              ? cur.filter(c => c !== cat)
                              : [...cur, cat]
                            const primary = next[0] || 'Landscapes & Seascapes'
                            setForm({ ...form, categories: next, category: primary })
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                            selected
                              ? 'bg-studio-magenta text-white shadow-glow-magenta'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400'
                          }`}
                        >
                          <span>{selected ? '✓' : '+'}</span>
                          <span>{cat}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Year Created</label>
                    <input
                      type="text"
                      value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Medium</label>
                    <input
                      type="text"
                      value={form.medium}
                      placeholder="Oil on Canvas"
                      onChange={e => setForm({ ...form, medium: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Dimensions / Size</label>
                    <input
                      type="text"
                      value={form.size}
                      placeholder="16x20"
                      onChange={e => setForm({ ...form, size: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Sales, Status & Links */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-white/5">
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status Badge</label>
                <select
                  value={form.status || (form.sold ? 'Sold' : '')}
                  onChange={e => {
                    const val = e.target.value
                    setForm({ ...form, status: val, sold: val === 'Sold' })
                  }}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="">None (No badge)</option>
                  <option value="For Sale">For Sale</option>
                  <option value="Sold">Sold</option>
                  <option value="Not Available for Sale">Not Available for Sale</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Price (USD) - Optional</label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Optional Video URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={e => {
                    const url = e.target.value
                    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
                    const vid = match ? match[1] : form.videoId
                    setForm({ ...form, youtubeUrl: url, videoId: vid })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fine Art America URL (Prints)</label>
                <input
                  type="url"
                  placeholder="https://fineartamerica.com/..."
                  value={form.fineArtAmericaUrl}
                  onChange={e => setForm({ ...form, fineArtAmericaUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

            </div>

            {/* Featured on Home Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="featuredToggle"
                checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded text-studio-magenta focus:ring-studio-magenta cursor-pointer"
              />
              <label htmlFor="featuredToggle" className="text-xs font-medium text-slate-200 cursor-pointer">
                Feature on Home Page showcase ("Explore Highlighted Paintings")
              </label>
            </div>

            {/* Description (Rich Text preserving line breaks) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Painting Description & Sales Story (Keeps line breaks and clickable links)
              </label>
              <textarea
                rows={5}
                placeholder="Share the inspiration, background story, colors used, or purchase details..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-studio-magenta font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="submit"
                className="px-7 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Save Changes' : 'Save Painting to Gallery'}</span>
              </button>
            </div>

          </form>

        </div>
      )}


      {/* TAB 2: Bulk YouTube Importer */}
      {activeTab === 'bulk' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Bulk YouTube Video Importer</h2>
            <p className="text-xs text-slate-400 mt-1">
              Paste YouTube URLs with a playlist name separated by a pipe (<code className="text-studio-gold">URL | Name</code>). If the Name matches a playlist (case-insensitive), the video is added to it; otherwise a warning is displayed.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-slate-400 font-mono space-y-1">
            <p className="text-studio-gold font-semibold">Format: URL | Name</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID1 | Floral</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID2 | Wildlife</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID3 | Watercolor Paintings</p>
          </div>

          <textarea
            rows={8}
            placeholder="https://www.youtube.com/watch?v=... | Floral"
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-studio-magenta"
          />

          {bulkResult && (
            <div className="p-3.5 rounded-xl bg-studio-card border border-studio-magenta/40 text-xs text-white whitespace-pre-wrap font-mono">
              {bulkResult}
            </div>
          )}

          <button
            type="button"
            onClick={handleBulkProcess}
            disabled={bulkProcessing || !bulkText.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white flex items-center gap-2 transition"
          >
            {bulkProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{bulkProcessing ? 'Processing Videos...' : 'Process & Import All'}</span>
          </button>
        </div>
      )}

      {/* TAB: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {/* Header & Sync All */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-studio-magenta" />
                <span>Playlist Manager</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Sync from YouTube, reorder, show/hide, set cover video, or edit individual videos from the playlist page.</p>
            </div>
            <button onClick={syncAllPlaylists}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2 whitespace-nowrap">
              <RefreshCw className="w-4 h-4" /><span>Sync All Visible</span>
            </button>
          </div>

          {/* Add Playlist Form */}
          <div className="glass-panel p-5 rounded-2xl border border-studio-magenta/30 bg-gradient-to-r from-studio-magenta/10 via-studio-card to-studio-surface space-y-3">
            <div>
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-studio-magenta" />
                <span>Add YouTube Playlist</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste any YouTube playlist URL or ID. Sync will immediately fill it with videos.
              </p>
            </div>
            <form onSubmit={handleAddPlaylist} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="YouTube playlist URL or ID (e.g. PL...)"
                value={newPlaylistInput}
                onChange={e => setNewPlaylistInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta"
                required
              />
              <input
                type="text"
                placeholder="Title (optional)"
                value={newPlaylistTitle}
                onChange={e => setNewPlaylistTitle(e.target.value)}
                className="w-full sm:w-52 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta"
              />
              <button
                type="submit"
                disabled={addingPlaylist || !newPlaylistInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia disabled:opacity-50 text-white transition flex items-center justify-center gap-1.5 shrink-0 shadow-glow-magenta"
              >
                {addingPlaylist ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addingPlaylist ? 'Adding…' : 'Add & Sync'}</span>
              </button>
            </form>
          </div>

          {/* Missing key warning */}
          {missingKey && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> YouTube API key missing</p>
              <p>Add <code className="font-mono text-amber-200">YOUTUBE_API_KEY=your_key</code> to your <code className="font-mono">.env</code> file, then restart the dev server.</p>
              <p className="text-slate-400">See HOW-TO.md for step-by-step instructions to get your free key from Google Cloud Console.</p>
            </div>
          )}

          {/* Sync message */}
          {plSyncMsg && (
            <div className={`p-3.5 rounded-xl text-xs border ${
              plSyncMsg.startsWith('✓') ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>{plSyncMsg}</div>
          )}

          {/* Replace old domain */}
          <div className="glass-panel p-4 rounded-2xl border border-studio-gold/20 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-studio-gold">Replace Old Domain</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Replaces <code>rjbartstudio.com</code> → <code>rjbart.netlify.app</code> in all video and painting descriptions.</p>
              {domainReplaceCount !== null && (
                <p className="text-xs mt-1 text-slate-300">{domainReplaceCount} occurrence{domainReplaceCount !== 1 ? 's' : ''} found.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={countOldDomain}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition">
                Preview Count
              </button>
              {domainReplaceCount !== null && domainReplaceCount > 0 && (
                <button onClick={replaceOldDomain}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-studio-gold text-black hover:bg-studio-gold-light transition">
                  Replace All
                </button>
              )}
            </div>
          </div>

          {/* Playlist list */}
          <div className="space-y-3">
            {playlists.map((pl, idx) => {
              const cover = pl.coverVideoId || pl.videos?.[0]?.id
              return (
                <div key={pl.playlistId} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Thumb */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-studio-surface shrink-0">
                    {cover
                      ? <img src={`https://i.ytimg.com/vi/${cover}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white/20"><Layers className="w-6 h-6" /></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-white text-sm truncate">{pl.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{pl.videoCount || pl.videos?.length || 0} videos</span>
                      {!pl.show && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Hidden</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{pl.playlistId}</p>
                    {/* Cover video input */}
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-[11px] text-slate-400 shrink-0">Cover ID:</label>
                      <input
                        value={pl.coverVideoId || ''}
                        onChange={e => {
                          const updated = playlists.map(p => p.playlistId === pl.playlistId ? { ...p, coverVideoId: e.target.value } : p)
                          setPlaylists(updated)
                        }}
                        onBlur={() => savePlaylists(playlists)}
                        placeholder="YouTube video ID"
                        className="flex-1 max-w-[180px] bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-studio-magenta font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => movePl(idx, -1)} disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition" title="Move up">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => movePl(idx, 1)} disabled={idx === playlists.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition" title="Move down">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => savePlaylists(playlists.map(p => p.playlistId === pl.playlistId ? { ...p, show: !pl.show } : p))}
                      className={`p-1.5 rounded-lg transition ${ pl.show ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'}`}
                      title={pl.show ? 'Hide playlist' : 'Show playlist'}>
                      {pl.show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => syncPlaylist(pl.playlistId)} disabled={!!plSyncing[pl.playlistId]}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition flex items-center gap-1">
                      <RefreshCw className={`w-3 h-3 ${plSyncing[pl.playlistId] ? 'animate-spin' : ''}`} />
                      <span>{plSyncing[pl.playlistId] ? 'Syncing…' : 'Sync'}</span>
                    </button>
                    <a href={`/videos/${pl.playlistId}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-studio-gold/20 text-slate-400 hover:text-studio-gold transition" title="View playlist page">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bulk paste fallback when no API key */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-white">Bulk Paste Fallback</h3>
              <p className="text-xs text-slate-400 mt-1">If you don't have an API key yet, paste video URLs (one per line) to manually populate a playlist. Format: <code className="text-studio-gold">VIDEO_URL | Playlist Title</code></p>
            </div>
            <textarea rows={5} placeholder={`https://www.youtube.com/watch?v=VIDEO_ID | Seascapes\nhttps://...`}
              value={bulkText} onChange={e => setBulkText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-studio-magenta" />
            <button onClick={handleBulkProcess} disabled={bulkProcessing || !bulkText.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia disabled:opacity-50 text-white flex items-center gap-2 transition">
              {bulkProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{bulkProcessing ? 'Processing…' : 'Process & Import'}</span>
            </button>
            {bulkResult && <div className="p-3 rounded-xl bg-studio-card border border-studio-magenta/40 text-xs text-white">{bulkResult}</div>}
          </div>
        </div>
      )}

      {/* TAB 3: Manage All Paintings */}
      {activeTab === 'manage' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white">Artwork Catalog ({paintings.length})</h2>
              <p className="text-xs text-slate-400">Quickly adjust status, attach photos, toggle visibility, or edit details.</p>
            </div>
            <button
              type="button"
              onClick={() => { setEditingId(null); resetForm(); setActiveTab('single') }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Artwork</span>
            </button>
          </div>

          {/* Bulk Action Bar */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200">
                <input
                  type="checkbox"
                  checked={paintings.length > 0 && selectedIds.size === paintings.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-studio-magenta focus:ring-studio-magenta cursor-pointer"
                />
                <span>Select All ({paintings.length})</span>
              </label>
              {selectedIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-studio-magenta/20 text-studio-magenta font-semibold">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Set Status:</span>
              <select
                value={bulkStatusValue}
                onChange={e => setBulkStatusValue(e.target.value)}
                className="bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
              >
                <option value="">None (Clear badge)</option>
                <option value="For Sale">For Sale</option>
                <option value="Sold">Sold</option>
                <option value="Not Available for Sale">Not Available for Sale</option>
                <option value="Reserved">Reserved</option>
              </select>
              <button
                type="button"
                onClick={handleApplyBulkStatus}
                disabled={selectedIds.size === 0}
                className="px-3.5 py-1.5 rounded-lg font-semibold bg-studio-gold text-black hover:bg-studio-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Apply to Selected
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paintings.map(painting => {
              const displayImg = painting.photo || painting.customImage || painting.originalImage || painting.thumbnail
              const isSelected = selectedIds.has(painting.id)
              return (
                <div
                  key={painting.id}
                  className={`p-4 rounded-xl bg-white/5 border transition flex flex-col justify-between space-y-3 ${
                    isSelected ? 'border-studio-magenta/60 bg-studio-magenta/5' : 'border-white/5'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectId(painting.id)}
                        className="absolute top-1 left-1 z-10 w-4 h-4 rounded text-studio-magenta focus:ring-studio-magenta cursor-pointer shadow"
                      />
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/60 border border-white/10">
                        {displayImg ? (
                          <img src={displayImg} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-studio-magenta uppercase font-semibold">
                          {painting.category || (Array.isArray(painting.categories) && painting.categories[0]) || 'Artwork'}
                        </span>
                        {painting.hide && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200">Hidden</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white truncate" title={painting.title}>{painting.title}</h3>
                      <p className="text-xs text-slate-400 truncate">{painting.medium} • {painting.size}</p>
                      
                      {/* Quick Status Dropdown */}
                      <div className="mt-1.5">
                        <select
                          value={painting.status || (painting.sold ? 'Sold' : '')}
                          onChange={e => handleQuickStatusChange(painting, e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-studio-magenta"
                        >
                          <option value="">No Badge</option>
                          <option value="For Sale">For Sale</option>
                          <option value="Sold">Sold</option>
                          <option value="Not Available for Sale">Not Available for Sale</option>
                          <option value="Reserved">Reserved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Photo toggle / DropZone */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setQuickPhotoId(quickPhotoId === painting.id ? null : painting.id)}
                      className="text-xs text-studio-gold hover:text-studio-gold-light flex items-center gap-1 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{painting.photo || painting.customImage ? 'Replace Photo' : 'Attach Photo'}</span>
                    </button>
                    {quickPhotoId === painting.id && (
                      <div className="pt-2">
                        <PhotoDropZone
                          value={painting.photo || painting.customImage || ''}
                          onChange={(url, thumb) => {
                            handleUpdateItemPhoto(painting, url, thumb)
                            setQuickPhotoId(null)
                          }}
                          label="Upload or Paste Photo"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      {painting.youtubeUrl || painting.videoId ? (
                        <a
                          href={painting.youtubeUrl || `https://www.youtube.com/watch?v=${painting.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-red-400 flex items-center gap-1"
                          title="Open YouTube Video"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Video</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Photo Only</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleHide(painting)}
                        className={`p-1.5 rounded transition ${
                          painting.hide
                            ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={painting.hide ? 'Show in Gallery' : 'Hide from Gallery'}
                      >
                        {painting.hide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditClick(painting)}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-studio-magenta hover:text-white text-slate-300 transition flex items-center gap-1"
                        title="Edit Painting"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePainting(painting.id, painting.title)}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                        title="Delete Painting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Edit Site Content by Page */}
      {activeTab === 'site' && (
        <form onSubmit={handleSaveSite} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-studio-gold" />
                <span>Page Text & Content Editor</span>
              </h2>
              <p className="text-xs text-slate-400">
                Modify only the text, awards, photos, and links on any page. Changes are saved to <code className="text-slate-300">src/data/pages.json</code>.
              </p>
            </div>
            
            {/* Active Page Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-studio-gold font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-studio-gold/10 border border-studio-gold/30">
                {({
                  home: '🏠 Home Page',
                  about: '🎨 About & Studio',
                  commissions: '✍ Commissions & Prints',
                  gallery: '🖼 Gallery Page',
                  videos: '🎬 Videos & Tutorials',
                  contact: '✉ Contact Page',
                  paintingDetail: '🔍 Painting Detail',
                  notFound: '🚫 404 Not Found',
                  footerHeader: '⚓ Header & Footer'
                })[editPageSection] || editPageSection}
              </span>
              {hasUnsavedChangesForSection(editPageSection) ? (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  ● Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>

          {siteSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{siteSaveSuccess}</span>
            </div>
          )}

          {/* SECTION: HOME PAGE */}
          {editPageSection === 'home' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🏠</span>
                    <span>Home Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control every visible string, button, highlight, showcase item, art show date, and extra block on the Home page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all default text and settings for Home Page? Any unsaved edits will be replaced with defaults.')) {
                      setPages(prev => ({ ...prev, home: JSON.parse(JSON.stringify(pagesDefaultInitial.home)) }))
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* 1. Section Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Page Section Visibility
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.home?.heroVisible !== false}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), heroVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Hero Section</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.home?.highlightsVisible !== false}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), highlightsVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Highlights Bar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.home?.featuredVisible !== false}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), featuredVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Featured Showcase</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.home?.teaserVisible !== false}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Commissions Teaser</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.home?.artShowsVisible !== false}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), artShowsVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Art Shows & Events</span>
                  </label>
                </div>
              </div>

              {/* 2. Hero Content */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Hero Header & Action Buttons
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Top Pill Badge</label>
                    <input
                      type="text"
                      value={pages.home?.pillBadge || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), pillBadge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Primary Headline</label>
                    <input
                      type="text"
                      value={pages.home?.headline || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), headline: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tagline (Italic under name)</label>
                  <input
                    type="text"
                    value={pages.home?.tagline || site.artist.tagline}
                    onChange={e => {
                      setPages({ ...pages, home: { ...(pages.home || {}), tagline: e.target.value } })
                      setSite({ ...site, artist: { ...site.artist, tagline: e.target.value } })
                    }}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Short Bio (Hero Intro - line breaks kept)</label>
                  <textarea
                    rows={3}
                    value={pages.home?.bioShort || site.artist.bioShort}
                    onChange={e => {
                      setPages({ ...pages, home: { ...(pages.home || {}), bioShort: e.target.value } })
                      setSite({ ...site, artist: { ...site.artist, bioShort: e.target.value } })
                    }}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-3 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.primaryBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), primaryBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">FAA Prints Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.faaBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), faaBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Commission Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.commissionBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), commissionBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Studio Highlights Bar (Add / remove / reorder) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                      Studio Highlights Cards
                    </span>
                    <p className="text-xs text-slate-400">Reorder, add, or remove stat cards displayed in the hero section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = pages.home?.highlights || []
                      setPages({
                        ...pages,
                        home: {
                          ...(pages.home || {}),
                          highlights: [...cur, { stat: "New Stat", label: "Description →", link: "/gallery" }]
                        }
                      })
                    }}
                    className="px-3 py-1.5 rounded-lg bg-studio-magenta text-white hover:bg-studio-fuchsia text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stat</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(pages.home?.highlights || []).map((h, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return
                            const cur = [...(pages.home?.highlights || [])]
                            const temp = cur[idx]
                            cur[idx] = cur[idx - 1]
                            cur[idx - 1] = temp
                            setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = [...(pages.home?.highlights || [])]
                            if (idx === cur.length - 1) return
                            const temp = cur[idx]
                            cur[idx] = cur[idx + 1]
                            cur[idx + 1] = temp
                            setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                          }}
                          disabled={idx === (pages.home?.highlights || []).length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={h.stat}
                        onChange={e => {
                          const cur = [...(pages.home?.highlights || [])]
                          cur[idx] = { ...cur[idx], stat: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                        }}
                        placeholder="Stat (e.g. 500+)"
                        className="w-full sm:w-28 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                      />
                      <input
                        type="text"
                        value={h.label}
                        onChange={e => {
                          const cur = [...(pages.home?.highlights || [])]
                          cur[idx] = { ...cur[idx], label: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                        }}
                        placeholder="Label"
                        className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={h.link || ''}
                        onChange={e => {
                          const cur = [...(pages.home?.highlights || [])]
                          cur[idx] = { ...cur[idx], link: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                        }}
                        placeholder="Link (e.g. /gallery)"
                        className="w-full sm:w-36 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cur = (pages.home?.highlights || []).filter((_, i) => i !== idx)
                          setPages({ ...pages, home: { ...(pages.home || {}), highlights: cur } })
                        }}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                        title="Delete highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Featured Showcase Settings */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Featured Paintings Showcase
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={pages.home?.featuredHeading || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), featuredHeading: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={pages.home?.featuredTitle || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), featuredTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">View All Link Text</label>
                    <input
                      type="text"
                      value={pages.home?.featuredLink || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), featuredLink: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Inquire / Buy Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.inquireBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), inquireBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">FAA Print Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.faaPrintBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), faaPrintBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Unified Home Page Showcase Picker */}
                {(() => {
                  // Build all gallery items: paintings first, then playlist-only videos
                  const paintingByVideoId = new Map()
                  for (const p of paintings) {
                    const vid = p.videoId || (p.youtubeUrl ? p.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)?.[1] : null)
                    if (vid) paintingByVideoId.set(vid, p)
                  }
                  const seenIds = new Set()
                  const allItems = []
                  for (const p of paintings) {
                    seenIds.add(p.id)
                    allItems.push({
                      id: p.id,
                      title: p.title || '(Untitled)',
                      thumb: p.highlightPhoto || p.photo || p.originalImage || p.customImage || p.thumbnail || p.thumbnailUrl || '',
                      isVideo: !!(p.videoId || p.youtubeUrl),
                      videoId: p.videoId || null,
                      youtubeUrl: p.youtubeUrl || '',
                      fineArtAmericaUrl: p.fineArtAmericaUrl || '',
                      price: p.price || '',
                      badge: p.status || (p.sold ? 'Sold' : ''),
                      category: p.category || '',
                      medium: p.medium || '',
                      size: p.size || '',
                    })
                  }
                  for (const pl of playlists) {
                    for (const v of (pl.videos || []).filter(v => !v.hide)) {
                      const matchedPainting = paintingByVideoId.get(v.id)
                      const itemId = matchedPainting ? matchedPainting.id : `playlist-${v.id}`
                      if (seenIds.has(itemId)) continue
                      seenIds.add(itemId)
                      allItems.push({
                        id: itemId,
                        title: v.title || '(Untitled)',
                        thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
                        isVideo: true,
                        videoId: v.id,
                        youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
                        fineArtAmericaUrl: '',
                        price: '',
                        badge: '',
                        category: pl.title || 'Video',
                        medium: '',
                        size: '',
                      })
                    }
                  }

                  // featuredItems: array stored in pages.home
                  const featuredItems = pages.home?.featuredItems || []
                  const featuredIds = new Set(featuredItems.map(fi => fi.id))

                  const q = showcaseSearch.toLowerCase()
                  const filtered = q ? allItems.filter(it => it.title.toLowerCase().includes(q) || (it.category || '').toLowerCase().includes(q)) : allItems

                  const saveFeaturedItems = async (updated) => {
                    const newPages = { ...pages, home: { ...(pages.home || {}), featuredItems: updated } }
                    setPages(newPages)
                    await fetch('/__api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pages: newPages }) })
                  }

                  const toggleItem = (galleryItem) => {
                    if (featuredIds.has(galleryItem.id)) {
                      // Remove
                      saveFeaturedItems(featuredItems.filter(fi => fi.id !== galleryItem.id))
                      if (showcaseExpandedId === galleryItem.id) setShowcaseExpandedId(null)
                    } else {
                      // Add with defaults from the gallery item
                      saveFeaturedItems([...featuredItems, {
                        id: galleryItem.id,
                        title: galleryItem.title,
                        thumb: galleryItem.thumb,
                        highlightPhoto: '',
                        badge: galleryItem.badge || '',
                        price: galleryItem.price || '',
                        videoId: galleryItem.videoId || null,
                        youtubeUrl: galleryItem.youtubeUrl || '',
                        fineArtAmericaUrl: galleryItem.fineArtAmericaUrl || '',
                        isVideo: galleryItem.isVideo || false,
                        category: galleryItem.category || '',
                        medium: galleryItem.medium || '',
                        size: galleryItem.size || '',
                      }])
                    }
                  }

                  const updateFeaturedItem = (id, patch) => {
                    saveFeaturedItems(featuredItems.map(fi => fi.id === id ? { ...fi, ...patch } : fi))
                  }

                  const moveItem = (idx, dir) => {
                    const arr = [...featuredItems]
                    const swapIdx = idx + dir
                    if (swapIdx < 0 || swapIdx >= arr.length) return
                    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
                    saveFeaturedItems(arr)
                  }

                  return (
                    <div className="pt-2 border-t border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white mb-0.5">Select Items to Showcase on Home Page</h4>
                          <p className="text-[11px] text-slate-400">
                            Choose any painting or video from your gallery. Click a thumbnail to add or remove it. Expand ▸ to set a custom photo, badge, or price for each item.
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-studio-gold self-start sm:self-auto bg-studio-gold/10 border border-studio-gold/30 px-2.5 py-1 rounded-lg shrink-0">
                          {featuredItems.length} selected
                        </span>
                      </div>

                      {/* Currently showcased — reorder & customize */}
                      {featuredItems.length > 0 && (
                        <div className="space-y-2 p-3 rounded-xl bg-studio-magenta/5 border border-studio-magenta/20">
                          <p className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider">
                            Currently Showcased — click ▸ to customize each card
                          </p>
                          {featuredItems.map((fi, idx) => {
                            const isExpanded = showcaseExpandedId === fi.id
                            const displayThumb = fi.highlightPhoto || fi.thumb
                            return (
                              <div key={fi.id} className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
                                {/* Row */}
                                <div className="flex items-center gap-2 p-2">
                                  {displayThumb && (
                                    <img src={displayThumb} alt={fi.title} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                                  )}
                                  <span className="flex-1 text-xs text-white truncate">{fi.title}</span>
                                  {fi.badge && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 shrink-0">{fi.badge}</span>
                                  )}
                                  {fi.price && (
                                    <span className="text-[10px] text-studio-gold font-semibold shrink-0">${fi.price}</span>
                                  )}
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" disabled={idx === 0} onClick={() => moveItem(idx, -1)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-30">
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button type="button" disabled={idx === featuredItems.length - 1} onClick={() => moveItem(idx, 1)}
                                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-30">
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button type="button"
                                      onClick={() => setShowcaseExpandedId(isExpanded ? null : fi.id)}
                                      className={`p-1 rounded text-slate-400 hover:text-white ${isExpanded ? 'bg-studio-magenta/30' : 'bg-white/5 hover:bg-white/15'}`}
                                      title="Customize this card">
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button type="button"
                                      onClick={() => toggleItem({ id: fi.id })}
                                      className="p-1 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {/* Expanded customizer */}
                                {isExpanded && (
                                  <div className="border-t border-white/10 p-3 space-y-3 bg-black/20">
                                    <p className="text-[10px] text-studio-magenta font-semibold uppercase tracking-wider">Customize "{fi.title}"</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Custom Display Title</label>
                                        <input type="text" value={fi.title}
                                          onChange={e => updateFeaturedItem(fi.id, { title: e.target.value })}
                                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Badge / Status Label</label>
                                        <input type="text" placeholder="e.g. For Sale, Sold, New" value={fi.badge}
                                          onChange={e => updateFeaturedItem(fi.id, { badge: e.target.value })}
                                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Price (numbers only, e.g. 350)</label>
                                        <input type="text" placeholder="e.g. 350" value={fi.price}
                                          onChange={e => updateFeaturedItem(fi.id, { price: e.target.value })}
                                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Fine Art America Print URL</label>
                                        <input type="text" placeholder="https://fineartamerica.com/..." value={fi.fineArtAmericaUrl || ''}
                                          onChange={e => updateFeaturedItem(fi.id, { fineArtAmericaUrl: e.target.value })}
                                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Custom Display Photo (overrides default thumbnail)</label>
                                      <PhotoDropZone
                                        value={fi.highlightPhoto || fi.thumb || ''}
                                        onChange={url => updateFeaturedItem(fi.id, { highlightPhoto: url })}
                                        label="Upload or paste photo URL"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Photo URL (paste direct link)</label>
                                      <input type="text" placeholder="https://... or /images/..." value={fi.highlightPhoto || ''}
                                        onChange={e => updateFeaturedItem(fi.id, { highlightPhoto: e.target.value })}
                                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search paintings & videos..."
                          value={showcaseSearch}
                          onChange={e => setShowcaseSearch(e.target.value)}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg pl-8 pr-4 py-2 text-xs text-white focus:outline-none focus:border-studio-magenta"
                        />
                      </div>

                      {/* Gallery grid — ALL items, click to add/remove */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5">
                        {filtered.length === 0 && (
                          <p className="text-xs text-slate-400 col-span-3 text-center py-6">No items match "{showcaseSearch}"</p>
                        )}
                        {filtered.map(item => {
                          const isSelected = featuredIds.has(item.id)
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleItem(item)}
                              className={`relative rounded-xl overflow-hidden group text-left border-2 transition-all focus:outline-none focus:ring-2 focus:ring-studio-magenta ${
                                isSelected
                                  ? 'border-studio-magenta shadow-glow-magenta'
                                  : 'border-transparent hover:border-white/30'
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="aspect-[4/3] bg-studio-surface relative overflow-hidden">
                                {item.thumb ? (
                                  <img src={item.thumb} alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-slate-600" />
                                  </div>
                                )}
                                {/* Video badge */}
                                {item.isVideo && (
                                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600/90 text-white">
                                    VIDEO
                                  </div>
                                )}
                                {/* Selected checkmark */}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-studio-magenta flex items-center justify-center shadow">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                                {/* Hover overlay */}
                                <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-studio-magenta/15' : 'bg-black/0 group-hover:bg-black/30'}`} />
                              </div>
                              {/* Title */}
                              <div className="p-1.5">
                                <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">{item.title}</p>
                                {item.category && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.category}</p>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Click any thumbnail to add it to the home page showcase. Up to 4 items are shown at once. Use ▸ (edit icon) in the list above to set custom photo, badge, or price per item.
                      </p>
                    </div>
                  )
                })()}

              </div>

              {/* 5. Commissions Teaser Banner */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Commissions & Prints Teaser Banner
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={pages.home?.teaserBadge || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserBadge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Banner Headline</label>
                    <input
                      type="text"
                      value={pages.home?.teaserTitle || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Banner Description Text (line breaks kept)</label>
                  <textarea
                    rows={2}
                    value={pages.home?.teaserText || ''}
                    onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserText: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.teaserPrimaryBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserPrimaryBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">FAA Shop Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.teaserSecondaryBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), teaserSecondaryBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Art Shows & In-Person Appearances (Add / remove / reorder) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                      Art Shows & Appearances List
                    </span>
                    <p className="text-xs text-slate-400">Add, reorder, or edit in-person booth announcements.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = pages.home?.artShows || []
                      setPages({
                        ...pages,
                        home: {
                          ...(pages.home || {}),
                          artShows: [...cur, { title: "New Art Show Exhibit", date: "Date or Season", location: "City, State" }]
                        }
                      })
                    }}
                    className="px-3 py-1.5 rounded-lg bg-studio-magenta text-white hover:bg-studio-fuchsia text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Show</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Badge</label>
                    <input
                      type="text"
                      value={pages.home?.artShowsBadge || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), artShowsBadge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Inquire Button Text</label>
                    <input
                      type="text"
                      value={pages.home?.artShowsBtn || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), artShowsBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={pages.home?.artShowsLink || ''}
                      onChange={e => setPages({ ...pages, home: { ...(pages.home || {}), artShowsLink: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {(pages.home?.artShows || []).map((sh, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return
                            const cur = [...(pages.home?.artShows || [])]
                            const temp = cur[idx]
                            cur[idx] = cur[idx - 1]
                            cur[idx - 1] = temp
                            setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = [...(pages.home?.artShows || [])]
                            if (idx === cur.length - 1) return
                            const temp = cur[idx]
                            cur[idx] = cur[idx + 1]
                            cur[idx + 1] = temp
                            setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                          }}
                          disabled={idx === (pages.home?.artShows || []).length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sh.title}
                        onChange={e => {
                          const cur = [...(pages.home?.artShows || [])]
                          cur[idx] = { ...cur[idx], title: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                        }}
                        placeholder="Exhibit Name / Event Title"
                        className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={sh.date}
                        onChange={e => {
                          const cur = [...(pages.home?.artShows || [])]
                          cur[idx] = { ...cur[idx], date: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                        }}
                        placeholder="Date / Schedule"
                        className="w-full sm:w-44 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={sh.location}
                        onChange={e => {
                          const cur = [...(pages.home?.artShows || [])]
                          cur[idx] = { ...cur[idx], location: e.target.value }
                          setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                        }}
                        placeholder="Location"
                        className="w-full sm:w-48 bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cur = (pages.home?.artShows || []).filter((_, i) => i !== idx)
                          setPages({ ...pages, home: { ...(pages.home || {}), artShows: cur } })
                        }}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                        title="Delete show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('home', HOME_BLOCK_SLOTS, 'Home Page')}
            </div>
          )}

          {/* SECTION: ABOUT & STUDIO (AWARDS & PHOTOS) */}
          {editPageSection === 'about' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🎨</span>
                    <span>About & Studio Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control every visible string, photo, award, studio stat, and extra block on the About page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all default text and settings for About Page? Any unsaved edits will be replaced with defaults.')) {
                      setPages(prev => ({ ...prev, about: JSON.parse(JSON.stringify(pagesDefaultInitial.about)) }))
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* 1. Section Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Page Section Visibility
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.about?.headerVisible !== false}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), headerVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Header Banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.about?.journeyVisible !== false}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), journeyVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Artistic Journey</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.about?.awardsVisible !== false}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), awardsVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Awards & Recognition</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.about?.studioVisible !== false}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), studioVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>The Studio Story</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.about?.ctaVisible !== false}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), ctaVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Call to Action Bar</span>
                  </label>
                </div>
              </div>

              {/* 2. Header Content */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Header Content
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={pages.about?.badge || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), badge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={pages.about?.title || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), title: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={pages.about?.tagline || ''}
                    onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), tagline: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* 3. Artistic Journey */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Artistic Journey Content
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={pages.about?.journeyTitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), journeyTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={pages.about?.journeySubtitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), journeySubtitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Extended Bio (Paragraph 1 - line breaks kept)</label>
                  <textarea
                    rows={4}
                    value={pages.about?.bioExtended || site.artist.bioExtended}
                    onChange={e => {
                      setPages({ ...pages, about: { ...(pages.about || {}), bioExtended: e.target.value } })
                      setSite({ ...site, artist: { ...site.artist, bioExtended: e.target.value } })
                    }}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <PhotoDropZone
                    value={pages.about?.aboutPhoto || site.artist.aboutPhoto || ''}
                    onChange={url => {
                      setPages({ ...pages, about: { ...(pages.about || {}), aboutPhoto: url } })
                      setSite({ ...site, artist: { ...site.artist, aboutPhoto: url } })
                    }}
                    label="Studio / Artist Photo (Shown on About Page)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bio Story (Paragraph 2 - line breaks kept)</label>
                  <textarea
                    rows={3}
                    value={pages.about?.storyParagraph2 || ''}
                    onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), storyParagraph2: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-3 text-xs text-white"
                  />
                </div>
              </div>

              {/* 4. Awards & Recognition (Add / remove / reorder) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-studio-gold" />
                    <div>
                      <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                        Mayoral Awards & Recognition
                      </span>
                      <p className="text-xs text-slate-400">Add, reorder, or edit ceremony photos and descriptions.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = pages.about?.awards || site.awards || []
                      const newAward = {
                        title: "New Honor or Award",
                        conferredBy: "Organization / Mayor",
                        artwork: "Artwork Title",
                        medium: "Oil on canvas",
                        description: "Award description...",
                        image: ""
                      }
                      setPages({ ...pages, about: { ...(pages.about || {}), awards: [...cur, newAward] } })
                    }}
                    className="px-3 py-1.5 rounded-lg bg-studio-magenta text-white hover:bg-studio-fuchsia text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Award</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={pages.about?.awardsTitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), awardsTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={pages.about?.awardsSubtitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), awardsSubtitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Footer / Location Note</label>
                    <input
                      type="text"
                      value={pages.about?.awardsFooter || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), awardsFooter: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {(pages.about?.awards || site.awards || []).map((award, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-studio-gold">Award #{idx + 1}: {award.title}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === 0) return
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              const temp = cur[idx]
                              cur[idx] = cur[idx - 1]
                              cur[idx - 1] = temp
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              if (idx === cur.length - 1) return
                              const temp = cur[idx]
                              cur[idx] = cur[idx + 1]
                              cur[idx + 1] = temp
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            disabled={idx === (pages.about?.awards || site.awards || []).length - 1}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = (pages.about?.awards || site.awards || []).filter((_, i) => i !== idx)
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 ml-2"
                            title="Delete award"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Award Title</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={e => {
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              cur[idx] = { ...cur[idx], title: e.target.value }
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Artwork Featured</label>
                          <input
                            type="text"
                            value={award.artwork}
                            onChange={e => {
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              cur[idx] = { ...cur[idx], artwork: e.target.value }
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Conferred By</label>
                          <input
                            type="text"
                            value={award.conferredBy}
                            onChange={e => {
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              cur[idx] = { ...cur[idx], conferredBy: e.target.value }
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Medium</label>
                          <input
                            type="text"
                            value={award.medium}
                            onChange={e => {
                              const cur = [...(pages.about?.awards || site.awards || [])]
                              cur[idx] = { ...cur[idx], medium: e.target.value }
                              setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <PhotoDropZone
                          value={award.image || ''}
                          onChange={url => {
                            const cur = [...(pages.about?.awards || site.awards || [])]
                            cur[idx] = { ...cur[idx], image: url }
                            setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                          }}
                          label="Award Ceremony Photo"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Description (line breaks kept)</label>
                        <textarea
                          rows={2}
                          value={award.description}
                          onChange={e => {
                            const cur = [...(pages.about?.awards || site.awards || [])]
                            cur[idx] = { ...cur[idx], description: e.target.value }
                            setPages({ ...pages, about: { ...(pages.about || {}), awards: cur } })
                          }}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. The Studio Story & Stats (Add / remove / reorder) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  The Studio Story & Stats
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Studio Title</label>
                    <input
                      type="text"
                      value={pages.about?.studioTitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), studioTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={pages.about?.studioSubtitle || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), studioSubtitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Studio Story Description (line breaks kept)</label>
                  <textarea
                    rows={3}
                    value={pages.about?.studioDescription || ''}
                    onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), studioDescription: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-3 text-xs text-white"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Studio Feature Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = pages.about?.studioStats || []
                        setPages({
                          ...pages,
                          about: {
                            ...(pages.about || {}),
                            studioStats: [...cur, { value: "New Stat", label: "Description", link: "" }]
                          }
                        })
                      }}
                      className="px-3 py-1 rounded-lg bg-studio-magenta text-white hover:bg-studio-fuchsia text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Card</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(pages.about?.studioStats || []).map((st, idx) => {
                      const ytMatch = (st.link || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
                      const ytId = ytMatch ? ytMatch[1] : null
                      const defaultYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''
                      const activeThumb = st.thumbnail || defaultYtThumb

                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-studio-gold">
                              Studio Video Card #{idx + 1}: {st.value || 'Untitled'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (idx === 0) return
                                  const cur = [...(pages.about?.studioStats || [])]
                                  const temp = cur[idx]
                                  cur[idx] = cur[idx - 1]
                                  cur[idx - 1] = temp
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                disabled={idx === 0}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  if (idx === cur.length - 1) return
                                  const temp = cur[idx]
                                  cur[idx] = cur[idx + 1]
                                  cur[idx + 1] = temp
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                disabled={idx === (pages.about?.studioStats || []).length - 1}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = (pages.about?.studioStats || []).filter((_, i) => i !== idx)
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                                title="Delete card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-300 mb-1">Title</label>
                              <input
                                type="text"
                                value={st.value}
                                onChange={e => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  cur[idx] = { ...cur[idx], value: e.target.value }
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                placeholder="e.g. My Studio Build Part 1"
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-300 mb-1">Subtitle / Description</label>
                              <input
                                type="text"
                                value={st.label}
                                onChange={e => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  cur[idx] = { ...cur[idx], label: e.target.value }
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                placeholder="e.g. Dedicated Creative Space"
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-300 mb-1">YouTube Video Link</label>
                              <input
                                type="text"
                                value={st.link || ''}
                                onChange={e => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  cur[idx] = { ...cur[idx], link: e.target.value }
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                placeholder="https://youtu.be/..."
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-medium text-slate-300">Thumbnail Image URL</label>
                                {ytId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cur = [...(pages.about?.studioStats || [])]
                                      cur[idx] = { ...cur[idx], thumbnail: defaultYtThumb }
                                      setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                    }}
                                    className="text-[10px] text-studio-magenta hover:underline font-semibold"
                                  >
                                    Auto YouTube Thumb
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={st.thumbnail || ''}
                                onChange={e => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  cur[idx] = { ...cur[idx], thumbnail: e.target.value }
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                placeholder={defaultYtThumb || "Image URL or drop below"}
                                className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          {/* Thumbnail preview and drop zone */}
                          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                            {activeThumb ? (
                              <div className="w-28 aspect-video rounded-lg overflow-hidden border border-white/10 bg-black shrink-0 relative">
                                <img
                                  src={activeThumb}
                                  alt={st.value || 'Thumbnail'}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <Play className="w-4 h-4 fill-white text-white opacity-80" />
                                </div>
                              </div>
                            ) : null}
                            <div className="flex-1 w-full">
                              <PhotoDropZone
                                value={st.thumbnail || ''}
                                onChange={url => {
                                  const cur = [...(pages.about?.studioStats || [])]
                                  cur[idx] = { ...cur[idx], thumbnail: url }
                                  setPages({ ...pages, about: { ...(pages.about || {}), studioStats: cur } })
                                }}
                                label="Drop custom photo/thumbnail or browse"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 6. Call to Action Bar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Bottom Call to Action Bar
                </span>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    value={pages.about?.ctaTitle || ''}
                    onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), ctaTitle: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description (line breaks kept)</label>
                  <textarea
                    rows={2}
                    value={pages.about?.ctaDescription || ''}
                    onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), ctaDescription: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gallery Button Text</label>
                    <input
                      type="text"
                      value={pages.about?.ctaGalleryBtn || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), ctaGalleryBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Button Text</label>
                    <input
                      type="text"
                      value={pages.about?.ctaContactBtn || ''}
                      onChange={e => setPages({ ...pages, about: { ...(pages.about || {}), ctaContactBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('about', ABOUT_BLOCK_SLOTS, 'About & Studio Page')}
            </div>
          )}

          {/* SECTION: COMMISSIONS & PRINTS */}
          {editPageSection === 'commissions' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">✍</span>
                    <span>Commissions & Prints Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control every visible string, service card, process step, notice, form field, and extra block on the Commissions page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all default text and settings for Commissions & Prints? Any unsaved edits will be replaced with defaults.')) {
                      setPages(prev => ({ ...prev, commissions: JSON.parse(JSON.stringify(pagesDefaultInitial.commissions)) }))
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* 1. Section Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Page Section Visibility
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.heroVisible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), heroVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Header Intro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.cardsVisible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), cardsVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Service Cards</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.watercolorNotice?.visible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), watercolorNotice: { ...(pages.commissions?.watercolorNotice || {}), visible: e.target.checked } } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Watercolor Notice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.processVisible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), processVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Process Steps</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.pricingPolicyVisible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), pricingPolicyVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Pricing Policy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.formVisible !== false}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), formVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Request Form</span>
                  </label>
                </div>
              </div>

              {/* 2. Hero Header */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Header Intro Text
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Pill Badge</label>
                    <input
                      type="text"
                      value={pages.commissions?.badge || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), badge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Page Heading (H1)</label>
                    <input
                      type="text"
                      value={pages.commissions?.title || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), title: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Intro Description</label>
                  <textarea
                    rows={2}
                    value={pages.commissions?.intro || ''}
                    onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), intro: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* 3. Service / Feature Cards (Editable List) */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                      Service / Feature Cards
                    </span>
                    <p className="text-xs text-slate-400">
                      Add, edit, reorder, hide or delete service cards. All cards use the site's dark glass design.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCard = {
                        id: `card-${Date.now()}`,
                        subtitle: 'Service Category',
                        title: 'New Custom Service',
                        description: 'Detailed description of this custom artwork or service.',
                        priceListId: '',
                        priceListTitle: '',
                        priceListThumb: '',
                        badgeTitle: 'Certificate of Authenticity',
                        badgeSubtitle: 'Offered on all paintings',
                        visible: true
                      }
                      const updated = [...(pages.commissions?.cards || []), newCard]
                      setPages({ ...pages, commissions: { ...(pages.commissions || {}), cards: updated } })
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service Card</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(pages.commissions?.cards || []).map((card, cIdx, arr) => {
                    const isHidden = card.visible === false
                    return (
                      <div
                        key={card.id || cIdx}
                        className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                          isHidden ? 'bg-black/30 border-white/5 opacity-60' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-studio-gold">Card #{cIdx + 1}: {card.title}</span>
                            {isHidden && <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300">Hidden</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={cIdx === 0}
                              onClick={() => {
                                const updated = [...arr]
                                const temp = updated[cIdx]
                                updated[cIdx] = updated[cIdx - 1]
                                updated[cIdx - 1] = temp
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={cIdx === arr.length - 1}
                              onClick={() => {
                                const updated = [...arr]
                                const temp = updated[cIdx]
                                updated[cIdx] = updated[cIdx + 1]
                                updated[cIdx + 1] = temp
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...arr]
                                updated[cIdx] = { ...updated[cIdx], visible: !isHidden }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              title={isHidden ? 'Show card' : 'Hide card'}
                            >
                              {isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete "${card.title}" card?`)) {
                                  const updated = arr.filter((_, i) => i !== cIdx)
                                  setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                                }
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                              title="Delete card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">Small Label / Subtitle</label>
                            <input
                              type="text"
                              value={card.subtitle || ''}
                              onChange={e => {
                                const updated = [...arr]
                                updated[cIdx] = { ...updated[cIdx], subtitle: e.target.value }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">Card Title</label>
                            <input
                              type="text"
                              value={card.title || ''}
                              onChange={e => {
                                const updated = [...arr]
                                updated[cIdx] = { ...updated[cIdx], title: e.target.value }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={card.description || ''}
                            onChange={e => {
                              const updated = [...arr]
                              updated[cIdx] = { ...updated[cIdx], description: e.target.value }
                              setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">Attached Price List</label>
                            <select
                              value={card.priceListId || ''}
                              onChange={e => {
                                const plId = e.target.value
                                const updated = [...arr]
                                const pl = PRICE_LISTS.find(p => p.id === plId)
                                updated[cIdx] = {
                                  ...updated[cIdx],
                                  priceListId: plId,
                                  priceListTitle: pl ? pl.title : '',
                                  priceListThumb: pl ? pl.thumb : ''
                                }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                            >
                              <option value="">(None)</option>
                              <option value="charcoal-portrait-prices">Charcoal Portraits Price List</option>
                              <option value="painted-portrait-prices">Painted Portraits Price List</option>
                              <option value="product-price-list">Prints & Originals Product Price List</option>
                              <option value="prints-price-list">Prints Price List</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">Badge Title</label>
                            <input
                              type="text"
                              value={card.badgeTitle || ''}
                              onChange={e => {
                                const updated = [...arr]
                                updated[cIdx] = { ...updated[cIdx], badgeTitle: e.target.value }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                              placeholder="Certificate of Authenticity"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">Badge Subtitle</label>
                            <input
                              type="text"
                              value={card.badgeSubtitle || ''}
                              onChange={e => {
                                const updated = [...arr]
                                updated[cIdx] = { ...updated[cIdx], badgeSubtitle: e.target.value }
                                setPages({ ...pages, commissions: { ...pages.commissions, cards: updated } })
                              }}
                              className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                              placeholder="Offered on all paintings"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 4. Watercolor Commission Notice */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Watercolor Notice Banner</h4>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.watercolorNotice?.visible !== false}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          watercolorNotice: {
                            ...(pages.commissions?.watercolorNotice || {}),
                            visible: e.target.checked
                          }
                        }
                      })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Show Notice</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Prefix / Label</label>
                    <input
                      type="text"
                      value={pages.commissions?.watercolorNotice?.prefix || ''}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          watercolorNotice: {
                            ...(pages.commissions?.watercolorNotice || {}),
                            prefix: e.target.value
                          }
                        }
                      })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Main Notice Text</label>
                    <input
                      type="text"
                      value={pages.commissions?.watercolorNotice?.text || ''}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          watercolorNotice: {
                            ...(pages.commissions?.watercolorNotice || {}),
                            text: e.target.value
                          }
                        }
                      })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Link Text</label>
                    <input
                      type="text"
                      value={pages.commissions?.watercolorNotice?.linkText || ''}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          watercolorNotice: {
                            ...(pages.commissions?.watercolorNotice || {}),
                            linkText: e.target.value
                          }
                        }
                      })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Link Target URL</label>
                    <input
                      type="text"
                      value={pages.commissions?.watercolorNotice?.linkUrl || ''}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          watercolorNotice: {
                            ...(pages.commissions?.watercolorNotice || {}),
                            linkUrl: e.target.value
                          }
                        }
                      })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Process Steps */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                      Commission Process Steps
                    </span>
                    <p className="text-xs text-slate-400">Add, remove, reorder and edit the steps shown to prospective clients.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const steps = pages.commissions?.processSteps || []
                      const newStep = {
                        num: (steps.length + 1).toString(),
                        title: 'New Step Title',
                        desc: 'Step explanation text.'
                      }
                      setPages({ ...pages, commissions: { ...(pages.commissions || {}), processSteps: [...steps, newStep] } })
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-studio-cobalt text-white hover:bg-studio-blue transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Process Section Title</label>
                    <input
                      type="text"
                      value={pages.commissions?.processTitle || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), processTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Process Subtitle</label>
                    <input
                      type="text"
                      value={pages.commissions?.processSubtitle || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), processSubtitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {(pages.commissions?.processSteps || []).map((step, sIdx, arr) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-studio-gold">Step #{sIdx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => {
                              const updated = [...arr]
                              const temp = updated[sIdx]
                              updated[sIdx] = updated[sIdx - 1]
                              updated[sIdx - 1] = temp
                              setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === arr.length - 1}
                            onClick={() => {
                              const updated = [...arr]
                              const temp = updated[sIdx]
                              updated[sIdx] = updated[sIdx + 1]
                              updated[sIdx + 1] = temp
                              setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = arr.filter((_, i) => i !== sIdx)
                              setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            value={step.num || ''}
                            onChange={e => {
                              const updated = [...arr]
                              updated[sIdx] = { ...updated[sIdx], num: e.target.value }
                              setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                            }}
                            placeholder="Step #"
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={step.title || ''}
                            onChange={e => {
                              const updated = [...arr]
                              updated[sIdx] = { ...updated[sIdx], title: e.target.value }
                              setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                            }}
                            placeholder="Step Title"
                            className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={step.desc || ''}
                        onChange={e => {
                          const updated = [...arr]
                          updated[sIdx] = { ...updated[sIdx], desc: e.target.value }
                          setPages({ ...pages, commissions: { ...pages.commissions, processSteps: updated } })
                        }}
                        placeholder="Step description..."
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Pricing Policy Notice */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pricing Policy Notice</h4>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.commissions?.pricingPolicyVisible !== false}
                      onChange={e => setPages({
                        ...pages,
                        commissions: {
                          ...(pages.commissions || {}),
                          pricingPolicyVisible: e.target.checked
                        }
                      })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Show Notice</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Title</label>
                  <input
                    type="text"
                    value={pages.commissions?.pricingPolicyTitle || ''}
                    onChange={e => setPages({
                      ...pages,
                      commissions: {
                        ...(pages.commissions || {}),
                        pricingPolicyTitle: e.target.value
                      }
                    })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Text</label>
                  <textarea
                    rows={3}
                    value={pages.commissions?.pricingPolicy || ''}
                    onChange={e => setPages({
                      ...pages,
                      commissions: {
                        ...(pages.commissions || {}),
                        pricingPolicy: e.target.value
                      }
                    })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* 7. Commission Form Settings */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Commission Google Form Embed & Labels
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Form Badge</label>
                    <input
                      type="text"
                      value={pages.commissions?.formBadge || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), formBadge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Form Heading</label>
                    <input
                      type="text"
                      value={pages.commissions?.formTitle || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), formTitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Form Subtitle</label>
                    <input
                      type="text"
                      value={pages.commissions?.formSubtitle || ''}
                      onChange={e => setPages({ ...pages, commissions: { ...(pages.commissions || {}), formSubtitle: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-semibold text-studio-gold uppercase tracking-wider">
                    Google Form Embed (Commissions)
                  </p>
                  <p className="text-xs text-slate-300">
                    Paste either the embed URL or the full embed HTML (from Google Forms &gt; Send &gt; &lt;&gt; Embed):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Embed URL / HTML snippet</label>
                      <input
                        type="text"
                        placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                        value={site.contact?.googleCommissionEmbedUrl || ''}
                        onChange={e => {
                          let val = e.target.value.trim()
                          const match = val.match(/src=["'](.*?)["']/)
                          if (match && match[1]) val = match[1]
                          setSite({ ...site, contact: { ...(site.contact || {}), googleCommissionEmbedUrl: val } })
                        }}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Embed Height (px)</label>
                      <input
                        type="number"
                        placeholder="1100"
                        value={site.contact?.googleCommissionEmbedHeight || 1100}
                        onChange={e => setSite({ ...site, contact: { ...(site.contact || {}), googleCommissionEmbedHeight: parseInt(e.target.value) || 1100 } })}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('commissions', COMMISSIONS_BLOCK_SLOTS, 'Commissions & Prints Page')}
            </div>
          )}

          {/* SECTION: GALLERY PAGE */}
          {editPageSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🖼</span>
                    <span>Gallery Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control visible headers, filter labels, search placeholder, card button texts, and extra blocks on the Gallery page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all default text and settings for Gallery Page? Any unsaved edits will be replaced with defaults.')) {
                      setPages(prev => ({ ...prev, gallery: JSON.parse(JSON.stringify(pagesDefaultInitial.gallery)) }))
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* 1. Section Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Page Section Visibility
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.gallery?.headerVisible !== false}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), headerVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Header Banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pages.gallery?.filtersVisible !== false}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), filtersVisible: e.target.checked } })}
                      className="rounded text-studio-magenta"
                    />
                    <span>Filter & Search Bar</span>
                  </label>
                </div>
              </div>

              {/* 2. Header Content */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Header Content
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={pages.gallery?.badge || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), badge: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Page Title</label>
                    <input
                      type="text"
                      value={pages.gallery?.title || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), title: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description (line breaks kept)</label>
                  <textarea
                    rows={2}
                    value={pages.gallery?.description || ''}
                    onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), description: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* 3. Search and Filter Buttons */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Search & Filter Labels
                </span>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Search Placeholder</label>
                  <input
                    type="text"
                    value={pages.gallery?.searchPlaceholder || ''}
                    onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), searchPlaceholder: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">All Media Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.allMediaBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), allMediaBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">With Video Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.withVideoBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), withVideoBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Photos Only Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.photosOnlyBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), photosOnlyBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">All Status Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.allStatusBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), allStatusBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">For Sale Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.forSaleBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), forSaleBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Sold Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.soldBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), soldBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Not for Sale Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.notForSaleBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), notForSaleBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Card Buttons & Empty States */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Artwork Card Buttons & Empty States
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Inquire / Buy Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.inquireBuyBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), inquireBuyBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">View Artwork Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.viewArtworkBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), viewArtworkBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">FAA Prints Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.faaPrintsBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), faaPrintsBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Load More Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.loadMoreBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), loadMoreBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">No Results Message</label>
                    <input
                      type="text"
                      value={pages.gallery?.noResultsText || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), noResultsText: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Reset Filters Button</label>
                    <input
                      type="text"
                      value={pages.gallery?.resetFiltersBtn || ''}
                      onChange={e => setPages({ ...pages, gallery: { ...(pages.gallery || {}), resetFiltersBtn: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Gallery Categories */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-studio-gold uppercase tracking-wider block">
                  Extra Gallery Categories
                </span>
                <p className="text-[11px] text-slate-400">
                  Add custom filter pills that appear in the Gallery category bar alongside the built-in categories.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(site.extraCategories || []).map((cat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/10 text-white border border-white/10">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (site.extraCategories || []).filter((_, i) => i !== idx)
                          setSite({ ...site, extraCategories: updated })
                        }}
                        className="hover:text-red-400 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(site.extraCategories || []).length === 0 && (
                    <span className="text-xs text-slate-500 italic">No extra categories yet.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category (e.g. Miniatures, Studies)..."
                    value={newExtraCat}
                    onChange={e => setNewExtraCat(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const trimmed = newExtraCat.trim()
                        if (trimmed && !(site.extraCategories || []).includes(trimmed)) {
                          setSite({ ...site, extraCategories: [...(site.extraCategories || []), trimmed] })
                        }
                        setNewExtraCat('')
                      }
                    }}
                    className="flex-1 bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newExtraCat.trim()
                      if (trimmed && !(site.extraCategories || []).includes(trimmed)) {
                        setSite({ ...site, extraCategories: [...(site.extraCategories || []), trimmed] })
                      }
                      setNewExtraCat('')
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('gallery', GALLERY_BLOCK_SLOTS, 'Gallery Page')}
            </div>
          )}

          {/* SECTION: VIDEOS PAGE */}
          {editPageSection === 'videos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🎬</span>
                    <span>Videos & Playlists Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">Control headers, banner, and playlist display strings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreDefaultSection('videos', 'Videos Page')}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* Visibility Toggles */}
              <div className="flex flex-wrap gap-3">
                {[
                  ['headerVisible', 'Show Page Header'],
                  ['bannerVisible', 'Show Channel Banner'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:border-studio-magenta/40">
                    <input
                      type="checkbox"
                      checked={pages.videos?.[key] !== false}
                      onChange={e => setPages({ ...pages, videos: { ...(pages.videos || {}), [key]: e.target.checked } })}
                      className="accent-studio-magenta"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Page Header */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Page Header</p>
                {[
                  ['badge', 'Badge / Eyebrow Label'],
                  ['title', 'Page Title'],
                  ['intro', 'Intro Description'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.videos?.[key] || ''}
                      onChange={e => setPages({ ...pages, videos: { ...(pages.videos || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* Channel Banner */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">YouTube Channel Banner</p>
                {[
                  ['bannerTitle', 'Channel Name'],
                  ['bannerSubtitle', 'Banner Subtitle'],
                  ['bannerBtn', 'Subscribe Button Label'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.videos?.[key] || ''}
                      onChange={e => setPages({ ...pages, videos: { ...(pages.videos || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* Playlists UI Labels */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Playlists UI Labels</p>
                {[
                  ['playlistsHeader', 'Section Heading'],
                  ['browsePlaylists', 'Browse Playlist Hover Text'],
                  ['viewVideosBtn', 'Card View Videos Label'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.videos?.[key] || ''}
                      onChange={e => setPages({ ...pages, videos: { ...(pages.videos || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('videos', VIDEOS_BLOCK_SLOTS, 'Videos Page')}
            </div>
          )}

          {/* SECTION: CONTACT PAGE TEXT */}
          {editPageSection === 'contact' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">✉</span>
                    <span>Contact Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">Control headers, contact information, and sidebar cards.</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreDefaultSection('contact', 'Contact Page')}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* Visibility Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:border-studio-magenta/40 w-fit">
                <input
                  type="checkbox"
                  checked={pages.contact?.headerVisible !== false}
                  onChange={e => setPages({ ...pages, contact: { ...(pages.contact || {}), headerVisible: e.target.checked } })}
                  className="accent-studio-magenta"
                />
                Show Page Header
              </label>

              {/* Page Header Fields */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Page Header</p>
                {[
                  ['badge', 'Badge / Eyebrow Label'],
                  ['title', 'Page Title'],
                  ['intro', 'Intro Paragraph'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.contact?.[key] || ''}
                      onChange={e => setPages({ ...pages, contact: { ...(pages.contact || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* Left Column Labels */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Sidebar Labels</p>
                {[
                  ['directEmailTitle', 'Direct Email Card Title'],
                  ['directEmailDesc', 'Direct Email Card Description'],
                  ['channelsTitle', 'Studio Channels Card Title'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <textarea
                      rows={2}
                      value={pages.contact?.[key] || ''}
                      onChange={e => setPages({ ...pages, contact: { ...(pages.contact || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* Privacy Notice Box */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Privacy Notice Box</p>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Privacy Box Title</label>
                  <input
                    type="text"
                    value={pages.contact?.privacyTitle || ''}
                    placeholder="Studio Privacy Protection"
                    onChange={e => setPages({ ...pages, contact: { ...(pages.contact || {}), privacyTitle: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Privacy Box Text</label>
                  <textarea
                    rows={2}
                    value={pages.contact?.privacyText || ''}
                    placeholder="Your details are only used to respond to your inquiry."
                    onChange={e => setPages({ ...pages, contact: { ...(pages.contact || {}), privacyText: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
              </div>

              {/* Divider */}
              <hr className="border-white/10" />

              {/* Contact Form — Google Forms setup */}
              <h3 className="text-sm font-semibold text-studio-gold uppercase tracking-wider">Contact & Direct Email Setup</h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Artist Direct Email Address</label>
                <input
                  type="email"
                  value={site.contact?.email || ''}
                  onChange={e => setSite({ ...site, contact: { ...site.contact, email: e.target.value } })}
                  placeholder="rberube54@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-studio-magenta"
                />
                <span className="text-[11px] text-slate-400">This email is shown in the footer and contact page for direct buyer inquiries.</span>
              </div>

              {/* Google Form Embed Setup */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-studio-gold uppercase tracking-wider">
                  Google Form Embed (Contact Page)
                </p>
                <p className="text-xs text-slate-300">
                  Paste either the embed URL or the full embed HTML (from Google Forms &gt; Send &gt; &lt;&gt; Embed):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Embed URL / HTML snippet</label>
                    <input
                      type="text"
                      placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                      value={site.contact?.googleContactEmbedUrl || ''}
                      onChange={e => {
                        let val = e.target.value.trim()
                        const match = val.match(/src=["'](.*?)["']/)
                        if (match && match[1]) val = match[1]
                        setSite({ ...site, contact: { ...(site.contact || {}), googleContactEmbedUrl: val } })
                      }}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Embed Height (px)</label>
                    <input
                      type="number"
                      placeholder="850"
                      value={site.contact?.googleContactEmbedHeight || 850}
                      onChange={e => setSite({ ...site, contact: { ...(site.contact || {}), googleContactEmbedHeight: parseInt(e.target.value) || 850 } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Free Google Forms Notification Setup Card */}
              <div className="p-4 rounded-xl bg-studio-gold/10 border border-studio-gold/30 space-y-3">
                <div className="flex items-center gap-2 text-studio-gold font-semibold text-xs">
                  <Mail className="w-4 h-4" />
                  <span>100% Free Google Forms Email Notifications (No Netlify Pro Needed!)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To get free instant email notifications sent to your Gmail inbox every time someone submits a form:
                </p>
                <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1 pl-1">
                  <li>Open your Google Form in Google Drive.</li>
                  <li>Click on the <strong>Responses</strong> tab at the top.</li>
                  <li>Click the three vertical dots (<strong>⋮</strong>) next to the green Sheets icon.</li>
                  <li>Click <strong>"Get email notifications for new responses"</strong>.</li>
                </ol>
                <p className="text-[11px] text-studio-gold font-medium">
                  That's it! Google will immediately email you for every response for free forever.
                </p>
              </div>

              {/* Custom Block Slots */}
              {renderBlockSlotsEditor('contact', CONTACT_BLOCK_SLOTS, 'Contact Page')}
            </div>
          )}

          {/* SECTION: PAINTING DETAIL PAGE */}
          {editPageSection === 'paintingDetail' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🔍</span>
                    <span>Painting & Playlist Detail Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">Control navigation buttons, story headers, and inquiry prompts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreDefaultSection('paintingDetail', 'Painting Detail Page')}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Navigation & Video Buttons</p>
                {[
                  ['backButtonText', 'Back Button Label'],
                  ['prevButtonText', 'Previous Item Label'],
                  ['nextButtonText', 'Next Item Label'],
                  ['watchVideoPrompt', 'Video Player Overlay Prompt'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.paintingDetail?.[key] || ''}
                      onChange={e => setPages({ ...pages, paintingDetail: { ...(pages.paintingDetail || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Section Headings & Status</p>
                {[
                  ['aboutArtworkHeading', 'Artwork Story Heading (Photo-Only)'],
                  ['aboutDemoHeading', 'Demonstration Story Heading (Videos)'],
                  ['statusLabel', 'Status Section Label'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.paintingDetail?.[key] || ''}
                      onChange={e => setPages({ ...pages, paintingDetail: { ...(pages.paintingDetail || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Purchase & Inquiry Prompts</p>
                {[
                  ['inquirePromptAvailable', 'Prompt When Available (No Price)'],
                  ['inquirePromptSold', 'Prompt When Sold'],
                  ['inquirePromptVideo', 'Prompt For Video Demonstrations'],
                  ['inquirePromptOriginal', 'Prompt For Non-Video Originals'],
                  ['buyButtonText', 'Buy / Inquire Button Label'],
                  ['inquireButtonText', 'General Inquire Button Label'],
                  ['printsButtonText', 'Prints (Fine Art America) Button Label'],
                  ['packagingNotice', 'Archival Packaging Notice (Bottom)'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.paintingDetail?.[key] || ''}
                      onChange={e => setPages({ ...pages, paintingDetail: { ...(pages.paintingDetail || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: 404 NOT FOUND PAGE */}
          {editPageSection === 'notFound' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">🚫</span>
                    <span>404 Not Found Page Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">Control error code, page title, description, and return buttons.</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreDefaultSection('notFound', '404 Page')}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                {[
                  ['badge', 'Error Code / Badge'],
                  ['title', 'Page Title'],
                  ['intro', 'Intro / Explanation Message'],
                  ['homeButtonText', 'Return to Home Button Label'],
                  ['galleryButtonText', 'Explore Gallery Button Label'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.notFound?.[key] || ''}
                      onChange={e => setPages({ ...pages, notFound: { ...(pages.notFound || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: FOOTER, HEADER & NOTICE BANNER */}
          {editPageSection === 'footerHeader' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-studio-gold">⚓</span>
                    <span>Header, Footer & Notice Banner Editor</span>
                  </h3>
                  <p className="text-xs text-slate-400">Control header navigation links, YouTube button text, site-wide notice banner, footer explore links, and studio info.</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreDefaultSection('footerHeader', 'Header, Footer & Notice Banner')}
                  className="px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-studio-gold/60 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Restore Default Text</span>
                </button>
              </div>

              {/* 1. Header Navigation & Action Buttons */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-studio-gold uppercase tracking-wider">Header Navigation & Button Text</p>
                  <p className="text-xs text-slate-400">Customize labels for the top navigation menu links and the YouTube call-to-action button.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    ['navHome', 'Home Nav Link', 'Home'],
                    ['navGallery', 'Gallery Nav Link', 'Gallery'],
                    ['navAbout', 'About Nav Link', 'About'],
                    ['navCommissions', 'Commissions & Prints Nav Link', 'Commissions & Prints'],
                    ['navVideos', 'Videos Nav Link', 'Videos'],
                    ['navContact', 'Contact Nav Link', 'Contact'],
                  ].map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={pages.header?.[key] || ''}
                        onChange={e => setPages({
                          ...pages,
                          header: { ...(pages.header || {}), [key]: e.target.value }
                        })}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">YouTube Header Button Text</label>
                    <input
                      type="text"
                      placeholder="YouTube"
                      value={pages.header?.youtubeBtn || ''}
                      onChange={e => setPages({
                        ...pages,
                        header: { ...(pages.header || {}), youtubeBtn: e.target.value }
                      })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Site Migration Notice Banner */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Site Migration Notice Banner</p>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={pages.footer?.noticeVisible !== false}
                      onChange={e => setPages({ ...pages, footer: { ...(pages.footer || {}), noticeVisible: e.target.checked } })}
                      className="accent-studio-magenta"
                    />
                    Show Notice Banner
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notice Prefix / Label</label>
                  <input
                    type="text"
                    value={pages.footer?.noticePrefix || ''}
                    onChange={e => setPages({ ...pages, footer: { ...(pages.footer || {}), noticePrefix: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notice Message Text</label>
                  <textarea
                    rows={2}
                    value={pages.footer?.noticeText || ''}
                    onChange={e => setPages({ ...pages, footer: { ...(pages.footer || {}), noticeText: e.target.value } })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
              </div>

              {/* 3. Footer Studio Info & Email Label */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Footer Studio Information & Direct Email</p>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Artist Direct Email Label</label>
                  <input
                    type="text"
                    placeholder="Artist Direct Email:"
                    value={pages.footer?.directEmailLabel || pages.footer?.emailLabel || ''}
                    onChange={e => setPages({
                      ...pages,
                      footer: {
                        ...(pages.footer || {}),
                        directEmailLabel: e.target.value,
                        emailLabel: e.target.value
                      }
                    })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>
                {[
                  ['studioName', 'Studio Name'],
                  ['location', 'Location'],
                  ['tagline', 'Tagline'],
                  ['bioShort', 'Short Bio Paragraph'],
                  ['priceListsTitle', 'Official Price Lists Title'],
                  ['priceListsSubtitle', 'Official Price Lists Subtitle'],
                  ['copyrightNotice', 'Copyright Notice'],
                  ['originText', 'Origin / Location Badge'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={pages.footer?.[key] || ''}
                      onChange={e => setPages({ ...pages, footer: { ...(pages.footer || {}), [key]: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                ))}
              </div>

              {/* 4. Footer Explore Quick Links Manager */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-studio-gold uppercase tracking-wider">Footer "Explore" Quick Links</p>
                    <p className="text-xs text-slate-400">Add, remove, reorder, or edit the navigation links shown under "Explore" in the footer.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = pages.footer?.exploreLinks || [
                        { label: 'Original Art Gallery', target: '/gallery' },
                        { label: 'About the Artist & Studio', target: '/about' },
                        { label: 'Commissions & Pricing', target: '/commissions' },
                        { label: 'YouTube Painting Tutorials', target: '/videos' },
                        { label: 'Contact Rick', target: '/contact' }
                      ]
                      setPages({
                        ...pages,
                        footer: {
                          ...(pages.footer || {}),
                          exploreLinks: [...cur, { label: 'New Link', target: '/gallery' }]
                        }
                      })
                    }}
                    className="px-3 py-1.5 rounded-lg bg-studio-magenta text-white hover:bg-studio-fuchsia text-xs font-semibold flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Section Title</label>
                  <input
                    type="text"
                    placeholder="Explore"
                    value={pages.footer?.exploreTitle || ''}
                    onChange={e => setPages({
                      ...pages,
                      footer: { ...(pages.footer || {}), exploreTitle: e.target.value }
                    })}
                    className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  {(pages.footer?.exploreLinks || [
                    { label: 'Original Art Gallery', target: '/gallery' },
                    { label: 'About the Artist & Studio', target: '/about' },
                    { label: 'Commissions & Pricing', target: '/commissions' },
                    { label: 'YouTube Painting Tutorials', target: '/videos' },
                    { label: 'Contact Rick', target: '/contact' }
                  ]).map((item, idx, arr) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return
                            const cur = [...arr]
                            const tmp = cur[idx]
                            cur[idx] = cur[idx - 1]
                            cur[idx - 1] = tmp
                            setPages({ ...pages, footer: { ...(pages.footer || {}), exploreLinks: cur } })
                          }}
                          className={`p-1.5 rounded bg-white/5 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            if (idx === arr.length - 1) return
                            const cur = [...arr]
                            const tmp = cur[idx]
                            cur[idx] = cur[idx + 1]
                            cur[idx + 1] = tmp
                            setPages({ ...pages, footer: { ...(pages.footer || {}), exploreLinks: cur } })
                          }}
                          className={`p-1.5 rounded bg-white/5 ${idx === arr.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Link Text</label>
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={e => {
                              const cur = [...arr]
                              cur[idx] = { ...cur[idx], label: e.target.value }
                              setPages({ ...pages, footer: { ...(pages.footer || {}), exploreLinks: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-studio-magenta"
                            placeholder="e.g. Original Art Gallery"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Target URL / Path</label>
                          <input
                            type="text"
                            value={item.target || ''}
                            onChange={e => {
                              const cur = [...arr]
                              cur[idx] = { ...cur[idx], target: e.target.value }
                              setPages({ ...pages, footer: { ...(pages.footer || {}), exploreLinks: cur } })
                            }}
                            className="w-full bg-[#13111c] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-studio-magenta"
                            placeholder="e.g. /gallery or https://..."
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cur = arr.filter((_, i) => i !== idx)
                          setPages({ ...pages, footer: { ...(pages.footer || {}), exploreLinks: cur } })
                        }}
                        className="p-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 transition shrink-0"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sticky Save Button */}
          <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-studio-surface/95 backdrop-blur-md border border-studio-gold/40 shadow-2xl flex items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">
                Editing: <span className="text-studio-gold font-bold uppercase">{editPageSection}</span>
              </span>
              {hasUnsavedChangesForSection(editPageSection) ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  ● Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  ✓ Saved
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl text-sm font-semibold bg-studio-gold text-black hover:bg-studio-gold-light transition flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Page Content Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: HELP */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-studio-gold/30 bg-gradient-to-b from-studio-gold/5 to-transparent">
            <h2 className="font-serif text-xl font-bold text-studio-gold mb-1">Admin Help & How-To Guide</h2>
            <p className="text-xs text-slate-400">Everything you need to know to manage your art studio website. No coding required.</p>
          </div>

          {/* Visual Guide Viewer Card */}
          <div className="glass-panel p-5 rounded-2xl border border-studio-gold/40 bg-gradient-to-r from-studio-gold/10 via-studio-card to-studio-surface space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveGuideModal({
                    id: 'website-update-guide',
                    title: 'Website Update Guide',
                    preview: '/docs/website-update-guide-preview.webp',
                    pdf: '/docs/Website-Update-Guide.pdf',
                    downloadName: 'Website-Update-Guide.pdf'
                  })}
                  className="group relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden border border-white/20 shadow-lg shrink-0 hover:border-studio-gold transition focus:outline-none focus:ring-2 focus:ring-studio-gold cursor-pointer"
                  title="Click to open Website Update Guide in full-screen viewer"
                >
                  <img
                    src="/docs/website-update-guide-thumb.webp"
                    alt="Website Update Guide"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="p-1.5 rounded-full bg-studio-gold text-black shadow opacity-90 group-hover:opacity-100 group-hover:scale-110 transition">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </button>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-studio-gold uppercase tracking-wider">
                    Official Reference Document
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Website Update Guide
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    View the complete reference guide with visual instructions, shortcuts, and workflows for updating paintings, pricing, and pages.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveGuideModal({
                        id: 'website-update-guide',
                        title: 'Website Update Guide',
                        preview: '/docs/website-update-guide-preview.webp',
                        pdf: '/docs/Website-Update-Guide.pdf',
                        downloadName: 'Website-Update-Guide.pdf'
                      })}
                      className="px-3.5 py-1.5 rounded-xl bg-studio-gold text-black hover:bg-studio-gold-light text-xs font-semibold flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Open Full Screen</span>
                    </button>
                    <a
                      href="/docs/Website-Update-Guide.pdf"
                      download="Website-Update-Guide.pdf"
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-studio-gold" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK START */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">🚀</span> Quick Start — Typical Workflow</h3>
            <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1.5 pl-2">
              <li>Run <code className="text-studio-magenta font-mono bg-white/5 px-1 rounded">npm run dev</code> in a terminal to start the local admin server.</li>
              <li>Open <a href="http://localhost:5180/admin" className="text-studio-magenta underline" target="_blank">localhost:5180/admin</a> in your browser.</li>
              <li>Add or edit paintings, sync playlists, and update page text as needed.</li>
              <li>Click <strong className="text-white">View Website</strong> in the top bar to preview changes.</li>
              <li>When satisfied, run <code className="text-studio-magenta font-mono bg-white/5 px-1 rounded">npm run publish</code> (or <code className="text-studio-magenta font-mono bg-white/5 px-1 rounded">npm run publish -- "your message"</code>) to push everything live.</li>
            </ol>
          </div>

          {/* ADD PAINTINGS */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">🖼️</span> Adding Paintings</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-white">Photo-Only Painting:</strong> Click <em>Add Single Painting</em> tab, make sure <em>Photo only</em> mode is selected, drag-and-drop or browse for your photo(s). Multiple files create multiple catalog entries automatically. Photos are resized to 1600px WebP + 500px thumbnail on upload (requires dev server running).</p>
              <p><strong className="text-white">From YouTube Video:</strong> Switch to <em>From YouTube video</em> mode, paste the video URL, click <em>Fetch Info</em>. The title and best available thumbnail are filled in for you. Optionally attach a high-res photo to override the thumbnail.</p>
              <p><strong className="text-white">Bulk Import:</strong> Use the <em>Bulk Importer</em> tab to paste multiple <code className="font-mono bg-white/5 px-1 rounded">URL | Playlist Name</code> lines at once. The playlist name must match an existing playlist exactly (case-insensitive).</p>
            </div>
          </div>

          {/* STATUS BADGES */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">🏷️</span> Status Badges & Availability</h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>Each painting can have one of these status badges shown in the gallery:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li><strong className="text-emerald-400">For Sale</strong> — Shows an Inquire/Buy button and displays the price if set.</li>
                <li><strong className="text-rose-400">Sold</strong> — Shows a red Sold badge. Hides Buy/Inquire button.</li>
                <li><strong className="text-amber-400">Reserved</strong> — Shows an amber Reserved badge.</li>
                <li><strong className="text-slate-400">Not Available for Sale</strong> — Shows a gray badge. No buy button.</li>
                <li><em>None</em> — No badge shown.</li>
              </ul>
              <p className="pt-1">Change status from the <em>Paintings</em> tab using the quick dropdown next to each item, or select multiple items and use <em>Bulk Set Status</em>.</p>
            </div>
          </div>

          {/* HIDING PAINTINGS */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">👁️</span> Hiding & Showing Paintings</h3>
            <p className="text-xs text-slate-300">In the <em>Paintings</em> tab, click the eye icon next to any item to hide it from the public Gallery without deleting it. Hidden items appear dimmed in the admin list. Click the eye again to show it. This is useful for works-in-progress or seasonal items.</p>
          </div>

          {/* PLAYLISTS & SYNC */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">▶️</span> Playlists & YouTube Sync</h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p><strong className="text-white">Add a Playlist:</strong> Paste a YouTube Playlist URL or ID in the <em>Playlists</em> tab and click <em>Add & Sync</em>. Requires <code className="font-mono bg-white/5 px-1 rounded">YOUTUBE_API_KEY</code> in your <code className="font-mono bg-white/5 px-1 rounded">.env</code> file.</p>
              <p><strong className="text-white">Sync:</strong> Click the <em>Sync</em> button next to a playlist to pull the latest videos from YouTube. New videos are added; existing videos and your custom edits are never overwritten. Click <em>Sync All</em> to update every playlist at once.</p>
              <p><strong className="text-white">Command-line sync:</strong> You can also run <code className="font-mono bg-white/5 px-1 rounded">npm run sync-playlists</code> from a terminal (reads your <code className="font-mono bg-white/5 px-1 rounded">.env</code> automatically).</p>
              <p><strong className="text-white">Replace Old Domain:</strong> If video descriptions contain your old <em>rjbartstudio.com</em> links, click <em>Replace Old Domain</em> in the Playlists tab to update them all in one step.</p>
            </div>
          </div>

          {/* PAGE TEXT */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">📝</span> Editing Page Text</h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>Use the <em>Page Text & Content</em> tab (or the Quick Page Editor dropdown at the top) to edit headings, bios, service descriptions, awards, and contact details for every page of your website.</p>
              <p>Changes are saved to <code className="font-mono bg-white/5 px-1 rounded">src/data/site.json</code> on your computer. They will appear instantly in the local preview and go live the next time you run <code className="font-mono bg-white/5 px-1 rounded">npm run publish</code>.</p>
              <p><strong className="text-white">Restoring defaults:</strong> If you make a mistake, the <em>Restore Defaults</em> button in the Site tab reloads the original text from <code className="font-mono bg-white/5 px-1 rounded">src/data/pages.default.json</code>.</p>
            </div>
          </div>

          {/* PREVIEW & PUBLISH */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">🌐</span> Previewing & Publishing</h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p><strong className="text-white">Preview locally:</strong> Click <em>View Website</em> in the top bar. This opens your local site at <code className="font-mono bg-white/5 px-1 rounded">localhost:5180</code> — changes appear here immediately without publishing.</p>
              <p><strong className="text-white">Publish to the live site:</strong></p>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                <li>Open a terminal in the project folder.</li>
                <li>Run: <code className="font-mono bg-white/5 px-1 rounded">npm run publish</code></li>
                <li>Or with a custom git commit message: <code className="font-mono bg-white/5 px-1 rounded">npm run publish -- "Added new seascape"</code></li>
              </ul>
              <p>This automatically: stages all changes → commits → pushes to GitHub → builds → deploys to Netlify.</p>
              <p><strong className="text-white">Emergency deploy only (skip git):</strong> <code className="font-mono bg-white/5 px-1 rounded">npm run deploy</code></p>
            </div>
          </div>

          {/* SMOKE TEST */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="text-studio-gold">✅</span> Site Health Check</h3>
            <p className="text-xs text-slate-300">Run <code className="font-mono bg-white/5 px-1 rounded">npm run check</code> in a terminal to verify that all pages, JSON data files, and key site features are working correctly before publishing. The check runs without a browser and reports any problems.</p>
          </div>
        </div>
      )}

      {/* Website Update Guide Modal */}
      {activeGuideModal && (
        <PriceListModal item={activeGuideModal} onClose={() => setActiveGuideModal(null)} />
      )}

    </div>
  )
}
