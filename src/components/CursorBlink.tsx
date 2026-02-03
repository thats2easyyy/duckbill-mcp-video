import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * A blinking text cursor that toggles visibility every 15 frames (0.5s at 30fps).
 * Uses frame math instead of CSS animations — a Remotion requirement.
 */
export const CursorBlink: React.FC<{ color?: string }> = ({
  color = "#e7e7e7",
}) => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 15) % 2 === 0;

  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: "1.1em",
        backgroundColor: color,
        marginLeft: 2,
        opacity: visible ? 1 : 0,
        verticalAlign: "text-bottom",
      }}
    />
  );
};
