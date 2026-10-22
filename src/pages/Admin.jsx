import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Youtube, Save, Trash2, Edit3, CheckCircle2, AlertCircle, RefreshCw, Upload, Globe, Film, Layers, Eye, EyeOff, ArrowUp, ArrowDown, Link as LinkIcon, RotateCcw, Search, X, ChevronDown, Mail, FileText, Award, Sparkles, Image as ImageIcon } from 'lucide-react'
import siteDataInitial from '../data/site.json'
import paintingsDataInitial from '../data/paintings.json'
import pagesDataInitial from '../data/pages.json'
import PhotoDropZone from '../components/PhotoDropZone'

export default function Admin() {
  const [paintings, setPaintings] = useState(paintingsDataInitial)
  const [site, setSite] = useState(siteDataInitial)
  const [pages, setPages] = useState(pagesDataInitial)
  const [playlists, setPlaylists] = useState([])
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'bulk' | 'manage' | 'playlists' | 'site'
  const [paintingMode, setPaintingMode] = useState('photo') // 'youtube' | 'photo'
  const [editPageSection, setEditPageSection] = useState('home') // 'home' | 'about' | 'commissions' | 'contact'
  const [siteSaveSuccess, setSiteSaveSuccess] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkStatusValue, setBulkStatusValue] = useState('For Sale')
  const [quickPhotoId, setQuickPhotoId] = useState(null)
  const [newExtraCat, setNewExtraCat] = useState('')
  
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
        if (data.pages) setPages(data.pages)
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
        setSiteSaveSuccess('✓ Site content and page text successfully saved to src/data/site.json and src/data/pages.json!')
        setTimeout(() => setSiteSaveSuccess(''), 6000)
      } else {
        throw new Error('Save failed')
      }
    } catch (e) {
      alert('Failed to save data: ' + e.message)
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

      {/* Quick Page Content Selector Bar - user requested dropdown to stay in Admin while picking pages */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-studio-gold shrink-0" />
          <span className="text-studio-gold font-semibold uppercase tracking-wider">Quick Page Editor:</span>
          <span className="text-slate-300">Select any page to modify its text directly:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeTab === 'site' ? editPageSection : ''}
            onChange={(e) => {
              setActiveTab('site')
              setEditPageSection(e.target.value)
            }}
            className="w-full sm:w-auto bg-[#13111c] border border-studio-magenta/50 text-white text-xs font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-studio-magenta cursor-pointer shadow-sm"
          >
            <option value="" disabled>-- Select Page to Edit Text --</option>
            <option value="home">🏠 Home Page Text & Bio</option>
            <option value="about">🎨 About & Studio Page (Awards & Photos)</option>
            <option value="commissions">✍ Commissions & Prints Services</option>
            <option value="contact">✉ Contact & Direct Email / Google Forms</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[['single', editingId ? 'Edit Painting' : 'Add Single Painting'],
          ['bulk', 'Bulk Importer'],
          ['manage', `Paintings (${paintings.length})`],
          ['playlists', `Playlists (${playlists.length})`],
          ['site', 'Page Text & Content'],
          ['help', '? Help']
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === key
                ? (key === 'help' ? 'bg-studio-gold text-black shadow' : 'bg-studio-magenta text-white shadow-glow-magenta')
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}>
            {label}
          </button>
        ))}
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
                Modify only the text, awards, photos, and links on any page. Changes are saved to <code className="text-slate-300">src/data/site.json</code>.
              </p>
            </div>
            
            {/* Page Section Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">Editing Page:</label>
              <select
                value={editPageSection}
                onChange={e => setEditPageSection(e.target.value)}
                className="bg-[#13111c] border border-studio-magenta/40 text-white text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-studio-magenta"
              >
                <option value="home">🏠 Home Page</option>
                <option value="about">🎨 About & Studio (Awards & Photos)</option>
                <option value="commissions">✍ Commissions & Prints</option>
                <option value="contact">✉ Contact & Email / Google Forms</option>
              </select>
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
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-studio-gold uppercase tracking-wider">Home Page Text & Hero Content</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tagline (Under Rick J Berube)</label>
                <input
                  type="text"
                  value={site.artist.tagline}
                  onChange={e => setSite({ ...site, artist: { ...site.artist, tagline: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Short Bio (Hero Intro)</label>
                <textarea
                  rows={3}
                  value={site.artist.bioShort}
                  onChange={e => setSite({ ...site, artist: { ...site.artist, bioShort: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Site Migration Notice Banner</label>
                <input
                  type="text"
                  value={site.artist.siteMigrationNotice || ''}
                  onChange={e => setSite({ ...site, artist: { ...site.artist, siteMigrationNotice: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Fine Art America Profile URL</label>
                <input
                  type="url"
                  value={site.socials.fineArtAmerica}
                  onChange={e => setSite({ ...site, socials: { ...site.socials, fineArtAmerica: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              {/* Extra Gallery Categories */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Extra Gallery Categories (Visible as filter pills in Gallery alongside YouTube playlists)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(site.extraCategories || []).map((cat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/10 text-white border border-white/10">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = site.extraCategories.filter((_, i) => i !== idx)
                          setSite({ ...site, extraCategories: updated })
                        }}
                        className="hover:text-red-400 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category name (e.g. Miniatures, Studies)..."
                    value={newExtraCat}
                    onChange={e => setNewExtraCat(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newExtraCat.trim()) return
                      const trimmed = newExtraCat.trim()
                      if (!(site.extraCategories || []).includes(trimmed)) {
                        setSite({ ...site, extraCategories: [...(site.extraCategories || []), trimmed] })
                      }
                      setNewExtraCat('')
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white hover:bg-studio-fuchsia"
                  >
                    Add Category
                  </button>
                </div>
              </div>

              {/* Explore Highlighted Paintings Picker */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Explore Highlighted Paintings (Home Page Showcase)</h4>
                  <p className="text-xs text-slate-400">
                    Choose which paintings appear on the Home page showcase and optionally attach a dedicated photo for each.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5">
                  {paintings.map(p => {
                    const isHighlighted = !!(p.featured || p.highlighted)
                    return (
                      <div key={p.id} className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${isHighlighted ? 'bg-studio-magenta/10 border-studio-magenta/40' : 'bg-white/5 border-white/5'}`}>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-white truncate">
                          <input
                            type="checkbox"
                            checked={isHighlighted}
                            onChange={async () => {
                              const updated = paintings.map(item => item.id === p.id ? { ...item, featured: !isHighlighted, highlighted: !isHighlighted } : item)
                              setPaintings(updated)
                              await fetch('/__api/paintings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paintings: updated })
                              })
                            }}
                            className="w-4 h-4 rounded text-studio-magenta focus:ring-studio-magenta cursor-pointer"
                          />
                          <span className="truncate">{p.title}</span>
                        </label>
                        {isHighlighted && (
                          <div className="pt-1 border-t border-white/10">
                            <PhotoDropZone
                              value={p.highlightPhoto || p.photo || ''}
                              onChange={async (url, thumb) => {
                                const updated = paintings.map(item => item.id === p.id ? { ...item, highlightPhoto: url, photo: p.photo || url } : item)
                                setPaintings(updated)
                                await fetch('/__api/paintings', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paintings: updated })
                                })
                              }}
                              label="Optional Own Photo"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ABOUT & STUDIO (AWARDS & PHOTOS) */}
          {editPageSection === 'about' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-studio-gold uppercase tracking-wider">About Page, Studio Bio & Mayoral Awards</h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Extended Artistic Bio</label>
                <textarea
                  rows={4}
                  value={site.artist.bioExtended}
                  onChange={e => setSite({ ...site, artist: { ...site.artist, bioExtended: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <PhotoDropZone
                  value={site.artist.aboutPhoto || ''}
                  onChange={url => setSite({ ...site, artist: { ...site.artist, aboutPhoto: url } })}
                  label="Studio / Artist Photo (Shown on About Page)"
                />
              </div>

              <div className="pt-2 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-studio-gold" />
                  <h4 className="text-sm font-bold text-white">Mayoral Artist of the Month Awards & Photos</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Update descriptions and upload/attach ceremony photos (such as Mayor James Jajuga and Rick's father).
                </p>

                {(site.awards || []).map((award, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Award Title</label>
                        <input
                          type="text"
                          value={award.title}
                          onChange={e => {
                            const updated = [...site.awards]
                            updated[idx] = { ...updated[idx], title: e.target.value }
                            setSite({ ...site, awards: updated })
                          }}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Artwork Featured</label>
                        <input
                          type="text"
                          value={award.artwork}
                          onChange={e => {
                            const updated = [...site.awards]
                            updated[idx] = { ...updated[idx], artwork: e.target.value }
                            setSite({ ...site, awards: updated })
                          }}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <PhotoDropZone
                        value={award.image || ''}
                        onChange={url => {
                          const updated = [...site.awards]
                          updated[idx] = { ...updated[idx], image: url }
                          setSite({ ...site, awards: updated })
                        }}
                        label="Award Ceremony Photo"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={award.description}
                        onChange={e => {
                          const updated = [...site.awards]
                          updated[idx] = { ...updated[idx], description: e.target.value }
                          setSite({ ...site, awards: updated })
                        }}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: COMMISSIONS & SERVICES */}
          {editPageSection === 'commissions' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-studio-gold uppercase tracking-wider">Commissions & Prints Services</h3>

              <div className="space-y-4">
                {(site.services || []).map((svc, idx) => (
                  <div key={svc.id || idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Service Title</label>
                        <input
                          type="text"
                          value={svc.title}
                          onChange={e => {
                            const updated = [...site.services]
                            updated[idx] = { ...updated[idx], title: e.target.value }
                            setSite({ ...site, services: updated })
                          }}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={svc.subtitle}
                          onChange={e => {
                            const updated = [...site.services]
                            updated[idx] = { ...updated[idx], subtitle: e.target.value }
                            setSite({ ...site, services: updated })
                          }}
                          className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={e => {
                          const updated = [...site.services]
                          updated[idx] = { ...updated[idx], description: e.target.value }
                          setSite({ ...site, services: updated })
                        }}
                        className="w-full bg-[#13111c] border border-white/10 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Policy Notice */}
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

              {/* Watercolor Commission Notice */}
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
            </div>
          )}

          {/* SECTION: CONTACT & GOOGLE FORMS */}
          {editPageSection === 'contact' && (
            <div className="space-y-6">
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Page Intro Instructions</label>
                <textarea
                  rows={2}
                  value={site.contact?.instructions || ''}
                  onChange={e => setSite({ ...site, contact: { ...site.contact, instructions: e.target.value } })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
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

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-studio-gold/20">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Google Contact Form Response URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/forms/d/e/.../formResponse"
                      value={site.contact?.googleContactFormUrl || ''}
                      onChange={e => setSite({ ...site, contact: { ...site.contact, googleContactFormUrl: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Google Commission Form Response URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/forms/d/e/.../formResponse"
                      value={site.contact?.googleCommissionFormUrl || ''}
                      onChange={e => setSite({ ...site, contact: { ...site.contact, googleCommissionFormUrl: e.target.value } })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Editing: <span className="text-studio-gold font-semibold uppercase">{editPageSection}</span>
            </span>
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

    </div>
  )
}
