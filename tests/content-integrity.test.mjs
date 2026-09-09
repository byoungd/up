import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import {
  contentLinkErrors,
  createMarkdownInspector,
  dateErrors,
  navigationErrors,
  resolveContentTarget,
  validCalendarDate,
} from "../scripts/content-integrity.mjs";

const docsRoot = mkdtempSync(join(tmpdir(), "content-integrity-"));
after(() => rmSync(docsRoot, { recursive: true, force: true }));
const inspect = await createMarkdownInspector(docsRoot);
const inspectFile = (file) => inspect(readFileSync(file, "utf8"), file);
const page = join(docsRoot, "chapter.md");

function write(path, content = "# Page\n") {
  const file = join(docsRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return file;
}

for (const source of ["README.md", "en/README.md", "threads/archive/README.md", "chapter.md", "en/chapter.md", "a (draft).md"]) {
  write(source);
}
write("target.md", "# Target\n## 工具与交付\n## Repeat\n## Repeat\n## Custom {#stable-id}\n<span id='inline-id'></span>\n<a name=legacy></a>\n");
write("assets/photo.webp", "fixture");
write("public/downloads/book.pdf", "fixture");
mkdirSync(join(docsRoot, "empty"));

test("Markdown references and nested destinations use the site's parser", () => {
  const content = inspect("[target][chapter]\n![A useful diagram][image]\n[draft](<a (draft).md>)\n\n[chapter]: target.md#stable-id\n[image]: assets/photo.webp \"Image title\"\n", page);
  assert.deepEqual(content.links.map(({ target }) => target), ["target.md#stable-id", "assets/photo.webp", "a%20(draft).md"]);
  assert.equal(content.images[0].alt, "A useful diagram");
  assert.deepEqual(contentLinkErrors(content, page, docsRoot, inspectFile), []);
});

test("inline code, comments and mixed fence markers do not create links", () => {
  const source = [
    "`[ignore](missing-inline.md)`",
    "<!-- <img src='missing-comment.webp'> -->",
    "````md",
    "```",
    "[ignore](missing-fence.md)",
    "~~~",
    "````",
    "[read](target.md)",
  ].join("\n");
  assert.deepEqual(inspect(source, page).links, [{ target: "target.md", line: 8 }]);
});

test("script and style raw text cannot create fake HTML links, images or anchors", () => {
  const source = [
    '<div>',
    '<script id="script-block">',
    'const sample = "<a id=ghost-link href=missing.md><img src=missing.webp>";',
    '</script>',
    '<style id="style-block">',
    'body::after { content: "<img id=ghost-image src=missing.webp>" }',
    '</style>',
    '<a id="real-link" href="target.md">Target</a>',
    '<img src="assets/photo.webp" alt="Existing photo">',
    '</div>',
  ].join("\n");
  const content = inspect(source, page);
  assert.deepEqual(content.links, [{ target: "target.md", line: 8 }, { target: "assets/photo.webp", line: 9 }]);
  assert.deepEqual(content.images, [{ alt: "Existing photo", line: 9 }]);
  assert.deepEqual([...content.anchors], ["script-block", "style-block", "real-link"]);
  assert.deepEqual(contentLinkErrors(content, page, docsRoot, inspectFile), []);
});

test("multiline HTML images validate src and preserve alt and source line", () => {
  const source = "Text\n\n<img\n src='missing.webp'\n alt='A > B diagram'\n/>\n<img src=assets/photo.webp alt='Existing photo'>\n";
  const content = inspect(source, page);
  assert.deepEqual(content.images, [{ alt: "A > B diagram", line: 3 }, { alt: "Existing photo", line: 7 }]);
  assert.deepEqual(contentLinkErrors(content, page, docsRoot, inspectFile), [
    { line: 3, message: "链接目标不存在: missing.webp" },
  ]);
});

test("site root routes, README rewrites and public downloads resolve to files", () => {
  for (const [route, source] of [
    ["/", "README.md"],
    ["/index", "README.md"],
    ["/index.html", "README.md"],
    ["/en/", "en/README.md"],
    ["/en/index.html", "en/README.md"],
    ["/threads/archive/", "threads/archive/README.md"],
    ["/chapter", "chapter.md"],
    ["/chapter.md", "chapter.md"],
    ["/chapter.html?mode=read", "chapter.md"],
    ["/downloads/book.pdf", "public/downloads/book.pdf"],
    ["/assets/photo.webp", "assets/photo.webp"],
    ["a%20(draft).md", "a (draft).md"],
  ]) {
    assert.equal(resolveContentTarget(page, route, docsRoot).file, join(docsRoot, source), route);
  }
  assert.match(resolveContentTarget(page, "empty/", docsRoot).error, /目标不存在/);
});

test("anchors include Chinese headings, duplicate slugs and explicit HTML IDs", () => {
  const content = inspectFile(join(docsRoot, "target.md"));
  for (const id of ["target", "工具与交付", "repeat", "repeat-1", "stable-id", "inline-id", "legacy"]) {
    assert.ok(content.anchors.has(id), id);
  }
  const links = inspect([
    "[zh](target.md#%E5%B7%A5%E5%85%B7%E4%B8%8E%E4%BA%A4%E4%BB%98)",
    "[duplicate](target.md#repeat-1)",
    "[explicit](target.md#stable-id)",
    "[html](target.md#inline-id)",
    "[legacy](target.md#legacy)",
    "[text fragment](target.md#repeat:~:text=Repeat)",
    "[top](#top)",
  ].join("\n"), page);
  assert.deepEqual(contentLinkErrors(links, page, docsRoot, inspectFile), []);
});

test("missing cross-page and same-page anchors are errors", () => {
  const content = inspect("[missing](target.md#removed)\n[self](#absent)\n", page);
  assert.deepEqual(contentLinkErrors(content, page, docsRoot, inspectFile), [
    { line: 1, message: "链接锚点不存在: target.md#removed" },
    { line: 2, message: "链接锚点不存在: #absent" },
  ]);
});

test("frontmatter does not generate headings and CRLF keeps line positions", () => {
  const content = inspect("---\r\ntitle: Title\r\nupdated: 2026-09-09\r\n---\r\n# Actual\r\n[missing](lost.md)\r\n", page);
  assert.deepEqual(content.headingShape, [1]);
  assert.deepEqual([...content.anchors], ["actual"]);
  assert.deepEqual(content.links, [{ target: "lost.md", line: 6 }]);
});

test("external schemes and malformed encoded URLs are handled explicitly", () => {
  for (const link of ["https://example.com/a", "mailto:reader@example.com", "tel:+1234", "ftp://example.com/a", "//example.com/a", "data:image/png;base64,AA=="]) {
    assert.equal(resolveContentTarget(page, link, docsRoot), null);
  }
  assert.match(resolveContentTarget(page, "target.md#%zz", docsRoot).error, /无效的 URL 编码/);
});

test("raw HTML cannot introduce executable or machine-local links", () => {
  const content = inspect("<a href='javascript:alert(1)'>Unsafe</a>\n<a href='file:///etc/passwd'>Local</a>\n", page);
  const errors = contentLinkErrors(content, page, docsRoot, inspectFile);
  assert.equal(errors.length, 2);
  assert.ok(errors.every(({ message }) => message.includes("可执行或本地文件协议")));
  assert.match(resolveContentTarget(page, "java\nscript:alert(1)", docsRoot).error, /可执行或本地文件协议/);
});

test("dates must exist in the calendar, including leap-day rules", () => {
  for (const date of ["2024-02-29", "2000-02-29", "2026-09-09"]) assert.ok(validCalendarDate(date), date);
  for (const date of ["2026-02-29", "2026-02-30", "1900-02-29", "2026-13-01", "2026-00-10", "2026-9-9", "invalid"]) {
    assert.equal(validCalendarDate(date), false, date);
  }
});

test("future dates are rejected for both updated and sources_checked", () => {
  const errors = dateErrors({ updated: "2026-09-10", sources_checked: "2026-09-10" }, { today: "2026-09-09" });
  assert.equal(errors.length, 2);
  assert.match(errors[0], /updated.*不能晚于/);
  assert.match(errors[1], /sources_checked.*不能晚于/);
});

test("source freshness uses complete publication dates at the 120-day boundary", () => {
  const options = { today: "2026-09-09", requireSourcesChecked: true };
  assert.deepEqual(dateErrors({ sources_checked: "2026-05-12" }, options), []);
  assert.deepEqual(dateErrors({ sources_checked: "2026-05-11" }, options), ["AI 产品资料超过 120 天未核验"]);
  assert.deepEqual(dateErrors({}, options), ["AI 页面缺少 sources_checked"]);
  assert.match(dateErrors({ sources_checked: "2026-02-30" }, options)[0], /有效的 YYYY-MM-DD/);
});

const zhNavigation = [{ items: [{ link: "/", source: "README.md" }, { link: "/chapter", source: "chapter.md" }] }];
const enNavigation = [{ items: [{ link: "/en/", source: "en/README.md" }, { link: "/en/chapter", source: "en/chapter.md" }] }];

test("bilingual navigation accepts matching source files and order", () => {
  assert.deepEqual(navigationErrors(zhNavigation, enNavigation, docsRoot), []);
});

test("navigation detects wrong destinations, duplicate routes and translation order", () => {
  const reversed = [{ items: [...enNavigation[0].items].reverse() }];
  assert.ok(navigationErrors(zhNavigation, reversed, docsRoot).some((error) => error.includes("顺序或来源不一致")));
  const mismatched = [{ items: [{ link: "/chapter", source: "README.md" }] }];
  assert.ok(navigationErrors(mismatched, enNavigation, docsRoot).some((error) => error.includes("链接与来源不一致")));
  const duplicate = [{ items: [zhNavigation[0].items[0], { link: "/", source: "README.md" }] }];
  assert.ok(navigationErrors(duplicate, enNavigation, docsRoot).some((error) => error.includes("重复路由")));
});
