import { completeMembers, type LiveAnswer } from './consoleBridge';
import { createLiveChannel } from '../models/consoleLive';
import type { DeclaredName, LiveName } from '../models/consoleAssist';

/**
 * What live completion (spec §3 source 4) learned from the page, shared by every Console
 * prompt on this surface and by the error hint: the page globals and declared names (one
 * snapshot, refreshed after each Run and every few seconds while typing), and whether a
 * debugger session answered last time (the attach policy, models/consoleLive.ts).
 */

// The background caches per scope; this copy only saves a message per keystroke.
const GLOBALS_FRESH_MS = 5000;

interface GlobalsSnapshot { names: LiveName[]; declared: DeclaredName[]; at: number; stale: boolean; capped: boolean }

let globals: GlobalsSnapshot | null = null;
let attached = false;
const channel = createLiveChannel();

/** A debugger session answered the last live request. */
export function liveAttached(): boolean {
  return attached;
}

/** The last page globals and declared names, kept (for the error hint) even once stale. */
export function liveGlobals(): { names: LiveName[]; declared: DeclaredName[] } | null {
  return globals ? { names: globals.names, declared: globals.declared } : null;
}

/** Whether the globals need asking again: none yet, a Run since, or older than a few seconds. */
export function liveGlobalsFresh(now = Date.now()): boolean {
  return !!globals && !globals.stale && now - globals.at < GLOBALS_FRESH_MS;
}

/**
 * Whether the globals are the whole, current picture — fresh, no Run since, not capped. Only then
 * may a catalogue guess take Enter (consoleAssist catalogGuess; review Important 1).
 */
export function liveGlobalsKnown(now = Date.now()): boolean {
  return liveGlobalsFresh(now) && !!globals && !globals.capped;
}

/** A Run may declare names or change the page's globals: the next identifier asks again. */
export function markLiveStale(): void {
  if (globals) globals.stale = true;
}

/** Names the did-you-mean hint may offer: declared names, then the page globals. */
export function knownPageNames(): string[] {
  return globals ? [...globals.declared.map((d) => d.name), ...globals.names.map((n) => n.name)] : [];
}

/**
 * Ask the page (`expr` null: its globals). Only the latest request's answer is kept; an older
 * one resolves null. The globals snapshot is updated here.
 */
export async function requestLive(expr: string | null, attach: boolean): Promise<LiveAnswer | null> {
  const answer = await channel.request((id) => completeMembers(expr, id, { attach }));
  if (!answer) return null;
  attached = answer.attached;
  // Freshness counts from the worker's read, not from this receipt (it may serve a cached answer).
  if (expr === null && answer.names) globals = { names: answer.names, declared: answer.declared ?? [], at: Date.now() - (answer.age ?? 0), stale: false, capped: answer.capped === true };
  return answer;
}
