# proton — a browser desktop (static Mixt clone), System apps plus games

A desktop shell in your browser: Mint-style bottom panel and proton menu,
draggable/resizable windows, per-account customisation — cloned and rebranded
from [Mixt (`proton-arcade/mlp` @ `arena/170861f7-mlp`)](https://github.com/proton-arcade/mlp/tree/arena/170861f7-mlp)
and rebuilt to run as a **pure static website** (no server, no build step, no
dependencies). It ships a **black-and-white theme: black backgrounds, white
text, and white/grey accents** (no colour in the UI).

This build keeps the five desktop System apps from `main` and copies main's
**file system suite** back in — **Files**, **Text Editor**, **Image Viewer**,
**Media** and **PDF Viewer** — and every open/save across the desktop asks
which file system to use: **your Files** (this computer) or the **proton
file system** (the Files app). The **Celeste Classics** collection ships as
three apps — **Celeste Classic**, **Celeste Classic 2** and **Celeste
Community** — with the *actual game files*, copied byte-for-byte from
[Math-halper/Celeste](https://github.com/Math-halper/Celeste) into
`apps/games/celeste-classic/`, `apps/games/celeste-two/` and `apps/games/celeste-community/`
(each app folder is the game's own pages plus a thin iframe wrapper;
`apps/games/index.html` is the "all games" picker their back-links expect).
The **Mario** collection adds **Mari0** (Mario × Portal) and **Super Mario
64** — their game builds copied byte-for-byte from
[Math-halper/Mario](https://github.com/Math-halper/Mario) (only the games:
its landing page and READMEs are not used). **Cookie Clicker** is Orteil's
idle bakery game, copied byte-for-byte from the offline mirror in
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/cookie/`). A small
**Calculator** (new, self-contained code in `apps/productivity/calculator/`) ships again
too, and **Web Retro** vendors the
[webretro](https://github.com/BinBashBanana/webretro) emulator build from
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) so you can play your
own ROM files (no ROMs ship with this repository). The other bundled apps,
game bundles and earlier built-in sites remain removed (except Test Page).

| App (id) | What it does |
| --- | --- |
| **App Center** (`appcenter`) | Manage the built-in apps and anything saved on the account |
| **Customize** (`customize`) | Rename/re-icon/re-categorise apps, themes, wallpapers, desktop parts |
| **Settings** (`settings`) | Account, wallpaper & accent, password, backup, other accounts |
| **About** (`about`) | What this is, credits, licence |
| **Browser** (`browser`) | Visit any address, open HTML files from the virtual file system, and the one built-in site |
| **Calculator** (`calculator`) | Do quick maths from the keypad or your keyboard |
| **Files** (`files`) | Browse your home folder and the read-only proton system tree — create, rename, move, import, search and download |
| **Text Editor** (`text-editor`) | Open, edit and save text files in your home folder; proton's own files open read-only |
| **PDF Viewer** (`pdf`) | Read PDF files in your browser's own viewer — no extra library, nothing uploaded |
| **Image Viewer** (`image-viewer`) | View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist |
| **Media** (`media`) | Play audio and video files stored in your home folder, with your browser's own codecs |
| **Celeste Classic** (`celeste-classic`) | Play the original PICO-8 Celeste Classic — its actual game files, vendored from Math-halper/Celeste |
| **Celeste Classic 2** (`celeste-two`) | Play Celeste Classic 2: Lani's Trek — its actual game files, vendored from Math-halper/Celeste |
| **Celeste Community** (`celeste-community`) | The Celeste Classic community hub — practice mods, downloads and links (vendored from Math-halper/Celeste) |
| **Cookie Clicker** (`cookie-clicker`) | Play Cookie Clicker — Orteil's idle bakery game (offline mirror, vendored from Gams-Offline/Gams) |
| **Mari0** (`mari0`) | Play Mari0 — Mario × Portal by Maurice Guégan / Stabyourself (love.js build, vendored from Math-halper/Mario) |
| **Super Mario 64** (`sm64`) | Play the Super Mario 64 WebAssembly browser build (unofficial fan port, vendored from Math-halper/Mario) |
| **Web Retro** (`web-retro`) | Play your own retro ROMs — N64, SNES, NES and Game Boy (webretro); load them from this computer or your proton Files |

Rows are listed in start-menu order: **System**, then **Productivity**, **Media** and **Games**.

One built-in website ships with them: **Test Page** (`proton://test-page`), the
smoke test for a build — it runs automated checks (scripts, shared stylesheet,
timers, canvas, `fetch`, storage, the desktop bridge) and has buttons that talk
back to proton.

Apps and sites are catalog entries, so any of the removed ones can be added
back: one folder under `apps/` (or `websites/`) plus one `[application]`
(or `[website]`) block in `data/applications.js` (or `data/websites.js`) — see
[`apps/README.md`](apps/README.md) and [`websites/README.md`](websites/README.md).

## Run it

It's just static files — serve the folder (apps are HTML files loaded over
HTTP, so a `file://` tab won't work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Deployed on GitHub Pages it works as-is from the repo root. The website has no
runtime dependencies or build step. Optional regression tests use jsdom:
`npm ci && npm test` (Node 22+).

## Project layout (everything is a module)

- **Apps:** one folder + HTML file each — `apps/<category>/<name>/app.html`
  (18 apps in four category folders — `system/`, `productivity/`, `media/`,
  `games/` — matching the menu sections, plus
  two starting points: `apps/_template/` for a normal app and `apps/_embed/`
  for one that is only a framed page — change its single `EMBED_URL` constant).
  Every app's name,
  location, icon, category, description and window size is listed in **one
  catalog file** — `data/applications.js`. Add one by copying
  `apps/_template/` and adding an `[application]` block there; remove one by
  deleting that block. Full guide: [`apps/README.md`](apps/README.md).
- **Built-in websites:** the same catalog system — `data/websites.js`, one
  `[website]` block per site, each page a `websites/<name>/site.html`. One site
  ships: **Test Page** (`websites/test-page/`), plus `websites/_template/` and
  `websites/_embed/` (one framed page, one `EMBED_URL` constant to change) as
  the starting points for a new one. The Browser also visits any address typed
  into its bar and opens HTML files from the virtual file system. Guide:
  [`websites/README.md`](websites/README.md).
- **Core:** `data/applications.js` (the app catalog), `data/websites.js` (the
  website catalog), `data/fs-manifest.js` (generated: every deployed file in
  this repository — the `/` tree of the virtual file system; refresh with
  `python3 tools/gen-fs-manifest.py`), `assets/config-loader.js` (parses both
  catalogs), `assets/store.js` (accounts/storage and the per-account defaults),
  `assets/fs.js` (the virtual file system), `assets/fs-archive.js`
  (dependency-free ZIP export), `assets/icons.js` (monochrome SVGs plus safe uploaded-image icons),
  `assets/core.js` (desktop/window manager/registries),
  `assets/desktop-icons.js` (shortcut layout, drag/drop and menus),
  `assets/html-loader.js` (loads the app modules at boot, or a `streamed=true`
  app's module on first launch), `assets/styles.css`, `assets/boot.js`.
- **Tests:** `tests/system-desktop.test.cjs` — the catalogs are exactly the
  five desktop System apps, the file system suite, a Calculator and Web Retro,
  the three vendored Celeste games and the one test site; every module is
  present, the generated manifest matches the repository, and a jsdom desktop
  boots and opens each app (the Calculator is driven through real sums; Web
  Retro's launcher is walked through its core picker; Files lists the home
  folder). The tests also verify each Celeste app frames the game page that
  ships in its own folder and that the vendored builds are really there; Test
  Page passes its own checks.

## Math Helper cover page

The site opens on a **Math Helper** cover page styled like a school maths
practice site (the `cover` markup in `index.html`, styled in
`assets/styles.css`). Its practice buttons and links are intentionally
unavailable — they only report that practice cannot be loaded. Scroll to the
very bottom and click **Continue to Math Helper** to enter the real proton
website.

## First launch = create your account

1. After continuing from the cover, first launch asks you to create an
   account (display name, username, password 6+ chars).
2. **Refreshing the page signs you out** and skips the cover, going straight to
   the sign-in screen — your username is listed, but you must enter your
   password again, exactly like signing out. `Lock` hides the desktop behind
   your password without signing out during a visit.
3. Add more accounts later from Settings, or from the sign-in screen.

There is no server, so accounts and data live **only in this browser**
(localStorage). Passwords are stored as salted SHA-256 hashes, never plain
text, and never leave the device. Clearing browser data deletes everything —
export a backup from **Settings → Backup** first.

## Desktop shortcuts

Every account starts with **Settings**, **Browser** and **Files** shortcuts,
plus a link to its own home folder. Double-click an
icon to open it; click once to select it, then drag to another spot to move it
(dropping on another icon swaps them). Use **Add icon** on the desktop to
search the apps, drag an app from the proton menu, right-click a menu app, or
use **App Center → Desktop icon**. Right-click empty space to arrange the
icons. Keyboard users can press Enter to open and Alt+arrow keys to move an
icon. Tap an icon once and use **Open selected** to launch it without a
double-tap; **Remove selected**, right-click → **Remove shortcut** or Delete
removes the link. A shortcut is only a link — removing it never deletes the
app. The layout is saved with the account, included in Settings backups and
reset by **Customize → Reset customisations**.

Shortcuts to **files and folders** work again: right-click the wallpaper and
choose **Add file or folder…** (type a path or pick one from your home folder),
right-click anything in Files and choose **Add desktop shortcut**, or drag an
entry out of Files onto the wallpaper. A shortcut is a link, never a copy — it
follows renames, is marked when its target goes missing, and removing it never
deletes the file.

## What's inside

- **Desktop** — movable, per-account shortcuts, a Mint-Y panel with pinned &
  running apps, clock, searchable start menu (apps grouped into sections),
  window
  manager (drag/resize/minimise/maximise), toasts.
- **Two file systems, one chooser** — every open/save asks whether to use
  **your Files** (this computer) or the **proton file system** (the Files
  app, in this browser): the Text Editor, Files, Image Viewer, Media, PDF
  Viewer, Settings backups, Customize icons and Web Retro's ROM picker all
  work with either.
- **Menu sections** — the start menu groups the apps by `cat=`: **System**
  (App Center, Customize, Settings, About, Browser), **Productivity**
  (Calculator, Files, Text Editor, PDF Viewer), **Media** (Image Viewer,
  Media) and **Games** (Celeste Classic, Celeste Classic 2, Celeste
  Community, Cookie Clicker, Mari0, Super Mario 64, Web Retro), with **My Apps** for
  anything an account adds. The order is `CATS` in `assets/core.js`.
- **Customize — everything is modular.** Rename any app, change its vector
  icon or upload a raster image for it, move it to another (or a brand-new)
  menu category, reorder it, pin it, remove it and add it back, or reset it —
  per account. Uploaded icons are resized and saved with that account. To set a
  shared default, put a raster file in `data/icons/` and set
  `icon=data/icons/my-app.png` plus `svg-icon=false` in `data/applications.js`;
  `icon=globe` with `svg-icon=true` selects a built-in SVG. Invent your own **themes**
  (accent + wallpaper) and **wallpapers** (two-shade gradients) and apply them
  in one click; they also appear in Settings. Toggle desktop parts (clock,
  desktop date/hint, lock & account buttons, menu search, panel labels)
  instantly, and reset all customisations (including shortcut layout) without
  touching anything else. App Center, Customize and Settings are protected so
  you can't lock yourself out.
- **Everything is the static website — no adding websites.** Apps are built
  into this static site; there is no way to add a website or create an app
  from a web address in the UI. The Browser can still visit an address typed
  into its bar without saving it, and anything already saved on an account
  (custom apps, websites) stays openable and removable in App Center and the
  Browser. Mail, Team Chat, Meetings, G-Talk and Admin Vault were removed
  earlier; the rest of the old bundles were removed with them, apart from the
  file system suite (Files, Text Editor, Image Viewer, Media, PDF Viewer),
  which is copied back from `main`. All saved per account.
- **Virtual file system** — `assets/fs.js` builds the full read-only `/` tree
  of this repository from `data/fs-manifest.js` plus each account's writable
  `/home/<user>/`, and Settings still counts and exports those files in a
  backup. **Files** is its manager (two layers in one tree: proton's own code
  above, your folders below), and the Browser opens any HTML page in it at
  `file:///path/to/page.html`. `FS.appFor()` maps an extension to the app that
  opens it — Browser, PDF Viewer, Image Viewer, Media or Text Editor — and
  Files is the fallback for anything no viewer claims (a `.zip`, say): it
  opens with that file selected so you can still inspect or download it.
  Storage is this browser's localStorage: text files save as text, imports as
  base64 bytes up to 2 MB each (`FS.MAX_BLOB_SIZE`), and folders download as a
  dependency-free ZIP (`assets/fs-archive.js`).

Account data keeps its full shape (notes, files, events, contacts, sheets,
slides, boards), so a backup exported by an earlier version of proton still
imports; the apps that edited those parts are simply not in this build.

## Credits & licence

Static clone/rebrand of Mixt — full provenance, what was adapted vs rewritten,
and what a static site can't do (real mail/chat/video transport, cloud sync)
is documented in [`CREDITS.md`](CREDITS.md). Licensed **AGPL-3.0-only**
([`LICENSE.txt`](LICENSE.txt)), same as upstream (Mixt / Puter-derived,
© Puter Technologies Inc.). Not affiliated with Linux Mint, Cinnamon, Puter, or
the Mixt authors.

The Celeste Classics game files **are** copied into this repository —
byte-for-byte from [Math-halper/Celeste](https://github.com/Math-halper/Celeste),
one app per game (see [`CREDITS.md`](CREDITS.md) for provenance; all rights in
the games stay with their authors). The two Mario games are copied the same
way from [Math-halper/Mario](https://github.com/Math-halper/Mario) — only the
game builds, nothing else from that collection; they are **unofficial fan
projects with no affiliation to Nintendo**, and no rights in Nintendo's game
assets are granted or implied (details in [`CREDITS.md`](CREDITS.md)). Cookie
Clicker's files are copied the same way from the offline mirror in
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/cookie/`) —
the game is © Orteil / DashNet, and the mirror grants no redistribution
rights (details in [`CREDITS.md`](CREDITS.md)). Web Retro ships
its emulator files (webretro, vendored from Gams-Offline/Gams under
GPL-3.0 — see [`CREDITS.md`](CREDITS.md)), but **no game ROMs** are included:
you bring your own.
