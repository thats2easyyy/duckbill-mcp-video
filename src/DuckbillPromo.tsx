import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { StoryScene } from "./scenes/StoryScene";
import { TaglineScene } from "./scenes/TaglineScene";
import {
  STORY_SCENE_DURATION,
  TAGLINE_SCENE_DURATION,
  FADE_TRANSITION_FRAMES,
  FPS,
  TOTAL_DURATION,
} from "./lib/timing";

/**
 * Main composition — orchestrates the full ~25-second promo.
 *
 * Architecture:
 *   TransitionSeries:
 *     StoryScene    =  615 frames (20.5s) — pre-rendered chat → follow-up → zoom → call → result
 *     fade()        =   15 frames (0.5s overlap)
 *     TaglineScene  =  150 frames (5s)    — brand reveal + "An MCP for the real world."
 *     Total         = 615 + 150 - 15 = 750 frames (25s) ✓
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
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={STORY_SCENE_DURATION}>
          <StoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_TRANSITION_FRAMES })}
        />

        <TransitionSeries.Sequence durationInFrames={TAGLINE_SCENE_DURATION}>
          <TaglineScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Background audio — sibling to TransitionSeries so it spans full duration */}
      <Audio
        src={staticFile("audio/giorgiovitte-berry-groovy-bass-trap-476603.mp3")}
        volume={audioVolume}
      />
    </>
  );
};
