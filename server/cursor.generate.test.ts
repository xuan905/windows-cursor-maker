import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("cursor.generateSheet", () => {
  it("rejects malformed reference image payloads before calling the image service", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(
      caller.cursor.generateSheet({ theme: "test", character: "test", prompt: "This is a sufficiently long generation prompt for validation", referenceImage: { url: "not-a-data-url", mimeType: "text/plain" } }),
    ).rejects.toThrow();
  });

  it("rejects incomplete generation payloads before calling the image service", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(
      caller.cursor.generateSheet({ theme: "", character: "", prompt: "too short" }),
    ).rejects.toThrow();
  });
});
