export function getDynamicFrameIndices(group: number): number[] {
  const normalizedGroup = Math.min(3, Math.max(1, Math.trunc(group)));
  const rowStart = (normalizedGroup - 1) * 5;
  return Array.from({ length: 5 }, (_, frame) => rowStart + frame);
}

export function getDynamicFrameSourceRect(group: number, frame: number, cellWidth: number, cellHeight: number) {
  const safeFrame = Math.min(4, Math.max(0, Math.trunc(frame)));
  const safeGroup = Math.min(3, Math.max(1, Math.trunc(group)));
  return {
    sx: safeFrame * cellWidth,
    sy: (safeGroup - 1) * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };
}
