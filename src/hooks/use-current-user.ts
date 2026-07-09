'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  getKnownUsersSnapshot,
  getServerSnapshot,
  getUserSnapshot,
  login,
  logout,
  parseKnownUsers,
  parseUser,
  subscribe,
} from '@/lib/user-store';

/**
 * The signed-in name, read from localStorage through `useSyncExternalStore` so
 * that server and client agree on the first paint. There are no accounts: the
 * name is the identity, and it is what the auth route mints a token for.
 */
export function useCurrentUser() {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);
  const rawKnown = useSyncExternalStore(subscribe, getKnownUsersSnapshot, getServerSnapshot);

  const user = useMemo(() => parseUser(rawUser), [rawUser]);
  const knownUsers = useMemo(() => parseKnownUsers(rawKnown), [rawKnown]);

  return { user, knownUsers, login, logout };
}
