import { AvatarGlyph } from '@/components/avatar-glyph';
import { STATUS_LABEL, TIMELINE_STATUS } from '@/components/timeline/shared';
import { avatarFor } from '@/lib/identity';
import type { TimelineStatus } from '@/lib/timeline';

export type TooltipState = {
  x: number;
  y: number;
  title: string;
  when: string;
  status?: TimelineStatus;
  who?: string[];
};

/** The floating detail card for the two SVG designs (swimlanes, gantt). */
export function ChartTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg
        border-2 border-border bg-card px-2.5 py-1.5 shadow-[0_6px_18px_rgba(90,70,40,0.14)]"
      style={{ left: tooltip.x, top: tooltip.y - 14 }}
    >
      <div className="text-[12.5px] font-extrabold whitespace-nowrap">{tooltip.title}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#8A785C]">
        {tooltip.status ? (
          <>
            <span style={{ color: TIMELINE_STATUS[tooltip.status] }}>
              {STATUS_LABEL[tooltip.status]}
            </span>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <span className="whitespace-nowrap">{tooltip.when}</span>
        {(tooltip.who ?? []).map((name) => (
          <AvatarGlyph key={name} avatar={avatarFor(name)} className="size-[13px] text-[11px]" />
        ))}
      </div>
    </div>
  );
}
