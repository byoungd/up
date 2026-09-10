import assert from "node:assert/strict";
import { test } from "node:test";
import { worksheetEntries } from "../docs/.vitepress/worksheets.mjs";
import { worksheetMarkdown } from "../scripts/worksheet-markdown.mjs";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";

const entry = { source: "templates/learning-state.md", locale: "zh" };
const parse = (source) => fromMarkdown(source, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
function nodesOf(tree, type) {
  return [...(tree.type === type ? [tree] : []), ...(tree.children || []).flatMap((child) => nodesOf(child, type))];
}

test("every worksheet has an English counterpart and guidance pages remain guidance", () => {
  const zh = worksheetEntries.filter(({ locale }) => locale === "zh");
  const en = worksheetEntries.filter(({ locale }) => locale === "en");
  assert.ok(zh.length >= 20);
  assert.deepEqual(en.map(({ source }) => source), zh.map(({ source }) => `en/${source}`));
  assert.equal(new Set(worksheetEntries.map(({ name }) => name)).size, worksheetEntries.length);
  assert.ok(worksheetEntries.every(({ source }) => !/\/toolkit(?:-walkthrough)?\.md$/.test(source)));
});

test("downloads retain instructions and GFM tables while opening Markdown forms for editing", () => {
  const source = '---\ntitle: Card\nupdated: 2026-09-09\n---\n\n# Evidence\n\nKeep the original sample private.\n\n## Baseline\n\n```markdown\n# My evidence\n\n- [ ] Save first attempt\n\n| Trial | Evidence |\n| --- | --- |\n| Day 7 | |\n```\n\n```python\nprint("[example](weekly-review.md)")\n```\n';
  const result = worksheetMarkdown(source, entry);
  const tree = parse(result);
  assert.equal(result.startsWith("---"), false);
  assert.match(result, /Keep the original sample private/);
  assert.equal(nodesOf(tree, "table").length, 1);
  assert.equal(nodesOf(tree, "listItem")[0].checked, false);
  assert.equal(nodesOf(tree, "code").length, 1);
  assert.equal(nodesOf(tree, "code")[0].value, 'print("[example](weekly-review.md)")');
  assert.deepEqual(nodesOf(tree, "heading").map(({ depth }) => depth), [1, 2, 3]);
  assert.match(result, /稿件更新：2026-09-09/);
  assert.match(result, /creativecommons.org\/licenses\/by-nc\/4.0/);
});

test("portable links preserve query strings, anchors, references, and inline code", () => {
  const source = '# Card\n\n[Review](weekly-review.md?from=worksheet#next)\n\n[Guide](/en/templates/toolkit?from=copy#start)\n\n[Reference][ref]\n\n[Local](#card) and `[example](weekly-review.md)`.\n\n[ref]: ../threads/part-1/0-cefr.md "CEFR"\n';
  const result = worksheetMarkdown(source, entry);
  const tree = parse(result);
  const urls = [...nodesOf(tree, "link"), ...nodesOf(tree, "definition")].map(({ url }) => url);
  assert.ok(urls.includes("https://byoungd.github.io/up/templates/weekly-review?from=worksheet#next"));
  assert.ok(urls.includes("https://byoungd.github.io/up/en/templates/toolkit?from=copy#start"));
  assert.ok(urls.includes("https://byoungd.github.io/up/threads/part-1/0-cefr"));
  assert.ok(urls.includes("#card"));
  assert.equal(nodesOf(tree, "inlineCode")[0].value, "[example](weekly-review.md)");
});

test("English downloads have localized provenance and stable repeated output", () => {
  const source = '# State\n\n[Review](weekly-review.md)\n';
  const en = { source: "en/templates/learning-state.md", locale: "en" };
  const result = worksheetMarkdown(source, en);
  assert.match(result, /Source: \[Life Level-up Guide\]/);
  assert.match(result, /https:\/\/byoungd.github.io\/up\/en\/templates\/weekly-review/);
  assert.equal(worksheetMarkdown(source, en), result);
});

test("separate fill-in fields do not collapse into a single rendered paragraph", () => {
  const result = worksheetMarkdown('# Card\n\n```markdown\nCurrent evidence:\nNext task:\nReview date:\n```\n', entry);
  assert.equal(nodesOf(parse(result), "break").length, 2);
  assert.match(result, /Current evidence:/);
  assert.match(result, /Review date:/);
});
