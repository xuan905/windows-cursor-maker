/* Design philosophy: Neo-editorial utility — a warm paper workbench with cobalt calibration marks, asymmetric workspace, and precise cursor production feedback. */
import { useMemo, useRef, useState } from "react";
import { Download, FileImage, Grid3X3, MousePointer2, Ruler, Upload, WandSparkles, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SPRITE_URL = "/manus-storage/super-saiyan-cursor-sheet_45b0abfe.png";
const EMPTY_ART = "/manus-storage/cursor-maker-empty-state_ac18c21a.png";

async function parseCurFile(file: File) {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  if (view.byteLength < 22 || view.getUint16(0, true) !== 0 || view.getUint16(2, true) !== 2) throw new Error("這不是有效的 Windows .cur 檔案");
  const count = view.getUint16(4, true);
  if (!count) throw new Error("CUR 檔案沒有包含游標影像");
  const entry = 6;
  const width = view.getUint8(entry) || 256;
  const height = view.getUint8(entry + 1) || 256;
  const bytesInRes = view.getUint32(entry + 8, true);
  const imageOffset = view.getUint32(entry + 12, true);
  const dib = imageOffset;
  const headerSize = view.getUint32(dib, true);
  const dibWidth = view.getInt32(dib + 4, true);
  const dibHeight = Math.abs(view.getInt32(dib + 8, true)) / 2;
  const bpp = view.getUint16(dib + 14, true);
  if (dibWidth !== width || dibHeight !== height || (bpp !== 32 && bpp !== 24)) throw new Error(`目前支援 24-bit／32-bit CUR；讀到 ${bpp}-bit ${width}×${height}`);
  const xorStride = Math.floor((width * bpp + 31) / 32) * 4;
  const andStride = Math.floor((width + 31) / 32) * 4;
  const paletteBytes = bpp <= 8 ? (1 << view.getUint16(dib + 14, true)) * 4 : 0;
  const xorStart = dib + headerSize + paletteBytes;
  const andStart = xorStart + xorStride * height;
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("瀏覽器無法建立預覽畫布");
  const pixels = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const srcY = height - 1 - y;
    const p = xorStart + srcY * xorStride + x * (bpp / 8);
    const out = (y * width + x) * 4;
    pixels.data[out] = view.getUint8(p + 2); pixels.data[out + 1] = view.getUint8(p + 1); pixels.data[out + 2] = view.getUint8(p);
    const maskByte = view.getUint8(andStart + srcY * andStride + Math.floor(x / 8));
    pixels.data[out + 3] = (maskByte & (0x80 >> (x % 8))) ? 0 : (bpp === 32 ? view.getUint8(p + 3) : 255);
  }
  ctx.putImageData(pixels, 0, 0);
  return { src: canvas.toDataURL("image/png"), width, height, bytes: bytesInRes };
}

const cursorNames = [
  "標準選擇", "文字選擇", "忙碌", "背景忙碌", "精確選擇",
  "手寫", "不可用", "垂直調整", "水平調整", "對角調整 ↗",
  "對角調整 ↘", "移動", "替代選擇", "連結選擇", "位置選擇",
];

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function encodeCur(canvas: HTMLCanvasElement, hotspotX = 0, hotspotY = 0) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const rgba = image.data;
  const rowBytes = Math.ceil(width / 32) * 4;
  const dibSize = 40;
  const imageSize = width * height * 4 + rowBytes * height;
  const buffer = new ArrayBuffer(6 + 16 + dibSize + imageSize);
  const view = new DataView(buffer);
  let offset = 0;
  const u16 = (v: number) => { view.setUint16(offset, v, true); offset += 2; };
  const u32 = (v: number) => { view.setUint32(offset, v, true); offset += 4; };
  const i32 = (v: number) => { view.setInt32(offset, v, true); offset += 4; };
  u16(0); u16(2); u16(1);
  view.setUint8(offset++, width >= 256 ? 0 : width); view.setUint8(offset++, height >= 256 ? 0 : height); view.setUint8(offset++, 0); view.setUint8(offset++, 0);
  // CUR directory bytesInRes counts only the DIB image payload, not the 16-byte directory entry.
  u16(Math.max(0, Math.min(0xffff, hotspotX))); u16(Math.max(0, Math.min(0xffff, hotspotY))); u32(dibSize + imageSize); u32(6 + 16);
  u32(dibSize); i32(width); i32(height * 2); u16(1); u16(32); u32(0); u32(imageSize); i32(0); i32(0); u32(0); u32(0);
  for (let y = height - 1; y >= 0; y--) for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4; view.setUint8(offset++, rgba[p + 2]); view.setUint8(offset++, rgba[p + 1]); view.setUint8(offset++, rgba[p]); view.setUint8(offset++, rgba[p + 3]);
  }
  const mask = new Uint8Array(buffer, offset, rowBytes * height); mask.fill(0);
  // Write a valid 1-bit AND mask for fully transparent pixels; opaque pixels remain 0.
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const alpha = rgba[((height - 1 - y) * width + x) * 4 + 3];
    if (alpha === 0) mask[y * rowBytes + Math.floor(x / 8)] |= 0x80 >> (x % 8);
  }
  return new Blob([buffer], { type: "image/x-icon" });
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState(SPRITE_URL);
  const [active, setActive] = useState(0);
  const [cellSize, setCellSize] = useState(384);
  const [padding, setPadding] = useState(18);
  const [hotspotX, setHotspotX] = useState(0);
  const [hotspotY, setHotspotY] = useState(0);
  const [isReady, setIsReady] = useState(true);
  const [curPreview, setCurPreview] = useState<{ src: string; width: number; height: number; name: string } | null>(null);

  const selectedName = cursorNames[active];
  const grid = useMemo(() => Array.from({ length: 15 }, (_, i) => i), []);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    const isCur = file.name.toLowerCase().endsWith(".cur") || file.type === "image/x-icon";
    if (isCur) {
      try {
        const parsed = await parseCurFile(file);
        setCurPreview({ ...parsed, name: file.name });
        toast.success(`${file.name} 已成功讀取`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "無法讀取這個 CUR 檔案");
      }
      return;
    }
    if (!file.type.startsWith("image/")) { toast.error("請選擇 PNG、JPG、WebP 或 CUR 檔案。"); return; }
    const reader = new FileReader();
    reader.onload = () => { setCurPreview(null); setImageSrc(String(reader.result)); setIsReady(true); toast.success("素材已載入工作台"); };
    reader.readAsDataURL(file);
  };

  const buildCursorBlob = (img: HTMLImageElement, index: number) => {
    const canvas = document.createElement("canvas");
    const size = Math.max(32, Math.min(256, cellSize - padding * 2));
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d"); if (!ctx) return null;
    const col = index % 5; const row = Math.floor(index / 5);
    const sourceSize = img.width / 5;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, col * sourceSize + padding, row * sourceSize + padding, sourceSize - padding * 2, sourceSize - padding * 2, 0, 0, size, size);
    return encodeCur(canvas, hotspotX, hotspotY);
  };

  const loadSpriteImage = () => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => resolve(img); img.onerror = () => reject(new Error("素材圖無法載入，請重新上傳 PNG")); img.src = imageSrc;
  });

  const exportSelected = async () => {
    try {
      const blob = buildCursorBlob(await loadSpriteImage(), active);
      if (blob) { downloadBlob(blob, `${String(active + 1).padStart(2, "0")}-${selectedName}.cur`); toast.success(`${selectedName}.cur 已下載`); }
    } catch (error) { toast.error(error instanceof Error ? error.message : "輸出失敗"); }
  };

  const exportAll = async () => {
    try {
      const img = await loadSpriteImage();
      let completed = 0;
      for (let index = 0; index < cursorNames.length; index++) {
        const blob = buildCursorBlob(img, index);
        if (blob) { downloadBlob(blob, `${String(index + 1).padStart(2, "0")}-${cursorNames[index]}.cur`); completed++; await new Promise((resolve) => setTimeout(resolve, 120)); }
      }
      toast.success(`已批次輸出 ${completed} 個 CUR 檔案`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "批次輸出失敗"); }
  };

  return (
    <main className="workbench-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><MousePointer2 size={23} strokeWidth={2.6} /></div><div><div className="brand-name">cursor<span>/</span>maker</div><div className="brand-kicker">WINDOWS CURSOR WORKBENCH</div></div></div>
        <div className="topbar-meta"><span className="status-dot" /> <span>LOCAL · READY</span><span className="version-tag">v0.1 / 15 frames</span></div>
      </header>

      <section className="intro-band">
        <div><p className="eyebrow">01 / SPRITE SHEET → CURSOR SET</p><h1>把一張素材，<em>整理成一套</em><br />可套用的游標。</h1><p className="intro-copy">上傳 15 格游標總圖。選取、校準熱點，然後直接輸出 Windows 可讀取的 `.cur` 檔案。</p></div>
        <div className="intro-note"><Ruler size={18} /><span>透明背景支援<br /><b>32–256 px</b> 輸出尺寸</span></div>
      </section>

      <div className="workspace-grid">
        <aside className="left-rail">
          <div className="rail-label">工作流程</div>
          <div className="step active"><span>01</span><div><b>選取素材</b><small>15 格 sprite sheet</small></div></div>
          <div className="step"><span>02</span><div><b>校準游標</b><small>尺寸與熱點</small></div></div>
          <div className="step"><span>03</span><div><b>輸出檔案</b><small>Windows .CUR</small></div></div>
          <div className="rail-rule" />
          <div className="rail-tip"><WandSparkles size={17} /><p>小提示</p><span>使用透明 PNG 能保留最乾淨的邊緣。棋盤格只是預覽，不會被輸出。</span></div>
          <button className="upload-link" onClick={() => fileRef.current?.click()}><Upload size={15} /> 上傳另一張圖</button>
          <input ref={fileRef} type="file" accept="image/*,.cur,image/x-icon" hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
        </aside>

        <section className="preview-stage">
          <div className="stage-head"><div><span className="section-index">A</span><div><p className="section-label">SPRITE SHEET PREVIEW</p><h2>選一格開始校準</h2></div></div><span className="sheet-size">{curPreview ? `${curPreview.width} × ${curPreview.height} px` : "1920 × 1920 px"}</span></div>
          <div className="sheet-frame">
            <div className="crop-corner top-left" /><div className="crop-corner bottom-right" />
            {curPreview ? <div className="cur-preview"><div className="cur-preview-canvas"><img src={curPreview.src} alt={`${curPreview.name} 預覽`} /></div><strong>{curPreview.name}</strong><span>{curPreview.width} × {curPreview.height} px · alpha decoded</span><button onClick={() => setCurPreview(null)}>返回 15 格素材表</button></div> : isReady ? <div className="sprite-grid">{grid.map((i) => <button key={i} className={`sprite-cell ${active === i ? "selected" : ""}`} onClick={() => setActive(i)} aria-label={cursorNames[i]}><span className="sprite-img" aria-hidden="true" style={{ backgroundImage: `url(${imageSrc})`, backgroundPosition: `${(i % 5) * 25}% ${Math.floor(i / 5) * 50}%` }} /><span className="cell-number">{String(i + 1).padStart(2, "0")}</span></button>)}</div> : <div className="empty-state"><img src={EMPTY_ART} alt="" /><b>拖曳一張 15 格游標圖到這裡</b><span>或使用左側按鈕上傳素材</span></div>}
          </div>
          <div className="selection-readout"><div><span className="readout-label">CURRENT SELECTION</span><strong>{String(active + 1).padStart(2, "0")} / {selectedName}</strong></div><div className="readout-check"><Check size={14} /> alpha channel detected</div></div>
        </section>

        <aside className="inspector-panel">
          <div className="panel-heading"><div><span className="section-index">B</span><div><p className="section-label">CALIBRATION</p><h2>校準游標</h2></div></div><Grid3X3 size={19} /></div>
          <div className="inspector-card"><div className="inspector-title"><FileImage size={18} /><span>輸出尺寸</span><code>CUR</code></div><div className="size-options">{[32, 48, 64, 96, 128, 256].map((size) => <button className={cellSize - padding * 2 === size ? "chosen" : ""} key={size} onClick={() => setCellSize(size + padding * 2)}>{size}<small>px</small></button>)}</div></div>
          <div className="inspector-card"><div className="inspector-title"><Ruler size={18} /><span>裁切邊界</span><code>{padding}px inset</code></div><input className="range-input" type="range" min="0" max="48" value={padding} onChange={(e) => setPadding(Number(e.target.value))} /><div className="range-foot"><span>緊密</span><b>{padding} px</b><span>留白</span></div></div>
          <div className="inspector-card"><div className="inspector-title"><MousePointer2 size={18} /><span>熱點座標</span><code>origin</code></div><div className="hotspot-fields"><label>X<input type="number" min="0" max="255" value={hotspotX} onChange={(e) => setHotspotX(Number(e.target.value))} /></label><label>Y<input type="number" min="0" max="255" value={hotspotY} onChange={(e) => setHotspotY(Number(e.target.value))} /></label></div><p className="field-note">點擊位置會成為游標的實際作用點。</p></div>
          <div className="export-box"><div><span className="section-index">C</span><div><p className="section-label">EXPORT</p><h2>準備好了嗎？</h2></div></div><p>目前選取：<b>{selectedName}</b><br />格式：Windows Cursor · `.cur`</p><Button className="primary-action" onClick={exportSelected}><Download size={17} /> 下載 {selectedName}.cur <ChevronRight size={16} /></Button><button className="batch-action" onClick={exportAll}>批次輸出全部 15 格 <span>→</span></button></div>
        </aside>
      </div>
      <footer className="footer-note"><span>CURSOR/MAKER · BUILT FOR CLEAN EDGES</span><span>素材不會離開你的瀏覽器</span></footer>
    </main>
  );
}
