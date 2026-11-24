import React from "react";
import { Composition, getInputProps } from "remotion";
const Q = getInputProps() as { w?: number };   // w=1280 — рендер 720p (быстрее без видеокарты)
import { Video, TOTAL } from "./Video";
export const Root: React.FC = () => <Composition id="Video" component={Video} durationInFrames={TOTAL} fps={30} width={Q.w ?? 1920} height={Math.round(((Q.w ?? 1920) * 9) / 16)} />;
