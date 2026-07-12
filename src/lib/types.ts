export type PhaseId = 1 | 2 | 3 | 4 | 5;

export type Task = {
  id: string;
  phase: PhaseId;
  title: string;
  /**
   * Names of everyone assigned; empty means nobody. Old rooms may still hold a
   * single string here, so read it through `normalizeWho`.
   */
  who: string[];
  /** Empty string, or an ISO `YYYY-MM-DD` date. */
  deadline: string;
  done: boolean;
  doneBy: string;
};

export type Question = {
  id: string;
  text: string;
  done: boolean;
};

/**
 * A delivery or job that occupies a window rather than a day: a bed arriving,
 * tiles being laid. Empty dates mean "not scheduled yet"; such a delivery is
 * listed in the card but cannot be drawn on the timeline.
 */
export type Delivery = {
  id: string;
  label: string;
  /** Empty string, or an ISO `YYYY-MM-DD` date. */
  start: string;
  end: string;
};

export type Cost = {
  id: string;
  label: string;
  /** Free text so a half-typed `1.2` survives a keystroke; parsed on read. */
  amount: string;
};

export type CommentSubjectKind = 'task' | 'delivery';

/**
 * A comment on a subject — a task or a delivery. Kept in a flat list keyed by
 * `subjectId` rather than nested inside the subject, so no per-item shape lives
 * on the 22 tasks (or the deliveries) already in storage. `subjectKind` lets the
 * activity feed name the right thing when one is added.
 */
export type Comment = {
  id: string;
  subjectId: string;
  subjectKind: CommentSubjectKind;
  author: string;
  avatar: string;
  text: string;
  ts: number;
};

export type ActivityEntry = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  ts: number;
};

export type KnownUser = {
  name: string;
  avatar: string;
};

export type CurrentUser = {
  name: string;
  avatar: string;
  color: string;
};
