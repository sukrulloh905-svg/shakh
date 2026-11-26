// Актёр-овощ: плоскость с канвасом, всегда смотрит в камеру; ходьба/бег по ключам, позы рук, мимика.
import React, { useContext, useMemo } from "react";
import * as THREE from "three";
import { useSec, track, Key, V3, at, FPS, ShotCtx } from "./kit";
import { drawVeg, Kind, VPW, VPH, VCW, VCH, REST, FLEX } from "./veg";

export type VActor = {
  kind: Kind; pos: V3; seed: number; s?: number;
  expr: [number, string][];
  walk?: Key[];                 // [[сек, x, z], …]
  rise?: [number, number][];    // [[сек, высота], …]
  handF?: Key[]; handB?: Key[];
  flex?: [number, number][];    // 0..1 — поза «бицепсы»
  lean?: [number, number][];
  hidden?: [number, number][];
  headset?: boolean;
  squash?: [number, number][];
  spin?: [number, number][];    // поворот плоскости в кадре (рад) — для падения/кувырка
};

export const vAt = (a: VActor, t: number) => {
  const xz = a.walk ? track(t, a.walk, true) : [a.pos[0], a.pos[2]];
  const y = a.rise ? at(t, a.rise) : a.pos[1];
  // скорость для шага
  const d = 1 / FPS;
  const xz2 = a.walk ? track(t + d, a.walk, true) : xz;
  const v = Math.hypot(xz2[0] - xz[0], xz2[1] - xz[1]) / d;
  return { pos: [xz[0], y, xz[1]] as V3, v };
};

export const Veg: React.FC<{ a: VActor }> = ({ a }) => {
  const sec = useSec();
  const { cam } = useContext(ShotCtx);
  const { canvas, tex } = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = VCW; cv.height = VCH;
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { canvas: cv, tex: t };
  }, []);
  const t = sec;
  if (a.hidden?.some(([s, e]) => t >= s && t < e)) return null;
  let ex = a.expr[0][1]; for (const [tt, e] of a.expr) if (t >= tt) ex = e;
  const { pos, v } = vAt(a, t);
  // фаза шага — интеграл скорости (приближённо: по времени с частотой от скорости)
  const moving = Math.min(1, v / 0.6);
  const walkPh = t * (6 + Math.min(v, 4) * 2.5);
  const R = REST[a.kind], F = FLEX[a.kind];
  const fl = a.flex ? at(t, a.flex) : 0;
  const idle = (h: [number, number], k: number): [number, number] => [h[0] + Math.sin(t * 1.7 + a.seed + k) * 0.02, h[1] + Math.sin(t * 2.3 + a.seed * 1.7 + k) * 0.02];
  const mix = (r: [number, number], f: [number, number]): [number, number] => [r[0] + (f[0] - r[0]) * fl, r[1] + (f[1] - r[1]) * fl];
  // руки при беге — машут
  const swing = moving * 0.12;
  let hF: [number, number] = a.handF ? track(t, a.handF) : mix(R.f, F.f);
  let hB: [number, number] = a.handB ? track(t, a.handB) : mix(R.b, F.b);
  hF = idle([hF[0] + Math.sin(walkPh) * swing, hF[1] + Math.cos(walkPh) * swing * 0.5], 0);
  hB = idle([hB[0] - Math.sin(walkPh) * swing, hB[1] - Math.cos(walkPh) * swing * 0.5], 2);
  drawVeg(canvas.getContext("2d")!, a.kind, {
    expr: ex, blink: ((Math.floor(t * FPS) + a.seed * 37) % 97) < 3, walk: walkPh, walkAmp: moving * 0.9,
    lean: (a.lean ? at(t, a.lean) : 0) + moving * 0.12 + Math.sin(t * 0.9 + a.seed) * 0.03, tilt: Math.sin(t * 1.1 + a.seed) * 0.04,
    breathe: Math.sin(t * 2.2 + a.seed), handF: hF, handB: hB, headset: a.headset, flex: fl,
    squash: a.squash ? at(t, a.squash) : 1,
  });
  tex.needsUpdate = true;
  const s = a.s ?? 1;
  const bob = moving * Math.abs(Math.sin(walkPh)) * 0.05 * s;
  const yaw = Math.atan2(cam.x - pos[0], cam.z - pos[2]);
  const spin = a.spin ? at(t, a.spin) : 0;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, yaw, 0]} scale={s}>
      <mesh position={[0, VPH / 2, 0]} rotation={[0, 0, spin]} castShadow receiveShadow>
        <planeGeometry args={[VPW, VPH]} />
        <meshLambertMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.45} transparent alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// предмет в 3D-точке руки актёра
export const InHand: React.FC<{ a: VActor; side: "f" | "b"; off?: V3; children: React.ReactNode }> = ({ a, side, off = [0, 0, 0], children }) => {
  const sec = useSec();
  const { cam } = useContext(ShotCtx);
  const { pos } = vAt(a, sec);
  const R = REST[a.kind], F = FLEX[a.kind];
  const fl = a.flex ? at(sec, a.flex) : 0;
  const mix = (r: [number, number], f: [number, number]): [number, number] => [r[0] + (f[0] - r[0]) * fl, r[1] + (f[1] - r[1]) * fl];
  const h = side === "f" ? (a.handF ? track(sec, a.handF) : mix(R.f, F.f)) : (a.handB ? track(sec, a.handB) : mix(R.b, F.b));
  const s = a.s ?? 1;
  const yaw = Math.atan2(cam.x - pos[0], cam.z - pos[2]);
  const rx = Math.cos(yaw), rz = -Math.sin(yaw), nx = Math.sin(yaw), nz = Math.cos(yaw);
  const p: V3 = [pos[0] + rx * (h[0] + off[0]) * s + nx * (0.08 + off[2]), pos[1] + (h[1] + off[1]) * s, pos[2] + rz * (h[0] + off[0]) * s + nz * (0.08 + off[2])];
  return <group position={p} rotation={[0, yaw, 0]}>{children}</group>;
};
