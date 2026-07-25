import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import {
  SafeFrame,
  Header,
  Rise,
  CheckBadge,
  DrawPath,
  useEnter,
} from "../components";

// Rotating vent fan.
const FanCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useEnter(28, 12);
  const rot = interpolate(frame, [28, 180], [0, 360], {
    extrapolateLeft: "clamp",
  });
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ opacity: p }}>
      <circle cx="100" cy="100" r="80" fill="none" stroke={COLORS.track} strokeWidth={8} />
      <circle cx="100" cy="100" r="80" fill="none" stroke={COLORS.accent} strokeWidth={8} strokeDasharray="30 20" opacity={0.5} />
      <g transform={`rotate(${rot} 100 100)`}>
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            d="M100 100 C112 78 118 58 100 44 C82 58 88 78 100 100 Z"
            fill={COLORS.accentSoft}
            transform={`rotate(${a} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="14" fill={COLORS.white} />
      </g>
    </svg>
  );
};

// Charging battery that fills up.
const BatteryCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useEnter(40, 12);
  const fill = interpolate(frame - 46, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barMaxH = 96;
  const h = barMaxH * fill;
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ opacity: p }}>
      {/* Battery body */}
      <rect x="58" y="52" width="84" height="112" rx="12" fill="none" stroke={COLORS.white} strokeWidth={7} />
      <rect x="82" y="40" width="36" height="16" rx="5" fill={COLORS.white} />
      {/* Fill */}
      <rect x="70" y={148 - h} width="60" height={h} rx="6" fill={COLORS.success} />
      {/* Bolt */}
      <path d="M104 74 L86 108 H100 L94 138 L118 100 H104 Z" fill={COLORS.bg} stroke={COLORS.success} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

// Medical cross that draws itself.
const MedicalCard: React.FC = () => {
  const p = useEnter(52, 12);
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ opacity: p }}>
      <DrawPath
        d="M50 50 H150 V150 H50 Z"
        length={400}
        delay={54}
        duration={40}
        stroke={COLORS.white}
        strokeWidth={7}
      />
      <DrawPath
        d="M100 72 V128 M72 100 H128"
        length={112}
        delay={72}
        duration={30}
        stroke={COLORS.success}
        strokeWidth={12}
      />
    </svg>
  );
};

const System: React.FC<{
  icon: React.ReactNode;
  label: string;
  checkDelay: number;
  labelDelay: number;
}> = ({ icon, label, checkDelay, labelDelay }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      flex: 1,
    }}
  >
    <div style={{ position: "relative" }}>
      {icon}
      <div style={{ position: "absolute", top: -4, right: -4 }}>
        <CheckBadge delay={checkDelay} size={46} />
      </div>
    </div>
    <Rise delay={labelDelay} distance={16}>
      <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.white, textAlign: "center" }}>
        {label}
      </div>
    </Rise>
  </div>
);

// Scene 4 — "Keep It Running": air, power, medical systems online.
export const Scene4: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <SafeFrame>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 64,
          }}
        >
          <Header kicker="Life Support" title="Keep It Running" />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <System icon={<FanCard />} label="Clean Air" checkDelay={70} labelDelay={66} />
            <System icon={<BatteryCard />} label="Backup Power" checkDelay={90} labelDelay={86} />
            <System icon={<MedicalCard />} label="First Aid" checkDelay={104} labelDelay={100} />
          </div>

          <Rise delay={110} distance={24}>
            <div
              style={{
                background: COLORS.bgSoft,
                border: `2px solid ${COLORS.success}55`,
                borderRadius: 20,
                padding: "22px 26px",
                textAlign: "center",
                fontSize: 40,
                fontWeight: 400,
                color: COLORS.muted,
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              Air, power & medical turn a hole in the ground into a{" "}
              <span style={{ color: COLORS.success, fontWeight: 800 }}>shelter</span>.
            </div>
          </Rise>
        </div>
      </SafeFrame>
    </AbsoluteFill>
  );
};
