// Персонажи-овощи на Canvas 2D (рисуются на плоскости, которая всегда смотрит в камеру).
// Координаты в метрах: x вправо, z вверх, 0 = земля. Обводка «кистью», объём — градиентами.
export type Kind = "apple" | "cucumber" | "potato" | "tomato";
export type VPose = {
  expr: string; blink: boolean; walk: number; walkAmp: number; lean: number; tilt: number; breathe: number;
  handF: [number, number]; handB: [number, number]; squash?: number; headset?: boolean; flex?: number;
};
export const VPW = 1.7, VPH = 2.5;            // размер плоскости, м
export const VCW = 680, VCH = 1000;            // канвас
const K = VCW / VPW;
const X = (x: number) => VCW / 2 + x * K;
const Y = (z: number) => VCH - z * K;
const INK = "#1b1622";

type Ex = { brow: [number, number]; mouth: "smile" | "grin" | "open" | "o" | "flat" | "frown" | "smirk" | "teeth" | "wobble"; eyes?: "dot" | "wide" | "angry" | "happy" | "squint"; sweat?: boolean; glassesDown?: boolean };
const EX: Record<string, Ex> = {
  neutral: { brow: [0, 0], mouth: "flat", eyes: "dot" },
  smug: { brow: [0.3, 0.01], mouth: "smirk", eyes: "squint" },
  grin: { brow: [-0.1, 0.01], mouth: "grin", eyes: "dot" },
  laugh: { brow: [0.25, 0.03], mouth: "open", eyes: "happy" },
  happy: { brow: [0.2, 0.02], mouth: "smile", eyes: "happy" },
  shock: { brow: [0.6, 0.06], mouth: "o", eyes: "wide", sweat: true, glassesDown: true },
  scared: { brow: [0.55, 0.04], mouth: "wobble", eyes: "wide", sweat: true },
  angry: { brow: [-0.55, -0.01], mouth: "frown", eyes: "angry" },
  determined: { brow: [-0.45, 0], mouth: "teeth", eyes: "angry" },
  tough: { brow: [-0.35, 0], mouth: "smirk", eyes: "angry" },
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k)))).join(",")})`;
};
// объёмная заливка: свет сверху-слева, тень снизу-справа, контровой отблеск
const volFill = (g: CanvasRenderingContext2D, cx: number, cz: number, r: number, base: string) => {
  const gr = g.createRadialGradient(X(cx - r * 0.38), Y(cz + r * 0.42), r * K * 0.05, X(cx), Y(cz), r * K * 1.15);
  gr.addColorStop(0, shade(base, 1.35)); gr.addColorStop(0.45, base); gr.addColorStop(1, shade(base, 0.58));
  return gr;
};
// обводка кистью: толстый тёмный слой со сдвигом вправо-вниз + основной контур
const brush = (g: CanvasRenderingContext2D, path: () => void, w = 0.022) => {
  g.save(); g.translate(0.006 * K, 0.008 * K); g.strokeStyle = INK; g.lineWidth = w * K * 1.25; path(); g.stroke(); g.restore();
  g.strokeStyle = INK; g.lineWidth = w * K; path(); g.stroke();
};

// ----------------------------------------------------------------- части тела
const leg = (g: CanvasRenderingContext2D, x0: number, z0: number, x1: number, z1: number, col: string, w: number) => {
  g.lineCap = "round";
  g.strokeStyle = INK; g.lineWidth = (w + 0.022) * K; g.beginPath(); g.moveTo(X(x0), Y(z0)); g.lineTo(X(x1), Y(z1)); g.stroke();
  g.strokeStyle = col; g.lineWidth = w * K; g.beginPath(); g.moveTo(X(x0), Y(z0)); g.lineTo(X(x1), Y(z1)); g.stroke();
};
const sneaker = (g: CanvasRenderingContext2D, x: number, z: number, dir: number, main: string, high: boolean) => {
  const p = () => { g.beginPath(); g.moveTo(X(x - 0.07 * dir), Y(z + (high ? 0.13 : 0.07))); g.lineTo(X(x + 0.06 * dir), Y(z + (high ? 0.13 : 0.07)));
    g.quadraticCurveTo(X(x + 0.17 * dir), Y(z + 0.06), X(x + 0.17 * dir), Y(z + 0.015)); g.lineTo(X(x - 0.09 * dir), Y(z + 0.015)); g.closePath(); };
  g.fillStyle = main; p(); g.fill(); brush(g, p, 0.014);
  g.fillStyle = "#f4f1ea"; g.fillRect(Math.min(X(x - 0.09 * dir), X(x + 0.17 * dir)), Y(z + 0.035), 0.26 * K, 0.025 * K);   // подошва
  if (high) { g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(X(x + 0.04 * dir), Y(z + 0.07), 0.05 * K, 0.025 * K, -0.3 * dir, 0, Math.PI * 2); g.fill(); }
};
const slide = (g: CanvasRenderingContext2D, x: number, z: number, dir: number, skin: string) => {
  g.fillStyle = "#e9e2d6"; g.fillRect(X(x - 0.09), Y(z + 0.03), 0.22 * K, 0.03 * K);
  g.fillStyle = skin; g.beginPath(); g.ellipse(X(x + 0.03 * dir), Y(z + 0.055), 0.1 * K, 0.035 * K, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#c63b3b"; g.fillRect(X(x - 0.02 * dir) - 0.04 * K, Y(z + 0.09), 0.1 * K, 0.04 * K);
  g.fillStyle = "#fff"; g.fillRect(X(x - 0.02 * dir) - 0.04 * K, Y(z + 0.075), 0.1 * K, 0.012 * K);
};
// мускулистая рука: плечо → локоть (наружу) → кулак, бицепс-шар
const bigArm = (g: CanvasRenderingContext2D, sx: number, sz: number, hx: number, hz: number, side: number, col: string, flex: number) => {
  const mx = (sx + hx) / 2 + side * (0.16 + 0.1 * flex), mz = (sz + hz) / 2 - 0.12 + 0.18 * flex;
  const seg = (ax: number, az: number, bx: number, bz: number, w: number) => {
    g.lineCap = "round";
    g.strokeStyle = INK; g.lineWidth = (w + 0.026) * K; g.beginPath(); g.moveTo(X(ax), Y(az)); g.lineTo(X(bx), Y(bz)); g.stroke();
    g.strokeStyle = col; g.lineWidth = w * K; g.beginPath(); g.moveTo(X(ax), Y(az)); g.lineTo(X(bx), Y(bz)); g.stroke();
  };
  seg(sx, sz, mx, mz, 0.15); seg(mx, mz, hx, hz, 0.12);
  // бицепс
  const bx = sx + (mx - sx) * 0.55, bz = sz + (mz - sz) * 0.55 + 0.03 + 0.04 * flex;
  const br = 0.085 + 0.035 * flex;
  g.fillStyle = volFill(g, bx, bz, br, col); g.beginPath(); g.arc(X(bx), Y(bz), br * K, 0, Math.PI * 2); g.fill();
  brush(g, () => { g.beginPath(); g.arc(X(bx), Y(bz), br * K, Math.PI * 0.9, Math.PI * 2.1); }, 0.016);
  // дельта
  g.fillStyle = volFill(g, sx, sz, 0.11, col); g.beginPath(); g.arc(X(sx), Y(sz), 0.11 * K, 0, Math.PI * 2); g.fill();
  brush(g, () => { g.beginPath(); g.arc(X(sx), Y(sz), 0.11 * K, Math.PI * (side > 0 ? 1.4 : -0.4), Math.PI * (side > 0 ? 2.4 : 0.6)); }, 0.016);
  // кулак
  g.fillStyle = volFill(g, hx, hz, 0.08, col); g.beginPath(); g.arc(X(hx), Y(hz), 0.08 * K, 0, Math.PI * 2); g.fill();
  brush(g, () => { g.beginPath(); g.arc(X(hx), Y(hz), 0.08 * K, 0, Math.PI * 2); }, 0.018);
};
const thinArm = (g: CanvasRenderingContext2D, sx: number, sz: number, hx: number, hz: number, side: number, col: string, fist: string, w = 0.05) => {
  const mx = (sx + hx) / 2 + side * 0.05, mz = (sz + hz) / 2 - 0.04;
  g.lineCap = "round";
  for (const [c, ww] of [[INK, w + 0.022], [col, w]] as [string, number][]) {
    g.strokeStyle = c; g.lineWidth = ww * K; g.beginPath(); g.moveTo(X(sx), Y(sz)); g.quadraticCurveTo(X(mx), Y(mz), X(hx), Y(hz)); g.stroke();
  }
  g.fillStyle = volFill(g, hx, hz, 0.055, fist); g.beginPath(); g.arc(X(hx), Y(hz), 0.055 * K, 0, Math.PI * 2); g.fill();
  brush(g, () => { g.beginPath(); g.arc(X(hx), Y(hz), 0.055 * K, 0, Math.PI * 2); }, 0.014);
};

// ----------------------------------------------------------------- лицо
const face = (g: CanvasRenderingContext2D, cx: number, cz: number, s: number, e: Ex, blink: boolean, glasses: boolean, bigEyes: boolean) => {
  const ex = 0.12 * s;
  // глаза
  const drawEyes = () => {
    for (const d of [-1, 1]) {
      const x = cx + d * ex, z = cz;
      if (bigEyes) {
        const rw = 0.085 * s * (e.eyes === "wide" ? 1.15 : 1), rh = (blink ? 0.012 : 0.095) * s * (e.eyes === "wide" ? 1.15 : 1);
        g.fillStyle = "#fbf7ea"; g.beginPath(); g.ellipse(X(x), Y(z), rw * K, rh * K, 0, 0, Math.PI * 2); g.fill();
        brush(g, () => { g.beginPath(); g.ellipse(X(x), Y(z), rw * K, rh * K, 0, 0, Math.PI * 2); }, 0.012 * s + 0.004);
        if (!blink) { g.fillStyle = INK; g.beginPath(); g.arc(X(x + 0.012 * s), Y(z - 0.01 * s), 0.022 * s * K, 0, Math.PI * 2); g.fill(); }
      } else if (e.eyes === "happy" || blink) {
        g.strokeStyle = INK; g.lineWidth = 0.016 * s * K; g.beginPath(); g.arc(X(x), Y(z - 0.01 * s), 0.035 * s * K, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      } else {
        const h = e.eyes === "wide" ? 0.05 : e.eyes === "squint" ? 0.022 : 0.035;
        g.fillStyle = "#fff"; g.beginPath(); g.ellipse(X(x), Y(z), 0.04 * s * K, (h + 0.012) * s * K, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = INK; g.beginPath(); g.ellipse(X(x), Y(z), 0.02 * s * K, h * s * K, 0, 0, Math.PI * 2); g.fill();
      }
    }
  };
  if (!glasses || e.glassesDown) drawEyes();
  if (glasses) {
    const gz = e.glassesDown ? cz - 0.055 * s : cz;
    g.fillStyle = "#0e0d12";
    for (const d of [-1, 1]) {
      g.beginPath(); g.moveTo(X(cx + d * 0.03 * s), Y(gz + 0.045 * s)); g.lineTo(X(cx + d * 0.215 * s), Y(gz + 0.05 * s));
      g.quadraticCurveTo(X(cx + d * 0.215 * s), Y(gz - 0.06 * s), X(cx + d * 0.12 * s), Y(gz - 0.06 * s));
      g.quadraticCurveTo(X(cx + d * 0.03 * s), Y(gz - 0.06 * s), X(cx + d * 0.03 * s), Y(gz + 0.045 * s)); g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(X(cx + d * 0.09 * s), Y(gz + 0.015 * s), 0.03 * s * K, 0.012 * s * K, -0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#0e0d12";
    }
    g.fillRect(X(cx - 0.04 * s), Y(gz + 0.045 * s), 0.08 * s * K, 0.022 * s * K);
    g.fillRect(X(cx - 0.245 * s), Y(gz + 0.05 * s), 0.05 * s * K, 0.018 * s * K); g.fillRect(X(cx + 0.195 * s), Y(gz + 0.05 * s), 0.05 * s * K, 0.018 * s * K);
  }
  // брови
  const [tilt, lift] = e.brow;
  g.strokeStyle = INK; g.lineCap = "round"; g.lineWidth = 0.028 * s * K;
  const bz = cz + (glasses ? 0.085 : bigEyes ? 0.125 : 0.075) * s + lift * s;
  for (const d of [-1, 1]) {
    g.beginPath();
    g.moveTo(X(cx + d * 0.05 * s), Y(bz - tilt * 0.045 * s)); g.quadraticCurveTo(X(cx + d * 0.11 * s), Y(bz + 0.02 * s), X(cx + d * 0.17 * s), Y(bz + tilt * 0.045 * s));
    g.stroke();
  }
  // рот
  const mz = cz - (bigEyes ? 0.17 : 0.13) * s, mw = 0.11 * s;
  g.lineWidth = 0.018 * s * K; g.strokeStyle = INK;
  const m = e.mouth;
  if (m === "smile" || m === "smirk") {
    g.beginPath(); g.moveTo(X(cx - mw), Y(mz + 0.02 * s)); g.quadraticCurveTo(X(cx), Y(mz - 0.06 * s), X(cx + mw * (m === "smirk" ? 1.1 : 1)), Y(mz + (m === "smirk" ? 0.045 : 0.02) * s)); g.stroke();
  } else if (m === "grin" || m === "teeth" || m === "open") {
    g.fillStyle = m === "open" ? "#5a1520" : "#fffaf0";
    g.beginPath(); g.moveTo(X(cx - mw), Y(mz + 0.02 * s)); g.quadraticCurveTo(X(cx), Y(mz + (m === "teeth" ? 0.0 : 0.035) * s), X(cx + mw), Y(mz + 0.02 * s));
    g.quadraticCurveTo(X(cx), Y(mz - (m === "open" ? 0.12 : 0.08) * s), X(cx - mw), Y(mz + 0.02 * s)); g.fill(); g.stroke();
    if (m === "open") { g.fillStyle = "#e86a6a"; g.beginPath(); g.ellipse(X(cx), Y(mz - 0.06 * s), 0.045 * s * K, 0.022 * s * K, 0, 0, Math.PI * 2); g.fill(); }
    if (m === "teeth") { g.beginPath(); g.moveTo(X(cx - mw * 0.9), Y(mz - 0.02 * s)); g.lineTo(X(cx + mw * 0.9), Y(mz - 0.02 * s)); g.lineWidth = 0.008 * s * K; g.stroke(); }
  } else if (m === "o") {
    g.fillStyle = "#3a0f18"; g.beginPath(); g.ellipse(X(cx), Y(mz - 0.02 * s), 0.035 * s * K, 0.05 * s * K, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  } else if (m === "frown") {
    g.beginPath(); g.moveTo(X(cx - mw * 0.8), Y(mz - 0.03 * s)); g.quadraticCurveTo(X(cx), Y(mz + 0.03 * s), X(cx + mw * 0.8), Y(mz - 0.02 * s)); g.stroke();
  } else if (m === "wobble") {
    g.beginPath(); g.moveTo(X(cx - mw), Y(mz)); for (let i = 1; i <= 6; i++) g.lineTo(X(cx - mw + (2 * mw * i) / 6), Y(mz + (i % 2 ? 0.018 : -0.018) * s)); g.stroke();
  } else { g.beginPath(); g.moveTo(X(cx - mw * 0.7), Y(mz)); g.lineTo(X(cx + mw * 0.7), Y(mz - 0.01 * s)); g.stroke(); }
  if (e.sweat) { g.fillStyle = "#8fd3ff"; g.beginPath(); g.ellipse(X(cx + 0.26 * s), Y(cz + 0.1 * s), 0.025 * s * K, 0.04 * s * K, 0, 0, Math.PI * 2); g.fill(); brush(g, () => { g.beginPath(); g.ellipse(X(cx + 0.26 * s), Y(cz + 0.1 * s), 0.025 * s * K, 0.04 * s * K, 0, 0, Math.PI * 2); }, 0.008); }
};

// ----------------------------------------------------------------- персонажи
const legs = (g: CanvasRenderingContext2D, p: VPose, hipZ: number, spread: number, col: string, w: number, foot: (x: number, z: number, dir: number) => void) => {
  for (const d of [-1, 1]) {
    const sw = Math.sin(p.walk + (d > 0 ? 0 : Math.PI)) * p.walkAmp;
    const lift = Math.max(0, Math.cos(p.walk + (d > 0 ? 0 : Math.PI))) * p.walkAmp * 0.35;
    const fx = d * spread + sw * 0.25, fz = lift * 0.3;
    leg(g, d * spread * 0.8, hipZ, fx, fz + 0.05, col, w);
    foot(fx, fz, d);
  }
};

function drawApple(g: CanvasRenderingContext2D, p: VPose, e: Ex) {
  const cz = 0.72 + p.breathe * 0.01, r = 0.33;
  legs(g, p, 0.3, 0.1, "#c92a2a", 0.05, (x, z, d) => sneaker(g, x, z, d, "#d42d2d", true));
  // шорты
  const sh = () => { g.beginPath(); g.moveTo(X(-0.2), Y(0.47)); g.lineTo(X(0.2), Y(0.47)); g.lineTo(X(0.22), Y(0.24)); g.lineTo(X(0.02), Y(0.24)); g.lineTo(X(0), Y(0.33)); g.lineTo(X(-0.02), Y(0.24)); g.lineTo(X(-0.22), Y(0.24)); g.closePath(); };
  const sg = g.createLinearGradient(X(-0.2), 0, X(0.2), 0); sg.addColorStop(0, "#4f78b8"); sg.addColorStop(1, "#2c4f88");
  g.fillStyle = sg; sh(); g.fill(); brush(g, sh, 0.016);
  g.fillStyle = "#8fb0e0"; g.fillRect(X(-0.22), Y(0.27), 0.2 * K, 0.025 * K); g.fillRect(X(0.02), Y(0.27), 0.2 * K, 0.025 * K);
  // руки (за телом — задняя)
  thinArm(g, 0.26, cz - 0.12, p.handB[0], p.handB[1], 1, "#cf2f2f", "#d63a3a");
  // яблоко-тело
  g.save(); g.translate(X(0), Y(cz)); g.rotate(p.lean * 0.6 + p.tilt); g.translate(-X(0), -Y(cz));
  const ap = () => { g.beginPath(); g.moveTo(X(0), Y(cz + r * 0.82));
    g.bezierCurveTo(X(r * 0.55), Y(cz + r * 1.12), X(r * 1.15), Y(cz + r * 0.7), X(r * 1.05), Y(cz - r * 0.1));
    g.bezierCurveTo(X(r * 0.98), Y(cz - r * 0.85), X(r * 0.45), Y(cz - r * 1.02), X(0), Y(cz - r * 0.9));
    g.bezierCurveTo(X(-r * 0.45), Y(cz - r * 1.02), X(-r * 0.98), Y(cz - r * 0.85), X(-r * 1.05), Y(cz - r * 0.1));
    g.bezierCurveTo(X(-r * 1.15), Y(cz + r * 0.7), X(-r * 0.55), Y(cz + r * 1.12), X(0), Y(cz + r * 0.82)); g.closePath(); };
  const af = g.createRadialGradient(X(-0.12), Y(cz + 0.12), 0.02 * K, X(0), Y(cz), r * 1.2 * K);
  af.addColorStop(0, "#ff7a3c"); af.addColorStop(0.35, "#e8402a"); af.addColorStop(0.8, "#b51d22"); af.addColorStop(1, "#7d1018");
  g.fillStyle = af; ap(); g.fill();
  // крапинки
  g.fillStyle = "rgba(255,210,140,0.35)"; for (let i = 0; i < 26; i++) { const a = i * 2.39, rr = r * 0.85 * Math.sqrt((i + 0.5) / 26); g.fillRect(X(Math.cos(a) * rr), Y(cz + Math.sin(a) * rr), 3, 2); }
  g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.ellipse(X(-0.17), Y(cz + 0.13), 0.06 * K, 0.035 * K, -0.6, 0, Math.PI * 2); g.fill();
  brush(g, ap, 0.022);
  face(g, 0.0, cz + 0.02, 1.0, e, p.blink, true, false);
  // кепка назад
  const capZ = cz + r * 0.88;
  const cap = () => { g.beginPath(); g.moveTo(X(-0.27), Y(capZ - 0.04)); g.bezierCurveTo(X(-0.25), Y(capZ + 0.2), X(0.25), Y(capZ + 0.2), X(0.27), Y(capZ - 0.04)); g.closePath(); };
  const cg = g.createLinearGradient(0, Y(capZ + 0.18), 0, Y(capZ - 0.04)); cg.addColorStop(0, "#ff4040"); cg.addColorStop(1, "#b81818");
  g.fillStyle = cg; cap(); g.fill(); brush(g, cap, 0.018);
  const brim = () => { g.beginPath(); g.moveTo(X(-0.26), Y(capZ - 0.02)); g.quadraticCurveTo(X(-0.42), Y(capZ - 0.04), X(-0.4), Y(capZ - 0.1)); g.quadraticCurveTo(X(-0.3), Y(capZ - 0.09), X(-0.2), Y(capZ - 0.05)); g.closePath(); };
  g.fillStyle = "#c81e1e"; brim(); g.fill(); brush(g, brim, 0.014);
  g.fillStyle = "#7a3b2a"; g.fillRect(X(-0.05), Y(capZ + 0.02), 0.1 * K, 0.03 * K);
  // черенок и листик
  g.strokeStyle = "#6b4426"; g.lineWidth = 0.025 * K; g.beginPath(); g.moveTo(X(0.0), Y(capZ + 0.15)); g.quadraticCurveTo(X(0.02), Y(capZ + 0.22), X(-0.02), Y(capZ + 0.27)); g.stroke();
  const lf = () => { g.beginPath(); g.moveTo(X(0.0), Y(capZ + 0.22)); g.quadraticCurveTo(X(0.1), Y(capZ + 0.33), X(0.22), Y(capZ + 0.27)); g.quadraticCurveTo(X(0.12), Y(capZ + 0.17), X(0.0), Y(capZ + 0.22)); };
  g.fillStyle = "#58b83a"; lf(); g.fill(); brush(g, lf, 0.01);
  if (p.headset) {
    g.strokeStyle = "#1a1a22"; g.lineWidth = 0.035 * K; g.beginPath(); g.arc(X(0), Y(cz + 0.05), 0.36 * K, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    for (const d of [-1, 1]) { g.fillStyle = "#24242e"; g.beginPath(); g.ellipse(X(d * 0.35), Y(cz), 0.05 * K, 0.08 * K, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#38e0ff"; g.fillRect(X(d * 0.35) - 3, Y(cz + 0.03), 6, 0.06 * K); }
  }
  g.restore();
  thinArm(g, -0.26, cz - 0.12, p.handF[0], p.handF[1], -1, "#cf2f2f", "#d63a3a");
}

const tallBody = (g: CanvasRenderingContext2D, z0: number, z1: number, w: number, base: string, bumps: string, wob: number) => {
  const cz = (z0 + z1) / 2, h = (z1 - z0) / 2;
  const path = () => { g.beginPath(); g.moveTo(X(-w * 0.85), Y(z1 - w * 0.6));
    g.bezierCurveTo(X(-w * 0.7), Y(z1 + w * 0.15), X(w * 0.7), Y(z1 + w * 0.15), X(w * 0.85), Y(z1 - w * 0.6));
    g.bezierCurveTo(X(w * (1.05 + wob)), Y(cz + h * 0.2), X(w * 1.08), Y(cz - h * 0.4), X(w * 0.9), Y(z0 + w * 0.5));
    g.bezierCurveTo(X(w * 0.7), Y(z0 - w * 0.12), X(-w * 0.7), Y(z0 - w * 0.12), X(-w * 0.9), Y(z0 + w * 0.5));
    g.bezierCurveTo(X(-w * 1.08), Y(cz - h * 0.4), X(-w * (1.05 + wob)), Y(cz + h * 0.2), X(-w * 0.85), Y(z1 - w * 0.6)); g.closePath(); };
  const gr = g.createLinearGradient(X(-w), 0, X(w), 0);
  gr.addColorStop(0, shade(base, 1.3)); gr.addColorStop(0.35, base); gr.addColorStop(1, shade(base, 0.6));
  g.fillStyle = gr; path(); g.fill();
  g.fillStyle = bumps; for (let i = 0; i < 22; i++) { const x = (((i * 37) % 17) / 17 - 0.5) * w * 1.5, z = z0 + 0.1 + ((i * 53) % 29) / 29 * (z1 - z0 - 0.2); g.beginPath(); g.arc(X(x), Y(z), 0.012 * K, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.2)"; g.beginPath(); g.ellipse(X(-w * 0.45), Y(cz + h * 0.35), w * 0.18 * K, h * 0.35 * K, 0, 0, Math.PI * 2); g.fill();
  brush(g, path, 0.024);
};
const abs = (g: CanvasRenderingContext2D, z: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = 0.012 * K; g.lineCap = "round";
  for (const d of [-1, 1]) { g.beginPath(); g.arc(X(d * 0.1), Y(z + 0.3), 0.1 * K, Math.PI * (d > 0 ? 0.55 : 0.05), Math.PI * (d > 0 ? 0.95 : 0.45)); g.stroke(); }
  for (let i = 0; i < 3; i++) for (const d of [-1, 1]) { g.beginPath(); g.ellipse(X(d * 0.065), Y(z + 0.12 - i * 0.1), 0.05 * K, 0.035 * K, 0, 0, Math.PI * 2); g.stroke(); }
  g.beginPath(); g.moveTo(X(0), Y(z + 0.2)); g.lineTo(X(0), Y(z - 0.15)); g.stroke();
};

function drawGuard(g: CanvasRenderingContext2D, p: VPose, e: Ex, kind: "cucumber" | "potato") {
  const cuc = kind === "cucumber";
  const base = cuc ? "#4a9a3a" : "#c29a5c", dark = cuc ? "#2f6a26" : "#8a6a3a";
  const z0 = cuc ? 0.62 : 0.7, z1 = (cuc ? 2.0 : 1.95) + p.breathe * 0.012, w = cuc ? 0.27 : 0.3;
  // ноги
  legs(g, p, z0 + 0.08, cuc ? 0.09 : 0.12, cuc ? "#3f8a32" : "#b38b52", cuc ? 0.055 : 0.1, (x, z, d) => (cuc ? sneaker(g, x, z, d, "#d23a3a", false) : slide(g, x, z, d, base)));
  const sh = z1 - 0.62;
  bigArm(g, w * 0.95, sh, p.handB[0], p.handB[1], 1, base, p.flex ?? 0);
  g.save(); g.translate(X(0), Y(z0)); g.rotate(p.lean * 0.4 + p.tilt * 0.5); g.translate(-X(0), -Y(z0));
  tallBody(g, z0, z1, w, base, cuc ? "#2c5f22" : "#7d5d33", cuc ? 0.02 : 0.08);
  abs(g, z1 - 1.0, shade(dark, 0.9));
  if (!cuc) {   // шорты на картошке
    const s = () => { g.beginPath(); g.moveTo(X(-w * 1.0), Y(z0 + 0.3)); g.lineTo(X(w * 1.0), Y(z0 + 0.3)); g.lineTo(X(w * 1.05), Y(z0 - 0.08)); g.lineTo(X(0.02), Y(z0 - 0.08)); g.lineTo(X(0), Y(z0 + 0.05)); g.lineTo(X(-0.02), Y(z0 - 0.08)); g.lineTo(X(-w * 1.05), Y(z0 - 0.08)); g.closePath(); };
    const sg = g.createLinearGradient(X(-w), 0, X(w), 0); sg.addColorStop(0, "#6f96c8"); sg.addColorStop(1, "#3e6498");
    g.fillStyle = sg; s(); g.fill(); brush(g, s, 0.016);
    g.fillStyle = "#2d4f80"; g.fillRect(X(-w), Y(z0 + 0.3), 2 * w * K, 0.03 * K);
  }
  // хвостик/росток
  g.strokeStyle = cuc ? "#3b6b25" : "#9c8a4a"; g.lineWidth = 0.035 * K; g.beginPath(); g.moveTo(X(0), Y(z1 - 0.02)); g.quadraticCurveTo(X(0.04), Y(z1 + 0.08), X(-0.01), Y(z1 + 0.12)); g.stroke();
  face(g, 0, z1 - 0.32, 1.15, e, p.blink, true, false);
  g.restore();
  bigArm(g, -w * 0.95, sh, p.handF[0], p.handF[1], -1, base, p.flex ?? 0);
}

function drawTomato(g: CanvasRenderingContext2D, p: VPose, e: Ex) {
  const cz = 0.78 + p.breathe * 0.01, r = 0.38;
  legs(g, p, cz - r * 0.8, 0.12, "#17141c", 0.035, (x, z, d) => { g.fillStyle = "#1c1a22"; g.beginPath(); g.ellipse(X(x + 0.04 * d), Y(z + 0.04), 0.1 * K, 0.045 * K, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c43a3a"; g.fillRect(X(x + 0.04 * d) - 0.05 * K, Y(z + 0.07), 0.1 * K, 0.02 * K); });
  thinArm(g, r * 0.95, cz - 0.05, p.handB[0], p.handB[1], 1, "#17141c", "#17141c", 0.03);
  g.save(); g.translate(X(0), Y(cz)); g.rotate(p.lean * 0.6 + p.tilt); g.translate(-X(0), -Y(cz));
  const body = () => { g.beginPath(); g.ellipse(X(0), Y(cz), r * 1.05 * K, r * 0.95 * K, 0, 0, Math.PI * 2); };
  const tf = g.createRadialGradient(X(-0.14), Y(cz + 0.14), 0.02 * K, X(0), Y(cz), r * 1.2 * K);
  tf.addColorStop(0, "#ff6a4a"); tf.addColorStop(0.45, "#e03224"); tf.addColorStop(1, "#8e1414");
  g.fillStyle = tf; body(); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(X(-0.22), Y(cz + 0.12), 0.05 * K, 0.08 * K, 0.3, 0, Math.PI * 2); g.fill();
  brush(g, body, 0.024);
  // листья
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / 4;
    const lf = () => { g.beginPath(); g.moveTo(X(0), Y(cz + r * 0.9)); g.quadraticCurveTo(X(Math.cos(a) * 0.16), Y(cz + r * 0.9 + 0.08), X(Math.cos(a) * 0.24), Y(cz + r * 0.9 + Math.sin(-a) * 0.02 - 0.06)); g.quadraticCurveTo(X(Math.cos(a) * 0.1), Y(cz + r * 0.9 - 0.02), X(0), Y(cz + r * 0.9)); };
    g.fillStyle = "#4e9a35"; lf(); g.fill(); brush(g, lf, 0.01);
  }
  g.strokeStyle = "#3e7a2a"; g.lineWidth = 0.035 * K; g.beginPath(); g.moveTo(X(0), Y(cz + r * 0.88)); g.lineTo(X(0.01), Y(cz + r * 0.88 + 0.12)); g.stroke();
  face(g, 0, cz + 0.05, 1.15, e, p.blink, false, true);
  g.restore();
  thinArm(g, -r * 0.95, cz - 0.05, p.handF[0], p.handF[1], -1, "#17141c", "#17141c", 0.03);
}

export function drawVeg(g: CanvasRenderingContext2D, kind: Kind, p: VPose) {
  g.clearRect(0, 0, VCW, VCH);
  g.lineJoin = "round"; g.lineCap = "round";
  const e = EX[p.expr] ?? EX.neutral;
  // мягкая тень под ногами
  g.fillStyle = "rgba(20,10,30,0.25)"; g.beginPath(); g.ellipse(X(0), Y(0.015), (kind === "apple" || kind === "tomato" ? 0.32 : 0.42) * K, 0.045 * K, 0, 0, Math.PI * 2); g.fill();
  const sq = p.squash ?? 1;
  g.save(); g.translate(X(0), Y(0)); g.scale(1 / Math.sqrt(sq), sq); g.translate(-X(0), -Y(0));
  if (kind === "apple") drawApple(g, p, e);
  else if (kind === "tomato") drawTomato(g, p, e);
  else drawGuard(g, p, e, kind);
  g.restore();
}

// Позы рук по умолчанию (x, z от центра ног) — для каждого персонажа
export const REST: Record<Kind, { f: [number, number]; b: [number, number] }> = {
  apple: { f: [-0.36, 0.42], b: [0.36, 0.42] },
  tomato: { f: [-0.5, 0.5], b: [0.5, 0.5] },
  cucumber: { f: [-0.42, 0.95], b: [0.42, 0.95] },
  potato: { f: [-0.46, 0.95], b: [0.46, 0.95] },
};
export const FLEX: Record<Kind, { f: [number, number]; b: [number, number] }> = {
  apple: { f: [-0.42, 1.05], b: [0.42, 1.05] },
  tomato: { f: [-0.55, 1.1], b: [0.55, 1.1] },
  cucumber: { f: [-0.45, 1.75], b: [0.45, 1.75] },
  potato: { f: [-0.48, 1.7], b: [0.48, 1.7] },
};
