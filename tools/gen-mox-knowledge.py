#!/usr/bin/env python3
"""Generate proton's knowledge pack for Mox, the desktop's AI.

Mox (apps/productivity/mox/website/) answers from a knowledge library. Every
Markdown file listed in its knowledge/index.json is fetched by the page,
split into passages of about 800 characters and scored against each
question. The best passages go into the model's prompt as numbered sources,
which the answer cites. Mox's own library covers general subjects, so on its
own the AI knew nothing about the website it lives in.

This script gives Mox context about every part of this website. It writes a
topic of its own into that library, knowledge/proton/ (shown in Mox as "proton
desktop"), and rebuilds knowledge/index.json so Mox loads it.

Sources (edit these, never the output):

  tools/mox-knowledge/guides/*.md   hand-written guides to the site, copied
                                    as they are
  tools/mox-knowledge/apps.md       hand-written notes for every app and game,
                                    one "## <app id>" section each
  data/applications.js              the app catalog: names, menu sections and
                                    descriptions for the per-app pages, and
                                    the lists of every app and every game
  apps/**/app.html                  each vendored app's credit line
  apps/tools/web-retro/app.html     Web Retro's bundled ROM library
  apps/games/celeste-hub/app.html   the games inside the Celeste Hub
  assets/math-helper.js             the cover page's grades and skills

Output (generated, do not edit by hand):

  apps/productivity/mox/website/knowledge/proton/   the pack, which this
                                                    script owns outright:
                                                    files it no longer
                                                    writes are deleted
  apps/productivity/mox/website/knowledge/index.json

Mox's own documents are never touched; the index keeps listing them, worked
out from the files the same way Mox's tools/build_knowledge_index.py does.
The index's "generated" value is Mox's own timestamp plus a hash of the pack.
Mox caches the library in the browser under that value, so a changed pack
reaches visitors who have opened Mox before.

The site password is never written into the pack: the generator refuses to
write it (see check_secret), because Mox can be opened at its own address
without signing in.

Run from anywhere (paths are resolved from this script's location):

    python3 tools/gen-mox-knowledge.py           # write the pack
    python3 tools/gen-mox-knowledge.py --check   # report drift, write nothing

Run it whenever the catalog, an app or a guide changes, before the other two
generators: tools/gen-search-index.py next, tools/gen-fs-manifest.py last.
Output is deterministic, so re-running writes the same bytes, and the tests
check the pack against the catalog and the index against the files.
"""

import ast
import hashlib
import html
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'tools' / 'mox-knowledge'
KNOWLEDGE = ROOT / 'apps' / 'productivity' / 'mox' / 'website' / 'knowledge'
INDEX = KNOWLEDGE / 'index.json'
PACK = KNOWLEDGE / 'proton'
CATALOG = ROOT / 'data' / 'applications.js'

# The pack's topic in Mox: its chip in the sidebar, its prefix on every source
# ("proton desktop > Paint"), and its entry in Browse the library. It goes
# first because inside proton it is the topic people ask about most. Mox's
# retriever counts the topic name as part of every passage's title, so it
# avoids words such as "website" that general questions also use: "how do I
# build a website" must still find Mox's web development pages.
CATEGORY = {
    'id': 'proton',
    'name': 'proton desktop',
    'description': 'proton, the desktop on this website: every app and game, '
                   'the Math Helper cover page, and how everything works.',
}

# Mirrors Mox's tools/build_knowledge_index.py, so Mox's own documents are
# listed exactly as upstream lists them.
SUPPORTED = {'.md', '.markdown', '.txt', '.csv', '.json', '.log', '.yaml', '.yml',
             '.html', '.htm', '.xml'}
EXCLUDED_NAMES = {'README.md', 'index.json'}

# Menu sections in their menu order (CATS in assets/core.js).
SECTIONS = ['System', 'Productivity', 'Media', 'Tools', 'Games']


class PackError(Exception):
    """A source is missing or inconsistent; the message says which."""


def read(path):
    return path.read_text(encoding='utf-8')


# ---------------------------------------------------------------- sources

def load_catalog():
    """The enabled [application] blocks of data/applications.js, in order."""
    text = read(CATALOG)
    match = re.search(r'PROTON_APPLICATIONS_TEXT\s*=\s*`(.*?)`', text, re.S)
    if not match:
        raise PackError('data/applications.js: no PROTON_APPLICATIONS_TEXT block')
    apps = []
    for block in re.split(r'^\[application\]\s*$', match.group(1), flags=re.M)[1:]:
        entry = {}
        for line in block.splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                key, value = line.split('=', 1)
                entry[key.strip()] = value.strip()
        if not entry.get('id') or entry.get('enabled', 'true').lower() == 'false':
            continue
        entry['preinstalled'] = entry.get('preinstalled', 'true').lower() != 'false'
        apps.append(entry)
    return apps


def load_notes():
    """tools/mox-knowledge/apps.md split into {app id: notes}."""
    path = SOURCES / 'apps.md'
    notes, current, lines = {}, None, []
    for line in read(path).splitlines():
        heading = re.match(r'^##\s+([a-z0-9-]+)\s*$', line)
        if heading:
            if current:
                notes[current] = '\n'.join(lines).strip()
            current, lines = heading.group(1), []
        elif current:
            lines.append(line)
    if current:
        notes[current] = '\n'.join(lines).strip()
    return notes


JS_TOKEN = re.compile(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|\[|\]")


def js_array(text, name):
    """The rows of `const NAME = [ [...], [...] ];` as lists of strings.
    Brackets are matched outside string literals only, so a title such as
    "Super Mario World (U) [!]" stays one string."""
    start = re.search(r'const %s = \[' % re.escape(name), text)
    if not start:
        raise PackError(f'could not find the {name} list')
    rows, row, depth = [], None, 1
    for token in JS_TOKEN.finditer(text, start.end()):
        value = token.group(0)
        if value == '[':
            depth += 1
            if depth == 2:
                row = []
        elif value == ']':
            depth -= 1
            if depth == 1 and row is not None:
                rows.append(row)
                row = None
            elif depth == 0:
                return rows
        elif depth == 2 and row is not None:
            row.append(ast.literal_eval(value))
    raise PackError(f'the {name} list never closes')


def credit_line(app):
    """The credit strip under a vendored app's frame, as plain text."""
    path = ROOT / app['path']
    if not path.exists():
        return ''
    match = re.search(r'<p class="muted" style="flex:none;margin:0;padding:7px 14px[^"]*">(.*?)</p>',
                      read(path), re.S)
    if not match:
        return ''
    text = re.sub(r'\$\{[^}]*\}', '', match.group(1))
    text = html.unescape(re.sub(r'<[^>]+>', '', text))
    text = re.sub(r'\s+', ' ', text).strip()
    return text if text.endswith(('.', '!', '?')) else text + '.'


def web_retro_library():
    """[(title, system)] for every ROM Web Retro bundles."""
    rows = js_array(read(ROOT / 'apps/tools/web-retro/app.html'), 'BUNDLED')
    return [(row[2], row[3]) for row in rows if len(row) >= 4]


def celeste_games():
    """[(name, description)] for every game in the Celeste Hub's chooser."""
    rows = js_array(read(ROOT / 'apps/games/celeste-hub/app.html'), 'CELESTE_GAMES')
    return [(row[0], row[2]) for row in rows if len(row) >= 3]


def math_helper():
    """The cover page's grades and skills, from assets/math-helper.js."""
    text = read(ROOT / 'assets/math-helper.js')
    grades = re.findall(r"\{ label: '([^']+)', count: (\d+) \}", text)
    skills = []
    for line in re.findall(r"\{ id: '[^']+', title: [^\n]*\}", text):
        fields = dict(re.findall(r"(\w+): '((?:\\.|[^'\\])*)'", line))
        if fields.get('title') and fields.get('grade'):
            skills.append(fields)
    if not grades or not skills:
        raise PackError('assets/math-helper.js: no GRADES or SKILLS found')
    return grades, skills


def site_password():
    """The desktop password, so it can be kept out of the pack."""
    path = ROOT / 'data' / 'password.txt'
    if not path.exists():
        return ''
    for line in read(path).splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            return line
    return ''


# ---------------------------------------------------------------- writing

def ascii_name(title):
    """'Pokémon Red' gains '(Pokemon Red)': Mox matches words letter for
    letter, and people type names without accents."""
    folded = unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode('ascii')
    return f'{title} ({folded})' if folded != title else title


def plural(count, word):
    return f'{count} {word}' + ('' if count == 1 else 's')


def sentence(text):
    text = text.strip()
    return text if text.endswith(('.', '!', '?')) else text + '.'


def app_page(app, notes):
    """knowledge/proton/apps/<id>.md: catalog facts, then the notes."""
    name, section = app['name'], app.get('cat', 'My Apps')
    kind = 'games' if section == 'Games' else 'apps'
    # Neutral words on purpose: "website" or "proton" on all of these pages
    # would drown the guides that are really about those words.
    parts = [f'# {name}', '',
             f'{name} is one of the {kind} in the {section} section of the start menu. '
             f'Its menu description: "{sentence(app.get("desc", ""))}"']
    if not app['preinstalled']:
        parts += ['', f'{name} is not preinstalled. To get it, open App Center, find {name} and '
                      f'click Install; it then appears in the start menu under {section}.']
    parts += ['', notes.strip()]
    extra = EXTRAS.get(app['id'])
    if extra:
        parts += ['', extra().strip()]
    credit = credit_line(app)
    if credit:
        parts += ['', f'Where {name} comes from: {credit}']
    parts += ['', f'To open {name}, click the menu button with the atom logo at the left end of '
                  f'the panel and choose {name} under {section}, or type its name into the menu\'s '
                  f'search box.']
    return '\n'.join(parts).strip() + '\n'


def celeste_extra():
    games = celeste_games()
    lines = [f'The Celeste Hub lists {plural(len(games), "page")} to choose from:']
    lines += [f'- **{name}**: {sentence(desc)}' for name, desc in games]
    return '\n'.join(lines)


def web_retro_extra():
    library = web_retro_library()
    systems = []
    for _, system in library:
        if system not in systems:
            systems.append(system)
    return (f'Web Retro comes with {plural(len(library), "bundled game")} for '
            f'{", ".join(systems[:-1])} and {systems[-1]}. The page "Web Retro\'s bundled '
            f'ROM library" lists every one.')


EXTRAS = {'celeste-hub': celeste_extra, 'web-retro': web_retro_extra}


def bullet(app):
    """One line of a list page. A game's "Play <name> - " prefix is dropped:
    repeated forty times it would make the list outrank each game's own page."""
    desc = app.get('desc', '')
    prefix = f'Play {app["name"]} - '
    if desc.startswith(prefix) and len(desc) > len(prefix):
        desc = desc[len(prefix):]
        desc = desc[:1].upper() + desc[1:]
    note = '' if app['preinstalled'] else ' (not preinstalled: install it from App Center)'
    return f'- **{app["name"]}**: {sentence(desc)}{note}'


def all_apps_page(apps):
    others = [a for a in apps if a.get('cat') != 'Games']
    games = len(apps) - len(others)
    sections = [s for s in SECTIONS if s != 'Games']
    sections += sorted({a.get('cat', 'My Apps') for a in others} - set(sections))
    counts = ', '.join(f'{sum(1 for a in others if a.get("cat") == s)} in {s}' for s in sections)
    parts = ['# Apps on this website', '',
             f'The full list of all the apps on proton, the desktop on this website. It has '
             f'{plural(len(apps), "app")} in all: '
             f'{plural(len(others), "app")} ({counts}) and {plural(games, "game")} in the '
             f'Games section (see "Games on this website"). Open any of them from the proton '
             f'menu, the button at the left end of the panel.']
    for section in sections:
        members = [a for a in others if a.get('cat') == section]
        if members:
            parts += ['', f'## {section} apps', ''] + [bullet(a) for a in members]
    return '\n'.join(parts).strip() + '\n'


def all_games_page(apps):
    games = sorted((a for a in apps if a.get('cat') == 'Games'), key=lambda a: a['name'].lower())
    parts = ['# Games on this website', '',
             f'The full list of all {plural(len(games), "game")} on proton, the desktop on this '
             f'website, in alphabetical order. They are all in the Games section of the proton '
             f'menu, and every game\'s files are stored on this website itself, so nothing is '
             f'downloaded from anywhere else. Each game has its own page in this library with '
             f'how to play it. The games:', '']
    parts += [bullet(a) for a in games]
    parts += ['', 'Web Retro (in Tools) adds many more classic console games; see "Web Retro\'s '
                  'bundled ROM library".']
    return '\n'.join(parts).strip() + '\n'


def web_retro_page():
    library = web_retro_library()
    systems = {}
    for title, system in library:
        systems.setdefault(system, []).append(title)
    parts = ["# Web Retro's bundled ROM library", '',
             f'Web Retro, in the Tools section of the proton menu, comes with '
             f'{plural(len(library), "bundled retro game")}: the site maintainer\'s own ROM '
             f'files. To play one, open Web Retro, stay on the ROMs tab, click a console box '
             f'(NES, SNES, N64 or GB) and click a game. There is no start button: the game '
             f'boots straight away. The games are commercial titles that belong to Nintendo '
             f'and their other rights holders.']
    for system, titles in systems.items():
        parts += ['', f'## {system} ({len(titles)})', '', sentence(join_names([ascii_name(t) for t in titles]))]
    parts += ['', 'Web Retro also plays ROM files you bring yourself, from your computer or '
                  'from proton Files, on the Emulators tab.']
    return '\n'.join(parts).strip() + '\n'


def math_helper_page():
    grades, skills = math_helper()
    parts = ['# Math Helper skills and grades', '',
             f'The Math Helper cover page, the maths practice site you see before signing in '
             f'to proton, covers {len(grades)} grades, '
             f'{", ".join(label for label, _ in grades[:-1])} and {grades[-1][0]}. Each grade '
             f'button shows a skill count. These are the skills its practice questions are '
             f'generated for, with the grade and topic each belongs to:', '']
    for skill in skills:
        grade = skill['grade'] if skill['grade'] in ('Pre-K', 'K') else f'grade {skill["grade"]}'
        line = f'- **{skill["title"]}** ({grade}, {skill.get("topic", "")})'
        if skill.get('blurb'):
            line += f': {sentence(skill["blurb"])}'
        parts.append(line)
    return '\n'.join(parts).strip() + '\n'


def join_names(names):
    return names[0] if len(names) == 1 else ', '.join(names[:-1]) + ' and ' + names[-1]


def placeholders(apps):
    """The {{...}} values guides and notes may use, so counts and app names
    in hand-written text follow the catalog instead of going stale."""
    others = [a for a in apps if a.get('cat') != 'Games']
    sections = []
    for section in SECTIONS[:-1] + sorted({a.get('cat', 'My Apps') for a in others} - set(SECTIONS)):
        names = [a['name'] for a in others if a.get('cat') == section]
        if names:
            sections.append(f'{section}: {join_names(names)}.')
    return {
        'app_count': str(len(apps)),
        'game_count': str(len(apps) - len(others)),
        'other_count': str(len(others)),
        'rom_count': str(len(web_retro_library())),
        'sections': ' '.join(sections),
    }


def render(text, values, by_id, where):
    """Fill in {{name}} values and {{names: id, id, ...}} lists of app names.
    A placeholder naming an app the catalog no longer has stops the build, so
    hand-written text never promises an app that is gone."""
    def fill(match):
        body = match.group(1).strip()
        if body.startswith('names:'):
            ids = [i.strip() for i in body[len('names:'):].split(',') if i.strip()]
            gone = [i for i in ids if i not in by_id]
            if gone:
                raise PackError(f'{where} names apps that are not in the catalog: {", ".join(gone)}')
            return join_names([by_id[i]['name'] for i in ids])
        if body not in values:
            raise PackError(f'{where} uses an unknown placeholder {{{{{body}}}}}')
        return values[body]
    return re.sub(r'\{\{(.*?)\}\}', fill, text)


def build_pack():
    """{path relative to knowledge/: text} for every file of the pack."""
    apps = load_catalog()
    notes = load_notes()
    ids = [a['id'] for a in apps]
    missing = [i for i in ids if i not in notes]
    stale = sorted(set(notes) - set(ids))
    if missing or stale:
        raise PackError('tools/mox-knowledge/apps.md is out of step with the catalog:'
                        + (f'\n  no notes for: {", ".join(missing)}' if missing else '')
                        + (f'\n  notes for apps that are gone: {", ".join(stale)}' if stale else ''))
    values, by_id = placeholders(apps), {a['id']: a for a in apps}
    pack = {}
    for guide in sorted((SOURCES / 'guides').glob('*.md')):
        where = f'tools/mox-knowledge/guides/{guide.name}'
        pack[f'proton/{guide.name}'] = render(read(guide), values, by_id, where).strip() + '\n'
    pack['proton/all-apps.md'] = all_apps_page(apps)
    pack['proton/all-games.md'] = all_games_page(apps)
    pack['proton/web-retro-roms.md'] = web_retro_page()
    pack['proton/math-helper-skills.md'] = math_helper_page()
    for app in apps:
        text = render(notes[app['id']], values, by_id, f'tools/mox-knowledge/apps.md ({app["id"]})')
        pack[f'proton/apps/{app["id"]}.md'] = app_page(app, text)
    return pack


def check_secret(pack):
    secret = site_password()
    if not secret:
        return
    pattern = re.compile(r'(?<![A-Za-z0-9])%s(?![A-Za-z0-9])' % re.escape(secret), re.I)
    leaks = [path for path, text in pack.items() if pattern.search(text)]
    if leaks:
        raise PackError('the site password appears in: ' + ', '.join(leaks))


def title_for(path, text):
    """As Mox's builder: the first Markdown heading, else the file name."""
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith('#'):
            heading = stripped.lstrip('#').strip()
            if heading:
                return heading
        if stripped:
            break
    stem = path.stem.replace('-', ' ').replace('_', ' ')
    return stem[:1].upper() + stem[1:]


def build_index(pack):
    """knowledge/index.json for Mox's own files plus the pack."""
    files = {}
    for path in KNOWLEDGE.rglob('*'):
        rel = path.relative_to(KNOWLEDGE).as_posix()
        if path.is_file() and not rel.startswith('proton/'):
            files[rel] = path.read_bytes()
    for rel, text in pack.items():
        files[rel] = text.encode('utf-8')

    documents = []
    for path in sorted(KNOWLEDGE / rel for rel in files):  # the order Mox's builder uses
        rel = path.relative_to(KNOWLEDGE).as_posix()
        if path.suffix.lower() not in SUPPORTED or path.name in EXCLUDED_NAMES:
            continue
        data = files[rel]
        text = data.decode('utf-8', errors='replace')
        documents.append({
            'path': rel,
            'title': title_for(path, text),
            'category': rel.split('/')[0] if '/' in rel else '',
            'bytes': len(data),
            'words': len(text.split()),
        })

    previous = json.loads(read(INDEX)) if INDEX.exists() else {}
    categories = [CATEGORY] + [c for c in previous.get('categories', []) if c.get('id') != CATEGORY['id']]
    present = {doc['category'] for doc in documents}
    categories = [c for c in categories if c['id'] in present or c['id'] == '']
    base = str(previous.get('generated') or '').split('+')[0] \
        or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    return {
        'version': previous.get('version', 2),
        'generated': f'{base}+proton.{pack_hash(pack)}',
        'categories': categories,
        'documents': documents,
    }


def pack_hash(pack):
    """12 hex digits that change whenever any file of the pack changes."""
    digest = hashlib.sha256()
    for rel in sorted(pack):
        digest.update(rel.encode('utf-8') + b'\0' + pack[rel].encode('utf-8') + b'\0')
    return digest.hexdigest()[:12]


def main(argv):
    check = '--check' in argv
    try:
        pack = build_pack()
        check_secret(pack)
        index = build_index(pack)
    except PackError as error:
        print(f'gen-mox-knowledge: {error}', file=sys.stderr)
        return 1
    wanted = {KNOWLEDGE / rel: text.encode('utf-8') for rel, text in pack.items()}
    wanted[INDEX] = (json.dumps(index, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    existing = {p for p in PACK.rglob('*') if p.is_file()} if PACK.exists() else set()

    changed = [p for p, data in wanted.items() if not p.exists() or p.read_bytes() != data]
    removed = sorted(existing - set(wanted))
    if check:
        for path in changed + removed:
            print(f'out of date: {path.relative_to(ROOT).as_posix()}')
        if changed or removed:
            print('run python3 tools/gen-mox-knowledge.py', file=sys.stderr)
            return 1
        print(f'knowledge pack is current ({len(pack)} documents)')
        return 0

    for path in removed:
        path.unlink()
    for path in changed:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(wanted[path])
    for folder in sorted({p.parent for p in existing} | {PACK}, key=lambda p: -len(p.parts)):
        if folder.exists() and folder != PACK and not any(folder.iterdir()):
            folder.rmdir()
    words = sum(len(text.split()) for text in pack.values())
    print(f'wrote {PACK.relative_to(ROOT).as_posix()}/ ({len(pack)} documents, {words:,} words) '
          f'and {INDEX.relative_to(ROOT).as_posix()} ({len(index["documents"])} documents in all); '
          f'{len(changed)} file(s) changed, {len(removed)} removed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
