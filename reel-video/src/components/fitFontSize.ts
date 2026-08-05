// : shared font-SIZE fitter (returns a number, not a node) — so an ANIMATED headline
// (per-word hinge-flip / rise-deblur) can shrink-to-fit WITHOUT being flattened into a static
// <FitText>. Computes the largest size that fits the real (optionally transformed) text within
// `width` on at most `maxLines` lines via @remotion/layout-utils, clamped to [min,max]. Kills the
// "GUARDRAILS O…" truncation class across every story comp while keeping each one's word animation.
import { fitTextOnNLines } from '@remotion/layout-utils';

export const fitFontSize = ({
  text,
  width,
  maxFontSize,
  minFontSize = 30,
  maxLines = 3,
  fontFamily,
  fontWeight = 900,
  letterSpacing,
  textTransform = 'none',
}: {
  text: string;
  width: number;
  maxFontSize: number;
  minFontSize?: number;
  maxLines?: number;
  fontFamily: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}): number => {
  const fitted = fitTextOnNLines({
    text: String(text || ''),
    maxLines,
    withinWidth: width,
    fontFamily,
    fontWeight: String(fontWeight),
    letterSpacing,
    textTransform,
  });
  return Math.max(minFontSize, Math.min(maxFontSize, Math.floor(fitted.fontSize)));
};
