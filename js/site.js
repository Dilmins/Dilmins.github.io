(function () {
  document.documentElement.classList.add('js');

  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var menuBtn = document.getElementById('menuBtn');
  var links = document.getElementById('navLinks');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  }


  var zoomImgs = document.querySelectorAll('.img-main, .img-card img');
  function openBox(src, alt) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', alt || 'Enlarged image');
    var img = document.createElement('img');
    img.src = src; img.alt = alt || '';
    var close = document.createElement('button');
    close.type = 'button'; close.setAttribute('aria-label', 'Close image'); close.textContent = '×';
    box.appendChild(img); box.appendChild(close);
    function shut() { box.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') shut(); }
    box.addEventListener('click', shut);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
    close.focus();
  }
  zoomImgs.forEach(function (im) {
    im.classList.add('zoomable');
    im.tabIndex = 0;
    im.setAttribute('role', 'button');
    im.setAttribute('aria-label', 'Enlarge image: ' + (im.alt || ''));
    im.addEventListener('click', function () { openBox(im.currentSrc || im.src, im.alt); });
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(im.currentSrc || im.src, im.alt); } });
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var heroGrid = document.querySelector('.hero .hero-grid');
  if (heroGrid && !document.querySelector('.stage')) {
    heroGrid.insertAdjacentHTML('afterend',
      '<div class="stage" aria-hidden="true"><canvas id="arm" width="1100" height="340"></canvas></div>');
    var cv = document.getElementById('arm'), cx = cv.getContext('2d');
    var ptr = null, down = false, t0 = performance.now(), W = 0, H = 0, D = 1;
    var J = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], L = [0, 0, 0];
    var col = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
    function size() {
      var r = cv.getBoundingClientRect();
      D = window.devicePixelRatio || 1;
      W = Math.max(240, Math.round(r.width));
      H = Math.round(r.height);
      cv.width = W * D;
      cv.height = H * D;
    }
    function layout() {
      var u = Math.min(W * 0.26, H * 0.56), a = -Math.PI / 2.4, i;
      L = [u, u * 0.85, u * 0.62];
      J[0] = { x: W * 0.5, y: H - 34 };
      for (i = 1; i < 4; i++) {
        J[i] = { x: J[i - 1].x + Math.cos(a) * L[i - 1], y: J[i - 1].y + Math.sin(a) * L[i - 1] };
        a += 0.45;
      }
    }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function solve(tg) {
      var base = { x: J[0].x, y: J[0].y }, reach = L[0] + L[1] + L[2], d = dist(base, tg), it, i, r, l, k;
      if (d > reach) { k = reach / d; tg = { x: base.x + (tg.x - base.x) * k, y: base.y + (tg.y - base.y) * k }; }
      for (it = 0; it < 8; it++) {
        J[3] = { x: tg.x, y: tg.y };
        for (i = 2; i >= 0; i--) {
          r = dist(J[i], J[i + 1]) || 1; l = L[i] / r;
          J[i] = { x: (1 - l) * J[i + 1].x + l * J[i].x, y: (1 - l) * J[i + 1].y + l * J[i].y };
        }
        J[0] = base;
        for (i = 0; i < 3; i++) {
          r = dist(J[i], J[i + 1]) || 1; l = L[i] / r;
          J[i + 1] = { x: (1 - l) * J[i].x + l * J[i + 1].x, y: (1 - l) * J[i].y + l * J[i + 1].y };
        }
      }
      return tg;
    }
    function frame(now) {
      var ink = col('--ink'), yel = col('--accent'), line = col('--line'), panel = col('--panel'), dim = col('--ink-3');
      var t = (now - t0) / 1000, tg, a, eff, x, y, i, s, wd, ang, open, gl, bw, a2;
      cx.setTransform(D, 0, 0, D, 0, 0);
      cx.clearRect(0, 0, W, H);
      cx.strokeStyle = line; cx.lineWidth = 1;
      for (x = 0; x <= W; x += 36) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
      for (y = 0; y <= H; y += 36) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
      if (ptr) { tg = { x: ptr.x, y: ptr.y }; }
      else { a = reduce ? 0.7 : t; tg = { x: W * 0.5 + Math.sin(a * 0.8) * W * 0.3, y: H * 0.42 + Math.cos(a * 1.15) * H * 0.16 }; }
      eff = solve(tg);
      cx.strokeStyle = dim; cx.lineWidth = 1.5; cx.setLineDash([4, 4]);
      cx.beginPath(); cx.moveTo(eff.x - 12, eff.y); cx.lineTo(eff.x + 12, eff.y); cx.moveTo(eff.x, eff.y - 12); cx.lineTo(eff.x, eff.y + 12); cx.stroke();
      cx.setLineDash([]);
      cx.fillStyle = ink; bw = Math.min(120, W * 0.3);
      cx.beginPath(); if (cx.roundRect) { cx.roundRect(J[0].x - bw / 2, H - 34, bw, 34, 6); } else { cx.rect(J[0].x - bw / 2, H - 34, bw, 34); } cx.fill();
      wd = [Math.max(14, W * 0.03), Math.max(12, W * 0.026), Math.max(10, W * 0.021)];
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      for (i = 0; i < 3; i++) {
        cx.strokeStyle = ink; cx.lineWidth = wd[i]; cx.beginPath(); cx.moveTo(J[i].x, J[i].y); cx.lineTo(J[i + 1].x, J[i + 1].y); cx.stroke();
        cx.strokeStyle = i % 2 ? panel : yel; cx.lineWidth = wd[i] * 0.38; cx.beginPath(); cx.moveTo(J[i].x, J[i].y); cx.lineTo(J[i + 1].x, J[i + 1].y); cx.stroke();
      }
      for (i = 0; i < 3; i++) { cx.fillStyle = yel; cx.strokeStyle = ink; cx.lineWidth = 3; cx.beginPath(); cx.arc(J[i].x, J[i].y, wd[i] * 0.62, 0, 7); cx.fill(); cx.stroke(); }
      ang = Math.atan2(J[3].y - J[2].y, J[3].x - J[2].x);
      open = down ? 0.08 : (reduce ? 0.5 : 0.35 + 0.25 * Math.sin(t * 3));
      gl = wd[2] * 1.6; cx.strokeStyle = ink; cx.lineWidth = wd[2] * 0.5;
      for (s = -1; s <= 1; s += 2) {
        a2 = ang + s * open;
        cx.beginPath(); cx.moveTo(J[3].x, J[3].y); cx.lineTo(J[3].x + Math.cos(a2) * gl, J[3].y + Math.sin(a2) * gl); cx.stroke();
      }
      cx.fillStyle = yel; cx.strokeStyle = ink; cx.lineWidth = 3; cx.beginPath(); cx.arc(J[3].x, J[3].y, wd[2] * 0.55, 0, 7); cx.fill(); cx.stroke();
    }
    function loop(n) { frame(n); if (!reduce) requestAnimationFrame(loop); }
    function rel(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointermove', function (e) { ptr = rel(e); if (reduce) frame(performance.now()); });
    cv.addEventListener('pointerleave', function () { ptr = null; if (reduce) frame(performance.now()); });
    cv.addEventListener('pointerdown', function (e) { down = true; ptr = rel(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener('pointerup', function () { down = false; });
    window.addEventListener('resize', function () { size(); layout(); frame(performance.now()); });
    size(); layout();
    if (reduce) { frame(0); } else { requestAnimationFrame(loop); }
  }

  var bgc = document.createElement('canvas');
  bgc.className = 'bg-live';
  bgc.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(bgc, document.body.firstChild);
  var bx = bgc.getContext('2d'), BW = 0, BH = 0, BD = 1, TH = 1500, traces = [], bcol = { ink: '#888', acc: '#7a1c2e' }, bframe = 0, blast = 0;
  function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function seeded(n) { var s = n; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function buildTraces() {
    var rnd = seeded(20260), count = Math.round(Math.min(26, Math.max(10, BW / 55))), g = 44, i, k, x, y, dx, dy, pts, len, d, steps, cum;
    traces = [];
    for (i = 0; i < count; i++) {
      var left = rnd() < 0.5;
      x = Math.round((left ? rnd() * BW * 0.32 : BW - rnd() * BW * 0.32) / g) * g;
      y = Math.round(rnd() * TH / g) * g;
      pts = [{ x: x, y: y }];
      dx = left ? 1 : -1; dy = 0;
      steps = 5 + Math.floor(rnd() * 7);
      for (k = 0; k < steps; k++) {
        len = (2 + Math.floor(rnd() * 5)) * g;
        if (rnd() < 0.5) { x += dx * len; } else { y += (rnd() < 0.5 ? -1 : 1) * len; }
        pts.push({ x: x, y: y });
        if (rnd() < 0.35) { var j = (rnd() < 0.5 ? -1 : 1) * g; x += dx * Math.abs(j); y += j; pts.push({ x: x, y: y }); }
      }
      cum = [0];
      for (k = 1; k < pts.length; k++) { cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)); }
      traces.push({ p: pts, c: cum, L: cum[cum.length - 1], off: rnd() * cum[cum.length - 1], v: 38 + rnd() * 46 });
    }
  }
  function bgSize() {
    BD = Math.min(2, window.devicePixelRatio || 1);
    BW = window.innerWidth; BH = window.innerHeight;
    bgc.width = BW * BD; bgc.height = BH * BD;
    buildTraces();
  }
  function pointAt(tr, d) {
    var k = 1;
    while (k < tr.c.length - 1 && tr.c[k] < d) k++;
    var a = tr.p[k - 1], b = tr.p[k], f = (d - tr.c[k - 1]) / ((tr.c[k] - tr.c[k - 1]) || 1);
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }
  function bgDraw(now) {
    var t = now / 1000, scroll = reduce ? 0 : window.scrollY * 0.14, oy, tile, n, tr, k, p, d, s, q;
    if (now - blast > 2000 || !bframe) { bcol.ink = cssv('--ink') || '#888'; bcol.acc = cssv('--accent') || '#7a1c2e'; blast = now; }
    bframe++;
    bx.setTransform(BD, 0, 0, BD, 0, 0);
    bx.clearRect(0, 0, BW, BH);
    oy = -(scroll % TH);
    bx.lineCap = 'round'; bx.lineJoin = 'round';
    for (tile = -1; tile <= Math.ceil(BH / TH) + 1; tile++) {
      var base = oy + tile * TH;
      if (base > BH || base + TH + 700 < 0) continue;
      for (n = 0; n < traces.length; n++) {
        tr = traces[n];
        bx.globalAlpha = 0.075; bx.strokeStyle = bcol.ink; bx.lineWidth = 2;
        bx.beginPath();
        for (k = 0; k < tr.p.length; k++) { if (k) bx.lineTo(tr.p[k].x, tr.p[k].y + base); else bx.moveTo(tr.p[k].x, tr.p[k].y + base); }
        bx.stroke();
        bx.beginPath(); bx.arc(tr.p[0].x, tr.p[0].y + base, 5, 0, 7); bx.stroke();
        bx.beginPath(); bx.arc(tr.p[tr.p.length - 1].x, tr.p[tr.p.length - 1].y + base, 5, 0, 7); bx.stroke();
        if (!reduce) {
          d = (tr.off + t * tr.v) % tr.L;
          bx.strokeStyle = bcol.acc; bx.lineWidth = 3;
          for (s = 0; s < 8; s++) {
            q = Math.max(0, d - s * 5);
            p = pointAt(tr, q);
            bx.globalAlpha = (BW < 700 ? 0.3 : 0.55) * (1 - s / 8);
            bx.beginPath(); bx.arc(p.x, p.y + base, 3.4 - s * 0.25, 0, 7); bx.fillStyle = bcol.acc; bx.fill();
          }
        }
      }
    }
    bx.globalAlpha = 1;
  }
  function bgLoop(now) {
    if (now - blast >= 0) { bgDraw(now); }
    setTimeout(function () { requestAnimationFrame(bgLoop); }, 28);
  }
  bgSize();
  window.addEventListener('resize', function () { bgSize(); bgDraw(performance.now()); });
  if (reduce) { bgDraw(0); window.addEventListener('scroll', function () {}, { passive: true }); } else { requestAnimationFrame(bgLoop); }

  if (!reduce && 'IntersectionObserver' in window && document.createTreeWalker) {
    var BLOCKS = 'h1,h2,h3,h4,p,li,dt,dd,td,th,label,small,figcaption,.kicker,.tag,.chip,.proj-tag,.tech-chip,.status,.role,.when,.org,.date,.issuer,.stat span,.eyebrow,.block-label,.proj-eyebrow,.btn,.method b,.method small,.more,.award,.verify,.metric-l,.hero-links a';
    var SKIP = 'script,style,svg,canvas,textarea,input,select,nav,.nav,.skip,.sr-only,.stage,.bg-live,.lightbox,.form-msg,.menu-btn,.to-top,.back-link,.brand,.footer nav';
    var groups = [], seen = new Map();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], nd;
    while ((nd = walker.nextNode())) nodes.push(nd);
    nodes.forEach(function (node) {
      var block = node.parentElement.closest(BLOCKS) || node.parentElement, g = seen.get(block);
      if (!g) { g = { el: block, n: 0 }; seen.set(block, g); groups.push(g); }
      var frag = document.createDocumentFragment(), whole = /flex|grid/.test(getComputedStyle(block).display);
      if (whole) {
        var ws = document.createElement('w-w');
        ws.className = 'w';
        ws.style.setProperty('--i', Math.min(g.n, 26));
        ws.textContent = node.nodeValue;
        g.n++;
        node.parentNode.replaceChild(ws, node);
        return;
      }
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('w-w');
        s.className = 'w';
        s.style.setProperty('--i', Math.min(g.n, 26));
        s.textContent = part;
        g.n++;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); wio.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    groups.forEach(function (g) { g.el.classList.add('tw'); wio.observe(g.el); });
  }

  var form = document.getElementById('contactForm');
  if (form) {
    var msg = document.getElementById('formMsg');
    var btn = document.getElementById('submitBtn');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btn.textContent = 'Sending...';
      btn.disabled = true;
      msg.className = 'form-msg';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('bad');
          msg.className = 'form-msg ok';
          msg.textContent = 'Message sent. I will get back to you soon.';
          form.reset();
        })
        .catch(function () {
          msg.className = 'form-msg err';
          msg.textContent = 'Something went wrong. Please reach me on WhatsApp instead.';
        })
        .then(function () {
          btn.textContent = 'Send message';
          btn.disabled = false;
        });
    });
  }
})();
