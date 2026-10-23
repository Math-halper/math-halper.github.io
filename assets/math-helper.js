/* Math Helper — the working learning app on the cover page.
 *
 * Everything ordinary on the cover runs here, entirely in the browser:
 * skill search, grade browsing, generated practice questions with instant
 * marking, a six-question diagnostic that builds an action plan, personal
 * recommendations, awards, analytics, membership-plan selection and the
 * waitlist. Progress and waitlist entries are stored separately from the
 * desktop accounts under proton2.math-helper.v1 (see assets/store.js).
 * Joining the waitlist requires the site password, verified through
 * window.verifySitePassword (data/password.txt); a desktop account alone
 * never waitlists anyone.
 *
 * The one cover control deliberately left alone is the header Sign in
 * button — the desktop gate in assets/boot.js. It is not a Math Helper
 * action and is not needed to join the waitlist. */
'use strict';

(function initMathHelper() {
  const cover = document.getElementById('cover');
  const workspace = document.getElementById('math-helper-workspace');
  if (!cover || !workspace || typeof MH === 'undefined') return;

  const GRADES = [
    { label: 'Pre-K', count: 126 }, { label: 'K', count: 214 },
    { label: '1', count: 268 }, { label: '2', count: 301 },
    { label: '3', count: 356 }, { label: '4', count: 389 },
    { label: '5', count: 421 }, { label: '6', count: 398 },
    { label: '7', count: 365 }, { label: '8', count: 342 },
    { label: '9', count: 318 }, { label: '10', count: 296 },
    { label: '11', count: 274 }, { label: '12', count: 251 },
  ];

  const SKILLS = [
    { id: 'count-objects', title: 'Count and order to 20', grade: 'Pre-K', topic: 'Number sense', kind: 'count', blurb: 'Count objects, spot missing numbers and put numbers in order.', keywords: 'counting numbers order early years' },
    { id: 'place-value-tens', title: 'Tens and ones', grade: 'K', topic: 'Place value', kind: 'placeTens', blurb: 'Build two-digit numbers from tens and ones.', keywords: 'place value tens ones digits kindergarten' },
    { id: 'add-subtract-20', title: 'Add and subtract within 20', grade: '1', topic: 'Addition and subtraction', kind: 'addSub', blurb: 'Use number bonds and counting on to solve everyday problems.', keywords: 'addition subtraction number bonds grade 1' },
    { id: 'place-value-hundreds', title: 'Place value to hundreds', grade: '2', topic: 'Place value', kind: 'placeHundreds', blurb: 'Read, compare and build numbers with hundreds, tens and ones.', keywords: 'hundreds tens ones compare grade 2' },
    { id: 'times-tables', title: 'Times tables up to 12', grade: '3', topic: 'Multiplication', kind: 'multiply', blurb: 'Build speed and accuracy with multiplication facts.', keywords: 'multiplication times tables multiply grade 3' },
    { id: 'area-perimeter', title: 'Area and perimeter', grade: '4', topic: 'Geometry', kind: 'area', blurb: 'Work with rectangles, missing sides and real-world spaces.', keywords: 'geometry area perimeter rectangles grade 4' },
    { id: 'division-facts', title: 'Division facts and remainders', grade: '4', topic: 'Division', kind: 'divide', blurb: 'Share equally, divide by one-digit numbers and interpret remainders.', keywords: 'division divide sharing remainders grade 4' },
    { id: 'add-subtract-fractions', title: 'Add and subtract fractions', grade: '5', topic: 'Fractions', kind: 'fractionAdd', blurb: 'Practice with like and unlike denominators.', keywords: 'fractions add subtract denominators grade 5' },
    { id: 'multiply-fractions', title: 'Multiply fractions', grade: '5', topic: 'Fractions', kind: 'fractionMultiply', blurb: 'Multiply fractions and mixed quantities with confidence.', keywords: 'fractions multiply numerator denominator grade 5 recommended' },
    { id: 'decimal-place-value', title: 'Place value to thousandths', grade: '5', topic: 'Decimals', kind: 'decimal', blurb: 'Read, compare and round decimal numbers.', keywords: 'decimals place value thousandths rounding grade 5' },
    { id: 'ratios-rates', title: 'Ratios and unit rates', grade: '6', topic: 'Ratios', kind: 'ratio', blurb: 'Scale recipes, maps and mixtures while keeping ratios equivalent.', keywords: 'ratio rate proportion scale grade 6' },
    { id: 'data-summaries', title: 'Mean, median and mode', grade: '6', topic: 'Statistics', kind: 'data', blurb: 'Summarise data sets and read simple charts.', keywords: 'statistics mean median mode average data grade 6' },
    { id: 'two-step-equations', title: 'Solve two-step equations', grade: '7', topic: 'Algebra', kind: 'equationTwo', blurb: 'Undo operations in the right order to find the unknown.', keywords: 'algebra equations two step solve grade 7 recommended' },
    { id: 'linear-equations', title: 'Solve linear equations', grade: '8', topic: 'Algebra', kind: 'equationLinear', blurb: 'Balance equations with unknowns on both sides.', keywords: 'algebra linear equations solve grade 8' },
    { id: 'exponents-roots', title: 'Exponents and square roots', grade: '8', topic: 'Number sense', kind: 'exponent', blurb: 'Evaluate powers and connect square numbers with their roots.', keywords: 'exponents powers square roots grade 8' },
    { id: 'coordinate-lines', title: 'Lines on the coordinate plane', grade: '9', topic: 'Geometry', kind: 'coordinate', blurb: 'Find gradients and read points, lines and intercepts.', keywords: 'coordinate geometry gradient slope lines grade 9' },
    { id: 'functions-quadratics', title: 'Functions and quadratics', grade: '10', topic: 'Algebra', kind: 'function', blurb: 'Evaluate functions and explore quadratic patterns.', keywords: 'functions quadratics algebra evaluate grade 10' },
    { id: 'trigonometric-ratios', title: 'Trigonometric ratios', grade: '11', topic: 'Trigonometry', kind: 'trig', blurb: 'Use sine, cosine and tangent in right-angled triangles.', keywords: 'trigonometry sine cosine tangent triangles grade 11' },
    { id: 'probability-statistics', title: 'Probability and statistics', grade: '12', topic: 'Statistics', kind: 'probability', blurb: 'Compare chance, expected outcomes and combined events.', keywords: 'probability statistics chance expected grade 12' },
  ];
  const skillById = new Map(SKILLS.map((skill) => [skill.id, skill]));

  const DEFAULT_PROGRESS = {
    'multiply-fractions': 72,
    'two-step-equations': 45,
    'add-subtract-fractions': 72,
    'times-tables': 46,
    'linear-equations': 63,
    'area-perimeter': 28,
    'decimal-place-value': 84,
    'data-summaries': 57,
  };

  function defaultState() {
    return {
      version: 1,
      membershipPlan: 'Free',
      lastSkillId: 'multiply-fractions',
      selectedGrade: '',
      progress: { ...DEFAULT_PROGRESS },
      skillStats: {},
      answered: 0,
      correct: 0,
      points: 0,
      diagnostic: { completed: 0, lastScore: null, lastTotal: 0, lastAt: '', recommendedIds: [] },
      history: [],
      waitlist: [],
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const stored = MH.loadJSON(MH.MATH_HELPER_KEY, base);
      return {
        ...base,
        ...stored,
        progress: { ...base.progress, ...(stored.progress || {}) },
        skillStats: stored.skillStats || {},
        diagnostic: { ...base.diagnostic, ...(stored.diagnostic || {}) },
        history: Array.isArray(stored.history) ? stored.history : [],
        waitlist: Array.isArray(stored.waitlist) ? stored.waitlist : [],
      };
    } catch (err) {
      return base;
    }
  }

  let state = loadState();
  let practice = null;
  let diagnosticRun = null;

  const esc = (value) => MH.esc(value);
  const progressOf = (skillId) => Math.max(0, Math.min(100, Math.round(state.progress[skillId] || 0)));
  const statsOf = (skillId) => state.skillStats[skillId] || { answered: 0, correct: 0 };

  function saveState() {
    try { MH.saveJSON(MH.MATH_HELPER_KEY, state); } catch (err) { /* learning still works for this visit */ }
  }

  function updateStaticProgress() {
    cover.querySelectorAll('[data-progress-for]').forEach((bar) => {
      const fill = bar.querySelector('i');
      if (fill) fill.style.width = `${progressOf(bar.dataset.progressFor)}%`;
    });
    cover.querySelectorAll('[data-progress-label-for]').forEach((label) => {
      label.textContent = `${progressOf(label.dataset.progressLabelFor)}%`;
    });
  }

  function setWorkspace(html) {
    diagnosticRun = diagnosticRun && html.includes('cover-diagnostic-question') ? diagnosticRun : diagnosticRun;
    workspace.hidden = false;
    workspace.innerHTML = html;
    updateStaticProgress();
    try { workspace.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) { /* jsdom */ }
  }

  function showHome() {
    practice = null;
    diagnosticRun = null;
    workspace.hidden = true;
    workspace.innerHTML = '';
    try { cover.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) { cover.scrollTop = 0; }
    updateStaticProgress();
  }

  function skillCard(skill, buttonText = 'Practice skill') {
    const progress = progressOf(skill.id);
    const stats = statsOf(skill.id);
    const detail = stats.answered
      ? `${stats.correct}/${stats.answered} correct · ${progress}% mastery`
      : `Grade ${skill.grade} · Not started yet`;
    return `<article class="cover-skill cover-workspace-skill">
      <span class="cover-skill-tag">${esc(skill.topic)}</span>
      <h3>${esc(skill.title)}</h3>
      <p>${esc(skill.blurb)}</p>
      <p class="cover-skill-meta">${esc(detail)}</p>
      <div class="cover-progress" data-progress-for="${esc(skill.id)}"><i style="width:${progress}%"></i></div>
      <button type="button" class="cover-btn" data-cover-skill="${esc(skill.id)}">${esc(buttonText)}</button>
    </article>`;
  }

  function skillGrid(skills, emptyMessage) {
    if (!skills.length) return `<p class="cover-empty">${esc(emptyMessage)}</p>`;
    return `<div class="cover-skill-grid cover-workspace-grid">${skills.map((skill) => skillCard(skill)).join('')}</div>`;
  }

  function recommendedSkills(limit = 6) {
    const planned = (state.diagnostic.recommendedIds || [])
      .map((id) => skillById.get(id))
      .filter(Boolean);
    const rest = [...SKILLS]
      .filter((skill) => !planned.includes(skill))
      .sort((a, b) => progressOf(a.id) - progressOf(b.id) || a.title.localeCompare(b.title));
    return [...planned, ...rest].slice(0, limit);
  }

  function summaryChips() {
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    return `<div class="cover-stat-grid">
      <div><strong>${state.answered}</strong><span>Questions answered</span></div>
      <div><strong>${accuracy}%</strong><span>Accuracy</span></div>
      <div><strong>${state.points}</strong><span>Learning points</span></div>
      <div><strong>${esc(state.membershipPlan)}</strong><span>Current plan</span></div>
    </div>`;
  }

  function showLearning() {
    practice = null; diagnosticRun = null;
    const recommendations = recommendedSkills(6);
    setWorkspace(`<div class="cover-workspace-head">
        <div><p class="cover-eyebrow">Learning</p><h2>Your next steps</h2>
        <p>Recommendations combine your diagnostic plan with the skills that need the most practice.</p></div>
        <button type="button" class="cover-btn cover-btn-primary" data-cover-action="resume">Resume practice</button>
      </div>
      ${summaryChips()}
      <h3 class="cover-workspace-subtitle">Recommended for you</h3>
      ${skillGrid(recommendations)}
      <div class="cover-workspace-actions">
        <button type="button" class="cover-btn" data-cover-action="all-skills">Browse all skills</button>
        <button type="button" class="cover-btn" data-cover-action="all-grades">Browse by grade</button>
        <button type="button" class="cover-btn" data-cover-action="start-diagnostic">Retake diagnostic</button>
      </div>`);
  }

  function showAllGrades() {
    practice = null; diagnosticRun = null;
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Learning</p><h2>All grades</h2>
      <p>Choose a grade to see focused practice paths and start any skill.</p></div></div>
      <div class="cover-grades cover-workspace-grades">${GRADES.map((grade) => `
        <button type="button" data-grade="${esc(grade.label)}"><strong>${esc(grade.label)}</strong><small>${grade.count} skills</small></button>`).join('')}
      </div>`);
  }

  function showGrade(gradeLabel) {
    practice = null; diagnosticRun = null;
    state.selectedGrade = gradeLabel;
    saveState();
    const skills = SKILLS.filter((skill) => skill.grade === gradeLabel);
    const grade = GRADES.find((item) => item.label === gradeLabel);
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Grade ${esc(gradeLabel)}</p>
      <h2>Grade ${esc(gradeLabel)} maths</h2><p>${grade ? `${grade.count} skills across number, algebra, geometry, data and problem solving.` : ''} Start with the lowest mastery skill or pick a favourite topic.</p></div>
      <button type="button" class="cover-btn" data-cover-action="all-grades">All grades</button></div>
      ${skillGrid(skills, 'New skills for this grade are being prepared. Try a nearby grade or take the diagnostic.')}`);
  }

  function showAllSkills() {
    practice = null; diagnosticRun = null;
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Learning</p><h2>All skills</h2>
      <p>Every practice path in this local Math Helper library, from early counting to probability.</p></div>
      <button type="button" class="cover-btn cover-btn-primary" data-cover-action="start-diagnostic">Find my level</button></div>
      ${skillGrid(SKILLS)}`);
  }

  function showSearch(query) {
    practice = null; diagnosticRun = null;
    const q = String(query || '').trim().toLowerCase();
    if (!q) { showAllSkills(); return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const results = SKILLS.filter((skill) => {
      const haystack = `${skill.title} ${skill.topic} grade ${skill.grade} ${skill.keywords}`.toLowerCase();
      return terms.every((term) => haystack.includes(term.replace(/^grades$/, 'grade')));
    });
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Search</p>
      <h2>Results for “${esc(query.trim())}”</h2><p>${results.length} matching ${results.length === 1 ? 'skill' : 'skills'}.</p></div>
      <button type="button" class="cover-btn" data-cover-action="all-skills">See all skills</button></div>
      ${results.length ? skillGrid(results) : `<div class="cover-empty"><p>No skills matched that search. Try “fractions”, “algebra”, “geometry” or “grade 5”.</p>
        <button type="button" class="cover-btn cover-btn-primary" data-cover-action="start-diagnostic">Take a diagnostic instead</button></div>`}`);
  }

  /* ----- Generated questions ------------------------------------------- */

  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  function fraction(numerator, denominator) {
    const divisor = gcd(numerator, denominator) || 1;
    const n = numerator / divisor; const d = denominator / divisor;
    return d === 1 ? String(n) : `${n}/${d}`;
  }
  function numericChoices(answer, step) {
    const candidates = [answer, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10];
    const unique = [];
    candidates.forEach((value) => { if (!unique.includes(value)) unique.push(value); });
    const choices = unique.slice(0, 4).map(String);
    const rotate = Math.abs(step) % choices.length;
    return choices.slice(rotate).concat(choices.slice(0, rotate));
  }
  function stringChoices(answer, distractors, step) {
    const choices = [...new Set([answer, ...distractors])].slice(0, 4).map(String);
    const rotate = Math.abs(step) % choices.length;
    return choices.slice(rotate).concat(choices.slice(0, rotate));
  }
  function question(prompt, answer, choices, explanation) {
    return { prompt, answer: String(answer), choices: choices.map(String), explanation };
  }

  function makeQuestion(skill, step) {
    const n = Math.abs(Math.floor(step) || 0);
    const a = 2 + (n % 8);
    const b = 3 + ((n * 2) % 9);
    switch (skill.kind) {
      case 'count': {
        const start = 2 + (n % 12);
        return question(`Which number comes next? ${start}, ${start + 1}, ${start + 2}, ___`, start + 3, numericChoices(start + 3, n), 'Count forward by one each time.');
      }
      case 'placeTens': {
        const tens = 2 + (n % 8); const ones = 1 + (n % 9);
        return question(`What number is made from ${tens} tens and ${ones} ones?`, tens * 10 + ones, numericChoices(tens * 10 + ones, n), `${tens} tens make ${tens * 10}, then add ${ones} ones.`);
      }
      case 'addSub': {
        if (n % 2) return question(`What is ${a + 5} − ${b}?`, a + 5 - b, numericChoices(a + 5 - b, n), 'Count back or use a known number bond.');
        return question(`What is ${a + 4} + ${b}?`, a + b + 4, numericChoices(a + b + 4, n), 'Add the ones, then check the tens.');
      }
      case 'placeHundreds': {
        const number = 100 * (2 + (n % 7)) + 10 * (n % 9) + (1 + (n % 8));
        return question(`In ${number}, what is the value of the tens digit?`, Math.floor((number % 100) / 10) * 10, numericChoices(Math.floor((number % 100) / 10) * 10, n), 'The tens digit sits in the middle and is worth ten times its digit.');
      }
      case 'multiply':
        return question(`What is ${a} × ${b}?`, a * b, numericChoices(a * b, n), `Use repeated addition or a known fact: ${a} × ${b} = ${a * b}.`);
      case 'divide': {
        const quotient = 3 + (n % 9); const divisor = 2 + (n % 8);
        return question(`What is ${divisor * quotient} ÷ ${divisor}?`, quotient, numericChoices(quotient, n), `Think multiplication: ${divisor} × ${quotient} = ${divisor * quotient}.`);
      }
      case 'area': {
        const length = 3 + (n % 9); const width = 2 + (n % 7);
        if (n % 2) return question(`A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter?`, 2 * (length + width), numericChoices(2 * (length + width), n), 'Perimeter adds every side: double the length plus double the width.');
        return question(`A rectangle is ${length} m long and ${width} m wide. What is its area in square metres?`, length * width, numericChoices(length * width, n), 'Area of a rectangle = length × width.');
      }
      case 'fractionAdd': {
        const den = [2, 3, 4, 6][n % 4]; const other = [3, 4, 6, 8][n % 4];
        const num = 1 + (n % 3); const num2 = 1 + ((n + 1) % 3);
        const answer = fraction(num * other + num2 * den, den * other);
        return question(`What is ${num}/${den} + ${num2}/${other}?`, answer,
          stringChoices(answer, [fraction(num + num2, den + other), fraction(num * other + num2 * den + 1, den * other), fraction(num * other + num2 * den - 1, den * other)], n),
          `Use the common denominator ${den * other}, add the numerators, then simplify.`);
      }
      case 'fractionMultiply': {
        const den = 2 + (n % 6); const den2 = 3 + (n % 5);
        const answer = fraction(a, den) && fraction(a * b, den * den2);
        return question(`What is ${a}/${den} × ${b}/${den2}?`, answer,
          stringChoices(answer, [fraction(a * b + 1, den * den2), fraction(a * b, den + den2), fraction(a + b, den * den2)], n),
          'Multiply the numerators together and the denominators together, then simplify.');
      }
      case 'decimal': {
        const number = `${2 + (n % 7)}.${n % 9}${(n + 3) % 9}${(n + 5) % 9}`;
        const digit = Number(number.split('.')[1][2]);
        return question(`In ${number}, which digit is in the thousandths place?`, digit, numericChoices(digit, n), 'After the decimal point: tenths, hundredths, then thousandths.');
      }
      case 'ratio': {
        const scale = 2 + (n % 5); const left = 2 + (n % 6);
        return question(`A ratio is ${left}:${left + 2}. Scale both parts by ${scale}. What is the new first part?`, left * scale, numericChoices(left * scale, n), 'Multiply every part of a ratio by the same scale factor.');
      }
      case 'data': {
        const values = [4 + (n % 3), 6, 8, 10 - (n % 2), 12].sort((x, y) => x - y);
        const mode = n % 3;
        if (mode === 0) { const mean = values.reduce((sum, v) => sum + v, 0) / values.length; return question(`What is the mean of ${values.join(', ')}?`, mean, numericChoices(mean, n), 'Add all values, then divide by how many there are.'); }
        if (mode === 1) return question(`What is the median of ${values.join(', ')}?`, values[2], numericChoices(values[2], n), 'The median is the middle value when the data are ordered.');
        return question(`What is the range of ${values.join(', ')}?`, values[4] - values[0], numericChoices(values[4] - values[0], n), 'Range = greatest value − smallest value.');
      }
      case 'equationTwo': {
        const x = 2 + (n % 9); const coeff = 2 + (n % 5); const add = 3 + (n % 8);
        return question(`Solve ${coeff}x + ${add} = ${coeff * x + add}. What is x?`, x, numericChoices(x, n), `Subtract ${add} from both sides, then divide by ${coeff}.`);
      }
      case 'equationLinear': {
        const x = 2 + (n % 8); const coeff = 3 + (n % 4); const other = 1 + (n % 3);
        const constant = coeff * x - other * x + 4;
        return question(`Solve ${coeff}x + 4 = ${other}x + ${constant}. What is x?`, x, numericChoices(x, n), 'Collect x terms on one side and numbers on the other, then divide.');
      }
      case 'exponent': {
        if (n % 2) { const root = 3 + (n % 9); return question(`What is √${root * root}?`, root, numericChoices(root, n), `${root} × ${root} = ${root * root}, so the square root is ${root}.`); }
        const power = 2 + (n % 3); const answer = Math.pow(a, power);
        return question(`What is ${a}^${power}?`, answer, numericChoices(answer, n), `Multiply ${a} by itself ${power} times.`);
      }
      case 'coordinate': {
        const x1 = n % 4; const y1 = 1 + (n % 5); const slope = 1 + (n % 5); const x2 = x1 + 3; const y2 = y1 + slope * 3;
        return question(`What is the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, slope, numericChoices(slope, n), 'Gradient = change in y ÷ change in x.');
      }
      case 'function': {
        const x = 2 + (n % 6); const answer = x * x + 2 * x + 1;
        return question(`If f(x) = x² + 2x + 1, what is f(${x})?`, answer, numericChoices(answer, n), `Substitute ${x}: ${x}² + 2(${x}) + 1 = ${answer}.`);
      }
      case 'trig': {
        const options = [['sin 30°', '1/2'], ['cos 60°', '1/2'], ['tan 45°', '1'], ['sin 90°', '1']];
        const [label, answer] = options[n % options.length];
        return question(`What is ${label}?`, answer, stringChoices(answer, ['0', '√3/2', '2'], n), 'Use the exact values for common angles in a right-angled triangle.');
      }
      case 'probability': {
        const red = 2 + (n % 5); const blue = 3 + (n % 4); const answer = fraction(red, red + blue);
        return question(`A bag has ${red} red and ${blue} blue counters. What is the probability of choosing red?`, answer,
          stringChoices(answer, [fraction(blue, red + blue), fraction(red, blue), fraction(red + 1, red + blue)], n),
          'Probability = favourable outcomes ÷ total outcomes, then simplify.');
      }
      default:
        return question(`What is ${a} + ${b}?`, a + b, numericChoices(a + b, n), 'Add carefully using place value.');
    }
  }

  function questionHtml(item, kind, label) {
    return `<div class="cover-question-card ${kind === 'diagnostic' ? 'cover-diagnostic-question' : ''}">
      <p class="cover-eyebrow">${esc(label)}</p>
      <h3>${esc(item.prompt)}</h3>
      <div class="cover-choice-grid">${item.choices.map((choice) => `
        <button type="button" data-answer="${esc(choice)}">${esc(choice)}</button>`).join('')}
      </div>
    </div>`;
  }

  /* ----- Practice ------------------------------------------------------- */

  function startPractice(skillId) {
    const skill = skillById.get(skillId) || recommendedSkills(1)[0] || SKILLS[0];
    diagnosticRun = null;
    state.lastSkillId = skill.id;
    saveState();
    const step = statsOf(skill.id).answered || 0;
    practice = { skillId: skill.id, step, question: makeQuestion(skill, step), answered: null, sessionAnswered: 0, sessionCorrect: 0 };
    renderPractice();
  }

  function renderPractice(feedback = '') {
    if (!practice) return;
    const skill = skillById.get(practice.skillId);
    const progress = progressOf(skill.id);
    const answered = practice.answered !== null;
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Practice · Grade ${esc(skill.grade)} · ${esc(skill.topic)}</p>
      <h2>${esc(skill.title)}</h2><p>${esc(skill.blurb)}</p></div>
      <button type="button" class="cover-btn" data-cover-action="recommendations">All recommendations</button></div>
      <div class="cover-progress cover-mastery"><i style="width:${progress}%"></i></div>
      <p class="cover-skill-meta">Mastery ${progress}% · Session ${practice.sessionCorrect}/${practice.sessionAnswered} correct</p>
      ${questionHtml(practice.question, 'practice', `Question ${practice.step + 1}`)}
      ${feedback}
      ${answered ? `<div class="cover-workspace-actions">
        <button type="button" class="cover-btn cover-btn-primary" data-cover-action="next-question">Next question</button>
        <button type="button" class="cover-btn" data-cover-action="finish-practice">Finish practice</button>
        <button type="button" class="cover-btn" data-cover-action="analytics">View analytics</button></div>` : ''}`);
    if (answered) {
      workspace.querySelectorAll('[data-answer]').forEach((button) => {
        button.disabled = true;
        if (button.dataset.answer === practice.question.answer) button.classList.add('cover-choice-correct');
        else if (button.dataset.answer === practice.answered) button.classList.add('cover-choice-wrong');
      });
    }
  }

  function answerPractice(choice) {
    if (!practice || practice.answered !== null) return;
    const skill = skillById.get(practice.skillId);
    const correct = choice === practice.question.answer;
    practice.answered = choice;
    practice.sessionAnswered += 1;
    if (correct) practice.sessionCorrect += 1;
    const stats = statsOf(skill.id);
    stats.answered += 1;
    if (correct) stats.correct += 1;
    state.skillStats[skill.id] = stats;
    state.answered += 1;
    if (correct) { state.correct += 1; state.points += 10; }
    state.progress[skill.id] = Math.max(0, Math.min(100, progressOf(skill.id) + (correct ? 12 : -4)));
    state.history.unshift({ skillId: skill.id, correct, at: Date.now() });
    state.history = state.history.slice(0, 12);
    saveState();
    renderPractice(`<div class="cover-feedback ${correct ? 'cover-feedback-good' : 'cover-feedback-bad'}" role="status">
      <strong>${correct ? 'Correct — great work!' : 'Not quite.'}</strong>
      <p>The answer is ${esc(practice.question.answer)}. ${esc(practice.question.explanation)}</p></div>`);
  }

  function nextPracticeQuestion() {
    if (!practice) return;
    practice.step += 1;
    practice.question = makeQuestion(skillById.get(practice.skillId), practice.step);
    practice.answered = null;
    renderPractice();
  }

  /* ----- Diagnostic ------------------------------------------------------ */

  const DIAGNOSTIC_SKILL_IDS = ['add-subtract-20', 'times-tables', 'multiply-fractions', 'area-perimeter', 'two-step-equations', 'data-summaries'];

  function startDiagnostic() {
    practice = null;
    diagnosticRun = { index: 0, answers: [], question: null };
    renderDiagnosticQuestion();
  }

  function renderDiagnosticQuestion() {
    const skill = skillById.get(DIAGNOSTIC_SKILL_IDS[diagnosticRun.index]);
    diagnosticRun.question = makeQuestion(skill, state.diagnostic.completed * 3 + diagnosticRun.index);
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Diagnostic</p>
      <h2>Find your next steps</h2><p>Answer six short questions. Math Helper will turn the results into a personal action plan.</p></div>
      <span class="cover-badge">Question ${diagnosticRun.index + 1} of ${DIAGNOSTIC_SKILL_IDS.length}</span></div>
      <div class="cover-progress cover-mastery"><i style="width:${Math.round((diagnosticRun.index / DIAGNOSTIC_SKILL_IDS.length) * 100)}%"></i></div>
      ${questionHtml(diagnosticRun.question, 'diagnostic', `Grade ${skill.grade} · ${skill.title}`)}`);
  }

  function answerDiagnostic(choice) {
    if (!diagnosticRun || !diagnosticRun.question) return;
    const skillId = DIAGNOSTIC_SKILL_IDS[diagnosticRun.index];
    diagnosticRun.answers.push({ skillId, correct: choice === diagnosticRun.question.answer });
    diagnosticRun.index += 1;
    if (diagnosticRun.index < DIAGNOSTIC_SKILL_IDS.length) { renderDiagnosticQuestion(); return; }
    const correct = diagnosticRun.answers.filter((answer) => answer.correct).length;
    const wrongIds = diagnosticRun.answers.filter((answer) => !answer.correct).map((answer) => answer.skillId);
    const fallback = [...SKILLS].sort((a, b) => progressOf(a.id) - progressOf(b.id)).slice(0, 3).map((skill) => skill.id);
    state.diagnostic.completed += 1;
    state.diagnostic.lastScore = correct;
    state.diagnostic.lastTotal = DIAGNOSTIC_SKILL_IDS.length;
    state.diagnostic.lastAt = new Date().toISOString();
    state.diagnostic.recommendedIds = [...new Set([...wrongIds, ...fallback])].slice(0, 4);
    if (correct) state.points += correct * 5;
    const answers = diagnosticRun.answers;
    diagnosticRun = null;
    saveState();
    const recommended = state.diagnostic.recommendedIds.map((id) => skillById.get(id)).filter(Boolean);
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Diagnostic complete</p>
      <h2>You scored ${correct}/${DIAGNOSTIC_SKILL_IDS.length}</h2>
      <p>Your action plan starts with the skills below. They have been saved to your recommendations.</p></div>
      <span class="cover-badge">${Math.round((correct / DIAGNOSTIC_SKILL_IDS.length) * 100)}%</span></div>
      <div class="cover-diagnostic-results">${answers.map((answer) => { const skill = skillById.get(answer.skillId); return `<p><strong>${esc(skill.title)}</strong><span>${answer.correct ? 'Secure for now' : 'Practice next'}</span></p>`; }).join('')}</div>
      <h3 class="cover-workspace-subtitle">Your action plan</h3>
      ${skillGrid(recommended)}
      <div class="cover-workspace-actions"><button type="button" class="cover-btn" data-cover-action="analytics">Open analytics</button>
      <button type="button" class="cover-btn" data-cover-action="start-diagnostic">Retake diagnostic</button></div>`);
  }

  /* ----- Awards, analytics, membership and information ------------------- */

  function awardList() {
    const attemptedSkills = Object.values(state.skillStats).filter((stats) => stats.answered > 0).length;
    const mastered = SKILLS.filter((skill) => progressOf(skill.id) >= 90).length;
    return [
      { name: 'First Steps', detail: 'Answer your first practice question.', earned: state.answered >= 1 },
      { name: 'Getting Warm', detail: 'Get 5 questions correct.', earned: state.correct >= 5 },
      { name: 'Sharp Solver', detail: 'Get 15 questions correct.', earned: state.correct >= 15 },
      { name: 'Math Star', detail: 'Earn 150 learning points.', earned: state.points >= 150 },
      { name: 'Skill Builder', detail: 'Practice at least 3 different skills.', earned: attemptedSkills >= 3 },
      { name: 'Mastery Maker', detail: 'Reach 90% mastery in any skill.', earned: mastered >= 1 },
      { name: 'Diagnostic Explorer', detail: 'Complete a Math Helper diagnostic.', earned: state.diagnostic.completed >= 1 },
    ];
  }

  function showAwards() {
    practice = null; diagnosticRun = null;
    const awards = awardList();
    const earned = awards.filter((award) => award.earned).length;
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Awards</p><h2>Awards and certificates</h2>
      <p>You have earned ${earned} of ${awards.length} awards. Keep practising to unlock the rest.</p></div>
      <button type="button" class="cover-btn cover-btn-primary" data-cover-action="start-practice">Earn more points</button></div>
      <div class="cover-award-grid">${awards.map((award) => `<article class="${award.earned ? 'cover-award-earned' : ''}">
        <span>${iconSvg(award.earned ? 'trophy' : 'lock')} ${award.earned ? 'Earned' : 'Locked'}</span><h3>${esc(award.name)}</h3><p>${esc(award.detail)}</p></article>`).join('')}</div>`);
  }

  function showAnalytics() {
    practice = null; diagnosticRun = null;
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    const mastered = SKILLS.filter((skill) => progressOf(skill.id) >= 90).length;
    const topics = [...new Set(SKILLS.map((skill) => skill.topic))].map((topic) => {
      const skills = SKILLS.filter((skill) => skill.topic === topic);
      const average = Math.round(skills.reduce((sum, skill) => sum + progressOf(skill.id), 0) / skills.length);
      const answered = skills.reduce((sum, skill) => sum + statsOf(skill.id).answered, 0);
      return { topic, average, answered };
    }).sort((a, b) => a.average - b.average);
    const weakest = [...SKILLS].sort((a, b) => progressOf(a.id) - progressOf(b.id)).slice(0, 5);
    const diagnosticText = state.diagnostic.completed
      ? `Last diagnostic: ${state.diagnostic.lastScore}/${state.diagnostic.lastTotal} · ${state.diagnostic.completed} completed`
      : 'No diagnostic completed yet.';
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Analytics</p><h2>Progress reports</h2>
      <p>${esc(diagnosticText)}</p></div><button type="button" class="cover-btn" data-cover-action="awards">See awards</button></div>
      <div class="cover-stat-grid">
        <div><strong>${state.answered}</strong><span>Questions answered</span></div>
        <div><strong>${state.correct}</strong><span>Correct answers</span></div>
        <div><strong>${accuracy}%</strong><span>Accuracy</span></div>
        <div><strong>${mastered}</strong><span>Skills mastered</span></div>
      </div>
      <h3 class="cover-workspace-subtitle">Growth by topic</h3>
      <div class="cover-topic-list">${topics.map((item) => `<div><span>${esc(item.topic)} <small>${item.answered} answered</small></span>
        <div class="cover-progress"><i style="width:${item.average}%"></i></div><strong>${item.average}%</strong></div>`).join('')}</div>
      <h3 class="cover-workspace-subtitle">Practice next</h3>
      ${skillGrid(weakest)}
      ${state.history.length ? `<h3 class="cover-workspace-subtitle">Recent activity</h3><div class="cover-history">${state.history.slice(0, 5).map((item) => { const skill = skillById.get(item.skillId); return `<p><strong>${esc(skill ? skill.title : 'Practice')}</strong><span>${item.correct ? 'Correct' : 'Reviewed'}</span></p>`; }).join('')}</div>` : ''}`);
  }

  function showMembership() {
    practice = null; diagnosticRun = null;
    const plans = [
      { name: 'Free', price: '$0', detail: 'Practice library, progress tracking and one diagnostic plan on this device.', waitlist: false },
      { name: 'Family', price: '$8/month', detail: 'Everything in Free, plus family goals, printable certificates and weekly progress summaries. Join the waitlist to be first in line.', waitlist: true },
      { name: 'Classroom', price: '$15/month', detail: 'Everything in Family, plus classroom groups, assignments and class analytics. Join the waitlist to be first in line.', waitlist: true },
    ];
    const waitlisted = (name) => state.waitlist.some((entry) => entry.plan === name);
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Membership</p><h2>Choose your Math Helper plan</h2>
      <p>Your current plan is <strong>${esc(state.membershipPlan)}</strong>. The Free plan is active instantly on this device. Family and Classroom are not open yet — join the waitlist to hold your place. Joining needs the site password; having a desktop account alone is not enough.</p></div></div>
      <div class="cover-plan-grid">${plans.map((plan) => `<article class="${state.membershipPlan === plan.name ? 'cover-plan-current' : ''}">
        <span class="cover-skill-tag">${esc(plan.name)}</span><h3>${esc(plan.price)}</h3><p>${esc(plan.detail)}</p>
        ${plan.waitlist
          ? (waitlisted(plan.name)
            ? `<button type="button" class="cover-btn" disabled>On the waitlist</button>`
            : `<button type="button" class="cover-btn cover-btn-primary" data-waitlist-plan="${esc(plan.name)}">Join the ${esc(plan.name)} waitlist</button>`)
          : `<button type="button" class="cover-btn ${state.membershipPlan === plan.name ? '' : 'cover-btn-primary'}" data-plan="${esc(plan.name)}" ${state.membershipPlan === plan.name ? 'disabled' : ''}>${state.membershipPlan === plan.name ? 'Current plan' : `Choose ${esc(plan.name)}`}</button>`}
        </article>`).join('')}</div>
      <div class="cover-workspace-actions">
        <button type="button" class="cover-btn" data-cover-action="waitlist">Join the waitlist</button>
        ${state.waitlist.length ? `<button type="button" class="cover-btn" data-cover-action="waitlist">View waitlist (${state.waitlist.length})</button>` : ''}
      </div>
      ${state.waitlist.length ? `<div class="cover-waitlist-summary"><h3>You are on the waitlist</h3>${state.waitlist.map((entry, i) => `<p><strong>#${i + 1}</strong> ${esc(entry.plan)} — ${esc(entry.name)} (${esc(entry.email)})</p>`).join('')}</div>` : ''}`);
  }

  function showWaitlist(selectedPlan, message, values) {
    practice = null; diagnosticRun = null;
    const plan = ['Family', 'Classroom'].includes(selectedPlan) ? selectedPlan : 'Family';
    const vals = values || {};
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">Waitlist</p><h2>Join the Math Helper waitlist</h2>
      <p>Family and Classroom memberships open soon. Add your name and email, choose a plan, and enter the site password to hold your place. A desktop account on its own does <em>not</em> join the waitlist — the password is what confirms your spot.</p></div></div>
      <form id="waitlist-form" class="cover-waitlist-form">
        <label>Your name <input id="waitlist-name" name="name" type="text" autocomplete="name" required value="${esc(vals.name || '')}"></label>
        <label>Email <input id="waitlist-email" name="email" type="email" autocomplete="email" required value="${esc(vals.email || '')}"></label>
        <label>Plan <select id="waitlist-plan" name="plan">
          <option value="Family" ${plan === 'Family' ? 'selected' : ''}>Family — $8/month</option>
          <option value="Classroom" ${plan === 'Classroom' ? 'selected' : ''}>Classroom — $15/month</option>
        </select></label>
        <label>Site password <input id="waitlist-password" name="password" type="password" autocomplete="off" required></label>
        <button type="submit" class="cover-btn cover-btn-primary">Join waitlist</button>
      </form>
      ${message ? `<p class="cover-waitlist-message ${message.ok ? 'cover-feedback-good' : 'cover-feedback-bad'}" role="status">${esc(message.text)}</p>` : ''}
      ${state.waitlist.length ? `<div class="cover-waitlist-summary"><h3>On the waitlist (${state.waitlist.length})</h3>
        ${state.waitlist.map((entry, i) => `<p><strong>#${i + 1}</strong> ${esc(entry.plan)} — ${esc(entry.name)} (${esc(entry.email)}) <button type="button" class="cover-btn cover-btn-small" data-waitlist-remove="${i}">Remove</button></p>`).join('')}
        <p class="cover-waitlist-note">Waitlist entries are stored only in this browser, alongside your Math Helper progress. Creating or signing in to a desktop account does not change this list.</p></div>`
        : `<p class="cover-waitlist-note">Nobody is on the waitlist yet on this device.</p>`}`);
  }

  async function joinWaitlist() {
    const nameEl = workspace.querySelector('#waitlist-name');
    const emailEl = workspace.querySelector('#waitlist-email');
    const planEl = workspace.querySelector('#waitlist-plan');
    const passwordEl = workspace.querySelector('#waitlist-password');
    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
    const plan = planEl && ['Family', 'Classroom'].includes(planEl.value) ? planEl.value : 'Family';
    const password = passwordEl ? passwordEl.value : '';
    const values = { name, email };
    if (!name || !email) {
      showWaitlist(plan, { ok: false, text: 'Add your name and email to join the waitlist.' }, values);
      return;
    }
    if (!password) {
      showWaitlist(plan, { ok: false, text: 'Enter the site password to join the waitlist. An account alone is not enough.' }, values);
      return;
    }
    /* The gate: the same site password as data/password.txt, checked by the
     * verifier boot.js publishes. Without it, nothing is added. */
    let ok = false;
    try {
      ok = typeof window.verifySitePassword === 'function' &&
        await window.verifySitePassword(password);
    } catch (err) {
      ok = false;
    }
    if (!ok) {
      showWaitlist(plan, { ok: false, text: 'That password isn\'t right, so you have not been added to the waitlist.' }, values);
      return;
    }
    const existing = state.waitlist.findIndex((entry) => entry.email === email);
    if (existing >= 0) {
      state.waitlist[existing] = { ...state.waitlist[existing], name, plan, joinedAt: state.waitlist[existing].joinedAt || new Date().toISOString() };
      saveState();
      showWaitlist(plan, { ok: true, text: `You're on the waitlist, ${name} — position #${existing + 1} for the ${plan} plan.` }, values);
      return;
    }
    state.waitlist.push({ name, email, plan, joinedAt: new Date().toISOString() });
    saveState();
    showWaitlist(plan, { ok: true, text: `You're on the waitlist, ${name} — position #${state.waitlist.length} for the ${plan} plan.` }, values);
  }

  function removeWaitlist(index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.waitlist.length) return;
    state.waitlist.splice(index, 1);
    saveState();
    showWaitlist('Family', { ok: true, text: 'Removed from the waitlist.' });
  }

  function showInfo(kind) {
    practice = null; diagnosticRun = null;
    const pages = {
      about: { eyebrow: 'About', title: 'About Math Helper', body: 'Math Helper is a local maths-practice library for Pre-K to Year 12. It generates questions, marks them instantly, remembers progress on this device and turns diagnostic answers into a personal action plan.' },
      help: { eyebrow: 'Help centre', title: 'How Math Helper works', body: 'Search for a skill, browse by grade, or take the diagnostic. Choose an answer to get instant feedback and an explanation. Recommendations update from your mastery, accuracy and diagnostic plan. Use Analytics to see growth by topic and Awards to track milestones.' },
      privacy: { eyebrow: 'Privacy', title: 'Your learning stays on this device', body: 'Practice progress, diagnostic plans, membership selection and waitlist entries are stored only in this browser under the proton2.math-helper.v1 key. Nothing is sent to a server. Clearing browser storage removes the learning record and the waitlist.' },
    };
    const page = pages[kind] || pages.about;
    setWorkspace(`<div class="cover-workspace-head"><div><p class="cover-eyebrow">${esc(page.eyebrow)}</p><h2>${esc(page.title)}</h2><p>${esc(page.body)}</p></div></div>
      <div class="cover-workspace-actions">
        <button type="button" class="cover-btn cover-btn-primary" data-cover-action="start-practice">Start practicing</button>
        <button type="button" class="cover-btn" data-cover-action="recommendations">View recommendations</button>
        <button type="button" class="cover-btn" data-cover-action="analytics">Open analytics</button>
        <button type="button" class="cover-btn" data-cover-action="membership">Membership</button>
      </div>`);
  }

  function choosePlan(plan) {
    if (!['Free', 'Family', 'Classroom'].includes(plan)) return;
    state.membershipPlan = plan;
    saveState();
    showMembership();
  }

  function handleAction(action) {
    switch (action) {
      case 'home': showHome(); break;
      case 'learning': case 'recommendations': showLearning(); break;
      case 'start-practice': startPractice(state.lastSkillId || recommendedSkills(1)[0].id); break;
      case 'resume': startPractice(state.lastSkillId || recommendedSkills(1)[0].id); break;
      case 'start-diagnostic': startDiagnostic(); break;
      case 'all-grades': showAllGrades(); break;
      case 'all-skills': showAllSkills(); break;
      case 'awards': showAwards(); break;
      case 'analytics': showAnalytics(); break;
      case 'membership': showMembership(); break;
      case 'waitlist': showWaitlist(); break;
      case 'about': case 'help': case 'privacy': showInfo(action); break;
      case 'next-question': nextPracticeQuestion(); break;
      case 'finish-practice': practice = null; showLearning(); break;
      default: break;
    }
  }

  cover.addEventListener('click', (event) => {
    const answer = event.target.closest('[data-answer]');
    if (answer && workspace.contains(answer)) {
      if (diagnosticRun) answerDiagnostic(answer.dataset.answer);
      else answerPractice(answer.dataset.answer);
      return;
    }
    const waitlistPlan = event.target.closest('[data-waitlist-plan]');
    if (waitlistPlan && workspace.contains(waitlistPlan)) { showWaitlist(waitlistPlan.dataset.waitlistPlan); return; }
    const waitlistRemove = event.target.closest('[data-waitlist-remove]');
    if (waitlistRemove && workspace.contains(waitlistRemove)) { removeWaitlist(Number(waitlistRemove.dataset.waitlistRemove)); return; }
    const plan = event.target.closest('[data-plan]');
    if (plan && workspace.contains(plan)) { choosePlan(plan.dataset.plan); return; }
    const skill = event.target.closest('[data-cover-skill]');
    if (skill) { startPractice(skill.dataset.coverSkill); return; }
    const grade = event.target.closest('[data-grade]');
    if (grade) { showGrade(grade.dataset.grade); return; }
    const nav = event.target.closest('[data-cover-nav]');
    if (nav) {
      if (nav.dataset.coverNav === 'diagnostic') startDiagnostic();
      else handleAction(nav.dataset.coverNav);
      return;
    }
    const action = event.target.closest('[data-cover-action]');
    if (action) handleAction(action.dataset.coverAction);
  });

  const search = document.getElementById('cover-search');
  if (search) {
    search.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('cover-q');
      showSearch(input ? input.value : '');
    });
  }

  workspace.addEventListener('submit', (event) => {
    if (event.target.id !== 'waitlist-form') return;
    event.preventDefault();
    joinWaitlist();
  });

  updateStaticProgress();

  /* Small public handle for tests and debugging; the UI works without it. */
  window.MathHelper = {
    skills: SKILLS,
    grades: GRADES,
    state: () => MH.clone(state),
    showSearch,
    startPractice,
    startDiagnostic,
    showMembership,
    showWaitlist,
    joinWaitlist,
  };
})();
