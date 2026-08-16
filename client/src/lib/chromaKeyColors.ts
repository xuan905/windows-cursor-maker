export type ChromaKeyColorId = "green" | "red" | "yellow" | "blue";

export type ChromaKeyColor = {
  id: ChromaKeyColorId;
  label: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
};

export const CHROMA_KEY_COLORS: readonly ChromaKeyColor[] = [
  { id: "green", label: "綠色", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  { id: "red", label: "紅色", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  { id: "yellow", label: "黃色", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  { id: "blue", label: "藍色", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
] as const;

export const DEFAULT_CHROMA_KEY_COLOR = CHROMA_KEY_COLORS[0];

export function getChromaKeyColor(id: ChromaKeyColorId) {
  return CHROMA_KEY_COLORS.find((color) => color.id === id) ?? DEFAULT_CHROMA_KEY_COLOR;
}
