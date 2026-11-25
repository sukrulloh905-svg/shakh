# Озвучка голосом Microsoft «Дмитрий» (ru-RU-DmitryNeural, edge-tts), скорость 1.0.
#   python3 tools/tts_edge.py script/voice.txt public/voice.mp3   → также audio/paras.json
import json, os, subprocess, sys, tempfile, wave
txt, out = sys.argv[1], sys.argv[2]
SR, PAUSE = 44100, 0.5
env = dict(os.environ, SSL_CERT_FILE='/root/.ccr/ca-bundle.crt')
proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
paras = [p.strip() for p in open(txt, encoding='utf8').read().split('\n\n') if p.strip()]
tmp = tempfile.mkdtemp()
pcm, bounds, pos = b'', [], 0
for i, p in enumerate(paras):
    mp3, s = f'{tmp}/r{i}.mp3', f'{tmp}/s{i}.wav'
    cmd = ['edge-tts', '--voice', 'ru-RU-DmitryNeural', '--rate=+0%', '--text', p, '--write-media', mp3]
    if proxy: cmd[1:1] = ['--proxy', proxy]
    for _ in range(4):
        if subprocess.run(cmd, env=env).returncode == 0 and os.path.getsize(mp3) > 1000: break
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', s], check=True)
    w = wave.open(s); d = w.readframes(w.getnframes()); n = w.getnframes()
    bounds.append({'s': round(pos / SR, 2), 'e': round((pos + n) / SR, 2), 'text': p})
    gap = int(SR * PAUSE); pcm += d + b'\0\0' * gap; pos += n + gap
o = wave.open(f'{tmp}/all.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/all.wav', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(SR), '-b:a', '192k', out], check=True)
os.makedirs('audio', exist_ok=True)
json.dump(bounds, open('audio/paras.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('голос →', out, round(pos / SR, 1), 'с')
for i, b in enumerate(bounds): print(i + 1, b['s'], '-', b['e'])
