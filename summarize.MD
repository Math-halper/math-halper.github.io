# Summary of the user, the project, and everything learned in this chat

As of this checkout, the repository is `Math-halper/math-halper.github.io`, a static
GitHub Pages site that implements **proton**, a browser-only fake desktop. The current
working branch is `arena/0405a89b-math-halper-github-io`, based on `c15459a`, the merge
of PR #26. PRs #19–#26 have been merged into `main`. The most recent merged work is:
Terminal file commands/`nano`, the authentic VLC look, and desktop-VLC keyboard
shortcuts.

## What the user wants, in general

- The user gives short, direct implementation requests and expects the work to be done,
  not merely planned.
- They care about **real behaviour**, not placeholders: real moving windows for the
  “idiot” app, real vendored games instead of embeds, a real VLC engine instead of a
  converter, a real VLC cone/interface, and real VLC keyboard shortcuts.
- They correct scope sharply when an assistant overreaches. The clearest example:
  after earlier password discussion, the final instruction was to **change only the
  password value to `hitter` and leave entry behaviour exactly as it was**.
- They prefer the project’s own desktop/apps to use existing artwork/icons rather than
  emojis. Vendored game internals are not to be rewritten just to satisfy that rule.
- They dislike remote/embedded game dependencies. Games must live in the repository
  and run locally.
- When they ask for a PR, they mean `gh pr create`; when they later said “Please merge
  the pull request” for PR #23, that specific instruction was completed. PR #26 was
  opened and is now merged in this checkout.
- No meaningful biographical information about the user was provided in the chat beyond
  their ownership/use of this GitHub repository and the preferences recorded here.

## Non-negotiable product decisions and corrections

### Desktop entry, accounts, password, waitlist

- The shared desktop/site password is stored in `data/password.txt` and is now
  **`hitter`**. This was a value-only change; do not redesign the gate around it unless
  the user explicitly asks again.
- Entry behaviour to preserve:
  - password is typed into the **header search bar** and submitted with **Sign in**;
  - returning users may press **Sign in** with no password and still get in;
  - the **Create your account** page appears only when no local account exists;
  - the main/hero area must not contain an “Enter password” prompt;
  - no cover text may hint that the search bar is secretly the password box;
  - the Math Helper cover remains functional;
  - the hidden header Sign-in proton gate stays.
- The waitlist requires the site password; having an account alone is not enough.
- Storage uses `proton2.*` keys, and old `mhOS.*` data is deleted on load.
- The former bottom “Continue to Math Helper” band/fullscreen trap was removed, but
  the video/audio files themselves stay in the repository (`assets/youare.mp4` remains).

### Files and inputs

- Files app entries must open on a normal single click, not only double-click/Enter.
- Text inputs that show an editing caret must actually be editable. An audit found no
  systemic blocker in proton’s own apps, and a regression test was added. The standing
  test lesson is to re-query live elements per field, skip hidden tab fields, and exclude
  hidden/file/checkbox/radio/color/number/range inputs from that particular audit.

### Icon rules

- Final icon rule, superseding earlier global/per-app options: **unless an app has
  `svg-icon=true`, its raster icon always cover-crops to the icon and is image-only with
  no background tile**. SVG icons keep their tile.
- Remove the choice for this from the Customization page: no global switch and no
  per-app selects.

### Emoji/artwork rule

- Remove emojis across proton’s own UI/desktop and use existing images/icons for
  artwork. Do **not** edit inside vendored games to chase this rule.
- This is one reason the libvlc-wasm `<vlc-player>` element was rejected: it contains
  emoji control glyphs. The app drives `createVLC()` directly instead.

### Removal/change decisions

- Remove **Your apps** and **Your websites** from Browser and App Center, but do not
  delete stored `userData.customApps` / `userData.websites` data.
- Remove all apps/games from the `incrediblerevived11.github.io` rip **except
  Bitburner**.
- Remove Subway Surfers.
- Combine all Celeste games into one app/chooser called the **Celeste Hub**.
- Earlier mountain-games work was explicitly reversed: all mountain games/traces were
  excised. Do not touch unrelated “mountain” strings inside remaining game content
  (for example Cookie Clicker localization).
- Non-English game rule: judged by actual in-game language, **keep any game that
  includes English**; remove only games with no English at all. The audit concluded
  zero games qualified for removal.
- The Sims Bustin’ Out was removed from Web Retro. There is no Super Mario RPG in the
  final bundled library.
- Two old requests remain ambiguous and must not be guessed if raised again:
  “add light” (no matching source was found; do not invent one) and “remove gem Dash”
  (only the full `geometry-dash` was deleted; `geometry-dash-lite` remains).
- A GUI-look complaint strengthening plan was discussed historically but remains
  unresolved if re-raised.

## proton architecture facts that matter

- `index.html` is the proton shell. Apps are HTML fragments whose
  `<script data-proton-app>` blocks are fetched/extracted by `assets/html-loader.js`
  and registered through `APPS`; app code that needs modules uses dynamic `import()`.
- `data/applications.js` is the catalog. It is a JS template literal containing
  INI-like `[application]` blocks. **Preserve the template-literal trailer** after the
  last block; dropping it once caused `SyntaxError: Unexpected end of input` and 17
  test failures. Verify catalog edits with `node --check`.
- Catalog fields that matter include `id`, `name`, `path`, `icon`, `svg-icon`, `cat`,
  and `preinstalled`. The `preinstalled=` field controls whether an app is
  preinstalled; the idiot app is the `preinstalled=false` exception.
- Raster catalog icons must live under `data/icons/` with raster extensions
  (`png`, `jpg`, `jpeg`, `webp`, `gif`, `bmp`, `avif`); inline named SVG icons are the
  other mode.
- `assets/fs.js` is the central virtual file system. Important facts: `MAX_BLOB_SIZE`
  is 2 MB; `mediaKind()` includes `mkv`; `mime()` maps mkv to `video/x-matroska`;
  `appFor()` routes media to app id `media`; useful APIs include `stat`, `exists`,
  `isDir`, `isWritable`, `list`, `read`, `readBlob`, `write`, `writeBlob`, `mkdir`,
  `rm`, `rename`, `copy`, `count`, and `find`.
- `assets/store.js` provides `MH.askFileSource()`, `MH.devicePick()`, `MH.vfsPick()`,
  and `MH.downloadBlob()`, used by VLC and other apps for open/save flows.
- `assets/icons.js` contains proton’s named SVG icon paths (for example `film`,
  `music`, `video`, `folder-open`, `download`, `folder`, `play`, `pause`, `square`,
  `skip-back`, `skip-forward`, `repeat`, `shuffle`).
- The shell itself does **not** load the COI service worker. The VLC app loads root
  `coi-serviceworker.js` dynamically and only on demand.

## Apps and major features completed

### New built-in apps

- Paint, Piano, Terminal, and Clock were added together; System Monitor was added
  separately.
- Catalog size after the built-in-app additions was 59 apps.
- Relevant app folders:
  - `apps/media/paint/`
  - `apps/media/piano/`
  - `apps/tools/terminal/`
  - `apps/productivity/clock/`
  - `apps/system/system-monitor/`

### Terminal (`apps/tools/terminal/app.html`)

Final command set: `help`, `ls`, `cd`, `pwd`, `cat`, `echo`, `open`, `nano`, `tree`,
`mkdir`, `touch`, `rm`, `cp`, `mv`, `find`, `stat`, `date`, `whoami`, `clear`.

- `nano <file>` opens an in-terminal editor pane (`#term-nano`, `#nano-ta`), saves with
  Ctrl+S/Ctrl+O through `FS.write`, exits with Ctrl+X, and asks Save and exit /
  Discard / Cancel through `#nano-confirm` when dirty.
- `rm -r` is required for recursive deletion; commands stay inside the virtual FS and
  respect writable/read-only locations.

### You Are An Idiot app

- It is not preinstalled (`preinstalled=false`).
- It must behave like the old virus but inside the fake desktop: closing any idiot
  window spawns more real moving proton windows; **only “Make it stop”** ends it;
  music plays automatically.
- The fullscreen trap/cover behaviour stays removed.

### Web Retro (`apps/tools/web-retro/`)

Final GUI/behaviour decisions:

- Two clickable tabs: **ROMs** and **Emulators**. Default page is ROMs.
- GUI remake superseded desktop-style colours for this app: **black background,
  white text; hover = deep dark blue; clicked/selected = dark gray with white text**.
- Remove “Play your own ROM / pick an emulator” wording; say **Emulator**.
- ROMs tab: console boxes; clicking a box lists that console’s games with poster art;
  clicking a game auto-launches it. No Start/Play ROM button.
- Emulators tab: same console boxes; clicking an emulator first asks **proton Files
  or computer files**, then follows the existing ROM flow.
- Console boxes include the `GB · GBC · GBA` label in both Emulator and ROMs boxes.
- Titles/text are not selectable, so no blinking caret appears over launcher text.
- Console rows fill the top in four even columns (`repeat(4,minmax(0,1fr))`). The
  launcher back control (`#wr-back`) is enlarged: 28px glyph in a 56×48px button; the
  vendored webretro `.menuback a::before` arrow is also 28px.
- In-emulator back arrow returns to the chooser (posts `webretro-back`).
- Controls/keybinds persist.
- **The emulator Start button must never appear when a game boots** (reported with
  Grand Theft Auto). The Start gate was removed for all games and regression-tested;
  do not reintroduce it.

Bundled ROM library, final: **34 extracted ROMs**, no zip archives:

- N64 ×8 (`mupen64plus_next`)
- NES ×9 (`nestopia`)
- SNES ×5 (`snes9x`)
- GB family ×12 (`mgba`): GBA ×5 plus GB/GBC ×7

Covers live in `data/icons/<slug>.jpeg`, were verified against labeled contact sheets,
and are SHA-pinned in tests. Critical lesson: **never identify covers from parallel
image-tool batches**—results were once displayed out of call order, a wrong permutation
was hash-pinned, and Emerald/Red cover contents were destroyed. The reliable method is
one ImageMagick labeled contact sheet plus post-copy verification. Originals are
recoverable from git commit `0e4a8cd`.

### Games and vendored content

- Do not use the `apps/_embed/` template or remote `EMBED_URL` system for games.
  Everything using embedded links was removed. Plain `<a href>` hyperlinks may stay.
- Game pattern: files live directly under `apps/games/<id>/`, with a vendored-style
  wrapper (`GAME_PAGE`, unsandboxed local iframe), a catalog block, a raster icon,
  `cat=Games`, and tests. Every non-wrapper game HTML must be its own tested game.
- Vendoring gap pattern: supply minimal missing files (favicons, manifests, empty
  stand-in CSS/JS) rather than editing game code.
- Sources used historically include `incrediblerevived11.github.io`, proton-arcade /
  Exst Arcade, Celeste Classic sources, RohanChacko/Subway-Surfers (before removal),
  Mist0090/youareanidiot.cc for `assets/youare.mp4`, and SpaceCompany via
  sparticle999 for the game completed from that source.
- Celeste links target `celesteclassic.github.io`; never
  `math-halper.github.io/Celeste` (404). The Celeste Hub covers the eight Celeste pages
  plus its chooser.

### VLC / media player (`apps/media/media/app.html`)

The old MKV/FFmpeg-convert history is superseded. MKV support landed first, then an
FFmpeg conversion fallback existed historically, but it was deleted and replaced by a
real VLC port.

Final VLC facts:

- Catalog entry keeps id **`media`**, display name **VLC**, path
  `apps/media/media/app.html`, category Media.
- Engine: vendored libvlc-wasm 0.2.0 under `apps/media/media/vendor/libvlc/`.
  It contains `src/*.js`, `wasm/libvlc.js`, the ~25 MB `wasm/libvlc.wasm`, `wasm/VLC_COMMIT`
  (`b11917943e3a32578d65edd54f3d12023da29d46`), `fonts/NotoSans-Regular.ttf`, MIT
  `LICENSE` for the SDK, and GPL `COPYING` for the compiled engine.
- libvlc requires cross-origin isolation for SharedArrayBuffer/WASM threads. A service
  worker under `apps/media/media/` cannot isolate proton’s root page because its scope
  is limited to that subtree, so root `coi-serviceworker.js` is used. The app offers an
  on-demand **Enable VLC engine** step; the shim reloads once (guarded by
  `libvlc-wasm-coi-reloaded`), then re-serves same-origin responses with
  COOP/COEP/CORP headers. With isolation present, the app offers **Start VLC engine**.
- Files from proton Files or the user’s computer are played by libvlc itself via
  File/Blob/WORKERFS mounting; nothing is uploaded or transcoded.
- The app uses `createVLC()` and `createPlayer({ canvas, fit: 'contain' })`, not the
  `<vlc-player>` element. SDK capabilities relied on include open/play/pause/stop/seek,
  volume 0..2, mute, rate, track selection/disable, `addSubtitles`/`addAudioTrack`,
  snapshot, subtitle/audio delay, aspect/crop, deinterlace, chapters/titles, programs,
  and events such as `statechange`, `timeupdate`, `durationchange`, `tracks`,
  `volumechange`, `error`, and `ended`.

Authentic VLC look:

- The real VideoLAN traffic cone is `data/icons/vlc.png` (PNG, 256x226). It was
  rasterised from `assets/VLC_Icon.svg` in `addyosmani/vlc.js` using `@resvg/resvg-js`.
  That repo was **not** chosen as the playback engine (experimental/buggy, duplicated
  ~26 MB WASM, also needs COOP/COEP), but its cone SVG is the authentic artwork.
- Catalog now uses `icon=data/icons/vlc.png`, `svg-icon=false`. The same cone appears
  in the player stage and as audio artwork while audio plays (`showArt()` /
  `settleOverlay()`).
- Interface: classic light-grey VLC 3 Qt chrome, black stage, VLC orange `#ff7900`,
  playlist panel, seek/transport layout, and menu order **Media / Playback / Audio /
  Video / Subtitle / Tools / View / Help**. View → Playlist toggles the playlist.
- Credits for the cone and libvlc are in `CREDITS.md`; UI details are in `UI.md`.

VLC keyboard shortcuts (final implemented/documented set):

- Keys act only while the VLC window has focus and never while typing in text inputs
  or using drop-downs/sliders.
- Space play/pause; S stop; N/P next/previous; E next frame; T show position; F
  fullscreen; Esc leave fullscreen/close menu.
- B next audio track; V next subtitle track; Alt+V reverse subtitle track; Shift+V
  subtitles on/off; M mute; Ctrl+↑/↓ volume.
- Seek ladders: Shift+←/→ 3 seconds, Alt+←/→ 10 seconds, Ctrl+←/→ 1 minute,
  Ctrl+Alt+←/→ 5 minutes; Ctrl+T go to time.
- H/G subtitle delay ±50 ms; J/K audio delay ±50 ms; Shift+H/Shift+J/Shift+K subtitle
  sync bookmarks/apply; Ctrl+Shift+K reset sync; Ctrl+0 reset subtitle text scale;
  Ctrl+mouse wheel scales subtitle text.
- `+`/`-` speed ±0.5×, `[`/`]` speed ±0.1×, `=` normal speed; L repeat
  off/all/one; R shuffle.
- A aspect ratio; C crop ratio; Alt+R/D/C/F crop one pixel (Shift uncrops); D
  deinterlace; Shift+D deinterlace mode; Z/Shift+Z zoom modes; Alt+O/Alt+Shift+O scale;
  Alt+1–4 quarter/half/original/double; Shift+S snapshot; Shift+R record where the
  engine build supports recording.
- Disc/stream keys: arrows+Enter in disc menus; Shift+M disc menu; Shift+O/Shift+B
  previous/next title; Shift+P/Shift+N previous/next chapter; X/Shift+X
  next/previous program.
- File/playlist/window keys: Ctrl+O open file, Ctrl+F open folder, Ctrl+N network URL,
  Ctrl+V paste URL, Ctrl+L show/hide playlist, Ctrl+W clear playlist, Ctrl+Y save
  playlist, F1–F10 play playlist bookmark, Ctrl+F1–F10 set playlist bookmark,
  Ctrl+I media info, Ctrl+J codec info, Ctrl+M messages, Ctrl+H minimal interface,
  Ctrl+Q quit VLC; Alt+M/L/A/T/S/I/H open the corresponding menus. Multimedia keys are
  also handled where browsers provide them.
- Help → **Keyboard shortcuts** inside the app lists the set. Browser/OS-reserved
  combinations may still be intercepted before the page sees them.

VLC in a browser tab of its own (the "open the video in a new tab" request):

- Media → **Open in a new browser tab**, the **New tab** toolbar button, and
  **Alt+Enter** open `apps/media/media/player.html` with the loaded media. The tab
  boots the *same* app module out of `app.html` (no second player): `player.js`
  supplies the three globals `assets/core.js` normally provides (`registerApp`,
  `bar`, `openApp`) and the page carries `<base href="../../../">` so every path is
  written from the site root like the desktop's.
- The handover is query-string only: `kind` (`vfs`/`url`), `src`, `name`, `user`,
  `account`, plus `t` and `rate` so playback resumes where the desktop window was
  (`options.startAt` / `options.rate` are applied once, in `openEntry`). The tab
  restores the account from `proton2.*` **read-only**, with no password prompt.
- Every VLC shortcut works in the tab because it is the same key handler, and the
  tab enables cross-origin isolation itself by loading root `coi-serviceworker.js`
  (one reload) before libvlc starts.
- Honest limits kept in the UI: a computer-picked `File` cannot cross tabs (status
  line points at Media → Download / save copy… into proton Files), and Alt+Enter
  inside the tab says VLC is already in a browser tab.
- `app.html` also gained `options.url` support and `body.tabUrl()` (what the button
  would open); `quitVlc()` closes the tab when running in one. Do not rebuild this
  as a duplicated standalone player — the point is one module, one key handler.

## Pull requests and merged history

- PR #22 merged (`cb0f457`), PR #23 merged (`aa1bcaa`), PR #24 merged (`6a4958e`,
  Web Retro tabs redesign), PR #25 merged (`2750054`, Web Retro/new apps/VLC branch),
  and PR #26 merged (`c15459a` in this checkout; Terminal + VLC look + VLC shortcuts).
- Earlier merged work included vendored/cleaned games, removal of `_embed`/remote
  games and mountain games, Files plain-click fix, password gate/accounts,
  Math Helper/`proton2.*` migration, idiot-app real moving windows, removal of Your
  apps/websites, the ROM library and link sweep, box-art icons/emoji removal, and the
  Web Retro tabs redesign.
- Standing branch rule for Arena sessions: work only on the current session branch,
  push only to it, and open PRs from it. Never force-push. Expect concurrent web-UI
  commits by the user; if a push is rejected, `git fetch` + rebase, regenerate indexes,
  and retest.

## Testing, generation, and sandbox lessons

- Current test suite: `tests/system-desktop.test.cjs`. It passed **28/28** after the
  Terminal work, **29/29** after the VLC keyboard-shortcut work, and **32/32** after
  the VLC browser-tab work: the new tab's handover URL, a jsdom boot of
  `player.html` (it renders the player, titles itself after the file, lists it on the
  playlist and answers L, Ctrl+↑ and Alt+Enter), and the static wiring of
  `player.html`/`player.js` onto the shared app module.
- On a fresh snapshot, `npm test` may fail with `Error: Cannot find module 'jsdom'`.
  Fix with `npm ci --no-audit --no-fund`; that is an environment issue, not a code
  failure.
- Regeneration order matters: run `tools/gen-search-index.py` first, then
  `tools/gen-fs-manifest.py` **last**, right before tests/commit. Known generated
  states during this chat included search at 92 documents and the FS manifest growing
  from 1760 to 1761 files when `data/icons/vlc.png` was added.
- Search generator must not index vendored game trees (it once ballooned the index);
  the corpus excludes `apps/games/**` except wrappers/picker. The FS manifest must not
  exclude `dist`/`build` names, lists itself, and uses `js_string()` escaping because
  apostrophes in filenames once produced invalid JS.
- There is no real browser in the sandbox (no Chromium/Firefox/Playwright). Caret bugs
  and libvlc/WASM playback cannot be live-verified there; only static/jsdom tests and
  file-serving/preview checks are possible. Never claim browser-verified VLC playback.
- jsdom caveats learned: `video.play()` errors can fail boot tests, so autoplay code
  guards jsdom and swallows rejections; Customize number/color audit hits can be false
  positives; text-input tests must re-query live elements.
- Do not run parallel edits to the same file: simultaneous `edit_file` calls silently
  clobbered each other once. Apply same-file edits strictly one at a time and
  grep-verify afterwards. Broad recursive grep can time out; prefer `git grep`.
- Workspace snapshot quirks: local HEAD can reset with large files missing; recover via
  `git fetch`, byte-compare strays, and reset to the session branch if needed. Push
  batches promptly because snapshot artifacts are capped (~128 MB / 10,000 files).
- `gh pr edit` failed historically due to Projects classic; use
  `gh api .../pulls/<n> -X PATCH` if PR metadata must be edited.

## Dead ends that should not be retried

- Do not choose `addyosmani/vlc.js` as the playback engine; it is experimental/buggy
  and duplicates a large WASM build. Use it only as the source of the authentic cone
  artwork already rendered into the repo.
- Do not use the libvlc-wasm `<vlc-player>` element (emoji controls); use the SDK.
- Do not try to isolate proton from a service worker scoped under
  `apps/media/media/`; it cannot cover the root page. Root `coi-serviceworker.js` is
  the working static-host approach.
- A same-origin iframe inside the non-isolated proton window cannot use
  SharedArrayBuffer; that is not a workaround.
- SVG-to-PNG dead ends for the cone: `cairosvg` lacked `libcairo.so.2`; ImageMagick
  `convert` lacked the `rsvg-convert` delegate. The working path is npm
  `@resvg/resvg-js`.
- Do not identify ROM covers from parallel image batches again (see the cover lesson
  above). Do not remove games based only on noisy language stopword ratios; judge
  actual in-game language and keep anything that includes English.
- Do not reintroduce the FFmpeg “Convert & play” fallback, the old `_embed` system,
  the emulator Start gate, the bottom Math Helper trap band, or the removed
  Your apps/Your websites UI.

## Key files to know

- `index.html` — proton shell.
- `coi-serviceworker.js` — root cross-origin-isolation shim for libvlc-wasm.
- `data/password.txt` — shared password, value `hitter`.
- `data/applications.js` — app catalog (template literal; preserve the trailer).
- `data/icons/vlc.png` — authentic VideoLAN cone used by VLC.
- `data/icons/*.jpeg` — 34 verified bundled-game covers.
- `assets/fs.js`, `assets/store.js`, `assets/icons.js`, `assets/html-loader.js` —
  virtual FS, file-source/download helpers, named icons, and the app HTML loader.
- `apps/tools/web-retro/app.html` and `apps/tools/web-retro/webretro/` — launcher and
  vendored emulator runtime with 34 extracted ROMs.
- `apps/tools/terminal/app.html` — shell over the account FS with `nano` and file
  commands.
- `apps/media/media/app.html` — VLC app; `apps/media/media/vendor/libvlc/` — vendored
  engine/SDK.
- `tests/system-desktop.test.cjs` — main regression suite.
- `tools/gen-search-index.py` and `tools/gen-fs-manifest.py` — generated-index tools;
  regenerate search first and manifest last.
