// PigmentDev Tweee — address-bar page action for X
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
  const hosted = (appUrl || "").trim();
  // Firefox can't open file:// from an extension, so fall back to the bundled copy.
  const wantsBuiltin = useBuiltin !== false || !hosted || /^file:/i.test(hosted);
  const base = wantsBuiltin ? browser.runtime.getURL("tweee.html") : hosted;

  let target = base;
  if (SUPPORTED.test(tab.url)) {
    const sep = base.includes("?") ? "&" : "?";
    target = base + sep + "url=" + encodeURIComponent(tab.url);
  }
  browser.tabs.create({ url: target });
});
