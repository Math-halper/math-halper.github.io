/* proton — search engine.
 *
 * proton has no server and calls no outside search API: the corpus is this
 * repository, indexed offline by tools/gen-search-index.py into
 * data/search-index.js. This file is the engine that reads that index — the
 * tokenizer (mirrored from the generator, so a query and the document it
 * should find agree on what a word is), the inverted-index decoder, the
 * scorer, and the snippet builder. It is dependency-free and never touches
 * the network beyond fetching a file it is about to quote from.
 *
 * Four sources answer a query and are merged into one ranked list:
 *   1. the generated index — prose from the documentation, each app module's
 *      own comments, the built-in website pages and the source comments;
 *   2. every path in the virtual file system (data/fs-manifest.js), matched at
 *      runtime, so a file with no prose in it is still findable by name;
 *   3. the app and website catalogs (data/applications.js, data/websites.js),
 *      so "files" offers to launch Files and "test" to visit Test Page — using
 *      the live names, so a rename in Customize is what you see;
 *   4. whatever internal pages the caller passes in (proton://home,
 *      proton://bookmarks, …), so the Browser's own pages are searchable too.
 *
 * Ranking is tf–idf with field boosts (a word in a title outweighs the same
 * word in a body), a small length normalisation, and a coverage rule: results
 * that account for every word in the query always outrank partial ones.
 *
 * API (used by apps/inbuilt/browser; the tests drive it directly):
 *   PROTON_SEARCH.search(query, {limit, pages})  -> {query, tokens, results, total, ms}
 *   PROTON_SEARCH.suggest(text, {limit, pages, history, bookmarks})
 *                                              -> [{label, sub, icon, svgIcon, action, value}]
 *   PROTON_SEARCH.highlight(text, tokens)      -> [{text, hit}]  (caller escapes)
 *   PROTON_SEARCH.snippet(text, tokens, radius)-> [{text, hit}]
 *   PROTON_SEARCH.readable(text)               -> plain prose, no markup
 *   PROTON_SEARCH.stats()                      -> {docs, terms, version}
 *   PROTON_SEARCH.tokenize(text) / stemToken(word)
 *
 * A result looks like:
 *   { path, title, kind, summary, score, coverage, matched, appId, siteId,
 *     answer, occurrences, inTitle, inName, inSummary, fromPath, fromCatalog }
 * where kind is app | site | page | doc | code | path, and appId/siteId say
 * the result can be launched or visited instead of merely opened.
 *
 * `answer` is the important one. This engine searches a repository, not the
 * language: a word can turn up once in the middle of LICENSE.txt without
 * anything here defining, explaining or being about it. Presenting that as the
 * top result is how a search lies, so every result is classified — an answer
 * is a file whose name, title or summary carries the word, an app or website
 * the catalogs name with it, a path that matches it, or a document that uses it
 * more than a couple of times. Everything else is a mention, and the Browser
 * shows mentions as mentions (see search().answer).
 */
'use strict';

const PROTON_SEARCH = (function () {
  /* ---------------- tokenizer ----------------
   * stemToken() and tokenize() must stay in step with the Python of the same
   * name in tools/gen-search-index.py: the index is written with one and
   * queried with the other, and a disagreement is a result that never turns
   * up. The tests check both sides against the generated index. */

  const STOPWORDS = new Set([
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
  ]);

  const WORD_RE = /[a-z0-9]+/g;
  const CAMEL_RE = /[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+/g;

  /* The documentation is British English and LICENSE.txt (plus half the code
   * it licences) American; a query should not have to know which. */
  const SPELLINGS = { licence: 'license', centre: 'center', behaviour: 'behavior' };

  function stemOnce(t) {
    if (t.endsWith('ies') && t.length > 4) t = t.slice(0, -3) + 'y';
    else if (t.endsWith('sses') && t.length > 4) t = t.slice(0, -2);
    else if (t.endsWith('s') && !t.endsWith('ss') && t.length > 3) t = t.slice(0, -1);
    if (t.endsWith('ing') && t.length > 5) t = t.slice(0, -3);
    else if (t.endsWith('ed') && t.length > 4) t = t.slice(0, -2);
    /* -ise/-ize and the forms they come from meet on one key ("customise",
     * "customize" and "customising" all end up as "customiz…"). */
    if (t.length > 4) t = t.replace(/is(?=e?$)/, 'iz');
    return Object.hasOwn(SPELLINGS, t) ? SPELLINGS[t] : t;
  }

  /* Folded all the way to a fixed point, exactly like tools/gen-search-index.py
   * does: one pass is not idempotent ("arising" -> "aris" -> "ari"), and a
   * term the generator wrote must be one the engine reproduces. */
  function stemToken(word) {
    let t = String(word || '').toLowerCase();
    for (let pass = 0; pass < 4; pass++) {
      const stepped = stemOnce(t);
      if (stepped === t) break;
      t = stepped;
    }
    return t;
  }

  function tokenize(text) {
    const source = String(text || '');
    const keys = [];
    for (const raw of source.toLowerCase().match(WORD_RE) || []) {
      if (raw.length < 2 || STOPWORDS.has(raw)) continue;
      keys.push(stemToken(raw));
    }
    /* An identifier is indexed whole and in pieces, so "openFSItem" and
     * "open" both find the function the comment mentions. */
    for (const raw of source.match(CAMEL_RE) || []) {
      if (raw.length < 6 || !/[A-Z]/.test(raw.slice(1))) continue;
      for (const part of raw.match(CAMEL_RE) || []) {
        const low = part.toLowerCase();
        if (low.length > 1 && !STOPWORDS.has(low)) keys.push(stemToken(low));
      }
    }
    return keys.filter((key) => key && !STOPWORDS.has(key));
  }

  function queryTokens(query) {
    return [...new Set(tokenize(query))];
  }

  /* ---------------- the generated corpus ---------------- */

  function corpus() {
    const index = window.PROTON_SEARCH_INDEX;
    return index && Array.isArray(index.docs) ? index : { v: 0, docs: [], terms: {} };
  }

  const decoded = new Map();   // term -> Map(docId -> count), decoded once
  function postings(term) {
    if (decoded.has(term)) return decoded.get(term);
    const raw = corpus().terms?.[term];
    const out = new Map();
    /* "<doc delta>[:<count>]" runs whose document ids are cumulative from -1
     * and whose count defaults to 1 — see the header of data/search-index.js. */
    if (typeof raw === 'string') {
      let docId = -1;
      for (const part of raw.split(',')) {
        const at = part.indexOf(':');
        const delta = parseInt(at < 0 ? part : part.slice(0, at), 10);
        const count = at < 0 ? 1 : parseInt(part.slice(at + 1), 10);
        if (!Number.isFinite(delta)) continue;
        docId += delta;
        out.set(docId, (out.get(docId) || 0) + (Number.isFinite(count) && count > 0 ? count : 1));
      }
    }
    decoded.set(term, out);
    return out;
  }

  function termsLike(token) {
    /* Exact matches first, then anything the token is a prefix of (weighted
     * down), which is what makes "wallpap" find "wallpaper" and a typo at the
     * end of a long word still land somewhere. */
    const terms = corpus().terms || {};
    const out = [];
    if (Object.hasOwn(terms, token)) out.push({ term: token, weight: 1 });
    for (const term of Object.keys(terms)) {
      if (term !== token && term.startsWith(token)) out.push({ term, weight: 0.55 });
    }
    return out;
  }

  /* ---------------- runtime sources ---------------- */

  function basename(path) {
    const parts = String(path || '').split('/');
    return parts[parts.length - 1] || String(path || '');
  }

  function catalogApps() {
    const entries = Array.isArray(window.PROTON_APPLICATIONS) ? window.PROTON_APPLICATIONS : [];
    return entries.filter((e) => e && e.path).map((e) => ({
      path: '/' + String(e.path).replace(/^\/+/, ''),
      id: e.id,
      /* The live registry wins: Customize can rename an app per account. */
      name: (typeof APPS !== 'undefined' && APPS[e.id]?.name) || e.name || e.id,
      desc: (typeof APPS !== 'undefined' && APPS[e.id]?.desc) || e.desc || '',
      icon: (typeof APPS !== 'undefined' && APPS[e.id]?.icon) || e.icon,
      svgIcon: ((typeof APPS !== 'undefined' && APPS[e.id]) || e).svgIcon !== false,
    }));
  }

  function catalogSites() {
    const entries = Array.isArray(window.PROTON_WEBSITES) ? window.PROTON_WEBSITES : [];
    return entries.filter((e) => e && e.path).map((e) => ({
      path: '/' + String(e.path).replace(/^\/+/, ''),
      id: e.id,
      name: (typeof SITES !== 'undefined' && SITES[e.id]?.name) || e.name || e.id,
      desc: (typeof SITES !== 'undefined' && SITES[e.id]?.desc) || e.desc || '',
      icon: (typeof SITES !== 'undefined' && SITES[e.id]?.icon) || e.icon,
      svgIcon: ((typeof SITES !== 'undefined' && SITES[e.id]) || e).svgIcon !== false,
    }));
  }

  function vfsPaths() {
    const manifest = Array.isArray(window.PROTON_FS_MANIFEST) ? window.PROTON_FS_MANIFEST : [];
    const paths = manifest.map((entry) => '/' + String(entry.p || '').replace(/^\/+/, '')).filter((p) => p.length > 1);
    for (const doc of corpus().docs) if (doc.p) paths.push(doc.p);
    for (const app of catalogApps()) paths.push(app.path);
    for (const site of catalogSites()) paths.push(site.path);
    return [...new Set(paths)].sort();
  }

  /* ---------------- scoring ---------------- */

  const KIND_ORDER = { app: 0, site: 1, page: 2, doc: 3, code: 4, path: 5 };
  /* A body-only match still counts as an answer once the document uses the
   * word enough times — but "enough" has to scale with the document, or a
   * 3,000-word licence answers every word in the language. Three mentions is
   * the floor; beyond that a document has to use the word about once per 200
   * words of its own before it can claim to be about it. */
  const ANSWER_MIN_OCCURRENCES = 3;
  const answerThreshold = (doc) => Math.max(ANSWER_MIN_OCCURRENCES, Math.round((doc?.n || 0) / 200));

  function search(rawQuery, options = {}) {
    const began = Date.now();
    const limit = Math.max(1, parseInt(options.limit, 10) || 40);
    const query = String(rawQuery || '').trim();
    const tokens = queryTokens(query);
    if (!tokens.length) return { query, tokens, results: [], total: 0, ms: 0 };

    const pages = Array.isArray(options.pages) ? options.pages : [];
    const docs = corpus().docs;
    let answers = 0;
    const byPath = new Map(docs.map((doc) => [doc.p, doc]));
    const found = new Map();

    const entry = (path, fallbackKind) => {
      let result = found.get(path);
      if (!result) {
        result = {
          path, title: basename(path), kind: fallbackKind || 'path', summary: '',
          score: 0, coverage: 0, matched: [], appId: null, siteId: null, perToken: new Map(),
          /* How the word was found, which is what separates an answer from a
           * mention: see the header comment. */
          occurrences: 0, inTitle: false, inName: false, inSummary: false,
          fromPath: false, fromCatalog: false, answer: false,
        };
        found.set(path, result);
      }
      return result;
    };
    const mark = (result, token) => { if (!result.matched.includes(token)) result.matched.push(token); };
    const credit = (result, token, points) => {
      result.perToken.set(token, Math.max(result.perToken.get(token) || 0, points));
      mark(result, token);
    };

    /* 1. the generated index: tf–idf, boosted by where the word appears. */
    const fieldCache = new Map();
    const fieldsOf = (doc) => {
      let fields = fieldCache.get(doc.p);
      if (!fields) {
        fields = {
          title: new Set(tokenize(doc.t)), name: new Set(tokenize(basename(doc.p))),
          path: new Set(tokenize(doc.p)), summary: new Set(tokenize(doc.d)),
        };
        fieldCache.set(doc.p, fields);
      }
      return fields;
    };
    const docCount = Math.max(1, docs.length);
    for (const token of tokens) {
      for (const { term, weight } of termsLike(token)) {
        const hits = postings(term);
        if (!hits.size) continue;
        const idf = Math.log(1 + docCount / (1 + hits.size));
        for (const [docId, count] of hits) {
          const doc = docs[docId];
          if (!doc) continue;
          const result = entry(doc.p, doc.k);
          if (doc.t) result.title = doc.t;
          if (doc.d) result.summary = doc.d;
          if (doc.k) result.kind = doc.k;
          const fields = fieldsOf(doc);
          const boost = fields.title.has(token) ? 4 : fields.path.has(token) ? 2.6
            : fields.summary.has(token) ? 1.6 : 1;
          result.occurrences += count;
          if (fields.title.has(token)) result.inTitle = true;
          if (fields.name.has(token)) result.inName = true;
          if (fields.summary.has(token)) result.inSummary = true;
          credit(result, token, idf * (1 + Math.log(count)) * weight * boost);
        }
      }
    }
    /* Long documents say everything; divide their score by their own length. */
    for (const result of found.values()) {
      const doc = byPath.get(result.path);
      const norm = doc ? 1 / (1 + Math.log(1 + (doc.n || 0) / 400)) : 1;
      let sum = 0;
      for (const points of result.perToken.values()) sum += points;
      result.score += sum * norm;
      result.coverage = tokens.length ? result.perToken.size / tokens.length : 0;
    }

    /* 2. every path in the file system, so name-only files are findable. */
    const lowerQuery = query.toLowerCase();
    const pathCache = new Map();
    for (const path of vfsPaths()) {
      let sets = pathCache.get(path);
      if (!sets) {
        sets = { name: new Set(tokenize(basename(path))), all: new Set(tokenize(path)) };
        pathCache.set(path, sets);
      }
      const substring = lowerQuery.length > 2 && path.toLowerCase().includes(lowerQuery);
      let points = 0, hits = 0;
      for (const token of tokens) {
        if (sets.name.has(token)) { points += 2.2; hits++; }
        else if (sets.all.has(token)) { points += 1.4; hits++; }
      }
      const complete = hits === tokens.length;
      if (!complete && !substring) continue;
      const result = entry(path);
      result.score += (complete ? points : 0) + (substring ? 1.2 * tokens.length : 0)
        + (sets.name.has(tokens[0]) ? 1.5 : 0);
      if (complete || substring) {
        tokens.forEach((token) => mark(result, token));
        result.coverage = 1;
        result.fromPath = true;      // the file's own name or path says it
      }
    }

    /* 3. the catalogs: an app you can launch outranks a file you can read. */
    const catalogHit = (item, kind, idField) => {
      const name = new Set(tokenize(item.name));
      const id = new Set(tokenize(item.id));
      const desc = new Set(tokenize(item.desc));
      let points = 0, hits = 0;
      for (const token of tokens) {
        if (name.has(token)) { points += 6; hits++; }
        else if (id.has(token)) { points += 5; hits++; }
        else if (desc.has(token)) { points += 2.2; hits++; }
      }
      if (!hits) return;
      const result = entry(item.path, kind);
      result.kind = kind;
      result[idField] = item.id;
      result.title = item.name;
      result.summary = item.desc || result.summary;
      result.icon = item.icon;
      result.svgIcon = item.svgIcon;
      result.score += points * (hits === tokens.length ? 1.6 : 0.7);
      for (const token of tokens) if (name.has(token) || id.has(token) || desc.has(token)) mark(result, token);
      result.coverage = Math.max(result.coverage, hits / tokens.length);
      result.fromCatalog = true;     // an app or website the catalog names
    };
    catalogApps().forEach((app) => catalogHit(app, 'app', 'appId'));
    catalogSites().forEach((site) => catalogHit(site, 'site', 'siteId'));

    /* 4. the caller's own internal pages (proton://home, proton://search, …). */
    for (const page of pages) {
      if (!page || !page.url) continue;
      const name = new Set(tokenize(page.name || page.url));
      const words = new Set(tokenize(page.desc || ''));
      let points = 0, hits = 0;
      for (const token of tokens) {
        if (name.has(token)) { points += 5; hits++; }
        else if (words.has(token) || String(page.url).toLowerCase().includes(lowerQuery)) { points += 2; hits++; }
      }
      if (!hits) continue;
      const result = entry(page.url, 'page');
      result.kind = 'page';
      result.title = page.name || page.url;
      result.summary = page.desc || result.summary;
      result.score += points * (hits === tokens.length ? 1.5 : 0.7);
      tokens.forEach((token) => mark(result, token));
      result.coverage = Math.max(result.coverage, hits / tokens.length);
      result.fromCatalog = true;     // one of proton's own pages, by name
    }

    const results = [...found.values()].map((result) => {
      delete result.perToken;
      result.answer = result.fromCatalog || result.fromPath || result.inTitle
        || result.inName || result.inSummary
        || result.occurrences >= answerThreshold(byPath.get(result.path));
      return result;
    });
    /* Every word accounted for beats a higher score on part of the query. */
    const band = (result) => (result.coverage >= 1 ? 2 : result.coverage > 0 ? 1 : 0);
    results.sort((a, b) => band(b) - band(a)
      || b.score - a.score
      || (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9)
      || String(a.title).localeCompare(String(b.title))
      || a.path.localeCompare(b.path));
    const shown = results.slice(0, limit);
    answers = shown.filter((result) => result.answer).length;
    return {
      query, tokens, results: shown, total: results.length,
      /* False when the word only turns up in passing: nothing in this
       * repository defines, explains or is about it. The Browser says so
       * instead of handing over a top result that only looks like an answer. */
      answer: answers > 0, answers, mentions: shown.length - answers,
      nearby: answers ? [] : nearby(query),
      ms: Date.now() - began,
    };
  }

  /* The closest words this repository does use, for the times it has nothing
   * to say about the one you typed: same opening letters, commonest first.
   * It is a word list, not a thesaurus — proton has no definitions to offer
   * and does not pretend to. */
  function nearby(query, limit = 8) {
    const terms = Object.keys(corpus().terms || {});
    const tokens = queryTokens(query);
    if (!tokens.length) return [];
    const out = [];
    for (const token of tokens) {
      /* Shorten the opening until the repository has something to offer:
       * "indemnify" finds "indemnification", "definition" finds whatever else
       * starts "defin…", then "def…", then "de…". */
      for (const length of [Math.max(3, token.length - 2), 5, 4, 3]) {
        if (length > token.length) continue;
        const seed = token.slice(0, length);
        const hits = [];
        for (const term of terms) {
          if (!term.startsWith(seed) || tokens.includes(term)) continue;
          hits.push({ word: term, docs: postings(term).size });
        }
        if (!hits.length) continue;
        for (const hit of hits) {
          const at = out.findIndex((item) => item.word === hit.word);
          if (at >= 0) out[at].docs += hit.docs;
          else out.push(hit);
        }
        break;                       // the longest opening that found anything
      }
    }
    return out.sort((a, b) => b.docs - a.docs || a.word.localeCompare(b.word)).slice(0, limit);
  }

  /* ---------------- address bar suggestions ---------------- */

  const LOOKS_LIKE_ADDRESS = /^(?:[a-z][\w+.-]*:|\/\/|\/|\.\/|\.\.\/|localhost)/i;

  function suggest(raw, options = {}) {
    const limit = Math.max(1, parseInt(options.limit, 10) || 8);
    const text = String(raw || '').trim();
    if (!text) return [];
    const lower = text.toLowerCase();
    const pages = Array.isArray(options.pages) ? options.pages : [];
    const history = Array.isArray(options.history) ? options.history : [];
    const bookmarks = Array.isArray(options.bookmarks) ? options.bookmarks : [];
    const out = [];
    const push = (item) => {
      if (!item || !item.label) return;
      if (out.some((other) => other.action === item.action && other.value === item.value)) return;
      out.push(item);
    };
    const searchSuggestion = () => push({
      label: text, sub: `Search proton for “${text}”`, icon: 'search', svgIcon: true,
      action: 'search', value: text,
    });

    /* Typing an address: complete paths in the file system and internal
     * pages, and offer to visit whatever it already is. */
    if (LOOKS_LIKE_ADDRESS.test(text)) {
      for (const page of pages) {
        if (page.url.toLowerCase().startsWith(lower)) push({
          label: page.url, sub: page.name || 'proton page', icon: 'home', svgIcon: true,
          action: 'goto', value: page.url,
        });
      }
      const stem = text.replace(/^file:\/\//i, '');
      for (const path of vfsPaths()) {
        if (out.length >= limit) break;
        if (!path.toLowerCase().startsWith(stem.toLowerCase())) continue;
        push({
          label: path, sub: 'File in this repository', icon: 'file', svgIcon: true,
          action: 'goto', value: 'file://' + path,
        });
      }
      for (const item of bookmarks.concat(history)) {
        if (out.length >= limit) break;
        const url = String(item.url || '');
        if (url.toLowerCase().startsWith(lower)) push({
          label: item.title || url, sub: url, icon: bookmarks.includes(item) ? 'star' : 'clock',
          svgIcon: true, action: 'goto', value: url,
        });
      }
      if (/^https?:\/\//i.test(text)) push({
        label: text, sub: 'Visit this address', icon: 'globe', svgIcon: true, action: 'goto', value: text,
      });
      return out.slice(0, limit);
    }

    /* Otherwise it is a search: offer the things a person usually means —
     * an app to open, a page to visit, something you were just reading, then
     * the words this repository actually uses. */
    for (const app of catalogApps()) {
      if (out.length >= limit) break;
      if (app.name.toLowerCase().startsWith(lower) || app.id.startsWith(lower)) push({
        label: app.name, sub: 'App', icon: app.icon, svgIcon: app.svgIcon, action: 'app', value: app.id,
      });
    }
    for (const site of catalogSites()) {
      if (out.length >= limit) break;
      if (site.name.toLowerCase().startsWith(lower) || site.id.startsWith(lower)) push({
        label: site.name, sub: 'Built-in website', icon: site.icon, svgIcon: site.svgIcon,
        action: 'site', value: site.id,
      });
    }
    for (const page of pages) {
      if (out.length >= limit) break;
      if ((page.name || '').toLowerCase().includes(lower) || page.url.toLowerCase().includes(lower)) push({
        label: page.name || page.url, sub: page.url, icon: 'home', svgIcon: true, action: 'goto', value: page.url,
      });
    }
    for (const item of bookmarks) {
      if (out.length >= limit) break;
      if (String(item.title || '').toLowerCase().includes(lower) || String(item.url || '').toLowerCase().includes(lower)) push({
        label: item.title || item.url, sub: 'Bookmark · ' + item.url, icon: 'star', svgIcon: true,
        action: 'goto', value: item.url,
      });
    }
    for (const item of history) {
      if (out.length >= limit) break;
      if (String(item.title || '').toLowerCase().includes(lower) || String(item.url || '').toLowerCase().includes(lower)) push({
        label: item.title || item.url, sub: 'Recent · ' + item.url, icon: 'clock', svgIcon: true,
        action: 'goto', value: item.url,
      });
    }
    /* Searching for exactly what was typed is always on offer — before the
     * completions below, which are only guesses about the last word. */
    searchSuggestion();
    /* Files by name: a prefix is what someone typing a file name means, and a
     * substring only once the query is long enough to be unambiguous. */
    for (const path of vfsPaths()) {
      if (out.length >= limit) break;
      const name = basename(path).toLowerCase();
      if (!name.startsWith(lower) && !(lower.length >= 4 && name.includes(lower))) continue;
      push({
        label: basename(path), sub: path, icon: 'file', svgIcon: true, action: 'goto', value: 'file://' + path,
      });
    }
    /* Then the repository's own vocabulary, commonest word first. */
    const terms = corpus().terms || {};
    const completions = Object.keys(terms)
      .filter((term) => term.startsWith(lower) && term !== lower)
      .map((term) => ({ term, docs: postings(term).size }))
      .sort((a, b) => b.docs - a.docs || a.term.length - b.term.length || a.term.localeCompare(b.term));
    for (const { term, docs: docHits } of completions) {
      if (out.length >= limit) break;
      push({
        label: term, sub: `Search for “${term}” · in ${docHits} file${docHits === 1 ? '' : 's'}`,
        icon: 'search', svgIcon: true, action: 'search', value: term,
      });
    }
    return out.slice(0, limit);
  }

  /* ---------------- readable text, highlighting, snippets ---------------- */

  const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };

  function decodeEntities(text) {
    return String(text || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body) => {
      if (body[0] === '#') {
        const code = parseInt(body[1] === 'x' || body[1] === 'X' ? body.slice(2) : body.slice(1), body[1] === '#' ? 10 : 16);
        return Number.isFinite(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : whole;
      }
      const named = ENTITIES[body.toLowerCase()];
      return named === undefined ? whole : named;
    });
  }

  /* Markup and comment punctuation stripped, whitespace collapsed: what a
   * person reading the file would see, which is what a snippet should quote.
   * keepScripts is for the second pass below — an app module IS its script
   * block, so dropping it would leave nothing but boilerplate to quote. */
  function readable(text, { keepScripts = false } = {}) {
    return decodeEntities(String(text || '')
      .replace(keepScripts ? /<style\b[\s\S]*?<\/style>/gi : /<(script|style|textarea)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\/\*+|\*+\//g, ' ')
      .replace(/^[ \t]*\*+[ \t]?/gm, ' ')
      .replace(/^[ \t]*(?:\/\/|#)[ \t]?/gm, ' ')
      .replace(/^#+[ \t]*/gm, ' ')
      .replace(/["'`|~_>]{2,}/g, ' ')
      .replace(/\s+/g, ' '))
      .trim();
  }

  function isHit(word, wanted) {
    const low = String(word || '').toLowerCase();
    if (wanted.has(stemToken(low.replace(/[^a-z0-9]/g, '')))) return true;
    for (const piece of low.match(WORD_RE) || []) if (wanted.has(stemToken(piece))) return true;
    return false;
  }

  /* Split text into runs, marking the words the query asked for. The caller
   * escapes every part and wraps the hits in <mark>, so nothing here can
   * inject markup into a page. */
  function highlight(text, tokens) {
    const wanted = new Set(tokens || []);
    const source = String(text || '');
    const parts = [];
    let last = 0;
    for (const match of source.matchAll(/[A-Za-z0-9][A-Za-z0-9'._-]*/g)) {
      if (!isHit(match[0], wanted)) continue;
      if (match.index > last) parts.push({ text: source.slice(last, match.index), hit: false });
      parts.push({ text: match[0], hit: true });
      last = match.index + match[0].length;
    }
    if (last < source.length) parts.push({ text: source.slice(last), hit: false });
    return parts;
  }

  /* A window of the document around its first real match — the reason a
   * result is a result. Falls back to the start of the file. */
  function snippet(text, tokens, radius = 120) {
    const wanted = new Set(tokens || []);
    const firstMatch = (clean) => {
      for (const match of clean.matchAll(/[A-Za-z0-9]+/g)) {
        if (wanted.has(stemToken(match[0].toLowerCase()))) return match.index;
      }
      return -1;
    };
    let clean = readable(text);
    let at = firstMatch(clean);
    if (at < 0) {
      /* No match in the visible text, so the word the index matched on lives
       * in the script or comment blocks — quote those instead of falling back
       * to a page's boilerplate. */
      const loose = readable(text, { keepScripts: true });
      const looseAt = firstMatch(loose);
      if (looseAt >= 0) { clean = loose; at = looseAt; }
    }
    if (!clean) return [];
    if (at < 0) return highlight(clean.slice(0, radius * 2), wanted);
    const from = Math.max(0, at - radius);
    const to = Math.min(clean.length, at + radius);
    const parts = highlight(clean.slice(from, to), wanted);
    if (from > 0) parts.unshift({ text: '… ', hit: false });
    if (to < clean.length) parts.push({ text: ' …', hit: false });
    return parts;
  }

  function stats() {
    const index = corpus();
    return { docs: index.docs.length, terms: Object.keys(index.terms || {}).length, version: index.v || 0 };
  }

  return {
    search, suggest, nearby, highlight, snippet, readable, stats,
    tokenize, stemToken, queryTokens, basename,
    catalogApps, catalogSites, vfsPaths, isStopword: (word) => STOPWORDS.has(String(word || '').toLowerCase()),
  };
})();
