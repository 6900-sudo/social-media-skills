import React, { useEffect } from "react";
import { staticFile, delayRender, continueRender } from "remotion";

// Self-hosted Inter (variable, latin + latin-ext). Injected as @font-face so
// the render never touches the network — the headless browser can't reach
// Google Fonts through the proxy CA. The variable file covers weights 100-900,
// so 400/600/800 all resolve from the same asset.
const CSS = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('${staticFile("fonts/inter-latin.woff2")}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('${staticFile("fonts/inter-latin-ext.woff2")}') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
`;

let injected = false;

export const FontLoader: React.FC = () => {
  const [handle] = React.useState(() => delayRender("loading-inter"));

  useEffect(() => {
    if (!injected) {
      const style = document.createElement("style");
      style.setAttribute("data-inter", "true");
      style.innerHTML = CSS;
      document.head.appendChild(style);
      injected = true;
    }
    let cancelled = false;
    // Ensure glyphs are ready before the frame is captured.
    Promise.all([
      (document as Document).fonts.load("800 72px Inter"),
      (document as Document).fonts.load("600 40px Inter"),
      (document as Document).fonts.load("400 40px Inter"),
    ])
      .then(() => (document as Document).fonts.ready)
      .then(() => {
        if (!cancelled) continueRender(handle);
      })
      .catch(() => {
        if (!cancelled) continueRender(handle);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return null;
};
