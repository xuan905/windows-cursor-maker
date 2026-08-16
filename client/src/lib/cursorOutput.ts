export const CURSOR_OUTPUT_SIZE = 128;
export const CURSOR_SHEET_COLUMNS = 5;
export const CURSOR_SHEET_ROWS = 3;
export const CURSOR_SHEET_WIDTH = CURSOR_SHEET_COLUMNS * CURSOR_OUTPUT_SIZE;
export const CURSOR_SHEET_HEIGHT = CURSOR_SHEET_ROWS * CURSOR_OUTPUT_SIZE;

export function isCursorOutputSize(width: number, height: number) {
  return width === CURSOR_OUTPUT_SIZE && height === CURSOR_OUTPUT_SIZE;
}
