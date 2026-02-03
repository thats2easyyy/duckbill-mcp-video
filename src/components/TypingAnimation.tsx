import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import { CursorBlink } from "./CursorBlink";

/**
 * Character-by-character typing animation.
 *
 * Uses `interpolate()` to map the current frame to a character index,
 * then slices the text. The cursor blinks at the end while typing
 * and continues blinking after completion.
 *
 * @param text - The full string to type out
 * @param startFrame - Frame at which typing begins (local to the Sequence)
 * @param charsPerSecond - Typing speed (default 25 chars/sec feels natural)
 * @param cursorColor - Color of the blinking cursor
 */
export const TypingAnimation: React.FC<{
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  cursorColor?: string;
  fps?: number;
}> = ({
  text,
  startFrame = 0,
  charsPerSecond = 25,
  cursorColor = "#e7e7e7",
  fps = 30,
}) => {
  const frame = useCurrentFrame();

  const totalTypingFrames = Math.ceil((text.length / charsPerSecond) * fps);

  const charIndex = Math.floor(
    interpolate(frame, [startFrame, startFrame + totalTypingFrames], [0, text.length], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    })
  );

  const displayedText = text.slice(0, charIndex);
  const isDone = charIndex >= text.length;

  return (
    <span>
      {displayedText}
      {/* Show cursor while typing and keep blinking after done */}
      <CursorBlink color={isDone ? cursorColor : cursorColor} />
    </span>
  );
};
