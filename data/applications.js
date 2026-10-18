/*
Application catalog — this ONE file controls which apps proton has.
Copy the template below for each application, in the order you want them
in the proton menu. Nothing else needs editing: name, location (path),
icon, category, description and default window size all live here.

  - Add an app:    copy the template block below (and the app's folder).
  - Remove an app: delete its block (or set enabled=false to keep the
                   block but hide the app).
  - icon= is either a named SVG icon, or a local raster path such as
    data/icons/my-app.png. Place path-based icons under data/icons/.
  - svg-icon=true means icon= is a named inline SVG icon; use
    svg-icon=false when icon= is a local image path. Known icon names are
    auto-detected for compatibility with older catalog blocks.
  - cat= is the menu category — the start menu groups apps into its sections.
    Every app must be filed into its respective section: System, Productivity,
    Media or Games (their order is CATS in assets/core.js). Never add an app
    without a cat=; a new name becomes a new section of its own. The app's
    folder goes in apps/<category>/ to match (system/, productivity/, media/,
    games/) — the tests assert the path matches the section.
  - w= / h= are the starting window size in pixels.
  - streamed=true loads a remote app's tiny module on first launch instead
    of fetching it during desktop boot (assets/html-loader.js).
  - The app itself still lives in apps/<category>/<folder>/app.html; its render()
    code runs from there (apps/_template is the starting point).

proton ships the five desktop System apps (App Center, Customize, Settings,
About, Browser), the file system suite from main (Files, Text Editor, Image
Viewer, Media, PDF Viewer — their ids are exactly the ones FS.appFor()
returns, so double-clicking a file opens it in the right one), a Calculator,
Web Retro (a vendored webretro emulator build; bring your own ROMs), the
three Celeste Classics apps (Celeste Classic, Celeste Classic 2, Celeste
Community — game files copied byte-for-byte from github.com/Math-halper/Celeste),
the two Mario games (Mari0 and Super Mario 64 — game builds copied
byte-for-byte from github.com/Math-halper/Mario, only the games) and Cookie
Clicker (Orteil's idle game, copied byte-for-byte from the offline mirror in
github.com/Gams-Offline/Gams) and 23 more games from that same Gams
collection (Flash classics on the shared Ruffle player, Unity WebGL builds
and single-file HTML5 games). Each game
app folder is the game's own files plus a thin proton iframe wrapper, and
apps/games/index.html is the picker their "all games" links expect.

The start menu groups them by cat=: System (the desktop's own five),
Productivity (Calculator, Files, Text Editor, PDF Viewer), Media (Image
Viewer, Media) and Games (30 games: 2048, Bloons Tower Defense 1, Bloons Tower
Defense 2, Bloons Tower Defense 5, Bloxorz, Breaking The Bank, Celeste
Classic, Celeste Classic 2, Celeste Community, Cookie Clicker, Drive Mad,
Escaping The Prison, Fleeing The Complex, Grey Box Testing, Infiltrating
The Airship, Mari0, Offline Paradise, Pacman, Ruffle Flash Player, Slope,
Spacebar Clicker, Stack, Stealing The Diamond, Stickman Hook, Super Mario
64, Super Mario RPG, Tetris, The Impossible Quiz, Tunnel Rush, Web Retro).
Block order below is menu order within each section.

IMPORTANT: an id must not be a bare number — JavaScript object key ordering
  hoists integer-like keys to the front of every APPS iteration (this is why
  the 2048 game's id is `game-2048`).

Template (named SVG; for an image use `icon=data/icons/my-app.png` and
`svg-icon=false` instead):
[application]
id=
name=
path=apps/<category>/my-app/app.html
icon=grid
svg-icon=true
cat=Productivity
desc=
w=720
h=480
enabled=true
*/

window.PROTON_APPLICATIONS_TEXT = `

[application]
id=appcenter
name=App Center
path=apps/system/app-center/app.html
icon=grid
svg-icon=true
cat=System
desc=Manage the built-in apps and any saved apps or websites on this account
w=980
h=640

[application]
id=customize
name=Customize
path=apps/system/customize/app.html
icon=sliders
svg-icon=true
cat=System
desc=Remove & edit apps, themes, wallpapers and desktop parts
w=1020
h=660

[application]
id=settings
name=Settings
path=apps/system/settings/app.html
icon=settings
svg-icon=true
cat=System
desc=Account, wallpaper, backups and this device
w=880
h=600

[application]
id=about
name=About
path=apps/system/about/app.html
icon=info
svg-icon=true
cat=System
desc=What this is, credits and how saving works
w=720
h=540

[application]
id=browser
name=Browser
path=apps/system/browser/app.html
icon=globe
svg-icon=true
cat=System
desc=Visit web addresses and any built-in websites from data/websites.js
w=940
h=600

[application]
id=calculator
name=Calculator
path=apps/productivity/calculator/app.html
icon=calculator
svg-icon=true
cat=Productivity
desc=Do quick maths from the keypad or your keyboard
w=360
h=540

[application]
id=files
name=Files
path=apps/productivity/files/app.html
icon=folder
svg-icon=true
cat=Productivity
desc=Browse your home folder and the read-only proton system tree - create, rename, move, import, search and download
w=1000
h=640

[application]
id=text-editor
name=Text Editor
path=apps/productivity/text-editor/app.html
icon=file-text
svg-icon=true
cat=Productivity
desc=Open, edit and save text files in your home folder; proton's own files open read-only
w=880
h=620

[application]
id=pdf
name=PDF Viewer
path=apps/productivity/pdf/app.html
icon=book
svg-icon=true
cat=Productivity
desc=Read PDF files in your browser's own viewer - no extra library, nothing uploaded
w=920
h=680

[application]
id=image-viewer
name=Image Viewer
path=apps/media/image-viewer/app.html
icon=image
svg-icon=true
cat=Media
desc=View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist
w=920
h=640

[application]
id=media
name=Media
path=apps/media/media/app.html
icon=film
svg-icon=true
cat=Media
desc=Play audio and video files stored in your home folder, with your browser's own codecs
w=940
h=620

[application]
id=game-2048
name=2048
path=apps/games/game-2048/app.html
icon=data/icons/game-2048.png
svg-icon=false
cat=Games
desc=Play 2048 - join the tiles
w=980
h=640

[application]
id=bloons-tower-defense-1
name=Bloons Tower Defense 1
path=apps/games/bloons-tower-defense-1/app.html
icon=data/icons/bloons-tower-defense-1.png
svg-icon=false
cat=Games
desc=Play Bloons Tower Defense 1 - the original balloon-popping tower defense
w=980
h=640

[application]
id=bloons-tower-defense-2
name=Bloons Tower Defense 2
path=apps/games/bloons-tower-defense-2/app.html
icon=data/icons/bloons-tower-defense-2.png
svg-icon=false
cat=Games
desc=Play Bloons Tower Defense 2 - more balloons, more towers
w=980
h=640

[application]
id=bloons-tower-defense-5
name=Bloons Tower Defense 5
path=apps/games/bloons-tower-defense-5/app.html
icon=data/icons/bloons-tower-defense-5.png
svg-icon=false
cat=Games
desc=Play Bloons Tower Defense 5 - the classic tower defense
w=980
h=640

[application]
id=bloxorz
name=Bloxorz
path=apps/games/bloxorz/app.html
icon=data/icons/bloxorz.png
svg-icon=false
cat=Games
desc=Play Bloxorz - roll the block to the goal
w=980
h=640

[application]
id=breaking-the-bank
name=Breaking The Bank
path=apps/games/breaking-the-bank/app.html
icon=data/icons/breaking-the-bank.png
svg-icon=false
cat=Games
desc=Play Breaking The Bank - a Henry Stickmin adventure
w=980
h=640

[application]
id=celeste-classic
name=Celeste Classic
path=apps/games/celeste-classic/app.html
icon=data/icons/celeste-classic.png
svg-icon=false
cat=Games
desc=Play the original Celeste Classic - its actual game files, vendored
w=980
h=640

[application]
id=celeste-two
name=Celeste Classic 2
path=apps/games/celeste-two/app.html
icon=data/icons/celeste-two.png
svg-icon=false
cat=Games
desc=Play Celeste Classic 2: Lani's Trek - its actual game files, vendored
w=980
h=640

[application]
id=celeste-community
name=Celeste Community
path=apps/games/celeste-community/app.html
icon=data/icons/celeste-community.png
svg-icon=false
cat=Games
desc=Celeste Classic's community hub - practice mods, downloads and links
w=980
h=640

[application]
id=cookie-clicker
name=Cookie Clicker
path=apps/games/cookie-clicker/app.html
icon=data/icons/cookie-clicker.png
svg-icon=false
cat=Games
desc=Play Cookie Clicker - Orteil's idle bakery game, an offline mirror
w=980
h=640

[application]
id=drive-mad
name=Drive Mad
path=apps/games/drive-mad/app.html
icon=data/icons/drive-mad.png
svg-icon=false
cat=Games
desc=Play Drive Mad - the physics driving game
w=980
h=640

[application]
id=escaping-the-prison
name=Escaping The Prison
path=apps/games/escaping-the-prison/app.html
icon=data/icons/escaping-the-prison.png
svg-icon=false
cat=Games
desc=Play Escaping The Prison - a Henry Stickmin adventure
w=980
h=640

[application]
id=fleeing-the-complex
name=Fleeing The Complex
path=apps/games/fleeing-the-complex/app.html
icon=data/icons/fleeing-the-complex.png
svg-icon=false
cat=Games
desc=Play Fleeing The Complex - a Henry Stickmin adventure
w=980
h=640

[application]
id=grey-box-testing
name=Grey Box Testing
path=apps/games/grey-box-testing/app.html
icon=data/icons/grey-box-testing.png
svg-icon=false
cat=Games
desc=Play Grey Box Testing
w=980
h=640

[application]
id=infiltrating-the-airship
name=Infiltrating The Airship
path=apps/games/infiltrating-the-airship/app.html
icon=data/icons/infiltrating-the-airship.png
svg-icon=false
cat=Games
desc=Play Infiltrating The Airship - a Henry Stickmin adventure
w=980
h=640

[application]
id=mari0
name=Mari0
path=apps/games/mari0/app.html
icon=data/icons/mari0.png
svg-icon=false
cat=Games
desc=Play Mari0 - Mario x Portal (Stabyourself), the love.js browser build
w=980
h=640

[application]
id=offline-paradise
name=Offline Paradise
path=apps/games/offline-paradise/app.html
icon=data/icons/offline-paradise.png
svg-icon=false
cat=Games
desc=Play Offline Paradise
w=980
h=640

[application]
id=pacman
name=Pacman
path=apps/games/pacman/app.html
icon=data/icons/pacman.png
svg-icon=false
cat=Games
desc=Play Pacman - the arcade classic
w=980
h=640

[application]
id=ruffle-flash-player
name=Ruffle Flash Player
path=apps/games/ruffle-flash-player/app.html
icon=data/icons/ruffle-flash-player.png
svg-icon=false
cat=Games
desc=Load and play your own Flash .swf files
w=980
h=640

[application]
id=slope
name=Slope
path=apps/games/slope/app.html
icon=data/icons/slope.png
svg-icon=false
cat=Games
desc=Play Slope - roll the ball down the neon slope
w=980
h=640

[application]
id=spacebar-clicker
name=Spacebar Clicker
path=apps/games/spacebar-clicker/app.html
icon=data/icons/spacebar-clicker.png
svg-icon=false
cat=Games
desc=Play Spacebar Clicker - mash the spacebar
w=980
h=640

[application]
id=stack
name=Stack
path=apps/games/stack/app.html
icon=data/icons/stack.png
svg-icon=false
cat=Games
desc=Play Stack - time the falling blocks
w=980
h=640

[application]
id=stealing-the-diamond
name=Stealing The Diamond
path=apps/games/stealing-the-diamond/app.html
icon=data/icons/stealing-the-diamond.png
svg-icon=false
cat=Games
desc=Play Stealing The Diamond - a Henry Stickmin adventure
w=980
h=640

[application]
id=stickman-hook
name=Stickman Hook
path=apps/games/stickman-hook/app.html
icon=data/icons/stickman-hook.png
svg-icon=false
cat=Games
desc=Play Stickman Hook - swing through the levels
w=980
h=640

[application]
id=sm64
name=Super Mario 64
path=apps/games/sm64/app.html
icon=data/icons/sm64.png
svg-icon=false
cat=Games
desc=Play the Super Mario 64 WebAssembly browser build - unofficial fan port
w=980
h=640

[application]
id=super-mario-rpg
name=Super Mario RPG
path=apps/games/super-mario-rpg/app.html
icon=data/icons/super-mario-rpg.png
svg-icon=false
cat=Games
desc=Play Super Mario RPG in Web Retro - bring your own ROM
w=980
h=640

[application]
id=tetris
name=Tetris
path=apps/games/tetris/app.html
icon=data/icons/tetris.png
svg-icon=false
cat=Games
desc=Play Tetris - the falling-blocks classic
w=980
h=640

[application]
id=the-impossible-quiz
name=The Impossible Quiz
path=apps/games/the-impossible-quiz/app.html
icon=data/icons/the-impossible-quiz.png
svg-icon=false
cat=Games
desc=Play The Impossible Quiz - the wildly unfair quiz
w=980
h=640

[application]
id=tunnel-rush
name=Tunnel Rush
path=apps/games/tunnel-rush/app.html
icon=data/icons/tunnel-rush.png
svg-icon=false
cat=Games
desc=Play Tunnel Rush - dodge through the spinning tunnel
w=980
h=640

[application]
id=web-retro
name=Web Retro
path=apps/games/web-retro/app.html
icon=data/icons/webretro.png
svg-icon=false
cat=Games
desc=Play your own retro ROMs - N64, SNES, NES, Game Boy; load from this computer or proton Files
w=980
h=640

/* TEMPLATE — an app that is only an embedded page. Copy apps/_embed/,
   rename it, change the EMBED_URL constant in its app.html, then
   uncomment a block like this one (and delete these lines).
   Set cat= to the menu section the app belongs in — System, Productivity,
   Media or Games — so it lands in the right group, and put its folder in
   apps/<category>/ to match:

[application]
id=my-embed
name=My Embed
path=apps/<category>/my-embed/app.html
icon=globe
svg-icon=true
cat=System
desc=Frames https://example.com in a window
w=980
h=640

*/

`;
