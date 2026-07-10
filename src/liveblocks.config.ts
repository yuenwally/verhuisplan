import type { ActivityEntry, Cost, Delivery, KnownUser, Question, Task } from '@/lib/types';
import type { LiveList, LiveObject } from '@liveblocks/client';

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      /** Which phase's add-input this person is typing into, if any. */
      typingPhase: number | null;
      typingText: string;
    };

    Storage: {
      tasks: LiveList<LiveObject<Task>>;
      questions: LiveList<LiveObject<Question>>;
      costs: LiveList<LiveObject<Cost>>;
      activity: LiveList<LiveObject<ActivityEntry>>;
      users: LiveList<LiveObject<KnownUser>>;
      /**
       * Added after the room existed, so it is absent from older storage. Read it
       * through `useDeliveries`, which tolerates `undefined` until the migration
       * in `useEnsureDeliveries` has run.
       */
      deliveries: LiveList<LiveObject<Delivery>>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    /** Pulses a row in the actor's colour when they change it. */
    RoomEvent: {
      type: 'flash';
      targetId: string;
      color: string;
    };
  }
}

export {};
