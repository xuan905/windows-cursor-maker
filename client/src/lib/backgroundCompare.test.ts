import { describe, expect, it } from "vitest";
import { clampBackgroundSplit, closeBackgroundCompare, openBackgroundCompare, setBackgroundCompareSplit } from "./backgroundCompare";

describe("background compare state", () => {
  it("clamps the split handle to a usable 10–90% range", () => {
    expect(clampBackgroundSplit(-10)).toBe(10);
    expect(clampBackgroundSplit(50.6)).toBe(51);
    expect(clampBackgroundSplit(120)).toBe(90);
  });

  it("opens, updates, resets, and closes a comparison", () => {
    const opened = openBackgroundCompare();
    expect(opened).toEqual({ open: true, split: 50 });
    const moved = setBackgroundCompareSplit(opened, 72);
    expect(moved).toEqual({ open: true, split: 72 });
    expect(setBackgroundCompareSplit(moved, 50)).toEqual(opened);
    expect(closeBackgroundCompare(moved)).toEqual({ open: false, split: 72 });
  });
});
