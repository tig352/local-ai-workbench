import {
  DEFAULT_SETTINGS,
  createRun,
  createSamplePrompts,
  downloadText,
  parseModelList,
  safeSettingsForStorage,
  summarizeRuns,
  toMarkdownReport,
} from "../src/core.js";

const storageKeys = {
  settings: "local-ai-workbench:settings",
  prompts: "local-ai-workbench:prompts",
  runs: "local-ai-workbench:runs",
};

const elements = {
  saveStatus: document.querySelector("#saveStatus"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  exportMarkdownBtn: document.querySelector("#exportMarkdownBtn"),
  saveSettingsBtn: document.querySelector("#saveSettingsBtn"),
  provider: document.querySelector("#provider"),
  endpoint: document.querySelector("#endpoint"),
  models: document.querySelector("#models"),
  temperature: document.querySelector("#temperature"),
  apiKey: document.querySelector("#apiKey"),
  systemPrompt: document.querySelector("#systemPrompt"),
  promptSelect: document.querySelector("#promptSelect"),
  newPromptBtn: document.querySelector("#newPromptBtn"),
  savePromptBtn: document.querySelector("#savePromptBtn"),
  deletePromptBtn: document.querySelector("#deletePromptBtn"),
  promptName: document.querySelector("#promptName"),
  promptTags: document.querySelector("#promptTags"),
  promptText: document.querySelector("#promptText"),
  runBtn: document.querySelector("#runBtn"),
  clearRunsBtn: document.querySelector("#clearRunsBtn"),
  runSummary: document.querySelector("#runSummary"),
  resultsList: document.querySelector("#resultsList"),
  resultTemplate: document.querySelector("#resultTemplate"),
};

const state = {
  settings: loadJson(storageKeys.settings, DEFAULT_SETTINGS),
  prompts: loadJson(storageKeys.prompts, createSamplePrompts()),
  runs: loadJson(storageKeys.runs, []),
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value, null, 2));
  flashStatus("已保存到本地");
}

function flashStatus(message) {
  elements.saveStatus.textContent = message;
  window.setTimeout(() => {
    elements.saveStatus.textContent = "本地保存";
  }, 1800);
}

function applySettingsToForm() {
  elements.provider.value = state.settings.provider;
  elements.endpoint.value = state.settings.endpoint;
  elements.models.value = state.settings.models.join(", ");
  elements.temperature.value = String(state.settings.temperature);
  elements.systemPrompt.value = state.settings.systemPrompt;
}

function readSettingsFromForm() {
  return {
    provider: elements.provider.value,
    endpoint: elements.endpoint.value.trim(),
    models: parseModelList(elements.models.value),
    temperature: Number(elements.temperature.value || DEFAULT_SETTINGS.temperature),
    apiKey: elements.apiKey.value.trim(),
    systemPrompt: elements.systemPrompt.value.trim(),
  };
}

function renderPromptSelect() {
  elements.promptSelect.replaceChildren();
  for (const prompt of state.prompts) {
    const option = document.createElement("option");
    option.value = prompt.id;
    option.textContent = prompt.name;
    elements.promptSelect.append(option);
  }
  if (state.prompts.length > 0 && !elements.promptSelect.value) {
    elements.promptSelect.value = state.prompts[0].id;
  }
  renderSelectedPrompt();
}

function renderSelectedPrompt() {
  const prompt = getSelectedPrompt();
  elements.promptName.value = prompt?.name ?? "";
  elements.promptTags.value = prompt?.tags?.join(", ") ?? "";
  elements.promptText.value = prompt?.text ?? "";
}

function getSelectedPrompt() {
  return state.prompts.find((prompt) => prompt.id === elements.promptSelect.value);
}

function upsertPrompt() {
  const name = elements.promptName.value.trim() || "未命名 Prompt";
  const text = elements.promptText.value.trim();
  const tags = elements.promptTags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!text) {
    flashStatus("Prompt 不能為空");
    return;
  }

  const selected = getSelectedPrompt();
  if (selected) {
    selected.name = name;
    selected.tags = tags;
    selected.text = text;
    selected.updatedAt = new Date().toISOString();
  } else {
    state.prompts.unshift({
      id: crypto.randomUUID(),
      name,
      tags,
      text,
      updatedAt: new Date().toISOString(),
    });
  }

  saveJson(storageKeys.prompts, state.prompts);
  renderPromptSelect();
}

function newPrompt() {
  elements.promptSelect.value = "";
  elements.promptName.value = "";
  elements.promptTags.value = "";
  elements.promptText.value = "";
  elements.promptName.focus();
}

function deletePrompt() {
  const selected = getSelectedPrompt();
  if (!selected) return;
  state.prompts = state.prompts.filter((prompt) => prompt.id !== selected.id);
  if (state.prompts.length === 0) {
    state.prompts = createSamplePrompts();
  }
  saveJson(storageKeys.prompts, state.prompts);
  renderPromptSelect();
}

async function runModels() {
  const promptText = elements.promptText.value.trim();
  const settings = readSettingsFromForm();
  const models = settings.models;

  if (!settings.endpoint) {
    flashStatus("請先配置 Endpoint");
    return;
  }
  if (models.length === 0) {
    flashStatus("請至少填寫一個模型");
    return;
  }
  if (!promptText) {
    flashStatus("請先填寫 Prompt");
    return;
  }

  elements.runBtn.disabled = true;
  elements.runBtn.textContent = "執行中...";

  for (const model of models) {
    const startedAt = performance.now();
    const startedAtIso = new Date().toISOString();
    try {
      const response = await callModel({
        ...settings,
        model,
        prompt: promptText,
      });
      const latencyMs = Math.round(performance.now() - startedAt);
      state.runs.unshift(
        createRun({
          provider: settings.provider,
          model,
          promptName: elements.promptName.value.trim() || "未命名 Prompt",
          prompt: promptText,
          output: response.output,
          usage: response.usage,
          latencyMs,
          status: "ok",
          createdAt: startedAtIso,
        }),
      );
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startedAt);
      state.runs.unshift(
        createRun({
          provider: settings.provider,
          model,
          promptName: elements.promptName.value.trim() || "未命名 Prompt",
          prompt: promptText,
          output: error instanceof Error ? error.message : String(error),
          usage: null,
          latencyMs,
          status: "error",
          createdAt: startedAtIso,
        }),
      );
    }
    saveJson(storageKeys.runs, state.runs);
    renderRuns();
  }

  elements.runBtn.disabled = false;
  elements.runBtn.textContent = "執行模型測試";
}

async function callModel(settings) {
  if (settings.provider === "ollama") {
    return callOllama(settings);
  }
  return callOpenAiCompatible(settings);
}

async function callOllama(settings) {
  const response = await fetch(`${trimSlash(settings.endpoint)}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model,
      stream: false,
      messages: buildMessages(settings),
      options: {
        temperature: settings.temperature,
      },
    }),
  });
  const data = await parseJsonResponse(response);
  return {
    output: data?.message?.content ?? JSON.stringify(data, null, 2),
    usage: {
      promptTokens: data?.prompt_eval_count ?? null,
      completionTokens: data?.eval_count ?? null,
      totalTokens: (data?.prompt_eval_count ?? 0) + (data?.eval_count ?? 0) || null,
    },
  };
}

async function callOpenAiCompatible(settings) {
  const headers = {
    "content-type": "application/json",
  };
  if (settings.apiKey) {
    headers.authorization = `Bearer ${settings.apiKey}`;
  }

  const response = await fetch(`${trimSlash(settings.endpoint)}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: settings.model,
      messages: buildMessages(settings),
      temperature: settings.temperature,
      stream: false,
    }),
  });
  const data = await parseJsonResponse(response);
  return {
    output: data?.choices?.[0]?.message?.content ?? JSON.stringify(data, null, 2),
    usage: {
      promptTokens: data?.usage?.prompt_tokens ?? null,
      completionTokens: data?.usage?.completion_tokens ?? null,
      totalTokens: data?.usage?.total_tokens ?? null,
    },
  };
}

function buildMessages(settings) {
  const messages = [];
  if (settings.systemPrompt) {
    messages.push({ role: "system", content: settings.systemPrompt });
  }
  messages.push({ role: "user", content: settings.prompt });
  return messages;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    throw new Error(`HTTP ${response.status}: ${detail}`);
  }
  return data;
}

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}

function renderRuns() {
  const summary = summarizeRuns(state.runs);
  elements.runSummary.replaceChildren(
    summaryCard("總記錄", summary.totalRuns),
    summaryCard("成功", summary.okRuns),
    summaryCard("錯誤", summary.errorRuns),
    summaryCard("平均延遲", `${summary.averageLatencyMs}ms`),
  );

  elements.resultsList.replaceChildren();
  if (state.runs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "還沒有測試記錄。";
    elements.resultsList.append(empty);
    return;
  }

  for (const run of state.runs) {
    const node = elements.resultTemplate.content.cloneNode(true);
    node.querySelector(".result-model").textContent = run.model;
    node.querySelector(".result-provider").textContent = run.provider;
    node.querySelector(".result-latency").textContent = `${run.latencyMs}ms`;
    const status = node.querySelector(".result-status");
    status.textContent = run.status === "ok" ? "成功" : "錯誤";
    status.dataset.status = run.status;
    node.querySelector(".result-output").textContent = run.output;
    elements.resultsList.append(node);
  }
}

function summaryCard(label, value) {
  const card = document.createElement("div");
  card.className = "summary-card";
  const labelNode = document.createElement("span");
  labelNode.textContent = label;
  const valueNode = document.createElement("strong");
  valueNode.textContent = String(value);
  card.append(labelNode, valueNode);
  return card;
}

function saveSettings() {
  state.settings = readSettingsFromForm();
  saveJson(storageKeys.settings, safeSettingsForStorage(state.settings));
}

function clearRuns() {
  state.runs = [];
  saveJson(storageKeys.runs, state.runs);
  renderRuns();
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    settings: safeSettingsForStorage(readSettingsFromForm()),
    prompts: state.prompts,
    runs: state.runs,
  };
  downloadText("local-ai-workbench-export.json", JSON.stringify(payload, null, 2), "application/json");
}

function exportMarkdown() {
  downloadText("local-ai-workbench-report.md", toMarkdownReport(state.runs), "text/markdown");
}

elements.saveSettingsBtn.addEventListener("click", saveSettings);
elements.promptSelect.addEventListener("change", renderSelectedPrompt);
elements.newPromptBtn.addEventListener("click", newPrompt);
elements.savePromptBtn.addEventListener("click", upsertPrompt);
elements.deletePromptBtn.addEventListener("click", deletePrompt);
elements.runBtn.addEventListener("click", runModels);
elements.clearRunsBtn.addEventListener("click", clearRuns);
elements.exportJsonBtn.addEventListener("click", exportJson);
elements.exportMarkdownBtn.addEventListener("click", exportMarkdown);

applySettingsToForm();
renderPromptSelect();
renderRuns();

