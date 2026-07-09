import { PIGICORN } from '@/lib/plan-config';

/** Midnight today, so deadline comparisons ignore the time of day. */
export function startOfToday(now: Date = new Date()): Date {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return today;
}

function parseDeadline(deadline: string): Date {
  return new Date(`${deadline}T00:00`);
}

export function isOverdue(deadline: string, done: boolean, today: Date = startOfToday()): boolean {
  if (!deadline || done) {
    return false;
  }

  return parseDeadline(deadline) < today;
}

/** `2026-08-24` → `24 aug` */
export function formatDeadlineShort(deadline: string): string {
  if (!deadline) {
    return '';
  }

  return parseDeadline(deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

/** `2026-07-15` → `15 juli` */
export function formatMomentDate(date: string): string {
  return parseDeadline(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

export function daysUntil(date: string, today: Date = startOfToday()): number {
  return Math.ceil((parseDeadline(date).getTime() - today.getTime()) / 86_400_000);
}

export function timeAgo(ts: number, now: number = Date.now()): string {
  const seconds = Math.floor((now - ts) / 1000);

  if (seconds < 60) {
    return 'zojuist';
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} min geleden`;
  }

  if (seconds < 86_400) {
    return `${Math.floor(seconds / 3600)} uur geleden`;
  }

  return `${Math.floor(seconds / 86_400)} dagen geleden`;
}

/** `1.234` or `12.500.000`: periods that can only be thousand separators. */
const GROUPED = /^\d{1,3}(\.\d{3})+$/;

/**
 * Reads the amounts a Dutch speaker actually types. Anything unparseable is zero.
 *
 * - `1.234,50` — a comma makes every period before it a thousand separator.
 * - `12.500` — periods grouping digits in threes are thousand separators.
 * - `1200.50` — otherwise a period is a decimal point.
 *
 * Without the first rule `1.234,50` parses as `1.234`, silently turning
 * twelve hundred euro into one.
 */
export function parseAmount(amount: string): number {
  const text = String(amount).trim();

  if (text.includes(',')) {
    return parseFloat(text.replace(/\./g, '').replace(',', '.')) || 0;
  }

  if (GROUPED.test(text)) {
    return parseFloat(text.replace(/\./g, '')) || 0;
  }

  return parseFloat(text) || 0;
}

export function formatCostTotal(amounts: readonly string[]): string {
  const sum = amounts.reduce((total, amount) => total + parseAmount(amount), 0);

  return sum > 0 ? `€ ${sum.toLocaleString('nl-NL')}` : 'nog geen indicaties';
}

/** The mockup allowed only digits, comma and period in a cost field. */
export function sanitizeAmount(value: string): string {
  return value.replace(/[^\d.,]/g, '');
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export type WhoLabel = {
  /** Avatar tokens to render before the name, via `<AvatarGlyph>`. */
  avatars: string[];
  name: string;
};

/**
 * `Wally` → 🦆 + `Wally`. Returns the avatars separately rather than a single
 * string, because Joyce's is an SVG rather than a character.
 */
export function whoLabel(who: string): WhoLabel {
  switch (who) {
    case 'Wally':
      return { avatars: ['🦆'], name: 'Wally' };
    case 'WJ':
      return { avatars: ['🐵'], name: 'WJ' };
    case 'Joyce':
      return { avatars: [PIGICORN], name: 'Joyce' };
    case 'Samen':
      return { avatars: ['🦆', '🐵'], name: 'Samen' };
    case 'n.t.b.':
      return { avatars: ['·'], name: 'n.t.b.' };
    default:
      return { avatars: [], name: who };
  }
}

/** A six-digit hex colour at ~18% opacity, for the edit-flash background. */
export function tint(hex: string): string {
  return `${hex}2E`;
}
