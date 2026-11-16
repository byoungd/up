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

function addLink(url, file, line) {
  const clean = url.replace(/[.,;:!?]+$/, "");
  try {
    const parsed = new URL(clean);
    if (!/^https?:$/.test(parsed.protocol)) return;
  } catch {
    return;
  }
  const source = `${relative(ROOT, file)}:${line}`;
  const locations = links.get(clean) || [];
  if (!locations.includes(source)) locations.push(source);
  links.set(clean, locations);
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

    // Inline code spans are examples, not links, just like fenced blocks above.
    // Without this the closing backtick is swallowed into a bare URL (".../up`").
    const scanned = line.replace(/`+[^`]*`+/g, " ");

    const lineNumber = index + 1;
    const markdownTargets = scanned.matchAll(/\]\((https?:\/\/[^)\s]+)(?:\s+["'][^)]*)?\)/gi);
    for (const match of markdownTargets) addLink(match[1], file, lineNumber);

    const htmlTargets = scanned.matchAll(/\b(?:href|src)=(["'])(https?:\/\/[^"']+)\1/gi);
    for (const match of htmlTargets) addLink(match[2], file, lineNumber);

    const bareTargets = scanned.matchAll(/https?:\/\/[^\s<>"'()`]+/gi);
    for (const match of bareTargets) addLink(match[0], file, lineNumber);
  });
}

if (!existsSync(join(ROOT, "docs"))) {
  console.error("docs directory not found");
  process.exit(1);
}

walk(ROOT);
for (const file of markdownFiles) extract(file);

console.log("# External links extracted from repository Markdown\n");
for (const [url, locations] of links) {
  console.log(`- [${locations.join(", ")}](${url})`);
}
