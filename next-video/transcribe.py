import sys, json, subprocess, numpy as np
def load(p):
    b=subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(b,np.float32)
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
for src, lang, out in [("voice/user_voice_ru_take1.mp3", "ru", "words_ru.json"), ("voice/user_voice_en.mp3", "en", "words_en.json")]:
    segs, _ = m.transcribe(load(src), language=lang, word_timestamps=True, beam_size=5)
    W = [{"t": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(W, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=0)
    print(out, len(W)); print(" ".join(f"{w['s']:.1f}:{w['t']}" for w in W))
