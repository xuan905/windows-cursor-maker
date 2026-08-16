import { describe, expect, it } from "vitest";
import { referenceAppearancePrompt, withReferenceAppearance, type ReferenceAppearance } from "./referenceAppearance";

describe("referenceAppearancePrompt", () => {
  it("returns an empty suffix without a reference analysis", () => {
    expect(referenceAppearancePrompt(null)).toBe("");
  });

  it("includes every analyzed appearance field in the generation prompt", () => {
    const appearance: ReferenceAppearance = {
      hairstyle: "短馬尾",
      hairColor: "深紫色",
      faceAndExpression: "圓臉、堅定微笑",
      clothing: "短版飛行外套",
      palette: "白色與橘色",
      accessories: "透明護目鏡",
      proportions: "Q 版大頭身",
      identityTraits: "左眉上方小星形記號",
    };
    const prompt = referenceAppearancePrompt(appearance);
    expect(prompt).toContain("短馬尾");
    expect(prompt).toContain("深紫色");
    expect(prompt).toContain("透明護目鏡");
    expect(prompt).toContain("左眉上方小星形記號");
    expect(prompt).toContain("Do not copy the reference background");
  });

  it("updates both standard and dynamic prompt bases when the reference changes", () => {
    const first: ReferenceAppearance = { hairstyle: "短髮", hairColor: "黑色", faceAndExpression: "圓臉", clothing: "外套", palette: "藍白", accessories: "耳環", proportions: "Q 版", identityTraits: "星形記號" };
    const second = { ...first, hairColor: "銀色", palette: "紅黑" };
    const standard = withReferenceAppearance("STANDARD BASE", second);
    const dynamic = withReferenceAppearance("DYNAMIC BASE", second);
    expect(standard).toContain("銀色");
    expect(dynamic).toContain("紅黑");
    expect(standard).not.toContain("黑色; face");
    expect(withReferenceAppearance("STANDARD BASE", first)).toContain("黑色");
  });
});
