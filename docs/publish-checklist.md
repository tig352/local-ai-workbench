# 發布前檢查清單

## 本地檢查

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run release:check`

## 文件檢查

- [ ] README 第一屏能說清楚項目用途
- [ ] README 包含安裝方式和使用方法
- [ ] README 有截圖或 demo
- [ ] `docs/provider-setup.md` 說清楚 Demo / Ollama / OpenAI compatible
- [ ] `examples/demo-report.md` 可讀
- [ ] CHANGELOG 已更新
- [ ] roadmap 已更新

## 安全檢查

- [ ] 沒有 `.env`、token、cookie、密碼、私鑰
- [ ] 沒有真實 API key
- [ ] 沒有真實用戶資料或私有 prompt
- [ ] API Key 不寫入 localStorage
- [ ] 導出 JSON / Markdown 不包含 API Key
- [ ] `dist/`、`node_modules/`、`build/` 未提交

## GitHub 發布前要列出的操作

- [ ] repo 名稱
- [ ] repo description
- [ ] repo topics
- [ ] 是否 public
- [ ] 將推送的分支
- [ ] 將包含的文件
- [ ] 敏感文件檢查結果
- [ ] 是否現在值得發布

## 發布後手動確認

- [ ] GitHub README 顯示正常
- [ ] 截圖正常顯示
- [ ] Actions 沒有明顯配置錯誤
- [ ] Topics 和 description 已設置
- [ ] 不創建 release，等至少一輪用戶/自用反饋後再做 `v0.1.0`

