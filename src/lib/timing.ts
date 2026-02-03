/**
 * Shared timing constants for the Duckbill MCP promo video.
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

/**
 * Scene durations in seconds (and derived frame counts).
 */
export const sceneDurations = {
  chat: 8,
  handoff: 8,
  result: 8,
  cta: 6,
} as const;

export const sceneFrames = {
  chat: seconds(sceneDurations.chat),
  handoff: seconds(sceneDurations.handoff),
  result: seconds(sceneDurations.result),
  cta: seconds(sceneDurations.cta),
} as const;

export const TOTAL_DURATION = seconds(
  sceneDurations.chat +
    sceneDurations.handoff +
    sceneDurations.result +
    sceneDurations.cta
);
