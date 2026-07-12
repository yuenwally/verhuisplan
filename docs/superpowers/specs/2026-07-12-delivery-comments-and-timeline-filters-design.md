# Opmerkingen op leveringen + filteren in Tijdlijn/Kalender

**Date:** 2026-07-12
**Status:** Approved, ready for planning

## Summary

Two independent features on the existing planner:

1. **Opmerkingen op leveringen** — give each delivery the same comment
   affordance tasks already have (a message icon opening a popover to read and
   write comments).
2. **Filteren in Tijdlijn & Kalender** — two checkboxes ("Taken",
   "Leveringen") that hide either category from both time views. The choice is
   remembered across reloads and shared between the two views.

Both build on the current Liveblocks storage model and the existing
timeline/calendar components. No changes to `buildTimeline` or the drawing code.

---

## Part A — Opmerkingen op leveringen

### Current state

- Comments live in a flat Liveblocks `comments` `LiveList`, each
  `{ id, taskId, author, avatar, text, ts }` (`src/lib/types.ts`).
- `TaskComments` (`src/components/task-comments.tsx`) renders a message icon +
  popover; visible once a task has a comment, hover/touch-revealed otherwise.
- Used by `task-row.tsx` and `task-card.tsx`. Counts come from
  `useCommentCounts`; a task's comments from `useTaskComments(taskId)`.
- `useDeleteTask` cleans up a task's orphaned comments.

### Design

Generalize "a comment on a task" to "a comment on a subject", where a subject is
either a task or a delivery. A delivery is not a task, so reusing the same flat
list with a discriminator is cleaner than a parallel list.

**Data model** (`src/lib/types.ts`):

```ts
export type CommentSubjectKind = 'task' | 'delivery';

export type Comment = {
  id: string;
  subjectId: string;        // was: taskId
  subjectKind: CommentSubjectKind;
  author: string;
  avatar: string;
  text: string;
  ts: number;
};
```

**Migration.** Existing stored comments carry `taskId` and no
`subjectId`/`subjectKind`. Extend the existing migration path:

- `useNeedsMigration` also returns true when any stored comment lacks
  `subjectKind` (in addition to the current `deliveries`/`comments` key checks).
- `useEnsureStorage` rewrites each such comment: `subjectId = taskId`,
  `subjectKind = 'task'`, then removes the old `taskId` field. Task-only rooms
  and rooms with no comments are unaffected.

**Hooks** (`src/hooks/use-plan.ts`):

- `useTaskComments(taskId)` → `useSubjectComments(subjectId)` — filter by
  `subjectId`.
- `useCommentCounts` — unchanged in shape, but keyed by `subjectId`; the same
  map serves both tasks and deliveries since ids are unique nanoids.
- `useAddComment(taskId, text)` → `useAddComment(subjectId, kind, text)` —
  writes `subjectId`/`subjectKind`, and picks the activity-feed line by kind:
  a task uses its title ("reageerde op: …"), a delivery uses its label.
- `useDeleteComment` — unchanged (deletes by comment id).
- `useDeleteDelivery` — gains the same orphaned-comment cleanup
  `useDeleteTask` already performs, matched on `subjectId`.

**Component** (`src/components/task-comments.tsx`):

- Rename `TaskComments` → `Comments`, props
  `{ subjectId, subjectKind, count, className? }`. Behavior and look are
  unchanged. It calls `useSubjectComments(subjectId)` and
  `useAddComment(subjectId, subjectKind, …)`, so the activity line matches the
  subject.
- `task-row.tsx` and `task-card.tsx` pass `subjectId={task.id}` and
  `subjectKind="task"`.
- `deliveries-card.tsx` `DeliveryRow` renders `Comments` with
  `subjectId={delivery.id}` and `subjectKind="delivery"`, placed alongside the
  delete button so the icon reveals on row hover exactly like tasks.

### Acceptance

- A delivery with no comments shows the message icon on hover (always on touch);
  once it has one, the icon and count stay visible.
- Adding/deleting a delivery comment works and posts an activity-feed line using
  the delivery label.
- Existing task comments still render and are attributed correctly after
  migration.
- Deleting a delivery removes its comments.

---

## Part B — Filteren in Tijdlijn & Kalender

### Current state

- `TimelineView` and `CalendarView` each receive `tasks` + `deliveries` and call
  `buildTimeline(tasks, momentDates, deliveries, today)`.
- View-local UI state (orientation, month/week `Segmented`) is `useState`, not
  persisted.
- `Legend` takes `hasDeliveries`. `TimelineView` shows an `undatedNote` and a
  "Toon als tabel" details block.

### Design

**State — persisted, shared.** A small store module `src/lib/filter-store.ts`
mirroring `src/lib/user-store.ts`:

- localStorage key `verhuisplanner_filters_v1`, value
  `{ tasks: boolean, deliveries: boolean }`, both default `true`.
- `subscribe` (with the cross-tab `storage` event), `getSnapshot` (raw string,
  for `Object.is` stability), `getServerSnapshot` returning `null`.
- A `usePlanFilters()` hook (`useSyncExternalStore`) returning
  `{ showTasks, showDeliveries, toggleTasks, toggleDeliveries }`. Parsing
  tolerates malformed/absent JSON by defaulting both to `true`.

One shared value drives both Tijdlijn and Kalender, per the user's choice to
remember it across reloads.

**UI.** A shared `FilterToggles` component in `src/components/timeline/`,
rendering two checkboxes ("Taken", "Leveringen") styled to match the app. Placed
in each view's header row next to the `Segmented` control and `Legend`. Both
views render it identically.

**Wiring.** Each view derives:

```ts
const shownTasks = showTasks ? tasks : [];
const shownDeliveries = showDeliveries ? deliveries : [];
```

and feeds those into `buildTimeline` (and, in `TimelineView`, into
`TimelineTable`). `buildTimeline` and all drawing code stay untouched.

**Empties & legend:**

- `Legend` reflects only what's shown: pass `hasDeliveries = showDeliveries &&
  deliveryLanes.length > 0`; hide the task-status swatches when `!showTasks`.
- When **both** filters are off, show "Alles is uitgefilterd." instead of the
  existing "Nog niets met een datum…" message. When at least one is on, the
  existing empty logic applies to the shown data.
- `undatedNote` is hidden when tasks are filtered out (its count is meaningless
  then).

### Acceptance

- Unchecking "Taken" removes tasks from the chart, the table, and the legend in
  both views; unchecking "Leveringen" does the same for delivery bars.
- The choice persists across a reload and is the same in Tijdlijn and Kalender.
- With both unchecked, a clear "uitgefilterd" message shows rather than the
  "no dates yet" message.

---

## Out of scope (YAGNI)

- Filtering the Lijst or Bord tabs.
- Per-phase, per-status, or per-assignee filters.
- Threaded replies or reactions on delivery comments.
