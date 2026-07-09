# Verhuisplan — multiplayer moving planner

Date: 2026-07-09

## Purpose

Turn the static Claude-design mockup at `docs/Verhuisplanner.html` into a real Next.js
application that Wally and Willem Jan can both use at the same time, from different
machines, and see each other work in realtime.

The mockup is a Dutch moving planner: name-based login, five phases of tasks, a
list/board view toggle, a countdown to the key handover, open questions, cost
estimates, an activity feed, and confetti when a phase is completed.

## Success criteria

1. The app is visually indistinguishable from the mockup, but built from shadcn/ui
   components wherever a component exists for the job.
2. Changes persist across reloads and across devices.
3. Two people in the app at once see each other's edits, and each other's mouse
   cursors, without refreshing.
4. Adding and deleting an item animates in and out — for everyone, not just the
   person who did it.
5. `npm run check` passes.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Realtime + persistence | Liveblocks | Cursors, presence and conflict-free shared state out of the box; Storage is durable, so it doubles as the database. Free tier covers 50 MAU against our 2–3. |
| Access control | Name only, one shared room | Matches the mockup. The content is a moving plan, not secrets. |
| Design fidelity | Pixel-faithful, shadcn re-themed | Keep the paper/tape aesthetic; inherit Radix accessibility for free. |
| View preference toggles | Dropped | The mockup's three editor props become fixed defaults: confetti on, activity feed on, done tasks stay in place. |

## Tooling, aligned with true-oriental-webshop

Adopted:

- `src/` layout with the `@/*` → `./src/*` path alias.
- The reference `eslint.config.mjs` verbatim, minus the `src/generated/**` ignore.
  Adds `@stylistic/eslint-plugin`, `eslint-plugin-import`, `eslint-plugin-react`,
  `eslint-plugin-react-hooks`.
- The reference strict `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`), without `composite`.
- `components.json`: new-york style, neutral base colour, CSS variables, lucide icons.
- The `check` script: `tsc --noEmit && npm run lint`.

Not adopted, because they do not apply: Prisma, next-intl, the SVGR turbopack rule,
Shopify GraphQL codegen.

New dependencies: `@liveblocks/client`, `@liveblocks/react`, `motion`, `lucide-react`,
`class-variance-authority`, `clsx`, `tailwind-merge`, plus `shadcn` and `tw-animate-css`
as devDeps.

Fonts (Caveat 600/700, Nunito 400/600/700/800) load through `next/font/google` rather
than the woff2 blobs embedded in the mockup.

## Data model

One Liveblocks room, id `verhuisplan`. Storage root:

| Key | Type | Notes |
|---|---|---|
| `tasks` | `LiveList<LiveObject<Task>>` | One flat list. `phase` is a field. |
| `questions` | `LiveList<LiveObject<Question>>` | |
| `costs` | `LiveList<LiveObject<Cost>>` | |
| `activity` | `LiveList<LiveObject<ActivityEntry>>` | Trimmed to 25 entries on write. |
| `users` | `LiveList<LiveObject<KnownUser>>` | Powers the quick-login chips. |

```ts
type Task = {
  id: string;
  phase: 1 | 2 | 3 | 4 | 5;
  title: string;
  who: string;        // 'Wally' | 'WJ' | 'Samen' | 'n.t.b.' | any known user name
  deadline: string;   // '' or 'YYYY-MM-DD'
  done: boolean;
  doneBy: string;
};

type Question = { id: string; text: string; done: boolean };
type Cost = { id: string; label: string; amount: string };
type ActivityEntry = { id: string; user: string; avatar: string; text: string; ts: number };
type KnownUser = { name: string; avatar: string };
```

`tasks` stays a single flat list so that drag-reorder is `LiveList.move(from, to)` — the
CRDT-safe operation, which resolves correctly when two people drag at the same time. The
mockup used `splice` on a flat array, so this is a direct translation rather than a
redesign.

The five phase definitions and three countdown moments are constants in
`src/lib/plan-config.ts`. They are not user-editable, so they do not belong in storage.
Storage is seeded once through `RoomProvider`'s `initialStorage` with the 22 seed tasks,
4 questions and 5 cost lines from the mockup.

### Identity and presence

The chosen name is kept in `localStorage` and posted to `/api/liveblocks-auth`, which
mints a token server-side carrying `userInfo: { name, avatar, color }`. This keeps
`LIVEBLOCKS_SECRET_KEY` off the client. `useOthers()` then yields every other person's
name, avatar and colour for free.

Avatar rules are inherited from the mockup: a name matching Willem Jan gets 🐵, Wally
gets 🦆, anyone else gets a stable hash pick from `🦊 🐸 🐙 🦉 🐝 🐢 🦔 🐨`. Cursor colour
is a stable hash pick from the palette accents.

Presence per connection:

```ts
type Presence = {
  cursor: { x: number; y: number } | null;
  typingPhase: number | null;
  typingText: string;
};
```

Broadcast events, for edit flashes:

```ts
type RoomEvent = { type: 'flash'; targetId: string; color: string };
```

## Component architecture

```
src/app/layout.tsx          fonts, <Providers>
src/app/page.tsx            <Room> → <Planner>
src/app/api/liveblocks-auth/route.ts

src/liveblocks.config.ts    typed Presence, Storage, UserMeta, RoomEvent
src/lib/plan-config.ts      PHASES, MOMENTS, WHO_OPTIONS, palette
src/lib/seed.ts             initialStorage factory
src/lib/identity.ts         avatarFor, colorFor
src/lib/format.ts           timeAgo, deadline formatting, currency
src/lib/utils.ts            cn()

src/components/room.tsx             LiveblocksProvider + RoomProvider + Suspense
src/components/login-screen.tsx
src/components/planner.tsx          header, view toggle, two-column layout
src/components/avatar-stack.tsx
src/components/phase-card.tsx
src/components/task-row.tsx         list view row
src/components/task-card.tsx        board view card
src/components/board-view.tsx
src/components/countdown-card.tsx
src/components/questions-card.tsx
src/components/costs-card.tsx
src/components/activity-card.tsx
src/components/confetti.tsx
src/components/cursors.tsx          other people's cursors
src/components/ui/*                 shadcn
```

Each card component reads only the slice of storage it needs via `useStorage`, and
mutates through a `useMutation` colocated with it. No prop drilling of the whole
document, and no single component that knows about every part of the plan.

shadcn components used: `button`, `input`, `checkbox`, `card`, `tabs`, `progress`,
`avatar`, `tooltip`, `separator`, `sonner`. Bespoke and hand-written: the tape strips,
the Caveat headings, the dashed "+ toevoegen" inputs, the confetti, the cursors.

## Theming

`src/app/globals.css` maps the shadcn CSS variables onto the mockup's palette, so stock
shadcn components render the paper look without per-component overrides:

| Token | Value | Role in the mockup |
|---|---|---|
| `--background` | `#F5EDDF` | paper |
| `--card` | `#FDF8EE` | card paper |
| `--foreground` | `#3B2F24` | ink |
| `--primary` | `#C96F4A` | terracotta |
| `--accent` | `#F2C14E` | tape yellow |
| `--muted-foreground` | `#8A785C` | secondary ink |
| `--border` | `#E4D4B2` | card border |
| `--success` | `#6FA26B` | checked green |
| `--destructive` | `#C0392B` | overdue deadline |

Fonts: `--font-hand` (Caveat) for headings, `--font-sans` (Nunito) for everything else.

## Animation

`motion` (Framer Motion v12), matching the reference project.

- **Add / delete**: every list is wrapped in `AnimatePresence`. Items enter with
  `opacity 0 → 1, y 8 → 0, scale 0.96 → 1` and exit with `opacity → 0, x → 12, height → 0`.
  Because the list is driven by Liveblocks storage rather than local state, a remote
  insert or delete plays exactly the same animation on every connected client. This
  satisfies "visible for all the users" without any extra machinery.
- **Reorder**: `layout` prop on the row, so `LiveList.move` slides rows into place.
- **Progress bars**: width transition, already in the mockup.
- **Checkbox**: a small scale pop on check, and a strike-through that wipes left to right.
- **Confetti**: the mockup's 48 CSS-animated pieces, kept as-is, fired when the last
  task in a phase is checked.
- **Cursors**: position updated via `useUpdateMyPresence` on `pointermove`, rendered with
  a spring transition so remote cursors glide rather than teleport. Cursor labels carry
  the person's emoji and name.
- **Typing indicators**: `typingPhase` / `typingText` presence fields render a ghost row
  at the bottom of the relevant phase card while someone types into its add-input.
- **Edit flashes**: a `flash` broadcast event pulses the touched row in the actor's
  cursor colour for 600 ms.

Respect `prefers-reduced-motion`: durations collapse to zero, confetti does not fire.

## Error handling

- No `LIVEBLOCKS_SECRET_KEY` → the auth route returns 500 and `<Room>` renders an
  explanatory card telling the developer to set the env var, rather than hanging on the
  Suspense fallback.
- Lost connection → Liveblocks reconnects and replays local edits automatically. A small
  "opnieuw verbinden…" pill appears in the header while `useStatus()` is not `connected`.
- Malformed persisted `localStorage` user → caught, treated as logged out.
- Cost amount input is filtered to digits, comma and period, as in the mockup.

## Testing

The valuable, non-obvious behaviour here is data manipulation, not rendering. Unit tests
(Vitest) cover the pure functions extracted from the mockup's logic:

- `avatarFor` — the Willem Jan / Wally / hash-pool rules.
- `timeAgo` — the four buckets.
- `costTotal` — comma/period parsing, nl-NL formatting, empty state.
- `cycleWho` — wraps through the four defaults plus any extra known users.
- `moveWithinPhase` — the from/to index computation used by drag-reorder, including the
  guard that refuses a move across phases.
- `overdue` — deadline before today, only when not done.

Realtime behaviour and cursor rendering are verified by hand with two browser windows;
mocking a Liveblocks room to assert cursors move is testing the library, not the app.

## Out of scope

Real accounts, per-room membership, dragging tasks between phases, editing phase or
moment definitions, mobile-specific layouts beyond the mockup's existing flex-wrap,
offline-first conflict UI, exporting the plan.
