// РОЛИК «Что, если я попал во времена Ньютона?» — 16:9, ~1:39. Всё время — в секундах ГОЛОСА.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import plan from "./plan.json";
import { FPS, Scene3D, Box, Ball, Apple, Sign, Doodle, Held, Actor, Key, pointKeys, bonkAt, useSec, at, V3, REST_F, REST_B, CamKey, WARP } from "./kit";
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

const Birds: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec();
  const u = Math.max(0, sec - t0);
  return (<>
    <Bird p={[0.9 - u * 0.25, 0.12, -0.9]} hop={Math.abs(Math.sin(u * 7)) * 0.04} dir={-1} />
    <Bird p={[1.4 - u * 0.25, 0.12, -1.1]} hop={Math.abs(Math.sin(u * 7 + 1)) * 0.04} dir={-1} />
  </>);
};
// ===================================================================== шоты (время — секунды голоса)
const SKY = "#a9d4f5";
type Shot = { t0: number; t1: number; el: React.ReactNode };
const Formula: React.FC<{ t: number; p: V3; text: string }> = ({ t, p, text }) => {
  const sec = useSec();
  if (sec < t) return null;
  return <group position={[p[0], p[1] + Math.sin(sec * 1.5 + t) * 0.03, p[2]]} scale={bonkAt(sec, t, 0.5)}><Sign p={[0, 0, 0]} w={0.78} h={0.22} text={text} bg="#fbf6e6" fg="#2a2d6a" glow={0.3} sz={60} /></group>;
};
const wave = (t0: number, t1: number, side: 1 | -1): Key[] => {
  const k: Key[] = [[t0, side * 0.2, 0.46]];
  for (let t = t0 + 0.3, i = 0; t < t1; t += 0.3, i++) k.push([t, side * (i % 2 ? 0.42 : 0.3), i % 2 ? 1.1 : 1.22]);
  return k;
};
const APPLE_GROUND: V3 = [-0.2, 0.06, -0.8];
const GroundApple: React.FC<{ from?: number }> = ({ from = -1 }) => {
  const sec = useSec();
  if (from < 0) return <Apple p={APPLE_GROUND} s={1.3} />;
  const y = sec < from ? 2.3 : sec < from + 0.3 ? 2.3 - 2.24 * Math.pow((sec - from) / 0.3, 2) : 0.06 + Math.abs(Math.sin((sec - from - 0.3) * 9)) * 0.12 * Math.exp(-(sec - from - 0.3) * 5);
  return <Apple p={[APPLE_GROUND[0], y, APPLE_GROUND[2]]} s={1.3} />;
};

// A. «Что, если я попал во времена Ньютона?» — вспышка, ты появляешься в саду 1666
const A_me = me({ pos: [1.0, 0, -0.4], hidden: [[0, 1.75]], expr: [[1.75, "shock"], [2.6, "nervous"], [3.3, "realize"]] });
const A_n = newton({ expr: [[0, "focus"], [2.4, "blank"], [3.4, "focus"]], handB: writing(0, 4.5) });
const ShotA = () => (<><Garden /><Doodle a={A_me} /><Doodle a={A_n} /><NewtonBook a={A_n} /><Quill a={A_n} /></>);

// B. «Представь, ты попал в прошлое, во времена великого учёного Исаака Ньютона»
const B_me = me({ pos: [0.9, 0, -0.45], expr: [[4.43, "nervous"], [5.9, "blank"], [7.2, "realize"], [8.6, "grin"], [10.3, "proud"]], handF: pointKeys(10.3, -0.9, 0.6, 1.4, "f") });
const B_n = newton({ expr: [[4.43, "focus"], [8.0, "blank"], [9.0, "focus"], [10.6, "smug"], [11.6, "focus"]], handB: writing(4.43, 12.4) });
const ShotB = () => (<><Garden signBonk={7.2} /><Doodle a={B_me} /><Doodle a={B_n} /><NewtonBook a={B_n} /><Quill a={B_n} /></>);

// C. Закон всемирного тяготения — формулы над головой; «исторический момент» — наезд
const C_n = newton({ expr: [[12.29, "focus"], [13.6, "smug"], [14.6, "proud"], [16.4, "focus"], [17.8, "blank"], [19.2, "focus"]], handB: writing(12.29, 21.3) });
const C_me = me({ pos: [0.2, 0, -0.85], expr: [[12.29, "blank"], [14.2, "realize"], [15.8, "grin"], [17.3, "nervous"], [19.2, "shock"]] });
const ShotC = () => (<>
  <Garden /><Doodle a={C_n} /><NewtonBook a={C_n} /><Quill a={C_n} /><Doodle a={C_me} />
  <Formula t={14.2} p={[-1.15, 1.2, -1.0]} text="F = G·m₁m₂/r²" />
  <Formula t={15.1} p={[-0.3, 1.22, -1.0]} text="g = 9,8 м/с²" />
</>);

// D. Сидит под деревом, думает о жизни… и вдруг падает яблоко — ты ловишь его на лету!
const D_me = me({ pos: [0.6, 0, -0.55], expr: [[21.19, "neutral"], [23.2, "smug"], [25.0, "blank"], [26.8, "shock"], [27.35, "grin"], [27.7, "laugh"]],
  walk: [[26.6, 0.6, -0.55], [27.0, 0.3, -0.62]], handF: [[26.5, ...REST_F], [26.85, -0.42, 0.98], [27.5, -0.42, 0.98], [27.9, -0.26, 0.72]] });
const D_n = newton({ expr: [[21.19, "blank"], [22.4, "focus"], [23.2, "smug"], [24.4, "blank"], [25.4, "focus"]], handB: [[21.19, 0.2, 0.62], [23.0, 0.2, 0.62], ...writing(23.3, 28.6)] });
const DApple: React.FC = () => {
  const sec = useSec();
  if (sec < 26.35) return null;
  const u = Math.min(1, (sec - 26.35) / 0.85);
  return <Held a={D_me} side="f" off={[0, 0.03 + (1 - u * u) * 1.05, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held>;
};
const ShotD = () => (<><Garden /><DApple /><Doodle a={D_n} /><NewtonBook a={D_n} /><Quill a={D_n} /><Doodle a={D_me} /></>);

// E. Ты понимаешь: сейчас случится важнейший момент — а Ньютон не замечает
const E_me = me({ pos: [0.6, 0, -0.55], expr: [[28.5, "shock"], [29.4, "realize"], [30.7, "grin"], [32.4, "proud"], [34.3, "laugh"], [35.7, "proud"], [36.9, "nervous"]],
  handF: [[28.5, -0.26, 0.72], [29.9, -0.26, 0.72], [30.4, -0.42, 0.9], [33.4, -0.42, 0.9], [33.9, -0.46, 1.02], [35.9, -0.46, 1.02], [36.4, -0.28, 0.74]] });
const E_n = newton({ expr: [[28.5, "focus"], [31.7, "blank"], [33.0, "focus"], [36.5, "stern"]], handB: writing(28.5, 38.1) });
const ShotE = () => (<><Garden /><Held a={E_me} side="f" off={[0, 0.03, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held><Doodle a={E_n} /><NewtonBook a={E_n} /><Quill a={E_n} /><Doodle a={E_me} /></>);

// F. Машешь (с яблоком в руке), кричишь — он не слышит. Подбрасываешь-ловишь яблоко и уходишь
const F_me = me({ pos: [0.35, 0, -0.6],
  expr: [[38.0, "grin"], [38.8, "nervous"], [39.4, "shout"], [40.8, "stern"], [42.0, "blank"], [43.1, "smug"], [44.4, "shock"], [45.0, "laugh"], [45.9, "proud"]],
  handF: [[38.0, ...REST_F], [38.25, -0.36, 1.08], [38.45, -0.26, 1.2], [38.65, -0.36, 1.08], [38.85, -0.26, 1.2], [39.05, -0.36, 1.08], [39.3, ...REST_F],
    [40.8, ...REST_F], [41.1, -0.24, 0.86], [41.5, -0.24, 0.86], [41.8, ...REST_F], [44.1, ...REST_F], [44.5, -0.22, 1.18], [45.2, -0.22, 1.18], [45.6, -0.26, 0.62]],
  handB: [[38.0, ...REST_B], [38.25, 0.36, 1.08], [38.45, 0.26, 1.2], [38.65, 0.36, 1.08], [38.85, 0.26, 1.2], [39.05, 0.36, 1.08], [39.3, ...REST_B],
    [42.9, ...REST_B], [43.2, 0.4, 0.78], [43.7, 0.4, 0.78], [44.0, ...REST_B]],
  lean: [[39.4, 0, 0], [39.6, 0.15, 0], [40.6, 0.15, 0], [40.9, 0, 0]],
  talk: [[39.4, 40.7]], walk: [[45.9, 0.35, -0.6], [47.06, 2.2, -0.35]] });
const F_n = newton({ expr: [[38.0, "focus"], [39.6, "blank"], [40.4, "focus"], [41.6, "stern"], [42.6, "focus"]],
  handB: [...writing(38.0, 41.5), [41.7, 0.36, 0.86], [41.9, 0.31, 0.92], [42.1, 0.36, 0.86], [42.3, 0.31, 0.92], ...writing(42.6, 47.2)] });
const CatchApple: React.FC = () => {
  const sec = useSec();
  const u = Math.max(0, Math.min(1, (sec - 44.5) / 0.75));
  return <Held a={F_me} side="f" off={[0, 0.03 + Math.sin(u * Math.PI) * 0.75, 0]}><Apple p={[0, 0, 0]} s={1.3} /></Held>;
};
const ShotF = () => (<><Garden /><CatchApple /><Doodle a={F_n} /><NewtonBook a={F_n} /><Quill a={F_n} /><Doodle a={F_me} /></>);

// G. «И вот теперь представь…» — откусываешь яблоко, вспышка
const G_me = me({ pos: [0.9, 0, -0.35], expr: [[47.06, "smug"], [47.7, "grin"], [48.3, "laugh"]],
  handF: [[47.06, -0.3, 0.6], [47.5, -0.18, 0.92], [47.9, -0.18, 0.92], [48.2, -0.3, 0.66]] });
const G_apple: React.FC = () => { const sec = useSec(); return <Held a={G_me} side="f" off={[0, 0.03, 0]}><Apple p={[0, 0, 0]} s={1.3} kind={sec > 47.8 ? "bitten" : "whole"} /></Held>; };
const G_n = newton({ expr: [[47.06, "focus"]], handB: writing(47.06, 49.5) });
const ShotG = () => (<><Garden /><Doodle a={G_n} /><NewtonBook a={G_n} /><Doodle a={G_me} /><G_apple /></>);

// H. 2026. Выходишь на улицу… «что-то пошло не так!»
const H_me = me({ pos: [-2.6, 0, -3.5], hidden: [[0, 49.6]], expr: [[49.38, "proud"], [51.6, "grin"], [53.9, "smug"], [55.3, "blank"], [56.0, "shock"]],
  walk: [[49.8, -2.6, -3.4], [53.6, -1.4, -1.6]], handB: [[0, 0.26, 0.62]] });
const H_nb: Actor = { pos: [1.5, 0, -2.4], seed: 3, look: NEIGHBOR, expr: [[49, "smug"], [55, "grin"]], rise: [[0, 2.4, 0]], bob: 0.1, walk: [[54.8, 3.5, -2.2], [57.7, 0.2, -2.2]], handF: [[0, -0.3, 0.55]] };
const ShotH = () => (<><Street /><Doodle a={H_me} /><Held a={H_me} side="b"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held><Doodle a={H_nb} /><Held a={H_nb} side="f"><Briefcase /></Held></>);

// I1. Люди не ходят — они летают!
const I_me = me({ pos: [-1.3, 0, -1.3], expr: [[57.69, "shock"], [58.9, "realize"], [60.1, "shock"], [61.0, "nervous"]], handB: pointKeys(60.3, 0.6, 1.0, 1.2, "b"), handF: [[0, -0.26, 0.6]] });
const I_nb: Actor = { pos: [0, 0, -0.6], seed: 3, look: NEIGHBOR, expr: [[57, "proud"], [59.5, "grin"]], walk: [[57.7, -4.5, -0.7], [62.0, 4.5, -0.7]], rise: [[0, 1.85, 0]], bob: 0.08, handF: [[0, -0.3, 0.55]] };
const I_k1: Actor = { pos: [0, 0, -1.8], seed: 11, look: KID1, expr: [[57, "laugh"], [60, "grin"]], walk: [[57.7, 4.5, -2.0], [62.0, -2.5, -2.0]], rise: [[0, 2.6, 0]], bob: 0.12, handF: [[0, -0.3, 1.15]], handB: [[0, 0.3, 1.15]] };
const ShotI1 = () => (<>
  <Street /><Doodle a={I_me} /><Held a={I_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held>
  <Doodle a={I_nb} /><Held a={I_nb} side="f"><Briefcase /></Held><Doodle a={I_k1} /><Birds t0={58} />
</>);
// I2. Машины парят в воздухе
const ShotI2 = () => (<><Street /></>);

// J1. Дома отрываются от земли
const ShotJ1Inner: React.FC = () => { const sec = useSec(); return <Street lift={at(sec, [[64.5, 0], [66.4, 1]])} />; };
// J2. Люди поднимают огромные предметы одной рукой
const J_me = me({ pos: [-0.8, 0, -1.3], expr: [[66.6, "shock"], [68.3, "realize"], [69.4, "holdlaugh"], [70.2, "laugh"]], handF: [[0, -0.26, 0.6]] });
const J_gr: Actor = { pos: [1.6, 0, -1.6], seed: 5, look: GRANNY, expr: [[66.6, "smug"], [68.0, "proud"], [69.4, "grin"]], walk: [[66.6, 3.4, -1.6], [70.8, 1.0, -1.6]], handB: [[0, 0.26, 1.3]] };
const ShotJ2 = () => (<>
  <Street lift={1} /><Doodle a={J_me} /><Held a={J_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held>
  <Doodle a={J_gr} /><Held a={J_gr} side="b" off={[-0.1, 0.03, -0.05]}><Fridge s={1.35} p={[0, 0, 0]} /></Held>
</>);

// K. Почему? Без открытия закона история пошла другим путём — в магазине нет «Начал», всё всплывает
const K_me = me({ pos: [-0.75, 0, -0.55], expr: [[71.12, "blank"], [72.1, "realize"], [73.2, "nervous"], [76.2, "shock"], [77.9, "nervous"]], handB: pointKeys(73.2, 0.8, 0.3, 1.6, "b") });
const ShotKInner: React.FC = () => { const sec = useSec(); return (<><Bookshop tagBonk={73.4} floatAmt={at(sec, [[75.9, 0], [76.8, 1]])} /><Doodle a={K_me} /></>); };

// L. «И теперь у меня только один вопрос…»
const L_me = me({ pos: [0, 0, -1.3], expr: [[80.1, "blank"], [80.8, "nervous"], [81.8, "realize"]], handF: [[80.1, -0.26, 0.6], [81.3, -0.28, 0.82]] });
const ShotL = () => (<><Street lift={1} /><Doodle a={L_me} /><Held a={L_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held></>);

// M. «А что, если я случайно изменил всю историю человечества?!» — отъезд на весь летающий город
const M_me = me({ pos: [0, 0, -1.3], expr: [[83.24, "nervous"], [84.7, "realize"], [85.3, "shock"]],
  handF: [[83.24, -0.28, 0.82], [85.2, -0.28, 0.82], [85.5, -0.36, 1.12]], handB: [[83.24, ...REST_B], [85.2, ...REST_B], [85.5, 0.36, 1.12]] });
const M_nb: Actor = { pos: [0, 0, -2.2], seed: 3, look: NEIGHBOR, expr: [[83, "grin"]], walk: [[84.5, 3.5, -2.2], [88.6, -2.5, -2.2]], rise: [[0, 2.3, 0]], bob: 0.1 };
const ShotM = () => (<><Street lift={1} /><Doodle a={M_me} /><Held a={M_me} side="f"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held><Doodle a={M_nb} /></>);

// N. «А вы бы вернули яблоко Ньютону?» — протягиваешь яблоко Ньютону, который тоже парит
const N_me = me({ pos: [-0.35, 0, -1.25], expr: [[88.58, "grin"], [89.6, "smug"], [91.0, "nervous"], [92.1, "grin"]], handB: [[88.58, ...REST_B], [89.6, 0.45, 0.66]] });
const N_n: Actor = { pos: [0.75, 0, -1.35], seed: 7, look: NEWTON_LOOK, expr: [[88.58, "realize"], [89.9, "stern"], [91.0, "blank"], [92.0, "shock"]], rise: [[0, 0.12, 0]], bob: 0.05 };
const ShotN = () => (<><Street /><Doodle a={N_me} /><Held a={N_me} side="b" off={[0, 0.04, 0]}><Apple p={[0, 0, 0]} kind="bitten" s={1.3} /></Held><Doodle a={N_n} /></>);

// O. Подписывайтесь и ставьте лайк — машут оба, сзади билборд
const O_me = me({ pos: [-0.35, 0, -1.25], expr: [[93.42, "grin"], [94.4, "laugh"], [95.6, "proud"], [97.0, "laugh"]], handB: wave(93.5, 98.8, 1) });
const O_n: Actor = { pos: [0.75, 0, -1.35], seed: 7, look: NEWTON_LOOK, expr: [[93.42, "smug"], [94.4, "grin"], [95.6, "proud"], [97.0, "laugh"]], handF: wave(93.8, 98.8, -1), rise: [[0, 0.12, 0]], bob: 0.05 };
const ShotO = () => (<><Street billboard /><Doodle a={O_me} /><Doodle a={O_n} /><Held a={O_n} side="b"><Apple p={[0, 0.03, 0]} s={1.3} kind="bitten" /></Held></>);

const C = (t: number, p: V3, l: V3, fov = 48): CamKey => [t, p, l, fov];
const O3 = { light: "outdoor" as const, bg: SKY };
const SHOTS: Shot[] = [
  { t0: 0, t1: 4.43, el: <Scene3D t0={0} {...O3} cam={[C(0, [3.4, 2.4, 4.8], [0, 1.3, -1.6], 52), C(4.43, [2.5, 1.55, 3.4], [0.1, 1.05, -1.2], 50)]} focus={[0.6, 0.8, -0.6]}><ShotA /></Scene3D> },
  { t0: 4.43, t1: 12.29, el: <Scene3D t0={4.43} {...O3} cam={[C(4.43, [2.4, 1.35, 2.6], [0.6, 1.0, -0.6], 48), C(9.4, [1.7, 1.3, 2.4], [0.2, 1.0, -0.8], 48), C(12.29, [0.8, 1.15, 1.8], [-0.55, 0.95, -1.0], 46)]} focus={[0.6, 0.8, -0.6]}><ShotB /></Scene3D> },
  { t0: 12.29, t1: 21.19, el: <Scene3D t0={12.29} {...O3} cam={[C(12.29, [0.8, 1.15, 1.8], [-0.55, 0.95, -1.0], 46), C(17.3, [0.6, 1.12, 1.6], [-0.55, 0.95, -1.0], 46), C(21.19, [-0.3, 0.92, 0.45], [-0.75, 0.75, -1.05], 44)]} focus={[-0.75, 0.75, -1.0]}><ShotC /></Scene3D> },
  { t0: 21.19, t1: 28.5, el: <Scene3D t0={21.19} {...O3} cam={[C(21.19, [3.2, 1.7, 3.9], [-0.6, 1.2, -1.3], 50), C(25.0, [1.6, 1.35, 2.5], [-0.3, 0.9, -0.9], 48), C(28.5, [1.0, 1.3, 2.4], [-0.1, 1.0, -0.9], 50)]} focus={[0.1, 0.6, -0.8]}><ShotD /></Scene3D> },
  { t0: 28.5, t1: 38.0, el: <Scene3D t0={28.5} {...O3} cam={[C(28.5, [1.15, 1.15, 1.55], [0.5, 0.95, -0.55], 44), C(33.6, [1.0, 1.15, 1.6], [0.35, 0.92, -0.6], 44), C(38.0, [0.75, 1.1, 1.9], [-0.25, 0.75, -0.85], 48)]} focus={[0.5, 0.8, -0.55]}><ShotE /></Scene3D> },
  { t0: 38.0, t1: 47.06, el: <Scene3D t0={38.0} {...O3} cam={[C(38.0, [1.1, 1.2, 2.3], [-0.25, 0.85, -0.85], 48), C(44.0, [0.85, 1.2, 2.1], [-0.15, 0.9, -0.8], 48), C(47.06, [1.5, 1.25, 2.5], [0.7, 0.9, -0.6], 50)]} focus={[-0.2, 0.8, -0.8]}><ShotF /></Scene3D> },
  { t0: 47.06, t1: 49.38, el: <Scene3D t0={47.06} {...O3} cam={[C(47.06, [1.35, 1.15, 1.6], [0.85, 1.0, -0.35], 44), C(49.38, [1.25, 1.12, 1.35], [0.85, 1.0, -0.35], 44)]} focus={[0.9, 0.9, -0.35]}><ShotG /></Scene3D> },
  { t0: 49.38, t1: 57.69, el: <Scene3D t0={49.38} {...O3} cam={[C(49.38, [0.6, 1.5, 2.6], [-2.1, 1.3, -3.0], 52), C(53.6, [0.1, 1.35, 2.0], [-1.4, 1.0, -1.8], 50), C(57.69, [-0.3, 1.35, 1.6], [-1.3, 1.25, -1.8], 48)]} focus={[-1.6, 0.9, -2.0]}><ShotH /></Scene3D> },
  { t0: 57.69, t1: 61.7, el: <Scene3D t0={57.69} {...O3} cam={[C(57.69, [-0.8, 1.4, 3.6], [-0.4, 1.7, -1.4], 52), C(61.7, [0.2, 1.4, 3.3], [0.6, 1.8, -1.5], 50)]} focus={[0.2, 1.2, -1.3]}><ShotI1 /></Scene3D> },
  { t0: 61.7, t1: 64.32, el: <Scene3D t0={61.7} {...O3} cam={[C(61.7, [0.0, 1.3, 7.8], [0, 1.9, 3.0], 55), C(64.32, [0.6, 1.5, 7.4], [0.3, 2.1, 3.0], 55)]} focus={[0, 2, 3]}><ShotI2 /></Scene3D> },
  { t0: 64.32, t1: 66.6, el: <Scene3D t0={64.32} {...O3} cam={[C(64.32, [0, 1.8, 9.5], [0, 3.6, -4], 56), C(66.6, [0.5, 1.8, 8.8], [0.3, 3.9, -4], 56)]} focus={[0, 3, -4]}><ShotJ1Inner /></Scene3D> },
  { t0: 66.6, t1: 71.12, el: <Scene3D t0={66.6} {...O3} cam={[C(66.6, [0.4, 1.2, 3.1], [0.6, 1.1, -1.4], 50), C(71.12, [0.2, 1.1, 2.7], [0.3, 0.95, -1.3], 48)]} focus={[0.4, 0.9, -1.4]}><ShotJ2 /></Scene3D> },
  { t0: 71.12, t1: 80.1, el: <Scene3D t0={71.12} cam={[C(71.12, [0.7, 1.35, 2.6], [-0.15, 1.1, -1.2], 50), C(80.1, [0.35, 1.3, 2.2], [-0.15, 1.1, -1.2], 50)]} focus={[-0.4, 1.0, -0.9]}><ShotKInner /></Scene3D> },
  { t0: 80.1, t1: 83.24, el: <Scene3D t0={80.1} {...O3} cam={[C(80.1, [0.55, 1.15, 1.2], [0, 1.0, -1.3], 44), C(83.24, [0.4, 1.12, 1.0], [0, 0.98, -1.3], 44)]} focus={[0, 0.95, -1.3]}><ShotL /></Scene3D> },
  { t0: 83.24, t1: 88.58, el: <Scene3D t0={83.24} {...O3} cam={[C(83.24, [0.4, 1.12, 1.0], [0, 0.98, -1.3], 44), C(85.0, [0.35, 1.1, 0.85], [0, 0.98, -1.3], 44), C(88.58, [0.5, 2.3, 8.5], [0, 2.4, -2], 56)]} focus={[0, 0.95, -1.3]}><ShotM /></Scene3D> },
  { t0: 88.58, t1: 93.42, el: <Scene3D t0={88.58} {...O3} cam={[C(88.58, [0.3, 1.2, 2.1], [0.2, 0.95, -1.3], 46), C(93.42, [0.15, 1.15, 1.85], [0.2, 0.95, -1.3], 46)]} focus={[0.2, 0.9, -1.3]}><ShotN /></Scene3D> },
  { t0: 93.42, t1: 99.0, el: <Scene3D t0={93.42} {...O3} cam={[C(93.42, [0.4, 1.3, 2.6], [0.3, 1.2, -1.3], 50), C(96.0, [0.6, 1.7, 3.6], [1.0, 2.25, -2.2], 52), C(99.0, [0.65, 1.72, 3.75], [1.0, 2.3, -2.2], 52)]} focus={[0.2, 1.0, -1.3]}><ShotO /></Scene3D> },
];

// ===================================================================== вспышки «машины времени»
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(
    interpolate(f, [WARP(1.4) * FPS, WARP(1.72) * FPS, WARP(2.3) * FPS], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [WARP(48.9) * FPS, WARP(49.38) * FPS, WARP(50.1) * FPS], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
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

export const TOTAL = Math.round(WARP(SHOTS[SHOTS.length - 1].t1) * FPS);
export const Video: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={Math.round(WARP(s.t0) * FPS)} durationInFrames={Math.round(WARP(s.t1) * FPS) - Math.round(WARP(s.t0) * FPS)}>{s.el}</Sequence>
      ))}
      <Flash />
      <Audio src={staticFile(plan.voice)} />
      <Audio src={staticFile("music.mp3")} loop
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 75, durationInFrames], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Caption />
    </AbsoluteFill>
  );
};
