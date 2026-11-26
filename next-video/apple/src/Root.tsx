import React from "react";
import { Composition, getInputProps } from "remotion";
const Q = getInputProps() as { w?: number; v?: number };   // v=1 — вертикаль 1080×1920 для шортс   // w=1280 — рендер 720p (быстрее без видеокарты)
import { Video, TOTAL } from "./Video";
export const Root: React.FC = () => <Composition id="Video" component={Video} durationInFrames={TOTAL} fps={30} width={Q.v ? 1080 : Q.w ?? 1920} height={Q.v ? 1920 : Math.round(((Q.w ?? 1920) * 9) / 16)} />;
