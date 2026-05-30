import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SETTINGS,
  createRun,
  parseModelList,
  safeSettingsForStorage,
  summarizeRuns,
  toMarkdownReport,
} from "../src/core.js";

test("parseModelList trims comma-separated model names", () => {
  assert.deepEqual(parseModelList(" llama3.1, qwen2.5 ,, gemma "), ["llama3.1", "qwen2.5", "gemma"]);
});

test("safeSettingsForStorage removes apiKey", () => {
  const settings = safeSettingsForStorage({
    ...DEFAULT_SETTINGS,
    apiKey: "sk-test",
    models: "llama3.1, qwen2.5",
  });

  assert.equal("apiKey" in settings, false);
  assert.deepEqual(settings.models, ["llama3.1", "qwen2.5"]);
});

test("summarizeRuns returns totals and average latency", () => {
  const runs = [
    createRun({
      id: "1",
      provider: "ollama",
      model: "a",
      promptName: "p",
      prompt: "hello",
      output: "ok",
      latencyMs: 100,
      status: "ok",
      createdAt: "2026-05-29T00:00:00.000Z",
    }),
    createRun({
      id: "2",
      provider: "ollama",
      model: "b",
      promptName: "p",
      prompt: "hello",
      output: "bad",
      latencyMs: 300,
      status: "error",
      createdAt: "2026-05-29T00:00:00.000Z",
    }),
  ];

  assert.deepEqual(summarizeRuns(runs), {
    totalRuns: 2,
    okRuns: 1,
    errorRuns: 1,
    averageLatencyMs: 200,
  });
});

test("toMarkdownReport includes model output", () => {
  const markdown = toMarkdownReport([
    createRun({
      id: "1",
      provider: "openai-compatible",
      model: "test-model",
      promptName: "demo",
      prompt: "hello",
      output: "world",
      latencyMs: 120,
      status: "ok",
      createdAt: "2026-05-29T00:00:00.000Z",
    }),
  ]);

  assert.match(markdown, /test-model/);
  assert.match(markdown, /world/);
});

