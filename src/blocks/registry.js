// src/blocks/registry.js
// Central block registry: each block type exports id, label, icon, defaultData, Editor, Component.

import * as TextBlock from './types/TextBlock'
import * as PhotoBlock from './types/PhotoBlock'
import * as ImageTextBlock from './types/ImageTextBlock'
import * as CardsBlock from './types/CardsBlock'
import * as NoticeBlock from './types/NoticeBlock'
import * as ButtonBlock from './types/ButtonBlock'
import * as EmbedBlock from './types/EmbedBlock'
import * as GooglePhotosBlock from './types/GooglePhotosBlock'
import * as VideoBlock from './types/VideoBlock'
import * as DividerBlock from './types/DividerBlock'
import * as GalleryBlock from './types/GalleryBlock'
import * as AccordionBlock from './types/AccordionBlock'
import * as ColumnsBlock from './types/ColumnsBlock'
import * as QuoteBlock from './types/QuoteBlock'
import * as AudioBlock from './types/AudioBlock'
import * as SpacerBlock from './types/SpacerBlock'
import * as SocialLinksBlock from './types/SocialLinksBlock'

export const BLOCK_REGISTRY = [
  TextBlock,
  PhotoBlock,
  GalleryBlock,
  ImageTextBlock,
  CardsBlock,
  ColumnsBlock,
  AccordionBlock,
  QuoteBlock,
  AudioBlock,
  NoticeBlock,
  ButtonBlock,
  SocialLinksBlock,
  SpacerBlock,
  DividerBlock,
  EmbedBlock,
  GooglePhotosBlock,
  VideoBlock,
]

export const BLOCK_TYPES = BLOCK_REGISTRY.map(b => ({
  type: b.id,
  label: b.label,
  icon: b.icon
}))

const registryMap = new Map(BLOCK_REGISTRY.map(b => [b.id, b]))

export function getBlockDefinition(type) {
  return registryMap.get(type) || null
}

export function createDefaultBlock(type) {
  const def = getBlockDefinition(type)
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
  if (def && typeof def.defaultData === 'function') {
    return def.defaultData(id)
  }
  return { id, type, visible: true }
}
