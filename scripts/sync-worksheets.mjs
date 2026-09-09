import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { worksheetEntries } from "../docs/.vitepress/worksheets.mjs";
import { worksheetMarkdown } from "./worksheet-markdown.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "docs/public/downloads/worksheets");
const check = process.argv.includes("--check");
const expectedNames = new Set(worksheetEntries.map(({ name }) => name));
let changed = 0;
if (!check) mkdirSync(output, { recursive: true });

for (const entry of worksheetEntries) {
  const expected = worksheetMarkdown(readFileSync(join(root, "docs", entry.source), "utf8"), entry);
  const target = join(output, entry.name);
  const actual = existsSync(target) ? readFileSync(target, "utf8") : undefined;
  if (expected === actual) continue;
  changed += 1;
  if (check) console.error(`Worksheet out of sync: ${entry.name}; run npm run sync:worksheets`);
  else writeFileSync(target, expected);
}
for (const name of existsSync(output) ? readdirSync(output) : []) {
  if (!name.endsWith(".md") || expectedNames.has(name)) continue;
  changed += 1;
  if (check) console.error(`Worksheet has no source: ${name}`);
  else rmSync(join(output, name));
}
if (check && changed) process.exitCode = 1;
else console.log(`${worksheetEntries.length} editable worksheets ${changed ? "updated" : "are in sync"}`);
