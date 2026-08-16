import type { WorkbenchTab } from "./backgroundRemovalSources";
import type { WorkbenchBackgroundState } from "./backgroundRemovalWorkbench";
import { applyWorkbenchTransparency, restoreWorkbenchTransparency, setDynamicOriginalSource, setSheetOriginalSource } from "./backgroundRemovalWorkbench";

type Setters = {
  setSheetSource: (value: string) => void;
  setSheetOriginalSource: (value: string) => void;
  setDynamicSource: (value: string | null) => void;
  setDynamicOriginalSource: (value: string | null) => void;
};

export function setHomeSourceFromDynamicGeneration(state: WorkbenchBackgroundState, source: string, setters: Setters) {
  const next = setDynamicOriginalSource(state, source);
  setters.setDynamicSource(next.dynamicSource);
  setters.setDynamicOriginalSource(next.dynamicOriginalSource);
  return next;
}

export function setHomeUploadedSheet(state: WorkbenchBackgroundState, source: string, setters: Setters) {
  const next = setSheetOriginalSource(state, source);
  setters.setSheetSource(next.sheetSource);
  setters.setSheetOriginalSource(next.sheetOriginalSource);
  return next;
}

export function applyHomeTransparency(tab: WorkbenchTab, state: WorkbenchBackgroundState, transparentSource: string, setters: Setters) {
  const next = applyWorkbenchTransparency(state, tab, transparentSource);
  if (tab === "dynamic") setters.setDynamicSource(next.dynamicSource);
  else setters.setSheetSource(next.sheetSource);
  return next;
}

export function restoreHomeTransparency(tab: WorkbenchTab, state: WorkbenchBackgroundState, setters: Setters) {
  const next = restoreWorkbenchTransparency(state, tab);
  if (tab === "dynamic") setters.setDynamicSource(next.dynamicSource);
  else setters.setSheetSource(next.sheetSource);
  return next;
}
