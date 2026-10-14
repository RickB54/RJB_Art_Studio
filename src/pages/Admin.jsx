import React, { useState, useEffect } from 'react'
import { Plus, Youtube, Save, Trash2, Edit3, CheckCircle2, AlertCircle, RefreshCw, Upload, Globe, Film } from 'lucide-react'
import siteDataInitial from '../data/site.json'
import paintingsDataInitial from '../data/paintings.json'

export default function Admin() {
  const [paintings, setPaintings] = useState(paintingsDataInitial)
  const [site, setSite] = useState(siteDataInitial)
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'bulk' | 'manage' | 'site'
  
  // Single painting form state
  const [inputUrl, setInputUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    category: 'Landscapes & Seascapes',
    year: new Date().getFullYear().toString(),
    medium: 'Oil on Canvas',
    size: '16x20',
    description: '',
    sold: false,
    price: '',
    youtubeUrl: '',
    videoId: '',
    thumbnail: '',
    customImage: '',
    fineArtAmericaUrl: '',
    featured: false
  })

  // Bulk input state
  const [bulkText, setBulkText] = useState('')
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkResult, setBulkResult] = useState('')

  // Load latest data on mount
  useEffect(() => {
    fetch('/__api/data')
      .then(res => res.json())
      .then(data => {
        if (data.paintings) setPaintings(data.paintings)
        if (data.site) setSite(data.site)
      })
      .catch(() => {
        // Fallback to imported state if not in dev server mode
      })
  }, [])

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

  // Save single painting
  const handleSavePainting = async (e) => {
    e.preventDefault()
    setSaveSuccess('')

    const paintingId = editingId || (form.videoId ? `video-${form.videoId}` : `art-${Date.now()}`)
    const newEntry = {
      id: paintingId,
      ...form,
      price: form.price ? Number(form.price) : null
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
        // Reset form
        setEditingId(null)
        setInputUrl('')
        setForm({
          title: '',
          category: 'Landscapes & Seascapes',
          year: new Date().getFullYear().toString(),
          medium: 'Oil on Canvas',
          size: '16x20',
          description: '',
          sold: false,
          price: '',
          youtubeUrl: '',
          videoId: '',
          thumbnail: '',
          customImage: '',
          fineArtAmericaUrl: '',
          featured: false
        })
      }
    } catch (err) {
      alert('Error saving painting: ' + err.message)
    }
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
    setForm({
      title: p.title || '',
      category: p.category || 'Landscapes & Seascapes',
      year: p.year || '2020',
      medium: p.medium || 'Oil on Canvas',
      size: p.size || '16x20',
      description: p.description || '',
      sold: !!p.sold,
      price: p.price ? p.price.toString() : '',
      youtubeUrl: p.youtubeUrl || '',
      videoId: p.videoId || '',
      thumbnail: p.thumbnail || '',
      customImage: p.customImage || '',
      fineArtAmericaUrl: p.fineArtAmericaUrl || '',
      featured: !!p.featured
    })
    setInputUrl(p.youtubeUrl || '')
    setActiveTab('single')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Bulk Process
  const handleBulkProcess = async () => {
    if (!bulkText.trim()) return
    setBulkProcessing(true)
    setBulkResult('')

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    let addedCount = 0
    let currentList = [...paintings]

    for (let line of lines) {
      let [url, category] = line.split('|').map(s => s.trim())
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/i)
      const videoId = match ? match[1] : null

      if (!videoId || currentList.some(p => p.videoId === videoId)) continue

      let title = `Painting ${videoId}`
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          if (data.title) title = data.title
        }
      } catch (e) {}

      const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      const newEntry = {
        id: `video-${videoId}`,
        title,
        category: category || 'Landscapes & Seascapes',
        year: new Date().getFullYear().toString(),
        medium: 'Oil or Acrylic on Canvas',
        size: 'Custom',
        description: 'Original artwork created by Rick J Berube. Watch the complete painting demonstration in the video.',
        sold: false,
        price: null,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        thumbnail,
        customImage: '',
        fineArtAmericaUrl: site.socials.fineArtAmerica || '',
        draft: true,
        featured: false
      }

      currentList.unshift(newEntry)
      addedCount++
    }

    try {
      await fetch('/__api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: currentList })
      })
      setPaintings(currentList)
      setBulkResult(`Successfully added ${addedCount} new paintings!`)
      setBulkText('')
    } catch (e) {
      setBulkResult('Error saving bulk items: ' + e.message)
    } finally {
      setBulkProcessing(false)
    }
  }

  // Save Site Settings
  const handleSaveSite = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/__api/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site })
      })
      if (res.ok) {
        alert('Site content updated and saved to src/data/site.json!')
      }
    } catch (e) {
      alert('Failed to save site data: ' + e.message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
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
            Add paintings from YouTube, edit descriptions, adjust prices, and update your site without touching code.
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs space-y-1">
          <p className="text-studio-gold font-semibold">To make changes live on Netlify:</p>
          <p className="text-slate-300">Run <code className="text-studio-magenta font-mono bg-white/5 px-1 py-0.5 rounded">npm run publish</code> in PowerShell</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === 'single'
              ? 'bg-studio-magenta text-white shadow-glow-magenta'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {editingId ? 'Edit Painting' : 'Add Single Painting'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === 'bulk'
              ? 'bg-studio-magenta text-white shadow-glow-magenta'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Bulk YouTube Importer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === 'manage'
              ? 'bg-studio-magenta text-white shadow-glow-magenta'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Manage All Paintings ({paintings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === 'site'
              ? 'bg-studio-magenta text-white shadow-glow-magenta'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Edit Site Text & Links
        </button>
      </div>

      {/* TAB 1: Single Painting Form */}
      {activeTab === 'single' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                {editingId ? `Editing: ${form.title}` : 'Add a Painting from YouTube'}
              </h2>
              <p className="text-xs text-slate-400">
                Paste any video link from your channel. The title and highest-quality thumbnail will be fetched automatically.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setInputUrl('') }}
                className="text-xs text-studio-gold hover:underline"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          {/* Quick URL Fetch Bar */}
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

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Painting Details Form */}
          <form onSubmit={handleSavePainting} className="space-y-6 pt-2">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Thumbnail Preview */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-300">Thumbnail Preview</span>
                <div className="aspect-[4/3] rounded-xl bg-studio-surface border border-white/10 overflow-hidden flex items-center justify-center relative">
                  {form.thumbnail ? (
                    <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">No thumbnail yet</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Video ID: <span className="font-mono text-studio-magenta">{form.videoId || 'none'}</span>
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
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    >
                      {site.categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Year Created</label>
                    <input
                      type="text"
                      value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Medium</label>
                    <input
                      type="text"
                      value={form.medium}
                      placeholder="e.g. Oil on Canvas, Acrylic on Panel"
                      onChange={e => setForm({ ...form, medium: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Dimensions / Size</label>
                    <input
                      type="text"
                      value={form.size}
                      placeholder="e.g. 16x20, 18x24"
                      onChange={e => setForm({ ...form, size: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Sales & Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Availability Status</label>
                <select
                  value={form.sold ? 'sold' : 'available'}
                  onChange={e => setForm({ ...form, sold: e.target.value === 'sold' })}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="available">Available for Purchase</option>
                  <option value="sold">Sold / Permanent Collection</option>
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

            {/* Optional Custom Photo & Featured Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Optional High-Res Photo (Replaces YouTube Thumbnail)
                </label>
                <input
                  type="text"
                  placeholder="/images/my-painting.webp or image URL"
                  value={form.customImage}
                  onChange={e => setForm({ ...form, customImage: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={form.featured}
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-studio-magenta focus:ring-studio-magenta"
                />
                <label htmlFor="featuredToggle" className="text-xs font-medium text-slate-200">
                  Feature on Home Page showcase
                </label>
              </div>
            </div>

            {/* Description (Rich Text preserving line breaks) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Painting Description & Sales Story (Keeps line breaks and links)
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
              Paste up to 20 YouTube URLs from your channel (one per line). Optionally add a category separated by a pipe character (<code className="text-studio-gold">|</code>).
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-slate-400 font-mono space-y-1">
            <p className="text-studio-gold font-semibold">Example format:</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID1 | Wildlife</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID2 | Landscapes & Seascapes</p>
            <p>https://www.youtube.com/watch?v=VIDEO_ID3 | Floral</p>
          </div>

          <textarea
            rows={8}
            placeholder="Paste your video links here..."
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-studio-magenta"
          />

          {bulkResult && (
            <div className="p-3.5 rounded-xl bg-studio-card border border-studio-magenta/40 text-xs text-white">
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

      {/* TAB 3: Manage All Paintings */}
      {activeTab === 'manage' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-white">Artwork Catalog ({paintings.length})</h2>
              <p className="text-xs text-slate-400">Click Edit to modify details or Delete to remove from gallery.</p>
            </div>
            <button
              type="button"
              onClick={() => { setEditingId(null); setActiveTab('single') }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-studio-magenta text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paintings.map(painting => (
              <div key={painting.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <img src={painting.thumbnail} alt="" className="w-20 h-16 object-cover rounded-lg bg-black" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-studio-magenta uppercase font-semibold block">{painting.category}</span>
                    <h3 className="text-sm font-bold text-white truncate">{painting.title}</h3>
                    <p className="text-xs text-slate-400">{painting.medium} • {painting.size}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      painting.sold ? 'bg-rose-950/80 text-rose-300' : 'bg-emerald-950/80 text-emerald-300'
                    }`}>
                      {painting.sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  {painting.youtubeUrl && (
                    <a href={painting.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(painting)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-studio-magenta hover:text-white text-slate-300 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePainting(painting.id, painting.title)}
                      className="p-1 rounded bg-white/5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Painting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Edit Site Settings */}
      {activeTab === 'site' && (
        <form onSubmit={handleSaveSite} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Edit Site Content & Links</h2>
            <p className="text-xs text-slate-400">All text is stored in <code className="text-slate-300">src/data/site.json</code>.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={site.artist.tagline}
                onChange={e => setSite({ ...site, artist: { ...site.artist, tagline: e.target.value } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Short Bio (Home Hero)</label>
              <textarea
                rows={2}
                value={site.artist.bioShort}
                onChange={e => setSite({ ...site, artist: { ...site.artist, bioShort: e.target.value } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Studio Update (Knee Surgery Note)</label>
              <input
                type="text"
                value={site.artist.recoveryNotice}
                onChange={e => setSite({ ...site, artist: { ...site.artist, recoveryNotice: e.target.value } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fine Art America Profile URL</label>
              <input
                type="url"
                value={site.socials.fineArtAmerica}
                onChange={e => setSite({ ...site, socials: { ...site.socials, fineArtAmerica: e.target.value } })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-7 py-2.5 rounded-xl text-sm font-semibold bg-studio-gold text-black hover:bg-studio-gold-light transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Site Content</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  )
}
