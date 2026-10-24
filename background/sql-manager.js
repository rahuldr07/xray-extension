// background/sql-manager.js — the SQL client's connection manager (service worker).
//
// Loaded by background.js with importScripts. It owns three things the SQL page
// (sql.html) must never hold itself:
//   - connection profiles and their passwords (C-12: secrets stay in the SW).
//     Profiles live in chrome.storage.local under `sql_connections`; a password
//     the user chose not to save lives in chrome.storage.session under
//     `sql_session_secrets`. The page refers to profiles by id only.
//   - the one connectNative port to the xray-db-helper (`com.xray.db_helper`),
//     opened lazily, greeted with `hello`, and shared by every page.
//   - the `xray-sql` runtime ports, one per open sql.html, each validated (C-9).
//
// Page → SW: { id, op, ... }. SW → page: { id, ok, value | error }, exactly once
// per request. Page ids are remapped to native ids so two pages cannot collide,
// and the helper's `columns`/`rows` stream messages are assembled here into one
// QueryResult, so the page API stays promise-based.
//
// Every Chrome API arrives through `deps`, so tests run this file under Node.

(function () {
  'use strict';

  const HOST_NAME = 'com.xray.db_helper';
  const PROTOCOL_VERSION = 1;
  const PROFILES_KEY = 'sql_connections';
  // The panel's stored preferences (REACT_PANEL_PREFERENCES_KEY behind shared/store.js's xray_
  // prefix): the HUD options live there.
  const PANEL_PREFERENCES_KEY = 'xray_react_panel_preferences';
  const SESSION_SECRETS_KEY = 'sql_session_secrets';
  const ENGINES = ['postgres', 'mysql'];
  const TLS_MODES = ['require', 'verify-full', 'disable'];

  const ERR = {
    missing: { code: 'helper-missing', message: 'Install the XRAY database helper.' },
    permission: { code: 'helper-missing', message: 'Allow XRAY to use the database helper.', detail: 'no-permission' },
    outdated: { code: 'helper-outdated', message: 'Update the XRAY database helper.' },
    lost: { code: 'connection-lost', message: 'The connection to the database helper was lost.' },
    timeout: { code: 'timeout', message: 'The database helper did not answer in time.' },
    tooLarge: { code: 'limit-reached', message: 'Result too large; lower the row limit.' },
    cancelled: { code: 'cancelled', message: 'Query cancelled.' },
    framed: { code: 'server', message: 'Database connections open in the XRAY window, not inside a web page.' },
  };

  // Ruling M3-R19: nothing the page awaits may hang on a silent helper.
  // execute and fetchMore have no limit: a long query is the user's to cancel.
  const HELLO_TIMEOUT_MS = 5000;
  const REQUEST_TIMEOUT_MS = { connect: 15000, introspect: 30000, cancel: 5000, close: 5000, closeTab: 5000 };
  // A page message must fit Chrome's port limit (64 MiB of JSON); an assembled
  // result past this is cancelled instead of failing to post (final review I3).
  const RESULT_BYTE_LIMIT = 32 * 1024 * 1024;
  // Bounds the per-page sets of early cancels and recently answered ids.
  const RECENT_IDS_CAP = 32;
  // Ops a sql.html framed inside a web page may not use: saved connections
  // and the helper stay in the extension's own pages (final review I6).
  const WINDOW_ONLY_OPS = new Set(['profiles.list', 'profiles.save', 'profiles.delete', 'profiles.test', 'connect', 'helper.status']);
  // Ruling M3-R23: with no sql.html connected and no open session, the helper
  // process is stopped after this long; the next call starts it again.
  const IDLE_DISCONNECT_MS = 30000;

  function badRequest(message) {
    return { code: 'bad-request', message };
  }

  // A page request failed: carries a SqlError-shaped body to the page.
  class OpError extends Error {
    constructor(body) {
      super(body.message);
      this.body = body;
    }
  }

  function isSqlPage(port, runtimeId) {
    const sender = port && port.sender;
    if (!sender || sender.id !== runtimeId || typeof sender.url !== 'string') return false;
    try {
      const url = new URL(sender.url);
      // Any host: with use_dynamic_url the extension's origin is not its id.
      return url.protocol === 'chrome-extension:' && url.pathname === '/sql.html';
    } catch {
      return false;
    }
  }

  // The opt-in inline HUD frames sql.html inside the inspected web page: then
  // sender.tab is that page. The client's own tab, the pop-out window's frame
  // (chrome-extension: tab URLs) and DevTools (no tab) are extension pages.
  function framedInWebPage(port) {
    const tab = port && port.sender && port.sender.tab;
    if (!tab) return false;
    if (typeof tab.url !== 'string') return true;
    try {
      return new URL(tab.url).protocol !== 'chrome-extension:';
    } catch {
      return true;
    }
  }

  // Adds id to a bounded insertion-ordered set, dropping the oldest.
  function remember(set, id) {
    set.add(id);
    if (set.size > RECENT_IDS_CAP) set.delete(set.values().next().value);
  }

  function str(v) {
    return typeof v === 'string' ? v : '';
  }

  // Only known fields, with their types enforced. Never a password.
  function cleanProfile(input, id) {
    const port = Number(input.port);
    const timeout = input.statementTimeoutMs;
    const profile = {
      id,
      name: str(input.name).trim(),
      engine: input.engine,
      host: str(input.host).trim(),
      port,
      database: str(input.database),
      user: str(input.user),
      tls: input.tls === undefined ? 'require' : input.tls,
      caFile: str(input.caFile),
      statementTimeoutMs: Number.isInteger(timeout) && timeout > 0 ? timeout : null,
      readOnly: input.readOnly !== false,
    };
    if (!ENGINES.includes(profile.engine)) throw new OpError(badRequest('Unsupported engine.'));
    if (!TLS_MODES.includes(profile.tls)) throw new OpError(badRequest('Unsupported TLS mode.'));
    if (profile.host === '') throw new OpError(badRequest('Host is required.'));
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new OpError(badRequest('Port must be between 1 and 65535.'));
    if (profile.name === '') profile.name = `${profile.database || profile.engine}@${profile.host}`;
    return profile;
  }

  // Ruling M3-R24: a stored password belongs to one server account. It is reused
  // (by a re-save or a Test with a blank password) only while engine, host, port
  // and user all still match; otherwise it could be sent to a different server.
  function sameServer(a, b) {
    return a.engine === b.engine
      && str(a.host).trim().toLowerCase() === str(b.host).trim().toLowerCase()
      && Number(a.port) === Number(b.port)
      && a.user === b.user;
  }

  function pageProfile(stored) {
    const { password, ...rest } = stored;
    return { ...rest, hasSavedPassword: typeof password === 'string' && password !== '' };
  }

  function createSqlManager(deps) {
    const { storageLocal, storageSession, connectNative, permissionsContains, runtimeId } = deps;
    const lastError = typeof deps.lastError === 'function' ? deps.lastError : () => undefined;
    const setTimer = deps.setTimeout;
    const clearTimer = (handle) => {
      if (handle !== undefined) deps.clearTimeout(handle);
    };
    let idCounter = 0;

    // ------------------------------------------------------------- storage
    // Read-modify-write of the two keys is serialized so concurrent saves from
    // two pages cannot drop each other's changes.
    let storageQueue = Promise.resolve();
    function serialized(fn) {
      const run = storageQueue.then(fn, fn);
      storageQueue = run.catch(() => {});
      return run;
    }

    async function readProfiles() {
      const got = await storageLocal.get(PROFILES_KEY);
      const list = got && got[PROFILES_KEY];
      return Array.isArray(list) ? list : [];
    }

    async function readSessionSecrets() {
      const got = await storageSession.get(SESSION_SECRETS_KEY);
      const map = got && got[SESSION_SECRETS_KEY];
      return map && typeof map === 'object' ? map : {};
    }

    // Stores a password the user typed for a connect that succeeded against
    // `server` (the engine, host, port and user it was sent to). Run under
    // serialized(): if the profile was edited to another server meanwhile, the
    // password is not attached to it (M3-R24); the open connection is unaffected.
    async function storeSecret(profileId, password, remember, server) {
      const profiles = await readProfiles();
      const secrets = await readSessionSecrets();
      const stored = profiles.find((p) => p.id === profileId);
      if (!stored) return;
      if (!sameServer(stored, server)) return;
      if (remember) {
        stored.password = password;
        delete secrets[profileId];
      } else {
        delete stored.password;
        secrets[profileId] = password;
      }
      await storageLocal.set({ [PROFILES_KEY]: profiles });
      await storageSession.set({ [SESSION_SECRETS_KEY]: secrets });
    }

    function newProfileId(profiles) {
      const random = globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : null;
      if (random) return random;
      let id;
      do id = `p${deps.now().toString(36)}${(idCounter++).toString(36)}`;
      while (profiles.some((p) => p.id === id));
      return id;
    }

    async function saveProfile(input) {
      if (!input || typeof input !== 'object') throw new OpError(badRequest('A profile is required.'));
      return serialized(async () => {
        const profiles = await readProfiles();
        const secrets = await readSessionSecrets();
        const existing = typeof input.id === 'string' ? profiles.find((p) => p.id === input.id) : undefined;
        if (input.id !== undefined && !existing) throw new OpError(badRequest('Unknown profile.'));
        const id = existing ? existing.id : newProfileId(profiles);
        const profile = cleanProfile(input, id);
        // An omitted or empty password keeps whichever secret exists, but only for
        // the same server account (M3-R24): a changed engine, host, port or user
        // drops it from both stores. It moves only when savePassword says where;
        // without it, it stays where it is.
        const keep = Boolean(existing && sameServer(existing, profile));
        const savedLocally = Boolean(existing && typeof existing.password === 'string' && existing.password !== '');
        const typed = typeof input.password === 'string' && input.password !== '' ? input.password : null;
        const password = typed !== null ? typed : (!keep ? undefined : (savedLocally ? existing.password : secrets[id]));
        const local = typeof input.savePassword === 'boolean' ? input.savePassword : savedLocally;
        delete secrets[id];
        if (typeof password === 'string' && password !== '') {
          if (local) profile.password = password;
          else secrets[id] = password;
        }
        const next = existing ? profiles.map((p) => (p.id === id ? profile : p)) : [...profiles, profile];
        await storageLocal.set({ [PROFILES_KEY]: next });
        await storageSession.set({ [SESSION_SECRETS_KEY]: secrets });
        return pageProfile(profile);
      });
    }

    async function deleteProfile(profileId) {
      if (typeof profileId !== 'string' || profileId === '') throw new OpError(badRequest('A profile id is required.'));
      return serialized(async () => {
        const profiles = await readProfiles();
        const secrets = await readSessionSecrets();
        delete secrets[profileId];
        await storageLocal.set({ [PROFILES_KEY]: profiles.filter((p) => p.id !== profileId) });
        await storageSession.set({ [SESSION_SECRETS_KEY]: secrets });
        return {};
      });
    }

    // Test connection: connects with the given fields (read-only) and closes at
    // once. It never writes sql_connections or sql_session_secrets. With no typed
    // password, an existing profile's stored secret is read (never moved), and
    // only when engine, host, port and user still match the saved profile.
    async function testProfile(msg) {
      const input = msg.profile;
      if (!input || typeof input !== 'object') throw new OpError(badRequest('A profile is required.'));
      const profile = cleanProfile(input, 'test');
      let password = typeof msg.password === 'string' && msg.password !== '' ? msg.password : null;
      const stored = password === null && typeof input.id === 'string'
        ? (await readProfiles()).find((p) => p.id === input.id)
        : undefined;
      // The stored secret only for the server account it was saved for (M3-R24).
      if (stored && sameServer(stored, profile)) {
        if (typeof stored.password === 'string' && stored.password !== '') password = stored.password;
        if (password === null) {
          const secret = (await readSessionSecrets())[input.id];
          if (typeof secret === 'string' && secret !== '') password = secret;
        }
      }
      if (password === null) {
        throw new OpError({ code: 'auth-failed', message: `Enter the password for ${profile.name}.`, detail: 'password-required' });
      }
      const request = {
        engine: profile.engine,
        host: profile.host,
        port: profile.port,
        database: profile.database,
        user: profile.user,
        password,
        tls: profile.tls,
        readOnly: true,
      };
      if (profile.caFile) request.caFile = profile.caFile;
      if (profile.statementTimeoutMs) request.statementTimeoutMs = profile.statementTimeoutMs;
      const value = await callNative('connect', request);
      if (value && typeof value.sessionId === 'string') {
        callNative('close', { sessionId: value.sessionId }).catch(() => {});
      }
      return { serverVersion: value && typeof value.serverVersion === 'string' ? value.serverVersion : '' };
    }

    // -------------------------------------------------------- native port
    let native = null; // { port, ready: Promise<helloValue>, pending: Map<nativeId, call> }
    let nextNativeId = 1;
    const sessions = new Map(); // sessionId -> { owner: pagePort, alive: boolean }
    const pages = new Set(); // connected sql.html pages
    let idleTimer;

    function cancelIdle() {
      clearTimer(idleTimer);
      idleTimer = undefined;
    }

    // Nobody can use the helper: stop it after IDLE_DISCONNECT_MS unless a page comes back.
    function scheduleIdle() {
      cancelIdle();
      if (pages.size > 0 || sessions.size > 0 || !native) return;
      idleTimer = setTimer(() => {
        idleTimer = undefined;
        if (pages.size === 0 && sessions.size === 0 && native) teardown(native, ERR.lost);
      }, IDLE_DISCONNECT_MS);
    }

    // Tears a native connection down: drops the port and rejects the hello and
    // every pending call with `body`. Sessions on it are dead until reconnected.
    function teardown(state, body, { disconnect = true } = {}) {
      if (native === state) native = null;
      if (state.dead) return;
      state.dead = true;
      if (state.helloTimer !== undefined) clearTimer(state.helloTimer);
      if (disconnect && state.port) {
        try {
          state.port.disconnect();
        } catch {
          /* already gone */
        }
      }
      state.rejectHello(new OpError(body));
      const calls = [...state.pending.values()];
      state.pending.clear();
      for (const call of calls) call.reject(new OpError(body));
      for (const s of sessions.values()) s.alive = false;
    }

    function openNative() {
      const state = { port: null, pending: new Map(), helloDone: false, dead: false };
      let resolveHello;
      state.ready = new Promise((resolve, reject) => {
        resolveHello = resolve;
        state.rejectHello = reject;
      });
      state.ready.catch(() => {});
      try {
        state.port = connectNative(HOST_NAME);
      } catch {
        teardown(state, ERR.missing, { disconnect: false });
        return state;
      }
      state.port.onMessage.addListener((msg) => onNativeMessage(state, msg));
      state.port.onDisconnect.addListener(() => {
        const reason = lastError();
        // A missing host is reported whatever the stage; Chrome's exact text.
        const body = /not found/i.test(String(reason || '')) || !state.helloDone ? ERR.missing : ERR.lost;
        teardown(state, body, { disconnect: false });
      });
      const helloId = nextNativeId++;
      state.pending.set(helloId, {
        op: 'hello',
        // An `ok:false` hello arrives here as null: an old helper (Ruling M3-R19 M2).
        resolve: (value) => {
          state.helloDone = true;
          clearTimer(state.helloTimer);
          if (!value || value.protocolVersion !== PROTOCOL_VERSION) {
            // An old process keeps running the old binary: drop it so the
            // next call (a Retry after updating) starts the new one.
            const err = new OpError(ERR.outdated);
            err.helperVersion = value && typeof value.helperVersion === 'string' ? value.helperVersion : undefined;
            state.rejectHello(err);
            teardown(state, ERR.outdated);
            return;
          }
          resolveHello(value);
        },
        reject: () => {},
      });
      // A helper that never answers hello must not hang every SQL call.
      state.helloTimer = setTimer(() => {
        if (!state.helloDone) teardown(state, ERR.missing);
      }, HELLO_TIMEOUT_MS);
      try {
        state.port.postMessage({ id: helloId, op: 'hello', protocolVersion: PROTOCOL_VERSION });
      } catch {
        teardown(state, ERR.missing, { disconnect: false });
      }
      return state;
    }

    function onNativeMessage(state, msg) {
      if (!msg || typeof msg !== 'object') return;
      const call = state.pending.get(msg.id);
      if (!call) return;
      if (msg.stream === 'columns') {
        call.columns = Array.isArray(msg.columns) ? msg.columns : [];
        return;
      }
      if (msg.stream === 'rows') {
        if (!Array.isArray(msg.rows)) return;
        call.bytes += JSON.stringify(msg.rows).length;
        if (call.bytes > RESULT_BYTE_LIMIT) {
          // Stop the query and free what was assembled; the helper's late
          // answer to this id then matches nothing.
          state.pending.delete(msg.id);
          call.rows = [];
          callNative('cancel', { queryId: msg.id }).catch(() => {});
          call.reject(new OpError(ERR.tooLarge));
          return;
        }
        for (const row of msg.rows) call.rows.push(row);
        return;
      }
      state.pending.delete(msg.id);
      if (msg.ok === true) call.resolve(msg.value);
      else if (call.op === 'hello') call.resolve(null);
      else call.reject(new OpError(normalizeHelperError(msg.error)));
    }

    function normalizeHelperError(error) {
      if (!error || typeof error !== 'object' || typeof error.code !== 'string') {
        return { code: 'internal', message: 'Internal helper error.' };
      }
      const body = { code: error.code, message: typeof error.message === 'string' ? error.message : '' };
      for (const key of ['sqlState', 'position', 'hint', 'detail']) {
        if (error[key] !== undefined) body[key] = error[key];
      }
      return body;
    }

    async function ensureNative() {
      if (!(await permissionsContains('nativeMessaging'))) throw new OpError(ERR.permission);
      if (!native || native.dead) native = openNative();
      const state = native;
      const hello = await state.ready;
      return { state, hello };
    }

    // Sends one request; `track` receives the native id (for cancel).
    async function callNative(op, payload, track) {
      const { state } = await ensureNative();
      const id = nextNativeId++;
      return new Promise((resolve, reject) => {
        let timer;
        const call = { op, columns: [], rows: [], bytes: 0 };
        call.resolve = (value) => {
          clearTimer(timer);
          if (op === 'execute' || op === 'fetchMore') {
            resolve({ columns: call.columns, rows: call.rows, ...queryFields(value) });
          } else {
            resolve(value);
          }
        };
        call.reject = (err) => {
          clearTimer(timer);
          reject(err);
        };
        state.pending.set(id, call);
        if (track) track(id);
        const limit = REQUEST_TIMEOUT_MS[op];
        if (limit !== undefined) {
          timer = setTimer(() => {
            if (state.pending.get(id) !== call) return;
            if (op === 'cancel' || op === 'close') {
              // A helper that cannot even cancel or close is wedged.
              teardown(state, ERR.lost);
              return;
            }
            state.pending.delete(id);
            if (op === 'connect') {
              // A late success would leave a session nobody owns: close it.
              state.pending.set(id, {
                op,
                resolve: (value) => {
                  if (value && typeof value.sessionId === 'string') {
                    callNative('close', { sessionId: value.sessionId }).catch(() => {});
                  }
                },
                reject: () => {},
              });
            }
            reject(new OpError(ERR.timeout));
          }, limit);
        }
        try {
          state.port.postMessage({ id, op, ...payload });
        } catch {
          state.pending.delete(id);
          call.reject(new OpError(ERR.lost));
        }
      });
    }

    function queryFields(v) {
      const value = v && typeof v === 'object' ? v : {};
      return {
        rowCount: value.rowCount,
        affected: value.affected === undefined ? null : value.affected,
        durationMs: value.durationMs,
        notices: Array.isArray(value.notices) ? value.notices : [],
        hasMore: value.hasMore === true,
        truncatedCells: value.truncatedCells || 0,
        inTransaction: value.inTransaction === true,
      };
    }

    async function helperStatus() {
      if (!(await permissionsContains('nativeMessaging'))) return { state: 'no-permission' };
      try {
        const { hello } = await ensureNative();
        return { state: 'ready', helperVersion: hello.helperVersion };
      } catch (err) {
        const code = err && err.body && err.body.code;
        if (code === 'helper-outdated') {
          return err.helperVersion ? { state: 'outdated', helperVersion: err.helperVersion } : { state: 'outdated' };
        }
        if (err && err.body && err.body.detail === 'no-permission') return { state: 'no-permission' };
        return { state: 'missing' };
      }
    }

    // ---------------------------------------------------------- page ops
    async function connect(page, msg) {
      if (typeof msg.profileId !== 'string') throw new OpError(badRequest('A profile id is required.'));
      const profiles = await readProfiles();
      const profile = profiles.find((p) => p.id === msg.profileId);
      if (!profile) throw new OpError(badRequest('Unknown profile.'));
      const supplied = typeof msg.password === 'string' && msg.password !== '' ? msg.password : null;
      let password = supplied;
      if (password === null) password = typeof profile.password === 'string' && profile.password !== '' ? profile.password : null;
      if (password === null) {
        const secret = (await readSessionSecrets())[profile.id];
        password = typeof secret === 'string' && secret !== '' ? secret : null;
      }
      if (password === null) {
        throw new OpError({ code: 'auth-failed', message: `Enter the password for ${profile.name}.`, detail: 'password-required' });
      }
      const request = {
        engine: profile.engine,
        host: profile.host,
        port: profile.port,
        database: profile.database,
        user: profile.user,
        password,
        tls: profile.tls,
        readOnly: typeof msg.readOnly === 'boolean' ? msg.readOnly : profile.readOnly !== false,
      };
      if (profile.caFile) request.caFile = profile.caFile;
      if (Number.isInteger(profile.statementTimeoutMs) && profile.statementTimeoutMs > 0) {
        request.statementTimeoutMs = profile.statementTimeoutMs;
      }
      const value = await callNative('connect', request);
      if (page.closed) {
        // Nobody is left to use or close this session (Ruling M3-R19 M4).
        if (value && typeof value.sessionId === 'string') {
          callNative('close', { sessionId: value.sessionId }).catch(() => {});
        }
        return {};
      }
      if (supplied !== null) await serialized(() => storeSecret(profile.id, supplied, msg.remember === true, request));
      if (value && typeof value.sessionId === 'string') sessions.set(value.sessionId, { owner: page.port, alive: true });
      return { sessionId: value.sessionId, serverVersion: value.serverVersion, capabilities: value.capabilities };
    }

    // A session is usable only by the page that opened it, and only until the
    // helper connection it lives on is lost.
    function ownedSession(page, sessionId) {
      const s = typeof sessionId === 'string' ? sessions.get(sessionId) : undefined;
      if (!s || s.owner !== page.port || !s.alive) throw new OpError(ERR.lost);
      return sessionId;
    }

    async function runQuery(page, msg, op, payload) {
      const call = callNative(op, payload, (nativeId) => {
        page.queries.set(msg.id, nativeId);
        // Stop came while this query waited for the helper port (final review m7).
        if (page.earlyCancels.delete(msg.id)) callNative('cancel', { queryId: nativeId }).catch(() => {});
      });
      try {
        return await call;
      } finally {
        page.queries.delete(msg.id);
      }
    }

    // Ruling M3-R27: the framed client may use saved connections only while the user has turned on
    // both "Show SQL client inside the page HUD" and "Allow saved database connections in the page
    // HUD". Read once per port connect, so a change applies from the client's next load.
    async function framedDatabasesAllowed() {
      try {
        const got = await storageLocal.get(PANEL_PREFERENCES_KEY);
        const settings = got && got[PANEL_PREFERENCES_KEY] && got[PANEL_PREFERENCES_KEY].settings;
        return Boolean(settings && settings.sqlInlineInHud === true && settings.sqlDatabasesInHud === true);
      } catch {
        return false;
      }
    }

    async function dispatch(page, msg) {
      if (page.framed && WINDOW_ONLY_OPS.has(msg.op) && !(await page.databasesAllowed)) throw new OpError(ERR.framed);
      switch (msg.op) {
        case 'profiles.list':
          return (await readProfiles()).map(pageProfile);
        case 'profiles.save':
          return saveProfile(msg.profile);
        case 'profiles.delete':
          return deleteProfile(msg.profileId);
        case 'profiles.test':
          return testProfile(msg);
        case 'helper.status':
          return helperStatus();
        case 'connect':
          return connect(page, msg);
        case 'introspect':
          return callNative('introspect', { sessionId: ownedSession(page, msg.sessionId) });
        case 'execute': {
          const sessionId = ownedSession(page, msg.sessionId);
          const payload = { sessionId, tabId: str(msg.tabId), sql: str(msg.sql) };
          if (Number.isInteger(msg.maxRows) && msg.maxRows > 0) payload.maxRows = msg.maxRows;
          return runQuery(page, msg, 'execute', payload);
        }
        case 'fetchMore': {
          const sessionId = ownedSession(page, msg.sessionId);
          const payload = { sessionId, tabId: str(msg.tabId) };
          if (Number.isInteger(msg.n) && msg.n > 0) payload.n = msg.n;
          return runQuery(page, msg, 'fetchMore', payload);
        }
        case 'cancel': {
          const nativeId = page.queries.get(msg.queryId);
          if (nativeId !== undefined) {
            if (native) await callNative('cancel', { queryId: nativeId });
            return {};
          }
          if (!page.inflight.has(msg.queryId)) return {}; // already answered
          if (page.refused.has(msg.queryId)) {
            // Finished here, but its answer never reached the page (the port
            // refused it): settle the page's request now.
            settle(page, { id: msg.queryId, ok: false, error: { ...ERR.cancelled } });
          } else {
            // Not yet sent to the helper: it is cancelled as soon as it is.
            remember(page.earlyCancels, msg.queryId);
          }
          return {};
        }
        case 'closeTab': {
          const s = typeof msg.sessionId === 'string' ? sessions.get(msg.sessionId) : undefined;
          if (!s || s.owner !== page.port || !s.alive || !native) return {};
          await callNative('closeTab', { sessionId: msg.sessionId, tabId: str(msg.tabId) });
          return {};
        }
        case 'close': {
          const s = typeof msg.sessionId === 'string' ? sessions.get(msg.sessionId) : undefined;
          if (!s || s.owner !== page.port) return {};
          sessions.delete(msg.sessionId);
          if (s.alive && native) await callNative('close', { sessionId: msg.sessionId });
          return {};
        }
        default:
          throw new OpError(badRequest('Unknown operation.'));
      }
    }

    function post(page, message) {
      try {
        page.port.postMessage(message);
        return true;
      } catch {
        return false;
      }
    }

    // Answers a page request once. A reply the port refuses (in practice a
    // message over Chrome's size limit) is replaced by a small error, so the
    // page is not left waiting; if even that fails, a later Stop settles it.
    function settle(page, message) {
      if (page.closed || !page.inflight.has(message.id)) return;
      if (post(page, message) || (message.ok && post(page, { id: message.id, ok: false, error: { ...ERR.tooLarge } }))) {
        page.inflight.delete(message.id);
        page.refused.delete(message.id);
        return;
      }
      page.refused.add(message.id);
    }

    function onPageMessage(page, msg) {
      if (!msg || typeof msg !== 'object') return;
      const id = msg.id;
      if (typeof id !== 'number' && typeof id !== 'string') return;
      if (typeof msg.op !== 'string') return;
      page.inflight.add(id);
      Promise.resolve()
        .then(() => dispatch(page, msg))
        .then(
          (value) => settle(page, { id, ok: true, value: value === undefined ? {} : value }),
          (err) => {
            const body = err instanceof OpError ? err.body : { code: 'internal', message: 'Internal error.' };
            settle(page, { id, ok: false, error: { ...body } });
          },
        );
    }

    function onPageGone(page) {
      page.closed = true;
      pages.delete(page);
      if (native) {
        for (const nativeId of page.queries.values()) callNative('cancel', { queryId: nativeId }).catch(() => {});
      }
      for (const [sessionId, s] of sessions) {
        if (s.owner !== page.port) continue;
        sessions.delete(sessionId);
        if (s.alive && native) callNative('close', { sessionId }).catch(() => {});
      }
      page.queries.clear();
      scheduleIdle();
    }

    function handlePort(port) {
      if (!isSqlPage(port, runtimeId)) {
        try {
          port.disconnect();
        } catch {
          /* already gone */
        }
        return;
      }
      // inflight: request ids not yet answered; refused: of those, the ones whose
      // answer the port refused; earlyCancels: Stop before the helper had them.
      const page = {
        port,
        queries: new Map(),
        closed: false,
        framed: framedInWebPage(port),
        databasesAllowed: Promise.resolve(false),
        inflight: new Set(),
        refused: new Set(),
        earlyCancels: new Set(),
      };
      if (page.framed) page.databasesAllowed = framedDatabasesAllowed();
      pages.add(page);
      cancelIdle();
      port.onMessage.addListener((msg) => onPageMessage(page, msg));
      port.onDisconnect.addListener(() => onPageGone(page));
    }

    return { handlePort };
  }

  const api = { createSqlManager };
  globalThis.XRAY_SqlManager = api;
  /* global module */
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
