export type BackgroundRemovalOptions = {
  colorTolerance?: number;
  greenThreshold?: number;
  pureGreenTolerance?: number;
  alphaThreshold?: number;
};

function isNearNeutral(r: number, g: number, b: number, tolerance: number) {
  return Math.max(r, g, b) - Math.min(r, g, b) <= tolerance;
}

function isBackgroundCandidate(r: number, g: number, b: number, a: number, options: Required<BackgroundRemovalOptions>) {
  if (a <= options.alphaThreshold) return true;
  const brightness = (r + g + b) / 3;
  const lightNeutral = isNearNeutral(r, g, b, options.colorTolerance) && brightness >= 190;
  const pureGreen = Math.abs(r - 0) <= options.pureGreenTolerance && Math.abs(g - 255) <= options.pureGreenTolerance && Math.abs(b - 0) <= options.pureGreenTolerance;
  const greenScreenFallback = g >= options.greenThreshold && g > r * 1.08 && g > b * 1.04;
  return lightNeutral || pureGreen || greenScreenFallback;
}

export function removeConnectedBackground(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  options: BackgroundRemovalOptions = {},
) {
  if (source.length !== width * height * 4) throw new Error("圖片像素資料尺寸不一致");
  if (width <= 0 || height <= 0) throw new Error("圖片尺寸必須大於 0");
  const config = { colorTolerance: 18, greenThreshold: 90, pureGreenTolerance: 0, alphaThreshold: 10, ...options };
  const output = new Uint8ClampedArray(source);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const enqueue = (index: number) => {
    if (visited[index]) return;
    const p = index * 4;
    if (!isBackgroundCandidate(output[p], output[p + 1], output[p + 2], output[p + 3], config)) return;
    visited[index] = 1;
    queue.push(index);
  };
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    output[index * 4 + 3] = 0;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }
  return output;
}
