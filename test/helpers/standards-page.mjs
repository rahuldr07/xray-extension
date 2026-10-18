// E2E fixtures load their page in standards mode, as every real surface does (window.html,
// devtools/devtools-panel.html and settings/settings.html all declare <!doctype html>). Without
// it Chromium renders the fixture in quirks mode, where tables reset colour and font size and
// sizing rules differ, so font, width and table checks would measure the wrong rules. Every
// fixture calls page.setContent through this helper; a test that means to probe a quirks-mode
// host page calls page.setContent directly and says so.
export const STANDARDS_DOCTYPE = '<!doctype html>';

export function setStandardsContent(page, html, options) {
  return page.setContent(STANDARDS_DOCTYPE + html, options);
}
