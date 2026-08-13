import React from 'react';
import { interpolate, spring } from 'remotion';

/**
 * VIDEO #3 (prompt caching) — beat: "Same output. Your token cost drops ninety percent."
 *
 * CONCEPT: a side-by-side cost showdown. LEFT bar "WITHOUT CACHE" fills tall + red ($$$). RIGHT bar
 * "WITH CACHE" fills to ~10% + green. Both carry an identical ✓ output check. A hero "−90%" snaps in on
 * the spoken "ninety", with a delta bracket spanning the gap between the two bar tops.
 *
 * NOVELTY (vs ledger): NEW family — twin vertical cost bars with a measured delta bracket + a −90% snap.
 * (No torrent/core/tank, no vault, no node-graph.)
 *
 * RENDER-SAFE: react + remotion only. No useCurrentFrame/AbsoluteFill/three. No Math.random/Date.now.
 * Strictly-increasing interpolate ranges. 1080x820.
 */
export const SceneProof: React.FC<{
  localFrame: number; tS: number; fps: number; beatDur: number;
  accentA: string; accentB: string;
  words: { w: string; startS: number; endS: number }[];
}> = ({ localFrame, tS, fps, beatDur, accentA, accentB, words }) => {
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lin = (v: number, inR: number[], outR: number[]) =>
    interpolate(v, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wordStart = (sub: string) => { const w = words.find((x) => x.w.toLowerCase().includes(sub)); return w ? w.startS : null; };

  const gold = accentA;
  const white = '#F5F7FF';
  const red = '#FF3B5C';
  const green = '#34F5A0';

  const ninetyAt = wordStart('ninety') ?? wordStart('percent') ?? null;
  const snap = ninetyAt != null ? clamp(lin(tS - ninetyAt, [0, 0.32], [0, 1])) : clamp(lin(localFrame, [54, 70], [0, 1]));

  // stage
  const baseY = 660;            // bar bottom
  const maxH = 420;             // tallest bar height
  const lX = 300, rX = 720, barW = 150;

  const fillIn = clamp(lin(localFrame, [12, 44], [0, 1]));
  const hWithout = maxH * fillIn;          // tall
  const hWith = maxH * 0.1 * fillIn;       // 10%
  const topWithout = baseY - hWithout;
  const topWith = baseY - hWith;

  const checkIn = spring({ frame: Math.max(0, localFrame - 30), fps, config: { damping: 12 } });
  const sceneIn = lin(localFrame, [0, 10], [0, 1]);

  const Bar = (x: number, h: number, top: number, color: string, label: string, sub: string) => (
    <>
      <div style={{ position: 'absolute', left: x, top, width: barW, height: h, borderRadius: 12,
        background: `linear-gradient(180deg, ${color}, ${color}99)`, border: `2px solid ${color}`,
        boxShadow: `0 0 26px ${color}66` }} />
      {/* identical output check */}
      <div style={{ position: 'absolute', left: x + barW / 2 - 26, top: top - 56, width: 52, height: 52, borderRadius: 26,
        background: 'rgba(10,8,20,0.8)', border: `2px solid ${green}`, transform: `scale(${checkIn})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: green }}>✓</div>
      <div style={{ position: 'absolute', left: x - 30, top: baseY + 16, width: barW + 60, textAlign: 'center',
        fontFamily: 'Consolas, monospace', fontSize: 22, fontWeight: 700, letterSpacing: 1, color }}>{label}</div>
      <div style={{ position: 'absolute', left: x - 30, top: baseY + 46, width: barW + 60, textAlign: 'center',
        fontFamily: 'Consolas, monospace', fontSize: 16, color: 'rgba(245,247,255,0.55)' }}>{sub}</div>
    </>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Archivo, system-ui, sans-serif', opacity: sceneIn }}>
      <div style={{ position: 'absolute', left: 540 - 360, top: 200, width: 720, height: 560, borderRadius: 380,
        background: `radial-gradient(circle at 50% 60%, ${green}1c, transparent 66%)`, filter: 'blur(48px)' }} />

      {/* baseline */}
      <div style={{ position: 'absolute', left: 220, top: baseY, width: 660, height: 2, background: 'rgba(245,247,255,0.25)' }} />

      {/* eyebrow */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', opacity: lin(localFrame, [4, 20], [0, 1]),
        fontFamily: 'Consolas, monospace', fontSize: 26, letterSpacing: 6, color: 'rgba(245,247,255,0.6)', textTransform: 'uppercase' }}>
        same output · token cost
      </div>

      {Bar(lX, hWithout, topWithout, red, 'WITHOUT CACHE', '$$$ full price')}
      {Bar(rX, hWith, topWith, green, 'WITH CACHE', '≈ 10% cost')}

      {/* delta bracket between the two bar tops */}
      <svg width={1080} height={820} viewBox="0 0 1080 820" style={{ position: 'absolute', inset: 0, opacity: fillIn }}>
        <line x1={lX + barW + 10} y1={topWithout} x2={rX - 10} y2={topWithout} stroke="rgba(245,247,255,0.5)" strokeWidth={2} strokeDasharray="5 7" />
        <line x1={rX - 12} y1={topWithout} x2={rX - 12} y2={topWith} stroke={green} strokeWidth={3} />
        <path d={`M ${rX - 18} ${topWith + 12} L ${rX - 12} ${topWith} L ${rX - 6} ${topWith + 12}`} fill="none" stroke={green} strokeWidth={3} />
      </svg>

      {/* −90% hero (snaps on "ninety") */}
      <div style={{ position: 'absolute', left: 540 - 240, top: 300, width: 480, textAlign: 'center',
        transform: `scale(${0.6 + 0.5 * snap})`, opacity: snap }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 150, fontWeight: 800, lineHeight: 1, color: green,
          letterSpacing: -4, textShadow: `0 0 40px ${green}cc, 0 0 10px ${green}` }}>−90%</div>
        <div style={{ marginTop: 4, fontFamily: 'Consolas, monospace', fontSize: 28, letterSpacing: 3, color: white }}>token cost</div>
      </div>

      {/* caption */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center', opacity: lin(localFrame, [16, 34], [0, 1]) }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: white }}>
          Same output. <span style={{ color: green, textShadow: `0 0 22px ${green}99` }}>Ninety percent cheaper.</span>
        </span>
      </div>
    </div>
  );
};
