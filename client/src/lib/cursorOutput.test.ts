import { describe, expect, it } from "vitest";
import {
  CURSOR_OUTPUT_SIZE,
  CURSOR_SHEET_COLUMNS,
  CURSOR_SHEET_HEIGHT,
  CURSOR_SHEET_WIDTH,
  CURSOR_SHEET_ROWS,
  isCursorOutputSize,
} from "./cursorOutput";

describe("cursor output size contract", () => {
  it("keeps every exported cursor cell at exactly 128×128", () => {
    expect(CURSOR_OUTPUT_SIZE).toBe(128);
    expect(isCursorOutputSize(128, 128)).toBe(true);
    expect(isCursorOutputSize(32, 32)).toBe(false);
    expect(isCursorOutputSize(64, 64)).toBe(false);
  });

  it("defines the normalized 5×3 sheet as 640×384", () => {
    expect(CURSOR_SHEET_WIDTH).toBe(640);
    expect(CURSOR_SHEET_HEIGHT).toBe(384);
    expect(CURSOR_SHEET_WIDTH).toBe(CURSOR_SHEET_COLUMNS * CURSOR_OUTPUT_SIZE);
    expect(CURSOR_SHEET_HEIGHT).toBe(CURSOR_SHEET_ROWS * CURSOR_OUTPUT_SIZE);
  });
});
