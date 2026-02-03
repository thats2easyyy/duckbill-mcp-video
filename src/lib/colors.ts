/**
 * Duckbill brand colors — extracted from the frontend design system
 */

export const colors = {
  brand: {
    50: "#fefef4",
    100: "#fcfde8",
    200: "#f8fbcd",
    300: "#f3f9a9",
    400: "#eefb86", // Primary brand lime accent
    500: "#dde76d",
    600: "#c8cc54",
    700: "#a7a53c",
  },
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f0f0f0",
    200: "#e7e7e7",
    300: "#d1d1d1",
    400: "#b0b0b0",
    500: "#9c9c9c",
    600: "#888888",
    700: "#7d7d7d",
    800: "#696969",
    900: "#3d3d3d",
    950: "#292929", // Primary dark background
  },
  slate: {
    50: "#f6f8f9", // Light background
    100: "#ebeff3",
    200: "#d3dce4",
    600: "#486075",
  },
  cream: {
    50: "#f9f9f7",
    100: "#f4f4ef",
    400: "#e6e4de",
  },
  lime: {
    200: "#eefb86",
  },
  mint: {
    400: "#a2dbc6",
  },
} as const;

/**
 * Duckbill brand gradients — CSS linear-gradient strings
 */
export const gradients = {
  /** Mint Green → Light Blue → Lime Yellow */
  primary:
    "linear-gradient(135deg, #91DDC5 21.18%, #E3EDF8 52.8%, #EBFC72 89.37%)",
  /** Lime → Cream → Blue → Light Blue */
  secondary:
    "linear-gradient(135deg, #EBFC72 0%, #F4F4EF 42.31%, #E3EDF8 64.9%, #C1E1FF 100%)",
  /** Soft card gradient */
  card: "linear-gradient(180deg, #F8FBCD 0%, #E5EDF7 71.09%, #E5EDF7 90%)",
} as const;
