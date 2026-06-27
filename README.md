<div align="center">

<img src="./assets/tweee.svg" width="92" alt="Tweee">

# PigmentDev Tweee

**Turn any X / Twitter post into a clean, printable, bilingual reading card.**

Per-line RTL/LTR typesetting · quotes & threads · articles · code blocks · images & video · history · dark mode · export to PDF / HTML / Telegram.

[![License: MIT](https://img.shields.io/badge/License-MIT-1d9bf0.svg)](#license)
![Single file](https://img.shields.io/badge/app-single%20HTML-16a34a.svg)
![Dependencies](https://img.shields.io/badge/dependencies-0-7d8893.svg)
![Firefox](https://img.shields.io/badge/Firefox-extension-orange.svg?logo=firefoxbrowser&logoColor=white)
![Chrome](https://img.shields.io/badge/Chrome-extension-4285F4.svg?logo=googlechrome&logoColor=white)

[Web app](#quick-start) · [iPhone](#use-it-on-iphone) · [Extensions](#browser-extensions) · [Deploy your own](#deploy-it-host-your-own) · [Cloudflare proxy](#cors-proxy-optional)

<br>

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/pigment-dev/tweee)
[![Add to iOS Shortcuts](https://img.shields.io/badge/📲_Add_to-iOS_Shortcuts-0a84ff?style=for-the-badge&logo=apple&logoColor=white)](https://www.icloud.com/shortcuts/0abac3393cad4413b4b28951f20de423)

</div>

---

Tweee is a single self-contained HTML file. No build step, no backend, no tracking. Open it locally or host it anywhere static. It was built to read long Persian/English posts comfortably — each line is detected and typeset in its own direction and font.

## Features

- **Per-line bidi typesetting** — each line's direction comes from its first strong character. Persian/Arabic lines render RTL in **Yekan Bakh**; Latin lines render LTR in your chosen serif/sans/mono.
- **Quotes, threads & articles** — quote tweets render as separate nested cards (correct nesting in both LTR and RTL); paste several URLs for a numbered thread; X **Articles** and long "note" posts are fetched in full.
- **Media** — photo grids, inline video/GIF, each with **Download** (with progress bar + cancel) and **Copy URL** buttons.
- **Code blocks** — ` ``` ` fences and inline `` `code` `` rendered LTR in monospace with a copy button.
- **Reading controls** — light/dark/auto theme, 5 card backgrounds, a large serif/sans/mono font set, Persian font, size, line height.
- **History** — every fetch is saved (searchable, individually removable, clear-all). **Incognito mode** (ghost icon) pauses saving.
- **Export** — **Print** (to PDF), **Download HTML** (self-contained, optional base64-embedded media), or **Send to Telegram** via your own bot (with optional Telegram-only proxy).
- **Proxies** — add several CORS Workers and **rotate** them (failover / round-robin / random); the same Worker also unblocks media downloads.
- **Settings** persist in `localStorage`, and sync via **export/import**, a **shareable link**, or a **`config.json`** for self-hosted instances.

> [!TIP]
> Works fully client-side. If a fetch is blocked, open **Paste manually** and paste the text — typesetting, fonts and export still work.

## Quick start

```bash
# Just open it
open index.html

# Or host it (GitHub Pages, Cloudflare Pages, Netlify, your nginx…)
```

Paste a tweet URL and press **Fetch**. You can also deep-link: `https://pigment-dev.github.io/tweee/?url=<tweet-url>` auto-fetches on load (this is what the extensions and the iPhone shortcut use).

## Use it on iPhone

Any URL handed to Tweee is fetched automatically on load — `https://pigment-dev.github.io/tweee/?url=<tweet-url>` — so you can install it like an app and wire up the Share Sheet.

### Add to Home Screen (web app / PWA)

Open <https://pigment-dev.github.io/tweee/> in **Safari → Share → Add to Home Screen**. It installs with the bird icon and launches full-screen like a native app (iOS web-app meta tags + a 180×180 touch icon are built in). Settings and history persist on that device.

### Share Sheet → Shortcut (one-tap install)

Install the ready-made shortcut, then from the **X app or Safari** tap **Share → Open in Tweee** and the post opens already rendered:

<div align="center">

### ➜ [📲 Add “Open in Tweee” to iOS Shortcuts](https://www.icloud.com/shortcuts/0abac3393cad4413b4b28951f20de423)

[![Add to iOS Shortcuts](https://img.shields.io/badge/📲_Add_to-iOS_Shortcuts-0a84ff?style=for-the-badge&logo=apple&logoColor=white)](https://www.icloud.com/shortcuts/0abac3393cad4413b4b28951f20de423)

</div>

> First time only: open **Shortcuts → Settings → Advanced → Allow Running Scripts**, then tap the link and **Add Shortcut**.

<details><summary>Prefer to build it yourself?</summary>

1. **Shortcuts → +** → name it **"Open in Tweee"**.
2. Tap ⓘ → enable **Show in Share Sheet**, set **Share Sheet Types** to **URLs** (and **Text**).
3. Add **URL Encode** → input = **Shortcut Input**.
4. Add **Text** → `https://pigment-dev.github.io/tweee/?url=` followed by the **URL Encoded** variable.
5. Add **Open URLs** → set it to that **Text**, then **Save**.

</details>

> Using your own deploy? Swap in your URL (for a GitHub **project** page keep the trailing slash — `…/tweee/?url=…`).

## Browser extensions

A companion extension puts a bird on X. It turns **colored** on a supported tweet/article; clicking it opens Tweee with the post pre-loaded. It always loads the **live** hosted app (default <https://pigment-dev.github.io/tweee/>, changeable in options) — so the extension never needs updating when the app changes.

- **Firefox** — install [`tweee-firefox.xpi`](./tweee-firefox.xpi) (or load `extension-firefox/` via `about:debugging`). See [extension-firefox/README.md](./extension-firefox/README.md).
- **Chrome / Edge / Brave** — open `chrome://extensions`, enable **Developer mode**, **Load unpacked** → pick the `extension-chrome/` folder (or unzip [`tweee-chrome.zip`](./tweee-chrome.zip)).

## Deploy it (host your own)

Tweee is one static file, so any static host works. The point of hosting your own copy: set your proxies once and reach the app from anywhere (and from the Firefox extension) instead of relying on someone else's instance or a local file.

### GitHub Pages

1. Fork or create a repo and add **`index.html`** (served automatically at the repo's root URL).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / root, **Save**.
3. After a minute your app is live at `https://<you>.github.io/<repo>/`.
4. *(Recommended)* copy `config.example.json` → **`config.json`**, fill in your proxies, commit it. Now every browser that opens your Pages URL gets your proxies preloaded — see [Settings & persistence](#settings--persistence).

### Netlify / Cloudflare Pages (one click)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/pigment-dev/tweee)

- **Netlify** — the button above imports the repo and publishes it. Or drag the folder onto <https://app.netlify.com/drop>.
- **Cloudflare Pages** — Dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick the repo, leave build command empty, output dir `/`. (Bonus: your CORS Worker can live in the same account.)
- **Vercel** — `vercel` in the folder, or import the repo at <https://vercel.com/new>.

## Fetch sources

Tweee tries several keyless sources and keeps the first with real content:

1. **FxTwitter** (`api.fxtwitter.com`) — CORS-friendly; quotes, media, **articles**
2. **Your Cloudflare Worker proxy** (optional — see below)
3. **vxTwitter** (`api.vxtwitter.com`)
4. **Twitter syndication** (`cdn.syndication.twimg.com`)

> [!NOTE]
> No official X API key is needed. Raw responses are kept on `window.__raw` for debugging.

## CORS proxy (optional)

The syndication source has no CORS headers, so a tiny **free Cloudflare Worker** unlocks it. The in-app wizard (**Settings (gear) → CORS proxy & rotation → Create your own Worker**) has the full walkthrough.

### Multiple proxies & rotation

Paste **one Worker URL per line** in the Proxy box, then pick a **rotation mode**:

| Mode | Behaviour |
|------|-----------|
| **Failover** | Try the first proxy; on failure fall through to the next, top-down. |
| **Round-robin** | Advance to the next proxy on every request (spreads load / quota). |
| **Random** | Shuffle the order on each request. |

This lets you spread traffic across several free Cloudflare accounts (100k req/day **each**) and survive any single proxy going down.

### Media downloads through the proxy

X's image/video CDN often blocks cross-origin reads, which breaks the in-browser **Download** (and its progress bar). The same Worker now also proxies media: Tweee tries a **direct** download first, and on a CORS block automatically retries through your proxy with a working progress bar. The Worker only relays `*.twimg.com` URLs.

> The updated Worker code (handling both `?id=` for tweets and `?url=` for media) is in the in-app wizard and below.

```js
export default {
  async fetch(request) {
    const CORS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "*",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
    try {
      const params = new URL(request.url).searchParams;
      // Media passthrough: ?url=<encoded twimg media url> — unblocks downloads + progress bar.
      const media = params.get("url") || "";
      if (media) {
        let host; try { host = new URL(media).hostname; } catch { return json({ error: "bad url" }, 400); }
        if (!/(^|\.)twimg\.com$/i.test(host)) return json({ error: "host not allowed" }, 403);
        const m = await fetch(media, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://twitter.com/" } });
        const h = new Headers(m.headers);
        for (const [k, v] of Object.entries(CORS)) h.set(k, v);
        return new Response(m.body, { status: m.status, headers: h });
      }
      // Tweet/article passthrough: ?id=<numeric id>
      const id = params.get("id") || "";
      if (!/^\d+$/.test(id)) return json({ error: "missing or invalid id/url" }, 400);
      const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
      const upstream = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`;
      const r = await fetch(upstream, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json", "Referer": "https://platform.twitter.com/" } });
      return new Response(await r.text(), { status: r.status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" } });
    } catch (err) {
      return json({ error: "proxy_failed", detail: String((err && err.message) || err) }, 502);
    }
  },
};
```

Paste the **raw** `*.workers.dev` URL into the Proxy field — Tweee appends `?id=` / `?url=` automatically.

> [!IMPORTANT]
> Must be a **Module Worker** (`export default`). Cloudflare's free tier is **100k requests/day per account**; create more free accounts with private aliases (e.g. [AtomicMail](https://atomicmail.io)) for more headroom — then add them all and use a [rotation mode](#multiple-proxies--rotation).

## Send to Telegram

Create a bot with **@BotFather**, put the **bot token** and **chat ID** in **Settings (gear) → Send to Telegram**, then press the **Telegram** button in the toolbar to push the exported HTML straight into your chat (uploaded via the Bot API `sendDocument`, directly from the browser).

### Telegram proxy (if api.telegram.org is blocked)

In some regions `api.telegram.org` is unreachable. Set a **Telegram API proxy** — a tiny Cloudflare Worker that only relays to Telegram — in **Settings (gear) → Send to Telegram**. The in-app wizard (**Telegram proxy Worker**) has the walkthrough; the code is:

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstream = "https://api.telegram.org" + url.pathname + url.search;
    const init = { method: request.method, headers: request.headers };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
    const r = await fetch(upstream, init);
    const h = new Headers(r.headers);
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    h.set("Access-Control-Allow-Headers", "*");
    return new Response(r.body, { status: r.status, headers: h });
  },
};
```

Tweee then calls `YOUR-WORKER/bot<token>/sendDocument` instead of Telegram directly. Your token passes through this Worker, so deploy it only to **your own** account.

## Settings & persistence

Settings live in `localStorage`, which is **per-origin and per-browser** — so a hosted copy can't "remember" your proxies for a different browser or for the Firefox extension's tab on its own. Three ways to carry settings across:

1. **`config.json` (best for self-hosting).** Drop a `config.json` next to `index.html` (start from [`config.example.json`](./config.example.json)). Tweee fetches it on load and preloads proxies + preferences for **every visitor and every browser** — ideal on GitHub Pages/Netlify. By default it only fills values you haven't set locally; set `"override": true` to force them.
2. **Export / Import.** *Settings sync → Export* downloads a small `tweee-config.json`; *Import* restores it on another device. (Includes your Telegram token/chat.)
3. **Settings link.** *Settings sync → Copy link* gives a `…/?cfg=…` URL that applies your proxies + display prefs on open (the Telegram token/chat are **omitted** from links so they can't leak).

You can also bake defaults straight into the file: edit the `TWEEE_DEFAULTS` block near the top of `index.html`'s script before deploying.

> [!TIP]
> Using the **Firefox extension** with a hosted app? Put your proxies in `config.json` on the host. When the extension opens `https://your-host/?url=…`, Tweee loads that config automatically — no per-browser setup.


## Customization

- **Yekan Bakh** — referenced by name; install/load it in your environment or pick another Persian font.
- **Default proxy / version** — edit `state` defaults and the `VERSION`/`BUILD` constants near the top of the script.

## Privacy

Everything runs in your browser. Network calls go only to the public tweet sources, Google Fonts, your own Worker (if set), and Telegram (if you use it). No analytics, no backend.

## License

[MIT](./LICENSE) — free and open source.

## Author

Created by **[PigmentDev](https://pigment.dev/)** — [github.com/pigment-dev](https://github.com/pigment-dev)

> The bird mark is an original design and is not affiliated with any existing brand.
