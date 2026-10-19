import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DOWNLOADS = join(ROOT, "docs/public/downloads");
const manifests = ["pdf-manifest.json", "epub-manifest.json"].map((file) =>
  JSON.parse(readFileSync(join(DOWNLOADS, file), "utf8")),
);
const outputs = new Map(
  manifests.flatMap(({ outputs: entries }) => Object.values(entries).map((entry) => [entry.file, entry])),
);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const description = (file, output) => {
  const english = output.language === "en-US";
  const size = `${english ? "about" : "约"} ${(output.bytes / 1024 / 1024).toFixed(2)} MiB`;
  return file.endsWith(".pdf")
    ? `${output.pages} ${english ? "pages" : "页"} · ${size} · PDF 1.7`
    : `${output.chapters} ${english ? "chapters" : "个章节"} · ${size} · EPUB 3.3`;
};

test("download pages mirror every publication manifest entry", () => {
  for (const page of ["docs/book-downloads.md", "docs/en/book-downloads.md"]) {
    const source = readFileSync(join(ROOT, page), "utf8");
    const sections = [...source.matchAll(/<section\b[^>]*class="download-card"[\s\S]*?<\/section>/g)];
    assert.equal(sections.length, outputs.size, page);
    for (const [section] of sections) {
      const file = section.match(/\bhref="(?:\.\.?\/)?downloads\/([^"]+)"/)?.[1];
      assert.ok(file, `${page}: card has no download href`);
      const output = outputs.get(file);
      assert.ok(output, `${page}: unknown download ${file}`);
      assert.match(section, new RegExp(`<p>${escapeRegExp(description(file, output))}<\\/p>`));
      assert.match(section, new RegExp(`<code>${output.sha256}<\\/code>`));
    }
  }
  execFileSync(process.execPath, [join(ROOT, "scripts/sync-downloads.mjs"), "--check"], { cwd: ROOT });
});

test("PDF_PYTHON diagnostics identify an unavailable explicit interpreter", () => {
  const result = spawnSync(
    process.execPath,
    [join(ROOT, "scripts/run-pdf-build.mjs"), "--check"],
    {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, PDF_PYTHON: "/definitely/missing/life-level-up-python" },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /pypdf==6\.16\.2/);
  assert.match(result.stderr, /PDF_PYTHON 已显式指定/);
  assert.match(result.stderr, /executable does not exist/);
});
