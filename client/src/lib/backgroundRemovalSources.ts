export type WorkbenchTab = "sheet" | "dynamic";

export type WorkbenchSources = {
  sheetSource: string;
  sheetOriginalSource: string;
  dynamicSource: string | null;
  dynamicOriginalSource: string | null;
};

export function applyTransparentSource(tab: WorkbenchTab, sources: WorkbenchSources, transparentSource: string): WorkbenchSources {
  return tab === "dynamic"
    ? { ...sources, dynamicSource: transparentSource }
    : { ...sources, sheetSource: transparentSource };
}

export function restoreWorkbenchSource(tab: WorkbenchTab, sources: WorkbenchSources): WorkbenchSources {
  return tab === "dynamic"
    ? { ...sources, dynamicSource: sources.dynamicOriginalSource }
    : { ...sources, sheetSource: sources.sheetOriginalSource };
}
