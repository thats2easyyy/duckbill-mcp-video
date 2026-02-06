import React from "react";
import { Composition, Folder } from "remotion";
import { DuckbillPromo } from "./DuckbillPromo";
import { IntroScene } from "./scenes/IntroScene";
import { StoryScene } from "./scenes/StoryScene";
import { CapabilitiesScene } from "./scenes/CapabilitiesScene";
import { LLMCompatibilityScene } from "./scenes/LLMCompatibilityScene";
import { TaglineScene } from "./scenes/TaglineScene";
import {
  FPS,
  TOTAL_DURATION,
  INTRO_SCENE_DURATION,
  STORY_SCENE_DURATION,
  CAPABILITIES_SCENE_DURATION,
  LLM_COMPATIBILITY_DURATION,
  TAGLINE_SCENE_DURATION,
  INTRO_GLOBAL_OFFSET,
  STORY_GLOBAL_OFFSET,
  CAPABILITIES_GLOBAL_OFFSET,
  LLM_GLOBAL_OFFSET,
  TAGLINE_GLOBAL_OFFSET,
} from "./lib/timing";

/**
 * Root component — registers all compositions with Remotion.
 *
 * The main DuckbillMCPPromo composition is the full ~30-second video
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
          id="CapabilitiesScene"
          component={CapabilitiesScene}
          durationInFrames={CAPABILITIES_SCENE_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: CAPABILITIES_GLOBAL_OFFSET }}
        />
        <Composition
          id="LLMCompatibilityScene"
          component={LLMCompatibilityScene}
          durationInFrames={LLM_COMPATIBILITY_DURATION}
          fps={FPS}
          width={1080}
          height={1080}
          defaultProps={{ globalFrameOffset: LLM_GLOBAL_OFFSET }}
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
