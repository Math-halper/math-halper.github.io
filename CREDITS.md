# Credits & provenance

**proton** (this repository) is a static, browser-only clone and
rebrand of **Mixt**, from:

- Upstream: https://github.com/proton-arcade/mlp/tree/arena/170861f7-mlp
- Commit cloned: `c37c6cae251cf482749b19280dbafc70ccd1a6e0` (“Remove email confirmation”)

## Why it isn't a file-for-file copy

The upstream is a ~1.2 GB full-stack project: a Node.js server (`node
server.cjs`), SQLite, an HTTPS front on port 8835, a webpack-built GUI and
the Mixt.js SDK. None of that can run on GitHub Pages, which only serves
static files. So the desktop, window manager and apps were **rebuilt with
vanilla HTML/CSS/JS and zero dependencies**, keeping the upstream behaviour
and look wherever a browser-only equivalent exists:

| Upstream (Mixt) | Here (proton) |
| --- | --- |
| Mint-Y theme `src/gui/src/css/mixt.css` (accent `#68b723`, light gradient title bars, dark bottom panel) | Panel layout/chrome reimplemented in `assets/styles.css`, with the palette changed to black-and-white for proton |
| Server accounts, `admin` first sign-in, whitelist | First-launch account creation stored **only in this browser** (localStorage), salted password hash, sign-in on every refresh, lock screen |
| IndexedDB app storage (`src/apps/shared/localdb.js`) | Per-account localStorage state, export/import backup in Settings |
| `src/apps/notes`, `calendar`, `spreadsheet`, `whiteboard`, `presentation`, `terminal`, `pdf-editor`, `media`, `mail`, `contacts` | Were browser-only rewrites with the same core behaviour — **removed**; see below |
| `src/apps/sudoku/logic.js`, `checkers`, `chess`, `klondike`, `backgammon` | Sudoku generator/checker was adapted from the original pure-logic file, the other games reimplemented to the same rules — **removed** |
| `src/apps/team-chat`, `g-talk`, `meetings` | On-device channels/direct chat with a local helper bot; meeting planner — removed earlier (real calls need a server) |
| `src/apps/admin-vault`, dashboard Admin tab | Vault app that re-checked your account password (removed earlier); account/device stats survive in **Settings** |
| `src/app-center`, Files/dashboard | **App Center** (hide/restore built-ins; previously saved user apps and sites remain openable/removable per account, the add-from-URL flow is disabled). The virtual Files drive is back: **Files** browses and manages the same file system (`assets/fs.js`), and Text Editor / Image Viewer / Media / PDF Viewer open what it finds |
| — (modular layer) | **Customize** app: every built-in module's name/icon/category/order is editable and resettable, custom themes & wallpapers can be added/edited/removed/applied, and desktop parts (clock, hint, tray buttons, menu search, panel labels) toggle live — all per-account state with migration |
| `internet/*` sites | Built-in websites as separate modules loaded into the Browser's SITES registry — **removed** except Test Page, the one entry left in `data/websites.js` |
| `internet/world-history`, `internet/mixt-guide` | Built-in Browser pages — **removed** with the other websites |
| — (new in this rebrand) | Calculator (solver, graph plotter, formula cards) was new in this rebrand — **removed** |

Things that fundamentally need a server were replaced with honest on-device
equivalents and are labelled as such in-app: real e-mail/chat/video transport,
multi-user whitelisting, cloud storage, and the Mixt.js SDK.

## Licence

proton, like Mixt and the Puter-derived code it is based on, is
licensed under the **GNU Affero General Public License v3.0 only** — see
`LICENSE.txt`. Mixt contains code derived from Puter, copyright Puter
Technologies Inc., also AGPL-3.0. Original copyright notices in upstream
source files remain theirs.

Not affiliated with Linux Mint, Cinnamon, Puter Technologies, or the Mixt
authors.

## What this build ships

  `assets/styles.css` carries the shell's chrome, the classes the shipped apps
  use (including the file manager/viewer and browser/search blocks), and
  `tests/` is a single suite for this build, including tests that drive the
  Files suite end to end.
- **92 game entries from the older build** — the 19 Proton Arcade titles,
  68 Gams Offline titles and the five local games above (the local five were
  not streamed), catalogued in `data/applications.js` before trimming.
  Removed with them: `assets/game-host.js` (the shared
  frame host), `assets/game-icons.js` (their hand-drawn monochrome SVG glyphs),
  the `.arcade-*` styles, and the two Gams builds that had been copied into
  this repository under `games/gams/g/g/` (*A Dance of Fire and Ice*,
  *Grey Box Testing*) — none of those game builds or the old streamed catalog
  are bundled here. The Celeste Classics files that *are* vendored here are
  documented below.
- **5 of the 6 built-in websites** — Guide, World History, Maths Resources,
  proton Daily and the Digital Logic Sim web edition (an independent
  re-implementation inspired by Sebastian Lague's MIT-licensed Digital Logic
  Sim, which also carried upstream's JetBrains Mono NL fonts under SIL OFL
  1.1). **Test Page** was kept and rewritten as this build's smoke test, so
  `websites/` still exists with that one site (plus `_template/` and `_embed/`) and
  `data/websites.js` still holds one `[website]` block; the Browser also copes
  with an empty catalog if it is removed.
- **The styles, icons and tests that only those apps used** —
  `assets/styles.css` carries the shell's chrome plus the classes used by the
  thirteen shipped app wrappers, and `tests/` is a single suite for this trimmed build.

Nothing in the desktop shell was removed: accounts, the window manager, the
panel and start menu, per-account desktop shortcuts, the customisation layer,
the virtual file system (`assets/fs.js`, `data/fs-manifest.js`,
`assets/fs-archive.js`) and the Browser's ability to open an HTML page from it
all still work — and the file system now has its apps back, so it is browsable,
editable and exportable from the desktop itself. The account data model in
`assets/store.js` still carries the removed apps' data (notes, events,
contacts, sheets, slides, boards), so an older backup still imports and any of
those apps can be added back with a folder under `apps/inbuilt/` and one
catalog block.

The search engine is new in this build rather than inherited, and it exists
because a static page with no server still needs a way to find things: the only
corpus it can honestly search is its own repository. `tools/gen-search-index.py`
generates `data/search-index.js` from the prose of every deployed file,
`assets/search.js` scores it, and the Browser (`apps/inbuilt/browser/`) grew the
chrome around it — tabs, back/forward, bookmarks, history, suggestions and a
reader. No search API is called and no query leaves the browser. It also refuses
to bluff: a hit is either an **answer** (the repository is about that word here)
or a **mention** (the word only turns up), the Browser lists answers as results
and mentions beneath them, and when nothing answers it says so plainly rather
than promoting an incidental match. proton has no dictionary, so it does not
pretend to have one.

The provenance table above and the sections that used to follow it (Digital
Logic Sim, the streamed Proton Arcade and Gams Offline catalogs) are historical:
those builds are no longer bundled here. Their upstream projects' licences and
copyrights are unaffected, and this repository grants no rights in their game
content.

## Vendored Celeste Classics

The three Celeste apps carry the **actual game files**, copied byte-for-byte
from [Math-halper/Celeste](https://github.com/Math-halper/Celeste) (that
repository's `classic/`, `two/` and `speed/` folders), one app per game:

- `apps/games/celeste-classic/` — Celeste Classic (the PICO-8 export of *Celeste
  Classic* by Maddy Thorson & Noel Berry), from `classic/`
- `apps/games/celeste-two/` — *Celeste Classic 2: Lani's Trek* (community follow-up),
  from `two/`
- `apps/games/celeste-community/` — the Celeste Classic community hub, its practice
  mods, downloads and WebEK tool, from `speed/`

Each app folder is the game's own pages plus proton's thin iframe wrapper
(`app.html`); nothing in the game files was edited. The pages' "all games"
links go one level up (`href="../"`), as on the source site — `apps/games/index.html`
is that picker: proton's own "all games" page listing every game in the folder
(the source repository's root selector is not used). A few hub links point at
site-absolute
paths the source site itself doesn't host (`/glossary/` and friends) and stay
unresolved here, as they do upstream.

The app icons for `celeste-classic` and `celeste-two` are a shared pixel-art
image uploaded by the repository maintainer; `celeste-community` keeps its
own icon cropped from the hub's `maddy.png` avatar. Nothing else was redrawn.

All rights in the games, builds and assets remain with their authors (the
Celeste Classic PICO-8 game is © Maddy Thorson, Noel Berry and the PICO-8
community; the community follow-up, practice mods and tools are © their
authors). This repository grants no rights in that content — it is here so
the three apps run from the user's own repository files.

## Vendored Mario games

Two unofficial Mario fan games are vendored from
[Math-halper/Mario](https://github.com/Math-halper/Mario) — **only the game
builds**; that collection's landing page, READMEs and other files are not
used. Each app folder is the game's own files plus proton's thin iframe
wrapper (`app.html`); nothing in the game files was edited.

- `apps/games/sm64/` — Super Mario 64: the three build files (`index.html`,
  `sm64.us.f3dex2e.js`, `sm64.us.f3dex2e.wasm`) of a precompiled WebAssembly
  port of the SM64 decompilation, byte-for-byte from that collection's `sm64/`
  folder (itself identical to
  [incrediblerevived11's build](https://github.com/incrediblerevived11/incrediblerevived11.github.io/tree/main/sm64)
  @ `a08ec53`). Credit to that host and the original SM64
  port/decompilation contributors; the build does not identify the full port
  authorship. **No declared upstream license** — public availability does not
  grant redistribution rights.
- `apps/games/mari0/` — *Mari0 — Mario × Portal* by **Maurice Guégan /
  Stabyourself** ([Stabyourself/mari0](https://github.com/Stabyourself/mari0),
  v1.6 / LÖVE 11.4, stated **MIT** upstream), byte-for-byte from that
  collection's `mari0/web/` build. The browser runtime is **love.js** by
  **Davidobot** (continuing **Tanner Rogalsky's** Emscripten port of LÖVE,
  both MIT); its license ships as `apps/games/mari0/LOVEJS-LICENSE.txt`, and
  the build's own credits notice as `apps/games/mari0/CREDITS.txt`. The
  browser edition's changes (offline stubs for LuaSocket, WebGL GLSL rules,
  save-folder opening disabled, online/mappack/netplay paths off, a
  per-source audio-stop workaround for love.js's OpenAL shim, rebuilt portal
  input) were made upstream of this repository — see that collection's
  credits.

**These are unofficial fan projects and are not affiliated with Nintendo.**
Mario, Portal and other third-party artwork, music and trademarks may carry
separate rights; a code license is not blanket asset clearance. This
repository grants no rights in Nintendo's game assets, and no permission to
redistribute them is claimed or implied.

The app icons for `mari0` and `sm64` are key-art images uploaded by the
repository maintainer (512×512, under `data/icons/`). The same rights note
applies to them.

## Vendored Cookie Clicker

`apps/games/cookie-clicker/` is Orteil's **Cookie Clicker** idle game,
copied byte-for-byte from the offline mirror in
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/cookie/` —
itself the [ozh/cookieclicker](https://github.com/ozh/cookieclicker) mirror;
its README travels with the game). The one omission is `img/Thumbs.db`, a
Windows Explorer thumbnail cache that is not part of the game. Nothing in
the game files was edited.

The game is self-contained — its own `img/`, `snd/`, `loc/` translations and
minigames all ship in the folder — and saves to the browser's localStorage.
Some of the original page chrome points at remote URLs (ads, cookie consent,
Google Fonts, links to Orteil's other work) and fails quietly when offline.

Cookie Clicker is © **Orteil (DashNet)**; the original lives at
[orteil.dashnet.org/cookieclicker](https://orteil.dashnet.org/cookieclicker/).
The mirror carries **no license granting redistribution** — the game is here
as the offline copy the Gams link points at, and no further rights are
claimed or implied. The app icon is the game's own cookie art from the
mirror's `img/cookieclicker.png`, scaled into `data/icons/`.

## Vendored Gams-Offline games (batch)

Twenty-three more games ship under `apps/games/`, each copied from
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams):

- **Single-file HTML5 games** — Slope, Stickman Hook, Stack, 2048, Spacebar
  Clicker and Offline Paradise (`g/<name>.html`, one self-contained file
  each).
- **Flash classics, played on Ruffle** — Pacman, Tetris, Bloxorz, The
  Impossible Quiz, Bloons Tower Defense 1/2/5 and the five Henry Stickmin
  games (Breaking The Bank, Escaping The Prison, Stealing The Diamond,
  Infiltrating The Airship, Fleeing The Complex). Their builds are the packed
  SWFs in `g/g/Ruffle/swfs/`, shipped beside each app's tiny Gams loader
  shim. That shim is edited **only** in its two loader paths (the SWF data
  now lives beside it; the player is shared as `apps/tools/ruffle-flash-player/`)
  — nothing else in it changed.
- **WebGL builds** — Tunnel Rush and Grey Box Testing (`g/g/tunnelrush/`,
  `g/g/greybox/`) and Drive Mad (`g/g/drivemad/`), copied folder-for-folder.
- **Ruffle Flash Player** (`apps/tools/ruffle-flash-player/`) — the shared
  Flash runtime from `g/g/Ruffle/` (without the `swfs/` library — every Flash
  game app carries its own build). Ruffle itself is open source, MIT or
  Apache-2.0 ([ruffle-rs/ruffle](https://github.com/ruffle-rs/ruffle)).
- **Super Mario RPG** (`apps/games/super-mario-rpg/`) — a launcher shim into
  this repository's own Web Retro (core `snes9x`, `rom=smrpg.smc`), which
  loads the catalog's bundled ROM (see the Web Retro section).

Each game is © its respective authors — for example the Henry Stickmin series
by PuffballsUnited (Innersloth), the Bloons series by Ninja Kiwi, Pac-Man ©
Bandai Namco, Tetris © Tetris Holding, 2048 by Gabriele Cirulli. The mirrors
carry **no license granting redistribution**; they are here as the offline
copies the Gams links point at, and no further rights are claimed or implied.
The app icons are the Gams collection's own icon images for each game, scaled
into `data/icons/`.

## Mountain658 games (framed)

Twelve more games are framed from [mountain658.github.io](https://mountain658.github.io/) —
**Retro Bowl**, **Geometry Dash** (Scratch), Slope 2, Bitlife, Crossy Road, Moto X3M, Subway Surfers, Drift Hunters, Run 3, Paper.io 2, Basketball Stars and Wordle:

- Each app is a thin wrapper (`apps/games/<id>/app.html`) that frames the mountain game page live at `https://mountain658.github.io/<page>.html` in a sandboxed iframe (`allow-scripts allow-forms allow-popups allow-modals`, `allow="autoplay; fullscreen; pointer-lock; gamepad"` with an "Open in new tab" escape hatch). No game files are vendored — the browser loads them from mountain658 at runtime, proton does not proxy, cache or store them.
- Icons are the mountain collection's own `*.png` images (e.g. `retrobowl.png`, `geometry-dash.png`), scaled into `data/icons/` and set as the catalog default (`icon=data/icons/<id>.png`, `svg-icon=false`).

Geometry Dash is the two Scratch projects mountain frames (`dash/dash.html` → `https://scratch.mit.edu/projects/105500895/embed` and `dash/dash2.html` → `https://scratch.mit.edu/projects/118638917/embed`) via its `dash/dashHome.html` hub. Retro Bowl is the mountain page `retro.html` which itself loads the GameMaker build at `g/retrobowl/index.html` (the same build also ships at `g/retrobowl/` in the mountain repo) plus two fallback servers; the wrapper frames that hub and offers the same three-server switcher inside it.

Each game is © its respective authors (Retro Bowl by New Star Games, Geometry Dash by RobTop Games / Scratch remixes, etc.). The mountain collection carries no license granting redistribution; the frames are here as live embeds of that site, and no further rights are claimed or implied.

## Vendored emulator (Web Retro)

The Web Retro app (`apps/tools/web-retro/`) vendors the **webretro** emulator —
RetroArch compiled for the web by
[BinBashBanana/webretro](https://github.com/BinBashBanana/webretro)
(GPL-3.0, webretro 6.5) — as copied into
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/webretro/`):

- `apps/tools/web-retro/webretro/` is that build: `launch.html`, `main.js`, the
  `cores/` bundles for mupen64plus_next (N64), snes9x (SNES), nestopia (NES)
  and mgba (GB/GBC/GBA) — the libretro cores are GPL-licensed parts of
  libretro/RetroArch — and the `assets/` they load. The catalog's original `roms/`
  library from Gams' `g/g/webretro/` now lives in
  `apps/tools/web-retro/webretro/roms/` — the seven packed ROMs behind the
  classic cartridge games (see Rights below). The GIMP source
  `controller_layout.xcf` is not a runtime asset and is omitted; everything
  else is byte-for-byte as upstream. The core/wasm and ROM data-URL wrappers
  are Gams' `file://`-friendly packaging of those files.
- `apps/tools/web-retro/app.html` is proton's launcher, adapted from Gams'
  `g/webretro.html`: the same core list and BroadcastChannel ROM hand-off to
  `webretro/launch.html?rom=channel`, with the UI rebuilt on proton's widgets
  and the ROM name URL-encoded. The ROM can come from either file system —
  the device's own file picker, or the proton virtual file system (proton
  Files, read with `FS.readBlob`).
- The app icon is Gams' `img/webretro.png`, saved as
  `data/icons/webretro.png` and set as the catalog default
  (`icon=data/icons/webretro.png`, `svg-icon=false`).

**The classic ROMs come from the offline games catalog.** At the maintainer's
request, `apps/tools/web-retro/webretro/roms/` carries the original `roms/`
library from Gams' `g/g/webretro/` — the packed ROMs behind the catalog's
classics (Super Mario World, Super Mario RPG, The Legend of Zelda: A Link to
the Past, EarthBound, Super Mario Bros., Pokémon Sapphire and Paper Mario 64),
so they run out of the box. Those are commercial games © Nintendo, Square,
Creatures, HAL Laboratory, Game Freak and their respective rights holders:
the Gams mirror grants no redistribution rights and this repository grants
none either — the files are mirrored here as-is. Web Retro still runs any ROM
file you choose — from your own device or from proton's virtual file system —
handed to the emulator in-page over a BroadcastChannel; those never leave the
browser. If you hold rights in a bundled ROM and want it removed, open an
issue or pull request and it will be taken down.

The webretro files stay under their upstream licence (GPL-3.0, © the webretro
and libretro authors) and are distributed here as a separate part of this
AGPL-3.0-only repository — GPL-3.0 section 13 permits the combination. Their
in-file source headers and upstream links are unchanged. Not affiliated with
Nintendo or the libretro organisation.
