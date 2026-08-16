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

  it("rejects non-HTTPS reference image URLs before fetching them", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(caller.cursor.uploadReferenceUrl({ imageUrl: "http://example.com/reference.png" })).rejects.toThrow("HTTPS");
  });

  it("rejects non-image HTTPS reference URLs before storing them", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(caller.cursor.uploadReferenceUrl({ imageUrl: "https://example.com/reference.txt" })).rejects.toThrow();
  });

  it.each(["https://localhost/reference.png", "https://127.0.0.1/reference.png", "https://169.254.169.254/latest/meta-data/"])("rejects private or metadata reference host %s", async (imageUrl) => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    await expect(caller.cursor.uploadReferenceUrl({ imageUrl })).rejects.toThrow("公開");
  });
});
