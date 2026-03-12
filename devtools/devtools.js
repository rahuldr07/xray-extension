// devtools/devtools.js — Registers the XRAY panel in Chrome/Edge DevTools
// Phase 4: DevTools panel integration
chrome.devtools.panels.create(
  '⬡ XRAY',
  '/icons/icon16.png',
  '/devtools/devtools-panel.html',
  () => { /* panel created */ }
);
