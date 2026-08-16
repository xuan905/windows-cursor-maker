import { describe, expect, it } from "vitest";
import {
  CURSOR_OUTPUT_SIZE,
  CURSOR_SHEET_COLUMNS,
  CURSOR_SHEET_ROWS,
  isCursorOutputSize,
} from "./cursorOutput";

describe("cursor output size contract", () => {
  it("keeps every exported cursor cell at exactly 64×64", () => {
    expect(CURSOR_OUTPUT_SIZE).toBe(64);
    expect(isCursorOutputSize(64, 64)).toBe(true);
    expect(isCursorOutputSize(32, 32)).toBe(false);
    expect(isCursorOutputSize(128, 64)).toBe(false);
  });

  it("defines the normalized 5×3 sheet as 320×192", () => {
    expect(CURSOR_SHEET_COLUMNS * CURSOR_OUTPUT_SIZE).toBe(320);
    expect(CURSOR_SHEET_ROWS * CURSOR_OUTPUT_SIZE).toBe(192);
  });
});
