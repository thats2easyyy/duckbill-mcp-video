import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { springPresets } from "../lib/timing";

export interface KineticTextProps {
  /** Array of words to animate */
  words: string[];
  /** Frame at which animation begins */
  startFrame: number;
  /** Animation style: 'slideUp' for entrance, 'scale' for emphasis */
  style?: "slideUp" | "scale";
  /** Frames between each word's animation start (default: 6) */
  staggerFrames?: number;
  /** Font size in pixels (default: 64) */
  fontSize?: number;
  /** Font weight (default: 500) */
  fontWeight?: number;
  /** Text color (default: #292929) */
  color?: string;
}

/**
 * KineticText — Animates words one by one with staggered timing.
 *
 * slideUp: Words slide up from below with opacity fade
 * scale: Words scale up from smaller size
 */
export const KineticText: React.FC<KineticTextProps> = ({
  words,
  startFrame,
  style = "slideUp",
  staggerFrames = 6,
  fontSize = 64,
  fontWeight = 500,
  color = "#292929",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.25em",
      }}
    >
      {words.map((word, index) => {
        const wordStartFrame = startFrame + index * staggerFrames;
        const localFrame = frame - wordStartFrame;

        // Spring progress (0 → 1)
        const progress = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: springPresets.snappy,
        });

        let transform: string;
        let opacity: number;

        if (style === "slideUp") {
          const translateY = interpolate(progress, [0, 1], [40, 0]);
          opacity = interpolate(progress, [0, 1], [0, 1]);
          transform = `translateY(${translateY}px)`;
        } else {
          // scale style
          const scale = interpolate(progress, [0, 1], [0.7, 1]);
          opacity = interpolate(progress, [0, 1], [0, 1]);
          transform = `scale(${scale})`;
        }

        // Before animation starts, hide completely
        if (localFrame < 0) {
          opacity = 0;
          transform = style === "slideUp" ? "translateY(40px)" : "scale(0.7)";
        }

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              opacity,
              transform,
              willChange: "transform, opacity",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
