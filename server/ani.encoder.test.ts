import { describe, expect, it } from "vitest";
import { encodeAni } from "../client/src/lib/ani";

const text = (bytes: Uint8Array, start: number, length: number) => new TextDecoder().decode(bytes.slice(start, start + length));

describe("ANI encoder", () => {
  it("writes RIFF ACON with five ordered icon frames", () => {
    const result = encodeAni(Array.from({ length: 5 }, (_, index) => new Uint8Array([index + 1, 2, 3])), 8);
    const decoded = new TextDecoder().decode(result);
    expect(text(result, 0, 4)).toBe("RIFF");
    expect(new DataView(result.buffer).getUint32(4, true)).toBe(result.length - 8);
    expect(text(result, 8, 4)).toBe("ACON");
    expect(text(result, 12, 4)).toBe("anih");
    expect(new DataView(result.buffer).getUint32(24, true)).toBe(5);
    expect(new DataView(result.buffer).getUint32(28, true)).toBe(5);
    expect(new DataView(result.buffer).getUint32(32, true)).toBe(128);
    expect(new DataView(result.buffer).getUint32(36, true)).toBe(128);
    expect(decoded).toContain("rate");
    expect(decoded).toContain("seq ");
    expect(decoded).toContain("LIST");
    expect(decoded).toContain("fram");
    expect(decoded.match(/icon/g)?.length).toBe(5);
  });
});
