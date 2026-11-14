(function () {
  'use strict';
  var C = window.CONTENT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.documentElement.classList.add('js');
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var LV = { Beginner: 1, Intermediate: 2, Strong: 3 };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var NS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      [].concat(arguments[i]).forEach(function (kid) {
        if (kid == null || kid === false) return;
        el.append(kid.nodeType ? kid : document.createTextNode(kid));
      });
    }
    return el;
  }
  function add(el) { for (var i = 1; i < arguments.length; i++) [].concat(arguments[i]).forEach(function (n) { if (n != null && n !== false) el.append(n); }); return el; }

  /* ================= the scenes (look, face position, expression) ================= */
  // fx: face centre as a fraction of viewport width from the middle. fs: face height as a fraction of viewport height.
  // sky: gradient stops. sun: colour, diameter (vmax), x as a fraction (follows the face), y %. hills: far, mid, near.
  var SCENES = [
    { id: 'home', label: 'Home', word: 'NITHISH', fx: 0, fs: 1, fy: '7svh', state: 'idle', hl: '#FFFFFF', gc: '#FFFFFF', go: .2,
      sky: ['#0C111C', '#1A2130 52%', '#6B3A1C'], sun: { c: '#FF8309', d: 64, x: 0, y: 46 }, hills: ['#26304A', '#1C2438', '#121826'], tb: 'linear-gradient(#1A2130,#FF8309)' },
    { id: 'about', label: 'About', word: 'ABOUT', fx: .27, fs: .82, fy: '0px', state: 'curious', hl: '#1A2130', gc: '#1A2130', go: .16,
      sky: ['#FF9B38', '#FF8309'], sun: { c: '#FFFFFF', d: 58, x: .27, y: 54 }, hills: ['#E96F00', '#B85500', '#1A2130'], tb: 'linear-gradient(#FF9B38,#FF8309)' },
    { id: 'skills', label: 'Skills', word: 'SKILLS', fx: -.27, fs: .8, fy: '0px', state: 'focused', hl: '#FFFFFF', gc: '#FF8309', go: .3,
      sky: ['#10151F', '#1F2840'], sun: { c: '#FF8309', d: 44, x: -.27, y: 50 }, hills: ['#2C3751', '#232C42', '#1A2130'], tb: 'linear-gradient(#10151F,#2C3751)' },
    { id: 'learning', label: 'Learning', word: 'JOURNEY', fx: .27, fs: .8, fy: '0px', state: 'thinking', hl: '#FFFFFF', gc: '#FFFFFF', go: .14,
      sky: ['#1A2130', '#5A3320 62%', '#FF8309'], sun: { c: '#FF8309', d: 54, x: .27, y: 66 }, hills: ['#3A2A33', '#2A2430', '#161C2A'], tb: 'linear-gradient(#1A2130,#FF8309)' },
    { id: 'projects', label: 'Projects', word: 'WORK', fx: -.3, fs: .74, fy: '0px', state: 'proud', hl: '#1A2130', gc: '#1A2130', go: .14,
      sky: ['#FFFFFF', '#E6EAF3'], sun: { c: '#FF8309', d: 46, x: -.3, y: 50 }, hills: ['#CBD3E4', '#FF8309', '#1A2130'], tb: 'linear-gradient(#FFFFFF,#FF8309)' },
    { id: 'languages', label: 'Languages', word: 'LANGUAGES', fx: 0, fs: .68, fy: '5svh', state: 'talk', hl: '#1A2130', gc: '#1A2130', go: .16,
      sky: ['#FF8309', '#FFB873'], sun: { c: '#FFFFFF', d: 52, x: 0, y: 56 }, hills: ['#2C3751', '#212A3D', '#1A2130'], tb: 'linear-gradient(#FF8309,#FFFFFF)' },
    { id: 'contact', label: 'Contact', word: 'HELLO', fx: .27, fs: .82, fy: '0px', state: 'wave', hl: '#FFFFFF', gc: '#FFFFFF', go: .14,
      sky: ['#0C111C', '#1A2130'], sun: { c: '#FF8309', d: 78, x: .27, y: 64 }, hills: ['#26304A', '#1C2438', '#0F1420'], tb: 'linear-gradient(#0C111C,#FF8309)' }
  ];
  var ids = SCENES.map(function (s) { return s.id; });
  function scene(id) { return SCENES[ids.indexOf(id)]; }

  /* ---------- backdrops: sky, sun, three ridges ---------- */
  function ridge(seed, base, amp) {
    var n = 14, w = 1600, pts = [];
    for (var i = 0; i <= n; i++) {
      var y = base - amp * (.5 + .5 * Math.sin(seed + i * .93) * Math.cos(seed * 1.7 + i * .41));
      pts.push([i * w / n, y]);
    }
    var d = 'M0,500 L0,' + pts[0][1].toFixed(1);
    for (var j = 1; j < pts.length; j++) {
      var mx = (pts[j - 1][0] + pts[j][0]) / 2, my = (pts[j - 1][1] + pts[j][1]) / 2;
      d += ' Q' + pts[j - 1][0].toFixed(1) + ',' + pts[j - 1][1].toFixed(1) + ' ' + mx.toFixed(1) + ',' + my.toFixed(1);
    }
    return d + ' L' + w + ',' + pts[n][1].toFixed(1) + ' L' + w + ',500 Z';
  }
  function svgLayer(color, seed, base, amp, hPct, k) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 1600 500'); s.setAttribute('preserveAspectRatio', 'none');
    s.style.height = hPct + '%'; s.style.setProperty('--k', k);
    var p = document.createElementNS(NS, 'path'); p.setAttribute('d', ridge(seed, base, amp)); p.setAttribute('fill', color);
    s.append(p); return s;
  }
  var world = $('#world');
  SCENES.forEach(function (s, i) {
    var bg = h('div', { class: 'bg', 'data-id': s.id });
    bg.style.background = 'linear-gradient(180deg,' + s.sky.join(',') + ')';
    var sun = h('div', { class: 'sun' });
    sun.style.setProperty('--d', s.sun.d + 'vmax'); sun.style.setProperty('--sx', s.sun.x); sun.style.setProperty('--sy', s.sun.y + '%');
    sun.style.background = 'radial-gradient(circle at 38% 34%, ' + s.sun.c + ' 0%, ' + s.sun.c + ' 55%, ' + s.sun.c + 'CC 100%)';
    sun.style.boxShadow = '0 0 120px 40px ' + s.sun.c + '55';
    add(bg, sun, svgLayer(s.hills[0], i * 2.1 + 1, 270, 150, 66, 3), svgLayer(s.hills[1], i * 1.7 + 4, 300, 130, 48, 6), svgLayer(s.hills[2], i * 2.9 + 2, 330, 90, 30, 11));
    world.append(bg);
  });

  /* ---------- giant words ---------- */
  var giant = $('#giant');
  var words = SCENES.map(function (s) {
    var el = h('span', { text: s.word }); el.style.setProperty('--gc', s.gc); el.style.setProperty('--go', s.go); giant.append(el); return el;
  });
  function sizeWords() {
    var vw = window.innerWidth, vh = window.innerHeight, mobile = vw < 900;
    words.forEach(function (el, i) {
      var len = SCENES[i].word.length;
      el.style.setProperty('--gs', Math.round(Math.min(vw * .96 / (len * .47), vh * (mobile ? .3 : .64))) + 'px');
    });
  }
  sizeWords(); window.addEventListener('resize', function () { sizeWords(); place(currentSec); });

  /* ================= content ================= */
  var P = C.profile;
  $('#pitch').textContent = P.pitch;
  $('#avail').textContent = P.availability + '. Send a note or grab my resume.';
  $('#wwm').textContent = C.workWithMe;

  var resumeBtn = $('#resumeBtn');
  if (P.resumeUrl) { resumeBtn.href = P.resumeUrl; resumeBtn.textContent = 'Open my resume'; resumeBtn.target = '_blank'; resumeBtn.rel = 'noopener'; resumeBtn.hidden = false; }

  var nowItems = C.learning.filter(function (l) { return l.status === 'now'; });
  add($('#nowStrip'), h('span', { text: 'Currently learning' }), nowItems.map(function (l) { return h('span', { class: 'tag now-dot', text: l.title }); }));

  add($('#bio'), C.profile.bio.map(function (t) { return h('p', { text: t }); }));
  add($('#facts'), C.funFacts.map(function (f) { return h('span', { class: 'tag', text: f }); }));
  add($('#exp'), C.experience.map(function (e) {
    return h('div', { class: 'card' }, h('h3', { text: e.role + ' at ' + e.org }), e.when ? h('div', { class: 'meta', text: e.when }) : null, h('p', { class: 'meta', text: e.summary }));
  }));
  add($('#edu'), C.education.map(function (e) {
    return h('li', {}, h('b', { text: e.school }), h('span', { text: e.degree }), h('span', { class: 's', text: e.years }));
  }));

  var skillFilter = 'All', skillTabs = $('#skillTabs'), skillGrid = $('#skillGrid');
  function renderSkills() {
    skillGrid.replaceChildren.apply(skillGrid, C.skills.filter(function (s) { return skillFilter === 'All' || s.group === skillFilter; }).map(function (s) {
      return h('div', { class: 'card skill' }, h('h3', { text: s.name }), h('div', { class: 'lvl' }, h('span', { class: 'pill ' + s.level, text: s.level }), h('span', { class: 'bars', 'aria-hidden': 'true' }, [1, 2, 3].map(function (n) { return h('i', { class: n <= (LV[s.level] || 1) ? 'f' : '' }); }))), h('p', { class: 'meta', text: s.proof }));
    }));
    $$('button', skillTabs).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.g === skillFilter)); });
  }
  ['All'].concat(C.skillGroups).forEach(function (g) { skillTabs.append(h('button', { type: 'button', 'data-g': g, text: g, onclick: function () { skillFilter = g; renderSkills(); } })); });
  renderSkills();

  var statusLabel = { done: 'Done', now: 'Now learning', next: 'Next' };
  add($('#learnList'), C.learning.map(function (l) {
    return h('li', { class: l.status }, h('span', { class: 's', text: statusLabel[l.status] }), h('b', { text: l.title }), h('span', { text: l.what }), l.tools ? h('span', { class: 'meta', text: l.tools }) : null);
  }));

  var projFilter = 'All', projGrid = $('#projGrid'), projBar = $('#projFilter');
  var dlg = $('#dlg'), lastFocus = null;
  function openProject(p) {
    lastFocus = document.activeElement;
    function row(label, value) { return h('div', {}, h('dt', { text: label }), h('dd', value ? { text: value } : { class: 'todo', text: 'To add' })); }
    dlg.replaceChildren(
      h('div', { class: 'head' }, h('h2', { id: 'dlgT', text: p.title }), h('button', { class: 'btn ghost small', type: 'button', text: 'Close', onclick: function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); } })),
      h('p', { style: 'margin-bottom:16px', text: p.summary }),
      h('dl', {}, row('Problem', p.problem), row('What I did', p.did), row('My role', p.role), row('Tools', p.tools.join(', ')), row('Result', p.outcome),
        h('div', {}, h('dt', { text: 'Link' }), h('dd', p.link ? {} : { class: 'todo' }, p.link ? h('a', { href: p.link, target: '_blank', rel: 'noopener', text: p.link }) : 'To add')))
    );
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
  function renderProjects() {
    projGrid.replaceChildren.apply(projGrid, C.projects.filter(function (p) { return projFilter === 'All' || p.category.indexOf(projFilter) > -1; }).map(function (p) {
      return h('button', { class: 'card project', type: 'button', onclick: function () { openProject(p); } },
        h('h3', { text: p.title }), h('p', { class: 'meta', text: p.summary }), h('div', { class: 'chips' }, p.category.map(function (c) { return h('span', { class: 'tag', text: c }); })), h('span', { class: 'more', text: 'Read the case study' }));
    }));
    $$('button', projBar).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.g === projFilter)); });
  }
  ['All', 'AI', 'Marketing', 'Startup'].forEach(function (g) { projBar.append(h('button', { type: 'button', 'data-g': g, text: g, onclick: function () { projFilter = g; renderProjects(); } })); });
  renderProjects();

  add($('#langGrid'), C.languages.map(function (l) {
    return h('div', { class: 'card lang', lang: l.code }, h('div', { class: 'native', text: l.native }), h('div', { class: 'gr', text: l.greeting }), h('div', { class: 'sn', text: l.sneeze }), h('div', { class: 'sm', text: l.sample }), h('button', { class: 'hear', type: 'button', 'aria-label': 'Hear the ' + l.name + ' greeting', text: 'Hear it', onclick: function () { speak(l, this); } }));
  }));
  add($('#traits'), C.traits.map(function (t) { return h('div', { class: 'card' }, h('h3', { text: t.label }), h('p', { class: 'meta', text: t.text })); }));

  add($('#links'), C.links.map(function (l) {
    var val = l.value || (l.url ? l.url : '');
    if (l.url) return h('a', { href: l.url, target: '_blank', rel: 'noopener' }, h('b', { text: l.label }), h('span', { text: val }));
    return h('span', { class: 'todo' }, h('b', { text: l.label }), h('span', { text: 'To add' }));
  }));

  var form = $('#form');
  function setErr(id, msg) { $('#f-' + id).classList.toggle('bad', !!msg); $('#e-' + id).textContent = msg || ''; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#name').value.trim(), m = $('#email').value.trim(), t = $('#msg').value.trim();
    var okE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
    setErr('name', n ? '' : 'Enter your name.');
    setErr('email', okE ? '' : 'Enter an email like name@company.com.');
    setErr('msg', t.length >= 10 ? '' : 'Write at least a short sentence.');
    if (!n || !okE || t.length < 10) return;
    var s = $('#status'); s.hidden = false;
    s.textContent = 'Thanks, ' + n + '. This form is not connected to an inbox yet, so nothing was sent. Use one of the links below.';
  });
  ['name', 'email', 'msg'].forEach(function (id) { $('#' + id).addEventListener('input', function () { setErr(id, ''); }); });

  /* ---------- nav, dock ---------- */
  var nav = $('#nav'), dots = $('#dots');
  SCENES.forEach(function (s, i) {
    nav.append(h('a', { href: '#' + s.id, text: s.label }));
    var a = h('a', { href: '#' + s.id, 'aria-label': s.label, title: s.label, text: String(i + 1).padStart(2, '0') });
    a.style.setProperty('--tb', s.tb); dots.append(a);
  });

  /* ================= the face ================= */
  var faceWrap = $('#faceWrap'), face = $('#face'), pups = $$('.pup', face), nose = $('#nose');
  // Real 3D face (WebGL2). If it cannot start, or ?face=svg is in the address, the SVG face is used instead.
  var av = null;
  (function () {
    var c3 = $('#face3d'), n3 = $('#nose3d');
    if (!c3 || !n3 || !window.Avatar3D || /[?&]face=svg/.test(location.search)) return;
    try {
      av = window.Avatar3D.create({ canvas: c3, maxDpr: 1.75, onNose: function (x, y, r) {
        var s = Math.max(44, r * 2); n3.style.left = x + 'px'; n3.style.top = y + 'px'; n3.style.width = s + 'px'; n3.style.height = s + 'px'; n3.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
      } });
    } catch (e) { av = null; }
    if (av) { faceWrap.classList.add('is3d'); n3.hidden = false; nose = n3; }
  })();
  var STATES = {
    idle:    { eye: 'open', mouth: 'smile', brow: 'idle', tilt: 0 },
    curious: { eye: 'open', mouth: 'small', brow: 'curious', tilt: -6 },
    focused: { eye: 'open', mouth: 'flat', brow: 'focused', tilt: 2 },
    thinking:{ eye: 'open', mouth: 'small', brow: 'raised', tilt: 5, look: [7, -6] },
    proud:   { eye: 'open', mouth: 'grin', brow: 'raised', tilt: -3 },
    talk:    { eye: 'open', mouth: 'grin', brow: 'idle', tilt: 0 },
    wave:    { eye: 'open', mouth: 'grin', brow: 'raised', tilt: 3, hand: true },
    tickled: { eye: 'squint', mouth: 'wobble', brow: 'scrunch', tilt: -5, nose: 'twitch' },
    sneeze:  { eye: 'scrunch', mouth: 'open', brow: 'pinch', tilt: 0 },
    sleep:   { eye: 'closed', mouth: 'small', brow: 'idle', tilt: 7 },
    yawn:    { eye: 'closed', mouth: 'yawn', brow: 'raised', tilt: 0 },
    startled:{ eye: 'open', mouth: 'yawn', brow: 'raised', tilt: -4 }
  };
  var lookX = 0, lookY = 0, fixedLook = null, busy = false, currentSec = 'home';
  function applyLook() { var v = fixedLook || [lookX, lookY]; if (av) av.look(v[0] / 7, v[1] / 4.5); pups.forEach(function (p) { p.style.transform = 'translate(' + v[0] + 'px,' + v[1] + 'px)'; }); }
  function setFace(name) {
    var s = STATES[name];
    face.dataset.eye = s.eye; face.dataset.mouth = s.mouth; face.dataset.brow = s.brow; face.dataset.hand = s.hand ? 'true' : 'false';
    if (s.nose) face.dataset.nose = s.nose; else face.removeAttribute('data-nose');
    face.style.setProperty('--tilt', s.tilt + 'deg');
    if (av) av.setState(s);
    fixedLook = s.look || null; applyLook();
  }

  // place the face and sun for a scene
  function place(id) {
    var s = scene(id), vw = window.innerWidth, narrow = vw < 1200, fs = s.fs * (narrow ? .82 : 1);
    faceWrap.style.setProperty('--fx', s.fx); faceWrap.style.setProperty('--fs', fs); faceWrap.style.setProperty('--fy', s.fy);
  }

  // pointer parallax (head-turn illusion) and scroll lean
  var tx = 0, ty = 0, cx = 0, cy = 0, lastY = window.scrollY, roll = 0, raf = 0;
  function loop() {
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    var vy = window.scrollY - lastY; lastY = window.scrollY; roll += (clamp(vy * .12, -4, 4) - roll) * .12;
    if (av) av.turn(cx, cy, roll);
    face.style.setProperty('--px', cx.toFixed(3)); face.style.setProperty('--py', cy.toFixed(3)); face.style.setProperty('--roll', roll.toFixed(2) + 'deg');
    world.style.setProperty('--mx', cx.toFixed(3));
    raf = requestAnimationFrame(loop);
  }
  if (!reduce) {
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', function (e) {
      tx = clamp((e.clientX / window.innerWidth - .5) * 2, -1, 1); ty = clamp((e.clientY / window.innerHeight - .5) * 2, -1, 1);
      if (busy) return;
      var r = face.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .5);
      var d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 360);
      lookX = dx / d * 7 * m; lookY = dy / d * 4.5 * m; applyLook();
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop); });
  }

  /* ================= tickle, sneeze, bubbles ================= */
  var timers = [], count = 0;
  var hint = $('#hint'), hintT = $('#hintT'), bubbles = $('#bubbles'), live = $('#live'), flash = $('#flash'), rays = $('#rays');
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function star() {
    var pts = [], n = 14;
    for (var i = 0; i < n * 2; i++) { var a = Math.PI * i / n, r = i % 2 ? 40 : 52; pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1)); }
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="' + pts.join(' ') + '"/></svg>';
  }
  var BUBBLE_BG = { English: '#FF8309', Tamil: '#FFFFFF', Hindi: '#E4E8F0', Nepali: '#FFD2A3' };
  function makeBubble(item, right) {
    var el = h('div', { class: 'bub ' + item.style + ' ' + (right ? 'tl-l' : 'tl-r'), lang: item.code || 'en' });
    if (item.style !== 'burst') el.style.setProperty('--bb', BUBBLE_BG[item.label] || '#FFFFFF');
    if (item.style === 'thought') el.style.setProperty('--bb', '#FFFFFF');
    el.style.setProperty('--r', (Math.random() * 8 - 4).toFixed(1) + 'deg');
    if (item.style === 'burst') el.insertAdjacentHTML('afterbegin', star());
    add(el, h('div', { class: 't', text: item.text }), item.label ? h('div', { class: 'l', text: item.label }) : null);
    return el;
  }
  function showBubbles() {
    bubbles.replaceChildren();
    var vw = window.innerWidth, vh = window.innerHeight, n = nose.getBoundingClientRect(), fh = faceWrap.getBoundingClientRect().height;
    var nxp = n.left + n.width / 2, nyp = n.top + n.height / 2;
    var gx = Math.max(fh * .46, vw * (vw < 900 ? .26 : .22));
    var slots = shuffle([[-1, -.7], [1, -.7], [-1, -.35], [1, -.3], [0, -.95]]);
    var items = C.languages.map(function (l) { return { label: l.name, text: l.sneeze, style: l.style, code: l.code }; });
    items.push({ label: '', text: C.aside, style: 'thought', code: 'en' });
    items = shuffle(items).slice(0, 5);
    var els = items.map(function (it, i) {
      var sl = slots[i], el = makeBubble(it, sl[0] > 0);
      bubbles.append(el);
      var w = el.offsetWidth, hh = el.offsetHeight;
      el.style.left = clamp(nxp + sl[0] * gx, w / 2 + 10, vw - w / 2 - 10) + 'px';
      el.style.top = clamp(nyp + sl[1] * fh * .5, hh / 2 + 70, vh - hh / 2 - 100) + 'px';
      return el;
    });
    els.forEach(function (el, i) { later(function () { el.classList.add('on'); }, reduce ? 0 : 140 + i * 100); });
    later(function () { els.forEach(function (el) { el.classList.remove('on'); el.classList.add('off'); }); }, 5600);
    later(function () { bubbles.replaceChildren(); }, 6200);
  }
  function setHint(txt, p) { hintT.textContent = txt; hint.style.setProperty('--p', p + '%'); }
  function tickle() {
    if (busy) return;
    busy = true; fixedLook = null; timers.forEach(clearTimeout); timers = []; bubbles.replaceChildren();
    hintMode = 'tickle'; hint.classList.remove('bless'); sfxSneeze();
    face.classList.add('used'); faceWrap.classList.add('used'); setFace('tickled');
    var t0 = performance.now(), D = reduce ? 200 : 800;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / D); setHint('Tickling…', Math.round(p * 100));
      if (p < 1) requestAnimationFrame(tick); else sneeze();
    })(t0);
  }
  function sneeze() {
    setFace('sneeze'); if (av) av.sneezeFx(); count++; counted();
    var n = nose.getBoundingClientRect();
    rays.style.setProperty('--cx', (n.left + n.width / 2) + 'px'); rays.style.setProperty('--cy', (n.top + n.height / 2) + 'px');
    if (!reduce) emBlast(n.left + n.width / 2, n.top + n.height / 2);
    if (!reduce) {
      document.body.classList.add('shake'); face.classList.add('snap', 'spray');
      flash.classList.remove('go'); rays.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); rays.classList.add('go');
      later(function () { document.body.classList.remove('shake'); face.classList.remove('snap'); }, 360);
      later(function () { face.classList.remove('spray'); }, 900);
    }
    showBubbles();
    live.textContent = 'Ah-choo! Nithish sneezed in English, Tamil, Hindi and Nepali.';
    setHint('Ah-choo!', 100);
    later(function () { busy = false; setFace(scene(currentSec).state); offerBless(); }, 1700);
  }
  hint.addEventListener('click', function () { if (hintMode === 'bless') bless(); else tickle(); });
  $('#again').addEventListener('click', tickle);
  nose.addEventListener('click', tickle);
  nose.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tickle(); } });
  nose.addEventListener('pointerenter', function () {
    if (busy || reduce) return;
    nose.classList.remove('wiggle'); void nose.getBoundingClientRect(); nose.classList.add('wiggle');
  });

  /* ================= scroll story ================= */
  var bgs = $$('.bg', world);
  function setSection(id) {
    if (id === currentSec && document.body.dataset.sec === id) return;
    currentSec = id; document.body.dataset.sec = id;
    var s = scene(id), idx = ids.indexOf(id);
    document.body.style.setProperty('--hl-now', s.hl);
    etarget = EMC[id] || EMC.home;
    bgs.forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); });
    words.forEach(function (w, i) { w.classList.toggle('on', i === idx); });
    place(id);
    $('#cn').textContent = String(idx + 1).padStart(2, '0'); $('#cl').textContent = s.label;
    $$('a', dots).concat($$('a', nav)).forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)); });
    if (!busy) setFace(s.state);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setSection(e.target.dataset.sec); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('.scene').forEach(function (s) { io.observe(s); });
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    world.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(3) : 0);
    document.documentElement.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) setSection('contact');
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();


  /* ================= extras ================= */
  var hintMode = 'tickle';

  /* ---- sound: a synthesized sneeze, off by default ---- */
  var audio = null, soundOn = store('nit-sound') === '1', soundBtn = $('#soundBtn');
  function actx() {
    if (!audio) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; audio = new AC(); }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function noise(c, dur) {
    var b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(); s.buffer = b; return s;
  }
  function sfxSneeze() {
    if (!soundOn) return;
    var c = actx(); if (!c) return;
    var t = c.currentTime, lead = reduce ? .2 : .8, out = c.createGain(); out.gain.value = .7; out.connect(c.destination);
    if (!reduce) { // the "ahh" breath in, rising while the nose twitches
      var n1 = noise(c, lead), f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 1.2;
      f1.frequency.setValueAtTime(500, t); f1.frequency.exponentialRampToValueAtTime(1900, t + lead - .05);
      var g1 = c.createGain(); g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(.5, t + lead - .08); g1.gain.linearRampToValueAtTime(0, t + lead);
      n1.connect(f1); f1.connect(g1); g1.connect(out); n1.start(t); n1.stop(t + lead);
    }
    var t2 = t + lead, n2 = noise(c, .4), f2 = c.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 900; // the "choo"
    var g2 = c.createGain(); g2.gain.setValueAtTime(0, t2); g2.gain.linearRampToValueAtTime(1, t2 + .015); g2.gain.exponentialRampToValueAtTime(.001, t2 + .35);
    n2.connect(f2); f2.connect(g2); g2.connect(out); n2.start(t2); n2.stop(t2 + .4);
    var o = c.createOscillator(), g3 = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(190, t2); o.frequency.exponentialRampToValueAtTime(70, t2 + .2);
    g3.gain.setValueAtTime(.0001, t2); g3.gain.exponentialRampToValueAtTime(.7, t2 + .02); g3.gain.exponentialRampToValueAtTime(.001, t2 + .25);
    o.connect(g3); g3.connect(out); o.start(t2); o.stop(t2 + .3);
  }
  function setSound(on) {
    soundOn = on; store('nit-sound', on ? '1' : '0');
    soundBtn.setAttribute('aria-pressed', String(on)); soundBtn.textContent = on ? 'Sound on' : 'Sound off';
    if (on) { var c = actx(); if (c) { var o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.frequency.value = 660; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.15, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .18); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .2); } }
  }
  soundBtn.addEventListener('click', function () { setSound(!soundOn); });
  setSound(false); soundOn = store('nit-sound') === '1'; soundBtn.setAttribute('aria-pressed', String(soundOn)); soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';

  /* ---- sneeze counter, achievements, bless you ---- */
  var total = parseInt(store('nit-sneezes') || '0', 10) || 0, toastT = 0;
  $('#sneezeN').textContent = total;
  var ACH = { 1: 'First tickle. Bless you!', 5: 'Achievement: Allergy season (5 sneezes)', 10: 'Achievement: Dust magnet (10 sneezes)', 25: 'Achievement: Hay fever (25 sneezes). Okay, that is enough!' };
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 4200); }
  function counted() {
    total++; store('nit-sneezes', String(total)); $('#sneezeN').textContent = total;
    var chip = $('#sneezeChip'); chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    if (ACH[total]) { var msg = ACH[total]; setTimeout(function () { toast(msg); }, Date.now() - lastSecretAt < 3000 ? 3400 : 0); }
  }
  function offerBless() {
    hintMode = 'bless'; hint.classList.add('bless'); setHint('Say bless you', 0);
    later(function () { if (hintMode === 'bless') { hintMode = 'tickle'; hint.classList.remove('bless'); setHint('Tickle again', 0); } }, 9000);
  }
  var THANKS = [{ t: 'Thanks!', c: 'en' }, { t: 'நன்றி!', c: 'ta' }, { t: 'धन्यवाद!', c: 'hi' }, { t: 'धन्यवाद!', c: 'ne' }];
  function bless() {
    hintMode = 'tickle'; hint.classList.remove('bless'); setHint('Tickle again', 0);
    var th = THANKS[Math.floor(Math.random() * THANKS.length)];
    Array.prototype.forEach.call(bubbles.children, function (b) { b.classList.remove('on'); b.classList.add('off'); });
    later(function () {
      bubbles.replaceChildren(); popBubble(th.t, th.c, 2400); unlock('bless');
      if (!busy) { setFace('talk'); later(function () { if (!busy) setFace(scene(currentSec).state); }, 1800); }
    }, 450);
  }
  var typed = '';

  /* ---- hear the greeting aloud (uses the voices on the visitor's device) ---- */
  function flashBtn(btn, t) { var o = btn.dataset.o || btn.textContent; btn.dataset.o = o; btn.textContent = t; clearTimeout(btn._t); btn._t = setTimeout(function () { btn.textContent = o; }, 2400); }
  function speak(l, btn) {
    var ss = window.speechSynthesis;
    if (!ss || !window.SpeechSynthesisUtterance) { flashBtn(btn, 'Not supported here'); return; }
    var tags = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN', ne: 'ne-NP' }, voices = ss.getVoices();
    var want = (tags[l.code] || l.code).toLowerCase(), base = want.split('-')[0], note = '';
    var v = voices.filter(function (x) { return x.lang.toLowerCase().replace('_', '-') === want; })[0] || voices.filter(function (x) { return x.lang.toLowerCase().indexOf(base) === 0; })[0];
    if (!v && l.code === 'ne') { v = voices.filter(function (x) { return x.lang.toLowerCase().indexOf('hi') === 0; })[0]; if (v) note = 'Using a Hindi voice'; }
    if (!v && voices.length) { flashBtn(btn, 'No ' + l.name + ' voice on this device'); return; }
    ss.cancel();
    var u = new SpeechSynthesisUtterance(l.greeting + '. ' + l.sample); u.lang = v ? v.lang : want; if (v) u.voice = v;
    ss.speak(u); flashBtn(btn, note || 'Playing…');
  }

  /* ---- command menu and "ask me" (prepared answers from content.js) ---- */
  var pal = $('#palette'), palIn = $('#palIn'), palList = $('#palList'), palAns = $('#palAns'), askBtn = $('#askBtn'), active = 0, rows = [];
  $('#askKbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Ctrl K';
  function go(id) { pal.close(); var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  function strongNames() { return C.skills.filter(function (s) { return s.level === 'Strong'; }).map(function (s) { return s.name; }); }
  function midNames() { return C.skills.filter(function (s) { return s.level === 'Intermediate'; }).map(function (s) { return s.name; }); }
  function begNames() { return C.skills.filter(function (s) { return s.level === 'Beginner'; }).map(function (s) { return s.name.toLowerCase(); }); }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  var TOPICS = [
    { k: ['hire', 'hiring', 'open to', 'available', 'availability', 'job', 'opportunit', 'remote', 'position', 'vacan', 'recruit'], f: function () { return { p: [P.availability + '. I am looking for an AI-first, remote role where I can build with people who care about doing things well.', 'The quickest way to reach me is the Contact section.'], go: 'contact' }; } },
    { k: ['strong', 'good at', 'best at', 'skill', 'strength', 'expert', 'tools', 'what can you do', 'know'], f: function () { return { p: ['Strongest: ' + list(strongNames()) + '.', 'Solid: ' + list(midNames()) + '.'].concat(begNames().length ? ['Still early: ' + list(begNames()) + '. I say so plainly.'] : []), go: 'skills' }; } },
    { k: ['roundu', 'startup', 'company', 'your role', 'what do you do', 'human resources'], f: function () { var e = C.experience[0]; return { p: [e.role + ' at ' + e.org + '. ' + e.summary], go: 'about' }; } },
    { k: ['language', 'speak', 'tamil', 'hindi', 'nepali', 'english', 'sneeze in'], f: function () { return { p: ['I speak ' + list(C.languages.map(function (l) { return l.name; })) + '. Tickle my nose and I will sneeze in all of them.'], go: 'languages' }; } },
    { k: ['learn', 'next', 'studying', 'journey', 'growing'], f: function () { var now = C.learning.filter(function (l) { return l.status === 'now'; }).map(function (l) { return l.title; }), nx = C.learning.filter(function (l) { return l.status === 'next'; }).map(function (l) { return l.title; }); return { p: [now.length ? 'Right now: ' + list(now) + '.' : '', nx.length ? 'Next: ' + list(nx) + '.' : ''].filter(Boolean), go: 'learning' }; } },
    { k: ['project', 'built', 'build', 'made', 'portfolio', 'rag', 'agent', 'case study', 'work you'], f: function () { return { p: C.projects.map(function (p) { return p.title + ': ' + p.summary; }), go: 'projects' }; } },
    { k: ['contact', 'email', 'reach', 'linkedin', 'github', 'resume', 'cv', 'instagram', 'touch'], f: function () { var have = C.links.filter(function (l) { return l.url; }).map(function (l) { return l.label + (l.value ? ' (' + l.value + ')' : ''); }); return { p: [have.length ? 'You can find me on ' + list(have) + '.' : 'My contact links are still being added.', 'The Contact section has a form and all my links, and you can save my CV as a PDF there.'], go: 'contact' }; } },
    { k: ['education', 'study', 'college', 'vit', 'student', 'degree', 'university', 'graduat'], f: function () { var e = C.education[0]; return { p: ['I graduated from ' + e.school + (e.degree && e.degree !== 'Graduate' ? ' in ' + e.degree : '') + (e.years ? ' (' + e.years + ')' : '') + '.'], go: 'about' }; } },
    { k: ['code', 'coding', 'developer', 'engineer', 'programm', 'vibe'], f: function () { return { p: ['I am light on traditional code, and I say so. I build products, agents and campaigns with AI coding tools (vibe coding), including this site.'], go: 'skills' }; } },
    { k: ['who are', 'about you', 'yourself', 'introduce', 'who is', 'tell me about'], f: function () { return { p: C.profile.bio.slice(0, 2), go: 'about' }; } },
    { k: ['why', 'work with', 'style', 'personality', 'how do you work', 'strengths'], f: function () { return { p: [C.workWithMe].concat(C.traits.slice(0, 3).map(function (t) { return t.label + ': ' + t.text; })), go: 'languages' }; } }
  ];
  var SUGGEST = ['What are you strongest at?', 'What is RoundU?', 'Are you open to work?', 'Which languages do you speak?', 'What are you learning?', 'What have you built?'];
  function answer(q) {
    q = q.toLowerCase();
    var faq = C.faq || [];
    for (var i = 0; i < faq.length; i++) {
      var keys = (faq[i].keys || []).concat([faq[i].q]);
      if (keys.some(function (k) { return k && q.indexOf(String(k).toLowerCase()) > -1; })) return { p: [faq[i].a] };
    }
    var best = null, bs = 0;
    TOPICS.forEach(function (t) { var s = 0; t.k.forEach(function (k) { if (q.indexOf(k) > -1) s += k.length; }); if (s > bs) { bs = s; best = t; } });
    return best ? best.f() : null;
  }
  function commands() {
    var out = SCENES.map(function (s, i) { return { label: 'Go to ' + s.label, tag: String(i + 1).padStart(2, '0'), run: function () { go(s.id); } }; });
    out.push({ label: 'Tickle my nose', tag: 'Fun', run: function () { pal.close(); setTimeout(tickle, 250); } });
    out.push({ label: 'Save my CV as PDF', tag: 'CV', run: function () { pal.close(); setTimeout(printCV, 250); } });
    out.push({ label: 'Throw confetti', tag: 'Fun', run: function () { pal.close(); setTimeout(party, 250); } });
    out.push({ label: soundOn ? 'Turn sound off' : 'Turn sound on', tag: 'Fun', run: function () { pal.close(); setSound(!soundOn); } });
    C.links.forEach(function (l) {
      if (l.label === 'Email' && l.value) out.push({ label: 'Copy my email', tag: 'Contact', run: function () { pal.close(); try { navigator.clipboard.writeText(l.value); toast('Email copied'); } catch (e) { toast(l.value); } } });
      else if (l.url) out.push({ label: 'Open my ' + l.label, tag: 'Link', run: function () { pal.close(); window.open(l.url, '_blank', 'noopener'); } });
    });
    if (P.resumeUrl) out.push({ label: 'Open my resume', tag: 'Link', run: function () { pal.close(); window.open(P.resumeUrl, '_blank', 'noopener'); } });
    return out;
  }
  function showAnswer(q) {
    var r = answer(q);
    palList.hidden = true; palAns.hidden = false; palAns.replaceChildren();
    add(palAns, h('h3', { text: q }));
    if (r) add(palAns, r.p.map(function (t) { return h('p', { text: t }); }));
    else add(palAns, h('p', { text: 'I only have prepared answers about my skills, work, projects, languages, learning and contact. Try one of these:' }));
    var acts = h('div', { class: 'row' });
    if (r && r.go) add(acts, h('button', { class: 'btn', type: 'button', text: 'Show me', onclick: function () { go(r.go); } }));
    add(acts, h('button', { class: 'btn ghost', type: 'button', text: 'Ask something else', onclick: function () { palIn.value = ''; render(''); palIn.focus(); } }));
    palAns.append(acts);
    if (!r) add(palAns, h('div', { class: 'tabs' }, SUGGEST.map(function (s) { return h('button', { type: 'button', text: s, onclick: function () { palIn.value = s; showAnswer(s); } }); })));
    $('#live').textContent = r ? r.p.join(' ') : 'No prepared answer for that. Try one of the suggested questions.';
  }
  function render(raw) {
    palAns.hidden = true; palList.hidden = false;
    var q = raw.trim().toLowerCase(); rows = [];
    function ask(text, tag) { return { label: text, tag: tag, run: function () { palIn.value = text; showAnswer(text); } }; }
    if (!q) {
      rows.push({ group: 'Ask me' }); SUGGEST.forEach(function (s) { rows.push(ask(s, 'Ask')); });
      rows.push({ group: 'Jump to' }); commands().forEach(function (c) { rows.push(c); });
    } else {
      var toks = q.split(/\s+/);
      var m = commands().filter(function (c) { var l = c.label.toLowerCase(); return toks.every(function (t) { return l.indexOf(t) > -1; }); });
      var hasAns = !!answer(q), a = ask(raw.trim(), hasAns ? 'Answer' : 'Try asking');
      a.label = 'Ask: “' + raw.trim() + '”';
      a.run = function () { showAnswer(raw.trim()); };
      rows = m.concat([a]);
    }
    active = rows.findIndex(function (r) { return !r.group; });
    palList.replaceChildren.apply(palList, rows.map(function (r, i) {
      if (r.group) return h('li', { class: 'group', role: 'presentation', text: r.group });
      return h('li', { role: 'option', id: 'po' + i, 'aria-selected': 'false', onclick: function () { r.run(); }, onmousemove: function () { setActive(i); } }, h('span', { text: r.label }), h('small', { text: r.tag }));
    }));
    setActive(active);
  }
  function setActive(i) {
    active = i;
    $$('li[role="option"]', palList).forEach(function (li) { li.setAttribute('aria-selected', String(li.id === 'po' + i)); });
    var el = $('#po' + i); if (el) { palIn.setAttribute('aria-activedescendant', 'po' + i); el.scrollIntoView({ block: 'nearest' }); }
  }
  function step(d) {
    var i = active; do { i += d; } while (rows[i] && rows[i].group);
    if (rows[i]) setActive(i);
  }
  function openPal() { if (pal.open) return; $('#palSec').textContent = 'Secrets found: ' + foundList().length + ' of ' + SEC_N + '. Some of them are typed, not clicked.'; pal.showModal(); palIn.value = ''; render(''); palIn.focus(); }
  askBtn.addEventListener('click', openPal);
  $('#palX').addEventListener('click', function () { pal.close(); });
  pal.addEventListener('click', function (e) { if (e.target === pal) pal.close(); });
  palIn.addEventListener('input', function () { render(palIn.value); });
  palIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!palAns.hidden && palIn.value.trim()) { showAnswer(palIn.value.trim()); } else if (rows[active]) rows[active].run(); }
  });
  window.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (pal.open) pal.close(); else openPal(); return; }
    if (typing || pal.open || dlg.open || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (e.key === '/') { e.preventDefault(); openPal(); return; }
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed.slice(-5) === 'achoo') { typed = ''; unlock('achoo'); tickle(); }
    else if (typed === 'roundu') { typed = ''; unlock('roundu'); popBubble('RoundU!', 'en', 2000); }
  });

  /* ---- reveal on scroll, clock ---- */
  var rv = $$('.head, .panel'); rv.forEach(function (el) { el.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('in'); });
  else {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.classList.contains('head')) scramble(e.target.querySelector('h2')); } }); }, { rootMargin: '0px 0px -12% 0px' });
    rv.forEach(function (el) { rio.observe(el); });
  }
  function tickClock() {
    var t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    $('#clockT').textContent = P.availability + ' · Vellore ' + t;
  }
  tickClock(); setInterval(tickClock, 30000);


  /* ================= showpiece ================= */
  /* ---- secrets (small rewards for curious visitors) ---- */
  var SECRETS = { achoo: 'Magic word', bless: 'Polite visitor', nap: 'Power nap', roundu: 'RoundU fan', konami: 'Old-school code', spark: 'Logo poke' };
  var SEC_N = Object.keys(SECRETS).length;
  var lastSecretAt = 0;
  function foundList() { try { return JSON.parse(store('nit-secrets') || '[]') || []; } catch (e) { return []; } }
  function unlock(id) {
    var f = foundList(); if (f.indexOf(id) > -1) return false;
    f.push(id); store('nit-secrets', JSON.stringify(f)); lastSecretAt = Date.now();
    toast('Secret found: ' + SECRETS[id] + ' (' + f.length + ' of ' + SEC_N + ')');
    return true;
  }

  /* ---- a speech bubble beside his head ---- */
  function popBubble(text, code, ms) {
    var n = nose.getBoundingClientRect(), fh = faceWrap.getBoundingClientRect().height, vw = window.innerWidth, life = ms || 2400;
    var el = makeBubble({ label: '', text: text, style: 'speech', code: code || 'en' }, false);
    bubbles.append(el);
    el.style.left = clamp(n.left + n.width / 2 + fh * .3, el.offsetWidth / 2 + 10, vw - el.offsetWidth / 2 - 10) + 'px';
    el.style.top = Math.max(110, n.top - fh * .22) + 'px';
    setTimeout(function () { el.classList.add('on'); }, 30);
    setTimeout(function () { el.classList.remove('on'); el.classList.add('off'); }, life);
    setTimeout(function () { el.remove(); }, life + 600);
  }

  /* ---- he gets sleepy if you leave him alone ---- */
  var IDLE_MS = 30000, idleT = 0, lastAct = 0, drowsy = false, asleep = false, napT = [];
  function drowse() {
    var ae = document.activeElement;
    if (busy || pal.open || dlg.open || document.hidden || (ae && /^(input|textarea)$/i.test(ae.tagName))) { idleT = setTimeout(drowse, 8000); return; }
    drowsy = true; setFace('yawn');
    napT.push(setTimeout(function () {
      asleep = true; setFace('sleep'); document.body.classList.add('asleep'); live.textContent = 'Nithish dozed off.';
    }, 1800));
  }
  function wake() {
    napT.forEach(clearTimeout); napT = [];
    if (!drowsy) return;
    var was = asleep; drowsy = false; asleep = false; document.body.classList.remove('asleep');
    if (was) {
      setFace('startled'); popBubble('Oh! Hi again.', 'en', 2000); unlock('nap');
      setTimeout(function () { if (!busy && !asleep) setFace(scene(currentSec).state); }, 1500);
    } else setFace(scene(currentSec).state);
  }
  function activity() {
    var now = Date.now(); if (now - lastAct < 400) return; lastAct = now;
    wake(); clearTimeout(idleT); idleT = setTimeout(drowse, IDLE_MS);
  }
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(function (t) { window.addEventListener(t, activity, { passive: true }); });
  idleT = setTimeout(drowse, IDLE_MS);

  /* ---- embers: drifting sparks that dodge the pointer and blow away when he sneezes ---- */
  var ecv = $('#embers'), ec = ecv && ecv.getContext ? ecv.getContext('2d') : null, EM = [], EW = 0, EH = 0, EMP = { x: -999, y: -999 }, eLastY = window.scrollY;
  var EMC = { home: [255, 131, 9], about: [255, 255, 255], skills: [255, 131, 9], learning: [255, 176, 102], projects: [255, 131, 9], languages: [255, 255, 255], contact: [255, 131, 9] };
  var ecol = EMC.home.slice(), etarget = EMC.home;
  function eSize() {
    var d = Math.min(2, window.devicePixelRatio || 1); EW = window.innerWidth; EH = window.innerHeight;
    ecv.width = Math.round(EW * d); ecv.height = Math.round(EH * d); ec.setTransform(d, 0, 0, d, 0, 0);
    var want = EW < 900 ? 34 : 72;
    while (EM.length < want) EM.push({ x: Math.random() * EW, y: Math.random() * EH, z: .3 + Math.random() * .7, r: 1 + Math.random() * 2.6, vx: 0, vy: 0, ph: Math.random() * 6.28, sp: .5 + Math.random() * .9, fl: 0 });
    EM.length = want;
  }
  function emBlast(x, y) {
    EM.forEach(function (p) {
      var dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1, f = Math.min(26, 1500 / (d + 90)) * (.5 + p.z);
      p.vx += dx / d * f; p.vy += dy / d * f; p.fl = 1;
    });
  }
  function eFrame() {
    for (var k = 0; k < 3; k++) ecol[k] += (etarget[k] - ecol[k]) * .05;
    var col = Math.round(ecol[0]) + ',' + Math.round(ecol[1]) + ',' + Math.round(ecol[2]);
    var sy = window.scrollY, dv = clamp(sy - eLastY, -40, 40); eLastY = sy;
    var t = performance.now() * .001, ox = -cx * 16;
    ec.clearRect(0, 0, EW, EH);
    for (var i = 0; i < EM.length; i++) {
      var p = EM[i];
      p.y -= (.2 + p.z * .5) * p.sp; p.x += Math.sin(t * p.sp + p.ph) * .22 * p.z; p.y -= dv * p.z * .35;
      if (EMP.x > -900) {
        var dx = p.x - EMP.x, dy = p.y - EMP.y, d = Math.hypot(dx, dy) || 1, R = 110 + p.r * 10;
        if (d < R) { var f = (1 - d / R) * 1.5; p.vx += dx / d * f; p.vy += dy / d * f; }
      }
      p.x += p.vx; p.y += p.vy; p.vx *= .94; p.vy *= .94; p.fl *= .95;
      if (p.y < -14) { p.y = EH + 14; p.x = Math.random() * EW; } else if (p.y > EH + 60) p.y = -14;
      if (p.x < -14) p.x = EW + 14; else if (p.x > EW + 14) p.x = -14;
      var a = clamp((.2 + p.z * .5) * (1 + p.fl * 1.2) * (.78 + .22 * Math.sin(t * 2 + p.ph)), 0, 1), r = p.r * (1 + p.fl * .8), px = p.x + ox * p.z;
      ec.fillStyle = 'rgba(' + col + ',' + (a * .14).toFixed(3) + ')'; ec.beginPath(); ec.arc(px, p.y, r * 3.4, 0, 6.283); ec.fill();
      ec.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')'; ec.beginPath(); ec.arc(px, p.y, r, 0, 6.283); ec.fill();
    }
    requestAnimationFrame(eFrame);
  }
  if (ec && !reduce) {
    eSize(); window.addEventListener('resize', eSize); requestAnimationFrame(eFrame);
    window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { EMP.x = e.clientX; EMP.y = e.clientY; } }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { EMP.x = -999; });
  } else if (ecv) ecv.remove();

  /* ---- heading scramble as each section arrives ---- */
  var GL = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  function scramble(el) {
    if (!el || reduce) return;
    var txt = el.dataset.t || el.textContent; el.dataset.t = txt; el.setAttribute('aria-label', txt);
    el.style.minHeight = el.offsetHeight + 'px';
    var t0 = performance.now(), D = 950;
    (function f(now) {
      var p = Math.min(1, (now - t0) / D), out = '';
      for (var i = 0; i < txt.length; i++) {
        var ch = txt.charAt(i);
        out += (!/[A-Za-z0-9]/.test(ch) || p > i / txt.length * .55 + .3) ? ch : GL.charAt(Math.floor(Math.random() * GL.length));
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(f); else { el.textContent = txt; el.style.minHeight = ''; }
    })(t0);
  }

  /* ---- greeting and the typing line on the home scene ---- */
  (function () {
    var hr = new Date().getHours(), g = hr < 5 ? 'Up late? Same. Welcome.' : hr < 12 ? 'Good morning. Welcome.' : hr < 17 ? 'Good afternoon. Welcome.' : hr < 22 ? 'Good evening. Welcome.' : 'Burning the midnight oil? Welcome.';
    $('#hello').textContent = g;
    var words = P.builds && P.builds.length ? P.builds : ['campaigns', 'AI agents', 'brand stories'];
    $('#rotor .sr-only').textContent = 'I build ' + words.join(', ') + '.';
    var rw = $('#rotW'), ri = 0, rc = 0, dir = 1;
    if (reduce) { rw.textContent = words[0]; return; }
    (function tick() {
      var w = words[ri], wait;
      if (dir > 0) { rc++; rw.textContent = w.slice(0, rc); if (rc >= w.length) { dir = -1; wait = 1700; } else wait = 75; }
      else { rc--; rw.textContent = w.slice(0, rc); if (rc <= 0) { dir = 1; ri = (ri + 1) % words.length; wait = 380; } else wait = 38; }
      setTimeout(tick, wait);
    })();
  })();

  /* ---- hover: magnetic buttons and tilting cards (mouse only) ---- */
  if (fine && !reduce) {
    var mag = null, tiltEl = null;
    document.addEventListener('pointermove', function (e) {
      var t = e.target, ok = t && t.closest;
      var m = ok ? t.closest('.btn, .pill-cta, .tool, .dots a') : null;
      if (mag && mag !== m) { mag.style.translate = ''; mag = null; }
      if (m) { var r = m.getBoundingClientRect(); m.style.translate = ((e.clientX - (r.left + r.width / 2)) * .22).toFixed(1) + 'px ' + ((e.clientY - (r.top + r.height / 2)) * .3).toFixed(1) + 'px'; mag = m; }
      var c = ok && !t.closest('dialog') ? t.closest('.card') : null;
      if (tiltEl && tiltEl !== c) { tiltEl.style.transform = ''; tiltEl.classList.remove('tilt'); tiltEl = null; }
      if (!c) return;
      var b = c.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      c.classList.add('tilt'); c.style.setProperty('--gx', (px * 100).toFixed(0) + '%'); c.style.setProperty('--gy', (py * 100).toFixed(0) + '%');
      c.style.transform = 'perspective(800px) rotateX(' + ((.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 9).toFixed(2) + 'deg)';
      tiltEl = c;
    }, { passive: true });
  }

  /* ---- confetti, for the party ---- */
  function confetti() {
    if (reduce) return;
    var d = Math.min(2, window.devicePixelRatio || 1), cvs = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
    document.body.append(cvs);
    var W = window.innerWidth, H = window.innerHeight; cvs.width = Math.round(W * d); cvs.height = Math.round(H * d);
    var cx2 = cvs.getContext('2d'); cx2.scale(d, d);
    var cols = ['#FF8309', '#FFFFFF', '#FFB066', '#2C3751', '#E97600'], bits = [];
    for (var i = 0; i < 170; i++) bits.push({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .55, vx: (Math.random() - .5) * 18, vy: -9 - Math.random() * 15, w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function f(now) {
      var t = now - t0; cx2.clearRect(0, 0, W, H);
      bits.forEach(function (b) {
        b.vy += .38; b.vx *= .992; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        cx2.save(); cx2.translate(b.x, b.y); cx2.rotate(b.r); cx2.globalAlpha = clamp(1 - (t - 2600) / 1000, 0, 1); cx2.fillStyle = b.c; cx2.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx2.restore();
      });
      if (t < 3700) requestAnimationFrame(f); else cvs.remove();
    })(t0);
  }
  function party() {
    confetti(); if (!busy) { setFace('proud'); setTimeout(function () { if (!busy) setFace(scene(currentSec).state); }, 2600); }
    if (!unlock('konami')) toast('Party time!');
  }
  var KONAMI = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a', kbuf = [];
  window.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || pal.open) return;
    kbuf.push(String(e.key).toLowerCase()); kbuf = kbuf.slice(-10);
    if (kbuf.join(',') === KONAMI) { kbuf = []; party(); }
  });
  var pokes = 0, pokeT = 0;
  $('.brand i').addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation(); pokes++; clearTimeout(pokeT); pokeT = setTimeout(function () { pokes = 0; }, 1600);
    if (pokes >= 5) { pokes = 0; unlock('spark'); confetti(); }
  });

  /* ---- a CV made from this page's content, saved as PDF through the print dialog ---- */
  function buildCV() {
    var cvEl = $('#cv'); cvEl.replaceChildren();
    var contact = C.links.filter(function (l) { return l.url || l.value; }).map(function (l) { return l.label + ': ' + (l.value || l.url); });
    add(cvEl, h('header', {}, h('h1', { text: P.name }), h('p', { class: 'cv-role', text: String(P.headline).replace(/\.$/, '') }), h('p', { class: 'cv-meta', text: [P.availability].concat(contact).filter(Boolean).join('   ·   ') })));
    function sec(title) { var s = h('section', {}, h('h2', { text: title })); cvEl.append(s); return s; }
    add(sec('Summary'), h('p', { text: P.cvSummary || P.bio.slice(1, 3).join(' ') }));
    add(sec('Experience'), C.experience.map(function (e) { return h('div', { class: 'it' }, h('div', { class: 'r2' }, h('b', { text: e.role + ', ' + e.org }), e.when ? h('span', { text: e.when }) : null), h('p', { text: e.summary })); }));
    add(sec('Projects'), C.projects.map(function (p) { return h('div', { class: 'it' }, h('b', { text: p.title }), h('p', { text: p.summary + (p.outcome ? ' ' + p.outcome : '') }), p.tools && p.tools.length ? h('p', { class: 'tl2', text: 'Tools: ' + p.tools.join(', ') }) : null); }));
    var sk = sec('Skills');
    C.skillGroups.forEach(function (g) {
      var list = C.skills.filter(function (s) { return s.group === g; }).sort(function (a, b) { return (LV[b.level] || 0) - (LV[a.level] || 0); });
      if (list.length) add(sk, h('p', {}, h('b', { text: g + ': ' }), list.map(function (s) { return s.name + (s.level === 'Strong' ? ' (strong)' : s.level === 'Beginner' ? ' (basic)' : ''); }).join(', ')));
    });
    add(sec('Education'), C.education.map(function (e) { return h('p', {}, h('b', { text: e.school }), [e.degree, e.years].filter(Boolean).length ? ', ' + [e.degree, e.years].filter(Boolean).join(', ') : ''); }));
    add(sec('Languages'), h('p', { text: C.languages.map(function (l) { return l.name; }).join(', ') }));
  }
  function printCV() {
    buildCV(); var old = document.title; document.title = P.name + ' - CV';
    function back() { document.title = old; window.removeEventListener('afterprint', back); }
    window.addEventListener('afterprint', back); window.print();
  }
  $('#cvBtn').addEventListener('click', printCV);

  /* ---- the wake-up intro (once per visit, skippable) ---- */
  function startIntro() {
    var intro = $('#intro'); if (!intro) return;
    var show = !reduce; try { if (sessionStorage.getItem('nit-intro')) show = false; } catch (e) {}
    if (!show) { intro.remove(); return; }
    document.body.classList.add('intro-on'); setFace('sleep');
    var over = false;
    function skipKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') end(); }
    function end() {
      if (over) return; over = true; clearTimeout(timer); document.removeEventListener('keydown', skipKey);
      try { sessionStorage.setItem('nit-intro', '1'); } catch (e) {}
      intro.classList.add('go');
      setTimeout(function () { setFace('startled'); }, 350);
      setTimeout(function () { var g = C.languages[Math.floor(Math.random() * C.languages.length)]; if (!busy) setFace('talk'); popBubble(g.greeting + '!', g.code, 2200); }, 1000);
      setTimeout(function () { if (!busy && !asleep) setFace(scene(currentSec).state); }, 2800);
      setTimeout(function () { intro.remove(); document.body.classList.remove('intro-on'); }, 1100);
    }
    var timer = setTimeout(end, 2400);
    intro.addEventListener('click', end); document.addEventListener('keydown', skipKey);
  }

  setFace('idle'); setSection('home'); startIntro();
})();
