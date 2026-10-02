/* DREYDEN — cursor-lens, magnetic links, reveals */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var noMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- language memory ---------- */
  try {
    var isHe = (document.documentElement.lang || '').toLowerCase() === 'he';
    document.querySelectorAll('.top__lang').forEach(function (a) {
      a.addEventListener('click', function () {
        try { localStorage.setItem('lang', isHe ? 'en' : 'he'); } catch (e) {}
      });
    });
    var pref = null;
    try { pref = localStorage.getItem('lang'); } catch (e) {}
    if (!pref && ((navigator.language || '').toLowerCase().indexOf('he') === 0)) pref = 'he';
    var cur = isHe ? 'he' : 'en';
    if (pref && pref !== cur) {
      var p = location.pathname;
      var target = null;
      if (pref === 'he' && p.indexOf('/he/') !== 0) {
        target = '/he' + (p === '/' || p === '' ? '/index.html' : p);
      } else if (pref === 'en' && p.indexOf('/he/') === 0) {
        target = p.replace(/^\/he/, '') || '/';
      }
      if (target) { location.replace(target); return; }
    }
  } catch (e) {}

  /* ---------- scroll reveal ---------- */
  var revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !noMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- lightbox (all devices) ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    document.querySelectorAll('.case__gallery img, .case__figure img, .case__img img').forEach(function (im) {
      im.addEventListener('click', function () {
        lbImg.src = im.currentSrc || im.src;
        if (lbCap) lbCap.textContent = '';
        lb.classList.add('is-open');
      });
      im.style.cursor = 'zoom-in';
    });
    lb.addEventListener('click', function () {
      lb.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lb.classList.remove('is-open');
    });
  }

  if (!fine || noMotion) return; /* touch / reduced motion: native cursor stays */
  try {
    document.documentElement.classList.add('has-cursor'); /* hide native only when custom is live */
  } catch (e) { return; }

  /* ---------- cursor with inertia ---------- */
  var ring = document.querySelector('.cursor');
  var lens = document.querySelector('.cursor__lens');
  var dot  = document.querySelector('.cursor-dot');
  var mx = innerWidth / 2, my = innerHeight / 2;
  var rx = mx, ry = my;

  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });


  /* ---------- golden trail (mesmeric ribbon) ---------- */
  var tc = document.createElement('canvas');
  tc.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:95';
  document.body.appendChild(tc);
  var tctx = tc.getContext('2d');
  function sizeTrail(){ tc.width = innerWidth * devicePixelRatio; tc.height = innerHeight * devicePixelRatio; tctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
  sizeTrail(); addEventListener('resize', sizeTrail);
  var pts = [];
  for (var i = 0; i < 26; i++) pts.push({x: mx, y: my});

  function drawTrail(){
    pts[0].x += (mx - pts[0].x) * 0.42;
    pts[0].y += (my - pts[0].y) * 0.42;
    for (var i = 1; i < pts.length; i++){
      pts[i].x += (pts[i-1].x - pts[i].x) * 0.42;
      pts[i].y += (pts[i-1].y - pts[i].y) * 0.42;
    }
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    tctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < pts.length - 1; i++){
      var t = 1 - i / (pts.length - 1);
      var mxp = (pts[i].x + pts[i+1].x) / 2, myp = (pts[i].y + pts[i+1].y) / 2;
      tctx.beginPath();
      tctx.moveTo(pts[i].x, pts[i].y);
      tctx.quadraticCurveTo(pts[i].x, pts[i].y, mxp, myp);
      tctx.strokeStyle = 'rgba(185,152,86,' + (0.34 * t * t) + ')';
      tctx.lineWidth = 7 * t + 0.4;
      tctx.lineCap = 'round';
      tctx.stroke();
      tctx.strokeStyle = 'rgba(235,232,226,' + (0.16 * t * t * t) + ')';
      tctx.lineWidth = 2.2 * t + 0.2;
      tctx.stroke();
    }
  }

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform  = 'translate(' + (mx - 3.5) + 'px,' + (my - 3.5) + 'px)';
    ring.style.transform = 'translate(' + (rx - ring.offsetWidth / 2) + 'px,' + (ry - ring.offsetHeight / 2) + 'px)';
    requestAnimationFrame(loop);
    window.addEventListener('error', function () {
    document.documentElement.classList.remove('has-cursor'); /* any JS failure: bring native cursor back */
  });
})();

  /* ---------- lens over work rows ---------- */
  var loadedPreviews = {};
  document.querySelectorAll('.row[data-preview]').forEach(function (row) {
    var src = row.getAttribute('data-preview');
    row.addEventListener('mouseenter', function () {
      if (!loadedPreviews[src]) { var i = new Image(); i.src = src; loadedPreviews[src] = true; }
      lens.style.backgroundImage = 'url("' + src + '")';
      ring.classList.add('is-lens');
    });
    row.addEventListener('mouseleave', function () {
      ring.classList.remove('is-lens');
    });
  });

  /* ---------- magnetic links + tight cursor ---------- */
  document.querySelectorAll('[data-magnet]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('is-tight'); });
    el.addEventListener('mouseleave', function () {
      ring.classList.remove('is-tight');
      el.style.transform = '';
    });
    el.addEventListener('mousemove', function (e) {
      var b = el.getBoundingClientRect();
      var dx = e.clientX - (b.left + b.width / 2);
      var dy = e.clientY - (b.top + b.height / 2);
      el.style.transform = 'translate(' + dx * 0.18 + 'px,' + dy * 0.18 + 'px)';
    });
    el.style.display = 'inline-block';
    el.style.transition = 'transform .3s cubic-bezier(.22,.61,.2,1)';
  });

  window.addEventListener('error', function () {
    document.documentElement.classList.remove('has-cursor'); /* any JS failure: bring native cursor back */
  });
})();


/* -------- hero video: recover autoplay when iOS blocks it (Low Power / Low Data mode) -------- */
(function(){
  var v = document.querySelector('.hero__video');
  if (!v) return;
  var noMotionPref = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (noMotionPref) {
    v.removeAttribute('autoplay');
    var freeze = function(){ v.pause(); };
    if (v.readyState >= 2) freeze(); else v.addEventListener('loadeddata', freeze, {once:true});
    if (!v.paused) freeze();
    return;
  }
  var tryPlay = function(){
    if (!v.paused) return cleanup();
    if (v.readyState === 0 && v.load) v.load();
    var p = v.play();
    if (p && p.then) p.then(cleanup).catch(function(){});
  };
  var cleanup = function(){
    window.removeEventListener('touchstart', tryPlay);
    window.removeEventListener('scroll', tryPlay);
    document.removeEventListener('visibilitychange', tryPlay);
  };
  tryPlay();
  window.addEventListener('touchstart', tryPlay, {passive:true});
  window.addEventListener('scroll', tryPlay, {passive:true});
  document.addEventListener('visibilitychange', tryPlay);
})();


/* -------- ?vdebug: on-screen hero video diagnostics -------- */
(function(){
  if (location.search.indexOf('vdebug') === -1) return;
  var v = document.querySelector('.hero__video');
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:rgba(0,0,0,.85);color:#7CFC00;font:11px/1.5 monospace;padding:10px 12px;white-space:pre;pointer-events:none;border:1px solid #444';
  var upd = function(){
    if (!v) { d.textContent = 'no .hero__video in DOM'; return; }
    var cs = getComputedStyle(v);
    d.textContent =
      'reduced-motion: ' + matchMedia('(prefers-reduced-motion: reduce)').matches +
      '\npaused: ' + v.paused + '   readyState: ' + v.readyState +
      '\nerror: ' + (v.error ? v.error.code + ' ' + (v.error.message||'') : 'none') +
      '\nvideoSize: ' + v.videoWidth + 'x' + v.videoHeight +
      '\nsrc: ' + (v.currentSrc || '(empty)').split('/').pop() +
      '\ndisplay: ' + cs.display + '  visibility: ' + cs.visibility +
      '\nopacity: ' + cs.opacity + '  z-index: ' + cs.zIndex;
  };
  (document.body || document.documentElement).appendChild(d);
  upd(); setInterval(upd, 1000);
})();

/* ======== DEPTH: every text, photo and logo floats above the page and casts a shadow ======== */
(function(){
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && still) return;                      /* desktop + reduce-motion: no light at all */

  /* ---- collect targets ---- */
  var SKIP = '.cursor, .cursor-dot, .spotlight, .ambient, .lightbox, script, style, noscript, svg, video, .hero__title, .case__title';
  var items = [], seen = new Set();
  function add(n, kind, dep){
    if (seen.has(n)) return; seen.add(n);
    n.classList.add('dz-' + kind);
    items.push({n:n, kind:kind, dep:dep, cx:0, cy:0, fixed:false, k:''});
  }
  document.querySelectorAll('.hero__title, .case__title').forEach(function(n){ add(n,'t',1.7); });
  document.querySelectorAll('.case__gallery img, .about__photo, .vision__art, .case__img, .row__thumb').forEach(function(n){ add(n,'i',1.4); });
  document.querySelectorAll('.hero__logos img, .atelier-mark, .top__logo img').forEach(function(n){ add(n,'l',0.8); });
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(t){ return /\S/.test(t.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
  });
  var t;
  while ((t = walker.nextNode())){
    var el = t.parentElement;
    if (!el || el.closest(SKIP)) continue;
    add(el, 't', 1);
  }

  /* fixed-position context (header, side mark): coordinates don't scroll */
  var fixedCache = new Map();
  function inFixed(n){
    var chain = [];
    for (var a = n; a && a !== document.body; a = a.parentElement){
      if (fixedCache.has(a)){ var v = fixedCache.get(a); chain.forEach(function(c){ fixedCache.set(c, v); }); return v; }
      chain.push(a);
      if (getComputedStyle(a).position === 'fixed'){ chain.forEach(function(c){ fixedCache.set(c, true); }); return true; }
    }
    chain.forEach(function(c){ fixedCache.set(c, false); });
    return false;
  }
  items.forEach(function(it){ it.fixed = inFixed(it.n); });

  /* ---- shadow composer: near shadow + wide soft halo ---- */
  function q(v, s){ return Math.round(v / s) * s; }
  function compose(kind, sx, sy, sb, ss, sa){
    if (sa <= 0.01) return 'none';
    var x1 = q(sx,.5), y1 = q(sy,.5), b1 = q(sb,1), s1 = q(ss,1), a1 = q(sa,.02).toFixed(2);
    var x2 = q(sx*1.9,.5), y2 = q(sy*1.9,.5), b2 = q(sb*2.2,1), a2 = q(sa*.45,.02).toFixed(2);
    if (kind === 't') return x1+'px '+y1+'px '+b1+'px rgba(0,0,0,'+a1+'), '+x2+'px '+y2+'px '+b2+'px rgba(0,0,0,'+a2+')';
    if (kind === 'i') return x1+'px '+y1+'px '+b1+'px '+s1+'px rgba(0,0,0,'+a1+'), '+x2+'px '+y2+'px '+b2+'px '+q(ss*1.5,1)+'px rgba(0,0,0,'+a2+')';
    return 'drop-shadow('+x1+'px '+y1+'px '+b1+'px rgba(0,0,0,'+a1+')) drop-shadow('+x2+'px '+y2+'px '+b2+'px rgba(0,0,0,'+a2+'))';
  }
  function put(it, v){ if (v !== it.k){ it.k = v; it.n.style.setProperty('--sh', v); } }

  setTimeout(function(){ document.documentElement.classList.add('lines-open'); }, still ? 0 : 2600);

  /* ================= DESKTOP: light follows the mouse ================= */
  if (fine){
    var spot = document.createElement('div');
    spot.className = 'spotlight';
    document.body.appendChild(spot);

    function measure(){
      var sx = scrollX, sy = scrollY;
      items.forEach(function(it){
        var r = it.n.getBoundingClientRect();
        it.cx = r.left + r.width/2 + (it.fixed ? 0 : sx);
        it.cy = r.top + r.height/2 + (it.fixed ? 0 : sy);
      });
    }
    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure);
    setTimeout(measure, 3000);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);

    var R = 380, REACH = 560;
    var tx = innerWidth/2, ty = innerHeight/2, x = tx, y = ty, I = 0, IT = 0, raf = null;

    function shade(){
      var sx = scrollX, sy = scrollY;
      for (var k = 0; k < items.length; k++){
        var it = items[k];
        var dx = it.cx - (it.fixed ? 0 : sx) - x, dy = it.cy - (it.fixed ? 0 : sy) - y;
        var d = Math.sqrt(dx*dx + dy*dy) || 1;
        var p = (1 - d / REACH) * I;               /* proximity to the light */
        if (p <= 0.01){ if (it.k !== 'none') put(it, 'none'); continue; }
        var reach = Math.min(d / R, 1);
        var off  = it.dep * (9 + 24 * reach);      /* floats well above the page */
        var blur = it.dep * (6 + 26 * p);          /* light overhead → wider, softer shadow */
        var sprd = it.dep * 14 * p;                /* …and bigger */
        put(it, compose(it.kind, dx/d*off, dy/d*off, blur, sprd, 0.95 * Math.pow(p, 0.6)));
      }
    }
    function loop(){
      x += (tx - x) * 0.22; y += (ty - y) * 0.22; I += (IT - I) * 0.12;
      spot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      shade();
      if (Math.abs(tx-x) > .3 || Math.abs(ty-y) > .3 || Math.abs(IT-I) > .01) raf = requestAnimationFrame(loop);
      else { I = IT; shade(); raf = null; }
    }
    function kick(){ if (!raf) raf = requestAnimationFrame(loop); }
    addEventListener('mousemove', function(e){ tx = e.clientX; ty = e.clientY; IT = 1; spot.classList.add('is-on'); kick(); }, {passive:true});
    addEventListener('scroll', kick, {passive:true});
    document.documentElement.addEventListener('mouseleave', function(){ spot.classList.remove('is-on'); IT = 0; kick(); });
    return;
  }

  /* ================= TOUCH: stage light hangs above the screen ================= */
  var amb = document.createElement('div');
  amb.className = 'ambient';
  document.body.appendChild(amb);

  if (still){
    items.forEach(function(it){ put(it, compose(it.kind, 0, it.dep*9, it.dep*10, it.dep*4, 0.75)); });
    return;
  }

  var visible = new Set();
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ var it = e.target.__dz; if (e.isIntersecting) visible.add(it); else visible.delete(it); });
    kickM();
  }, {rootMargin:'25% 0px'});
  items.forEach(function(it){ it.n.__dz = it; io.observe(it.n); });

  var rafM = null;
  function frameM(){
    rafM = null;
    var W = innerWidth, H = innerHeight, lx = W/2, ly = -0.35 * H;
    var reads = [];
    visible.forEach(function(it){ reads.push([it, it.n.getBoundingClientRect()]); });
    for (var k = 0; k < reads.length; k++){
      var it = reads[k][0], r = reads[k][1];
      var dx = r.left + r.width/2 - lx, dy = r.top + r.height/2 - ly;
      var d = Math.sqrt(dx*dx + dy*dy) || 1;
      var reach = Math.min(d / (H * 1.25), 1);
      var p = 1 - Math.min(d / (H * 1.5), 1);
      var off = it.dep * (5 + 13 * reach);
      put(it, compose(it.kind, dx/d*off, dy/d*off, it.dep*(5 + 16*p), it.dep*9*p, 0.85*(0.55 + 0.45*p)));
    }
  }
  function kickM(){ if (!rafM) rafM = requestAnimationFrame(frameM); }
  addEventListener('scroll', kickM, {passive:true});
  addEventListener('resize', kickM);
  addEventListener('load', kickM);
  kickM();
})();
