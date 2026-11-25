# Английская озвучка (en-US-AndrewNeural), каждый абзац ставится на то же время, что и русский (audio/paras.json),
# чтобы картинка совпадала. Если абзац длиннее своего окна — чуть ускоряем.
#   python3 tools/tts_edge_aligned.py script/en/voice.txt public/voice_en.mp3 audio/paras.json audio/en/paras.json
import json, os, subprocess, sys, tempfile, wave
txt, out, ref, outp = sys.argv[1:5]
SR = 44100
env = dict(os.environ, SSL_CERT_FILE='/root/.ccr/ca-bundle.crt')
proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
paras = [p.strip() for p in open(txt, encoding='utf8').read().split('\n\n') if p.strip()]
R = json.load(open(ref, encoding='utf8')); TOTAL = 79.2
assert len(R) == len(paras), (len(R), len(paras))
tmp = tempfile.mkdtemp()
def tts(p, rate, mp3):
    cmd = ['edge-tts', '--voice', 'en-US-AndrewNeural', f'--rate={rate:+d}%', '--text', p, '--write-media', mp3]
    if proxy: cmd[1:1] = ['--proxy', proxy]
    for _ in range(5):
        if subprocess.run(cmd, env=env, capture_output=True).returncode == 0 and os.path.getsize(mp3) > 1000: return
    raise SystemExit('tts failed: ' + p)
def load(mp3, wav):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-af',
        'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
        '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', wav], check=True)
    w = wave.open(wav); return w.readframes(w.getnframes())
buf = bytearray(b'\0\0' * int(SR * TOTAL)); bounds = []
for i, p in enumerate(paras):
    start = R[i]['s']; slot = (R[i + 1]['s'] if i + 1 < len(R) else TOTAL - 0.4) - start - 0.25
    rate = 0
    while True:
        d = load(tts(p, rate, f'{tmp}/{i}.mp3') or f'{tmp}/{i}.mp3', f'{tmp}/{i}.wav')
        dur = len(d) / 2 / SR
        if dur <= slot or rate >= 30: break
        rate += 5
    o = int(start * SR) * 2; buf[o:o + len(d)] = d
    bounds.append({'s': round(start, 2), 'e': round(start + dur, 2), 'text': p})
    print(i + 1, start, round(dur, 2), 'slot', round(slot, 2), 'rate', rate)
o = wave.open(f'{tmp}/all.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(bytes(buf)); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/all.wav', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(SR), '-b:a', '192k', out], check=True)
os.makedirs(os.path.dirname(outp), exist_ok=True)
json.dump(bounds, open(outp, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('→', out)
