// ScriptReel — the generic reels-scripting → video composition. It renders a
// reel-[slug].md (hook / points / CTA) as a vertical 1080x1920 reel, reusing the
// project's own KineticCaptions (word-level VO-tracked captions) and FitText
// (anti-truncation headline sizing). Background is a self-contained animated
// gradient (no three.js) so a headless render never depends on the GLSL/three
// bundle. Pass `voSrc` (a public/ path) to lay a voiceover under it; pass
// `voDurS` so Root's calculateMetadata sizes the composition to the VO length.
import React from 'react';
import {
  AbsoluteFill, Audio, Series, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
} from 'remotion';
import { FontLoader } from './font';
import { FitText } from './components/FitText';
import { KineticCaptions } from './components/KineticCaptions';

export interface ScriptReelProps {
  title?: string;
  hook: string;
  points: string[];
  cta: string;
  caption?: string;
  trigger?: string;
  accentA?: string;
  accentB?: string;
  voSrc?: string;
  voDurS?: number;
}

const FONT = 'Inter, "Helvetica Neue", system-ui, sans-serif';
const words = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;

// Drifting radial-gradient orbs — the animated backdrop, fully self-contained.
const Backdrop: React.FC<{ accentA: string; accentB: string }> = ({ accentA, accentB }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const o1x = Math.sin(frame / 58) * 90, o1y = Math.cos(frame / 72) * 70;
  const o2x = Math.cos(frame / 50) * 110, o2y = Math.sin(frame / 66) * 90;
  const breathe = Math.sin(frame / 40) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05030D', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, left: '50%', width: 1000, height: 1000, marginLeft: -500, borderRadius: '50%', background: `radial-gradient(circle, ${accentA}55 0%, ${accentA}00 62%)`, filter: 'blur(70px)', transform: `translate(${o1x}px, ${o1y}px) scale(${1 + breathe * 0.08})` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -120, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${accentB}4d 0%, ${accentB}00 60%)`, filter: 'blur(80px)', transform: `translate(${o2x}px, ${o2y}px) scale(${1 + breathe * 0.08})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', top: height - 6, left: 0, width, height: 6 }} />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const y = interpolate(s, [0, 1], [40, 0]);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px' }}>
      <div style={{ opacity: s, transform: `translateY(${y}px)`, textAlign: 'center', color: '#fff' }}>
        <div style={{ marginBottom: 28, fontFamily: 'Consolas, monospace', fontSize: 26, letterSpacing: 6, color: accent, textTransform: 'uppercase' }}>REEL</div>
        <FitText text={text} width={940} maxFontSize={128} minFontSize={54} maxLines={4} fontFamily={FONT} fontWeight={900} letterSpacing="-0.02em" style={{ margin: '0 auto', textAlign: 'center', textShadow: `0 0 50px ${accent}55` }} />
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ cta: string; trigger?: string; accent: string }> = ({ cta, trigger, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const arrow = Math.sin(frame / 6) * 6;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.84, 1])})`, textAlign: 'center' }}>
        <FitText text={cta} width={920} maxFontSize={72} minFontSize={40} maxLines={3} fontFamily={FONT} fontWeight={800} style={{ margin: '0 auto 40px', textAlign: 'center', color: '#fff' }} />
        {trigger ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, borderRadius: 28, padding: '30px 48px', color: '#fff', fontFamily: FONT, fontSize: 44, fontWeight: 800, boxShadow: `0 26px 70px ${accent}66` }}>
            Comment <span style={{ background: 'rgba(0,0,0,0.38)', padding: '6px 22px', borderRadius: 14, fontFamily: 'Consolas, monospace' }}>{trigger}</span>
            <span style={{ display: 'inline-block', transform: `translateX(${arrow}px)` }}>→</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Split the composition's frames across hook + points + CTA, weighted by word
// count so denser sections hold longer. Sums exactly to durationInFrames.
const allocate = (total: number, weights: number[]) => {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => Math.max(1, Math.floor((total * w) / sum)));
  const drift = total - out.reduce((a, b) => a + b, 0);
  out[out.length - 1] += drift;
  return out;
};

export const ScriptReel: React.FC<ScriptReelProps> = ({
  title, hook, points = [], cta, trigger,
  accentA = '#8B5CF6', accentB = '#22D3EE', voSrc,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const safePoints = points.length ? points : [''];

  const weights = [words(hook) + 6, ...safePoints.map((p) => words(p) + 6), words(cta) + 6];
  const frames = allocate(durationInFrames, weights);
  const hookF = frames[0];
  const pointF = frames.slice(1, 1 + safePoints.length);
  const ctaF = frames[frames.length - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: '#05030D', fontFamily: FONT }}>
      <FontLoader />
      {voSrc ? <Audio src={staticFile(voSrc)} /> : null}
      <Backdrop accentA={accentA} accentB={accentB} />
      <Series>
        <Series.Sequence durationInFrames={hookF}>
          <Hook text={hook} accent={accentA} />
        </Series.Sequence>
        {safePoints.map((p, i) => (
          <Series.Sequence key={i} durationInFrames={pointF[i]}>
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', color: accentB, fontFamily: 'Consolas, monospace', fontSize: 30, letterSpacing: 6 }}>{`POINT ${i + 1}`}</div>
              <KineticCaptions text={p} audioDurFrames={pointF[i]} fps={fps} accent={accentA} fontSize={80} bottom={900} />
            </AbsoluteFill>
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={ctaF}>
          <Cta cta={cta} trigger={trigger} accent={accentA} />
        </Series.Sequence>
      </Series>
      {title ? (
        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontFamily: 'Consolas, monospace', fontSize: 22, letterSpacing: 2 }}>{title}</div>
      ) : null}
    </AbsoluteFill>
  );
};
