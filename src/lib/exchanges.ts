/**
 * Exchange data and phase-based timing for the Duckbill MCP promo.
 *
 * StoryScene phases (300 frames / 10s at 30fps):
 *   1. Pre-rendered chat (0–39)    — user prompt + AI response already visible
 *   2. Follow-up streams (40–~79)  — "@Duckbill, call Presidio Hill School..." types in
 *   3. Camera zoom (40–130)        — scale 1→1.4, overlaps typing for dynamic feel
 *   4. Tool call chip (80–125)     — "Connecting to Duckbill..." shimmer → "Connected"
 *   5. Phone call (125–185)        — "Calling Presidio Hill School ●●●" ring pulse
 *   6. Human + result (185–299)    — sub-label + Duckbill result streams, then fade
 */

import { FPS, snapLocalToBeat, STORY_GLOBAL_OFFSET } from "./timing";

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

export const USER_CHARS_PER_SECOND = 60;
export const STREAM_CHARS_PER_SECOND = 70;

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
export function computeStoryPhaseTiming(
  exchange: Exchange,
  globalFrameOffset: number = STORY_GLOBAL_OFFSET
): StoryPhaseTiming {
  // Phase 2: follow-up streams — snap start to nearest beat
  const followUpStreamStart = snapLocalToBeat(40, globalFrameOffset);
  const followUpStreamFrames = Math.ceil(
    (exchange.followUpText.length / USER_CHARS_PER_SECOND) * FPS
  );
  const followUpStreamEnd = followUpStreamStart + followUpStreamFrames;

  // Phase 3: camera zoom (starts with follow-up text for dynamic overlap)
  const zoomStart = followUpStreamStart;
  const zoomEnd = 130;

  // Phase 4: tool call chip — snap start to nearest beat
  const toolCallStart = snapLocalToBeat(80, globalFrameOffset);
  const toolCallConnectedStart = toolCallStart + 30;
  const toolCallEnd = toolCallStart + 45;

  // Phase 5: phone call — snap start to nearest beat
  const callChipStart = snapLocalToBeat(125, globalFrameOffset);

  // Phase 6: human connected + duckbill result — snap to nearest beats
  const humanConnectedStart = snapLocalToBeat(185, globalFrameOffset);
  const duckbillStreamStart = snapLocalToBeat(200, globalFrameOffset);
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
