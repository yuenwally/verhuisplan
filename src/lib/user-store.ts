import { avatarFor, colorFor } from '@/lib/identity';
import { SEEDED_USERS } from '@/lib/plan-config';
import type { CurrentUser, KnownUser } from '@/lib/types';

const USER_KEY = 'verhuisplanner_user_v1';
const KNOWN_KEY = 'verhuisplanner_known_users_v1';

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Also fires on the `storage` event, so logging out in one tab logs out the others. */
export function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // A private-mode browser can refuse writes; the session still works in memory.
  }
}

/**
 * Snapshots are the raw strings rather than parsed objects: `useSyncExternalStore`
 * compares them with `Object.is`, and a fresh object every read would loop forever.
 */
export function getUserSnapshot(): string | null {
  return read(USER_KEY);
}

export function getKnownUsersSnapshot(): string | null {
  return read(KNOWN_KEY);
}

/** Rendered on the server, where there is no localStorage: nobody is signed in. */
export function getServerSnapshot(): string | null {
  return null;
}

export function parseUser(raw: string | null): CurrentUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CurrentUser>;

    if (typeof parsed?.name !== 'string' || !parsed.name.trim()) {
      return null;
    }

    // Derive avatar and colour rather than trusting what was stored, so the rules
    // can change without stranding old sessions on a stale emoji.
    return {
      name: parsed.name,
      avatar: avatarFor(parsed.name),
      color: colorFor(parsed.name),
    };
  } catch {
    return null;
  }
}

export function parseKnownUsers(raw: string | null): KnownUser[] {
  let stored: KnownUser[] = [];

  try {
    stored = raw ? (JSON.parse(raw) as KnownUser[]) : [];
  } catch {
    stored = [];
  }

  const seen = new Set(stored.map((user) => user.name.toLowerCase()));

  return [...stored, ...SEEDED_USERS.filter((user) => !seen.has(user.name.toLowerCase()))];
}

export function login(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return;
  }

  write(USER_KEY, JSON.stringify({ name: trimmed }));

  const known = parseKnownUsers(getKnownUsersSnapshot());

  if (!known.some((user) => user.name.toLowerCase() === trimmed.toLowerCase())) {
    write(KNOWN_KEY, JSON.stringify([...known, { name: trimmed, avatar: avatarFor(trimmed) }]));
  }

  emit();
}

export function logout() {
  try {
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore: the emit below still re-renders into the logged-out state.
  }

  emit();
}
