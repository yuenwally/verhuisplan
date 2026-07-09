import { AVATAR_POOL, CURSOR_COLORS } from '@/lib/plan-config';

/** Stable, order-independent hash so a name always maps to the same avatar and colour. */
function hash(value: string): number {
  let h = 0;

  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }

  return h;
}

const WILLEM_JAN = /(^|\W)(wj|willem|willemjan|willem-jan|jan)($|\W)|willem/;
const WALLY = /wall|wal($|\W)/;

export function avatarFor(name: string): string {
  const n = (name || '').toLowerCase();

  if (WILLEM_JAN.test(n)) {
    return '🐵';
  }

  if (WALLY.test(n)) {
    return '🦆';
  }

  return AVATAR_POOL[hash(n) % AVATAR_POOL.length] ?? '👤';
}

export function colorFor(name: string): string {
  const n = (name || '').toLowerCase();

  return CURSOR_COLORS[hash(n) % CURSOR_COLORS.length] ?? '#C96F4A';
}

/**
 * Advances a task's assignee through the four defaults, then through any other
 * name that has joined the room. Unknown values restart at the first option.
 */
export function cycleWho(current: string, options: readonly string[]): string {
  const index = options.indexOf(current);

  return options[(index + 1) % options.length] ?? current;
}
