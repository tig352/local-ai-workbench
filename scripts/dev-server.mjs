import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = join(root, "public");
const srcDir = join(root, "src");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const filePath = resolveRequestPath(url.pathname);
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": `${mimeTypes[extname(filePath)] ?? "application/octet-stream"};charset=utf-8`,
      "cache-control": "no-store",
    });
    response.end(content);
  } catch (error) {
    response.writeHead(error?.code === "ENOENT" ? 404 : 500, {
      "content-type": "text/plain;charset=utf-8",
    });
    response.end(error?.code === "ENOENT" ? "Not found" : String(error));
  }
});

function resolveRequestPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return join(publicDir, "index.html");
  }
  if (pathname.startsWith("/src/")) {
    return safeJoin(root, pathname);
  }
  return safeJoin(publicDir, pathname);
}

function safeJoin(base, pathname) {
  const normalized = normalize(pathname).replace(/^([/\\])+/, "");
  const target = join(base, normalized);
  if (!target.startsWith(base) && !target.startsWith(srcDir)) {
    throw new Error("Invalid path");
  }
  return target;
}

server.listen(port, () => {
  console.log(`Local AI Workbench running at http://localhost:${port}`);
});

