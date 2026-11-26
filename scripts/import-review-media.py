"""Import the reviewed slide folders; never modify source photographs."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

from PIL import Image, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=root.parent / 'Anh-kiem-duyet-CCVC')
args = parser.parse_args()
folders = {}
for folder in args.source.iterdir():
    match = re.match(r'^(\d{2}) - ', folder.name)
    if folder.is_dir() and match:
        number = int(match[1])
        if number in folders:
            raise ValueError(f'Duplicate slide folder: {number}')
        folders[number] = folder
if set(folders) != set(range(1, 36)):
    raise ValueError('Expected exactly 35 folders numbered 01 to 35')
out = root / 'assets/media'
out.mkdir(parents=True, exist_ok=True)
def natural(file):
    return [int(part) if part.isdigit() else part for part in re.split(r'(\d+)', file.name.casefold())]
manifest = []
for number, folder in sorted(folders.items()):
    items = []
    seen = set()
    for file in sorted(folder.iterdir(), key=natural):
        if not file.is_file() or file.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', '.heic'}:
            continue
        digest = hashlib.sha256(file.read_bytes()).hexdigest()[:20]
        if digest in seen:
            print(f'SKIP duplicate {number:02}: {file.name}', flush=True)
            continue
        seen.add(digest)
        target = out / (digest + '.webp')
        if not target.exists():
            with Image.open(file) as original:
                image = ImageOps.exif_transpose(original).convert('RGB')
                image.thumbnail((1920, 1920))
                if file.suffix.lower() == '.webp' and original.size == image.size:
                    shutil.copyfile(file, target)
                else:
                    image.save(target, 'WEBP', quality=86, method=4)
        with Image.open(target) as image:
            width, height = image.size
        items.append({'src': target.relative_to(root).as_posix(), 'source': folder.name + '/' + file.name,
                      'width': width, 'height': height})
    if number in {1, 35} and not items:
        raise ValueError(f'Slide {number} needs its background image')
    manifest.append({'number': number, 'folder': folder.name, 'images': items})
    print(f'{number:02}: {len(items)} images', flush=True)
(root / 'review-media.json').write_text(json.dumps({'slides': manifest}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Imported', sum(len(slide['images']) for slide in manifest), 'image assignments.', flush=True)
