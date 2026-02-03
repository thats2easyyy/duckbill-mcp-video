import React from "react";
import "../index.css";
import { fontFamily } from "../lib/fonts";
import { colors } from "../lib/colors";

/**
 * Shared dark-mode chat UI shell.
 *
 * This wraps scenes 1–3, providing a consistent chat window appearance.
 * The dark neutral-950 background (#292929) is the same color used in
 * Duckbill's design system for primary dark surfaces.
 *
 * Children are rendered in the message area with vertical flex layout.
 */
export const ChatInterface: React.FC<{
  children: React.ReactNode;
  showHeader?: boolean;
}> = ({ children, showHeader = true }) => {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: colors.neutral[950],
        display: "flex",
        flexDirection: "column",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        overflow: "hidden",
      }}
    >
      {/* Top bar — minimal, just a subtle header line */}
      {showHeader && (
        <div
          style={{
            height: 80,
            borderBottom: `1px solid ${colors.neutral[900]}`,
            display: "flex",
            alignItems: "center",
            paddingLeft: 40,
            paddingRight: 40,
          }}
        >
          {/* Three window dots */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.neutral[700],
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.neutral[700],
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.neutral[700],
              }}
            />
          </div>
        </div>
      )}

      {/* Message area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "40px 48px",
          gap: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
