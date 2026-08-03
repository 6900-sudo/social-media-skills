// TransferReel — a scene-based news/transfer reel: studio intro -> player cards
// -> window-countdown graphics, over a voiceover. Self-contained (no three.js,
// no real-player footage) so it renders headlessly. Text/graphics only: player
// "cards" are name + role + note, not likenesses.
import React from 'react';
import {
  AbsoluteFill, Audio, Series, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
} from 'remotion';
import { FontLoader } from './font';
import { FitText } from './components/FitText';

export interface TransferPlayer {
  name: string;
  meta: string;   // e.g. "PSG · Left wing"
  note: string;   // e.g. "Pace. Directness. End product."
}

export interface TransferReelProps {
  title?: string;
  intro: string;
  players: TransferPlayer[];
  windowLabel?: string;
  windowDaysLeft?: number;
  cta?: string;
  trigger?: string;
  accentA?: string;
  accentB?: string;
  voSrc?: string;
  voDurS?: number;
}

const FONT = 'Inter, "Helvetica Neue", system-ui, sans-serif';
const MONO = 'Consolas, "SF Mono", monospace';

const Backdrop: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const frame = useCurrentFrame();
  const o1x = Math.sin(frame / 58) * 90, o1y = Math.cos(frame / 72) * 70;
  const o2x = Math.cos(frame / 50) * 110, o2y = Math.sin(frame / 66) * 90;
  const breathe = Math.sin(frame / 40) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05030D', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 40, left: '50%', width: 1000, height: 1000, marginLeft: -500, borderRadius: '50%', background: `radial-gradient(circle, ${a}55 0%, ${a}00 62%)`, filter: 'blur(70px)', transform: `translate(${o1x}px, ${o1y}px) scale(${1 + breathe * 0.08})` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -120, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${b}4d 0%, ${b}00 60%)`, filter: 'blur(80px)', transform: `translate(${o2x}px, ${o2y}px) scale(${1 + breathe * 0.08})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};

const Eyebrow: React.FC<{ text: string; accent: string }> = ({ text, accent }) => (
  <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: accent, textTransform: 'uppercase' }}>{text}</div>
);

const Intro: React.FC<{ title: string; intro: string; accent: string }> = ({ title, intro, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px', textAlign: 'center' }}>
      <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` }}>
        <Eyebrow text={title} accent={accent} />
        <div style={{ height: 30 }} />
        <FitText text={intro} width={920} maxFontSize={116} minFontSize={54} maxLines={4} fontFamily={FONT} fontWeight={900} letterSpacing="-0.02em" style={{ margin: '0 auto', textAlign: 'center', color: '#fff', textShadow: `0 0 50px ${accent}55` }} />
      </div>
    </AbsoluteFill>
  );
};

const PlayerCard: React.FC<{ p: TransferPlayer; accent: string; idx: number }> = ({ p, accent, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const barW = interpolate(spring({ frame: frame - 6, fps, config: { damping: 20 } }), [0, 1], [0, 100]);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 70px' }}>
      <div style={{ width: '100%', opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [50, 0])}px)`, background: 'rgba(10,8,20,0.55)', border: `1px solid ${accent}55`, borderRadius: 28, padding: '54px 48px', boxShadow: `0 30px 80px rgba(0,0,0,0.5)` }}>
        <Eyebrow text={`Target ${idx}`} accent={accent} />
        <div style={{ height: 22 }} />
        <FitText text={p.name} width={900} maxFontSize={110} minFontSize={56} maxLines={2} fontFamily={FONT} fontWeight={900} letterSpacing="-0.02em" style={{ color: '#fff', lineHeight: 1.0 }} />
        <div style={{ height: 18 }} />
        <div style={{ height: 6, width: `${barW}%`, background: `linear-gradient(90deg, ${accent}, ${accent}00)`, borderRadius: 999 }} />
        <div style={{ height: 26 }} />
        <div style={{ fontFamily: MONO, fontSize: 34, color: accent, letterSpacing: 1 }}>{p.meta}</div>
        <div style={{ height: 14 }} />
        <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 700, color: '#F2EEF6', lineHeight: 1.15 }}>{p.note}</div>
      </div>
    </AbsoluteFill>
  );
};

const CountdownScene: React.FC<{ label: string; days: number; cta?: string; trigger?: string; accentA: string; accentB: string }> = ({ label, days, cta, trigger, accentA, accentB }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const tick = Math.max(0, Math.round(days - interpolate(frame, [0, 20], [days > 3 ? 3 : 0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const arrow = Math.sin(frame / 6) * 6;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px', textAlign: 'center' }}>
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.86, 1])})` }}>
        <Eyebrow text={label} accent={accentB} />
        <div style={{ height: 24 }} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: '#fff', letterSpacing: -8, textShadow: `0 0 60px ${accentA}77` }}>{tick}</div>
        <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: 4, color: accentA, fontWeight: 700 }}>DAYS LEFT</div>
        {cta ? (
          <div style={{ marginTop: 54, display: 'inline-flex', alignItems: 'center', gap: 16, background: `linear-gradient(135deg, ${accentA}, ${accentA}aa)`, borderRadius: 26, padding: '26px 40px', color: '#fff', fontFamily: FONT, fontSize: 40, fontWeight: 800, boxShadow: `0 26px 70px ${accentA}66` }}>
            {trigger ? <>Comment <span style={{ background: 'rgba(0,0,0,0.38)', padding: '6px 20px', borderRadius: 14, fontFamily: MONO }}>{trigger}</span></> : cta}
            <span style={{ display: 'inline-block', transform: `translateX(${arrow}px)` }}>→</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const allocate = (total: number, weights: number[]) => {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => Math.max(1, Math.floor((total * w) / sum)));
  out[out.length - 1] += total - out.reduce((a, b) => a + b, 0);
  return out;
};

export const TransferReel: React.FC<TransferReelProps> = ({
  title = 'THE WINDOW', intro, players = [], windowLabel = 'Transfer window',
  windowDaysLeft = 12, cta, trigger, accentA = '#C8102E', accentB = '#F6EB61', voSrc,
}) => {
  const { durationInFrames } = useVideoConfig();
  const weights = [3, ...players.map(() => 4), 4]; // intro, each player, countdown
  const frames = allocate(durationInFrames, weights);
  return (
    <AbsoluteFill style={{ backgroundColor: '#05030D', fontFamily: FONT }}>
      <FontLoader />
      {voSrc ? <Audio src={staticFile(voSrc)} /> : null}
      <Backdrop a={accentA} b={accentB} />
      <Series>
        <Series.Sequence durationInFrames={frames[0]}>
          <Intro title={title} intro={intro} accent={accentA} />
        </Series.Sequence>
        {players.map((p, i) => (
          <Series.Sequence key={i} durationInFrames={frames[1 + i]}>
            <PlayerCard p={p} accent={accentA} idx={i + 1} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={frames[frames.length - 1]}>
          <CountdownScene label={windowLabel} days={windowDaysLeft} cta={cta} trigger={trigger} accentA={accentA} accentB={accentB} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
