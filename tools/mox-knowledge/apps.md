# Notes for every app and game on proton

tools/gen-mox-knowledge.py turns each section below into one page of Mox's
"proton desktop" library topic, apps/productivity/mox/website/knowledge/proton/apps/<id>.md,
under a header it writes from the app catalog (data/applications.js): the
app's name, menu section and description. Write what someone needs to use
the app: what it does, its buttons and controls, and tips. Every catalog app
needs a section, headed with its id exactly; the generator stops if one is
missing or if a section names an app that no longer exists.

## appcenter

App Center is where you manage proton's apps. At the top is a "Search apps" box that filters by name and description. A card explains that everything here is part of the static proton website, so adding websites or web-address apps is switched off.

Under All apps, every app has a card with its icon, name, description and menu section, and these buttons:

- **Open** starts the app.
- **Pin** or **Unpin** keeps the app's button on the panel, or takes it off.
- **Desktop icon** or **Remove desktop icon** adds or removes the app's desktop shortcut.
- **Remove** takes the app out of the proton menu, the panel and the desktop. App Center and Settings are marked Built-in and cannot be removed, so you can always get back to managing apps.

Removed apps stay listed, dimmed and marked Removed, with an Add back button. You Are An Idiot, the one app that is not preinstalled, shows Install instead.

## customize

Customize is proton's personalization hub: everything on the desktop is a module you can change, per account. To rename an app, open Customize, find the app under App modules, type a new Name and press Save changes. It has five sections.

- **App modules**: a search box and a card for every app with Open, Pin and Remove, and editors for its Icon (a built-in vector icon, the catalog picture, or your own uploaded image up to 8 MB), Name, Category (its menu section, or a new section you type), Order (its place in the section) and Description. Save changes applies them; Reset puts that app back as it was. Edited apps are marked Edited.
- **Themes**: the built-in proton Dark theme with its Accent choice (White, Silver, Light grey, Grey or Dark grey), plus your own themes, each a name, an accent color and a wallpaper, with Apply, Save and Delete. "Add & apply theme" makes a new one.
- **Wallpapers**: the five built-in gradients (Mint, Ocean, Sunset, Grape and Slate) and your own two-color gradients. "Add & apply wallpaper" makes a new one.
- **Desktop parts**: switches for the clock, the date and hint on the desktop, the lock button, the account button, the search box in the proton menu, names next to panel icons, and the AI button in the panel. Desktop icons has Add application icon and Arrange icons.
- **Start over**: Reset customisations returns every name, icon, removed app, pin, theme, wallpaper, desktop part and shortcut to proton's defaults, without touching your files.

Changes in Customize apply instantly; nothing reloads and no windows close.

## settings

Settings holds your account's options. Open it from the account button with your initials in the panel, from its desktop shortcut or from its pinned panel button. Its sections, top to bottom:

- **Wallpaper**: pick Mint, Ocean, Sunset, Grape, Slate or one of your own wallpapers. Open Customize makes new ones.
- **Accent colour**: White, Silver, Light grey, Grey or Dark grey.
- **Profile**: your display name and an optional email that stays on this device, with Save profile.
- **Desktop password**: a note that the password is kept in data/password.txt in the site's files and can only be changed by editing that file; Settings cannot change it.
- **Backup**: "Export backup (.json)…" saves everything for this account into one file, on your computer or in proton Files; "Import backup…" restores one.
- **Accounts on this device**, with "+ Create another account", Lock desktop and Sign out.
- **Danger zone**: "Delete my account & all its data", which cannot be undone.

## about

About proton describes the website: the proton logo and the line "A complete desktop computer in your browser", then the sections Your account (how your account and data are kept in this browser), What's inside (every app on the desktop, with its icon) and Credits & licence (proton is a static clone of Mixt, licensed AGPL-3.0, with code concepts from Puter; the full notes are in CREDITS.md and LICENSE.txt). It also credits Mox's bundled model and engine, and has a "View the original project" button that opens the Mixt repository.

## browser

The Browser is a real tabbed web browser with proton's own search engine behind its address bar.

- **Tabs**: the + button opens a new tab; each tab keeps its own page, back and forward list.
- **Back, forward, reload and stop** buttons, plus Alt+Left, Alt+Right and Alt+Home on the keyboard.
- **The address bar**: type an address to go there, or type words to search. Suggestions appear as you type: apps, built-in websites, proton's own pages, your bookmarks and history, file names and words used in this website. Use the up and down arrows to pick one.
- **The star** bookmarks the current page. Bookmarks and History each have a page (proton://bookmarks and proton://history), saved with your account.
- **The Built-in websites menu** opens sites such as the Test Page.

The start page, proton://home, has a search box, the built-in websites and some suggested searches.

**Searching this website**: the Browser's search answers from an index of this website's own documentation, app descriptions, code comments and file names, built into the site, so no outside search engine is used and nothing you type leaves the browser. Results that are really about your words are listed first, and pages where a word only turns up are listed under "Mentioned in passing". When nothing on the site explains a word, the results page says so plainly, because proton is not a dictionary. Click a result to open it in the reader (proton://read), which marks every match and can hand the file to the Text Editor or Files. Your own files are not in this index; search them with Files.

**Other pages**: the Browser opens HTML files from the file system at file:/// addresses and real websites in a sandboxed frame. Many websites refuse to be shown inside another page; the Browser then says so and offers "Open in a new tab".

**Searching the web**: the Browser's search bar searches this website, not the internet. To look something up on the web, type the full web address of a site into the bar; big search engines and many other sites refuse to be shown inside another page, so use Open in a new tab for them.

## system-monitor

System Monitor shows what the desktop is doing. Two cards show CPU and Memory with live graphs. A web page cannot read the computer's real processor, so these are simulated: they drift like an idle machine and rise as more windows are open. The "This account" card shows real figures: open windows, files and folders in your home folder, the size of your home data and the browser's storage use. "Open windows" lists every open window with a Close button that really closes that window.

## calculator

The Calculator does quick sums. It has a display with a small line above it showing the calculation so far, and a keypad: AC (clear), ⌫ (delete the last digit), ± (change sign), ÷, ×, −, +, =, the decimal point and the digits 0 to 9. The keyboard works too: type digits and . for numbers, + - * / for the operators, Enter for equals, Backspace to delete a digit and Esc or C to clear. It calculates immediately, one operation at a time, like a pocket calculator.

## clock

The Clock app shows the current time with seconds and today's date, and has two tools:

- **Stopwatch**: Start begins timing (in tenths of a second), Pause stops it, and Reset puts it back to zero.
- **Timer**: type how many minutes (1 to 999) and press Start timer; it counts down and beeps when it reaches zero, if the browser allows sound. Press Stop to cancel.

Timers stop when the Clock window is closed. The small clock in the panel is separate from this app: hide or show it in Customize > Desktop parts.

## files

Files is proton's file manager. It shows your home folder, where you can do anything, and the read-only proton system tree with every file of this website.

- **App bar**: New folder, New file, Import (copy files from your computer into proton), Download (save the selection to your computer; folders and several files download as a ZIP), a Tiles or list view toggle, and Refresh.
- **Navigation**: Up (Alt+Up), a breadcrumb trail such as / > home > you > Documents, a path box with Go, and "Search under here…", which searches every folder below the current one.
- **Sidebar**: your folders (Home, Desktop, Documents, Pictures, Downloads) and the proton system folders.
- **The file list**: a filter box, sorting by name, size or date, Select all and Delete. Click to select, Ctrl or Shift-click to select several, double-click or Enter to open, F2 to rename, Delete to delete.
- **Right-click menu**: Open, Rename, Download, Properties, Add desktop shortcut and more. Properties shows a file's size, type and dates.

Every prompt, such as a new name, appears as a small form inside the window. Imports keep text files editable and store other files as their exact bytes, up to 2 MB each. Double-clicking a file opens it in the app made for it.

## text-editor

The Text Editor opens, edits and saves plain-text files: .txt, .md, .js, .css, .json, .html and other text. Its buttons are Open… (pick a file from proton Files or your computer), New, Save… (save as a new name) and a status line. Ctrl+S, or Cmd+S on a Mac, saves.

Files in your home folder are edited and saved in place. proton's own files open as editable drafts: you can change the text, and "Save a copy…" writes it into your home folder while the original stays untouched. A file opened from your computer is also a draft until you save it somewhere. With nothing open, the editor shows "Your text files", a list of the text files in your home folder. Closing the window with unsaved changes asks first.

## pdf

PDF Viewer reads PDF files with the browser's own built-in PDF viewer, so nothing is uploaded and proton needs no PDF library. Press Open… to pick a PDF from proton Files or your computer, or double-click a PDF in Files. With nothing open it lists "Your PDFs". The bar has Open in a new tab and Download, for browsers that cannot show PDFs inside a page, and Show in Files.

## mox

Mox is the desktop's AI: a private AI workspace whose language model runs inside your browser. Mox is made by Math-halper, the maker of this website (github.com/Math-halper/mox). The Mox app shows Mox's page in a window, with Reload and Open in new tab in its bar. The AI button in the panel (or Alt+C) shows the same Mox in a pane docked on the right; the two share chats.

Inside Mox:

- **Chat**: type in the "Ask anything" box and press Enter. Mox finds matching passages in its knowledge library and answers with numbered citations like [1], shown as source chips under the answer. Copy and Regenerate sit under each answer. The library has topics for maths, reading and writing, science, technology, humanities, life skills, and "proton desktop" about proton itself.
- **Sidebar**: New chat (Ctrl+K), Search the library, Workspace (Ctrl+Shift+E), Calculator (Ctrl+J), your saved chats, the knowledge library switch with its topic chips, and your own files.
- **Workspace**: a small code editor with a live preview. Mox can write and change files there when you ask it to make something.
- **Drawing**: ask Mox to draw something and it makes a real SVG picture.
- **Calculator**: exact arithmetic. Questions that are just a sum are answered by the calculator, not the model.
- **Your files**: add documents (text, Markdown, PDF and more) and Mox searches them too. They stay in this browser.
- **Models**: the bundled model is SmolLM2 135M Instruct (94 MB). Choose a model offers larger optional models to download and lets you upload your own .gguf file.

Questions about proton itself are answered from the "proton desktop" pages of the library; while the small bundled model runs, Mox shows the matching part of the page word for word, and Regenerate asks the model instead. The model downloads the first time Mox opens, then runs on your own processor; nothing you type leaves the browser. It is a small model, so check important details against the cited sources. If the model cannot start, Mox works in search-only mode and shows the matching passages instead.

## image-viewer

Image Viewer shows pictures: PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG. Press Open… to pick one from proton Files or your computer, or double-click a picture in Files. With nothing open it lists "Your pictures".

The Fit button switches between fitting the picture to the window and its actual size, and the status line shows the picture's real dimensions. The left and right arrow keys show the previous and next picture in the same folder, + and - zoom, 0 fits and 1 shows the actual size. Download saves the picture to your computer, and Show the folder in Files opens its folder. Image Viewer only displays pictures; it never edits them.

## media

VLC is a port of the open-source VLC media player to proton: the real libvlc engine compiled to WebAssembly, so it plays audio and video formats the browser cannot play by itself, such as MKV, AVI, WMV and FLAC. It looks like desktop VLC 3, with the orange traffic-cone icon.

- **Menus**: Media (Open file…, Open folder…, Open URL…, Open in a new browser tab, Show in Files, Download / save copy…, Save playlist…, Quit VLC), Playback (Play / Pause, Stop, Previous, Next, Go to time…), Audio (Mute / unmute, Add audio track…), Video (Fullscreen, Take snapshot), Subtitle (Add subtitle file…), Tools (Start VLC engine, Enable VLC engine, Media information, Codec information, Messages), View (Playlist, Minimal interface, Fullscreen) and Help (Keyboard shortcuts, About this VLC port).
- **Controls**: a playlist sidebar, the video, a seek bar, play, pause, stop, previous, next, repeat, shuffle, speed, volume, fullscreen and track selection for audio and subtitles. Video > Take snapshot (Shift+S) saves a screenshot of the current frame.
- **Keyboard**: the desktop VLC hotkeys, including Space play or pause, S stop, N and P next and previous, F fullscreen, M mute, Ctrl+Up and Ctrl+Down volume, the arrow keys with Shift, Alt or Ctrl to seek, + and - for speed, B and V to switch audio and subtitle tracks, L repeat, R shuffle and Alt+Enter to open the file in a new browser tab. Help > Keyboard shortcuts lists them all.

**First use**: libvlc needs a special browser mode called cross-origin isolation. The first time, VLC shows an Enable VLC engine button; press it and proton reloads once, then VLC plays. Browsers only allow sound after a click, so VLC starts its sound on your first click and offers Enable audio if the browser still holds it back.

**New browser tab**: Media > Open in a new browser tab, the New tab button or Alt+Enter plays the current file in a tab of its own with the same player and shortcuts, continuing from the same moment. A file picked from your computer cannot move to a tab; save a copy into proton Files first.

## paint

Paint is a simple drawing board. Pick one of ten colors (black, gray, red, orange, yellow, green, blue, purple, pink and white), set the brush size from 1 to 40 with the Brush slider, and draw on the white canvas with the mouse or a finger. Eraser switches to rubbing out, Clear wipes the canvas, and Save PNG saves the picture as a PNG file into the Pictures folder of your proton Files home, where Image Viewer can open it.

## piano

Piano is a playable two-octave keyboard from middle C, with real white and black keys and sound made in the browser. Click or tap the keys, or drag across them. The computer keyboard plays notes too: A W S E D F T G Y H U J K O L P and ; play from middle C upwards (the letters on the middle row are white keys, the row above are black keys). Record starts recording what you play and Stop recording ends it; Play back plays your tune, and Stop stops it.

## ruffle-flash-player

Ruffle Flash Player plays Adobe Flash games and animations (.swf files) without the old Flash plug-in. Ruffle is an open-source Flash emulator written in Rust and compiled to WebAssembly. Inside the app, Local SWF at the top lets you choose a .swf file from your computer to play. The bar has Reload and Open in new tab.

Ruffle is also the engine behind proton's Flash games: {{names: bloons-tower-defense-1, bloons-tower-defense-2, bloons-tower-defense-5, bloxorz, pacman, tetris, the-impossible-quiz, breaking-the-bank, escaping-the-prison, stealing-the-diamond, infiltrating-the-airship, fleeing-the-complex}} load their Flash files through this app.

## web-retro

Web Retro is a retro console emulator: RetroArch running in the browser through BinBashBanana's webretro. It plays NES, SNES, Nintendo 64 and Game Boy, Game Boy Color and Game Boy Advance games. The front page has two tabs:

- **ROMs** (the default): four console boxes, NES, SNES, N64 and GB, each showing how many bundled games it has. Click a box, then click a game's poster to play it.
- **Emulators**: the same four boxes, one per emulator core (nestopia for NES, snes9x for SNES, mupen64plus_next for N64 and mgba for Game Boy). Pick one, then choose a ROM file either From proton Files or From your Files (your computer).

A game starts at once; there is no start button. Change game in the bar, or the emulator's own back arrow, returns to the chooser. Controls can be changed in the emulator's Controls > Keybinds manager (press Save) or in RetroArch's own menu, and Web Retro keeps your bindings for the next game. ROM files you bring never leave the browser. It accepts .nes, .smc, .sfc, .n64, .z64, .v64, .gb, .gbc, .gba and .zip files.

## terminal

Terminal is a small command-line shell over your proton Files, the same files the Files app shows. Type a command and press Enter; the up and down arrows bring back earlier commands. Commands:

- help: list the commands
- ls [folder], cd <folder> (cd .. goes up, cd alone goes home), pwd, tree [folder]
- cat <file>, echo <text>, nano <file> (a small editor: Ctrl+S saves, Ctrl+X exits)
- mkdir [-p] <folder>, touch <file>, rm [-r] <path>, cp <from> <to>, mv <from> <to>
- find <text>, stat <path>, open <app> (for example, open paint), date, whoami, clear

There are no pipes or redirection, and nothing in the terminal can touch your real computer: paths stay inside proton's file system, and proton's own read-only files refuse changes.

## you-are-an-idiot

You Are An Idiot is a joke app: the classic "you are an idiot" prank, safely shut inside proton. It plays the looping video with the famous song, shakes the desktop and fills it with extra windows that bounce around on their own. Closing one with × only makes two more. The only way out is the Make it stop button that every one of its windows carries, which closes them all at once. Nothing leaves the proton desktop and nothing goes fullscreen.

To get rid of it for good, remove it again in App Center.

## game-2048

2048 is a sliding-tile number puzzle. Press the arrow keys to slide every tile on the 4 by 4 grid in one direction. When two tiles with the same number touch, they merge into one tile with their sum, and each move adds a new 2 or 4. The goal is to make a 2048 tile before the grid fills up and no move is left. Click the game once so it gets the arrow keys.

## bloons-tower-defense-1

Bloons Tower Defense 1 is the original Flash tower defence game by Ninja Kiwi. Balloons called bloons float along a track; buy towers such as dart monkeys and place them beside the track to pop the bloons before they reach the end. Popping bloons earns money for more towers, and every bloon that gets through costs lives. Play with the mouse. It runs on proton's Ruffle Flash Player, so no Flash plug-in is needed.

## bloons-tower-defense-2

Bloons Tower Defense 2 is Ninja Kiwi's second Flash tower defence game: more kinds of bloons, more towers and upgrades. Place monkey towers along the track with the mouse to pop every bloon before it escapes, and spend the money you earn on new towers and upgrades. It runs on the Ruffle Flash Player.

## bloons-tower-defense-5

Bloons Tower Defense 5 is the classic Ninja Kiwi tower defence game: place monkeys and other towers along the track, upgrade them along two upgrade paths, and pop wave after wave of bloons, including tough ones such as lead and ceramic bloons and the giant blimps. Play with the mouse. It runs on the Ruffle Flash Player.

## bloxorz

Bloxorz is a Flash puzzle game. Roll a tall block across a floating platform with the arrow keys and drop it standing upright into the square hole to finish each level. Do not let it fall off the edge. Orange tiles collapse if the block stands on them upright, switches open and close bridges, and in some levels the block splits in two, with Space switching between the halves. It runs on the Ruffle Flash Player.

## breaking-the-bank

Breaking The Bank is the first Henry Stickmin game by PuffballsUnited, a funny Flash point-and-click adventure. Henry wants to get into a bank vault: at each decision you click one of several options, and most choices end in a silly failure, after which you can try again. It runs on the Ruffle Flash Player.

## celeste-hub

The Celeste Hub collects every Celeste Classic game in one app. It opens on a list of games; click one to play it, and Change game in the bar brings the list back. Celeste Classic is the PICO-8 mountain-climbing platformer by Maddy Thorson and Noel Berry that grew into the full game Celeste: use the arrow keys to move, C or Z to jump and X to dash, and climb the mountain one screen at a time. Celeste Classic 2: Lani's Trek is its sequel, with a grappling hook.

## cookie-clicker

Cookie Clicker is Orteil's idle game. Click the big cookie to bake cookies, then spend them on buildings, such as cursors, grandmas, farms, mines and factories, that bake cookies for you, and on upgrades that make everything faster. The numbers grow enormous. Progress saves in this browser. This copy is an offline mirror of the game.

## drive-mad

Drive Mad is a physics driving game. Get your vehicle over hills, bridges, ramps and wobbly obstacles to the finish without flipping it or breaking it. Drive forward and back with the keyboard, and take it easy on jumps, because the car's balance matters. Each level brings a new contraption.

## escaping-the-prison

Escaping The Prison is the second Henry Stickmin game by PuffballsUnited. Henry has been locked up, and a friend sends him a cake with a choice of hidden tools. Click the options to choose tools and actions; most choices fail in funny ways, and the right ones lead to several different escapes. It runs on the Ruffle Flash Player.

## fleeing-the-complex

Fleeing The Complex is the fifth Henry Stickmin game by PuffballsUnited. Henry is locked in the Wall, a high-security prison complex, and must find a way out, possibly with the help of other characters. Click the options at each decision; it has many paths and endings. It runs on the Ruffle Flash Player.

## grey-box-testing

Grey Box Testing is a Unity WebGL game from the Gams-Offline/Gams collection. Click inside the game so it gets the keyboard and mouse; the game shows its own controls. Reload in the window's bar restarts it.

## infiltrating-the-airship

Infiltrating The Airship is the fourth Henry Stickmin game by PuffballsUnited. Henry is asked to infiltrate the airship of the Toppat Clan, a gang of thieves in top hats, and can side with the government or with the Toppats. Click the options at each decision; there are several paths and endings. It runs on the Ruffle Flash Player.

## mari0

Mari0 is Mario crossed with Portal, by Maurice Guégan and Stabyourself.net: the levels of Super Mario Bros. with a portal gun. Move and jump with the keyboard, aim with the mouse, and click the left and right mouse buttons to shoot the two portals, then jump through them to cross the level in new ways. This is the love.js browser build.

## offline-paradise

Offline Paradise is a small single-file arcade game from the Gams-Offline/Gams collection. Press Space to jump and dodge the obstacles that come at you.

## pacman

Pacman is the arcade classic as a Flash game. Steer Pac-Man around the maze with the arrow keys, eat every dot and avoid the ghosts. Eating a power pellet turns the ghosts blue for a short time so you can eat them. It runs on the Ruffle Flash Player.

## slope

Slope is a fast 3D running game. Steer a ball rolling down an endless neon slope with the left and right arrow keys (or A and D), stay on the track and avoid the red blocks. The ball speeds up the longer you survive.

## spacebar-clicker

Spacebar Clicker is an idle clicker game: press the spacebar to earn points, then spend them on helpers, such as a monkey and a boomer mom, that press it for you. Keep upgrading to make the numbers grow faster.

## stack

Stack is a timing game. A block slides back and forth over the tower; click, or press the spacebar, to drop it. Only the part that lands on the block below stays, so line them up exactly to keep the tower wide and build it as high as you can. Click or press the spacebar to start again.

## stealing-the-diamond

Stealing The Diamond is the third Henry Stickmin game by PuffballsUnited. Henry tries to steal the famous Tunisian Diamond from a museum. Click the options at each decision; most fail in funny ways, and the right ones lead to the diamond and several endings. It runs on the Ruffle Flash Player.

## stickman-hook

Stickman Hook is a swinging game. Press and hold the mouse button, or the spacebar, to grab the nearest hook with a rope and swing; let go to fly through the air, then grab the next hook. Reach the finish of each level without falling.

## sm64

Super Mario 64 is an unofficial fan build of Nintendo's 1996 game for the browser, compiled to WebAssembly from the decompiled game. Explore Princess Peach's castle, jump into its paintings and collect Power Stars. Play with the keyboard or a gamepad. It is not affiliated with Nintendo.

## tetris

Tetris is the falling-blocks classic as a Flash game. Move and rotate the falling pieces with the arrow keys so they fill complete rows; full rows disappear and score points. The game ends when the stack reaches the top. It runs on the Ruffle Flash Player.

## the-impossible-quiz

The Impossible Quiz is a famously unfair Flash quiz by Splapp-Me-Do. Click the answer to each question, but many questions are trick questions with answers hidden in odd places. Wrong answers cost lives, and some questions are bombs with a timer. It runs on the Ruffle Flash Player.

## tunnel-rush

Tunnel Rush is a fast 3D reflex game. You speed through a spinning tunnel; press the left and right arrow keys (or A and D) to rotate and dodge the obstacles coming at you.

## baldis-basics

Baldi's Basics is a surreal horror game dressed up as an old educational game. Walk through the schoolhouse with W, A, S and D and look around with the mouse, collect the seven notebooks and answer their maths problems. Get one wrong and Baldi starts chasing you, faster with every notebook. Find all seven, then escape through an exit.

## minesweeper

Minesweeper is the classic mine-hunting puzzle. Left-click a square to reveal it; a number shows how many mines touch that square. Right-click to put a flag on a square you think hides a mine. Reveal every safe square without clicking a mine to win.

## flappy-bird

Flappy Bird is the one-button game: click, tap or press the spacebar to flap and fly the bird through the gaps between the pipes. Every pipe passed scores a point; touching a pipe or the ground ends the run.

## retro-bowl

Retro Bowl is a retro-style American football game that mixes playing the matches with running the team. In a match you control the offence: drag back to aim a pass and release to throw, or run with the ball carrier. Between games you manage the roster, hire and fire players and keep the fans and staff happy across seasons. Progress saves in this browser.

## drift-boss

Drift Boss is a one-button driving game. A car drives along a zigzag track floating in the sky; press and hold the mouse button or a key to turn, and release to go straight. Drift around each corner without falling off the edge to score.

## football-bros

Football Bros is a chaotic physics American football game. Run, pass, juke and tackle with cartoon players in quick matches. The game shows its own keyboard controls. It is a large game and takes a while to load the first time.

## five-nights-at-freddys-1

Five Nights at Freddy's is the horror game by Scott Cawthon. You are the night guard at Freddy Fazbear's Pizza and must survive from 12 AM to 6 AM while the animatronic characters wander the building. Watch them on the security cameras, and close the two doors or switch on the hall lights when they come near, but every door, light and camera uses power, and the power runs out. Survive five nights.

## five-nights-at-freddys-4

Five Nights at Freddy's 4 moves the horror into a child's bedroom. Nightmare versions of the animatronics creep towards you; listen for breathing at the two doors, hold the doors shut when they are there, shine the flashlight down the halls, and check the closet and the bed behind you. Sound is the most important clue, so play with the audio on.

## five-nights-at-freddys-2

Five Nights at Freddy's 2 has no doors to close. Survive the night shift with the security cameras, a flashlight to check the halls and vents, and an empty Freddy Fazbear mask to fool most animatronics. Keep the music box wound up from the cameras, or the Puppet comes for you.

## five-nights-at-freddys-3

Five Nights at Freddy's 3 is set thirty years later in Fazbear's Fright, a horror attraction with one real animatronic, Springtrap. Track him on the cameras, lure him away with audio, seal vents, and reboot the camera, audio and ventilation systems from the maintenance panel when they fail.

## backrooms

Backrooms is a first-person horror exploration game set in the endless yellow rooms of the Backrooms legend. Walk with the keyboard, look around with the mouse, and try to find your way through the maze while something hunts you. It is a large game and takes a while to load the first time.

## kart-bros

Kart Bros is a kart racing game against the bros. Use the arrow keys or W, A, S and D to drive, and press the spacebar to use items you pick up on the track. It is a large game and takes a while to load the first time.

## geometry-dash-lite

Geometry Dash Lite is the rhythm platformer by RobTop. Your square races forward on its own to the music; click, press the spacebar or press the up arrow to jump over spikes and gaps, and hold to fly when it turns into a ship. One mistake restarts the level, so learning the rhythm is the key.

## five-nights-at-freddys-sl

Five Nights at Freddy's: Sister Location takes the series underground to Circus Baby's Entertainment and Rental. Each night you do different jobs as a technician, guided by a voice on the intercom: crawl through vents, keep animatronics such as Ballora and Funtime Foxy away, and follow instructions carefully, because breaking the rules is deadly.

## bitburner

Bitburner is a programming-based incremental game with a cyberpunk hacking theme, by danielyxie. You use an in-game terminal and write scripts in JavaScript to hack servers, earn money, buy hardware and grow your influence across a dystopian world. It teaches real programming along the way. Progress saves in this browser.

## bitlife

BitLife is a life simulator. Live a whole life from birth: press Age to move forward a year, make choices about school, jobs, relationships, money and risky adventures, and see how your story turns out. Progress saves in this browser.

## ampler-launcher

Ampler Launcher is a launcher for Eaglercraft, a version of Minecraft Java Edition rebuilt to run in a web browser. It ships seven offline builds: 1.12.2, 1.12.2 WASM, 1.8.8, 1.8.8 WASM, 1.5.2, Beta 1.3 and Alpha 1.2.6. On the Play page, pick a version in the selector at the bottom, click the username to set your name, and press Play; the game opens in a new browser tab. The Skins page has Minecraft skins you can download. Singleplayer worlds save in the browser.

## google-dino

Google Dino is the endless runner from Chrome's no-internet page. Press the spacebar or the up arrow to jump over cacti and the down arrow to duck under birds. The dinosaur runs faster as the score climbs.

## granny

Granny is a first-person horror escape game. You wake up locked in Granny's house and have five days to find the tools and keys you need to escape. Move with the keyboard and look with the mouse, and stay quiet: Granny hears every noise and comes after you. It is a large game and takes a while to load the first time.

## evolution

Evolution is a web version of Keiwan Donyagard's evolution simulator. Build a creature from joints, bones and muscles, choose a task such as running, jumping or climbing, and watch a neural network learn to move it, generation after generation, through an evolutionary algorithm. It shows how machine learning can teach creatures to walk.
