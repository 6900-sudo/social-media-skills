import React, { useEffect } from "react";
import { staticFile, delayRender, continueRender } from "remotion";

// Self-hosted Inter (variable, latin + latin-ext), injected as @font-face so the
// render never touches the network — the headless browser can't reach Google
// Fonts through the proxy CA. "Archivo" is aliased onto the same Inter asset so
// components that ask for Archivo (e.g. KineticCaptions) resolve a real font
// instead of falling back to a system sans mid-render.
const FACE = (family: string, file: string, range: string) => `
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('${staticFile(file)}') format('woff2');
  unicode-range: ${range};
}`;

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const CSS = ["Inter", "Archivo"]
  .flatMap((f) => [
    FACE(f, "fonts/inter-latin.woff2", LATIN),
    FACE(f, "fonts/inter-latin-ext.woff2", LATIN_EXT),
  ])
  .join("\n");

let injected = false;

export const FontLoader: React.FC = () => {
  const [handle] = React.useState(() => delayRender("loading-fonts"));

  useEffect(() => {
    if (!injected) {
      const style = document.createElement("style");
      style.setAttribute("data-reel-fonts", "true");
      style.innerHTML = CSS;
      document.head.appendChild(style);
      injected = true;
    }
    let cancelled = false;
    Promise.all([
      (document as Document).fonts.load("900 72px Inter"),
      (document as Document).fonts.load("900 60px Archivo"),
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
