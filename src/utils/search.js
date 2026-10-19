/**
 * Search normalization and matching utility for RJB Art Studio.
 * Matches strictly on item.title and item.description.
 */

export function normalizeText(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics/accents
    .replace(/[^\w\s]/g, ' ') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Checks if an item matches the search query.
 * Every word in the search query must match the START of at least one word in title or description.
 * Never searches category, playlist, medium, video ID, URLs, or tags.
 */
export function matchesSearch(item, rawQuery) {
  if (!rawQuery) return true
  const queryNorm = normalizeText(rawQuery)
  if (!queryNorm) return true

  const queryWords = queryNorm.split(' ').filter(Boolean)
  if (queryWords.length === 0) return true

  const titleNorm = normalizeText(item?.title || '')
  const descNorm = normalizeText(item?.description || '')
  const combined = `${titleNorm} ${descNorm}`
  const targetWords = combined.split(' ').filter(Boolean)

  return queryWords.every(qWord =>
    targetWords.some(tWord => tWord.startsWith(qWord))
  )
}
