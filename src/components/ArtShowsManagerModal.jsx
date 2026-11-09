import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Snowflake,
  Info,
  Plus,
  Trash2,
  Edit3,
  Check,
  Search,
  ExternalLink,
  Save,
  Compass,
  AlertCircle,
  Eye,
  CheckCircle2,
  RotateCcw
} from 'lucide-react'

// Default curated database of real annual and upcoming shows within ~30 miles of 54 Boston St, Methuen, MA 01844
export const DEFAULT_LOCAL_SHOWS = [
  {
    id: 'show-nevins-methuen',
    title: 'Nevins Memorial Library Art Exhibit & Sale',
    date: 'Annual Featured Spring & Autumn Series',
    location: 'Methuen, MA',
    address: '305 Broadway, Methuen, MA 01844',
    distanceMiles: 1.2,
    cost: 'Free Admission (Open to the public)',
    snowPolicy: 'Indoor library gallery; follows Methuen municipal weather delays.',
    notes: 'Annual local showcase featuring Merrimack Valley fine artists. Free library parking lot in rear.',
    active: true
  },
  {
    id: 'show-tuscan-village-salem',
    title: 'Tuscan Village Artisan Market & Showcase',
    date: 'Spring & Fall Weekend Pop-Ups • 11:00 AM – 4:00 PM',
    location: 'Salem, NH',
    address: '9 Via Toscana, Salem, NH 03079',
    distanceMiles: 4.5,
    cost: 'Free Admission',
    snowPolicy: 'Heated tent pavilion & outdoor plaza; operates rain, snow, or shine.',
    notes: 'Premier outdoor open-air artisan plaza featuring regional makers, live demos, and food artisans. Direct highway access off I-93 Exit 1.',
    active: false
  },
  {
    id: 'show-salem-hs-craft-fair',
    title: 'Salem High School / Seifert Center Holiday Craft Fair',
    date: 'November Annual Fair • 9:00 AM – 3:00 PM',
    location: 'Salem, NH',
    address: '44 Geremonty Dr, Salem, NH 03079',
    distanceMiles: 5.2,
    cost: '$3 Suggested Donation at door (benefits music & arts booster)',
    snowPolicy: 'Snow date: Following Sunday at 10:00 AM.',
    notes: 'Over 100 indoor artisan tables throughout high school concourse and cafeteria. Ample free parking on campus.',
    active: false
  },
  {
    id: 'show-andover-crafts-park',
    title: 'Andover Crafts in the Park',
    date: 'Saturday, May 8, 2027 • 10:00 AM – 4:00 PM',
    location: 'Andover, MA',
    address: 'Chestnut St & Bartlet St (The Park), Andover, MA 01810',
    distanceMiles: 6.4,
    cost: 'Free Admission to the Park',
    snowPolicy: 'Held Rain or Shine (Spring outdoor festival; canopy booth).',
    notes: 'Historic 50+ year Mother’s Day weekend tradition with nearly 200 juried fine artists and crafters surrounding the park gazebo.',
    active: false
  },
  {
    id: 'show-ghaa-haverhill',
    title: 'Greater Haverhill Arts Association (GHAA) Annual Exhibition',
    date: 'Annual Featured Gallery Showcase • Weekend Receptions',
    location: 'Haverhill, MA',
    address: 'Buttonwoods Museum, 270 Water St, Haverhill, MA 01830',
    distanceMiles: 7.3,
    cost: 'Free Admission',
    snowPolicy: 'Indoor museum galleries; weather delays announced on GHAA website.',
    notes: 'Prestigious regional juried exhibition of oil, acrylic, and watercolor originals. Free parking on-site.',
    active: false
  },
  {
    id: 'show-whistler-house-lowell',
    title: 'Whistler House Museum of Art Members & Holiday Exhibition',
    date: 'Seasonal & Holiday Exhibitions • Wed–Sun 11:00 AM – 4:00 PM',
    location: 'Lowell, MA',
    address: '243 Worthen St, Lowell, MA 01852',
    distanceMiles: 11.8,
    cost: 'Free for members / $10 museum admission for general public',
    snowPolicy: 'Indoor museum galleries; follows City of Lowell weather advisories.',
    notes: 'Historic birthplace of James McNeill Whistler. Features juried works by Lowell Art Association members and North Shore artists.',
    active: false
  },
  {
    id: 'show-wilmington-spring-fling',
    title: 'Wilmington Annual Spring Fling & Artisan Fair',
    date: 'March / April Weekend Fair • 10:00 AM – 3:00 PM',
    location: 'Wilmington, MA',
    address: '141 Middlesex Ave (Town Common), Wilmington, MA 01887',
    distanceMiles: 15.9,
    cost: 'Free Admission',
    snowPolicy: 'Rain/Snow Date: Following weekend.',
    notes: 'Community celebration of Spring with artisan tents, crafts, and live demonstrations. Free street and municipal parking.',
    active: false
  },
  {
    id: 'show-topsfield-fair-coolidge',
    title: 'Topsfield Fair Fine Arts Exhibition & Sales Gallery',
    date: 'October Annual 10-Day Fair • 10:00 AM – 10:00 PM',
    location: 'Topsfield, MA',
    address: 'Coolidge Hall, 207 Boston St (Route 1), Topsfield, MA 01983',
    distanceMiles: 18.2,
    cost: 'Fair general admission ($15–$20) / Free entry to Coolidge Hall gallery',
    snowPolicy: 'Operates rain or shine during fair week in October.',
    notes: 'America’s oldest agricultural fair. Coolidge Hall features over 1,000 professional and amateur paintings and an on-site Art Sales Room.',
    active: false
  },
  {
    id: 'show-newburyport-bartlet-mall',
    title: 'Newburyport Art on Bartlet Mall & Yankee Homecoming',
    date: 'Late July Weekend • 10:00 AM – 4:00 PM',
    location: 'Newburyport, MA',
    address: 'High St & Pond St (Bartlet Mall), Newburyport, MA 01950',
    distanceMiles: 21.4,
    cost: 'Free Admission',
    snowPolicy: 'Rain or Shine event (Summer festival).',
    notes: 'Historic outdoor fine art festival surrounding the picturesque Frog Pond. Original landscape paintings and maritime fine art prints.',
    active: false
  },
  {
    id: 'show-rockport-art-association',
    title: 'Rockport Art Association & Museum (RAA&M) National Shows',
    date: 'Seasonal Juried Exhibitions • Tue–Sun 10:00 AM – 5:00 PM',
    location: 'Rockport, MA',
    address: '12 Main St, Rockport, MA 01966',
    distanceMiles: 29.8,
    cost: 'Free Admission (Donations welcome)',
    snowPolicy: 'Indoor galleries open year-round; winter weather closures posted on website.',
    notes: 'Legendary Cape Ann art colony showcasing historic and contemporary coastal and landscape masterworks.',
    active: false
  }
]

export default function ArtShowsManagerModal({
  currentShows = [],
  savedCatalog = [],
  onSave,
  onClose
}) {
  // Merge current active shows with full catalog
  const [showsList, setShowsList] = useState(() => {
    const base = savedCatalog && savedCatalog.length > 0 ? savedCatalog : DEFAULT_LOCAL_SHOWS
    const activeTitles = new Set((currentShows || []).map(s => s.title?.toLowerCase().trim()))
    return base.map(s => ({
      ...s,
      active: activeTitles.has(s.title?.toLowerCase().trim()) || Boolean(s.active)
    }))
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState('30') // 'all' | '10' | '20' | '30'
  const [saving, setSaving] = useState(false)
  const [saveNotice, setSaveNotice] = useState('')
  const [editingShow, setEditingShow] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // New Show Form State
  const [newShow, setNewShow] = useState({
    title: '',
    date: '',
    location: '',
    address: '',
    distanceMiles: '',
    cost: 'Free Admission',
    snowPolicy: 'Rain or Shine',
    notes: '',
    active: true
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !editingShow && !showAddForm) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, editingShow, showAddForm])

  // Toggle active state for a show
  const handleToggleActive = (id) => {
    setShowsList(prev =>
      prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
    )
  }

  // Delete a show from the catalog
  const handleDeleteShow = (id, title) => {
    if (window.confirm(`Remove "${title}" from your shows list?`)) {
      setShowsList(prev => prev.filter(s => s.id !== id))
    }
  }

  // Save changes to pages.json
  const handleSaveAll = async () => {
    setSaving(true)
    setSaveNotice('')
    try {
      const activeShowsToPublish = showsList
        .filter(s => s.active)
        .map(s => ({
          id: s.id,
          title: s.title,
          date: s.date,
          location: s.location,
          address: s.address,
          distanceMiles: s.distanceMiles,
          cost: s.cost,
          snowPolicy: s.snowPolicy,
          notes: s.notes,
          image: s.image || '',
          image2: s.image2 || '',
          videoUrl: s.videoUrl || '',
          active: true
        }))

      await onSave({
        activeShows: activeShowsToPublish,
        allDiscoveredShows: showsList
      })

      setSaveNotice(`✓ Updated! ${activeShowsToPublish.length} show(s) now visible on your Home Page.`)
      setTimeout(() => setSaveNotice(''), 4000)
    } catch (err) {
      alert('Failed to save shows: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Add a new custom show
  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newShow.title.trim()) {
      alert('Please provide a show title.')
      return
    }
    const created = {
      ...newShow,
      id: `show-${Date.now()}`,
      distanceMiles: parseFloat(newShow.distanceMiles) || 0,
      active: true
    }
    setShowsList(prev => [created, ...prev])
    setShowAddForm(false)
    setNewShow({
      title: '',
      date: '',
      location: '',
      address: '',
      distanceMiles: '',
      cost: 'Free Admission',
      snowPolicy: 'Rain or Shine',
      notes: '',
      active: true
    })
  }

  // Save edit
  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!editingShow.title.trim()) return
    setShowsList(prev =>
      prev.map(s => (s.id === editingShow.id ? { ...editingShow, distanceMiles: parseFloat(editingShow.distanceMiles) || 0 } : s))
    )
    setEditingShow(null)
  }

  // Reset to default shows
  const handleResetDefaults = () => {
    if (window.confirm('Reset the shows database to the curated default 30-mile Merrimack Valley list?')) {
      setShowsList(DEFAULT_LOCAL_SHOWS)
    }
  }

  // Filter shows
  const filteredShows = showsList.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matches =
        s.title?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (maxDistance !== 'all') {
      const limit = parseFloat(maxDistance)
      if (s.distanceMiles !== undefined && s.distanceMiles !== null && s.distanceMiles > limit) {
        return false
      }
    }
    return true
  })

  const activeCount = showsList.filter(s => s.active).length

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl text-left space-y-6 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-studio-gold via-studio-magenta to-studio-purple" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-studio-gold/20 text-studio-gold border border-studio-gold/30">
                ADMIN USE ONLY
              </span>
              <span className="text-xs text-slate-400">
                Radius: 30 miles from <strong>54 Boston St, Methuen MA 01844</strong>
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Local Art Shows & Exhibitions Finder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off any show to publish it to your public website's <strong>"Art Shows & In-Person Appearances"</strong> section.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple hover:opacity-95 text-white transition flex items-center gap-1.5 shadow-glow-magenta disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Publish to Website'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {saveNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Quick Stats & Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Stats Bar */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              Total Discovered: <strong className="text-white">{showsList.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              Active on Website: <strong className="text-emerald-400">{activeCount}</strong>
            </span>
          </div>

          {/* Search, Filter & Add Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter shows by name or town..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-studio-gold"
              />
            </div>

            <select
              value={maxDistance}
              onChange={e => setMaxDistance(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-studio-gold"
            >
              <option value="all" className="bg-slate-900">All Distances</option>
              <option value="10" className="bg-slate-900">&lt; 10 miles</option>
              <option value="20" className="bg-slate-900">&lt; 20 miles</option>
              <option value="30" className="bg-slate-900">&lt; 30 miles</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 border border-white/10"
            >
              <Plus className="w-3.5 h-3.5 text-studio-gold" />
              <span>Add Custom Show</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/5"
              title="Reset default 30-mile list"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Spreadsheet Table Container */}
        <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-black/40">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10 z-10">
              <tr>
                <th className="p-3 w-14 text-center">Show?</th>
                <th className="p-3 min-w-[180px]">Art Show Name</th>
                <th className="p-3 min-w-[130px]">Dates & Timing</th>
                <th className="p-3 min-w-[160px]">Location & Address</th>
                <th className="p-3 w-28">Miles from 54 Boston St</th>
                <th className="p-3 min-w-[130px]">Admission / Cost</th>
                <th className="p-3 min-w-[140px]">Snow / Weather</th>
                <th className="p-3 min-w-[180px]">Important Notes</th>
                <th className="p-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                    No art shows match your search criteria or distance filter.
                  </td>
                </tr>
              ) : (
                filteredShows.map(show => (
                  <tr
                    key={show.id}
                    className={`hover:bg-white/[0.04] transition group ${
                      show.active ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Checkbox: Show on Website */}
                    <td className="p-3 text-center">
                      <label className="cursor-pointer inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={Boolean(show.active)}
                          onChange={() => handleToggleActive(show.id)}
                          className="w-4 h-4 rounded text-studio-magenta bg-white/10 border-white/20 focus:ring-studio-magenta cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Name */}
                    <td className="p-3 font-semibold text-white">
                      <div className="space-y-0.5">
                        <p className="line-clamp-2">{show.title}</p>
                        {show.active && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                            Active on Site
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-3 text-slate-300">
                      <p className="line-clamp-2">{show.date || '—'}</p>
                    </td>

                    {/* Location */}
                    <td className="p-3">
                      <p className="text-white font-medium">{show.location}</p>
                      <p className="text-[11px] text-slate-400 truncate">{show.address || ''}</p>
                    </td>

                    {/* Miles from 54 Boston St */}
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-white/10 text-studio-gold">
                        {show.distanceMiles !== undefined && show.distanceMiles !== null
                          ? `${show.distanceMiles} mi`
                          : '—'}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="p-3 text-emerald-300 font-medium">
                      <p className="line-clamp-2">{show.cost || 'Free Admission'}</p>
                    </td>

                    {/* Snow / Weather */}
                    <td className="p-3 text-slate-300">
                      <p className="line-clamp-2 text-[11px]">{show.snowPolicy || 'Rain or Shine'}</p>
                    </td>

                    {/* Notes */}
                    <td className="p-3 text-slate-400">
                      <p className="line-clamp-2 text-[11px]">{show.notes || '—'}</p>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingShow(show)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                          title="Edit this show"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShow(show.id, show.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete from list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-slate-400 shrink-0">
          <div>
            <span>
              Checked shows appear with an <strong>"Attend Show / Info"</strong> button on your live site so visitors can see admission cost, snow dates, venue directions, and notes.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
            >
              Done / Close
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-studio-gold text-slate-950 hover:bg-studio-gold-light transition flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>

        {/* Sub-Modal: Add Custom Show */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-studio-gold" />
                  <span>Add New Art Show</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Show Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Merrimack Valley Autumn Artisan Fair"
                    value={newShow.title}
                    onChange={e => setNewShow({ ...newShow, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Dates & Times</label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 14–15 • 10am–4pm"
                      value={newShow.date}
                      onChange={e => setNewShow({ ...newShow, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Miles from 54 Boston St</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.5"
                      value={newShow.distanceMiles}
                      onChange={e => setNewShow({ ...newShow, distanceMiles: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City / Town, State</label>
                    <input
                      type="text"
                      placeholder="e.g. Andover, MA"
                      value={newShow.location}
                      onChange={e => setNewShow({ ...newShow, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cost to Attend</label>
                    <input
                      type="text"
                      placeholder="e.g. Free Admission / $5 Entry"
                      value={newShow.cost}
                      onChange={e => setNewShow({ ...newShow, cost: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Venue Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St, Andover, MA 01810"
                    value={newShow.address}
                    onChange={e => setNewShow({ ...newShow, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Snow Dates / Weather Policy</label>
                  <input
                    type="text"
                    placeholder="e.g. Snow Date: Following Sunday / Rain or Shine"
                    value={newShow.snowPolicy}
                    onChange={e => setNewShow({ ...newShow, snowPolicy: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Important Notes / Visitor Info</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Parking instructions, booth location, paintings on display..."
                    value={newShow.notes}
                    onChange={e => setNewShow({ ...newShow, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-studio-gold text-slate-950 font-semibold hover:bg-studio-gold-light"
                  >
                    Add Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Edit Show */}
        {editingShow && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-studio-gold" />
                  <span>Edit Art Show Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingShow(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Show Name / Title</label>
                  <input
                    type="text"
                    required
                    value={editingShow.title || ''}
                    onChange={e => setEditingShow({ ...editingShow, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Dates & Times</label>
                    <input
                      type="text"
                      value={editingShow.date || ''}
                      onChange={e => setEditingShow({ ...editingShow, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Miles from 54 Boston St</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingShow.distanceMiles ?? ''}
                      onChange={e => setEditingShow({ ...editingShow, distanceMiles: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City / Town, State</label>
                    <input
                      type="text"
                      value={editingShow.location || ''}
                      onChange={e => setEditingShow({ ...editingShow, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cost to Attend</label>
                    <input
                      type="text"
                      value={editingShow.cost || ''}
                      onChange={e => setEditingShow({ ...editingShow, cost: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Venue Address</label>
                  <input
                    type="text"
                    value={editingShow.address || ''}
                    onChange={e => setEditingShow({ ...editingShow, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Snow Dates / Weather Policy</label>
                  <input
                    type="text"
                    value={editingShow.snowPolicy || ''}
                    onChange={e => setEditingShow({ ...editingShow, snowPolicy: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Important Notes / Visitor Info</label>
                  <textarea
                    rows={3}
                    value={editingShow.notes || ''}
                    onChange={e => setEditingShow({ ...editingShow, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-studio-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingShow(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-studio-gold text-slate-950 font-semibold hover:bg-studio-gold-light"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
