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
      var ink = col('--ink'), yel = col('--yellow'), line = col('--line'), panel = col('--panel'), dim = col('--ink-3');
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
