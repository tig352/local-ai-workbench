export const DEFAULT_SETTINGS = {
  provider: "ollama",
  endpoint: "http://localhost:11434",
  models: ["llama3.1"],
  temperature: 0.7,
  systemPrompt: "你是一個謹慎、簡潔的中文技術助手。",
};

export function parseModelList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function safeSettingsForStorage(settings) {
  const { apiKey: _apiKey, ...safeSettings } = settings;
  return {
    ...DEFAULT_SETTINGS,
    ...safeSettings,
    models: parseModelList(safeSettings.models),
    temperature: Number.isFinite(Number(safeSettings.temperature))
      ? Number(safeSettings.temperature)
      : DEFAULT_SETTINGS.temperature,
  };
}

export function createSamplePrompts() {
  return [
    {
      id: "sample-code-explain",
      name: "代碼解釋測試",
      tags: ["code", "explain"],
      text: "請用中文解釋下面這段代碼的作用、邊界情況和可能的 bug：\n\nfunction sum(items) {\n  return items.reduce((total, item) => total + item.price, 0)\n}",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample-summary",
      name: "技術文章摘要",
      tags: ["summary", "reading"],
      text: "請把下面內容整理成 5 個要點，並列出 2 個值得追問的技術問題：\n\n在這裡貼上文章片段。",
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function createRun(input) {
  return {
    id: input.id ?? crypto.randomUUID(),
    provider: input.provider,
    model: input.model,
    promptName: input.promptName,
    prompt: input.prompt,
    output: input.output,
    usage: input.usage ?? null,
    latencyMs: input.latencyMs,
    status: input.status,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function summarizeRuns(runs) {
  const totalRuns = runs.length;
  const okRuns = runs.filter((run) => run.status === "ok").length;
  const errorRuns = runs.filter((run) => run.status === "error").length;
  const latencyTotal = runs.reduce((sum, run) => sum + Number(run.latencyMs || 0), 0);
  return {
    totalRuns,
    okRuns,
    errorRuns,
    averageLatencyMs: totalRuns > 0 ? Math.round(latencyTotal / totalRuns) : 0,
  };
}

export function toMarkdownReport(runs) {
  const summary = summarizeRuns(runs);
  const lines = [
    "# Local AI Workbench 測試報告",
    "",
    `生成時間：${new Date().toISOString()}`,
    "",
    "## 摘要",
    "",
    `- 總記錄：${summary.totalRuns}`,
    `- 成功：${summary.okRuns}`,
    `- 錯誤：${summary.errorRuns}`,
    `- 平均延遲：${summary.averageLatencyMs}ms`,
    "",
    "## 記錄",
    "",
  ];

  if (runs.length === 0) {
    lines.push("暫無測試記錄。");
    return lines.join("\n");
  }

  for (const run of runs) {
    lines.push(`### ${run.model} / ${run.provider}`);
    lines.push("");
    lines.push(`- 狀態：${run.status}`);
    lines.push(`- Prompt：${run.promptName}`);
    lines.push(`- 延遲：${run.latencyMs}ms`);
    lines.push(`- 時間：${run.createdAt}`);
    if (run.usage?.totalTokens) {
      lines.push(`- Token：${run.usage.totalTokens}`);
    }
    lines.push("");
    lines.push("```text");
    lines.push(run.output);
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadText(filename, content, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

