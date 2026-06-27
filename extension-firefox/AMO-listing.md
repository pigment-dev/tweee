# Firefox Add-on (AMO) listing — PigmentDev Tweee

Copy these into the fields at https://addons.mozilla.org/developers/ when submitting `tweee-firefox.xpi`.

---

## Name
PigmentDev Tweee — bilingual reading cards for X

## Summary (max ~250 chars)
Turn any X / Twitter post or article into a clean, printable, bilingual reading card. Click the bird in the address bar to read threads, quotes, articles, code blocks and media in a calm per-line RTL/LTR layout — then export to PDF, HTML or Telegram.

## Categories
Primary: Other / Productivity (pick "Bookmarks" or "Other" as fits)

## Tags
twitter, x, reader, rtl, persian, farsi, bilingual, articles, pdf, reading

---

## Description

**Tweee turns noisy X / Twitter posts into calm, readable cards.**

A small bird appears in your address bar while you browse X. On a supported tweet, thread, or **Article** it lights up — click it and the post opens in the Tweee reader, already fetched and typeset.

**What you get**
- **Per-line bilingual typesetting** — each line is detected and rendered in its own direction: Persian/Arabic lines as RTL, Latin lines as LTR, each in a font you choose.
- **Threads, quotes & X Articles** — quote tweets nest correctly; long Articles render in full with headings, lists, dividers, code blocks and inline images.
- **Media** — photo grids and inline video/GIF, each with download and copy-link buttons.
- **Code blocks** — fenced and inline code in monospace with one-click copy.
- **Reading controls** — light/dark/auto theme, card backgrounds, serif/sans/mono Latin fonts, a Persian font, size and line height.
- **History & Incognito** — every fetch is saved and searchable; incognito pauses saving.
- **Export** — Print to PDF, download a self-contained HTML file, or send to your own Telegram bot.

**How it works**
The extension adds a toolbar/address-bar button that only appears on x.com / twitter.com. Clicking it opens the Tweee web app in a new tab with the current post's URL, and the app fetches and renders it. The reader is a normal web page (default: https://pigment-dev.github.io/tweee/) — you can point the extension at your own deployment in its options.

**No account, no API key, no tracking.** Everything runs in your browser.

---

## Permissions — why they're needed
- **tabs** — to read the URL of the tab you're viewing (the tweet/article) and open the reader for it.
- **storage** — to remember one setting: which Tweee app URL to open.
- **x.com / twitter.com** — so the button only shows up on X and can tell whether the current page is a supported post.

The extension does **not** use content scripts, does **not** read page content, and does **not** run remote code.

## Data collection
**None.** The add-on collects, stores, and transmits no user data. (Declared in the manifest as `data_collection_permissions: { required: ["none"] }`.) The only stored value is your chosen app URL, kept locally via `storage`.

## Privacy policy (if requested)
PigmentDev Tweee does not collect, store, or share any personal data. The extension only opens a web page (the Tweee reader) with the URL of the post you chose to view. No analytics, no accounts, no servers operated for data collection.

---

## Notes for reviewers
- The extension is tiny: a background script that toggles the toolbar icon on x.com/twitter.com and, on click, opens the Tweee web app (`https://pigment-dev.github.io/tweee/?url=<current-post-url>`) in a new tab; an options page to change that URL; and icons.
- No content scripts, no `eval`, no remote scripts, no `innerHTML` usage anywhere in the extension code.
- Source is public: https://github.com/pigment-dev/tweee (extension under `extension-firefox/`).

## Support
- Homepage / source: https://github.com/pigment-dev/tweee
- Issues: https://github.com/pigment-dev/tweee/issues
