/**
 * Shared timing constants for the Duckbill MCP promo video.
 *
 * IntroScene              = 165 frames (5.5s)  — kinetic typography opening (4 phrases, beat-aligned)
 * StoryScene              = 250 frames (8.3s)  — user message → tool call → phone → result
 * NowYouCanScene          = 160 frames (5.33s) — "Now you can" + Duckbill logo + LLM compatibility ring
 * TaglineScene            = 150 frames (5s)    — brand reveal + "An MCP for the real world."
 * Fade overlaps           = 15 frames × 3 (intro→story, story→nowyoucan, nowyoucan→tagline)
 * Total                   = 165 + 250 + 160 + 150 − 45 = 680 frames (~22.7s)
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

export const INTRO_SCENE_DURATION = 165; // 5.5 seconds (4 phrases, beat-aligned + snappy exit)

export const STORY_SCENE_DURATION = 250; // 8.3 seconds (stream ends ~187f, read until 225f, exit 225–250f)

export const NOW_YOU_CAN_DURATION = 160; // 5.33 seconds — "Now you can" + LLM compatibility merged

export const TAGLINE_SCENE_DURATION = 150; // 5 seconds

export const FADE_TRANSITION_FRAMES = 15;

export const BPM = 130;
export const FRAMES_PER_BEAT = FPS / (BPM / 60); // ~13.846

// ── Global scene start frames (accounting for 15-frame fade overlaps) ──

export const INTRO_GLOBAL_OFFSET = 0;

export const STORY_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION - FADE_TRANSITION_FRAMES; // 150

export const NOW_YOU_CAN_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION -
  FADE_TRANSITION_FRAMES * 2; // 375

export const TAGLINE_GLOBAL_OFFSET =
  INTRO_SCENE_DURATION +
  STORY_SCENE_DURATION +
  NOW_YOU_CAN_DURATION -
  FADE_TRANSITION_FRAMES * 3; // 530

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
  NOW_YOU_CAN_DURATION +
  TAGLINE_SCENE_DURATION -
  FADE_TRANSITION_FRAMES * 3; // 680 frames (~22.7s)
