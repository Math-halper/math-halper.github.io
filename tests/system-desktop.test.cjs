/* The current build keeps its five desktop System apps plus the file system
 * suite (Files, Text Editor, Image Viewer, Media, PDF Viewer — copied from
 * main), a Calculator and Web Retro (a vendored webretro emulator, no ROMs
 * included), and the vendored game apps — the Celeste Classics trio
 * (github.com/Math-halper/Celeste), Cookie Clicker plus 23 more games
 * (github.com/Gams-Offline/Gams) and Mari0 + Super Mario 64
 * (github.com/Math-halper/Mario, only the game builds) — each a thin wrapper
 * around the actual game files, copied byte-for-byte.
 * The one built-in website is Test Page, the Browser smoke test. These tests
 * keep the catalog, wrappers, generated file-system manifest and running
 * desktop in sync. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const source = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SYSTEM_APPS = ['appcenter', 'customize', 'settings', 'about', 'browser',
  'calculator', 'files', 'text-editor', 'pdf', 'image-viewer', 'media',
  'ruffle-flash-player', 'web-retro',
  'game-2048',
  'bloons-tower-defense-1',
  'bloons-tower-defense-2',
  'bloons-tower-defense-5',
  'bloxorz',
  'breaking-the-bank',
  'celeste-classic',
  'celeste-two',
  'celeste-community',
  'cookie-clicker',
  'drive-mad',
  'escaping-the-prison',
  'fleeing-the-complex',
  'grey-box-testing',
  'infiltrating-the-airship',
  'mari0',
  'offline-paradise',
  'pacman',
  'slope',
  'spacebar-clicker',
  'stack',
  'stealing-the-diamond',
  'stickman-hook',
  'sm64',
  'super-mario-rpg',
  'tetris',
  'the-impossible-quiz',
  'tunnel-rush'];
/* Menu sections for each app (data/applications.js cat=), in catalog order.
 * Every new app is filed here with its respective section — the catalog test
 * asserts each app's cat matches, and the boot test asserts the five menu
 * groups, so an unfiled app fails the suite. */
const SYSTEM_CATS = {
  appcenter: 'System', customize: 'System', settings: 'System', about: 'System', browser: 'System',
  calculator: 'Productivity', files: 'Productivity', 'text-editor': 'Productivity', pdf: 'Productivity',
  'image-viewer': 'Media', media: 'Media',
  'game-2048': 'Games',
  'bloons-tower-defense-1': 'Games',
  'bloons-tower-defense-2': 'Games',
  'bloons-tower-defense-5': 'Games',
  'bloxorz': 'Games',
  'breaking-the-bank': 'Games',
  'celeste-classic': 'Games',
  'celeste-two': 'Games',
  'celeste-community': 'Games',
  'cookie-clicker': 'Games',
  'drive-mad': 'Games',
  'escaping-the-prison': 'Games',
  'fleeing-the-complex': 'Games',
  'grey-box-testing': 'Games',
  'infiltrating-the-airship': 'Games',
  'mari0': 'Games',
  'offline-paradise': 'Games',
  'pacman': 'Games',
  'ruffle-flash-player': 'Tools',
  'slope': 'Games',
  'spacebar-clicker': 'Games',
  'stack': 'Games',
  'stealing-the-diamond': 'Games',
  'stickman-hook': 'Games',
  'sm64': 'Games',
  'super-mario-rpg': 'Games',
  'tetris': 'Games',
  'the-impossible-quiz': 'Games',
  'tunnel-rush': 'Games',
  'web-retro': 'Tools',
};
/* Each game app frames the game page that ships in its own folder. */
const GAME_PAGES = {
  'game-2048': 'apps/games/game-2048/2048.html',
  'bloons-tower-defense-1': 'apps/games/bloons-tower-defense-1/bloonstowerdefense1.html',
  'bloons-tower-defense-2': 'apps/games/bloons-tower-defense-2/bloonstowerdefense2.html',
  'bloons-tower-defense-5': 'apps/games/bloons-tower-defense-5/bloonstowerdefense5.html',
  'bloxorz': 'apps/games/bloxorz/bloxorz.html',
  'breaking-the-bank': 'apps/games/breaking-the-bank/breakingthebank.html',
  'celeste-classic': 'apps/games/celeste-classic/index.html',
  'celeste-two': 'apps/games/celeste-two/index.html',
  'celeste-community': 'apps/games/celeste-community/index.html',
  'cookie-clicker': 'apps/games/cookie-clicker/index.html',
  'drive-mad': 'apps/games/drive-mad/drivemad.html',
  'escaping-the-prison': 'apps/games/escaping-the-prison/escapingtheprison.html',
  'fleeing-the-complex': 'apps/games/fleeing-the-complex/fleeingthecomplex.html',
  'grey-box-testing': 'apps/games/grey-box-testing/index.html',
  'infiltrating-the-airship': 'apps/games/infiltrating-the-airship/infiltratingtheairship.html',
  'mari0': 'apps/games/mari0/index.html',
  'offline-paradise': 'apps/games/offline-paradise/offlineparadise.html',
  'pacman': 'apps/games/pacman/pacman.html',
  'slope': 'apps/games/slope/slope.html',
  'spacebar-clicker': 'apps/games/spacebar-clicker/spacebarclicker.html',
  'stack': 'apps/games/stack/stack.html',
  'stealing-the-diamond': 'apps/games/stealing-the-diamond/stealingthediamond.html',
  'stickman-hook': 'apps/games/stickman-hook/stickmanhook.html',
  'sm64': 'apps/games/sm64/index.html',
  'super-mario-rpg': 'apps/games/super-mario-rpg/supermariorpg.html',
  'tetris': 'apps/games/tetris/tetris.html',
  'the-impossible-quiz': 'apps/games/the-impossible-quiz/theimpossiblequiz.html',
  'tunnel-rush': 'apps/games/tunnel-rush/tunnelrush.html',
};
/* Games whose pages carry the source sites' href="../" all-games link. */
const PICKER_LINKED = ['celeste-classic', 'celeste-two', 'celeste-community', 'cookie-clicker', 'sm64'];
/* Every script index.html loads, in order, minus boot.js (which starts the
 * auth flow and needs a served page). */
const SHELL = ['assets/store.js', 'assets/icons.js', 'data/fs-manifest.js', 'assets/fs.js',
  'assets/fs-archive.js', 'data/applications.js', 'data/websites.js', 'assets/config-loader.js',
  'assets/core.js', 'assets/desktop-icons.js', 'assets/html-loader.js'];

/* Per-check states, for a readable failure message. */
function CHECK_STATES(w) {
  return [...w.document.querySelectorAll('.tp-check')].map((el) => `${el.id.replace('tp-check-', '')}=${el.dataset.state}`);
}

function catalog() {
  const ctx = vm.createContext({ window: {}, console, MH: { esc: (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;') } });
  for (const p of ['assets/icons.js', 'data/applications.js', 'data/websites.js', 'assets/config-loader.js']) {
    vm.runInContext(source(p), ctx);
  }
  return {
    apps: ctx.window.PROTON_APPLICATIONS,
    sites: ctx.window.PROTON_WEBSITES,
    warnings: ctx.window.PROTON_CATALOG_WARNINGS,
    icons: vm.runInContext('ICON_PATHS', ctx),
    render: vm.runInContext('iconSvg', ctx),
    renderIcon: vm.runInContext('iconFor', ctx),
    renderCatalogIcon: vm.runInContext('catalogIconFor', ctx),
    validIconPath: vm.runInContext('isIconAssetPath', ctx),
    loadImageIcon: vm.runInContext('iconImageFromFile', ctx),
  };
}

test('the catalog is the desktop apps, the file system suite, a calculator, web retro, the vendored games and the built-in test site', () => {
  const { apps, sites, warnings, icons, render, renderCatalogIcon, validIconPath } = catalog();
  assert.deepEqual(Array.from(warnings), [], 'catalog parses without warnings');
  /* Array.from everywhere: the catalogs come from a vm context, so their
   * arrays are not reference-equal to this realm's. */
  assert.deepEqual(Array.from(apps, (a) => a.id), SYSTEM_APPS);
  assert.deepEqual(Array.from(apps, (a) => a.cat), SYSTEM_APPS.map((id) => SYSTEM_CATS[id]));
  /* Every app uses a built-in SVG icon except the games: each game's default
   * is its own artwork under data/icons/<id>.png (Web Retro keeps Gams'
   * raster webretro.png). */
  const RASTER_ICON_APPS = {
    'game-2048': 'data/icons/game-2048.png',
    'bloons-tower-defense-1': 'data/icons/bloons-tower-defense-1.png',
    'bloons-tower-defense-2': 'data/icons/bloons-tower-defense-2.png',
    'bloons-tower-defense-5': 'data/icons/bloons-tower-defense-5.png',
    'bloxorz': 'data/icons/bloxorz.png',
    'breaking-the-bank': 'data/icons/breaking-the-bank.png',
    'celeste-classic': 'data/icons/celeste-classic.png',
    'celeste-two': 'data/icons/celeste-two.png',
    'celeste-community': 'data/icons/celeste-community.png',
    'cookie-clicker': 'data/icons/cookie-clicker.png',
    'drive-mad': 'data/icons/drive-mad.png',
    'escaping-the-prison': 'data/icons/escaping-the-prison.png',
    'fleeing-the-complex': 'data/icons/fleeing-the-complex.png',
    'grey-box-testing': 'data/icons/grey-box-testing.png',
    'infiltrating-the-airship': 'data/icons/infiltrating-the-airship.png',
    'mari0': 'data/icons/mari0.png',
    'offline-paradise': 'data/icons/offline-paradise.png',
    'pacman': 'data/icons/pacman.png',
    'ruffle-flash-player': 'data/icons/ruffle-flash-player.png',
    'slope': 'data/icons/slope.png',
    'spacebar-clicker': 'data/icons/spacebar-clicker.png',
    'stack': 'data/icons/stack.png',
    'stealing-the-diamond': 'data/icons/stealing-the-diamond.png',
    'stickman-hook': 'data/icons/stickman-hook.png',
    'sm64': 'data/icons/sm64.png',
    'super-mario-rpg': 'data/icons/super-mario-rpg.png',
    'tetris': 'data/icons/tetris.png',
    'the-impossible-quiz': 'data/icons/the-impossible-quiz.png',
    'tunnel-rush': 'data/icons/tunnel-rush.png',
    'web-retro': 'data/icons/webretro.png' };
  assert.deepEqual(Array.from(apps, (a) => a.svgIcon), SYSTEM_APPS.map((id) => !RASTER_ICON_APPS[id]));
  const iconById = Object.fromEntries(Array.from(apps, (a) => [a.id, a.icon]));
  for (const [id, icon] of Object.entries(RASTER_ICON_APPS)) {
    assert.equal(iconById[id], icon, `${id} should default to its own cropped art`);
  }
  assert.deepEqual(Array.from(sites, (s) => s.id), ['test-page']);
  const page = { ...sites[0] };
  assert.equal(page.name, 'Test Page');
  assert.equal(page.path, 'websites/test-page/site.html');
  assert.equal(page.icon, 'flask');
  assert.ok(page.desc.includes('TEST SITE'), 'the test site should say what it is');
  if (page.svgIcon) assert.ok(icons[page.icon], `test site uses unknown SVG icon "${page.icon}"`);
  else assert.ok(validIconPath(page.icon), 'test site has an unsafe default image path');
  assert.ok(fs.existsSync(path.join(ROOT, page.path)), `Missing site page: ${page.path}`);
  for (const app of apps) {
    assert.ok(app.name && app.path && app.desc, `${app.id} is missing metadata`);
    assert.ok(app.w >= 300 && app.h >= 200, `${app.id} has no usable window size`);
    if (app.svgIcon) {
      assert.ok(icons[app.icon], `${app.id} uses unknown SVG icon "${app.icon}"`);
      const svg = render(app.icon);
      assert.match(svg, /^<svg[\s\S]*currentColor[\s\S]*<\/svg>$/, `${app.id} icon is not a themed SVG`);
      assert.ok(!svg.includes('<image'), `${app.id} icon embeds a raster image`);
    } else {
      assert.ok(validIconPath(app.icon), `${app.id} has an unsafe default image path`);
      assert.ok(fs.existsSync(path.join(ROOT, app.icon)), `${app.id} icon file is missing: ${app.icon}`);
      assert.match(renderCatalogIcon(app.icon, false), /^<img class="icn app-icon-image" src="data\/icons\//);
    }
  }
  /* Nothing left in the repository should reference the removed layers. */
  for (const gone of ['assets/game-icons.js', 'assets/game-host.js', 'games']) {
    assert.equal(fs.existsSync(path.join(ROOT, gone)), false, `${gone} should be gone`);
  }
  /* websites/ is back, but only with the catalogued site and the template. */
  const siteFolders = fs.readdirSync(path.join(ROOT, 'websites'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(siteFolders, ['_embed', '_template', 'test-page']);
  const index = source('index.html');
  assert.ok(!index.includes('game-icons.js') && !index.includes('game-host.js'));
});

test('uploaded icon data renders only as a small, safe raster image', () => {
  const { renderIcon } = catalog();
  const image = 'data:image/png;base64,AQID';
  assert.equal(renderIcon(image), `<img class="icn app-icon-image" src="${image}" alt="" aria-hidden="true" draggable="false">`);
  assert.match(renderIcon('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), /^<svg/);
  assert.match(renderIcon('https://example.com/icon.png'), /^<svg/);
  assert.match(renderIcon(`data:image/png;base64,${'A'.repeat(180_001)}`), /^<svg/);
});

test('catalog icons accept local image paths or named inline SVG defaults', () => {
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(source('assets/icons.js'), ctx);
  ctx.window.PROTON_APPLICATIONS_TEXT = [
    '[application]', 'id=image-app', 'name=Image App', 'path=apps/image/app.html',
    'icon=data/icons/app-logo.png', 'svg-icon=false',
    '[application]', 'id=vector-app', 'name=Vector App', 'path=apps/vector/app.html',
    'icon=globe', 'svg-icon=true',
    '[application]', 'id=legacy-app', 'name=Legacy App', 'path=apps/legacy/app.html', 'icon=grid',
  ].join('\n');
  ctx.window.PROTON_WEBSITES_TEXT = '';
  vm.runInContext(source('assets/config-loader.js'), ctx);
  const apps = Array.from(ctx.window.PROTON_APPLICATIONS);
  assert.deepEqual(apps.map((app) => [app.icon, app.svgIcon]), [
    ['data/icons/app-logo.png', false], ['globe', true], ['grid', true],
  ]);
  assert.deepEqual(Array.from(ctx.window.PROTON_CATALOG_WARNINGS), []);
  assert.equal(vm.runInContext('appIcon(window.PROTON_APPLICATIONS[0])', ctx),
    '<img class="icn app-icon-image" src="data/icons/app-logo.png" alt="" aria-hidden="true" draggable="false">');
  assert.match(vm.runInContext('appIcon(window.PROTON_APPLICATIONS[1])', ctx), /^<svg/);
  assert.equal(vm.runInContext('isIconAssetPath("data/icons/app-logo.webp")', ctx), true);
  assert.equal(vm.runInContext('isIconAssetPath("data/icons/../app-logo.png")', ctx), false);
});

test('uploaded icon files reject unsafe formats and files over the size limit', async () => {
  const { loadImageIcon } = catalog();
  await assert.rejects(loadImageIcon({ type: 'image/svg+xml', size: 128 }), /PNG, JPG, WebP, GIF, BMP, or AVIF/);
  await assert.rejects(loadImageIcon({ type: 'image/png', size: 8 * 1024 * 1024 + 1 }), /8 MB or smaller/);
});

test('every catalog entry points at a real, syntactically valid app module', () => {
  const { apps } = catalog();
  for (const app of apps) {
    assert.ok(fs.existsSync(path.join(ROOT, app.path)), `Missing module: ${app.path}`);
    const script = source(app.path).match(/<script data-proton-app>([\s\S]*?)<\/script>/);
    assert.ok(script, `${app.id} is not a proton module`);
    assert.doesNotThrow(() => new vm.Script(script[1], { filename: app.path }), `Syntax error in ${app.id}`);
    assert.match(script[1], /registerApp\(/, `${app.id} never registers itself`);
    assert.equal(app.streamed, undefined, `${app.id} should load at boot, not lazily`);
  }
  /* The Celeste apps are wrapper + game: the actual game files are vendored
   * from Math-halper/Celeste, byte-for-byte, one app per game. */
  for (const [id, page] of Object.entries(GAME_PAGES)) {
    const app = apps.find((entry) => entry.id === id);
    assert.ok(app, `Missing catalog entry for ${id}`);
    const html = source(app.path);
    assert.ok(html.includes(`const GAME_PAGE = '${page}';`), `${id} points at the wrong game page`);
    assert.match(html, /src="[^"]*GAME_PAGE[^"]*"/, `${id} does not frame its own game page`);
    assert.ok(!/sandbox=/.test(html), `${id} frames its own local game page sandboxed`);
    assert.ok(html.includes('allowfullscreen'), `${id} frame cannot go fullscreen`);
    assert.ok(html.includes('[data-e="ext"]'), `${id} has no Open in new tab escape hatch`);
    assert.ok(fs.existsSync(path.join(ROOT, page)), `${id}'s game page is missing`);
  }
  /* The vendored games really are the games: their builds are huge. */
  for (const [p, min] of [
    ['apps/games/celeste-classic/celeste.js', 1000000],
    ['apps/games/celeste-classic/celeste.p8.png', 30000],
    ['apps/games/celeste-two/index.js', 1000000],
    ['apps/games/celeste-community/celeste_practice_mod.js', 1000000],
    ['apps/games/celeste-community/celeste2_1.1_practice_mod.js', 1000000],
    ['apps/games/celeste-community/webek.js', 1000000],
    ['apps/games/cookie-clicker/main.js', 900000],
    ['apps/games/slope/slope.html', 20000000],
    ['apps/games/stickman-hook/stickmanhook.html', 4000000],
    ['apps/games/fleeing-the-complex/data1.js', 20000000],
    ['apps/games/grey-box-testing/greyboxtesting.zip-chunk0.js', 20000000],
    ['apps/games/tunnel-rush/tunnelrush.zip-chunk0.js', 15000000],
    ['apps/tools/ruffle-flash-player/dd0be85ee9c2092132d1.wasm.js', 15000000],
    ['apps/games/mari0/love.wasm', 4000000],
    ['apps/games/mari0/game.data', 3000000],
    ['apps/games/sm64/sm64.us.f3dex2e.wasm', 15000000],
    ['apps/games/sm64/sm64.us.f3dex2e.js', 200000],
  ]) {
    assert.ok(fs.statSync(path.join(ROOT, p)).size >= min, `${p} is not the real game build`);
  }
  /* The game pages are untouched: their "all games" links still go one level
   * up, and apps/games/index.html is the picker those links expect. */
  for (const id of PICKER_LINKED) {
    assert.ok(source(`apps/games/${id}/index.html`).includes('href="../"'),
      `apps/games/${id}/index.html was edited — its ../ link is gone`);
  }
  const picker = source('apps/games/index.html');
  for (const id of Object.keys(GAME_PAGES)) {
    assert.ok(picker.includes(`./${id}/`), `apps/games/index.html does not link to ${id}`);
  }

  /* Every app lives inside its category folder — apps/<category>/<folder>/ —
   * and each category folder holds exactly its own apps. */
  const CAT_DIRS = { System: 'system', Productivity: 'productivity', Media: 'media', Tools: 'tools', Games: 'games' };
  for (const app of apps) {
    assert.ok(app.path.startsWith(`apps/${CAT_DIRS[app.cat]}/`),
      `${app.id} (${app.cat}) is not filed in apps/${CAT_DIRS[app.cat]}/`);
  }
  for (const [cat, dir] of Object.entries(CAT_DIRS)) {
    const dirs = fs.readdirSync(path.join(ROOT, 'apps', dir), { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => e.name).sort();
    /* Array.from: apps lives in the catalog vm realm — copy into this realm
     * so the arrays compare by structure, not realm identity. */
    const expected = Array.from(apps).filter((a) => a.cat === cat).map((a) => a.path.split('/')[2]).sort();
    assert.deepEqual(dirs, expected, `apps/${dir}/ should hold exactly the ${cat} apps`);
  }

  /* apps/ holds the five category folders plus the developer templates. */
  const folders = fs.readdirSync(path.join(ROOT, 'apps'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(folders, ['_embed', '_template', 'games', 'media', 'productivity', 'system', 'tools']);
});

test('the system manifest still matches the repository exactly', () => {
  const ctx = vm.createContext({ window: {} });
  vm.runInContext(source('data/fs-manifest.js'), ctx);
  const entries = ctx.window.PROTON_FS_MANIFEST;
  assert.ok(entries.length > 20, 'manifest looks empty');
  const paths = new Set(entries.map((e) => e.p));
  const { apps, sites } = catalog();
  for (const p of [...Array.from(apps, (a) => a.path), ...Array.from(sites, (s) => s.path)]) {
    assert.ok(paths.has(p), `Missing from the VFS: ${p}`);
  }
  for (const p of ['index.html', 'assets/core.js', 'assets/fs.js', 'data/applications.js', 'data/websites.js']) {
    assert.ok(paths.has(p), `Missing from the VFS: ${p}`);
  }
  for (const e of entries) {
    const full = path.join(ROOT, e.p);
    assert.ok(fs.existsSync(full), `Stale VFS entry: ${e.p}`);
    assert.ok(!e.p.startsWith('games/') && !e.p.startsWith('tests/'),
      `Removed or dev-only tree still listed: ${e.p}`);
    if (e.p !== 'data/fs-manifest.js') {
      assert.equal(e.s, fs.statSync(full).size, `Wrong VFS size: ${e.p}`);
    }
  }
  /* Every deployed file of the trimmed site is listed, using the same
   * exclusions as tools/gen-fs-manifest.py (dependencies, tests, and the
   * underscore-prefixed copy-me template folders). */
  const walk = (dir, prefix = '') => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = prefix + e.name;
    if (e.isDirectory()) {
      return ['node_modules', '.git', 'tests'].includes(e.name) || e.name.startsWith('_')
        ? [] : walk(path.join(dir, e.name), rel + '/');
    }
    return [rel];
  });
  const onDisk = walk('.').filter((p) => p !== 'data/fs-manifest.js').sort();
  assert.deepEqual(Array.from(entries, (e) => e.p).filter((p) => p !== 'data/fs-manifest.js').sort(), onDisk,
    'Manifest and repository disagree — re-run python3 tools/gen-fs-manifest.py');
});

test('the desktop boots, lists and opens all forty-one catalogued apps', async () => {
  const virtualConsole = new VirtualConsole(), errors = [];
  virtualConsole.on('jsdomError', (err) => errors.push(err.message));
  const dom = new JSDOM('<!doctype html><main id="auth" hidden></main><div id="desktop" hidden></div><div id="toasts"></div>', {
    url: 'https://math-halper.github.io/math-halper.github.io/', runScripts: 'dangerously',
    pretendToBeVisual: true, virtualConsole,
  });
  const { window: w } = dom;
  w.URL.createObjectURL = () => 'blob:mock';
  w.URL.revokeObjectURL = () => {};
  /* jsdom leaves TextEncoder/TextDecoder off the window (fs-archive.js needs
   * one to build a ZIP) and its Blob has no arrayBuffer()/text(), which
   * FS.readBlob/writeBlob use. Every browser has had both since 2015. */
  w.TextEncoder = TextEncoder;
  w.TextDecoder = TextDecoder;
  w.Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new w.FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('FileReader could not read the blob'));
      reader.readAsArrayBuffer(this);
    });
  };
  const run = (text) => {
    const script = w.document.createElement('script');
    script.textContent = text; w.document.body.appendChild(script); script.remove();
  };
  try {
    for (const p of SHELL) run(source(p));
    const fetched = [];
    w.fetchText = async (p) => { fetched.push(p); return source(p); };
    await w.loadHtmlModules();
    const { apps } = catalog();
    assert.deepEqual(Array.from(fetched), Array.from(apps, (a) => a.path), 'boot fetches exactly the catalogued modules');
    assert.equal(fetched.length, SYSTEM_APPS.length);

    w.eval("currentUser = {username:'Ada',usernameLower:'ada',displayName:'Ada',createdAt:Date.now()}; userData = MH.defaultData('Ada','ada'); enterDesktop();");
    const wins = w.eval('wins'), APPS = w.eval('APPS');

    // The account defaults point at apps that still exist (plus the home link).
    assert.deepEqual(Array.from(w.eval('userData.settings.pinned')), ['settings', 'appcenter', 'browser']);
    const shortcuts = Array.from(w.eval('userData.desktopIcons'));
    assert.deepEqual(shortcuts.map((s) => s.target),
      ['settings', 'browser', 'files', w.eval('FS.home()')]);
    for (const s of shortcuts) {
      if (s.kind === 'app') assert.ok(APPS[s.target], `default shortcut to a removed app: ${s.target}`);
      else assert.ok(w.eval('FS').stat(s.target), `default shortcut to a missing path: ${s.target}`);
    }

    // The start menu groups all forty-one apps into their five sections.
    const menu = w.document.querySelector('#startmenu');
    assert.deepEqual([...menu.querySelectorAll('.sm-cat')].map((e) => e.textContent),
      ['System', 'Productivity', 'Media', 'Tools', 'Games']);
    assert.deepEqual([...menu.querySelectorAll('.sm-item')].map((e) => e.dataset.app), SYSTEM_APPS);

    // The panel only pins apps that exist, and each app really renders.
    assert.deepEqual([...w.document.querySelectorAll('#panelapps .pitem')].map((e) => e.dataset.app),
      ['settings', 'appcenter', 'browser']);
    for (const id of SYSTEM_APPS) {
      w.openApp(id);
      const body = wins.get(id)?.body;
      const text = body?.textContent || '';
      assert.ok(body && body.innerHTML.length > 100, `${id} rendered nothing`);
      assert.ok(!/hit a snag|Could not load/i.test(text), `${id} reported an error: ${text.slice(0, 140)}`);
      if (GAME_PAGES[id]) {
        const frame = body.querySelector('iframe.site-frame');
        assert.ok(frame, `${id} did not render its game page`);
        assert.equal(frame.getAttribute('src'), GAME_PAGES[id]);
        assert.ok(frame.hasAttribute('allowfullscreen'), `${id} frame cannot go fullscreen`);
        assert.ok(body.querySelector('[data-e="ext"]'), `${id} has no direct-link escape hatch`);
      }
      w.closeWin(id, true);
    }

    // The Calculator computes — keypad clicks and keyboard keys alike.
    w.openApp('calculator');
    const calc = wins.get('calculator').body;
    const press = (...keys) => keys.forEach((k) => calc.querySelector(`[data-k="${k}"]`).click());
    const shown = () => calc.querySelector('#calc-display').textContent;
    press('1', '2', '*', '3', '=');
    assert.equal(shown(), '36', 'buttons compute');
    press('ac', '1', '0', '/', '4', '=');
    assert.equal(shown(), '2.5', 'decimal results');
    press('ac', '5', '+', '3', '=');
    assert.equal(shown(), '8');
    press('=');
    assert.equal(shown(), '11', 'pressing = repeats the last operation');
    press('ac', '1', '/', '0', '=');
    assert.equal(shown(), 'Error', 'division by zero reports an error');
    press('7');
    assert.equal(shown(), '7', 'a digit after an error starts fresh');
    press('neg', 'back');
    assert.equal(shown(), '0', 'plus/minus and backspace edit the entry');
    const key = (k) => calc.querySelector('#calc-wrap')
      .dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    key('7'); key('*'); key('6'); key('Enter');
    assert.equal(shown(), '42', 'the keyboard drives the calculator');
    key('Escape');
    assert.equal(shown(), '0', 'Escape clears');
    w.closeWin('calculator', true);

    // Web Retro's launcher picks a core and offers both ROM sources.
    w.openApp('web-retro');
    const retro = wins.get('web-retro').body;
    assert.deepEqual([...retro.querySelectorAll('[data-core]')].map((b) => b.dataset.core),
      ['mupen64plus_next', 'snes9x', 'nestopia', 'mgba']);
    assert.equal(retro.querySelector('#wr-upload').hidden, true, 'no ROM panel before a core is picked');
    retro.querySelector('[data-core="snes9x"]').click();
    assert.equal(retro.querySelector('#wr-upload').hidden, false);
    assert.equal(retro.querySelector('#wr-corename').textContent, 'SNES');
    assert.ok(retro.querySelector('[data-src="device"]'), 'no "this computer" ROM source');
    assert.ok(retro.querySelector('[data-src="vfs"]'), 'no "proton Files" ROM source');
    retro.querySelector('#wr-play').click();
    assert.match(w.document.querySelector('#toasts').textContent, /Choose a ROM file/);
    // A ROM imported into the proton file system is listed, then handed to the
    // emulator over the BroadcastChannel like a device file.
    const home = w.eval('FS.home()');
    await w.eval(`FS.writeBlob(${JSON.stringify(home + '/Downloads/nes-rom.nes')}, new Blob([new Uint8Array([0x4e, 0x45, 0x53, 0x1a])]))`);
    retro.querySelector('[data-src="vfs"]').click();
    const dl = [...retro.querySelectorAll('[data-dir]')].find((b) => b.dataset.dir.endsWith('/Downloads'));
    assert.ok(dl, 'proton Files should show the Downloads folder');
    dl.click();
    const row = [...retro.querySelectorAll('[data-file]')].find((b) => b.dataset.file.endsWith('nes-rom.nes'));
    assert.ok(row, 'proton Files should list the imported ROM');
    row.click();
    const chSent = [];
    w.BroadcastChannel = class {
      constructor(name) { this.name = name; w.__wrCh = this; }
      postMessage(m) { chSent.push(m); }
      close() {}
    };
    retro.querySelector('#wr-play').click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const frame = retro.querySelector('#wr-frame');
    assert.ok(frame, 'Play should frame the emulator');
    assert.match(frame.src, /rom=channel/);
    w.__wrCh.onmessage({ data: { status: 'ready' } });
    assert.equal(chSent.length, 1, 'the launch page should get the ROM over the channel');
    assert.equal(chSent[0].rom.name, 'nes-rom.nes');
    w.closeWin('web-retro', true);

    // Every open/save asks which file system to use: "your Files" (this
    // computer) or the proton file system.
    const askModal = (label) => {
      const modal = w.document.querySelector('.file-source-backdrop');
      assert.ok(modal, `${label} does not ask which file system to use`);
      assert.ok(modal.querySelector('[data-fs="device"]') && modal.querySelector('[data-fs="vfs"]'),
        `${label} chooser is missing one of the two file systems`);
      modal.querySelector('[data-fs="cancel"]').click();
      assert.ok(!w.document.querySelector('.file-source-backdrop'), `${label} chooser does not close`);
    };
    w.openApp('image-viewer');
    wins.get('image-viewer').body.querySelector('#iv-open').click();
    askModal('Image Viewer Open…');
    w.closeWin('image-viewer', true);
    w.openApp('media');
    wins.get('media').body.querySelector('#md-open').click();
    askModal('Media Open…');
    w.closeWin('media', true);
    w.openApp('pdf');
    wins.get('pdf').body.querySelector('#pdf-open').click();
    askModal('PDF Viewer Open…');
    w.closeWin('pdf', true);
    w.openApp('files');
    wins.get('files').body.querySelector('#fm-import').click();
    askModal('Files Import');
    wins.get('files').body.querySelector('#fm-download').click();
    askModal('Files Download');
    w.closeWin('files', true);
    w.openApp('settings');
    wins.get('settings').body.querySelector('#s-export').click();
    askModal('Settings Export backup');
    wins.get('settings').body.querySelector('#s-import-btn').click();
    askModal('Settings Import backup');
    w.closeWin('settings', true);
    w.openApp('customize');
    wins.get('customize').body.querySelector('[data-micon-ask]').click();
    askModal('Customize "Set image…"');
    w.closeWin('customize', true);

    // The Text Editor asks on Open, Save and Save a copy — and choosing the
    // proton file system really saves there.
    w.eval(`openFSItem(${JSON.stringify(home + '/Documents/Welcome.txt')})`);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const teWin = wins.get('text-editor').body;
    assert.ok(!teWin.querySelector('#te-save').disabled, 'Save should be live for a writable file');
    teWin.querySelector('#te-open').click();
    askModal('Text Editor Open…');
    teWin.querySelector('#te-copy').click();
    askModal('Text Editor Save a copy…');
    teWin.querySelector('#te-text').value = 'saved through the chooser';
    teWin.querySelector('#te-save').click();
    w.document.querySelector('.file-source-backdrop [data-fs="vfs"]').click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.match(w.document.querySelector('#toasts').textContent, /Saved Welcome\.txt/);
    assert.equal(await w.eval(`FS.read(${JSON.stringify(home + '/Documents/Welcome.txt')})`), 'saved through the chooser');
    w.closeWin('text-editor', true);

    // Files lists the account's home folder places from the virtual file system.
    w.openApp('files');
    const filesBody = wins.get('files').body;
    for (const dir of ['Desktop', 'Documents', 'Downloads', 'Pictures']) {
      assert.match(filesBody.textContent, new RegExp(dir), `Files should list ${dir}`);
    }
    w.closeWin('files', true);

    // The Browser registers the catalogued site and offers it on its home page.
    w.openApp('browser');
    const browserBody = wins.get('browser').body;
    const SITES = w.eval('SITES');
    assert.deepEqual(Object.keys(SITES), ['test-page']);
    assert.ok(new URL(SITES['test-page'].page).pathname.endsWith('/websites/test-page/site.html'));
    assert.deepEqual([...browserBody.querySelectorAll('#b-sites-menu option')].map((o) => o.value),
      ['', 'test-page']);
    assert.deepEqual([...browserBody.querySelectorAll('[data-site]')].map((b) => b.dataset.site), ['test-page']);
    // Visiting it frames the page at proton://test-page.
    browserBody.querySelector('[data-site="test-page"]').click();
    assert.equal(browserBody.querySelector('#b-url').value, 'proton://test-page');
    assert.ok(browserBody.querySelector('iframe.site-frame').src.endsWith('/websites/test-page/site.html'));
    w.closeWin('browser', true);

    // A system text file opens in the Text Editor — locked, read-only. proton's
    // own files are fetched over HTTP, so serve them out of the repository (the
    // test page lives one folder down, like the real GitHub Pages site).
    const served = (url) => {
      const rel = new URL(url).pathname.replace(/^\/+/, '');
      return source(fs.existsSync(path.join(ROOT, rel)) ? rel : rel.split('/').slice(1).join('/'));
    };
    w.fetch = async (url) => ({
      ok: true, status: 200,
      text: async () => served(url),
      blob: async () => new w.Blob([served(url)]),
    });
    w.eval("openFSItem('/README.md')");
    assert.ok(wins.has('text-editor'), 'a system text file opens in the Text Editor');
    await new Promise((resolve) => setTimeout(resolve, 20));
    const editor = wins.get('text-editor').body;
    assert.match(editor.querySelector('#te-note').textContent, /read-only proton system/);
    assert.equal(editor.querySelector('#te-text').readOnly, true);
    assert.match(editor.querySelector('#te-text').value, /^# proton/);
    assert.equal(editor.querySelector('#te-save').disabled, true, 'a read-only file cannot be saved in place');
    w.closeWin('text-editor', true);

    // A file with no viewer of its own is shown in Files, selected.
    await w.eval("FS.writeBlob('/home/ada/backup.zip', new Blob([new Uint8Array([1, 2, 3])]))");
    w.eval("openFSItem('/home/ada/backup.zip')");
    assert.ok(wins.has('files'), 'Files is the fallback');
    assert.match(w.document.querySelector('#toasts').textContent, /No viewer for backup\.zip/);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.ok(wins.get('files').body.querySelector('.sel[data-path="/home/ada/backup.zip"]'),
      'the fallback selects the file');
    w.closeWin('files', true);

    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('Customize saves, displays and resets uploaded app icon images', async () => {
  const { window: w } = new JSDOM('<!doctype html><main id="auth" hidden></main><div id="desktop" hidden></div><div id="toasts"></div>', {
    url: 'https://math-halper.github.io/math-halper.github.io/', runScripts: 'dangerously', pretendToBeVisual: true,
  });
  const storedImage = 'data:image/webp;base64,AQID';
  w.URL.createObjectURL = () => 'blob:icon-upload';
  w.URL.revokeObjectURL = () => {};
  w.Image = class {
    constructor() { this.naturalWidth = 256; this.naturalHeight = 128; }
    set src(_value) { queueMicrotask(() => this.onload?.()); }
  };
  w.HTMLCanvasElement.prototype.getContext = () => ({ clearRect() {}, drawImage() {} });
  w.HTMLCanvasElement.prototype.toDataURL = () => storedImage;
  const run = (text) => { const s = w.document.createElement('script'); s.textContent = text; w.document.body.appendChild(s); s.remove(); };
  try {
    for (const p of SHELL) run(source(p));
    w.fetchText = async (p) => source(p);
    await w.loadHtmlModules();
    w.eval("APPS.browser.icon = 'data/icons/catalog-browser.png'; APPS.browser.svgIcon = false; currentUser = {username:'Ada',usernameLower:'ada',displayName:'Ada',createdAt:Date.now()}; userData = MH.defaultData('Ada','ada'); userData.customApps.push({id:'legacy-image-app',name:'Saved App',url:'https://example.org/',icon:'globe',desc:'Saved app'}); enterDesktop();");
    w.eval("window.confirm = () => true;");
    assert.equal(w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png', 'catalog image paths are the default for all users');
    assert.equal(w.document.querySelector('#panelapps .pitem[data-app="browser"] img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png');
    assert.equal(w.document.querySelector('.desktop-icon[data-shortcut="desktop-browser"] img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png');
    w.openApp('customize');
    const body = w.eval('wins').get('customize').body;
    assert.equal(body.querySelector('[data-micon="browser"]').value, '__catalog__');
    let iconSelect = body.querySelector('[data-micon="browser"]');
    iconSelect.value = 'globe';
    body.querySelector('[data-msave="browser"]').click();
    assert.equal(w.eval('APPS.browser.icon'), 'globe');
    assert.equal(w.eval('APPS.browser.svgIcon'), true, 'a selected vector icon overrides the catalog image');
    iconSelect = body.querySelector('[data-micon="browser"]');
    assert.ok(iconSelect.querySelector('option[value="__catalog__"]'), 'image defaults remain available after selecting a vector');
    iconSelect.value = '__catalog__';
    body.querySelector('[data-msave="browser"]').click();
    assert.equal(w.eval('APPS.browser.icon'), 'data/icons/catalog-browser.png');
    assert.equal(w.eval('APPS.browser.svgIcon'), false, 'the catalog image can be restored');
    w.openApp('browser');
    const browserWindow = w.eval('wins').get('browser');
    assert.equal(body.querySelector('#cust-files-shortcut'), null, 'Customize still offers a Files shortcut');
    assert.deepEqual([...body.querySelectorAll('#cust-modlist .card b')].map((b) => b.textContent).slice(0, SYSTEM_APPS.length),
            ['App Center', 'Customize', 'Settings', 'About', 'Browser', 'Calculator', 'Files', 'Text Editor', 'PDF Viewer', 'Image Viewer', 'Media', 'Ruffle Flash Player', 'Web Retro', '2048', 'Bloons Tower Defense 1', 'Bloons Tower Defense 2', 'Bloons Tower Defense 5', 'Bloxorz', 'Breaking The Bank', 'Celeste Classic', 'Celeste Classic 2', 'Celeste Community', 'Cookie Clicker', 'Drive Mad', 'Escaping The Prison', 'Fleeing The Complex', 'Grey Box Testing', 'Infiltrating The Airship', 'Mari0', 'Offline Paradise', 'Pacman', 'Slope', 'Spacebar Clicker', 'Stack', 'Stealing The Diamond', 'Stickman Hook', 'Super Mario 64', 'Super Mario RPG', 'Tetris', 'The Impossible Quiz', 'Tunnel Rush']);

    const uploadBrowserIcon = async () => {
      const input = body.querySelector('[data-micon-file="browser"]');
      assert.ok(input, 'Customize should offer an image picker for app icons');
      Object.defineProperty(input, 'files', { configurable: true, value: [{ type: 'image/png', size: 1024 }] });
      await input.onchange();
    };
    await uploadBrowserIcon();
    assert.equal(w.eval('APPS.browser.iconImage'), storedImage);
    assert.equal(JSON.parse(w.localStorage.getItem('mhOS.user.ada.v1')).moduleOverrides.browser.iconImage, storedImage,
      'the resized image is saved in this account data');
    assert.ok(w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image'));
    assert.ok(w.document.querySelector('#panelapps .pitem[data-app="browser"] img.app-icon-image'));
    assert.ok(w.document.querySelector('.desktop-icon[data-shortcut="desktop-browser"] img.app-icon-image'));
    assert.ok(browserWindow.el.querySelector('.wic img.app-icon-image'), 'an already-open window title updates live');
    w.openApp('appcenter');
    const center = w.eval('wins').get('appcenter').body;
    const browserCard = [...center.querySelectorAll('#ac-grid .card')].find((card) => card.querySelector('h3')?.textContent === 'Browser');
    assert.ok(browserCard?.querySelector('.card-ic img.app-icon-image'), 'App Center listings use the uploaded image');
    w.closeWin('appcenter', true);
    w.openApp('about');
    assert.ok(w.eval('wins').get('about').body.querySelector('.app-main p img.app-icon-image'), 'About lists use the uploaded image');
    w.closeWin('about', true);

    body.querySelector('[data-micon-clear="browser"]').click();
    assert.equal(w.eval('APPS.browser.iconImage'), '', 'the clear button removes the account image override');
    assert.equal(w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png', 'clearing restores the catalog path icon');
    assert.equal(browserWindow.el.querySelector('.wic img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png', 'open window titles restore the catalog path icon');
    w.closeWin('browser', true);

    const customInput = body.querySelector('[data-cicon-file="legacy-image-app"]');
    assert.ok(customInput, 'saved custom apps should also have image icon controls');
    Object.defineProperty(customInput, 'files', { configurable: true, value: [{ type: 'image/png', size: 1024 }] });
    await customInput.onchange();
    assert.equal(w.eval("APPS['legacy-image-app'].iconImage"), storedImage);
    assert.equal(JSON.parse(w.localStorage.getItem('mhOS.user.ada.v1')).customApps[0].iconImage, storedImage);
    w.openApp('appcenter');
    const customCard = [...w.eval('wins').get('appcenter').body.querySelectorAll('#ac-custom .card')]
      .find((card) => card.querySelector('h3')?.textContent === 'Saved App');
    assert.ok(customCard?.querySelector('.card-ic img.app-icon-image'), 'saved custom app listings use the uploaded image');
    w.closeWin('appcenter', true);
    body.querySelector('[data-cicon-clear="legacy-image-app"]').click();
    assert.equal(w.eval("APPS['legacy-image-app'].iconImage"), '');

    await uploadBrowserIcon();
    body.querySelector('#cust-reset').click();
    assert.equal(w.eval('APPS.browser.iconImage'), '', 'Reset customisations also clears uploaded icons');
    assert.equal(w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image')?.getAttribute('src'),
      'data/icons/catalog-browser.png', 'reset returns to the configured default icon');
    assert.deepEqual(Array.from(w.eval('userData.settings.pinned')), ['settings', 'appcenter', 'browser']);
    assert.deepEqual(Array.from(w.eval('userData.desktopIcons'), (s) => s.target),
      ['settings', 'browser', 'files', w.eval('FS.home()')]);
  } finally { w.close(); }
});

/* apps/_embed and websites/_embed are the "just frame a page" starting
 * points: one EMBED_URL constant to change and nothing else to edit. */
test('the embed templates are one constant away from a working embed', () => {
  const { apps, sites } = catalog();
  const ctx = vm.createContext({ window: {} });
  vm.runInContext(source('data/fs-manifest.js'), ctx);
  const listed = new Set(Array.from(ctx.window.PROTON_FS_MANIFEST, (e) => e.p));

  for (const p of ['apps/_embed/app.html', 'websites/_embed/index.html']) {
    const html = source(p);
    /* Exactly one place to change, and it is a plain https string constant. */
    const urls = [...html.matchAll(/^const EMBED_URL = '([^']*)';$/gm)].map((m) => m[1]);
    assert.equal(urls.length, 1, `${p} should have one EMBED_URL constant to change`);
    assert.match(urls[0], /^https:\/\/[^'"\s]+$/, `${p}'s EMBED_URL is not a plain https address`);
    assert.match(html, /CHANGE ME/, `${p} no longer marks the line to change`);

    // A template is a starting point: never registered, never deployed.
    assert.ok(!apps.some((a) => a.path === p), `${p} must not be in the app catalog`);
    assert.ok(!sites.some((s) => s.path === p), `${p} must not be in the website catalog`);
    assert.equal(listed.has(p), false, `${p} must stay out of the generated manifest`);

    // Both parse as JavaScript, and both frame the page safely.
    const script = html.match(/<script(?: data-proton-app)?>([\s\S]*?)<\/script>/);
    assert.ok(script, `${p} has no script block`);
    assert.doesNotThrow(() => new vm.Script(script[1], { filename: p }), `Syntax error in ${p}`);
    assert.match(html, /<iframe/, `${p} embeds nothing`);
    assert.match(html, /sandbox="[^"]*allow-scripts[^"]*"/, `${p}'s frame is not sandboxed`);
    assert.ok(!/sandbox="[^"]*allow-same-origin/.test(html),
      `${p} must not give an embedded page same-origin access to proton's storage`);
    assert.match(html, /Open in new tab/, `${p} needs an escape hatch for sites that refuse framing`);
  }

  /* The commented-out example blocks in both catalogs must stay comments. */
  assert.ok(!apps.some((a) => a.id === 'my-embed'));
  assert.ok(!sites.some((s) => s.id === 'my-embed'));
});

/* The built-in test site is the smoke test for the Browser, so it has to
 * pass its own checks. Loaded here as a top-level page (no Browser around
 * it), with the page's script run only once the environment is ready: jsdom
 * has no canvas, no HTTP and no storage for a file: URL, so those are stubbed
 * and the two desktop-bridge checks must skip themselves rather than fail. */
test('the Test Page site passes its own checks', async () => {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => {
    if (!/getContext|not implemented/i.test(err.message)) throw err;
  });
  /* runScripts: 'dangerously' so the injected script below is executed, but
   * no `resources`: the linked stylesheet is not fetched (it is injected by
   * hand instead) and the page's own script is run once the stubs are in. */
  const dom = await JSDOM.fromFile(path.join(ROOT, 'websites/test-page/site.html'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole,
  });
  const { window: w } = dom;
  try {
    w.HTMLCanvasElement.prototype.getContext = function () {
      const data = new Uint8ClampedArray(4);
      return {
        canvas: this, fillStyle: '', strokeStyle: '', lineWidth: 0, font: '',
        fillRect() { data.set([255, 255, 255, 255]); },
        clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fillText() {},
        getImageData: () => ({ data }),
      };
    };
    w.fetch = async () => ({ ok: true });
    /* jsdom gives a file: URL an opaque origin, where touching localStorage
     * throws — stub a per-window one so the storage check is meaningful. */
    const store = new Map();
    try {
      Object.defineProperty(w, 'localStorage', {
        configurable: true,
        value: {
          getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
          setItem: (k, v) => { store.set(String(k), String(v)); },
          removeItem: (k) => { store.delete(String(k)); },
          clear: () => store.clear(),
          key: (i) => [...store.keys()][i] ?? null,
          get length() { return store.size; },
        },
      });
    } catch { /* a real origin already has one */ }
    /* The page links ../../assets/styles.css, which jsdom does not fetch for
     * a file: URL — inject the real sheet so the "stylesheet applied" check
     * is checking proton's CSS, not nothing. */
    const style = w.document.createElement('style');
    style.textContent = source('assets/styles.css');
    w.document.head.appendChild(style);

    const script = w.document.createElement('script');
    script.textContent = source('websites/test-page/site.html').match(/<script>([\s\S]*?)<\/script>/)[1];
    w.document.body.appendChild(script);

    const summary = () => w.document.querySelector('#tp-summary').textContent;
    /* The page flags an in-flight run on the check list's container, so this
     * waits for a run to finish instead of guessing from the summary text. */
    const settled = async () => {
      for (let i = 0; i < 200 && w.document.querySelector('.card[data-running="true"]'); i++) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    };
    await settled();
    const state = (id) => w.document.querySelector(`#tp-check-${id}`).dataset.state;
    assert.equal(summary(), 'All 7 checks passed (2 skipped — open this page in the Browser to run them).',
      CHECK_STATES(w).join(' '));
    assert.equal(state('ctx'), 'skip');
    assert.equal(state('catalog'), 'skip');
    assert.equal(w.document.querySelectorAll('.tp-check[data-state="fail"]').length, 0);

    // Outside the Browser the desktop bridge stays disabled and says why.
    assert.equal(w.document.querySelector('#tp-home').disabled, true);
    assert.equal(w.document.querySelector('#tp-appbtns').children.length, 0);
    assert.match(w.document.querySelector('#tp-ctx').textContent, /Opened outside the Browser/);

    // The manual controls work.
    w.document.querySelector('#tp-inc').click();
    w.document.querySelector('#tp-inc').click();
    assert.equal(w.document.querySelector('#tp-count').textContent, '2');
    w.document.querySelector('#tp-reset').click();
    assert.equal(w.document.querySelector('#tp-count').textContent, '0');
    assert.match(w.document.querySelector('#tp-clock').textContent, /\d{1,2}:\d{2}:\d{2}/);
    w.document.querySelector('#tp-input').value = 'hello proton';
    w.document.querySelector('#tp-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(w.document.querySelector('#tp-out').textContent, 'You typed: hello proton');
    w.document.querySelector('#tp-note').value = 'remembered';
    w.document.querySelector('#tp-note-save').click();
    assert.match(w.document.querySelector('#tp-note-out').textContent, /Saved: remembered/);
    assert.equal(w.localStorage.getItem('proton:test-page:note'), 'remembered');

    // Re-running the checks still passes.
    w.document.querySelector('#tp-rerun').click();
    await settled();
    assert.match(summary(), /^All 7 checks passed/);
    w.stop(); // the page's 1 s clock interval must not outlive the test
  } finally { dom.window.close(); }
});
