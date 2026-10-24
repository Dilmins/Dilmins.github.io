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
