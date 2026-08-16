export type CropWorkbenchTune = { x: number; y: number; scale: number };

export type CropWorkbenchState = {
  workspaceTab: "sheet";
  imageSrc: string;
  isReady: true;
  active: 0;
  tunes: CropWorkbenchTune[];
  hotspotX: 0;
  hotspotY: 0;
  curPreview: null;
};

export function createCropWorkbenchState(imageSrc: string, defaultTune: CropWorkbenchTune): CropWorkbenchState {
  return {
    workspaceTab: "sheet",
    imageSrc,
    isReady: true,
    active: 0,
    tunes: Array.from({ length: 15 }, () => ({ ...defaultTune })),
    hotspotX: 0,
    hotspotY: 0,
    curPreview: null,
  };
}
