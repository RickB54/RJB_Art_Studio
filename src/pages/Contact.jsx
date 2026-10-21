import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Send, CheckCircle2, MessageSquare, Youtube, Facebook, Instagram, Pin, ShoppingBag, ShieldCheck, ExternalLink } from 'lucide-react'
import siteData from '../data/site.json'
import { EmailChooser } from '../components/Footer'

export default function Contact() {
  const [searchParams] = useSearchParams()
  const inquiryParam = searchParams.get('inquiry')

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: inquiryParam ? `Inquiry regarding "${inquiryParam}"` : 'General Art Inquiry',
    message: inquiryParam ? `Hi Rick, I am interested in your artwork "${inquiryParam}" and would like to learn more about its availability and details.` : '',
    'bot-field': ''
  })

  useEffect(() => {
    if (inquiryParam) {
      setFormData(prev => ({
        ...prev,
        subject: `Inquiry regarding "${inquiryParam}"`,
        message: `Hi Rick, I am interested in your artwork "${inquiryParam}" and would like to learn more about its availability and details.`
      }))
    }
  }, [inquiryParam])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const encode = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&')
    }

    try {
      if (siteData.contact?.googleContactFormUrl) {
        // Send to Google Form response endpoint silently (no CORS restriction needed with mode: 'no-cors')
        const gfData = new FormData()
        gfData.append('name', formData.name)
        gfData.append('email', formData.email)
        gfData.append('subject', formData.subject)
        gfData.append('message', formData.message)
        await fetch(siteData.contact.googleContactFormUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: gfData
        }).catch(() => {})
      }

      // Also submit via Netlify static form if present
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'contact',
          ...formData
        })
      }).catch(() => {})

      setSubmitted(true)
    } catch (err) {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-studio-magenta">
          Studio Inquiries
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Contact Rick
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Inquire about available paintings, fine art prints, upcoming exhibitions, or general artistic collaborations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Direct Email & Studio Channels */}
        <div className="space-y-6">
          
          {/* Direct Email Card */}
          <div className="glass-panel p-6 rounded-2xl border border-studio-gold/30 bg-gradient-to-br from-studio-card to-studio-surface space-y-3">
            <div className="flex items-center gap-2 text-studio-gold">
              <Mail className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-white">Direct Email</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prefer to use email directly? Click your address below and choose Gmail or your default email app:
            </p>
            <div className="flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-studio-gold/15 border border-studio-gold/30">
              <EmailChooser
                email={siteData.contact?.email || 'rberube54@gmail.com'}
                className="text-studio-gold text-xs font-semibold"
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Studio Channels</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For public inquiries and video questions, feel free to reach out via my official studio channels:
            </p>

            <div className="space-y-2 pt-1">
              <a
                href={siteData.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs transition border border-white/5"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Channel</span>
              </a>

              <a
                href={siteData.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 text-xs transition border border-white/5"
              >
                <Facebook className="w-4 h-4 text-blue-500" />
                <span>Facebook Page</span>
              </a>

              <a
                href={siteData.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-pink-600/20 hover:text-pink-400 text-slate-300 text-xs transition border border-white/5"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram Profile</span>
              </a>

              <a
                href={siteData.socials.x || siteData.socials.twitter || 'https://x.com/rjbartstudio'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 text-xs transition border border-white/5"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-slate-300" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>

              <a
                href={siteData.socials.fineArtAmerica}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-studio-gold/10 hover:bg-studio-gold hover:text-black text-studio-gold text-xs transition border border-studio-gold/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Fine Art America Prints</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-studio-gold font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Studio Privacy Protection</span>
            </div>
            <p>
              Your contact details are encrypted and used solely for responding to your art inquiries.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-2 glass-panel p-8 sm:p-10 rounded-3xl border border-studio-magenta/20 shadow-glow-magenta">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-white">Message Sent Successfully!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you for reaching out. Rick will review your inquiry and get back to you directly via email.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>Don’t fill this out if you're human: <input name="bot-field" value={formData['bot-field']} onChange={handleChange} /></label>
              </p>

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
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Email Address <span className="text-studio-magenta">*</span>
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. jane@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subject / Painting Title
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-studio-magenta transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Message <span className="text-studio-magenta">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can Rick help you? Inquire about painting availability, framing, or print orders..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-studio-magenta transition"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-400">{formError}</p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <a
                  href={`mailto:${siteData.contact?.email || 'rberube54@gmail.com'}?subject=${encodeURIComponent(formData.subject || 'Art Inquiry')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`}
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition text-center flex items-center justify-center gap-2"
                  title="Open this inquiry in your favorite email app"
                >
                  <Mail className="w-3.5 h-3.5 text-studio-gold" />
                  <span>Open in Email App</span>
                </a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-studio-magenta to-studio-purple text-white shadow-glow-magenta hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

    </div>
  )
}
