# Provider 設定與排錯

Local AI Workbench 目前支援三種 provider。

## Demo mock

不需要模型服務、不需要 API key。適合第一次打開項目時驗證流程：

- Prompt 是否能保存
- 多模型執行是否能產生記錄
- JSON / Markdown 是否能導出

建議首次使用先選 Demo mock，確認工作台本身可用，再接入真實模型。

## Ollama

預設 endpoint：

```text
http://localhost:11434
```

檢查方式：

```bash
ollama --version
```

若 Ollama 已啟動，可測試：

```bash
curl http://localhost:11434/api/tags
```

常見問題：

- `ollama` 命令不存在：本機尚未安裝 Ollama 或不在 PATH。
- `localhost:11434` 連不上：Ollama 服務沒有啟動。
- 模型列表為空：需要先拉取模型，例如 `ollama pull llama3.1`。

## OpenAI compatible

適合接入 LM Studio、vLLM、LiteLLM 或其他兼容 `/chat/completions` 的服務。

示例 endpoint：

```text
http://localhost:8000/v1
```

注意：

- API Key 不會寫入 localStorage。
- 導出 JSON / Markdown 時不會包含 API Key。
- 如果接入雲端 provider，請自行確認資料政策。

