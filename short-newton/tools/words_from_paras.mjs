// Пословные тайминги без whisper: Piper озвучивает каждый абзац отдельно, поэтому границы абзацев точные
// (audio/paras.json), а внутри абзаца время делится по «весу» слова (гласные + паузы на знаках препинания).
//   node tools/words_from_paras.mjs  → audio/words.json
import fs from "node:fs";
const paras = JSON.parse(fs.readFileSync("audio/paras.json", "utf8"));
const disp = fs.readFileSync("script/voice_display.txt", "utf8").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
if (disp.length !== paras.length) throw new Error(`абзацев: голос ${paras.length}, субтитры ${disp.length}`);
const vow = (w) => (w.match(/[аеёиоуыэюяaeiouy]/gi) ?? []).length + (w.match(/\d/g) ?? []).length * 2.2;
const words = [];
disp.forEach((p, i) => {
  const ws = p.replace(/\s[—–-]\s/g, " ").replace(/[«»"]/g, "").split(/\s+/).filter(Boolean);
  const wt = ws.map((w) => Math.max(1, vow(w)) + 0.6);
  const gap = ws.map((w) => (/[.!?…]$/.test(w) ? 2.6 : /[,:;]$/.test(w) ? 1.3 : 0));
  const tot = wt.reduce((a, b) => a + b, 0) + gap.slice(0, -1).reduce((a, b) => a + b, 0);
  const { s, e } = paras[i];
  let acc = 0;
  ws.forEach((w, k) => {
    const ws_ = s + ((e - s) * acc) / tot; acc += wt[k];
    const we = s + ((e - s) * acc) / tot; acc += gap[k];
    words.push({ t: w, s: +ws_.toFixed(2), e: +we.toFixed(2) });
  });
});
fs.writeFileSync("audio/words.json", JSON.stringify(words, null, 1));
console.log(words.length, "слов");
console.log(words.map((w) => w.s.toFixed(1) + " " + w.t).join(" | "));
