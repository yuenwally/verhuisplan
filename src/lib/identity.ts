import { AVATAR_POOL, CURSOR_COLORS, PIGICORN } from '@/lib/plan-config';

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
const JOYCE = /joyce|joy($|\W)/;

export function avatarFor(name: string): string {
  const n = (name || '').toLowerCase();

  if (JOYCE.test(n)) {
    return PIGICORN;
  }

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
