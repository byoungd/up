#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(ROOT, "docs/.vitepress/dist/assets");
const chunksDir = join(assetsDir, "chunks");

if (!existsSync(chunksDir)) {
  console.error("Build output is missing; run npm run docs:build before checking size budgets.");
  process.exit(1);
}

const budgets = [
  {
    label: "local search index",
    directory: chunksDir,
    pattern: /^@localSearchIndex.*\.js$/,
    expected: 2,
    raw: 610_000,
    gzip: 185_000,
  },
  {
    label: "framework",
    directory: chunksDir,
    pattern: /^framework.*\.js$/,
    expected: 1,
    raw: 125_000,
    gzip: 50_000,
  },
  {
    label: "search UI",
    directory: chunksDir,
    pattern: /^VPLocalSearchBox.*\.js$/,
    expected: 1,
    raw: 75_000,
    gzip: 28_000,
  },
  {
    label: "theme",
    directory: chunksDir,
    pattern: /^theme.*\.js$/,
    expected: 1,
    raw: 70_000,
    gzip: 22_000,
  },
];

const format = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
let failed = false;

function rasterAssets(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) rasterAssets(path, output);
    else if (/\.(?:avif|jpe?g|png|webp)$/i.test(entry.name)) output.push(path);
  }
  return output;
}

for (const budget of budgets) {
  const files = readdirSync(budget.directory).filter((name) => budget.pattern.test(name));
  if (files.length !== budget.expected) {
    console.error(`${budget.label}: expected ${budget.expected} chunk(s), found ${files.length}`);
    failed = true;
    continue;
  }

  for (const name of files) {
    const content = readFileSync(join(budget.directory, name));
    const raw = content.byteLength;
    const gzip = gzipSync(content, { level: 9 }).byteLength;
    console.log(`${budget.label}: ${name} ${format(raw)} raw / ${format(gzip)} gzip`);
    if (raw > budget.raw || gzip > budget.gzip) {
      console.error(
        `${budget.label}: budget exceeded (max ${format(budget.raw)} raw / ${format(budget.gzip)} gzip)`,
      );
      failed = true;
    }
  }
}

const rasterBudget = 230_000;
const rasters = rasterAssets(join(ROOT, "docs/assets"))
  .map((path) => ({ path, size: statSync(path).size }))
  .sort((a, b) => b.size - a.size);
const largestRaster = rasters[0];
if (largestRaster) {
  console.log(`largest source raster: ${largestRaster.path.replace(`${ROOT}/`, "")} ${format(largestRaster.size)}`);
} else {
  console.log("no source raster assets");
}
for (const { path, size } of rasters.filter(({ size }) => size > rasterBudget)) {
  console.error(
    `source raster budget exceeded: ${path.replace(`${ROOT}/`, "")} ${format(size)} (max ${format(rasterBudget)})`,
  );
  failed = true;
}

if (failed) process.exit(1);
console.log("build size budgets passed");
