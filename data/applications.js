/*
Application catalog — this ONE file controls which apps proton has.
Copy the template below for each application, in the order you want them
in the proton menu. Nothing else needs editing: name, location (path),
icon, category, description and default window size all live here.

  - Add an app:    copy the template block below (and the app's folder,
                   under apps/inbuilt/).
  - Remove an app: delete its block (or set enabled=false to keep the
                   block but hide the app).
  - icon= is either a named SVG icon, or a local raster path such as
    data/icons/my-app.png. Place path-based icons under data/icons/.
  - svg-icon=true means icon= is a named inline SVG icon; use
    svg-icon=false when icon= is a local image path. Known icon names are
    auto-detected for compatibility with older catalog blocks.
  - cat= is the menu category (invent your own if you like).
  - w= / h= are the starting window size in pixels.
  - streamed=true loads a remote app's tiny module on first launch instead
    of fetching it during desktop boot (assets/html-loader.js).
  - The app itself still lives in apps/inbuilt/<folder>/app.html; its
    render() code runs from there (apps/_template is the starting point).
    apps/inbuilt/ holds every app built into this site; the one exception
    is the Celeste Classic wrapper, which stays at apps/celeste-classic/.

proton ships ten System apps — all under apps/inbuilt/ — plus one embedded
game page: Celeste Classic, which stays in its own apps/celeste-classic/
folder. That folder contains only an iframe wrapper for the existing GitHub
Pages site; no game files or assets are copied into this repository.

Five of the ten are the desktop's own apps (App Center, Customize, Settings,
About, Browser); the other five are the file system suite that sits on
assets/fs.js: Files (the manager), Text Editor, Image Viewer, Media and PDF
Viewer. Their ids are exactly the ones FS.appFor() returns, so double-clicking
a file anywhere opens it in the right one.

Template (named SVG; for an image use `icon=data/icons/my-app.png` and
`svg-icon=false` instead):
[application]
id=
name=
path=apps/inbuilt/my-app/app.html
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
path=apps/inbuilt/app-center/app.html
icon=grid
svg-icon=true
cat=System
desc=Manage the built-in apps and any saved apps or websites on this account
w=980
h=640

[application]
id=customize
name=Customize
path=apps/inbuilt/customize/app.html
icon=sliders
svg-icon=true
cat=System
desc=Remove & edit apps, themes, wallpapers and desktop parts
w=1020
h=660

[application]
id=settings
name=Settings
path=apps/inbuilt/settings/app.html
icon=settings
svg-icon=true
cat=System
desc=Account, wallpaper, backups and this device
w=880
h=600

[application]
id=about
name=About
path=apps/inbuilt/about/app.html
icon=info
svg-icon=true
cat=System
desc=What this is, credits and how saving works
w=720
h=540

[application]
id=browser
name=Browser
path=apps/inbuilt/browser/app.html
icon=globe
svg-icon=true
cat=System
desc=Tabs, back/forward, bookmarks and history — and a search bar that answers from proton's own index of this repository
w=940
h=600

[application]
id=files
name=Files
path=apps/inbuilt/files/app.html
icon=folder
svg-icon=true
cat=System
desc=Browse your home folder and the read-only proton system tree — create, rename, move, import, search and download
w=1000
h=640

[application]
id=text-editor
name=Text Editor
path=apps/inbuilt/text-editor/app.html
icon=file-text
svg-icon=true
cat=System
desc=Open, edit and save text files in your home folder; proton's own files open read-only
w=880
h=620

[application]
id=image-viewer
name=Image Viewer
path=apps/inbuilt/image-viewer/app.html
icon=image
svg-icon=true
cat=System
desc=View PNG, JPG, GIF, WebP, AVIF, BMP, ICO and SVG files with zoom and a folder playlist
w=920
h=640

[application]
id=media
name=Media
path=apps/inbuilt/media/app.html
icon=film
svg-icon=true
cat=System
desc=Play audio and video files stored in your home folder, with your browser's own codecs
w=940
h=620

[application]
id=pdf
name=PDF Viewer
path=apps/inbuilt/pdf/app.html
icon=book
svg-icon=true
cat=System
desc=Read PDF files in your browser's own viewer — no extra library, nothing uploaded
w=920
h=680

[application]
id=celeste-classic
name=Celeste Classic
path=apps/celeste-classic/app.html
icon=play
svg-icon=true
cat=System
desc=Play Celeste Classic from Math-halper's GitHub Pages site
w=980
h=640

/* TEMPLATE — an app that is only an embedded page. Copy apps/_embed/ to
   apps/inbuilt/my-embed/, change the EMBED_URL constant in its app.html,
   then uncomment a block like this one (and delete these lines):

[application]
id=my-embed
name=My Embed
path=apps/inbuilt/my-embed/app.html
icon=globe
svg-icon=true
cat=System
desc=Frames https://example.com in a window
w=980
h=640

*/

`;
