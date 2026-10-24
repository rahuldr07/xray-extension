// The HUD SQL options: "Show SQL client inside the page HUD" and "Allow saved database connections
// in the page HUD". They live in a key the service worker owns (background/sql-manager.js,
// `sql_hud_options`, Ruling M3-R28): every surface reads them through the worker, and only an
// extension page that is not inside a web tab may change them. The in-page panel shows a link to
// the options page instead of the toggles.

import { useEffect, useState } from 'react';

export const SQL_HUD_OPTIONS_KEY = 'sql_hud_options';
export const SQL_HUD_OPTIONS_GET = 'xray:sql-hud-options:get';
export const SQL_HUD_OPTIONS_SET = 'xray:sql-hud-options:set';

export interface SqlHudOptions {
  sqlInlineInHud: boolean;
  sqlDatabasesInHud: boolean;
}

export const DEFAULT_SQL_HUD_OPTIONS: SqlHudOptions = { sqlInlineInHud: false, sqlDatabasesInHud: false };

/** Saved database connections are allowed in the HUD's inline client only with both options on. */
export function sqlDatabasesInHudActive(options: SqlHudOptions): boolean {
  return options.sqlInlineInHud && options.sqlDatabasesInHud;
}

interface RuntimeLike {
  sendMessage(msg: unknown, callback: (response: unknown) => void): void;
  lastError?: unknown;
}

interface StorageEventsLike {
  addListener(fn: (changes: Record<string, { newValue?: unknown }>, area: string) => void): void;
  removeListener(fn: (changes: Record<string, { newValue?: unknown }>, area: string) => void): void;
}

function runtime(): RuntimeLike | undefined {
  const c = (globalThis as { chrome?: { runtime?: RuntimeLike } }).chrome;
  return c?.runtime?.sendMessage ? c.runtime : undefined;
}

function storageEvents(): StorageEventsLike | undefined {
  return (globalThis as { chrome?: { storage?: { onChanged?: StorageEventsLike } } }).chrome?.storage?.onChanged;
}

export function cleanSqlHudOptions(raw: unknown): SqlHudOptions {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return { sqlInlineInHud: o.sqlInlineInHud === true, sqlDatabasesInHud: o.sqlDatabasesInHud === true };
}

function send(msg: unknown): Promise<{ ok?: unknown; value?: unknown; error?: unknown }> {
  const rt = runtime();
  if (!rt) return Promise.reject(new Error('The extension runtime is not available.'));
  return new Promise((resolve, reject) => {
    try {
      rt.sendMessage(msg, (response) => {
        if (rt.lastError || !response || typeof response !== 'object') {
          reject(new Error('The service worker did not answer.'));
          return;
        }
        resolve(response as { ok?: unknown; value?: unknown; error?: unknown });
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}

/** The current options; both off when the worker cannot be asked. */
export async function readSqlHudOptions(): Promise<SqlHudOptions> {
  try {
    const res = await send({ type: SQL_HUD_OPTIONS_GET });
    return res.ok === true ? cleanSqlHudOptions(res.value) : DEFAULT_SQL_HUD_OPTIONS;
  } catch {
    return DEFAULT_SQL_HUD_OPTIONS;
  }
}

/** Changes the options; rejects with the worker's refusal (the in-page panel may not). */
export async function writeSqlHudOptions(patch: Partial<SqlHudOptions>): Promise<SqlHudOptions> {
  const res = await send({ type: SQL_HUD_OPTIONS_SET, options: patch });
  if (res.ok !== true) throw new Error(typeof res.error === 'string' ? res.error : 'The setting could not be changed.');
  return cleanSqlHudOptions(res.value);
}

/** The options, kept current as the worker's key changes. Both off until the first answer. */
export function useSqlHudOptions(): SqlHudOptions {
  const [options, setOptions] = useState<SqlHudOptions>(DEFAULT_SQL_HUD_OPTIONS);
  useEffect(() => {
    let live = true;
    void readSqlHudOptions().then((value) => {
      if (live) setOptions(value);
    });
    const events = storageEvents();
    const onChanged = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area === 'local' && changes[SQL_HUD_OPTIONS_KEY]) setOptions(cleanSqlHudOptions(changes[SQL_HUD_OPTIONS_KEY].newValue));
    };
    events?.addListener(onChanged);
    return () => {
      live = false;
      events?.removeListener(onChanged);
    };
  }, []);
  return options;
}
