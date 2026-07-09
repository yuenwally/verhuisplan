/**
 * A task used to carry a single `who` string: a name, or `Samen`, or `n.t.b.`.
 * It now carries a list of names, and nobody assigned is simply an empty list.
 *
 * Rooms created before that change still hold the old shape in Liveblocks
 * storage, so every read goes through here. `Samen` meant Wally and WJ together,
 * which is exactly a two-name list.
 */
export function normalizeWho(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((name): name is string => typeof name === 'string' && name.length > 0);
  }

  if (typeof value !== 'string' || !value || value === 'n.t.b.') {
    return [];
  }

  if (value === 'Samen') {
    return ['Wally', 'WJ'];
  }

  return [value];
}

/**
 * Keeps the avatars in a stable order no matter what order people were ticked,
 * so a task does not reshuffle its faces as it is edited. Names the room does
 * not know about sort last, alphabetically.
 */
export function sortAssignees(assignees: readonly string[], order: readonly string[]): string[] {
  return [...assignees].sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    }

    if (indexA === -1) {
      return 1;
    }

    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  });
}

export function toggleAssignee(assignees: readonly string[], name: string): string[] {
  return assignees.includes(name)
    ? assignees.filter((entry) => entry !== name)
    : [...assignees, name];
}
