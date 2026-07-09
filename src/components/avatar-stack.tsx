'use client';

import { shallow, useOthersMapped } from '@liveblocks/react/suspense';
import { AnimatePresence, motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Who else is in the room right now. Empty when you are alone. */
export function AvatarStack() {
  // Mapped to identity only, so cursor movement never re-renders the header.
  const others = useOthersMapped(
    (other) => ({ name: other.info.name, avatar: other.info.avatar, color: other.info.color }),
    shallow,
  );

  return (
    <div className="flex items-center -space-x-2">
      <AnimatePresence initial={false}>
        {others.map(([connectionId, info]) => (
          <motion.div
            key={connectionId}
            layout
            initial={{ opacity: 0, scale: 0.5, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex size-9 items-center justify-center rounded-full border-2 bg-card
                    text-lg"
                  style={{ borderColor: info.color }}
                >
                  {info.avatar}
                </div>
              </TooltipTrigger>
              <TooltipContent>{info.name} is ook online</TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
