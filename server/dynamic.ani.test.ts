import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { getDynamicFrameIndices, getDynamicFrameSourceRect } from "../client/src/lib/dynamicSheet";
import { encodeAni } from "@/lib/ani";

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return new TextDecoder().decode(bytes.slice(offset, offset + length));
}

function readU32(bytes: Uint8Array, offset: number) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

describe("5x3 dynamic sheet row selection", () => {
  it("maps groups 1, 2, and 3 to the first, second, and third five-frame rows", () => {
    expect(getDynamicFrameIndices(1)).toEqual([0, 1, 2, 3, 4]);
    expect(getDynamicFrameIndices(2)).toEqual([5, 6, 7, 8, 9]);
    expect(getDynamicFrameIndices(3)).toEqual([10, 11, 12, 13, 14]);
  });

  it("extracts recognizable row/frame pixels in 1→5 order", () => {
    const sheet = Array.from({ length: 3 }, (_, row) => Array.from({ length: 5 }, (_, frame) => row * 10 + frame + 1));
    for (const group of [1, 2, 3]) {
      const pixels = getDynamicFrameIndices(group).map((sourceIndex) => sheet[Math.floor(sourceIndex / 5)][sourceIndex % 5]);
      expect(pixels).toEqual([(group - 1) * 10 + 1, (group - 1) * 10 + 2, (group - 1) * 10 + 3, (group - 1) * 10 + 4, (group - 1) * 10 + 5]);
    }
  });

  it("returns the actual source rectangle for each row and frame", () => {
    expect(getDynamicFrameSourceRect(1, 0, 64, 64)).toEqual({ sx: 0, sy: 0, sw: 64, sh: 64 });
    expect(getDynamicFrameSourceRect(1, 4, 64, 64)).toEqual({ sx: 256, sy: 0, sw: 64, sh: 64 });
    expect(getDynamicFrameSourceRect(2, 0, 64, 64)).toEqual({ sx: 0, sy: 64, sw: 64, sh: 64 });
    expect(getDynamicFrameSourceRect(2, 4, 64, 64)).toEqual({ sx: 256, sy: 64, sw: 64, sh: 64 });
    expect(getDynamicFrameSourceRect(3, 0, 64, 64)).toEqual({ sx: 0, sy: 128, sw: 64, sh: 64 });
    expect(getDynamicFrameSourceRect(3, 4, 64, 64)).toEqual({ sx: 256, sy: 128, sw: 64, sh: 64 });
  });
});

describe("dynamic segmented ANI export", () => {
  it("encodes exactly five ordered 64x64 cursor frames", () => {
    const frames = [1, 2, 3, 4, 5].map((value) => Uint8Array.from([value, value + 10]));
    const ani = encodeAni(frames, 8);

    expect(readAscii(ani, 0, 4)).toBe("RIFF");
    expect(readAscii(ani, 8, 4)).toBe("ACON");

    const anihOffset = 12;
    expect(readAscii(ani, anihOffset, 4)).toBe("anih");
    expect(readU32(ani, anihOffset + 8 + 4)).toBe(5);
    expect(readU32(ani, anihOffset + 8 + 8)).toBe(5);
    expect(readU32(ani, anihOffset + 8 + 12)).toBe(64);
    expect(readU32(ani, anihOffset + 8 + 16)).toBe(64);

    const payloads: number[] = [];
    for (let offset = 12; offset + 8 <= ani.length; offset += 1) {
      if (readAscii(ani, offset, 4) !== "icon") continue;
      const size = readU32(ani, offset + 4);
      payloads.push(ani[offset + 8]);
      offset += 7 + size;
    }
    expect(payloads).toEqual([1, 2, 3, 4, 5]);
    expect(readU32(ani, 4) + 8).toBe(ani.length);
  });

  it("places the selected cursor-group ANI under the expected English filename", async () => {
    const ani = encodeAni(
      [Uint8Array.from([11]), Uint8Array.from([22]), Uint8Array.from([33]), Uint8Array.from([44]), Uint8Array.from([55])],
      8,
    );
    const zip = new JSZip();
    zip.file("-2.ani", ani);
    const archive = await zip.generateAsync({ type: "uint8array" });
    const loaded = await JSZip.loadAsync(archive);

    expect(Object.keys(loaded.files)).toEqual(["-2.ani"]);
    expect(await loaded.file("-2.ani")?.async("uint8array")).toEqual(ani);
  });
});
