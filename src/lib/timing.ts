/**
 * Shared timing constants for the Duckbill MCP promo video.
 *
 * StoryScene    = 615 frames (20.5s) — pre-rendered chat → follow-up → zoom → tool call → phone → human → result
 * TaglineScene  = 150 frames (5s)    — brand reveal + "An MCP for the real world."
 * Fade overlap  = 15 frames × 1 (story→tagline)
 * Total         = 615 + 150 − 15 = 750 frames (25s)
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

export const STORY_SCENE_DURATION = 615; // 20.5 seconds

export const TAGLINE_SCENE_DURATION = 150; // 5 seconds

export const FADE_TRANSITION_FRAMES = 15;

export const TOTAL_DURATION =
  STORY_SCENE_DURATION +
  TAGLINE_SCENE_DURATION -
  FADE_TRANSITION_FRAMES; // 750 frames (25s)
