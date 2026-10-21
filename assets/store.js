/* proton — storage + accounts (browser-only, localStorage).
 *
 * No server exists on a static site, so accounts live on THIS device only.
 * Desktop entry is gated by the shared password in data/password.txt
 * (checked by assets/boot.js); the per-account salt + SHA-256 hash kept
 * here (crypto.subtle, with a salted FNV-1a fallback where subtle crypto is
 * unavailable) is only the local profile record created from it.
 *
 * Data layout:
 *   mhOS.accounts.v1       { [usernameLower]: account }
 *   mhOS.session.v1        legacy key from persistent sign-in; now cleared
 *                          (sign-in lasts only until the page is refreshed)
 *   mhOS.user.<name>.v1    that account's whole desktop state
 */
'use strict';

const MH = {
  ACCOUNTS_KEY: 'mhOS.accounts.v1',
  SESSION_KEY: 'mhOS.session.v1',
  userKey: (u) => `mhOS.user.${u}.v1`,

  $: (id) => document.getElementById(id),
  esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  todayISO: () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
  fmtBytes: (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`,

  clone: (v) => JSON.parse(JSON.stringify(v)),
  loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : MH.clone(fallback); }
    catch { return MH.clone(fallback); }
  },
  saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { MH.toast('Storage is full — some changes could not be saved.'); console.warn(e); return false; }
  },

  accounts() { return MH.loadJSON(MH.ACCOUNTS_KEY, {}); },
  saveAccounts(a) { MH.saveJSON(MH.ACCOUNTS_KEY, a); },
  /* Sign-in is deliberately not persisted: refreshing the page must ask
   * for the password again, exactly like signing out. Any legacy stored
   * session key is cleared so older visits cannot auto-sign-in either. */
  session() { return ''; },
  setSession() { localStorage.removeItem(MH.SESSION_KEY); },

  fnv(str) { // fallback hash (not cryptographic — only used off secure contexts)
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'fnv1a:' + h.toString(16);
  },
  async hashPassword(password, salt) {
    const msg = `${salt}:${password}`;
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
      return 'sha256:' + [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return MH.fnv(msg + ':' + msg.length);
  },
  async verifyPassword(password, account) {
    return (await MH.hashPassword(password, account.salt)) === account.hash;
  },

  /* Desktop entries are links, not copies of apps or files. Return fresh
   * objects so accounts can rearrange/remove them independently. A new account
   * starts with four shortcuts: Settings, the Browser, Files, and a link to
   * that account's own home folder in the virtual file system. */
  defaultDesktopIcons() {
    const icons = [
      { id: 'desktop-settings', kind: 'app', target: 'settings', col: 0, row: 0 },
      { id: 'desktop-browser', kind: 'app', target: 'browser', col: 0, row: 1 },
      { id: 'desktop-files', kind: 'app', target: 'files', col: 0, row: 2 },
    ];
    /* The home-folder link needs FS.home(), and assets/fs.js loads after this
     * file — so ask carefully and simply leave the link out if FS is not
     * ready yet (the desktop then starts with its three app shortcuts). */
    let home = '';
    try { home = typeof FS !== 'undefined' && FS.home ? FS.home() : ''; } catch { home = ''; }
    if (home) icons.push({ id: 'desktop-home', kind: 'path', target: home, col: 0, row: 3 });
    return icons;
  },

  /* ---- seeded state for a brand-new account ---- */
  defaultData(displayName, username) {
    const today = MH.todayISO();
    /* The account's file system home — mirrored by FS.home() in assets/fs.js. */
    const home = '/home/' + String(username || 'user').toLowerCase();
    return {
      version: 1,
      settings: { wallpaper: 'mint', accent: '#ffffff', pinned: ['settings', 'appcenter', 'browser'] },
      desktopIcons: MH.defaultDesktopIcons(),
      /* The Browser's own chrome, saved with the account and carried by
       * Settings backups: starred pages and what it visited recently. */
      bookmarks: [],
      history: [],
      notes: [{
        id: MH.uid(), title: 'Welcome to proton',
        html: `<p>This desktop is a <b>static clone of Mixt</b> (from <i>proton-arcade/mlp</i>), rebranded and rebuilt to run with <b>no server at all</b>.</p><h2><span style="font-size:19px">Things to try</span></h2><ul><li><b>Files</b> browses your own folders and proton's read-only system tree; text, pictures, audio, video and PDFs open in their own apps — and every open/save asks whether to use <b>your Files</b> (this computer) or the <b>proton file system</b></li><li>The <b>Calculator</b> does quick maths, <b>Web Retro</b> plays your own retro ROMs, and the three <b>Celeste</b> apps (Classic, Classic 2, Community) play the actual game files — vendored from Math-halper/Celeste</li><li>Everything you type here is <b>saved on this device</b>, under your account</li><li>Drag windows, pin apps to the panel, change the wallpaper in Settings</li></ul><p>Have fun!</p>`,
        updated: Date.now(),
      }],
      events: [{ id: MH.uid(), date: today, time: '09:00', title: 'First day on proton', notes: 'Created my account today.' }],
      contacts: [
        { id: MH.uid(), name: 'Nova (Helper Bot)', email: 'Nova@localhost', phone: '', notes: 'Built-in helper. It has no app of its own any more.' },
        { id: MH.uid(), name: displayName, email: '', phone: '', notes: 'Me' },
      ],
      /* Real hierarchical file system (assets/fs.js). dirs are the folders
       * under the account's home; files carry full paths. Everything outside
       * /home/<user> is the read-only system tree. */
      dirs: [home + '/Desktop', home + '/Documents', home + '/Pictures', home + '/Downloads'],
      files: [
        { path: home + '/Documents/Welcome.txt', content: 'Welcome to proton!\n\nYour account has a real file system, rooted at / :\n- /            every file of the proton system (read-only)\n- /home/<you>  yours: Desktop, Documents, Downloads, Pictures\n\nOpen it from the Files app on your desktop: create folders, edit text\nfiles in the Text Editor, import pictures, audio, video and PDFs from\nyour computer, and download anything back out (folders as a ZIP).\nHTML files open in the Browser, and the Celeste apps play the\nactual game files — vendored from Math-halper/Celeste, one app per game.\n\nEverything lives in this browser only. Settings exports your whole\naccount, files included, as a backup.', updated: Date.now() },
        { path: home + '/Documents/Ideas.txt', content: 'Ideas:\n- Try a new wallpaper in Settings\n- Rename an app in Customize\n- ', updated: Date.now() },
        { path: home + '/README.txt', content: 'proton — static clone of Mixt (proton-arcade/mlp @ arena/170861f7-mlp), rebranded.\nLicensed AGPL-3.0-only. See CREDITS.md in the project repo.', updated: Date.now() },
      ],
      sheets: { 'Budget': { 'B1': 'Item', 'C1': 'Cost', 'B2': 'Books', 'C2': '25', 'B3': 'Snacks', 'C3': '8', 'B4': 'Total', 'C4': '=SUM(C2:C3)' } },
      activeSheet: 'Budget',
      slides: [
        { id: MH.uid(), title: 'My First Presentation', body: 'Made on proton — saved on this device.' },
        { id: MH.uid(), title: 'Slide Two', body: 'Use the arrow keys in Present mode.\nEdit any slide on the left.' },
      ],
      boards: [{ id: MH.uid(), name: 'Scribbles', data: '' }],
      games: {},
      counters: { windowsOpened: 0 },
      /* Apps & websites saved on this account. Adding websites and
       * web-address apps is disabled now, but anything already saved stays
       * openable and removable (Mixt-style install/remove, grandfathered).
       * customApps: [{id,name,icon,desc,url}] — each becomes a real proton app.
       * websites:   [{id,name,icon,url}]   — saved sites, opened in Browser.
       * hiddenApps: [appId]                — built-ins the user "removed"
       *                                      (hidden from menu, restorable). */
      customApps: [],
      websites: [],
      hiddenApps: [],

    };
  },

  toast(msg) {
    const box = MH.$('toasts'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3400);
  },

  download(filename, text, type = 'text/plain') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },

  downloadBlob(filename, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },

  /* ================= file-source chooser (both file systems) ================
   * Every open/save in proton asks which file system to use: the device's own
   * ("this computer" / your Files) or proton's virtual one ("proton Files").
   * askFileSource() shows the question, devicePick()/downloadBlob() are the
   * device side, vfsPick() browses the proton file system. Apps wire the
   * answer into their own flows. */
  askFileSource(kind) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'file-source-backdrop';
      wrap.innerHTML = `<div class="card file-source-box" role="dialog" aria-modal="true"
        aria-label="${kind === 'save' ? 'Save to which file system' : 'Open from which file system'}">
        <h3 style="margin:0 0 6px">${kind === 'save' ? 'Save to where?' : 'Open from where?'}</h3>
        <p class="muted" style="margin:0 0 12px">${kind === 'save'
          ? 'Save this to <b>your Files</b> (this computer) or to the <b>proton file system</b> (the Files app, in this browser).'
          : 'Open a file from <b>your Files</b> (this computer) or from the <b>proton file system</b> (the Files app, in this browser).'}</p>
        <div class="fm-ask-row">
          <button type="button" class="btn" data-fs="device">${kind === 'save' ? 'To your Files (this computer)' : 'From your Files (this computer)'}</button>
          <button type="button" class="btn" data-fs="vfs">${kind === 'save' ? 'To the proton file system' : 'From the proton file system'}</button>
          <button type="button" class="btn" data-fs="cancel">Cancel</button>
        </div>
      </div>`;
      const done = (v) => { wrap.remove(); resolve(v); };
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        done(b.dataset.fs === 'cancel' ? null : b.dataset.fs);
      });
      document.body.appendChild(wrap);
      wrap.querySelector('button').focus();
    });
  },

  /* The browser's own file picker. */
  devicePick(accept = '') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;
      input.onchange = () => resolve(input.files?.[0] || null);
      input.click();
    });
  },

  /* Browse the proton file system in a modal. Open mode resolves the picked
   * file path; save mode has a name field and resolves the full target path
   * (the folder shown is where the file goes); folder mode resolves the shown
   * folder. `accept` filters files by extension ('.txt,.md'). */
  vfsPick({ title = 'proton file system', accept = '', name = '', save = false, folder = false } = {}) {
    return new Promise((resolve) => {
      const exts = String(accept || '').split(',').filter(Boolean);
      const wantName = save && !folder;
      let dir = FS.home();
      let picked = null;
      const wrap = document.createElement('div');
      wrap.className = 'file-source-backdrop';
      wrap.innerHTML = `<div class="card file-source-box" role="dialog" aria-modal="true" aria-label="${MH.esc(title)}">
        <h3 style="margin:0 0 6px">${MH.esc(title)}</h3>
        <p class="muted" style="margin:0 0 8px" data-vfs-path></p>
        ${wantName ? `<div class="fm-ask-row" style="margin:0 0 8px"><input type="text" data-vfs-name
          value="${MH.esc(name)}" aria-label="File name" placeholder="file name" autocomplete="off" spellcheck="false"></div>` : ''}
        <div class="vfs-pick-list" data-vfs-list></div>
        <div class="fm-ask-row" style="margin-top:10px">
          ${save ? `<button type="button" class="btn primary" data-vfs-ok>${folder ? 'Copy here' : 'Save here'}</button>` : ''}
          <button type="button" class="btn" data-vfs-cancel>Cancel</button>
        </div>
      </div>`;
      const done = (v) => { wrap.remove(); resolve(v); };
      const list = wrap.querySelector('[data-vfs-list]');
      const matches = (n) => !exts.length || exts.some((x) => n.toLowerCase().endsWith(x));
      const draw = () => {
        wrap.querySelector('[data-vfs-path]').textContent = dir;
        let entries = [];
        try { entries = FS.list(dir); } catch { entries = []; }
        const rows = [];
        if (dir !== FS.home()) rows.push('<button type="button" class="btn sm" data-up="1">… Up</button>');
        for (const e of entries) {
          if (e.type === 'dir') rows.push(`<button type="button" class="btn sm" data-dir="${MH.esc(e.path)}">▸ ${MH.esc(e.name)}</button>`);
          else if (matches(e.name)) {
            const on = picked === e.path ? ' primary' : '';
            rows.push(`<button type="button" class="btn sm${on}" data-file="${MH.esc(e.path)}">${MH.esc(e.name)}</button>`);
          }
        }
        list.innerHTML = rows.join('') || '<p class="muted" style="margin:0">Nothing here.</p>';
      };
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-vfs-cancel')) return done(null);
        if (b.hasAttribute('data-vfs-ok')) {
          if (folder) return done(dir);
          const n = wrap.querySelector('[data-vfs-name]').value.trim();
          if (!n) { wrap.querySelector('[data-vfs-name]').focus(); return; }
          return done(FS.join(dir, n));
        }
        if (b.dataset.up) {
          dir = FS.dirname(dir);
          if (dir === '/home' || !dir.startsWith(FS.home())) dir = FS.home();
          picked = null; draw();
        } else if (b.dataset.dir) {
          dir = b.dataset.dir; picked = null; draw();
        } else if (b.dataset.file) {
          if (wantName) { wrap.querySelector('[data-vfs-name]').value = FS.basename(b.dataset.file); picked = b.dataset.file; draw(); }
          else if (!folder && !save) done(b.dataset.file);
        }
      });
      if (wantName) {
        wrap.querySelector('[data-vfs-name]').addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); wrap.querySelector('[data-vfs-ok]').click(); }
        });
      }
      document.body.appendChild(wrap);
      draw();
    });
  },
};

/* live session state shared by core.js / apps.js */
let currentUser = null;   // account object
let userData = null;      // per-account data (MH.defaultData shape)
let saveTimer = null;
function saveData() {
  if (!currentUser) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => MH.saveJSON(MH.userKey(currentUser.usernameLower), userData), 150);
}
function saveDataNow() {
  if (!currentUser) return false;
  clearTimeout(saveTimer);
  return MH.saveJSON(MH.userKey(currentUser.usernameLower), userData);
}
