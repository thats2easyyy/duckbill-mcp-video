import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Load PPNeueMontreal brand fonts.
 * Call this at the top level of your composition (outside render).
 */

export const fontFamily = "PPNeueMontreal";

let fontsLoaded = false;

export const loadBrandFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;

  loadFont({
    family: fontFamily,
    url: staticFile("fonts/ppneuemontreal-book.otf"),
    weight: "400",
  });

  loadFont({
    family: fontFamily,
    url: staticFile("fonts/ppneuemontreal-medium.otf"),
    weight: "500",
  });

  loadFont({
    family: fontFamily,
    url: staticFile("fonts/ppneuemontreal-bold.otf"),
    weight: "700",
  });
};
