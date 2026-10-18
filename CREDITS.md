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
| `src/app-center`, Files/dashboard | **App Center** (hide/restore built-ins; previously saved user apps and sites remain openable/removable per account, the add-from-URL flow is disabled). The virtual Files drive is gone — the file system (`assets/fs.js`) stays, but no app ships to browse it |
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

Everything above describes how proton was built. The current base keeps the
five desktop System apps — App Center, Customize, Settings, About and
Browser — and copies the **file system suite** back in from `main`'s
`apps/inbuilt/` layout (re-homed to `apps/<category>/<name>/` here): Files, Text Editor,
Image Viewer, Media and PDF Viewer, whose ids are exactly the ones
`FS.appFor()` returns. The three Celeste Classics apps (Celeste Classic,
Celeste Classic 2, Celeste Community) carry the actual game files, copied
byte-for-byte from [Math-halper/Celeste](https://github.com/Math-halper/Celeste)
(classic/, two/ and speed/) — see *Vendored Celeste Classics* below. A small
Calculator ships again too — new, self-contained code
(`apps/productivity/calculator/`), not a restore of the removed bundle below — and Web Retro
(`apps/games/web-retro/`) re-introduces retro emulation as a vendored webretro build
(see **Vendored emulator (Web Retro)** below). The older
bundled apps and game catalogs remain removed:

- **19 bundled apps** — Files, Text Editor, Image Viewer, Notes, Calendar,
  Contacts, Calculator, Spreadsheet, Presentation, Whiteboard, Logic Sim,
  Terminal, Media, PDF Viewer and the five local games (Chess, Checkers,
  Sudoku, Klondike, Backgammon). (Files, Text Editor, Image Viewer, Media
  and PDF Viewer have since returned, copied from `main`; Calculator returned
  as new code.)
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
all still work, and the account data model in `assets/store.js` still carries
the removed apps' data (notes, files, events, contacts, sheets, slides,
boards), so an older backup still imports and any of these apps can be added
back with a folder under `apps/` and one catalog block.

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
is that picker, a copy of the source repository's root selector with its three
links remapped to the app folders. A few hub links point at site-absolute
paths the source site itself doesn't host (`/glossary/` and friends) and stay
unresolved here, as they do upstream.

All rights in the games, builds and assets remain with their authors (the
Celeste Classic PICO-8 game is © Maddy Thorson, Noel Berry and the PICO-8
community; the community follow-up, practice mods and tools are © their
authors). This repository grants no rights in that content — it is here so
the three apps run from the user's own repository files.

## Vendored emulator (Web Retro)

The Web Retro app (`apps/games/web-retro/`) vendors the **webretro** emulator —
RetroArch compiled for the web by
[BinBashBanana/webretro](https://github.com/BinBashBanana/webretro)
(GPL-3.0, webretro 6.5) — as copied into
[Gams-Offline/Gams](https://github.com/Gams-Offline/Gams) (`g/g/webretro/`):

- `apps/games/web-retro/webretro/` is that build: `launch.html`, `main.js`, the
  `cores/` bundles for mupen64plus_next (N64), snes9x (SNES), nestopia (NES)
  and mgba (GB/GBC/GBA) — the libretro cores are GPL-licensed parts of
  libretro/RetroArch — and the `assets/` they load. The GIMP source
  `controller_layout.xcf` is not a runtime asset and is omitted; everything
  else is byte-for-byte as upstream. The core/wasm and ROM data-URL wrappers
  are Gams' `file://`-friendly packaging of those files.
- `apps/games/web-retro/app.html` is proton's launcher, adapted from Gams'
  `g/webretro.html`: the same core list and BroadcastChannel ROM hand-off to
  `webretro/launch.html?rom=channel`, with the UI rebuilt on proton's widgets
  and the ROM name URL-encoded.
- The app icon is Gams' `img/webretro.png`, saved as
  `data/icons/webretro.png` and set as the catalog default
  (`icon=data/icons/webretro.png`, `svg-icon=false`).

**No ROMs are copied.** Gams' `g/g/webretro/roms/` payload contains commercial
game ROMs encoded as data URLs; that is copyrighted game content, so this
repository does not include it and grants no rights in it. Web Retro only runs
the ROM files you choose on your own device, handed to the emulator in-page
over a BroadcastChannel — they never leave the browser. Only use ROMs you have
the right to use.

The webretro files stay under their upstream licence (GPL-3.0, © the webretro
and libretro authors) and are distributed here as a separate part of this
AGPL-3.0-only repository — GPL-3.0 section 13 permits the combination. Their
in-file source headers and upstream links are unchanged. Not affiliated with
Nintendo or the libretro organisation.
