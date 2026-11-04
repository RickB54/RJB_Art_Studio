import React, { useState, useEffect, useRef } from 'react'
import { Lock, Heart, ChevronRight, Eye, EyeOff, Flame } from 'lucide-react'
import pagesData from '../data/pages.json'
import siteData from '../data/site.json'
import PageBlocks from '../components/PageBlocks'
import MediaEmbed from '../components/MediaEmbed'

const SESSION_KEY = 'rjb_memorial_unlocked'

export default function Memorial() {
  const [memData, setMemData] = useState(pagesData.memorial || {})
  const [memConfig, setMemConfig] = useState(siteData.memorial || {})
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch('/__api/data')
      .then(r => r.json())
      .then(data => {
        if (data.pages?.memorial) setMemData(data.pages.memorial)
        if (data.site?.memorial) setMemConfig(data.site.memorial)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!unlocked && inputRef.current) inputRef.current.focus()
  }, [unlocked])

  function handleSubmit(e) {
    e.preventDefault()
    const correct = String(memConfig.password || siteData.memorial?.password || '8888').trim()
    if (input.trim() === correct) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setInput('')
    }
  }

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          {/* Candle icon + heading */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.25)]">
                <Flame className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {memData.title || 'In Loving Memory'}
              </h1>
              {memData.subtitle && (
                <p className="mt-2 text-studio-gold font-serif italic text-lg">
                  {memData.subtitle}
                </p>
              )}
            </div>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              This page is private and shared only with family and loved ones.
              Please enter the password to continue.
            </p>
          </div>

          {/* Password form */}
          <form
            onSubmit={handleSubmit}
            className={`glass-panel p-8 rounded-3xl border border-white/10 space-y-5 transition-transform ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
            style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
          >
            <style>{`
              @keyframes shake {
                0%,100% { transform: translateX(0); }
                20%      { transform: translateX(-8px); }
                40%      { transform: translateX(8px); }
                60%      { transform: translateX(-6px); }
                80%      { transform: translateX(6px); }
              }
            `}</style>

            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Lock className="w-4 h-4 text-studio-gold" />
              <span className="text-sm font-semibold text-slate-300">Family Access Password</span>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                placeholder="Enter password…"
                autoComplete="off"
                className="w-full bg-[#13111c] border border-white/15 focus:border-studio-gold/60 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-rose-400 text-sm flex items-center gap-1.5">
                <span>✗</span> {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-900/30"
            >
              <Heart className="w-4 h-4 fill-white" />
              Enter Memorial
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Memorial page content ─────────────────────────────────────────────────
  const heroUrl   = memData.heroVideoUrl   || ''
  const heroPoster = memData.heroVideoPoster || ''
  const heroAR    = memData.heroVideoAspectRatio || '16:9'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

      {/* Slot: Top */}
      <PageBlocks blocks={memData.blockSlots?.top} />

      {/* ── Header ── */}
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <Flame className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            {memData.title || 'In Loving Memory'}
          </h1>
          {memData.subtitle && (
            <p className="mt-3 font-serif italic text-xl text-studio-gold">
              {memData.subtitle}
            </p>
          )}
        </div>
        {memData.dedication && (
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-serif italic border-l-4 border-amber-400/50 pl-5 text-left">
            "{memData.dedication}"
          </p>
        )}
      </div>

      {/* ── Hero Video ── */}
      {heroUrl ? (
        <section className="space-y-4">
          <MediaEmbed
            url={heroUrl}
            poster={heroPoster}
            aspectRatio={heroAR}
            title={memData.title || 'Memorial Video'}
            className="rounded-3xl overflow-hidden shadow-2xl"
          />
          <PageBlocks blocks={memData.blockSlots?.after_video} />
        </section>
      ) : (
        <PageBlocks blocks={memData.blockSlots?.after_video} />
      )}

      {/* ── Dedication slot ── */}
      <PageBlocks blocks={memData.blockSlots?.after_dedication} />

      {/* ── Bottom slot ── */}
      <PageBlocks blocks={memData.blockSlots?.bottom || memData.blocks || memData.extraBlocks} />

      {/* Lock again button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => { sessionStorage.removeItem(SESSION_KEY); setUnlocked(false); setInput('') }}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition px-4 py-2 rounded-lg hover:bg-white/5 border border-white/5"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock page
        </button>
      </div>

    </div>
  )
}
