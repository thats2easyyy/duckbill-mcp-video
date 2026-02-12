/**
 * Exchange data and phase-based timing for the Duckbill MCP promo.
 *
 * StoryScene phases (250 frames / 8.3s at 30fps):
 *   1. User message streams (~15–~63)   — "ask duckbill to call presidio hill..." types in
 *   2. Tool call chip (~72–~112)        — "Connecting to Duckbill..." shimmer → "Connected"
 *   3. Phone call (~113–~155)           — "Calling Presidio Hill School ●●●" (waits for tool call settle)
 *   4. Human + result (~155–225)        — sub-label + Duckbill result streams, then fade
 */

import { FPS, snapLocalToBeat, STORY_GLOBAL_OFFSET } from "./timing";

// ── Types ──────────────────────────────────────────────

export interface Exchange {
  followUpText: string;
  callTarget: string;
  duckbillResponse: string;
}

export interface StoryPhaseTiming {
  // Phase 1: user message streams in
  followUpStreamStart: number;
  followUpStreamEnd: number;

  // Phase 2: tool call chip
  toolCallStart: number;
  toolCallConnectedStart: number;
  toolCallEnd: number;

  // Phase 3: phone call
  callChipStart: number;

  // Phase 4: human connected + duckbill result
  humanConnectedStart: number;
  duckbillStreamStart: number;
  duckbillStreamEnd: number;
}

// ── Timing Parameters ──────────────────────────────────

export const USER_CHARS_PER_SECOND = 35;
export const STREAM_CHARS_PER_SECOND = 110;

// ── Exchange Data: Presidio Hill School ────────────────

export const EXCHANGES: Exchange[] = [
  {
    followUpText:
      "ask duckbill to call presidio hill for fall enrollment",
    callTarget: "Presidio Hill School",
    duckbillResponse:
      "Good news! Duckbill talked to admissions — Mia's registered for the Oct 12 info session. Applications are open Nov 15 – Jan 15.",
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
  // Phase 1: user message streams in — snap start to nearest beat
  const followUpStreamStart = snapLocalToBeat(15, globalFrameOffset);
  const followUpStreamFrames = Math.ceil(
    (exchange.followUpText.length / USER_CHARS_PER_SECOND) * FPS
  );
  const followUpStreamEnd = followUpStreamStart + followUpStreamFrames;

  // Phase 2: tool call chip — snap start to nearest beat (after typing finishes ~63)
  const toolCallStart = snapLocalToBeat(70, globalFrameOffset);
  const toolCallConnectedStart = toolCallStart + 25;
  const toolCallEnd = toolCallStart + 40;

  // Phase 3: phone call — snap to first beat after tool call "Connected" settles
  const callChipStart = snapLocalToBeat(toolCallConnectedStart + 15, globalFrameOffset);

  // Phase 4: human connected + duckbill result — snap to nearest beats
  const humanConnectedStart = snapLocalToBeat(callChipStart + 40, globalFrameOffset);
  const duckbillStreamStart = snapLocalToBeat(humanConnectedStart + 15, globalFrameOffset);
  const duckbillStreamFrames = Math.ceil(
    (exchange.duckbillResponse.length / STREAM_CHARS_PER_SECOND) * FPS
  );
  const duckbillStreamEnd = duckbillStreamStart + duckbillStreamFrames;

  return {
    followUpStreamStart,
    followUpStreamEnd,
    toolCallStart,
    toolCallConnectedStart,
    toolCallEnd,
    callChipStart,
    humanConnectedStart,
    duckbillStreamStart,
    duckbillStreamEnd,
  };
}
