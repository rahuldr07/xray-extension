// background.js — Service Worker stub
chrome.action.onClicked.addListener((tab) => {
  console.log('XRAY clicked', tab?.id);
});
