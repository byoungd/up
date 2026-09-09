#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { enNavigation, zhNavigation } from "../docs/.vitepress/navigation.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const checkOnly = process.argv.includes("--check");

function markdownSources(dir, prefix = "", output = []) {
  for (const name of readdirSync(dir)) {
    if ([".vitepress", "public", "assets"].includes(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      markdownSources(path, join(prefix, name), output);
      continue;
    }
    if (!name.endsWith(".md") || name === "SUMMARY.md") continue;
    output.push(join(prefix, name));
  }
  return output;
}

function validateNavigation(groups, locale) {
  const seenLinks = new Set();
  const seenSources = new Set();
  for (const group of groups) {
    if (!group.text || !Array.isArray(group.items)) {
      throw new Error(`${locale} 导航分组缺少 text 或 items`);
    }
    for (const item of group.items) {
      if (!item.text || !item.link || !item.source) {
        throw new Error(`${locale} 导航条目字段不完整: ${JSON.stringify(item)}`);
      }
      if (seenLinks.has(item.link)) {
        throw new Error(`${locale} 导航存在重复链接: ${item.link}`);
      }
      seenLinks.add(item.link);
      if (seenSources.has(item.source)) {
        throw new Error(`${locale} 导航存在重复 source: ${item.source}`);
      }
      seenSources.add(item.source);

      const source = resolve(DOCS, item.source);
      if (!source.startsWith(`${DOCS}/`) || !existsSync(source)) {
        throw new Error(`${locale} 导航 source 不存在: ${item.source}`);
      }
    }
  }
}

validateNavigation(zhNavigation, "中文");
validateNavigation(enNavigation, "英文");

function validateNavigationCoverage() {
  const publicSources = new Set(markdownSources(DOCS));
  const navigationSources = new Set(
    [...zhNavigation, ...enNavigation].flatMap((group) => group.items.map((item) => item.source)),
  );

  for (const source of publicSources) {
    if (!navigationSources.has(source)) {
      throw new Error(`公开 Markdown 未被导航收录: ${source}`);
    }
  }
  for (const source of navigationSources) {
    if (!publicSources.has(source)) {
      throw new Error(`导航 source 不属于公开 Markdown: ${source}`);
    }
  }
}

validateNavigationCoverage();

function summary(groups, prefix = "") {
  const lines = ["# Summary", ""];
  for (const group of groups) {
    lines.push(`## ${group.text}`, "");
    for (const item of group.items) {
      lines.push(`- [${item.text}](${prefix}${item.source})`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

const outputs = new Map([
  [join(ROOT, "SUMMARY.md"), summary(zhNavigation, "docs/")],
  [join(ROOT, "docs/SUMMARY.md"), summary(zhNavigation)],
  [join(ROOT, "docs/en/SUMMARY.md"), summary(enNavigation).replaceAll("(en/", "(")],
]);

let changed = false;
for (const [file, expected] of outputs) {
  let actual;
  try {
    actual = readFileSync(file, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (actual === expected) continue;
  changed = true;
  if (checkOnly) {
    console.error(`${file.replace(`${ROOT}/`, "")}: 导航文件未同步`);
  } else {
    writeFileSync(file, expected);
    console.log(`updated ${file.replace(`${ROOT}/`, "")}`);
  }
}

if (checkOnly && changed) process.exit(1);
if (!changed) console.log("navigation summaries are in sync");
