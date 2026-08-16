import { describe, expect, it } from "vitest";
import { filterHistoryItems, getHistoryThemes } from "./historyFilter";

const items = [
  { id: 1, title: "熱血武道 · hero.png", prompt: "golden hair and orange outfit", theme: "熱血武道 Q 版", imageUrl: "https://cdn.example.com/hero.png", isFavorite: true },
  { id: 2, title: "月影忍者 · ninja.png", prompt: "deep blue cloak", theme: "月影忍者漫畫", imageUrl: "https://cdn.example.com/ninja.png", isFavorite: false },
];

describe("historyFilter", () => {
  it("returns distinct sorted themes", () => {
    expect(getHistoryThemes([...items, { ...items[0], id: 3 }])).toEqual(["月影忍者漫畫", "熱血武道 Q 版"]);
  });

  it("matches keyword across title, prompt, theme, and image URL", () => {
    expect(filterHistoryItems(items, "deep blue", "all", false).map((item) => item.id)).toEqual([2]);
    expect(filterHistoryItems(items, "ninja.png", "all", false).map((item) => item.id)).toEqual([2]);
  });

  it("combines theme and favorites filters", () => {
    expect(filterHistoryItems(items, "", "熱血武道 Q 版", false).map((item) => item.id)).toEqual([1]);
    expect(filterHistoryItems(items, "", "all", true).map((item) => item.id)).toEqual([1]);
    expect(filterHistoryItems(items, "ninja", "熱血武道 Q 版", false)).toEqual([]);
  });
});
