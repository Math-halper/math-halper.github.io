# proton — a browser desktop (static Mixt clone), System apps, a file system, its own search engine and games

A desktop shell in your browser: Mint-style bottom panel and proton menu,
draggable/resizable windows, per-account customisation — cloned and rebranded
from [Mixt (`proton-arcade/mlp` @ `arena/170861f7-mlp`)](https://github.com/proton-arcade/mlp/tree/arena/170861f7-mlp)
and rebuilt to run as a **pure static website** (no server, no build step, no
dependencies). It ships a **black-and-white theme: black backgrounds, white
text, and white/grey accents** (no colour in the UI).

This build keeps the five desktop System apps from `main` and copies main's
**file system suite** back in — **Files**, **Text Editor**, **Image Viewer**,
**VLC** and **PDF Viewer** — and every open/save across the desktop asks
which file system to use: **your Files** (this computer) or the **proton
file system** (the Files app). The **Celeste Classics** collection ships as one app — **Celeste Hub** —
with an in-app chooser for which game to play (Celeste Classic, Celeste
Classic 2, the community hub, its practice mods, Webek and downloads), with
the *actual game files*, copied byte-for-byte from
[Math-halper/Celeste](https://github.com/Math-halper/Celeste) into
`apps/games/celeste-classic/`, `apps/games/celeste-two/` and `apps/games/celeste-community/`
(the hub in `apps/games/celeste-hub/` frames those pages;
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
own ROM files too — and it carries the maintainer's own bundled ROM library (details in [`CREDITS.md`](CREDITS.md)). The other bundled apps,
game bundles and earlier built-in sites remain removed (except Test Page).

**Mox**, a private AI workspace, joins Productivity: its site is copied
byte-for-byte from [Math-halper/mox](https://github.com/Math-halper/mox) into
`apps/productivity/mox/website/`, model included, so a small language model
(SmolLM2 135M) answers questions in your browser and nothing you type is
sent anywhere. The panel has an **AI button**, like the Copilot button on
Windows. Click the sparkle after the clock, or press **Alt+C**, and Mox
docks along the right edge of the desktop. Your windows make room for it,
and its left edge resizes it (see [AI button](#ai-button-mox)). Mox knows
every part of this website: a "proton desktop" topic in its library covers
every app, game and feature, and questions about the site are answered from
it (see [Mox knows this website](#mox-knows-this-website)).

| App (id) | What it does |
| --- | --- |
| **App Center** (`appcenter`) | Manage the built-in apps and anything saved on the account |
| **Customize** (`customize`) | Rename/re-icon/re-categorise apps, themes, wallpapers, desktop parts |
| **Settings** (`settings`) | Account, wallpaper & accent, password, backup, other accounts |
| **About** (`about`) | What this is, credits, licence |
| **Browser** (`browser`) | Tabs, back/forward, bookmarks and history; a bar that **searches this repository** when you type words and visits an address when you type one; built-in websites, external addresses, HTML files from the virtual file system and a reader that marks your matches |
| **System Monitor** (`system-monitor`) | Live CPU/memory readouts and the open windows, with a close button per window |
| **Calculator** (`calculator`) | Do quick maths from the keypad or your keyboard |
| **Clock** (`clock`) | The time and date, a stopwatch and a countdown timer that beeps when it finishes |
| **Files** (`files`) | Browse `/` and your own `/home/<you>`: create, rename, move, copy, import, search, download (folders as ZIP) |
| **Text Editor** (`text-editor`) | Open, edit and save text files in your home folder; proton's own files open read-only |
| **PDF Viewer** (`pdf`) | Read PDF files in your browser's own viewer — no extra library, nothing uploaded |
| **Mox** (`mox`) | A private AI workspace whose small language model runs on your device. Chat that cites a 55-document library, a code workspace, SVG drawing and a calculator. The panel's AI button (Alt+C) docks it beside your windows |
| **Image Viewer** (`image-viewer`) | View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist |
| **Paint** (`paint`) | Draw with a brush, shapes, an eraser and a colour picker, then save the picture into either file system |
| **Piano** (`piano`) | Play the keys, record a tune and play it back (the computer keyboard plays notes too) |
| **VLC** (`media`) | The open-source VLC media player ported to WebAssembly (libvlc): menus, playlist, seek/volume/rate, tracks and subtitles; plays audio and video itself — and **Media → Open in a new browser tab** (or Alt+Enter) plays the loaded file in a tab of its own, with the same player and the same keyboard shortcuts |
| **Terminal** (`terminal`) | A shell over the account's files: ls, cd, cat, nano, mkdir -p, touch, rm -r, cp, mv, find, stat, tree, open, clear |
| **Ruffle Flash Player** (`ruffle-flash-player`) | Load and play your own Flash .swf files |
| **Web Retro** (`web-retro`) | Play the bundled classics — or your own ROMs — N64, SNES, NES and Game Boy (webretro) |
| **2048** (`game-2048`) | Play 2048 - join the tiles |
| **Bloons Tower Defense 1** (`bloons-tower-defense-1`) | Play Bloons Tower Defense 1 - the original balloon-popping tower defense |
| **Bloons Tower Defense 2** (`bloons-tower-defense-2`) | Play Bloons Tower Defense 2 - more balloons, more towers |
| **Bloons Tower Defense 5** (`bloons-tower-defense-5`) | Play Bloons Tower Defense 5 - the classic tower defense |
| **Bloxorz** (`bloxorz`) | Play Bloxorz - roll the block to the goal |
| **Breaking The Bank** (`breaking-the-bank`) | Play Breaking The Bank - a Henry Stickmin adventure |
| **Celeste Hub** (`celeste-hub`) | All the Celeste Classic games in one place - choose which one to play (Celeste Classic, Celeste Classic 2, the community hub, practice mods, Webek and downloads; vendored from Math-halper/Celeste) |
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
| **Tetris** (`tetris`) | Play Tetris - the falling-blocks classic |
| **The Impossible Quiz** (`the-impossible-quiz`) | Play The Impossible Quiz - the wildly unfair quiz |
| **Tunnel Rush** (`tunnel-rush`) | Play Tunnel Rush - dodge through the spinning tunnel |
| **BitLife** (`bitlife`) | Play BitLife - Life Simulator in your browser |
| **Ampler Launcher** (`ampler-launcher`) | Play Eaglercraft with Ampler Launcher - seven offline Minecraft builds and skins |
| **Google Dino** (`google-dino`) | Play Google Dino - jump and duck through the endless desert runner |
| **Granny** (`granny`) | Play Granny - escape the house quietly before she hears you |
| **Evolution** (`evolution`) | Play Evolution - build creatures from joints, bones and muscles and evolve their brains |

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
  (65 apps in five category folders — `system/`, `productivity/`, `media/`, `tools/`,
  `games/` — matching the menu sections, plus one starting point:
  `apps/_template/` for a normal app). Embedded-page apps are not shipped:
  every app's files live in this repository.
  Every app's name,
  location, icon, category, description and window size is listed in **one
  catalog file** — `data/applications.js`. Add one by copying
  `apps/_template/` into `apps/inbuilt/` and adding an `[application]` block
  there; remove one by
  deleting that block. Full guide: [`apps/README.md`](apps/README.md).
- **Built-in websites:** the same catalog system — `data/websites.js`, one
  `[website]` block per site, each page a `websites/<name>/site.html`. One site
  ships: **Test Page** (`websites/test-page/`), plus `websites/_template/` as
  the starting point for a new one. Embedded-page sites are not shipped:
  every site's files live in this repository. The Browser also visits any address typed
  into its bar, opens HTML files from the virtual file system, and searches its
  own index of this repository (see **Search** below). Guide:
  [`websites/README.md`](websites/README.md).
- **Core:** `data/applications.js` (the app catalog), `data/websites.js` (the
  website catalog), `data/fs-manifest.js` (generated: every deployed file in
  this repository — the `/` tree of the virtual file system; refresh with
  `python3 tools/gen-fs-manifest.py`), `data/search-index.js` (generated: the
  searchable prose of this repository; refresh with
  `python3 tools/gen-search-index.py`), Mox's "proton desktop" knowledge topic
  (generated by `python3 tools/gen-mox-knowledge.py` from
  `tools/mox-knowledge/`; run it first, then the search index, then the
  manifest), `assets/config-loader.js` (parses both
  catalogs), `assets/store.js` (accounts/storage and the per-account defaults),
  `assets/fs.js` (the virtual file system), `assets/fs-archive.js`
  (dependency-free ZIP export), `assets/search.js` (the search engine),
  `assets/icons.js` (monochrome SVGs plus safe uploaded-image icons),
  `assets/core.js` (desktop/window manager/registries),
  `assets/desktop-icons.js` (shortcut layout, drag/drop and menus),
  `assets/html-loader.js` (loads the app modules at boot, or a `streamed=true`
  app's module on first launch), `assets/styles.css`, `assets/boot.js`.
- **Tests:** `tests/system-desktop.test.cjs` — 41 tests. The catalogs are
  exactly the 65 catalogued apps (six System apps, six Productivity, four
  Media, four Tools and 45 games) and the one test site;
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
  Page passes its own checks. Three cover Mox. One checks that the vendored
  site is complete: the real model and engine, every library document, only
  local files, and no service worker. One drives the AI button: it opens and
  closes the pane, checks the frame loads only on first open, toggles it
  with Alt+C (from inside Mox too), resizes it within its limits, hands Mox
  over to a window, and hides the button when the Customize toggle is off or
  Mox is removed. The third checks Mox's "proton desktop" topic:
  - a page for every catalogued app and a list of them all;
  - an index that matches the files, stamped with the topic's hash;
  - no password in any page;
  - Mox's own retriever finding the right page first for questions about the
    site, while its other subjects still find their own pages;
  - the site answers quoting the right part of the guide.

## Math Helper cover page

The site opens on a **Math Helper** cover page styled like a school maths
practice site (the `cover` markup in `index.html`, styled in
`assets/styles.css`, with the learning app in `assets/math-helper.js`).
The cover is a complete local practice site: the header search finds
skills, Learning opens personal recommendations, grade buttons and skill
cards start generated practice questions with instant marking and
explanations, the diagnostic builds a saved action plan, and Analytics,
Awards, Membership, About, Help centre and Privacy all open working pages.
Cover learning progress and waitlist entries are stored on this device
under `proton2.math-helper.v1`.

Joining the waitlist is separate from having an account: the waitlist form
(name, email and Family/Classroom plan) only adds an entry after the site
password from `data/password.txt` is entered correctly. A wrong or missing
password adds nobody, and creating or signing in to a desktop account
never waitlists anyone on its own.

One control keeps its separate behaviour. To enter the real proton
website the first time, type the desktop password into the header search
bar beside **Sign in** and click **Sign in**; that leads to the **Create
your account** page. Once an account has been created on that device,
entering the password is no longer needed — just click **Sign in** and the
desktop reopens. Submitting the search form itself only searches skills.
The main page area has no password entry, and (before an account exists)
a wrong password gets no visible response either.

The old bottom "Continue to Math Helper" entry band and its full-screen
video trap have been removed entirely — no control reveals, plays or
fullscreens the video any more. The media file itself stays in the
repository, unused, at `assets/youare.mp4`.

The desktop storage system has also been replaced. Current accounts and
per-account state live under the `proton2.*` localStorage namespace
(`proton2.accounts.v1`, `proton2.user.<name>.v1` and
`proton2.desktopProfile.v1`). When the site loads, every old `mhOS.*` key
is deleted from local and session storage before accounts are read, so
accounts created under the previous system no longer work and must be
created again.

## Desktop password

The password is stored in **`data/password.txt`** so it is easy to change:
edit the password line in that file (lines starting with `#` are comments),
save it, and reload the website. The default password is `hitter`.

1. Every visit — fresh or refreshed — starts on the cover. Signing out
   returns there too, with the search field cleared.
2. On the first successful sign-in — when this browser has no local
   account yet — the **Create your account** page appears; creating the
   account enters its desktop. From then on, no password is needed: just
   click **Sign in** and the profile used last time reopens, so the
   desktop, files and settings are still there. `Lock` still asks for the
   same `data/password.txt` password without signing out.
3. More local profiles can still be created later from Settings.

There is no server, so profile data lives **only in this browser**
(localStorage) and never leaves the device. Clearing browser data deletes
everything — export a backup from **Settings → Backup** first. Note that
the desktop password is a simple gate, not real security: because proton is
a static site, `data/password.txt` is readable by anyone who can view the
site's files, exactly like every other file here.

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

## VLC in a browser tab

VLC plays inside its window, and it can also take over a whole tab: **Media →
Open in a new browser tab**, the **New tab** button beside **Open…**, or
**Alt+Enter** opens `apps/media/media/player.html` with the loaded file.
That page is not a second player — `apps/media/media/player.js` boots the very
same app module out of `app.html`, so the menus, the libvlc engine and **every
keyboard shortcut** (Space, S, N/P, F, B/V, M, the seek ladders, the delay keys,
speed, repeat/shuffle, the playlist bookmarks and the Ctrl set) work there
unchanged.

What it was playing travels in the tab's URL: the proton file system path or the
network address, the account, the position and the playback rate — so the tab
opens on the same file, at the same place, and reads that account's files
read-only from the same browser storage, with no password prompt. If the tab is
not cross-origin isolated yet it loads the root `coi-serviceworker.js` and
reloads once, then plays (that is what libvlc's WebAssembly threads need).

Two honest limits: a file picked from your computer stays in the window that
picked it, so VLC tells you to *Media → Download / save copy…* it into proton
Files and open that copy in a tab; and inside the tab, Alt+Enter reports that
VLC is already in a browser tab of its own.

## VLC: audio and keys

Two things VLC gets right everywhere — MKV included, because VLC reads the file
with its own demuxer first and FFmpeg's second, so the extension never decides
whether something plays:

- **Keys follow the front window.** The shortcut handler sits on the document,
  not on the app's own box, so VLC answers its keys whenever it is the window in
  front — clicking the video is enough (and focuses the stage) — or always, in
  VLC's own browser tab. It stays out of the way of text fields, of a dialog
  opened from VLC, of the start menu and panel, and of another app's window.
- **Sound starts on the first click.** Browsers only let a page make sound after
  it has been clicked, and VLC's audio output is also the clock that paces
  playback. So the app owns the page's `AudioContext`: it is created at the first
  real click or key press inside VLC, resumed by every later one, and handed to
  the engine instead of the engine making a suspended one seconds later. If the
  browser still holds audio back mid-playback, VLC says
  *“VLC is playing, but the browser is holding the audio back”* and offers
  **Enable audio** — it never plays silently.

*Tools → Messages* reports the engine, the audio state and the output level;
*Media → Media information* lists the tracks and codecs VLC read; and a failed
open lists what it found (or says it found no tracks at all — usually an
incomplete file).

## The keyboard, and which app opens which file

- **The window in front takes the keyboard.** Clicking a window (or opening an
  app) focuses its app surface, so apps that listen for keys on their own body
  actually get them — Image Viewer's arrows and zoom keys, the Text Editor's
  Ctrl+S, the Browser's Alt+←/→ history, VLC's whole hotkey set. Clicking a
  field, a button or the video in the window already in front never moves the
  caret. Calculator, Piano and Terminal focus their own keypad, keyboard and
  prompt as they open, so they type straight away.
- **Every audio and video extension goes to VLC.** `FS.MEDIA_AUDIO` /
  `FS.MEDIA_VIDEO` in `assets/fs.js` are the single list the file system uses,
  and every one of VLC's own extensions is in it — including `.wmv`, `.mpg`,
  `.mpeg`, `.m4v`, `.3gp`, `.flv`, `.rm`, `.rmvb`, `.asf`, `.vob`, `.ts`,
  `.m2ts`, `.mts`, `.opus`, `.weba`, `.mid`, `.midi`, `.aif`, `.aiff`, `.ac3`
  and `.mka`, which used to fall through to the Text Editor as text. They are
  binary for reading and saving, and carry their real MIME type.
- **A typed save name is a name, not a path.** `/` and `\\` become `_` in every
  save dialog, so a name can never leave the folder the dialog is showing.
- **Alt+C opens and closes the AI pane** from anywhere on the desktop, inside
  Mox too. Win+C belongs to the operating system, so proton uses Alt+C. On a
  Mac, Option+C in a text field still types "ç".

## AI button (Mox)

The sparkle at the right end of the panel, after the clock, is proton's
Copilot button. Clicking it, or pressing **Alt+C**, docks **Mox** along the
right edge of the desktop, above the panel:

- **The desktop makes room.** As with the docked Copilot on Windows, maximised
  windows, the desktop icons, the date hint and toasts move to the pane's
  left instead of hiding under it. New windows open centred in the space
  that is left. On a phone-sized screen (under 760px wide) the pane covers
  the desktop instead.
- **Private and on-device.** The pane frames the vendored Mox site
  (`apps/productivity/mox/website/`), and Mox runs its own model in this
  browser with wllama (llama.cpp in WebAssembly). Nothing typed into it
  leaves the browser, and its chats stay in this browser's IndexedDB.
- **Loads on first use, then stays.** Mox starts reading its 94 MB model as
  soon as its page opens, so the pane's frame is created the first time you
  open it. A visit that never opens the pane never downloads the model.
  Closing the pane only hides it, so the conversation and the loaded model
  are still there next time.
- **Resizable.** Drag the pane's left edge, or focus it and use ← / →
  (Shift for bigger steps). It stays between 320px and 960px wide and always
  leaves the desktop 240px. The width is saved with your account.
- **Header buttons.** Reload restarts Mox, the window button hands Mox over
  to a normal window (the Mox app), and × closes the pane.
- **It is Mox's button.** It hides when Mox is removed from the menu, and
  Customize → Desktop parts can turn it off. If you rename Mox, the pane and
  the button's tooltip use the new name.

The code is the "AI button" section of `assets/core.js` (styles in
`assets/styles.css`). Mox itself is documented in
[`apps/productivity/mox/README.md`](apps/productivity/mox/README.md).

### Mox knows this website

Mox answers from a knowledge library it searches and cites, and proton adds a
**"proton desktop" topic** to that library. It is a set of pages written for
the AI, covering every part of the site:

- the Math Helper cover page and signing in;
- the desktop, the panel, the proton menu and windows;
- the AI button, files, changing the look, backups and privacy;
- keyboard shortcuts, games, troubleshooting, the credits and how proton is
  built;
- a page for every app and game, lists of them all, Web Retro's ROM library
  and the Math Helper skills.

Ask Mox "how do I change the wallpaper?", "is Mario Kart on here?" or "what
terminal commands are there?" and its sources are these pages.

- **Generated, not hand-edited.** `python3 tools/gen-mox-knowledge.py` builds
  the pages into `apps/productivity/mox/website/knowledge/proton/` and
  rebuilds Mox's `knowledge/index.json`. Its sources are:
  - the hand-written guides in `tools/mox-knowledge/guides/`;
  - one section per app in `tools/mox-knowledge/apps.md`;
  - the app catalog, plus Web Retro's, the Celeste Hub's and Math Helper's
    own lists.

  Counts and app names in the guides come from the catalog through
  placeholders. The generator stops if an app has no notes, if notes name an
  app that is gone, or if the site password would appear: Mox opens at its
  own address without a sign-in. Run it whenever an app, the catalog or a
  guide changes, **before** the other two generators.
- **Answers from the guide.** The bundled 135M model cannot restate a page
  faithfully. So while it, or no model, is running, a question whose best
  passage is about the site is answered instantly with the page's own words:
  the paragraph that covers it, under its heading, marked "From the proton
  desktop guide". Regenerate asks the model. A larger model, picked in Mox's
  model menu, writes its own answers from the same pages.
- **Tested with Mox's own code.** The tests run the retriever and the
  site-answer code from Mox's `app.js` over the library. Site questions must
  find the right page first, and questions on Mox's other subjects must still
  find those.

## Search

The Browser's bar is a search bar first: **type words and it searches, type an
address and it goes there.** proton has no server and calls no outside search
API, so the corpus is this repository — which is also the privacy story: what
you type never leaves the browser.

`python3 tools/gen-search-index.py` reads the prose of every deployed file —
the documentation, each app module's own comments, the built-in website pages
and the source comments — and writes one inverted index to
`data/search-index.js` (102 documents, ~2,800 terms, ~105 KB). Vendored sites
stay out of it: only proton's wrapper page speaks for each game, and Mox's own
55-document knowledge library is Mox's corpus, not proton's. Like
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
  running apps, clock, an AI button that docks Mox like Windows' Copilot
  (Alt+C) — Mox knows every part of the site — searchable start menu (apps
  grouped into sections),
  window
  manager (drag/resize/minimise/maximise), toasts.
- **Two file systems, one chooser** — every open/save asks whether to use
  **your Files** (this computer) or the **proton file system** (the Files
  app, in this browser): the Text Editor, Files, Image Viewer, VLC, PDF
  Viewer, Settings backups, Customize icons and Web Retro's ROM picker all
  work with either.
- **Menu sections** — the start menu groups the apps by `cat=`: **System**
  (App Center, Customize, Settings, About, Browser, System Monitor),
  **Productivity** (Calculator, Clock, Files, Text Editor, PDF Viewer, Mox),
  **Media** (Image Viewer, VLC, Paint, Piano), **Tools** (Ruffle Flash Player,
  Web Retro, Terminal, plus the not-preinstalled You Are An Idiot once
  installed) and **Games** (45 games: 2048, the Bloons TD series, the Henry Stickmin
  series, Pacman, Tetris, Slope, Tunnel Rush, the Exst Arcade batch below and more), with **My Apps** for
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
  desktop date/hint, lock & account buttons, menu search, panel labels, the
  AI button)
  instantly, and reset all customisations (including shortcut layout) without
  touching anything else. App Center, Customize and Settings are protected so
  you can't lock yourself out.
- **Everything is the static website — no adding websites.** Apps are built
  into this static site; there is no way to add a website or create an app
  from a web address in the UI. The Browser can still visit an address typed
  into its bar without saving it. The Browser start page and App Center no
  longer list an account's saved apps or saved websites ("Your apps" /
  "Your websites" sections are gone); saved data stays untouched in the
  account, and saved web-apps remain launchable from the menu as before.
  Mail, Team Chat, Meetings, G-Talk and Admin Vault were removed
  earlier; the rest of the old bundles were removed with them, apart from the
  file system suite (Files, Text Editor, Image Viewer, VLC, PDF Viewer),
  which is copied back from `main`. All saved per account.
- **Virtual file system** — `assets/fs.js` builds the full read-only `/` tree
  of this repository from `data/fs-manifest.js` plus each account's writable
  `/home/<user>/`, and Settings still counts and exports those files in a
  backup. **Files** is its manager (two layers in one tree: proton's own code
  above, your folders below), and the Browser opens any HTML page in it at
  `file:///path/to/page.html`. `FS.appFor()` maps an extension to the app that
  opens it — Browser, PDF Viewer, Image Viewer, VLC or Text Editor — and
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
all of them behind the one Celeste Hub app (see [`CREDITS.md`](CREDITS.md) for provenance; all rights in
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
redistribution rights (details in [`CREDITS.md`](CREDITS.md)). Web Retro ships
its emulator files (webretro, vendored from Gams-Offline/Gams under
GPL-3.0 — see [`CREDITS.md`](CREDITS.md)) together with the maintainer's own
bundled ROM library — mirrored as-is, each © its respective rights holders —
and it still plays ROMs you bring yourself.
