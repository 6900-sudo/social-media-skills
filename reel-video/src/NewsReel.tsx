// NewsReel — a generic news/stat reel: headline -> stat cards -> kicker, over a
// voiceover. Self-contained (no footage), so it renders headlessly. Built for
// "scrape a story -> reel" content: each stat is a big number + label + context.
import React from 'react';
import {
  AbsoluteFill, Audio, Series, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import { FontLoader } from './font';
import { FitText } from './components/FitText';

export interface NewsStat {
  value: string;    // "24", "12,000+", "£20m+", "Aug 2026", "£9,250 -> £6,000"
  label: string;    // "universities at risk of closure"
  context?: string; // "within a year"
}

export interface NewsReelProps {
  eyebrow?: string;
  headline: string;
  stats: NewsStat[];
  kicker?: string;
  source?: string;
  accentA?: string;
  accentB?: string;
  voSrc?: string;
  voDurS?: number;
}

const FONT = 'Inter, "Helvetica Neue", system-ui, sans-serif';
const MONO = 'Consolas, "SF Mono", monospace';

const Backdrop: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const frame = useCurrentFrame();
  const o1x = Math.sin(frame / 60) * 80, o1y = Math.cos(frame / 74) * 60;
  const o2x = Math.cos(frame / 52) * 100, o2y = Math.sin(frame / 68) * 80;
  const breathe = Math.sin(frame / 40) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: '#080A12', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 40, left: '50%', width: 1000, height: 1000, marginLeft: -500, borderRadius: '50%', background: `radial-gradient(circle, ${a}44 0%, ${a}00 62%)`, filter: 'blur(70px)', transform: `translate(${o1x}px, ${o1y}px) scale(${1 + breathe * 0.08})` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -120, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${b}3d 0%, ${b}00 60%)`, filter: 'blur(80px)', transform: `translate(${o2x}px, ${o2y}px) scale(${1 + breathe * 0.08})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 42%, transparent 42%, rgba(0,0,0,0.62) 100%)' }} />
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ eyebrow: string; headline: string; accent: string }> = ({ eyebrow, headline, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 76px', textAlign: 'center' }}>
      <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [42, 0])}px)` }}>
        <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 999, border: `1px solid ${accent}`, color: accent, fontFamily: MONO, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase' }}>{eyebrow}</div>
        <div style={{ height: 34 }} />
        <FitText text={headline} width={936} maxFontSize={116} minFontSize={52} maxLines={5} fontFamily={FONT} fontWeight={900} letterSpacing="-0.02em" style={{ margin: '0 auto', textAlign: 'center', color: '#fff', textShadow: `0 0 50px ${accent}55` }} />
      </div>
    </AbsoluteFill>
  );
};

const StatScene: React.FC<{ stat: NewsStat; accentA: string; accentB: string; idx: number; total: number }> = ({ stat, accentA, accentB, idx, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 150 } });
  const rise = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 72px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: accentB }}>{`${idx}/${total}`}</div>
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`, opacity: pop }}>
        <FitText text={stat.value} width={940} maxFontSize={260} minFontSize={92} maxLines={1} fontFamily={FONT} fontWeight={900} letterSpacing="-0.04em" style={{ margin: '0 auto', color: '#fff', lineHeight: 0.95, textShadow: `0 0 60px ${accentA}66` }} />
      </div>
      <div style={{ height: 24 }} />
      <div style={{ opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [24, 0])}px)`, maxWidth: 900 }}>
        <div style={{ fontFamily: FONT, fontSize: 54, fontWeight: 800, color: accentA, lineHeight: 1.1 }}>{stat.label}</div>
        {stat.context ? <div style={{ marginTop: 14, fontFamily: FONT, fontSize: 40, fontWeight: 600, color: '#C9CCDA', lineHeight: 1.2 }}>{stat.context}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ kicker: string; source?: string; accent: string }> = ({ kicker, source, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px', textAlign: 'center' }}>
      <div style={{ opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})` }}>
        <FitText text={kicker} width={920} maxFontSize={96} minFontSize={48} maxLines={4} fontFamily={FONT} fontWeight={900} letterSpacing="-0.02em" style={{ margin: '0 auto', color: '#fff', textShadow: `0 0 50px ${accent}55` }} />
        {source ? <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 28, letterSpacing: 2, color: '#8A8FA3' }}>{source}</div> : null}
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

export const NewsReel: React.FC<NewsReelProps> = ({
  eyebrow = 'NEWS', headline, stats = [], kicker = '', source,
  accentA = '#DC2626', accentB = '#F59E0B', voSrc,
}) => {
  const { durationInFrames } = useVideoConfig();
  const weights = [4, ...stats.map(() => 4), kicker ? 4 : 0.0001];
  const frames = allocate(durationInFrames, weights);
  return (
    <AbsoluteFill style={{ backgroundColor: '#080A12', fontFamily: FONT }}>
      <FontLoader />
      {voSrc ? <Audio src={staticFile(voSrc)} /> : null}
      <Backdrop a={accentA} b={accentB} />
      <Series>
        <Series.Sequence durationInFrames={frames[0]}>
          <Intro eyebrow={eyebrow} headline={headline} accent={accentA} />
        </Series.Sequence>
        {stats.map((st, i) => (
          <Series.Sequence key={i} durationInFrames={frames[1 + i]}>
            <StatScene stat={st} accentA={accentA} accentB={accentB} idx={i + 1} total={stats.length} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={frames[frames.length - 1]}>
          <Outro kicker={kicker} source={source} accent={accentA} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
