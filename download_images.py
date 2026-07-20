import os
import sys
from urllib.request import urlopen, Request
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    print('Pillow not installed, installing...')
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image

images = [
    ('hero', 'https://images.unsplash.com/photo-1581091215367-1ca1e5cb0dcb?auto=format&fit=crop&w=1200&q=80'),
    ('about', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80'),
    ('contact', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'),
    ('blog-analytics', 'https://images.unsplash.com/photo-1515169177017-7b7fd40a05f0?auto=format&fit=crop&w=800&q=80'),
    ('blog-operators', 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80'),
    ('blog-controls', 'https://images.unsplash.com/photo-1504311522901-3d464aa976a3?auto=format&fit=crop&w=800&q=80'),
]

assets_dir = 'assets'
if not os.path.isdir(assets_dir):
    os.makedirs(assets_dir)

for name, url in images:
    print(f'Processing {name}...')
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(req) as response:
        raw = response.read()
    img = Image.open(BytesIO(raw)).convert('RGB')

    target_path = os.path.join(assets_dir, f'{name}.webp')
    quality = 80
    while True:
        buffer = BytesIO()
        img.save(buffer, format='WEBP', quality=quality, method=6)
        data = buffer.getvalue()
        size_kb = len(data) / 1024
        if size_kb <= 100 or quality <= 30:
            with open(target_path, 'wb') as out:
                out.write(data)
            print(f'  saved {target_path} ({size_kb:.1f} KB, quality={quality})')
            break
        quality -= 5
        if quality < 30:
            print(f'  quality dropped to {quality}, saving anyway at {size_kb:.1f} KB')
            with open(target_path, 'wb') as out:
                out.write(data)
            break

print('Done')
