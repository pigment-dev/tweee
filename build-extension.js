// Builds the bundled copy of Tweee for the browser extensions.
// The standalone index.html is a single self-contained file (inline <script>), but an
// extension page is served under CSP `script-src 'self'` (both Firefox MV2 and Chrome MV3),
// which blocks inline scripts. So for the extensions we externalize the app script into
// tweee-app.js and reference it from tweee.html — styles and data URIs are CSP-allowed.
const fs = require("fs");
const path = require("path");

const root = __dirname;
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");

// Match the last inline <script> (no src attribute) — that's the app.
const re = /<script>([\s\S]*?)<\/script>/g;
let m, last = null;
while ((m = re.exec(src))) last = m;
if (!last) { console.error("No inline <script> found"); process.exit(1); }

const appJs = last[1];
const html = src.slice(0, last.index) + '<script src="tweee-app.js"></script>' + src.slice(last.index + last[0].length);

for (const dir of ["extension-firefox", "extension-chrome"]) {
  const out = path.join(root, dir);
  if (!fs.existsSync(out)) continue;
  fs.writeFileSync(path.join(out, "tweee-app.js"), appJs);
  fs.writeFileSync(path.join(out, "tweee.html"), html);
  console.log("Wrote " + dir + "/tweee.html + " + dir + "/tweee-app.js (" + appJs.length + " bytes)");
}
