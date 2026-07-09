import type { TargetAndTransition } from 'motion/react';

/** How long the row takes to open or close, pushing its neighbours along. */
const SHIFT = 0.2;
/** How long the contents take to fade. */
const FADE = 0.16;

export type ListItemMotion = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

/**
 * Enter and exit for a row in a vertical list, sequenced rather than simultaneous.
 *
 * On enter the row opens to its full height while still invisible, so whatever sits
 * below it has finished moving before the row appears. On exit the order reverses:
 * the row fades, then the gap closes. Fading and moving at once reads as two things
 * happening, and the eye cannot follow either.
 *
 * `paddingY` is the row's vertical padding in pixels; it has to collapse with the
 * height, or a zero-height row still occupies its padding.
 */
export function listItemMotion(paddingY = 0): ListItemMotion {
  const closed = { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 };
  const open = { opacity: 1, height: 'auto', paddingTop: paddingY, paddingBottom: paddingY };

  const size = { duration: SHIFT, ease: 'easeOut' } as const;
  const sizeAfterFade = { duration: SHIFT, ease: 'easeIn', delay: FADE } as const;

  return {
    initial: closed,
    animate: {
      ...open,
      transition: {
        height: size,
        paddingTop: size,
        paddingBottom: size,
        opacity: { duration: FADE, delay: SHIFT },
      },
    },
    exit: {
      ...closed,
      transition: {
        opacity: { duration: FADE },
        height: sizeAfterFade,
        paddingTop: sizeAfterFade,
        paddingBottom: sizeAfterFade,
      },
    },
  };
}
