# Субтитры по 1–2 слова: слова СЦЕНАРИЯ + время из faster-whisper (выравнивание difflib).
#   python3 tools/captions.py ../text_ru.txt ../words_ru.json src/caps_ru.json
import json, re, sys, difflib
txt, wj, out = sys.argv[1:4]
FPS = 30
script = re.sub(r"[\U0001F300-\U0001FAFF]", "", open(txt, encoding="utf8").read())
S = [w for w in re.split(r"\s+", script.replace(" — ", " ").replace(" - ", " ")) if w and w not in "—-"]
W = json.load(open(wj, encoding="utf8"))
norm = lambda w: re.sub(r"[^a-zа-яё0-9]", "", w.lower().replace("ё", "е"))
a, b = [norm(w) for w in S], [norm(w["t"]) for w in W]
T = [None] * len(S)
for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    tag, i1, i2, j1, j2 = blk
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): T[i1 + k] = (W[j1 + k]["s"], W[j1 + k]["e"])
    elif tag == "replace":
        s0, e0 = W[j1]["s"], W[j2 - 1]["e"]
        for k in range(i2 - i1): T[i1 + k] = (s0 + (e0 - s0) * k / (i2 - i1), s0 + (e0 - s0) * (k + 1) / (i2 - i1))
# пропуски — интерполяцией между соседями
for i in range(len(T)):
    if T[i] is None:
        p = next((T[j][1] for j in range(i - 1, -1, -1) if T[j]), 0.0)
        n = next((T[j][0] for j in range(i + 1, len(T)) if T[j]), p + 0.4)
        T[i] = (p, max(p + 0.1, min(n, p + 0.4)))
groups, i = [], 0
while i < len(S):
    take = 1
    if i + 1 < len(S) and not re.search(r"[.!?,;:…]$", S[i]) and len(S[i]) + len(S[i + 1]) <= 16 and T[i + 1][1] - T[i][0] < 0.9: take = 2
    words = S[i:i + take]; s = T[i][0]; e = T[i + take - 1][1]
    groups.append({"text": " ".join(words).replace("???", "?"), "start": max(0, round(s * FPS) - 3), "end": round(e * FPS)})
    i += take
for k in range(len(groups) - 1):   # жёсткая смена: каждая карточка живёт до следующей (если пауза < 0.6 с)
    if groups[k + 1]["start"] - groups[k]["end"] < 18: groups[k]["end"] = groups[k + 1]["start"]
json.dump({"groups": groups}, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=0)
print(out, len(groups), "карточек")
print(" | ".join(f'{g["start"]/30:.1f} {g["text"]}' for g in groups[:40]))
