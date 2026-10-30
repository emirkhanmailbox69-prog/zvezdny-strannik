"""Генерирует PNG-иконки для PWA (нужны Chrome для установки на Android)."""
from PIL import Image, ImageDraw

def make_icon(size, path):
    img = Image.new('RGBA', (size, size), (10, 10, 18, 255))
    draw = ImageDraw.Draw(img)
    margin = size // 6
    # teal кольцо
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=(78, 205, 196, 255),
        width=max(2, size // 32)
    )
    # teal центр
    cx = cy = size // 2
    r = size // 7
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(78, 205, 196, 255))
    img.save(path, 'PNG')
    print(f'✅ {path} ({size}x{size})')

make_icon(192, 'public/icon-192.png')
make_icon(512, 'public/icon-512.png')