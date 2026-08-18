// Первосторонний счётчик посещений. Пишет визиты в Netlify Blobs.
// IP не сохраняется: только соль+SHA-256 хеш (16 символов) для уникальности.
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

// Соль фиксированная, чтобы хеши посетителей были стабильны между деплоями.
// Сами хеши лежат только в приватном Blobs-хранилище.
const SALT = 'dva-2026-jerusalem';

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('', { status: 405 });

  let b = {};
  try { b = await req.json(); } catch {}

  const ua = req.headers.get('user-agent') || '';
  if (/bot|crawl|spider|preview|lighthouse|headless/i.test(ua)) {
    return new Response('', { status: 204 });
  }

  const ip = context.ip || '';
  const vis = createHash('sha256').update(ip + ua + SALT).digest('hex').slice(0, 16);
  const now = Date.now();

  const rec = {
    t: now,
    d: new Date(now).toISOString().slice(0, 10),
    v: vis,
    c: context.geo?.country?.code || '??',
    ct: context.geo?.city || '',
    p: String(b.p || '/').slice(0, 120),
    l: String(b.l || '').slice(0, 8),
    r: String(b.r || '').slice(0, 120),
  };

  const store = getStore('analytics');
  const key = `h:${now}:${Math.random().toString(36).slice(2, 6)}`;
  await store.setJSON(key, rec);

  return new Response('', { status: 204 });
};

export const config = { path: '/api/hit' };
