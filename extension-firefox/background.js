// PigmentDev Tweee — address-bar page action for X
const DEFAULT_URL = "https://pigment-dev.github.io/tweee/";
const SUPPORTED = /^https?:\/\/(x\.com|twitter\.com)\/(?:[^\/?#]+\/(?:status|article)\/\d+|i\/article\/)/i;
const ON_SITE   = /^https?:\/\/(x\.com|twitter\.com)\//i;

const COLOR = { 48: "icons/icon-color-48.png", 96: "icons/icon-color-96.png" };
const GRAY  = { 48: "icons/icon-gray-48.png",  96: "icons/icon-gray-96.png" };

function update(tab) {
  if (!tab || !tab.id || !tab.url) return;
  if (!ON_SITE.test(tab.url)) { browser.pageAction.hide(tab.id); return; }
  browser.pageAction.show(tab.id);
  const supported = SUPPORTED.test(tab.url);
  browser.pageAction.setIcon({ tabId: tab.id, path: supported ? COLOR : GRAY });
  browser.pageAction.setTitle({
    tabId: tab.id,
    title: supported ? "Open this post in Tweee" : "Tweee — open a tweet or article to enable"
  });
}

browser.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.url || info.status === "complete") update(tab);
});
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  try { update(await browser.tabs.get(tabId)); } catch (e) {}
});

browser.pageAction.onClicked.addListener(async (tab) => {
  const { appUrl, useBuiltin } = await browser.storage.local.get(["appUrl", "useBuiltin"]);
  // Default to the hosted app; use the bundled offline copy only if explicitly chosen
  // (or if a file:// URL was set, which Firefox can't open from an extension).
  const hosted = (appUrl || "").trim() || DEFAULT_URL;
  const wantsBuiltin = useBuiltin === true || /^file:/i.test(hosted);
  const base = wantsBuiltin ? browser.runtime.getURL("tweee.html") : hosted;

  let target = base;
  if (SUPPORTED.test(tab.url)) {
    const sep = base.includes("?") ? "&" : "?";
    target = base + sep + "url=" + encodeURIComponent(tab.url);
  }
  browser.tabs.create({ url: target });
});
