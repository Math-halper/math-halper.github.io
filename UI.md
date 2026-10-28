# proton UI — every part, in detail

proton is a complete desktop that runs entirely in the browser, with no server:
accounts, files and settings live in this browser's storage. This document walks
through **every visible part of the UI**, layer by layer, from the first page
load to the internals of each app.

---

## 1. Page shell, boot splash

- **Noscript banner** — if JavaScript is off, a plain banner explains that proton
  needs JavaScript ("it is a full desktop that runs entirely in your browser").
- **Boot splash (`#boot`)** — a full-screen dark gradient card shown while the
  app/website modules load: the atom-orbit logo, the word **proton**, the tagline
  "Your browser desktop", and an animated progress bar. It fades out once boot
  finishes (0.4s fade).

## 2. The Math Helper cover page (every visit)

The first thing every visit sees is *Math Helper* — a full IXL-style
maths-practice site whose ordinary controls all work locally. Search,
grade browsing, generated practice with instant marking, a six-question
diagnostic, recommendations, awards, analytics, membership and the
information pages run in `assets/math-helper.js`; learning progress is
saved in `proton2.math-helper.v1`. It shows no indication that anything
is broken: there is no outage banner, error label or empty progress bar
anywhere. The way in to proton the first time is still the **header
search bar**: type the desktop password (stored in `data/password.txt`)
into it and click the **Sign in** button immediately beside it, which
leads to **Create your account**. Submitting that search form itself only
searches skills — it never opens the desktop. Once an account exists on
this device, the password is not asked for again — clicking **Sign in**
alone reopens the desktop, whatever is (or isn't) in the search bar. A
page refresh or signing out returns to the cover either way; before an
account exists, a wrong password gets no visible response.

Desktop accounts now live in the `proton2.*` storage namespace. On load,
all old `mhOS.*` local/session keys are deleted before any account is
read, so profiles from the previous storage system no longer work.

- **Header** — "Math Helper" logo button (returns to the top and closes
  the workspace), working nav (Learning · Diagnostic · Analytics ·
  Membership), the compact skill search bar, and the **Sign in** button
  right next to it. Only **Sign in** is the desktop gate.
- **Hero** — eyebrow "Mathematics · Pre-K to Year 12", headline and
  description, plus working *Start practicing* and *Take a diagnostic*
  buttons. There is no password entry in this main area.
- **"Today for you" side panel** — two clickable recommendation rows
  (Multiply fractions 72%, Solve two-step equations 45%) with matching
  progress bars, a *Recommended* badge, a working *Resume practice*
  button, and "Recommendations update as you practice." Progress bars
  across the cover update as questions are answered.
- **Math Helper workspace** — appears below the hero for search results,
  Learning/recommendations, grade pages, all-skills browsing, practice
  questions with explanations, the diagnostic and its action plan,
  Awards, Analytics, Membership (Free chosen instantly; Family and
  Classroom via the waitlist) and About / Help centre / Privacy pages.
  The waitlist form (name, email, plan and the site password) only adds an
  entry when the password from `data/password.txt` checks out; a desktop
  account alone never joins the waitlist.
- **Explore by grade** — a grid of grade buttons Pre-K → 12, each with a
  skill count, plus "See all grades"; every grade opens its own practice
  paths.
- **Popular maths skills** — six skill cards (Fractions, Multiplication,
  Algebra, Geometry, Decimals, Statistics), each with tag, title, blurb, a
  live progress bar and *Start skill*; the section header has a
  "See all skills" link.
- **Diagnostic band** — "Find exactly what to practice next" + *Start diagnostic*.
- **Made for families and classrooms** — three feature cards (Personal
  recommendations, Awards and certificates, Progress reports) whose links
  open the matching workspace pages.
- **Footer** — brand line and working About / Help centre / Membership /
  Privacy links.
- **Waitlist band** — a **Join waitlist** button that opens the waitlist
  form in the workspace. Joining requires the site password from
  `data/password.txt`; a local account by itself is not enough, a wrong
  or missing password adds nobody, and a correct password confirms the
  place and lists the entry (with a remove option) on this device.
- There is no bottom entry band any more: the old "Continue to Math
  Helper" button and its full-screen video trap were removed entirely.
  `assets/youare.mp4` stays in the repository but is unused — no control
  reveals, plays or fullscreens it. The only way into proton remains the
  header **Sign in** — with the password in the search bar the first
  time, and on its own once an account exists on the device.

## 3. Auth screens

Once an account exists on this device, desktop entry needs neither an
account form nor the password: clicking **Sign in** on the cover opens the
local profile used last time. On the very first sign-in, when no local
account exists yet, the password gate instead shows **Create your
account**, and submitting it creates the profile and enters the desktop. The three card screens below share one shell — the atom
logo, an `h1` title, a subtitle line, and the form body, centred on a dark
backdrop — and cover locking plus the extra local profiles managed from
Settings.

- **Create your account** (shown after the cover gate on the first sign-in,
  via the "Create an account" link, or Settings → Create another account) —
  explains the no-server model in a note. Fields: **Display name**, **Username**
  (letters/numbers/`_`, 3–20 chars), **Email** (optional, never sent anywhere),
  **Password** and **Confirm password** (6+ chars). Inline error line for
  mismatches/taken usernames. Submit button: "Create account & enter desktop".
  A footnote explains salted SHA-256 hashing, per-account browser storage and
  that clearing browser data deletes everything (backup from Settings). Avatars
  are not chosen: they are the account's **initials** on a dark-grey circle.
- **Sign in** ("Welcome back") — **Username** dropdown listing this device's
  accounts (`username — display name`), **Password**, error line
  ("That password is not right… Passwords are case-sensitive."), *Sign in*
  button, "New to this device? Create an account" link, and a note explaining
  that refreshing signs you out while **Lock** only hides the desktop.
- **Desktop locked** — avatar circle + display name + `@username`, a single
  **Password** field (autofocused), *Unlock* button, and a "Sign out instead"
  link. It asks for the same `data/password.txt` desktop password as the
  cover gate. Incorrect passwords get "Incorrect password — try again."

Every page load starts signed out, back on the cover; the profile used last
time is remembered on device and reopens when entry is allowed — after the
password gate the first time, or a plain **Sign in** click once an account
exists.

## 4. The desktop surface

Behind everything sits the **wallpaper** — a full-window gradient layer. Five
built-ins (Mint, Ocean, Sunset, Grape, Slate — all monochrome grey/slate
radial+linear gradients) and any custom two-colour gradients. It cross-fades
(0.4s) on change.

- **Desktop hint** (top-left, toggleable) — today's date
  ("Monday, 12 October") plus the instruction line "Double-click a shortcut or
  open the proton menu".
- **Desktop icons / shortcuts** — a grid of movable shortcut tiles in a scrollable
  icon area (a shortcut is either an **app** or a **file/folder path**; max 200
  per account). Each tile shows the app icon or a folder/file glyph, its name,
  and supports: click to select (highlight + enables the tools buttons),
  double-click to open, drag to move (cells swap on collision), right-click for
  a shortcut menu, and keyboard focus. Renames of files follow shortcuts.
  New accounts start with default shortcuts.
- **Desktop tools bar** (bottom of the icon area) —
  **Open selected**, **Remove selected** (both hidden until something is
  selected; an ×/"remove" glyph button) and **Add icon** (plus).
- **Desktop context menu** (right-click the wallpaper; `role="menu"`) —
  three variants:
  - on a shortcut: **Open**, separator, **Remove shortcut (keep original)**;
  - on an app icon: **Open <name>**, **Add to desktop / Remove from desktop**;
  - on empty desktop: **Add application…**, **Add file or folder…**, separator,
    **Arrange icons** (reflows the grid).
  The menu positions itself inside the viewport, the first item takes focus,
  and focus returns to the opener on close.
- **Add application picker** — a modal dialog (`role="dialog"`, dimmed backdrop)
  titled "Add application": a live search box, an A–Z list of every non-hidden
  app (icon glyph, name, category, a **+** or an "*On desktop*" badge), an
  empty state ("No matching apps."), a close ×, and the help line "A shortcut is
  a link: removing it never deletes the app."
- **Add file or folder picker** — same dialog pattern for paths: a text input
  that filters the home folder's files/folders (or accepts **any** typed path,
  e.g. `/README.md`, including the read-only proton system tree; Enter adds it),
  list rows with folder/file glyphs + full path + On-desktop badges, and help
  text covering the alternatives (right-click → *Add desktop shortcut* in
  Files, or drag a Files entry onto the wallpaper).

## 5. Panel (the taskbar, 44px, bottom)

Left → right:

- **proton menu button** — atom logo tile + the word **proton**; toggles the
  start menu (and lights up while it's open).
- **App buttons area** (`panel-apps`, horizontally scrollable) — one button per
  pinned app plus one per running app (hidden apps excluded). Each button is
  **icon-only** (the name shows only if "Names next to panel icons" is on in
  Customize) with a hover tooltip (`Title (open)` when running). States:
  **running** (underline), **active** (accent underline + tint), **min**
  (dimmed). Click behaviour: not running → open; running & not active → focus;
  running & active → minimise.
- **Tray** — **Lock** padlock button, **Account & settings** button showing the
  user's initials avatar (opens Settings), and the **clock**: bold `--:--` time
  over a short date ("12 Oct"), refreshing every 15 seconds.
- **Toggles** (Customize → Desktop parts): clock, desktop hint, lock button,
  user button, start-menu search, panel labels can each be shown or hidden.

## 6. Start menu (the "proton menu")

A popup above the menu button, with:

- **Search box** (live filter over name + description; hideable). Empty search
  state: "No apps match “…”."
- **Category sections** in fixed order — **System**, **Productivity**,
  **Media**, **Tools**, **Games**, **My Apps**, then any custom category —
  each with a small grey header and a grid of app buttons (icon + name; tooltip
  "Open <name> · drag to desktop to add a shortcut"). Buttons are draggable
  onto the wallpaper to create shortcuts. Apps order within a section by their
  catalog/Customize order.
- **Footer** — the account chip (avatar initials, display name, `@username ·
  signed in for this visit`), a **Lock** button and a **Sign out** button.

## 7. Windows

Each app runs in one window (one per app; opening again focuses it and can hand
it a new file/URL via `openPath`).

- **Title bar** (38px, Mint-Y-style gradient) — the app icon, the app name
  (ellipsis on overflow), and three round buttons: **— Minimise**, **□
  Maximise** (a square glyph; toggles the `.max` state), and **× Close** (the
  close button is visually distinct). Inactive windows dim their title bar.
- **Body** — the app's own UI (below).
- **Resize grip** — a 20px corner handle (bottom-right); minimum window is
  300×200. Hidden while maximised.
- **Behaviours** — drag by the title bar (buttons excluded; clamped to the
  viewport), double-click the title bar to maximise/restore, click anywhere to
  focus (z-order stacks, max z tracked), mobile widths (<760px) open maximised,
  windows open centred with a small cascade offset. Apps may veto closing
  (`beforeClose`) and clean up (`onDestroy`). A crashing app shows an in-window
  error card: "«App» hit a snag" with the message.
- **The window in front owns the keyboard** — both a window and its app body
  are focus targets (`tabindex="-1"`, no outline; the active title bar shows
  it), and `focusWin()` moves the focus onto the app body whenever a window
  comes forward, so an app's own key listener (Image Viewer, Text Editor,
  Browser, VLC) actually receives its keys. The focus is only moved when it is
  not already inside that window, so clicking a text field or a video in the
  window already in front keeps the caret where it is.
- **Shared app chrome** — most apps begin with an **app bar** (`appbar`): a
  bold `h2` title followed by action buttons; content sits in `app-main`
  (optionally `.pad`). Common widgets throughout: `.btn` (`.sm`, `.primary`,
  `.danger`, `.block`), labelled `.field` inputs, `.card` / `.grid-cards`,
  `.split` + `.side` sidebars, `.listrows` / `.rowitem` list rows, `.chip`
  badges, `.muted` secondary text, and status lines.

## 8. Toasts

Small messages stack at the **bottom-right**, above the panel (`aria-live`).
They fade out after ~3.4 seconds. Used for confirmations and errors ("Account
created — welcome!", "File not found: …", "Storage is full — some changes could
not be saved.", etc.).

## 9. System apps

- **App Center** — search field ("Search apps") in the app bar; an
  info card ("Everything here is part of the static proton website"); and an
  **All apps** section, where every built-in app gets a card (icon, name,
  description, meta) with **Open**, **Pin/Unpin**, **Remove** (non-protected
  apps; removed apps show dimmed with **Add back**), and **Reset** when the
  app has customisations. Saved web-apps and saved websites are not listed
  here any more.
- **Customize — everything is a module** — the personalisation hub:
  - shortcut button to **Manage apps in App Center**;
  - **App modules**: a search field and one card per app with **Open**,
    **Pin**, **Remove** and editors for **Icon** (themed vector name, catalog
    image, or your own uploaded raster image up to 8 MB — clearable),
    **Name**, **Category**, **Order**, **Description**, **Save changes** /
    **Reset**;
  - **Themes**: the built-in *proton Dark* card (with an **Accent** dropdown —
    White, Silver, Light grey, Grey, Dark grey — and an *Active* chip) plus
    user themes (name, accent colour picker, wallpaper select) with Apply /
    Save / Delete, and an "Add & apply theme" form;
  - **Wallpapers**: cards for the five built-ins (preview strip + Apply or
    *Active*) and custom two-colour gradients (name, colour 1, colour 2) with
    an "Add & apply wallpaper" form;
  - **Desktop parts**: the component toggles (clock, desktop hint, lock
    button, user button, start search, **Names next to panel icons**), plus
    **Add application icon** and **Arrange icons**;
  - **Start over** — "Reset customisations" (danger button).
- **Settings** — account-side configuration, sectioned with icons:
  **Wallpaper** and **Accent colour** pickers; **Profile** (display name,
  email + Save); **Desktop password** (a note that it lives in
  `data/password.txt` and is changed by editing that file); **Backup
  (export / import everything for this account)** — "Export backup (.json)…"
  and "Import backup…"; quick actions (Lock, Sign out, open Customize, add
  account); **Accounts on this device** (list of local accounts); and a
  **Danger zone**: "Delete my account & all its data".
- **Browser** — app bar with **Home** and a "Built-in websites…" dropdown; a
  second dark bar with a lock glyph, the **URL field** (starts at
  `proton://home`) and **Go**. The home page is "Welcome to the (tiny) proton
  web": cards for each built-in website (icon, name, description, *Visit*).
  Saved websites are not listed on the start page any more. Pages load in a sandboxed
  iframe (`allow-scripts allow-same-origin allow-forms allow-popups`).
- **System Monitor** — live CPU and memory readouts that refresh on a timer,
  the open windows as rows (each with its **Close** button), and a stats line
  (open windows, apps, storage). It watches the real desktop state, so closing
  a window from here closes that window.
- **About proton** — logo + "A complete desktop computer in your browser — no
  server edition"; sections **Your account**, **What's inside** and
  **Credits & licence**.

## 10. Productivity apps

- **Files** — the full file manager over the virtual file system (a read-only
  *proton system* tree of the whole site + the account's writable home folder):
  - **App bar**: New folder, New file, **Import** (copies real files in — text
    stays editable, anything else stores exact bytes, 2 MB each), Download,
    **Tiles/list view toggle**, Refresh.
  - **Nav bar**: **↑ Up** (Alt+↑), breadcrumb trail (`/ › Home › Documents`),
    a path field + **Go**, and a recursive **Search under here…**.
  - **Sidebar**: "Your folders" places and a "proton system (read-only)" list.
  - **Pane toolbar**: filter-this-folder box, sort by Name/Size/Modified,
    Clear search, **Select all**, **Delete** (danger).
  - **Rows/tiles**: icon, name, size or item count, date or "read-only";
    selection, multi-select, right-click **menu** (open, rename, download,
    properties, add desktop shortcut…), and a **Properties** panel.
  - All prompts are **inline forms** (never `window.prompt`): rename/create
    with folder datalists, "(2)" de-duplication, read-only guards with clear
    error toasts. Names typed into any save dialog are names, not paths —
    `/` and `\\` in them become `_`, so a typed name can never leave the folder
    the dialog is showing.
- **Text Editor** — app bar with **Open…**, **New**, **Save…** (enabled once
  there is something to save), Copy, a status line and the edit area; when
  nothing is open it shows "Nothing open yet" plus a **"Your text files"** list.
  Save-as uses the inline prompt (default `Home/Documents/notes.txt`); files
  opened from the device are copied into home first so the original is never
  touched.
- **Calculator** — a card with a small right-aligned **tape** (pending
  expression) above a large 32px display (`aria-live`), and a 4-column keypad:
  AC, ⌫ (delete digit), ±, ÷ / 7 8 9 × / 4 5 6 − / 1 2 3 + / 0 . = with the
  operator column in the accent style. The keyboard drives the same state
  machine (digits, `+ - * /`, Enter = equals, Backspace, Esc/c = clear).
- **Clock** — the live time and date, a **stopwatch** (Start/Pause, Reset) and
  a **countdown timer** (minutes field, Start/Stop) that beeps when it reaches
  zero.
- **PDF Viewer** — app bar with **Open…**; empty state "No PDF open" and a
  **"Your PDFs"** list; opened PDFs render in the window with a status line.
- *(Viewers share a pattern: Open… dialog with an inline path form +
  datalist, a list of matching home files, and a status line.)*

## 11. Media apps

- **Image Viewer** — **Open…**, a **Fit** / **Actual size** zoom toggle (plus
  zoom levels), the image stage, a note area, and a status line with the
  image's natural dimensions; empty state "No image open" + **"Your pictures"**
  list.
- **VLC** (the `media` app) — a port of the open-source VLC media
  player, dressed as the real thing: the VideoLAN traffic cone as its
  icon (`data/icons/vlc.png`, also the stage artwork) and the classic
  light-grey VLC 3 chrome. Its menus run in desktop VLC's order
  (**Media / Playback / Audio / Video / Subtitle / Tools / View /
  Help** — View toggles the playlist panel), a **Playlist** sidebar (`#vlc-playlist`),
  the libvlc video canvas (`#vlc-canvas`), seek bar, play/pause/stop/
  previous/next, repeat and shuffle, playback-rate and volume controls,
  fullscreen, snapshots, audio/video/subtitle track selection and
  external subtitle/audio files, plus a status line. The keyboard works
  like desktop VLC (Help → **Keyboard shortcuts** lists the set):
  **Space** play/pause, **S** stop, **N**/**P** next/previous, **B**
  next audio track, **V** next subtitle track (**Alt+V** reverse,
  **Shift+V** on/off), **M** mute, **Ctrl+↑/↓** volume, the
  **Shift/Alt/Ctrl(+Alt)+←/→** seek ladders (3 s / 10 s / 1 min /
  5 min), **H**/**G** and **J**/**K** subtitle/audio delay, subtitle
  sync bookmarks (**Shift+H**/**J**/**K**, **Ctrl+Shift+K** reset),
  **+**/**−**/**[**/**]**/**=** speed, **L** repeat, **R** shuffle,
  **E** next frame, **F** fullscreen, **A**/**C** aspect/crop,
  **D** deinterlace, **Z** zoom, **Shift+S** snapshot, disc-menu /
  title / chapter keys, playlist bookmarks (**F1–F10**, set with
  **Ctrl+F1–F10**), and the **Ctrl+O/F/N/V/T/L/W/Y/I/J/M/H/Q** file,
  playlist and window shortcuts. The key handler sits on the document,
  so keys work as in desktop VLC: **VLC answers them whenever it is the
  window in front** — clicking the video is enough, and clicking the
  picture also focuses the stage — or always, in VLC's own browser tab.
  They never fire while typing in a text box or drop-down, while a
  dialog opened from VLC is up, or while another app's window or the
  start menu holds the focus.
  **Audio out**: browsers only allow sound after a page has been
  clicked, so VLC owns the page's `AudioContext` — created at the first
  real click or key press inside VLC, resumed by every later one, and
  handed to the engine (`createPlayer({ audioContext })`) instead of
  letting it make a suspended one seconds later. If the browser still
  holds the audio back while a file plays, the app says so
  ("VLC is playing, but the browser is holding the audio back") and
  offers an **Enable audio** button that resumes it inside a click,
  rather than playing silently. Closing the window or tab closes that
  context. *Messages* reports the audio state (and the worklet's level),
  and a failed open lists the tracks and codecs VLC did read.
  Playback is by the
  vendored libvlc engine compiled to WebAssembly
  (`apps/media/media/vendor/libvlc/`, see CREDITS.md), so VLC itself
  plays formats the browser cannot decode — nothing is transcoded or
  uploaded. libvlc needs a cross-origin isolated page (SharedArrayBuffer);
  until the **Enable VLC engine** button has loaded the root
  `coi-serviceworker.js` shim and proton has reloaded once, the player
  shows that prompt and queues the chosen file instead of playing it.
  - **Open in a new browser tab** — the **New tab** button beside
    **Open…**, *Media → Open in a new browser tab*, or **Alt+Enter**
    opens `apps/media/media/player.html` in a new tab with the loaded
    media, where VLC gets the whole tab. That page boots this very app
    module (`apps/media/media/player.js` supplies the three globals
    `assets/core.js` normally provides: `registerApp`, `bar`,
    `openApp`), so it is the same player, the same menus and the same
    keyboard shortcuts — nothing is reimplemented. The handover rides in
    the query string: `kind` (`vfs`/`url`), `src`, `name`, `user` and
    `account` (the tab then reads that account's storage read-only, with
    no password prompt), plus `t` and `rate` so playback resumes where
    the desktop window was. In the tab the **New tab** button is not
    shown and **Alt+Enter** says VLC is already in a browser tab of its
    own. If the tab is not cross-origin isolated yet it registers the
    root `coi-serviceworker.js` itself and reloads once, then plays.
    A file picked from the computer cannot be handed over (only the
    picking window holds it): the status line says so and points at
    *Media → Download / save copy…* so the copy in proton Files can be
    opened in a tab.

- **Paint** — a canvas with a brush, shapes, an eraser and a colour picker,
  **Clear**, and **Save** into either file system (a PNG in your files this
  computer, or one in proton Files).
- **Piano** — a two-octave keyboard drawn as real keys: click or drag across
  them, or play them from the computer keyboard (the keys take the keyboard as
  the app opens). **Record** captures what you play and **Play back** replays
  it.

## 12. Tools

- **Terminal** — a shell over the account's virtual file system: the app bar
  names it, a scrollback pane prints the session and a prompt line takes the
  command. Commands: `help`, `ls`, `cd`, `pwd`, `cat`, `echo`, `nano`, `tree`,
  `mkdir`, `touch`, `rm`, `cp`, `mv`, `find`, `stat`, `open`, `date`,
  `whoami`, `clear`, with **↑/↓** for history. Flags are parsed the way a
  shell writes them — `mkdir -p A/B/C` makes the parents (it used to make a
  folder called `-p`), `mkdir -q` says which option it does not know,
  `touch a.txt b.txt` makes both files, `rm -rf A` removes a whole tree and
  refuses to delete the folder it is standing in. There are no pipes and no
  redirection, and the terminal says so instead of echoing `hi > file` back.
  `nano <file>` opens the in-terminal editor (^S saves, ^X exits, with a
  Save/Discard/Cancel prompt when the buffer is dirty).
- **Web Retro** — the vendored webretro emulator launcher. Its front page
  is a black GUI with white text and two clickable tabs (the **ROMs** tab
  is the default); hovering any option turns it deep dark blue, and a
  picked option sits dark gray with white text. Text in the launcher is
  not selectable, so no text caret appears over titles or labels:
  - **ROMs**: four console boxes — **NES**, **SNES**, **N64**, **GB** —
    in one row of four equal columns filling the full width of the top of
    the tab, each showing its bundled-game count (the GB box names all its
    parts: GB · GBC · GBA); picking a box brings up that console's bundled
    games in a poster-art + title grid (click a game to play it on its
    matching core); a saves/CREDITS note sits under the grid;
  - **Emulators**: the same four console boxes in the same full-width,
    evenly split row, one per core (nestopia / snes9x / mupen64plus_next /
    mgba). Picking one turns it dark gray and swaps to a "where from?"
    screen headed **Emulator — <console>** — a top bar with a large
    **←** back-arrow button to the boxes, then **From proton Files** (a
    mini file browser over the account's home: crumbs, folder rows, ROM
    rows, one level at a time) or **From your Files** (the device file
    picker). Picking a ROM launches it at once — there is no start button;
  - launching swaps the window to the emulator; **Change game** in the app bar
    brings up the chooser (the **ROMs** tab) again, and so does the
    emulator's own menu-bar back arrow (drawn larger than upstream, with a
    wider click target). Control bindings persist between games:
    keys set in the emulator's **Controls → Keybinds** manager (press
    **Save**) or in RetroArch's own menu (Settings → Input, then quit
    RetroArch or save the current configuration) are kept and reapplied
    on the next launch.
- **Ruffle Flash Player** — the shared Flash runtime for all 12 Flash games
  and any `.swf` you own: app bar with the player path label, **Reload** and
  **Open in new tab**, the Ruffle player in a fullscreen-capable frame
  (autoplay/fullscreen/pointer-lock/gamepad allowed), and a footer credit
  strip (Ruffle is MIT/Apache-2.0, from Gams-Offline/Gams).

## 13. Games

- **Game window wrapper** (every game app) — app bar with the game name and a
  muted label of the framed game page (e.g. `apps/games/slope/slope.html`),
  **Reload**, **Open in new tab**, then the game itself in a frame with
  `allowfullscreen` (the window supports fullscreen play; the frame is the
  game's own build, unmodified).
- **Games picker page** (`apps/games/index.html`) — a standalone static page
  outside the desktop listing every game as a link with a one-line
  description; it exists for direct browsing and points into the same folders.

## 14. Built-in websites and "My Apps"

Built-in sites (`websites/<id>/site.html`, catalog `data/websites.js` — the
**Test Page** is the only one) are framed by the Browser at `proton://<id>`.
Accounts can carry **saved web-apps** (category **My Apps**): each opens as a
window with the site's name, its URL in muted text, **Reload** and **Open in
new tab**, the site in a sandboxed frame, and a note that if the site refuses
to embed you should use "Open in new tab" (proton never proxies it).

## 15. Visual language & theming

- **Overall look** — dark, monochrome, Mixt/Mint-Y-inspired window chrome:
  near-black surfaces, light text, subtle borders, deep window shadows, rounded
  7px corners. Danger actions are red; secondary text is `.muted`.
- **Accent** — a black-and-white scale: White, Silver, Light grey, Grey, Dark
  grey (each with computed dim/soft shades and correct black/white ink for
  text on top). Custom themes may use any colour; old coloured accents resolve
  to White. The accent drives primary buttons, focus/active underlines, the
  menu-logo tile and more via CSS variables (`--accent`, `--accent-dim`,
  `--accent-soft`, `--accent-ink`).
- **Themes** — *proton Dark* plus user themes (name + accent + wallpaper), one
  active at a time.
- **Wallpapers** — Mint, Ocean, Sunset, Grape, Slate (grey gradient
  compositions) + custom two-stop gradients.
- **Icons** — two modes per app: a **themed inline SVG** from `assets/icons.js`
  (stroke = `currentColor`, recolours with the theme) or a **catalog raster
  image** (`data/icons/*.png` — e.g. the games' own artwork); Customize can
  override any app with an uploaded image. Avatars are generated initials, not
  images.
- **Window title bars** use a vertical gradient (`--titlebar-a/b`), dimming to
  85% opacity when inactive.

## 16. Interaction & accessibility notes

- Prompts are inline forms; `window.confirm` is used only for destructive
  confirms. Every button carries sensible `title` tooltips (panel buttons show
  "(open)" when running; icons say "Open X · drag to desktop…").
- Landmarks/roles: `role="menu"`/`menuitem`/`separator` for context menus,
  `role="dialog"` + `aria-modal` for the desktop pickers, `role="status"` +
  `aria-live` for toasts, `aria-label`s on icon-only controls
  and search fields, `aria-current` on breadcrumb crumbs, focus return after
  menus/dialogs close.
- Keyboard: calculator fully keyboard-driven; Alt+↑ in Files; Enter accepts
  path/search inputs; window close/min/max are real buttons (focusable).
- Double-click opens desktop shortcuts; drag moves them; start-menu apps drag
  onto the desktop; Files entries can be dragged out or right-clicked for
  "Add desktop shortcut".
- Everything is per-account and on-device: refreshing signs you out to the
  cover (Lock is the way to hide without signing out), and
  Settings can export/import a JSON backup or delete the account entirely.
