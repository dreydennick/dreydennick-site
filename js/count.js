// Dreyden Visual Atelier — first-party visit beacon (no cookies, no IP stored)
(function () {
  var h = location.hostname;
  if (h !== 'dreydennick.com' && h !== 'www.dreydennick.com') return;
  if (/bot|crawl|spider|headless/i.test(navigator.userAgent)) return;
  var payload = JSON.stringify({
    p: location.pathname,
    l: document.documentElement.lang || '',
    r: document.referrer || ''
  });
  try {
    if (navigator.sendBeacon &&
        navigator.sendBeacon('/api/hit', new Blob([payload], { type: 'application/json' }))) return;
  } catch (e) {}
  try {
    fetch('/api/hit', { method: 'POST', body: payload, keepalive: true });
  } catch (e) {}
})();
