import { describe, expect, it } from "vitest";
import { applyWorkbenchTransparency, restoreWorkbenchTransparency, setDynamicOriginalSource, type WorkbenchBackgroundState } from "./backgroundRemovalWorkbench";

const initial: WorkbenchBackgroundState = {
  sheetSource: "sheet-source",
  sheetOriginalSource: "sheet-source",
  dynamicSource: null,
  dynamicOriginalSource: null,
  status: "idle",
};

describe("Home workbench background-removal lifecycle", () => {
  it("sets the current dynamic 5×3 source, applies transparency, then restores that same source", () => {
    const withDynamic = setDynamicOriginalSource(initial, "dynamic-5x3-original");
    const transparent = applyWorkbenchTransparency(withDynamic, "dynamic", "dynamic-5x3-transparent");
    expect(transparent.dynamicOriginalSource).toBe("dynamic-5x3-original");
    expect(transparent.dynamicSource).toBe("dynamic-5x3-transparent");
    const restored = restoreWorkbenchTransparency(transparent, "dynamic");
    expect(restored.dynamicSource).toBe("dynamic-5x3-original");
    expect(restored.sheetSource).toBe("sheet-source");
  });

  it("keeps sheet and dynamic updates isolated after switching tabs", () => {
    const withDynamic = setDynamicOriginalSource(initial, "dynamic-5x3-original");
    const dynamicTransparent = applyWorkbenchTransparency(withDynamic, "dynamic", "dynamic-transparent");
    const sheetTransparent = applyWorkbenchTransparency(dynamicTransparent, "sheet", "sheet-transparent");
    expect(sheetTransparent.sheetSource).toBe("sheet-transparent");
    expect(sheetTransparent.dynamicSource).toBe("dynamic-transparent");
    expect(restoreWorkbenchTransparency(sheetTransparent, "dynamic").dynamicSource).toBe("dynamic-5x3-original");
  });
});
