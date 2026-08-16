import { describe, expect, it } from "vitest";
import { createCropWorkbenchState } from "./cropWorkbench";

describe("cropWorkbench", () => {
  it("loads an uploaded PNG into the 15-cell sheet workbench", () => {
    const state = createCropWorkbenchState("data:image/png;base64,uploaded", { x: 8, y: -4, scale: 0.72 });
    expect(state.workspaceTab).toBe("sheet");
    expect(state.imageSrc).toContain("uploaded");
    expect(state.isReady).toBe(true);
    expect(state.active).toBe(0);
    expect(state.tunes).toHaveLength(15);
    expect(state.tunes.every((tune) => tune.x === 8 && tune.y === -4 && tune.scale === 0.72)).toBe(true);
    expect(state.hotspotX).toBe(0);
    expect(state.hotspotY).toBe(0);
    expect(state.curPreview).toBeNull();
  });

  it("resets stale crop state when a generated 5x3 image is loaded", () => {
    const state = createCropWorkbenchState("https://storage.example/generated-5x3.png", { x: 0, y: 0, scale: 0.9 });
    expect(state.imageSrc).toBe("https://storage.example/generated-5x3.png");
    expect(state.tunes).toHaveLength(15);
    expect(state.curPreview).toBeNull();
  });
});
