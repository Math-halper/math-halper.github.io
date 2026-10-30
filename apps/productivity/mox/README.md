# Mox — the AI app (and the panel's AI button)

**Mox** is a private AI workspace by Math-halper: a small language model runs
inside the browser, so it answers without a server, an account or an API key,
and nothing typed into it leaves the device. proton ships it as the **Mox**
app (Productivity) and docks the same page beside the desktop when the
**AI button** in the panel tray is clicked — proton's take on the Copilot
button in Windows.

## What is in this folder

| Path | What it is |
| --- | --- |
| `app.html` | proton's wrapper: frames `website/index.html?nosw` in a window, with Reload and Open in new tab, and publishes the page as `APPS.mox.page` for the AI button |
| `website/` | Mox itself, copied **byte-for-byte** from [Math-halper/mox](https://github.com/Math-halper/mox) at commit `acd4ec7` (the browser files only) |
| `README.md` | this file |

`website/` holds Mox's page (`index.html`, `styles.css`), its modules
(`app.js`, `calculator.js`, `model-store.js`, `svg.js`, `workspace.js`), the
knowledge library (`knowledge/` — 55 Markdown documents and their
`index.json`), the bundled model (`models/smollm2-135m-instruct-q4_1.gguf`,
98,362,432 bytes, plus `models/manifest.json`), the inference engine
(`vendor/wllama/` — llama.cpp compiled to WebAssembly) and PDF.js
(`vendor/pdfjs/`, with its licence), plus Mox's own `README.md`, which carries
its credits and licences.

Left out on purpose, because they are not part of the page a browser runs:

- `run.py`, `start-mox.bat`, `start-mox.command` — local launchers for Mox on
  its own; proton is already a served site.
- `tests/`, `tools/`, `.github/` — Mox's own checks, its knowledge-index and
  model-fetch scripts and its Pages workflow.
- `_headers`, `.nojekyll`, `.gitignore` — host and repository settings (the
  `_headers` file sets cross-origin isolation headers on Netlify-style hosts;
  GitHub Pages ignores it).
- `sw.js` — Mox's offline service worker. Inside proton a Mox service worker
  would sit between proton and the page, and it cannot add the headers that
  the VLC app's cross-origin isolation shim (`/coi-serviceworker.js`) relies
  on, so a desktop that had VLC's engine enabled could no longer frame Mox.
  proton frames Mox with `?nosw` — Mox's own switch for not registering its
  worker — and, with the file absent, a direct visit simply runs without
  offline caching (Mox logs "Offline support unavailable" and carries on).

Nothing under `website/` is edited. To update Mox, copy the same files again
from the new commit of Math-halper/mox, then run
`python3 tools/gen-search-index.py` and `python3 tools/gen-fs-manifest.py`
from the repository root.

## How it behaves inside proton

- **The model loads on first open.** Mox starts reading its 94 MB model as
  soon as its page opens, so proton never opens it on its own: the window
  loads it when Mox is launched, and the AI button's pane loads it the first
  time the pane is shown. The browser's HTTP cache keeps the file after that.
- **Single-threaded unless isolated.** wllama uses one thread on a normal
  page and several when the page is cross-origin isolated (for example after
  VLC's isolation shim is enabled) — Mox picks this itself.
- **Chats stay in this browser.** Mox stores conversations, workspace files
  and settings in IndexedDB (`mox-private-workspace`). The window and the AI
  button's pane share them: a chat started in one is in the other's list.
- **Search-only mode** is Mox's fallback when the model cannot load (for
  example, a browser without WebAssembly): it still searches and cites the
  knowledge library.
- proton's own search index skips `website/` (see
  `tools/gen-search-index.py`) — Mox's library is Mox's corpus, not proton's.

## The AI button

The sparkle at the right end of the panel, after the clock — where Windows 11
puts its Copilot button — is proton's Copilot:

- Click it, or press **Alt+C**, to dock Mox along the right edge of the desktop
  above the panel. Maximised windows, the desktop icons and the date hint make
  room for it instead of hiding underneath. Press Alt+C again (it works while
  typing in Mox too) or click × to close it. Win+C cannot be used: the
  operating system keeps the Windows key for itself.
- Drag the pane's left edge (or focus it and use ← / →) to resize it; the width
  is saved with the account. On narrow screens the pane fills the desktop.
- **Open in a window** hands over to the Mox app; **Reload** restarts the page.
- Closing the pane only hides it: the conversation and the loaded model are
  still there when it is opened again during the visit.
- **Customize → Desktop parts → "AI button in the panel (Mox, Alt+C)"** hides
  it, and it disappears on its own if Mox is removed from the proton menu. If
  Mox is renamed in Customize, the pane and the button's tooltip use the new
  name.

## Credits and licences

Mox is © its author (Math-halper), from
[github.com/Math-halper/mox](https://github.com/Math-halper/mox). It bundles
[wllama](https://github.com/ngxson/wllama) (MIT) and
[llama.cpp](https://github.com/ggml-org/llama.cpp) (MIT),
[PDF.js](https://github.com/mozilla/pdf.js) (Apache-2.0, `website/vendor/pdfjs/LICENSE`)
and the [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
model by Hugging Face (Apache-2.0). See `website/README.md` and
[`CREDITS.md`](../../../CREDITS.md).
