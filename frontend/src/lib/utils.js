import { SCORE_LABELS } from './constants';

/**
 * Calculate composite Vouch Score from three dimensions.
 * Returns a single decimal (one place) — e.g. 8.3
 */
export function calculateVouchScore(vibe, value, experience) {
  const avg = (vibe + value + experience) / 3;
  return Math.round(avg * 10) / 10;
}

/**
 * Get the display integer for card-level scores.
 * Rounds to nearest integer.
 */
export function scoreToInt(score) {
  return Math.round(score);
}

/**
 * Get the score label (AVOID, MEH, RELIABLE, GREAT, TELL EVERYONE)
 * based on the integer score.
 */
export function getScoreLabel(score) {
  const rounded = Math.round(score);
  const match = SCORE_LABELS.find((s) => rounded >= s.min && rounded <= s.max);
  return match ? match.label : '';
}

/**
 * Format a date as a short relative string (e.g. "2d ago", "5h ago")
 */
export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text, maxLength = 280) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Get initials from a name for avatar fallback.
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
