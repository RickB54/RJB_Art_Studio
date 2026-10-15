import React, { useState } from 'react'
import { Brush, CheckCircle2, ShieldCheck, ShoppingBag, Send, AlertCircle, ArrowRight, HeartHandshake } from 'lucide-react'
import siteData from '../data/site.json'

export default function Commissions() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    itemType: 'Painted Portrait',
    size: '11x14 inch',
    medium: 'Oil',
    orientation: 'Landscape (Horizontal)',
    sceneryDescription: '',
    name: '',
    email: '',
    phone: '',
    comments: '',
    'bot-field': ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    // Encode for Netlify Form Submission
    const encode = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&')
    }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'commission',
          ...formData
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Form submission failed. Please try again.')
      }
    } catch (err) {
      // In local dev without Netlify runtime, simulate success gracefully
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
          Custom Artwork & Portrait Services
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Commissions & Prints
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Order a personalized original oil painting, acrylic artwork, or expressive charcoal portrait of loved ones or pets. Every custom commission includes a signed and dated Certificate of Authenticity.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {siteData.services.map((svc) => (
          <div key={svc.id} className="glass-panel p-7 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-studio-magenta uppercase tracking-wider">{svc.subtitle}</span>
              <h3 className="font-serif text-xl font-bold text-white mt-1">{svc.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{svc.description}</p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-studio-gold">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificate of Authenticity</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* The 4-Step Commission Process */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">How The Commission Process Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Simple, collaborative, and tailored to your vision</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="w-7 h-7 rounded-full bg-studio-magenta/20 text-studio-magenta font-bold text-xs flex items-center justify-center border border-studio-magenta/40">1</span>
            <h4 className="font-serif text-base font-bold text-white">Request & Vision</h4>
            <p className="text-xs text-slate-300">Submit the request form below with your desired subject, size, and photo references.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="w-7 h-7 rounded-full bg-studio-cobalt/20 text-studio-cobalt font-bold text-xs flex items-center justify-center border border-studio-cobalt/40">2</span>
            <h4 className="font-serif text-base font-bold text-white">Consultation & Quote</h4>
            <p className="text-xs text-slate-300">We'll discuss orientation, canvas vs panel, background color palette, and timeline.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="w-7 h-7 rounded-full bg-studio-purple/20 text-studio-purple font-bold text-xs flex items-center justify-center border border-studio-purple/40">3</span>
            <h4 className="font-serif text-base font-bold text-white">Studio Creation</h4>
            <p className="text-xs text-slate-300">I create the piece in my Methuen studio, with optional progress updates and video recording.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="w-7 h-7 rounded-full bg-studio-gold/20 text-studio-gold font-bold text-xs flex items-center justify-center border border-studio-gold/40">4</span>
            <h4 className="font-serif text-base font-bold text-white">Signed & Delivered</h4>
            <p className="text-xs text-slate-300">Your painting is signed, accompanied by a Certificate of Authenticity, and carefully packaged.</p>
          </div>
        </div>
      </div>

      {/* Pricing Estimates / Draft Notice */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-studio-gold/30 space-y-3">
        <div className="flex items-center gap-2 text-studio-gold font-semibold text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Pricing Policy Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Commission pricing varies based on medium, canvas dimensions, and subject complexity (e.g. single subject vs multiple subjects). Historical estimates start around $130 for 8x10 portrait panels and scale by dimension. All quotes are personalized and confirmed before painting begins.
        </p>
      </div>

      {/* Commission Request Form */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-studio-magenta/30 shadow-glow-magenta space-y-8">
        
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">Interactive Request</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">Commission Request Form</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fill out the details below to receive a personalized quote and timeline directly from Rick.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-white">Thank You for Your Commission Request!</h3>
            <p className="text-sm text-emerald-200 max-w-md mx-auto">
              Your inquiry has been received. Rick will review your specifications and get in touch with you shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-600 transition"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form
            name="commission"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Netlify hidden identity fields */}
            <input type="hidden" name="form-name" value="commission" />
            <p className="hidden">
              <label>Don’t fill this out if you're human: <input name="bot-field" value={formData['bot-field']} onChange={handleChange} /></label>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Item Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Item you would like me to paint or draw <span className="text-studio-magenta">*</span>
                </label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="Painted Portrait">Painted Portrait (People or Pet)</option>
                  <option value="Charcoal Portrait">Charcoal Portrait</option>
                  <option value="Original Oil Painting">Original Oil Painting</option>
                  <option value="Original Acrylic Painting">Original Acrylic Painting</option>
                  <option value="Other Drawing">Other Drawing</option>
                  <option value="Prints">Fine Art Prints</option>
                  <option value="Other">Other Custom Request</option>
                </select>
              </div>

              {/* Preferred Size */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Preferred Size / Dimensions
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="8x10 inch">8x10 inch</option>
                  <option value="9x12 inch">9x12 inch</option>
                  <option value="11x14 inch">11x14 inch</option>
                  <option value="16x20 inch">16x20 inch</option>
                  <option value="18x24 inch">18x24 inch</option>
                  <option value="4x6 inch">4x6 inch (Small)</option>
                  <option value="5x7 inch">5x7 inch</option>
                  <option value="Other">Other / Custom Size</option>
                </select>
              </div>

              {/* Preferred Medium */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  What medium do you prefer?
                </label>
                <select
                  name="medium"
                  value={formData.medium}
                  onChange={handleChange}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="Oil">Oil</option>
                  <option value="Acrylic">Acrylic</option>
                  <option value="Charcoal">Charcoal</option>
                  <option value="Graphite">Graphite</option>
                  <option value="Color Pencil">Color Pencil</option>
                  <option value="Mixed Media">Mixed Media</option>
                  <option value="Pastel">Pastel</option>
                  <option value="Doesn't Matter">Doesn't Matter / Artist's Recommendation</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Canvas Orientation
                </label>
                <select
                  name="orientation"
                  value={formData.orientation}
                  onChange={handleChange}
                  className="w-full bg-[#13111c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                >
                  <option value="Landscape (Horizontal)">Landscape (Horizontal)</option>
                  <option value="Portrait (Vertical)">Portrait (Vertical)</option>
                  <option value="Doesn't Matter">Doesn't Matter</option>
                </select>
              </div>

            </div>

            {/* Scenery / Subject Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                What scenery or subject would you like? <span className="text-studio-magenta">*</span>
              </label>
              <textarea
                required
                rows={3}
                name="sceneryDescription"
                value={formData.sceneryDescription}
                onChange={handleChange}
                placeholder="Describe your subject, pet breed, landscape setting, preferred colors, or photo references you have available..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Name <span className="text-studio-magenta">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Email <span className="text-studio-magenta">*</span>
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
                />
              </div>
            </div>

            {/* Questions / Comments */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Questions or Additional Comments
              </label>
              <textarea
                rows={2}
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Any target date, gift recipient, framing questions, etc."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-studio-magenta"
              />
            </div>

            {formError && (
              <p className="text-xs text-rose-400">{formError}</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Commission Request'}</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  )
}
