import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Play, AlertCircle, ShoppingBag, MessageSquare,
  Image as ImageIcon, Sparkles, X, ChevronDown, RefreshCw,
  ZoomIn, Eye, EyeOff, Edit3, Save, Trash2, Upload, CheckCircle2,
  ExternalLink, XCircle, Search
} from 'lucide-react'
import initialPlaylists from '../data/playlists.json'
import initialPaintings from '../data/paintings.json'

// Render description text with clickable URLs and preserved line breaks
function DescriptionText({ text }) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split('\n').map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {line.split(urlRegex).map((part, i) =>
        part.match(urlRegex)
          ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-studio-gold hover:text-white underline break-all transition">{part}</a>
          : part
      )}
      {lineIdx < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ))
}

// ── Video card used in the grid ──────────────────────────────────────────────
function VideoCard({ video, isActive, paintingMatch, onClick }) {
  if (video.hide) return null
  return (
    <div
      onClick={onClick}
      className={`glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 group ${
        isActive ? 'ring-2 ring-studio-magenta border-studio-magenta/60' : ''
      }`}
    >
      <div className="relative aspect-video bg-black overflow-hidden">
        <img
          src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-white translate-x-0.5" />
          </div>
        </div>
        {paintingMatch && (
          <div className="absolute top-2 right-2 z-10">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md ${
              paintingMatch.sold ? 'bg-rose-950/90 text-rose-300' : 'bg-emerald-950/90 text-emerald-300'
            }`}>{paintingMatch.sold ? 'Sold' : 'Available'}</span>
          </div>
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <h4 className="font-serif text-xs font-bold text-white line-clamp-2 group-hover:text-studio-gold transition-colors">{video.title}</h4>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-studio-magenta font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" /><span>Watch Demo</span>
          </span>
          {paintingMatch?.price && !paintingMatch.sold && (
            <span className="text-studio-gold font-bold">${paintingMatch.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline video editor (Milestone 2) ───────────────────────────────────────
function VideoEditor({ video, paintings, onSave, onClose }) {
  const linked = paintings.find(p => p.videoId === video.id || (p.youtubeUrl && p.youtubeUrl.includes(video.id)))
  const [title, setTitle] = useState(video.title || '')
  const [description, setDescription] = useState(video.description || linked?.description || '')
  const [hide, setHide] = useState(!!video.hide)
  const [status, setStatus] = useState(linked?.sold ? 'sold' : 'available')
  const [price, setPrice] = useState(linked?.price ? linked.price.toString() : '')
  const [faaUrl, setFaaUrl] = useState(linked?.fineArtAmericaUrl || '')
  const [photoUrl, setPhotoUrl] = useState(linked?.originalImage || linked?.customImage || '')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadErr('')
    try {
      const dataBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/__api/upload-original', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataBase64 })
      })
      const data = await res.json()
      if (data.url) setPhotoUrl(data.url)
      else throw new Error(data.error || 'Upload failed')
    } catch (err) { setUploadErr(err.message) }
    setUploading(false)
  }

  const handleSave = () => {
    onSave({
      video: { ...video, title, description, hide },
      painting: linked ? {
        ...linked,
        title,
        description,
        sold: status === 'sold',
        price: price ? Number(price) : null,
        fineArtAmericaUrl: faaUrl,
        originalImage: photoUrl,
        customImage: photoUrl,
        videoId: video.id
      } : null
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13111c] border border-studio-magenta/40 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">Edit Video</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-studio-magenta" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white font-sans focus:outline-none focus:border-studio-magenta" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#1a1828] border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Price (USD)</label>
              <input type="number" placeholder="e.g. 350" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Fine Art America URL (Prints)</label>
            <input value={faaUrl} onChange={e => setFaaUrl(e.target.value)} placeholder="https://fineartamerica.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Original Painting Photo URL</label>
            <div className="flex gap-2">
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="/images/originals/name.webp or URL"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              {photoUrl && <button onClick={() => setPhotoUrl('')} className="px-3 py-2 rounded-xl text-xs bg-rose-900/40 text-rose-300 hover:bg-rose-900/60 transition">Remove</button>}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-studio-magenta text-white transition flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading…' : 'Upload File (resized to WebP)'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
              {photoUrl && <img src={photoUrl} alt="" className="w-16 h-10 object-cover rounded border border-white/10" />}
            </div>
            {uploadErr && <p className="text-xs text-rose-400 mt-1">{uploadErr}</p>}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="hideToggle" checked={hide} onChange={e => setHide(e.target.checked)}
              className="w-4 h-4 rounded" />
            <label htmlFor="hideToggle" className="text-xs text-slate-300">Hide this video from the public page</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/10">
          <button onClick={handleSave}
            className="flex-1 px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition flex items-center justify-center gap-2">
            <Save className="w-3.5 h-3.5" /><span>Save Changes</span>
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
const playlistLoaders = import.meta.glob('../data/playlists/*.json')

export default function PlaylistDetail() {
  const { playlistId } = useParams()

  const [playlist, setPlaylist] = useState(() => initialPlaylists.find(p => p.playlistId === playlistId) || null)
  const [paintings, setPaintings] = useState(initialPaintings)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [missingKey, setMissingKey] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeVideo, setActiveVideo] = useState(null)
  const [isVideoIframeLoaded, setIsVideoIframeLoaded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)

  const PAGE_SIZE = 24
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Lazy-load playlist JSON file and sync dev paintings
  useEffect(() => {
    setLoading(true)
    const loaderKey = `../data/playlists/${playlistId}.json`
    if (playlistLoaders[loaderKey]) {
      playlistLoaders[loaderKey]()
        .then(mod => {
          if (mod?.default) setPlaylist(mod.default)
          else if (mod) setPlaylist(mod)
        })
        .catch(() => {
          fetch(`/__api/playlist/${playlistId}`)
            .then(r => r.ok ? r.json() : null)
            .then(plData => { if (plData) setPlaylist(plData) })
        })
        .finally(() => setLoading(false))
    } else {
      fetch(`/__api/playlist/${playlistId}`)
        .then(r => r.ok ? r.json() : null)
        .then(plData => { if (plData) setPlaylist(plData) })
        .finally(() => setLoading(false))
    }

    fetch('/__api/data')
      .then(r => r.json())
      .then(allData => {
        if (allData?.paintings) setPaintings(allData.paintings)
      })
      .catch(() => {})
  }, [playlistId])

  useEffect(() => {
    setActiveVideo(null); setIsVideoIframeLoaded(false)
    setVisibleCount(PAGE_SIZE)
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [playlistId])

  // Sync this playlist from YouTube
  const handleSync = async () => {
    setSyncing(true); setSyncMsg(''); setMissingKey(false)
    try {
      const res = await fetch('/__api/sync-playlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId })
      })
      const data = await res.json()
      if (data.missingKey) { setMissingKey(true); setSyncMsg(data.error); setSyncing(false); return }
      if (data.error) throw new Error(data.error)
      setSyncMsg(`✓ Synced ${data.count} videos (${data.added} new)`)
      // Reload the playlist
      const fresh = await fetch(`/__api/playlist/${playlistId}`).then(r => r.json()).catch(() => null)
      if (fresh) setPlaylist(fresh)
    } catch (err) { setSyncMsg(`✗ ${err.message}`) }
    setSyncing(false)
  }

  // Save video edits (updates both playlists.json and paintings.json)
  const handleVideoSave = useCallback(async ({ video, painting }) => {
    if (!playlist) return
    const updatedVideos = playlist.videos.map(v => v.id === video.id ? video : v)
    const updatedPlaylist = { ...playlist, videos: updatedVideos }

    let updatedPaintings = paintings
    if (painting) {
      const exists = paintings.find(p => p.videoId === video.id)
      if (exists) {
        updatedPaintings = paintings.map(p => p.videoId === video.id ? { ...p, ...painting } : p)
      } else {
        updatedPaintings = [{ id: `video-${video.id}`, ...painting }, ...paintings]
      }
    }

    await Promise.all([
      fetch('/__api/playlists', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: (await fetch('/__api/data').then(r => r.json())).playlists.map(p => p.playlistId === playlistId ? updatedPlaylist : p) })
      }),
      fetch('/__api/paintings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paintings: updatedPaintings })
      })
    ])
    setPlaylist(updatedPlaylist)
    setPaintings(updatedPaintings)
  }, [playlist, paintings, playlistId])

  // Delete video from playlist
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Remove this video from the playlist?')) return
    const updatedVideos = playlist.videos.filter(v => v.id !== videoId)
    const updatedPlaylist = { ...playlist, videos: updatedVideos, videoCount: updatedVideos.length }
    const allData = await fetch('/__api/data').then(r => r.json())
    await fetch('/__api/playlists', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists: allData.playlists.map(p => p.playlistId === playlistId ? updatedPlaylist : p) })
    })
    setPlaylist(updatedPlaylist)
    if (activeVideo?.id === videoId) setActiveVideo(null)
  }

  if (!playlist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-white">Playlist Not Found</h1>
        <p className="text-slate-400 text-sm">The requested video collection does not exist.</p>
        <Link to="/videos" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta text-white">
          <ArrowLeft className="w-4 h-4" /><span>Return to Playlists</span>
        </Link>
      </div>
    )
  }

  const allVideos = (playlist.videos || []).filter(v => !v.hide)
  const filteredVideos = searchQuery.trim()
    ? allVideos.filter(v => {
        const q = searchQuery.toLowerCase()
        return v.title?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q)
      })
    : allVideos
  const visibleVideos = filteredVideos.slice(0, visibleCount)
  const hasMore = visibleCount < filteredVideos.length

  const matchedPainting = activeVideo
    ? paintings.find(p => p.videoId === activeVideo.id || (p.youtubeUrl && p.youtubeUrl.includes(activeVideo.id)))
    : null

  const originalPhoto = matchedPainting?.originalImage || matchedPainting?.customImage || matchedPainting?.thumbnail || null

  const handleSelectVideo = (video) => {
    setActiveVideo(video); setIsVideoIframeLoaded(false); setLightboxOpen(false)
    const el = document.getElementById('video-player-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const isDev = import.meta.env.DEV

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Lightbox */}
      {lightboxOpen && originalPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightboxOpen(false)}><X className="w-7 h-7" /></button>
          <img src={originalPhoto} alt={matchedPainting?.title || activeVideo?.title} className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Video Editor Modal */}
      {editingVideo && (
        <VideoEditor
          video={editingVideo}
          paintings={paintings}
          onSave={handleVideoSave}
          onClose={() => setEditingVideo(null)}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link to="/videos" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /><span>Back to All Playlists</span>
        </Link>
        <div className="flex items-center gap-3">
          {isDev && (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing…' : 'Sync from YouTube'}</span>
            </button>
          )}
          <span className="text-xs text-studio-gold font-medium">{playlist.videoCount || allVideos.length} Total Videos</span>
        </div>
      </div>

      {/* Sync status */}
      {syncMsg && (
        <div className={`p-3.5 rounded-xl text-xs border flex items-start gap-2 ${
          missingKey ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          : syncMsg.startsWith('✓') ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        }`}>
          {missingKey && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <div>
            {syncMsg}
            {missingKey && <p className="mt-1 text-slate-400">Add <code className="text-amber-300 font-mono">YOUTUBE_API_KEY=your_key</code> to your <code className="text-amber-300">.env</code> file. See HOW-TO.md for instructions.</p>}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-studio-magenta">YouTube Collection</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">{playlist.title}</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Click any thumbnail to load the player. Desktop shows the video and original painting side by side.
        </p>
      </div>

      {/* Active Video Player */}
      {activeVideo && (
        <div id="video-player-section" className="glass-panel rounded-3xl p-6 sm:p-8 border border-studio-magenta/30 shadow-glow-magenta space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Now Playing</span>
            </div>
            <div className="flex items-center gap-3">
              {isDev && (
                <button onClick={() => setEditingVideo(activeVideo)}
                  className="text-xs text-slate-400 hover:text-studio-gold flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /><span>Edit</span>
                </button>
              )}
              <button onClick={() => setActiveVideo(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <X className="w-4 h-4" /><span>Close</span>
              </button>
            </div>
          </div>

          {/* Two-column: video left, painting right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Video embed */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center">
              {isVideoIframeLoaded ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsVideoIframeLoaded(true)}>
                  <img src={`https://i.ytimg.com/vi/${activeVideo.id}/hqdefault.jpg`} alt={activeVideo.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-white translate-x-0.5" />
                    </div>
                    <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10">Click to Play Video</span>
                  </div>
                </div>
              )}
            </div>

            {/* Original painting photo */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-studio-surface border border-white/10 shadow-lg flex items-center justify-center group">
              {originalPhoto ? (
                <div className="relative w-full h-full cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                  <img src={originalPhoto} alt={matchedPainting?.title || activeVideo.title}
                    className="w-full h-full object-contain bg-black/50" />
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 rounded-full text-[10px] bg-black/80 text-white backdrop-blur-md flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" /><span>Click to enlarge</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/80 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-studio-gold" /><span>Original Painting Photo</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-6 bg-gradient-to-br from-studio-card to-black flex flex-col items-center justify-center text-center space-y-3">
                  <ImageIcon className="w-12 h-12 text-white/20" />
                  <div>
                    <h5 className="font-serif text-sm font-bold text-white">Original Painting Photo</h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      {isDev ? 'Click "Edit" above to attach a photo.' : 'Photo can be added via Studio Admin.'}
                    </p>
                  </div>
                  <img src={`https://i.ytimg.com/vi/${activeVideo.id}/hqdefault.jpg`} alt=""
                    className="w-24 h-14 object-cover rounded-lg opacity-40 border border-white/10" />
                </div>
              )}
            </div>
          </div>

          {/* Details & actions */}
          <div className="pt-2 border-t border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">{matchedPainting?.title || activeVideo.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  {matchedPainting?.medium && <span>{matchedPainting.medium}</span>}
                  {matchedPainting?.size && <span>• {matchedPainting.size}</span>}
                  {matchedPainting?.year && <span>• {matchedPainting.year}</span>}
                  {matchedPainting && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      matchedPainting.sold ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    }`}>{matchedPainting.sold ? 'Sold' : 'Available'}</span>
                  )}
                  {matchedPainting?.price && !matchedPainting.sold && (
                    <span className="font-bold text-studio-gold text-sm">${matchedPainting.price}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/contact?inquiry=${encodeURIComponent(matchedPainting?.title || activeVideo.title)}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition flex items-center gap-1.5 shadow-glow-magenta">
                  <MessageSquare className="w-3.5 h-3.5" /><span>Buy / Inquire</span>
                </Link>
                {matchedPainting?.fineArtAmericaUrl && (
                  <a href={matchedPainting.fineArtAmericaUrl} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-studio-gold/15 border border-studio-gold/30 text-studio-gold hover:bg-studio-gold hover:text-black transition flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /><span>Prints on FAA</span>
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {(activeVideo.description || matchedPainting?.description) && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-gold">Artwork Story & Details</span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  <DescriptionText text={activeVideo.description || matchedPainting.description} />
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl font-bold text-white">
              Playlist Videos ({filteredVideos.length})
            </h3>
            {filteredVideos.length > 0 && (
              <span className="text-xs text-slate-400">
                Showing {Math.min(visibleCount, filteredVideos.length)} of {filteredVideos.length}
              </span>
            )}
          </div>

          {allVideos.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search videos in playlist..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
                className="w-full pl-9 pr-8 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-studio-magenta transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-10 text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /><span>Loading…</span>
          </div>
        )}

        {!loading && allVideos.length === 0 && (
          <div className="glass-panel p-10 rounded-2xl border border-studio-gold/30 text-center max-w-2xl mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-studio-gold mx-auto" />
            <h4 className="font-serif text-xl font-bold text-white">Sync Needed from YouTube</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This playlist has <span className="font-bold text-studio-gold">{playlist.videoCount}</span> public videos.
              {isDev
                ? ' Click "Sync from YouTube" above to fetch all titles and descriptions.'
                : ' Run npm run sync-playlists to populate this list.'}
            </p>
            {isDev && (
              <button onClick={handleSync} disabled={syncing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing…' : 'Sync from YouTube'}</span>
              </button>
            )}
          </div>
        )}

        {!loading && allVideos.length > 0 && filteredVideos.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/10 space-y-3">
            <p className="text-sm text-slate-400">No videos match &quot;{searchQuery}&quot; in this playlist.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
            >
              Clear Search
            </button>
          </div>
        )}

        {!loading && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleVideos.map((video) => {
                const isActive = activeVideo?.id === video.id
                const paintingMatch = paintings.find(p => p.videoId === video.id || (p.youtubeUrl && p.youtubeUrl.includes(video.id)))
                return (
                  <div key={video.id} className="relative group/card">
                    <VideoCard video={video} isActive={isActive} paintingMatch={paintingMatch} onClick={() => handleSelectVideo(video)} />
                    {isDev && (
                      <div className="absolute top-2 left-2 z-20 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setEditingVideo(video) }}
                          className="p-1.5 rounded-lg bg-black/80 text-white hover:bg-studio-magenta transition" title="Edit">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteVideo(video.id) }}
                          className="p-1.5 rounded-lg bg-black/80 text-rose-400 hover:bg-rose-900 transition" title="Delete">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <div className="text-center pt-6">
                <button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="px-8 py-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-studio-magenta text-white transition flex items-center gap-2 mx-auto shadow-md">
                  <ChevronDown className="w-4 h-4" />
                  <span>Load More Videos ({filteredVideos.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
