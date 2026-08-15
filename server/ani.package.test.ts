import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { encodeAni } from "../client/src/lib/ani";

const readTag = (bytes: Uint8Array, offset: number) => new TextDecoder().decode(bytes.slice(offset, offset + 4));
const readU32 = (bytes: Uint8Array, offset: number) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);

function chunk(bytes: Uint8Array, wanted: string) {
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const tag = readTag(bytes, offset);
    const size = readU32(bytes, offset + 4);
    if (tag === wanted) return { offset, size, payload: bytes.slice(offset + 8, offset + 8 + size) };
    offset += 8 + size + (size % 2);
  }
  return null;
}

describe("ANI package verification", () => {
  it("keeps seq order 0..4 and valid LIST fram boundaries", () => {
    const bytes = encodeAni(Array.from({ length: 5 }, (_, i) => new Uint8Array([i + 10])), 8);
    const seq = chunk(bytes, "seq ");
    expect(seq).not.toBeNull();
    expect(Array.from({ length: 5 }, (_, i) => readU32(seq!.payload, i * 4))).toEqual([0, 1, 2, 3, 4]);
    const list = chunk(bytes, "LIST");
    expect(list).not.toBeNull();
    expect(readTag(list!.payload, 0)).toBe("fram");
    expect(list!.offset + 8 + list!.size + (list!.size % 2)).toBe(bytes.length);
    expect(new TextDecoder().decode(list!.payload).match(/icon/g)?.length).toBe(5);
  });

  it("packages all three ANI files with exact names", async () => {
    const zip = new JSZip();
    for (let group = 1; group <= 3; group++) zip.file(`-${group}.ani`, encodeAni(Array.from({ length: 5 }, (_, i) => new Uint8Array([group, i])), 8));
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const loaded = await JSZip.loadAsync(bytes);
    expect(Object.keys(loaded.files).sort()).toEqual(["-1.ani", "-2.ani", "-3.ani"]);
  });
});
