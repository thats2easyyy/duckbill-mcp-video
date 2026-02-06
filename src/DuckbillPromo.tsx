import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { IntroScene } from "./scenes/IntroScene";
import { StoryScene } from "./scenes/StoryScene";
import { CapabilitiesScene } from "./scenes/CapabilitiesScene";
import { LLMCompatibilityScene } from "./scenes/LLMCompatibilityScene";
import { TaglineScene } from "./scenes/TaglineScene";
import { lightMode } from "./lib/colors";
import {
  INTRO_SCENE_DURATION,
  STORY_SCENE_DURATION,
  CAPABILITIES_SCENE_DURATION,
  LLM_COMPATIBILITY_DURATION,
  TAGLINE_SCENE_DURATION,
  FADE_TRANSITION_FRAMES,
  INTRO_GLOBAL_OFFSET,
  STORY_GLOBAL_OFFSET,
  CAPABILITIES_GLOBAL_OFFSET,
  LLM_GLOBAL_OFFSET,
  TAGLINE_GLOBAL_OFFSET,
  FPS,
  TOTAL_DURATION,
} from "./lib/timing";

/**
 * Main composition — orchestrates the full ~29-second promo.
 *
 * Architecture:
 *   TransitionSeries:
 *     IntroScene              =  156 frames (5.2s) — kinetic typography opening
 *     fade()                  =   15 frames (0.5s overlap)
 *     StoryScene              =  300 frames (10s)  — compressed chat → follow-up → zoom → call → result
 *     fade()                  =   15 frames (0.5s overlap)
 *     CapabilitiesScene       =  180 frames (6s)   — "Duckbill handles your [rotating chips]"
 *     fade()                  =   15 frames (0.5s overlap)
 *     LLMCompatibilityScene   =  150 frames (5s)   — Duckbill logo + expanding LLM ring
 *     fade()                  =   15 frames (0.5s overlap)
 *     TaglineScene            =  150 frames (5s)   — brand reveal + "An MCP for the real world."
 *     Total                   = 156 + 300 + 180 + 150 + 150 - 60 = 876 frames (~29.2s)
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

        <TransitionSeries.Sequence durationInFrames={CAPABILITIES_SCENE_DURATION}>
          <CapabilitiesScene globalFrameOffset={CAPABILITIES_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: FADE_TRANSITION_FRAMES, config: { damping: 200 } })}
        />

        <TransitionSeries.Sequence durationInFrames={LLM_COMPATIBILITY_DURATION}>
          <LLMCompatibilityScene globalFrameOffset={LLM_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: FADE_TRANSITION_FRAMES, config: { damping: 200 } })}
        />

        <TransitionSeries.Sequence durationInFrames={TAGLINE_SCENE_DURATION}>
          <TaglineScene globalFrameOffset={TAGLINE_GLOBAL_OFFSET} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Background audio — sibling to TransitionSeries so it spans full duration */}
      <Audio
        src={staticFile("audio/Skyline Stutter.mp3")}
        volume={audioVolume}
      />
    </>
  );
};
