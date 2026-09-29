const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * "today", "3 days ago", "5 months ago", "1 year ago"
 * @param {string} iso
 * @param {Date} [now]
 */
export function timeAgo(iso, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return 'date unknown';
  const days = Math.floor((now.getTime() - date.getTime()) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Whole days from today until a yyyy-mm-dd date (negative = past).
 * @param {string} ymd
 * @param {Date} [now]
 */
export function daysUntil(ymd, now = new Date()) {
  const [y, m, d] = ymd.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** @param {string} iso */
export function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** @param {string} iso */
export function formatDateTime(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
