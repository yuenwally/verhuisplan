'use client';

import { shallow, useOthersMapped } from '@liveblocks/react/suspense';
import { AnimatePresence, motion } from 'motion/react';
import { AvatarGlyph } from '@/components/avatar-glyph';

/** Shows what other people are typing into this phase's add-input, as they type. */
export function TypingGhost({ phase, className }: { phase: number; className?: string }) {
  // `useOthersMapped` + `shallow` means a remote cursor move — which fires many
  // times a second — does not re-render the ghost, because the mapped value is
  // unchanged. A plain `useOthers` selector would allocate a new array each time.
  const others = useOthersMapped(
    (other) => ({
      text: other.presence.typingPhase === phase ? other.presence.typingText : '',
      avatar: other.info.avatar,
      color: other.info.color,
    }),
    shallow,
  );

  const typists = others.filter(([, typist]) => typist.text);

  return (
    <AnimatePresence>
      {typists.map(([connectionId, typist]) => (
        <motion.div
          key={connectionId}
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={className}
          style={{ color: typist.color }}
        >
          <AvatarGlyph avatar={typist.avatar} className="size-[14px] text-sm" />
          <span className="truncate italic opacity-70">{typist.text}</span>
          <span className="animate-pulse">▌</span>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
