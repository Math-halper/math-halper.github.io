/* proton boot — loaded last. Fetches the HTML app/website modules
 * (assets/html-loader.js), then waits behind the Math Helper cover page.
 *
 * The cover gives no indication that anything is unavailable: its practice
 * controls simply do nothing. The desktop opens only after the password
 * from data/password.txt is typed into the cover search bar and Sign in is
 * clicked. That password is checked here, before any desktop is shown;
 * refreshing or signing out returns to the cover and asks for it again. */
'use strict';

let protonModulesReady = false;
let protonLoadError = null;
let protonEntryRequested = false;
let siteGatePassed = false;
let siteGatePassword = '';
let desktopPasswordPromise = null;

/* The password file is deliberately plain text so it can be edited without
 * touching code: the first line that is not blank and does not start with
 * # is the password. Everything else in the file is instructions. */
function parseDesktopPassword(text) {
  const line = String(text).split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#'));
  if (!line) throw new Error('data/password.txt does not contain a password line.');
  return line;
}

function loadDesktopPassword() {
  if (!desktopPasswordPromise) {
    desktopPasswordPromise = fetch('data/password.txt', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`data/password.txt could not be loaded (${res.status}).`);
        return res.text();
      })
      .then(parseDesktopPassword);
  }
  return desktopPasswordPromise;
}

async function verifySitePassword(candidate) {
  try {
    return String(candidate) === await loadDesktopPassword();
  } catch (err) {
    return false;
  }
}
/* The lock screen (assets/core.js) unlocks with this same password. */
window.verifySitePassword = verifySitePassword;

function showSiteDesktop() {
  if (!siteGatePassed || !protonModulesReady) return;
  const cover = MH.$('cover');
  if (cover) cover.hidden = true;
  const auth = MH.$('auth');
  if (auth) auth.hidden = true;
  const entered = siteGatePassword;
  siteGatePassword = '';
  enterSiteDesktop(entered);
}

async function attemptCoverSignIn() {
  const input = MH.$('cover-q');
  const candidate = input ? input.value : '';
  if (!candidate) {
    if (input) input.focus();
    return;
  }
  /* A wrong password — like every other cover control — gets no visible
   * response at all. Only the correct password does anything. */
  if (!(await verifySitePassword(candidate))) return;
  siteGatePassed = true;
  siteGatePassword = candidate;
  if (!protonModulesReady) {
    protonEntryRequested = true;
    return;
  }
  showSiteDesktop();
}

function initCover() {
  const cover = MH.$('cover');
  if (!cover) return;
  /* The .cover-decoy controls intentionally get no handler: they look like
   * ordinary Math Helper controls, but clicking them does nothing. */
  const search = MH.$('cover-search');
  if (search) search.addEventListener('submit', (e) => { e.preventDefault(); attemptCoverSignIn(); });
  const signin = MH.$('cover-signin');
  if (signin) signin.addEventListener('click', attemptCoverSignIn);
  const enter = MH.$('cover-enter');
  if (enter) enter.addEventListener('click', attemptCoverSignIn);
}
initCover();

async function protonBoot() {
  const bootEl = MH.$('boot');
  try {
    await loadHtmlModules();
  } catch (err) {
    console.error(err);
    protonLoadError = err;
    if (MH.$('cover')) {
      // Leave the cover exactly as it is: no error message, no indication
      // that anything failed to load behind it.
      if (bootEl) bootEl.remove();
    } else {
      const sub = document.querySelector('.boot-sub');
      if (sub) {
        sub.innerHTML = 'Could not load the app files.<br>proton must be served over HTTP — ' +
          'try <span class="kbd">python3 -m http.server</span> or GitHub Pages, not a file:// tab.<br>' +
          '<span style="opacity:.75">' + MH.esc(err.message) + '</span>';
      }
    }
    return; // leave whichever front page is visible up with the explanation
  }
  protonModulesReady = true;
  // Stay on the cover until the password gate is passed — on a fresh visit
  // and on a refresh alike. Remove the splash behind it so it cannot flash
  // when the cover is dismissed.
  if (bootEl) bootEl.remove();
  if (protonEntryRequested) showSiteDesktop();
}
/* With many module files the DOM may already be parsed by the time this
 * file runs, so handle both cases. */
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', protonBoot);
else protonBoot();
