import { describe, expect, it } from "vitest";
import { beginBackgroundRemoval, completeBackgroundRemoval, failBackgroundRemoval, restoreBackgroundRemoval, type BackgroundRemovalState } from "./backgroundRemovalFlow";

const standard: BackgroundRemovalState = { source: "standard-original", originalSource: "standard-original", status: "idle" };
const dynamic: BackgroundRemovalState = { source: "dynamic-original", originalSource: "dynamic-original", status: "idle" };

describe("backgroundRemovalFlow", () => {
  it("moves from idle to processing, then stores transparent output and restores the original", () => {
    const processing = beginBackgroundRemoval(standard);
    expect(processing.status).toBe("processing");
    const done = completeBackgroundRemoval(processing, "standard-transparent");
    expect(done).toEqual({ source: "standard-transparent", originalSource: "standard-original", status: "done" });
    expect(restoreBackgroundRemoval(done)).toEqual(standard);
  });

  it("keeps the dynamic source isolated from the standard source when restoring", () => {
    const done = completeBackgroundRemoval(beginBackgroundRemoval(dynamic), "dynamic-transparent");
    expect(restoreBackgroundRemoval(done).source).toBe("dynamic-original");
    expect(restoreBackgroundRemoval(done).source).not.toBe("standard-original");
  });

  it("prevents duplicate processing and exposes failures", () => {
    const processing = beginBackgroundRemoval(standard);
    expect(beginBackgroundRemoval(processing)).toBe(processing);
    expect(failBackgroundRemoval(processing).status).toBe("error");
  });
});
