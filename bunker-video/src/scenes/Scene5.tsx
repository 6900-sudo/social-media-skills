import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import {
  SafeFrame,
  Rise,
  DrawPath,
  CheckBadge,
  useEnter,
} from "../components";

// Drifting particle background (12 circles rising upward).
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const count = 13;
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const seed = i + 1;
        const x = random(`x-${seed}`) * width;
        const size = 8 + random(`s-${seed}`) * 26;
        const speed = 0.4 + random(`v-${seed}`) * 0.9;
        const startY = height + random(`y-${seed}`) * height;
        const y = ((startY - frame * speed * 3) % (height + 120)) - 60;
        const wrappedY = y < -60 ? y + (height + 120) : y;
        const isGreen = random(`c-${seed}`) > 0.5;
        const opacity = 0.15 + random(`o-${seed}`) * 0.35;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: wrappedY,
              width: size,
              height: size,
              borderRadius: "50%",
              background: isGreen ? COLORS.success : COLORS.accent,
              opacity,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const RotateBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useEnter(70, 14);
  const rot = interpolate(frame, [70, 180], [0, 300], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        background: COLORS.bgSoft,
        border: `2px solid ${COLORS.accent}`,
        borderRadius: 999,
        padding: "16px 28px",
        transform: `scale(${p})`,
        opacity: p,
      }}
    >
      <svg width={44} height={44} viewBox="0 0 44 44">
        <g transform={`rotate(${rot} 22 22)`}>
          <path
            d="M22 8 A14 14 0 1 1 9 17"
            fill="none"
            stroke={COLORS.accentSoft}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <path d="M9 8 L9 17 L18 17" fill="none" stroke={COLORS.accentSoft} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <span style={{ fontSize: 36, fontWeight: 600, color: COLORS.white }}>
        rotate supplies / 6 months
      </span>
    </div>
  );
};

const ChecklistItem: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: p,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <CheckBadge delay={delay} size={44} />
      <span style={{ fontSize: 42, fontWeight: 600, color: COLORS.white }}>{label}</span>
    </div>
  );
};

// Scene 5 — Takeaway: "Prepared, Not Scared".
export const Scene5: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Particles />
      <SafeFrame>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Big shield-check that draws itself */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
            <svg width={300} height={330} viewBox="0 0 300 330">
              <DrawPath
                d="M150 20 L270 66 V170 C270 240 216 288 150 312 C84 288 30 240 30 170 V66 Z"
                length={900}
                delay={10}
                duration={55}
                stroke={COLORS.accent}
                strokeWidth={10}
              />
              <DrawPath
                d="M95 165 L135 205 L210 120"
                length={200}
                delay={46}
                duration={30}
                stroke={COLORS.success}
                strokeWidth={16}
              />
            </svg>

            <Rise delay={40} distance={30}>
              <div
                style={{
                  fontSize: 78,
                  fontWeight: 800,
                  textAlign: "center",
                  lineHeight: 1.05,
                  marginTop: 6,
                }}
              >
                Prepared,
                <br />
                <span style={{ color: COLORS.success }}>Not Scared</span>
              </div>
            </Rise>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <RotateBadge />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px 60px",
              }}
            >
              <ChecklistItem label="Water" delay={92} />
              <ChecklistItem label="Food" delay={102} />
              <ChecklistItem label="Power" delay={112} />
              <ChecklistItem label="Air" delay={122} />
            </div>
          </div>

          <Rise delay={130} distance={20}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 400,
                color: COLORS.muted,
                textAlign: "center",
                paddingBottom: 6,
              }}
            >
              Readiness is a habit, not a purchase.
            </div>
          </Rise>
        </div>
      </SafeFrame>
    </AbsoluteFill>
  );
};
