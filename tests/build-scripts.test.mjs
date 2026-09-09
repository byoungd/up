import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t, script) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "life-guide-script-test-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, content) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  mkdirSync(join(root, "scripts"));
  copyFileSync(join(ROOT, "scripts", script), join(root, "scripts", script));
  const run = (args = [], env = {}) => spawnSync(process.execPath, [join(root, "scripts", script), ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 30_000,
  });
  return { root, write, run };
}

test("README check reports a missing mirror and sync recreates its repository links", (t) => {
  const { root, write, run } = fixture(t, "sync-readme.mjs");
  write("docs/README.md", '中文 | [English](en/)\n[Guide](threads/guide.md)\n<a href="./downloads/book.pdf">PDF</a>\n');
  const checked = run(["--check"]);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /未与 docs\/README.md 同步/);
  assert.equal(existsSync(join(root, "README.md")), false);
  const synced = run();
  assert.equal(synced.status, 0, synced.stderr);
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, /\[English\]\(docs\/en\/README.md\)/);
  assert.match(readme, /\[Guide\]\(docs\/threads\/guide.md\)/);
  assert.match(readme, /href="\.\/docs\/public\/downloads\/book.pdf"/);
  assert.equal(run(["--check"]).status, 0);
});

function navigationFixture(t) {
  const fixtureState = fixture(t, "sync-navigation.mjs");
  fixtureState.write("docs/README.md", "# 中文\n");
  fixtureState.write("docs/en/README.md", "# English\n");
  return fixtureState;
}

test("navigation sync recreates deleted summaries without check mode writing files", (t) => {
  const { root, write, run } = navigationFixture(t);
  write("docs/.vitepress/navigation.mjs", `
export const zhNavigation = [{ text: "中文", items: [{ text: "首页", link: "/", source: "README.md" }] }];
export const enNavigation = [{ text: "English", items: [{ text: "Home", link: "/en/", source: "en/README.md" }] }];
`);
  const checked = run(["--check"]);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /导航文件未同步/);
  for (const path of ["SUMMARY.md", "docs/SUMMARY.md", "docs/en/SUMMARY.md"]) {
    assert.equal(existsSync(join(root, path)), false);
  }
  const synced = run();
  assert.equal(synced.status, 0, synced.stderr);
  assert.equal(run(["--check"]).status, 0);
  assert.match(readFileSync(join(root, "docs/en/SUMMARY.md"), "utf8"), /\[Home\]\(README.md\)/);
});

test("navigation rejects a chapter listed twice under different routes", (t) => {
  const { write, run } = navigationFixture(t);
  write("docs/.vitepress/navigation.mjs", `
export const zhNavigation = [{ text: "中文", items: [
  { text: "首页", link: "/", source: "README.md" },
  { text: "重复", link: "/duplicate", source: "README.md" }
] }];
export const enNavigation = [{ text: "English", items: [{ text: "Home", link: "/en/", source: "en/README.md" }] }];
`);
  const checked = run(["--check"]);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /重复 source: README.md/);
});

test("word-list sync preserves an editor's update date in both editions", (t) => {
  const { root, write, run } = fixture(t, "sync-word-lists.mjs");
  write("docs/threads/word-list/Java.md", "---\nupdated: 2026-09-09\n---\n\n# Java\n\n- interface\n");
  const checked = run(["--check"]);
  assert.equal(checked.status, 1);
  assert.equal(existsSync(join(root, "docs/en")), false);
  const synced = run();
  assert.equal(synced.status, 0, synced.stderr);
  for (const prefix of ["docs", "docs/en"]) {
    assert.match(readFileSync(join(root, prefix, "threads/word-list/Java.md"), "utf8"), /updated: 2026-09-09/);
  }
  assert.equal(run(["--check"]).status, 0);
});

test("brand asset check leaves a missing output directory untouched", (t) => {
  const { root, write, run } = fixture(t, "sync-public-assets.mjs");
  symlinkSync(join(ROOT, "node_modules"), join(root, "node_modules"), "dir");
  for (const name of ["logo.svg", "feature.svg", "feature-en.svg", "cover-portrait.svg", "cover-portrait-en.svg"]) {
    write(`docs/assets/${name}`, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />');
  }
  const checked = run(["--check"]);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /PNG 不存在/);
  assert.equal(existsSync(join(root, "docs/public")), false);

  write("docs/public/assets/brand-assets.json", "null\n");
  const corruptManifest = run(["--check"]);
  assert.equal(corruptManifest.status, 1);
  assert.match(corruptManifest.stderr, /brand-assets.json: 品牌资源未同步/);
  assert.doesNotMatch(corruptManifest.stderr, /TypeError/);
});

test("bundle check explains missing build output", (t) => {
  const { run } = fixture(t, "check-build-size.mjs");
  const checked = run();
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /run npm run docs:build/);
  assert.doesNotMatch(checked.stderr, /ENOENT/);
});

test("bundle budgets handle a vector-only site and still reject oversized chunks", (t) => {
  const { root, write, run } = fixture(t, "check-build-size.mjs");
  mkdirSync(join(root, "docs/assets"), { recursive: true });
  for (const name of ["@localSearchIndexroot.js", "@localSearchIndexen.js", "framework.js", "VPLocalSearchBox.js", "theme.js"]) {
    write(`docs/.vitepress/dist/assets/chunks/${name}`, "export {};\n");
  }
  const checked = run();
  assert.equal(checked.status, 0, checked.stderr);
  write("docs/.vitepress/dist/assets/chunks/theme.js", "x".repeat(70_001));
  const oversized = run();
  assert.equal(oversized.status, 1);
  assert.match(oversized.stderr, /theme: budget exceeded/);
});

test("bundle budgets reject unexpectedly large SSR HTML pages", (t) => {
  const { root, write, run } = fixture(t, "check-build-size.mjs");
  mkdirSync(join(root, "docs/assets"), { recursive: true });
  for (const name of ["@localSearchIndexroot.js", "@localSearchIndexen.js", "framework.js", "VPLocalSearchBox.js", "theme.js"]) {
    write(`docs/.vitepress/dist/assets/chunks/${name}`, "export {};\n");
  }
  write("docs/.vitepress/dist/index.html", "<html>ok</html>\n");
  assert.equal(run().status, 0);
  write("docs/.vitepress/dist/large/index.html", "x".repeat(150_001));
  const oversized = run();
  assert.equal(oversized.status, 1);
  assert.match(oversized.stderr, /SSR HTML budget exceeded/);
});

test("an invalid explicit PDF interpreter fails without silently falling back", (t) => {
  const { root, run } = fixture(t, "run-pdf-build.mjs");
  const checked = run(["--check"], { PDF_PYTHON: join(root, "missing-python") });
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /PDF_PYTHON 已显式指定/);
  assert.match(checked.stderr, /executable does not exist/);
});

test("PDF wrapper passes check flags and deterministic environment to the selected interpreter", (t) => {
  const { root, write, run } = fixture(t, "run-pdf-build.mjs");
  const python = join(root, "fake-python");
  const log = join(root, "invocation.json");
  write("fake-python", `#!${process.execPath}
const fs = require("node:fs");
if (process.argv[2] === "-c") process.exit(0);
fs.writeFileSync(process.env.PDF_TEST_LOG, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd(), hash: process.env.PYTHONHASHSEED, epoch: process.env.SOURCE_DATE_EPOCH, timezone: process.env.TZ }));
process.exit(7);
`);
  // A shell-free executable stub keeps this regression independent of Python dependencies.
  chmodSync(python, 0o755);
  const checked = run(["--check-exact"], { PDF_PYTHON: python, PDF_TEST_LOG: log });
  assert.equal(checked.status, 7);
  assert.deepEqual(JSON.parse(readFileSync(log, "utf8")), {
    args: [join(root, "scripts/build-pdf.py"), "--check-exact"],
    cwd: root,
    hash: "0",
    epoch: "946684800",
    timezone: "UTC",
  });
});
