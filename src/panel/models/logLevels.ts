// Level filters shared by the Console and the Logs tab, so both mean the same thing
// by "Warnings" and "Errors".

export type LevelFilter = 'all' | 'log' | 'warn' | 'error' | 'result';
export type LevelBucket = Exclude<LevelFilter, 'all'>;

// Anything with a console-style `type` and `level`: a ConsoleEvent as is, or a
// captured log entry mapped as `{ type: 'log', level: entry.logLevel }`.
export interface LeveledItem {
  type?: string;
  level?: string;
}

// The Logs tab: captured page logs only. Defined on its own (not derived from the
// Console's chips) so a Console change can never move a Logs-tab chip.
export const logLevelFilters: Array<{ id: LevelFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'log', label: 'Logs' },
  { id: 'warn', label: 'Warnings' },
  { id: 'error', label: 'Errors' },
];

export function matchesLevel(item: LeveledItem, filter: LevelFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'error') return item.level === 'error' || item.type === 'error';
  if (filter === 'warn') return item.level === 'warn';
  if (filter === 'result') return item.type === 'result' || item.type === 'command';
  return item.type === 'log' && item.level !== 'warn' && item.level !== 'error';
}

// The one chip an item is counted under (errors win over warnings, and so on).
export function levelBucket(item: LeveledItem): LevelBucket {
  if (matchesLevel(item, 'error')) return 'error';
  if (matchesLevel(item, 'warn')) return 'warn';
  if (matchesLevel(item, 'result')) return 'result';
  return 'log';
}

// The Console's chips (spec S2). They overlap rather than partition: a failed
// command is under My commands and Errors; a page warning under Page logs and
// Warnings. 'mine' is what the user ran (command cells); 'page' is every page log.
export type ConsoleFilter = 'all' | 'mine' | 'page' | 'warn' | 'error';

// Titles say how each count is made: a ×N repeat line is N messages.
const COUNTS_REPEATS = 'Counts every page message, including repeats';
export const consoleLevelFilters: Array<{ id: ConsoleFilter; label: string; title: string }> = [
  { id: 'all', label: 'All', title: `Counts each command once. ${COUNTS_REPEATS}.` },
  { id: 'mine', label: 'My commands', title: 'Counts each command once, with its result' },
  { id: 'page', label: 'Page logs', title: COUNTS_REPEATS },
  { id: 'warn', label: 'Warnings', title: COUNTS_REPEATS },
  { id: 'error', label: 'Errors', title: `${COUNTS_REPEATS}; a failed command counts once` },
];

/** A command or its output (result, error, Cancelled) — part of a command cell. */
export function isCommandItem(item: LeveledItem): boolean {
  return item.type === 'command' || item.type === 'result' || item.type === 'error';
}

export function matchesConsoleFilter(item: LeveledItem, filter: ConsoleFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'mine') return isCommandItem(item);
  if (filter === 'page') return item.type === 'log';
  return matchesLevel(item, filter);
}

/** One stream row's events: a command cell (command + output) or a single page log. */
export type ConsoleUnit = LeveledItem[];

export interface PairableEvent extends LeveledItem {
  id: string;
  commandId?: string;
}

export type PairedEvent<T extends PairableEvent> =
  | { kind: 'cell'; command: T; result?: T }
  | { kind: 'event'; event: T };

// Pair each command with its output (by commandId) at the command's position, so
// page logs that arrive mid-run stay chronological (spec S1). An output whose
// command is gone stays a row of its own.
export function pairConsoleEvents<T extends PairableEvent>(events: T[]): Array<PairedEvent<T>> {
  const commandIds = new Set<string>();
  for (const event of events) if (event.type === 'command') commandIds.add(event.commandId || event.id);
  const outputs = new Map<string, T>();
  for (const event of events) {
    if (isCommandItem(event) && event.type !== 'command' && event.commandId && commandIds.has(event.commandId)) outputs.set(event.commandId, event);
  }
  const out: Array<PairedEvent<T>> = [];
  for (const event of events) {
    if (event.type === 'command') {
      out.push({ kind: 'cell', command: event, result: outputs.get(event.commandId || event.id) });
    } else if (!(event.commandId && outputs.get(event.commandId) === event)) {
      out.push({ kind: 'event', event });
    }
  }
  return out;
}

export function pairedUnit<T extends PairableEvent>(paired: PairedEvent<T>): ConsoleUnit {
  if (paired.kind === 'event') return [paired.event];
  return paired.result ? [paired.command, paired.result] : [paired.command];
}

/** True when any event of the unit (a cell matches by its command or its output) passes. */
export function unitMatchesConsoleFilter(unit: ConsoleUnit, filter: ConsoleFilter): boolean {
  return unit.some((item) => matchesConsoleFilter(item, filter));
}

/**
 * Chip counts over stream units: a command cell counts once (with its result), a
 * failed command once under Errors, and each page log message once (a ×14 repeat
 * line is 14 messages).
 */
export function consoleFilterCounts(units: ConsoleUnit[]): Record<ConsoleFilter, number> {
  const counts: Record<ConsoleFilter, number> = { all: 0, mine: 0, page: 0, warn: 0, error: 0 };
  for (const unit of units) {
    for (const filter of consoleLevelFilters) {
      if (unitMatchesConsoleFilter(unit, filter.id)) counts[filter.id] += 1;
    }
  }
  return counts;
}
