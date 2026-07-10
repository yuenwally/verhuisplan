import type { KnownUser, PhaseId } from '@/lib/types';

export type PhaseDef = {
  id: PhaseId;
  label: string;
  title: string;
  shortTitle: string;
  tapeColor: string;
};

export const PHASES: readonly PhaseDef[] = [
  {
    id: 1,
    label: 'Fase 1',
    title: 'Direct oppakken',
    shortTitle: '1 · Direct',
    tapeColor: 'rgba(242,193,78,0.9)',
  },
  {
    id: 2,
    label: 'Fase 2',
    title: 'Inpakken & leeghalen',
    shortTitle: '2 · Inpakken',
    tapeColor: 'rgba(201,111,74,0.55)',
  },
  {
    id: 3,
    label: 'Fase 3',
    title: 'Sloop & spuiten',
    shortTitle: '3 · Sloop & spuiten',
    tapeColor: 'rgba(111,162,107,0.55)',
  },
  {
    id: 4,
    label: 'Fase 4',
    title: 'Keuken, badkamer & installaties',
    shortTitle: '4 · Keuken & badkamer',
    tapeColor: 'rgba(94,139,181,0.5)',
  },
  {
    id: 5,
    label: 'Fase 5',
    title: 'Kosten & beslissingen',
    shortTitle: '5 · Kosten',
    tapeColor: 'rgba(178,132,190,0.5)',
  },
] as const;

export type MomentDef = {
  emoji: string;
  label: string;
  date: string;
};

export const MOMENTS: readonly MomentDef[] = [
  { emoji: '🔑', label: 'Sleutels nieuwe woning', date: '2026-07-15' },
  { emoji: '🚚', label: 'Verhuizen Joyce & Wally', date: '2026-08-24' },
  { emoji: '🏠', label: 'WJ in de woning', date: '2026-08-24' },
] as const;

/**
 * An avatar is normally the emoji itself. Joyce's is a token, because a pig with
 * a tiny unicorn on its head is not in Unicode and has to be drawn — see
 * `components/pigicorn.tsx`. Render avatars through `<AvatarGlyph>`, never as
 * bare text, or Joyce shows up as the literal word.
 */
export const PIGICORN = 'pigicorn';

/** The people the app knows before anyone has typed a name. */
export const SEEDED_USERS: readonly KnownUser[] = [
  { name: 'Wally', avatar: '🦆' },
  { name: 'WJ', avatar: '🐵' },
  { name: 'Joyce', avatar: PIGICORN },
] as const;

/** Cursor and flash colours, drawn from the palette's accents. */
export const CURSOR_COLORS = [
  '#C96F4A',
  '#6FA26B',
  '#5E8BB5',
  '#B284BE',
  '#D99A2B',
] as const;

export const CONFETTI_COLORS = [
  '#F2C14E',
  '#C96F4A',
  '#6FA26B',
  '#5E8BB5',
  '#B284BE',
] as const;

export const AVATAR_POOL = ['🦊', '🐸', '🐙', '🦉', '🐝', '🐢', '🦔', '🐨'] as const;

/**
 * Timeline mark colours, chosen by the palette validator rather than by eye and
 * deliberately not the UI's `--success` / `--destructive`.
 *
 * The interface green (#6FA26B) scores 2.9:1 against the paper surface, below the
 * 3:1 floor for a mark, and the interface terracotta and red sit ΔE 11.4 apart
 * under deuteranopia, which is close enough that an overdue task and an open one
 * would look the same. These two pass the lightness band, the chroma floor, CVD
 * separation (ΔE 13.4 deutan) and contrast. `open` is neutral on purpose: it is
 * a hollow ring, making no colour claim at all.
 */
export const TIMELINE_STATUS = {
  done: '#2F9147',
  overdue: '#B3382C',
  open: '#6E5C42',
} as const;

export const ROOM_ID = 'verhuisplan';

export const ACTIVITY_LIMIT = 25;
