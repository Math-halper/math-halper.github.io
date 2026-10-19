# proton — a browser desktop (static Mixt clone), System apps, a file system, its own search engine and games

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
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/cookie/`), and
**23 more games** from that same Gams collection join the Games section —
Flash classics (Pacman, Tetris, the Henry Stickmin series and more) on the
shared open-source **Ruffle Flash Player** app, Unity WebGL builds and
single-file HTML5 games. A small
**Calculator** (new, self-contained code in `apps/productivity/calculator/`) ships again
too, and **Web Retro** vendors the
[webretro](https://github.com/BinBashBanana/webretro) emulator build from
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) so you can play your
own ROM files too — and it now carries the offline games catalog’s classic ROMs (details in [`CREDITS.md`](CREDITS.md)). The other bundled apps,
game bundles and earlier built-in sites remain removed (except Test Page).

| App (id) | What it does |
| --- | --- |
| **App Center** (`appcenter`) | Manage the built-in apps and anything saved on the account |
| **Customize** (`customize`) | Rename/re-icon/re-categorise apps, themes, wallpapers, desktop parts |
| **Settings** (`settings`) | Account, wallpaper & accent, password, backup, other accounts |
| **About** (`about`) | What this is, credits, licence |
| **Browser** (`browser`) | Tabs, back/forward, bookmarks and history; a bar that **searches this repository** when you type words and visits an address when you type one; built-in websites, external addresses, HTML files from the virtual file system and a reader that marks your matches |
| **Calculator** (`calculator`) | Do quick maths from the keypad or your keyboard |
| **Files** (`files`) | Browse `/` and your own `/home/<you>`: create, rename, move, copy, import, search, download (folders as ZIP) |
| **Text Editor** (`text-editor`) | Open, edit and save text files in your home folder; proton's own files open read-only |
| **PDF Viewer** (`pdf`) | Read PDF files in your browser's own viewer — no extra library, nothing uploaded |
| **Image Viewer** (`image-viewer`) | View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist |
| **Media** (`media`) | Play audio and video files stored in your home folder, with your browser's own codecs |
| **Ruffle Flash Player** (`ruffle-flash-player`) | Load and play your own Flash .swf files |
| **Web Retro** (`web-retro`) | Play retro classics or your own ROMs — N64, SNES, NES and Game Boy (webretro; the catalog’s classics are bundled) |
| **2048** (`game-2048`) | Play 2048 - join the tiles |
| **Bloons Tower Defense 1** (`bloons-tower-defense-1`) | Play Bloons Tower Defense 1 - the original balloon-popping tower defense |
| **Bloons Tower Defense 2** (`bloons-tower-defense-2`) | Play Bloons Tower Defense 2 - more balloons, more towers |
| **Bloons Tower Defense 5** (`bloons-tower-defense-5`) | Play Bloons Tower Defense 5 - the classic tower defense |
| **Bloxorz** (`bloxorz`) | Play Bloxorz - roll the block to the goal |
| **Breaking The Bank** (`breaking-the-bank`) | Play Breaking The Bank - a Henry Stickmin adventure |
| **Celeste Classic** (`celeste-classic`) | Play the original PICO-8 Celeste Classic — its actual game files, vendored from Math-halper/Celeste |
| **Celeste Classic 2** (`celeste-two`) | Play Celeste Classic 2: Lani's Trek — its actual game files, vendored from Math-halper/Celeste |
| **Celeste Community** (`celeste-community`) | The Celeste Classic community hub — practice mods, downloads and links (vendored from Math-halper/Celeste) |
| **Cookie Clicker** (`cookie-clicker`) | Play Cookie Clicker — Orteil's idle bakery game (offline mirror, vendored from Gams-Offline/Gams) |
| **Drive Mad** (`drive-mad`) | Play Drive Mad - the physics driving game |
| **Escaping The Prison** (`escaping-the-prison`) | Play Escaping The Prison - a Henry Stickmin adventure |
| **Fleeing The Complex** (`fleeing-the-complex`) | Play Fleeing The Complex - a Henry Stickmin adventure |
| **Grey Box Testing** (`grey-box-testing`) | Play Grey Box Testing |
| **Infiltrating The Airship** (`infiltrating-the-airship`) | Play Infiltrating The Airship - a Henry Stickmin adventure |
| **Mari0** (`mari0`) | Play Mari0 — Mario × Portal by Maurice Guégan / Stabyourself (love.js build, vendored from Math-halper/Mario) |
| **Offline Paradise** (`offline-paradise`) | Play Offline Paradise |
| **Pacman** (`pacman`) | Play Pacman - the arcade classic |
| **Slope** (`slope`) | Play Slope - roll the ball down the neon slope |
| **Spacebar Clicker** (`spacebar-clicker`) | Play Spacebar Clicker - mash the spacebar |
| **Stack** (`stack`) | Play Stack - time the falling blocks |
| **Stealing The Diamond** (`stealing-the-diamond`) | Play Stealing The Diamond - a Henry Stickmin adventure |
| **Stickman Hook** (`stickman-hook`) | Play Stickman Hook - swing through the levels |
| **Super Mario 64** (`sm64`) | Play the Super Mario 64 WebAssembly browser build (unofficial fan port, vendored from Math-halper/Mario) |
| **Super Mario RPG** (`super-mario-rpg`) | Play Super Mario RPG in Web Retro - the catalog’s classic ROM included |
| **Tetris** (`tetris`) | Play Tetris - the falling-blocks classic |
| **The Impossible Quiz** (`the-impossible-quiz`) | Play The Impossible Quiz - the wildly unfair quiz |
| **Tunnel Rush** (`tunnel-rush`) | Play Tunnel Rush - dodge through the spinning tunnel |

Rows are listed in start-menu order: **System**, then **Productivity**, **Media**, **Tools** and **Games**.

One built-in website ships with them: **Test Page** (`proton://test-page`), the
smoke test for a build — it runs automated checks (scripts, shared stylesheet,
timers, canvas, `fetch`, storage, the desktop bridge) and has buttons that talk
back to proton.

Apps and sites are catalog entries, so any of the removed ones can be added
back: one folder under `apps/inbuilt/` (or `websites/`) plus one `[application]`
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
  (41 apps in five category folders — `system/`, `productivity/`, `media/`, `tools/`,
  `games/` — matching the menu sections, plus
  two starting points: `apps/_template/` for a normal app and `apps/_embed/`
  for one that is only a framed page — change its single `EMBED_URL` constant).
  Every app's name,
  location, icon, category, description and window size is listed in **one
  catalog file** — `data/applications.js`. Add one by copying
  `apps/_template/` into `apps/inbuilt/` and adding an `[application]` block
  there; remove one by
  deleting that block. Full guide: [`apps/README.md`](apps/README.md).
- **Built-in websites:** the same catalog system — `data/websites.js`, one
  `[website]` block per site, each page a `websites/<name>/site.html`. One site
  ships: **Test Page** (`websites/test-page/`), plus `websites/_template/` and
  `websites/_embed/` (one framed page, one `EMBED_URL` constant to change) as
  the starting points for a new one. The Browser also visits any address typed
  into its bar, opens HTML files from the virtual file system, and searches its
  own index of this repository (see **Search** below). Guide:
  [`websites/README.md`](websites/README.md).
- **Core:** `data/applications.js` (the app catalog), `data/websites.js` (the
  website catalog), `data/fs-manifest.js` (generated: every deployed file in
  this repository — the `/` tree of the virtual file system; refresh with
  `python3 tools/gen-fs-manifest.py`), `data/search-index.js` (generated: the
  searchable prose of this repository; refresh with
  `python3 tools/gen-search-index.py`), `assets/config-loader.js` (parses both
  catalogs), `assets/store.js` (accounts/storage and the per-account defaults),
  `assets/fs.js` (the virtual file system), `assets/fs-archive.js`
  (dependency-free ZIP export), `assets/search.js` (the search engine),
  `assets/icons.js` (monochrome SVGs plus safe uploaded-image icons),
  `assets/core.js` (desktop/window manager/registries),
  `assets/desktop-icons.js` (shortcut layout, drag/drop and menus),
  `assets/html-loader.js` (loads the app modules at boot, or a `streamed=true`
  app's module on first launch), `assets/styles.css`, `assets/boot.js`.
- **Tests:** `tests/system-desktop.test.cjs` — 16 tests. The catalogs are
  exactly the 41 catalogued apps (five desktop System apps, the file system
  suite, a Calculator, the two Tools, and the games) and the one test site;
  every module is present, each app is filed in its category folder, the
  generated manifest matches the repository, and a jsdom desktop boots and
  opens each app (the Calculator is driven through real sums; Web Retro's
  launcher is walked through its core picker). Three drive the file system
  suite end to end: Files creating/renaming/moving/importing/searching/zipping
  real account data, every file kind landing in the app `FS.appFor()` names
  (and falling back to Files when nothing else claims it), and desktop
  shortcuts to files and folders. Three more hold search to its promises: the
  index is exactly this repository's prose and every term in it is a fixed
  point of the engine's own stemmer, so the Python generator and the
  JavaScript engine cannot drift apart; typing words in the bar finds, ranks
  and *reads* the right files; and tabs, bookmarks, history and every address
  scheme behave. The tests also verify each game app frames the game page that
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

## Search

The Browser's bar is a search bar first: **type words and it searches, type an
address and it goes there.** proton has no server and calls no outside search
API, so the corpus is this repository — which is also the privacy story: what
you type never leaves the browser.

`python3 tools/gen-search-index.py` reads the prose of every deployed file —
the documentation, each app module's own comments, the built-in website pages
and the source comments — and writes one inverted index to
`data/search-index.js` (99 documents, ~5,400 terms, ~167 KB). Like
`data/fs-manifest.js` it is generated and committed: re-run it after changing
documentation or an app's prose, then commit. Its output is deterministic (no
timestamps, sorted documents and terms), so re-running writes the same bytes,
and the tests fail if it drifts from the repository.

`assets/search.js` is the engine. It decodes that index and scores it with
tf–idf, boosts a word that appears in a title or a file name, folds plurals and
-ise/-ize spellings onto one key, indexes `camelCase` identifiers both whole
and in pieces (`openFSItem` is found by "openFSItem" *and* by "open"), and
merges in three things it can see at runtime: every path in the virtual file
system, the app catalog and the website catalog — using the live names, so a
rename in Customize is what you see. Results that account for every word you
typed always outrank partial ones.

Every hit is also classified as an **answer** or a **mention**. A file answers a
word when the repository is *about* that word there — it is a catalogued app or
website with that name, the word is in its title, file name or description, or
the word occurs often enough relative to the file's length to be a subject
rather than a passing remark. Anything else is a mention: the word turns up, but
nothing here explains it. The Browser only lists answers as results, and puts
mentions in a subordinate **Mentioned in passing** list. When *no* file answers,
the results page leads with that fact — *nothing in this repository defines or
explains the word, proton is not a dictionary* — and offers the nearest words
the index does hold, so a search for "definition" never hands you a licence
file as if it were one.

In the Browser that becomes:

- **suggestions** under the bar while you type — apps, built-in websites,
  proton's own pages, your bookmarks and history, file names, and the words
  this repository actually uses, commonest first;
- **a results page** (`proton://search?q=…`) with ranked answers, the matched
  word marked in each headline, kind filters, mentions kept in a clearly lesser
  list below them, and a real quote fetched from each of the top files after the
  list is drawn;
- **a reader** (`proton://read?path=…&q=…`) that shows any text file in the
  repository with every match marked, buttons to walk them one by one, and ways
  to hand the file to its own app or to Files.

Your own files under `/home/<you>` are deliberately not in this index — it
covers the repository, and the Files app searches your folders instead.
Bookmarks and history are per-account data (`userData.bookmarks`,
`userData.history`), saved with the account and carried by Settings backups.

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
  Media), **Tools** (Ruffle Flash Player, Web Retro) and **Games** (28 games: 2048, the Bloons TD series, the Henry Stickmin
  series, Pacman, Tetris, Slope, Tunnel Rush and more), with **My Apps** for
  anything an account adds. The order is `CATS` in `assets/core.js`.
- **Search** — the Browser's bar searches *this repository* with proton's own
  engine (`assets/search.js` over the generated `data/search-index.js`): tabs,
  back/forward, bookmarks, history, live suggestions and a reader that marks
  every match. No server, no outside search API, and nothing you type leaves
  the browser. See **Search** below.
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
imports. Files and folders have their apps back; the parts that still have none
(notes, calendar, spreadsheet, whiteboard, presentation) stay in the backup and
can be picked up by an app added later.

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
rights (details in [`CREDITS.md`](CREDITS.md)). The 23-game Gams batch is
copied the same way from [Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) —
each game is © its respective authors and the mirrors grant no
redistribution rights; Super Mario RPG’s ROM comes straight from that catalog (details in [`CREDITS.md`](CREDITS.md)). Web Retro ships
its emulator files (webretro, vendored from Gams-Offline/Gams under
GPL-3.0 — see [`CREDITS.md`](CREDITS.md)) together with the catalog’s classic
ROMs — mirrored as-is, each © its respective rights holders — and it still
plays ROMs you bring yourself.
