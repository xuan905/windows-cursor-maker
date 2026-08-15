function u32(value: number) { const out = new Uint8Array(4); new DataView(out.buffer).setUint32(0, value >>> 0, true); return out; }
function ascii(text: string) { return new TextEncoder().encode(text); }
function riffChunk(tag: string, payload: Uint8Array) { const pad = payload.length % 2; const out = new Uint8Array(8 + payload.length + pad); out.set(ascii(tag), 0); out.set(u32(payload.length), 4); out.set(payload, 8); return out; }
function joinBytes(...parts: Uint8Array[]) { const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0; for (const part of parts) { out.set(part, offset); offset += part.length; } return out; }

export function encodeAni(frames: Uint8Array[], frameRate: number) {
  const ticks = Math.max(1, Math.round(60 / frameRate));
  const rates = joinBytes(...frames.map(() => u32(ticks)));
  const seq = joinBytes(...frames.map((_, i) => u32(i)));
  const anih = new Uint8Array(36);
  const view = new DataView(anih.buffer);
  view.setUint32(0, 36, true); view.setUint32(4, frames.length, true); view.setUint32(8, frames.length, true);
  view.setUint32(12, 64, true); view.setUint32(16, 64, true); view.setUint32(20, 32, true); view.setUint32(24, 1, true);
  view.setUint32(28, ticks, true); view.setUint32(32, 1, true);
  const fram = joinBytes(...frames.map((frame) => riffChunk("icon", frame)));
  const list = joinBytes(ascii("fram"), fram);
  const body = joinBytes(riffChunk("anih", anih), riffChunk("rate", rates), riffChunk("seq ", seq), joinBytes(ascii("LIST"), u32(list.length), list));
  return joinBytes(ascii("RIFF"), u32(4 + body.length), ascii("ACON"), body);
}
