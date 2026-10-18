// Bridge to the MAIN-world console-capture object store. Logged objects arrive as
// lightweight previews; the entry's objectRefs (with objectRefArgs, the argument each
// belongs to) fetch the full object lazily, in the typed log model (spec J7), so large
// logs never bloat the captured stream.

interface LogObjectWindow {
  __XRAY_fetchLogObject__?(refId: string): Promise<unknown>;
  __XRAY_getLogObject__?(refId: string): unknown;
}

export function canFetchLogObjects(): boolean {
  const w = window as unknown as LogObjectWindow;
  return typeof w.__XRAY_fetchLogObject__ === 'function' || typeof w.__XRAY_getLogObject__ === 'function';
}

// Resolve a ref to its full object. Works from the ISOLATED content-script panel
// (async postMessage bridge) and from the MAIN-world HUD (direct store access).
export async function fetchLogObject(refId: string): Promise<unknown> {
  const w = window as unknown as LogObjectWindow;
  try {
    if (typeof w.__XRAY_fetchLogObject__ === 'function') {
      return await w.__XRAY_fetchLogObject__(refId);
    }
    if (typeof w.__XRAY_getLogObject__ === 'function') {
      return w.__XRAY_getLogObject__(refId);
    }
  } catch {
    return null;
  }
  return null;
}
