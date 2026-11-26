// Декорации ролика «Яблоко против помидора»: сад, огород, качалка, компьютерный клуб, район, стол с пловом.
import React from "react";
import { Box, Ball, Apple, Sign, Bench, Plant, useSec, bonkAt, V3, IS_EN } from "./kit";
import { Tree, Cloud } from "./places";

export const T = (ru: string, en: string) => (IS_EN ? en : ru);

// ------------------------------------------------------------ общее: земля, трава, дымка
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const Fog: React.FC<{ c?: string; near?: number; far?: number }> = ({ c = "#cfe6f5", near = 9, far = 34 }) => <fog attach="fog" args={[c, near, far]} />;
export const Ground: React.FC<{ c?: string; size?: number }> = ({ c = "#79b54a", size = 80 }) => (
  <Box p={[0, -0.05, -10]} s={[size, 0.1, size]} c={c} line={false} r={0.95} />
);
export const Grass: React.FC<{ n?: number; area?: [number, number, number, number]; c?: string }> = ({ n = 70, area = [-8, 8, -9, 3], c = "#5f9e3a" }) => {
  const sec = useSec();
  return (<>{Array.from({ length: n }, (_, i) => {
    const x = area[0] + rnd(i) * (area[1] - area[0]), z = area[2] + rnd(i + 99) * (area[3] - area[2]);
    const h = 0.12 + rnd(i + 7) * 0.12, sw = Math.sin(sec * 1.6 + i) * 0.12;
    return <group key={i} position={[x, 0, z]} rotation={[0, rnd(i + 3) * 3, sw]}>
      <Box p={[0, h / 2, 0]} s={[0.03, h, 0.03]} c={c} line={false} />
      <Box p={[0.04, h * 0.4, 0]} s={[0.025, h * 0.8, 0.025]} c={c} line={false} rot={[0, 0, -0.4]} />
      <Box p={[-0.04, h * 0.4, 0]} s={[0.025, h * 0.8, 0.025]} c={c} line={false} rot={[0, 0, 0.4]} />
    </group>;
  })}</>);
};
export const Hills: React.FC = () => (<>
  <Ball p={[-14, -5, -30]} r={11} c="#6aa84a" outline={0} sy={0.55} />
  <Ball p={[12, -6, -32]} r={13} c="#74b052" outline={0} sy={0.5} />
  <Ball p={[0, -7, -38]} r={14} c="#82ba5a" outline={0} sy={0.45} />
  <Cloud p={[-9, 9, -26]} s={2} /><Cloud p={[7, 10, -28]} s={2.4} /><Cloud p={[0, 12, -34]} s={2.2} />
</>);
export const Fence: React.FC<{ x0: number; x1: number; z: number; gap?: [number, number] }> = ({ x0, x1, z, gap }) => (<>
  {Array.from({ length: Math.floor((x1 - x0) / 0.5) + 1 }, (_, i) => x0 + i * 0.5).filter((x) => !gap || x < gap[0] || x > gap[1]).map((x) =>
    <Box key={x} p={[x, 0.45, z]} s={[0.12, 0.9, 0.06]} c="#b88a55" />)}
  {[0.3, 0.65].map((y) => gap
    ? [[x0, gap[0]], [gap[1], x1]].map(([a, b]) => <Box key={y + "" + a} p={[(a + b) / 2, y, z + 0.05]} s={[b - a, 0.08, 0.04]} c="#9a6d3c" />)
    : <Box key={y} p={[(x0 + x1) / 2, y, z + 0.05]} s={[x1 - x0, 0.08, 0.04]} c="#9a6d3c" />)}
</>);
const Bush: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#4c8a35" }) => (
  <group position={p} scale={s}><Ball p={[0, 0.3, 0]} r={0.42} c={c} outline={0.04} /><Ball p={[0.35, 0.22, 0.1]} r={0.3} c={c} outline={0.04} /><Ball p={[-0.32, 0.2, 0.05]} r={0.28} c={c} outline={0.04} /></group>
);

// ------------------------------------------------------------ сад (яблоня)
export const Orchard: React.FC = () => (<>
  <Ground /><Hills /><Grass n={90} area={[-7, 7, -8, 3]} />
  <Tree p={[0, 0, -1.2]} />
  <Tree p={[-5.5, 0, -6]} /><Tree p={[5, 0, -7]} /><Tree p={[-2.5, 0, -11]} apples={false} /><Tree p={[8, 0, -12]} apples={false} />
  {/* тропинка к огороду */}
  {Array.from({ length: 14 }, (_, i) => <Box key={i} p={[1.0 + i * 0.75, 0.005, 0.4 - i * 0.05]} s={[0.7, 0.02, 0.6]} c="#b99a6a" line={false} r={0.9} />)}
  <Bush p={[-2.2, 0, 0.3]} /><Bush p={[3.4, 0, -2.6]} s={0.8} /><Bush p={[-3.8, 0, -3]} s={1.2} />
  <Fence x0={-9} x1={9} z={-4.5} />
</>);

// ------------------------------------------------------------ огород
const Bed: React.FC<{ p: V3; len?: number }> = ({ p, len = 3 }) => (
  <group position={p}>
    <Box p={[0, 0.08, 0]} s={[len, 0.16, 0.7]} c="#6b4628" line={false} r={0.85} />
    {[-0.18, 0.18].map((z) => <Box key={z} p={[0, 0.165, z]} s={[len - 0.1, 0.03, 0.08]} c="#4e321c" line={false} />)}
  </group>
);
export const TomatoPlant: React.FC<{ p: V3; n?: number }> = ({ p, n = 3 }) => {
  const sec = useSec();
  return (
    <group position={p} rotation={[0, 0, Math.sin(sec * 1.2 + p[0]) * 0.03]}>
      <Box p={[0, 0.55, 0]} s={[0.04, 1.1, 0.04]} c="#c9a46a" />
      <Ball p={[0, 0.55, 0]} r={0.28} c="#3f8a2e" outline={0.04} sy={1.4} />
      <Ball p={[0.12, 0.85, 0.05]} r={0.2} c="#4a9a35" outline={0.04} />
      {Array.from({ length: n }, (_, i) => <Ball key={i} p={[Math.cos(i * 2.1) * 0.22, 0.35 + i * 0.2, Math.sin(i * 2.1) * 0.22 + 0.08]} r={0.07} c="#e23a2a" outline={0.08} />)}
    </group>
  );
};
const Cabbage: React.FC<{ p: V3 }> = ({ p }) => <group position={p}><Ball p={[0, 0.16, 0]} r={0.18} c="#9fd36a" outline={0.05} /><Ball p={[0, 0.12, 0]} r={0.26} c="#6fb24a" outline={0.04} sy={0.55} /></group>;
export const Shed: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Box p={[0, 1.0, 0]} s={[2.2, 2.0, 1.8]} c="#a8693a" />
    <Box p={[0, 2.2, 0]} s={[2.5, 0.25, 2.1]} c="#7a3b2a" rot={[0, 0, 0]} />
    <Box p={[0.3, 0.75, 0.91]} s={[0.7, 1.4, 0.03]} c="#6e3f22" />
    <Box p={[-0.6, 1.3, 0.91]} s={[0.45, 0.4, 0.03]} c="#9fd0ee" e="#cfeaff" ei={0.2} />
  </group>
);
export const Ogorod: React.FC<{ gate?: boolean }> = ({ gate = true }) => (<>
  <Ground c="#7cb34c" /><Hills /><Grass n={60} area={[-8, 8, -2, 4]} />
  {/* поле за забором */}
  <Box p={[0, 0.01, -3.6]} s={[11, 0.02, 4.4]} c="#7a5232" line={false} />
  {[-2.0, -3.0, -4.0, -5.0].map((z, i) => <Bed key={z} p={[i % 2 ? -1.8 : 1.6, 0, z]} len={3.6} />)}
  {[-2.0, -3.0, -4.0, -5.0].map((z, i) => <Bed key={"b" + z} p={[i % 2 ? 2.4 : -2.6, 0, z]} len={2.6} />)}
  {[[0.4, -2.0], [1.3, -2.0], [2.2, -2.0], [-1.5, -4.0], [-0.6, -4.0], [0.3, -4.0]].map(([x, z], i) => <TomatoPlant key={i} p={[x, 0.16, z]} n={2 + (i % 3)} />)}
  {[[-3.4, -3.0], [-2.6, -3.0], [-1.8, -3.0], [2.0, -5.0], [3.0, -5.0], [-3.0, -5.0]].map(([x, z], i) => <Cabbage key={i} p={[x, 0.16, z]} />)}
  <Fence x0={-6} x1={6} z={-1.2} gap={gate ? [-0.7, 0.7] : undefined} />
  {gate ? <><Box p={[-0.78, 0.7, -1.2]} s={[0.16, 1.4, 0.16]} c="#8a5a30" /><Box p={[0.78, 0.7, -1.2]} s={[0.16, 1.4, 0.16]} c="#8a5a30" />
    <Sign p={[0, 1.55, -1.18]} w={1.5} h={0.42} text={T("ОГОРОД", "GARDEN")} bg="#f2d27a" fg="#5a3018" glow={0.2} /></> : null}
  <Shed p={[-4.6, 0, -6.2]} />
  <Tree p={[5.6, 0, -7]} apples={false} /><Tree p={[-7.5, 0, -10]} apples={false} />
  <Bush p={[4.2, 0, -0.6]} /><Bush p={[-4.4, 0, -0.4]} s={1.1} />
  {/* лейка и бочка */}
  <group position={[3.2, 0, -1.6]}><Box p={[0, 0.35, 0]} s={[0.5, 0.7, 0.5]} c="#3e7fb8" r={0.9} /><Box p={[0, 0.72, 0]} s={[0.54, 0.05, 0.54]} c="#2b5c8a" /></group>
</>);

// ------------------------------------------------------------ качалка
export const Dumbbell: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <group scale={s}><Box p={[0, 0, 0]} s={[0.3, 0.04, 0.04]} c="#9aa0a8" metal={0.6} />
    {[-0.15, 0.15].map((x) => <Box key={x} p={[x, 0, 0]} s={[0.07, 0.16, 0.16]} c="#2a2a30" r={0.6} />)}</group>
);
export const Barbell: React.FC<{ w?: number }> = ({ w = 1.4 }) => (
  <group><Box p={[0, 0, 0]} s={[w, 0.05, 0.05]} c="#b8bec6" metal={0.7} />
    {[-1, 1].map((d) => <group key={d}><Box p={[d * (w / 2 - 0.12), 0, 0]} s={[0.08, 0.5, 0.5]} c="#c43a3a" r={0.8} /><Box p={[d * (w / 2 - 0.22), 0, 0]} s={[0.07, 0.38, 0.38]} c="#2a2a30" r={0.8} /></group>)}</group>
);
export const Gym: React.FC = () => (<>
  <Box p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#3a3d44" line={false} />
  {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[-5 + i * 2, 0.005, -1]} s={[1.9, 0.01, 8]} c={i % 2 ? "#33363c" : "#3e4249"} line={false} />)}
  <Box p={[0, 2, -4]} s={[12, 4, 0.2]} c="#c9c2b4" />
  <Box p={[-6, 2, 0]} s={[0.2, 4, 10]} c="#bfb7a8" />
  <Box p={[0, 3.2, -3.88]} s={[12, 0.25, 0.04]} c="#d64545" line={false} />
  {/* зеркало */}
  <Box p={[1.2, 1.4, -3.88]} s={[4.2, 2.0, 0.04]} c="#a8c8dc" metal={0.8} e="#cfe8ff" ei={0.15} />
  <Sign p={[-3.2, 2.5, -3.86]} w={2.2} h={0.6} text={T("КАЧАЛКА", "GYM")} bg="#1d1d24" fg="#ffcf3a" glow={0.5} />
  {/* стойка с гантелями */}
  <group position={[-3.6, 0, -3.2]}>
    <Box p={[0, 0.45, 0]} s={[2.0, 0.08, 0.5]} c="#2a2a30" />{[-0.9, 0.9].map((x) => <Box key={x} p={[x, 0.22, 0]} s={[0.08, 0.45, 0.45]} c="#2a2a30" />)}
    {Array.from({ length: 5 }, (_, i) => <group key={i} position={[-0.8 + i * 0.4, 0.55, 0]} rotation={[0, Math.PI / 2, 0]}><Dumbbell s={0.8 + i * 0.08} /></group>)}
  </group>
  {/* скамья */}
  <group position={[3.4, 0, -2.0]}><Box p={[0, 0.45, 0]} s={[0.4, 0.1, 1.4]} c="#1f1f26" /><Box p={[0, 0.22, -0.5]} s={[0.1, 0.45, 0.1]} c="#8a8f98" /><Box p={[0, 0.22, 0.5]} s={[0.1, 0.45, 0.1]} c="#8a8f98" />
    {[-0.55, 0.55].map((x) => <Box key={x} p={[x, 0.9, -0.55]} s={[0.08, 1.8, 0.08]} c="#8a8f98" />)}
    <group position={[0, 1.4, -0.55]}><Barbell w={1.6} /></group></group>
  {/* лампы */}
  {[-3, 0, 3].map((x) => <Box key={x} p={[x, 3.9, -1]} s={[1.4, 0.06, 0.25]} c="#fffbe6" e="#fff6d0" ei={1.2} line={false} />)}
</>);

// ------------------------------------------------------------ компьютерный клуб
export const PCDesk: React.FC<{ p: V3; screen?: string; glow?: number }> = ({ p, screen = "#2f6fd6", glow = 0.9 }) => {
  const sec = useSec();
  return (
    <group position={p}>
      <Box p={[0, 0.74, 0]} s={[1.3, 0.06, 0.7]} c="#1c1c24" />
      {[-0.6, 0.6].map((x) => <Box key={x} p={[x, 0.37, 0]} s={[0.05, 0.74, 0.6]} c="#15151b" />)}
      <Box p={[0, 1.12, -0.22]} s={[0.9, 0.52, 0.04]} c="#0d0d12" />
      <Box p={[0, 1.12, -0.198]} s={[0.84, 0.46, 0.01]} c={screen} e={screen} ei={glow + Math.sin(sec * 7 + p[0]) * 0.08} line={false} />
      {/* прицел и силуэты на экране */}
      <Box p={[0, 1.12, -0.19]} s={[0.06, 0.008, 0.005]} c="#7CFF6B" e="#7CFF6B" ei={1} line={false} />
      <Box p={[0, 1.12, -0.19]} s={[0.008, 0.06, 0.005]} c="#7CFF6B" e="#7CFF6B" ei={1} line={false} />
      <Box p={[0.22, 1.02, -0.19]} s={[0.25, 0.12, 0.005]} c="#c9a46a" line={false} />
      <Box p={[-0.25, 1.05, -0.19]} s={[0.18, 0.2, 0.005]} c="#8b6a45" line={false} />
      <Box p={[0, 0.85, -0.22]} s={[0.08, 0.2, 0.06]} c="#0d0d12" />
      <Box p={[-0.05, 0.78, 0.1]} s={[0.55, 0.025, 0.18]} c="#24242e" e="#ff3b9a" ei={0.25} />
      <Box p={[0.38, 0.775, 0.12]} s={[0.1, 0.03, 0.14]} c="#24242e" />
      <Box p={[0.55, 0.95, -0.05]} s={[0.2, 0.42, 0.42]} c="#121218" e="#38e0ff" ei={0.2} />
    </group>
  );
};
const GameChair: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Box p={[0, 0.48, 0]} s={[0.55, 0.1, 0.55]} c="#1a1a22" /><Box p={[0, 0.95, 0.26]} s={[0.55, 0.9, 0.1]} c="#1a1a22" />
    <Box p={[0, 1.0, 0.315]} s={[0.12, 0.7, 0.01]} c="#e23a3a" line={false} />
    <Box p={[0, 0.24, 0]} s={[0.06, 0.45, 0.06]} c="#55555f" />
  </group>
);
export const Club: React.FC = () => (<>
  <Box p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#1d1b26" line={false} />
  <Box p={[0, 2, -3.2]} s={[12, 4, 0.2]} c="#2a2738" />
  <Box p={[-5, 2, 0]} s={[0.2, 4, 10]} c="#262335" />
  {/* неоновые полосы */}
  <Box p={[0, 2.6, -3.08]} s={[11, 0.05, 0.03]} c="#ff3b9a" e="#ff3b9a" ei={1.6} line={false} />
  <Box p={[0, 0.06, -3.08]} s={[11, 0.04, 0.03]} c="#38e0ff" e="#38e0ff" ei={1.6} line={false} />
  <Sign p={[0.0, 3.2, -3.06]} w={2.6} h={0.6} text={T("КОМПЫ 24/7", "CYBER CAFÉ")} bg="#120f1c" fg="#38e0ff" glow={1.2} />
  {[-3.0, -1.5, 0, 1.5, 3.0].map((x, i) => <PCDesk key={x} p={[x, 0, -2.4]} screen={["#2f6fd6", "#c9a46a", "#3a8a5a", "#8f5ad6", "#2f6fd6"][i]} />)}
  {[-3.0, -1.5, 1.5, 3.0].map((x) => <GameChair key={x} p={[x, 0, -1.55]} />)}
  {/* второй ряд */}
  {[-2.2, -0.7, 0.8, 2.3].map((x) => <group key={x} position={[x, 0, 1.6]} rotation={[0, Math.PI, 0]}><PCDesk p={[0, 0, 0]} screen="#3a7ad6" glow={0.7} /></group>)}
  {[-2, 1, 4].map((x) => <Box key={x} p={[x, 3.95, 0]} s={[0.9, 0.05, 0.2]} c="#c9b8ff" e="#c9b8ff" ei={0.8} line={false} />)}
</>);

// ------------------------------------------------------------ район (двор)
const Block: React.FC<{ x: number; z: number; w: number; h: number; c: string }> = ({ x, z, w, h, c }) => (
  <group position={[x, 0, z]}>
    <Box p={[0, h / 2, 0]} s={[w, h, 2]} c={c} />
    {Array.from({ length: Math.floor(w / 0.9) * Math.floor((h - 0.8) / 1.0) }, (_, i) => {
      const cols = Math.floor(w / 0.9), cx = -w / 2 + (w / cols) * ((i % cols) + 0.5), cy = 1.2 + Math.floor(i / cols) * 1.0;
      return <Box key={i} p={[cx, cy, 1.01]} s={[0.48, 0.6, 0.03]} c={(i * 7) % 5 ? "#9fd0ee" : "#ffe6a8"} line={false} e="#cfeaff" ei={0.12} />;
    })}
  </group>
);
export const Pump: React.FC<{ h?: number }> = ({ h = 0 }) => (
  <group><Box p={[0, 0.28, 0]} s={[0.09, 0.56, 0.09]} c="#2f6fd6" r={0.8} /><Box p={[0, 0.02, 0]} s={[0.28, 0.03, 0.08]} c="#2a2a30" />
    <Box p={[0, 0.6 + h * 0.25, 0]} s={[0.025, 0.25, 0.025]} c="#9aa0a8" /><Box p={[0, 0.72 + h * 0.25, 0]} s={[0.3, 0.04, 0.05]} c="#2a2a30" /></group>
);
export const Yard: React.FC = () => (<>
  <Box p={[0, -0.05, -6]} s={[40, 0.1, 30]} c="#9a958c" line={false} r={0.9} />
  <Box p={[0, -0.01, 1]} s={[40, 0.02, 4]} c="#6e6b66" line={false} />
  <Block x={-6} z={-9} w={6} h={9} c="#d8b48a" /><Block x={1} z={-10} w={7} h={11} c="#c9d0d8" /><Block x={8} z={-8.5} w={5} h={8} c="#e3a08a" />
  {/* гаражи */}
  {[-3.6, -1.6, 0.4].map((x, i) => <group key={x} position={[x, 0, -4.2]}><Box p={[0, 1.0, 0]} s={[1.9, 2.0, 2.4]} c={["#7a8a9a", "#8a7a6a", "#6a8a7a"][i]} /><Box p={[0, 0.85, 1.21]} s={[1.6, 1.6, 0.03]} c="#5a6672" /></group>)}
  <Sign p={[-1.6, 2.25, -2.95]} w={2.6} h={0.42} text={T("МОЙ РАЙОН", "MY HOOD")} bg="#e23a3a" fg="#ffffff" glow={0.3} />
  <Bench p={[3.2, 0, -2.2]} rotY={-0.3} />
  {/* турник */}
  <group position={[4.8, 0, -3.4]}>{[-0.7, 0.7].map((x) => <Box key={x} p={[x, 1.1, 0]} s={[0.08, 2.2, 0.08]} c="#3a5f8a" />)}<Box p={[0, 2.15, 0]} s={[1.5, 0.05, 0.05]} c="#9aa0a8" /></group>
  <Tree p={[-8, 0, -5]} apples={false} /><Tree p={[9.5, 0, -4.5]} apples={false} />
  <Plant p={[2.2, 0, -3.6]} />
  <Cloud p={[-6, 13, -26]} s={2} /><Cloud p={[8, 14, -28]} s={2.3} />
</>);

// ------------------------------------------------------------ стол с пловом и салатом
export const Kazan: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => {
  const sec = useSec();
  return (
    <group position={p} scale={s}>
      <Ball p={[0, 0.16, 0]} r={0.3} c="#2b2a30" outline={0.04} sy={0.6} />
      <Box p={[0, 0.32, 0]} s={[0.58, 0.04, 0.58]} c="#1f1e24" r={1} />
      <Ball p={[0, 0.3, 0]} r={0.26} c="#e9b04a" outline={0.03} sy={0.35} />
      {Array.from({ length: 10 }, (_, i) => <Box key={i} p={[Math.cos(i * 2.4) * 0.16, 0.37, Math.sin(i * 2.4) * 0.16]} s={[0.07, 0.03, 0.03]} c="#f08a2a" line={false} />)}
      {[0, 1].map((k) => <Ball key={k} p={[-0.05 + k * 0.1, 0.38, 0.02]} r={0.06} c="#8a4a2a" outline={0.06} />)}
      {/* пар */}
      {[0, 1, 2].map((k) => { const u = ((sec * 0.5 + k / 3) % 1); return <Ball key={"s" + k} p={[Math.sin(u * 6 + k) * 0.06, 0.42 + u * 0.45, 0]} r={0.035 * (1 - u) + 0.01} c="#f4f4f4" outline={0} sy={1.4} />; })}
    </group>
  );
};
export const SaladBowl: React.FC<{ p: V3; full?: number }> = ({ p, full = 0 }) => (
  <group position={p}>
    <Ball p={[0, 0.1, 0]} r={0.22} c="#f2efe6" outline={0.05} sy={0.5} />
    <Box p={[0, 0.2, 0]} s={[0.4, 0.02, 0.4]} c="#e2ded2" r={1} />
    {full > 0 ? Array.from({ length: 8 }, (_, i) => <Ball key={i} p={[Math.cos(i * 2.2) * 0.12, 0.22, Math.sin(i * 2.2) * 0.12]} r={0.045 * full} c={i % 2 ? "#e23a2a" : "#5fb84a"} outline={0.08} />) : null}
  </group>
);
export const Table: React.FC<{ p: V3; children?: React.ReactNode }> = ({ p, children }) => (
  <group position={p}>
    <Box p={[0, 0.72, 0]} s={[2.0, 0.08, 1.1]} c="#b8784a" />
    {[[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].map(([x, z]) => <Box key={x + "" + z} p={[x, 0.36, z]} s={[0.08, 0.72, 0.08]} c="#7a4a2c" />)}
    <Box p={[0, 0.765, 0]} s={[1.7, 0.01, 0.9]} c="#e9f0f6" line={false} />
    {[...Array(5)].map((_, i) => <Box key={i} p={[-0.8 + i * 0.4, 0.772, 0]} s={[0.2, 0.004, 0.9]} c="#d64545" line={false} />)}
    <group position={[0, 0.77, 0]}>{children}</group>
  </group>
);

// ------------------------------------------------------------ 3D-кнопки «подписаться» и «лайк», табличка «часть 2»
export const SubButton: React.FC<{ p: V3; t: number; pressed?: number }> = ({ p, t, pressed = -1 }) => {
  const sec = useSec();
  if (sec < t) return null;
  const k = Math.min(1, (sec - t) / 0.35), s = (1 - Math.pow(1 - k, 3)) * bonkAt(sec, t + 0.35, 0.2);
  const on = pressed > 0 && sec > pressed;
  return (
    <group position={[p[0], p[1] + Math.sin(sec * 1.8) * 0.04, p[2]]} scale={s}>
      <Box p={[0, 0, -0.04]} s={[2.0, 0.52, 0.12]} c={on ? "#7a7a80" : "#e62117"} r={0.9} />
      <Sign p={[0, 0, 0.03]} w={1.8} h={0.4} text={on ? T("ВЫ ПОДПИСАНЫ", "SUBSCRIBED") : T("ПОДПИСАТЬСЯ", "SUBSCRIBE")} bg={on ? "#7a7a80" : "#e62117"} fg="#ffffff" glow={0.6} sz={56} />
    </group>
  );
};
export const Like: React.FC<{ p: V3; t: number }> = ({ p, t }) => {
  const sec = useSec();
  if (sec < t) return null;
  const k = Math.min(1, (sec - t) / 0.35), s = (1 - Math.pow(1 - k, 3)) * bonkAt(sec, t + 0.35, 0.25);
  return (
    <group position={[p[0], p[1] + Math.sin(sec * 2.1 + 1) * 0.05, p[2]]} scale={s} rotation={[0, Math.sin(sec * 1.3) * 0.25, 0]}>
      <Ball p={[0, 0, 0]} r={0.36} c="#2f7bff" outline={0.05} />
      <Box p={[0.04, -0.05, 0.32]} s={[0.26, 0.24, 0.08]} c="#ffffff" r={0.6} line={false} />
      <Box p={[0.0, 0.14, 0.32]} s={[0.1, 0.24, 0.08]} c="#ffffff" r={0.6} line={false} rot={[0, 0, -0.35]} />
      <Box p={[-0.14, -0.05, 0.3]} s={[0.06, 0.2, 0.08]} c="#ffffff" line={false} />
    </group>
  );
};
export const Part2: React.FC<{ p: V3; t: number }> = ({ p, t }) => {
  const sec = useSec();
  if (sec < t) return null;
  const k = Math.min(1, (sec - t) / 0.4), s = (1 - Math.pow(1 - k, 3)) * bonkAt(sec, t + 0.4, 0.2);
  return (
    <group position={[p[0], p[1] + Math.sin(sec * 1.5) * 0.05, p[2]]} scale={s} rotation={[0, Math.sin(sec * 0.9) * 0.15, 0]}>
      <Box p={[0, 0, -0.05]} s={[2.0, 0.8, 0.12]} c="#ffcf3a" r={0.9} />
      <Sign p={[0, 0, 0.03]} w={1.8} h={0.66} text={T("ЧАСТЬ 2", "PART 2")} bg="#ffcf3a" fg="#2a1d1a" glow={0.4} sz={120} />
    </group>
  );
};
export const Dust: React.FC<{ p: V3; t: number; n?: number }> = ({ p, t, n = 14 }) => {
  const sec = useSec();
  const u = sec - t;
  if (u < 0 || u > 1.2) return null;
  return (<>{Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, r = u * (0.6 + rnd(i) * 0.6);
    return <Ball key={i} p={[p[0] + Math.cos(a) * r, p[1] + 0.05 + u * 0.3 * rnd(i + 5), p[2] + Math.sin(a) * r * 0.5]} r={0.08 * (1 - u / 1.2) + 0.02} c="#e9dcc4" outline={0} />;
  })}</>);
};
export { Apple };
