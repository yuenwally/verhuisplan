import type { PhaseId } from '@/lib/types';

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
  { emoji: '🚚', label: 'Mogelijk al verhuizen', date: '2026-08-24' },
  { emoji: '🏠', label: 'WJ in de woning', date: '2026-09-01' },
] as const;

export const WHO_OPTIONS = ['Wally', 'WJ', 'Samen', 'n.t.b.'] as const;

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

export const ROOM_ID = 'verhuisplan';

export const ACTIVITY_LIMIT = 25;
