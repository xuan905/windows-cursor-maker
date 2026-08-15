import { describe, expect, it } from "vitest";
import { fitTileTransform } from "../client/src/lib/tile";

describe("ANI frame boundary", () => {
  it("clamps every frame transform inside a 64x64 canvas", () => {
    for (const scale of [0.65, 0.9, 0.98, 1.2]) {
      for (const x of [-100, -16, 0, 16, 100]) {
        for (const y of [-100, -16, 0, 16, 100]) {
          const { x: left, y: top, drawSize } = fitTileTransform(64, scale, x, y);
          if (drawSize <= 64) {
            expect(left).toBeGreaterThanOrEqual(-1e-6);
            expect(top).toBeGreaterThanOrEqual(-1e-6);
            expect(left + drawSize).toBeLessThanOrEqual(64 + 1e-6);
            expect(top + drawSize).toBeLessThanOrEqual(64 + 1e-6);
          } else {
            expect(left).toBeGreaterThanOrEqual(64 - drawSize - 1e-6);
            expect(top).toBeGreaterThanOrEqual(64 - drawSize - 1e-6);
            expect(left).toBeLessThanOrEqual(1e-6);
            expect(top).toBeLessThanOrEqual(1e-6);
            expect(left + drawSize).toBeGreaterThanOrEqual(64 - 1e-6);
            expect(top + drawSize).toBeGreaterThanOrEqual(64 - 1e-6);
          }
        }
      }
    }
  });
});
