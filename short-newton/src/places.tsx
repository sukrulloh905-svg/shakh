// Локации ролика «Яблоко Ньютона»: сад 1666 года, улица 2026 года, кухня, кабинет Ньютона, книжный магазин.
import React from "react";
import * as THREE from "three";
import { Box, Ball, Apple, Sign, Room, Desk, Shelf, Plant, Lamp, Clock, Bench, Door, useSec, bonkAt, at, V3 } from "./kit";

// ------------------------------------------------------------------ общие мелочи
export const Cloud: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <Ball p={[0, 0, 0]} r={0.9} c="#ffffff" outline={0.03} /><Ball p={[0.9, -0.15, 0]} r={0.65} c="#ffffff" outline={0.03} />
    <Ball p={[-0.9, -0.2, 0]} r={0.6} c="#ffffff" outline={0.03} />
  </group>
);
export const Cat: React.FC<{ p: V3; rot?: V3; sleep?: boolean; c?: string }> = ({ p, rot = [0, 0, 0], sleep = false, c = "#e8913a" }) => (
  <group position={p} rotation={rot}>
    <Box p={[0, 0.13, 0]} s={[0.42, 0.2, 0.22]} c={c} />
    <Box p={[0.25, 0.25, 0]} s={[0.2, 0.18, 0.2]} c={c} />
    {[-0.06, 0.06].map((z) => <Box key={z} p={[0.28, 0.37, z]} s={[0.05, 0.07, 0.05]} c={c} />)}
    {[-0.05, 0.05].map((z) => <Box key={"e" + z} p={[0.351, 0.27, z]} s={[0.01, sleep ? 0.01 : 0.04, 0.03]} c="#1b1615" line={false} />)}
    <Box p={[-0.28, 0.24, 0]} s={[0.05, 0.25, 0.05]} c={c} rot={[0, 0, 0.5]} />
    {[-0.15, 0.15].flatMap((x) => [-0.07, 0.07].map((z) => <Box key={x + "" + z} p={[x, 0.02, z]} s={[0.05, 0.05, 0.05]} c={c} line={false} />))}
  </group>
);
// Летающая машина
export const Car: React.FC<{ p: V3; c: string; rotY?: number }> = ({ p, c, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.35, 0]} s={[1.9, 0.42, 0.9]} c={c} r={0.4} />
    <Box p={[-0.1, 0.72, 0]} s={[1.0, 0.36, 0.82]} c={c} r={0.4} />
    <Box p={[-0.1, 0.72, 0.42]} s={[0.85, 0.26, 0.02]} c="#bfe3ff" line={false} e="#bfe3ff" ei={0.3} />
    <Box p={[0.96, 0.4, 0]} s={[0.02, 0.1, 0.6]} c="#fff3b0" e="#fff3b0" ei={1} line={false} />
    {[-0.6, 0.6].flatMap((x) => [-0.46, 0.46].map((z) => (
      <mesh key={x + "" + z} position={[x, 0.15, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.1, 16]} /><meshStandardMaterial color="#202124" /></mesh>)))}
  </group>
);
export const Bird: React.FC<{ p: V3; hop?: number; dir?: number }> = ({ p, hop = 0, dir = 1 }) => (
  <group position={[p[0], p[1] + hop, p[2]]} scale={[dir, 1, 1]}>
    <Ball p={[0, 0.2, 0]} r={0.12} sx={1.2} sy={0.85} c="#7b8794" />
    <Ball p={[0.13, 0.3, 0]} r={0.07} c="#8f9ba8" />
    <Box p={[0.21, 0.3, 0]} s={[0.06, 0.025, 0.03]} c="#f0a020" line={false} />
    {[-0.03, 0.03].map((z) => <Box key={z} p={[0, 0.05, z]} s={[0.015, 0.1, 0.015]} c="#f0a020" line={false} />)}
  </group>
);
export const Fridge: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <group position={p} scale={s}>
    <Box p={[0, 0.45, 0]} s={[0.5, 0.9, 0.45]} c="#eef2f5" r={0.3} />
    <Box p={[0, 0.62, 0.23]} s={[0.5, 0.01, 0.01]} c="#9aa3ab" />
    <Box p={[-0.18, 0.75, 0.24]} s={[0.03, 0.15, 0.03]} c="#9aa3ab" /><Box p={[-0.18, 0.4, 0.24]} s={[0.03, 0.15, 0.03]} c="#9aa3ab" />
  </group>
);
export const Briefcase: React.FC = () => (<group><Box p={[0, -0.12, 0]} s={[0.3, 0.2, 0.08]} c="#6b3f22" /><Box p={[0, 0.0, 0]} s={[0.1, 0.04, 0.03]} c="#3a2414" /></group>);
export const Book: React.FC<{ c?: string; title?: string; s?: number }> = ({ c = "#7a2f22", title, s = 1 }) => (
  <group scale={s}>
    <Box p={[0, 0, 0]} s={[0.3, 0.22, 0.04]} c={c} />
    <Box p={[0.005, 0, 0]} s={[0.29, 0.2, 0.045]} c="#f3ead2" line={false} />
    <Box p={[0, 0, 0.003]} s={[0.3, 0.22, 0.04]} c={c} line={false} />
    {title ? <Sign p={[0, 0, 0.026]} w={0.26} h={0.1} text={title} bg={c} fg="#f2d27a" glow={0.2} /> : null}
  </group>
);

// ------------------------------------------------------------------ сад Ньютона, 1666
export const TREE: V3 = [-1.2, 0, -1.6];
export const Tree: React.FC<{ p?: V3; apples?: boolean }> = ({ p = TREE, apples = true }) => {
  const sec = useSec();
  const sway = Math.sin(sec * 0.9) * 0.03;
  const crown: [number, number, number, number][] = [[0, 3.0, 0, 1.25], [-1.1, 2.7, 0.1, 0.95], [1.1, 2.75, -0.1, 1.0], [0.3, 3.7, -0.2, 0.95], [-0.6, 3.5, 0.3, 0.8], [1.6, 2.5, 0.4, 0.7], [-1.7, 2.4, -0.2, 0.7], [0.5, 2.6, 0.7, 0.75]];
  return (
    <group position={p}>
      <Box p={[0, 1.15, 0]} s={[0.42, 2.3, 0.42]} c="#6e4a2a" r={0.95} />
      <Box p={[0.45, 2.15, 0]} s={[0.9, 0.16, 0.16]} c="#6e4a2a" rot={[0, 0, 0.5]} />
      <Box p={[-0.45, 2.2, 0]} s={[0.9, 0.16, 0.16]} c="#6e4a2a" rot={[0, 0, -0.5]} />
      {[-0.32, 0.32].map((x) => <Box key={x} p={[x, 0.08, 0.05]} s={[0.35, 0.16, 0.2]} c="#6e4a2a" rot={[0, x, 0]} />)}
      <group rotation={[0, 0, sway]} position={[0, 0, 0]}>
        {crown.map(([x, y, z, r], i) => <Ball key={i} p={[x, y, z]} r={r} c={["#4f8a3a", "#5c9a43", "#467e33"][i % 3]} outline={0.04} />)}
        {apples ? [[0.7, 2.3, 0.9], [-0.9, 2.25, 0.85], [1.4, 2.2, 0.95], [-0.2, 2.35, 1.2], [0.2, 3.0, 1.25], [-1.5, 2.5, 0.6], [1.0, 3.2, 0.9]].map(([x, y, z], i) =>
          <Apple key={i} p={[x, y, z]} s={1.3} />) : null}
      </group>
    </group>
  );
};
export const Cow: React.FC<{ p: V3; rotY?: number }> = ({ p, rotY = 0 }) => {
  const sec = useSec();
  const chew = Math.sin(sec * 9) * 0.02;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0.75, 0]} s={[1.2, 0.55, 0.55]} c="#f4f1ea" />
      <Box p={[-0.15, 0.85, 0.281]} s={[0.35, 0.25, 0.01]} c="#2b2724" line={false} />
      <Box p={[0.3, 0.7, -0.281]} s={[0.3, 0.2, 0.01]} c="#2b2724" line={false} />
      {[-0.45, 0.45].flatMap((x) => [-0.18, 0.18].map((z) => <Box key={x + "" + z} p={[x, 0.25, z]} s={[0.12, 0.5, 0.12]} c="#f4f1ea" />))}
      <group position={[0.72, 0.95 + chew, 0]}>
        <Box p={[0, 0, 0]} s={[0.38, 0.36, 0.36]} c="#f4f1ea" />
        <Box p={[0.15, -0.1 + chew, 0]} s={[0.16, 0.18, 0.3]} c="#f2b8b0" />
        {[-0.2, 0.2].map((z) => <Box key={z} p={[-0.05, 0.22, z]} s={[0.05, 0.12, 0.05]} c="#e8dcc0" />)}
        {[-0.1, 0.1].map((z) => <Box key={"e" + z} p={[0.19, 0.06, z]} s={[0.01, 0.06, 0.04]} c="#1b1615" line={false} />)}
      </group>
      <Box p={[-0.65, 0.75, 0]} s={[0.05, 0.45, 0.05]} c="#f4f1ea" rot={[0, 0, Math.sin(sec * 2) * 0.3]} />
    </group>
  );
};
export const Basket: React.FC<{ p: V3; n?: number }> = ({ p, n = 3 }) => (
  <group position={p}>
    <Box p={[0, 0.13, 0]} s={[0.46, 0.26, 0.34]} c="#b5843f" />
    <Box p={[0, 0.27, 0]} s={[0.5, 0.04, 0.38]} c="#8a5f28" />
    {[[-0.12, 0.3, 0], [0.1, 0.31, 0.05], [0.0, 0.33, -0.08], [0.15, 0.3, -0.07]].slice(0, n).map((q, i) => <Apple key={i} p={q as V3} />)}
  </group>
);
export const Garden: React.FC<{ signBonk?: number; plagueBonk?: number }> = ({ signBonk = -1, plagueBonk = -1 }) => {
  const sec = useSec();
  return (<>
    <Box p={[0, -0.05, -4]} s={[60, 0.1, 40]} c="#86b453" line={false} r={0.95} />
    {/* дальний луг потемнее и холмы */}
    <Ball p={[-9, -3.5, -22]} r={7} c="#6e9e45" outline={0} sy={0.6} />
    <Ball p={[10, -4, -24]} r={8} c="#76a64c" outline={0} sy={0.6} />
    <Tree />
    <Tree p={[-7, 0, -9]} apples={false} />
    <Tree p={[7.5, 0, -11]} apples={false} />
    {/* усадьба Вулсторп на фоне */}
    <group position={[4.2, 0, -12]}>
      <Box p={[0, 1.5, 0]} s={[4.2, 3.0, 2]} c="#c08a64" />
      <Box p={[0, 3.25, 0]} s={[4.5, 0.5, 2.2]} c="#5a3d30" />
      <Box p={[0, 3.9, 0]} s={[0.7, 1.0, 0.7]} c="#c08a64" />
      <Ball p={[0, 4.55, 0]} r={0.42} c="#4c5a62" sy={0.9} />
      {[-1.4, -0.5, 0.5, 1.4].flatMap((x) => [0.9, 2.1].map((y) => <Box key={x + "" + y} p={[x, y, 1.01]} s={[0.4, 0.6, 0.02]} c="#2f3b45" line={false} />))}
      <Box p={[0, 0.6, 1.01]} s={[0.55, 1.2, 0.03]} c="#5a3d30" />
    </group>
    {/* забор */}
    {Array.from({ length: 15 }, (_, i) => <Box key={i} p={[-7 + i, 0.45, -4.5]} s={[0.09, 0.9, 0.09]} c="#a77d4f" />)}
    <Box p={[0, 0.65, -4.5]} s={[14, 0.07, 0.05]} c="#a77d4f" /><Box p={[0, 0.3, -4.5]} s={[14, 0.07, 0.05]} c="#a77d4f" />
    {/* табличка-указатель */}
    <group position={[2.6, 0, -2.6]}>
      <Box p={[0, 0.6, 0]} s={[0.08, 1.2, 0.08]} c="#8a6239" />
      <group position={[0, 1.25, 0.05]} scale={bonkAt(sec, signBonk)}><Box p={[0, 0, -0.02]} s={[1.1, 0.42, 0.04]} c="#8a6239" /><Sign p={[0, 0, 0.005]} w={1.0} h={0.34} text={"ВУЛСТОРП\n1666"} bg="#d9b77c" fg="#3a2414" glow={0.15} sz={60} /></group>
    </group>
    <group position={[-3.4, 0, -2.9]}>
      <Box p={[0, 0.6, 0]} s={[0.08, 1.2, 0.08]} c="#8a6239" />
      <group position={[0, 1.3, 0.05]} scale={bonkAt(sec, plagueBonk)}><Sign p={[0, 0, 0]} w={1.05} h={0.6} text={"КЕМБРИДЖ\nЗАКРЫТ\nЧУМА"} bg="#efe3c2" fg="#8a1f1a" glow={0.15} sz={46} /></group>
    </group>
    <Cow p={[3.4, 0, -3.6]} rotY={-0.5} />
    <Basket p={[0.05, 0, -0.95]} />
    {/* стопка книг у дерева */}
    <Box p={[-1.75, 0.06, -0.95]} s={[0.36, 0.12, 0.26]} c="#7a2f22" /><Box p={[-1.72, 0.17, -0.95]} s={[0.32, 0.1, 0.24]} c="#4a5a2f" />
    <Box p={[-1.76, 0.26, -0.95]} s={[0.3, 0.08, 0.22]} c="#2f4a6a" />
    {/* яблоки на траве, кусты, цветы */}
    {[[-1.6, 0.06, -0.55], [-1.85, 0.06, -0.7], [1.5, 0.06, -1.6]].map((q, i) => <Apple key={i} p={q as V3} />)}
    {[[-4.5, 0.4, -3.4], [5.6, 0.4, -4.0], [-2.6, 0.3, -3.8], [1.6, 0.35, -4.0]].map(([x, y, z], i) => <Ball key={i} p={[x, y, z]} r={0.5} c="#4f8a3a" sy={0.75} outline={0.04} />)}
    {Array.from({ length: 22 }, (_, i) => <Box key={"g" + i} p={[((i * 37) % 11) - 5.5, 0.06, -((i * 23) % 7) + 1.2]} s={[0.05, 0.12, 0.05]} c={i % 4 ? "#5c9a43" : "#f2d34a"} line={false} />)}
    <Cloud p={[-6, 7, -18]} s={1.4} /><Cloud p={[3, 8.5, -20]} s={1.7} /><Cloud p={[10, 6.5, -17]} s={1.2} />
  </>);
};

// ------------------------------------------------------------------ улица 2026
const Building: React.FC<{ x: number; w: number; h: number; c: string; z?: number }> = ({ x, w, h, c, z = -5 }) => {
  const cols = Math.max(2, Math.floor(w / 0.9)), rows = Math.floor((h - 1.4) / 1.1);
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, h / 2, 0]} s={[w, h, 2]} c={c} />
      <Box p={[0, h + 0.1, 0]} s={[w + 0.15, 0.2, 2.1]} c="#5a5f66" />
      {Array.from({ length: cols * rows }, (_, i) => {
        const cx = -w / 2 + (w / cols) * ((i % cols) + 0.5), cy = 1.9 + Math.floor(i / cols) * 1.1;
        return <Box key={i} p={[cx, cy, 1.01]} s={[0.5, 0.65, 0.03]} c={(i * 7) % 5 ? "#9fd0ee" : "#ffe6a8"} line={false} e="#cfeaff" ei={0.15} />;
      })}
    </group>
  );
};
export const Street: React.FC<{ float?: number; billboard?: boolean }> = ({ float = 1, billboard = false }) => {
  const sec = useSec();
  const f = float;
  return (<>
    <Box p={[0, -0.05, 4]} s={[60, 0.1, 10]} c="#5d6168" line={false} r={0.9} />
    {Array.from({ length: 12 }, (_, i) => <Box key={"m" + i} p={[-15 + i * 2.6, 0.005, 2.0]} s={[1.2, 0.01, 0.12]} c="#f2f2ea" line={false} />)}
    <Box p={[0, 0.06, -2.2]} s={[60, 0.12, 4]} c="#c9c3b8" line={false} r={0.9} />
    <Box p={[0, 0.07, -0.18]} s={[60, 0.14, 0.12]} c="#a29b90" />
    <Building x={-6.5} w={4} h={9} c="#d88a5a" /><Building x={-2.2} w={4.2} h={6.5} c="#e7c77a" />
    <Building x={2.2} w={4.2} h={8} c="#8fb3c9" /><Building x={6.6} w={4.4} h={10} c="#c98ba0" />
    <Building x={-4} w={4} h={14} c="#a9b6c2" z={-12} /><Building x={4} w={5} h={16} c="#b9a9c9" z={-13} />
    <Door p={[-2.6, 0.12, -3.97]} c="#3f7a5a" number="12" />
    <Sign p={[-6.5, 1.05, -3.97]} w={1.8} h={0.45} text="АПТЕКА" bg="#2f9e5a" fg="#ffffff" glow={0.4} />
    <Sign p={[-1.0, 1.35, -3.97]} w={1.5} h={0.45} text="КАФЕ" bg="#7a3b22" fg="#ffd88a" glow={0.4} />
    <Sign p={[2.2, 1.3, -3.97]} w={2.0} h={0.45} text="ПРОДУКТЫ" bg="#d64545" fg="#ffffff" glow={0.4} />
    <Sign p={[6.6, 1.3, -3.97]} w={1.7} h={0.45} text="КНИГИ" bg="#2f4fa8" fg="#ffffff" glow={0.4} />
    {billboard ? <Sign p={[2.2, 5.4, -3.97]} w={3.6} h={1.3} text={"ПОДПИШИСЬ\nСТАВЬ ЛАЙК"} bg="#ff3b3b" fg="#ffffff" glow={0.6} sz={58} />
      : <Sign p={[2.2, 5.4, -3.97]} w={3.4} h={1.0} text={"2026"} bg="#1d2a44" fg="#7af0ff" glow={0.6} />}
    {/* фонари */}
    {[-4.5, 0.6, 4.5].map((x) => <group key={x} position={[x, 0, -3.5]}><Box p={[0, 1.4, 0]} s={[0.08, 2.8, 0.08]} c="#3a3f46" /><Box p={[0, 2.85, 0.15]} s={[0.3, 0.1, 0.4]} c="#3a3f46" /></group>)}
    {/* парящие предметы: урна, скамейка, горшок — качаются в воздухе */}
    <group position={[-3.6, 0.3 + f * (1.1 + Math.sin(sec * 1.3) * 0.12), -1.4]} rotation={[0, 0, f * Math.sin(sec * 0.7) * 0.3]}><Box p={[0, 0.25, 0]} s={[0.35, 0.5, 0.35]} c="#3f8a4b" /></group>
    <group position={[3.4, f * (0.9 + Math.sin(sec * 1.1 + 1) * 0.1), -2.6]} rotation={[0, 0, f * 0.2]}><Bench p={[0, 0, 0]} w={1.4} /></group>
    <group position={[-0.9, f * (1.6 + Math.sin(sec * 1.7) * 0.1), -3.3]}><Plant p={[0, 0, 0]} /></group>
    {/* машины висят над дорогой */}
    <Car p={[-3.5 + ((sec * 0.25) % 2), 0.2 + f * (1.6 + Math.sin(sec * 1.4) * 0.15), 2.6]} c="#e4572e" />
    <Car p={[3.8 - ((sec * 0.2) % 2), 0.2 + f * (2.4 + Math.sin(sec * 1.1 + 2) * 0.15), 4.2]} c="#2f6fd6" rotY={Math.PI} />
    <Car p={[9, 0.2 + f * (1.2 + Math.sin(sec * 0.9 + 1) * 0.12), 1.2]} c="#f2c230" />
    <Cloud p={[-8, 11, -25]} s={2} /><Cloud p={[6, 12, -26]} s={2.2} />
  </>);
};

// ------------------------------------------------------------------ кухня 2026
export const Kitchen: React.FC<{ mess?: number; tv?: boolean; floatAmt?: number }> = ({ mess = 0, tv = true, floatAmt = 0 }) => {
  const sec = useSec();
  const fl = (k: number) => floatAmt * (0.35 + 0.1 * Math.sin(sec * 1.6 + k));
  return (<>
    <Room wall="#f2d48f" wain="#d9a85a" floor="#8d6a4c" ceil="#efe8da" sky="#a9d4f5" />
    {/* гарнитур у задней стены */}
    {[0, 1, 2, 3].map((i) => <Box key={i} p={[-1.6 + i * 0.6, 0.45, -1.7]} s={[0.58, 0.9, 0.6]} c="#5f9ea0" />)}
    <Box p={[-0.7, 0.92, -1.7]} s={[2.5, 0.05, 0.64]} c="#efe9dc" />
    {[0, 1, 2].map((i) => <Box key={"u" + i} p={[-1.4 + i * 0.6, 2.1, -1.82]} s={[0.58, 0.6, 0.35]} c="#5f9ea0" />)}
    <Box p={[-1.0, 0.96, -1.65]} s={[0.5, 0.03, 0.4]} c="#2a2d33" />
    <Fridge p={[1.0, 0, -1.65]} s={2.0} />
    <Clock p={[-0.2, 2.5, -1.99]} hh={8} mm={20} />
    {tv ? (<group position={[2.0, 1.75, -1.9]}>
      <Box p={[0, 0, 0]} s={[1.3, 0.8, 0.08]} c="#1e2126" />
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[1.18, 0.68]} /><meshBasicMaterial color="#6fa8dc" toneMapped={false} /></mesh>
      <Sign p={[0.42, -0.26, 0.05]} w={0.3} h={0.1} text="НОВОСТИ" bg="#d64545" fg="#fff" glow={0.5} sz={40} />
    </group>) : null}
    <Shelf p={[2.6, 0, -1.7]} w={0.6} h={1.2} />
    <Plant p={[-2.6, 0, -1.5]} h={0.7} />
    <Sign p={[-2.1, 1.6, -1.98]} w={0.5} h={0.65} text={"ЧАЙ\nКОФЕ"} bg="#ffffff" fg="#c0392b" glow={0.1} sz={70} />
    {/* стол и бардак на нём */}
    <group position={[0.2, 0, 0.2]}>
      <Box p={[0, 0.74, 0]} s={[1.2, 0.05, 0.75]} c="#c98c55" />
      {[-0.5, 0.5].flatMap((x) => [-0.3, 0.3].map((z) => <Box key={x + "" + z} p={[x, 0.36, z]} s={[0.06, 0.72, 0.06]} c="#7a4a2c" />))}
      <group position={[-0.3, 0.82 + fl(1), 0.05]} rotation={[0, 0, mess * 1.4]}><Box p={[0, 0, 0]} s={[0.12, 0.14, 0.12]} c="#e8e2d4" /></group>
      <group position={[0.15, 0.78 + fl(2), -0.1]} rotation={[mess * 0.3, mess * 0.8, 0]}><Box p={[0, 0, 0]} s={[0.28, 0.02, 0.28]} c="#ffffff" /></group>
      <group position={[0.35 + mess * 0.3, 0.77 + fl(3), 0.15]} rotation={[0, mess * 0.6, mess * 0.1]}><Box p={[0, 0, 0]} s={[0.3, 0.01, 0.2]} c="#fdfbf3" /></group>
      <group position={[0.42, 0.85 + fl(4), -0.2]} rotation={[0, 0, -mess * 1.5]}><Box p={[0, 0.08, 0]} s={[0.1, 0.22, 0.1]} c="#6fa8dc" /></group>
      {mess > 0.5 ? <Box p={[0.8, 0.03, 0.4]} s={[0.12, 0.06, 0.12]} c="#e8e2d4" rot={[0, 0.4, 1.5]} /> : null}
    </group>
    <Lamp p={[0.2, 2.97, 0.1]} len={0.8} />
  </>);
};

// ------------------------------------------------------------------ кабинет Ньютона, ночь 1666→1687
export const Study: React.FC<{ year?: string; yearBonk?: number; bookBonk?: number; showBook?: boolean; rocket?: number; sat?: number }> =
  ({ year = "1666", yearBonk = -1, bookBonk = -1, showBook = false, rocket = -1, sat = -1 }) => {
    const sec = useSec();
    const rk = rocket > 0 ? Math.max(0, Math.min(1, (sec - rocket) / 1.6)) : 0;
    return (<>
      <Room wall="#7b6248" wain="#5a4432" floor="#5a3f2a" ceil="#4a3a2c" window={false} />
      {/* окно с ночным небом и Луной */}
      <group position={[0.6, 1.85, -1.96]}>
        <Box p={[0, 0, 0]} s={[1.6, 1.2, 0.06]} c="#4a3423" />
        <mesh position={[0, 0, 0.035]}><planeGeometry args={[1.45, 1.05]} /><meshBasicMaterial color="#1b2a55" /></mesh>
        <mesh position={[0.4, 0.2, 0.04]}><circleGeometry args={[0.2, 32]} /><meshBasicMaterial color={[1.3, 1.25, 1.0]} toneMapped={false} /></mesh>
        {[[-0.55, 0.35], [-0.3, -0.3], [0.05, 0.4], [-0.6, -0.1], [0.6, -0.35]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.04]}><circleGeometry args={[0.015, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
        <Box p={[0, 0, 0.05]} s={[0.05, 1.05, 0.02]} c="#4a3423" /><Box p={[0, 0, 0.05]} s={[1.45, 0.05, 0.02]} c="#4a3423" />
        {rk > 0 && rk < 1 ? <group position={[-0.6 + rk * 0.95, -0.45 + rk * 0.65, 0.06]} rotation={[0, 0, -0.6]}>
          <Box p={[0, 0, 0]} s={[0.04, 0.12, 0.02]} c="#eeeeee" line={false} /><mesh position={[0, -0.08, 0]}><circleGeometry args={[0.025, 8]} /><meshBasicMaterial color={[1.5, 0.7, 0.2]} toneMapped={false} /></mesh></group> : null}
        {sat > 0 && sec > sat ? [0, 2.1, 4.2].map((ph, i) => <group key={i} position={[0.4 + Math.cos(sec * 1.5 + ph) * 0.32, 0.2 + Math.sin(sec * 1.5 + ph) * 0.18, 0.05]}>
          <Box p={[0, 0, 0]} s={[0.03, 0.03, 0.01]} c="#c9ccd1" line={false} /><Box p={[0, 0, 0]} s={[0.1, 0.015, 0.01]} c="#3d7bd6" line={false} /></group>) : null}
      </group>
      <Desk p={[0.5, 0, -1.2]} w={1.6} c="#8a5a33" leg="#5a3a22" />
      {/* свеча */}
      <group position={[0.0, 0.78, -1.2]}><Box p={[0, 0.1, 0]} s={[0.05, 0.2, 0.05]} c="#f3ead2" /><Ball p={[0, 0.24, 0]} r={0.03} c="#ffcc66" sy={1.5} e="#ffaa33" ei={3} outline={0} /></group>
      <pointLight position={[0.0, 1.2, -0.9]} intensity={4} decay={1.3} color="#ffbb66" />
      {/* песочные часы, глобус, бумаги */}
      <group position={[1.15, 0.78, -1.25]}><Box p={[0, 0.02, 0]} s={[0.14, 0.03, 0.14]} c="#7a4a2c" /><Box p={[0, 0.2, 0]} s={[0.14, 0.03, 0.14]} c="#7a4a2c" />
        <Ball p={[0, 0.07, 0]} r={0.05} c="#e8d9a8" outline={0.05} /><Ball p={[0, 0.15, 0]} r={0.05} c="#e8d9a8" outline={0.05} /></group>
      <group position={[-1.9, 0, -1.4]}><Box p={[0, 0.45, 0]} s={[0.06, 0.9, 0.06]} c="#5a3a22" /><Ball p={[0, 1.15, 0]} r={0.25} c="#4f8fbf" /></group>
      {[0, 1, 2].map((i) => <Box key={i} p={[0.75 + i * 0.12, 0.785, -1.05 - i * 0.03]} s={[0.21, 0.005, 0.28]} c="#f3ead2" rot={[0, i * 0.3, 0]} line={false} />)}
      <Shelf p={[-1.2, 0, -1.8]} w={1.0} h={1.8} />
      <group position={[2.3, 1.7, -1.97]} scale={bonkAt(sec, yearBonk)}><Sign p={[0, 0, 0]} w={0.6} h={0.4} text={year} bg="#efe3c2" fg="#3a2414" glow={0.2} /></group>
      {showBook ? <group position={[0.5, 0.95, -1.05]} rotation={[-0.3, 0, 0]} scale={bonkAt(sec, bookBonk, 0.5) * 1.3}><Book title="НАЧАЛА" /></group> : null}
    </>);
  };

// ------------------------------------------------------------------ книжный магазин 2026: полки без «Начал»
export const Bookshop: React.FC<{ floatAmt?: number; tagBonk?: number }> = ({ floatAmt = 0, tagBonk = -1 }) => {
  const sec = useSec();
  return (<>
    <Room wall="#cfe0d8" wain="#8fb3a2" floor="#6e5a8a" ceil="#efeae0" sky="#a9d4f5" />
    <Shelf p={[-1.9, 0, -1.75]} w={1.1} h={2.0} />
    <Shelf p={[1.9, 0, -1.75]} w={1.1} h={2.0} />
    <Shelf p={[0, 0, -1.75]} w={1.3} h={2.0} empty={[1, 2]} />
    <Sign p={[0, 2.55, -1.98]} w={1.8} h={0.4} text="ФИЗИКА" bg="#2f4fa8" fg="#ffffff" glow={0.3} />
    <group position={[0, 1.05, -1.55]} scale={bonkAt(sec, tagBonk)}><Sign p={[0, 0, 0]} w={0.9} h={0.42} text={"«НАЧАЛА»\nНЕТ"} bg="#fff6c9" fg="#c0392b" glow={0.3} sz={56} /></group>
    <Sign p={[-2.3, 2.5, -1.98]} w={1.0} h={0.35} text="КНИГИ" bg="#d64545" fg="#fff" glow={0.3} />
    <Plant p={[2.7, 0, -1.4]} h={0.8} />
    {/* стол с кассой и стопками */}
    <group position={[1.6, 0, 0.1]}>
      <Box p={[0, 0.45, 0]} s={[1.0, 0.9, 0.55]} c="#b8784a" />
      <group position={[0.2, 1.0 + floatAmt * (0.4 + Math.sin(sec * 1.4) * 0.08), 0]}><Box p={[0, 0, 0]} s={[0.35, 0.2, 0.3]} c="#3a3f46" /></group>
      <group position={[-0.25, 0.96 + floatAmt * (0.7 + Math.sin(sec * 1.2 + 1) * 0.1), 0]} rotation={[0, 0, floatAmt * 0.4]}><Box p={[0, 0, 0]} s={[0.3, 0.12, 0.22]} c="#e46b2b" /></group>
    </group>
    <Lamp p={[0, 2.97, 0]} len={1.6} />
  </>);
};
