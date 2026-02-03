import React from "react";
import { Composition, Folder } from "remotion";
import { DuckbillPromo } from "./DuckbillPromo";
import { ChatScene } from "./scenes/ChatScene";
import { HandoffScene } from "./scenes/HandoffScene";
import { ResultScene } from "./scenes/ResultScene";
import { CTAScene } from "./scenes/CTAScene";
import { FPS, TOTAL_DURATION, sceneFrames } from "./lib/timing";

/**
 * Root component — registers all compositions with Remotion.
 *
 * The main DuckbillMCPPromo composition is the full 30-second video
 * at 1080×1080 (square for social media). Individual scenes are also
 * registered in a "Scenes" folder for isolated previewing in the Studio.
 */
export const Root: React.FC = () => {
  return (
    <>
      {/* Main full composition */}
      <Composition
        id="DuckbillMCPPromo"
        component={DuckbillPromo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />

      {/* Individual scenes for isolated previewing */}
      <Folder name="Scenes">
        <Composition
          id="ChatScene"
          component={ChatScene}
          durationInFrames={sceneFrames.chat}
          fps={FPS}
          width={1080}
          height={1080}
        />
        <Composition
          id="HandoffScene"
          component={HandoffScene}
          durationInFrames={sceneFrames.handoff}
          fps={FPS}
          width={1080}
          height={1080}
        />
        <Composition
          id="ResultScene"
          component={ResultScene}
          durationInFrames={sceneFrames.result}
          fps={FPS}
          width={1080}
          height={1080}
        />
        <Composition
          id="CTAScene"
          component={CTAScene}
          durationInFrames={sceneFrames.cta}
          fps={FPS}
          width={1080}
          height={1080}
        />
      </Folder>
    </>
  );
};
