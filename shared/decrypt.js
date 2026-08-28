// shared/decrypt.js — Pluggable decryption hook
//
// USAGE: Replace the body of `decrypt()` with your actual decryption logic.
//
// The interceptor automatically reads the `X-Parse-Token` request header and
// passes it here together with the parsed response JSON. Return the decrypted
// plain object (or throw on failure).
//
// This is the ONLY decryption hook. It runs in the ISOLATED world, which is exempt
// from the page's CSP, so the MAIN-world bridge that used to exist for CSP reasons
// (content/decrypt-bridge.js) is deleted — it published a writable page global that a
// page could read, use as an oracle, or replace to feed fabricated plaintext back to
// the analyst marked as successfully decrypted. See C-6 in docs/threat-model.md.
//
// content/content.js calls this for every entry the interceptor marked 'pending'.

window.XRAY_Decrypt = (() => {
  'use strict';

  /**
   * @param {string} token    — value of the X-Parse-Token request header
   * @param {*}      data     — parsed response JSON (could be string / object)
   * @returns {*}             — decrypted plain value
   * @throws on failure
   */
  // Parameter names are the documented contract for anyone replacing this stub, so
  // they stay spelled out even though the placeholder implementation ignores them.
  // eslint-disable-next-line no-unused-vars
  function decrypt(token, data) {
    // ── Plug your decrypt logic here ──────────────────────────────────────
    // Example:
    //   return myDecryptLib.decrypt(token, data);
    //
    // Returning null means "no decryption performed". Throwing marks the entry
    // decryptStatus: 'failed'. Must be synchronous.
    return null;
  }

  return { decrypt };
})();
