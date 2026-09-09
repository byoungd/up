#!/usr/bin/env node

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "docs/assets");
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const tempDir = mkdtempSync(join(tmpdir(), "up-assets-"));

function walk(dir, extensions, output = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, extensions, output);
    else if (extensions.has(extname(name).toLowerCase())) output.push(path);
  }
  return output;
}

async function encode(input, output, extension) {
  let pipeline = sharp(input).rotate();
  if ([".jpg", ".jpeg"].includes(extension)) {
    pipeline = pipeline.jpeg({ quality: 86, mozjpeg: true });
  } else if (extension === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  } else if (extension === ".webp") {
    pipeline = pipeline.webp({ quality: 84, effort: 5 });
  } else if (extension === ".avif") {
    pipeline = pipeline.avif({ quality: 52, effort: 5 });
  }
  await pipeline.toFile(output);
}

function walkMarkdown(dir, output = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walkMarkdown(path, output);
    else if (path.endsWith(".md")) output.push(path);
  }
  return output;
}

const webpConversions = [
  "nrt.png",
  "entrepreneurship/cover.png",
  "entrepreneurship/2016-first-product.png",
  "entrepreneurship/2022-collapse.png",
  "entrepreneurship/2023-recovery.png",
  "entrepreneurship/2026-ai-real-economy.png",
];

for (const sourceName of webpConversions) {
  const source = join(ASSETS, sourceName);
  if (!existsSync(source)) continue;
  const targetName = sourceName.replace(/\.png$/i, ".webp");
  const target = join(ASSETS, targetName);
  const temporary = join(tempDir, targetName.replaceAll("/", "__"));
  await sharp(source).rotate().webp({ quality: 84, effort: 6 }).toFile(temporary);
  renameSync(temporary, target);
  rmSync(source);

  for (const markdown of walkMarkdown(join(ROOT, "docs"))) {
    const text = readFileSync(markdown, "utf8");
    const updated = text.replaceAll(sourceName, targetName);
    if (updated !== text) writeFileSync(markdown, updated);
  }
  console.log(`converted ${sourceName} -> ${targetName}`);
}

for (const file of walk(ASSETS, RASTER)) {
  const extension = extname(file).toLowerCase();
  const temporary = join(tempDir, relative(ASSETS, file).replaceAll("/", "__"));
  await encode(file, temporary, extension);
  renameSync(temporary, file);
  console.log(`sanitized ${relative(ROOT, file)}`);
}

rmSync(tempDir, { recursive: true });
