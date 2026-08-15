import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("cursor.generateSheet", () => {
  it("rejects incomplete generation payloads before calling the image service", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(
      caller.cursor.generateSheet({ theme: "", character: "", prompt: "too short" }),
    ).rejects.toThrow();
  });
});
