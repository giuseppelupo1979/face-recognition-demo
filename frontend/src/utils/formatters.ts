/**
 * Formatta confidence come percentuale.
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`
}

/**
 * Formatta timestamp come ora leggibile.
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('it-IT')
}

/**
 * Formatta durata in secondi come "Xm Ys".
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

/**
 * Formatta millisecondi.
 */
export function formatLatency(ms: number): string {
  return `${Math.round(ms)}ms`
}

/**
 * Genera colore casuale per profilo.
 */
export const PROFILE_COLORS = [
  '#00d9ff', // cyan
  '#00ff88', // green
  '#ffd700', // yellow
  '#ff4444', // red
  '#a855f7', // purple
  '#ff8c00', // orange
]

/**
 * Rating stelle basato su score 0-10.
 */
export function getStarRating(score: number): string {
  const stars = Math.round(score / 2)
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}

/**
 * Emoji emozione.
 */
export function getEmotionEmoji(emotion?: string): string {
  const map: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    surprised: '😮',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    disgust: '🤢',
  }
  return emotion ? (map[emotion] || '😐') : ''
}
