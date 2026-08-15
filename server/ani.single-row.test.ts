import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { encodeAni } from "../client/src/lib/ani";

function readU32(view: DataView, offset: number) { return view.getUint32(offset, true); }

describe("single-row -1 ANI export", () => {
  it("creates one ZIP entry with five ordered frames", async () => {
    const frames = Array.from({ length: 5 }, (_, index) => new Uint8Array([0x43, 0x55, 0x52, index]));
    const ani = encodeAni(frames, 8);
    expect(new TextDecoder().decode(ani.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(ani.slice(8, 12))).toBe("ACON");
    expect(readU32(new DataView(ani.buffer), 24)).toBe(5);
    const zip = new JSZip();
    zip.file("-1.ani", ani);
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const reopened = await JSZip.loadAsync(bytes);
    expect(Object.keys(reopened.files)).toEqual(["-1.ani"]);
    const restored = await reopened.file("-1.ani")!.async("uint8array");
    expect(Array.from(restored)).toEqual(Array.from(ani));
    const text = new TextDecoder().decode(restored);
    expect(text.includes("seq ")).toBe(true);
    expect(text.includes("fram")).toBe(true);
    expect(text.match(/icon/g)?.length).toBe(5);
    for (let index = 0; index < 5; index++) expect(restored.includes(index)).toBe(true);
  });
});
