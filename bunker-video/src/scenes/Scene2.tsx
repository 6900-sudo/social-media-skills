import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";
import { SafeFrame, Header, Rise, useEnter } from "../components";

type Tier = {
  label: string;
  time: string;
  color: string;
  icon: React.ReactNode;
};

const AirIcon = () => (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <path
      d="M20 26 C20 18 44 18 44 28 C44 34 34 34 34 40"
      stroke="#0a0a0a"
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M12 40 H40 M12 48 H50 M12 32 H30"
      stroke="#0a0a0a"
      strokeWidth={5}
      strokeLinecap="round"
    />
  </svg>
);

const WaterIcon = () => (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 12 C32 12 48 32 48 42 A16 16 0 0 1 16 42 C16 32 32 12 32 12 Z"
      stroke="#0a0a0a"
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </svg>
);

const FoodIcon = () => (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <rect x="20" y="16" width="24" height="34" rx="4" stroke="#0a0a0a" strokeWidth={5} />
    <path d="M20 26 H44 M28 16 V12 M36 16 V12" stroke="#0a0a0a" strokeWidth={5} strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 12 L48 18 V32 C48 42 40 48 32 52 C24 48 16 42 16 32 V18 Z"
      stroke="#0a0a0a"
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </svg>
);

const TIERS: Tier[] = [
  { label: "AIR", time: "3 minutes", color: COLORS.accentSoft, icon: <AirIcon /> },
  { label: "WATER", time: "3 days", color: COLORS.accent, icon: <WaterIcon /> },
  { label: "FOOD", time: "3 weeks", color: "#4f46e5", icon: <FoodIcon /> },
  { label: "SECURITY", time: "ongoing", color: COLORS.success, icon: <ShieldIcon /> },
];

const Row: React.FC<{ tier: Tier; index: number }> = ({ tier, index }) => {
  const delay = 24 + index * 11;
  const p = useEnter(delay);
  // Pyramid effect: top rows narrower.
  const width = 58 + index * 14; // percentage
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${(1 - p) * -60}px)`,
        width: `${width}%`,
        marginInline: "auto",
        background: tier.color,
        borderRadius: 20,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        boxShadow: `0 10px 40px ${tier.color}44`,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 16,
          background: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {tier.icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 46, fontWeight: 800, color: "#0a0a0a", lineHeight: 1 }}>
          {tier.label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, color: "#0a0a0a", opacity: 0.75 }}>
          survive ~{tier.time}
        </div>
      </div>
    </div>
  );
};

// Scene 2 — "Priorities, In Order" survival stack.
export const Scene2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <SafeFrame>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 44,
          }}
        >
          <Header kicker="Rule of Threes" title="Priorities, In Order" />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              justifyContent: "center",
            }}
          >
            {TIERS.map((t, i) => (
              <Row key={t.label} tier={t} index={i} />
            ))}
          </div>

          <Rise delay={80} distance={24}>
            <div
              style={{
                fontSize: 38,
                fontWeight: 400,
                color: COLORS.muted,
                textAlign: "center",
                lineHeight: 1.3,
                paddingBottom: 6,
              }}
            >
              Stock for what kills fastest, first.
            </div>
          </Rise>
        </div>
      </SafeFrame>
    </AbsoluteFill>
  );
};
