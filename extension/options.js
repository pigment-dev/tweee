const urlEl = document.getElementById("appUrl");
const modeEls = () => Array.from(document.querySelectorAll('input[name="mode"]'));

function syncDisabled() {
  const hosted = document.querySelector('input[name="mode"]:checked')?.value === "hosted";
  urlEl.disabled = !hosted;
}

browser.storage.local.get(["appUrl", "useBuiltin"]).then(({ appUrl, useBuiltin }) => {
  if (appUrl) urlEl.value = appUrl;
  // Default to built-in unless the user previously saved a hosted URL with useBuiltin === false.
  const builtin = useBuiltin !== false || !appUrl;
  document.querySelector(`input[name="mode"][value="${builtin ? "builtin" : "hosted"}"]`).checked = true;
  syncDisabled();
});

modeEls().forEach(el => el.addEventListener("change", syncDisabled));

document.getElementById("save").onclick = async () => {
  const useBuiltin = document.querySelector('input[name="mode"]:checked').value === "builtin";
  await browser.storage.local.set({ appUrl: urlEl.value.trim(), useBuiltin });
  const m = document.getElementById("msg");
  m.textContent = "Saved ✓";
  setTimeout(() => (m.textContent = ""), 1500);
};
