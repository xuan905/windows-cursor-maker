import { describe, expect, it } from "vitest";
import { removeConnectedBackground } from "./removeBackground";

function pixels(width: number, height: number, fill: [number, number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) data.set(fill, i * 4);
  return data;
}

describe("removeConnectedBackground", () => {
  it("removes edge-connected white background but preserves enclosed white details", () => {
    const data = pixels(5, 5, [255, 255, 255, 255]);
    const center = (2 * 5 + 2) * 4;
    data.set([0, 0, 0, 255], center);
    const innerWhite = (1 * 5 + 2) * 4;
    data.set([255, 255, 255, 255], innerWhite);
    const output = removeConnectedBackground(data, 5, 5);
    expect(output[3]).toBe(0);
    expect(output[center + 3]).toBe(255);
    expect(output[innerWhite + 3]).toBe(0);
  });

  it("removes edge-connected green screen while retaining a colored subject", () => {
    const data = pixels(4, 4, [30, 210, 30, 255]);
    const subject = (1 * 4 + 1) * 4;
    data.set([240, 80, 40, 255], subject);
    const output = removeConnectedBackground(data, 4, 4);
    expect(output[3]).toBe(0);
    expect(output[subject + 3]).toBe(255);
  });

  it("rejects invalid pixel dimensions", () => {
    expect(() => removeConnectedBackground(new Uint8ClampedArray(3), 1, 1)).toThrow("尺寸");
  });
});
