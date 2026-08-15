export const cursorNames = [
  "游標選擇",
  "說明選擇",
  "背景作業",
  "忙碌中",
  "精準選取",
  "無法使用",
  "垂直調整",
  "水平調整",
  "對角調整左上右下",
  "對角調整右上左下",
  "移動",
  "精準選擇",
  "手寫",
  "候選",
  "連結選擇",
] as const;

export const cursorArrowKinds = [
  "standard", "help", "background", "busy", "precision", "unavailable", "vertical", "horizontal", "diagonal-nwse", "diagonal-nesw", "move", "alternate", "pen", "candidate", "link",
] as const;

export type CursorArrowKind = (typeof cursorArrowKinds)[number];

export const cursorArrowSpecs = [
  "solid white standard arrow with crisp black outline",
  "solid white help arrow with crisp black outline",
  "solid white background-work arrow with crisp black outline",
  "solid white busy hourglass with crisp black outline",
  "solid white precision crosshair with crisp black outline",
  "solid white unavailable symbol with crisp black outline",
  "solid white vertical resize arrow with crisp black outline",
  "solid white horizontal resize arrow with crisp black outline",
  "solid white NW-SE diagonal resize arrow with crisp black outline",
  "solid white NE-SW diagonal resize arrow with crisp black outline",
  "solid white move cross-arrow with crisp black outline",
  "solid white alternate-select arrow with crisp black outline",
  "solid white handwriting pen with crisp black outline",
  "solid white candidate/selection arrow with crisp black outline",
  "solid white link arrow with crisp black outline",
] as const;

export function getCursorArrowSpec(index: number) {
  return cursorArrowSpecs[index] ?? cursorArrowSpecs[0];
}

export function hasRequiredArrowStyle(spec: string) {
  return spec.includes("solid white") && spec.includes("crisp black outline");
}

export function inspectArrowRegion(data: Uint8ClampedArray, width: number, height: number, expectedKind: CursorArrowKind = "standard") {
  const regionWidth = Math.max(1, Math.floor(width * 0.28));
  const regionHeight = Math.max(1, Math.floor(height * 0.28));
  let opaquePixels = 0;
  let whitePixels = 0;
  let blackPixels = 0;
  let diagonalPixels = 0;
  let horizontalPixels = 0;
  let verticalPixels = 0;
  for (let y = 0; y < regionHeight; y += 1) {
    for (let x = 0; x < regionWidth; x += 1) {
      const offset = (y * width + x) * 4;
      const r = data[offset] ?? 0;
      const g = data[offset + 1] ?? 0;
      const b = data[offset + 2] ?? 0;
      const a = data[offset + 3] ?? 0;
      if (a < 32) continue;
      opaquePixels += 1;
      if (r > 220 && g > 220 && b > 220) whitePixels += 1;
      if (r < 45 && g < 45 && b < 45) {
        blackPixels += 1;
        if (Math.abs(x - y) <= 2 || x > y + 2) diagonalPixels += 1;
        if (x >= regionWidth * 0.6) horizontalPixels += 1;
        if (y >= regionHeight * 0.6) verticalPixels += 1;
      }
    }
  }
  const diagonalShape = diagonalPixels >= 2;
  const directionalMatch = expectedKind === "horizontal" ? horizontalPixels >= 2 : expectedKind === "vertical" ? verticalPixels >= 2 : expectedKind === "move" ? horizontalPixels >= 1 && verticalPixels >= 1 : expectedKind.startsWith("diagonal") || expectedKind === "pen" ? diagonalShape : diagonalShape || horizontalPixels >= 1 || verticalPixels >= 1;
  return {
    present: opaquePixels > 0,
    whiteFill: whitePixels > 0,
    blackOutline: blackPixels >= 2,
    diagonalShape,
    directionalMatch,
    expectedKind,
    insideSafeRegion: regionWidth <= width && regionHeight <= height,
  };
}
