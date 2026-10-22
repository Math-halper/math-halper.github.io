/* proton boot — loaded last. Fetches the HTML app/website modules
 * (assets/html-loader.js), then waits behind the Math Helper cover page.
 *
 * The cover itself is a working maths-practice app (assets/math-helper.js):
 * search, grades, practice, diagnostics, recommendations, awards,
 * analytics, membership and the waitlist all function locally. Joining the
 * waitlist requires the site password from data/password.txt, verified
 * through window.verifySitePassword below — a local account alone never
 * waitlists anyone. The header Sign in button remains the separate desktop
 * gate: the first time, the desktop opens only after the password is typed
 * into the cover search bar and Sign in is clicked, which leads to the
 * Create your account page. Once an account exists on this device, no
 * password is needed any more: just clicking Sign in reopens that account's
 * desktop. Refreshing or signing out returns to the cover either way. */
'use strict';

let protonModulesReady = false;
let protonLoadError = null;
let protonEntryRequested = false;
let siteGatePassed = false;
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
/* The lock screen (assets/core.js) and the Math Helper waitlist
 * (assets/math-helper.js) verify with this same password. */
window.verifySitePassword = verifySitePassword;

function showSiteDesktop() {
  if (!siteGatePassed || !protonModulesReady) return;
  const cover = MH.$('cover');
  if (cover) cover.hidden = true;
  const auth = MH.$('auth');
  if (auth) auth.hidden = true;
  /* With no local account yet, enterSiteDesktop shows the Create your
   * account page instead of the desktop; renderSetup un-hides #auth. */
  enterSiteDesktop();
}

/* Has an account already been created on this device? Once one has, the
 * password gate is done with: pressing Sign in is enough to reopen the
 * desktop, whatever (if anything) is typed in the search bar. */
function hasLocalAccount() {
  try {
    return Object.keys(MH.accounts()).length > 0;
  } catch (err) {
    return false;
  }
}

function passCoverGate() {
  siteGatePassed = true;
  if (!protonModulesReady) {
    protonEntryRequested = true;
    return;
  }
  showSiteDesktop();
}

async function attemptCoverSignIn() {
  const input = MH.$('cover-q');
  const candidate = input ? input.value : '';
  /* With an account already on this device, just pressing Sign in is
   * enough — no password needs to be entered again. */
  if (hasLocalAccount()) { passCoverGate(); return; }
  if (!candidate) {
    if (input) input.focus();
    return;
  }
  /* A wrong password gets no visible response at all. Only Sign in with
   * the correct password opens the desktop gate. */
  if (!(await verifySitePassword(candidate))) return;
  passCoverGate();
}

function initCover() {
  const cover = MH.$('cover');
  if (!cover) return;
  /* Ordinary Math Helper controls — including the search form and the
   * password-checked waitlist — are wired by assets/math-helper.js. This
   * file only owns the desktop gate: the header Sign in button. */
  const signin = MH.$('cover-signin');
  if (signin) signin.addEventListener('click', attemptCoverSignIn);
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
  // Stay on the cover until entry is allowed — the password gate the first
  // time, or a plain Sign in click once an account exists on this device.
  // Remove the splash behind it so it cannot flash when the cover is
  // dismissed.
  if (bootEl) bootEl.remove();
  if (protonEntryRequested) showSiteDesktop();
}
/* With many module files the DOM may already be parsed by the time this
 * file runs, so handle both cases. */
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', protonBoot);
else protonBoot();
