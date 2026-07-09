import { describe, expect, it } from 'vitest';
import { normalizeWho, sortAssignees, toggleAssignee } from '@/lib/assignees';

const ORDER = ['Wally', 'WJ', 'Joyce'];

describe('normalizeWho', () => {
  it('passes a list through', () => {
    expect(normalizeWho(['Wally', 'Joyce'])).toEqual(['Wally', 'Joyce']);
  });

  it('reads a legacy single name as a one-person list', () => {
    expect(normalizeWho('Wally')).toEqual(['Wally']);
  });

  it('reads legacy "Samen" as Wally and WJ, which is what it meant', () => {
    expect(normalizeWho('Samen')).toEqual(['Wally', 'WJ']);
  });

  it('reads legacy "n.t.b." as nobody', () => {
    expect(normalizeWho('n.t.b.')).toEqual([]);
  });

  it('survives missing or malformed storage', () => {
    expect(normalizeWho(undefined)).toEqual([]);
    expect(normalizeWho(null)).toEqual([]);
    expect(normalizeWho('')).toEqual([]);
    expect(normalizeWho(42)).toEqual([]);
    expect(normalizeWho([1, 'Wally', null, ''])).toEqual(['Wally']);
  });
});

describe('sortAssignees', () => {
  it('orders by the room order, not by when someone was ticked', () => {
    expect(sortAssignees(['Joyce', 'Wally'], ORDER)).toEqual(['Wally', 'Joyce']);
  });

  it('puts unknown names last, alphabetically', () => {
    expect(sortAssignees(['Zoe', 'Anna', 'WJ'], ORDER)).toEqual(['WJ', 'Anna', 'Zoe']);
  });
});

describe('toggleAssignee', () => {
  it('adds someone who is not assigned', () => {
    expect(toggleAssignee(['Wally'], 'Joyce')).toEqual(['Wally', 'Joyce']);
  });

  it('removes someone who is', () => {
    expect(toggleAssignee(['Wally', 'Joyce'], 'Wally')).toEqual(['Joyce']);
  });

  it('empties down to nobody', () => {
    expect(toggleAssignee(['Wally'], 'Wally')).toEqual([]);
  });

  it('does not mutate its input', () => {
    const before = ['Wally'];
    toggleAssignee(before, 'Joyce');
    expect(before).toEqual(['Wally']);
  });
});
