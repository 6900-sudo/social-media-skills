import React from 'react';
import { interpolate, spring, Easing } from 'remotion';

export const SceneHook: React.FC<{
  localFrame: number;
  tS: number;
  fps: number;
  beatDur: number;
  accentA: string;
  accentB: string;
  words: { w: string; startS: number; endS: number }[];
}> = ({ localFrame, tS, fps, beatDur, accentA, accentB, words }) => {
  // ---------- helpers ----------
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fract = (x: number) => x - Math.floor(x);
  // deterministic pseudo-random from an integer index (frame-deterministic, no Math.random)
  const rand = (i: number) => fract(Math.sin(i * 12.9898) * 43758.5453);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  // interpolate that always clamps both ends (never throws on monotonic input, never extrapolates)
  const lin = (
    v: number,
    inR: number[],
    outR: number[]
  ) =>
    interpolate(v, inR, outR, {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const spoke = (sub: string) => {
    const w = words.find((x) => x.w.toLowerCase().includes(sub));
    return w ? tS >= w.startS : false;
  };
  const wordStart = (sub: string) => {
    const w = words.find((x) => x.w.toLowerCase().includes(sub));
    return w ? w.startS : null;
  };

  // The reveal that names the concept. "lying" is the breaking moment.
  const lieAt = wordStart('lying') ?? wordStart('lies') ?? null;
  const lieActive = lieAt != null && tS >= lieAt;
  // seconds since the break began (for glitch decay)
  const sinceLie = lieAt != null ? tS - lieAt : -1;

  // ---------- timeline ----------
  const card = spring({ frame: localFrame, fps, config: { damping: 16, mass: 0.9 } });
  const cardY = lerp(40, 0, card);
  const cardOpacity = clamp(card * 1.1);

  // continuous life: slow vertical drift + breathing glow
  const drift = Math.sin(localFrame / 38) * 5;
  const glowPulse = 0.5 + 0.5 * Math.sin(localFrame / 30);

  // streaming answer text (3 lines typing in before the break)
  const answerLines = [
    'The 2024 revenue figure was',
    '$4.7M, confirmed by the Q3',
    'filing on page 12, section 4.',
  ];
  // characters revealed over time (chars/sec)
  const totalChars = answerLines.reduce((s, l) => s + l.length, 0);
  const charsShown = lieActive
    ? totalChars // fully shown by the time it breaks
    : Math.floor(lin(localFrame, [14, 64], [0, totalChars]));

  // build per-line visible substrings
  let consumed = 0;
  const visibleLines = answerLines.map((line) => {
    const start = consumed;
    consumed += line.length;
    const local = clamp(charsShown - start, 0, line.length);
    return {
      full: line,
      shown: line.slice(0, local),
      caret: charsShown >= start && charsShown < start + line.length,
    };
  });

  // ---------- glitch / break envelopes ----------
  // sharp impact at break, decays
  const impact = lieActive ? Math.exp(-sinceLie * 6) : 0; // 1 -> 0 fast
  const settle = lieActive ? clamp(lin(sinceLie, [0, 0.5], [0, 1])) : 0; // 0 -> 1
  // residual jitter that lingers (card never feels "safe" again)
  const residual = lieActive ? 0.18 + 0.12 * Math.sin(localFrame / 7) : 0;

  // deterministic glitch shake
  const shakeX = lieActive
    ? (rand(Math.floor(localFrame * 1.7)) - 0.5) * 22 * impact +
      (rand(localFrame) - 0.5) * 3 * residual
    : 0;
  const shakeY = lieActive
    ? (rand(Math.floor(localFrame * 2.3) + 99) - 0.5) * 14 * impact
    : 0;

  // chromatic split offset (RGB tear) on impact + faint residual
  const chroma = lieActive ? 6 * impact + 1.6 * residual : 0;

  // red scanline sweep position (passes once over ~0.6s, can re-pass faintly)
  const scanRaw = lieActive ? Math.max(0, sinceLie / 0.62) % 1.6 : -1;
  const scanY = scanRaw >= 0 && scanRaw <= 1 ? scanRaw : -1;
  const scanOpacity =
    scanY >= 0
      ? lin(scanY, [0, 0.12, 0.88, 1], [0, 0.9, 0.9, 0]) * (sinceLie < 1.4 ? 1 : 0)
      : 0;

  // ---------- geometry of the card ----------
  const CARD_W = 720;
  const CARD_H = 470;
  const CARD_X = 540 - CARD_W / 2; // 180
  const CARD_Y = 150;

  const violet = accentA;
  const cyan = accentB;
  const red = '#FF3B5C';
  const green = '#34E0A1';
  const white = '#F5F7FF';

  // badge color cross-fade green -> red
  const badgeBorder = lieActive ? red : green;
  const badgeGlow = lieActive ? red : green;

  // chain snap: two link halves pull apart on break
  const snap = lieActive ? clamp(lin(sinceLie, [0, 0.28], [0, 1])) : 0;
  const linkGap = snap * 16;
  const linkTilt = snap * 14;

  // "source" line color/text crossfade
  const srcBreak = lieActive ? clamp(lin(sinceLie, [0.05, 0.35], [0, 1])) : 0;

  // avatar dot pulse
  const avatarPulse = 0.6 + 0.4 * Math.sin(localFrame / 16);

  // headline label above card
  const labelOpacity = clamp(lin(localFrame, [4, 22], [0, 1]));
  const labelY = lerp(-14, 0, clamp(card));

  // sub-caption envelopes (clamped, never extrapolate)
  const subOpacity = lieActive ? clamp(lin(sinceLie, [0.15, 0.55], [0, 1])) : 0;
  const subTranslate = lieActive
    ? lerp(16, 0, clamp(lin(sinceLie, [0.15, 0.6], [0, 1])))
    : 16;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'Archivo, system-ui, sans-serif' }}>
      {/* soft accent ambience behind the card (no full background paint) */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 360,
          top: CARD_Y + 40,
          width: 720,
          height: 420,
          borderRadius: 280,
          background: `radial-gradient(circle at 50% 40%, ${violet}22, transparent 70%)`,
          filter: 'blur(40px)',
          opacity: 0.8 * cardOpacity,
        }}
      />

      {/* top label */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CARD_Y - 70 + labelY,
          textAlign: 'center',
          opacity: labelOpacity,
        }}
      >
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontSize: 26,
            letterSpacing: 6,
            color: 'rgba(245,247,255,0.55)',
            textTransform: 'uppercase',
          }}
        >
          {lieActive ? 'unverified answer' : 'ai assistant'}
        </span>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div
        style={{
          position: 'absolute',
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          transform: `translate(${shakeX}px, ${cardY + drift + shakeY}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* the glass card itself */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 24,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.085), rgba(255,255,255,0.04))',
            border: `1px solid ${lieActive ? 'rgba(255,59,92,0.35)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: lieActive
              ? `0 0 0 1px rgba(255,59,92,0.18), 0 30px 80px rgba(255,40,70,${0.22 + 0.2 * impact}), inset 0 1px 0 rgba(255,255,255,0.16)`
              : `0 30px 80px rgba(80,40,160,${0.22 + 0.06 * glowPulse}), inset 0 1px 0 rgba(255,255,255,0.18)`,
            overflow: 'hidden',
          }}
        >
          {/* lit top edge */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 24,
              right: 24,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${lieActive ? 'rgba(255,120,140,0.7)' : 'rgba(255,255,255,0.65)'}, transparent)`,
            }}
          />

          {/* chroma split duplicates of inner content for RGB tear */}
          {/* red ghost */}
          {chroma > 0.2 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translateX(${chroma}px)`,
                mixBlendMode: 'screen',
                opacity: 0.55,
              }}
            >
              <InnerContent
                avatarPulse={avatarPulse}
                violet={violet}
                cyan={cyan}
                white={white}
                visibleLines={visibleLines}
                ghost="red"
              />
            </div>
          )}
          {/* cyan ghost */}
          {chroma > 0.2 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translateX(${-chroma}px)`,
                mixBlendMode: 'screen',
                opacity: 0.5,
              }}
            >
              <InnerContent
                avatarPulse={avatarPulse}
                violet={violet}
                cyan={cyan}
                white={white}
                visibleLines={visibleLines}
                ghost="cyan"
              />
            </div>
          )}

          {/* real content */}
          <InnerContent
            avatarPulse={avatarPulse}
            violet={violet}
            cyan={cyan}
            white={white}
            visibleLines={visibleLines}
            ghost={null}
          />

          {/* ===== confidence badge ===== */}
          <div
            style={{
              position: 'absolute',
              top: 30,
              right: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 16,
              background: lieActive
                ? `rgba(255,59,92,${0.1 + 0.06 * settle})`
                : 'rgba(52,224,161,0.10)',
              border: `1px solid ${badgeBorder}`,
              boxShadow: `0 0 ${18 + 22 * (lieActive ? impact : glowPulse)}px ${badgeGlow}${lieActive ? '88' : '55'}`,
              transform: lieActive ? `scale(${1 + 0.06 * impact})` : 'scale(1)',
            }}
          >
            {/* status dot */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: lieActive ? red : green,
                boxShadow: `0 0 10px ${lieActive ? red : green}`,
              }}
            />
            <span
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 1,
                color: lieActive ? red : green,
                whiteSpace: 'nowrap',
              }}
            >
              {lieActive ? 'FABRICATED' : '100% CONFIDENT'}
            </span>
          </div>

          {/* ===== source / citation row (chain link) ===== */}
          <div
            style={{
              position: 'absolute',
              left: 36,
              bottom: 34,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* chain icon that snaps */}
            <svg width={56} height={34} viewBox="0 0 56 34">
              {/* left link half */}
              <g transform={`translate(${-linkGap},0) rotate(${-linkTilt} 16 17)`}>
                <rect
                  x={6}
                  y={9}
                  width={22}
                  height={16}
                  rx={8}
                  fill="none"
                  stroke={srcBreak > 0.5 ? red : 'rgba(245,247,255,0.7)'}
                  strokeWidth={3}
                />
              </g>
              {/* right link half */}
              <g transform={`translate(${linkGap},0) rotate(${linkTilt} 40 17)`}>
                <rect
                  x={28}
                  y={9}
                  width={22}
                  height={16}
                  rx={8}
                  fill="none"
                  stroke={srcBreak > 0.5 ? red : 'rgba(245,247,255,0.7)'}
                  strokeWidth={3}
                />
              </g>
              {/* break spark */}
              {snap > 0.1 && snap < 0.9 && (
                <g opacity={1 - snap}>
                  <line x1={28} y1={6} x2={28} y2={0} stroke={red} strokeWidth={2} />
                  <line x1={28} y1={28} x2={28} y2={34} stroke={red} strokeWidth={2} />
                </g>
              )}
            </svg>

            <span
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: 27,
                color: srcBreak > 0.5 ? red : 'rgba(245,247,255,0.62)',
                textDecoration: srcBreak > 0.5 ? 'line-through' : 'none',
                textDecorationColor: red,
                letterSpacing: 0.5,
              }}
            >
              {srcBreak > 0.5 ? 'source: not found' : 'source: q3_filing.pdf'}
            </span>
          </div>

          {/* ===== red scanline sweep ===== */}
          {scanOpacity > 0.01 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${scanY * 100}%`,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${red}, ${red}, transparent)`,
                boxShadow: `0 0 14px ${red}`,
                opacity: scanOpacity,
              }}
            />
          )}
          {/* faint red noise bands during glitch */}
          {impact > 0.05 &&
            [0, 1, 2, 3].map((i) => {
              const yy = rand(i + Math.floor(localFrame / 2) * 3) * (CARD_H - 20);
              return (
                <div
                  key={`noise-${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: yy,
                    height: 1 + rand(i * 7) * 2,
                    background: 'rgba(255,59,92,0.5)',
                    opacity: impact * 0.6,
                  }}
                />
              );
            })}

          {/* red wash overlay on impact */}
          {lieActive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 78% 18%, rgba(255,59,92,${0.16 * impact + 0.04 * residual}), transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* ===== sub-caption that states the problem (lands after break) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CARD_Y + CARD_H + 70,
          textAlign: 'center',
          opacity: subOpacity,
          transform: `translateY(${subTranslate}px)`,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: white,
            letterSpacing: 0.5,
          }}
        >
          Confident.{' '}
          <span style={{ color: red, textShadow: `0 0 22px ${red}88` }}>And completely false.</span>
        </span>
      </div>
    </div>
  );
};

// ---- inner streaming content (factored so chroma ghosts can reuse it) ----
const InnerContent: React.FC<{
  avatarPulse: number;
  violet: string;
  cyan: string;
  white: string;
  visibleLines: { full: string; shown: string; caret: boolean }[];
  ghost: 'red' | 'cyan' | null;
}> = ({ avatarPulse, violet, cyan, white, visibleLines, ghost }) => {
  const textColor =
    ghost === 'red' ? '#FF3B5C' : ghost === 'cyan' ? '#22D3EE' : white;
  return (
    <div style={{ position: 'absolute', left: 36, top: 30, right: 36 }}>
      {/* avatar dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: `linear-gradient(135deg, ${violet}, ${cyan})`,
            boxShadow: ghost ? 'none' : `0 0 ${10 + 10 * avatarPulse}px ${violet}aa`,
          }}
        />
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontSize: 24,
            color: ghost ? textColor : 'rgba(245,247,255,0.7)',
            letterSpacing: 1,
          }}
        >
          AI · answer
        </span>
      </div>

      {/* streaming answer lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        {visibleLines.map((ln, i) => (
          <div
            key={`line-${i}`}
            style={{
              fontSize: 34,
              lineHeight: 1.25,
              fontWeight: 500,
              color: textColor,
              minHeight: 42,
            }}
          >
            {ln.shown}
            {ln.caret && !ghost && (
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: 30,
                  marginLeft: 4,
                  verticalAlign: 'middle',
                  background: cyan,
                  boxShadow: `0 0 8px ${cyan}`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};