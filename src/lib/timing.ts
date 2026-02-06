/**
 * Shared timing constants for the Duckbill MCP promo video.
 *
 * IntroScene              = 210 frames (7.0s)  — kinetic typography opening (3 phrases, beat-aligned)
 * StoryScene              = 300 frames (10s)   — compressed chat → follow-up → zoom → tool call → phone → result
 * CapabilitiesScene       = 180 frames (6s)    — "Duckbill handles your [rotating chips]"
 * LLMCompatibilityScene   = 150 frames (5s)    — Duckbill logo + expanding LLM ring
 * TaglineScene            = 150 frames (5s)    — brand reveal + "An MCP for the real world."
 * Fade overlaps           = 15 frames × 4 (intro→story, story→capabilities, capabilities→llm, llm→tagline)
 * Total                   = 210 + 300 + 180 + 150 + 150 − 60 = 930 frames (~31.0s)
 */

export const FPS = 30;

/** Convert seconds to frames */
export const seconds = (s: number) => Math.round(s * FPS);

/**
 * Spring animation presets for Remotion's spring() function.
 * These return the config object (minus `frame` and `fps`, which are caller-supplied).
 */
export const springPresets = {
  /** Smooth ease-in — good for fades and slides */
  smooth: { damping: 200 },
  /** Snappy — good for UI element entrances */
  snappy: { damping: 20, stiffness: 200 },
  /** Bouncy — good for logo/CTA emphasis */
  bouncy: { damping: 8 },
} as const;

export const INTRO_SCENE_DURATION = 210; // 7.0 seconds (3 phrases, beat-aligned + 30f exit)

export const STORY_SCENE_DURATION = 300; // 10 seconds

export const LLM_COMPATIBILITY_DURATION = 150; // 5 seconds

export const CAPABILITIES_SCENE_DURATION = 180; // 6 seconds

export const TAGLINE_SCENE_DURATION = 150; // 5 seconds

export const FADE_TRANSITION_FRAMES = 15;

export const BPM = 130;
export const FRAMES_PER_BEAT = FPS / (BPM / 60); // ~13.846

// ── Global scene start frames (accounting for 15-frame fade overlaps) ──

export const INTRO_GLOBAL_OFFSET = 0;

export const STORY_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION - FADE_TRANSITION_FRAMES; // 195

export const CAPABILITIES_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION -
  FADE_TRANSITION_FRAMES * 2; // 480

export const LLM_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION +
  CAPABILITIES_SCENE_DURATION -
  FADE_TRANSITION_FRAMES * 3; // 645

export const TAGLINE_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION +
  CAPABILITIES_SCENE_DURATION +
  LLM_COMPATIBILITY_DURATION -
  FADE_TRANSITION_FRAMES * 4; // 780

// ── Beat-snapping utilities ──

/**
 * Compute the local frame offset needed so that the first chip entrance
 * lands on the nearest clean beat boundary.
 *
 * Given a global frame offset (where the scene starts in the composition),
 * this finds how many frames until the next beat and returns that as the
 * local offset to use for the first chip entrance.
 */
export const computeNextBeatOffset = (globalFrameOffset: number): number => {
  const remainder = globalFrameOffset % FRAMES_PER_BEAT;
  const toNextBeat = remainder === 0 ? 0 : FRAMES_PER_BEAT - remainder;
  return Math.round(toNextBeat);
};

/**
 * Snap a global frame number to the nearest beat boundary.
 */
export const snapToBeat = (globalFrame: number): number => {
  return Math.round(globalFrame / FRAMES_PER_BEAT) * FRAMES_PER_BEAT;
};

/**
 * Return the global frame of the Nth beat (0-indexed).
 */
export const globalBeatAt = (n: number): number => {
  return Math.round(n * FRAMES_PER_BEAT);
};

/**
 * Snap a local frame (within a scene) to the nearest beat, accounting
 * for the scene's global offset. Returns a local frame number.
 */
export const snapLocalToBeat = (
  localFrame: number,
  sceneGlobalOffset: number
): number => {
  const globalFrame = sceneGlobalOffset + localFrame;
  const snappedGlobal = snapToBeat(globalFrame);
  return Math.round(snappedGlobal - sceneGlobalOffset);
};

export const TOTAL_DURATION =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION +
  CAPABILITIES_SCENE_DURATION +
  LLM_COMPATIBILITY_DURATION +
  TAGLINE_SCENE_DURATION -
  FADE_TRANSITION_FRAMES * 4; // 930 frames (~31.0s)
