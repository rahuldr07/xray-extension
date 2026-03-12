// shared/decrypt.js — Pluggable decryption hook
//
// USAGE: Replace the body of `decrypt()` with your actual decryption logic.
//
// The interceptor automatically reads the `X-Parse-Token` request header and
// passes it here together with the parsed response JSON. Return the decrypted
// plain object (or throw on failure).
//
// The function is also exposed in the MAIN world as `window.__XRAY_decrypt__`
// so it can be called synchronously from interceptor.js.

window.XRAY_Decrypt = (() => {
  'use strict';

  /**
   * @param {string} token    — value of the X-Parse-Token request header
   * @param {*}      data     — parsed response JSON (could be string / object)
   * @returns {*}             — decrypted plain value
   * @throws on failure
   */
  function decrypt(token, data) {
    // ── Plug your logic in here ──────────────────────────────────────────────
    // Example (AES via SubtleCrypto is async; for sync use a pure-JS library):
    //
    //   return myLib.decrypt(token, data);
    //
    // Returning null means "no decryption performed" (treated as decrypt:none).
    return null;
  }

  // Expose to MAIN world via a bridge injected as a page script.
  // We write to a well-known global that interceptor.js checks for.
  function _bridgeToMainWorld() {
    const script = document.createElement('script');
    script.textContent = `
      window.__XRAY_decrypt__ = (function() {
        // Bridge: ISOLATED → MAIN world via synchronous storage on window.
        // Replace this with your actual decrypt logic if it is sync.
        return function(token, data) { return null; };
      })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _bridgeToMainWorld, { once: true });
  } else {
    _bridgeToMainWorld();
  }

  return { decrypt };
})();
