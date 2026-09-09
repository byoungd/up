#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = join(ROOT, "docs/README.md");
const targetFile = join(ROOT, "README.md");
const checkOnly = process.argv.includes("--check");

function toRepositoryReadme(source) {
  return source
    .replace("中文 | [English](en/)", "中文 | [English](docs/en/README.md)")
    .replace(/\]\((assets|threads|templates|reference)\//g, "](docs/$1/")
    .replace(/src="\.\/assets\//g, 'src="./docs/assets/')
    .replace(/href="\.\/downloads\//g, 'href="./docs/public/downloads/')
    .replace(/\]\(projects\.md\)/g, "](docs/projects.md)")
    .replace(/href="\.\/(threads\/[^\"]+|templates\/[^\"]+|projects)"/g, (_match, path) =>
      `href="./docs/${path}.md"`,
    );
}

const expected = toRepositoryReadme(readFileSync(sourceFile, "utf8"));
let actual;
try {
  actual = readFileSync(targetFile, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (actual !== expected) {
  if (checkOnly) {
    console.error("README.md: 未与 docs/README.md 同步；运行 npm run sync");
    process.exit(1);
  }
  writeFileSync(targetFile, expected);
  console.log("updated README.md");
} else {
  console.log("README mirror is in sync");
}
