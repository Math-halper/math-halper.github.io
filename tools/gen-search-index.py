#!/usr/bin/env python3
"""Generate data/search-index.js — the corpus behind proton's own search
engine (assets/search.js), which the Browser's address bar queries.

The site is static, so there is no server to search and nothing to crawl: the
searchable corpus is this repository. This script reads every deployed file
the same way tools/gen-fs-manifest.py lists them, pulls the *prose* out of
each one (documentation text, an app module's header and section comments, a
built-in website's visible text, source comments) and writes one inverted
index: term -> the documents it appears in, with counts, so the engine in the
browser can score, rank and snippet without fetching anything first.

What is deliberately NOT in here:

  - the account's own files under /home/<user> (they are private to a browser
    and change at runtime),
  - any file's raw bytes or full source (only prose, so the index stays small),
  - generated and machine-only files (data/fs-manifest.js, this index,
    package*.json, .nojekyll, .gitignore).

Those files are still *findable*: assets/search.js matches every path in
data/fs-manifest.js at runtime, plus the app and website catalogs, and merges
those hits with the ones scored here.

Run from anywhere (paths are resolved from this script's location):

    python3 tools/gen-search-index.py

Re-run it whenever documentation or an app's prose changes, then commit the
updated data/search-index.js — the tests compare the index against the
repository, exactly like the file system manifest. Output is deterministic:
no timestamps, sorted documents and terms, so re-running writes the same bytes.
"""

import ast
import html
import io
import os
import re
import tokenize as pytokenize

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'search-index.js')
SELF = 'data/search-index.js'

# Same walk as the file system manifest: dev-only folders and the
# underscore-prefixed copy-me templates are not part of the deployed site.
EXCLUDE_DIRS = {'.git', '.arena', 'node_modules', '__pycache__', '.cache', '.pytest_cache',
                '.venv', 'dist', 'build', 'coverage', '.next', 'tests'}
# Machine-written or machine-only files: no prose worth searching. The
# desktop password file is excluded too — its contents are a credential,
# not prose, and must never surface as a search result.
EXCLUDE_FILES = {'package-lock.json', 'package.json', '.nojekyll', '.gitignore',
                 'data/fs-manifest.js', 'data/password.txt', SELF}
# Mox's corpus, not proton's. Mox (github.com/Math-halper/mox) ships its own
# 55-document knowledge library, which Mox searches and cites itself, and
# tools/gen-mox-knowledge.py adds a topic about proton to that library,
# written from tools/mox-knowledge/. Those pages retell proton's own docs for
# the AI, so indexing them here would only echo every result; the Mox wrapper
# (app.html), its README.md and the generator's own notes speak for them.
MOX_CORPUS = ('apps/productivity/mox/website/', 'tools/mox-knowledge/')

# Per-document caps keep one long file (LICENSE.txt, a big app module) from
# dominating the index. Text beyond the cap is still on disk and still
# reachable through the file system; it just is not scored here.
MAX_DOC_CHARS = 60000
MAX_TITLE_CHARS = 88
MAX_SUMMARY_CHARS = 200

# Words that carry no meaning of their own. Small on purpose: the index is
# ranked by inverse document frequency anyway, so a rare stopword that slips
# through costs almost nothing, while dropping a real word costs a result.
STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
    'by', 'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
    'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'its', 'itself', 'just', 'let', 'like', 'me', 'more', 'most', 'must', 'my', 'myself',
    'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
    'ours', 'out', 'over', 'own', 'per', 'same', 'she', 'should', 'so', 'some', 'such',
    'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
    'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
    'would', 'you', 'your', 'yours',
}

HEADER = """\
/* proton — search index — GENERATED FILE, do not edit by hand.
 *
 * The corpus behind proton's own search engine (assets/search.js), built by
 * tools/gen-search-index.py from the prose in this repository: the
 * documentation, each app module's header and section comments, the built-in
 * website pages and the source comments. Nothing outside this repository is
 * indexed — there is no server, and the Browser's search bar answers from
 * here.
 *
 * Shape:
 *   docs  — one entry per indexed file, sorted by path:
 *             p  path in the virtual file system, with its leading /
 *             t  title (heading, <title> or file name)
 *             k  kind: doc | app | site | code
 *             d  one-line summary, the fallback snippet
 *             n  how many terms the document contributed (for scoring)
 *   terms — every indexed term mapped to the documents it occurs in, as a
 *           compact run of comma-separated "<doc delta>[:<count>]" entries.
 *           Document ids are cumulative and start from -1, and a missing
 *           count means 1, so '1:12,3:4,4' is document 0 twelve times,
 *           document 3 four times, document 7 once. assets/search.js decodes
 *           it; nothing else reads this file.
 *
 * Regenerate after changing documentation or an app's prose, then commit:
 *     python3 tools/gen-search-index.py
 */

window.PROTON_SEARCH_INDEX = {
  v: 1,
  docs: [
"""

CAMEL = re.compile(r'[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+')
WORD = re.compile(r'[a-z0-9]+')


# The documentation is written in British English and LICENSE.txt (plus half
# the code it licences) in American; a query should not have to know which.
SPELLINGS = {'licence': 'license', 'centre': 'center', 'behaviour': 'behavior'}


def stem_once(t):
    if t.endswith('ies') and len(t) > 4:
        t = t[:-3] + 'y'
    elif t.endswith('sses') and len(t) > 4:
        t = t[:-2]
    elif t.endswith('s') and not t.endswith('ss') and len(t) > 3:
        t = t[:-1]
    if t.endswith('ing') and len(t) > 5:
        t = t[:-3]
    elif t.endswith('ed') and len(t) > 4:
        t = t[:-2]
    # -ise/-ize and the forms they come from meet on one key ("customise",
    # "customize" and "customising" all end up as "customiz…").
    if len(t) > 4:
        t = re.sub(r'is(?=e?$)', 'iz', t)
    return SPELLINGS.get(t, t)


def stem(token):
    """Fold a token to a search key, all the way to a fixed point.

    Kept deliberately tiny — and it is mirrored character for character by
    stemToken() in assets/search.js, because a query only finds a document if
    both sides agree. Running it until it stops changing is what makes that
    agreement checkable: every term written into the index is then a fixed
    point of the engine's own stemmer, which is exactly what the regression
    test asserts instead of trusting two implementations to match.
    """
    t = token
    for _ in range(4):
        stepped = stem_once(t)
        if stepped == t:
            break
        t = stepped
    return t


def tokenize(text):
    """Prose -> stemmed search keys, camelCase identifiers included.

    An identifier is indexed twice: whole ('openfsitem') and split into its
    parts ('open', 'fs', 'item'), so both "openFSItem" and "open" find it.
    """
    keys = []
    for raw in WORD.findall(text.lower()):
        if len(raw) < 2 or raw in STOPWORDS:
            continue
        keys.append(stem(raw))
    # camelCase and PascalCase survive lowercasing only as one long token, so
    # split the original text's identifiers as well.
    for raw in CAMEL.findall(text):
        if len(raw) < 6 or not any(c.isupper() for c in raw[1:]):
            continue
        parts = [p.lower() for p in CAMEL.findall(raw) if len(p) > 1]
        for part in parts:
            if part not in STOPWORDS:
                keys.append(stem(part))
    return [k for k in keys if k and k not in STOPWORDS]


def strip_tags(markup):
    """Visible text of an HTML fragment: no scripts, no styles, no tags."""
    text = re.sub(r'(?is)<(script|style|textarea)\b.*?</\1>', ' ', markup)
    text = re.sub(r'(?s)<!--.*?-->', ' ', text)
    text = re.sub(r'(?s)<[^>]+>', ' ', text)
    return html.unescape(text)


def unstar(text):
    """Remove comment punctuation so the prose reads as prose: the /* and */
    of a block, the * that continues it on each line, and a Python docstring's
    triple quotes."""
    text = re.sub(r'/\*+', ' ', text)
    text = re.sub(r'\*+/', ' ', text)
    text = re.sub(r'"""|\'\'\'', ' ', text)
    return re.sub(r'(?m)^\s*\*+\s?', '', text)


def block_comments(text):
    """/* … */ blocks plus whole-line // comments.

    Only comments that start a line are taken, so a "//" inside a string (a
    URL, say) never leaks into the index.
    """
    parts = re.findall(r'(?s)/\*.*?\*/', text)
    parts += [m.group(1) for m in re.finditer(r'(?m)^[ \t]*//[ \t]?(.*)$', text)]
    return unstar('\n'.join(parts))


def python_prose(text):
    """Docstrings and comments, read with Python's own parser.

    A regex for triple-quoted strings pairs the module docstring's closing
    quotes with the next string literal's opening ones and indexes whatever
    sits between them — this file's own output template, as it happens. ast
    and tokenize only ever report real docstrings and real comments.
    """
    parts = []
    try:
        tree = ast.parse(text)
    except (SyntaxError, ValueError):
        tree = None
    if tree is not None:
        for node in ast.walk(tree):
            if isinstance(node, (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
                doc = ast.get_docstring(node)
                if doc:
                    parts.append(doc)
    try:
        for token in pytokenize.generate_tokens(io.StringIO(text).readline):
            if token.type == pytokenize.COMMENT:
                parts.append(token.string.lstrip('#').strip())
    except (pytokenize.TokenError, IndentationError, SyntaxError):
        pass
    return unstar('\n'.join(parts))


def markdown_prose(text):
    """Markdown with its syntax noise removed: headings, emphasis, links,
    tables, code fences and HTML all reduce to the words a reader sees."""
    text = re.sub(r'(?s)```.*?```', ' ', text)
    text = re.sub(r'(?m)^\s*\|[-: |]+\|\s*$', ' ', text)
    text = re.sub(r'!\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'\[([^\]]*)\]\(([^)]*)\)', r'\1 \2', text)
    text = re.sub(r'(?s)<[^>]+>', ' ', text)
    text = re.sub(r'(?m)^(\s*)([-*+]|\d+\.)\s+', r'\1', text)
    return re.sub(r'[#>*`_|~\-]{2,}', ' ', text)


BOILERPLATE = ('this file is a proton app', 'not meant to be opened on its own',
               'the script below is fetched', 'proton app module:',
               'loaded by index.html', 'calls registerapp', 'edit this file to change',
               'metadata (name, icon, cat, desc, w, h) lives in the app catalog')


def clean_prose(kind, prose, title):
    """Drop the sentences every module repeats and the document's own title,
    so a summary is the file's actual first line of meaning."""
    text = re.sub(r'\s+', ' ', prose).strip()
    if kind == 'doc' and title:
        text = re.sub(r'^%s\s*' % re.escape(title), '', text).strip()
    sentences = []
    for sentence in re.split(r'(?<=[.!?])\s+', text):
        sentence = sentence.strip(' -\u2013\u2014\u2022*#|>:')
        if not sentence or sentence.lower() in BOILERPLATE:
            continue
        if any(chunk in sentence.lower() for chunk in BOILERPLATE):
            continue
        sentences.append(sentence)
    return ' '.join(sentences)


def title_of(kind, text, rel):
    """The result's headline: a heading for prose, <title> for a page."""
    if kind == 'doc':
        for line in text.splitlines():
            line = line.strip()
            if line.startswith('#'):
                return clip_title(re.sub(r'^#+\s*', '', line).strip()) or os.path.basename(rel)
            if line:
                return clip_title(line)
        return os.path.basename(rel)
    match = re.search(r'(?is)<title[^>]*>(.*?)</title>', text) if kind in ('app', 'site') else None
    if match:
        return clip_title(re.sub(r'\s*[-–|]\s*proton.*$', '',
                                 html.unescape(strip_tags(match.group(1))).strip()))
    return os.path.basename(rel)


def clip_title(title):
    title = re.sub(r'\s+', ' ', title).strip()
    if len(title) <= MAX_TITLE_CHARS:
        return title
    cut = title[:MAX_TITLE_CHARS]
    if ' ' in cut:
        return cut[:cut.rfind(' ')].rstrip(' ,;:.') + '\u2026'
    return cut[:MAX_TITLE_CHARS - 1] + '\u2026'


def doc_summary_source(kind, prose, text):
    """For documentation, summarise from below the leading '# Title' line —
    the title is already the result's headline."""
    if kind != 'doc':
        return prose
    lines = text.splitlines()
    while lines and not lines[0].strip():
        lines.pop(0)
    if lines and lines[0].lstrip().startswith('#'):
        lines.pop(0)
    return markdown_prose('\n'.join(lines))


def summary_of(kind, prose, title, rel):
    """One line of prose for the result card, shown until the real snippet is
    fetched from the file: the first sentence long enough to say something."""
    text = clean_prose(kind, prose, title)
    for sentence in re.split(r'(?<=[.!?])\s+', text):
        if len(sentence) >= 40 and sentence.lower() != os.path.basename(rel).lower():
            return clip(sentence)
    return clip(text)


def clip(text):
    """Cut to the cap on a word boundary, never mid-word."""
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= MAX_SUMMARY_CHARS:
        return text
    cut = text[:MAX_SUMMARY_CHARS]
    return (cut[:cut.rfind(' ')] if ' ' in cut else cut).rstrip(' ,;:.') + '\u2026'


def read(rel):
    with open(os.path.join(ROOT, rel), 'r', encoding='utf-8', errors='replace') as fh:
        return fh.read()[:MAX_DOC_CHARS * 4]


def prose_for(rel):
    """Which words of this file are worth searching, by file kind."""
    name = os.path.basename(rel)
    text = read(rel)
    if rel.startswith('apps/') and name == 'app.html':
        # An app module: its own description comments are the prose (the rest
        # is script), plus whatever the page shows if opened on its own.
        return 'app', block_comments(text) + '\n' + strip_tags(re.sub(r'(?is)<script.*?</script>', ' ', text))
    if rel.startswith('websites/') and name in ('site.html', 'index.html'):
        return 'site', strip_tags(text) + '\n' + re.sub(r'(?s)<!--(.*?)-->', r'\1', '\n'.join(re.findall(r'(?s)<!--.*?-->', text)))
    if name.endswith('.md'):
        return 'doc', markdown_prose(text)
    if name.endswith(('.txt', '.text', '.rst')):
        return 'doc', text
    if name.endswith('.py'):
        return 'code', python_prose(text)
    if name.endswith(('.js', '.mjs', '.cjs', '.css')):
        return 'code', block_comments(text)
    if name.endswith(('.html', '.htm', '.yml', '.yaml')):
        return 'code', block_comments(re.sub(r'(?s)<!--(.*?)-->', r'/*\1*/', text))
    return 'other', ''


def collect():
    files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith('_'))
        for fn in sorted(filenames):
            rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace(os.sep, '/')
            if rel in EXCLUDE_FILES or fn.startswith('_'):
                continue
            # Vendored game folders are byte-for-byte copies of other
            # projects (see CREDITS.md): their trees are files on disk,
            # not this repository's own prose. Only proton's wrapper
            # page (and the games picker itself) speaks for them here,
            # or one bundled game manual would outrank the desktop.
            if rel.startswith('apps/games/') and fn != 'app.html' and rel != 'apps/games/index.html':
                continue
            # Vendored runtime trees (the FFmpeg WebAssembly build under
            # the Media app) are likewise third-party code on disk, not
            # prose this repository speaks with.
            if '/vendor/' in rel:
                continue
            if rel.startswith(MOX_CORPUS):
                continue
            files.append(rel)
    files.sort()
    return files


def main():
    docs, postings = [], {}
    for rel in collect():
        kind, prose = prose_for(rel)
        text = read(rel)
        keys = tokenize(prose)
        if not keys:
            continue  # nothing searchable: bytes, icons, an empty stub
        counts = {}
        for key in keys:
            counts[key] = counts.get(key, 0) + 1
        title = title_of(kind, text, rel)
        docs.append({
            'p': '/' + rel,
            't': title,
            'k': kind,
            'd': summary_of(kind, doc_summary_source(kind, prose, text), title, rel),
            'n': len(keys),
        })
        doc_id = len(docs) - 1
        for term, count in counts.items():
            postings.setdefault(term, []).append((doc_id, count))

    lines = []
    for doc in docs:
        lines.append('    { p: %s, t: %s, k: %r, d: %s, n: %d },\n' % (
            js_string(doc['p']), js_string(doc['t']), doc['k'], js_string(doc['d']), doc['n']))
    body = ''.join(lines) + '  ],\n'

    term_lines = []
    for term in sorted(postings):
        # Cumulative document ids, count omitted when it is 1: the smallest
        # form that is still readable in a diff.
        entries, previous = [], -1
        for doc_id, count in sorted(postings[term]):
            entries.append('%d' % (doc_id - previous) if count == 1 else '%d:%d' % (doc_id - previous, count))
            previous = doc_id
        term_lines.append('    %s: %s,\n' % (js_string(term), js_string(','.join(entries))))
    body += '  terms: {\n' + ''.join(term_lines) + '  },\n'

    out = HEADER + body + '};\n'
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(out)
    print('wrote %s (%d documents, %d terms, %.1f KB)' % (
        os.path.relpath(OUT, ROOT), len(docs), len(postings), len(out.encode('utf-8')) / 1024))


def js_string(value):
    """A single-quoted JS string literal, escaping only what must be escaped."""
    text = str(value).replace('\\', '\\\\').replace("'", "\\'")
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    return "'" + re.sub(r'\s{2,}', ' ', text).strip() + "'"


if __name__ == '__main__':
    main()
