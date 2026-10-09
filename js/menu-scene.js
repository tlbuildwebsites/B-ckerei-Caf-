/* ==========================================================================
   «Ihr Menü entsteht» – Scroll-Szene
   Selbst gezeichnete SVG-Illustrationen + CSS-Transforms (kein 3D-Framework).
   Scroll-Logik in einer requestAnimationFrame-Schleife mit Lerp-Glättung.
   ========================================================================== */
(function () {
  'use strict';

  var scene = document.querySelector('.menu-scene');
  if (!scene) return;

  /* ---------- SVG-Illustrationen (Ansicht von oben) ---------- */
  var SVG = {};

  SVG.napkin =
    '<svg viewBox="0 0 120 300" preserveAspectRatio="none" aria-hidden="true">' +
    '<defs><linearGradient id="nkG" x1="0" x2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset=".5" stop-color="#f8f2e7"/><stop offset="1" stop-color="#e6dac6"/></linearGradient>' +
    '<pattern id="nkP" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" stroke="#d7c8af" stroke-width=".5" opacity=".6"/></pattern></defs>' +
    '<rect x="6" y="8" width="112" height="290" rx="4" fill="rgba(0,0,0,.28)"/>' +
    '<rect x="0" y="0" width="112" height="290" rx="4" fill="url(#nkG)"/>' +
    '<rect x="0" y="0" width="112" height="290" rx="4" fill="url(#nkP)"/>' +
    '<rect x="8" y="8" width="96" height="274" fill="none" stroke="#b5583a" stroke-width="2" opacity=".55"/>' +
    '<rect x="13" y="13" width="86" height="264" fill="none" stroke="#b5583a" stroke-width=".8" opacity=".4"/>' +
    '<path d="M56 0V290" stroke="#cbbb9f" stroke-width="1.4" opacity=".7"/><path d="M57.5 0V290" stroke="#fff" stroke-width="1" opacity=".6"/>' +
    /* Gabel */
    '<g transform="translate(56 40)"><rect x="-4" y="70" width="8" height="160" rx="4" fill="#c9cdd2"/><rect x="-2.5" y="72" width="2" height="150" rx="1" fill="#f4f6f8" opacity=".9"/>' +
    '<path d="M-14 0V46Q-14 72 -4 76H4Q14 72 14 46V0" fill="none" stroke="#c4c8cd" stroke-width="3.2"/>' +
    '<path d="M-4.7 0V52M4.7 0V52" stroke="#c4c8cd" stroke-width="3.2"/><path d="M-12 50Q0 62 12 50V58Q0 72 -12 58Z" fill="#c4c8cd"/></g>' +
    '</svg>';

  SVG.plate =
    '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<radialGradient id="plSh"><stop offset=".72" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="plR" cx=".45" cy=".42"><stop offset="0" stop-color="#fffdf9"/><stop offset=".62" stop-color="#f6f1e8"/><stop offset=".69" stop-color="#e2d8c8"/><stop offset=".78" stop-color="#fffdf8"/><stop offset=".95" stop-color="#f1eadf"/><stop offset="1" stop-color="#d6cab6"/></radialGradient>' +
    '<linearGradient id="plHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
    '<circle cx="108" cy="110" r="100" fill="url(#plSh)"/>' +
    '<circle cx="100" cy="100" r="94" fill="url(#plR)"/>' +
    '<circle cx="100" cy="100" r="86" fill="none" stroke="#c9a063" stroke-width=".9" opacity=".8"/>' +
    '<circle cx="100" cy="100" r="83.5" fill="none" stroke="#c9a063" stroke-width=".4" opacity=".6"/>' +
    '<path d="M30 70A76 76 0 0 1 90 20" fill="none" stroke="url(#plHi)" stroke-width="5" stroke-linecap="round" opacity=".8"/>' +
    '</svg>';

  SVG.toast =
    '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<radialGradient id="tbSh"><stop offset=".6" stop-color="#3a2210" stop-opacity=".45"/><stop offset="1" stop-color="#3a2210" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="tbCr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c6843f"/><stop offset=".5" stop-color="#a5622a"/><stop offset="1" stop-color="#7c4319"/></linearGradient>' +
    '<radialGradient id="tbIn" cx=".45" cy=".4"><stop offset="0" stop-color="#f8e3b8"/><stop offset=".7" stop-color="#efcf96"/><stop offset="1" stop-color="#dcae6b"/></radialGradient>' +
    '<radialGradient id="tbJ" cx=".4" cy=".35"><stop offset="0" stop-color="#e2475a"/><stop offset=".55" stop-color="#b4192f"/><stop offset="1" stop-color="#7c0d1f"/></radialGradient></defs>' +
    '<ellipse cx="108" cy="114" rx="80" ry="84" fill="url(#tbSh)"/>' +
    '<path d="M42 72C28 30 78 14 100 28C122 14 174 30 160 72L157 162Q157 180 140 180H60Q43 180 43 162Z" fill="url(#tbCr)"/>' +
    '<path d="M54 76C44 44 82 32 100 42C118 32 158 44 148 76L146 158Q146 168 136 168H64Q54 168 54 158Z" fill="url(#tbIn)"/>' +
    '<g fill="#d9b072" opacity=".75"><ellipse cx="72" cy="90" rx="3" ry="2"/><ellipse cx="124" cy="70" rx="2.5" ry="1.6"/><ellipse cx="88" cy="140" rx="3.4" ry="2"/><ellipse cx="132" cy="128" rx="2.6" ry="1.8"/><ellipse cx="108" cy="104" rx="2" ry="1.4"/><ellipse cx="66" cy="150" rx="2" ry="1.4"/><ellipse cx="140" cy="96" rx="2.2" ry="1.5"/><ellipse cx="96" cy="60" rx="2.4" ry="1.4"/></g>' +
    '<g class="ms-jam" style="transform-origin:100px 104px">' +
    '<path d="M66 82C70 62 98 58 112 64C132 56 146 74 140 92C150 108 142 132 128 140C116 156 88 154 76 142C58 132 56 104 66 82Z" fill="url(#tbJ)"/>' +
    '<path d="M74 92C80 74 102 72 114 78" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".32"/>' +
    '<ellipse cx="118" cy="118" rx="6" ry="3.5" fill="#fff" opacity=".22"/>' +
    '<g fill="#6e0a18" opacity=".55"><circle cx="96" cy="110" r="3.5"/><circle cx="118" cy="96" r="2.6"/><circle cx="86" cy="128" r="2.8"/><circle cx="124" cy="128" r="2.2"/></g>' +
    '</g></svg>';

  /* Croissant: ein Halbmond-Körper mit Schicht-Rillen */
  SVG.croissant =
    '<svg viewBox="0 0 260 200" aria-hidden="true"><defs>' +
    '<radialGradient id="crG" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="#ffd98c"/><stop offset=".35" stop-color="#eba64c"/><stop offset=".75" stop-color="#bf6d2a"/><stop offset="1" stop-color="#83431a"/></radialGradient>' +
    '<linearGradient id="crT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c4" stop-opacity=".55"/><stop offset=".5" stop-color="#fff2c4" stop-opacity="0"/><stop offset="1" stop-color="#5a2a0c" stop-opacity=".35"/></linearGradient>' +
    '<radialGradient id="crSh"><stop offset=".5" stop-color="#2a1608" stop-opacity=".55"/><stop offset="1" stop-color="#2a1608" stop-opacity="0"/></radialGradient></defs>' +
    '<ellipse cx="136" cy="112" rx="124" ry="62" fill="url(#crSh)"/>' +
    '<path d="M22 146C26 98 62 50 130 44C198 50 234 98 238 146C224 140 206 128 186 126C170 140 150 148 130 148C110 148 90 140 74 126C54 128 36 140 22 146Z" fill="url(#crG)"/>' +
    '<path d="M22 146C26 98 62 50 130 44C198 50 234 98 238 146C224 140 206 128 186 126C170 140 150 148 130 148C110 148 90 140 74 126C54 128 36 140 22 146Z" fill="url(#crT)"/>' +
    '<g fill="none" stroke-linecap="round">' +
    '<path d="M52 84Q66 104 60 132M90 58Q102 92 94 134M170 58Q158 92 166 134M208 84Q194 104 200 132" stroke="#7a3a12" stroke-width="3.2" opacity=".55"/>' +
    '<path d="M57 82Q71 104 65 130M95 56Q107 92 99 134M175 58Q163 92 171 132M213 86Q199 104 205 130" stroke="#ffe3a0" stroke-width="2" opacity=".55"/>' +
    '<path d="M118 60Q130 54 142 60M110 84Q130 76 150 84" stroke="#fff3cc" stroke-width="3" opacity=".5"/>' +
    '<path d="M34 128Q40 112 50 104M226 128Q220 112 210 104" stroke="#fff3cc" stroke-width="2" opacity=".4"/>' +
    '</g></svg>';

  SVG.cup =
    '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<radialGradient id="cpSh"><stop offset=".7" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="cpSa" cx=".45" cy=".42"><stop offset="0" stop-color="#fbf7f0"/><stop offset=".55" stop-color="#efe7da"/><stop offset=".62" stop-color="#ddd1bd"/><stop offset=".7" stop-color="#fffcf6"/><stop offset="1" stop-color="#d9ccb7"/></radialGradient>' +
    '<radialGradient id="cpIn" cx=".5" cy=".5"><stop offset=".7" stop-color="#fffaf2"/><stop offset="1" stop-color="#d4c6b0"/></radialGradient>' +
    '<radialGradient id="cpCo" cx=".5" cy=".5"><stop offset="0" stop-color="#a8642c"/><stop offset=".55" stop-color="#8a4b1e"/><stop offset=".85" stop-color="#c58a4c"/><stop offset="1" stop-color="#6a3612"/></radialGradient></defs>' +
    '<circle cx="106" cy="108" r="96" fill="url(#cpSh)"/>' +
    '<circle cx="100" cy="100" r="90" fill="url(#cpSa)"/>' +
    '<circle cx="100" cy="100" r="80" fill="none" stroke="#c9a063" stroke-width=".7" opacity=".7"/>' +
    /* Löffel */
    '<g transform="rotate(-38 100 100)"><ellipse cx="100" cy="20" rx="8" ry="11" fill="#cfd3d8"/><rect x="98" y="28" width="4" height="30" rx="2" fill="#c3c7cc"/><ellipse cx="98" cy="18" rx="3" ry="5" fill="#fff" opacity=".7"/></g>' +
    /* Henkel */
    '<rect x="148" y="90" width="38" height="20" rx="10" fill="#e7dece"/><rect x="152" y="94" width="30" height="7" rx="3.5" fill="#fff" opacity=".8"/>' +
    '<circle cx="104" cy="104" r="62" fill="#000" opacity=".18"/>' +
    '<circle cx="100" cy="100" r="61" fill="#fffaf2"/>' +
    '<circle cx="100" cy="100" r="55" fill="url(#cpIn)"/>' +
    '<g class="ms-coffee" style="transform-origin:100px 100px"><circle cx="100" cy="100" r="51" fill="url(#cpCo)"/>' +
    '<circle cx="100" cy="100" r="49" fill="none" stroke="#d9a466" stroke-width="2" opacity=".5"/></g>' +
    '<g class="ms-heart" style="transform-origin:100px 102px">' +
    '<path d="M100 132C76 114 64 100 66 84C68 70 86 64 100 80C114 64 132 70 134 84C136 100 124 114 100 132Z" fill="#f6e9d4"/>' +
    '<path d="M100 120C84 108 78 98 80 88C82 80 92 78 100 88C108 78 118 80 120 88C122 98 116 108 100 120Z" fill="none" stroke="#c8935a" stroke-width="2" opacity=".55"/>' +
    '<path d="M100 108C92 102 90 96 92 92C94 88 98 89 100 93C102 89 106 88 108 92C110 96 108 102 100 108Z" fill="none" stroke="#c8935a" stroke-width="1.6" opacity=".45"/>' +
    '<path d="M100 132V146" stroke="#f6e9d4" stroke-width="3" stroke-linecap="round"/></g>' +
    '<path d="M54 76A54 54 0 0 1 96 46" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
    '</svg>';

  SVG.cocktail =
    '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<radialGradient id="ckSh"><stop offset=".5" stop-color="#ff7a3c" stop-opacity=".45"/><stop offset=".75" stop-color="#3a1408" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="ckL" cx=".45" cy=".42"><stop offset="0" stop-color="#ffd27a"/><stop offset=".35" stop-color="#ff9a45"/><stop offset=".75" stop-color="#f0503e"/><stop offset="1" stop-color="#b3203f"/></radialGradient>' +
    '<radialGradient id="ckLe"><stop offset="0" stop-color="#fffbd8"/><stop offset=".8" stop-color="#fbe58a"/><stop offset="1" stop-color="#f2cf3c"/></radialGradient></defs>' +
    '<circle cx="114" cy="116" r="92" fill="url(#ckSh)"/>' +
    '<circle cx="100" cy="100" r="74" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.75)" stroke-width="3"/>' +
    '<g class="ms-liquid" style="transform-origin:100px 100px"><circle cx="100" cy="100" r="67" fill="url(#ckL)"/>' +
    '<circle cx="100" cy="100" r="60" fill="none" stroke="#fff" stroke-width="1" opacity=".25"/></g>' +
    '<circle class="ms-ripple" cx="100" cy="100" r="30" fill="none" stroke="#fff" stroke-width="2" style="transform-origin:100px 100px" opacity="0"/>' +
    '<g class="ms-ice" style="transform-origin:78px 82px"><rect x="60" y="64" width="36" height="36" rx="7" transform="rotate(14 78 82)" fill="rgba(255,255,255,.38)" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/><path d="M66 72L84 70" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>' +
    '<g class="ms-ice" style="transform-origin:120px 92px"><rect x="103" y="75" width="34" height="34" rx="7" transform="rotate(-20 120 92)" fill="rgba(255,255,255,.34)" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/><path d="M108 84L124 78" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>' +
    '<g class="ms-ice" style="transform-origin:96px 124px"><rect x="79" y="107" width="34" height="34" rx="7" transform="rotate(38 96 124)" fill="rgba(255,255,255,.34)" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/><path d="M86 114L100 110" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>' +
    /* Strohhalm + Minze */
    '<path d="M108 108L176 168" stroke="#f3ead8" stroke-width="7" stroke-linecap="round"/><path d="M108 108L176 168" stroke="#b5583a" stroke-width="7" stroke-linecap="round" stroke-dasharray="6 8" opacity=".85"/>' +
    '<path d="M70 132Q60 118 74 108Q84 120 70 132Z" fill="#4f9a4a"/><path d="M70 132L74 110" stroke="#2f6b2e" stroke-width="1"/>' +
    '<g class="ms-lemon" style="transform-origin:150px 52px">' +
    '<circle cx="150" cy="52" r="27" fill="#f4d23f"/><circle cx="150" cy="52" r="23" fill="url(#ckLe)"/>' +
    '<g stroke="#fff7d0" stroke-width="2" opacity=".9"><path d="M150 31V73M129 52H171M135 37L165 67M165 37L135 67"/></g>' +
    '<circle cx="150" cy="52" r="3" fill="#fff7d0"/></g>' +
    '<path d="M44 72A62 62 0 0 1 88 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
    '</svg>';

  SVG.steam =
    '<svg viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M50 290C30 250 70 220 50 180C30 140 70 110 50 70"/>' +
    '<path d="M32 290C16 250 48 226 32 190C18 160 44 130 34 96"/>' +
    '<path d="M68 290C84 254 54 228 68 192C80 162 58 136 66 104"/>' +
    '</svg>';

  /* ---------- Inhalte der Schritte ---------- */
  var STEPS = [
    { n: '01', t: 'Ein Platz für Sie', p: 'Leinenserviette, feines Porzellan, warmes Eichenholz – Ihr Frühstücksgedeck mit Butter und Tageszeitung.', name: 'Frühstücksgedeck «Ankommen»', price: '4.50' },
    { n: '02', t: 'Bauernbrot mit Konfitüre', p: 'Krustiges Sauerteigbrot aus unserer Backstube, grosszügig bestrichen mit hausgemachter Erdbeer-Konfitüre.', name: 'Bauernbrot & Erdbeer-Konfitüre', price: '5.80' },
    { n: '03', t: 'Goldenes Buttercroissant', p: '27 Schichten, echte Schweizer Butter – jeden Morgen ab 5 Uhr frisch aus dem Ofen.', name: 'Buttercroissant', price: '3.40' },
    { n: '04', t: 'Cappuccino mit Herz', p: 'Hausmischung aus Kolumbien und Äthiopien, samtiger Milchschaum und Latte-Art von Hand gegossen.', name: 'Cappuccino', price: '5.20' },
    { n: '05', t: 'Blutorangen-Spritz', p: 'Blutorange, Holunderblüte, Prosecco und viel Eis – mit einer Zitronenscheibe am Glasrand.', name: 'Spritz «Demostadt»', price: '12.50' }
  ];
  var TOTAL = '31.40';

  function stepHTML(s) {
    return '<span class="num">' + s.n + ' / 05</span>' +
      '<h3>' + s.t + '</h3><p>' + s.p + '</p>' +
      '<span class="price"><small>' + s.name + '</small> CHF ' + s.price + '</span>';
  }

  /* Krümel – feste, «zufällige» Positionen rund ums Croissant (Stage-Prozent) */
  var CRUMBS = [
    [-9, 6, .9], [12, 9, 1.1], [3, 14, .7], [-14, -2, .8], [16, -1, .6], [-4, 18, 1],
    [8, -8, .7], [20, 12, .8], [-17, 10, .6], [1, 22, .5]
  ];
  var CROISSANT_C = [56.5, 50];

  var stageCount = 0;
  function buildStage() {
    var n = stageCount++;
    var crumbs = CRUMBS.map(function () { return '<i class="ms-crumb"></i>'; }).join('');
    // eindeutige IDs je Kopie, damit Verläufe auch in versteckten Varianten funktionieren
    return stageHTML(crumbs).replace(/id="(\w+)"/g, 'id="$1-' + n + '"').replace(/url\(#(\w+)\)/g, 'url(#$1-' + n + ')');
  }
  function stageHTML(crumbs) {
    return '<div class="ms-stage"><div class="ms-plane">' +
      '<div class="ms-wood"></div>' +
      '<div class="ms-item ms-napkin">' + SVG.napkin + '</div>' +
      '<div class="ms-item ms-plate">' + SVG.plate + '</div>' +
      '<div class="ms-item ms-toast">' + SVG.toast + '</div>' +
      crumbs +
      '<div class="ms-item ms-croissant">' + SVG.croissant + '</div>' +
      '<div class="ms-item ms-cup">' + SVG.cup + '</div>' +
      '<div class="ms-item ms-cocktail">' + SVG.cocktail + '</div>' +
      '<div class="ms-steam">' + SVG.steam + '</div>' +
      '</div><div class="ms-light"></div></div>';
  }

  /* ---------- Hilfsfunktionen ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function seg01(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function backOut(t) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  /* Zeitachse: Intro 0–0.05, fünf Schritte, Finale */
  var INTRO = 0.05, FINALE = 0.84;
  var STEP_LEN = (FINALE - INTRO) / 5;
  function stepT(P, k) { return seg01(P, INTRO + k * STEP_LEN, INTRO + (k + 1) * STEP_LEN); }

  function Renderer(root) {
    var q = function (s) { return root.querySelector(s); };
    var qa = function (s) { return root.querySelectorAll(s); };
    this.el = {
      stage: q('.ms-stage'), napkin: q('.ms-napkin'), plate: q('.ms-plate'), toast: q('.ms-toast'),
      jam: q('.ms-jam'), croissant: q('.ms-croissant'), crumbs: qa('.ms-crumb'),
      cup: q('.ms-cup'), coffee: q('.ms-coffee'), heart: q('.ms-heart'), steam: q('.ms-steam'),
      cocktail: q('.ms-cocktail'), liquid: q('.ms-liquid'), ice: qa('.ms-ice'), ripple: q('.ms-ripple'), lemon: q('.ms-lemon'),
      steps: qa('.ms-step'), bars: qa('.ms-progress i'), intro: q('.ms-intro'), finale: q('.ms-finale')
    };
    this.cache = new Map();
    // Krümel-Positionen setzen
    var c = this.el.crumbs;
    for (var i = 0; i < c.length; i++) {
      c[i].style.left = (CROISSANT_C[0] + CRUMBS[i][0]) + '%';
      c[i].style.top = (CROISSANT_C[1] + CRUMBS[i][1]) + '%';
    }
  }
  Renderer.prototype.set = function (el, prop, val) {
    if (!el) return;
    var m = this.cache.get(el);
    if (!m) { m = {}; this.cache.set(el, m); }
    if (m[prop] === val) return;
    m[prop] = val;
    el.style[prop] = val;
  };
  Renderer.prototype.tf = function (el, x, y, rot, sc, op) {
    this.set(el, 'transform', 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')');
    this.set(el, 'opacity', op.toFixed(3));
  };

  Renderer.prototype.render = function (P, mobile) {
    var e = this.el, t, a, b, c, i;

    /* Intro-Titel */
    if (e.intro) {
      a = seg01(P, 0, INTRO * .9);
      this.set(e.intro, 'opacity', (1 - a).toFixed(3));
      this.set(e.intro, 'transform', 'translate3d(0,' + (-a * 30).toFixed(1) + 'px,0)');
    }
    this.set(e.napkin, 'opacity', (0.35 + 0.65 * easeOut(seg01(P, 0, INTRO))).toFixed(3));

    /* 1 – Teller gleitet herein */
    t = stepT(P, 0);
    a = easeOut(seg01(t, 0, .6));
    this.tf(e.plate, lerp(130, 0, a), lerp(-30, 0, a), lerp(70, 0, a), 1, a);

    /* 2 – Marmeladebrot, Konfitüre verteilt sich */
    t = stepT(P, 1);
    a = easeOut(seg01(t, 0, .4));
    this.tf(e.toast, 0, lerp(-70, 0, a), lerp(-18, -6, a), lerp(1.35, 1, a), seg01(t, 0, .15));
    b = seg01(t, .35, .8);
    this.set(e.jam, 'transform', 'scale(' + (0.08 + 0.92 * backOut(b)).toFixed(4) + ') rotate(' + ((1 - b) * -20).toFixed(1) + 'deg)');
    this.set(e.jam, 'opacity', seg01(t, .33, .42).toFixed(3));

    /* 3 – Croissant fliegt im Bogen dazu, Krümel fallen */
    t = stepT(P, 2);
    a = easeInOut(seg01(t, 0, .55));
    var arc = Math.sin(a * Math.PI) * -40;
    this.tf(e.croissant, lerp(-210, 0, a), lerp(-150, 0, a) + arc, lerp(-150, -12, a), lerp(1.5, 1, a), seg01(t, 0, .1));
    b = seg01(t, .5, .85);
    for (i = 0; i < e.crumbs.length; i++) {
      c = clamp(b * 1.4 - i * .04, 0, 1);
      var ce = easeOut(c);
      var dx = -CRUMBS[i][0] * (1 - ce) * 120, dy = -CRUMBS[i][1] * (1 - ce) * 120;
      this.set(e.crumbs[i], 'transform', 'translate3d(' + dx.toFixed(1) + '%,' + dy.toFixed(1) + '%,0) scale(' + (CRUMBS[i][2] * (1.8 - .8 * ce)).toFixed(3) + ')');
      this.set(e.crumbs[i], 'opacity', Math.min(1, c * 3).toFixed(3));
    }

    /* 4 – Kaffeetasse, Kaffee füllt sich, Latte-Art-Herz, Dampf */
    t = stepT(P, 3);
    a = easeOut(seg01(t, 0, .35));
    this.tf(e.cup, lerp(90, 0, a), lerp(-60, 0, a), lerp(40, 0, a), 1, a);
    b = easeOut(seg01(t, .3, .6));
    this.set(e.coffee, 'transform', 'scale(' + (0.05 + 0.95 * b).toFixed(4) + ')');
    this.set(e.coffee, 'opacity', seg01(t, .3, .36).toFixed(3));
    c = seg01(t, .55, .82);
    this.set(e.heart, 'transform', 'scale(' + (0.15 + 0.85 * backOut(c)).toFixed(4) + ') rotate(' + ((1 - c) * 25).toFixed(1) + 'deg)');
    this.set(e.heart, 'opacity', seg01(t, .55, .62).toFixed(3));
    this.set(e.steam, 'opacity', (seg01(t, .6, .9) * (mobile ? .8 : 1)).toFixed(3));

    /* 5 – Cocktail, Eiswürfel fallen, Zitronenscheibe am Rand */
    t = stepT(P, 4);
    a = easeOut(seg01(t, 0, .3));
    this.tf(e.cocktail, lerp(110, 0, a), lerp(90, 0, a), lerp(-30, 0, a), 1, a);
    this.set(e.liquid, 'transform', 'scale(' + (0.55 + 0.45 * easeOut(seg01(t, .1, .35))).toFixed(4) + ')');
    for (i = 0; i < e.ice.length; i++) {
      c = easeOut(seg01(t, .32 + i * .09, .5 + i * .09));
      this.set(e.ice[i], 'transform', 'scale(' + (2.6 - 1.6 * c).toFixed(4) + ') rotate(' + ((1 - c) * 50 * (i % 2 ? 1 : -1)).toFixed(1) + 'deg)');
      this.set(e.ice[i], 'opacity', Math.min(1, c * 2.5).toFixed(3));
    }
    c = seg01(t, .45, .78);
    this.set(e.ripple, 'transform', 'scale(' + (0.6 + 1.6 * c).toFixed(3) + ')');
    this.set(e.ripple, 'opacity', (c > 0 && c < 1 ? (1 - c) * .7 : 0).toFixed(3));
    c = backOut(seg01(t, .66, .88));
    this.set(e.lemon, 'transform', 'rotate(' + ((1 - c) * 120).toFixed(1) + 'deg) scale(' + Math.max(0, c).toFixed(4) + ')');

    /* Kamera: folgt dem aktiven Element, zum Schluss sanft herauszoomen */
    var focus = [[48, 42], [44, 40], [56, 50], [80, 26], [80, 64]];
    var fx = 50, fy = 45, zoom = 1;
    if (P > INTRO) {
      var sp = clamp((P - INTRO) / STEP_LEN, 0, 4.999);
      var k = Math.floor(sp), f = easeInOut(clamp((sp - k - .0) / .5, 0, 1));
      var from = focus[Math.max(0, k - 1)], to = focus[k];
      if (k === 0) from = [50, 45];
      fx = lerp(from[0], to[0], f); fy = lerp(from[1], to[1], f);
      zoom = lerp(1, mobile ? 1.05 : 1.08, easeOut(seg01(P, INTRO, INTRO + STEP_LEN * .6)));
    }
    var fin = easeInOut(seg01(P, FINALE, FINALE + .1));
    fx = lerp(fx, 50, fin); fy = lerp(fy, 45, fin);
    zoom = lerp(zoom, mobile ? .9 : .92, fin);
    var tx = (50 - fx) * (mobile ? .45 : .4), ty = (45 - fy) * (mobile ? .45 : .5) - fin * (mobile ? 7 : 2);
    this.set(e.stage, 'transform', 'translate3d(' + tx.toFixed(2) + '%,' + ty.toFixed(2) + '%,0) scale(' + zoom.toFixed(4) + ')');

    /* Texte neben dem Tisch */
    for (i = 0; i < e.steps.length; i++) {
      var tin = seg01(stepT(P, i), .04, .2);
      var tout = i < e.steps.length - 1 ? seg01(stepT(P, i + 1), 0, .1) : seg01(P, FINALE - .01, FINALE + .04);
      var op = tin * (1 - tout);
      this.set(e.steps[i], 'opacity', op.toFixed(3));
      this.set(e.steps[i], 'transform', 'translate3d(0,' + ((1 - tin) * 26 - tout * 26).toFixed(1) + 'px,0)');
      this.set(e.steps[i], 'visibility', op > .01 ? 'visible' : 'hidden');
      if (e.bars[i]) this.set(e.bars[i], 'transform', 'scaleX(' + stepT(P, i).toFixed(3) + ')');
    }
    if (e.finale) {
      var fo = seg01(P, FINALE + .04, FINALE + .1);
      this.set(e.finale, 'opacity', fo.toFixed(3));
      this.set(e.finale, 'transform', 'translate3d(var(--fx, 0px), calc(var(--fy, 0px) + ' + ((1 - fo) * 24).toFixed(1) + 'px), 0)');
      e.finale.classList.toggle('is-active', fo > .5);
    }
  };

  /* ---------- Aufbau ---------- */
  var sticky = scene.querySelector('.sticky');
  var stageWrap = scene.querySelector('.ms-stage-wrap');
  var copy = scene.querySelector('.ms-copy');
  var progress = scene.querySelector('.ms-progress');
  stageWrap.insertAdjacentHTML('afterbegin', buildStage());
  copy.innerHTML = STEPS.map(function (s) { return '<div class="ms-step">' + stepHTML(s) + '</div>'; }).join('');
  progress.innerHTML = STEPS.map(function () { return '<span><i></i></span>'; }).join('');
  scene.querySelectorAll('.ms-total').forEach(function (el) { el.textContent = 'CHF ' + TOTAL; });

  /* Statische Variante (reduzierte Bewegung): Schritte als Bilder untereinander */
  var staticBox = scene.querySelector('.ms-static-grid');
  if (staticBox) {
    var html = '';
    STEPS.forEach(function (s, k) {
      html += '<div class="ms-static-item" data-k="' + k + '"><div class="ms-stage-wrap">' + buildStage() + '</div>' +
        '<div class="ms-step">' + stepHTML(s) + '</div></div>';
    });
    staticBox.innerHTML = html;
    Array.prototype.forEach.call(staticBox.querySelectorAll('.ms-static-item'), function (item, k) {
      var r = new Renderer(item);
      r.el.steps = []; r.el.bars = []; r.el.intro = null; r.el.finale = null;
      // Endzustand dieses Schritts, Kamera neutral
      r.render(INTRO + (k + 1) * STEP_LEN - 0.0001, false);
      r.set(r.el.stage, 'transform', 'none');
      if (k < 3) r.set(r.el.steam, 'opacity', '0');
    });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var renderer = new Renderer(sticky);
  var mqMobile = window.matchMedia('(max-width: 860px)');

  var target = 0, current = 0, top = 0, range = 1, running = false, visible = false, last = 0;

  function measure() {
    var r = scene.getBoundingClientRect();
    top = r.top + window.scrollY;
    range = Math.max(1, scene.offsetHeight - window.innerHeight);
  }
  function readScroll() { target = clamp((window.scrollY - top) / range, 0, 1); }

  function loop(now) {
    if (!visible) { running = false; return; }
    var dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    readScroll();
    // weiche Glättung, bildratenunabhängig
    var k = 1 - Math.pow(1 - 0.085, dt / 16.7);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.00005) current = target;
    renderer.render(current, mqMobile.matches);
    requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduced.matches) return;
    running = true; last = 0;
    requestAnimationFrame(loop);
  }

  measure(); readScroll(); current = target;
  renderer.render(current, mqMobile.matches);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { measure(); start(); }
    }, { rootMargin: '200px 0px' }).observe(scene);
  } else { visible = true; start(); }

  window.addEventListener('resize', function () { measure(); readScroll(); }, { passive: true });
  window.addEventListener('load', measure);
})();
