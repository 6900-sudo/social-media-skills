import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { SafeFrame, Header, Rise, CountUp, useEnter } from "../components";

// Animated fill level 0..1 driven by frame.
const useFill = (delay: number, duration = 45) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const WaterColumn: React.FC = () => {
  const fill = useFill(34);
  const jugTop = 60;
  const jugBottom = 470;
  const jugH = jugBottom - jugTop;
  const waterTop = jugBottom - jugH * fill;

  return (
    <svg width={320} height={540} viewBox="0 0 320 540">
      <defs>
        <clipPath id="jugClip">
          <path d="M110 60 h100 v20 l20 40 v330 a20 20 0 0 1 -20 20 h-100 a20 20 0 0 1 -20 -20 v-330 l20 -40 Z" />
        </clipPath>
      </defs>
      {/* Water fill */}
      <g clipPath="url(#jugClip)">
        <rect x="80" y={waterTop} width="180" height={jugBottom - waterTop + 30} fill={COLORS.accent} />
        <rect x="80" y={waterTop} width="180" height="10" fill={COLORS.accentSoft} />
      </g>
      {/* Jug outline */}
      <path
        d="M110 60 h100 v20 l20 40 v330 a20 20 0 0 1 -20 20 h-100 a20 20 0 0 1 -20 -20 v-330 l20 -40 Z"
        fill="none"
        stroke={COLORS.white}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      {/* Cap */}
      <rect x="130" y="40" width="60" height="24" rx="6" fill="none" stroke={COLORS.white} strokeWidth={7} />
    </svg>
  );
};

const FoodColumn: React.FC = () => {
  // Cans stack up one by one.
  const cans = [0, 1, 2, 3];
  return (
    <svg width={320} height={540} viewBox="0 0 320 540">
      {cans.map((i) => {
        const y = 430 - i * 92;
        return <Can key={i} y={y} delay={40 + i * 10} />;
      })}
    </svg>
  );
};

const Can: React.FC<{ y: number; delay: number }> = ({ y, delay }) => {
  const p = useEnter(delay, 14);
  return (
    <g
      transform={`translate(0 ${y}) scale(${p})`}
      style={{ transformOrigin: `160px ${y + 40}px` }}
      opacity={p}
    >
      <rect x="90" y="0" width="140" height="80" rx="12" fill={COLORS.bgSoft} stroke={COLORS.success} strokeWidth={6} />
      <rect x="90" y="24" width="140" height="32" fill={COLORS.success} opacity={0.25} />
      <path d="M118 40 h84" stroke={COLORS.success} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

const StatCard: React.FC<{
  delay: number;
  value: React.ReactNode;
  label: string;
}> = ({ delay, value, label }) => (
  <Rise delay={delay} distance={26} style={{ flex: 1 }}>
    <div
      style={{
        background: COLORS.bgSoft,
        border: `2px solid ${COLORS.track}`,
        borderRadius: 20,
        padding: "22px 18px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 66, fontWeight: 800, color: COLORS.success, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: COLORS.muted, marginTop: 8 }}>
        {label}
      </div>
    </div>
  </Rise>
);

// Scene 3 — "Store the Basics": water + food with count-ups.
export const Scene3: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <SafeFrame>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 48,
          }}
        >
          <Header kicker="Stockpile" title="Store the Basics" kickerColor={COLORS.success} />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 40,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Rise delay={28} distance={30}>
                <WaterColumn />
              </Rise>
              <Rise delay={70} distance={16}>
                <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.white, marginTop: 4 }}>
                  1 gal / person / day
                </div>
              </Rise>
            </div>
            <div style={{ textAlign: "center" }}>
              <FoodColumn />
              <Rise delay={80} distance={16}>
                <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.white, marginTop: 4 }}>
                  calorie-dense food
                </div>
              </Rise>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, paddingBottom: 6 }}>
            <StatCard
              delay={92}
              value={<CountUp to={14} delay={94} duration={40} suffix=" days" />}
              label="minimum supply"
            />
            <StatCard
              delay={104}
              value={<CountUp to={2000} delay={106} duration={45} suffix="" />}
              label="kcal / person / day"
            />
          </div>
        </div>
      </SafeFrame>
    </AbsoluteFill>
  );
};
