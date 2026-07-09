'use client';

import { UserPlus } from 'lucide-react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAssignableNames } from '@/hooks/use-plan';
import { normalizeWho, sortAssignees } from '@/lib/assignees';
import { avatarFor } from '@/lib/identity';
import { cn } from '@/lib/utils';

type AssigneeMenuProps = {
  /** Raw storage value; may be a legacy string. */
  who: unknown;
  onToggle: (name: string) => void;
  /** Matches the height of the deadline field beside it. */
  className?: string;
  glyphClassName?: string;
};

export function AssigneeMenu({
  who,
  onToggle,
  className,
  glyphClassName = 'size-[15px] text-[13px]',
}: AssigneeMenuProps) {
  const names = useAssignableNames();
  const assigned = sortAssignees(normalizeWho(who), names);

  const label = assigned.length
    ? `Toegewezen aan ${assigned.join(', ')}`
    : 'Niemand toegewezen';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className={cn(
            `flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-[1.5px]
            border-input bg-background px-2 text-secondary-foreground transition-colors
            hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50
            focus-visible:outline-none`,
            className,
          )}
        >
          {assigned.length === 0 ? (
            <UserPlus className="size-3.5" aria-hidden />
          ) : (
            assigned.map((name) => (
              <AvatarGlyph key={name} avatar={avatarFor(name)} className={glyphClassName} />
            ))
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Wie doet dit?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {names.map((name) => (
          <DropdownMenuCheckboxItem
            key={name}
            checked={assigned.includes(name)}
            // Radix closes on select; keep it open so several people can be ticked.
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onToggle(name)}
          >
            <AvatarGlyph avatar={avatarFor(name)} className="size-[16px] text-[14px]" />
            {name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
