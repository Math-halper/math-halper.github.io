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
    Built-ins: System, Productivity, Media, Games (their order is CATS in
    assets/core.js); a new name becomes a new section of its own.
  - w= / h= are the starting window size in pixels.
  - streamed=true loads a remote app's tiny module on first launch instead
    of fetching it during desktop boot (assets/html-loader.js).
  - The app itself still lives in apps/<folder>/app.html; its render()
    code runs from there (apps/_template is the starting point).

proton ships the five desktop System apps (App Center, Customize, Settings,
About, Browser), the file system suite from main (Files, Text Editor, Image
Viewer, Media, PDF Viewer — their ids are exactly the ones FS.appFor()
returns, so double-clicking a file opens it in the right one), a Calculator,
Web Retro (a vendored webretro emulator build; bring your own ROMs) and the
three Celeste Classics apps: Celeste Classic, Celeste Classic 2 and Celeste
Community. Their game files are copied byte-for-byte from
github.com/Math-halper/Celeste (classic/, two/ and speed/) into
apps/celeste-classic, apps/celeste-two and apps/celeste-community — each app
folder is the game's own pages plus a thin proton iframe wrapper, and
apps/index.html is the picker their "all games" links expect.

The start menu groups them by cat=: System (the desktop's own five),
Productivity (Calculator, Files, Text Editor, PDF Viewer), Media (Image
Viewer, Media) and Games (Celeste Classic, Celeste Classic 2, Celeste
Community, Web Retro). Block order below is menu order within each section.

Template (named SVG; for an image use `icon=data/icons/my-app.png` and
`svg-icon=false` instead):
[application]
id=
name=
path=apps/my-app/app.html
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
path=apps/app-center/app.html
icon=grid
svg-icon=true
cat=System
desc=Manage the built-in apps and any saved apps or websites on this account
w=980
h=640

[application]
id=customize
name=Customize
path=apps/customize/app.html
icon=sliders
svg-icon=true
cat=System
desc=Remove & edit apps, themes, wallpapers and desktop parts
w=1020
h=660

[application]
id=settings
name=Settings
path=apps/settings/app.html
icon=settings
svg-icon=true
cat=System
desc=Account, wallpaper, backups and this device
w=880
h=600

[application]
id=about
name=About
path=apps/about/app.html
icon=info
svg-icon=true
cat=System
desc=What this is, credits and how saving works
w=720
h=540

[application]
id=browser
name=Browser
path=apps/browser/app.html
icon=globe
svg-icon=true
cat=System
desc=Visit web addresses and any built-in websites from data/websites.js
w=940
h=600

[application]
id=calculator
name=Calculator
path=apps/calculator/app.html
icon=calculator
svg-icon=true
cat=Productivity
desc=Do quick maths from the keypad or your keyboard
w=360
h=540

[application]
id=files
name=Files
path=apps/files/app.html
icon=folder
svg-icon=true
cat=Productivity
desc=Browse your home folder and the read-only proton system tree - create, rename, move, import, search and download
w=1000
h=640

[application]
id=text-editor
name=Text Editor
path=apps/text-editor/app.html
icon=file-text
svg-icon=true
cat=Productivity
desc=Open, edit and save text files in your home folder; proton's own files open read-only
w=880
h=620

[application]
id=pdf
name=PDF Viewer
path=apps/pdf/app.html
icon=book
svg-icon=true
cat=Productivity
desc=Read PDF files in your browser's own viewer - no extra library, nothing uploaded
w=920
h=680

[application]
id=image-viewer
name=Image Viewer
path=apps/image-viewer/app.html
icon=image
svg-icon=true
cat=Media
desc=View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist
w=920
h=640

[application]
id=media
name=Media
path=apps/media/app.html
icon=film
svg-icon=true
cat=Media
desc=Play audio and video files stored in your home folder, with your browser's own codecs
w=940
h=620

[application]
id=celeste-classic
name=Celeste Classic
path=apps/celeste-classic/app.html
icon=play
svg-icon=true
cat=Games
desc=Play the original Celeste Classic - its actual game files, vendored
w=980
h=640

[application]
id=celeste-two
name=Celeste Classic 2
path=apps/celeste-two/app.html
icon=play
svg-icon=true
cat=Games
desc=Play Celeste Classic 2: Lani's Trek - its actual game files, vendored
w=980
h=640

[application]
id=celeste-community
name=Celeste Community
path=apps/celeste-community/app.html
icon=globe
svg-icon=true
cat=Games
desc=Celeste Classic's community hub - practice mods, downloads and links
w=980
h=640

[application]
id=web-retro
name=Web Retro
path=apps/web-retro/app.html
icon=data/icons/webretro.png
svg-icon=false
cat=Games
desc=Play your own retro ROMs - N64, SNES, NES and Game Boy (webretro)
w=980
h=640

/* TEMPLATE — an app that is only an embedded page. Copy apps/_embed/,
   rename it, change the EMBED_URL constant in its app.html, then
   uncomment a block like this one (and delete these lines):

[application]
id=my-embed
name=My Embed
path=apps/my-embed/app.html
icon=globe
svg-icon=true
cat=System
desc=Frames https://example.com in a window
w=980
h=640

*/

`;
