/**
 * Exchange data and phase-based timing for the Duckbill MCP promo.
 *
 * StoryScene phases (615 frames / 20.5s at 30fps):
 *   1. Pre-rendered chat (0–59)    — user prompt + AI response already visible
 *   2. Follow-up streams (60–~149) — "@Duckbill, call Presidio Hill School..." types in
 *   3. Camera zoom (120–179)       — scale 1→1.4, push research out of view
 *   4. Tool call chip (180–269)    — "Connecting to Duckbill..." with shimmer
 *   5. Phone call (270–389)        — "Calling Presidio Hill School ●●●" ring pulse
 *   6. Human + result (390–509)    — "Human assistant connected" pill, Duckbill result streams
 *   7. Hold (510–614)              — hold result, TransitionSeries fades to TaglineScene
 */

import { FPS } from "./timing";

// ── Types ──────────────────────────────────────────────

export interface Exchange {
  promptText: string;
  aiResponse: string;
  followUpText: string;
  callTarget: string;
  duckbillResponse: string;
}

export interface StoryPhaseTiming {
  // Phase 1: pre-rendered (no animation frames needed, just data)

  // Phase 2: follow-up streams in
  followUpStreamStart: number;
  followUpStreamEnd: number;

  // Phase 3: camera zoom
  zoomStart: number;
  zoomEnd: number;

  // Phase 4: tool call chip
  toolCallStart: number;
  toolCallConnectedStart: number;
  toolCallEnd: number;

  // Phase 5: phone call
  callChipStart: number;

  // Phase 6: human connected + duckbill result
  humanConnectedStart: number;
  duckbillStreamStart: number;
  duckbillStreamEnd: number;
}

// ── Timing Parameters ──────────────────────────────────

export const USER_CHARS_PER_SECOND = 35;
export const STREAM_CHARS_PER_SECOND = 25;

// ── Exchange Data: Presidio Hill School ────────────────

export const EXCHANGES: Exchange[] = [
  {
    promptText:
      "I'm looking at kindergarten options in SF — what are the best schools near Pacific Heights?",
    aiResponse:
      "Great question! Pacific Heights has several excellent options for kindergarten. Here are a few worth looking into:\n\n• Presidio Hill School — A Pre-K–8 independent school known for its outdoor-focused curriculum and small class sizes. It's right on the edge of the Presidio, which is a huge perk.\n\n• Town School for Boys — A well-regarded K–8 school in Pacific Heights with strong academics and a tight-knit community.\n\n• San Francisco Day School — K–8, progressive philosophy with an emphasis on project-based learning and diversity.\n\nPresidio Hill is probably the most competitive for fall enrollment — I'd recommend reaching out soon since info sessions fill up fast.",
    followUpText:
      "Hey @Duckbill, call Presidio Hill School and ask about K enrollment for fall",
    callTarget: "Calling Presidio Hill School",
    duckbillResponse:
      "Done! Info session Oct 12, application deadline Jan 15. ✓",
  },
];

// ── Phase Timing Computation ───────────────────────────

/**
 * Compute phase boundaries for the StoryScene timeline.
 *
 * Fixed anchor points define when each phase starts (matching the storyboard),
 * while streaming durations are computed from text length.
 */
export function computeStoryPhaseTiming(exchange: Exchange): StoryPhaseTiming {
  // Phase 2: follow-up streams starting at frame 60
  const followUpStreamStart = 60;
  const followUpStreamFrames = Math.ceil(
    (exchange.followUpText.length / USER_CHARS_PER_SECOND) * FPS
  );
  const followUpStreamEnd = followUpStreamStart + followUpStreamFrames;

  // Phase 3: camera zoom (overlaps end of phase 2)
  const zoomStart = 120;
  const zoomEnd = 180;

  // Phase 4: tool call chip
  const toolCallStart = 180;
  const toolCallConnectedStart = 260;
  const toolCallEnd = 270;

  // Phase 5: phone call
  const callChipStart = 270;

  // Phase 6: human connected + duckbill result
  const humanConnectedStart = 390;
  const duckbillStreamStart = 420;
  const duckbillStreamFrames = Math.ceil(
    (exchange.duckbillResponse.length / STREAM_CHARS_PER_SECOND) * FPS
  );
  const duckbillStreamEnd = duckbillStreamStart + duckbillStreamFrames;

  return {
    followUpStreamStart,
    followUpStreamEnd,
    zoomStart,
    zoomEnd,
    toolCallStart,
    toolCallConnectedStart,
    toolCallEnd,
    callChipStart,
    humanConnectedStart,
    duckbillStreamStart,
    duckbillStreamEnd,
  };
}
