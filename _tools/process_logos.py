#!/usr/bin/env python3
from PIL import Image, ImageOps, ImageFilter
import os

U = '/mnt/user-data/uploads'
A = '/home/claude/site-src/assets'
os.makedirs(A + '/logos', exist_ok=True)
PAPER = (235, 232, 226)
H = 160  # normalized logo height @2x

def load(p):
    im = Image.open(p)
    return im.convert('RGBA')

def alpha_from_luma(im, lo, hi, invert=False):
    g = ImageOps.grayscale(im)
    if invert:
        g = ImageOps.invert(g)
    lut = []
    for v in range(256):
        if v <= lo: lut.append(0)
        elif v >= hi: lut.append(255)
        else: lut.append(int(255 * (v - lo) / (hi - lo)))
    return g.point(lut)

def alpha_from_sat(im, lo=60, hi=160):
    s = im.convert('HSV').split()[1]
    return alpha_from_luma(Image.merge('RGBA', [s]*4), lo, hi)

def finalize(alpha, name, pad_ratio=0.06):
    bbox = alpha.point(lambda v: 255 if v > 18 else 0).getbbox()
    if bbox: alpha = alpha.crop(bbox)
    w, h = alpha.size
    pad = int(max(w, h) * pad_ratio)
    canvas = Image.new('L', (w + 2*pad, h + 2*pad), 0)
    canvas.paste(alpha, (pad, pad))
    out = Image.new('RGBA', canvas.size, PAPER + (0,))
    out.putalpha(canvas)
    nh = H
    nw = max(1, int(out.width * nh / out.height))
    out = out.resize((nw, nh), Image.LANCZOS)
    out.save(f'{A}/logos/{name}.png')
    return out

def white_on_dark(path, name, lo=90, hi=200, blur=0):
    im = load(path)
    a = alpha_from_luma(im, lo, hi)
    if blur: a = a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: 255 if v > 90 else (0 if v < 40 else v))
    return finalize(a, name)

def dark_on_light(path, name, lo=60, hi=190):
    im = load(path)
    a = alpha_from_luma(im, lo, hi, invert=True)
    return finalize(a, name)

def from_alpha(path, name):
    im = load(path)
    return finalize(im.split()[3], name)

def from_sat(path, name, lo=60, hi=150):
    return finalize(alpha_from_sat(load(path), lo, hi), name)

# ---- process the batch ----
white_on_dark(f'{U}/main_pic.webp', 'anu', lo=120, hi=220)
white_on_dark(f'{U}/OrnaPoratNew_svg.webp', 'ornaporat', lo=70, hi=180)      # keeps coral dots as mid-alpha
white_on_dark(f'{U}/608718534_1212550921016278_8803776643726507626_n.jpg', 'bfl', lo=110, hi=210)
white_on_dark(f'{U}/Beit_Zvi_Art_School_Stage_And_Cinema__1985__פרופ__אמיר_הר-גיל__.png', 'beitzvi', lo=100, hi=200, blur=1)
dark_on_light(f'{U}/logo.png', 'tmuna', lo=40, hi=180)
dark_on_light(f'{U}/G-u6XiwbQAAC6yf.jpg', 'telefe', lo=25, hi=150)
from_alpha(f'{U}/DORI_MEDIA_LOGO_WHITE.png', 'dorimedia')
from_sat(f'{U}/488659253_1127903456014952_1512828503376008220_n.jpg', 'fulcro', lo=70, hi=160)

# Festigal: use alpha if present, else dark-on-light
fest = load(f'{U}/לוגו-פסטיגל-768x451.png')
if fest.split()[3].getextrema()[0] < 250:
    finalize(fest.split()[3], 'festigal')
else:
    dark_on_light(f'{U}/לוגו-פסטיגל-768x451.png', 'festigal', lo=40, hi=200)

# toMix white SVG -> raster -> alpha
import cairosvg
cairosvg.svg2png(url=f'{U}/toMix_LOGO_White.svg', write_to='/tmp/tomix.png', output_height=400)
from_alpha('/tmp/tomix.png', 'tomix')

# ---- portrait: center 4:5 crop, 1200x1500 ----
p = Image.open(f'{U}/C_00010_1__1_.png').convert('RGB')
w, h = p.size
cw = int(h * 0.8)
x0 = max(0, (w - cw)//2)
p.crop((x0, 0, x0+cw, h)).resize((1200, 1500), Image.LANCZOS).save(f'{A}/img/portrait.jpg', quality=88)

# ---- contact sheet for visual QA ----
order = ['festigal','tomix','telefe','dorimedia','bfl','anu','ornaporat','tmuna','beitzvi','fulcro']
logos = [Image.open(f'{A}/logos/{n}.png') for n in order]
cols, rh, padx, pady = 5, 200, 60, 50
rows = (len(logos)+cols-1)//cols
cw_ = max(l.width for l in logos) + padx
sheet = Image.new('RGB', (cols*cw_, rows*(rh+pady)), (12,12,13))
for i, l in enumerate(logos):
    x = (i % cols)*cw_ + (cw_-l.width)//2
    y = (i // cols)*(rh+pady) + (rh-l.height)//2
    sheet.paste(l, (x, y), l)
sheet.save('/home/claude/logo_sheet.jpg', quality=90)
print('done:', sorted(os.listdir(A+'/logos')))


# ---- дополнение: BP и Carlsberg (сессия 14.08.2026) ----
# BP: исходник BP-Logo-500x312.png (прозрачный PNG, гелиос в цвете).
#   Силуэт целиком даёт слепое пятно, поэтому альфа собирается по цветовым зонам:
#   тёмно-зелёные и жёлтые лепестки -> 255, светло-зелёные и белая сердцевина -> 0.
#   Так в монохроме сохраняется концентрическая розетка.
# Carlsberg: исходник — белая надпись на зелёном квадрате с белой рамкой.
#   1) снять рамку по маске «зелёный» (G > R+20);
#   2) обрезать по bbox чисто белых пикселей (>225) — это вордмарк + свуш,
#      подпись COPENHAGEN / DENMARK / 1847 остаётся за кадром;
#   3) luma-порог lo=190 hi=238 — светло-зелёный текст полностью отсекается,
#      иначе под свушем остаётся серый призрак.
