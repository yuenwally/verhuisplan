import type { TargetAndTransition, Transition } from 'motion/react';

/** How long the row takes to open or close, pushing its neighbours along. */
const SHIFT = 0.34;
/** How long the contents take to fade. */
const FADE = 0.22;

/**
 * A long, soft tail. Linear or `easeOut` makes a growing row look like it snaps
 * to a stop, which is what reads as "chunky" at these short durations.
 */
const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1];
const EASE_IN: Transition['ease'] = [0.64, 0, 0.78, 0];

export type ListItemMotion = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  /** `layout` is a valid per-property transition on motion components. */
  transition: Transition & { layout: Transition };
};

/**
 * Enter and exit for a row in a vertical list, sequenced rather than simultaneous.
 *
 * On enter the row opens to its full height while still invisible, so whatever sits
 * below it has finished moving before the row appears. On exit the order reverses:
 * the row fades, then the gap closes. Fading and moving at once reads as two things
 * happening, and the eye cannot follow either.
 *
 * The fade also carries a small upward drift, so the row arrives rather than
 * blinking on.
 *
 * `paddingY` is the row's vertical padding in pixels; it has to collapse with the
 * height, or a zero-height row still occupies its padding.
 */
export function listItemMotion(paddingY = 0): ListItemMotion {
  const closed = { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 };
  const open = { opacity: 1, height: 'auto', paddingTop: paddingY, paddingBottom: paddingY };

  const grow = { duration: SHIFT, ease: EASE_OUT } as const;
  const shrink = { duration: SHIFT, ease: EASE_IN, delay: FADE } as const;

  return {
    initial: { ...closed, y: -4 },
    animate: {
      ...open,
      y: 0,
      transition: {
        height: grow,
        paddingTop: grow,
        paddingBottom: grow,
        opacity: { duration: FADE, delay: SHIFT, ease: 'linear' },
        y: { duration: FADE, delay: SHIFT, ease: EASE_OUT },
      },
    },
    exit: {
      ...closed,
      y: -4,
      transition: {
        opacity: { duration: FADE, ease: 'linear' },
        y: { duration: FADE, ease: EASE_IN },
        height: shrink,
        paddingTop: shrink,
        paddingBottom: shrink,
      },
    },
    // Siblings slide with the same curve as the row that displaced them.
    transition: { layout: { duration: SHIFT, ease: EASE_OUT } },
  };
}
