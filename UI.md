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
- **About proton** — logo + "A complete desktop computer in your browser — no
  server edition"; sections **Your account**, **What's inside** and
  **Credits & licence**.

## 10. Productivity apps

- **Files** — the full file manager over the virtual file system (a read-only
  *proton system* tree of the whole site + the account's writable home folder):
  - **App bar**: New folder, New file, **Import** (copies real files in — text
    stays editable, anything else stores exact bytes, 2 MB each), Download,
    **Tiles/列表 view toggle**, Refresh.
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
    error toasts.
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
- **PDF Viewer** — app bar with **Open…**; empty state "No PDF open" and a
  **"Your PDFs"** list; opened PDFs render in the window with a status line.
- *(Viewers share a pattern: Open… dialog with an inline path form +
  datalist, a list of matching home files, and a status line.)*

## 11. Media apps

- **Image Viewer** — **Open…**, a **Fit** / **Actual size** zoom toggle (plus
  zoom levels), the image stage, a note area, and a status line with the
  image's natural dimensions; empty state "No image open" + **"Your pictures"**
  list.
- **Media** — **Open…**, a **stage** with a native audio/video player, a
  **Playlist** sidebar (`#md-side`), a note area and a status line (metadata
  once loaded); empty state + inline "Open a media file" prompt.

## 12. Tools

- **Web Retro** — the vendored webretro emulator launcher. Its front page is
  a black-bordered split view (stacked in narrow windows): a **Roms** column
  on the left, about 40% wide, beside an **emus** pane:
  - **Roms**: a header over four big console rows running top to bottom —
    **NES**, **SNES**, **N64**, **GB** — split by thick black lines, the
    picked row filled black;
  - **emus**: a header over the picked console's bundled games in a
    box-art + title grid (click one to play it on its matching core; SNES
    has none bundled yet), then **Play your own ROM** as four emulator
    rows, one per console (nestopia / snes9x / mupen64plus_next / mgba).
    Picking a row swaps the pane to a "where from?" screen — a top bar
    with a **←** back arrow, then **From proton OS Files** (a mini file
    browser over the account's home: crumbs, folder rows, ROM rows, one
    level at a time) or **From your Files** (the device file picker), and
    **Play ROM**; a saves/CREDITS note sits under the grid;
  - launching swaps the window to the emulator; **Change game** in the app bar
    returns to the chooser. Control bindings persist between games:
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
