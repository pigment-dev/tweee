# PigmentDev Tweee — Firefox extension

Puts a small bird in the **address bar** (page action, not a toolbar button) whenever you're on **x.com / twitter.com**.

- On a supported **tweet** or **article** → the bird turns **colored** and the title reads "Open this post in Tweee".
- Click it → your hosted **Tweee** app opens in a new tab with the post pre-loaded (`?url=<tweet>`), and Tweee fetches it automatically.
- Anywhere else on X → the bird is **greyed out**.

## Configure (required once)

1. Open the extension's **Options** (Add-ons Manager → Tweee → Preferences, or the gear on the page-action).
2. Paste your **Tweee app URL** — wherever you host the single-file app (your server, GitHub Pages, Cloudflare Pages, Netlify…), e.g. `https://tweee.yourdomain.com/`.
3. Save. Done.

The extension only ever opens `appUrl + "?url=" + <current tweet url>`. It stores nothing but that one URL, and requests no network permissions of its own.

## Install

### Temporary (testing)
1. Go to `about:debugging#/runtime/this-firefox`.
2. **Load Temporary Add-on…** → pick `manifest.json` inside this `extension/` folder.
3. It stays until you restart Firefox.

### Permanent (.xpi)
A packaged **`tweee-firefox.xpi`** is included. Firefox only installs **signed** add-ons permanently, so either:

- **Publish to AMO** (recommended): upload the `extension/` folder (or the `.xpi`) at <https://addons.mozilla.org/developers/> → Mozilla signs it → installable everywhere. This is also how you list it in the Firefox Add-ons directory.
- **Self-distribute**: submit the same package to AMO as *unlisted* to get a signed `.xpi` you can host yourself.
- **Developer/Nightly/ESR**: set `xpinstall.signatures.required = false` in `about:config` to install the unsigned `.xpi` directly.

## Permissions

- `tabs` — read the active tab's URL to decide colored vs grey, and open the app.
- `storage` — remember your app URL.
- `*://x.com/*`, `*://twitter.com/*` — only acts on X.

## Manifest

Manifest V2 is used deliberately: the **address-bar** icon (`page_action`) is a V2 feature. Firefox fully supports MV2.

## Files

```
extension/
├── manifest.json      page_action + permissions
├── background.js      show/colorize logic + click handler
├── options.html/js    set your app URL
└── icons/             colored + grey bird (48/96)
```

Created by [PigmentDev](https://pigment.dev/) · [github.com/pigment-dev/tweee](https://github.com/pigment-dev/tweee)
