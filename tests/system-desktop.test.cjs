/* The current build keeps its five desktop System apps plus the file system
 * suite (Files, Text Editor, Image Viewer, Media, PDF Viewer — copied from
 * main), a Calculator and Web Retro (a vendored webretro emulator, no ROMs
 * included), and the vendored game apps — the Celeste Hub
 * (github.com/Math-halper/Celeste, every Celeste game in one app), Cookie Clicker plus 23 more games
 * (github.com/Gams-Offline/Gams), 12 more vendored games,
 * and Mari0 + Super Mario 64
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
/* The file system suite FS.appFor() resolves files to. */
const FS_APPS = ['files', 'text-editor', 'image-viewer', 'media', 'pdf'];
const SYSTEM_APPS = ['appcenter', 'customize', 'settings', 'about', 'browser', 'calculator', 'files', 'text-editor', 'pdf', 'image-viewer', 'media', 'ruffle-flash-player', 'web-retro', 'you-are-an-idiot', 'game-2048', 'bloons-tower-defense-1', 'bloons-tower-defense-2', 'bloons-tower-defense-5', 'bloxorz', 'breaking-the-bank', 'celeste-hub', 'cookie-clicker', 'drive-mad', 'escaping-the-prison', 'fleeing-the-complex', 'grey-box-testing', 'infiltrating-the-airship', 'mari0', 'offline-paradise', 'pacman', 'slope', 'spacebar-clicker', 'stack', 'stealing-the-diamond', 'stickman-hook', 'sm64', 'tetris', 'the-impossible-quiz', 'tunnel-rush', 'baldis-basics', 'minesweeper', 'flappy-bird', 'retro-bowl', 'drift-boss', 'football-bros', 'five-nights-at-freddys-1', 'five-nights-at-freddys-4', 'five-nights-at-freddys-2', 'five-nights-at-freddys-3', 'backrooms', 'kart-bros', 'geometry-dash-lite', 'five-nights-at-freddys-sl', 'bitburner'];

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
  'celeste-hub': 'Games',
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
  'tetris': 'Games',
  'the-impossible-quiz': 'Games',
  'tunnel-rush': 'Games',
  'web-retro': 'Tools',
  'you-are-an-idiot': 'Tools',
  'baldis-basics': 'Games',
  'minesweeper': 'Games',
  'flappy-bird': 'Games',
  'retro-bowl': 'Games',
  'drift-boss': 'Games',
  'football-bros': 'Games',
  'five-nights-at-freddys-1': 'Games',
  'five-nights-at-freddys-4': 'Games',
  'five-nights-at-freddys-2': 'Games',
  'five-nights-at-freddys-3': 'Games',
  'backrooms': 'Games',
  'kart-bros': 'Games',
  'geometry-dash-lite': 'Games',
  "bitburner": 'Games',
  'five-nights-at-freddys-sl': 'Games',
};
/* Each game app frames the game page that ships in its own folder. */
const GAME_PAGES = {
  'game-2048': 'apps/games/game-2048/2048.html',
  'bloons-tower-defense-1': 'apps/games/bloons-tower-defense-1/bloonstowerdefense1.html',
  'bloons-tower-defense-2': 'apps/games/bloons-tower-defense-2/bloonstowerdefense2.html',
  'bloons-tower-defense-5': 'apps/games/bloons-tower-defense-5/bloonstowerdefense5.html',
  'bloxorz': 'apps/games/bloxorz/bloxorz.html',
  'breaking-the-bank': 'apps/games/breaking-the-bank/breakingthebank.html',
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
  'tetris': 'apps/games/tetris/tetris.html',
  'the-impossible-quiz': 'apps/games/the-impossible-quiz/theimpossiblequiz.html',
  'tunnel-rush': 'apps/games/tunnel-rush/tunnelrush.html',
  'baldis-basics': 'apps/games/baldis-basics/index.html',
  'minesweeper': 'apps/games/minesweeper/index.html',
  'flappy-bird': 'apps/games/flappy-bird/index.html',
  'retro-bowl': 'apps/games/retro-bowl/index.html',
  'drift-boss': 'apps/games/drift-boss/index.html',
  'football-bros': 'apps/games/football-bros/index.html',
  'five-nights-at-freddys-1': 'apps/games/five-nights-at-freddys-1/index.html',
  'five-nights-at-freddys-4': 'apps/games/five-nights-at-freddys-4/index.html',
  'five-nights-at-freddys-2': 'apps/games/five-nights-at-freddys-2/index.html',
  'five-nights-at-freddys-3': 'apps/games/five-nights-at-freddys-3/index.html',
  'backrooms': 'apps/games/backrooms/index.html',
  'kart-bros': 'apps/games/kart-bros/index.html',
  'geometry-dash-lite': 'apps/games/geometry-dash-lite/index.html',
  'five-nights-at-freddys-sl': 'apps/games/five-nights-at-freddys-sl/index.html',
  "bitburner": 'apps/games/bitburner/index.html',
};
/* Celeste Hub is one app that frames eight Celeste pages (plus its own
 * standalone chooser page, apps/games/celeste-hub/index.html, which the
 * folder picker links to). The eight pages used to be eight separate
 * catalog apps; they stay individually listed here so every one is still
 * checked as its own tested game page below. */
const CELESTE_HUB_PAGES = [
  'apps/games/celeste-classic/index.html',
  'apps/games/celeste-two/index.html',
  'apps/games/celeste-community/index.html',
  'apps/games/celeste-community/practice_mod_c.html',
  'apps/games/celeste-community/cc2_practice_mod_1.0.html',
  'apps/games/celeste-community/cc2_practice_mod_1.1.html',
  'apps/games/celeste-community/webek.html',
  'apps/games/celeste-community/downloads.html',
];
const CELESTE_HUB_ALL_PAGES = ['apps/games/celeste-hub/index.html', ...CELESTE_HUB_PAGES];
/* Games whose pages carry the source sites' href="../" all-games link. */
const PICKER_LINKED = ['celeste-classic', 'celeste-two', 'celeste-community', 'cookie-clicker', 'sm64'];
/* Every script index.html loads, in order, minus boot.js (which starts the
 * auth flow and needs a served page). Read from the page itself so this list
 * cannot drift when a new data file or asset is added. */
const SHELL = [...source('index.html').matchAll(/<script src="([^"]+)"><\/script>/g)]
  .map((m) => m[1])
  .filter((p) => p !== 'assets/boot.js');

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
    'celeste-hub': 'data/icons/celeste-classic.png',
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
    'tetris': 'data/icons/tetris.png',
    'the-impossible-quiz': 'data/icons/the-impossible-quiz.png',
    'tunnel-rush': 'data/icons/tunnel-rush.png',
    'web-retro': 'data/icons/webretro.png', 'baldis-basics': 'data/icons/baldis-basics.png', 'minesweeper': 'data/icons/minesweeper.png', 'flappy-bird': 'data/icons/flappy-bird.png', 'retro-bowl': 'data/icons/retro-bowl.png', 'drift-boss': 'data/icons/drift-boss.png', 'football-bros': 'data/icons/football-bros.png', 'five-nights-at-freddys-1': 'data/icons/five-nights-at-freddys-1.png', 'five-nights-at-freddys-4': 'data/icons/five-nights-at-freddys-4.png', 'five-nights-at-freddys-2': 'data/icons/five-nights-at-freddys-2.png', 'five-nights-at-freddys-3': 'data/icons/five-nights-at-freddys-3.png', 'backrooms': 'data/icons/backrooms.png', 'kart-bros': 'data/icons/kart-bros.png', 'geometry-dash-lite': 'data/icons/geometry-dash-lite.png', 'five-nights-at-freddys-sl': 'data/icons/five-nights-at-freddys-sl.png' };
  assert.deepEqual(Array.from(apps, (a) => a.svgIcon), SYSTEM_APPS.map((id) => !RASTER_ICON_APPS[id]));
  const iconById = Object.fromEntries(Array.from(apps, (a) => [a.id, a.icon]));
  for (const [id, icon] of Object.entries(RASTER_ICON_APPS)) {
    assert.equal(iconById[id], icon, `${id} should default to its own cropped art`);
  }
  /* Every catalog block says whether the app is preinstalled, and the
   * parser exposes it as a boolean. Everything ships with proton except
   * the one app marked preinstalled=false (You Are An Idiot). */
  assert.ok(apps.filter((a) => a.id !== 'you-are-an-idiot').every((a) => a.preinstalled === true),
    'catalogued apps should be marked as preinstalled unless they opt out');
  assert.equal(apps.find((a) => a.id === 'you-are-an-idiot')?.preinstalled, false,
    'the idiot app should be the one app that is not preinstalled');
  assert.equal((source('data/applications.js').match(/^preinstalled=(true|false)$/gm) || []).length,
    apps.length + 1, 'every [application] block (and the template) should state preinstalled=');
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
  assert.deepEqual(siteFolders, ['_template', 'test-page']);
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
    '[application]', 'id=image-app', 'name=Image App', 'path=apps/inbuilt/image/app.html',
    'icon=data/icons/app-logo.png', 'svg-icon=false',
    '[application]', 'id=vector-app', 'name=Vector App', 'path=apps/inbuilt/vector/app.html',
    'icon=globe', 'svg-icon=true',
    '[application]', 'id=legacy-app', 'name=Legacy App', 'path=apps/inbuilt/legacy/app.html', 'icon=grid',
  ].join('\n');
  ctx.window.PROTON_WEBSITES_TEXT = '';
  vm.runInContext(source('assets/config-loader.js'), ctx);
  const apps = Array.from(ctx.window.PROTON_APPLICATIONS);
  assert.deepEqual(apps.map((app) => [app.icon, app.svgIcon]), [
    ['data/icons/app-logo.png', false], ['globe', true], ['grid', true],
  ]);
  assert.deepEqual(Array.from(ctx.window.PROTON_CATALOG_WARNINGS), []);
  assert.equal(vm.runInContext('appIcon(window.PROTON_APPLICATIONS[0])', ctx),
    '<img class="icn app-icon-image app-icon-only" src="data/icons/app-logo.png" alt="" aria-hidden="true" draggable="false">');
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
  /* Most games are wrapper + game: the actual game files are vendored,
   * byte-for-byte, one app per game. Celeste is the exception — one hub
   * app (below) frames all eight Celeste pages. */
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
  /* Celeste Hub: one catalog app choosing between all eight Celeste
   * pages. Its chooser must offer every page, frame it unsandboxed with
   * fullscreen and an escape hatch, and be able to return to the list. */
  const hub = apps.find((entry) => entry.id === 'celeste-hub');
  assert.ok(hub, 'Missing catalog entry for celeste-hub');
  const hubHtml = source(hub.path);
  for (const page of CELESTE_HUB_PAGES) {
    assert.ok(hubHtml.includes(page), `celeste-hub does not offer ${page}`);
    assert.ok(fs.existsSync(path.join(ROOT, page)), `celeste-hub game page is missing: ${page}`);
  }
  assert.ok(hubHtml.includes('Change game'), 'celeste-hub has no way back to its game chooser');
  assert.ok(hubHtml.includes('[data-e="ext"]'), 'celeste-hub has no Open in new tab escape hatch');
  assert.ok(/<iframe[^>]*allowfullscreen/.test(hubHtml.replace(/\n/g, ' ')) || hubHtml.includes('allowfullscreen'),
    'celeste-hub frame cannot go fullscreen');
  assert.ok(!/sandbox=/.test(hubHtml), 'celeste-hub frames its own local game pages sandboxed');
  const hubPicker = source('apps/games/celeste-hub/index.html');
  for (const page of CELESTE_HUB_PAGES) {
    const rel = page.replace('apps/games/', '../');
    assert.ok(hubPicker.includes(rel), `apps/games/celeste-hub/index.html does not link to ${page}`);
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
  assert.ok(picker.includes('./celeste-hub/'), 'apps/games/index.html does not link to celeste-hub');
  assert.ok(!picker.includes('./celeste-classic/') && !picker.includes('./subway-surfers'),
    'apps/games/index.html still lists a Celeste game or Subway Surfers as its own app');

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
    const expected = Array.from(apps).filter((a) => a.cat === cat).map((a) => a.path.split('/')[2]);
    /* Celeste Hub is a single Games app, but its games keep their own
     * vendored folders (celeste-classic/, celeste-two/, celeste-community/)
     * beside celeste-hub/ so their byte-for-byte files and relative paths
     * do not move. Those three are the hub's game folders, not apps. */
    if (cat === 'Games') expected.push('celeste-classic', 'celeste-community', 'celeste-two');
    expected.sort();
    assert.deepEqual(dirs, expected, `apps/${dir}/ should hold exactly the ${cat} apps`);
  }

  /* apps/ holds the five category folders plus the developer templates. */
  const folders = fs.readdirSync(path.join(ROOT, 'apps'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(folders, ['_template', 'games', 'media', 'productivity', 'system', 'tools']);
});

test('every game HTML file is its own game and none of its assets are missing', () => {
  /* Walk apps/games like the manifest does: every .html that is not a
   * proton wrapper (app.html) and not the picker itself must be the
   * GAME_PAGE of exactly one catalogued game — so a page added to a
   * multi-page folder cannot hide inside another game's app. */
  const walk = (dir, prefix = '') => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = prefix + e.name;
    if (e.isDirectory()) return walk(path.join(dir, e.name), rel + '/');
    return e.name.endsWith('.html') ? [rel] : [];
  });
  const pages = walk('apps/games', 'apps/games/')
    .filter((rel) => !rel.endsWith('/app.html') && rel !== 'apps/games/index.html')
    .sort();
  assert.deepEqual([...Object.values(GAME_PAGES), ...CELESTE_HUB_ALL_PAGES].sort(), pages,
    'every game HTML file should be its own catalogued game (the Celeste pages belong to Celeste Hub)');
  for (const page of pages) {
    const html = source(page);
    assert.match(html, /<(?:html|head|body)[\s>]/i, `${page} does not look like an HTML page`);
    /* Every asset the page loads (scripts, styles, images, frames) must
     * ship beside it — a missing one is a broken game, even when the
     * proton wrapper around it is fine. Navigation <a> links are not
     * assets and may leave the app, so they are not checked here. */
    for (const m of html.matchAll(/<(?:script|link|img|iframe|source|video|audio|embed)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)/gi)) {
      const ref = m[1].trim();
      if (!ref || /^(?:#|https?:\/\/|data:|blob:|mailto:|javascript:|\/\/)/i.test(ref)) continue;
      const clean = ref.split('#')[0].split('?')[0];
      if (!clean) continue;
      const target = clean.startsWith('/')
        ? path.join(ROOT, clean)
        : path.join(ROOT, path.dirname(page), clean);
      assert.ok(fs.existsSync(target), `${page} loads missing asset ${ref}`);
    }
    /* Inline scripts must at least parse. */
    for (const m of html.matchAll(/<script(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\btype\s*=\s*["'](?!text\/javascript|module)[^"']+["']/i.test(m[1])) continue;
      const code = m[2].trim();
      if (code) assert.doesNotThrow(() => new vm.Script(code, { filename: page }), `Syntax error in inline script in ${page}`);
    }
  }
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

test('the cover search bar and Sign in button gate the desktop with data/password.txt', async () => {
  /* The editable password file: the first line that is not blank and does
   * not start with # is the password. */
  const password = source('data/password.txt').split(/\r?\n/)
    .map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
  assert.ok(password, 'data/password.txt should contain a password line');
  const index = source('index.html');
  assert.match(index, /<form id="cover-search" class="cover-header-search">\s*<label class="cover-sr" for="cover-q">Search skills<\/label>\s*<input id="cover-q" type="search"[^>]*placeholder="Search skills, topics or grades"/,
    'the header search bar next to Sign in should read as an ordinary search bar');
  assert.ok(!/<input id="cover-q"[^>]*type="password"/.test(index) &&
    !index.includes('for="cover-q">Desktop password') &&
    !index.includes('autocomplete="current-password"'),
    'nothing on the cover should identify the search bar as a password box');
  assert.match(index, /<\/form>\s*<button type="button" id="cover-signin" class="cover-signin">Sign in<\/button>/,
    'the cover should have a working Sign in button right next to the search bar');
  assert.ok(!index.includes('placeholder="Enter password"'),
    'the main cover area should not show an Enter password field');
  assert.ok(!index.includes('cover-signin cover-decoy'), 'Sign in must not be a dead cover control');
  assert.ok(!index.includes('cover-decoy'), 'ordinary cover controls must be wired, not decoys');
  for (const hook of ['data-cover-nav="learning"', 'data-cover-nav="diagnostic"',
    'data-cover-nav="analytics"', 'data-cover-nav="membership"', 'data-cover-action="start-practice"',
    'data-cover-action="start-diagnostic"', 'data-cover-action="resume"', 'data-cover-action="all-grades"',
    'data-cover-action="all-skills"', 'data-cover-action="recommendations"', 'data-cover-action="awards"',
    'data-cover-action="analytics"', 'data-cover-action="about"', 'data-cover-action="help"',
    'data-cover-action="privacy"', 'data-cover-action="waitlist"', 'id="math-helper-workspace"', 'data-grade="5"',
    'data-cover-skill="add-subtract-fractions"']) {
    assert.ok(index.includes(hook), `the working cover should include ${hook}`);
  }
  assert.ok(index.includes('<script src="assets/math-helper.js"></script>'),
    'the cover should load the Math Helper learning app');
  const mathHelper = source('assets/math-helper.js');
  for (const feature of ['showSearch', 'startPractice', 'startDiagnostic', 'showAnalytics',
    'showAwards', 'showMembership', 'showWaitlist', 'joinWaitlist', 'waitlist',
    'window.verifySitePassword', 'MH.MATH_HELPER_KEY']) {
    assert.ok(mathHelper.includes(feature), `Math Helper should implement ${feature}`);
  }
  const store = source('assets/store.js');
  assert.ok(store.includes('purgeLegacyStorage') && store.includes("LEGACY_STORAGE_PREFIX = 'mhOS.'"),
    'loading storage should delete the old mhOS storage system');
  assert.ok(store.includes("ACCOUNTS_KEY: 'proton2.accounts.v1'") &&
    store.includes("userKey: (u) => `proton2.user.${u}.v1`") &&
    store.includes("MATH_HELPER_KEY: 'proton2.math-helper.v1'"),
  'accounts and cover learning should use the new proton2 storage namespace');
  /* The cover must not give any indication that it is broken: no outage
   * banner, no error chip, no unavailable labels, no zeroed progress. */
  for (const sign of ['cover-status', 'Practice is temporarily unavailable', 'MH-503',
    'Skill service offline', 'Recommendations could not be refreshed', '>Unavailable<', 'width:0%']) {
    assert.ok(!index.includes(sign), `the cover should not show "${sign}"`);
  }
  assert.ok(!index.includes('id="cover-enter"') && !index.includes('Continue to Math Helper') &&
    !index.includes('cover-entry') && !index.includes('idiot-lock') && !index.includes('idiot-video'),
    'the bottom Continue entry band and the video trap markup should be gone');
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/youare.mp4')), 'assets/youare.mp4 should stay in the repository');
  assert.ok(fs.statSync(path.join(ROOT, 'assets/youare.mp4')).size > 1_000_000,
    'assets/youare.mp4 should contain the real video, not a placeholder');
  const boot = source('assets/boot.js');
  assert.ok(boot.includes("fetch('data/password.txt'"), 'the gate should read data/password.txt');
  assert.ok(boot.includes('hasLocalAccount') && boot.includes('MH.accounts()'),
    'once an account exists on this device, Sign in should not need the password again');
  assert.ok(!boot.includes('isPageReload'), 'a refresh must not skip the password gate');
  assert.ok(!boot.includes('coverUnavailable') && !boot.includes('cover-status'),
    'clicking a cover control should not report that anything is unavailable');
  assert.ok(boot.includes('window.verifySitePassword') && boot.includes('verifySitePassword'),
    'boot should publish the site-password verifier the waitlist uses');
  assert.ok(!boot.includes('lockIdiotVideo') && !boot.includes('idiot') && !boot.includes('requestFullscreen') &&
    !boot.includes('youare.mp4'),
    'no cover control should reveal, play or fullscreen the retained video file');

  const virtualConsole = new VirtualConsole(), errors = [];
  virtualConsole.on('jsdomError', (err) => errors.push(err.message));
  const dom = new JSDOM(index, {
    url: 'https://math-halper.github.io/', runScripts: 'dangerously',
    pretendToBeVisual: true, virtualConsole,
  });
  const { window: w } = dom;
  /* Seed the retired storage system: loading assets/store.js must delete
   * every one of these before any account is read. */
  w.localStorage.setItem('mhOS.accounts.v1', JSON.stringify({ old: { username: 'old', usernameLower: 'old' } }));
  w.localStorage.setItem('mhOS.user.old.v1', '{}');
  w.localStorage.setItem('mhOS.desktopProfile.v1', 'old');
  w.sessionStorage.setItem('mhOS.welcomed.old', '1');
  w.URL.createObjectURL = () => 'blob:mock';
  w.URL.revokeObjectURL = () => {};
  w.Element.prototype.scrollIntoView = function () {};
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
  /* jsdom cannot play media; record playback attempts instead. Nothing on
   * the cover should ever trigger one now that the trap is gone. */
  w.HTMLMediaElement.prototype.play = function () { this.dataset.played = 'true'; return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};
  const run = (text) => {
    const script = w.document.createElement('script');
    script.textContent = text; w.document.body.appendChild(script); script.remove();
  };
  const until = async (pred, label) => {
    for (let i = 0; i < 200; i++) {
      if (pred()) return;
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.fail(`timed out waiting for ${label}; jsdom errors: ${errors.join(' | ')}`);
  };
  try {
    for (const p of SHELL) run(source(p));
    w.fetchText = async (p) => source(p);
    w.fetch = async (url) => ({
      ok: true, status: 200,
      text: async () => source(new URL(url, w.location.href).pathname.slice(1)),
    });
    run(boot);
    await until(() => w.eval('protonModulesReady') === true, 'the desktop modules to load');
    const cover = w.document.querySelector('#cover');
    const desktop = w.document.querySelector('#desktop');
    const input = w.document.querySelector('#cover-q');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    assert.equal(input.type, 'search', 'the header bar should be a search box, not a password box');
    assert.equal(w.document.querySelector('label[for="cover-q"]').textContent, 'Search skills',
      'the search bar should not be labelled as a password box');
    assert.equal(input.closest('.cover-header-search').nextElementSibling.id, 'cover-signin',
      'the search bar should sit right next to Sign in in the header');
    assert.equal(w.document.querySelector('.cover-hero').querySelector('#cover-q'), null,
      'the main hero area should not contain the password entry');
    assert.ok(!w.document.querySelector('.cover-hero').textContent.includes('Enter password'),
      'the main hero area should not mention entering a password');
    assert.equal(cover.hidden, false, 'the cover should be shown first');
    assert.equal(desktop.hidden, true, 'the desktop should start hidden behind the gate');
    assert.equal(w.document.querySelector('#cover-status'), null,
      'the cover should have no status banner');
    /* The retired mhOS storage system is deleted on load, so the seeded
     * old account cannot be read by the new proton2 system. */
    assert.equal(w.localStorage.getItem('mhOS.accounts.v1'), null,
      'old mhOS accounts should be deleted on load');
    assert.equal(w.localStorage.getItem('mhOS.user.old.v1'), null,
      'old mhOS account data should be deleted on load');
    assert.equal(w.localStorage.getItem('mhOS.desktopProfile.v1'), null,
      'the old mhOS desktop profile should be deleted on load');
    assert.equal(w.sessionStorage.getItem('mhOS.welcomed.old'), null,
      'old mhOS session data should be deleted on load');
    assert.deepEqual(Object.keys(w.eval('MH.accounts()')), [],
      'accounts from the old storage system should no longer work');

    /* Ordinary Math Helper controls now work. Learning opens saved
     * recommendations, search finds skills, practice marks answers, the
     * diagnostic saves an action plan, and analytics/membership persist. */
    const workspace = w.document.querySelector('#math-helper-workspace');
    const helperState = () => JSON.parse(w.localStorage.getItem('proton2.math-helper.v1'));
    assert.equal(workspace.hidden, true, 'the Math Helper workspace should start closed');
    w.document.querySelector('[data-cover-nav="learning"]').click();
    assert.equal(workspace.hidden, false, 'Learning should open the Math Helper workspace');
    assert.match(workspace.textContent, /Your next steps/);
    assert.match(workspace.textContent, /Recommended for you/);

    input.value = 'fractions';
    w.document.querySelector('#cover-search').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(desktop.hidden, true, 'submitting the skill search should not open the desktop');
    assert.match(workspace.textContent, /Results for “fractions”/);
    assert.match(workspace.textContent, /Add and subtract fractions/);
    assert.match(workspace.textContent, /Multiply fractions/);

    workspace.querySelector('[data-cover-skill="add-subtract-fractions"]').click();
    assert.match(workspace.textContent, /Question 1/);
    assert.equal(workspace.querySelectorAll('[data-answer]').length, 4,
      'practice should offer four answer choices');
    workspace.querySelector('[data-answer]').click();
    assert.match(workspace.textContent, /Correct — great work!|Not quite\./);
    assert.equal(helperState().answered, 1, 'practice answers should be saved in the new cover storage');
    workspace.querySelector('[data-cover-action="next-question"]').click();
    assert.match(workspace.textContent, /Question 2/);

    w.document.querySelector('[data-cover-nav="diagnostic"]').click();
    for (let i = 0; i < 6; i++) {
      const answer = workspace.querySelector('[data-answer]');
      assert.ok(answer, `diagnostic question ${i + 1} should offer an answer`);
      answer.click();
    }
    assert.match(workspace.textContent, /Diagnostic complete/);
    assert.match(workspace.textContent, /Your action plan/);
    assert.equal(helperState().diagnostic.completed, 1,
      'the diagnostic result should be saved in the new cover storage');
    assert.ok(helperState().diagnostic.recommendedIds.length > 0,
      'the diagnostic should save recommended skills');

    w.document.querySelector('[data-cover-nav="analytics"]').click();
    assert.match(workspace.textContent, /Progress reports/);
    assert.match(workspace.textContent, /Growth by topic/);

    /* Membership: Free is chosen instantly, but Family/Classroom are
     * waitlist-only. Joining needs the site password — not an account. */
    w.document.querySelector('[data-cover-nav="membership"]').click();
    assert.match(workspace.textContent, /Family/);
    assert.match(workspace.textContent, /Classroom/);
    workspace.querySelector('[data-plan="Free"]').click();
    assert.equal(helperState().membershipPlan, 'Free',
      'choosing the Free membership plan should save it locally');
    workspace.querySelector('[data-waitlist-plan="Family"]').click();
    assert.match(workspace.textContent, /Join the Math Helper waitlist/);
    assert.ok(workspace.querySelector('#waitlist-form'), 'the waitlist should show its form');

    /* A wrong password adds nobody, even with name/email/plan filled in. */
    workspace.querySelector('#waitlist-name').value = 'Ada';
    workspace.querySelector('#waitlist-email').value = 'ada@example.com';
    workspace.querySelector('#waitlist-password').value = 'not the password';
    workspace.querySelector('#waitlist-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => /That password isn't right/.test(workspace.textContent),
      'the wrong-password waitlist message');
    assert.equal(helperState().waitlist.length, 0,
      'a wrong password must not add anyone to the waitlist');
    assert.deepEqual(Object.keys(w.eval('MH.accounts()')), [],
      'the waitlist attempt should not create a desktop account');

    /* The correct site password adds the entry and confirms the place. */
    workspace.querySelector('#waitlist-password').value = password;
    workspace.querySelector('#waitlist-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => /You're on the waitlist/.test(workspace.textContent),
      'the waitlist confirmation');
    assert.equal(helperState().waitlist.length, 1,
      'the correct password should add one waitlist entry');
    assert.equal(helperState().waitlist[0].email, 'ada@example.com');
    assert.equal(helperState().waitlist[0].plan, 'Family');
    assert.equal(helperState().membershipPlan, 'Free',
      'joining the waitlist should not silently change the active plan');
    assert.deepEqual(Object.keys(w.eval('MH.accounts()')), [],
      'joining the waitlist should not create a desktop account');
    assert.match(workspace.textContent, /On the waitlist \(1\)/);

    w.document.querySelector('.cover-grades [data-grade="5"]').click();
    assert.match(workspace.textContent, /Grade 5 maths/);
    assert.match(workspace.textContent, /Multiply fractions/);
    w.document.querySelector('.cover-section [data-cover-action="all-skills"]').click();
    assert.match(workspace.textContent, /All skills/);
    assert.match(workspace.textContent, /Probability and statistics/);
    w.document.querySelector('[data-cover-action="awards"]').click();
    assert.match(workspace.textContent, /Awards and certificates/);
    w.document.querySelector('[data-cover-action="about"]').click();
    assert.match(workspace.textContent, /About Math Helper/);
    w.document.querySelector('[data-cover-action="help"]').click();
    assert.match(workspace.textContent, /How Math Helper works/);
    w.document.querySelector('[data-cover-action="privacy"]').click();
    assert.match(workspace.textContent, /Your learning stays on this device/);

    /* Even the correct password only searches when the form is submitted;
     * the desktop gate remains the separate Sign in click. */
    input.value = password;
    w.document.querySelector('#cover-search').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(desktop.hidden, true, 'submitting the search form should never open the desktop');
    assert.equal(cover.hidden, false);
    w.document.querySelector('[data-cover-action="home"]').click();
    assert.equal(workspace.hidden, true, 'the Math Helper logo should close the workspace');
    const coverText = cover.textContent;

    /* A wrong password typed in the search bar and Sign in keeps the
     * desktop hidden, with no visible response either. */
    input.value = 'not the password';
    w.document.querySelector('#cover-signin').click();
    await wait(80);
    assert.equal(desktop.hidden, true, 'a wrong password must not open the desktop');
    assert.equal(cover.hidden, false);
    assert.equal(cover.textContent, coverText, 'a wrong password should not change the cover');

    /* With no account on this device yet, pressing Sign in without
     * entering the password does nothing either: the password is still
     * needed to reach the account creation page the first time. */
    input.value = '';
    w.document.querySelector('#cover-signin').click();
    await wait(80);
    assert.equal(desktop.hidden, true, 'Sign in without the password must not open the desktop before an account exists');
    assert.equal(cover.hidden, false);
    assert.equal(w.document.querySelector('#setup-form'), null,
      'Sign in without the password must not reach account creation before an account exists');
    assert.equal(cover.textContent, coverText, 'an empty Sign in should not change the cover');

    /* The password from data/password.txt, then Sign in, shows the Create
     * your account page when this browser has no local account yet. */
    input.value = password;
    w.document.querySelector('#cover-signin').click();
    await until(() => w.document.querySelector('#setup-form'), 'the account creation page on first sign-in');
    assert.equal(cover.hidden, true, 'the cover should hide once the gate is passed');
    assert.equal(desktop.hidden, true, 'the desktop should wait for account creation on first sign-in');
    assert.equal(w.document.querySelector('#auth').hidden, false,
      'the account creation page should be visible on first sign-in');
    assert.match(w.document.querySelector('#auth').textContent, /Create your account/,
      'the first sign-in should show the Create your account page');
    assert.ok(!w.localStorage.getItem('proton2.accounts.v1')?.includes('student'),
      'the first sign-in should not silently create a Student profile');

    /* Creating the account enters the desktop as that account. */
    w.document.querySelector('#su-name').value = 'Ada';
    w.document.querySelector('#su-user').value = 'ada';
    w.document.querySelector('#su-pass').value = 'account-password';
    w.document.querySelector('#su-pass2').value = 'account-password';
    w.document.querySelector('#setup-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => desktop.hidden === false, 'the desktop after creating the account');
    assert.equal(w.document.querySelector('#auth').hidden, true,
      'the account creation page should hide once the account is created');
    assert.equal(w.eval('currentUser.username'), 'ada');
    assert.ok(w.localStorage.getItem('proton2.accounts.v1').includes('ada'),
      'creating the account should store the local desktop profile');

    /* Locking asks for that same file password, not anything else. */
    w.eval('lockDesktop()');
    assert.equal(desktop.hidden, true);
    const lockPass = w.document.querySelector('#lk-pass');
    const lockForm = w.document.querySelector('#lock-form');
    lockPass.value = 'not the password';
    lockForm.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => /Incorrect password/.test(w.document.querySelector('#lk-err').textContent),
      'the wrong lock password message');
    assert.equal(desktop.hidden, true, 'a wrong lock password must not unlock');
    lockPass.value = password;
    lockForm.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => desktop.hidden === false, 'the desktop after unlocking');

    /* Signing out returns to the cover with the password cleared. */
    w.eval('signOut()');
    assert.equal(desktop.hidden, true);
    assert.equal(cover.hidden, false, 'signing out should show the cover gate again');
    assert.equal(input.value, '', 'signing out should clear the password field');

    /* With an account now on this device, just pressing Sign in — without
     * entering the password again — opens its desktop directly. The
     * account creation page is first-sign-in only. */
    input.value = '';
    w.document.querySelector('#cover-signin').click();
    await until(() => desktop.hidden === false, 'the desktop for the existing account');
    assert.equal(cover.hidden, true, 'the cover should hide for the existing account');
    assert.equal(w.document.querySelector('#auth').hidden, true,
      'an existing account should not see the account creation page again');
    assert.equal(w.eval('currentUser.username'), 'ada',
      'the existing account should reopen after the gate');
    w.eval('signOut()');
    assert.equal(desktop.hidden, true);
    assert.equal(cover.hidden, false, 'signing out should show the cover gate again');
    assert.equal(input.value, '', 'signing out should clear the password field');

    /* The bottom Continue band and the video trap are gone entirely: no
     * entry button, no lock overlay, no video element, and nothing left
     * that could play or fullscreen the retained media file. */
    assert.equal(w.document.querySelector('#cover-enter'), null,
      'the bottom Continue to Math Helper button should be removed');
    assert.equal(w.document.querySelector('.cover-entry'), null,
      'the bottom entry band should be removed');
    assert.equal(w.document.querySelector('#idiot-lock'), null,
      'the fullscreen video lock should be removed');
    assert.equal(w.document.querySelector('#idiot-video'), null,
      'the trap video element should be removed');
    assert.equal(w.document.querySelector('video'), null,
      'the cover should not contain any video element');
    assert.equal(desktop.hidden, true, 'the desktop should stay hidden on the cover');
    assert.equal(cover.hidden, false, 'the cover should still be showing');
  } finally {
    w.close();
  }
});

test('the desktop boots, lists and opens all catalogued apps', async () => {
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

    // The start menu groups all apps into their five sections.
    const menu = w.document.querySelector('#startmenu');
    assert.deepEqual([...menu.querySelectorAll('.sm-cat')].map((e) => e.textContent),
      ['System', 'Productivity', 'Media', 'Tools', 'Games']);
    /* The one not-preinstalled app (You Are An Idiot) stays out of the menu
     * until it is installed from App Center. */
    assert.deepEqual([...menu.querySelectorAll('.sm-item')].map((e) => e.dataset.app),
      SYSTEM_APPS.filter((id) => id !== 'you-are-an-idiot'));
    w.openApp('appcenter');
    const idiotCard = [...wins.get('appcenter').body.querySelectorAll('#ac-grid .card')]
      .find((card) => card.querySelector('h3')?.textContent === 'You Are An Idiot');
    assert.ok(idiotCard, 'App Center should list the not-preinstalled app');
    const installBtn = idiotCard.querySelector('[data-restore="you-are-an-idiot"]');
    assert.ok(installBtn, 'the not-preinstalled app should offer Install in App Center');
    assert.match(installBtn.textContent, /Install/);
    installBtn.click();
    assert.ok([...menu.querySelectorAll('.sm-item')].map((e) => e.dataset.app).includes('you-are-an-idiot'),
      'installing should put the app in the proton menu');
    assert.ok(Array.from(w.eval('userData.installedApps')).includes('you-are-an-idiot'),
      'installing should be remembered on the account');
    w.closeWin('appcenter', true);

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

    // Celeste Hub opens on its chooser, plays the game you pick in its
    // own frame, and "Change game" returns to the chooser.
    w.openApp('celeste-hub');
    const hubBody = wins.get('celeste-hub').body;
    const hubChoices = [...hubBody.querySelectorAll('[data-ch-game]')];
    assert.equal(hubChoices.length, CELESTE_HUB_PAGES.length, 'Celeste Hub should offer every Celeste game');
    assert.deepEqual(hubChoices.map((b) => b.querySelector('b').textContent),
      ['Celeste Classic', 'Celeste Classic 2', 'Celeste Community', 'Celeste Classic Practice Mod',
       'Celeste Classic 2 Practice Mod 1.0', 'Celeste Classic 2 Practice Mod 1.1', 'Celeste Webek',
       'Celeste Classic Downloads']);
    assert.ok(!hubBody.querySelector('#ch-frame'), 'Celeste Hub should not load a game before one is chosen');
    hubChoices[0].click();
    const hubFrame = hubBody.querySelector('iframe.site-frame');
    assert.ok(hubFrame, 'Celeste Hub did not frame the chosen game');
    assert.equal(hubFrame.getAttribute('src'), 'apps/games/celeste-classic/index.html');
    assert.ok(hubFrame.hasAttribute('allowfullscreen'), 'Celeste Hub frame cannot go fullscreen');
    assert.ok(!hubFrame.hasAttribute('sandbox'), 'Celeste Hub frames its local game sandboxed');
    const hubAgain = hubBody.querySelector('#ch-again');
    assert.ok(hubAgain && !hubAgain.hidden, 'Celeste Hub hides its Change game button while playing');
    assert.match(hubAgain.textContent, /Change game/);
    hubAgain.click();
    assert.equal(hubBody.querySelectorAll('[data-ch-game]').length, CELESTE_HUB_PAGES.length,
      'Change game should return Celeste Hub to its chooser');
    assert.ok(!hubBody.querySelector('#ch-frame'), 'Change game should unload the Celeste game frame');
    w.closeWin('celeste-hub', true);

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

    // Web Retro's front page is two tabs in the desktop's own style:
    // ROMs — four console boxes (NES, SNES, N64, GB), each bringing up
    // that console's bundled games with their poster art — and
    // Emulators, the same console boxes, where picking one opens a
    // "where from?" screen (proton Files or this computer; back arrow).
    w.openApp('web-retro');
    const retro = wins.get('web-retro').body;
    const tabBtns = [...retro.querySelectorAll('[data-wr-tab]')];
    assert.deepEqual(tabBtns.map((b) => b.textContent.trim()), ['ROMs', 'Emulators'],
      'the front page should be two clickable tabs');
    assert.equal(retro.querySelector('#wr-roms').hidden, false, 'the ROMs tab starts open');
    assert.equal(retro.querySelector('#wr-emulators').hidden, true, 'the Emulators tab starts closed');
    assert.deepEqual([...retro.querySelectorAll('#wr-roms [data-console]')].map((b) => b.dataset.console),
      ['NES', 'SNES', 'N64', 'GB'], 'the ROMs tab is four console boxes, NES down to GB');
    const gridCount = () => retro.querySelectorAll('#wr-grid [data-bundled]').length;
    assert.equal(gridCount(), 5, 'the NES box starts picked, with its games in the grid');
    const firstArt = retro.querySelector('#wr-grid [data-bundled] img');
    assert.ok(firstArt && /^data\/icons\/.+\.jpeg$/.test(firstArt.getAttribute('src')),
      'bundled games show their poster art');
    retro.querySelector('[data-console="GB"]').click();
    assert.equal(gridCount(), 13, 'the GB box shows the GB/GBC/GBA games');
    retro.querySelector('[data-console="SNES"]').click();
    assert.equal(gridCount(), 0, 'no SNES games are bundled');
    retro.querySelector('[data-console="NES"]').click();
    assert.equal(gridCount(), 5, 'picking NES again refills the grid');
    retro.querySelector('[data-wr-tab="emulators"]').click();
    assert.equal(retro.querySelector('#wr-roms').hidden, true, 'the Emulators tab hides the ROMs tab');
    assert.equal(retro.querySelector('#wr-emulators').hidden, false, 'the Emulators tab shows its console boxes');
    assert.deepEqual([...retro.querySelectorAll('#wr-emulators [data-core]')].map((b) => b.dataset.core),
      ['nestopia', 'snes9x', 'mupen64plus_next', 'mgba']);
    assert.equal(retro.querySelector('#wr-upload').hidden, true, 'no source screen before an emulator is picked');
    retro.querySelector('[data-core="snes9x"]').click();
    assert.equal(retro.querySelector('#wr-upload').hidden, false);
    assert.equal(retro.querySelector('#wr-corename').textContent, 'SNES');
    assert.ok(retro.querySelector('#wr-back'), 'the source screen has a back arrow');
    retro.querySelector('#wr-back').click();
    assert.equal(retro.querySelector('#wr-upload').hidden, true, 'the back arrow returns to the emulator boxes');
    assert.equal(retro.querySelector('#wr-emu-home').hidden, false, 'the back arrow shows the emulator boxes again');
    retro.querySelector('[data-core="snes9x"]').click();
    assert.equal(retro.querySelector('#wr-upload').hidden, false);
    assert.ok(retro.querySelector('[data-src="device"]'), 'no "this computer" ROM source');
    assert.ok(retro.querySelector('[data-src="vfs"]'), 'no "proton Files" ROM source');
    assert.equal(retro.querySelector('#wr-play'), null,
      'there is no start button — picking a ROM launches it at once');
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
    const chSent = [];
    w.BroadcastChannel = class {
      constructor(name) { this.name = name; w.__wrCh = this; }
      postMessage(m) { chSent.push(m); }
      close() {}
    };
    row.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const frame = retro.querySelector('#wr-frame');
    assert.ok(frame, 'picking the ROM should frame the emulator at once');
    assert.match(frame.src, /rom=channel/);
    w.__wrCh.onmessage({ data: { status: 'ready' } });
    assert.equal(chSent.length, 1, 'the launch page should get the ROM over the channel');
    assert.equal(chSent[0].rom.name, 'nes-rom.nes');
    // The emulator's own back arrow posts webretro-back from inside the
    // frame (the page it linked to upstream is not shipped and 404'd):
    // the launcher answers by showing the ROMs tab again.
    const backEvent = new w.MessageEvent('message', { data: { type: 'webretro-back' } });
    Object.defineProperty(backEvent, 'source', { value: frame.contentWindow });
    w.dispatchEvent(backEvent);
    assert.ok(!retro.querySelector('#wr-frame'), 'the emulator back arrow should unframe the emulator');
    assert.equal(retro.querySelector('#wr-roms').hidden, false, 'the emulator back arrow should show the ROMs tab');
    assert.ok(retro.querySelector('[data-wr-tab="roms"]').classList.contains('primary'),
      'the emulator back arrow returns to the ROMs tab');
    assert.equal(retro.querySelector('#wr-again').hidden, true, 'Change game hides again in the chooser');
    // Play the same ROM once more, then Change game in the app bar
    // lands in the same ROMs tab.
    retro.querySelector('[data-wr-tab="emulators"]').click();
    retro.querySelector('[data-core="nestopia"]').click();
    retro.querySelector('[data-src="vfs"]').click();
    // the proton Files browser is still in Downloads from the first run;
    // from the home folder it is one click further away
    let rowAgain = [...retro.querySelectorAll('[data-file]')].find((b) => b.dataset.file.endsWith('nes-rom.nes'));
    if (!rowAgain) {
      const dlAgain = [...retro.querySelectorAll('[data-dir]')].find((b) => b.dataset.dir.endsWith('/Downloads'));
      assert.ok(dlAgain, 'proton Files should still show the Downloads folder');
      dlAgain.click();
      rowAgain = [...retro.querySelectorAll('[data-file]')].find((b) => b.dataset.file.endsWith('nes-rom.nes'));
    }
    assert.ok(rowAgain, 'proton Files should still list the imported ROM');
    rowAgain.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.ok(retro.querySelector('#wr-frame'), 'picking the ROM should frame the emulator again');
    assert.equal(retro.querySelector('#wr-again').hidden, false, 'Change game shows while a game runs');
    retro.querySelector('#wr-again').click();
    assert.ok(!retro.querySelector('#wr-frame'), 'Change game should unframe the emulator');
    assert.equal(retro.querySelector('#wr-roms').hidden, false, 'Change game should show the ROMs tab');
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
    assert.equal(editor.querySelector('#te-text').readOnly, false, 'a system file opens as an editable draft, not a locked box with a caret');
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
            ["App Center", "Customize", "Settings", "About", "Browser", "Calculator", "Files", "Text Editor", "PDF Viewer", "Image Viewer", "Media", "Ruffle Flash Player", "Web Retro", "You Are An Idiot", "2048", "Bloons Tower Defense 1", "Bloons Tower Defense 2", "Bloons Tower Defense 5", "Bloxorz", "Breaking The Bank", "Celeste Hub", "Cookie Clicker", "Drive Mad", "Escaping The Prison", "Fleeing The Complex", "Grey Box Testing", "Infiltrating The Airship", "Mari0", "Offline Paradise", "Pacman", "Slope", "Spacebar Clicker", "Stack", "Stealing The Diamond", "Stickman Hook", "Super Mario 64", "Tetris", "The Impossible Quiz", "Tunnel Rush", "Baldi's Basics", "Minesweeper", "Flappy Bird", "Retro Bowl", "Drift Boss", "Football Bros", "Five Nights at Freddy's", "Five Nights at Freddy's 4", "Five Nights at Freddy's 2", "Five Nights at Freddy's 3", "Backrooms", "Kart Bros", "Geometry Dash Lite", "Five Nights at Freddy's: Sister Location", "Bitburner"]);

    const uploadBrowserIcon = async () => {
      const input = body.querySelector('[data-micon-file="browser"]');
      assert.ok(input, 'Customize should offer an image picker for app icons');
      Object.defineProperty(input, 'files', { configurable: true, value: [{ type: 'image/png', size: 1024 }] });
      await input.onchange();
    };
    await uploadBrowserIcon();
    assert.equal(w.eval('APPS.browser.iconImage'), storedImage);
    assert.equal(JSON.parse(w.localStorage.getItem('proton2.user.ada.v1')).moduleOverrides.browser.iconImage, storedImage,
      'the resized image is saved in this account data');
    assert.ok(w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image'));
    assert.ok(w.document.querySelector('#panelapps .pitem[data-app="browser"] img.app-icon-image'));
    assert.ok(w.document.querySelector('.desktop-icon[data-shortcut="desktop-browser"] img.app-icon-image'));
    assert.ok(browserWindow.el.querySelector('.wic img.app-icon-image'), 'an already-open window title updates live');

    /* Unless an app has an SVG icon (svgIcon === true), its image icon is
     * always cropped to fill the icon on its own — no background behind
     * it, and no choice about it anywhere in Customize. */
    assert.match(source('assets/styles.css'), /\.app-icon-image\{object-fit:cover/,
      'image icons are cropped to fill their icon box');
    assert.match(source('assets/styles.css'), /:has\(>\.app-icon-only\)/,
      'image icons lose the background behind them');
    const menuBrowserImg = () => w.document.querySelector('#startmenu .sm-item[data-app="browser"] img.app-icon-image');
    const desktopBrowserImg = () => w.document.querySelector('.desktop-icon[data-shortcut="desktop-browser"] img.app-icon-image');
    assert.ok(menuBrowserImg().classList.contains('app-icon-only'),
      'a raster icon always shows as just the image in the menu');
    assert.ok(desktopBrowserImg().classList.contains('app-icon-only'),
      'a raster icon always shows as just the image on the desktop');
    assert.ok(browserWindow.el.querySelector('.wic img.app-icon-image.app-icon-only'),
      'a raster icon always shows as just the image in window titles');
    assert.equal(body.querySelector('#cust-icon-only'), null,
      'Customize has no global image-only switch');
    assert.equal(body.querySelector('[data-miconbg="browser"]'), null,
      'Customize has no per-app Icon background choice');
    const menuSettingsIcon = w.document.querySelector('#startmenu .sm-item[data-app="settings"] .ic');
    assert.ok(menuSettingsIcon && !menuSettingsIcon.querySelector('img.app-icon-only'),
      'an SVG-icon app keeps its drawn glyph, not an image');

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
    assert.equal(body.querySelector('[data-ciconbg="legacy-image-app"]'), null,
      'saved custom apps have no Icon background choice either');
    assert.ok(w.document.querySelector('#startmenu .sm-item[data-app="legacy-image-app"] img.app-icon-image.app-icon-only'),
      'a saved app with an uploaded image always shows as just the image in the menu');
    assert.equal(JSON.parse(w.localStorage.getItem('proton2.user.ada.v1')).customApps[0].iconImage, storedImage);
    w.openApp('appcenter');
    const centerBody = w.eval('wins').get('appcenter').body;
    assert.equal(centerBody.querySelector('#ac-custom'), null,
      'App Center should not list saved apps in a Your apps section');
    assert.equal(centerBody.querySelector('#ac-sites'), null,
      'App Center should not list saved websites in a Your websites section');
    assert.ok(!centerBody.textContent.includes('Your apps') && !centerBody.textContent.includes('Your websites'),
      'App Center should not show Your apps or Your websites headings');
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

/* Embedded-page apps/sites are not shipped: apps/_embed and websites/_embed
 * (the EMBED_URL templates) are gone, and so is every game whose page only
 * framed a remote build - a shipped game must be files in this repository. */
test('embedded-page templates and remote-embedded games are not shipped', () => {
  const { apps, sites } = catalog();
  for (const gone of ['apps/_embed', 'websites/_embed',
    'apps/games/drift-hunters', 'apps/games/drift-hunters-game',
    'apps/games/basketball-stars', 'apps/games/wordle']) {
    assert.equal(fs.existsSync(path.join(ROOT, gone)), false, `${gone} should be gone`);
  }
  for (const id of ['my-embed', 'drift-hunters', 'drift-hunters-game', 'basketball-stars', 'wordle']) {
    assert.ok(!apps.some((a) => a.id === id), `${id} should not be catalogued`);
  }
  assert.ok(!sites.some((s) => s.id === 'my-embed'), 'my-embed should not be a site');
  assert.ok(!source('data/applications.js').includes('EMBED_URL'), 'app catalog still mentions EMBED_URL');
  assert.ok(!source('data/websites.js').includes('EMBED_URL'), 'site catalog still mentions EMBED_URL');
  /* No shipped game page frames a remote page as the game itself. */
  for (const page of [...Object.values(GAME_PAGES), ...CELESTE_HUB_ALL_PAGES]) {
    const html = source(page);
    assert.ok(!/<iframe\b[^>]*\bsrc\s*=\s*["']https?:\/\//i.test(html), `${page} frames a remote page`);
    assert.ok(!/\.src\s*=\s*['"]https?:\/\//.test(html), `${page} points a frame at a remote page`);
  }
  /* Nothing shipped loads a remote subresource at all: no embedded links
   * in any game page (scripts, stylesheets, images, media — <a> links a
   * reader may choose to follow are fine), no remote tracker/SDK hooks
   * hiding in inline code, and no remote @imports in game stylesheets. */
  const REMOTE_SUBRESOURCE = /<(?:script|link|img|iframe|source|video|audio|embed|object|track)\b[^>]*(?:src|href)\s*=\s*["'](?:https?:)?\/\//i;
  const REMOTE_HOOKS = /googletagmanager\.com|google-analytics\.com|googlesyndication\.com|connect\.facebook\.net|yandex\.ru\/games\/sdk|kongregate_api\.js|fonts\.googleapis\.com|code\.jquery\.com|ajax\.googleapis\.com|cdnjs\.cloudflare\.com/i;
  const htmlFiles = [];
  const walkHtml = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walkHtml(rel);
      else if (e.name.endsWith('.html')) htmlFiles.push(rel);
    }
  };
  walkHtml('apps/games');
  for (const rel of htmlFiles) {
    const html = source(rel);
    assert.ok(!REMOTE_SUBRESOURCE.test(html), `${rel} loads a remote subresource`);
    assert.ok(!REMOTE_HOOKS.test(html), `${rel} still hooks a remote tracker, SDK or CDN`);
  }
  const cssFiles = [];
  const walkCss = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walkCss(rel);
      else if (e.name.endsWith('.css')) cssFiles.push(rel);
    }
  };
  walkCss('apps/games');
  for (const rel of cssFiles) {
    assert.ok(!/@import\s+(?:url\(\s*)?["']?(?:https?:)?\/\//i.test(source(rel)), `${rel} imports a remote stylesheet`);
    assert.ok(!/url\(\s*["']?(?:https?:)?\/\//i.test(source(rel)), `${rel} paints a remote asset`);
  }
});

/* The not-preinstalled prank is quarantined on the fake desktop, but its
 * windows are real proton windows: they bounce on their own, no × on any
 * of them ever closes one (it breeds two more), the song autoplays, and
 * Make it stop is the only way out. */
test('the idiot app breeds real windows and only Make it stop ends it', async () => {
  const { w, errors, settle, wins, close } = await bootDesktop();
  const idiotWins = () => [...w.document.querySelectorAll('#windows .win[data-app="you-are-an-idiot"]')];
  try {
    w.openApp('you-are-an-idiot');
    await settle();
    const mainBody = wins.get('you-are-an-idiot').body;
    const video = mainBody.querySelector('#idiot-app-video');
    assert.ok(video, 'the main window carries the video');
    assert.ok(video.hasAttribute('autoplay'), 'the music is set to play on its own');
    assert.equal(video.getAttribute('src'), 'assets/youare.mp4');
    await new Promise((r) => setTimeout(r, 600));
    assert.ok(idiotWins().length >= 3, `expected a main window and real clone windows, got ${idiotWins().length}`);
    assert.ok(w.document.querySelector('#desktop').classList.contains('idiot-shake'), 'the desktop shakes');

    /* A clone really moves. */
    const clone = idiotWins().find((el) => el.dataset.win !== 'you-are-an-idiot');
    const leftBefore = clone.style.left;
    await new Promise((r) => setTimeout(r, 220));
    assert.notEqual(clone.style.left, leftBefore, 'clone windows move around the desktop on their own');

    /* No × ever works: closing a clone breeds more, closing the main
     * window does nothing either. */
    const before = idiotWins().length;
    clone.querySelector('[data-act="close"]').click();
    await settle();
    assert.ok(idiotWins().length >= before, 'closing a clone breeds more windows instead of removing it');
    assert.ok(wins.has(clone.dataset.win), 'the clone is still there after its × was pressed');
    wins.get('you-are-an-idiot').el.querySelector('[data-act="close"]').click();
    await settle();
    assert.ok(wins.has('you-are-an-idiot'), 'the main window also refuses to close');

    /* Make it stop is the only way out — and it removes every trace. */
    mainBody.querySelector('[data-stop]').click();
    await settle();
    assert.equal(idiotWins().length, 0, 'Make it stop removes every idiot window');
    assert.ok(!w.document.querySelector('#desktop').classList.contains('idiot-shake'), 'the shaking stops');
    await new Promise((r) => setTimeout(r, 400));
    assert.equal(idiotWins().length, 0, 'nothing respawns after Make it stop');
    assert.deepEqual(errors, []);
  } finally { close(); }
});

/* Web Retro's bundled library is the maintainer's own ROM files: every
 * game listed in the launcher really is on disk (its extracted ROM in
 * webretro/roms/ and its box art in data/icons/), so a clicked card
 * always plays. */
test('the Web Retro bundled ROM library is on disk', () => {
  const src = fs.readFileSync(path.join(ROOT, 'apps/tools/web-retro/app.html'), 'utf8');
  const bundled = src.match(/const BUNDLED = \[([\s\S]*?)\n\s*\];/);
  assert.ok(bundled, 'the launcher defines its bundled game list');
  const entries = [...bundled[1].matchAll(/\['((?:[^'\\]|\\.)*)', '(\w+)',/g)]
    .map((m) => [m[1].replace(/\\(.)/g, '$1'), m[2]]);
  assert.ok(entries.length >= 20, `the bundled library lists ${entries.length} games`);
  const extFor = { mupen64plus_next: ['.z64', '.n64', '.v64'], nestopia: ['.nes'], mgba: ['.gb', '.gbc', '.gba'], snes9x: ['.smc', '.sfc'] };
  for (const [rom, core] of entries) {
    assert.ok(fs.existsSync(path.join(ROOT, 'apps/tools/web-retro/webretro/roms', rom)), `bundled ROM missing: webretro/roms/${rom}`);
    assert.ok(extFor[core] && extFor[core].some((ext) => rom.toLowerCase().endsWith(ext)), `${rom} is not a ROM the ${core} core plays`);
  }
  for (const m of bundled[1].matchAll(/, '([a-z0-9-]+)'\]/g)) {
    assert.ok(fs.existsSync(path.join(ROOT, 'data/icons', `${m[1]}.jpeg`)), `box art missing: data/icons/${m[1]}.jpeg`);
  }
});

/* Control bindings have to survive closing a game. RetroArch writes
 * bindings changed in its own menu to retroarch.cfg in the emulator's
 * in-memory filesystem, and webretro rewrites that file from the keybind
 * manager's localStorage entry on every launch — so main.js harvests the
 * bindings back out of the config file whenever RetroArch saves it (and
 * again on pagehide), or every in-game rebind would be lost. */
test('Web Retro keeps control bindings between games', () => {
  const src = fs.readFileSync(path.join(ROOT, 'apps/tools/web-retro/webretro/main.js'), 'utf8');
  // the harvest helper is pure: pull it out and run it for real
  const fnMatch = src.match(/function harvestKeybindsFromConfigText\(text, validKeys, current\) \{[\s\S]*?\n\}/);
  assert.ok(fnMatch, 'main.js defines the keybind harvest helper');
  const harvest = new Function(`${fnMatch[0]}; return harvestKeybindsFromConfigText;`)();
  const valid = ['input_player1_a', 'input_player1_b', 'input_menu_toggle'];
  const current = { input_player1_a: 'h', input_player1_b: 'g', input_menu_toggle: 'f1' };
  const cfgText = [
    'video_driver = "gl"',
    'input_player1_a = "z"',
    'input_player1_b = "g"',
    'input_player1_a_btn = "0"',
    'input_menu_toggle = "f5"',
    '',
  ].join('\n');
  // only manager-known keyboard bindings that actually changed come back
  assert.deepEqual(harvest(cfgText, valid, current), { input_player1_a: 'z', input_menu_toggle: 'f5' });
  // an unchanged config (e.g. the one webretro itself wrote at startup) is a no-op
  assert.equal(harvest('input_player1_a = "h"\ninput_player1_b = "g"\ninput_menu_toggle = "f1"\n', valid, current), null);
  // the harvest is wired into the emulator's file-write routing and page close
  assert.ok(/path == fsConfigFile\) \{\s*\n\s*\/\/ RetroArch just saved its config[\s\S]*?persistKeybindsFromConfig\(\);/.test(src),
    'writeToFileHandler persists bindings when RetroArch saves its config');
  assert.ok(src.includes('window.addEventListener("pagehide", persistKeybindsFromConfig);'),
    'bindings are harvested on pagehide too');
  assert.ok(/function persistKeybindsFromConfig\(\) \{[\s\S]*?localStorage\.setItem\("RetroArch_settings_keybinds", configObjToStr\(savedKeybindsObj\)\)/.test(src),
    'harvested bindings land in the keybind store the startup config is written from');
});

/* The emulator's menu-bar back arrow must not navigate the frame:
 * upstream it links to "." (webretro's core-select page), which proton
 * does not ship, so clicking it showed a 404. Instead launch.html
 * posts webretro-back and the launcher shows the ROMs tab, the same
 * place Change game goes. */
test('Web Retro back arrow returns to the chooser instead of a 404', () => {
  const launch = fs.readFileSync(path.join(ROOT, 'apps/tools/web-retro/webretro/launch.html'), 'utf8');
  assert.ok(!launch.includes('<li class="menuback"><a href="."'), 'the back arrow must not link to the unshipped core-select page');
  assert.ok(launch.includes('postMessage({type: "webretro-back"}, "*")'),
    'the back arrow tells the launcher to show the game chooser');
  const app = fs.readFileSync(path.join(ROOT, 'apps/tools/web-retro/app.html'), 'utf8');
  assert.ok(app.includes("event.data.type !== 'webretro-back'") && app.includes('event.source === frame.contentWindow'),
    'the launcher returns to the chooser only for its own emulator frame');
  assert.ok(app.includes("again.addEventListener('click', picker);"),
    'Change game brings up the same chooser (the ROMs tab)');
});

/* proton's own UI draws artwork with its SVG icon set and raster images,
 * never with emoji glyphs. Vendored games and third-party runtime builds
 * are upstream content, so they are outside this scan; values saved by old
 * accounts are still translated through assets/icons.js at render time. */
test("proton's own UI uses image artwork instead of emoji glyphs", () => {
  const emojiGlyph = new RegExp('[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\uFE0F]', 'u');
  const offenders = [];
  const visit = (rel) => {
    const normalized = rel.split(path.sep).join('/');
    if (normalized === 'apps/games' || normalized.startsWith('apps/games/')
      || normalized === 'apps/tools/web-retro/webretro' || normalized.startsWith('apps/tools/web-retro/webretro/')) return;
    if (normalized.startsWith('apps/tools/ruffle-flash-player/') && !normalized.endsWith('/app.html')) return;
    const abs = path.join(ROOT, rel);
    if (fs.statSync(abs).isDirectory()) {
      for (const entry of fs.readdirSync(abs).sort()) visit(path.join(rel, entry));
      return;
    }
    if (!/\.(?:html|js|css)$/.test(normalized)) return;
    const match = fs.readFileSync(abs, 'utf8').match(emojiGlyph);
    if (match) offenders.push(`${normalized}: ${match[0]}`);
  };
  for (const root of ['index.html', 'assets', 'apps', 'data/applications.js', 'data/websites.js', 'websites']) visit(root);
  assert.deepEqual(offenders, []);
});

/* Every text box and text input in proton's own apps shows a caret because
 * it really is editable: typing is never swallowed or reverted. (Games in
 * iframes are upstream pages; this guards the desktop's own fields —
 * number and colour inputs legitimately reject letters, so they are not
 * typed into here.) */
test('every text input in proton’s own apps accepts typed text', async () => {
  const { w, errors, settle, wins, close } = await bootDesktop();
  try {
    const OWN_APPS = ['appcenter', 'customize', 'settings', 'about', 'browser', 'calculator',
      'files', 'text-editor', 'pdf', 'image-viewer', 'media', 'ruffle-flash-player', 'web-retro'];
    for (const id of OWN_APPS) {
      w.openApp(id);
      await settle();
      const body = wins.get(id)?.body;
      assert.ok(body, `${id} opened`);
      /* Typing in an app's own search box re-renders the app, which
       * detaches the fields collected a moment ago — so fields are
       * re-queried live, one at a time, until none are left untested. */
      const tested = new Set();
      const signature = (el) => `${el.tagName}|${el.id}|${el.getAttribute('data-mname') || el.getAttribute('data-mcat') || el.getAttribute('data-thname') || el.getAttribute('data-wname') || el.placeholder || ''}`;
      const collect = () => [...body.querySelectorAll('input, textarea')].filter((el) =>
        !['hidden', 'file', 'checkbox', 'radio', 'color', 'number', 'range', 'button', 'submit'].includes(el.type || 'text')
        && !tested.has(signature(el)));
      /* Fields on a tab the user has not opened yet are display:none and
       * cannot take focus anywhere; the apps' own tab clicks reveal them. */
      const tabHidden = (el) => {
        for (let n = el; n && n !== body; n = n.parentElement) {
          if (n.hidden || w.getComputedStyle(n).display === 'none') return true;
        }
        return false;
      };
      for (let el = collect().find((f) => !tabHidden(f)); el; el = collect().find((f) => !tabHidden(f))) {
        tested.add(signature(el));
        const label = `${id} <${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} type=${el.type || 'text'}>`;
        assert.ok(!el.disabled && !el.readOnly, `${label} looks editable but is ${el.disabled ? 'disabled' : 'read-only'}`);
        el.focus();
        assert.equal(w.document.activeElement, el, `${label} does not take focus`);
        const kd = new w.KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
        el.dispatchEvent(kd);
        assert.equal(kd.defaultPrevented, false, `${label} has its typing prevented`);
        const proto = el instanceof w.HTMLTextAreaElement ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, `${el.value || ''}x`);
        el.dispatchEvent(new w.InputEvent('input', { bubbles: true }));
        await settle();
        assert.ok(String(el.value).includes('x'), `${label} did not keep typed text (now ${JSON.stringify(el.value)})`);
      }
      w.closeWin(id, true);
    }
    assert.deepEqual(errors, []);
  } finally { close(); }
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

/* ---------------------------------------------------------------------------
   The file system suite (Files, Text Editor, Image Viewer, Media, PDF Viewer).
   These drive the real windows through the real FS API, so a change in
   assets/fs.js, assets/desktop-icons.js or any of the five modules shows up
   here rather than only in the browser.
   --------------------------------------------------------------------------- */

/* A booted desktop, plus the pieces jsdom lacks: blob URLs, Blob.arrayBuffer()
 * (FS.readBlob/writeBlob need it) and HTTP for proton's own read-only files.
 * The page URL has no sub-path, so a system path maps straight onto the repo. */
async function bootDesktop(username = 'ada') {
  const virtualConsole = new VirtualConsole(), errors = [];
  virtualConsole.on('jsdomError', (err) => errors.push(err.message));
  const dom = new JSDOM('<!doctype html><main id="auth" hidden></main><div id="desktop" hidden></div><div id="toasts"></div>', {
    url: 'https://math-halper.github.io/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole,
  });
  const { window: w } = dom;
  const blobs = [];
  w.URL.createObjectURL = (blob) => { blobs.push(blob); return 'blob:mock-' + blobs.length; };
  w.URL.revokeObjectURL = () => {};
  /* jsdom does no layout, so elements have no scrollIntoView; the Browser's
   * reader and its suggestion list both scroll to what they just selected. */
  w.Element.prototype.scrollIntoView = function () {};
  /* jsdom leaves TextEncoder/TextDecoder off the window; assets/fs-archive.js
   * needs one to build a ZIP. Every browser has had both since 2015. */
  w.TextEncoder = TextEncoder;
  w.TextDecoder = TextDecoder;
  /* jsdom's Blob has no arrayBuffer()/text(), which FS.readBlob/writeBlob use. */
  w.Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new w.FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('FileReader could not read the blob'));
      reader.readAsArrayBuffer(this);
    });
  };
  const run = (text) => { const s = w.document.createElement('script'); s.textContent = text; w.document.body.appendChild(s); s.remove(); };
  for (const p of SHELL) run(source(p));
  w.fetchText = async (p) => source(p);
  w.fetch = async (url) => ({ ok: true, status: 200, text: async () => source(new URL(url).pathname.slice(1)) });
  await w.loadHtmlModules();
  w.eval(`window.confirm = () => true;
    currentUser = {username:'Ada',usernameLower:${JSON.stringify(username)},displayName:'Ada',createdAt:Date.now()};
    userData = MH.defaultData('Ada',${JSON.stringify(username)});
    enterDesktop();`);
  const settle = () => new Promise((resolve) => setTimeout(resolve, 25));
  const saved = () => JSON.parse(w.localStorage.getItem(`proton2.user.${username}.v1`));
  return { w, errors, blobs, settle, saved, wins: w.eval('wins'), APPS: w.eval('APPS'), close: () => w.close() };
}

/* Click the button in a menu/toolbar whose text starts with a label. */
function clickLabel(host, label) {
  const button = [...host.querySelectorAll('button')]
    .find((b) => b.textContent.replace(/\s+/g, ' ').trim().startsWith(label));
  assert.ok(button, `no "${label}" button in: ${[...host.querySelectorAll('button')].map((b) => b.textContent.trim()).join(' | ')}`);
  button.click();
  return button;
}

test('the Files app manages the account’s folders and files end to end', async () => {
  const { w, errors, blobs, settle, saved, wins, close } = await bootDesktop();
  const HOME = '/home/ada';
  /* Downloads click a real anchor; jsdom reports the navigation it cannot do. */
  const ignorable = (m) => /Not implemented: navigation/.test(m);
  try {
    // A new account's desktop already links Files and its own home folder.
    assert.ok(w.document.querySelector('.desktop-icon[data-shortcut="desktop-files"]'), 'Files is a default shortcut');
    const homeIcon = w.document.querySelector('.desktop-icon[data-shortcut="desktop-home"]');
    assert.ok(homeIcon, 'the home folder is a default shortcut');
    assert.match(homeIcon.getAttribute('title'), new RegExp(HOME));

    w.openApp('files');
    const body = wins.get('files').body;
    const rows = () => [...body.querySelectorAll('#fm-scroll [data-path]')].map((el) => el.dataset.path);
    const rowOf = (p) => [...body.querySelectorAll('[data-path]')].find((el) => el.dataset.path === p);
    const askInput = () => body.querySelector('#fm-ask-input');
    const askOk = () => body.querySelector('#fm-ask [data-ok]');

    // The seeded home folder, and the read-only system tree in the sidebar.
    assert.equal(body.querySelector('#fm-path').value, HOME);
    assert.deepEqual(rows(), [`${HOME}/Desktop`, `${HOME}/Documents`, `${HOME}/Downloads`, `${HOME}/Pictures`, `${HOME}/README.txt`]);
    assert.ok(body.querySelector('#fm-side [data-go="/apps"]'), 'the sidebar lists the read-only system tree');
    assert.match(body.querySelector('#fm-status').textContent, /Your home: 3 files, 4 folders/);

    // A plain click walks into a folder (and a plain click on a file opens it).
    rowOf(`${HOME}/Documents`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    assert.equal(body.querySelector('#fm-path').value, `${HOME}/Documents`);
    assert.deepEqual(rows(), [`${HOME}/Documents/Ideas.txt`, `${HOME}/Documents/Welcome.txt`]);
    rowOf(`${HOME}/Documents/Welcome.txt`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    assert.ok(wins.has('text-editor'), 'a plain click on a file opens it');
    w.closeWin('text-editor', true);

    // New folder: created in the VFS, listed, and saved with the account.
    body.querySelector('#fm-new-folder').click();
    assert.equal(body.querySelector('#fm-ask').hidden, false, 'the prompt is an inline form, not window.prompt()');
    askInput().value = 'Notes';
    askOk().click();
    assert.equal(w.eval(`FS.isDir('${HOME}/Documents/Notes')`), true);
    assert.ok(rows().includes(`${HOME}/Documents/Notes`));
    assert.ok(saved().dirs.includes(`${HOME}/Documents/Notes`), 'the folder is saved in localStorage');

    // New file opens in the Text Editor, and saving writes through FS.write().
    body.querySelector('#fm-new-file').click();
    askInput().value = 'todo.txt';
    askOk().click();
    assert.ok(wins.has('text-editor'), 'a new text file opens in the Text Editor');
    const editor = wins.get('text-editor').body;
    await settle();                       // the file's contents load asynchronously
    const area = editor.querySelector('#te-text');
    assert.equal(area.readOnly, false, 'a file in your home folder is editable');
    const text = 'buy milk\nwrite tests';
    area.value = text;
    area.dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.match(editor.querySelector('#te-status').textContent, /unsaved changes/);
    editor.querySelector('#te-save').click();
    /* Saving asks which file system to write to — this computer or proton's.
     * The file lives in the proton file system, so answer that. */
    await settle();
    const pickSource = (v) => w.document.querySelector(`.file-source-backdrop [data-fs="${v}"]`).click();
    assert.ok(w.document.querySelector('.file-source-backdrop [data-fs="vfs"]'),
      'Save asks which file system to write to');
    pickSource('vfs');
    await settle();
    assert.equal(await w.eval(`FS.read('${HOME}/Documents/todo.txt')`), text);
    assert.ok(saved().files.some((f) => f.path === `${HOME}/Documents/todo.txt` && f.content === text), 'saved with the account');
    assert.equal(editor.querySelector('#te-status').textContent.includes('unsaved'), false, 'the dirty flag clears');
    // FS.watch() keeps the open Files window in step — no manual refresh.
    assert.ok(rows().includes(`${HOME}/Documents/todo.txt`), 'Files re-rendered from FS.watch()');
    w.closeWin('text-editor', true);

    // Right-click menu: open-with, shortcut, rename, move, copy, delete.
    const openMenu = (p) => {
      rowOf(p).dispatchEvent(new w.MouseEvent('contextmenu', { bubbles: true, clientX: 24, clientY: 24 }));
      const menu = body.querySelector('#fm-menu');
      assert.ok(menu, 'right-clicking an entry opens its menu');
      return menu;
    };
    const menuLabels = (menu) => [...menu.querySelectorAll('button')].map((b) => b.textContent.trim());
    let menu = openMenu(`${HOME}/Documents/todo.txt`);
    assert.ok(menuLabels(menu).includes('Open in Text Editor'), menuLabels(menu).join(' | '));
    assert.ok(menuLabels(menu).includes('Add desktop shortcut'));
    clickLabel(menu, 'Add desktop shortcut');
    assert.ok(Array.from(w.eval('userData.desktopIcons'))
      .some((s) => s.kind === 'path' && s.target === `${HOME}/Documents/todo.txt`), 'the shortcut is a link to the path');
    assert.ok(w.document.querySelector(`.desktop-icon[title*="todo.txt"]`), 'and it renders on the desktop');

    // A rename moves the file and the desktop shortcut follows it.
    menu = openMenu(`${HOME}/Documents/todo.txt`);
    clickLabel(menu, 'Rename…');
    askInput().value = 'shopping.txt';
    askOk().click();
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/shopping.txt')`), true);
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/todo.txt')`), false);
    assert.ok(Array.from(w.eval('userData.desktopIcons'))
      .some((s) => s.kind === 'path' && s.target === `${HOME}/Documents/shopping.txt`), 'the shortcut followed the rename');

    // Move and copy both go through FS, into a folder chosen in the form.
    menu = openMenu(`${HOME}/Documents/shopping.txt`);
    clickLabel(menu, 'Move to…');
    assert.ok(body.querySelector('#fm-ask-folders'), 'the destination prompt offers real folders');
    askInput().value = HOME;
    askOk().click();
    await settle();
    assert.equal(w.eval(`FS.exists('${HOME}/shopping.txt')`), true, 'moved');
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/shopping.txt')`), false, 'and not left behind');
    body.querySelector('#fm-up').click();
    assert.equal(body.querySelector('#fm-path').value, HOME);
    menu = openMenu(`${HOME}/shopping.txt`);
    clickLabel(menu, 'Copy to…');
    askInput().value = `${HOME}/Documents/Notes`;
    askOk().click();
    await settle();
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/Notes/shopping.txt')`), true, 'copied into the subfolder');
    assert.equal(w.eval(`FS.exists('${HOME}/shopping.txt')`), true, 'the original stays');

    // Import stores the exact bytes of a file from the computer.
    const imported = new w.File(['imported bytes'], 'note.txt', { type: 'text/plain' });
    const fileInput = body.querySelector('#fm-file');
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [imported] });
    rowOf(`${HOME}/Documents`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await fileInput.onchange({ target: fileInput });
    await settle();
    assert.equal(w.eval(`FS.stat('${HOME}/Documents/note.txt')?.size`), 14, 'the imported file is in the account');
    // An imported text file stays text: readable, editable, and it opens in
    // the Text Editor rather than falling back to Files.
    assert.equal(await w.eval(`FS.read('${HOME}/Documents/note.txt')`), 'imported bytes');
    assert.equal(w.eval(`FS.appFor('${HOME}/Documents/note.txt')`), 'text-editor');
    assert.ok(saved().files.some((f) => f.path === `${HOME}/Documents/note.txt` && f.content === 'imported bytes'),
      'imported text is stored as text, not as opaque bytes');
    // Search is recursive (FS.find); the filter box is only this folder.
    body.querySelector('#fm-search').value = 'welcome';
    body.querySelector('#fm-search').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert.ok(rows().includes(`${HOME}/Documents/Welcome.txt`), 'a recursive search finds files in subfolders');
    assert.equal(body.querySelector('#fm-clear').hidden, false, 'the search can be cleared again');
    body.querySelector('#fm-clear').click();
    // shopping.txt was moved out of this folder and copied into Notes/.
    assert.deepEqual(rows().map((p) => p.split('/').pop()).sort(), ['Ideas.txt', 'Notes', 'Welcome.txt', 'note.txt']);
    body.querySelector('#fm-filter').value = 'shop';
    body.querySelector('#fm-filter').dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.deepEqual(rows(), [], 'the filter only looks in this folder');
    body.querySelector('#fm-filter').value = '';
    body.querySelector('#fm-filter').dispatchEvent(new w.Event('input', { bubbles: true }));

    // A folder downloads as a real ZIP (assets/fs-archive.js).
    const before = blobs.length;
    body.querySelector('#fm-up').click();                    // back out to /home/ada
    assert.equal(body.querySelector('#fm-path').value, HOME);
    rowOf(`${HOME}/Documents`).dispatchEvent(new w.MouseEvent('click', { bubbles: true, ctrlKey: true }));
    assert.match(body.querySelector('#fm-status').textContent, /Selected 1/, 'Ctrl-click selected the folder without opening it');
    assert.equal(body.querySelector('#fm-path').value, HOME, 'Ctrl-click did not navigate into it');
    body.querySelector('#fm-download').click();
    await settle();
    w.document.querySelector('.file-source-backdrop [data-fs="device"]').click(); // to this computer
    await settle();
    assert.ok(blobs.length > before, 'download produced an archive');
    assert.equal(blobs[blobs.length - 1].type, 'application/zip');
    assert.ok(blobs[blobs.length - 1].size > 100, 'the archive holds the folder, not just a header');

    // Delete removes it from the account (confirm() is stubbed to yes).
    rowOf(`${HOME}/Documents`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    menu = openMenu(`${HOME}/Documents/Notes`);
    clickLabel(menu, 'Delete');
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/Notes')`), false, 'the folder is gone');
    assert.equal(w.eval(`FS.exists('${HOME}/Documents/Notes/shopping.txt')`), false, 'and so is everything inside it');
    assert.equal(saved().dirs.includes(`${HOME}/Documents/Notes`), false, 'the change is saved');

    // The proton system tree is browsable but locked.
    body.querySelector('#fm-side [data-go="/apps"]').click();
    rowOf('/apps/productivity').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    rowOf('/apps/productivity/files').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    assert.equal(body.querySelector('#fm-path').value, '/apps/productivity/files');
    assert.ok(rows().includes('/apps/productivity/files/app.html'), 'the manifest tree is browsable');
    assert.equal(body.querySelector('#fm-new-folder').disabled, true, 'nothing can be created in the system tree');
    assert.match(body.querySelector('#fm-status').textContent, /read-only/);
    assert.throws(() => w.eval("FS.mkdir('/apps/productivity/nope')"), /Read-only file system/);

    // Back home: a binary import keeps its exact bytes instead of being read
    // as text, while the imported note.txt above stayed editable text.
    body.querySelector(`#fm-side [data-go="${HOME}"]`).click();   // sidebar: Home
    assert.equal(body.querySelector('#fm-path').value, HOME);
    rowOf(`${HOME}/Documents`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const picture = new w.File([new Uint8Array([137, 80, 78, 71])], 'dot.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [picture] });
    await fileInput.onchange({ target: fileInput });
    await settle();
    assert.equal(w.eval(`FS.appFor('${HOME}/Documents/dot.png')`), 'image-viewer');
    assert.equal(w.eval(`FS.isBinary('${HOME}/Documents/dot.png')`), true);
    assert.equal((await w.eval(`FS.readBlob('${HOME}/Documents/dot.png')`)).size, 4, 'the bytes survived');
    await assert.rejects(() => w.eval(`FS.read('${HOME}/Documents/dot.png')`),
      /Binary file:/, 'and it is still not read as text');

    assert.deepEqual(errors.filter((m) => !ignorable(m)), []);
  } finally { close(); }
});

test('every kind of file has an app that opens it', async () => {
  const { w, errors, blobs, settle, wins, APPS, close } = await bootDesktop();
  const ignorable = (m) => /Not implemented: navigation/.test(m);
  try {
    /* FS.appFor() only ever returns ids that are installed, so nothing in the
     * file system is unopenable — and the ids match the catalog exactly. */
    const cases = [['page.html', 'browser'], ['paper.pdf', 'pdf'], ['photo.png', 'image-viewer'],
      ['drawing.svg', 'image-viewer'], ['song.mp3', 'media'], ['clip.mp4', 'media'],
      ['notes.txt', 'text-editor'], ['data.json', 'text-editor'], ['module.js', 'text-editor']];
    for (const [name, id] of cases) {
      assert.equal(w.eval(`FS.appFor('/home/ada/${name}')`), id, `${name} should open in ${id}`);
      assert.ok(APPS[id], `${id} is named by FS.appFor() but is not installed`);
    }
    assert.deepEqual(FS_APPS.filter((id) => !APPS[id]), [], 'the whole suite is installed');

    const store = async (name, bytes, type) => {
      await w.eval(`FS.writeBlob('/home/ada/${name}', new Blob([new Uint8Array(${JSON.stringify(bytes)})], { type: '${type}' }))`);
    };
    const opened = () => [...wins.keys()].filter((id) => FS_APPS.includes(id) || id === 'browser');

    // Images go to the Image Viewer, as a blob URL of the stored bytes.
    await store('photo.png', [137, 80, 78, 71, 13, 10, 26, 10], 'image/png');
    w.eval("openFSItem('/home/ada/photo.png')");
    await settle();
    const viewer = wins.get('image-viewer').body;
    assert.match(viewer.querySelector('#iv-img').getAttribute('src'), /^blob:mock-/);
    assert.match(viewer.querySelector('#iv-note').textContent, /photo\.png/);
    assert.equal(viewer.querySelector('#iv-download').disabled, false);
    w.closeWin('image-viewer', true);

    // Audio and video go to Media, which picks the right element.
    await store('song.mp3', [73, 68, 51, 4, 0, 0], 'audio/mpeg');
    w.eval("openFSItem('/home/ada/song.mp3')");
    await settle();
    assert.equal(wins.get('media').body.querySelector('#md-el').tagName, 'AUDIO');
    assert.ok(wins.get('media').body.querySelector('[data-play="/home/ada/song.mp3"]'), 'the playlist lists it');
    w.closeWin('media', true);
    await store('clip.mp4', [0, 0, 0, 24, 102, 116, 121, 112], 'video/mp4');
    w.eval("openFSItem('/home/ada/clip.mp4')");
    await settle();
    assert.equal(wins.get('media').body.querySelector('#md-el').tagName, 'VIDEO');
    w.closeWin('media', true);

    // PDFs are handed to the browser's own viewer in a frame.
    await store('paper.pdf', [37, 80, 68, 70, 45, 49, 46, 52], 'application/pdf');
    w.eval("openFSItem('/home/ada/paper.pdf')");
    await settle();
    const pdf = wins.get('pdf').body;
    assert.match(pdf.querySelector('#pdf-frame').getAttribute('src'), /^blob:mock-/);
    assert.equal(pdf.querySelector('#pdf-frame').getAttribute('title'), 'paper.pdf');
    assert.match(pdf.querySelector('#iv-note, #pdf-note').textContent, /new tab/i);
    w.closeWin('pdf', true);

    // Text goes to the Text Editor, and a system file opens locked.
    w.eval("openFSItem('/data/applications.js')");
    await settle();
    const editor = wins.get('text-editor').body;
    assert.equal(editor.querySelector('#te-text').readOnly, false, 'proton’s own files open as editable drafts');
    assert.match(editor.querySelector('#te-text').value, /PROTON_APPLICATIONS_TEXT/);
    assert.equal(editor.querySelector('#te-save').disabled, true);
    const originalText = editor.querySelector('#te-text').value;
    editor.querySelector('#te-text').value = 'edited draft only';
    editor.querySelector('#te-text').dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.match(editor.querySelector('#te-status').textContent, /unsaved changes/, 'typing in the draft marks it dirty');
    editor.querySelector('#te-copy').click();
    assert.match(editor.querySelector('#te-note').textContent, /Save a copy to/, 'and the draft can be copied into your home folder');
    w.document.querySelector('.file-source-backdrop [data-fs="vfs"]').click();
    await settle();
    editor.querySelector('#te-ask-ok').click();
    await settle();
    assert.equal(await w.eval("FS.read('/home/ada/applications.js')"), 'edited draft only', 'the edited copy landed in the home folder');
    assert.equal(await w.eval("FS.read('/data/applications.js')"), originalText, 'the read-only original never changed');
    w.closeWin('text-editor', true);

    // A file with no viewer of its own falls back to Files, already selected.
    await store('backup.zip', [80, 75, 3, 4, 0, 0], 'application/zip');
    assert.equal(w.eval("FS.appFor('/home/ada/backup.zip')"), null, 'a ZIP has no viewer of its own');
    w.eval("openFSItem('/home/ada/backup.zip')");
    await settle();
    assert.ok(wins.has('files'), 'Files is the fallback');
    assert.match(w.document.querySelector('#toasts').textContent, /No viewer for backup\.zip/);
    assert.ok(wins.get('files').body.querySelector('.sel[data-path="/home/ada/backup.zip"]'), 'the fallback selects the file');

    // Folders open in Files, wherever they are in the tree.
    w.closeWin('files', true);
    w.eval("openFSItem('/assets')");
    assert.equal(wins.get('files').body.querySelector('#fm-path').value, '/assets');
    assert.equal(opened().length, 1, 'opening a folder does not launch a viewer');

    assert.ok(blobs.length >= 4, 'each viewer made a blob URL for the file it shows');
    assert.deepEqual(errors.filter((m) => !ignorable(m)), []);
  } finally { close(); }
});

test('the desktop can link any file or folder again', async () => {
  const { w, errors, settle, saved, wins, close } = await bootDesktop();
  try {
    // The desktop menu offers a file/folder shortcut, with a path picker.
    w.eval('DesktopIcons.menu(null, {})');
    const menu = w.document.querySelector('#desktop-context');
    assert.deepEqual([...menu.querySelectorAll('button')].map((b) => b.textContent.trim()),
      ['Add application…', 'Add file or folder…', 'Arrange icons']);
    clickLabel(menu, 'Add file or folder…');
    const picker = w.document.querySelector('#desktop-picker');
    assert.equal(picker.hidden, false);
    const item = picker.querySelector('[data-path="/home/ada/Documents/Welcome.txt"]');
    assert.ok(item, 'the picker lists the account’s own files');
    item.click();
    assert.equal(picker.hidden, true, 'picking closes the dialog');
    const shortcut = saved().desktopIcons.find((s) => s.target === '/home/ada/Documents/Welcome.txt');
    assert.equal(shortcut.kind, 'path');
    const icon = w.document.querySelector(`.desktop-icon[data-shortcut="${shortcut.id}"]`);
    assert.ok(icon, 'the shortcut renders on the desktop');

    // Opening it goes through openFSItem(): a file lands in its viewer.
    icon.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }));
    await settle();
    assert.ok(wins.has('text-editor'), 'a text shortcut opens the Text Editor');
    w.closeWin('text-editor', true);

    // A path typed by hand works too, including proton's read-only files.
    w.eval('DesktopIcons.showPathPicker()');
    const typed = w.document.querySelector('#desktop-picker .desktop-picker-search');
    typed.value = '/README.md';
    typed.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert.ok(saved().desktopIcons.some((s) => s.kind === 'path' && s.target === '/README.md'), 'a typed path becomes a shortcut');

    // Missing targets are reported, not fatal: delete the file, keep the icon.
    w.eval("FS.rm('/home/ada/Documents/Welcome.txt')");
    const gone = w.document.querySelector(`.desktop-icon[data-shortcut="${shortcut.id}"]`);
    assert.ok(gone?.classList.contains('missing'), 'a shortcut to a deleted file is marked missing');
    assert.match(gone.getAttribute('title'), /Missing/);
    gone.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }));
    assert.match(w.document.querySelector('#toasts').textContent, /File not found/);
    assert.equal(wins.size, 0, 'and opens nothing');

    // Removing a shortcut never touches the file itself.
    w.eval(`DesktopIcons.remove('${shortcut.id}')`);
    assert.equal(saved().desktopIcons.some((s) => s.id === shortcut.id), false, 'the shortcut is gone');
    assert.equal(w.eval(`FS.exists('/README.md')`), true, 'the target was not deleted');

    assert.deepEqual(errors, []);
  } finally { close(); }
});

/* -------------------------------------------------------------------------
   The Browser: proton's own search engine, and the chrome around it.
   The corpus is this repository — there is no server and no outside search
   API — so these tests hold the index, the engine and the Browser's tabs,
   address bar, reader, bookmarks and history to that.
   --------------------------------------------------------------------------- */

/* Wait out saveData()'s 150 ms debounce, so saved() reads what the account
 * really holds rather than what it held a moment ago. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 200));

test('proton’s search engine answers from the repository itself', async () => {
  const { w, errors, close } = await bootDesktop();
  try {
    const stats = w.eval('PROTON_SEARCH.stats()');
    assert.ok(stats.docs >= 30, `the corpus is this repository, so it is bigger than ${stats.docs} documents`);
    assert.ok(stats.terms > 500, `expected a real vocabulary, got ${stats.terms} terms`);
    assert.equal(stats.version, 1);

    /* Every indexed document is a real deployed file with a usable headline,
     * and the corpus is exactly the prose this repository has. */
    const docs = w.eval('PROTON_SEARCH_INDEX.docs');
    const indexed = new Set();
    for (const doc of docs) {
      const rel = doc.p.replace(/^\//, '');
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${doc.p} is indexed but is not in the repository`);
      assert.ok(['doc', 'app', 'site', 'code'].includes(doc.k), `${doc.p} has an unknown kind "${doc.k}"`);
      assert.ok(doc.t && doc.t.length <= 88, `${doc.p} needs a headline a result can show`);
      assert.ok(Number.isInteger(doc.n) && doc.n > 0, `${doc.p} contributed no words`);
      assert.ok(doc.p.startsWith('/'), `${doc.p} should be a virtual file system path`);
      indexed.add(doc.p);
    }
    const must = ['/README.md', '/CREDITS.md', '/LICENSE.txt', '/apps/README.md', '/websites/README.md',
      '/data/icons/README.md', '/index.html', '/assets/core.js', '/assets/fs.js', '/assets/search.js',
      '/assets/styles.css', '/tools/gen-fs-manifest.py', '/tools/gen-search-index.py',
      '/websites/test-page/site.html', '/apps/games/celeste-hub/app.html', '/UI.md'];
    for (const app of SYSTEM_APPS) {
      const entry = w.eval(`window.PROTON_APPLICATIONS.find((a) => a.id === ${JSON.stringify(app)})`);
      if (entry) must.push('/' + entry.path);
    }
    for (const p of must) assert.ok(indexed.has(p), `${p} is part of this repository and should be searchable`);
    /* Machine-written files have no prose, and the tests and the copy-me
     * templates are not part of the deployed site. */
    for (const p of ['/package.json', '/package-lock.json', '/.gitignore', '/.nojekyll',
      '/data/fs-manifest.js', '/data/search-index.js', '/data/password.txt']) {
      assert.ok(!indexed.has(p), `${p} is machine-written and should not be indexed`);
    }
    assert.ok(![...indexed].some((p) => p.startsWith('/tests/') || p.includes('/_')),
      'the tests and the _template starting point are not deployed');

    /* The generator and the engine must fold words the same way, or a query
     * never meets the document it should. Every indexed term is a fixed point
     * of the engine's own stemmer. */
    const terms = [...w.eval('Object.keys(PROTON_SEARCH_INDEX.terms)')];
    const drifted = terms.filter((term) => w.eval(`PROTON_SEARCH.stemToken(${JSON.stringify(term)})`) !== term);
    assert.deepEqual(drifted.slice(0, 10), [], 'assets/search.js stems these differently from tools/gen-search-index.py');

    /* Ranking: the thing you meant is the thing you get first. */
    const results = (query, limit = 6) => w.eval(`PROTON_SEARCH.search(${JSON.stringify(query)}, {limit: ${limit}})`);
    assert.equal(results('files').results[0].appId, 'files', 'the Files app answers "files"');
    assert.equal(results('test page').results[0].siteId, 'test-page', 'the built-in website answers "test page"');
    assert.equal(results('celeste').results[0].appId, 'celeste-hub');
    assert.ok(results('zip').results.some((r) => r.path === '/assets/fs-archive.js'), 'ZIP downloads point at the code that builds them');
    assert.ok(results('wallpaper').results.some((r) => r.appId === 'customize'), 'wallpapers point at Customize');
    assert.ok(results('search index').results.some((r) => r.path === '/tools/gen-search-index.py'));
    assert.ok(results('openFSItem').results.some((r) => r.path === '/assets/desktop-icons.js'),
      'a camelCase identifier is indexed whole and in pieces');

    /* Word shapes fold together, so the query does not have to be exact. */
    const first = (query) => results(query, 1).results[0]?.path;
    assert.equal(first('folder'), first('folders'), 'plurals meet');
    assert.equal(first('licence'), first('license'), 'British and American spellings meet');
    assert.ok(results('licence').results.some((r) => r.path === '/LICENSE.txt'), 'and the licence file is one of them');
    assert.ok(results('wallpap', 8).total > 0, 'a half-typed word still lands somewhere');

    /* Every answer is something the desktop can actually open. */
    for (const result of results('file', 40).results) {
      const real = result.path.startsWith('proton://')
        || fs.existsSync(path.join(ROOT, result.path.replace(/^\//, '')));
      assert.ok(real, `${result.path} is not a file in this repository or one of proton's pages`);
      assert.ok(result.score > 0 && Array.isArray(result.matched) && result.matched.length > 0);
    }

    /* An ANSWER is a file this repository is about the word in; a MENTION is a
     * file the word merely turns up in. proton is not a dictionary, so a word
     * nothing here defines must not come back wearing a top result. */
    const defined = results('definition');
    assert.equal(defined.answer, false, 'nothing in this repository defines "definition"');
    assert.equal(defined.answers, 0);
    assert.ok(defined.mentions >= 1, 'but the word does turn up, and that is reported honestly');
    assert.equal(defined.results[0].answer, false);
    assert.ok(defined.results.some((r) => r.path === '/LICENSE.txt'),
      'the word does occur — in the licence, in passing, like every mention here');
    assert.ok(defined.results.every((r) => !r.answer), 'and no file is claimed as an answer for it');
    assert.ok(defined.nearby.length > 0, 'and the engine offers the nearest words the index does hold');
    assert.equal(results('warranty').answer, true,
      'a document that really is about a word still answers it, however long it is');
    assert.equal(results('zip').answer, true, 'the code that builds ZIPs answers "zip"');
    assert.equal(results('zip').results[0].answer, true);
    /* "zip" is also the name of vendored build files (and of Web Retro's
     * whole bundled ROM library), so its default window is answers; widen
     * it to see that mentions sit in their own lesser list. */
    const wide = results('zip', 60);
    assert.equal(wide.mentions > 0 && wide.answers > 0, true,
      'and the two are kept apart rather than ranked as one list');
    for (const query of ['files', 'celeste', 'test page', 'search index', 'wallpaper', 'licence']) {
      assert.equal(results(query).answer, true, `"${query}" has a real answer in this repository`);
    }

    /* Nonsense finds nothing, and the engine never reaches the network: it
     * only reads the index it was given. */
    assert.equal(results('zzzqqxx').total, 0);
    assert.equal(results('').total, 0);
    assert.deepEqual([...w.eval(`PROTON_SEARCH.suggest('', {})`)], []);
    const suggested = [...w.eval(`PROTON_SEARCH.suggest('fi', {limit: 8})`)];
    assert.ok(suggested.some((item) => item.action === 'app' && item.value === 'files'), 'the bar offers the app');
    assert.ok(suggested.some((item) => item.action === 'search'), 'and offers to search for the words themselves');
    assert.deepEqual(errors, []);
  } finally { close(); }
});

test('the Browser searches this repository and reads what it finds', async () => {
  const { w, errors, settle, wins, close } = await bootDesktop();
  try {
    w.openApp('browser');
    await settle();
    const body = wins.get('browser').body;
    const bar = body.querySelector('#b-url');
    const page = () => body.querySelector('.brw-page:not([hidden])');
    const type = async (text, key = 'Enter') => {
      bar.value = text;
      bar.dispatchEvent(new w.Event('input', { bubbles: true }));
      await settle();
      bar.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true }));
      await settle();
    };

    /* The start page says what is being searched, and offers a way in. */
    assert.ok(body.querySelector('#b-startq'), 'the home page has a search box');
    assert.match(body.querySelector('.brw-start-note').textContent, /tools\/gen-search-index\.py/,
      'the home page says where the answers come from');
    assert.match(body.querySelector('.brw-start-note').textContent, /never leaves this browser/);
    assert.equal(bar.placeholder, 'Search proton or type an address');

    /* Words in the bar are a question, and the bar says so before you ask. */
    bar.value = 'zip';
    bar.dispatchEvent(new w.Event('input', { bubbles: true }));
    await settle();
    assert.equal(body.querySelector('#b-go').textContent, 'Search', 'the button says what Enter will do');
    assert.ok(body.querySelector('#b-baricon').innerHTML.includes('search') || body.querySelector('#b-baricon').title.includes('Searches'));
    const suggest = body.querySelector('#b-suggest');
    assert.equal(suggest.hidden, false, 'typing offers completions');
    const labels = [...suggest.querySelectorAll('.brw-sug-label')].map((el) => el.textContent);
    assert.ok(labels.includes('zip'), `expected "zip" among ${labels.join(', ')}`);
    /* Arrow keys walk the list, and Enter takes the highlighted suggestion. */
    bar.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    assert.equal(suggest.querySelector('.brw-sug.on'), suggest.querySelector('.brw-sug'));

    await type('zip');
    assert.equal(bar.value, 'proton://search?q=zip', 'the bar shows the search address');
    assert.equal(suggest.hidden, true);
    const hits = [...page().querySelectorAll('.brw-hit')];
    assert.ok(hits.length >= 3, `expected results for "zip", got ${hits.length}`);
    assert.match(page().querySelector('.brw-count').textContent, /results? for/);
    assert.match(page().querySelector('.brw-count').textContent, /“zip”/);
    assert.ok(page().querySelector('.brw-hit-path .brw-path'), 'every result says which file it is');
    assert.ok(page().querySelector('.brw-hit-snippet mark'), 'and shows the word it matched on');
    assert.ok(page().querySelector('.brw-engine'), 'the page explains the engine behind it');

    /* Then the top results quote the file itself, fetched after the list is
     * drawn. A quote from mid-file carries the ellipsis snippet() adds, which
     * no summary has — that is the proof the file was really read. */
    await flush();
    const snippets = [...page().querySelectorAll('.brw-hit-snippet')].map((el) => el.textContent);
    assert.ok(snippets.some((text) => text.includes('\u2026')),
      `expected a windowed quote from a file, got: ${snippets[0].slice(0, 60)}`);
    assert.ok(page().querySelectorAll('.brw-hit-snippet mark').length > 0,
      'with the matched word marked in it');

    /* Opening a documentation result reads it here, with the matches marked. */
    const readme = [...page().querySelectorAll('.brw-hit')]
      .find((li) => li.querySelector('.brw-path').textContent === '/README.md');
    assert.ok(readme, 'the README is a result for "zip"');
    readme.querySelector('.brw-hit-title').click();
    await settle();
    await flush();
    assert.match(bar.value, /^proton:\/\/read\?path=%2FREADME\.md/, 'the reader is an address like any other');
    const text = page().querySelector('.brw-reader-text');
    assert.ok(text, 'the reader shows the file');
    assert.ok(text.textContent.includes('proton'), 'and it is really the README');
    assert.ok(text.querySelectorAll('mark').length > 0, 'the query’s matches are marked in it');
    assert.match(page().querySelector('.brw-matches').textContent, /match/, 'with a count');
    assert.match(page().querySelector('.brw-reader-bar .brw-path').textContent, /^\/README\.md$/);
    assert.ok(page().querySelector('[data-files]'), 'the reader can hand the file to Files');

    /* Back and forward walk this tab's own history. */
    body.querySelector('#b-back').click();
    await settle();
    assert.equal(bar.value, 'proton://search?q=zip', 'Back returns to the results');
    assert.ok(page().querySelectorAll('.brw-hit').length >= 3);
    body.querySelector('#b-back').click();
    await settle();
    assert.ok(body.querySelector('#b-startq'), 'and Back again is the start page');
    assert.equal(body.querySelector('#b-back').disabled, true, 'there is nothing further back');
    body.querySelector('#b-forward').click();
    await settle();
    assert.equal(bar.value, 'proton://search?q=zip', 'Forward walks back into the results');

    /* Kind chips narrow the answers without searching again. */
    await type('files');
    const chips = [...page().querySelectorAll('#b-kinds .brw-chip')];
    assert.ok(chips.length > 1, '"files" is answered by more than one kind of file');
    const docs = chips.find((c) => c.dataset.kind === 'doc');
    assert.ok(docs, 'the documentation is among them');
    docs.click();
    await settle();
    const shown = [...page().querySelectorAll('#b-hits .brw-hit')];
    assert.ok(shown.length > 0, 'filtering keeps the answers of that kind');
    assert.ok(shown.every((li) => li.querySelector('.brw-kind').textContent === 'Documents'));
    chips.find((c) => c.dataset.kind === '').click();
    await settle();
    assert.ok(page().querySelectorAll('#b-hits .brw-hit').length > shown.length, 'and All brings the rest back');

    /* An app result launches the app; the Browser stays where it was. */
    const filesHit = page().querySelector('.brw-hit');
    assert.equal(filesHit.querySelector('.brw-hit-title').textContent.trim(), 'Files');
    assert.ok(filesHit.querySelector('.brw-hit-title mark'), 'the matched word is marked in the headline');
    filesHit.querySelector('.brw-hit-title').click();
    await settle();
    assert.ok(wins.has('files'), 'the Files app opened from its search result');
    assert.equal(bar.value, 'proton://search?q=files', 'and the Browser kept its page');
    w.closeWin('files', true);

    /* Another app can ask the Browser to search something. */
    w.openApp('browser', { query: 'wallpaper' });
    await settle();
    assert.equal(bar.value, 'proton://search?q=wallpaper');
    assert.match(page().querySelector('.brw-count').textContent, /wallpaper/);

    /* The Files hand-off: an HTML page is rendered in a frame, not read as
     * source, and a text file is read. */
    w.openFSItem('/websites/test-page/site.html');
    await settle();
    assert.equal(bar.value, 'file:///websites/test-page/site.html');
    assert.ok(page().querySelector('iframe.site-frame').src.endsWith('/websites/test-page/site.html'),
      'the page is framed, the way the Browser frames any HTML file');
    /* A text file belongs to the Text Editor, not the Browser: FS.appFor()
     * decides, and the Browser only gets what nothing else claims. */
    w.openFSItem('/README.md');
    await settle();
    assert.ok(wins.has('text-editor'), 'a markdown file goes to the Text Editor');
    assert.equal(bar.value, 'file:///websites/test-page/site.html', 'and the Browser keeps its page');
    w.closeWin('text-editor', true);
    await type('/README.md');
    assert.match(bar.value, /^proton:\/\/read\?path=%2FREADME\.md/, 'typed as an address, the Browser reads it');

    /* A word nothing in this repository defines gets no first result: the page
     * says so plainly, and the file that merely mentions it is listed as a
     * mention, under the explanation rather than above it. */
    await type('definition');
    assert.match(page().querySelector('.brw-count').textContent, /Nothing in this repository answers/);
    assert.equal(page().querySelector('#b-hits'), null, 'nothing is presented as a result');
    assert.match(page().querySelector('.brw-none h3').textContent,
      /Nothing in this repository defines or explains “definition”/);
    assert.match(page().querySelector('.brw-none p').textContent,
      /proton searches this repository, not the English language/,
      'and it says why: proton searches the repository, not the language');
    const passing = page().querySelector('#b-mentions');
    assert.ok(passing, 'the mention is still there — hidden nothing, claimed nothing');
    assert.match(page().querySelector('.brw-mention-h').textContent, /Mentioned in passing/);
    assert.ok(passing.querySelectorAll('.brw-hit').length >= 1);
    assert.ok([...passing.querySelectorAll('.brw-path')].some((el) => /LICENSE\.txt/.test(el.textContent)),
      'the licence is where the word really occurs');
    await flush();
    assert.ok(passing.querySelector('.brw-hit-snippet mark'),
      'and its quote shows the word where it really occurs');
    assert.ok(page().querySelector('.brw-none .brw-chip'), 'with something to try instead');

    /* A search that finds nothing at all says so, and offers a way out. */
    await type('zzzqqxx');
    assert.match(page().querySelector('.brw-none').textContent, /Nothing in this repository matches/);
    assert.match(page().querySelector('.brw-none').textContent, /never sends your words anywhere/);
    assert.ok(page().querySelectorAll('.brw-none .brw-chip').length > 0, 'with something to try instead');
    assert.deepEqual(errors, []);
  } finally { close(); }
});

test('the Browser keeps tabs, bookmarks and history like a browser', async () => {
  const { w, errors, settle, saved, wins, close } = await bootDesktop();
  try {
    w.openApp('browser');
    await settle();
    const body = wins.get('browser').body;
    const bar = body.querySelector('#b-url');
    const page = () => body.querySelector('.brw-page:not([hidden])');
    const tabs = () => [...body.querySelectorAll('#b-tabs .brw-tab')];
    const go = async (address) => {
      bar.value = address;
      bar.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await settle();
    };

    assert.equal(tabs().length, 1, 'it starts with one tab');
    assert.equal(bar.value, '', 'the home page leaves the bar empty');
    assert.equal(body.querySelector('#b-sites'), null,
      'the Browser start page should not list saved websites');
    assert.ok(!page().textContent.includes('Your websites'),
      'the Browser start page should not show a Your websites section');

    /* A built-in website is a navigation: bar, history and Back all know. */
    const menu = body.querySelector('#b-sites-menu');
    menu.value = 'test-page';
    menu.dispatchEvent(new w.Event('change', { bubbles: true }));
    await settle();
    assert.equal(bar.value, 'proton://test-page');
    assert.ok(page().querySelector('iframe.site-frame').src.endsWith('/websites/test-page/site.html'));
    assert.match(tabs()[0].textContent, /Test Page/, 'the tab is titled after the page');

    /* Star it: bookmarks are account data, so a backup carries them. */
    body.querySelector('#b-star').click();
    await settle();
    await flush();
    assert.deepEqual(saved().bookmarks.map((b) => b.url), ['proton://test-page']);
    assert.equal(saved().bookmarks[0].title, 'Test Page');
    assert.equal(body.querySelector('#b-star').classList.contains('on'), true, 'the star fills in');
    body.querySelector('#b-star').click();
    await flush();
    assert.deepEqual(saved().bookmarks, [], 'and unstarring removes it again');
    body.querySelector('#b-star').click();
    await flush();

    /* A second tab, its own page, and closing it leaves the first untouched. */
    body.querySelector('#b-newtab').click();
    await settle();
    assert.equal(tabs().length, 2, 'a new tab opened');
    assert.equal(tabs()[1].classList.contains('on'), true, 'and took focus');
    assert.ok(page().querySelector('#b-startq'), 'showing the start page');
    await go('https://example.com/');
    assert.equal(bar.value, 'https://example.com/');
    assert.equal(page().querySelector('iframe.site-frame').getAttribute('src'), 'https://example.com/');
    assert.match(page().textContent, /refuses to be embedded/, 'and warns that a site may not allow it');
    tabs()[0].click();
    await settle();
    assert.equal(bar.value, 'proton://test-page', 'the first tab is still where it was');
    assert.ok(page().querySelector('iframe.site-frame').src.endsWith('/websites/test-page/site.html'));
    body.querySelector('[data-close="' + tabs()[1].dataset.tab + '"]').click();
    await settle();
    assert.equal(tabs().length, 1, 'the tab closed');
    assert.equal(bar.value, 'proton://test-page', 'and the one left is still the site');

    /* proton's own pages are addresses too. */
    await go('proton://bookmarks');
    const rows = [...page().querySelectorAll('.brw-row')];
    assert.equal(rows.length, 1, 'the bookmark is listed');
    assert.match(rows[0].textContent, /Test Page/);
    rows[0].querySelector('[data-remove]').click();
    await settle();
    await flush();
    assert.deepEqual(saved().bookmarks, [], 'and can be removed from its page');
    assert.match(page().textContent, /Nothing bookmarked yet/);

    await go('proton://history');
    await flush();
    const visited = saved().history.map((h) => h.url);
    assert.equal(visited[0], 'proton://history', 'history is newest first');
    assert.ok(visited.includes('proton://test-page') && visited.includes('https://example.com/'),
      `expected the pages this tab visited in ${visited.join(', ')}`);
    assert.ok(page().querySelectorAll('.brw-row').length >= 3, 'and the page lists them');
    assert.match(page().querySelector('.brw-row').textContent, /(just now|min ago|h ago|d ago)/);
    page().querySelector('#b-clearhist').click();
    await settle();
    await flush();
    assert.deepEqual(saved().history, [], 'Clear history empties it');
    assert.match(page().textContent, /Nothing visited yet/);

    /* Addresses: a file path frames a page, and any other file gets read. */
    await go('/websites/test-page/site.html');
    assert.ok(page().querySelector('iframe.site-frame'), 'an HTML file in the file system is framed');
    await go('/README.md');
    assert.match(bar.value, /^proton:\/\/read\?path=%2FREADME\.md/, 'a text file is read, not framed');
    assert.ok(page().querySelector('.brw-reader-text').textContent.includes('proton'));
    await go('file:///assets/search.js');
    assert.match(page().querySelector('.brw-reader-bar .brw-path').textContent, /assets\/search\.js/);
    await go('proton://nope');
    assert.match(page().textContent, /proton doesn't know that page/);
    page().querySelector('[data-search]').click();
    await settle();
    assert.equal(bar.value, 'proton://search?q=nope', 'and offers to search for it instead');

    /* Alt+arrow keys travel without touching the bar. */
    const before = bar.value;
    body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    await settle();
    assert.notEqual(bar.value, before, 'Alt+← went back');
    body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    await settle();
    assert.equal(bar.value, before, 'Alt+→ came forward again');
    assert.deepEqual(errors, []);
  } finally { close(); }
});
