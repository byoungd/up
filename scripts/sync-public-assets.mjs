#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const publicDir = join(ROOT, "docs/public/assets");
if (!checkOnly) mkdirSync(publicDir, { recursive: true });
const coverSpecs = [
  { source: "feature.svg", target: "feature.png", width: 1200, height: 630 },
  { source: "feature-en.svg", target: "feature-en.png", width: 1200, height: 630 },
  { source: "cover-portrait.svg", target: "cover-portrait.png", width: 1600, height: 2560 },
  { source: "cover-portrait-en.svg", target: "cover-portrait-en.png", width: 1600, height: 2560 },
];

let changed = false;
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

function syncBuffer(name, source) {
  const target = join(publicDir, name);
  let actual;
  try {
    actual = readFileSync(target);
  } catch {
    actual = Buffer.alloc(0);
  }
  if (source.equals(actual)) return;
  changed = true;
  if (checkOnly) {
    console.error(`docs/public/assets/${name}: 品牌资源未同步`);
  } else {
    writeFileSync(target, source);
    console.log(`updated docs/public/assets/${name}`);
  }
}

const sourceBuffers = new Map();
for (const name of ["logo.svg", ...coverSpecs.map(({ source }) => source)]) {
  const source = readFileSync(join(ROOT, "docs/assets", name));
  sourceBuffers.set(name, source);
  syncBuffer(name, source);
}

let existingManifest = {};
try {
  existingManifest = JSON.parse(readFileSync(join(publicDir, "brand-assets.json"), "utf8"));
  if (!existingManifest || typeof existingManifest !== "object" || Array.isArray(existingManifest)) {
    existingManifest = {};
  }
} catch {
  existingManifest = {};
}

const outputBuffers = new Map();
for (const { source, target, width, height } of coverSpecs) {
  let existingOutput;
  let hasExpectedDimensions = false;
  try {
    existingOutput = readFileSync(join(publicDir, target));
    const metadata = await sharp(existingOutput).metadata();
    hasExpectedDimensions = metadata.format === "png" && metadata.width === width && metadata.height === height;
  } catch {
    existingOutput = undefined;
  }

  const sourceHash = sha256(sourceBuffers.get(source));
  const manifestEntry = existingManifest.outputs?.[target];
  const canReuse =
    existingOutput &&
    hasExpectedDimensions &&
    existingManifest.sources?.[source] === sourceHash &&
    manifestEntry?.source === source &&
    manifestEntry?.width === width &&
    manifestEntry?.height === height &&
    manifestEntry?.sha256 === sha256(existingOutput);

  if (!checkOnly && !canReuse) {
    const rendered = await sharp(join(ROOT, "docs/assets", source))
      .resize(width, height, { fit: "fill" })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    outputBuffers.set(target, rendered);
    syncBuffer(target, rendered);
    continue;
  }

  if (!existingOutput) {
    changed = true;
    console.error(`docs/public/assets/${target}: PNG 不存在`);
    continue;
  }
  outputBuffers.set(target, existingOutput);
  if (!hasExpectedDimensions) {
    changed = true;
    console.error(`docs/public/assets/${target}: 必须是 ${width}×${height} PNG`);
  }
}

const manifest = {
  version: 1,
  sources: Object.fromEntries([...sourceBuffers].map(([name, buffer]) => [name, sha256(buffer)])),
  outputs: Object.fromEntries(
    coverSpecs.flatMap(({ source, target, width, height }) => {
      const output = outputBuffers.get(target);
      return output ? [[target, { source, width, height, sha256: sha256(output) }]] : [];
    }),
  ),
};
syncBuffer("brand-assets.json", Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));

if (checkOnly && changed) process.exit(1);
if (!changed) console.log("public brand assets are in sync");
