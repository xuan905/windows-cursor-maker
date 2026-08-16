import { describe, expect, it } from "vitest";
import { applyTransparentSource, restoreWorkbenchSource, type WorkbenchSources } from "./backgroundRemovalSources";

const sources: WorkbenchSources = {
  sheetSource: "sheet-original",
  sheetOriginalSource: "sheet-original",
  dynamicSource: "dynamic-original",
  dynamicOriginalSource: "dynamic-original",
};

describe("backgroundRemovalSources", () => {
  it("updates only the sheet source in sheet mode", () => {
    const next = applyTransparentSource("sheet", sources, "sheet-transparent");
    expect(next.sheetSource).toBe("sheet-transparent");
    expect(next.dynamicSource).toBe("dynamic-original");
  });

  it("updates only the dynamic source in dynamic mode", () => {
    const next = applyTransparentSource("dynamic", sources, "dynamic-transparent");
    expect(next.dynamicSource).toBe("dynamic-transparent");
    expect(next.sheetSource).toBe("sheet-original");
  });

  it("restores the current dynamic 5×3 original instead of the sheet image", () => {
    const transparent = applyTransparentSource("dynamic", sources, "dynamic-transparent");
    const restored = restoreWorkbenchSource("dynamic", transparent);
    expect(restored.dynamicSource).toBe("dynamic-original");
    expect(restored.dynamicSource).not.toBe(restored.sheetOriginalSource);
  });
});
