// Агрегированная статистика. Доступ по ключу: /api/stats?key=...
// Ключ задаётся в Netlify → Environment variables → STATS_KEY (НЕ секретный флаг).
import { getStore } from '@netlify/blobs';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') || '';
  const pass = process.env.STATS_KEY;

  if (!pass) return json({ error: 'STATS_KEY is not set in Netlify environment variables' }, 500);
  if (key !== pass) return json({ error: 'unauthorized' }, 401);

  const store = getStore('analytics');
  const hits = [];
  let cursor;
  do {
    const page = await store.list({ prefix: 'h:', paginate: false, cursor });
    for (const blob of page.blobs) {
      const rec = await store.get(blob.key, { type: 'json' });
      if (rec) hits.push(rec);
      if (hits.length >= 20000) break;
    }
    cursor = page.cursor;
  } while (cursor && hits.length < 20000);

  const uniq = new Set();
  const byDay = {};
  const byCountry = {};
  const byPath = {};
  const byLang = { en: 0, he: 0, other: 0 };
  const visDays = {}; // visitor -> set of days

  for (const h of hits) {
    uniq.add(h.v);
    (byDay[h.d] ||= { views: 0, u: new Set() });
    byDay[h.d].views++; byDay[h.d].u.add(h.v);
    byCountry[h.c] = (byCountry[h.c] || 0) + 1;
    byPath[h.p] = (byPath[h.p] || 0) + 1;
    const lang = h.l?.startsWith('he') || h.p?.startsWith('/he') ? 'he'
               : h.l?.startsWith('en') ? 'en' : 'other';
    byLang[lang]++;
    (visDays[h.v] ||= new Set()).add(h.d);
  }

  const returning = Object.values(visDays).filter((s) => s.size > 1).length;

  const days = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, x]) => ({ date: d, views: x.views, uniques: x.u.size }));

  const top = (obj, n) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([k, v]) => ({ k, v }));

  return json({
    total_views: hits.length,
    unique_visitors: uniq.size,
    returning_visitors: returning,
    by_day: days.slice(-60),
    by_country: top(byCountry, 30),
    top_pages: top(byPath, 30),
    by_lang: byLang,
    since: days[0]?.date || null,
  });
};

export const config = { path: '/api/stats' };
