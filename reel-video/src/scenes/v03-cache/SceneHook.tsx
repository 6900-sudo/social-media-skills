import React from 'react';
import { interpolate, spring } from 'remotion';

/**
 * VIDEO #3 (prompt caching) — beat: "You pay full price to resend the same prompt on every call."
 *
 * CONCEPT: the SAME prompt card is fired over and over down a billing rail into a "$ FULL PRICE"
 * meter that re-charges the full amount on every send. A RESEND tally climbs, a full-price token
 * odometer ticks up in lockstep, and a "FULL PRICE" stamp slams on each repeat. Wasteful repetition.
 *
 * NOVELTY vs ledger (forbidden families avoided): no particle-torrent/devouring-core/liquid-tank,
 * no glass-card-typewriter, no node-graph/similarity-ring. NEW families: a repeating send-rail with
 * ghost-trail duplicates, a stamping "FULL PRICE" charge, a resend tally, a billing-rail odometer.
 *
 * RENDER-SAFE: imports only react + remotion (interpolate/spring). No useCurrentFrame/AbsoluteFill/three.
 * No Math.random/Date.now/new Date (deterministic rnd). All interpolate input ranges strictly increasing.
 * Manual number formatting. Stays inside 1080x820.
 */
export const SceneHook: React.FC<{
  localFrame: number; tS: number; fps: number; beatDur: number;
  accentA: string; accentB: string;
  words: { w: string; startS: number; endS: number }[];
}> = ({ localFrame, tS, fps, beatDur, accentA, accentB, words }) => {
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fract = (x: number) => x - Math.floor(x);
  const rnd = (i: number) => fract(Math.sin(i * 12.9898) * 43758.5453);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lin = (v: number, inR: number[], outR: number[]) =>
    interpolate(v, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const money = (n: number) => {
    const v = Math.max(0, Math.floor(n)); const s = String(v); let out = '';
    for (let k = 0; k < s.length; k++) { if (k > 0 && (s.length - k) % 3 === 0) out += ','; out += s[k]; }
    return '$' + out;
  };
  const wordStart = (sub: string) => { const w = words.find((x) => x.w.toLowerCase().includes(sub)); return w ? w.startS : null; };

  const gold = accentA;          // billing accent
  const violet = accentB;
  const white = '#F5F7FF';
  const red = '#FF3B5C';
  const END = Math.max(60, beatDur);

  // narration land: emphasize "full" and "every"
  const fullAt = wordStart('full') ?? null;
  const everyAt = wordStart('every') ?? null;
  const fullHit = fullAt != null && tS >= fullAt;

  const CX = 540;
  const railY = 300;            // billing rail y
  const meterX = 812;          // full-price meter
  const promptX0 = 150;        // prompt origin

  // ---- send cadence: a new identical prompt fires on a steady beat ----
  const sendRate = lin(localFrame, [8, 40, 100], [1.4, 2.4, 3.2]); // sends/sec accelerating
  const sendFloat = (Math.max(0, localFrame - 8) / fps) * sendRate;
  const sendCount = Math.floor(sendFloat);
  const sendPhase = fract(sendFloat);
  const sendPulse = Math.exp(-sendPhase * 6);

  // full-price cost climbs one full charge per send
  const perCharge = 0.012; // $ per token-equivalent unit, scaled below
  const costVal = Math.floor((sendCount * 4200 + sendPhase * 4200) / 7) * 7;
  const costKick = 1 + 0.12 * sendPulse;

  // ghost trail: the last ~6 identical prompts in flight on the rail
  const flights: { x: number; o: number; s: number }[] = [];
  for (let k = 0; k < 6; k++) {
    const idx = sendCount - k;
    if (idx < 0) continue;
    const age = (sendFloat - idx) / sendRate; // seconds since this send
    const t = clamp(age / 0.7);
    const x = lerp(promptX0 + 120, meterX - 60, t);
    const o = clamp(lin(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0])) * (1 - k * 0.06);
    flights.push({ x, o, s: lerp(1, 0.78, t) });
  }

  const sceneIn = lin(localFrame, [0, 10], [0, 1]);
  const promptBob = Math.sin(localFrame / 11) * 4;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Archivo, system-ui, sans-serif', opacity: sceneIn }}>
      {/* ambient wash */}
      <div style={{ position: 'absolute', left: CX - 380, top: railY - 280, width: 760, height: 620, borderRadius: 420,
        background: `radial-gradient(circle at 50% 45%, ${gold}1f, transparent 66%)`, filter: 'blur(50px)' }} />

      {/* billing rail */}
      <svg width={1080} height={820} viewBox="0 0 1080 820" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="hk-rail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gold} stopOpacity={0.15} />
            <stop offset="100%" stopColor={red} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <line x1={promptX0 + 110} y1={railY} x2={meterX - 50} y2={railY} stroke="url(#hk-rail)" strokeWidth={5}
          strokeDasharray="3 16" strokeDashoffset={-localFrame * 5} opacity={lin(localFrame, [6, 26], [0, 0.8])} />
        {/* arrowheads streaming */}
        {Array.from({ length: 7 }).map((_, i) => {
          const per = 40; const prog = fract((localFrame + i * 14) / per);
          const x = lerp(promptX0 + 120, meterX - 56, prog);
          return <path key={`ah-${i}`} d={`M ${x} ${railY - 7} L ${x + 12} ${railY} L ${x} ${railY + 7} Z`} fill={red}
            opacity={(1 - prog) * 0.5} />;
        })}
      </svg>

      {/* ghost-trail duplicate prompts in flight */}
      {flights.map((f, i) => (
        <div key={`fl-${i}`} style={{ position: 'absolute', left: f.x - 40 * f.s, top: railY - 26 * f.s, width: 80 * f.s, height: 52 * f.s,
          borderRadius: 9, background: 'rgba(20,16,34,0.82)', border: `1.5px solid ${gold}aa`, opacity: f.o,
          boxShadow: `0 0 14px ${gold}55`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Consolas, monospace', fontSize: 13 * f.s, color: gold }}>{'{prompt}'}</div>
      ))}

      {/* the source prompt card (pulses + re-fires) */}
      <div style={{ position: 'absolute', left: promptX0 - 56, top: railY - 64 + promptBob, width: 168, height: 128,
        borderRadius: 16, background: 'linear-gradient(160deg, rgba(30,24,52,0.95), rgba(14,10,26,0.95))',
        border: `2px solid ${gold}`, boxShadow: `0 0 ${20 + 22 * sendPulse}px ${gold}aa`, transform: `scale(${1 + 0.05 * sendPulse})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 16, color: white, letterSpacing: 1 }}>PROMPT</div>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 12, color: gold, opacity: 0.85 }}>same · every · time</div>
        <div style={{ marginTop: 4, fontFamily: 'Consolas, monospace', fontSize: 11, color: 'rgba(245,247,255,0.5)' }}>4,000 tokens</div>
      </div>

      {/* FULL PRICE meter (charges on each send) */}
      <div style={{ position: 'absolute', left: meterX - 70, top: railY - 96, width: 220, textAlign: 'center' }}>
        <div style={{ width: 156, height: 156, margin: '0 auto', borderRadius: 26, position: 'relative',
          background: `radial-gradient(circle at 50% 38%, ${red}cc, #2A0A14 78%)`, border: `3px solid ${red}`,
          boxShadow: `0 0 ${26 + 30 * sendPulse}px ${red}cc`, transform: `scale(${1 + 0.06 * sendPulse})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Consolas, monospace', fontSize: 27, fontWeight: 800, color: white, lineHeight: 1.05 }}>
            FULL<br />PRICE
          </div>
          {sendPulse > 0.2 && (
            <div style={{ position: 'absolute', inset: -6, borderRadius: 30, border: `3px solid ${red}`, opacity: sendPulse * 0.7,
              transform: `scale(${1 + (1 - sendPhase) * 0.25})` }} />
          )}
        </div>
        <div style={{ marginTop: 14, fontFamily: 'Consolas, monospace', fontSize: 22, letterSpacing: 2, color: red, fontWeight: 700 }}>
          RESEND ×{sendCount}
        </div>
      </div>

      {/* rising full-price token cost (mono, top-left) */}
      <div style={{ position: 'absolute', left: 70, top: 96, width: 460, opacity: lin(localFrame, [8, 26], [0, 1]) }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 24, letterSpacing: 4, color: 'rgba(245,247,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>
          tokens billed
        </div>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 92, fontWeight: 800, lineHeight: 1, color: fullHit ? red : white,
          letterSpacing: -2, transform: `scale(${costKick})`, transformOrigin: 'left center',
          textShadow: fullHit ? `0 0 30px ${red}cc` : `0 0 22px ${gold}55`, whiteSpace: 'nowrap' }}>
          {money(costVal)}
        </div>
        <div style={{ marginTop: 12, fontFamily: 'Consolas, monospace', fontSize: 26, fontWeight: 700, color: red, opacity: lin(localFrame, [22, 40], [0, 1]) }}>
          ↑ charged in full · every call
        </div>
      </div>

      {/* lower caption */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', opacity: lin(localFrame, [16, 34], [0, 1]) }}>
        <span style={{ fontSize: 42, fontWeight: 800, color: white, letterSpacing: 0.5 }}>
          Same prompt. <span style={{ color: red, textShadow: `0 0 22px ${red}99` }}>Full price, every time.</span>
        </span>
      </div>
    </div>
  );
};
