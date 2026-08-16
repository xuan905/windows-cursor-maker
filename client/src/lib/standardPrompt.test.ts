import { describe, expect, it } from "vitest";
import { buildStandardPrompt, buildStandardV2Prompt } from "./standardPrompt";
import { getChromaKeyColor } from "./chromaKeyColors";

describe("standard prompt", () => {
  it("contains the required bilingual sprite-sheet production contract", () => {
    const prompt = buildStandardPrompt("一拳超人 Q 版崎玉老師，光頭、黃色英雄服、紅色手套與白色披風");
    expect(prompt).toContain("clean 5×3 PNG sprite sheet");
    expect(prompt).toContain("15 cells must be exactly equal");
    expect(prompt).toContain("final 128×128 output");
    expect(prompt).toContain("12% safe margin");
    expect(prompt).toContain("solid white interior/fill with crisp black outline/linework");
    expect(prompt).toContain("#00FF00");
    expect(prompt).toContain("edge-connected pure green background");
    expect(prompt).toContain("output true transparent RGBA");
    expect(prompt).toContain("純綠色（#00FF00）");
    expect(prompt).toContain("生成請使用純綠色（#00FF00）作為暫時去背背景");
    expect(prompt).toContain("Row order: 1–5 standard select");
    expect(prompt).toContain("建立一個乾淨的 5×3 PNG 精靈圖");
    expect(prompt).toContain("四邊 12% 的可見安全邊距");
    expect(prompt).toContain("行順序：1–5 行為標準選擇");
    expect(prompt).toContain("一拳超人 Q 版崎玉老師");
  });

  it("updates the bilingual chroma-key instruction for a selected color", () => {
    const prompt = buildStandardPrompt("原創 Q 版角色", getChromaKeyColor("red"));
    expect(prompt).toContain("red chroma-key background (#FF0000)");
    expect(prompt).toContain("純紅色（#FF0000）");
    expect(prompt).not.toContain("純綠色（#00FF00）作為暫時去背背景");
  });

  it("does not retain the incomplete or contradictory legacy wording", () => {
    const prompt = buildStandardPrompt("一拳超人 Q 版崎玉老師");
    expect(prompt).not.toContain("Use one  with a compact silhouette");
    expect(prompt).not.toContain("Keep this character original and do not copy any existing franchise");
  });

  it("builds version two with Genos direction and all 15 actions", () => {
    const prompt = buildStandardV2Prompt();
    expect(prompt).toContain("傑諾斯");
    expect(prompt).toContain("128×128");
    expect(prompt).toContain("640×384");
    expect(prompt).toContain("純綠色");
    expect(prompt).toContain("雙掌向前猛烈發射熾熱的火焰焚燒炮");
    expect(prompt).toContain("雙手捧著一個發光的 3D 立體全息地圖投影進行掃描");
  });
});
