/* proton — VLC in a browser tab of its own.
 *
 * The VLC app (apps/media/media/app.html) offers Media → Open in a new
 * browser tab, a New tab button and Alt+Enter. All three open this page,
 * which boots that very app module into the whole tab: one player, one
 * keyboard-shortcut set, two places to run it. Nothing is duplicated — the
 * markup, the menus, the libvlc wiring and every hotkey in Help → Keyboard
 * shortcuts are the desktop app's own code.
 *
 * Query string (built by the app's tabUrl()):
 *   kind    'vfs' (a proton file system path) or 'url' (a network address)
 *   src     that path or address
 *   name    the file name, for the tab's title
 *   user    the account whose home folder holds the file (lower-case)
 *   account the account's display name (fallback for `user`)
 *   t       position in seconds to resume at
 *   rate    playback speed to continue with
 *
 * The tab is same-origin and same-browser, so it opens the same account's
 * storage read-only; there is no password prompt and nothing is written.
 * Media picked from the computer can never arrive here (a File object only
 * exists in the window that picked it) — the app explains that instead.
 *
 * libvlc needs a cross-origin isolated page. If this tab is not isolated yet
 * it registers root coi-serviceworker.js itself and reloads once; the same
 * media and position are in the URL, so it comes back playing.
 */
'use strict';

(function () {
  const params = new URLSearchParams(window.location.search);
  const value = (key) => String(params.get(key) || '').trim();
  const kind = value('kind') === 'url' ? 'url' : 'vfs';
  const src = value('src');
  const name = value('name') || (src ? src.split('/').pop() : '');
  const startAt = Number(value('t')) || 0;
  const rate = Number(value('rate')) || 0;

  const target = document.getElementById('vlc-tab-body');
  const appPage = new URL('apps/media/media/app.html', document.baseURI).href;

  function fail(title, message) {
    target.innerHTML = `<div class="vlc-tab-note"><h1>${MH.esc(title)}</h1><p>${MH.esc(message)}</p>
      <p>Open VLC from the proton menu — <a href="index.html">proton</a> — and use
      Media → Open in a new browser tab there.</p></div>`;
  }

  /* ---- the account whose files this tab reads --------------------------
   * VLC opened here is playing a file from a proton home folder, which lives
   * in this browser's storage under proton2.*. Read it, never write it. */
  const wanted = (value('user') || value('account')).toLowerCase();
  try {
    const accounts = MH.accounts();
    const account = wanted ? accounts[wanted] : null;
    if (account) {
      /* currentUser/userData are the globals assets/store.js and assets/fs.js
       * share with the desktop (core.js sets them on sign-in). */
      currentUser = account;
      const lower = account.usernameLower || wanted;
      userData = MH.loadJSON(MH.userKey(lower), null) || MH.defaultData(account.displayName || account.username || lower, lower);
    }
  } catch (err) {
    console.warn('VLC tab: could not read the account; proton files may not be listed.', err);
  }

  /* ---- the three globals the app module expects from assets/core.js ---- */
  let app = null;
  window.registerApp = (def) => { app = def; };
  window.bar = (title, extra = '') => `<div class="appbar">${iconSvg('film')}<h2>${MH.esc(title)}</h2>${extra}</div>`;
  /* VLC's Media → Show in Files belongs to the desktop; there is no Files app
   * in a bare tab, so say where it is instead of doing nothing. */
  window.openApp = () => {
    MH.toast('Files is a proton desktop app — open proton to see this file there.');
  };

  function executeModule(text) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const block = doc.querySelector('script[data-proton-app]');
    if (!block) throw new Error('app.html has no <script data-proton-app> block');
    const el = document.createElement('script');
    el.textContent = block.textContent;
    el.dataset.protonFrom = 'apps/media/media/app.html';
    document.body.appendChild(el);
    el.remove();
  }

  function render() {
    if (!app || typeof app.render !== 'function') throw new Error('the VLC module did not register itself');
    app.render(target, {
      tab: true,
      path: kind === 'vfs' ? src : '',
      url: kind === 'url' ? src : '',
      startAt,
      rate,
      close: () => window.close(),
    });
    if (name) document.title = `${name} — VLC`;
  }

  /* One reload turns this tab into a cross-origin isolated page, which is what
   * libvlc's WebAssembly threads need on hosts that cannot send COOP/COEP
   * headers (GitHub Pages). The shim is the same root file the desktop app
   * asks for; it reloads at most once and remembers that it did. */
  function enableIsolation() {
    if (window.crossOriginIsolated || !window.isSecureContext || !('serviceWorker' in navigator)) return;
    const script = document.createElement('script');
    script.src = new URL('coi-serviceworker.js', document.baseURI).href;
    script.onerror = () => console.warn('VLC tab: coi-serviceworker.js could not be loaded; use Tools → Enable VLC engine.');
    document.head.appendChild(script);
  }

  function start() {
    fetch(appPage, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`${appPage} returned HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        executeModule(text);
        render();
        enableIsolation();
      })
      .catch((err) => {
        console.error(err);
        fail('VLC could not start in this tab', err.message || String(err));
      });
  }

  /* With no src (the page opened by hand) the app's own start screen is still
   * the right thing to show, so boot the module either way. */
  start();
})();
