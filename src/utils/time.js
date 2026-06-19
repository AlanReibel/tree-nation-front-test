const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/**
 * Formats a ISO/timestamp string as a relative time string.
 * e.g. "2025-11-28T11:57:16.000000Z" → "2 months ago"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return ''

  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 0) return 'just now'
  if (seconds < MINUTE) return `${seconds}s ago`
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d ago`
  if (seconds < MONTH) return `${Math.floor(seconds / WEEK)}w ago`
  if (seconds < YEAR) return `${Math.floor(seconds / MONTH)}mo ago`
  return `${Math.floor(seconds / YEAR)}y ago`
}

/**
 * Formats a number for display — truncates decimals and adds K for thousands.
 * e.g. 6809.5977 → "6.8K", 42 → "42"
 */
export function formatScore(n) {
  if (n == null || isNaN(n)) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return Math.round(n).toString()
}
