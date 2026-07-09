import { describe, expect, it } from 'vitest';
import { listItemMotion } from '@/lib/motion';
import type { TargetAndTransition } from 'motion/react';

type Timing = { duration: number; delay?: number };

function timing(target: TargetAndTransition, key: string): Timing {
  const transition = target.transition as Record<string, Timing> | undefined;
  const value = transition?.[key];

  if (!value) {
    throw new Error(`no transition for ${key}`);
  }

  return value;
}

describe('listItemMotion', () => {
  const item = listItemMotion(8);

  it('starts closed and invisible', () => {
    expect(item.initial).toMatchObject({ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 });
  });

  it('opens to the given padding', () => {
    expect(item.animate).toMatchObject({ height: 'auto', paddingTop: 8, paddingBottom: 8 });
  });

  it('finishes making room before it begins to fade in', () => {
    const height = timing(item.animate, 'height');
    const opacity = timing(item.animate, 'opacity');

    expect(opacity.delay).toBeGreaterThanOrEqual(height.duration);
  });

  it('finishes fading out before it begins to close the gap', () => {
    const opacity = timing(item.exit, 'opacity');
    const height = timing(item.exit, 'height');

    expect(height.delay).toBeGreaterThanOrEqual(opacity.duration);
  });

  it('collapses padding alongside height, so a closed row occupies nothing', () => {
    expect(item.exit).toMatchObject({ height: 0, paddingTop: 0, paddingBottom: 0 });
    expect(timing(item.exit, 'paddingTop').delay).toBe(timing(item.exit, 'height').delay);
  });

  it('moves displaced siblings on the same curve as the row itself', () => {
    const layout = item.transition.layout as unknown as Timing;

    expect(layout.duration).toBe(timing(item.animate, 'height').duration);
  });
});
