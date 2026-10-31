# tools/mox-knowledge — what Mox knows about this website

These files are the sources of the "proton desktop" topic in Mox's knowledge
library. Mox is the desktop's AI, and this topic is how it knows every part
of the site. `python3 tools/gen-mox-knowledge.py` turns them into
`apps/productivity/mox/website/knowledge/proton/`, the pages Mox fetches,
searches and cites, and rebuilds Mox's `knowledge/index.json`. Never edit the
generated pages by hand. Edit these files and re-run the generator, before
`tools/gen-search-index.py` and `tools/gen-fs-manifest.py`.

- `guides/*.md`: one hand-written guide per part of the site (the cover page,
  signing in, the desktop, the panel, windows, the AI button, files, the
  look, backups, keyboard shortcuts, games, troubleshooting, credits and how
  proton is built). Each is copied to `knowledge/proton/<name>.md`.
- `apps.md`: one `## <app id>` section per app and game in
  `data/applications.js`, saying what it does and how to use it. The
  generator puts each section under a header of catalog facts (name, menu
  section, description, credit line) as `knowledge/proton/apps/<id>.md`. It
  stops if an app has no section or if a section names an app that is gone.

The generator also writes these pages from the site itself, so they cannot
go stale:

- the lists of every app and every game;
- Web Retro's bundled ROM library;
- the Math Helper skills.

## Writing for Mox

Mox splits each page into passages of about 800 characters. For each
question it picks the passages that share the most distinctive words with
it. While the small bundled model runs, Mox answers a question about the site
by quoting the paragraph that covers it. So:

- Give each subject its own `##` section, and open each paragraph by naming
  its subject ("To rename an app, ...", "Slope is ..."). A paragraph has to
  make sense on its own.
- Use the words people ask with. Use American spellings in prose, and keep
  proton's own labels as they appear on screen (Settings > Accent colour).
  Add the other word where they differ, as in "log in (Sign in)" and
  "Pokémon (Pokemon)".
- Do not put "website" or "proton" in every paragraph. Mox's retriever
  counts how many passages use a word, so overusing one makes the guides
  that are really about it harder to find.
- End a paragraph with a colon when the list that follows is the answer.
- Use placeholders instead of numbers and names that can change:
  - `{{app_count}}`, `{{game_count}}`, `{{other_count}}` and `{{rom_count}}`
    for counts;
  - `{{sections}}` for every menu section with its apps;
  - `{{names: id, id}}` for app names, which also checks that each app still
    exists.
- Never write the desktop password. The generator refuses to, because Mox
  opens at its own address without a sign-in.

The tests in `tests/system-desktop.test.cjs` run Mox's own retriever and
site-answer code over the library. They fail if a site question stops
finding its page.
