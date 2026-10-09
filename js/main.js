/* ==========================================================================
   Democafé – gemeinsame Funktionen für alle Seiten
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE_KEY = 'democafe-bereich';
  var reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileMQ = window.matchMedia('(max-width: 760px)');
  root.classList.remove('no-js');

  function store(area) { try { localStorage.setItem(STORE_KEY, area); } catch (e) { /* privater Modus */ } }
  function area() { return root.getAttribute('data-area') || 'baeckerei'; }

  /* ---------- Videos: nur das gerade sichtbare abspielen ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-src]'));
  var visibleSet = new Set();

  function loadVideo(v) {
    if (v.dataset.loaded || reducedMQ.matches) return;
    v.src = (mobileMQ.matches && v.dataset.srcSm) ? v.dataset.srcSm : v.dataset.src;
    v.dataset.loaded = '1';
  }
  function isShown(v) { return v.offsetParent !== null && v.getClientRects().length > 0; }
  function syncVideos() {
    videos.forEach(function (v) {
      var shouldPlay = !reducedMQ.matches && visibleSet.has(v) && isShown(v) && !v.closest('.splash.is-done');
      if (shouldPlay) {
        loadVideo(v);
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visibleSet.add(en.target); else visibleSet.delete(en.target);
      });
      syncVideos();
    }, { threshold: 0.05 });
    videos.forEach(function (v) { v.muted = true; vio.observe(v); });
  } else {
    videos.forEach(function (v) { visibleSet.add(v); });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) videos.forEach(function (v) { v.pause(); }); else syncVideos();
  });

  /* ---------- Bereich setzen (Bäckerei | Café) ---------- */
  var COLORS = { cafe: '#1d1410', baeckerei: '#f6efe3' };
  var STAMP_COLORS = { cafe: '#c9a063', baeckerei: '#b5583a' };

  function applyArea(a) {
    root.setAttribute('data-area', a);
    store(a);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[a]);
    document.querySelectorAll('[data-set-area]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-area') === a));
    });
    document.dispatchEvent(new CustomEvent('democafe:area', { detail: a }));
    syncVideos();
  }

  var fader = null;
  function switchArea(a) {
    if (a === area()) return;
    if (reducedMQ.matches) { applyArea(a); return; }
    if (!fader) {
      fader = document.createElement('div');
      fader.className = 'area-fade';
      fader.setAttribute('aria-hidden', 'true');
      var stamp = document.querySelector('#logo-stamp') ? '<svg class="logo-stamp" viewBox="0 0 200 200"><use href="#logo-stamp"/></svg>' : '';
      fader.innerHTML = stamp;
      document.body.appendChild(fader);
    }
    fader.style.backgroundColor = COLORS[a];
    fader.style.color = STAMP_COLORS[a];
    var svg = fader.querySelector('svg');
    if (svg) { svg.style.animation = 'none'; void svg.offsetWidth; svg.style.animation = ''; }
    // zweimal rAF, damit die Transition sicher startet
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fader.classList.add('is-on'); });
    });
    setTimeout(function () {
      applyArea(a);
      setTimeout(function () { fader.classList.remove('is-on'); }, 380);
    }, 470);
  }
  document.querySelectorAll('[data-set-area]').forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.getAttribute('data-set-area') === area()));
    b.addEventListener('click', function () { switchArea(b.getAttribute('data-set-area')); });
  });

  /* ---------- Startbildschirm ---------- */
  var splash = document.querySelector('.splash');
  if (splash && !root.classList.contains('no-splash')) {
    document.body.classList.add('splash-open');
    root.style.overflow = 'hidden';
    var halves = splash.querySelectorAll('.splash-half');
    halves.forEach(function (h) {
      h.addEventListener('click', function () {
        if (splash.classList.contains('is-choosing')) return;
        var a = h.getAttribute('data-area');
        h.classList.add('is-chosen');
        splash.classList.add('is-choosing');
        applyArea(a);
        var dur = reducedMQ.matches ? 0 : 850;
        setTimeout(function () {
          splash.classList.add('is-done');
          root.style.overflow = '';
          document.body.classList.remove('splash-open');
          window.scrollTo(0, 0);
          syncVideos();
          var h1 = document.querySelector('.hero-area[data-area="' + a + '"] h1');
          if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
          setTimeout(function () {
            splash.querySelectorAll('video').forEach(function (v) { v.pause(); v.removeAttribute('src'); v.load(); });
            splash.hidden = true;
          }, 800);
        }, dur);
      });
    });
  } else if (splash) {
    splash.hidden = true;
  }

  /* ---------- Kopfzeile ---------- */
  var header = document.querySelector('.site-header');
  var lastSolid = null;
  function onScroll() {
    var solid = window.scrollY > 40;
    if (solid !== lastSolid && header) { header.classList.toggle('is-solid', solid); lastSolid = solid; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger-Menü */
  var toggle = document.querySelector('.nav-toggle');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    }
    root.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
    window.matchMedia('(min-width: 1240px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Weiches Einblenden ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMQ.matches) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Öffnungszeiten ---------- */
  var HOURS = {
    baeckerei: [[7.5, 12], [6, 18.5], [6, 18.5], [6, 18.5], [6, 18.5], [6, 18.5], [6.5, 16]],
    cafe: [[8.5, 17], [7, 19], [7, 19], [7, 19], [7, 19], [7, 19], [8, 18]]
  };
  function fmt(h) { var m = Math.round((h % 1) * 60); return String(Math.floor(h)).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status(a) {
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var r = HOURS[a][d];
    if (h >= r[0] && h < r[1]) return { open: true, text: 'Jetzt geöffnet · bis ' + fmt(r[1]) };
    for (var i = 0; i < 8; i++) {
      var dd = (d + i) % 7, rr = HOURS[a][dd];
      if (i === 0 && h < rr[0]) return { open: false, text: 'Geschlossen · öffnet heute ' + fmt(rr[0]) };
      if (i > 0) return { open: false, text: 'Geschlossen · öffnet ' + (i === 1 ? 'morgen' : ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dd]) + ' ' + fmt(rr[0]) };
    }
  }
  document.querySelectorAll('[data-status]').forEach(function (el) {
    var s = status(el.getAttribute('data-status'));
    el.textContent = s.text;
    el.classList.add(s.open ? 'open' : 'closed');
  });
  var today = new Date().getDay();
  document.querySelectorAll('.hours-table tr[data-day]').forEach(function (tr) {
    if (Number(tr.getAttribute('data-day')) === today) tr.classList.add('today');
  });

  /* ---------- Speisekarte: Reiter Café / Bäckerei ---------- */
  var tabs = document.querySelectorAll('[data-menu-tab]');
  function showMenu(which) {
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-menu-tab') === which)); });
    document.querySelectorAll('[data-menu-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-menu-panel') !== which; });
    p_reveal();
  }
  function p_reveal() { document.querySelectorAll('[data-menu-panel]:not([hidden]) .reveal').forEach(function (el) { el.classList.add('is-in'); }); }
  if (tabs.length) {
    tabs.forEach(function (t) { t.addEventListener('click', function () { showMenu(t.getAttribute('data-menu-tab')); }); });
    var hash = location.hash.replace('#', '');
    var initial = hash === 'baeckerei' || hash === 'cafe' ? hash : area();
    showMenu(initial);
    document.addEventListener('democafe:area', function (e) { showMenu(e.detail); });
  }

  /* ---------- Galerie: Filter & Lightbox ---------- */
  var gItems = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      gItems.forEach(function (it) { it.classList.toggle('is-hidden', f !== 'alle' && it.getAttribute('data-cat') !== f); });
    });
  });
  var lb = document.querySelector('.lightbox');
  if (lb && gItems.length) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p'), idx = 0, lastFocus = null;
    var visibleItems = function () { return gItems.filter(function (i) { return !i.classList.contains('is-hidden'); }); };
    var open = function (it) {
      var list = visibleItems(); idx = list.indexOf(it);
      var img = it.querySelector('img');
      lbImg.src = img.getAttribute('data-full') || img.src; lbImg.alt = img.alt;
      lbCap.textContent = it.querySelector('figcaption') ? it.querySelector('figcaption').textContent : '';
      lastFocus = document.activeElement;
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
      lb.querySelector('.lb-close').focus();
    };
    var close = function () { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); if (lastFocus) lastFocus.focus(); };
    var step = function (d) { var list = visibleItems(); open(list[(idx + d + list.length) % list.length]); };
    gItems.forEach(function (it) {
      it.setAttribute('tabindex', '0');
      it.addEventListener('click', function () { open(it); });
      it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it); } });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Demo-Formulare (ohne Funktion) ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.demo-msg');
      if (msg) { msg.classList.add('is-shown'); msg.focus && msg.setAttribute('tabindex', '-1'); msg.focus(); }
    });
  });

  /* Datum: frühestens heute bzw. in 2 Tagen (Torten) */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  document.querySelectorAll('input[type="date"][data-min-days]').forEach(function (inp) {
    var d = new Date(); d.setDate(d.getDate() + Number(inp.getAttribute('data-min-days')));
    inp.min = iso(d);
    if (!inp.value) inp.value = iso(d);
  });
  function niceDate(v) {
    if (!v) return '–';
    var p = v.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()] + ', ' + p[2] + '.' + p[1] + '.' + p[0];
  }

  /* ---------- Torten-Vorschau ---------- */
  var cakeForm = document.querySelector('#torten-form');
  if (cakeForm) {
    var CAKES = {
      geburtstag: { name: 'Geburtstagstorte', base: 6.5 },
      schoko: { name: 'Schokoladentorte', base: 7 },
      frucht: { name: 'Fruchttorte', base: 7 },
      hochzeit: { name: 'Hochzeitstorte', base: 9.5 }
    };
    var FLAVORS = {
      vanille: { name: 'Vanille-Rahm', cream: '#f7ecd4', sponge: '#f1d79f', fill: '#f3e3b8', deco: '#e8c26a' },
      schokolade: { name: 'Schokolade', cream: '#6b3d22', sponge: '#4a2814', fill: '#8a5530', deco: '#c9a063' },
      erdbeer: { name: 'Erdbeere', cream: '#f6d3d3', sponge: '#f1d79f', fill: '#e2657a', deco: '#c6283f' },
      himbeer: { name: 'Himbeer-Joghurt', cream: '#f0c4d2', sponge: '#f3dcae', fill: '#c23d63', deco: '#a3173f' },
      mokka: { name: 'Mokka', cream: '#c9a17a', sponge: '#7a4a28', fill: '#a87850', deco: '#5b331a' },
      zitrone: { name: 'Zitrone', cream: '#faf0bf', sponge: '#f3dc9a', fill: '#f2d14b', deco: '#d7ae17' }
    };
    var SIZES = { s: { label: '6–8 Personen', p: 8, tiers: 1 }, m: { label: '10–12 Personen', p: 12, tiers: 1 }, l: { label: '16–20 Personen', p: 20, tiers: 2 }, xl: { label: '30–40 Personen', p: 40, tiers: 3 } };
    var svg = document.querySelector('#cake-svg');
    var $ = function (s) { return cakeForm.querySelector(s); };
    var val = function (n) { var el = cakeForm.querySelector('[name="' + n + '"]:checked') || cakeForm.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };

    var updateCake = function () {
      var art = CAKES[val('art')] || CAKES.geburtstag;
      var fl = FLAVORS[val('geschmack')] || FLAVORS.vanille;
      var size = SIZES[val('groesse')] || SIZES.m;
      var text = ($('[name="aufschrift"]').value || '').trim();
      var date = $('[name="abholdatum"]').value;
      svg.style.setProperty('--cream', fl.cream);
      svg.style.setProperty('--sponge', fl.sponge);
      svg.style.setProperty('--fill', fl.fill);
      svg.style.setProperty('--deco', fl.deco);
      svg.querySelectorAll('.cake-tier').forEach(function (t, i) {
        var on = i < size.tiers;
        t.style.opacity = on ? 1 : 0;
        t.style.transform = on ? 'none' : 'translateY(-30px) scale(.9)';
      });
      // Deko je Torten-Art, immer auf dem obersten Stockwerk
      svg.querySelectorAll('[data-deco]').forEach(function (d) { d.style.display = d.getAttribute('data-deco') === val('art') ? '' : 'none'; });
      var TOP = [{ dy: 0, s: 1, ty: 280, fs: 20 }, { dy: -60, s: .75, ty: 216, fs: 16 }, { dy: -112, s: .5, ty: 160, fs: 12.5 }][size.tiers - 1];
      svg.querySelector('#cake-top').setAttribute('transform', 'translate(0 ' + TOP.dy + ') translate(200 240) scale(' + TOP.s + ') translate(-200 -240)');
      var ct = svg.querySelector('#cake-text');
      ct.textContent = text;
      ct.setAttribute('y', TOP.ty);
      ct.setAttribute('font-size', TOP.fs);
      var price = Math.round(art.base * size.p * 2) / 2;
      if (text) price += 5;
      document.querySelector('#sum-art').textContent = art.name;
      document.querySelector('#sum-size').textContent = size.label;
      document.querySelector('#sum-flavor').textContent = fl.name;
      document.querySelector('#sum-text').textContent = text ? '«' + text + '»' : 'ohne Aufschrift';
      document.querySelector('#sum-date').textContent = niceDate(date);
      document.querySelector('#sum-price').textContent = 'ca. CHF ' + price.toFixed(2);
      document.querySelector('#preview-title').textContent = art.name + ' · ' + fl.name;
    };
    cakeForm.addEventListener('input', updateCake);
    cakeForm.addEventListener('change', updateCake);
    updateCake();
  }

  /* ---------- Reservations-Zusammenfassung ---------- */
  var resForm = document.querySelector('#reservation-form');
  if (resForm) {
    var upd = function () {
      var g = function (n) { var el = resForm.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
      var set = function (id, v) { var el = document.querySelector(id); if (el) el.textContent = v; };
      set('#res-date', niceDate(g('datum')));
      set('#res-time', g('zeit') ? g('zeit') + ' Uhr' : '–');
      set('#res-pers', g('personen') ? g('personen') + (g('personen') === '1' ? ' Person' : ' Personen') : '–');
      set('#res-name', g('name') || '–');
      var bereich = resForm.querySelector('[name="bereich"]:checked');
      set('#res-area', bereich ? bereich.getAttribute('data-label') : '–');
    };
    resForm.addEventListener('input', upd);
    resForm.addEventListener('change', upd);
    upd();
  }

  /* Jahr im Footer */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  syncVideos();
})();
