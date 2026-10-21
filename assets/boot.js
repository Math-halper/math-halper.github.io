/* proton boot — loaded last. Fetches the HTML app/website modules
 * (assets/html-loader.js), then waits behind the Math Helper cover page.
 *
 * The cover gives no indication that anything is unavailable: its practice
 * controls simply do nothing. The first time, the desktop opens only after
 * the password from data/password.txt is typed into the cover search bar
 * and Sign in is clicked, which leads to the Create your account page.
 * Once an account exists on this device, no password is needed any more:
 * just clicking Sign in reopens that account's desktop. Refreshing or
 * signing out returns to the cover either way.
 * The separate Continue to Math Helper button at the very bottom instead
 * locks the page on the full-screen looping video in assets/youare.mp4. */
'use strict';

let protonModulesReady = false;
let protonLoadError = null;
let protonEntryRequested = false;
let siteGatePassed = false;
let desktopPasswordPromise = null;
let idiotLockActive = false;
let idiotAudioGraph = null;
let idiotFullscreenTimers = [];

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
  /* A wrong password — like every other cover control — gets no visible
   * response at all. Only the correct password does anything. */
  if (!(await verifySitePassword(candidate))) return;
  passCoverGate();
}

function lockIdiotKeyboard() {
  try {
    /* Where the Keyboard Lock API is available (Chromium in full screen),
     * this captures Escape itself, so pressing it never leaves full screen
     * in the first place. Browsers still reserve a long-press Esc and
     * closing the tab. */
    const locked = navigator.keyboard && navigator.keyboard.lock &&
      navigator.keyboard.lock(['Escape']);
    if (locked && locked.catch) locked.catch(() => {});
  } catch (err) {}
}

function requestIdiotFullscreen() {
  const lock = MH.$('idiot-lock');
  if (!lock) return;
  if (document.fullscreenElement) { lockIdiotKeyboard(); return; }
  try {
    const result = lock.requestFullscreen && lock.requestFullscreen();
    if (result && result.then) result.then(lockIdiotKeyboard, () => {});
    else if (result && result.catch) result.catch(() => {});
  } catch (err) { /* fall back to the next key press or click */ }
}

function scheduleIdiotFullscreenRetries() {
  idiotFullscreenTimers.forEach((t) => clearTimeout(t));
  idiotFullscreenTimers = [0, 75, 250, 750].map((delay) => setTimeout(() => {
    if (idiotLockActive && !document.fullscreenElement) requestIdiotFullscreen();
  }, delay));
}

function trapIdiotEscape(e) {
  if (!idiotLockActive) return;
  const isEscape = e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
  e.preventDefault();
  if (isEscape) e.stopPropagation();
  requestIdiotFullscreen();
  scheduleIdiotFullscreenRetries();
}

function boostIdiotVideo(video) {
  try {
    if (idiotAudioGraph) {
      if (idiotAudioGraph.ctx.resume) idiotAudioGraph.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(video);
    const gain = ctx.createGain();
    gain.gain.value = 2.5; // deliberately very loud
    source.connect(gain);
    gain.connect(ctx.destination);
    idiotAudioGraph = { ctx, gain };
  } catch (err) { /* the video's own full-volume audio still plays */ }
}

function lockIdiotVideo() {
  const lock = MH.$('idiot-lock');
  const video = MH.$('idiot-video');
  if (!lock || !video) return;
  idiotLockActive = true;
  lock.hidden = false;
  lock.setAttribute('aria-hidden', 'false');
  video.loop = true;
  video.muted = false;
  video.volume = 1;
  try { video.currentTime = 0; } catch (err) {}
  boostIdiotVideo(video);
  try {
    const playing = video.play();
    if (playing && playing.catch) playing.catch(() => {});
  } catch (err) {}
  requestIdiotFullscreen();
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
  if (enter) enter.addEventListener('click', lockIdiotVideo);
  const lock = MH.$('idiot-lock');
  if (lock) lock.addEventListener('click', requestIdiotFullscreen);
  document.addEventListener('fullscreenchange', () => {
    if (!idiotLockActive) return;
    if (document.fullscreenElement) { lockIdiotKeyboard(); return; }
    /* Escape dropped us out of full screen (or Keyboard Lock was not
     * available): immediately start trying to go back in, and keep trying
     * on the next Escape press, key press or click. */
    scheduleIdiotFullscreenRetries();
  });
  document.addEventListener('keydown', trapIdiotEscape, true);
  document.addEventListener('keyup', trapIdiotEscape, true);
  document.addEventListener('pointerdown', () => {
    if (idiotLockActive && !document.fullscreenElement) requestIdiotFullscreen();
  }, true);
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
