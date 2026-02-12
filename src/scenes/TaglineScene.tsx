import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { springPresets, snapLocalToBeat, TAGLINE_GLOBAL_OFFSET } from "../lib/timing";
import { lightMode } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import { DuckbillLogo } from "../components/DuckbillLogo";

loadBrandFonts();

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

/**
 * TaglineScene — 5-second brand reveal (150 frames at 30fps).
 *
 * Flowing line background → symbol bounce → wordmark fade →
 * tagline → URL.
 *
 * Element entrances are snapped to the global beat grid (130 BPM)
 * and the symbol / flowing line react to bass amplitude.
 */

interface TaglineSceneProps {
  globalFrameOffset?: number;
}

export const TaglineScene: React.FC<TaglineSceneProps> = ({
  globalFrameOffset = TAGLINE_GLOBAL_OFFSET,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalFrame = frame + globalFrameOffset;

  // ── Beat-snapped entrance delays ──
  const wordmarkDelay = snapLocalToBeat(24, globalFrameOffset);
  const taglineDelay = snapLocalToBeat(48, globalFrameOffset);

  // ── Audio reactivity ──
  const audioData = useAudioData(AUDIO_SRC);

  let amplitude = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      audioData,
      frame: globalFrame,
      fps,
      numberOfSamples: 32,
    });
    const bassBins = visualization.slice(1, 6);
    amplitude = bassBins.reduce((s, v) => s + v, 0) / bassBins.length;
  }

  // ── Logo position & size animation ──
  // Uses the SAME DuckbillLogo component as NowYouCanScene so the
  // fade crossfade is invisible (identical asset at identical position).
  // Then the logo smoothly moves up and scales to its final size.
  const LOGO_START_Y = 630; // NowYouCanScene CENTER_Y
  const LOGO_END_Y = 420; // lowered to equalize spacing with wordmark & tagline
  const LOGO_START_SIZE = 80; // matches NowYouCanScene logo size
  const LOGO_END_SIZE = 120; // final brand-mark size

  const logoPositionProgress = spring({
    frame,
    fps,
    config: springPresets.smooth,
  });

  const logoY = interpolate(
    logoPositionProgress,
    [0, 1],
    [LOGO_START_Y, LOGO_END_Y]
  );

  const logoSize = interpolate(
    logoPositionProgress,
    [0, 1],
    [LOGO_START_SIZE, LOGO_END_SIZE]
  );

  // Audio-reactive logo breathing
  const logoScale = 1.0 + amplitude * 0.02;

  // Wordmark fade-in with slight upward slide
  const wordmarkEntrance = spring({
    frame: frame - wordmarkDelay,
    fps,
    config: springPresets.smooth,
  });

  const wordmarkTranslateY = interpolate(wordmarkEntrance, [0, 1], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Tagline fade-in with slight upward slide
  const taglineEntrance = spring({
    frame: frame - taglineDelay,
    fps,
    config: springPresets.smooth,
  });

  const taglineTranslateY = interpolate(taglineEntrance, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });


  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: lightMode.canvas,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        gap: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Spacer — reserves layout space for the absolutely-positioned logo */}
      <div style={{ width: 120, height: 160, flexShrink: 0 }} />

      {/* DuckbillLogo — same component as NowYouCanScene.
          Starts at (540, 580) matching the LLM scene exactly so the
          fade crossfade is invisible, then animates to final position. */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: logoY,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          zIndex: 2,
        }}
      >
        <DuckbillLogo size={Math.round(logoSize)} />
      </div>

      {/* Official wordmark */}
      <div
        style={{
          opacity: wordmarkEntrance,
          transform: `translateY(${wordmarkTranslateY}px)`,
          zIndex: 1,
        }}
      >
        <Img
          src={staticFile("svgs/Duckbill_Wordmark.svg")}
          width={400}
          height={74}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineEntrance,
          transform: `translateY(${taglineTranslateY}px)`,
          marginTop: 32,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: lightMode.bodyText,
            opacity: 0.85,
          }}
        >
          Learn more at whattheduck.ai
        </span>
      </div>

    </div>
  );
};
