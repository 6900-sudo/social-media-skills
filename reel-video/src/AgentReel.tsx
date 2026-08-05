import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence} from 'remotion';

// : a GENUINELY ANIMATED reel (kinetic typography + living bg + spring physics + pacing) — the fix for the
// boring static-text reels (0% retention). Frame-deterministic (Remotion interpolate/spring) so it renders correctly.
// Concept #1 "My AI works while I sleep" with the AGENT keyword CTA. 1080x1920, ~8s @ 30fps.

const FONT = 'Inter, Helvetica, Arial, sans-serif';

// Living background: two glow blobs drifting + pulsing + a subtle grain-free gradient. Never static.
const LivingBG: React.FC = () => {
  const f = useCurrentFrame();
  const x1 = interpolate(f, [0, 240], [25, 70]), y1 = interpolate(f, [0, 240], [28, 62]);
  const x2 = interpolate(f, [0, 240], [78, 32]), y2 = interpolate(f, [0, 240], [72, 38]);
  const p = 0.5 + 0.5 * Math.sin(f / 11);
  return (
    <AbsoluteFill style={{background:
      `radial-gradient(38% 38% at ${x1}% ${y1}%, rgba(139,92,246,${0.55 * p}) 0%, transparent 62%),`
      + `radial-gradient(42% 42% at ${x2}% ${y2}%, rgba(34,211,238,${0.5 * (1 - p)}) 0%, transparent 62%),`
      + `#070710`}} />
  );
};

// A line that SLAMS in with spring scale + opacity (kinetic typography).
const Slam: React.FC<{children: React.ReactNode; start: number; size?: number; color?: string; weight?: number}> = ({children, start, size = 120, color = '#fff', weight = 900}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f - start, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
  const scale = interpolate(s, [0, 1], [0.45, 1]);
  const opacity = interpolate(f - start, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(s, [0, 1], [40, 0]);
  return (
    <div style={{fontSize: size, fontWeight: weight, color, lineHeight: 1.02, letterSpacing: -3, textAlign: 'center',
      transform: `scale(${scale}) translateY(${y}px)`, opacity, fontFamily: FONT, padding: '0 70px',
      textShadow: '0 10px 50px rgba(0,0,0,0.55)'}}>{children}</div>
  );
};

// Fast terminal lines flying up (the "agent working" proof) — motion, not static.
const ProofFeed: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame() - start;
  const lines = ['✓ built secret-scanner', '✓ shipped CRM cockpit', '✓ rendered a reel', '✓ closed 3 tasks', '✓ fixed a bug', '✓ wrote a lesson'];
  return (
    <div style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 34, color: '#a6f0c6', width: 760}}>
      {lines.map((l, i) => {
        const ls = i * 9; const op = interpolate(f - ls, [0, 5], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
        const ty = interpolate(f - ls, [0, 8], [30, 0], {extrapolateRight: 'clamp'});
        return <div key={i} style={{opacity: op, transform: `translateY(${ty}px)`, marginBottom: 14}}>{l}<span style={{opacity: 0.5}}> · 0{i + 1}:0{i}</span></div>;
      })}
    </div>
  );
};

export const AgentReel: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  // pulsing CTA button
  const ctaPulse = 1 + 0.05 * Math.sin(f / 6);
  const ctaIn = spring({frame: f - 200, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{backgroundColor: '#070710'}}>
      <LivingBG />
      {/* SCENE 1 — HOOK (0–2s): the time, then the claim */}
      <Sequence from={0} durationInFrames={70}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 24}}>
          <Slam start={0} size={170} color="#22D3EE">3:47 AM</Slam>
          <Slam start={16} size={70} color="#cbd5e1" weight={700}>I'm asleep.</Slam>
          <Slam start={34} size={92}>My AI just<br/>shipped this.</Slam>
        </AbsoluteFill>
      </Sequence>
      {/* SCENE 2 — PROOF (2–5.3s): the agent working, fast feed + counter */}
      <Sequence from={70} durationInFrames={90}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>
          <Slam start={0} size={64} color="#8B5CF6" weight={800}>while you scroll →</Slam>
          <ProofFeed start={10} />
          <Slam start={60} size={56} color="#fff" weight={800}>every 2 min. all night.</Slam>
        </AbsoluteFill>
      </Sequence>
      {/* SCENE 3 — CTA (5.3–8s): the keyword */}
      <Sequence from={160}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30}}>
          <Slam start={0} size={62} color="#cbd5e1" weight={700}>want the exact setup?</Slam>
          <div style={{transform: `scale(${interpolate(ctaIn, [0, 1], [0.6, 1]) * ctaPulse})`,
            background: 'linear-gradient(135deg,#8B5CF6,#22D3EE)', borderRadius: 28, padding: '34px 60px',
            fontSize: 80, fontWeight: 900, color: '#070710', fontFamily: FONT, letterSpacing: -2,
            boxShadow: '0 20px 80px rgba(139,92,246,0.6)'}}>
            Comment "AGENT"
          </div>
          <Slam start={20} size={40} color="#94a3b8" weight={600}>I'll DM you the build 🤖</Slam>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
