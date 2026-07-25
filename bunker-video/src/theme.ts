// Shared design tokens for the Bunker Essentials explainer.
export const COLORS = {
  bg: "#0a0a0a",
  bgSoft: "#141417",
  white: "#ffffff",
  muted: "#a1a1aa",
  accent: "#6366f1", // indigo
  accentSoft: "#818cf8",
  success: "#22c55e", // green
  track: "#27272a",
} as const;

export const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Safe zone for 1080x1920 vertical video.
export const SAFE = {
  top: 150,
  bottom: 170,
  side: 60,
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
} as const;
