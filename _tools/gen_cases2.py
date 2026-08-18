#!/usr/bin/env python3
# Generates cases/<slug>.html from the content base + per-case galleries
import re, os, html

BASE = open('/mnt/user-data/outputs/dreydennick_content_v2.md', encoding='utf-8').read()
OUT = '/home/claude/site-src/cases'
os.makedirs(OUT, exist_ok=True)
WIX = 'https://static.wixstatic.com/media/'
GA = '../assets/img/gallery/'

def wix(f):
    return f'{WIX}{f}'

CASES = [
 dict(slug='chiquititas', head='CHIQUITITAS / KTANTANOT', year='2026', venue='toMix · Expo Tel Aviv, Israel / Buenos Aires, Argentina', cat='Musical · LED scenography',
      local='../assets/img/chiquititas-poster.jpg', mode='poster',
      heroVideo='../assets/video/chq-reel.mp4', heroPoster='../assets/img/chq-reel-poster.jpg',
      extra='<figure class="case__figure case__figure--wide"><video src="../assets/video/chq-reel.mp4" poster="../assets/img/chq-reel-poster.jpg" controls loop muted playsinline preload="none"></video></figure>',
      gallery=[('../assets/img/gallery/chq-1.jpg', 'Show curtain — Chiquititas'), ('../assets/img/gallery/chq-2.jpg', 'Buenos Aires street — Living Interior'), ('../assets/img/gallery/chq-3.jpg', ''), ('../assets/img/gallery/chq-4.jpg', ''), ('../assets/img/gallery/chq-5.jpg', 'Hogar de Niños — night'), ('../assets/img/gallery/chq-6.jpg', 'Rincón de Luz — ruined'), ('../assets/img/gallery/chq-7.jpg', 'Rincón — faded roses (state morph)'), ('../assets/img/gallery/chq-8.jpg', 'Art Nouveau flora — detail'), ('../assets/img/gallery/chq-9.jpg', 'Vertical triptych — factory, staircase, precinct')]),
 dict(slug='noam-horev-live', head='NOAM HOREV — LIVE', year='2026', venue='Concert season · Israel', cat='Concert video design',
      local='../assets/img/horev-live.jpg',
      gallery=[('../assets/img/horev-poster.jpg', '2026 season poster')]),
 dict(slug='brothers-for-life-18', head='BROTHERS FOR LIFE — 18 YEARS', year='2026', venue='Live Park Rishon LeZion, Israel', cat='Show design · Documentary · VR',
      local='../assets/img/bfl-aerial-hero.jpg', gallery=[('../assets/img/gallery/bfl-3.jpg', 'Aerial — three screens over Live Park'), ('../assets/img/gallery/bfl-4.jpg', 'Aerial — golden plates of the timeline'), ('../assets/img/gallery/bfl-5.jpg', 'The circuit gate — night'), ('../assets/img/gallery/bfl-6.jpg', 'The gate at sunset'), ('../assets/img/gallery/bfl-7.jpg', 'VR gallery — 18 Years'), ('../assets/img/bfl18-tree.jpg', 'Key visual — the tree of brotherhood')],
      extra='<figure class="case__figure case__figure--video"><video controls preload="none" playsinline poster="../assets/img/bfl18-reel-poster.jpg" src="../assets/video/bfl18-reel.mp4"></video></figure>'),
 dict(slug='imagine-festigal', head='IMAGINE FESTIGAL', year='2025', venue='Solan Productions · Israel', cat='Stage video design',
      hero='db1c86_675e79f7617d462e830d3d0164a938fd~mv2.jpg', gallery=[]),
 dict(slug='frau-marlene-show', head='FRAU MARLENE SHOW', year='2025', venue='Tmuna Theatre, Tel Aviv, Israel', cat='Theatre video design',
      hero='db1c86_cb661796501d49cf9d5e0b95f19b4b8a~mv2.jpg',
      gallery=[('../assets/img/gallery/frau-3.jpg', 'Frau Marlene — promo series'), ('../assets/img/gallery/frau-5.jpg', ''), ('../assets/img/gallery/frau-6.jpg', '')]),
 dict(slug='the-seagull', head='THE SEAGULL', year='2025', venue='Beit Zvi, Ramat Gan, Israel', cat='Theatre video design',
      hero='db1c86_6677ec706b1748038ea47ba4e2f22d66~mv2.jpg', gallery=[('../assets/img/gallery/sea-3.jpg', 'Video previz — the seagulls'), ('../assets/img/gallery/sea-4.jpg', 'Video previz — the room')]),
 dict(slug='seret-kayitz', head='SERET KAYITZ', year='2025', venue='Orna Porat Theatre, Tel Aviv, Israel', cat='Theatre video design',
      hero='db1c86_0ee641fa497a4f13ab0f847bb0f36717~mv2.jpg',
      gallery=[('../assets/img/gallery/sk-3.jpg', ''), ('../assets/img/gallery/sk-4.jpg', ''), ('../assets/img/gallery/sk-5.jpg', ''), ('../assets/img/gallery/sk-6.jpg', ''), ('../assets/img/gallery/sk-7.jpg', ''), ('../assets/img/seret-still.jpg', '')]),
 dict(slug='beyond-the-light', head='BEYOND THE LIGHT', year='2025', venue='Gesher Theatre, Tel Aviv, Israel', cat='Theatre video design',
      hero='db1c86_e179d2a62a104942b6a05bc4de04cb0b~mv2.jpg',
      gallery=[('../assets/img/gallery/btl-3.jpg', 'Production poster — Ksenia Rappoport & Henry David'), ('../assets/img/gallery/btl-4.jpg', ''), ('../assets/img/gallery/btl-5.jpg', ''), ('../assets/img/gallery/btl-6.jpg', ''), ('../assets/img/gallery/btl-7.jpg', ''), ('../assets/img/gallery/btl-1.jpg', 'Video art — sculpture study'), ('../assets/img/gallery/btl-2.jpg', '')]),
 dict(slug='tzeirei-tel-aviv', head="TZE'IREI TEL AVIV — LO KOLEL SHIRUT", year='2025', venue='Heichal HaTarbut, Tel Aviv, Israel', cat='Concert video design',
      hero='db1c86_612fcf1b20f64bfd87561acb14bf5f5a~mv2.jpg',
      gallery=[('../assets/img/gallery/tz-3.jpg', 'The original cast — 1990s archive'), ('../assets/img/gallery/wed-12.jpg', 'Archive — the original cast, b/w'), ('../assets/img/gallery/tz-4.jpg', ''), ('../assets/img/gallery/tz-5.jpg', ''), ('../assets/img/tzeirei-stage.jpg', '')]),
 dict(slug='run', head='R.U.N.', year='2024', venue='Alef Theatre, Haifa, Israel', cat='Physical theatre · Direction',
      local='../assets/img/run-poster.jpg', mode='poster',
      gallery=[('../assets/img/gallery/run-1.jpg', ''), ('../assets/img/gallery/run-2.jpg', ''), ('../assets/img/gallery/run-3.jpg', ''), ('../assets/img/gallery/run-4.jpg', ''), ('../assets/img/gallery/run-5.jpg', ''), ('../assets/img/gallery/run-6.jpg', 'R.U.N. — flight'), ('../assets/img/gallery/run-7.jpg', ''), ('../assets/img/gallery/run-8.jpg', ''), ('../assets/img/gallery/run-9.jpg', 'Madonna of the road')]),
 dict(slug='julie', head='JULIE', year='2024', venue='Habima National Theatre, Tel Aviv, Israel', cat='Theatre video design',
      local='../assets/img/julie-hero.jpg',
      gallery=[('../assets/img/gallery/jul-3.jpg', ''), ('../assets/img/gallery/jul-4.jpg', ''), ('../assets/img/gallery/jul-5.jpg', 'Video art — water'), ('../assets/img/gallery/jul-6.jpg', ''), ('../assets/img/gallery/jul-7.jpg', ''), ('../assets/img/gallery/jul-8.jpg', 'Julie & Jean')]),
 dict(slug='there-will-be-no-wedding', head='THERE WILL BE NO WEDDING', year='2024', venue='Gesher Theatre & Fulcro, Tel Aviv, Israel', cat='Video art · AI frescoes',
      local='../assets/img/wedding-poster.jpg', mode='poster',
      gallery=[('../assets/img/gallery/wed-3.jpg', ''), ('../assets/img/gallery/wed-4.jpg', 'Fresco dissolve'), ('../assets/img/gallery/wed-5.jpg', ''), ('../assets/img/gallery/wed-7.jpg', ''), ('../assets/img/gallery/wed-8.jpg', ''), ('../assets/img/gallery/wed-9.jpg', 'Handwritten projection'), ('../assets/img/gallery/wed-10.jpg', ''), ('../assets/img/gallery/wed-11.jpg', ''), ('../assets/img/gallery/wed-2.jpg', 'Production visual — Fulcro')]),
 dict(slug='jerusalem-princess', head='THE JERUSALEM PRINCESS', year='2023', venue='ANU Museum, Tel Aviv, Israel', cat='Multimedia performance · Co-direction',
      local='../assets/img/princess-poster.jpg', mode='poster', gallery=[('../assets/img/gallery/jp-3.jpg', ''), ('../assets/img/gallery/jp-4.jpg', 'Projection mapping'), ('../assets/img/gallery/jp-5.jpg', ''), ('../assets/img/gallery/jp-6.jpg', ''), ('../assets/img/gallery/jp-7.jpg', ''), ('../assets/img/gallery/jp-8.jpg', 'Paper-cut creature — lion'), ('../assets/img/gallery/jp-9.jpg', 'Paper-cut creature — fox')]),
 dict(slug='third-cabaret', head='THIRD CABARET: THE BURNING BUSH', year='2023', venue='Gesher / Fulcro, Tel Aviv, Israel', cat='Projection design',
      local='../assets/img/cabaret-hero.jpg',
      gallery=[('../assets/img/gallery/cab-2.jpg', 'Testimonies on skin — projection'), ('../assets/img/gallery/cab-3.jpg', 'Six languages — profile'), ('../assets/img/gallery/cabx-3.jpg', ''), ('../assets/img/gallery/cabx-5.jpg', ''), ('../assets/img/gallery/cabx-6.jpg', ''), ('../assets/img/gallery/cabx-7.jpg', ''), ('../assets/img/gallery/cabx-8.jpg', '')]),
 dict(slug='free-fall', head='FREE FALL', year='2022', venue='Malenky Theatre, Tel Aviv, Israel', cat='Staged reading → performance', local='../assets/img/freefall-hero.jpg', gallery=[('../assets/img/gallery/ff-3.jpg', ''), ('../assets/img/gallery/ff-4.jpg', ''), ('../assets/img/gallery/ff-5.jpg', ''), ('../assets/img/gallery/ff-6.jpg', '')]),
 dict(slug='dead-time', head='DEAD TIME / TEMPUS MORTUUS', year='2022', venue='Jaffa Fest / Gesher Theatre, Tel Aviv, Israel', cat='Conceptual performance · Direction',
      local='../assets/img/deadtime-hero.jpg',
      gallery=[('../assets/img/gallery/dead-3.jpg', ''), ('../assets/img/gallery/dead-4.jpg', ''), ('../assets/img/gallery/dead-5.jpg', '')]),
]

sections = re.split(r'\n### ', BASE)
def find_body(head_key):
    for s in sections[1:]:
        title_line = s.split('\n', 1)[0]
        if head_key.split(' (')[0].upper()[:18] in title_line.upper():
            return s.split('\n', 1)[1]
    return ''

DROP = ('Hero:', '`', '_Статус', '_(', '**Материалы', 'Материалы (')

def clean_inline(t):
    t = re.sub(r'\[[^\]]*\]', '', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    return t.strip()

def body_html(md):
    out, in_ul = [], False
    for raw in md.split('\n'):
        line = raw.strip()
        if not line or line.startswith('## ') or line == '---':
            continue
        if any(line.startswith(d) for d in DROP):
            continue
        if any(0x0400 <= ord(ch) <= 0x04FF for ch in line):
            continue
        if line.startswith('**Official') or line.startswith('**Ссылки'):
            continue
        if line.startswith('- '):
            if not in_ul: out.append('<ul>'); in_ul = True
            item = clean_inline(line[2:])
            if item: out.append(f'<li>{item}</li>')
            continue
        if in_ul: out.append('</ul>'); in_ul = False
        if line.startswith('> '):
            out.append(f'<blockquote><p>{clean_inline(line[2:])}</p></blockquote>'); continue
        m = re.match(r'\*\*([^*]+?)\.?\*\*\s*(.*)', line)
        if m:
            label, rest = m.group(1).rstrip('.'), clean_inline(m.group(2))
            out.append(f'<h2 class="case__label mono">{html.escape(label)}</h2>')
            if rest: out.append(f'<p>{rest}</p>')
            continue
        txt = clean_inline(line)
        if txt: out.append(f'<p>{txt}</p>')
    if in_ul: out.append('</ul>')
    return '\n'.join(out)

def gallery_html(items):
    if not items: return ''
    figs = ''
    for src, cap in items:
        alt = html.escape(cap) if cap.strip() else ''
        figs += f'<figure><img src="{src}" alt="{alt}" loading="lazy"></figure>'
    return f'<h2 class="case__label mono">Gallery</h2>\n<div class="case__gallery">{figs}</div>'

TPL = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Nick Dreyden</title>
<meta name="description" content="{title} · {venue} · {year}. Case by Nick Dreyden — Visual Artist, Multimedia Director.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62.5..125,100..900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="../assets/img/favicon.png">
<link rel="stylesheet" href="../css/style.css?v=3">
<script defer src="/js/count.js"></script>
</head>
<body class="case-page">
<div class="cursor" aria-hidden="true"><div class="cursor__lens"></div></div>
<div class="cursor-dot" aria-hidden="true"></div>
<header class="top">
  <div class="top__left">
    <a class="top__logo" href="../index.html" data-magnet><img src="../assets/img/atelier-logo.png" alt="Dreyden Visual Atelier"></a>
    <span class="top__hist mono">
      <button type="button" onclick="history.back()" aria-label="Back" data-magnet>←</button>
      <button type="button" onclick="history.forward()" aria-label="Forward" data-magnet>→</button>
    </span>
  </div>
  <nav class="top__nav mono">
    <a href="../index.html#works" data-magnet>Works</a>
    <a href="../index.html#about" data-magnet>About</a>
    <a href="../filmmaking.html" data-magnet>Filmmaking</a>
    <a href="../index.html#contact" data-magnet>Contact</a>
    <a class="top__lang" href="../he/cases/{slug}.html" data-magnet>עברית</a>
  </nav>
</header>
<main>
  <section class="case__hero">
    {heroblock}
    <p class="case__meta mono">{year} · {venue} · {cat}</p>
    <h1 class="case__title">{title}</h1>
  </section>
  <article class="case__body">
{body}
  </article>
  <nav class="case__nav mono">
    <a href="{prev}" data-magnet>← Prev</a>
    <a href="../index.html#works" data-magnet>Index</a>
    <a href="{next}" data-magnet>Next →</a>
  </nav>
  <footer class="contact case__foot">
    <a class="contact__mail" href="mailto:dreyden.nick@gmail.com" data-magnet>dreyden.nick@gmail.com</a>
    <img class="atelier-mark" src="../assets/img/atelier-logo.png" alt="Dreyden Visual Atelier" loading="lazy">
    <p class="contact__copy mono">© 2026 Nick Dreyden · Dreyden Visual Atelier</p>
  </footer>
</main>
<div class="lightbox" id="lightbox" aria-hidden="true">
  <div class="lightbox__frame">
    <img alt="">
    <button class="lightbox__close mono" aria-label="Close">×</button>
  </div>
  <p class="lightbox__cap mono"></p>
</div>
<script src="../js/main.js"></script>
</body>
</html>'''

n = len(CASES)
for i, c in enumerate(CASES):
    body = body_html(find_body(c['head']))
    body += '\n' + gallery_html(c.get('gallery', []))
    if c.get('extra'):
        body += '\n' + c['extra']
    mode = ' case__img--' + c['mode'] if c.get('mode') else ''
    if c.get('heroVideo'):
        hero = (f'<div class="case__img case__img--video">'
                f'<video src="{c["heroVideo"]}" poster="{c["heroPoster"]}" autoplay loop muted playsinline preload="metadata"></video></div>')
    elif c.get('local'):
        hero = f'<div class="case__img{mode}"><img src="{c["local"]}" alt="{html.escape(c["head"])}"></div>'
    elif c.get('hero'):
        hero = f'<div class="case__img{mode}"><img src="{wix(c["hero"])}" alt="{html.escape(c["head"])}"></div>'
    else:
        hero = '<div class="case__img case__img--empty mono"><span>Visual materials — coming soon</span></div>'
    page = TPL.format(slug=c['slug'], title=html.escape(c['head']), venue=c['venue'], year=c['year'], cat=c['cat'],
                      heroblock=hero, body=body,
                      prev=CASES[i-1]['slug']+'.html', next=CASES[(i+1) % n]['slug']+'.html')
    open(os.path.join(OUT, c['slug']+'.html'), 'w', encoding='utf-8').write(page)
    print(c['slug'], 'gallery:', len(c.get('gallery', [])))
