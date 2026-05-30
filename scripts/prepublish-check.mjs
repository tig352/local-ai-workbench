import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "roadmap.md",
  "package.json",
  ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/ISSUE_TEMPLATE/feature_request.md",
  ".github/pull_request_template.md",
  ".github/workflows/ci.yml",
  "docs/provider-setup.md",
  "docs/publish-checklist.md",
  "docs/repo-metadata.md",
  "docs/share-copy.md",
  "examples/demo-report.md",
];

const ignoredDirs = new Set([".git", "node_modules", "dist", "build", "coverage", ".cache"]);
const textExtensions = new Set([
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".html",
  ".css",
  ".yml",
  ".yaml",
  ".txt",
]);
const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----/,
];

for (const file of requiredFiles) {
  await readFile(join(root, file), "utf8");
}

const files = await listFiles(root);
for (const file of files) {
  const relativePath = relative(root, file).replace(/\\/g, "/");
  if (/(^|\/)\.env(\.|$)/.test(relativePath)) {
    throw new Error(`Sensitive env file found: ${relativePath}`);
  }
  if (!isTextFile(relativePath)) continue;
  const content = await readFile(file, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      throw new Error(`Potential secret found in ${relativePath}`);
    }
  }
}

console.log("Local AI Workbench release check passed");

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...await listFiles(join(dir, entry.name)));
      continue;
    }
    if (entry.isFile()) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function isTextFile(path) {
  const dot = path.lastIndexOf(".");
  return dot >= 0 && textExtensions.has(path.slice(dot));
}

