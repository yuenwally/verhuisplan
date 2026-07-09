import { Pigicorn } from '@/components/pigicorn';
import { PIGICORN } from '@/lib/plan-config';
import { cn } from '@/lib/utils';

/**
 * Renders an avatar token: an emoji for most people, a drawn SVG for Joyce.
 *
 * Pass sizing for both cases — `size-[22px] text-[22px]` — since the emoji is
 * text and the pigicorn is a box.
 */
export function AvatarGlyph({ avatar, className }: { avatar: string; className?: string }) {
  if (avatar === PIGICORN) {
    return <Pigicorn className={className} />;
  }

  return (
    <span aria-hidden className={cn('inline-block leading-none', className)}>
      {avatar}
    </span>
  );
}
