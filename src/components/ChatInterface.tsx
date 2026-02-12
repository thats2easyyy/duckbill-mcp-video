import React from "react";
import "../index.css";
import { fontFamily } from "../lib/fonts";

/**
 * Transparent centering wrapper on the cream canvas.
 *
 * The "Center-Out" layout uses `justifyContent: 'center'` so that when
 * only the input bar exists (start of exchange), it appears in the vertical
 * center. As messages accumulate, the content block grows and naturally
 * shifts upward while staying centered.
 *
 * Messages float directly on the cream canvas — no white card.
 */
export const ChatInterface: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div
      style={{
        width: 880,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "36px 40px",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
      }}
    >
      {children}
    </div>
  );
};
