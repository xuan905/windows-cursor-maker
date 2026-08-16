import { GREEN_SCREEN_INSTRUCTION_EN, buildChromaKeyInstructionEn, buildChromaKeyInstructionZh } from "./chromaKeyPrompt";
import { DEFAULT_CHROMA_KEY_COLOR, type ChromaKeyColor } from "./chromaKeyColors";

export const DEFAULT_STANDARD_PROMPT_EN = `Create a clean 5×3 PNG sprite sheet for Windows cursor production. Each of the 15 cells must be exactly equal and designed for final 128×128 output. Keep every character fully inside a visible 12% safe margin on all four sides; no hair, hand, prop, glow, shadow, cursor symbol, or outline may touch or cross a cell boundary. Use one consistent chibi hero with a compact silhouette, but change the pose and expression for each cursor function. Place the exact Windows work-item symbol in the upper-left safe corner, separated from the character. Use a solid white interior/fill with crisp black outline/linework for every symbol; no colored fill, gray halo, or black-filled arrow. ${GREEN_SCREEN_INSTRUCTION_EN} No horizontal lines, speed lines, cell dividers, checkerboard, watermark, cropped body parts, or overlapping neighboring cells. Row order: 1–5 standard select, text select, busy, background busy, precision select; 6–10 handwriting, unavailable, vertical resize, horizontal resize, diagonal resize; 11–15 move, alternate select, handwriting candidate, link select, location select.`;

export const DEFAULT_STANDARD_PROMPT_ZH = `建立一個乾淨的 5×3 PNG 精靈圖，用於製作 Windows 遊標。15 個單元格必須完全相等，並設計為最終 128×128 輸出格式。每個角色都必須完全位於四邊 12% 的可見安全邊距內；頭髮、手、道具、發光、陰影、遊標符號或輪廓都不得觸及或跨越單元格邊界。使用一個輪廓緊湊的 Q 版角色，但根據每個遊標功能更改姿勢和表情。將精確的 Windows 工作項目符號放置在左上角的安全區域，並與角色分開。每個符號都使用純白色填充，並帶有清晰的黑色輪廓線；不得使用彩色填充、灰色光暈或黑色填充的箭頭。生成請使用純綠色（#00FF00）作為暫時去背背景，讓角色邊緣能被精準辨識。不得有水平線、速度線、單元格分隔線、棋盤格、浮水印、裁剪的身體部位或重疊的相鄰單元格。行順序：1–5 行為標準選擇、文字選擇、忙碌、背景忙碌、精確選擇；6–10 行為手寫、不可用、垂直調整大小、水平調整大小、對角線調整大小；11–15 行為移動、交替選擇、手寫候選、連結選擇、位置選擇。`;

export function buildStandardPrompt(characterDirection: string, color: ChromaKeyColor = DEFAULT_CHROMA_KEY_COLOR) {
  const englishPrompt = DEFAULT_STANDARD_PROMPT_EN.replace(GREEN_SCREEN_INSTRUCTION_EN, buildChromaKeyInstructionEn(color));
  const chinesePrompt = color.id === DEFAULT_CHROMA_KEY_COLOR.id
    ? DEFAULT_STANDARD_PROMPT_ZH
    : DEFAULT_STANDARD_PROMPT_ZH.replace(/生成請使用純綠色（#00FF00）作為暫時去背背景，讓角色邊緣能被精準辨識。/, buildChromaKeyInstructionZh(color));
  return `${englishPrompt}\n\n中文規格：\n${chinesePrompt}\n\nCharacter direction: ${characterDirection}.`;
}


export const DEFAULT_STANDARD_V2_PROMPT_EN = `Create a perfect 5×3 Windows mouse cursor PNG sprite sheet with a 16:10 presentation ratio. It contains 15 exactly equal rectangular cells, each designed for final 128×128 pixel output; the normalized sheet is 640×384 pixels. Use one consistent chibi Genos-inspired cyborg hero: spiky golden hair, black mechanical eyes with glowing yellow pupils, and dark black-and-yellow metallic armor. Keep every element, including hair, hands, props, effects, and the thick white sticker-style outline, fully inside a visible 12% safe margin on all four sides; nothing may touch or cross a cell boundary. Place the exact Windows cursor work-item symbol in the upper-left safe area of every cell, separate from the character, with solid white fill and crisp black outline; never use colored fill, gray halo, or black-filled arrows. ${GREEN_SCREEN_INSTRUCTION_EN} No texture, noise, horizontal lines, speed lines, cell dividers, grid lines, checkerboard, watermark, cropped body parts, or neighboring-cell overlap.

Exact 5×3 action order: 1 standard select, arms crossed and calmly standing; 2 text select, glowing eyes while reading an open technology tablet; 3 busy, charging stance with both palms firing a hot flame cannon; 4 background busy, holding the head while inspecting a holographic computing terminal on the arm; 5 precision select, aiming a tiny red laser from the fingertip; 6 handwriting, recording on a technology clipboard with a glowing digital pen; 7 unavailable, crossed mechanical arms forming an X with an impatient expression; 8 vertical resize, palms pushing strongly upward and downward; 9 horizontal resize, arms stretched left and right; 10 diagonal resize, holding a glowing energy shield diagonally; 11 move, hovering upward with tiny chibi flame rockets from the mechanical boots; 12 alternate select, smiling and waving with one mechanical arm; 13 handwriting candidate, rapidly typing on a floating virtual keyboard; 14 link select, confidently pointing diagonally upward; 15 location select, scanning a glowing 3D holographic map held in both hands.`;

export const DEFAULT_STANDARD_V2_PROMPT_ZH = `建立一個完美的 5×3 網格 Windows 滑鼠遊標 PNG 精靈圖範本，畫面比例 16:10。包含 15 個完全等寬等高的矩形單元格，專為最終 128×128 像素輸出格式設計；標準化整張大圖為 640×384 像素。主角為一拳超人 Q 版傑諾斯（魔鬼生化人），外觀為金色刺蝟頭、黑底黃色發光瞳孔的機械眼，身穿黑色深色金屬機甲裝甲。所有元素（包含頭髮、手、道具、特效與粗白色貼紙風外框）必須完全位於四邊 12% 的可見安全邊距內，絕對不得觸及或跨越單元格邊界。角色根據每個遊標功能改變姿勢和表情。每個單元格的左上角安全區域放置一個精確的 Windows 滑鼠遊標符號，符號為純白色填充並帶有清晰的黑色輪廓線，完全與角色分離；不得使用彩色填充、灰色光暈或黑底箭頭。生成請使用純綠色（#00FF00）作為暫時去背背景，讓角色邊緣能被精準辨識。背景統一為純綠色，零紋理、零雜點；不得有水平線、速度線、網格分界線、棋盤格、浮水印、裁剪的身體部位或重疊的相鄰單元格。

15 個精確動作依 5×3 行列順序如下：1 標準選擇：雙臂交叉，冷靜地端正站立；2 文字選擇：雙眼發光，專注閱讀手中打開的科技平板；3 忙碌：擺出戰鬥蓄力姿勢，雙掌向前猛烈發射熾熱的火焰焚燒炮；4 背景忙碌：一邊抓著頭，一邊歪頭查看手臂上跳出的全息微型運算終端螢幕；5 精確選擇：眼神犀利，從指尖端向前瞄準射出一道細小的紅色雷射光線；6 手寫：拿著一枝發光的數位筆，在手持的科技剪貼簿上記錄；7 不可用：機械手臂在胸前交叉擺成 X 字形，帶著不耐煩的嫌棄表情；8 垂直調整大小：雙手手掌分別向上和向下奮力推開；9 水平調整大小：雙手往身體左右兩側伸展張開；10 對角線調整大小：雙手斜斜地撐起一面發光的能量護盾；11 移動：腳底機械靴噴出 Q 版迷你火焰火箭推力，整個人向上飛浮；12 交替選擇：高興地舉起一隻機械手臂，面帶微笑打招呼；13 手寫候選：雙手快速在空中敲擊一片浮空的虛擬鍵盤；14 連結選擇：自信微笑，右手食指高高指向斜上方；15 位置選擇：雙手捧著一個發光的 3D 立體全息地圖投影進行掃描。`;

export function buildStandardV2Prompt(color: ChromaKeyColor = DEFAULT_CHROMA_KEY_COLOR) {
  const englishPrompt = DEFAULT_STANDARD_V2_PROMPT_EN.replace(GREEN_SCREEN_INSTRUCTION_EN, buildChromaKeyInstructionEn(color));
  const chinesePrompt = color.id === DEFAULT_CHROMA_KEY_COLOR.id
    ? DEFAULT_STANDARD_V2_PROMPT_ZH
    : DEFAULT_STANDARD_V2_PROMPT_ZH.replace(/生成請使用純綠色（#00FF00）作為暫時去背背景，讓角色邊緣能被精準辨識。/, buildChromaKeyInstructionZh(color));
  return `${englishPrompt}\n\n中文規格：\n${chinesePrompt}`;
}
