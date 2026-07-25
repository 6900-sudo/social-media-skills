import React from "react";
import { Composition } from "remotion";
import { BunkerEssentials } from "./BunkerEssentials";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BunkerEssentials"
      component={BunkerEssentials}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
