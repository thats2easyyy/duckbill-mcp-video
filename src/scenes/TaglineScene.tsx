import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { springPresets, seconds } from "../lib/timing";
import { lightMode } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

/**
 * TaglineScene — 5-second brand reveal (150 frames at 30fps).
 *
 * Same structure as previous CTA: symbol bounce → wordmark fade → tagline → URL.
 * Compressed to 150 frames with reduced hold time.
 *
 * New tagline: "An MCP for the real world."
 */
export const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Symbol entrance — bouncy spring for playful emphasis
  const symbolEntrance = spring({
    frame: frame - seconds(0.3),
    fps,
    config: springPresets.bouncy,
  });

  const symbolScale = interpolate(symbolEntrance, [0, 1], [0.3, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Wordmark fade-in with slight upward slide
  const wordmarkEntrance = spring({
    frame: frame - seconds(0.8),
    fps,
    config: springPresets.smooth,
  });

  const wordmarkTranslateY = interpolate(wordmarkEntrance, [0, 1], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Tagline fade-in with slight upward slide
  const taglineEntrance = spring({
    frame: frame - seconds(1.6),
    fps,
    config: springPresets.smooth,
  });

  const taglineTranslateY = interpolate(taglineEntrance, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // URL fade-in
  const urlEntrance = spring({
    frame: frame - seconds(2.4),
    fps,
    config: springPresets.smooth,
  });

  const urlTranslateY = interpolate(urlEntrance, [0, 1], [15, 0], {
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
        gap: 32,
      }}
    >
      {/* Official symbol */}
      <div
        style={{
          opacity: symbolEntrance,
          transform: `scale(${symbolScale})`,
        }}
      >
        <Img
          src={staticFile("svgs/Duckbill_Symbol.svg")}
          width={100}
          height={127}
        />
      </div>

      {/* Official wordmark */}
      <div
        style={{
          opacity: wordmarkEntrance,
          transform: `translateY(${wordmarkTranslateY}px)`,
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
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: lightMode.bodyText,
            opacity: 0.85,
          }}
        >
          An MCP for the real world.
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlEntrance,
          transform: `translateY(${urlTranslateY}px)`,
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: lightMode.bodyText,
            opacity: 0.65,
            letterSpacing: 1,
          }}
        >
          whattheduck.ai
        </span>
      </div>
    </div>
  );
};
