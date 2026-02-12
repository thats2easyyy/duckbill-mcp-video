import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { IntroScene } from "./scenes/IntroScene";
import { StoryScene } from "./scenes/StoryScene";
import { NowYouCanScene } from "./scenes/NowYouCanScene";
import { TaglineScene } from "./scenes/TaglineScene";
import { lightMode } from "./lib/colors";
import {
  INTRO_SCENE_DURATION,
  STORY_SCENE_DURATION,
  NOW_YOU_CAN_DURATION,
  TAGLINE_SCENE_DURATION,
  FADE_TRANSITION_FRAMES,
  INTRO_GLOBAL_OFFSET,
  STORY_GLOBAL_OFFSET,
  NOW_YOU_CAN_GLOBAL_OFFSET,
  TAGLINE_GLOBAL_OFFSET,
  FPS,
  TOTAL_DURATION,
} from "./lib/timing";

/**
 * Main composition — orchestrates the full ~23.3-second promo.
 *
 * Architecture:
 *   TransitionSeries:
 *     IntroScene              =  165 frames (5.5s)  — kinetic typography opening
 *     fade()                  =   15 frames (0.5s overlap)
 *     StoryScene              =  250 frames (8.3s)  — user message → tool call → phone call → result
 *     fade()                  =   15 frames (0.5s overlap)
 *     NowYouCanScene          =  160 frames (5.33s) — "Now you can" + Duckbill logo + LLM compatibility ring
 *     fade()                  =   15 frames (0.5s overlap)
 *     TaglineScene            =  150 frames (5s)    — brand reveal + "An MCP for the real world."
 *     Total                   = 165 + 250 + 160 + 150 - 45 = 680 frames (~22.7s)
 *
 * Background audio plays as a sibling to TransitionSeries (not inside it)
 * so it spans the full composition duration independently.
 */

export const DuckbillPromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Audio volume envelope: fade in 1s, full in middle, fade out 2s
  const audioVolume = interpolate(
    frame,
    [0, FPS * 1, TOTAL_DURATION - FPS * 2, TOTAL_DURATION],
    [0, 0.4, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Solid background behind TransitionSeries to prevent transparency during fade crossfades */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          backgroundColor: lightMode.canvas,
        }}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_SCENE_DURATION}>
          <IntroScene globalFrameOffset={INTRO_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: FADE_TRANSITION_FRAMES, config: { damping: 200 } })}
        />

        <TransitionSeries.Sequence durationInFrames={STORY_SCENE_DURATION}>
          <StoryScene globalFrameOffset={STORY_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: FADE_TRANSITION_FRAMES, config: { damping: 200 } })}
        />

        <TransitionSeries.Sequence durationInFrames={NOW_YOU_CAN_DURATION}>
          <NowYouCanScene globalFrameOffset={NOW_YOU_CAN_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: FADE_TRANSITION_FRAMES, config: { damping: 200 } })}
        />

        <TransitionSeries.Sequence durationInFrames={TAGLINE_SCENE_DURATION}>
          <TaglineScene globalFrameOffset={TAGLINE_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Background audio */}
      <Audio
        src={staticFile("audio/kontraa-no-sleep-hiphop-music-473847.mp3")}
        volume={audioVolume}
      />
    </>
  );
};
