// Works in Firefox (browser.*) and Chrome (chrome.*), both promise-based.
const ext = (typeof browser !== "undefined" && browser.storage) ? browser : chrome;
const DEFAULT_URL = "https://pigment-dev.github.io/tweee/";

const urlEl = document.getElementById("appUrl");
const modeEls = () => Array.from(document.querySelectorAll('input[name="mode"]'));

function syncDisabled() {
  const hosted = document.querySelector('input[name="mode"]:checked')?.value === "hosted";
  urlEl.disabled = !hosted;
}

ext.storage.local.get(["appUrl", "useBuiltin"]).then(({ appUrl, useBuiltin }) => {
  urlEl.value = appUrl || DEFAULT_URL;
  // Default to the hosted app; built-in only when the user explicitly chose it.
  const builtin = useBuiltin === true;
  document.querySelector(`input[name="mode"][value="${builtin ? "builtin" : "hosted"}"]`).checked = true;
  syncDisabled();
});

modeEls().forEach(el => el.addEventListener("change", syncDisabled));

document.getElementById("save").onclick = async () => {
  const useBuiltin = document.querySelector('input[name="mode"]:checked').value === "builtin";
  await ext.storage.local.set({ appUrl: urlEl.value.trim() || DEFAULT_URL, useBuiltin });
  const m = document.getElementById("msg");
  m.textContent = "Saved ✓";
  setTimeout(() => (m.textContent = ""), 1500);
};
