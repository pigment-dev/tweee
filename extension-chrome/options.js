// Works in Firefox (browser.*) and Chrome (chrome.*), both promise-based.
const ext = (typeof browser !== "undefined" && browser.storage) ? browser : chrome;
const DEFAULT_URL = "https://pigment-dev.github.io/tweee/";

const urlEl = document.getElementById("appUrl");

ext.storage.local.get("appUrl").then(({ appUrl }) => {
  urlEl.value = appUrl || DEFAULT_URL;
});

document.getElementById("save").onclick = async () => {
  await ext.storage.local.set({ appUrl: urlEl.value.trim() || DEFAULT_URL });
  const m = document.getElementById("msg");
  m.textContent = "Saved ✓";
  setTimeout(() => (m.textContent = ""), 1500);
};
