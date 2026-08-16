import type { BackgroundRemovalStatus } from "./backgroundRemovalFlow";

export type WorkbenchBackgroundState = {
  sheetSource: string;
  sheetOriginalSource: string;
  dynamicSource: string | null;
  dynamicOriginalSource: string | null;
  status: BackgroundRemovalStatus;
};

export function setDynamicOriginalSource(state: WorkbenchBackgroundState, source: string) {
  return { ...state, dynamicSource: source, dynamicOriginalSource: source, status: "idle" as const };
}

export function setSheetOriginalSource(state: WorkbenchBackgroundState, source: string) {
  return { ...state, sheetSource: source, sheetOriginalSource: source, status: "idle" as const };
}

export function applyWorkbenchTransparency(state: WorkbenchBackgroundState, tab: "sheet" | "dynamic", transparentSource: string) {
  return tab === "dynamic"
    ? { ...state, dynamicSource: transparentSource, status: "done" as const }
    : { ...state, sheetSource: transparentSource, status: "done" as const };
}

export function restoreWorkbenchTransparency(state: WorkbenchBackgroundState, tab: "sheet" | "dynamic") {
  return tab === "dynamic"
    ? { ...state, dynamicSource: state.dynamicOriginalSource, status: "idle" as const }
    : { ...state, sheetSource: state.sheetOriginalSource, status: "idle" as const };
}
