import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { DuckbillLogo } from "../components/DuckbillLogo";
import { springPresets, seconds } from "../lib/timing";
import { gradients } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

/**
 * Scene 4: CTA (~6s / 180 frames)
 *
 * Brand reveal. The chat interface fades out and the Duckbill
 * primary gradient fills the screen. Then:
 * 1. Logo bounces in with a playful spring
 * 2. Tagline fades in: "Your AI agent's human hands."
 * 3. URL fades in: duckbill.ai
 * 4. Final frame holds for 2 seconds
 *
 * The gradient (mint → blue → lime) is Duckbill's brand signature.
 */
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance — bouncy spring for playful emphasis
  const logoEntrance = spring({
    frame: frame - seconds(0.5),
    fps,
    config: springPresets.bouncy,
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.3, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Tagline fade-in with slight upward slide
  const taglineEntrance = spring({
    frame: frame - seconds(1.8),
    fps,
    config: springPresets.smooth,
  });

  const taglineTranslateY = interpolate(taglineEntrance, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // URL fade-in
  const urlEntrance = spring({
    frame: frame - seconds(2.8),
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
        background: gradients.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        gap: 32,
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoEntrance,
          transform: `scale(${logoScale})`,
        }}
      >
        <DuckbillLogo size={160} />
      </div>

      {/* Wordmark */}
      <div
        style={{
          opacity: logoEntrance,
          transform: `scale(${logoScale})`,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#292929",
            letterSpacing: -1,
          }}
        >
          Duckbill
        </span>
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
            color: "#292929",
            opacity: 0.85,
          }}
        >
          Your AI agent&apos;s human hands.
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
            color: "#292929",
            opacity: 0.65,
            letterSpacing: 1,
          }}
        >
          duckbill.ai
        </span>
      </div>
    </div>
  );
};
