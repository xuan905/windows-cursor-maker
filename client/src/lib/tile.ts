export function fitTileTransform(cellSize: number, scale: number, offsetX: number, offsetY: number) {
  const drawSize = cellSize * scale;
  const minPos = drawSize >= cellSize ? cellSize - drawSize : 0;
  const maxPos = drawSize >= cellSize ? 0 : cellSize - drawSize;
  return {
    x: Math.min(maxPos, Math.max(minPos, (cellSize - drawSize) / 2 + offsetX)),
    y: Math.min(maxPos, Math.max(minPos, (cellSize - drawSize) / 2 + offsetY)),
    drawSize,
  };
}
