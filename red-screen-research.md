# 純紅 #FF0000 去背研究紀錄

## 使用者提供圖片分析

圖片尺寸為 1380×752。以像素分析檢查後，沒有像素完全等於 (255, 0, 0)，但符合近紅色條件 R≥220、G≤45、B≤45 的像素約 500,041，占 48.18%；與近紅幕相鄰的過渡像素約 32,609。這表示圖片經過抗鋸齒、縮放或壓縮，不能只用精確 #FF0000 判斷背景。

## 實作結論

目前採用選定背景色的邊緣連通 flood-fill。背景候選以 RGB 曼哈頓距離判斷，預設近色容差由 18 提升至 24；只有與畫布邊緣連通的候選像素才會透明化，因此角色內部被包圍的紅色細節、白底黑線工作項目符號與特效不會因同色而被移除。新增近紅色抗鋸齒測試與四色背景測試。

## 外部依據

Kdenlive Chroma Key Advanced 說明：容差越高會移除更多背景，容差越低會移除較少背景；Edge Mode 可控制 feathering，Soften 可控制邊緣平滑度；對均勻綠、藍、紅背景可先使用基本 Chroma Key。來源：https://docs.kdenlive.org/en/effects_and_filters/video_effects/alpha_mask_keying/chroma_key_advanced.html

Adobe Ultra Key 參考頁面：https://helpx.adobe.com/premiere/desktop/add-video-effects/keys/ultra-key-effect.html
