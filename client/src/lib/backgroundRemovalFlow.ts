export type BackgroundRemovalStatus = "idle" | "processing" | "done" | "error";

export type BackgroundRemovalState = {
  source: string | null;
  originalSource: string | null;
  status: BackgroundRemovalStatus;
};

export function beginBackgroundRemoval(state: BackgroundRemovalState) {
  if (!state.source || state.status === "processing") return state;
  return { ...state, status: "processing" as const };
}

export function completeBackgroundRemoval(state: BackgroundRemovalState, transparentSource: string) {
  if (!transparentSource) return { ...state, status: "error" as const };
  return { ...state, source: transparentSource, status: "done" as const };
}

export function failBackgroundRemoval(state: BackgroundRemovalState) {
  return { ...state, status: "error" as const };
}

export function restoreBackgroundRemoval(state: BackgroundRemovalState) {
  return { ...state, source: state.originalSource, status: "idle" as const };
}
