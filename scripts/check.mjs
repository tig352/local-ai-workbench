import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "roadmap.md",
  "package.json",
  "public/index.html",
  "public/app.js",
  "public/styles.css",
  "src/core.js",
];

for (const file of requiredFiles) {
  await access(join(root, file));
}

const appSource = await readFile(join(root, "public/app.js"), "utf8");
if (!appSource.includes("saveJson(storageKeys.settings, safeSettingsForStorage(state.settings))")) {
  throw new Error("Settings must be sanitized before persistence");
}

if (appSource.includes("saveJson(storageKeys.settings, state.settings)")) {
  throw new Error("Settings are being persisted without sanitization");
}

console.log("Project hygiene check passed");
