#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOWNLOADS = join(ROOT, "docs/public/downloads");
const checkOnly = process.argv.includes("--check");
const pages = [join(ROOT, "docs/book-downloads.md"), join(ROOT, "docs/en/book-downloads.md")];
const manifests = ["pdf-manifest.json", "epub-manifest.json"].map((file) =>
  JSON.parse(readFileSync(join(DOWNLOADS, file), "utf8")),
);
const outputs = new Map(
  manifests.flatMap(({ outputs: entries }) => Object.values(entries).map((entry) => [entry.file, entry])),
);

function sizeInMiB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function descriptionFor(file, output) {
  const isPdf = file.endsWith(".pdf");
  const english = output.language === "en-US";
  const size = `${english ? "about" : "约"} ${sizeInMiB(output.bytes)} MiB`;
  if (isPdf) return `${output.pages} ${english ? "pages" : "页"} · ${size} · PDF 1.7`;
  return `${output.chapters} ${english ? "chapters" : "个章节"} · ${size} · EPUB 3.3`;
}

function syncPage(file) {
  if (!existsSync(file)) throw new Error(`${file} 不存在`);
  const source = readFileSync(file, "utf8");
  const sections = [...source.matchAll(/<section\b[^>]*class="download-card"[\s\S]*?<\/section>/g)];
  const seen = new Set();
  let output = source;
  for (const match of sections) {
    const section = match[0];
    const fileName = section.match(/\bhref="(?:\.\.?\/)?downloads\/([^"]+)"/)?.[1];
    if (!fileName) continue;
    const metadata = outputs.get(fileName);
    if (!metadata) throw new Error(`${file}: 未知出版文件 ${fileName}`);
    if (seen.has(fileName)) throw new Error(`${file}: 出版文件重复 ${fileName}`);
    seen.add(fileName);
    const updated = section
      .replace(/<p>[^<]*<\/p>/, `<p>${descriptionFor(fileName, metadata)}</p>`)
      .replace(/<code>[a-f0-9]{64}<\/code>/, `<code>${metadata.sha256}</code>`);
    output = output.replace(section, updated);
  }

  if (seen.size !== outputs.size) {
    const missing = [...outputs.keys()].filter((fileName) => !seen.has(fileName));
    throw new Error(`${file}: 缺少出版文件卡片 ${missing.join(", ")}`);
  }
  if (output === source) return false;
  if (checkOnly) {
    console.error(`${file.replace(`${ROOT}/`, "")}: 下载页未与 manifest 同步；运行 npm run sync:downloads`);
    return true;
  }
  writeFileSync(file, output);
  console.log(`updated ${file.replace(`${ROOT}/`, "")}`);
  return true;
}

const changed = pages.map(syncPage).some(Boolean);
if (checkOnly && changed) process.exit(1);
if (!changed) console.log("download pages are in sync");
