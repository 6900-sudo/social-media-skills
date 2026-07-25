import React from "react";
import { AbsoluteFill } from "remotion";
import { FontLoader } from "./font";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { COLORS } from "./theme";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";

// 5 scenes overlapped by 12-frame fades. Durations chosen so the timeline
// sums to exactly 900 frames (30s @ 30fps):
//   189 + 189 + 189 + 189 + 192 - 4*12 = 948 - 48 = 900
const DURATIONS = [189, 189, 189, 189, 192];
const TRANSITION = 12;

export const BunkerEssentials: React.FC = () => {
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5];
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <FontLoader />
      <TransitionSeries>
        {scenes.map((Scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={DURATIONS[i]}>
              <Scene />
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
