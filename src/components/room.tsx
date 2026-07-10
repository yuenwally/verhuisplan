'use client';

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from '@liveblocks/react/suspense';
import { useState } from 'react';
import { ROOM_ID } from '@/lib/plan-config';
import { initialStorage } from '@/lib/seed';
import type { ReactNode } from 'react';

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse font-hand text-3xl font-bold">Verhuisplan 📦</div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-cardboard flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-[14px] border-2 border-border bg-card p-6">
        <h1 className="mb-2 font-hand text-3xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

/** Shown when the server has no `LIVEBLOCKS_SECRET_KEY`, before any room is mounted. */
export function MissingKeyNotice() {
  return (
    <Notice title="Nog even instellen 🔧">
      <p className="mb-4 text-sm font-semibold text-secondary-foreground">
        Verhuisplan bewaart alles bij Liveblocks, en die sleutel ontbreekt nog.
      </p>
      <p className="text-[13px] text-ink-faint">
        Zet <code className="font-mono">LIVEBLOCKS_SECRET_KEY</code> in{' '}
        <code className="font-mono">.env.local</code>, haal een sleutel op via
        liveblocks.io/dashboard, en start de server opnieuw.
      </p>
    </Notice>
  );
}

/** Catches a rejected key at runtime, which would otherwise sit on the spinner. */
function RoomGate({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  useErrorListener((incoming) => setError(incoming));

  if (error) {
    return (
      <Notice title="Geen verbinding 🔌">
        <p className="text-sm font-semibold text-secondary-foreground">{error.message}</p>
      </Notice>
    );
  }

  return <ClientSideSuspense fallback={<Loading />}>{children}</ClientSideSuspense>;
}

export function Room({ name, children }: { name: string; children: ReactNode }) {
  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const response = await fetch('/api/liveblocks-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, name }),
        });

        if (!response.ok) {
          const detail = await response.json().catch(() => ({ error: response.statusText }));

          throw new Error(detail.error ?? `Kon niet inloggen (${response.status})`);
        }

        return await response.json();
      }}
    >
      <RoomProvider
        id={ROOM_ID}
        initialPresence={{ cursor: null, typingPhase: null, typingText: '' }}
        initialStorage={initialStorage}
      >
        <RoomGate>{children}</RoomGate>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
