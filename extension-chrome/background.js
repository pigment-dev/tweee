// PigmentDev Tweee — Chrome MV3 toolbar action for X
const DEFAULT_URL = "https://pigment-dev.github.io/tweee/";
const SUPPORTED = /^https?:\/\/(x\.com|twitter\.com)\/(?:[^\/?#]+\/(?:status|article)\/\d+|i\/article\/)/i;
const ON_SITE   = /^https?:\/\/(x\.com|twitter\.com)\//i;

const COLOR = { 48: "icons/icon-color-48.png", 96: "icons/icon-color-96.png" };
const GRAY  = { 48: "icons/icon-gray-48.png",  96: "icons/icon-gray-96.png" };

// MV3 has no page_action; emulate it with action.enable/disable + icon swap per tab.
function update(tab) {
  if (!tab || !tab.id || !tab.url) return;
  if (!ON_SITE.test(tab.url)) {
    chrome.action.disable(tab.id);
    chrome.action.setIcon({ tabId: tab.id, path: GRAY });
    return;
  }
  chrome.action.enable(tab.id);
  const supported = SUPPORTED.test(tab.url);
  chrome.action.setIcon({ tabId: tab.id, path: supported ? COLOR : GRAY });
  chrome.action.setTitle({
    tabId: tab.id,
    title: supported ? "Open this post in Tweee" : "Tweee — open a tweet or article to enable"
  });
}

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.url || info.status === "complete") update(tab);
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { update(await chrome.tabs.get(tabId)); } catch (e) {}
});

chrome.action.onClicked.addListener(async (tab) => {
  // Always open the live hosted app (default: the GitHub Pages build), so the extension
  // never needs re-publishing when the app updates.
  const { appUrl } = await chrome.storage.local.get("appUrl");
  const base = (appUrl || "").trim() || DEFAULT_URL;

  let target = base;
  if (SUPPORTED.test(tab.url)) {
    const sep = base.includes("?") ? "&" : "?";
    target = base + sep + "url=" + encodeURIComponent(tab.url);
  }
  chrome.tabs.create({ url: target });
});
