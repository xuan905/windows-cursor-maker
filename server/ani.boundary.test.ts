import { describe, expect, it } from "vitest";
import { fitTileTransform } from "../client/src/lib/tile";
import { CURSOR_OUTPUT_SIZE } from "../client/src/lib/cursorOutput";

describe("ANI frame boundary", () => {
  it("clamps every frame transform inside a 128x128 canvas", () => {
    for (const scale of [0.65, 0.9, 0.98, 1.2]) {
      for (const x of [-100, -16, 0, 16, 100]) {
        for (const y of [-100, -16, 0, 16, 100]) {
          const { x: left, y: top, drawSize } = fitTileTransform(CURSOR_OUTPUT_SIZE, scale, x, y);
          if (drawSize <= CURSOR_OUTPUT_SIZE) {
            expect(left).toBeGreaterThanOrEqual(-1e-6);
            expect(top).toBeGreaterThanOrEqual(-1e-6);
            expect(left + drawSize).toBeLessThanOrEqual(CURSOR_OUTPUT_SIZE + 1e-6);
            expect(top + drawSize).toBeLessThanOrEqual(CURSOR_OUTPUT_SIZE + 1e-6);
          } else {
            expect(left).toBeGreaterThanOrEqual(CURSOR_OUTPUT_SIZE - drawSize - 1e-6);
            expect(top).toBeGreaterThanOrEqual(CURSOR_OUTPUT_SIZE - drawSize - 1e-6);
            expect(left).toBeLessThanOrEqual(1e-6);
            expect(top).toBeLessThanOrEqual(1e-6);
            expect(left + drawSize).toBeGreaterThanOrEqual(CURSOR_OUTPUT_SIZE - 1e-6);
            expect(top + drawSize).toBeGreaterThanOrEqual(CURSOR_OUTPUT_SIZE - 1e-6);
          }
        }
      }
    }
  });
});
