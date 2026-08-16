import { describe, expect, it } from "vitest";
import { applyHomeTransparency, restoreHomeTransparency, setHomeSourceFromDynamicGeneration } from "./homeBackgroundController";
import type { WorkbenchBackgroundState } from "./backgroundRemovalWorkbench";

type Setters = Parameters<typeof applyHomeTransparency>[3];

const makeState = (): WorkbenchBackgroundState => ({
  sheetSource: "sheet-original",
  sheetOriginalSource: "sheet-original",
  dynamicSource: null,
  dynamicOriginalSource: null,
  status: "idle",
});

function makeSetters() {
  const values = { sheet: "sheet-original", sheetOriginal: "sheet-original", dynamic: null as string | null, dynamicOriginal: null as string | null };
  const setters: Setters = {
    setSheetSource: value => { values.sheet = value; },
    setSheetOriginalSource: value => { values.sheetOriginal = value; },
    setDynamicSource: value => { values.dynamic = value; },
    setDynamicOriginalSource: value => { values.dynamicOriginal = value; },
  };
  return { values, setters };
}

describe("Home background-removal controller", () => {
  it("runs dynamic generation → transparency → restore through the page setters", () => {
    const { values, setters } = makeSetters();
    const generated = setHomeSourceFromDynamicGeneration(makeState(), "dynamic-5x3-original", setters);
    expect(values.dynamic).toBe("dynamic-5x3-original");
    expect(values.dynamicOriginal).toBe("dynamic-5x3-original");
    const transparent = applyHomeTransparency("dynamic", generated, "dynamic-transparent", setters);
    expect(values.dynamic).toBe("dynamic-transparent");
    const restored = restoreHomeTransparency("dynamic", transparent, setters);
    expect(values.dynamic).toBe("dynamic-5x3-original");
    expect(restored.sheetSource).toBe("sheet-original");
  });

  it("updates sheet and dynamic setters independently after switching tabs", () => {
    const { values, setters } = makeSetters();
    const generated = setHomeSourceFromDynamicGeneration(makeState(), "dynamic-5x3-original", setters);
    const dynamicTransparent = applyHomeTransparency("dynamic", generated, "dynamic-transparent", setters);
    const sheetTransparent = applyHomeTransparency("sheet", dynamicTransparent, "sheet-transparent", setters);
    expect(values.dynamic).toBe("dynamic-transparent");
    expect(values.sheet).toBe("sheet-transparent");
    restoreHomeTransparency("dynamic", sheetTransparent, setters);
    expect(values.dynamic).toBe("dynamic-5x3-original");
    expect(values.sheet).toBe("sheet-transparent");
  });

  it("restores the sheet source without changing the dynamic source", () => {
    const { values, setters } = makeSetters();
    const generated = setHomeSourceFromDynamicGeneration(makeState(), "dynamic-5x3-original", setters);
    const sheetTransparent = applyHomeTransparency("sheet", generated, "sheet-transparent", setters);
    expect(values.sheet).toBe("sheet-transparent");
    restoreHomeTransparency("sheet", sheetTransparent, setters);
    expect(values.sheet).toBe("sheet-original");
    expect(values.dynamic).toBe("dynamic-5x3-original");
  });
});
