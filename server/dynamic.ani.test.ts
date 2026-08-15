import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { encodeAni } from "@/lib/ani";

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return new TextDecoder().decode(bytes.slice(offset, offset + length));
}

function readU32(bytes: Uint8Array, offset: number) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

describe("dynamic segmented ANI export", () => {
  it("encodes exactly three ordered 64x64 cursor frames", () => {
    const frames = [1, 2, 3].map((value) => Uint8Array.from([value, value + 10]));
    const ani = encodeAni(frames, 8);

    expect(readAscii(ani, 0, 4)).toBe("RIFF");
    expect(readAscii(ani, 8, 4)).toBe("ACON");

    const anihOffset = 12;
    expect(readAscii(ani, anihOffset, 4)).toBe("anih");
    expect(readU32(ani, anihOffset + 8 + 4)).toBe(3);
    expect(readU32(ani, anihOffset + 8 + 8)).toBe(3);
    expect(readU32(ani, anihOffset + 8 + 12)).toBe(64);
    expect(readU32(ani, anihOffset + 8 + 16)).toBe(64);

    const payloads: number[] = [];
    for (let offset = 12; offset + 8 <= ani.length; offset += 1) {
      if (readAscii(ani, offset, 4) !== "icon") continue;
      const size = readU32(ani, offset + 4);
      payloads.push(ani[offset + 8]);
      offset += 7 + size;
    }
    expect(payloads).toEqual([1, 2, 3]);
    expect(readU32(ani, 4) + 8).toBe(ani.length);
  });

  it("places the selected segment ANI under the expected English filename", async () => {
    const ani = encodeAni(
      [Uint8Array.from([11]), Uint8Array.from([22]), Uint8Array.from([33])],
      8,
    );
    const zip = new JSZip();
    zip.file("dynamic-4-6.ani", ani);
    const archive = await zip.generateAsync({ type: "uint8array" });
    const loaded = await JSZip.loadAsync(archive);

    expect(Object.keys(loaded.files)).toEqual(["dynamic-4-6.ani"]);
    expect(await loaded.file("dynamic-4-6.ani")?.async("uint8array")).toEqual(ani);
  });
});
