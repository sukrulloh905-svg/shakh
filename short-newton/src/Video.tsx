// РОЛИК «Что, если я попал во времена Ньютона?» — 16:9, ~2:27. Всё время — в секундах ГОЛОСА.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import plan from "./plan.json";
import { FPS, Scene3D, Box, Ball, Apple, Sign, Doodle, Held, Actor, Key, pointKeys, bonkAt, useSec, at, V3, REST_F, REST_B, CamKey } from "./kit";
import { Garden, Street, Kitchen, Study, Bookshop, Cat, Bird, Fridge, Briefcase, Book } from "./places";
import type { Look } from "./doodle";

// Шрифт субтитров — локальный файл (Google Fonts в этом окружении недоступен из браузера рендера)
const fontFamily = "MontserratBlack";
if (typeof document !== "undefined" && !(document as any).__mfont) {
  (document as any).__mfont = true;
  const h = delayRender("font");
  new FontFace(fontFamily, `url(${staticFile("fonts/Montserrat-Black.ttf")})`, { weight: "900" }).load()
    .then((f) => { (document.fonts as any).add(f); continueRender(h); }).catch(() => continueRender(h));
}

// ===================================================================== персонажи
const ME_LOOK: Look = { body: "#1f1f24", hair: "curly", glasses: "round", hoodie: true, shorts: "#5b80aa", shoes: "#e23a3a" };
const NEWTON_LOOK: Look = { body: "#2b2724", hair: "wig", hairColor: "#e6e3dc", glasses: "small", cravat: true, coat: true };
const NEIGHBOR: Look = { body: "#4a7fc1", hair: "slick", tie: "#c0392b" };
const GRANNY: Look = { body: "#b5587a", hair: "bowl", hairColor: "#cfcfcf", kerchief: "#e8b23a" };
const SCIENTIST: Look = { body: "#f4f4ef", hair: "slick", hairColor: "#8a8a8a", glasses: "round", tie: "#2f6fd6" };
const KID1: Look = { body: "#e46b2b", hair: "spiky", shorts: "#2f4fa8", shoes: "#ffffff" };
const KID2: Look = { body: "#3f8a4b", hair: "bowl", hairColor: "#6b3f22", shorts: "#2a2d33", shoes: "#f2c230" };

const me = (o: Partial<Actor>): Actor => ({ pos: [0.6, 0, -0.6], seed: 1, look: ME_LOOK, expr: [[0, "neutral"]], ...o });
// Ньютон сидит под яблоней (таз низко), левой рукой держит тетрадь на коленях, правой пишет
const NPOS: V3 = [-0.75, 0, -1.05];
const SIT_F: Key[] = [[0, -0.12, 0.3]];
const writing = (t0: number, t1: number): Key[] => {
  const k: Key[] = [];
  for (let t = t0, i = 0; t < t1; t += 0.33, i++) k.push([t, i % 2 ? 0.17 : 0.09, i % 2 ? 0.31 : 0.34]);
  return k;
};
const newton = (o: Partial<Actor>): Actor => ({ pos: NPOS, seed: 7, look: NEWTON_LOOK, hip: 0.18, handF: SIT_F, expr: [[0, "focus"]], ...o });
const NewtonBook: React.FC<{ a: Actor; turn?: number }> = ({ a, turn = -1 }) => {
  const sec = useSec();
  const pg = turn > 0 ? Math.max(0, Math.min(1, (sec - turn) / 0.5)) : 0;
  return (
    <Held a={a} side="f" off={[0.14, 0.0, 0.03]}>
      <group rotation={[-1.0, 0, 0]}>
        <Box p={[0, 0, 0]} s={[0.36, 0.25, 0.02]} c="#5a3d22" />
        <Box p={[0, 0, 0.012]} s={[0.34, 0.23, 0.01]} c="#f3ead2" line={false} />
        {pg > 0 && pg < 1 ? <group position={[0, 0, 0.02]} rotation={[0, pg * Math.PI, 0]}><Box p={[0.085, 0, 0]} s={[0.17, 0.23, 0.004]} c="#fbf6e6" line={false} /></group> : null}
        {[-0.06, -0.02, 0.02, 0.06].map((y) => <Box key={y} p={[0.08, y, 0.018]} s={[0.12, 0.006, 0.002]} c="#3a3a5a" line={false} />)}
      </group>
    </Held>
  );
};
const Quill: React.FC<{ a: Actor }> = ({ a }) => (
  <Held a={a} side="b" off={[0.02, 0.06, 0.02]}><Box p={[0, 0, 0]} s={[0.015, 0.18, 0.015]} c="#f6f3ea" rot={[0, 0, -0.5]} line={false} /></Held>
);

// позиция предмета в мире по ключам [[сек, x, y, z], …]
const P3 = (sec: number, keys: [number, number, number, number][]): V3 => [1, 2, 3].map((i) => at(sec, keys.map((k) => [k[0], k[i]] as [number, number]))) as V3;

// ===================================================================== шоты
const SKY = "#a9d4f5";
type Shot = { t0: number; t1: number; el: React.ReactNode };

// 1. Улица 2026: ты с надкушенным яблоком, над головой пролетает сосед
const S1_me = me({ pos: [0, 0, -1.3], expr: [[0, "nervous"], [0.8, "realize"], [1.5, "grin"], [2.8, "shock"], [3.6, "nervous"]], handB: [[0, 0.28, 0.72]] });
const S1_nb: Actor = { pos: [0, 0, -0.6], seed: 3, look: NEIGHBOR, expr: [[0, "proud"], [2.5, "grin"]], walk: [[0, -4.5, -0.6], [4.7, 3.5, -0.6]], rise: [[0, 1.35, 0]], bob: 0.08, handF: [[0, -0.3, 0.55]] };
const Shot1 = () => (<>
  <Street />
  <Doodle a={S1_me} /><Held a={S1_me} side="b"><Apple p={[0, 0.03, 0]} kind="bitten" s={1.3} /></Held>
  <Doodle a={S1_nb} /><Held a={S1_nb} side="f"><Briefcase /></Held>
</>);

// 2a. Сад 1666: ты появляешься, табличка «1666», «Кембридж закрыт — чума»
const S2_me = me({ pos: [1.0, 0, -0.4], hidden: [[0, 5.05]], expr: [[4.7, "shock"], [5.9, "realize"], [7.3, "nervous"], [8.3, "shock"], [9.4, "nervous"]], handF: pointKeys(8.7, -0.9, 0.6, 1.0, "f") });
const S2_n = newton({ expr: [[4.7, "focus"], [7.0, "blank"], [8.6, "focus"]], handB: writing(4.7, 10.2) });
const Shot2a = () => (<><Garden signBonk={6.3} plagueBonk={8.3} /><Doodle a={S2_me} /><Doodle a={S2_n} /><NewtonBook a={S2_n} /><Quill a={S2_n} /></>);

// 2b. Ньютон от скуки придумывает математику — над головой всплывают формулы
const S2b_n = newton({ expr: [[10.1, "focus"], [11.2, "blank"], [12.3, "stern"], [13.3, "smug"], [14.6, "proud"], [15.6, "focus"]], handB: writing(10.1, 16.5) });
const S2b_me = me({ pos: [0.55, 0, -0.55], expr: [[10.1, "blank"], [11.2, "grin"], [12.3, "neutral"], [13.5, "realize"], [15.1, "smug"]] });
const Formula: React.FC<{ t: number; p: V3; text: string }> = ({ t, p, text }) => {
  const sec = useSec();
  if (sec < t) return null;
  return <group position={[p[0], p[1] + Math.sin(sec * 1.5 + t) * 0.03, p[2]]} scale={bonkAt(sec, t, 0.5)}><Sign p={[0, 0, 0]} w={0.5} h={0.2} text={text} bg="#fbf6e6" fg="#2a2d6a" glow={0.3} sz={62} /></group>;
};
const Shot2b = () => (<>
  <Garden /><Doodle a={S2b_n} /><NewtonBook a={S2b_n} /><Quill a={S2b_n} /><Doodle a={S2b_me} />
  <Formula t={13.5} p={[-1.15, 1.35, -0.95]} text="x²+y²=r²" />
  <Formula t={14.1} p={[-0.55, 1.55, -0.95]} text="∫ f(x)dx" />
  <Formula t={14.6} p={[-0.2, 1.25, -0.95]} text="dy/dx" />
</>);

// 3a. Сад, коровы, тишина. Ньютон пишет на коленке
const S3_n = newton({ expr: [[16.4, "focus"], [18.0, "blank"], [19.2, "focus"], [20.4, "stern"], [21.4, "focus"]], handB: writing(16.4, 25.6) });
const S3_me = me({ pos: [0.75, 0, -0.5], expr: [[16.4, "grin"], [18.0, "smug"], [19.6, "neutral"], [21.4, "blank"], [22.5, "holdlaugh"], [23.3, "proud"], [24.2, "grin"]],
  handB: [[16.4, ...REST_B], [23.9, ...REST_B], [24.1, 0.16, 0.72], [24.6, 0.16, 0.72], [24.8, ...REST_B]] });
const Shot3 = () => (<><Garden /><Doodle a={S3_n} /><NewtonBook a={S3_n} /><Quill a={S3_n} /><Doodle a={S3_me} /></>);

// 4. Бух! Яблоко падает рядом с Ньютоном
const APPLE_GROUND: V3 = [-0.2, 0.06, -0.8];
const FallingApple: React.FC = () => {
  const sec = useSec();
  const y = sec < 25.65 ? 2.3 : sec < 25.95 ? 2.3 - (2.24 * Math.pow((sec - 25.65) / 0.3, 2)) : 0.06 + Math.abs(Math.sin((sec - 25.95) * 9)) * 0.12 * Math.exp(-(sec - 25.95) * 5);
  const s = bonkAt(sec, 27.4, 0.5) * bonkAt(sec, 28.7, 0.4);
  return <Apple p={[APPLE_GROUND[0], y, APPLE_GROUND[2]]} s={1.3 * s} />;
};
const S4_me = me({ pos: [0.6, 0, -0.55], expr: [[25.47, "neutral"], [25.8, "shock"], [27.0, "realize"], [28.1, "grin"], [29.8, "proud"], [30.9, "laugh"]], handF: pointKeys(27.4, -0.8, -0.5, 1.4, "f") });
const S4_n = newton({ expr: [[25.47, "focus"], [26.4, "blank"], [27.6, "focus"], [29.4, "stern"], [30.6, "focus"]], handB: writing(25.47, 32.1) });
const Shot4 = () => (<><Garden /><FallingApple /><Doodle a={S4_n} /><NewtonBook a={S4_n} /><Quill a={S4_n} /><Doodle a={S4_me} /></>);

// 5. Ньютон даже не поднимает головы (крупно)
const S5_n = newton({ expr: [[31.97, "focus"], [32.9, "blank"], [33.9, "focus"]], handB: writing(31.97, 34.7) });
const S5_me = me({ pos: [0.6, 0, -0.55], expr: [[31.97, "nervous"], [33.0, "stern"]] });
const Shot5 = () => (<><Garden /><Apple p={APPLE_GROUND} s={1.3} /><Doodle a={S5_n} /><NewtonBook a={S5_n} /><Quill a={S5_n} /><Doodle a={S5_me} /></>);

// 6. Машешь, кашляешь, тычешь пальцем, «Сэр! Яблоко! Упало!», свистишь в ухо, он чешет парик
const S6_me = me({ pos: [0.35, 0, -0.6],
  expr: [[34.56, "grin"], [35.6, "nervous"], [36.2, "stern"], [36.9, "shout"], [38.5, "nervous"], [39.6, "blank"], [41.0, "shock"], [41.9, "stern"]],
  handF: [[34.56, ...REST_F], [34.75, -0.36, 1.08], [34.95, -0.26, 1.2], [35.15, -0.36, 1.08], [35.35, -0.26, 1.2], [35.55, -0.24, 0.86], [35.9, -0.24, 0.86], [36.0, ...REST_F],
    ...pointKeys(36.4, -0.9, -0.5, 1.9, "f").slice(1)],
  handB: [[34.56, ...REST_B], [34.75, 0.36, 1.08], [34.95, 0.26, 1.2], [35.15, 0.36, 1.08], [35.35, 0.26, 1.2], [35.55, ...REST_B]],
  lean: [[35.5, 0, 0], [35.65, 0.18, 0], [35.85, 0, 0], [36.0, 0.15, 0], [36.2, 0, 0]],
  talk: [[36.9, 38.3]], walk: [[39.2, 0.35, -0.6], [39.6, -0.3, -0.85], [40.8, -0.3, -0.85], [41.2, 0.35, -0.6]] });
const S6_n = newton({ expr: [[34.56, "focus"], [36.0, "blank"], [37.3, "focus"], [38.5, "blank"], [39.6, "focus"], [41.4, "stern"], [42.4, "focus"]],
  handB: [...writing(34.56, 41.2), [41.4, 0.36, 0.86], [41.6, 0.31, 0.92], [41.8, 0.36, 0.86], [42.0, 0.31, 0.92], [42.2, 0.36, 0.86], ...writing(42.5, 43.1)] });
const Shot6 = () => (<><Garden /><Apple p={APPLE_GROUND} s={1.3} /><Doodle a={S6_n} /><NewtonBook a={S6_n} /><Doodle a={S6_me} /></>);

// 7. Кладёшь яблоко на тетрадку — он отодвигает его, как муху
const S7_me = me({ pos: [0.2, 0, -0.6], expr: [[42.93, "smug"], [44.3, "proud"], [45.6, "realize"], [46.1, "shock"], [47.0, "blank"]],
  handF: [[42.93, -0.25, 0.6], [43.3, -0.45, 0.5], [44.1, -0.55, 0.42], [44.4, ...REST_F]] });
const S7_n = newton({ expr: [[42.93, "focus"], [44.3, "blank"], [45.3, "stern"], [46.4, "focus"], [47.4, "blank"]],
  handB: [...writing(42.93, 45.4), [45.6, 0.2, 0.44], [46.1, -0.32, 0.42], [46.4, 0.12, 0.33], ...writing(46.6, 48.3)] });
const Apple7: React.FC = () => {
  const sec = useSec();
  if (sec < 44.15) return <Held a={S7_me} side="f"><Apple p={[0, 0.02, 0]} s={1.3} /></Held>;
  return <Apple s={1.3} p={P3(sec, [[44.15, -0.72, 0.4, -0.93], [45.75, -0.72, 0.4, -0.93], [46.1, -1.15, 0.38, -0.9], [46.4, -1.3, 0.06, -0.8]])} />;
};
const Shot7 = () => (<><Garden /><Apple7 /><Doodle a={S7_n} /><NewtonBook a={S7_n} /><Quill a={S7_n} /><Doodle a={S7_me} /></>);

// 8. Подкидываешь яблоко перед носом — он переворачивает страницу
const S8_me = me({ pos: [0.3, 0, -0.5], expr: [[48.13, "grin"], [49.7, "smug"], [50.5, "laugh"], [51.7, "realize"], [52.7, "stern"]], handF: [[48.13, -0.3, 0.6], [48.6, -0.62, 0.8]] });
const S8_n = newton({ expr: [[48.13, "focus"], [50.5, "blank"], [51.7, "focus"], [52.7, "blank"]], handB: [...writing(48.13, 51.6), [51.9, 0.16, 0.36], ...writing(52.6, 54)] });
const Apple8: React.FC = () => {
  const sec = useSec();
  const ph = sec > 48.9 && sec < 52.1 ? ((sec - 48.9) / 0.6) % 1 : 0;
  return <Held a={S8_me} side="f" off={[0, 0.03 + Math.sin(ph * Math.PI) * 0.45, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held>;
};
const Shot8 = () => (<><Garden /><Apple8 /><Doodle a={S8_n} /><NewtonBook a={S8_n} turn={51.9} /><Quill a={S8_n} /><Doodle a={S8_me} /></>);

// 9. Роняешь яблоко ему на голову — он ловит, не глядя, и кладёт в корзину
const S9_me = me({ pos: [-0.05, 0, -0.75], expr: [[53.82, "smug"], [54.3, "grin"], [55.2, "realize"], [56.0, "shock"], [57.2, "blank"]], handF: [[53.82, -0.3, 0.7], [54.0, -0.62, 1.25], [54.6, -0.62, 1.25], [54.9, ...REST_F]] });
const S9_n = newton({ expr: [[53.82, "focus"], [55.2, "blank"], [56.0, "focus"], [57.4, "smug"]], handB: [...writing(53.82, 55.5), [55.85, 0.05, 1.05], [56.3, 0.05, 1.05], [57.2, 0.75, 0.38], [57.7, 0.75, 0.38], [58.0, 0.12, 0.33], ...writing(58.2, 58.8)] });
const Apple9: React.FC = () => {
  const sec = useSec();
  if (sec < 54.3) return <Held a={S9_me} side="f" off={[0, 0.03, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held>;
  if (sec < 55.85) return <Apple s={1.3} p={P3(sec, [[54.3, -0.78, 1.28, -0.72], [55.15, -0.75, 1.07, -0.95], [55.4, -0.75, 1.15, -0.95], [55.85, -0.72, 1.1, -0.95]])} />;
  if (sec < 57.6) return <Held a={S9_n} side="b" off={[0, 0.04, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held>;
  return <Apple p={[0.05, 0.36, -0.95]} />;
};
const Shot9 = () => (<><Garden /><Apple9 /><Doodle a={S9_n} /><NewtonBook a={S9_n} /><Doodle a={S9_me} /></>);

// 10. Ну и ладно — достаёшь яблоко из корзины, откусываешь, уходишь
const S10_me = me({ pos: [0.65, 0, -0.6], expr: [[58.65, "stern"], [59.0, "smug"], [59.7, "grin"], [61.0, "laugh"], [61.6, "proud"]],
  handF: [[58.65, ...REST_F], [58.8, -0.4, 0.78], [59.3, -0.4, 0.78], [59.5, ...REST_F], [60.0, -0.58, 0.4], [60.3, -0.58, 0.4], [60.6, -0.3, 0.6], [61.0, -0.3, 0.9], [61.4, -0.3, 0.9], [61.7, -0.25, 0.6]],
  handB: [[58.65, ...REST_B], [58.8, 0.4, 0.78], [59.3, 0.4, 0.78], [59.5, ...REST_B]],
  walk: [[61.7, 0.65, -0.6], [63.2, 3.6, -0.3]] });
const S10_n = newton({ expr: [[58.65, "focus"], [60.0, "blank"], [61.2, "focus"], [62.3, "stern"]], handB: writing(58.65, 63.3) });
const Apple10: React.FC = () => {
  const sec = useSec();
  if (sec < 60.15) return <Apple p={[0.05, 0.36, -0.95]} />;
  return <Held a={S10_me} side="f" off={[0, 0.03, 0]}><Apple p={[0, 0, 0]} s={1.3} kind={sec > 61.2 ? "bitten" : "whole"} /></Held>;
};
const Shot10 = () => (<><Garden /><Apple10 /><Doodle a={S10_n} /><NewtonBook a={S10_n} /><Quill a={S10_n} /><Doodle a={S10_me} /></>);

// 11. Вспышка — 2026. Выходишь из подъезда… и замираешь
const S11_me = me({ pos: [-2.6, 0, -3.5], hidden: [[0, 63.9]], expr: [[63.16, "proud"], [64.2, "grin"], [65.7, "smug"], [66.3, "blank"], [67.0, "shock"]],
  walk: [[64.0, -2.6, -3.4], [66.6, -1.4, -1.6]], handB: [[0, 0.26, 0.62]] });
const S11_nb: Actor = { pos: [1.5, 0, -2.4], seed: 3, look: NEIGHBOR, expr: [[63, "smug"], [65.5, "grin"]], rise: [[0, 2.6, 0]], bob: 0.1, walk: [[63, 2.5, -2.4], [68.3, 0.5, -2.4]] };
const Shot11 = () => (<><Street /><Doodle a={S11_me} /><Held a={S11_me} side="b"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held><Doodle a={S11_nb} /></>);

// 12. Сосед летит на работу, машины висят, бабушка с холодильником, птицы пешком
const S12_me = me({ pos: [-1.3, 0, -1.3], expr: [[68.23, "shock"], [69.0, "realize"], [70.4, "shock"], [71.9, "nervous"], [73.7, "shock"], [74.8, "realize"], [75.7, "holdlaugh"], [76.4, "laugh"]],
  handB: [...pointKeys(73.5, 0.9, 0.8, 0.9, "b"), ...pointKeys(75.7, 0.6, -0.5, 0.8, "b").slice(1)], handF: [[0, -0.26, 0.6]] });
const S12_nb: Actor = { pos: [0, 0, -0.6], seed: 3, look: NEIGHBOR, expr: [[68, "proud"], [69.5, "grin"], [71, "smug"]], walk: [[68.2, -4.5, -0.7], [72.8, 4.5, -0.7]], rise: [[0, 1.85, 0]], bob: 0.08, handF: [[0, -0.3, 0.55]] };
const S12_gr: Actor = { pos: [1.6, 0, -1.6], seed: 5, look: GRANNY, expr: [[68, "neutral"], [72.5, "smug"], [73.7, "proud"], [75.0, "grin"], [76.3, "smug"]], walk: [[72.0, 3.6, -1.6], [76.97, 1.5, -1.6]], handB: [[0, 0.26, 1.3]] };
const Birds: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec();
  const u = Math.max(0, sec - t0);
  return (<>
    <Bird p={[0.9 - u * 0.25, 0.12, -0.9]} hop={Math.abs(Math.sin(u * 7)) * 0.04} dir={-1} />
    <Bird p={[1.4 - u * 0.25, 0.12, -1.1]} hop={Math.abs(Math.sin(u * 7 + 1)) * 0.04} dir={-1} />
  </>);
};
const Shot12 = () => (<>
  <Street /><Doodle a={S12_me} /><Held a={S12_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held>
  <Doodle a={S12_nb} /><Held a={S12_nb} side="f"><Briefcase /></Held>
  <Doodle a={S12_gr} /><Held a={S12_gr} side="b" off={[-0.1, 0.03, -0.05]}><Fridge s={1.35} p={[0, 0, 0]} /></Held>
  <Birds t0={70} />
</>);

// 13. Кухня: чай вылетает из кружки, ты гоняешься с ложкой, кот спит на потолке
const teaPos = (sec: number): V3 => sec < 78.1 ? [0.1, 0.85, 0.45] : sec < 78.7
  ? [0.1, 0.85 + (sec - 78.1) * 0.9, 0.45]
  : [0.2 + Math.sin((sec - 78.7) * 1.4) * 1.1, 1.4 + Math.sin(sec * 2.3) * 0.12, -0.1 + Math.cos((sec - 78.7) * 1.1) * 0.3];
const S13_me = me({ pos: [-1.0, 0, -0.5], expr: [[76.97, "nervous"], [77.5, "stern"], [78.1, "shock"], [79.4, "stern"], [80.3, "nervous"], [81.4, "realize"], [82.0, "shock"]],
  walk: [[79.0, -1.0, -0.5], [79.7, 0.6, -0.55], [80.4, 1.1, -0.6], [81.1, -0.4, -0.7], [81.8, -0.9, -0.6]],
  handB: [[76.97, ...REST_B], [79.2, 0.34, 1.0], [79.5, 0.42, 1.15], [79.8, 0.34, 1.0], [80.1, 0.42, 1.15], [80.4, 0.34, 1.0], [80.7, 0.42, 1.15], [81.0, 0.34, 1.0]] });
const Tea: React.FC = () => {
  const sec = useSec();
  const p = teaPos(sec);
  return (<>
    <group position={[0.1, 0.77, 0.45]}><Box p={[0, 0.06, 0]} s={[0.12, 0.13, 0.12]} c="#d64545" /></group>
    {sec > 78.1 ? <Ball p={p} r={0.09} c="#a0522d" sx={1 + Math.sin(sec * 9) * 0.15} sy={1 - Math.sin(sec * 9) * 0.15} outline={0.08} /> : null}
  </>);
};
const Spoon: React.FC<{ a: Actor }> = ({ a }) => <Held a={a} side="b" off={[0, 0.08, 0]}><Box p={[0, 0, 0]} s={[0.025, 0.24, 0.02]} c="#c9ccd1" metal={0.6} /><Ball p={[0, 0.13, 0]} r={0.035} c="#c9ccd1" sy={1.3} /></Held>;
const Shot13 = () => (<><Kitchen /><Tea /><Doodle a={S13_me} /><Spoon a={S13_me} /><Cat p={[1.4, 2.96, -0.8]} rot={[Math.PI, 0.4, 0]} sleep /></>);

// 14. Телевизор: учёный «Почему предметы иногда падают — неизвестно» и уплывает из кадра
const S14_me = me({ pos: [0.55, 0, -0.95], expr: [[82.95, "blank"], [84.5, "realize"], [85.6, "stern"], [86.8, "blank"], [88.1, "shock"], [89.0, "holdlaugh"]] });
const S14_sc: Actor = { pos: [0, 0, 0], seed: 9, face: 0, look: SCIENTIST, expr: [[82.95, "stern"], [84.5, "realize"], [85.6, "nervous"], [86.8, "blank"], [88.1, "shock"]], talk: [[84.0, 87.4]], rise: [[87.6, 0, 0], [89.7, 2.3, 0]], bob: 0.02 };
const Shot14 = () => (<>
  <Kitchen /><group position={[0.1, 0.77, 0.45]}><Box p={[0, 0.06, 0]} s={[0.12, 0.13, 0.12]} c="#d64545" /></group>
  <Cat p={[1.4, 2.96, -0.8]} rot={[Math.PI, 0.4, 0]} sleep />
  <group position={[2.0, 1.38, -1.83]} scale={0.36}><Doodle a={S14_sc} /></group>
  <Doodle a={S14_me} />
</>);

// 15a. Выглядываешь в окно
const S15_me = me({ pos: [-2.3, 0, 0.1], expr: [[89.74, "blank"], [90.6, "realize"]] });
const Shot15a = () => (<><Kitchen /><Doodle a={S15_me} /></>);
// 15b. Двор: мальчишки смотрят на мяч, который улетел ещё в пятницу
const S15_k1: Actor = { pos: [0.4, 0, -1.3], seed: 11, look: KID1, expr: [[91, "grin"], [92.4, "proud"], [92.9, "nervous"], [94.2, "blank"], [95.3, "stern"]], handB: pointKeys(93.1, 0.4, 1.0, 1.6, "b") };
const S15_k2: Actor = { pos: [1.5, 0, -1.6], seed: 12, look: KID2, expr: [[91, "smug"], [92.9, "realize"], [93.9, "nervous"], [95.0, "blank"]] };
const Ballon: React.FC = () => { const sec = useSec(); return <Ball p={[1.1 + Math.sin(sec * 0.4) * 0.3, 3.4 + Math.sin(sec * 0.9) * 0.2, -2.2]} r={0.25} c="#ffffff" outline={0.08} />; };
const Shot15b = () => (<><Street /><Doodle a={S15_k1} /><Doodle a={S15_k2} /><Ballon /></>);

// 16. Как такое возможно? Яблоки ведь падали и до Ньютона
const S16_me = me({ pos: [0, 0, -1.3], expr: [[96.45, "realize"], [97.0, "nervous"], [98.3, "blank"], [99.1, "realize"]], handF: [[96.45, -0.26, 0.6], [97.7, -0.28, 0.82]] });
const Shot16 = () => (<><Street /><Doodle a={S16_me} /><Held a={S16_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held></>);

// 17. Кот при тебе сидит смирно; стоит выйти — на столе бардак
const S17_me = me({ pos: [-0.9, 0, -0.3], expr: [[100.21, "smug"], [101.3, "grin"], [102.5, "proud"], [103.4, "smug"]], walk: [[103.4, -0.9, -0.3], [104.0, -3.0, 0.3]], hidden: [[104.0, 999]] });
const Shot17Inner: React.FC = () => {
  const sec = useSec();
  const mess = Math.max(0, Math.min(1, (sec - 104.1) / 0.5));
  const jump = sec > 104.0 && sec < 104.6 ? Math.sin(((sec - 104.0) / 0.6) * Math.PI) * 0.35 : 0;
  return (<><Kitchen mess={mess} /><Cat p={[0.2 + (sec > 104 ? 0.15 : 0), 0.77 + jump, 0.2]} rot={[0, sec > 104.3 ? 2.6 : -0.6, 0]} /><Doodle a={S17_me} /></>);
};

// 18. Гравитация как кот: ведёт себя прилично, пока за ней следят
const S18_me = me({ pos: [-0.8, 0, -0.2], expr: [[105.72, "smug"], [106.2, "realize"], [107.4, "stern"], [108.5, "smug"], [109.3, "stern"], [110.2, "blank"], [110.8, "nervous"]],
  handB: pointKeys(109.3, 0.9, 0.3, 0.7, "b") });
const Shot18Inner: React.FC = () => {
  const sec = useSec();
  const fl = at(sec, [[105.72, 1], [109.25, 1], [109.5, 0], [110.0, 0], [110.6, 1]]);
  return (<><Kitchen mess={1} floatAmt={fl} /><Cat p={[0.35, 0.77 + fl * 0.4, 0.2]} rot={[0, -0.6, fl * 0.3]} /><Doodle a={S18_me} /></>);
};

// 19. Кабинет Ньютона: яблоко и Луну тянет одна сила; «Начала» (1687); полёты к Луне, спутники
const S19_n: Actor = { pos: [-0.6, 0, -0.85], seed: 7, look: NEWTON_LOOK, expr: [[111.87, "blank"], [112.7, "realize"], [113.5, "proud"], [114.8, "smug"], [115.6, "grin"], [117.2, "proud"], [118.7, "shock"], [120.0, "laugh"], [121.3, "proud"]],
  handF: [[111.87, ...REST_F], [112.6, -0.32, 0.82]], handB: pointKeys(113.6, 0.8, 1.0, 1.4, "b") };
const Shot19Inner: React.FC = () => {
  const sec = useSec();
  return (<>
    <Study year={sec < 115.6 ? "1666" : "1687"} yearBonk={115.6} bookBonk={117.2} showBook={sec > 117.1} rocket={118.6} sat={120.7} />
    <Doodle a={S19_n} /><Held a={S19_n} side="f"><Apple p={[0, 0.03, 0]} s={1.3} /></Held>
  </>);
};

// 20. В этом мире книги нет: пустая полка «Начал», вещи всплывают
const S20_me = me({ pos: [-0.75, 0, -0.55], expr: [[122.42, "blank"], [123.3, "realize"], [123.9, "nervous"], [125.2, "shock"], [126.1, "nervous"]], handB: pointKeys(123.3, 0.8, 0.3, 1.2, "b") });
const Shot20Inner: React.FC = () => {
  const sec = useSec();
  return (<><Bookshop tagBonk={123.5} floatAmt={at(sec, [[124.9, 0], [125.6, 1]])} /><Doodle a={S20_me} /></>);
};

// 21–22. Достаёшь огрызок, разжимаешь пальцы — вниз падает только он
const S21_me = me({ pos: [0, 0, -1.2], expr: [[127.02, "smug"], [128.1, "proud"], [128.8, "realize"], [129.8, "stern"], [130.5, "nervous"], [131.99, "nervous"], [132.5, "shock"], [133.5, "realize"], [134.7, "blank"]],
  handF: [[127.02, ...REST_F], [127.3, -0.14, 0.42], [127.6, -0.14, 0.42], [128.0, -0.3, 0.86]] });
const CORE_FALL: [number, number, number, number][] = [[131.0, -0.3, 0.9, -1.13], [132.5, -0.3, 0.05, -1.13]];
const Core: React.FC = () => {
  const sec = useSec();
  if (sec < 127.6) return null;
  if (sec < 131.0) return <Held a={S21_me} side="f" off={[0, 0.04, 0]}><Apple p={[0, 0, 0]} kind="core" s={1.4} /></Held>;
  const u = Math.min(1, (sec - 131.0) / 1.5);
  const y = 0.9 - 0.85 * u * u;
  return <Apple p={[-0.3, y, -1.13]} kind="core" s={1.4 * bonkAt(sec, 132.5, 0.4)} rot={u * 2.5} />;
};
const S22_nb: Actor = { pos: [0, 0, -2.2], seed: 3, look: NEIGHBOR, expr: [[131, "grin"], [133, "proud"]], walk: [[131.9, 3.5, -2.2], [135.9, -2.5, -2.2]], rise: [[0, 2.2, 0]], bob: 0.1 };
const Shot21 = () => (<><Street /><Doodle a={S21_me} /><Core /></>);
const Shot22 = () => (<><Street /><Doodle a={S21_me} /><Core /><Doodle a={S22_nb} /><Birds t0={128} /></>);

// 23. А ты бы вернул яблоко Ньютону? — Ньютон в 2026 году
const S23_me = me({ pos: [-0.35, 0, -1.25], expr: [[135.89, "grin"], [136.6, "smug"], [137.4, "nervous"], [138.3, "grin"]], handB: [[135.89, ...REST_B], [136.5, 0.45, 0.62]] });
const S23_n: Actor = { pos: [0.75, 0, -1.35], seed: 7, look: NEWTON_LOOK, expr: [[135.89, "realize"], [137.0, "stern"], [138.0, "blank"], [138.8, "shock"]], rise: [[0, 0.12, 0]], bob: 0.05 };
const Shot23 = () => (<><Street /><Doodle a={S23_me} /><Held a={S23_me} side="b" off={[0, 0.04, 0]}><Apple p={[0, 0, 0]} kind="core" s={1.4} /></Held><Doodle a={S23_n} /></>);

// 24. Подписывайся и ставь лайк — машут оба, сзади билборд
const wave = (t0: number, t1: number, side: 1 | -1): Key[] => {
  const k: Key[] = [[t0, side * 0.2, 0.46]];
  for (let t = t0 + 0.3, i = 0; t < t1; t += 0.3, i++) k.push([t, side * (i % 2 ? 0.42 : 0.3), i % 2 ? 1.1 : 1.22]);
  return k;
};
const S24_me = me({ pos: [-0.35, 0, -1.25], expr: [[139.24, "grin"], [140.4, "laugh"], [141.1, "proud"], [142.2, "grin"], [144, "laugh"], [145.5, "proud"]], handB: wave(139.3, 146.5, 1) });
const S24_n: Actor = { pos: [0.75, 0, -1.35], seed: 7, look: NEWTON_LOOK, expr: [[139.24, "smug"], [140.4, "grin"], [141.7, "proud"], [143.5, "laugh"], [145.0, "proud"]], handF: wave(139.6, 146.5, -1), rise: [[0, 0.12, 0]], bob: 0.05 };
const Shot24 = () => (<><Street billboard /><Doodle a={S24_me} /><Doodle a={S24_n} /><Held a={S24_n} side="b"><Apple p={[0, 0.03, 0]} s={1.3} /></Held></>);

const C = (t: number, p: V3, l: V3, fov = 48): CamKey => [t, p, l, fov];
const SHOTS: Shot[] = [
  { t0: 0, t1: 4.7, el: <Scene3D t0={0} light="outdoor" bg={SKY} cam={[C(0, [0.5, 1.3, 3.0], [0, 1.25, -1.3], 50), C(4.7, [0.15, 1.25, 2.6], [0, 1.2, -1.3], 50)]} focus={[0, 0.9, -1.3]}><Shot1 /></Scene3D> },
  { t0: 4.7, t1: 10.1, el: <Scene3D t0={4.7} light="outdoor" bg={SKY} cam={[C(4.7, [2.8, 1.6, 3.8], [0, 1.2, -1.6], 52), C(10.1, [2.2, 1.5, 3.3], [0, 1.1, -1.5], 52)]} focus={[0.6, 0.8, -0.6]}><Shot2a /></Scene3D> },
  { t0: 10.1, t1: 16.39, el: <Scene3D t0={10.1} light="outdoor" bg={SKY} cam={[C(10.1, [0.8, 1.15, 1.8], [-0.55, 0.95, -1.0], 46), C(16.39, [0.55, 1.1, 1.55], [-0.55, 0.95, -1.0], 46)]} focus={[-0.75, 0.75, -1.0]}><Shot2b /></Scene3D> },
  { t0: 16.39, t1: 22.0, el: <Scene3D t0={16.39} light="outdoor" bg={SKY} cam={[C(16.39, [3.5, 1.7, 4.2], [0, 1.1, -1.8], 52), C(22.0, [2.2, 1.4, 2.8], [-0.4, 0.9, -1.1], 48)]} focus={[-0.5, 0.8, -1.0]}><Shot3 /></Scene3D> },
  { t0: 22.0, t1: 25.47, el: <Scene3D t0={22.0} light="outdoor" bg={SKY} cam={[C(22.0, [4.6, 1.2, -1.2], [3.6, 0.9, -3.4], 46), C(22.9, [4.4, 1.2, -1.0], [3.6, 0.9, -3.4], 46), C(23.4, [1.7, 1.25, 1.7], [0.3, 0.9, -0.8], 48), C(25.47, [1.5, 1.2, 1.5], [0.3, 0.9, -0.8], 48)]} focus={[0.75, 0.9, -0.5]}><Shot3 /></Scene3D> },
  { t0: 25.47, t1: 31.97, el: <Scene3D t0={25.47} light="outdoor" bg={SKY} cam={[C(25.47, [0.9, 1.3, 2.4], [-0.2, 0.9, -0.9], 48), C(31.97, [0.65, 1.2, 2.0], [-0.2, 0.8, -0.9], 48)]} focus={[0.1, 0.6, -0.8]}><Shot4 /></Scene3D> },
  { t0: 31.97, t1: 34.56, el: <Scene3D t0={31.97} light="outdoor" bg={SKY} cam={[C(31.97, [-0.25, 0.95, 0.75], [-0.75, 0.72, -1.05], 44), C(34.56, [-0.4, 0.9, 0.55], [-0.75, 0.72, -1.05], 44)]} focus={[-0.75, 0.75, -1.0]}><Shot5 /></Scene3D> },
  { t0: 34.56, t1: 42.93, el: <Scene3D t0={34.56} light="outdoor" bg={SKY} cam={[C(34.56, [1.1, 1.2, 2.3], [-0.25, 0.85, -0.85], 48), C(42.93, [0.75, 1.15, 1.95], [-0.25, 0.85, -0.85], 48)]} focus={[-0.2, 0.8, -0.8]}><Shot6 /></Scene3D> },
  { t0: 42.93, t1: 48.13, el: <Scene3D t0={42.93} light="outdoor" bg={SKY} cam={[C(42.93, [0.35, 1.05, 1.6], [-0.45, 0.65, -0.9], 46), C(48.13, [0.1, 1.0, 1.4], [-0.5, 0.6, -0.9], 46)]} focus={[-0.5, 0.6, -0.9]}><Shot7 /></Scene3D> },
  { t0: 48.13, t1: 53.82, el: <Scene3D t0={48.13} light="outdoor" bg={SKY} cam={[C(48.13, [0.9, 1.1, 1.7], [-0.45, 0.85, -0.9], 46), C(53.82, [0.7, 1.05, 1.45], [-0.45, 0.85, -0.9], 46)]} focus={[-0.4, 0.8, -0.8]}><Shot8 /></Scene3D> },
  { t0: 53.82, t1: 58.65, el: <Scene3D t0={53.82} light="outdoor" bg={SKY} cam={[C(53.82, [0.55, 1.2, 1.9], [-0.45, 0.95, -0.9], 48), C(58.65, [0.4, 1.15, 1.7], [-0.35, 0.85, -0.9], 48)]} focus={[-0.55, 0.9, -0.9]}><Shot9 /></Scene3D> },
  { t0: 58.65, t1: 63.16, el: <Scene3D t0={58.65} light="outdoor" bg={SKY} cam={[C(58.65, [1.4, 1.3, 2.6], [0, 0.9, -1.0], 50), C(63.16, [2.0, 1.3, 2.6], [0.9, 0.9, -0.8], 50)]} focus={[0.5, 0.8, -0.7]}><Shot10 /></Scene3D> },
  { t0: 63.16, t1: 68.23, el: <Scene3D t0={63.16} light="outdoor" bg={SKY} cam={[C(63.16, [0.6, 1.5, 2.6], [-2.1, 1.3, -3.0], 52), C(68.23, [0.1, 1.35, 2.0], [-1.4, 1.0, -1.8], 50)]} focus={[-1.6, 0.9, -2.0]}><Shot11 /></Scene3D> },
  { t0: 68.23, t1: 76.97, el: <Scene3D t0={68.23} light="outdoor" bg={SKY} cam={[C(68.23, [-0.8, 1.4, 3.6], [-0.4, 1.7, -1.4], 52), C(72.3, [0.2, 1.4, 3.3], [0.9, 1.3, -1.5], 50), C(74.6, [0.3, 1.1, 2.7], [0.2, 0.7, -1.2], 48), C(76.97, [0.2, 1.05, 2.5], [0, 0.65, -1.2], 48)]} focus={[0.2, 0.9, -1.3]}><Shot12 /></Scene3D> },
  { t0: 76.97, t1: 82.95, el: <Scene3D t0={76.97} cam={[C(76.97, [1.7, 1.6, 3.2], [0.0, 1.35, -0.6], 52), C(82.95, [1.1, 1.65, 2.9], [0.3, 1.6, -0.6], 52)]} focus={[0, 1.1, -0.6]}><Shot13 /></Scene3D> },
  { t0: 82.95, t1: 89.74, el: <Scene3D t0={82.95} cam={[C(82.95, [1.3, 1.4, 1.9], [1.6, 1.15, -1.4], 46), C(84.3, [1.9, 1.5, 0.7], [2.0, 1.45, -1.8], 40), C(89.74, [2.0, 1.65, 0.55], [2.0, 1.8, -1.8], 40)]} focus={[1.2, 1.3, -1.4]}><Shot14 /></Scene3D> },
  { t0: 89.74, t1: 91.1, el: <Scene3D t0={89.74} cam={[C(89.74, [-0.6, 1.3, 2.0], [-2.2, 1.0, 0.0], 48), C(91.1, [-0.75, 1.3, 1.85], [-2.2, 1.0, 0.0], 48)]} focus={[-2.3, 0.9, 0.1]}><Shot15a /></Scene3D> },
  { t0: 91.1, t1: 96.45, el: <Scene3D t0={91.1} light="outdoor" bg={SKY} cam={[C(91.1, [0.4, 1.0, 3.6], [1.0, 1.55, -1.6], 54), C(96.45, [0.7, 1.0, 3.3], [1.0, 1.75, -1.8], 54)]} focus={[0.9, 1.0, -1.4]}><Shot15b /></Scene3D> },
  { t0: 96.45, t1: 100.21, el: <Scene3D t0={96.45} light="outdoor" bg={SKY} cam={[C(96.45, [0.55, 1.15, 1.2], [0, 1.0, -1.3], 44), C(100.21, [0.35, 1.1, 0.95], [0, 0.95, -1.3], 44)]} focus={[0, 0.95, -1.3]}><Shot16 /></Scene3D> },
  { t0: 100.21, t1: 105.72, el: <Scene3D t0={100.21} cam={[C(100.21, [1.4, 1.4, 2.6], [-0.1, 0.9, -0.2], 50), C(105.72, [1.1, 1.3, 2.3], [0.0, 0.9, -0.1], 50)]} focus={[0.1, 0.85, 0.1]}><Shot17Inner /></Scene3D> },
  { t0: 105.72, t1: 111.87, el: <Scene3D t0={105.72} cam={[C(105.72, [1.3, 1.4, 2.5], [-0.2, 1.0, -0.2], 50), C(111.87, [1.0, 1.35, 2.2], [-0.1, 1.0, -0.1], 50)]} focus={[-0.4, 0.9, -0.1]}><Shot18Inner /></Scene3D> },
  { t0: 111.87, t1: 122.42, el: <Scene3D t0={111.87} light="night" bg="#1b2a55" cam={[C(111.87, [0.5, 1.35, 2.6], [0.1, 1.25, -1.2], 50), C(116.5, [0.1, 1.3, 2.2], [0.1, 1.1, -1.1], 48), C(119.0, [0.2, 1.4, 2.4], [0.3, 1.45, -1.6], 48), C(122.42, [0.3, 1.45, 2.2], [0.35, 1.5, -1.6], 48)]} focus={[-0.5, 1.0, -0.9]}><Shot19Inner /></Scene3D> },
  { t0: 122.42, t1: 127.02, el: <Scene3D t0={122.42} cam={[C(122.42, [0.7, 1.35, 2.6], [-0.15, 1.1, -1.2], 50), C(127.02, [0.4, 1.3, 2.3], [-0.15, 1.1, -1.2], 50)]} focus={[-0.4, 1.0, -0.9]}><Shot20Inner /></Scene3D> },
  { t0: 127.02, t1: 131.99, el: <Scene3D t0={127.02} light="outdoor" bg={SKY} cam={[C(127.02, [0.35, 1.2, 1.4], [-0.1, 0.95, -1.2], 44), C(131.99, [0.2, 1.1, 1.1], [-0.2, 0.8, -1.2], 44)]} focus={[-0.1, 0.9, -1.2]}><Shot21 /></Scene3D> },
  { t0: 131.99, t1: 135.89, el: <Scene3D t0={131.99} light="outdoor" bg={SKY} cam={[C(131.99, [0.4, 0.45, 0.6], [-0.3, 0.25, -1.1], 50), C(133.6, [0.6, 0.9, 1.8], [-0.2, 0.7, -1.1], 50), C(135.89, [1.2, 1.4, 3.3], [0, 1.4, -1.2], 52)]} focus={[-0.25, 0.4, -1.15]}><Shot22 /></Scene3D> },
  { t0: 135.89, t1: 139.24, el: <Scene3D t0={135.89} light="outdoor" bg={SKY} cam={[C(135.89, [0.3, 1.2, 2.1], [0.2, 0.95, -1.3], 46), C(139.24, [0.15, 1.15, 1.85], [0.2, 0.95, -1.3], 46)]} focus={[0.2, 0.9, -1.3]}><Shot23 /></Scene3D> },
  { t0: 139.24, t1: 147.0, el: <Scene3D t0={139.24} light="outdoor" bg={SKY} cam={[C(139.24, [0.4, 1.3, 2.6], [0.3, 1.2, -1.3], 50), C(142.5, [0.6, 1.7, 3.6], [1.0, 2.25, -2.2], 52), C(147.0, [0.65, 1.72, 3.75], [1.0, 2.3, -2.2], 52)]} focus={[0.2, 1.0, -1.3]}><Shot24 /></Scene3D> },
];

// ===================================================================== вспышки «машины времени»
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(
    interpolate(f, [4.45 * FPS, 4.75 * FPS, 5.3 * FPS], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [62.9 * FPS, 63.25 * FPS, 64.0 * FPS], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: o }} /> : null;
};

// ===================================================================== субтитры
const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const k = width / 1920;
  const g = plan.groups.find((x) => f >= x.start && f < Math.max(x.end, x.start + 6));
  if (!g) return null;
  const s = spring({ frame: f - g.start, fps, config: { damping: 11, stiffness: 240, mass: 0.55 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90 * k }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 84 * k, lineHeight: 1.05, color: "white", textAlign: "center", maxWidth: 1500 * k,
        transform: `scale(${interpolate(s, [0, 1], [0.72, 1])})`, WebkitTextStroke: `${15 * k}px black`, paintOrder: "stroke fill",
        textShadow: `0 ${6 * k}px 0 rgba(0,0,0,0.55)` }}>{g.text}</div>
    </AbsoluteFill>
  );
};

export const TOTAL = Math.round(SHOTS[SHOTS.length - 1].t1 * FPS);
export const Video: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t0 * FPS)} durationInFrames={Math.round(s.t1 * FPS) - Math.round(s.t0 * FPS)}>{s.el}</Sequence>
      ))}
      <Flash />
      <Audio src={staticFile(plan.voice)} />
      <Audio src={staticFile("music.mp3")} loop
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 75, durationInFrames], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Caption />
    </AbsoluteFill>
  );
};
