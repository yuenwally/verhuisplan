import { cn } from '@/lib/utils';

/**
 * Joyce's avatar: a pig with a tiny unicorn standing on its head. No such emoji
 * exists, so it is drawn.
 *
 * Tuned to stay legible at 17px, the smallest place it appears (the activity
 * feed). That is why the unicorn is oversized relative to a real one, the
 * strokes are heavy, and it has two legs rather than four — at this size extra
 * detail turns to mud.
 */
export function Pigicorn({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className={cn('inline-block shrink-0', className)}
    >
      {/* pig ears */}
      <path
        d="M6.9 16.2 L11.4 19.9 L5.7 20.9 Z"
        fill="#E98B9C"
        stroke="#3B2F24"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M25.1 16.2 L26.3 20.9 L20.6 19.9 Z"
        fill="#E98B9C"
        stroke="#3B2F24"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />

      {/* pig head, eyes, snout */}
      <ellipse cx="16" cy="24.5" rx="9.6" ry="6.9" fill="#F2A0AE" stroke="#3B2F24" strokeWidth="1.45" />
      <circle cx="12.5" cy="23.5" r="1.25" fill="#3B2F24" />
      <circle cx="19.5" cy="23.5" r="1.25" fill="#3B2F24" />
      <ellipse cx="16" cy="27" rx="4.3" ry="2.9" fill="#E98B9C" stroke="#3B2F24" strokeWidth="1.15" />
      <ellipse cx="14.7" cy="27" rx="0.72" ry="1.05" fill="#3B2F24" />
      <ellipse cx="17.3" cy="27" rx="0.72" ry="1.05" fill="#3B2F24" />

      {/* the tiny unicorn, planted on the pig's head */}
      <path d="M13.2 15.4 v2.2 M18.4 15.4 v2.2" stroke="#3B2F24" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="15.4" cy="12.3" rx="5.4" ry="3.7" fill="#FDF8EE" stroke="#3B2F24" strokeWidth="1.4" />
      {/* neck: a fat stroke, so body and head read as one creature */}
      <path d="M19.2 9.9 L18.6 12.3" stroke="#FDF8EE" strokeWidth="3.2" />
      <ellipse cx="21.3" cy="7.6" rx="3.6" ry="2.95" fill="#FDF8EE" stroke="#3B2F24" strokeWidth="1.4" />
      <path
        d="M22.8 5.2 L24.5 0.9 L20.6 4 Z"
        fill="#F2C14E"
        stroke="#3B2F24"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="22.2" cy="7.4" r="0.95" fill="#3B2F24" />
      <path d="M19.5 4.5 q-2.7 1.6 -2.9 4.2" stroke="#B284BE" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M10.4 11.6 q-2.7 0.5 -3.2 3.1" stroke="#B284BE" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
