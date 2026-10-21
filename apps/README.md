# proton apps — one app per folder

Every app is a **single HTML file in its own folder**: `apps/<category>/<app-name>/app.html`.
There is no build step. The list of apps — name, location (path), icon,
category, description and window size — lives in **one catalog file**:
[`data/applications.js`](../data/applications.js), one `[application]` block
per app. At boot proton's config loader (`assets/config-loader.js`) parses
that catalog and the HTML loader (`assets/html-loader.js`) fetches each local
app file (or a `streamed=true` app's small module on first launch), then runs
the `<script data-proton-app>` block inside it. That block calls
`registerApp({...})` (defined in `assets/core.js`) with the app's `render`
code; the catalog metadata is merged in automatically and the app instantly
appears in the proton menu, App Center and Customize.

> Note for users: inside proton itself you **cannot** add websites or
> web-address apps — everything is part of this static website. "Add your own
> app" below is the *developer* workflow for changing the site's code.

The current base keeps its five desktop System apps plus the file system
suite copied from `main` (Files, Text Editor, Image Viewer, Media, PDF
Viewer), a small Calculator (new code in `apps/productivity/calculator/`) and Web Retro
(`apps/tools/web-retro/`, a vendored webretro emulator build in
`apps/tools/web-retro/webretro/` — see `CREDITS.md`; it also carries the
offline games catalog’s classic ROMs).
The three Celeste Classics apps (`celeste-classic/`, `celeste-two/`,
`celeste-community/`) carry the actual game files, copied byte-for-byte from
[Math-halper/Celeste](https://github.com/Math-halper/Celeste) — each app
folder is the game's own pages plus a thin iframe wrapper. The two Mario
games (`mari0/`, `sm64/`) carry their game builds byte-for-byte from
[Math-halper/Mario](https://github.com/Math-halper/Mario) — only the games,
none of that collection's other files. Cookie Clicker (`cookie-clicker/`)
carries Orteil's idle game byte-for-byte from the offline mirror in
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/cookie/`). A 23-game batch from the same Gams collection (Flash
classics on the shared Ruffle player, Unity WebGL builds and single-file
HTML5 games) joins them.
`apps/games/index.html`
is the "all games" picker their back-links expect (see `CREDITS.md`).
The previously bundled apps and game catalogs remain removed. The only
built-in website is **Test Page** (the one entry in `data/websites.js`; see
[`websites/README.md`](../websites/README.md)).

In **Customize → App modules**, choose a named vector icon or upload a PNG,
JPG, WebP, GIF, BMP or AVIF image. Images are resized to at most 128 pixels,
stored per account, and displayed in the menu, panel, app windows and desktop
shortcuts. Existing custom web apps can use the same image control.

For a site-wide default icon, put the raster file in `data/icons/` and set
`icon=data/icons/my-app.png` and `svg-icon=false` in `data/applications.js`.
Use `icon=globe` and `svg-icon=true` for one of the built-in inline SVG icons;
see [`data/icons/README.md`](../data/icons/README.md).

## Add your own app (developer workflow)

1. Copy the `apps/_template/` folder into the category folder it belongs in
   and rename it, e.g. `apps/games/my-app/`.
   Embedded-page apps are not shipped: every app's files live in this
   repository, framed only if they are a local page in the app's own
   folder. Template folders are never registered or deployed —
   `tools/gen-fs-manifest.py` skips every underscore-prefixed folder.
2. Add ONE `[application]` block to `data/applications.js` (copy the template
   in that file's header): `id`, `name`, `path=apps/<category>/my-app/app.html`, `icon`
   (a name from `assets/icons.js` such as `folder`, `globe` or `star`),
   `cat`, `desc`, `w`, `h`. **Always file the app into its respective menu
   section with `cat=`** — `System`, `Productivity`, `Media`, `Tools` or `Games` —
   and put its folder in `apps/<category>/` to match (`system/`,
   `productivity/`, `media/`, `tools/`, `games/`), so the start menu stays organised;
   never add an app without one. Block
   order = menu order within its section. A genuinely new `cat=` name adds a
   new section to the proton menu (the built-in order is
   `CATS` in `assets/core.js`: `System`, `Productivity`, `Media`, `Games`,
   `My Apps`, then anything else you invent).
3. Edit `apps/<category>/my-app/app.html` and write the `render` function
   (the app's code). Reload proton.
4. Re-run `python3 tools/gen-fs-manifest.py` so the new file appears in the
   virtual file system, then `npm test`.

Your app can use: `userData` (the account's saved data), `saveData()`,
`openApp(id)`, `MH.toast(...)`, `MH.download(...)`, `FS` (the virtual file
system — `FS.read`, `FS.write`, `FS.list`, `FS.appFor`, …) and the CSS classes
in `assets/styles.css` (`.btn`, `.card`, `.appbar`, `.stat-grid`, …). Every
open/save should ask which file system to use — `MH.askFileSource('open'|'save')`
returns `'device'` (your Files, this computer) or `'vfs'` (the proton file
system); `MH.devicePick(accept)`, `MH.downloadBlob(name, blob)` and
`MH.vfsPick({...})` (browse/provide a path) are the two sides. Look at
`apps/_template/app.html` — the starting point. The account data model in
`assets/store.js` still carries `notes`, `files`, `dirs`, `events`, `contacts`,
`sheets`, `slides`, `boards` and `games`, so an app added back can pick up
exactly where the old one left off.

## Remove an app

- **Temporarily:** proton menu → Customize (or App Center) → *Remove*.
  This hides it per account and it can be added back any time. App Center,
  Customize and Settings are protected so the desktop stays manageable.
- **Permanently:** delete its `[application]` block from
  `data/applications.js` (and optionally delete the folder), refresh
  `data/search-index.js` and `data/fs-manifest.js`, and drop anything in
  `assets/` that only it used.

## The apps

Apps live in their category folder — `apps/<category>/<app folder>/app.html` —
matching the menu sections (`cat=`, ordered by `CATS` in `assets/core.js`).

| Category | App (id) |
| --- | --- |
| `system/` | App Center (`appcenter`) — hide/restore built-ins, manage the account's saved apps & websites |
| `system/` | Customize (`customize`) — app modules, vector or uploaded image icons, themes, wallpapers, desktop parts, reset |
| `system/` | Settings (`settings`) — account, wallpaper & accent, password, backup, accounts on this device |
| `system/` | About (`about`) — provenance, licence, what's inside |
| `system/` | Browser (`browser`) — Test Page, saved websites, external addresses and VFS HTML files |
| `productivity/` | Calculator (`calculator`) — quick maths from the keypad or your keyboard |
| `productivity/` | Files (`files`) — browse, create, rename, move, import, search and download the virtual file system |
| `productivity/` | Text Editor (`text-editor`) — edit text files in your home folder; proton's own files open read-only |
| `productivity/` | PDF Viewer (`pdf`) — read PDFs in your browser's own viewer |
| `media/` | Image Viewer (`image-viewer`) — PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG with zoom and playlists |
| `media/` | Media (`media`) — play audio and video files from your home folder |
| `tools/` | Ruffle Flash Player (`ruffle-flash-player`) — the vendored Ruffle Flash player (from Gams-Offline/Gams `g/g/Ruffle/`, without the swfs library) plus its wrapper |
| `tools/` | Web Retro (`web-retro`) — the vendored webretro emulator (the offline catalog’s classics plus your own ROMs — from this computer or proton Files) |
| `games/` | 2048 (`game-2048`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Bloons Tower Defense 1 (`bloons-tower-defense-1`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Bloons Tower Defense 2 (`bloons-tower-defense-2`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Bloons Tower Defense 5 (`bloons-tower-defense-5`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Bloxorz (`bloxorz`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Breaking The Bank (`breaking-the-bank`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Celeste Classic (`celeste-classic`) — the vendored PICO-8 game (from Math-halper/Celeste `classic/`) plus its wrapper |
| `games/` | Celeste Classic 2 (`celeste-two`) — the vendored Lani's Trek game (from Math-halper/Celeste `two/`) plus its wrapper |
| `games/` | Celeste Community (`celeste-community`) — the vendored community hub, practice mods and tools (from Math-halper/Celeste `speed/`) plus its wrapper |
| `games/` | Celeste Classic Practice Mod (`celeste-practice-mod`) — the Celeste Community practice-mod page (in `celeste-community/`) plus its wrapper |
| `games/` | Celeste Classic 2 Practice Mod 1.0 (`celeste-two-practice-mod-1-0`) — the Celeste Community page (in `celeste-community/`) plus its wrapper |
| `games/` | Celeste Classic 2 Practice Mod 1.1 (`celeste-two-practice-mod-1-1`) — the Celeste Community page (in `celeste-community/`) plus its wrapper |
| `games/` | Celeste Webek (`celeste-webek`) — the Celeste Community page (in `celeste-community/`) plus its wrapper |
| `games/` | Celeste Classic Downloads (`celeste-downloads`) — the Celeste Community downloads page (in `celeste-community/`) plus its wrapper |
| `games/` | Cookie Clicker (`cookie-clicker`) — the vendored offline mirror of Orteil's game (from Gams-Offline/Gams `g/g/cookie/`, minus `img/Thumbs.db`) plus its wrapper |
| `games/` | Drive Mad (`drive-mad`) — the vendored WebGL build (from Gams-Offline/Gams `g/g/`) plus its wrapper |
| `games/` | Escaping The Prison (`escaping-the-prison`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Fleeing The Complex (`fleeing-the-complex`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Grey Box Testing (`grey-box-testing`) — the vendored WebGL build (from Gams-Offline/Gams `g/g/`) plus its wrapper |
| `games/` | Infiltrating The Airship (`infiltrating-the-airship`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Mari0 (`mari0`) — the vendored love.js build of Mario × Portal (from Math-halper/Mario `mari0/web/`) plus its wrapper |
| `games/` | Offline Paradise (`offline-paradise`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Pacman (`pacman`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Slope (`slope`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Spacebar Clicker (`spacebar-clicker`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Stack (`stack`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Stealing The Diamond (`stealing-the-diamond`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Stickman Hook (`stickman-hook`) — the vendored single-file game (from Gams-Offline/Gams `g/`) plus its wrapper |
| `games/` | Super Mario 64 (`sm64`) — the vendored WebAssembly browser build (from Math-halper/Mario `sm64/`) plus its wrapper |
| `games/` | Super Mario RPG (`super-mario-rpg`) — the vendored launcher into Web Retro (from Gams-Offline/Gams `g/`; the catalog’s ROM is bundled with Web Retro) plus its wrapper |
| `games/` | Tetris (`tetris`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | The Impossible Quiz (`the-impossible-quiz`) — the vendored Flash build and loader shim (from Gams-Offline/Gams `g/g/Ruffle/swfs/`; runs on the shared Ruffle player) plus its wrapper |
| `games/` | Tunnel Rush (`tunnel-rush`) — the vendored WebGL build (from Gams-Offline/Gams `g/g/`) plus its wrapper |
| `_template/` | not an app — the starting point for a new one (copy it into its category folder) |

### Desktop shortcut workflow

`assets/desktop-icons.js` renders per-account `userData.desktopIcons` entries
(`{id, kind:'app'|'path', target, col, row}`). A new account starts with
Settings, Browser, Files and a link to its own home folder; an empty array
means the user intentionally cleared all shortcuts. Icons are *links*, not VFS
files: removing an icon leaves the app or file intact. Double-click/Enter opens the target; pointer dragging or Alt+arrow keys
moves it on a snap grid, with occupied spots swapped. The layout reflows on
narrow screens without changing the saved positions.

Use the desktop **Add icon** search, right-click the wallpaper or an app in the
proton menu, drag a menu app onto the wallpaper, or use App Center's **Desktop
icon** button. For a file or folder: right-click the wallpaper → **Add file or
folder…**, right-click an entry in Files → **Add desktop shortcut**, or drag an
entry out of Files onto the wallpaper. Select a shortcut for the touch-friendly **Open selected** or
**Remove selected** buttons, right-click it for **Remove shortcut**, or press
Delete. Shortcut edits save immediately with the account and are included in
Settings backups; Customize's Reset restores the defaults.

`kind:'path'` entries (files and folders) are created again by the Files app,
the desktop menu and dragging out of Files — all of them go through
`DesktopIcons.addPath()`. Opening one calls `openFSItem()` in `assets/core.js`,
which sends folders to Files and files to whichever app `FS.appFor()` names, so
a shortcut keeps working when an app is added or removed. They follow renames
(`FS.watch`), mark a missing target instead of failing, and can always be
moved and removed without touching the file itself.

### Shared code

Shared code lives outside this folder: `data/applications.js` (the app
catalog — name, location, icon and everything else for every app),
`data/websites.js` (the same kind of catalog for built-in websites — Test Page
is the only one left; guide: `websites/README.md`),
`data/fs-manifest.js` (generated list of every deployed file in this
repository — the `/` tree of the virtual file system; refresh it with
`python3 tools/gen-fs-manifest.py`), `data/search-index.js` (generated: the
searchable prose of this repository — refresh it with
`python3 tools/gen-search-index.py`), `assets/search.js` (the search engine the
Browser's bar queries), `assets/fs.js` (the file system API the whole Files
suite is built on — its header comment documents every method),
`assets/fs-archive.js` (dependency-free ZIP downloads),
`assets/config-loader.js` (parses both
catalogs), `assets/store.js` (accounts/storage and the per-account defaults),
`assets/core.js` (desktop, windows, registries), `assets/desktop-icons.js`
(shortcuts), `assets/icons.js` (the SVG set and safe image-icon renderer), `assets/styles.css`,
`assets/html-loader.js` (loads the HTML modules) and `assets/boot.js` (loaded
last). Note: because the loader fetches files over HTTP, proton must be served
over HTTP(S) — GitHub Pages or `python3 -m http.server` — not opened as a
`file://` page.
