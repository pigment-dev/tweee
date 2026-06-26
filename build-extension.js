// Builds the extension's bundled copy of Tweee.
// The standalone tweee.html is a single self-contained file (inline <script>), but a
// Firefox extension page is served under CSP `script-src 'self'`, which blocks inline
// scripts. So for the extension we externalize the app script into tweee-app.js and
// reference it from tweee.html — everything else (styles, data URIs) is CSP-allowed.
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

fs.writeFileSync(path.join(root, "extension", "tweee-app.js"), appJs);
fs.writeFileSync(path.join(root, "extension", "tweee.html"), html);
console.log("Wrote extension/tweee.html (external script) + extension/tweee-app.js (" + appJs.length + " bytes)");
