// shared/decrypt.js — Pluggable decryption hook
//
// USAGE: Replace the body of `decrypt()` with your actual decryption logic.
//
// The interceptor automatically reads the `X-Parse-Token` request header and
// passes it here together with the parsed response JSON. Return the decrypted
// plain object (or throw on failure).
//
// The actual decrypt function is in content/decrypt-bridge.js (MAIN world)
// to avoid CSP violations. This file is just a placeholder for the ISOLATED world.

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
    // The actual decrypt function lives in content/decrypt-bridge.js (MAIN world).
    // This ISOLATED world version is not called directly by the interceptor.
    // If you need to decrypt in ISOLATED world, call the MAIN world version via postMessage.
    return null;
  }

  return { decrypt };
})();
