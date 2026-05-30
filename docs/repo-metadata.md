# GitHub Repo Metadata

發布前建議使用以下資料。

## Repo 名稱

```text
local-ai-workbench
```

## Description

```text
本地優先的 AI 模型工作台，用來測試 prompt、比較 Ollama / OpenAI compatible 模型輸出，並導出可復盤的測試記錄。
```

## Topics

```text
ai
llm
ollama
openai-compatible
prompt-engineering
local-first
developer-tools
javascript
chinese
```

## Visibility

建議：Public。

原因：

- 已有可運行 MVP，不是空殼。
- 沒有 API key、token、cookie 或私有資料。
- README、LICENSE、CONTRIBUTING、CHANGELOG、roadmap 已具備。
- Demo provider 讓未安裝 Ollama 的用戶也能體驗。

## 發布前狀態

| 項目 | 狀態 |
| --- | --- |
| README | 已有 |
| LICENSE | MIT |
| Issue templates | 已有 |
| PR template | 已有 |
| GitHub Actions | project-hygiene |
| Demo screenshot | 已有 |
| 示例報告 | 已有 |
| 敏感文件掃描 | `npm run release:check` |

## 是否值得現在發布

建議：可以作為早期 MVP 發布。

發布時不要包裝成成熟產品，文案應明確說明這是「本地 AI 模型工作台 MVP」，適合正在比較本地模型、prompt 和 OpenAI compatible endpoint 的開發者試用。

