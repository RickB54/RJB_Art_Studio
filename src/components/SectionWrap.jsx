// src/components/SectionWrap.jsx
import React from 'react'

export const SPACING_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'none', label: 'None (0px)' },
  { id: 'xs', label: 'XS (8px)' },
  { id: 's', label: 'S (16px)' },
  { id: 'm', label: 'M (32px)' },
  { id: 'l', label: 'L (48px)' },
  { id: 'xl', label: 'XL (64px)' },
  { id: '2xl', label: '2XL (96px)' },
  { id: 'custom', label: 'Custom px' }
]

const SPACING_MAP = {
  none: '0px',
  xs: '0.5rem',
  s: '1rem',
  m: '2rem',
  l: '3rem',
  xl: '4rem',
  '2xl': '6rem',
}

export default function SectionWrap({
  id,
  className = '',
  style = {},
  spaceAbove,
  spaceBelow,
  customSpaceAbove,
  customSpaceBelow,
  visible = true,
  children
}) {
  if (visible === false) return null

  const paddingTop = spaceAbove === 'custom'
    ? (customSpaceAbove ? `${parseInt(customSpaceAbove)}px` : undefined)
    : (spaceAbove && spaceAbove !== 'default' ? SPACING_MAP[spaceAbove] : undefined)

  const paddingBottom = spaceBelow === 'custom'
    ? (customSpaceBelow ? `${parseInt(customSpaceBelow)}px` : undefined)
    : (spaceBelow && spaceBelow !== 'default' ? SPACING_MAP[spaceBelow] : undefined)

  const combinedStyle = {
    ...style,
    ...(paddingTop !== undefined ? { paddingTop } : {}),
    ...(paddingBottom !== undefined ? { paddingBottom } : {}),
  }

  return (
    <div id={id || undefined} className={className} style={combinedStyle}>
      {children}
    </div>
  )
}
