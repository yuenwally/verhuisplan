import { AvatarGlyph } from '@/components/avatar-glyph';
import { whoLabel } from '@/lib/format';

/** The "who is doing this" pill: avatars, then the name. */
export function WhoBadge({ who, glyphClassName }: { who: string; glyphClassName: string }) {
  const { avatars, name } = whoLabel(who);

  return (
    <span className="inline-flex items-center gap-1">
      {avatars.map((avatar, index) => (
        <AvatarGlyph key={index} avatar={avatar} className={glyphClassName} />
      ))}
      {name}
    </span>
  );
}
