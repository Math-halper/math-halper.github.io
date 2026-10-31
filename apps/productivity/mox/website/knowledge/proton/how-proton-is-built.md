# How proton is built (for developers)

proton is a static website with no build step and no runtime dependencies: plain HTML, CSS and JavaScript files that GitHub Pages serves from the root of the repository Math-halper/math-halper.github.io.

## The files that make proton

- **index.html**: the Math Helper cover page and the desktop shell.
- **assets/**: core.js (desktop, panel, proton menu, window manager and the AI button), boot.js, store.js (accounts and saved data), fs.js (the file system), search.js (the Browser's search engine), icons.js, desktop-icons.js, html-loader.js, math-helper.js (the cover page) and styles.css.
- **apps/**: one folder per app, in a folder per menu section: apps/system/, apps/productivity/, apps/media/, apps/tools/ and apps/games/. Each app is a single app.html that calls registerApp(); vendored apps keep their original files beside it.
- **data/applications.js**: the app catalog. One [application] block per app sets its id, name, path, icon, menu section (cat), description and window size. Adding a folder and a block adds an app; deleting the block removes it.
- **data/websites.js** and **websites/**: the built-in websites, such as the Test Page.
- **data/password.txt**: the desktop password.

## Generated files

Three tools rebuild generated files, in this order: tools/gen-mox-knowledge.py writes the "proton desktop" topic of Mox's library (this text) from the catalog and the guides in tools/mox-knowledge/; tools/gen-search-index.py writes data/search-index.js, the index behind the Browser's search; tools/gen-fs-manifest.py writes data/fs-manifest.js, the list of every file that Files shows under /.

## Tests

The tests use Node.js and jsdom: npm ci, then npm test. They check the catalog, every app module, the generated files, the games' files, and they boot a desktop and drive the apps, including the AI pane and this knowledge library.

## Deploying

A GitHub Actions workflow publishes the repository to GitHub Pages on every push to main. To run proton yourself, serve the folder over HTTP, for example with python3 -m http.server 8000, and open http://localhost:8000; opening index.html straight from disk does not work.
