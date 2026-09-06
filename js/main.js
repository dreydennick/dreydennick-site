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
