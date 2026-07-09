# Verhuisplan 📦

Het gedeelde werkdocument van Wally & WJ — maar dan leuk.

A realtime moving planner: five phases of tasks, a countdown to the keys, open
questions, cost estimates and an activity feed. Everyone in the room sees each
other's edits and each other's cursors, live.

## Getting started

Persistence, realtime sync and the cursors all run on
[Liveblocks](https://liveblocks.io/dashboard). Create a project there, then:

```bash
cp .env.example .env.local   # paste your secret key into it
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), type a name, and you are in.
Open a second browser window with a different name to see the multiplayer half.

Without a key the app says so on the first screen rather than hanging.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run check` | `tsc --noEmit` then ESLint — run before committing |
| `npm run test` | Vitest unit tests |

## How it fits together

State lives in a single Liveblocks room (`verhuisplan`). `src/liveblocks.config.ts`
types the room's storage, presence and events; `src/hooks/use-plan.ts` holds every
mutation against it. Because the UI renders straight from storage, an insert or
delete animates identically for everyone in the room — no extra machinery.

Tasks are one flat `LiveList`, with `phase` as a field, so drag-reorder is a
`LiveList.move()` — the conflict-free operation — rather than a rewrite of an array.

Identity is just a name in `localStorage`, posted to `/api/liveblocks-auth`, which
mints a token server-side. There are no accounts and no passwords.

The design comes from `docs/Verhuisplanner.html`; the spec that turned it into this
app is in `docs/superpowers/specs/`.
