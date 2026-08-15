/* Design philosophy: Neo-editorial utility — a warm paper workbench with cobalt calibration marks, asymmetric workspace, and precise cursor production feedback. */
import { useMemo, useRef, useState } from "react";
import { Download, FileImage, Grid3X3, MousePointer2, Ruler, Upload, WandSparkles, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SPRITE_URL = "/manus-storage/windows-cursor-15-grid-transparent_7de4f2f5.png";
const EMPTY_ART = "/manus-storage/cursor-maker-empty-state_ac18c21a.png";

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
  u16(hotspotX); u16(hotspotY); u32(16 + dibSize + imageSize); u32(6 + 16);
  u32(dibSize); i32(width); i32(height * 2); u16(1); u16(32); u32(0); u32(imageSize); i32(0); i32(0); u32(0); u32(0);
  for (let y = height - 1; y >= 0; y--) for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4; view.setUint8(offset++, rgba[p + 2]); view.setUint8(offset++, rgba[p + 1]); view.setUint8(offset++, rgba[p]); view.setUint8(offset++, rgba[p + 3]);
  }
  const mask = new Uint8Array(buffer, offset, rowBytes * height); mask.fill(0);
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

  const selectedName = cursorNames[active];
  const grid = useMemo(() => Array.from({ length: 15 }, (_, i) => i), []);

  const handleUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("請選擇 PNG、JPG 或 WebP 圖片。"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageSrc(String(reader.result)); setIsReady(true); toast.success("素材已載入工作台"); };
    reader.readAsDataURL(file);
  };

  const exportSelected = async () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.max(32, Math.min(256, cellSize - padding * 2));
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const col = active % 5; const row = Math.floor(active / 5);
      const sourceSize = img.width / 5;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, col * sourceSize + padding, row * sourceSize + padding, sourceSize - padding * 2, sourceSize - padding * 2, 0, 0, size, size);
      const blob = encodeCur(canvas, hotspotX, hotspotY);
      if (blob) { downloadBlob(blob, `${String(active + 1).padStart(2, "0")}-${selectedName}.cur`); toast.success(`${selectedName}.cur 已下載`); }
    };
    img.src = imageSrc;
  };

  const exportAll = () => toast.info("批次輸出介面已準備好，下一版會加入 15 個 CUR 的 ZIP 打包下載。");

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
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
        </aside>

        <section className="preview-stage">
          <div className="stage-head"><div><span className="section-index">A</span><div><p className="section-label">SPRITE SHEET PREVIEW</p><h2>選一格開始校準</h2></div></div><span className="sheet-size">1920 × 1920 px</span></div>
          <div className="sheet-frame">
            <div className="crop-corner top-left" /><div className="crop-corner bottom-right" />
            {isReady ? <div className="sprite-grid">{grid.map((i) => <button key={i} className={`sprite-cell ${active === i ? "selected" : ""}`} onClick={() => setActive(i)} aria-label={cursorNames[i]}><span className="sprite-img" aria-hidden="true" style={{ backgroundImage: `url(${imageSrc})`, backgroundPosition: `${(i % 5) * 25}% ${Math.floor(i / 5) * 50}%` }} /><span className="cell-number">{String(i + 1).padStart(2, "0")}</span></button>)}</div> : <div className="empty-state"><img src={EMPTY_ART} alt="" /><b>拖曳一張 15 格游標圖到這裡</b><span>或使用左側按鈕上傳素材</span></div>}
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
