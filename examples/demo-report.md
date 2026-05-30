# Local AI Workbench Demo 報告

這是一份人工整理的 Demo mock provider 示例，用來展示沒有本地模型服務時的預期輸出。

## 摘要

- Provider：Demo mock
- Model：demo-fast
- 用途：驗證 prompt 保存、模型執行、記錄生成、報告導出
- 是否需要 API Key：否

## 示例輸出

```text
這是 demo-fast 的本地 Demo 回覆。

你可以用它在沒有 Ollama 或 API key 的情況下驗證工作台流程：
- Prompt 已被讀取
- 多模型執行會生成記錄
- Markdown / JSON 導出可以正常工作

Prompt 摘要：請用中文解釋下面這段代碼的作用、邊界情況和可能的 bug
```

## 下一步

Demo provider 跑通後，可以切換到 Ollama 或 OpenAI compatible provider，使用真實模型生成輸出。

