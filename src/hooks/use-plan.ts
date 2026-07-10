'use client';

import { LiveList, LiveObject, nanoid } from '@liveblocks/client';
import { shallow, useMutation, useStorage } from '@liveblocks/react/suspense';
import { normalizeWho, toggleAssignee } from '@/lib/assignees';
import { truncate } from '@/lib/format';
import { ACTIVITY_LIMIT, SEEDED_USERS } from '@/lib/plan-config';
import { moveWithinPhase } from '@/lib/reorder';
import { seedDeliveries } from '@/lib/seed';
import type {
  ActivityEntry,
  Comment,
  Cost,
  Delivery,
  PhaseId,
  Question,
  Task,
} from '@/lib/types';
import type { LiveObject as LiveObjectType, User } from '@liveblocks/client';

type Self = User<Liveblocks['Presence'], Liveblocks['UserMeta']>;
type Root = LiveObjectType<Liveblocks['Storage']>;

/** Newest first, capped — the feed is a glance, not an audit log. */
function pushActivity(storage: Root, self: Self, text: string) {
  const activity = storage.get('activity');

  activity.insert(
    new LiveObject<ActivityEntry>({
      id: nanoid(),
      user: self.info.name,
      avatar: self.info.avatar,
      text,
      ts: Date.now(),
    }),
    0,
  );

  while (activity.length > ACTIVITY_LIMIT) {
    activity.delete(activity.length - 1);
  }
}

function findById<T extends { id: string }>(
  list: LiveList<LiveObjectType<T>>,
  id: string,
): LiveObjectType<T> | undefined {
  return list.find((item) => item.get('id') === id);
}

export function useTasks() {
  return useStorage((root) => root.tasks);
}

export function useQuestions() {
  return useStorage((root) => root.questions);
}

export function useCosts() {
  return useStorage((root) => root.costs);
}

export function useActivity() {
  return useStorage((root) => root.activity);
}

export function useKnownUsers() {
  return useStorage((root) => root.users);
}

/**
 * Undefined in rooms created before deliveries existed, until `useEnsureStorage`
 * has run. Callers must treat that as "not loaded yet", not as "none".
 */
export function useDeliveries() {
  return useStorage((root) => root.deliveries ?? null);
}

/**
 * Comments for one task, oldest first. Undefined in rooms that predate the key.
 */
export function useTaskComments(taskId: string) {
  return useStorage(
    (root) => (root.comments ?? []).filter((comment) => comment.taskId === taskId),
    shallow,
  );
}

/** How many comments each task carries, so a row can show its icon. */
export function useCommentCounts() {
  return useStorage((root) => {
    const counts: Record<string, number> = {};

    for (const comment of root.comments ?? []) {
      counts[comment.taskId] = (counts[comment.taskId] ?? 0) + 1;
    }

    return counts;
  }, shallow);
}

/**
 * True while any late-added key is still missing.
 *
 * Each key must be checked in its own right. Gating the migration on `deliveries`
 * alone would skip `comments` in a room that had already been given deliveries.
 */
export function useNeedsMigration() {
  return useStorage((root) => root.deliveries === undefined || root.comments === undefined);
}

/**
 * Adds keys that a room created before them does not have. `initialStorage` only
 * applies to a room with no storage at all, so an existing room would otherwise
 * never gain them and every read would come back undefined.
 */
export function useEnsureStorage() {
  return useMutation(({ storage }) => {
    if (storage.get('deliveries') === undefined) {
      storage.set('deliveries', seedDeliveries());
    }

    if (storage.get('comments') === undefined) {
      storage.set('comments', new LiveList<LiveObject<Comment>>([]));
    }
  }, []);
}

export function useAddComment() {
  return useMutation(({ storage, self }, taskId: string, text: string) => {
    const trimmed = text.trim();
    const comments = storage.get('comments');

    if (!trimmed || !comments) {
      return;
    }

    comments.push(
      new LiveObject<Comment>({
        id: nanoid(),
        taskId,
        author: self.info.name,
        avatar: self.info.avatar,
        text: trimmed,
        ts: Date.now(),
      }),
    );

    const task = findById(storage.get('tasks'), taskId);
    pushActivity(storage, self, `reageerde op: “${truncate(task?.get('title') ?? '', 40)}”`);
  }, []);
}

export function useDeleteComment() {
  return useMutation(({ storage }, id: string) => {
    const comments = storage.get('comments');
    const index = comments?.findIndex((comment) => comment.get('id') === id) ?? -1;

    if (comments && index >= 0) {
      comments.delete(index);
    }
  }, []);
}

export function useAddDelivery() {
  return useMutation(({ storage }, label: string) => {
    const trimmed = label.trim();

    if (!trimmed) {
      return;
    }

    storage.get('deliveries')?.push(
      new LiveObject<Delivery>({ id: nanoid(), label: trimmed, start: '', end: '' }),
    );
  }, []);
}

export function useSetDeliveryLabel() {
  return useMutation(({ storage }, id: string, label: string) => {
    const deliveries = storage.get('deliveries');

    if (!deliveries) {
      return;
    }

    findById(deliveries, id)?.set('label', label);
  }, []);
}

export function useSetDeliveryDate() {
  return useMutation(({ storage }, id: string, field: 'start' | 'end', value: string) => {
    const deliveries = storage.get('deliveries');

    if (!deliveries) {
      return;
    }

    findById(deliveries, id)?.set(field, value);
  }, []);
}

export function useDeleteDelivery() {
  return useMutation(({ storage }, id: string) => {
    const deliveries = storage.get('deliveries');
    const index = deliveries?.findIndex((delivery) => delivery.get('id') === id) ?? -1;

    if (deliveries && index >= 0) {
      deliveries.delete(index);
    }
  }, []);
}

/** Records the arrival, once, so the activity feed opens with a hello. */
export function useAnnounceArrival() {
  return useMutation(({ storage, self }) => {
    const users = storage.get('users');
    const name = self.info.name;

    if (!users.some((user) => user.get('name').toLowerCase() === name.toLowerCase())) {
      users.push(new LiveObject({ name, avatar: self.info.avatar }));
    }

    pushActivity(storage, self, 'is ingelogd 👋');
  }, []);
}

export function useAddTask() {
  return useMutation(({ storage, self }, phase: PhaseId, title: string) => {
    const trimmed = title.trim();

    if (!trimmed) {
      return;
    }

    storage.get('tasks').push(
      new LiveObject<Task>({
        id: nanoid(),
        phase,
        title: trimmed,
        who: [],
        deadline: '',
        done: false,
        doneBy: '',
      }),
    );

    pushActivity(storage, self, `voegde toe: “${truncate(trimmed, 48)}”`);
  }, []);
}

/**
 * Returns true when this toggle completed the whole phase, so the caller can
 * fire confetti. Returns false otherwise.
 */
export function useToggleTask() {
  return useMutation(({ storage, self }, id: string): boolean => {
    const tasks = storage.get('tasks');
    const task = findById(tasks, id);

    if (!task) {
      return false;
    }

    const done = !task.get('done');
    task.update({ done, doneBy: done ? self.info.name : '' });

    const verb = done ? 'vinkte af' : 'heropende';
    pushActivity(storage, self, `${verb}: “${truncate(task.get('title'), 48)}”`);

    if (!done) {
      return false;
    }

    const phase = task.get('phase');
    const siblings = tasks.filter((entry) => entry.get('phase') === phase);
    const phaseComplete = siblings.every((entry) => entry.get('done'));

    if (phaseComplete) {
      pushActivity(storage, self, `🎉 rondde fase ${phase} af!`);
    }

    return phaseComplete;
  }, []);
}

/** Everyone who could be assigned: the seeded three, then whoever else joined. */
export function useAssignableNames(): string[] {
  const users = useKnownUsers();
  const seeded = SEEDED_USERS.map((user) => user.name);
  const extra = users
    .map((user) => user.name)
    .filter((name) => !seeded.includes(name));

  return [...seeded, ...extra];
}

export function useToggleAssignee() {
  return useMutation(({ storage }, id: string, name: string) => {
    const task = findById(storage.get('tasks'), id);

    if (!task) {
      return;
    }

    task.set('who', toggleAssignee(normalizeWho(task.get('who')), name));
  }, []);
}

export function useSetDeadline() {
  return useMutation(({ storage }, id: string, deadline: string) => {
    findById(storage.get('tasks'), id)?.set('deadline', deadline);
  }, []);
}

export function useDeleteTask() {
  return useMutation(({ storage, self }, id: string) => {
    const tasks = storage.get('tasks');
    const index = tasks.findIndex((task) => task.get('id') === id);

    if (index < 0) {
      return;
    }

    const title = tasks.get(index)?.get('title') ?? '';
    tasks.delete(index);

    // Comments live in a flat list, so they do not go with the task on their own.
    const comments = storage.get('comments');

    if (comments) {
      for (let i = comments.length - 1; i >= 0; i--) {
        if (comments.get(i)?.get('taskId') === id) {
          comments.delete(i);
        }
      }
    }

    pushActivity(storage, self, `verwijderde: “${truncate(title, 40)}”`);
  }, []);
}

export function useMoveTask() {
  return useMutation(({ storage }, dragId: string, targetId: string) => {
    const tasks = storage.get('tasks');
    const flat = tasks.map((task) => ({ id: task.get('id'), phase: task.get('phase') }));
    const move = moveWithinPhase(flat, dragId, targetId);

    if (!move) {
      return;
    }

    tasks.move(move.from, move.to);
  }, []);
}

export function useAddQuestion() {
  return useMutation(({ storage }, text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    storage.get('questions').push(new LiveObject<Question>({
      id: nanoid(),
      text: trimmed,
      done: false,
    }));
  }, []);
}

export function useToggleQuestion() {
  return useMutation(({ storage, self }, id: string) => {
    const question = findById(storage.get('questions'), id);

    if (!question) {
      return;
    }

    const done = !question.get('done');
    question.set('done', done);

    if (done) {
      pushActivity(storage, self, `beantwoordde: “${truncate(question.get('text'), 40)}”`);
    }
  }, []);
}

export function useDeleteQuestion() {
  return useMutation(({ storage }, id: string) => {
    const questions = storage.get('questions');
    const index = questions.findIndex((question) => question.get('id') === id);

    if (index >= 0) {
      questions.delete(index);
    }
  }, []);
}

export function useAddCost() {
  return useMutation(({ storage }, label: string) => {
    const trimmed = label.trim();

    if (!trimmed) {
      return;
    }

    storage.get('costs').push(new LiveObject<Cost>({ id: nanoid(), label: trimmed, amount: '' }));
  }, []);
}

export function useSetAmount() {
  return useMutation(({ storage }, id: string, amount: string) => {
    findById(storage.get('costs'), id)?.set('amount', amount);
  }, []);
}

export function useDeleteCost() {
  return useMutation(({ storage }, id: string) => {
    const costs = storage.get('costs');
    const index = costs.findIndex((cost) => cost.get('id') === id);

    if (index >= 0) {
      costs.delete(index);
    }
  }, []);
}
