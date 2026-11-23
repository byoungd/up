import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { extractExternalLinks } from "../../scripts/extract-external-links.mjs";

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "external-links-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  for (const [path, content] of Object.entries(files)) {
    writeFileSync(join(root, path), content);
  }
  return root;
}

test("inline code, fenced code, and HTML comments do not produce links", () => {
  const root = fixture({
    "docs/page.md": [
      "Attribution should link to `https://github.com/byoungd/up` and name the source.",
      "An HTML comment <!-- https://hidden.example.com/secret --> stays hidden.",
      "```text",
      "https://fenced.example.com/not-a-link",
      "```",
    ].join("\n"),
  });
  const links = extractExternalLinks(root);
  assert.equal(links.size, 0);
});

test("Markdown, HTML, and bare links are extracted once per location", () => {
  const root = fixture({
    "docs/page.md": [
      "[Docs](https://example.com/docs)",
      '<a href="https://example.com/html">HTML</a>',
      "Bare https://example.com/bare and repeated https://example.com/bare.",
    ].join("\n"),
    "docs/other.md": "[Docs again](https://example.com/docs)",
  });
  const links = extractExternalLinks(root);
  assert.deepEqual([...links.keys()].sort(), [
    "https://example.com/bare",
    "https://example.com/docs",
    "https://example.com/html",
  ]);
  assert.deepEqual(links.get("https://example.com/bare"), ["docs/page.md:3"]);
  assert.deepEqual([...links.get("https://example.com/docs")].sort(), ["docs/other.md:1", "docs/page.md:1"]);
});

test("an inline-code URL with punctuation is never mangled into a request path", () => {
  const root = fixture({
    "docs/page.md": "Keep `https://github.com/byoungd/up` readable, but do not fetch it.",
  });
  const links = extractExternalLinks(root);
  assert.equal(links.size, 0);
  assert.ok(![...links.keys()].some((url) => url.includes("%60")));
});
