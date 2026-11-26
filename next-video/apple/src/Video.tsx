// «Что, если яблоко съест помидора?» — 16:9. Все времена — в секундах РУССКОГО голоса (якоря);
// для английской версии kit сдвигает их по anchors.json. Субтитров нет — только голос и музыка.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, Scene3D, Ball, Box, Key, V3, CamKey, WARP, IS_EN, useSec, at } from "./kit";
import { Veg, VActor, InHand } from "./chars";
import { Orchard, Ogorod, Gym, Club, Yard, Fog, Apple, Kazan, SaladBowl, Table, SubButton, Like, Part2, Dust, Dumbbell, Barbell, Pump } from "./world";

const SKY = "#8fcaf2";
const C = (t: number, p: V3, l: V3, fov = 46): CamKey => [t, p, l, fov];
// дуга облёта: камера по окружности вокруг точки c
const orb = (t0: number, t1: number, c: V3, r: [number, number], a: [number, number], h: [number, number], fov = 46, n = 6): CamKey[] =>
  Array.from({ length: n }, (_, i) => {
    const k = i / (n - 1), rr = r[0] + (r[1] - r[0]) * k, aa = a[0] + (a[1] - a[0]) * k, hh = h[0] + (h[1] - h[0]) * k;
    return C(t0 + (t1 - t0) * k, [c[0] + Math.sin(aa) * rr, hh, c[2] + Math.cos(aa) * rr], c, fov);
  });
const lin = (t0: number, t1: number): ((x: number) => number) => (x) => t0 + (t1 - t0) * x;

const hero = (o: Partial<VActor>): VActor => ({ kind: "apple", pos: [0, 0, 0], seed: 1, expr: [[0, "smug"]], ...o });
const cuc = (o: Partial<VActor>): VActor => ({ kind: "cucumber", pos: [-0.6, 0, -0.5], seed: 4, expr: [[0, "tough"]], ...o });
const pot = (o: Partial<VActor>): VActor => ({ kind: "potato", pos: [0.65, 0, -0.5], seed: 7, expr: [[0, "tough"]], ...o });
const tom = (o: Partial<VActor>): VActor => ({ kind: "tomato", pos: [1, 0, 0], seed: 9, s: 0.9, expr: [[0, "angry"]], ...o });
const pulse = (t0: number, t1: number, per: number, a: [number, number], b: [number, number]): Key[] => {
  const k: Key[] = []; for (let t = t0, i = 0; t <= t1; t += per / 2, i++) k.push([t, ...(i % 2 ? b : a)] as Key); return k;
};

// ============================================================ 1–2. Крючок: яблоко и помидор у огорода
const H1 = hero({ pos: [-0.9, 0, 0.7], expr: [[0, "smug"], [1.3, "determined"], [3.2, "smug"], [4.5, "grin"]] });
const T1 = tom({ pos: [0.9, 0, 0.5], expr: [[0, "angry"], [1.6, "shock"], [3.6, "scared"]] });
const Shot1 = () => (<><Fog /><Ogorod /><Veg a={H1} /><Veg a={T1} /></>);

// ============================================================ 3. Яблоко падает с дерева
const FallApple: React.FC = () => {
  const sec = useSec();
  if (sec > 8.9) return null;
  const tf = 6.9, y0 = 2.3, yg = 0.12;
  let y = y0, rot = Math.sin(sec * 6) * 0.15;
  if (sec > tf) { const u = sec - tf; y = Math.max(yg, y0 - 4.9 * u * u * 1.4); rot = u * 6; if (y <= yg) { const v = u - Math.sqrt((y0 - yg) / (4.9 * 1.4)); y = yg + Math.abs(Math.sin(v * 10)) * 0.15 * Math.exp(-v * 4); } }
  return <Apple p={[0.7, y, -0.3]} s={1.6} rot={rot} />;
};
const Shot3 = () => (<><Fog /><Orchard /><FallApple /></>);

// ============================================================ 4. Появляется у его ног — превращение в героя
const H4 = hero({ pos: [0.7, 0, -0.3], hidden: [[0, 8.9]], expr: [[8.9, "shock"], [9.6, "grin"], [10.3, "determined"]],
  squash: [[8.9, 0.2], [9.15, 1.25], [9.35, 0.9], [9.55, 1]] });
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const sec = useSec();
  const u = sec - t; if (u < 0 || u > 0.5) return null;
  return <Ball p={[0.7, 0.5, -0.3]} r={0.2 + u * 2.2} c="#fff6c8" outline={0} e="#fff6c8" ei={2} />;
};
const Shot4 = () => (<><Fog /><Orchard /><FallApple /><Veg a={H4} /><Dust p={[0.7, 0, -0.3]} t={8.9} /></>);

// ============================================================ 5. Бежит к огороду
const H5 = hero({ pos: [0.7, 0, -0.3], expr: [[10.95, "determined"], [12.3, "grin"]], walk: [[10.95, 0.7, -0.3], [11.4, 1.3, 0.2], [13.55, 7.6, -0.2]] });
const Shot5 = () => (<><Fog /><Orchard /><Veg a={H5} /></>);

// ============================================================ 6. Охранники — огурец и картошка
const H6 = hero({ pos: [0, 0, 1.6], expr: [[13.55, "determined"], [15.4, "shock"], [17.0, "scared"], [18.4, "shock"]], walk: [[13.55, 3.6, 2.0], [14.7, 1.15, 1.7]] });
const C6 = cuc({ walk: [[16.5, -3.4, -0.5], [17.3, -0.6, -0.5]], expr: [[16.5, "tough"], [18.6, "grin"]], flex: [[18.4, 0], [18.8, 1]] });
const P6 = pot({ walk: [[17.5, 3.6, -0.5], [18.3, 0.65, -0.5]], expr: [[17.5, "tough"], [18.6, "smug"]], flex: [[18.5, 0], [18.9, 1]] });
const Shot6 = () => (<><Fog /><Ogorod /><Veg a={H6} /><Veg a={C6} /><Veg a={P6} /><Dust p={[-0.6, 0, -0.5]} t={17.3} /><Dust p={[0.65, 0, -0.5]} t={18.3} /></>);

// ============================================================ 7. Качалка
const curl = (t0: number, t1: number): Key[] => pulse(t0, t1, 1.1, [-0.42, 0.9], [-0.32, 1.45]);
const C7 = cuc({ pos: [-1.1, 0, -1.4], expr: [[19.15, "tough"], [20.5, "grin"], [22.9, "determined"], [24.4, "grin"]], flex: [[19.15, 1], [21.4, 1], [21.8, 0]], handF: [[19.15, -0.45, 1.75], [21.5, -0.45, 1.75], ...curl(21.8, 25.6)] });
const P7 = pot({ pos: [1.5, 0, -1.8], expr: [[19.15, "smug"], [20.5, "tough"], [23.0, "determined"], [24.4, "grin"]], flex: [[19.15, 1], [21.4, 1], [21.8, 0]],
  handF: [[19.15, -0.48, 1.7], [21.5, -0.48, 1.7], ...pulse(21.9, 25.6, 1.6, [-0.5, 1.45], [-0.5, 2.25])], handB: [[19.15, 0.48, 1.7], [21.5, 0.48, 1.7], ...pulse(21.9, 25.6, 1.6, [0.5, 1.45], [0.5, 2.25])] });
const PotBar: React.FC = () => { const sec = useSec(); if (sec < 21.6) return null; return <InHand a={P7} side="f" off={[0.5, 0, 0]}><Barbell w={1.5} /></InHand>; };
const CucDb: React.FC = () => { const sec = useSec(); if (sec < 21.6) return null; return <InHand a={C7} side="f"><group rotation={[0, Math.PI / 2, 0]}><Dumbbell s={1.2} /></group></InHand>; };
const Shot7 = () => (<><Fog c="#3a3d44" near={8} far={20} /><Gym /><Veg a={C7} /><CucDb /><Veg a={P7} /><PotBar /></>);

// ============================================================ 8–9. Суета: лицом к лицу
const H8 = hero({ pos: [0, 0, 1.4], expr: [[25.55, "determined"], [27.4, "angry"], [28.55, "determined"], [31.1, "determined"], [32.2, "angry"]],
  flex: [[25.55, 0], [26.6, 0], [27.0, 1], [28.2, 1], [28.6, 0], [31.0, 0], [31.4, 1], [33, 1]], squash: [[26.6, 1], [26.75, 0.85], [26.95, 1.08], [27.1, 1]] });
const C8 = cuc({ expr: [[25.55, "tough"], [27.0, "grin"], [32.0, "laugh"]], flex: [[25.55, 1], [33, 1]] });
const P8 = pot({ expr: [[25.55, "smug"], [27.2, "tough"], [32.1, "laugh"]], flex: [[25.55, 0], [26.2, 1], [33, 1]] });
const Shot8 = () => (<><Fog /><Ogorod /><Veg a={H8} /><Veg a={C8} /><Veg a={P8} /><Dust p={[0, 0, 1.4]} t={26.7} n={18} /></>);

// ============================================================ 10. Помидор для салата к плову
const T10 = tom({ pos: [1.9, 0, -1.9], expr: [[33.0, "scared"], [34.4, "shock"], [36.5, "scared"]] });
const C10 = cuc({ expr: [[33, "laugh"], [34.5, "tough"]], flex: [[33, 1], [37.5, 1]] });
const P10 = pot({ expr: [[33, "laugh"], [34.5, "smug"]] });
const H10 = hero({ pos: [0, 0, 1.4], expr: [[33, "determined"], [35.2, "smug"]] });
const Shot10 = () => (<><Fog /><Ogorod /><Veg a={T10} /><Veg a={C10} /><Veg a={P10} /><Veg a={H10} />
  <Table p={[2.9, 0, 0.7]}><Kazan p={[-0.4, 0, 0]} s={1.1} /><SaladBowl p={[0.45, 0, 0.05]} /></Table></>);

// ============================================================ 11. Не какой-то лох
const H11 = hero({ pos: [0, 0, 1.4], expr: [[37.45, "smug"], [38.6, "grin"], [40.2, "smug"]], handF: [[37.45, -0.36, 0.42], [38.5, -0.36, 0.42], [38.8, -0.3, 1.0], [39.6, -0.3, 1.0], [39.9, -0.36, 0.42]], flex: [[40.0, 0], [40.4, 1]] });
const Shot11 = () => (<><Fog /><Ogorod /><Veg a={H11} /><Veg a={cuc({ expr: [[0, "neutral"], [39.4, "shock"]] })} /><Veg a={pot({ expr: [[0, "neutral"], [39.6, "shock"]] })} /></>);

// ============================================================ 12. Компьютерный клуб
const H12 = hero({ pos: [0.72, 0, -1.75], headset: true, expr: [[40.95, "determined"], [43.3, "tough"], [44.4, "laugh"], [45.6, "determined"], [46.6, "laugh"]],
  handF: pulse(40.95, 47.5, 0.18, [-0.5, 0.58], [-0.47, 0.62]), handB: [[40.95, 0.4, 0.6], [44.3, 0.4, 0.6], [44.6, 0.45, 1.05], [45.4, 0.45, 1.05], [45.7, 0.4, 0.6]] });
const ShotClub = () => (<><Fog c="#2a2738" near={8} far={22} /><Club /><Veg a={H12} /></>);

// ============================================================ 13. Качает воздух на районе
const pumpK = pulse(51.4, 54, 0.5, [-0.45, 0.8], [-0.45, 0.55]);
const H13 = hero({ pos: [0, 0, 0.2], expr: [[47.45, "smug"], [48.7, "grin"], [50.2, "tough"], [51.5, "determined"], [52.6, "laugh"]],
  flex: [[47.45, 0], [48.6, 0], [48.9, 1], [50.9, 1], [51.2, 0]], handF: [[47.45, -0.36, 0.42], [48.6, -0.36, 0.42], [48.9, -0.42, 1.05], [50.9, -0.42, 1.05], [51.3, -0.45, 0.8], ...pumpK] });
const PumpInHand: React.FC = () => {
  const sec = useSec();
  if (sec < 51.2) return <group position={[-0.55, 0, 0.45]}><Pump h={0} /></group>;
  const hz = at(sec, pumpK.map((k) => [k[0], k[2]] as [number, number]));
  return <InHand a={H13} side="f" off={[0, 0, 0.02]}><group position={[0, -hz, 0]}><Pump h={(hz - 0.72) / 0.25} /></group></InHand>;
};
const ShotYard = () => (<><Fog c="#d6e6f2" /><Yard /><Veg a={H13} /><PumpInHand /></>);

// ============================================================ 14. Всё зависит от тебя — подписка и лайк
const H14 = hero({ pos: [0, 0, 1.6], expr: [[53.95, "grin"], [55.0, "determined"], [57.2, "happy"], [58.8, "laugh"]],
  handF: [[53.95, -0.36, 0.42], [55.6, -0.36, 0.42], [55.9, -0.2, 0.75], [56.9, -0.2, 0.75], [57.2, -0.36, 0.42]] });
const Shot14 = () => (<><Fog /><Ogorod /><Veg a={H14} /><SubButton p={[-1.35, 1.85, 1.2]} t={57.1} pressed={58.3} /><Like p={[1.35, 1.85, 1.2]} t={58.7} />
  <Veg a={cuc({ expr: [[0, "tough"], [57.5, "shock"]] })} /><Veg a={pot({ expr: [[0, "smug"], [58.8, "shock"]] })} /></>);

// ============================================================ 15. Решить: салат к плову или нет
const H15 = hero({ pos: [-1.5, 0, 0.35], expr: [[60.5, "smug"], [61.4, "neutral"], [62.4, "grin"], [63.5, "happy"], [64.4, "determined"]], handF: [[60.5, -0.3, 0.75], [64.0, -0.3, 0.75], [64.3, -0.36, 0.42]] });
const T15 = tom({ pos: [1.5, 0, 0.3], expr: [[60.5, "scared"], [62.0, "shock"], [63.6, "scared"]] });
const Shot15 = () => (<><Fog /><Ogorod gate={false} /><Table p={[0, 0, 0]}><Kazan p={[-0.45, 0, 0]} s={1.1} /><SaladBowl p={[0.45, 0, 0.05]} /></Table>
  <Veg a={H15} /><Veg a={T15} /><Veg a={cuc({ pos: [-1.0, 0, -2.0], expr: [[0, "tough"]], flex: [[0, 1]] })} /><Veg a={pot({ pos: [1.1, 0, -2.1], expr: [[0, "smug"]] })} /></>);

// ============================================================ 16. Подписывайся ради 2-й части
const wave = (t0: number, t1: number): Key[] => pulse(t0, t1, 0.5, [-0.45, 1.05], [-0.3, 1.2]);
const H16 = hero({ pos: [-0.8, 0, 0.9], expr: [[65.15, "grin"], [66.0, "happy"], [67.4, "laugh"], [69.4, "happy"]], handF: [[65.15, -0.36, 0.42], ...wave(65.6, 71)] });
const Shot16 = () => (<><Fog /><Ogorod /><Part2 p={[0.3, 2.45, 0.2]} t={66.9} /><Like p={[1.5, 1.6, 0.7]} t={68.6} />
  <Veg a={H16} /><Veg a={cuc({ pos: [-2.3, 0, -0.4], flex: [[0, 1]], expr: [[0, "grin"]] })} /><Veg a={pot({ pos: [2.3, 0, -0.5], flex: [[0, 1]], expr: [[0, "grin"]] })} />
  <Veg a={tom({ pos: [0.9, 0, 0.7], expr: [[0, "scared"], [69.6, "shock"]] })} /></>);

// ============================================================ 17. Плов с салатом
const H17 = hero({ pos: [-0.9, 0, 0.55], expr: [[70.9, "happy"], [72.2, "laugh"], [73.6, "happy"]], handF: [[70.9, -0.36, 0.42], [71.5, -0.3, 0.8], [72.0, -0.25, 0.68], [72.5, -0.3, 0.8], [73.0, -0.25, 0.68], [73.5, -0.36, 0.5]] });
const T17 = tom({ pos: [1.4, 0, 0.35], expr: [[70.9, "scared"], [73.4, "shock"]] });
const Shot17 = () => { const sec = useSec(); return (<><Fog /><Ogorod gate={false} /><Table p={[0, 0, -0.1]}><Kazan p={[-0.45, 0, 0]} s={1.1} /><SaladBowl p={[0.45, 0, 0.05]} full={at(sec, [[71.5, 0], [72.4, 1]])} /></Table>
  <Veg a={H17} /><Veg a={T17} /><Veg a={cuc({ pos: [-1.2, 0, -2.0], flex: [[0, 1]], expr: [[0, "grin"]] })} /><Veg a={pot({ pos: [1.2, 0, -2.1], expr: [[0, "laugh"]] })} /></>); };

// ============================================================ монтаж
type Shot = { t0: number; t1: number; el: React.ReactNode };
const S3 = (t0: number, t1: number, cam: CamKey[], body: React.ReactNode, focus: V3 = [0, 1, 0], bg = SKY, light: "outdoor" | "day" | "night" = "outdoor") =>
  ({ t0, t1, el: <Scene3D t0={t0} light={light} bg={bg} cam={cam} focus={focus}>{body}</Scene3D> });
const SHOTS: Shot[] = [
  S3(0, 2.9, orb(0, 2.9, [0, 0.8, 0.55], [3.4, 2.7], [-0.55, 0.35], [1.25, 1.0], 46), <Shot1 />),
  S3(2.9, 5.85, orb(2.9, 5.85, [0.9, 0.72, 0.5], [2.2, 1.55], [0.75, 0.1], [1.0, 0.85], 44), <Shot1 />),
  S3(5.85, 8.55, [C(5.85, [2.3, 1.1, 3.0], [0.7, 2.25, -0.3], 44), C(6.9, [2.1, 1.15, 2.8], [0.7, 2.1, -0.3], 44), C(7.7, [1.9, 0.8, 2.6], [0.7, 0.5, -0.3], 46), C(8.55, [1.7, 0.7, 2.4], [0.7, 0.35, -0.3], 46)], <Shot3 />),
  S3(8.55, 10.95, orb(8.55, 10.95, [0.7, 0.62, -0.3], [2.2, 2.6], [0.9, -0.3], [0.45, 0.75], 46), <Shot4 />),
  S3(10.95, 13.55, [C(10.95, [1.4, 0.9, 3.0], [0.9, 0.65, -0.1], 46), C(12.2, [3.6, 0.9, 2.9], [4.0, 0.7, 0.0], 46), C(13.55, [7.0, 0.95, 2.8], [7.6, 0.7, -0.2], 46)], <Shot5 />),
  S3(13.55, 19.15, [C(13.55, [3.3, 1.3, 4.4], [0.8, 0.9, 0.6], 50), C(15.3, [0.8, 1.05, 4.0], [0, 1.0, -0.3], 50), C(17.2, [-0.6, 0.75, 3.6], [-0.3, 1.3, -0.5], 48), C(19.15, [1.1, 0.6, 4.6], [0.1, 1.35, -0.5], 48)], <Shot6 />),
  S3(19.15, 25.55, orb(19.15, 25.55, [0.2, 1.3, -1.6], [4.4, 3.5], [-0.65, 0.55], [1.7, 1.25], 48), <Shot7 />, [0, 1, -1.6], "#3a3d44", "day"),
  S3(25.55, 28.55, orb(25.55, 28.55, [0, 0.85, 0.45], [3.5, 3.1], [-1.05, 0.95], [0.5, 0.42], 50), <Shot8 />),
  S3(28.55, 33.0, [C(28.55, [0.9, 0.8, 4.8], [0, 1.25, -0.3], 46), C(30.8, [0.6, 0.75, 4.4], [0, 1.3, -0.3], 45), C(33.0, [0.4, 0.7, 4.1], [0, 1.35, -0.3], 44)], <Shot8 />),
  S3(33.0, 37.45, [C(33.0, [2.8, 1.25, 2.4], [1.9, 0.75, -1.9], 46), C(34.6, [3.3, 1.3, 2.9], [2.5, 0.85, -0.2], 46), C(36.0, [3.8, 1.35, 3.0], [2.9, 0.9, 0.7], 44), C(37.45, [3.5, 1.25, 2.5], [2.9, 0.85, 0.7], 42)], <Shot10 />),
  S3(37.45, 40.95, orb(37.45, 40.95, [0, 0.78, 1.4], [2.3, 1.9], [0.75, -0.45], [0.95, 0.85], 44), <Shot11 />),
  S3(40.95, 47.45, [C(40.95, [-2.6, 1.35, 0.6], [-0.8, 1.05, -2.2], 48), C(43.5, [-0.4, 1.2, 0.3], [0.5, 0.95, -1.9], 46), C(45.5, [0.9, 1.1, 0.1], [0.6, 0.9, -1.9], 44), C(47.45, [1.5, 1.15, 0.6], [0.6, 0.95, -1.9], 46)], <ShotClub />, [0.7, 1, -1.8], "#1d1b26", "day"),
  S3(47.45, 53.95, orb(47.45, 53.95, [0, 0.72, 0.2], [3.1, 2.4], [-0.85, 0.65], [1.15, 0.8], 46), <ShotYard />, [0, 0.8, 0.2], "#9fd0f2"),
  S3(53.95, 60.5, [C(53.95, [0, 1.1, 5.3], [0, 1.2, 1.4], 46), C(56.5, [0.25, 1.1, 4.7], [0, 1.15, 1.4], 46), C(58.5, [-0.25, 1.25, 4.6], [0, 1.35, 1.4], 48), C(60.5, [-0.4, 1.35, 4.9], [0, 1.45, 1.4], 48)], <Shot14 />),
  S3(60.5, 65.15, orb(60.5, 65.15, [0, 0.95, 0], [3.8, 3.1], [-0.55, 0.5], [1.7, 1.3], 46), <Shot15 />),
  S3(65.15, 70.9, [C(65.15, [0.5, 0.85, 4.9], [0, 1.2, 0.4], 48), C(68.0, [0.0, 1.2, 5.2], [0, 1.5, 0.3], 50), C(70.9, [-0.5, 1.6, 5.6], [0, 1.65, 0.2], 50)], <Shot16 />),
  S3(70.9, 76.2, [...orb(70.9, 74.5, [0, 0.95, 0], [3.0, 3.4], [0.5, -0.3], [1.3, 1.5], 46, 5), C(76.2, [-0.6, 2.4, 5.0], [0, 1.2, 0], 50)], <Shot17 />),
];

// вспышка при превращении (поверх кадра)
const WhiteFlash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [WARP(8.75) * FPS, WARP(8.9) * FPS, WARP(9.25) * FPS], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: "#fffbe8", opacity: o }} /> : null;
};

export const TOTAL = Math.round(WARP(SHOTS[SHOTS.length - 1].t1) * FPS);
export const Video: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={Math.round(WARP(s.t0) * FPS)} durationInFrames={Math.round(WARP(s.t1) * FPS) - Math.round(WARP(s.t0) * FPS)}>{s.el}</Sequence>
      ))}
      <WhiteFlash />
      <Audio src={staticFile(IS_EN ? "voice_en.mp3" : "voice_ru.mp3")} />
      <Audio src={staticFile("music.mp3")} loop
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 0.1, 0.1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
