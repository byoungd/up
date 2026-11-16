import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(new URL("../../scripts/extract-external-links.mjs", import.meta.url));

function extractFrom(t, markdown) {
  const root = mkdtempSync(join(tmpdir(), "external-links-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "docs"));
  copyFileSync(script, join(root, "scripts", "extract-external-links.mjs"));
  writeFileSync(join(root, "docs", "sample.md"), markdown, "utf8");
  const stdout = execFileSync(process.execPath, [join(root, "scripts", "extract-external-links.mjs")], {
    encoding: "utf8",
  });
  return [...stdout.matchAll(/\]\((https?:\/\/[^)]+)\)$/gim)].map((match) => match[1]);
}

test("inline code spans are not extracted as links", (t) => {
  const urls = extractFrom(t, "Attribution should link to `https://example.com/project`, then stop.\n");
  assert.deepEqual(urls, []);
});

test("a backtick is never carried into an extracted URL", (t) => {
  const urls = extractFrom(t, "See `https://example.com/a` and <https://example.com/b> here.\n");
  assert.deepEqual(urls, ["https://example.com/b"]);
});

test("ordinary links and bare URLs are still extracted", (t) => {
  const urls = extractFrom(t, "[Docs](https://example.com/docs) and https://example.com/bare here.\n");
  assert.deepEqual(urls.sort(), ["https://example.com/bare", "https://example.com/docs"]);
});
