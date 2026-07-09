import { describe, expect, it } from 'vitest';
import { avatarFor, colorFor, cycleWho } from '@/lib/identity';
import { AVATAR_POOL, PIGICORN, SEEDED_USERS, WHO_OPTIONS } from '@/lib/plan-config';

describe('avatarFor', () => {
  it('gives Willem Jan the monkey, however he spells it', () => {
    for (const name of ['WJ', 'wj', 'Willem', 'Willem Jan', 'willem-jan', 'WillemJan']) {
      expect(avatarFor(name)).toBe('🐵');
    }
  });

  it('gives Wally the duck', () => {
    for (const name of ['Wally', 'wally', 'Wal']) {
      expect(avatarFor(name)).toBe('🦆');
    }
  });

  it('gives Joyce the drawn pigicorn', () => {
    for (const name of ['Joyce', 'joyce', 'Joy']) {
      expect(avatarFor(name)).toBe(PIGICORN);
    }
  });

  it('gives anyone else a stable animal from the pool', () => {
    const first = avatarFor('Sanne');

    expect(AVATAR_POOL).toContain(first);
    expect(avatarFor('Sanne')).toBe(first);
    expect(avatarFor('sanne')).toBe(first);
  });

  it('does not hand a guest a reserved avatar', () => {
    for (const reserved of ['🦆', '🐵', PIGICORN]) {
      expect(avatarFor('Sanne')).not.toBe(reserved);
    }
  });
});

describe('SEEDED_USERS', () => {
  it('carries the same avatar that avatarFor derives from the name', () => {
    // The login chip reads the seeded avatar; the cursor flag derives its own.
    // If these drift, Joyce is a pig in one place and an owl in the other.
    for (const user of SEEDED_USERS) {
      expect(avatarFor(user.name)).toBe(user.avatar);
    }
  });
});

describe('colorFor', () => {
  it('is stable and case-insensitive', () => {
    expect(colorFor('Sanne')).toBe(colorFor('sanne'));
  });
});

describe('cycleWho', () => {
  const options = [...WHO_OPTIONS];

  it('advances through the defaults and wraps', () => {
    expect(cycleWho('Wally', options)).toBe('WJ');
    expect(cycleWho('WJ', options)).toBe('Samen');
    expect(cycleWho('Samen', options)).toBe('n.t.b.');
    expect(cycleWho('n.t.b.', options)).toBe('Wally');
  });

  it('includes guests who have joined the room', () => {
    const withGuest = [...options, 'Sanne'];

    expect(cycleWho('n.t.b.', withGuest)).toBe('Sanne');
    expect(cycleWho('Sanne', withGuest)).toBe('Wally');
  });

  it('restarts at the first option for an unknown assignee', () => {
    expect(cycleWho('Onbekend', options)).toBe('Wally');
  });
});
