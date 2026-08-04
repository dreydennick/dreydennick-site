/* DREYDEN — cursor-lens, magnetic links, reveals */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var noMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

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
