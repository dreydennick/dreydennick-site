import requests, os, sys, io
from PIL import Image, ImageOps
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except Exception: pass
KEY = sys.argv[1]; OUT = sys.argv[2]
API = 'https://cloud-api.yandex.net/v1/disk/public/resources'
def ls(path):
    items, off = [], 0
    while True:
        p = {'public_key': KEY, 'limit': 200, 'offset': off, 'sort': 'name'}
        if path: p['path'] = path
        r = requests.get(API, params=p, timeout=60).json()
        emb = r.get('_embedded') or {}
        got = emb.get('items', [])
        items += got; off += len(got)
        if not got or off >= emb.get('total', 0): break
    out = []
    for it in items:
        if it['type'] == 'dir': out += ls(it['path'])
        else: out.append(it)
    return out
files = [f for f in ls('') if (f.get('media_type') == 'image') or f['name'].lower().endswith(('.jpg','.jpeg','.png','.heic','.tif','.tiff','.webp'))]
os.makedirs(f'{OUT}/full', exist_ok=True); os.makedirs(f'{OUT}/thumbs', exist_ok=True)
idx = open(f'{OUT}/index.txt', 'w')
for i, f in enumerate(files, 1):
    try:
        b = requests.get(f['file'], timeout=180).content
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(b))).convert('RGB')
        name = f'{i:03d}'
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(f'{OUT}/full/{name}.jpg', quality=86, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((300, 300), Image.LANCZOS)
        th.save(f'{OUT}/thumbs/{name}.jpg', quality=78)
        idx.write(f"{name}\t{f['path']}\t{im.size[0]}x{im.size[1]}\n")
    except Exception as e:
        idx.write(f"ERR\t{f['path']}\t{e}\n")
idx.close()
print(len(files), 'images')
