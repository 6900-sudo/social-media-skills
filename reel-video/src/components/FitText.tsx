// : shared auto-fit text — kills the headline/wire truncation across ALL stories.
// Uses @remotion/layout-utils fitTextOnNLines to compute the largest font size that fits the
// real text within `width` on at most `maxLines` lines, clamped to [min,max]. So a long live
// headline wraps + shrinks to fit instead of clipping mid-word ("GUARDRAILS O...").
import React from 'react';
import { fitTextOnNLines } from '@remotion/layout-utils';

export const FitText: React.FC<{
  text: string;
  width: number;
  maxFontSize: number;
  minFontSize?: number;
  maxLines?: number;
  fontFamily: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  text, width, maxFontSize, minFontSize = 30, maxLines = 3,
  fontFamily, fontWeight = 900, letterSpacing, lineHeight = 0.98, style,
}) => {
  // fitTextOnNLines computes the largest size that fits the real text within `width` on at most
  // `maxLines` lines — true multi-line fitting, so the headline wraps cleanly (3 lines, not 4) and a
  // single-line ticker (maxLines:1) shrinks to fit instead of clipping.
  const fitted = fitTextOnNLines({
    text,
    maxLines,
    withinWidth: width,
    fontFamily,
    fontWeight: String(fontWeight),
    letterSpacing,
    textTransform: 'none',
  });
  const fontSize = Math.max(minFontSize, Math.min(maxFontSize, Math.floor(fitted.fontSize)));
  return (
    <div style={{ fontSize, fontFamily, fontWeight, letterSpacing, lineHeight, width, ...style }}>
      {text}
    </div>
  );
};
