/* proton — auth screens, desktop, panel, start menu, window manager and the
 * panel's AI button (a Copilot-style pane that docks Mox beside the desktop).
 * Every app lives in its own apps/<category>/<name>/app.html module (loaded via
 * assets/html-loader.js); the list of apps and all their metadata (name,
 * icon, category, description, window size) live in the catalog
 * data/applications.js, parsed by assets/config-loader.js. proton ships 65
 * apps: six System apps, six Productivity apps (Calculator, Clock, the file
 * system suite's Files, Text Editor and PDF Viewer, and Mox, the private AI
 * workspace), four Media apps (Image Viewer, VLC, Paint, Piano), four Tools
 * (Ruffle Flash Player, Web Retro, Terminal, You Are An Idiot) and 45 games.
 * Built-in websites use the same catalog system (data/websites.js) and are
 * framed by the Browser app (Test Page is the only built-in site).
 * Window chrome/panel styling follows Mixt's Mint-Y theme.
 */
'use strict';

/* ---------------- app registry + window manager ---------------- */
const APPS = {};
/* registerApp() is called by each app.html with just its render() code.
 * When the HTML loader runs that script it parks the catalog entry for the
 * app in window.__protonPendingApp, and the catalog entry — name, icon,
 * svgIcon mode, cat, desc, w, h — wins, so data/applications.js is the single
 * place to set default icons, rename apps, change categories or resize windows. */
function registerApp(def) {
  const catalog = window.__protonPendingApp;
  if (catalog) {
    def = { ...def, ...catalog };
    delete def.block;
    delete def.path;
    delete def.enabled;
  }
  APPS[def.id] = def;
}


/* ---------- user-added apps & websites (Mixt-style add/remove) ---------- */
const dynamicAppIds = new Set();
function normalizeUserData() {
  if (!userData) return;
  userData.customApps ||= [];
  userData.websites ||= [];
  userData.hiddenApps ||= [];
  /* The Browser keeps its bookmarks and history on the account, so an older
   * account (or an older backup) simply starts with none. */
  userData.bookmarks ||= [];
  userData.history ||= [];
  userData.settings.pinned ||= [];
  /* Legacy app ids saved by older versions (e.g. the Calculator used to be
   * id "math", the PDF Viewer "pdf-viewer"). The mapping stays so an old pin,
   * shortcut or hidden-apps list resolves to one id, not two — the PDF Viewer
   * is shipped again under "pdf", the Calculator is still gone. */
  const LEGACY_APP_IDS = { math: 'calculator', 'pdf-viewer': 'pdf' };
  userData.settings.pinned = userData.settings.pinned.map((id) => LEGACY_APP_IDS[id] || id);
  userData.hiddenApps = userData.hiddenApps.map((id) => LEGACY_APP_IDS[id] || id);
  /* Apps the catalog marks preinstalled=false are not on the desktop until
   * the user adds them in App Center. Until then they sit in hiddenApps;
   * installing remembers the choice in installedApps so this does not
   * hide them again on the next load. */
  userData.installedApps ||= [];
  for (const app of Object.values(APPS)) {
    if (!app || app.preinstalled !== false || dynamicAppIds.has(app.id)) continue;
    if (userData.installedApps.includes(app.id)) {
      userData.hiddenApps = userData.hiddenApps.filter((x) => x !== app.id);
    } else if (!userData.hiddenApps.includes(app.id)) {
      userData.hiddenApps.push(app.id);
    }
  }
  /* Missing means an older account: give it the same initial shortcuts as a
   * new account. An empty array is deliberate (the user cleared the desktop).
   * Older versions also saved desktopApps as app ids; preserve that choice. */
  if (!Array.isArray(userData.desktopIcons)) {
    const legacy = Array.isArray(userData.desktopApps) ? userData.desktopApps
      : Array.isArray(userData.settings.desktopApps) ? userData.settings.desktopApps : null;
    userData.desktopIcons = legacy
      ? legacy.filter((id) => typeof id === 'string').map((id, i) =>
        ({ id: 'legacy-desktop-' + i, kind: 'app', target: id, col: 0, row: i }))
      : MH.defaultDesktopIcons();
  }
  const seenIds = new Set(), seenTargets = new Set();
  userData.desktopIcons = userData.desktopIcons.slice(0, 200).flatMap((entry) => {
    if (!entry || !['app', 'path'].includes(entry.kind) || typeof entry.target !== 'string' || !entry.target || entry.target.length > 1024) return [];
    let target = entry.kind === 'app' ? (LEGACY_APP_IDS[entry.target] || entry.target) : FS.normalize(entry.target);
    if (entry.kind === 'path' && (!entry.target.startsWith('/') || (target.startsWith('/home/') && target !== FS.home() && !target.startsWith(FS.home() + '/')))) return [];
    const key = entry.kind + ':' + target;
    if (seenTargets.has(key)) return [];
    seenTargets.add(key);
    let id = typeof entry.id === 'string' && entry.id.length <= 120 && entry.id ? entry.id : 'desktop-' + MH.uid();
    if (seenIds.has(id)) id = 'desktop-' + MH.uid();
    seenIds.add(id);
    const coord = (n) => Number.isSafeInteger(n) && n >= 0 && n < 256 ? n : 0;
    return [{ id, kind: entry.kind, target, col: coord(entry.col), row: coord(entry.row) }];
  });
  /* --- modular customisation state --- */
  userData.moduleOverrides ||= {};   // appId -> {name, icon, svgIcon, iconImage, cat, desc, order}
  userData.customThemes ||= [];      // {id, name, accent, wallpaper}
  userData.customWallpapers ||= [];  // {id, name, from, to}
  if (!userData.settings.activeThemeId) userData.settings.activeThemeId = 'proton-dark';
  userData.settings.components = {
    clock: true, desktopHint: true, lockButton: true, userButton: true,
    startSearch: true, panelLabels: false, copilotButton: true,
    ...(userData.settings.components || {}),
  };
  /* The AI pane's width in pixels, when the user has dragged it; anything
   * unreadable falls back to the default (see copilotWidth()). */
  const copilotW = Number(userData.settings.copilotWidth);
  if (Number.isFinite(copilotW) && copilotW >= COPILOT_W.min && copilotW <= 4096) userData.settings.copilotWidth = Math.round(copilotW);
  else delete userData.settings.copilotWidth;
}
/* Turn "example.com" / "example.com/x" into a safe http(s) URL, or null. */
function normalizeUrl(raw) {
  let s = String(raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null;
  } catch { return null; }
}
function clearDynamicApps() {
  for (const id of dynamicAppIds) delete APPS[id];
  dynamicAppIds.clear();
}
/* (Re)register this account's custom apps so they behave exactly like
 * built-ins: proton menu, pinning, windows, search. */
function syncCustomApps() {
  clearDynamicApps();
  if (!userData) return;
  normalizeUserData();
  applyModuleOverrides();
  for (const def of userData.customApps) {
    APPS[def.id] = {
      id: def.id, name: def.name, icon: def.icon || 'grid', svgIcon: true, iconImage: def.iconImage || '', cat: 'My Apps',
      desc: def.desc || def.url, w: 980, h: 620,
      render(body) {
        body.innerHTML = `${bar(def.name, `<span class="muted" style="max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${MH.esc(def.url)}</span><button class="btn sm" data-w="reload">${iconSvg('refresh')} Reload</button><button class="btn sm primary" data-w="ext">${iconSvg('external')} Open in new tab</button>`)}
        <div class="app-main"><iframe title="${MH.esc(def.name)}" src="${MH.esc(def.url)}" style="width:100%;height:100%;min-height:420px;border:0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        <p class="muted" style="padding:8px 14px">If this stays blank, ${MH.esc(def.name)} refuses to be embedded — use “Open in new tab”. proton never uploads or proxies it; your browser loads it directly.</p></div>`;
        body.querySelector('[data-w="ext"]').onclick = () => window.open(def.url, '_blank', 'noopener');
        body.querySelector('[data-w="reload"]').onclick = () => { const f = body.querySelector('iframe'); f.src = def.url; };
      },
    };
    dynamicAppIds.add(def.id);
  }
  applyModuleOverrides();
}
function refreshChrome() {
  renderStartMenu(''); renderPanelApps(); DesktopIcons.render();
  for (const [id, win] of wins) {
    const app = APPS[id]; if (!app) continue;
    const title = win.el.querySelector('.wt'), icon = win.el.querySelector('.wic');
    if (title) title.textContent = app.name;
    if (icon) icon.innerHTML = appIcon(app);
  }
}

/* Every built-in module's factory metadata, captured once, so user edits
 * (rename, re-icon, re-categorise, reorder) can always be reset. */
const BASE_MODULES = {};
function snapshotModules() {
  Object.values(APPS).forEach((a, i) => {
    if (dynamicAppIds.has(a.id) || BASE_MODULES[a.id]) return;
    BASE_MODULES[a.id] = { name: a.name, icon: a.icon, svgIcon: a.svgIcon !== false, iconImage: a.iconImage || '', cat: a.cat, desc: a.desc, index: i };
  });
}
function applyModuleOverrides() {
  if (!userData) return;
  normalizeUserData(); snapshotModules();
  for (const a of Object.values(APPS)) {
    if (dynamicAppIds.has(a.id)) continue;
    const base = BASE_MODULES[a.id]; if (!base) continue;
    a.name = base.name; a.icon = base.icon; a.svgIcon = base.svgIcon !== false; a.iconImage = base.iconImage || ''; a.cat = base.cat; a.desc = base.desc;
    a.baseIndex = base.index; delete a.sortOrder;
    const o = userData.moduleOverrides[a.id];
    if (o) {
      if (o.name) a.name = o.name;
      if (o.icon) {
        a.icon = o.icon;
        if (o.svgIcon === undefined) a.svgIcon = isSvgIconName(o.icon);
      }
      if (o.svgIcon !== undefined) a.svgIcon = o.svgIcon === true || String(o.svgIcon).toLowerCase() === 'true';
      if (isIconImageData(o.iconImage)) a.iconImage = o.iconImage;
      if (o.cat) a.cat = o.cat;
      if (o.desc !== undefined) a.desc = o.desc;
      if (o.order !== undefined && o.order !== '') a.sortOrder = Number(o.order);
    }
  }
}
/* Wallpaper + theme application (built-ins are CSS classes; customs inline). */
function customWallpaper() {
  normalizeUserData();
  return userData.customWallpapers.find((w) => w.id === userData.settings.wallpaper) || null;
}
function applyWallpaper() {
  const el = document.querySelector('.wallpaper'); if (!el) return;
  const w = customWallpaper();
  if (w) {
    el.className = 'wallpaper'; el.removeAttribute('data-wp');
    el.style.backgroundColor = w.to;
    el.style.backgroundImage = `radial-gradient(900px 500px at 75% 12%, rgba(255,255,255,.14), transparent 55%), linear-gradient(150deg, ${w.from}, ${w.to})`;
  } else {
    el.style.background = ''; el.style.backgroundColor = ''; el.style.backgroundImage = '';
    el.className = 'wallpaper wp-' + (userData.settings.wallpaper || 'mint');
  }
}
function setWallpaper(id) { userData.settings.wallpaper = id; saveData(); applyWallpaper(); }
function activeCustomTheme() {
  normalizeUserData();
  return userData.customThemes.find((th) => th.id === userData.settings.activeThemeId) || null;
}
function applyComponents() {
  if (!userData) return;
  const c = userData.settings.components || {};
  const set = (id, show) => { const el = MH.$(id); if (el) el.style.display = show ? '' : 'none'; };
  set('desktop-hint', c.desktopHint !== false);
  set('tray-lock', c.lockButton !== false);
  set('tray-user', c.userButton !== false);
  set('clockbox', c.clock !== false);
  /* The AI button follows its toggle and Mox itself: removing Mox from the
   * menu takes the button (and an open pane, frame and all) with it. */
  const copilot = copilotAvailable(), copilotBtn = MH.$('tray-copilot');
  set('tray-copilot', copilot);
  if (copilot && copilotBtn) { // a rename in Customize reaches the button and the open pane
    const name = APPS[COPILOT_APP].name;
    copilotBtn.title = `Ask ${name} (Alt+C)`;
    copilotBtn.setAttribute('aria-label', `Ask ${name}`);
    const label = MH.$('copilot-name'); if (label) label.textContent = name;
    MH.$('copilot-frame')?.setAttribute('title', name);
  }
  if (!copilot) closeCopilot({ unload: true });
  const search = document.querySelector('.sm-search');
  if (search) search.style.display = c.startSearch !== false ? '' : 'none';
}
/* Open an account's saved website, even when the Browser is already open. */
function openWebsite(site) { openApp('browser', { url: site.url }); }

/* ---------------- built-in websites registry ----------------
 * Each built-in website is a standalone HTML page in
 * websites/<name>/site.html, listed in the website catalog
 * data/websites.js (same system as the app catalog).
 * assets/html-loader.js registers each catalog entry here as
 * { id, name, icon, desc, page } and the Browser app loads `page`
 * in a frame at proton://<id>. */
const SITES = {};
function registerSite(def) { SITES[def.id] = def; }

/* ---------- tiny safe-ish maths evaluator (own input only, this device) --- */
function evalMath(expr, xVal = 0) {
  let e = String(expr).trim().toLowerCase().replace(/\^/g, '**').replace(/,/g, '.');
  if (!e || !/^[0-9a-z+\-*/%(). ]+$/.test(e)) throw new Error('Use numbers, + − × ÷, brackets, x, sin/cos/sqrt/pi');
  e = e.replace(/\bpi\b/g, 'Math.PI').replace(/\be\b/g, 'Math.E')
       .replace(/\b(sin|cos|tan|sqrt|abs|log|exp)\b/g, 'Math.$1');
  // bare x becomes the supplied value; identifiers left must be Math.* only
  e = e.replace(/(?<![\w.])x(?![\w])/g, `(${Number(xVal) || 0})`);
  if (/(?<![\w.])[a-z]+/.test(e.replace(/Math\.[A-Z]+/g, ''))) throw new Error('Unknown name in expression');
  const v = Function('"use strict"; return (' + e + ')')();
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('No numeric result');
  return v;
}
const fmtNum = (v) => Math.abs(v) >= 1e12 || (Math.abs(v) < 1e-9 && v !== 0) ? v.toExponential(6) : String(Math.round(v * 1e10) / 1e10);

/* Black-and-white accent shades. ink = text colour to use on top of it. */
const ACCENTS = {
  '#ffffff': { dim: '#ffffff', soft: '#2b2b2b', ink: '#000000', name: 'White' },
  '#d9d9d9': { dim: '#f0f0f0', soft: '#242424', ink: '#000000', name: 'Silver' },
  '#b5b5b5': { dim: '#d9d9d9', soft: '#1e1e1e', ink: '#000000', name: 'Light grey' },
  '#8a8a8a': { dim: '#b5b5b5', soft: '#181818', ink: '#000000', name: 'Grey' },
  '#5c5c5c': { dim: '#9a9a9a', soft: '#121212', ink: '#ffffff', name: 'Dark grey' },
};
/* Any accent saved by an older (coloured) version resolves to White. */
function accentKey() {
  return ACCENTS[userData.settings.accent] ? userData.settings.accent : '#ffffff';
}
function accentInk(hex) {
  const n = parseInt(String(hex || '#ffffff').slice(1), 16);
  if (Number.isNaN(n)) return '#000000';
  const lum = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.55 ? '#000000' : '#ffffff';
}
function applyAccent() {
  const theme = activeCustomTheme();
  const root = document.documentElement.style;
  if (theme) {
    root.setProperty('--accent', theme.accent);
    root.setProperty('--accent-dim', theme.accent);
    root.setProperty('--accent-soft', `color-mix(in srgb, ${theme.accent} 26%, black)`);
    root.setProperty('--accent-ink', accentInk(theme.accent));
    return;
  }
  const key = accentKey(), a = ACCENTS[key];
  root.setProperty('--accent', key);
  root.setProperty('--accent-dim', a.dim);
  root.setProperty('--accent-soft', a.soft);
  root.setProperty('--accent-ink', a.ink);
}

const wins = new Map(); // appId -> {el, body, title}
let zTop = 20, activeApp = null, clockTimer = null, locked = false;

/* Put the keyboard on a window's app surface. Focusing the body (not the frame)
 * is what makes an app's own key listener fire: the event targets that element
 * and bubbles to its listener on the same node, while the window frame itself
 * is an ancestor of the body and would never deliver it there. */
function focusWinBody(el, body) {
  if (!body) return;
  try { body.focus({ preventScroll: true }); } catch { try { body.focus(); } catch { /* not focusable */ } }
  if (document.activeElement === body) return;
  /* Older engines: fall back to the window frame, still better than nothing. */
  try { el.focus({ preventScroll: true }); } catch { /* leave the focus alone */ }
}

function focusWin(id) {
  const w = wins.get(id); if (!w) return;
  w.el.style.zIndex = ++zTop;
  w.el.classList.remove('min');
  activeApp = id;
  document.querySelectorAll('.win').forEach((e) => e.classList.toggle('active', e === w.el));
  /* Keyboard focus follows the window that came to the front — unless the
   * focus is already somewhere inside it (clicking a field, a button or the
   * video in a window that was already in front must not move it). */
  const focused = document.activeElement;
  if (!focused || !w.el.contains(focused)) focusWinBody(w.el, w.body);
  renderPanelApps();
}
function closeWin(id, force = false) {
  const w = wins.get(id); if (!w) return true;
  if (!force && w.body.beforeClose?.() === false) return false;
  w.body.onDestroy?.(); // revoke object URLs / stop any resources the app owns
  w.el.remove(); wins.delete(id);
  if (activeApp === id) activeApp = null;
  renderPanelApps();
  return true;
}
function toggleMin(id) {
  const w = wins.get(id); if (!w) return;
  if (activeApp === id && !w.el.classList.contains('min')) { w.el.classList.add('min'); activeApp = null; }
  else focusWin(id);
  renderPanelApps();
}

/* options.path hands a virtual file/folder to an app, options.url an address
 * and options.query something to search for (the Browser takes all three). A
 * running app receives them via body.openPath, so opening a second file
 * reuses the same window. options.winKey opens an extra real window of the
 * same app under its own key (the panel still shows the app once); the key
 * doubles as the id focusWin/closeWin/toggleMin take for that window. */
function openApp(id, options = {}) {
  const app = APPS[id]; if (!app) return;
  MH.$('startmenu')?.setAttribute('hidden', '');
  document.querySelector('.menu-btn')?.classList.remove('open');
  const key = options.winKey || id;
  if (wins.has(key)) {
    focusWin(key);
    if (options.path || options.url || options.query) wins.get(key).body.openPath?.(options);
    return;
  }
  if (key === id) { userData.counters.windowsOpened = (userData.counters.windowsOpened || 0) + 1; saveData(); }

  const el = document.createElement('section');
  el.className = 'win'; el.dataset.app = id; el.dataset.win = key;
  el.tabIndex = -1;
  const mobile = innerWidth < 760;
  /* With the AI pane docked, a new window opens in the space left of it. */
  const areaW = innerWidth - (copilotDocked() ? copilotWidth() : 0);
  const wpx = Math.min(options.w || app.w || 860, areaW - 16), hpx = Math.min(options.h || app.h || 560, innerHeight - 70);
  const off = (wins.size % 6) * 26;
  el.style.cssText = `width:${wpx}px;height:${hpx}px;left:${Math.max(4, (areaW - wpx) / 2 + off - 40)}px;top:${Math.max(4, (innerHeight - 44 - hpx) / 2 + off - 20)}px;z-index:${++zTop}`;
  if (mobile) el.classList.add('max');
  el.innerHTML = `
    <header class="win-head">
      <span class="wic">${appIcon(app)}</span><span class="wt">${MH.esc(app.name)}</span>
      <button class="wbtn" data-act="min" title="Minimise">—</button>
      <button class="wbtn" data-act="max" title="Maximise">${iconSvg('square')}</button>
      <button class="wbtn close" data-act="close" title="Close">${iconSvg('x')}</button>
    </header>
    <div class="win-body"></div><div class="win-resize"></div>`;
  MH.$('windows').appendChild(el);
  const body = el.querySelector('.win-body');
  /* The app surface is a focus target: an app that listens for keys on its own
   * body (Image Viewer, Text Editor, Browser, VLC) then gets them when the
   * window is in front, instead of the document swallowing every press. */
  body.tabIndex = -1;
  wins.set(key, { el, body, appId: id });
  activeApp = key;
  document.querySelectorAll('.win').forEach((e) => e.classList.toggle('active', e === el));
  /* Before render(), so an app that focuses its own field or stage keeps it. */
  focusWinBody(el, body);

  el.addEventListener('pointerdown', () => focusWin(key));
  el.querySelector('[data-act="close"]').onclick = (e) => { e.stopPropagation(); closeWin(key); };
  el.querySelector('[data-act="min"]').onclick = (e) => { e.stopPropagation(); toggleMin(key); };
  el.querySelector('[data-act="max"]').onclick = (e) => { e.stopPropagation(); el.classList.toggle('max'); focusWin(key); };

  // drag by title bar
  const head = el.querySelector('.win-head');
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.wbtn') || el.classList.contains('max')) return;
    const sx = e.clientX - el.offsetLeft, sy = e.clientY - el.offsetTop;
    const move = (ev) => {
      el.style.left = Math.min(innerWidth - 90, Math.max(-el.offsetWidth + 130, ev.clientX - sx)) + 'px';
      el.style.top = Math.min(innerHeight - 90, Math.max(0, ev.clientY - sy)) + 'px';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  head.addEventListener('dblclick', (e) => { if (!e.target.closest('.wbtn')) el.classList.toggle('max'); });
  // resize
  el.querySelector('.win-resize').addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const sw = el.offsetWidth, sh = el.offsetHeight, sx = e.clientX, sy = e.clientY;
    const move = (ev) => {
      el.style.width = Math.max(300, sw + ev.clientX - sx) + 'px';
      el.style.height = Math.max(200, sh + ev.clientY - sy) + 'px';
      el.dispatchEvent(new CustomEvent('win-resize'));
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });

  try { app.render(body, { openApp, close: () => closeWin(key), winEl: el, winKey: key, appId: id, ...options }); }
  catch (err) { body.innerHTML = `<div class="pad"><h3>${iconSvg('alert')} ${MH.esc(app.name)} hit a snag</h3><p class="muted">${MH.esc(err.message)}</p></div>`; console.error(err); }
  renderPanelApps();
}

/* Open a virtual file or folder: the single entry point the desktop, the
 * desktop shortcuts and the apps all use.
 *   folder            → Files, at that folder
 *   file              → the app FS.appFor() names (Browser for .html, PDF
 *                       Viewer for .pdf, Image Viewer for images, Media for
 *                       audio/video, Text Editor for other text)
 *   file, no viewer   → Files with the file selected, so it can still show its
 *                       properties and download it (a binary .zip has no app of
 *                       its own here)
 * Only when Files itself is missing/removed does this just report the problem. */
function openFSItem(path) {
  const st = FS.stat(path);
  if (!st) { MH.toast(`File not found: ${path}`); return; }
  if (st.type === 'dir') {
    if (APPS.files) openApp('files', { path: st.path });
    else MH.toast(`Folders cannot be opened: the Files app is not available on this account.`);
    return;
  }
  const appId = FS.appFor(st.path);
  if (appId && APPS[appId]) { openApp(appId, { path: st.path }); return; }
  if (APPS.files) {
    openApp('files', { path: FS.dirname(st.path), select: st.path });
    MH.toast(`No viewer for ${st.name} — showing it in Files.`);
    return;
  }
  MH.toast(`No app can open ${st.name} in this build.`);
}

/* ---------------- desktop ---------------- */
/* Movable, per-account app and file shortcuts live in desktop-icons.js. */

/* Avatar background: accounts created by the coloured version keep their
 * old colour value; map it to a dark grey so avatars stay black-and-white. */
const AVATAR_GREY = { '#68b723': '#2f2f2f', '#3d7fca': '#4a4a4a', '#8e5ec9': '#5c5c5c', '#e67e22': '#383838', '#d64570': '#666666', '#2aa198': '#222222' };
function avatarBg(u) {
  const c = String((u && u.color) || '').toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(c) && c[1] === c[3] && c[3] === c[5]) return c;
  return AVATAR_GREY[c] || '#2f2f2f';
}
/* Avatar = initials from the account name (no emoji avatars). */
function userInitials(u) {
  const src = String((u && (u.displayName || u.username)) || 'proton').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return MH.esc(((parts[0] || 'P')[0] || 'P') + ((parts[1] || '')[0] || '')).toUpperCase();
}

function enterDesktop() {
  DesktopIcons.unmount();
  normalizeUserData(); syncCustomApps();
  locked = false;
  MH.$('auth').hidden = true;
  const d = MH.$('desktop'); d.hidden = false;
  applyAccent();
  document.title = `proton — ${currentUser.displayName}`;
  d.innerHTML = `
    <div class="wallpaper wp-${MH.esc(userData.settings.wallpaper)}"></div>
    <div class="desktop-hint" id="desktop-hint">${MH.esc(new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))}<br>Double-click a shortcut or open the proton menu</div>
    <div class="desktop-icon-area" id="desktop-icons" aria-label="Desktop shortcuts">
      <div id="desktop-icon-list"></div>
      <div class="desktop-tools">
        <button class="desktop-open" id="desktop-open" type="button" hidden>${iconSvg('external')} Open selected</button>
        <button class="desktop-remove" id="desktop-remove" type="button" hidden>${iconSvg('x')} Remove selected</button>
        <button class="desktop-add" id="desktop-add" type="button">${iconSvg('plus')} Add icon</button>
      </div>
    </div>
    <div class="desktop-context" id="desktop-context" role="menu" hidden></div>
    <div class="desktop-picker" id="desktop-picker" hidden></div>
    <div class="windows-layer" id="windows"></div>
    <aside class="copilot" id="copilot" aria-label="AI assistant" hidden>
      <div class="copilot-grip" id="copilot-grip" role="separator" aria-orientation="vertical" aria-label="Resize the AI pane" aria-valuemin="${COPILOT_W.min}" aria-valuemax="${COPILOT_W.max}" tabindex="0" title="Drag to resize"></div>
      <header class="copilot-head">
        <span class="copilot-mark">${iconSvg('sparkle')}</span>
        <span class="copilot-title"><b id="copilot-name">Mox</b><span>AI on this device · Alt+C</span></span>
        <button class="wbtn" id="copilot-reload" type="button" title="Reload" aria-label="Reload">${iconSvg('refresh')}</button>
        <button class="wbtn" id="copilot-window" type="button" title="Open in a window" aria-label="Open in a window">${iconSvg('app-window')}</button>
        <button class="wbtn close" id="copilot-close" type="button" title="Close (Alt+C)" aria-label="Close">${iconSvg('x')}</button>
      </header>
      <div class="copilot-body" id="copilot-body"></div>
    </aside>
    <div class="startmenu" id="startmenu" hidden></div>
    <footer class="panel">
      <button class="menu-btn" id="menubtn"><span class="lg">${iconSvg('atom')}</span> proton</button>
      <div class="panel-apps" id="panelapps"></div>
      <div class="tray">
        <button class="tbtn" id="tray-lock" title="Lock">${iconSvg('lock')}</button>
        <button class="tbtn" id="tray-user" title="Account & settings"><span id="tray-avt"></span></button>
        <div class="clock" id="clockbox"><b id="clock-time">--:--</b><span id="clock-date"></span></div>
        <button class="tbtn copilot-btn" id="tray-copilot" type="button" title="Ask Mox (Alt+C)" aria-label="Ask Mox" aria-controls="copilot" aria-expanded="false">${iconSvg('sparkle')}</button>
      </div>
    </footer>`;
  MH.$('tray-avt').textContent = userInitials(currentUser);
  renderPanelApps(); renderStartMenu(''); applyWallpaper(); applyComponents();
  DesktopIcons.mount();
  MH.$('menubtn').onclick = () => {
    const sm = MH.$('startmenu'), open = sm.hidden;
    sm.hidden = !open; MH.$('menubtn').classList.toggle('open', open);
    if (open) MH.$('sm-search-input')?.focus();
  };
  MH.$('tray-user').onclick = () => openApp('settings');
  MH.$('tray-lock').onclick = lockDesktop;
  wireCopilot();
  tickClock(); clearInterval(clockTimer); clockTimer = setInterval(tickClock, 15000);
  if (!sessionStorage.getItem('proton2.welcomed.' + currentUser.usernameLower)) {
    sessionStorage.setItem('proton2.welcomed.' + currentUser.usernameLower, '1');
    setTimeout(() => MH.toast(`Welcome${userData.counters.windowsOpened ? ' back' : ''}, ${currentUser.displayName}! Everything is saved on this device.`), 650);
  }
}
function tickClock() {
  const t = MH.$('clock-time'), d = MH.$('clock-date'); if (!t) return;
  const now = new Date();
  t.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  d.textContent = now.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
function renderPanelApps() {
  const box = MH.$('panelapps'); if (!box || !currentUser) return;
  const pinned = userData.settings.pinned || [];
  const ids = [...new Set([...pinned, ...wins.keys()])].filter((id) => !(userData.hiddenApps || []).includes(id));
  box.innerHTML = ids.filter((id) => APPS[id]).map((id) => {
    /* Extra windows of an app (options.winKey) still count as that app. */
    const a = APPS[id];
    const run = wins.has(id) || [...wins.values()].some((w) => w.appId === id);
    const act = (wins.get(activeApp)?.appId || activeApp) === id;
    return `<button class="pitem ${run ? 'running' : ''} ${act ? 'active' : ''}" data-app="${id}" title="${MH.esc(a.name)}${run ? ' (open)' : ''}"><span>${appIcon(a)}</span>${(userData.settings.components || {}).panelLabels ? `<span class="pl">${MH.esc(a.name)}</span>` : ''}</button>`;
  }).join('');
  box.querySelectorAll('.pitem').forEach((b) => b.onclick = () => {
    const id = b.dataset.app;
    wins.has(id) ? (activeApp === id ? toggleMin(id) : focusWin(id)) : openApp(id);
  });
}
/* Menu category order. proton ships System apps only; 'My Apps' holds the
 * web-address apps an account saved before adding was disabled, and any
 * category invented in Customize is appended after these. */
/* Start menu sections, in order. System and My Apps are the built-ins; the
 * catalog's own categories (Productivity, Media, Tools, Games) follow in this order,
 * and a catalog can invent more — they are appended after these. */
const CATS = ['System', 'Productivity', 'Media', 'Tools', 'Games', 'My Apps'];
function renderStartMenu(q) {
  const sm = MH.$('startmenu'); if (!sm) return;
  const query = (q ?? MH.$('sm-search-input')?.value ?? '').trim().toLowerCase();
  const list = Object.values(APPS).filter((a) => !(userData.hiddenApps || []).includes(a.id)).filter((a) => !query || (a.name + ' ' + a.desc).toLowerCase().includes(query));
  let html = `<div class="sm-search"><input id="sm-search-input" type="search" placeholder="Search apps…" value="${MH.esc(query)}" aria-label="Search apps"></div><div class="sm-grid">`;
  const cats = [...CATS, ...new Set(list.map((a) => a.cat).filter((c) => !CATS.includes(c)))];
  for (const cat of cats) {
    const inCat = list.filter((a) => a.cat === cat)
      .sort((x, y) => (x.sortOrder ?? x.baseIndex ?? 999) - (y.sortOrder ?? y.baseIndex ?? 999));
    if (!inCat.length) continue;
    html += `<div class="sm-cat">${MH.esc(cat)}</div>` + inCat.map((a) => `<button class="sm-item" data-app="${MH.esc(a.id)}" draggable="true" title="Open ${MH.esc(a.name)} · drag to desktop to add a shortcut"><span class="ic">${appIcon(a)}</span>${MH.esc(a.name)}</button>`).join('');
  }
  if (!list.length) html += `<p style="grid-column:1/-1;opacity:.7;padding:10px 4px">No apps match “${MH.esc(query)}”.</p>`;
  html += `</div>
    <div class="sm-foot">
      <button class="sm-user" id="sm-user"><span class="avt" style="background:${avatarBg(currentUser)}">${MH.esc(userInitials(currentUser))}</span><span><b>${MH.esc(currentUser.displayName)}</b><span>@${MH.esc(currentUser.username)} · signed in for this visit</span></span></button>
      <button class="btn sm" id="sm-lock">${iconSvg('lock')} Lock</button>
      <button class="btn sm" id="sm-out">Sign out</button>
    </div>`;
  sm.innerHTML = html;
  const input = MH.$('sm-search-input');
  input.oninput = () => { const v = input.value, pos = input.selectionStart; renderStartMenu(v); const n = MH.$('sm-search-input'); n.focus(); n.setSelectionRange(pos, pos); };
  sm.querySelectorAll('.sm-item').forEach((b) => {
    b.onclick = () => openApp(b.dataset.app);
    b.oncontextmenu = (e) => { e.preventDefault(); DesktopIcons.menu(e, { appId: b.dataset.app }); };
    b.ondragstart = (e) => {
      e.dataTransfer.setData('application/x-proton-app', b.dataset.app);
      e.dataTransfer.setData('text/plain', APPS[b.dataset.app].name);
      e.dataTransfer.effectAllowed = 'copy';
    };
  });
  applyComponents();
  MH.$('sm-user').onclick = () => openApp('settings');
  MH.$('sm-lock').onclick = lockDesktop;
  MH.$('sm-out').onclick = signOut;
}
document.addEventListener('pointerdown', (e) => {
  const sm = MH.$('startmenu');
  if (sm && !sm.hidden && !e.target.closest('#startmenu,#menubtn')) { sm.hidden = true; MH.$('menubtn')?.classList.remove('open'); }
});
function closeAllWindows(force = false) {
  if (!force && [...wins.values()].some((w) => w.body.beforeClose?.() === false)) return false;
  for (const id of [...wins.keys()]) closeWin(id, true);
  return true;
}
function signOut({ skipSave = false, force = false } = {}) {
  if (!force && [...wins.values()].some((w) => w.body.beforeClose?.() === false)) return false;
  if (skipSave) clearTimeout(saveTimer);
  else if (!saveDataNow()) return false;
  closeAllWindows(true);
  DesktopIcons.unmount();
  clearDynamicApps(); MH.setSession('');
  currentUser = null; userData = null; locked = false;
  clearInterval(clockTimer);
  MH.$('desktop').hidden = true; MH.$('desktop').innerHTML = ''; // the AI pane and its frame go too
  MH.$('desktop').classList.remove('copilot-open', 'copilot-resizing');
  route();
  return true;
}
function lockDesktop() {
  locked = true; saveDataNow();
  MH.$('desktop').hidden = true;
  renderLock();
}

/* ---------------- the AI button: Mox, docked like Windows' Copilot ----------------
 * A sparkle at the right end of the panel, after the clock (where Windows 11
 * keeps its Copilot button), docks an AI assistant along the right edge of
 * the desktop, above the panel. The desktop makes room for it the way
 * Windows does for its docked pane: maximised windows, the desktop icons and
 * the date hint shrink to its left instead of hiding underneath, and new
 * windows open centred in the space that is left. On a phone-sized screen
 * the pane covers the desktop instead (styles.css) and nothing moves.
 *
 * The assistant is Mox (apps/productivity/mox/): the pane frames the page
 * the Mox app publishes as APPS.mox.page, and Mox runs its own small language
 * model in this browser, so nothing typed into it leaves the device. The
 * frame is created the first time the pane opens — Mox starts reading its
 * 94 MB model as soon as its page loads, so a visit that never opens the pane
 * never downloads it — and closing only hides it: the conversation and the
 * loaded model are still there when the pane comes back. Signing out clears
 * #desktop, frame included.
 *
 * Alt+C toggles it from anywhere on the desktop, inside Mox too (Win+C
 * belongs to the operating system). The left edge resizes it, by pointer or
 * with ← / → once focused, and the width is saved on the account. "Open in a
 * window" hands over to the Mox app. The button is Mox's: it hides when Mox
 * is removed from the menu, and Customize → Desktop parts can hide it. */
const COPILOT_APP = 'mox';
const COPILOT_W = { min: 320, def: 420, max: 960 };
function copilotAvailable() {
  const app = APPS[COPILOT_APP];
  return !!(currentUser && userData && app && app.page
    && !(userData.hiddenApps || []).includes(COPILOT_APP)
    && (userData.settings.components || {}).copilotButton !== false);
}
function copilotOpen() { const pane = MH.$('copilot'); return !!pane && !pane.hidden; }
/* Docked = open beside the windows; below 760px wide the pane is a sheet. */
function copilotDocked() { return copilotOpen() && innerWidth >= 760; }
function copilotWidth() {
  const max = Math.max(COPILOT_W.min, Math.min(COPILOT_W.max, innerWidth - 240));
  const saved = Number(userData?.settings.copilotWidth);
  const want = Number.isFinite(saved) && saved > 0 ? saved : COPILOT_W.def;
  return Math.round(Math.min(max, Math.max(COPILOT_W.min, want)));
}
/* Size the pane and tell the desktop (via #desktop.copilot-open and
 * --copilot-w, see styles.css) how much room to make for it. The width is
 * set on the root so the toasts, a sibling of #desktop, can follow it too. */
function layoutCopilot() {
  const d = MH.$('desktop'), pane = MH.$('copilot'); if (!d || !pane) return;
  const open = copilotOpen(), w = copilotWidth();
  pane.style.width = w + 'px';
  document.documentElement.style.setProperty('--copilot-w', w + 'px');
  d.classList.toggle('copilot-open', open);
  const btn = MH.$('tray-copilot');
  if (btn) { btn.classList.toggle('on', open); btn.setAttribute('aria-expanded', String(open)); }
  MH.$('copilot-grip')?.setAttribute('aria-valuenow', String(w));
}
function openCopilot() {
  const pane = MH.$('copilot'); if (!pane || !copilotAvailable()) return false;
  const app = APPS[COPILOT_APP];
  MH.$('copilot-name').textContent = app.name;
  let frame = MH.$('copilot-frame');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'copilot-frame'; frame.className = 'copilot-frame';
    frame.title = app.name; frame.setAttribute('allow', 'clipboard-write');
    /* The page is same-origin, so Alt+C is listened for inside it as well:
     * the shortcut closes the pane while the caret is in Mox's composer. */
    frame.addEventListener('load', () => {
      try { frame.contentWindow.addEventListener('keydown', copilotKey); } catch { /* another origin */ }
    });
    frame.src = app.page;
    MH.$('copilot-body').appendChild(frame);
  }
  pane.hidden = false;
  MH.$('startmenu')?.setAttribute('hidden', ''); MH.$('menubtn')?.classList.remove('open');
  layoutCopilot(); DesktopIcons.render();
  try { frame.focus({ preventScroll: true }); } catch { /* the frame is not focusable yet */ }
  return true;
}
/* Hide the pane (the frame stays, so Mox keeps its state); unload also
 * drops the frame — "Open in a window", or Mox going away. */
function closeCopilot({ unload = false } = {}) {
  const pane = MH.$('copilot'); if (!pane) return;
  const hadFocus = pane.contains(document.activeElement);
  if (unload) MH.$('copilot-frame')?.remove();
  if (pane.hidden) return;
  pane.hidden = true;
  layoutCopilot(); DesktopIcons.render();
  /* Hand the keyboard back to the window in front. */
  if (hadFocus) {
    const w = wins.get(activeApp);
    if (w) focusWinBody(w.el, w.body); else document.activeElement?.blur?.();
  }
}
function toggleCopilot(force) {
  if (force ?? !copilotOpen()) return openCopilot();
  closeCopilot();
  return false;
}
/* Alt+C, the stand-in for Win+C. On a Mac, Option+C types "ç": a text field
 * keeps that keystroke. */
function copilotKey(e) {
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.code !== 'KeyC') return;
  const t = e.target, typing = !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''));
  if (typing && String(e.key).toLowerCase() !== 'c') return;
  if (locked || MH.$('desktop')?.hidden || !copilotAvailable()) return;
  e.preventDefault();
  if (!e.repeat) toggleCopilot();
}
document.addEventListener('keydown', copilotKey);
/* A narrower browser window narrows the pane too (copilotWidth() clamps). */
addEventListener('resize', () => { if (copilotOpen()) layoutCopilot(); });
/* The pane's buttons and resize edge, wired each time the desktop is drawn. */
function wireCopilot() {
  MH.$('tray-copilot').onclick = () => toggleCopilot();
  MH.$('copilot-close').onclick = () => closeCopilot();
  MH.$('copilot-reload').onclick = () => {
    const frame = MH.$('copilot-frame');
    if (frame && APPS[COPILOT_APP]) frame.src = APPS[COPILOT_APP].page;
  };
  MH.$('copilot-window').onclick = () => {
    closeCopilot({ unload: true });
    if (APPS[COPILOT_APP]) openApp(COPILOT_APP);
  };
  const grip = MH.$('copilot-grip'), pane = MH.$('copilot'), d = MH.$('desktop');
  const resized = () => { userData.settings.copilotWidth = copilotWidth(); layoutCopilot(); saveData(); };
  grip.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const right = pane.getBoundingClientRect().right || innerWidth;
    try { grip.setPointerCapture(e.pointerId); } catch { /* a synthetic event has no pointer to capture */ }
    d.classList.add('copilot-resizing'); // frames stop swallowing the drag (styles.css)
    const move = (ev) => { userData.settings.copilotWidth = right - ev.clientX; layoutCopilot(); };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      d.classList.remove('copilot-resizing');
      resized(); DesktopIcons.render();
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  });
  grip.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 80 : 20;
    if (e.key === 'ArrowLeft') userData.settings.copilotWidth = copilotWidth() + step;
    else if (e.key === 'ArrowRight') userData.settings.copilotWidth = copilotWidth() - step;
    else return;
    e.preventDefault();
    resized(); DesktopIcons.render();
  });
  layoutCopilot();
}

/* ---------------- auth screens ---------------- */
const COLORS = ['#2f2f2f', '#4a4a4a', '#5c5c5c', '#383838', '#666666', '#222222']; // avatar circles: dark greys, white initials

function authShell(title, sub, bodyHTML) {
  const a = MH.$('auth'); a.hidden = false;
  a.innerHTML = `<div class="auth-card">
    <div class="auth-head"><div class="auth-logo">${iconSvg('atom')}</div><div><h1>${title}</h1><p>${sub}</p></div></div>
    <div class="auth-body">${bodyHTML}</div></div>`;
}
function renderSetup(backToLogin) {
  document.title = 'Create your account — proton';
  authShell('Create your account', 'First launch setup · proton', `
    <p class="auth-note" style="margin-top:0">Welcome! This static website has <b>no server</b>, so your account is created and stored <b>only in this browser</b>. Refreshing the page signs you out, so you will be asked for your password again — just like signing out.</p>
    <form id="setup-form">
      <label>Display name<input id="su-name" required maxlength="40" placeholder="e.g. Alex Morgan" autocomplete="name"></label>
      <div class="auth-row">
        <label>Username<small>Letters, numbers, _ · 3–20 characters</small><input id="su-user" required pattern="[A-Za-z0-9_]{3,20}" placeholder="e.g. alex_m" autocomplete="username"></label>
        <label>Email <small>(optional, never sent anywhere)</small><input id="su-email" type="email" placeholder="you@example.com" autocomplete="email"></label>
      </div>
      <div class="auth-row">
        <label>Password<small>At least 6 characters</small><input id="su-pass" type="password" required minlength="6" autocomplete="new-password"></label>
        <label>Confirm password<small>Repeat it exactly</small><input id="su-pass2" type="password" required minlength="6" autocomplete="new-password"></label>
      </div>
      <div class="auth-err" id="su-err"></div>
      <button class="btn primary block" type="submit">Create account &amp; enter desktop</button>
    </form>
    ${backToLogin ? '<p class="auth-switch">Already have an account on this device? <a id="su-back">Sign in instead</a></p>' : ''}
    <p class="auth-note">${iconSvg('lock')} Your password is stored only as a salted SHA-256 hash. App data (notes, files, games…) is saved per-account in this browser. Clearing browser data deletes it — export a backup from Settings any time.</p>`);
  const avatar = ''; // no picker on sign-up — avatars are the account's initials, drawn by userInitials()
  if (backToLogin) MH.$('su-back').onclick = renderLogin;
  MH.$('setup-form').onsubmit = async (e) => {
    e.preventDefault();
    const err = MH.$('su-err');
    const username = MH.$('su-user').value.trim(), key = username.toLowerCase();
    const pass = MH.$('su-pass').value;
    if (pass !== MH.$('su-pass2').value) { err.textContent = 'The two passwords do not match.'; return; }
    const accounts = MH.accounts();
    if (accounts[key]) { err.textContent = `“${username}” is already taken on this device — pick another username.`; return; }
    const salt = MH.uid() + MH.uid();
    accounts[key] = {
      username, usernameLower: key, displayName: MH.$('su-name').value.trim(),
      email: MH.$('su-email').value.trim(), avatar, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      salt, hash: await MH.hashPassword(pass, salt), createdAt: Date.now(),
    };
    MH.saveAccounts(accounts);
    currentUser = accounts[key];
    localStorage.setItem(DESKTOP_PROFILE_KEY, key);
    userData = MH.defaultData(currentUser.displayName, currentUser.usernameLower || currentUser.username);
    MH.saveJSON(MH.userKey(key), userData);
    MH.$('auth').hidden = true;
    enterDesktop();
    MH.toast(`Account created — welcome, ${currentUser.displayName}!`);
  };
}
function renderLogin() {
  document.title = 'Sign in — proton';
  const accounts = Object.values(MH.accounts());
  authShell('Welcome back', 'Sign in to proton on this device', `
    <form id="login-form">
      <label>Username
        <select id="li-user">${accounts.map((a) => `<option value="${MH.esc(a.usernameLower)}">${MH.esc(a.username)} — ${MH.esc(a.displayName)}</option>`).join('')}</select>
      </label>
      <label>Password<input id="li-pass" type="password" required autocomplete="current-password" placeholder="Your password"></label>
      <div class="auth-err" id="li-err"></div>
      <button class="btn primary block" type="submit">Sign in</button>
    </form>
    <p class="auth-switch">New to this device? <a id="li-new">Create an account</a></p>
    <p class="auth-note">Refreshing the page signs you out and asks for your password again, just like choosing <b>Sign out</b>. Use <b>Lock</b> to hide the desktop without signing out during this visit.</p>`);
  MH.$('li-new').onclick = () => renderSetup(true);
  MH.$('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const key = MH.$('li-user').value, acc = MH.accounts()[key];
    if (!acc || !(await MH.verifyPassword(MH.$('li-pass').value, acc))) {
      MH.$('li-err').textContent = 'That password is not right for this account. Passwords are case-sensitive.';
      return;
    }
    currentUser = acc;
    localStorage.setItem(DESKTOP_PROFILE_KEY, key);
    userData = MH.loadJSON(MH.userKey(key), MH.defaultData(acc.displayName, acc.usernameLower || acc.username));
    enterDesktop();
  };
}
function renderLock() {
  document.title = 'Locked — proton';
  authShell('Desktop locked', 'Your work is exactly as you left it', `
    <div style="text-align:center"><div class="lock-avatar" style="background:${avatarBg(currentUser)}">${MH.esc(userInitials(currentUser))}</div>
    <b>${MH.esc(currentUser.displayName)}</b><div class="muted">@${MH.esc(currentUser.username)}</div></div>
    <form id="lock-form">
      <label>Password<input id="lk-pass" type="password" required autocomplete="current-password" autofocus></label>
      <div class="auth-err" id="lk-err"></div>
      <button class="btn primary block" type="submit">Unlock</button>
    </form>
    <p class="auth-switch"><a id="lk-out">Sign out instead</a></p>`);
  const a = MH.$('auth'); a.hidden = false;
  MH.$('lk-out').onclick = signOut;
  MH.$('lock-form').onsubmit = async (e) => {
    e.preventDefault();
    /* Unlocking asks for the same desktop password as the cover gate
     * (data/password.txt, checked by assets/boot.js). Older builds checked
     * the account's own password hash, so keep that as a fallback for any
     * context where the gate script is not present. */
    const candidate = MH.$('lk-pass').value;
    const ok = typeof verifySitePassword === 'function'
      ? await verifySitePassword(candidate)
      : await MH.verifyPassword(candidate, currentUser);
    if (!ok) { MH.$('lk-err').textContent = 'Incorrect password — try again.'; return; }
    locked = false; a.hidden = true; MH.$('desktop').hidden = false;
  };
}
/* Which local profile the desktop opens after cover entry. The gate
 * itself (cover search bar + Sign in, data/password.txt) lives in
 * assets/boot.js; this just chooses whose saved desktop to show: the
 * profile used last time when there is one, otherwise the earliest local
 * profile. On the very first sign-in — when this browser has no local
 * account yet — the Create your account page is shown instead, and
 * submitting it creates the profile and enters the desktop. Once an
 * account exists, boot.js lets Sign in straight through to here with no
 * password, so an existing account always lands on its desktop. */
const DESKTOP_PROFILE_KEY = 'proton2.desktopProfile.v1';
async function enterSiteDesktop() {
  MH.setSession('');
  const accounts = MH.accounts();
  let account = accounts[localStorage.getItem(DESKTOP_PROFILE_KEY) || ''];
  if (!account) {
    account = Object.values(accounts)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0];
  }
  if (!account) {
    renderSetup(false);
    return null;
  }
  const key = account.usernameLower || String(account.username || '').toLowerCase();
  localStorage.setItem(DESKTOP_PROFILE_KEY, key);
  currentUser = account;
  userData = MH.loadJSON(MH.userKey(key), MH.defaultData(account.displayName, key));
  MH.$('auth').hidden = true;
  enterDesktop();
  MH.toast(`Welcome, ${account.displayName}!`);
  return account;
}

function route() {
  // A fresh page load always starts signed out: refreshing returns to the
  // cover, where the desktop password (data/password.txt) is asked for
  // again only until an account exists on this device — from then on a
  // plain Sign in click is enough (see attemptCoverSignIn in boot.js).
  MH.setSession('');
  currentUser = null; userData = null; locked = false;
  const cover = MH.$('cover');
  if (cover) {
    cover.hidden = false;
    MH.$('auth').hidden = true;
    MH.$('desktop').hidden = true;
    const q = MH.$('cover-q');
    if (q) { q.value = ''; setTimeout(() => q.focus(), 0); }
    document.title = 'Math Helper — Math Practice';
    return;
  }
  /* No cover on the page (a bare test harness): fall back to the account
   * screens so the desktop still has a way in. */
  const accounts = MH.accounts();
  if (!Object.keys(accounts).length) { renderSetup(false); return; }
  renderLogin();
}

/* small shared builders for apps */
function bar(title, extra = '') {
  return `<div class="appbar"><h2>${MH.esc(title)}</h2>${extra}</div>`;
}
function confirmBox(msg) { return confirm(msg); }


/* App modules live in apps/<category>/<app-name>/app.html — see apps/README.md. */
