# MVP 範圍

## 必須完成

- [x] 一個可本地啟動的界面或 CLI
- [x] Provider 配置：OpenAI compatible API、Ollama
- [x] Prompt 新增、編輯、標籤
- [x] 單 prompt 多模型執行
- [x] 本地保存執行記錄
- [x] Markdown / JSON 導出

## 驗收標準

- 不需要雲端帳號即可使用本地模型
- 未配置 API key 時不會報敏感錯誤
- 導出的報告能看出模型、參數、prompt、輸出、時間
- README 能讓第一次接觸的人 10 分鐘內跑起來

## 下一輪驗收

- 使用真實 Ollama 模型完成一次頁面截圖
- 增加連接失敗時的中文排錯文檔
- 補充導出報告樣例

## 風險

- 本地模型接口差異較多，需要先聚焦 Ollama 和 OpenAI compatible API
- 如果 UI 過重，兩週 MVP 會失焦
- 必須清楚標示資料是否只保存在本地
