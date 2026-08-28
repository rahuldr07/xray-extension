// content/decrypt-bridge.js — Decrypt bridge (MAIN world)
// This runs in MAIN world to expose decrypt function without CSP violations.
(function () {
  'use strict';

  if (window.__XRAY_decrypt__) return; // Already installed

  /**
   * Pluggable decrypt function.
   * Replace this with your actual decryption logic.
   * Must be synchronous (no async/await, no Promises).
   * 
   * @param {string} token - Value of X-Parse-Token request header
   * @param {*} data - Parsed response JSON
   * @returns {*} - Decrypted plain value, or null if no decryption
   */
  // Parameter names are the documented contract for anyone replacing this stub, so
  // they stay spelled out even though the default implementation ignores them.
  // eslint-disable-next-line no-unused-vars
  window.__XRAY_decrypt__ = function(token, data) {
    // ── Plug your decrypt logic here ──────────────────────────────────────
    // Example:
    //   return myDecryptLib.decrypt(token, data);
    //
    // Returning null means "no decryption performed"
    return null;
  };
})();
