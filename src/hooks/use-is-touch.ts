'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(pointer: coarse)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** False on the server, so the first paint matches the desktop markup. */
function getServerSnapshot() {
  return false;
}

/**
 * True for a finger, false for a mouse. Drives the affordances touch has no
 * equivalent for: hover reveals, and swipe in place of a hover-only delete.
 */
export function useIsTouch() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
