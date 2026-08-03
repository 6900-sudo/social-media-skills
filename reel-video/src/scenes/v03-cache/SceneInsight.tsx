import React from 'react';
import { interpolate, spring } from 'remotion';

/**
 * VIDEO #3 (prompt caching) — beat: "Cache the static prefix once. Every repeat is a near-free cache hit."
 *
 * CONCEPT: the prompt SPLITS into a big STATIC PREFIX + a tiny dynamic suffix. The prefix slides into a
 * glowing CACHE VAULT and locks (padlock snaps). Then new calls fire in and a fast "CACHE HIT" lightning
 * bolt instantly links them to the vault — the prefix is free; only the small suffix runs a tiny compute.
 *
 * NOVELTY (vs ledger): NEW families — a prefix/suffix split bar, a locking cache-vault, an instant
 * cache-hit lightning link, "HIT" stamps. (No torrent/core/tank, no node-graph, no typewriter.)
 *
 * RENDER-SAFE: react + remotion only. No useCurrentFrame/AbsoluteFill/three. No Math.random/Date.now.
 * Strictly-increasing interpolate ranges. 1080x820.
 */
export const SceneInsight: React.FC<{
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
  const wordStart = (sub: string) => { const w = words.find((x) => x.w.toLowerCase().includes(sub)); return w ? w.startS : null; };

  const gold = accentA;
  const cyan = accentB;
  const white = '#F5F7FF';
  const green = '#34F5A0';
  const END = Math.max(60, beatDur);

  const cacheAt = wordStart('cache') ?? null;
  const freeAt = wordStart('free') ?? wordStart('near') ?? null;
  const locked = cacheAt != null ? clamp(lin(tS - cacheAt, [0, 0.5], [0, 1])) : clamp(lin(localFrame, [22, 40], [0, 1]));
  const hitMode = freeAt != null ? tS >= freeAt : localFrame > 70;

  const CX = 540;
  const vaultX = 740, vaultY = 250, vaultW = 250, vaultH = 250;
  const vcx = vaultX + vaultW / 2, vcy = vaultY + vaultH / 2;

  // split bar appears, then the static prefix slides toward the vault
  const splitIn = spring({ frame: localFrame, fps, config: { damping: 16 } });
  const prefixSlide = clamp(lin(localFrame, [20, 46], [0, 1])); // 0 at bar, 1 in vault
  const barX = 120, barY = 360, barW = 460, barH = 92;
  const prefixW = barW * 0.72;
  const pfX = lerp(barX, vaultX + 22, prefixSlide);
  const pfY = lerp(barY, vaultY + vaultH / 2 - barH / 2, prefixSlide);
  const pfScale = lerp(1, 0.66, prefixSlide);

  // cache-hit bolts: periodic calls fire from left and lightning-link to the vault
  const hitRate = 2.6;
  const hitFloat = (Math.max(0, localFrame - 70) / fps) * hitRate;
  const hitCount = Math.max(0, Math.floor(hitFloat));
  const hitPhase = fract(hitFloat);
  const hitFlash = hitMode ? Math.exp(-hitPhase * 7) : 0;

  // jagged bolt path from a call origin to the vault
  const boltPath = (() => {
    if (!hitMode) return '';
    const sx = 150, sy = 150; const ex = vcx - 70, ey = vcy - 40;
    let d = `M ${sx} ${sy}`; const segs = 5;
    for (let i = 1; i <= segs; i++) {
      const t = i / segs; const jx = (rnd(i + hitCount) - 0.5) * 38; const jy = (rnd(i * 3 + hitCount) - 0.5) * 30;
      d += ` L ${(lerp(sx, ex, t) + jx).toFixed(1)} ${(lerp(sy, ey, t) + jy).toFixed(1)}`;
    }
    return d;
  })();

  const sceneIn = lin(localFrame, [0, 10], [0, 1]);

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Archivo, system-ui, sans-serif', opacity: sceneIn }}>
      <div style={{ position: 'absolute', left: vcx - 320, top: vcy - 300, width: 640, height: 600, borderRadius: 400,
        background: `radial-gradient(circle at 50% 45%, ${cyan}22, transparent 66%)`, filter: 'blur(48px)' }} />

      {/* split bar: STATIC PREFIX (sliding to vault) + dynamic suffix (stays) */}
      <div style={{ position: 'absolute', left: barX, top: barY, width: barW, height: barH, opacity: splitIn }}>
        {/* dynamic suffix (the small part that still computes) */}
        <div style={{ position: 'absolute', left: prefixW + 8, top: 0, width: barW - prefixW - 8, height: barH, borderRadius: 12,
          background: 'rgba(20,16,34,0.9)', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Consolas, monospace', fontSize: 15, color: gold, boxShadow: `0 0 16px ${gold}44` }}>dynamic</div>
        <div style={{ position: 'absolute', left: prefixW + 8, top: barH + 8, width: barW - prefixW - 8, textAlign: 'center',
          fontFamily: 'Consolas, monospace', fontSize: 13, color: 'rgba(245,247,255,0.6)' }}>~200 tok</div>
      </div>

      {/* the STATIC PREFIX block (animated to the vault) */}
      <div style={{ position: 'absolute', left: pfX, top: pfY, width: prefixW * pfScale, height: barH * pfScale, borderRadius: 12,
        background: `linear-gradient(160deg, ${cyan}33, rgba(14,10,26,0.95))`, border: `2px solid ${cyan}`, opacity: splitIn,
        boxShadow: `0 0 ${16 + 18 * locked}px ${cyan}aa`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Consolas, monospace', fontSize: 16 * pfScale, color: white, letterSpacing: 1 }}>STATIC PREFIX</div>

      {/* CACHE VAULT */}
      <svg width={1080} height={820} viewBox="0 0 1080 820" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ins-vault" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor={cyan} stopOpacity={0.32} />
            <stop offset="100%" stopColor={'#08131A'} stopOpacity={0.9} />
          </radialGradient>
        </defs>
        <rect x={vaultX} y={vaultY} width={vaultW} height={vaultH} rx={26} fill="url(#ins-vault)"
          stroke={cyan} strokeWidth={3} opacity={0.5 + 0.5 * locked} />
        {/* vault ring */}
        <circle cx={vcx} cy={vcy} r={92} fill="none" stroke={cyan} strokeWidth={3} opacity={0.4 + 0.4 * locked} />
        <circle cx={vcx} cy={vcy} r={92} fill="none" stroke={white} strokeWidth={2} strokeDasharray="6 18"
          strokeDashoffset={-localFrame * 2} opacity={0.5 * locked} />
        {/* lock-glow pulse when locked */}
        <circle cx={vcx} cy={vcy} r={92 * (1 + 0.12 * locked)} fill="none" stroke={green} strokeWidth={3}
          opacity={locked > 0.9 ? 0.4 + 0.3 * Math.sin(localFrame / 8) : 0} />
        {/* cache-hit bolt */}
        {hitMode && boltPath && (
          <path d={boltPath} fill="none" stroke={green} strokeWidth={3 + 3 * hitFlash} opacity={0.35 + 0.6 * hitFlash}
            style={{ filter: `drop-shadow(0 0 8px ${green})` }} />
        )}
        {/* incoming call dot */}
        {hitMode && (<circle cx={150} cy={150} r={10 + 5 * hitFlash} fill={gold} opacity={0.8} />)}
      </svg>

      {/* padlock icon + CACHED label */}
      <div style={{ position: 'absolute', left: vcx - 60, top: vcy - 46, width: 120, textAlign: 'center', opacity: locked }}>
        <div style={{ fontSize: 46, lineHeight: 1 }}>{locked > 0.85 ? '🔒' : '🔓'}</div>
        <div style={{ marginTop: 8, fontFamily: 'Consolas, monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2,
          color: locked > 0.85 ? green : cyan }}>CACHED</div>
      </div>

      {/* HIT stamp + near-free badge */}
      {hitMode && (
        <div style={{ position: 'absolute', left: vaultX + vaultW - 30, top: vaultY - 14, opacity: 0.5 + 0.5 * hitFlash,
          transform: `rotate(-8deg) scale(${1 + 0.1 * hitFlash})` }}>
          <span style={{ fontFamily: 'Consolas, monospace', fontSize: 30, fontWeight: 800, color: green,
            textShadow: `0 0 18px ${green}cc`, border: `3px solid ${green}`, padding: '4px 14px', borderRadius: 10 }}>CACHE HIT</span>
        </div>
      )}

      {/* cost-of-prefix readout: full -> ~$0 */}
      <div style={{ position: 'absolute', left: 70, top: 110, width: 420, opacity: lin(localFrame, [10, 28], [0, 1]) }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 22, letterSpacing: 3, color: 'rgba(245,247,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>
          prefix cost
        </div>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: -1,
          color: hitMode ? green : white, textShadow: hitMode ? `0 0 26px ${green}aa` : `0 0 18px ${cyan}55` }}>
          {hitMode ? '~$0' : 'full'}
        </div>
        <div style={{ marginTop: 10, fontFamily: 'Consolas, monospace', fontSize: 22, color: cyan }}>
          {hitMode ? 'cached once · reused free' : 'cache the static prefix'}
        </div>
      </div>

      {/* caption */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', opacity: lin(localFrame, [16, 34], [0, 1]) }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: white }}>
          Cache it once. <span style={{ color: green, textShadow: `0 0 22px ${green}99` }}>Every repeat is near-free.</span>
        </span>
      </div>
    </div>
  );
};
