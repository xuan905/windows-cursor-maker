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

  it("removes edge-connected pure #00FF00 background while retaining a colored subject", () => {
    const data = pixels(4, 4, [0, 255, 0, 255]);
    const subject = (1 * 4 + 1) * 4;
    data.set([240, 80, 40, 255], subject);
    const output = removeConnectedBackground(data, 4, 4);
    expect(output[3]).toBe(0);
    expect(output[subject + 3]).toBe(255);
  });

  it("keeps enclosed green details and black work-item outlines inside a subject", () => {
    const data = pixels(7, 7, [0, 255, 0, 255]);
    for (let y = 2; y <= 4; y += 1) {
      for (let x = 2; x <= 4; x += 1) data.set([240, 80, 40, 255], (y * 7 + x) * 4);
    }
    const enclosedGreen = (3 * 7 + 3) * 4;
    data.set([0, 255, 0, 255], enclosedGreen);
    const blackOutline = (2 * 7 + 2) * 4;
    data.set([0, 0, 0, 255], blackOutline);
    const output = removeConnectedBackground(data, 7, 7);
    expect(output[3]).toBe(0);
    expect(output[enclosedGreen + 3]).toBe(255);
    expect(output[blackOutline + 3]).toBe(255);
  });

  it("preserves a multi-pixel white-fill black-outline work-item arrow inside pure green background", () => {
    const width = 11;
    const data = pixels(width, 11, [0, 255, 0, 255]);
    const black = [[3, 3], [3, 4], [3, 5], [4, 3], [4, 5], [5, 3], [5, 5], [6, 3], [6, 4], [6, 5]];
    const white = [[4, 4], [5, 4]];
    const setPixel = (x: number, y: number, fill: [number, number, number, number]) => data.set(fill, (y * width + x) * 4);
    for (const [x, y] of black) setPixel(x, y, [0, 0, 0, 255]);
    for (const [x, y] of white) setPixel(x, y, [255, 255, 255, 255]);
    const output = removeConnectedBackground(data, width, 11);
    expect(output[3]).toBe(0);
    for (const [x, y] of black) expect(output[(y * width + x) * 4 + 3]).toBe(255);
    for (const [x, y] of white) expect(output[(y * width + x) * 4 + 3]).toBe(255);
  });

  it("supports red, yellow, green, and blue chroma-key backgrounds", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 255, g: 255, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];
    for (const color of colors) {
      const width = 7;
      const data = pixels(width, width, [color.r, color.g, color.b, 255]);
      for (let y = 2; y <= 4; y += 1) for (let x = 2; x <= 4; x += 1) data.set([20, 30, 40, 255], (y * width + x) * 4);
      const subject = (2 * width + 2) * 4;
      const enclosed = (3 * width + 3) * 4;
      data.set([color.r, color.g, color.b, 255], enclosed);
      const output = removeConnectedBackground(data, width, width, { backgroundColor: color });
      expect(output[3]).toBe(0);
      expect(output[subject + 3]).toBe(255);
      expect(output[enclosed + 3]).toBe(255);
    }
  });

  it("removes compressed and anti-aliased red-screen near-colors from the edge", () => {
    const data = pixels(5, 5, [230, 14, 12, 255]);
    const subject = (2 * 5 + 2) * 4;
    data.set([20, 30, 40, 255], subject);
    const output = removeConnectedBackground(data, 5, 5, { backgroundColor: { r: 255, g: 0, b: 0 } });
    expect(output[3]).toBe(0);
    expect(output[subject + 3]).toBe(255);
  });

  it("rejects invalid pixel dimensions", () => {
    expect(() => removeConnectedBackground(new Uint8ClampedArray(3), 1, 1)).toThrow("尺寸");
  });
});
