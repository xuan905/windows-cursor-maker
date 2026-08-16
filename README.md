# Windows Cursor Maker

Windows Cursor Maker 是一個以 React、TypeScript、tRPC 與 Drizzle ORM 建立的瀏覽器式 Windows 游標製作工作台。它將 AI 漫畫角色生成、15 格游標素材裁切、動態 ANI 工作區、透明背景處理、CUR／ANI 編碼與 ZIP 分類輸出整合在同一個流程中，讓使用者可以從參考圖與 Prompt 開始，逐格微調後產生可在 Windows 使用的游標檔案。

> 專案定位：先以安全框與像素規格確保輸出穩定，再提供 AI 生成與逐格編輯能力。所有角色與漫畫人物設定應使用原創描述，不應要求複製受版權保護的角色、商標或服裝設計。

## 主要功能

| 功能 | 說明 |
| --- | --- |
| 15 格靜態工作台 | 將 5×3 sprite sheet 對應到 15 個 Windows 游標工作項目，支援安全框、拖曳、縮放、熱點座標與逐格預覽。 |
| 動態 ANI 工作區 | 每組建立完整 5×3 大圖，三列分別對應 `-1`、`-2`、`-3`，每列五張連續影格，可播放、拖曳、縮放並輸出 ANI／ZIP。 |
| AI 漫畫素材生成 | 可選擇原創漫畫主題，產生透明背景、64×64-ready 的游標素材。 |
| 人物參考圖 | 支援檔案上傳與公開 HTTPS 圖片網址，將圖片轉為專案儲存 URL 後再供 AI 參考，降低 data URL 與外部代理限制。 |
| 外觀特徵分析與編輯 | AI 分析髮型、髮色、臉型、服裝、配色、配件、比例與辨識特徵；使用者可手動修改，並即時同步到標準／動態 Prompt。 |
| Prompt 歷史與收藏 | 登入後可保存 Prompt、圖片 URL 與外觀特徵，查看完整內容、複製、重新套用、收藏切換與刪除。 |
| 歷史搜尋與篩選 | 可依標題、Prompt、主題或圖片 URL 搜尋，依主題篩選，或只顯示已收藏項目。 |
| Windows 輸出 | 產生有效 `.cur`、RIFF/ACON `.ani`，並分別整理 PNG、CUR／ANI 與說明檔至 ZIP。 |
| 像素級游標箭頭驗證 | 每格左上角要求白色填充、黑色輪廓的工作項目箭頭，並檢查位置、方向、邊界與安全區。 |

## 使用流程

### 1. 選擇漫畫主題

在頁面上方選擇原創漫畫主題。主題只提供角色方向，例如髮色、服裝配色與動作風格；若使用參考圖，生成 Prompt 會將目前的角色外觀特徵一起加入。

### 2. 加入人物參考圖

使用者可以選擇 PNG、JPEG 或 WebP 檔案，也可以貼上公開的 HTTPS 圖片網址。網址必須直接回傳圖片內容，不能是需要登入、HTML 頁面或下載確認頁。

參考圖載入後，系統會將圖片儲存為專案可使用的 HTTPS URL，接著啟動外觀分析。分析期間會顯示狀態提示；若分析失敗，可以重新分析，仍可使用通用角色一致性 Prompt 生成素材。

### 3. 編輯外觀特徵與 Prompt

分析完成後，參考圖面板會顯示可編輯的外觀特徵欄位。修改內容會即時反映到標準 15 格 Prompt 與動態 5×3 Prompt。若要取消手動修改，可使用「恢復分析結果」按鈕。

Prompt 區塊提供完整內容展開、複製與保存收藏功能。動態工作區另外顯示實際組合後的 Dynamic Prompt，避免畫面摘要與真正送出的內容不一致。

### 4. 生成與微調

標準工作台會將生成素材載入 5×3 預覽。選取任一格後，可以調整位置、縮放與熱點；紅色安全框是輸出時的重要邊界。動態工作區則固定顯示三列、每列五格，使用者可以播放各列，並逐格調整影格位置與縮放。

AI 生成期間會顯示生成狀態，並暫停重複提交。生成服務若回傳失敗，介面會解除載入狀態並顯示錯誤，使用者可稍後重新嘗試。

### 5. 匯出 Windows 游標

靜態工作台可輸出 15 個 PNG 與 CUR 檔案；動態工作台可輸出對應列的 `.ani` 與 ZIP。ZIP 內容會使用英文檔名，以提升 Windows 檔案總管與游標設定介面的相容性。

常用的靜態游標角色如下：

| 編號 | Windows 工作項目 |
| --- | --- |
| `-1` | Standard Select／標準選擇 |
| `-2` | Help Select／說明選擇 |
| `-3` | Working in Background／背景作業 |
| `-4` | Busy／忙碌中 |
| `-5` | Precision Select／精準選取 |
| `-6` | Unavailable／無法使用 |
| `-7` | Vertical Resize／垂直調整 |
| `-8` | Horizontal Resize／水平調整 |
| `-9` | Diagonal Resize NW-SE／左上右下對角調整 |
| `-10` | Diagonal Resize NE-SW／右上左下對角調整 |
| `-11` | Move／移動 |
| `-12` | Alternate Select／替代選擇 |
| `-13` | Handwriting／手寫 |
| `-14` | Candidate／候選 |
| `-15` | Link Select／連結選擇 |

## Windows 套用方式

解壓縮輸出的 ZIP 後，先檢查 PNG 與 CUR／ANI 檔案是否完整。Windows 靜態游標通常可透過「設定 → 個人化 → 佈景主題 → 滑鼠游標」進入游標設定，再選擇對應的 `.cur` 檔案；動態游標則選擇 `.ani` 檔案。不同 Windows 版本的設定入口名稱可能略有差異。

若 Windows 顯示問號或無法預覽，請優先確認檔案是否為完整下載的 `.cur`／`.ani`、副檔名是否被系統改寫，以及 ZIP 解壓縮後是否包含全部檔案。專案輸出會寫入正確的 CUR header、DIB payload、AND mask 與 ANI RIFF/ACON 結構。

## 歷史紀錄與收藏

歷史紀錄使用登入使用者隔離。每筆資料保存目前 Prompt、圖片 URL、主題、外觀特徵 JSON、建立時間與收藏狀態。面板提供以下操作：

1. 使用關鍵字搜尋標題、Prompt、主題或圖片 URL。
2. 依主題標籤篩選。
3. 切換只看已收藏。
4. 查看完整 Prompt 與圖片 URL。
5. 複製 Prompt 或圖片 URL。
6. 將歷史紀錄重新套用到目前工作台。
7. 切換收藏狀態或刪除紀錄。

## 安全與限制

參考圖網址只接受 HTTPS，並會拒絕 localhost、私有／保留 IP、link-local 位址、雲端 metadata endpoint、非圖片 MIME、過大檔案、重新導向與逾時請求。這些限制用於降低 SSRF 風險與避免將內部服務當作圖片代理。

圖片與 Prompt 可能包含使用者提供的內容。請勿在 Prompt、圖片網址或檔名中放入密碼、API token、個人識別資料或其他不必要的機密資訊。歷史收藏僅供登入使用者查看，伺服器端查詢、更新與刪除均包含使用者識別條件。

圖片生成服務若回傳 `failed_precondition`、`usage exhausted` 或相似訊息，代表外部 AI 服務拒絕本次生成，通常不是 CUR／ANI 編碼錯誤。此時請稍後重試，或依目前帳號方案與服務狀態處理生成額度問題。

## 技術架構

| 層級 | 技術 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite、Tailwind CSS 4、Lucide React |
| API | tRPC 11、Express、SuperJSON |
| 驗證 | Manus OAuth 與 protected tRPC procedures |
| 資料庫 | Drizzle ORM、MySQL／TiDB 相容資料庫 |
| 儲存 | 專案提供的 S3 storage helper |
| 影像與輸出 | Canvas API、JSZip、自訂 CUR encoder、RIFF/ACON ANI encoder |
| 測試 | Vitest、型別檢查與瀏覽器視覺回歸 |

## 本機開發

請先準備 Node.js 22 或相容版本、pnpm，以及專案所需的執行環境變數。不要將環境變數檔、API key 或 OAuth secret 提交至 Git。專案環境中的系統變數應由部署平台或安全的 secret 管理介面提供。

```bash
pnpm install
pnpm dev
```

開發伺服器啟動後，使用終端機輸出的本機網址開啟應用程式。若需要同步資料庫 schema，請先檢視 migration，再依專案環境的資料庫流程套用：

```bash
pnpm db:push
```

正式建置與啟動指令如下：

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

格式化程式碼可使用：

```bash
pnpm format
```

## 測試狀態

目前測試涵蓋 CUR／ANI 結構、ANI 邊界與 ZIP 封裝、動態 5×3 取列、箭頭像素驗證、參考圖 Prompt 組合、歷史收藏 CRUD 與使用者隔離，以及歷史搜尋／主題／收藏篩選 helper。交付前應至少執行 `pnpm check`、`pnpm test` 與 `pnpm build`。

## 專案目錄

```text
client/src/pages/Home.tsx                 # 主要工作台 UI 與狀態管理
client/src/lib/ani.ts                     # ANI 結構與輸出 helper
client/src/lib/cursorArrows.ts            # 工作項目箭頭規格與像素驗證
client/src/lib/dynamicSheet.ts            # 5×3 動態列／影格 mapping
client/src/lib/historyFilter.ts           # 歷史搜尋與篩選 helper
client/src/lib/referenceAppearance.ts     # 參考圖外觀與 Prompt builder
server/routers.ts                          # tRPC 生成、參考圖與歷史 API
drizzle/schema.ts                         # Drizzle schema 與歷史收藏資料表
server/db.ts                               # user-scoped database helpers
server/*.test.ts                           # 後端測試
client/src/lib/*.test.ts                   # 前端純函式測試
```

## 授權與使用責任

本專案目前標示為 MIT license。使用者應自行確認生成圖片、角色設計、圖片網址與輸出游標的使用權利，並遵守所使用的 AI 服務、Windows 與相關素材授權規範。專案不保證任何第三方生成服務在所有時間都可用，也不取代 Windows 端的檔案相容性檢查。

## 支援與問題回報

若問題涉及專案程式碼，請附上瀏覽器錯誤訊息、重現步驟、使用的檔案類型與 `pnpm check`／`pnpm test` 結果。若錯誤訊息指出帳號生成額度、方案、付款或服務限制，請改向 [Manus 支援中心](https://help.manus.im) 查詢。
