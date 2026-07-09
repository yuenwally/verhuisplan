import type { ActivityEntry, Cost, KnownUser, Question, Task } from '@/lib/types';
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
