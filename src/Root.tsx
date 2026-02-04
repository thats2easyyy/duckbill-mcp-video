import React from "react";
import { Composition, Folder } from "remotion";
import { DuckbillPromo } from "./DuckbillPromo";
import { StoryScene } from "./scenes/StoryScene";
import { TaglineScene } from "./scenes/TaglineScene";
import {
  FPS,
  TOTAL_DURATION,
  STORY_SCENE_DURATION,
  TAGLINE_SCENE_DURATION,
} from "./lib/timing";

/**
 * Root component — registers all compositions with Remotion.
 *
 * The main DuckbillMCPPromo composition is the full ~25-second video
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
          id="StoryScene"
          component={StoryScene}
          durationInFrames={STORY_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
        />
        <Composition
          id="TaglineScene"
          component={TaglineScene}
          durationInFrames={TAGLINE_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
        />
      </Folder>
    </>
  );
};
