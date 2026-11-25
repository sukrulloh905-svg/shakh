# Озвучка тем же голосом, что в ролике про биткоин: espeak-ng ru+m3 + мягкая обработка ffmpeg.
#   python3 tools/tts_espeak.py script/voice.txt public/voice.mp3   → также audio/paras.json
import json, os, subprocess, sys, tempfile, wave
txt, out = sys.argv[1], sys.argv[2]
SR, PAUSE = 44100, 0.6
VOICE = ['-v', 'ru+m3', '-s', '128', '-p', '30', '-a', '160', '-g', '4']
SOFT = ('aresample=44100,asetrate=44100*0.94,aresample=44100,atempo=1.06,highpass=f=80,lowpass=f=7000,'
        'equalizer=f=200:t=q:w=1:g=3,equalizer=f=3000:t=q:w=1:g=-3,aecho=0.8:0.6:40:0.15')
paras = [p.strip() for p in open(txt, encoding='utf8').read().split('\n\n') if p.strip()]
tmp = tempfile.mkdtemp()
pcm, bounds, pos = b'', [], 0
for i, p in enumerate(paras):
    raw, s = f'{tmp}/r{i}.wav', f'{tmp}/s{i}.wav'
    subprocess.run(['espeak-ng', *VOICE, '-w', raw, p], check=True)
    # обрезаем тишину по краям, чтобы границы абзацев были точными
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,' + SOFT,
                    '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', s], check=True)
    w = wave.open(s); d = w.readframes(w.getnframes()); n = w.getnframes()
    bounds.append({'s': round(pos / SR, 2), 'e': round((pos + n) / SR, 2), 'text': p})
    gap = int(SR * PAUSE)
    pcm += d + b'\0\0' * gap; pos += n + gap
o = wave.open(f'{tmp}/all.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/all.wav', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(SR), '-b:a', '192k', out], check=True)
os.makedirs('audio', exist_ok=True)
json.dump(bounds, open('audio/paras.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('голос →', out, round(pos / SR, 1), 'с')
for i, b in enumerate(bounds): print(i + 1, b['s'], '-', b['e'])
