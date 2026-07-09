'use client';

import { motion } from 'motion/react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The planner's checkbox: a hand-drawn ink square that fills green and pops when
 * ticked. Radix keeps the keyboard and screen-reader behaviour intact.
 */
function Checkbox({
  className,
  iconClassName,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { iconClassName?: string }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `peer flex shrink-0 items-center justify-center rounded-lg border-2 border-border-strong
        bg-card outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50
        disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-success
        data-[state=checked]:text-success-foreground`,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
        asChild
      >
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 700, damping: 22 }}
          className={cn('leading-none font-extrabold', iconClassName)}
        >
          ✓
        </motion.span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
