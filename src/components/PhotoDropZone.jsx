import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Link as LinkIcon, AlertCircle, RefreshCw } from 'lucide-react'

export async function uploadImageFile(file) {
  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const res = await fetch('/__api/upload-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, dataBase64 })
  })

  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Upload failed')
  }
  return data // { url, thumbnailUrl, size, warning }
}

export default function PhotoDropZone({
  value = '',
  onChange,
  onMultipleUpload,
  allowMultiple = false,
  label = 'Painting Photo / Image'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [warningMsg, setWarningMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [pastedUrl, setPastedUrl] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setErrorMsg('')
    setWarningMsg('')
    setUploading(true)

    try {
      if (files.length > 1 && onMultipleUpload) {
        const results = []
        for (const file of files) {
          const res = await uploadImageFile(file)
          results.push({ file, ...res })
        }
        onMultipleUpload(results)
      } else {
        const file = files[0]
        const res = await uploadImageFile(file)
        if (res.warning) setWarningMsg(res.warning)
        onChange(res.url, res.thumbnailUrl)
      }
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) handleFiles(files)
  }

  const onFileInputChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) handleFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePastedUrlApply = () => {
    if (pastedUrl.trim()) {
      onChange(pastedUrl.trim())
      setPastedUrl('')
      setShowUrlInput(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-studio-magenta hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL paste' : 'Paste web URL instead'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={pastedUrl}
            onChange={e => setPastedUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-studio-magenta"
          />
          <button
            type="button"
            onClick={handlePastedUrlApply}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-studio-magenta hover:bg-studio-fuchsia text-white transition"
          >
            Apply
          </button>
        </div>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-studio-surface p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/10 bg-black shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{value}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Photo attached successfully</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-[11px] text-studio-gold hover:underline"
              >
                Replace with another photo
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onChange(''); setWarningMsg('') }}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-studio-magenta bg-studio-magenta/10 scale-[1.01]'
              : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]'
          }`}
        >
          {uploading ? (
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-7 h-7 text-studio-magenta animate-spin" />
              <p className="text-xs font-medium text-white">Resizing with sharp to 1600px WebP + 500px thumbnail...</p>
            </div>
          ) : (
            <div className="py-1 flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
                <Upload className="w-5 h-5 text-studio-magenta" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Drag and drop photo{allowMultiple ? 's' : ''} here, or <span className="text-studio-magenta underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Resized to 1600px WebP + 500px thumb (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        onChange={onFileInputChange}
        className="hidden"
      />

      {warningMsg && (
        <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
