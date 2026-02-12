import React from "react";
import { Composition, Folder } from "remotion";
import { DuckbillPromo } from "./DuckbillPromo";
import { IntroScene } from "./scenes/IntroScene";
import { StoryScene } from "./scenes/StoryScene";
import { NowYouCanScene } from "./scenes/NowYouCanScene";
import { TaglineScene } from "./scenes/TaglineScene";
import {
  FPS,
  TOTAL_DURATION,
  INTRO_SCENE_DURATION,
  STORY_SCENE_DURATION,
  NOW_YOU_CAN_DURATION,
  TAGLINE_SCENE_DURATION,
  INTRO_GLOBAL_OFFSET,
  STORY_GLOBAL_OFFSET,
  NOW_YOU_CAN_GLOBAL_OFFSET,
  TAGLINE_GLOBAL_OFFSET,
} from "./lib/timing";

/**
 * Root component — registers all compositions with Remotion.
 *
 * The main DuckbillMCPPromo composition is the full ~24.7-second video
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
          id="IntroScene"
          component={IntroScene}
          durationInFrames={INTRO_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: INTRO_GLOBAL_OFFSET }}
        />
        <Composition
          id="StoryScene"
          component={StoryScene}
          durationInFrames={STORY_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: STORY_GLOBAL_OFFSET }}
        />
        <Composition
          id="NowYouCanScene"
          component={NowYouCanScene}
          durationInFrames={NOW_YOU_CAN_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: NOW_YOU_CAN_GLOBAL_OFFSET }}
        />
        <Composition
          id="TaglineScene"
          component={TaglineScene}
          durationInFrames={TAGLINE_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: TAGLINE_GLOBAL_OFFSET }}
        />
      </Folder>
    </>
  );
};
