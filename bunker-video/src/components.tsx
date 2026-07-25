import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
} from "remotion";
import { COLORS, FONT, SAFE } from "./theme";

// ---------------------------------------------------------------------------
// Layout: a padded frame that keeps all content inside the platform safe zone.
// ---------------------------------------------------------------------------
export const SafeFrame: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE.top,
        paddingBottom: SAFE.bottom,
        paddingLeft: SAFE.side,
        paddingRight: SAFE.side,
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Spring entrance hook — every element enters with spring({ damping: 200 }).
// Returns progress 0..1. delay in frames.
// ---------------------------------------------------------------------------
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, mass: 1, stiffness: 100 },
  });
};

// Convenience: translate + fade wrapper driven by a spring.
export const Rise: React.FC<{
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, distance = 40, children, style }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Count-up number using interpolate() + tabular-nums.
// ---------------------------------------------------------------------------
export const CountUp: React.FC<{
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  style?: React.CSSProperties;
}> = ({
  from = 0,
  to,
  delay = 0,
  duration = 40,
  decimals = 0,
  suffix = "",
  prefix = "",
  style,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: "'tnum'",
        ...style,
      }}
    >
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Section header used across scenes (small kicker + big headline).
// ---------------------------------------------------------------------------
export const Header: React.FC<{
  kicker: string;
  title: string;
  kickerColor?: string;
}> = ({ kicker, title, kickerColor = COLORS.accent }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <Rise delay={2} distance={24}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: kickerColor,
          }}
        >
          {kicker}
        </div>
      </Rise>
      <Rise delay={8} distance={30}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 14,
          }}
        >
          {title}
        </div>
      </Rise>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Animated draw-on path: pass total length; stroke reveals via dashoffset.
// ---------------------------------------------------------------------------
export const DrawPath: React.FC<{
  d: string;
  length: number;
  delay?: number;
  duration?: number;
  stroke: string;
  strokeWidth?: number;
  fill?: string;
  strokeLinecap?: "round" | "butt" | "square";
  strokeLinejoin?: "round" | "miter" | "bevel";
}> = ({
  d,
  length,
  delay = 0,
  duration = 40,
  stroke,
  strokeWidth = 8,
  fill = "none",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}) => {
  const frame = useCurrentFrame();
  const off = interpolate(frame - delay, [0, duration], [length, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeDasharray={length}
      strokeDashoffset={off}
    />
  );
};

// Green check badge that pops in with a spring.
export const CheckBadge: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 44,
}) => {
  const p = useEnter(delay, 12);
  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${p})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill={COLORS.success} />
        <path
          d="M13 22.5 L19.5 29 L31 16"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
