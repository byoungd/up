#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IGNORED_DIRS = new Set([
  ".git",
  ".codex-artifact-work",
  "node_modules",
  "dist",
  "cache",
  "outputs",
  "output",
  "tmp",
  "test-results",
  "playwright-report",
]);

function addLink(links, root, url, file, line) {
  const clean = url.replace(/[.,;:!?]+$/, "");
  try {
    const parsed = new URL(clean);
    if (!/^https?:$/.test(parsed.protocol)) return;
  } catch {
    return;
  }
  const source = `${relative(root, file)}:${line}`;
  const locations = links.get(clean) || [];
  if (!locations.includes(source)) locations.push(source);
  links.set(clean, locations);
}

// Returns a Map(url -> ["file:line", ...]) for every external link in the Markdown
// under `root`. Fenced code, inline code, and HTML comments are material, not links;
// mask them with spaces of equal length so surrounding syntax keeps its offsets.
export function extractExternalLinks(root = ROOT) {
  const markdownFiles = [];
  const links = new Map();

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (IGNORED_DIRS.has(name) || name === ".external-links.md") continue;
      const file = join(dir, name);
      const stat = statSync(file);
      if (stat.isDirectory()) walk(file);
      else if (extname(name).toLowerCase() === ".md") markdownFiles.push(file);
    }
  }

  function extract(file) {
    const lines = readFileSync(file, "utf8").split("\n");
    let inFence = false;
    lines.forEach((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;

      const lineNumber = index + 1;
      const visible = line
        .replace(/<!--[\s\S]*?-->/g, (mask) => " ".repeat(mask.length))
        .replace(/(`+)([\s\S]*?)\1/g, (mask) => " ".repeat(mask.length));

      for (const match of visible.matchAll(/\]\((https?:\/\/[^)\s]+)(?:\s+["'][^)]*)?\)/gi)) {
        addLink(links, root, match[1], file, lineNumber);
      }
      for (const match of visible.matchAll(/\b(?:href|src)=(["'])(https?:\/\/[^"']+)\1/gi)) {
        addLink(links, root, match[2], file, lineNumber);
      }
      for (const match of visible.matchAll(/https?:\/\/[^\s<>"'()]+/gi)) {
        addLink(links, root, match[0], file, lineNumber);
      }
    });
  }

  walk(root);
  for (const file of markdownFiles) extract(file);
  return links;
}

export function formatExternalLinks(links) {
  const lines = ["# External links extracted from repository Markdown", ""];
  for (const [url, locations] of links) {
    lines.push(`- [${locations.join(", ")}](${url})`);
  }
  return `${lines.join("\n")}\n`;
}

export function main(root = ROOT) {
  if (!existsSync(join(root, "docs"))) {
    console.error("docs directory not found");
    return 1;
  }
  process.stdout.write(formatExternalLinks(extractExternalLinks(root)));
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
