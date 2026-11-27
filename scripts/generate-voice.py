"""Render editable per-slide narration using the existing local Ngoc Huyen model."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

root = Path(__file__).resolve().parents[1]
os.environ['HF_HOME'] = str(Path(r'C:\Users\rongl\Documents\Codex\2026-10-05\kie\work\vieneu-models'))
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
parser = argparse.ArgumentParser()
parser.add_argument('--slides', nargs='+', type=int)
args = parser.parse_args()
scripts = json.loads((root / 'voice/scripts.json').read_text(encoding='utf-8'))
assert [s['slide'] for s in scripts] == list(range(1, 36))
manifest_path = root / 'voice/manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {'voice': 'Ngọc Huyền', 'slides': {}}
wav_dir = root / 'voice/rendered'
out = root / 'assets/voice'
wav_dir.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)
ffmpeg = root / '.local-tools/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
pending = []
for item in scripts:
    if args.slides and item['slide'] not in args.slides:
        continue
    key = str(item['slide'])
    digest = hashlib.sha256(('ngochuyen-fp32-seed20261007-temperature0.7-' + item['text']).encode()).hexdigest()
    old = manifest['slides'].get(key, {})
    if old.get('textHash') == digest and (root / old['src']).is_file():
        print('SKIP', key, flush=True)
    else:
        pending.append((item, digest))
if pending:
    import numpy as np
    import soundfile as sf
    from vieneu import Vieneu
    print('Loading Ngoc Huyen:', len(pending), 'slides', flush=True)
    tts = Vieneu(backend='onnx', precision='fp32')
    for item, digest in pending:
        number = item['slide']
        started = time.perf_counter()
        np.random.seed(20261007 + number)
        audio = tts.infer(item['text'], voice='Ngọc Huyền', temperature=.7, max_chars=180, max_new_frames=800)
        if not len(audio) or not np.isfinite(audio).all():
            raise ValueError(f'Invalid audio: {number}')
        peak = float(np.max(np.abs(audio)))
        if peak > .97:
            audio *= .97 / peak
        wav = wav_dir / f'{number:02}.wav'
        tts.save(audio, str(wav))
        data, rate = sf.read(wav)
        duration = len(data) / rate
        rms = float(np.sqrt(np.mean(data * data)))
        if rate != 48000 or duration < 2 or rms < .001 or len(item['text'].split()) / duration > 8:
            raise ValueError(f'Audio validation failed: {number}, {duration}, {rms}')
        name = hashlib.sha256(wav.read_bytes()).hexdigest()[:20] + '.mp3'
        target = out / name
        subprocess.run([str(ffmpeg), '-y', '-v', 'error', '-i', str(wav), '-ac', '1', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '96k', str(target)], check=True)
        manifest['slides'][str(number)] = {'src':target.relative_to(root).as_posix(), 'duration':round(duration,4),
            'textHash':digest, 'rms':round(rms,4), 'peak':round(float(np.max(np.abs(data))),4)}
        temporary = manifest_path.with_suffix('.tmp')
        temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temporary.replace(manifest_path)
        print(f'DONE {number:02}: {duration:.2f}s ({time.perf_counter()-started:.1f}s)', flush=True)
print('Voices available:', len(manifest['slides']), flush=True)
