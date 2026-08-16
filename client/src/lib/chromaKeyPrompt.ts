import { DEFAULT_CHROMA_KEY_COLOR, type ChromaKeyColor } from "./chromaKeyColors";

export function buildChromaKeyInstructionEn(color: ChromaKeyColor = DEFAULT_CHROMA_KEY_COLOR) {
  const englishName = { green: "green", red: "red", yellow: "yellow", blue: "blue" }[color.id];
  const englishDescriptor = color.id === "green" ? "pure green" : englishName;
  return `Use a solid ${englishDescriptor} chroma-key background (${color.hex}) during generation so the subject edges can be isolated cleanly. After generation, automatically remove only the edge-connected ${color.id === "green" ? "pure green" : color.hex} background and output true transparent RGBA. Do not leave any ${englishName} screen, spill, halo, fringe, or contamination in the final asset; preserve enclosed ${englishName} character details.`;
}

export function buildChromaKeyInstructionZh(color: ChromaKeyColor = DEFAULT_CHROMA_KEY_COLOR) {
  const chineseName = color.label.replace(/色$/, "");
  return `生成階段請使用純${chineseName}色（${color.hex}）作為暫時去背背景，讓角色邊緣能被精準辨識。生成完成後，必須自動移除與畫布邊緣連通的${color.hex}背景，輸出真正透明的 RGBA。最終素材不得殘留${chineseName}幕、${chineseName}色溢色、${chineseName}色光暈、${chineseName}邊或${chineseName}色污染；角色內部被包圍的${chineseName}色細節必須保留。`;
}

export const GREEN_SCREEN_INSTRUCTION_EN = buildChromaKeyInstructionEn();
export const GREEN_SCREEN_INSTRUCTION_ZH = buildChromaKeyInstructionZh();
