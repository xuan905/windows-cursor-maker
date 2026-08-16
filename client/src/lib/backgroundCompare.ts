export type BackgroundCompareState = {
  open: boolean;
  split: number;
};

export const DEFAULT_BACKGROUND_SPLIT = 50;

export function clampBackgroundSplit(value: number) {
  return Math.min(90, Math.max(10, Math.round(value)));
}

export function openBackgroundCompare(): BackgroundCompareState {
  return { open: true, split: DEFAULT_BACKGROUND_SPLIT };
}

export function closeBackgroundCompare(state: BackgroundCompareState): BackgroundCompareState {
  return { ...state, open: false };
}

export function setBackgroundCompareSplit(state: BackgroundCompareState, value: number): BackgroundCompareState {
  return { ...state, open: true, split: clampBackgroundSplit(value) };
}
