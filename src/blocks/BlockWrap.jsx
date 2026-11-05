// src/blocks/BlockWrap.jsx
import React from 'react'

const SPACING_MAP = {
  none: '0px',
  xs: '0.5rem',  // 8px
  s: '1rem',     // 16px
  m: '2rem',     // 32px
  l: '3rem',     // 48px
  xl: '4rem',    // 64px
}

const WIDTH_MAP = {
  narrow: 'max-w-2xl',
  medium: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-full w-full',
}

const ALIGN_MAP = {
  left: 'mr-auto text-left',
  center: 'mx-auto',
  right: 'ml-auto text-right',
}

export default function BlockWrap({ block, children }) {
  const s = block?.style || {}

  // Responsive hide
  if (s.hideOnMobile && s.hideOnDesktop) {
    return null
  }
  let hideClass = ''
  if (s.hideOnMobile) {
    hideClass = 'hidden sm:block'
  } else if (s.hideOnDesktop) {
    hideClass = 'sm:hidden'
  }

  // Width & Alignment
  const widthClass = s.width ? (WIDTH_MAP[s.width] || '') : ''
  const alignClass = s.align ? (ALIGN_MAP[s.align] || '') : ''

  // Spacing above / below
  const marginTop = s.spaceAbove === 'custom'
    ? (s.customSpaceAbove ? `${parseInt(s.customSpaceAbove)}px` : undefined)
    : (s.spaceAbove ? SPACING_MAP[s.spaceAbove] : undefined)

  const marginBottom = s.spaceBelow === 'custom'
    ? (s.customSpaceBelow ? `${parseInt(s.customSpaceBelow)}px` : undefined)
    : (s.spaceBelow ? SPACING_MAP[s.spaceBelow] : undefined)

  // Background
  let bgClass = ''
  const inlineBg = {}
  if (s.background === 'card') {
    bgClass = 'glass-panel p-6 sm:p-8 rounded-3xl border border-white/10'
  } else if (s.background === 'custom' && s.customBgColor) {
    bgClass = 'p-6 sm:p-8 rounded-3xl'
    inlineBg.backgroundColor = s.customBgColor
  }

  const containerStyle = {
    ...(marginTop ? { marginTop } : {}),
    ...(marginBottom ? { marginBottom } : {}),
    ...inlineBg,
  }

  const hasWrapper = s.width || s.align || s.background || marginTop !== undefined || marginBottom !== undefined || hideClass || s.anchorId

  if (!hasWrapper) {
    return children
  }

  return (
    <div
      id={s.anchorId || undefined}
      className={`${hideClass} ${widthClass} ${alignClass} ${bgClass}`.trim()}
      style={containerStyle}
    >
      {children}
    </div>
  )
}
