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

  // An emoji is drawn against its line box, not its element box, so a bare span
  // sits low beside the text next to it. Centring it in a flex box pins it.
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center leading-none', className)}
    >
      {avatar}
    </span>
  );
}
