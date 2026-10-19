import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  calendarDate,
  bilingualMetadataProblems,
  frontmatterProblems,
  linkProblems,
  navigationProblems,
  parseFrontmatter,
  publicationDate,
  requiresSourceReview,
} from "../../scripts/lib/content-checks.mjs";
import { repositoryReadmeFromDocs } from "../../scripts/lib/readme.mjs";

const NOW = Date.parse("2026-09-19T04:00:00Z");
const metadata = (extra = "") => `---\ntitle: Example\ndescription: A sufficiently specific description of this example page.\nupdated: 2026-09-19\n${extra}---\n`;

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "guide-content-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const docs = join(root, "docs");
  for (const file of files) {
    const path = join(docs, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "fixture");
  }
  return docs;
}

test("calendar dates reject overflow, malformed values and missing values", () => {
  for (const value of ["2026-02-29", "2026-02-31", "2026-13-01", "2026-9-19", "not-a-date", undefined]) {
    assert.equal(calendarDate(value), null, value);
  }
  assert.equal(calendarDate("2024-02-29"), Date.parse("2024-02-29T00:00:00Z"));
});

test("frontmatter accepts CRLF and quoted dates", () => {
  const text = metadata("sources_checked: '2026-09-19'\n").replaceAll("\n", "\r\n");
  assert.equal(parseFrontmatter(text).sources_checked, "2026-09-19");
  assert.deepEqual(frontmatterProblems(text, "threads/part-3/ai-new-chapter.md", NOW), []);
});

test("new bilingual AI chapters automatically require a source review date", () => {
  for (const source of ["threads/practice/ai-workflows.md", "en/threads/practice/ai-evaluation.md", "en/threads/part-1/7-ai.md"]) {
    assert.equal(requiresSourceReview(source), true);
    assert.ok(frontmatterProblems(metadata(), source, NOW).includes("AI 页面缺少 sources_checked"));
  }
  assert.equal(requiresSourceReview("templates/ai-task-brief.md"), false);
  assert.equal(requiresSourceReview("threads/part-3/3-attention-and-judgment.md"), false);
});

test("publication dates follow Shanghai midnight rather than UTC midnight", () => {
  const eveningUtc = Date.parse("2026-09-18T16:30:00Z");
  assert.equal(publicationDate(eveningUtc), "2026-09-19");
  assert.deepEqual(frontmatterProblems(metadata(), "projects.md", eveningUtc), []);
  assert.ok(frontmatterProblems(metadata(), "projects.md", eveningUtc - 3600000).some((message) => message.includes("Asia/Shanghai")));
});

test("any declared source review is checked, with an inclusive 120-day boundary", () => {
  const atBoundary = new Date(Date.parse("2026-09-19") - 120 * 86400000).toISOString().slice(0, 10);
  const tooOld = new Date(Date.parse("2026-09-19") - 121 * 86400000).toISOString().slice(0, 10);
  assert.deepEqual(frontmatterProblems(metadata(`sources_checked: ${atBoundary}\n`), "projects.md", NOW), []);
  assert.ok(frontmatterProblems(metadata(`sources_checked: ${tooOld}\n`), "projects.md", NOW).some((message) => message.includes("120 天")));
});

test("source review interval supports faster checks for volatile AI information", () => {
  const old = new Date(Date.parse("2026-09-19") - 31 * 86400000).toISOString().slice(0, 10);
  const text = metadata(`sources_checked: ${old}\nsource_review_interval: 30\n`);
  assert.ok(frontmatterProblems(text, "projects.md", NOW).some((message) => message.includes("30 天")));
  assert.ok(frontmatterProblems(metadata("source_review_interval: 45\n"), "projects.md", NOW).some((message) => message.includes("30、60 或 120")));
});

test("bilingual AI metadata keeps source dates and review intervals aligned", () => {
  const chinese = metadata("sources_checked: 2026-09-19\nsource_review_interval: 30\n");
  const english = metadata("sources_checked: 2026-09-19\nsource_review_interval: 60\n");
  assert.deepEqual(bilingualMetadataProblems(chinese, english), [
    "中英文稿件 source_review_interval 不一致: 30 vs 60",
  ]);
  assert.ok(bilingualMetadataProblems(chinese, metadata()).some((message) => message.includes("sources_checked 不一致")));
});

test("updated and sources_checked reject impossible and future dates", () => {
  for (const key of ["updated", "sources_checked"]) {
    for (const value of ["2026-02-31", "2026-09-20"]) {
      const text = key === "updated" ? metadata().replace("2026-09-19", value) : metadata(`${key}: ${value}\n`);
      const problems = frontmatterProblems(text, "projects.md", NOW);
      assert.ok(problems.some((message) => message.startsWith(key)), `${key}: ${value}`);
    }
  }
});

test("topic metadata requires controlled schema, intent, sharing alt, and localized description length", () => {
  const zh = metadata(`topic: english-learning\nintent: diagnostic\nschema: HowTo\nsocialImage: assets/feature.png\nsocialImageAlt: English learning guide cover\n`);
  const en = metadata(`topic: english-learning\nintent: diagnostic\nschema: HowTo\nsocialImage: assets/feature-en.png\nsocialImageAlt: English learning guide cover\n`);
  assert.ok(frontmatterProblems(zh, "topics/english.md", NOW).some((message) => message.includes("60-100")));
  assert.ok(frontmatterProblems(en, "en/topics/english.md", NOW).some((message) => message.includes("120-155")));
  assert.ok(frontmatterProblems(metadata(`topic: english-learning\nintent: diagnostic\nschema: Invalid\n`), "topics/english.md", NOW).some((message) => message.includes("schema 必须")));
});

test("clean routes, rewritten indexes and public assets resolve correctly", (t) => {
  const docs = fixture(t, ["README.md", "en/README.md", "threads/archive/README.md", "chapter.md", "assets/图 (1).png", "public/social.png"]);
  const text = `[Home](/) [English](/en/) [Archive](/threads/archive/) [Chapter](/chapter.html?view=1#heading)
[Index](/en/index.html) [Markdown](/chapter.md)
![Landscape illustration](/assets/%E5%9B%BE%20%281%29.png)
![Social](/social.png)
![Parentheses](<assets/图 (1).png>)`;
  assert.deepEqual(linkProblems(text, join(docs, "README.md"), docs), []);
});

test("HTML images validate multiline src and srcset destinations and preserve line numbers", (t) => {
  const docs = fixture(t, ["README.md", "assets/existing.png"]);
  const text = `Intro\n\n<img\n src="/assets/missing.png"\n alt="A useful description"\n srcset="/assets/existing.png 1x, /assets/missing-2x.png 2x"\n>`;
  const problems = linkProblems(text, join(docs, "README.md"), docs);
  assert.equal(problems.length, 2);
  assert.ok(problems.every((problem) => problem.line === 3));
  assert.match(problems[0].message, /missing\.png/);
  assert.match(problems[1].message, /missing-2x\.png/);
});

test("HTML image src must not be empty or whitespace", (t) => {
  const docs = fixture(t, ["README.md"]);
  const text = '<img src="" alt="Book cover">\n<img src="   " alt="Book cover">';
  assert.deepEqual(linkProblems(text, join(docs, "README.md"), docs), [
    { line: 1, message: "HTML 图片 src 不得为空" },
    { line: 2, message: "HTML 图片 src 不得为空" },
  ]);
});

test("an image link checks both the image and the outer destination exactly once", (t) => {
  const docs = fixture(t, ["README.md", "assets/cover.png", "chapter.md"]);
  const text = '[![Book cover](assets/cover.png)](missing-page.md)\n[![Missing cover](assets/missing.png)](chapter.md)\n[Ordinary link](other-missing.md)';
  assert.deepEqual(linkProblems(text, join(docs, "README.md"), docs).sort((a, b) => a.line - b.line), [
    { line: 1, message: "链接目标不存在: missing-page.md" },
    { line: 2, message: "链接目标不存在: assets/missing.png" },
    { line: 3, message: "链接目标不存在: other-missing.md" },
  ]);
  assert.deepEqual(linkProblems('[![Book cover](assets/cover.png)](chapter.md)', join(docs, "README.md"), docs), []);
  assert.ok(linkProblems('[![](assets/cover.png)](chapter.md)', join(docs, "README.md"), docs).some(({ message }) => message.includes("alt")));
});

test("relative public download and image URLs resolve from either language", (t) => {
  const docs = fixture(t, ["README.md", "en/README.md", "public/downloads/guide.epub", "public/social.png"]);
  const zh = '<a href="./downloads/guide.epub">Download</a> ![Book cover](social.png)';
  const en = '<a href="../downloads/guide.epub">Download</a> ![Book cover](../social.png)';
  assert.deepEqual(linkProblems(zh, join(docs, "README.md"), docs), []);
  assert.deepEqual(linkProblems(en, join(docs, "en/README.md"), docs), []);
});

test("images cannot resolve to Markdown pages, empty directories or empty alt text", (t) => {
  const docs = fixture(t, ["README.md", "chapter.md", "assets/existing.png"]);
  mkdirSync(join(docs, "empty"));
  const problems = linkProblems("![Page](chapter) [Empty](empty/) ![](assets/existing.png) <img src='assets/existing.png' alt='  '>", join(docs, "README.md"), docs);
  assert.equal(problems.length, 4);
  assert.ok(problems.some(({ message }) => message.includes("chapter")));
  assert.ok(problems.some(({ message }) => message.includes("empty/")));
});

test("upstream alt quality and English-language rules remain enforced", (t) => {
  const docs = fixture(t, ["en/README.md", "assets/existing.png"]);
  const text = '![photo](/assets/existing.png) <img src="/assets/existing.png" alt="一棵树">';
  const problems = linkProblems(text, join(docs, "en/README.md"), docs);
  assert.ok(problems.some(({ message }) => message.includes("过于泛化")));
  assert.ok(problems.some(({ message }) => message.includes("不应包含中文")));
});

test("reference definitions and images are checked including undefined references", (t) => {
  const docs = fixture(t, ["README.md"]);
  const problems = linkProblems("[Read][guide]\n![Cover][picture]\n[Unknown][missing]\n[guide]: missing.md\n[picture]: assets/missing.png", join(docs, "README.md"), docs);
  assert.ok(problems.some(({ message }) => message.includes("missing.md")));
  assert.ok(problems.some(({ message }) => message.includes("assets/missing.png")));
  assert.ok(problems.some(({ message }) => message === "链接引用未定义: missing"));
});

test("code examples, comments and longer fences do not create link diagnostics", (t) => {
  const docs = fixture(t, ["README.md"]);
  const text = "`[inline](missing.md)`\n<!-- <img src='missing.png'> -->\n````markdown\n```\n[example](missing.md)\n```\n````\n~~~markdown\n[another](missing.md)\n~~~\n[Real](real-missing.md)";
  const problems = linkProblems(text, join(docs, "README.md"), docs);
  assert.deepEqual(problems, [{ line: 11, message: "链接目标不存在: real-missing.md" }]);
});

test("escaped and balanced parentheses remain part of destinations", (t) => {
  const docs = fixture(t, ["README.md", "chapter(one).md"]);
  assert.deepEqual(linkProblems("[Read](chapter(one).md) [Read](chapter\\(one\\).md)", join(docs, "README.md"), docs), []);
});

test("angle destinations with titles and empty image sources cannot bypass validation", (t) => {
  const docs = fixture(t, ["README.md"]);
  const problems = linkProblems('[Missing](<missing page.md> "Readable title") ![Cover]()', join(docs, "README.md"), docs);
  assert.equal(problems.length, 2);
  assert.ok(problems.some(({ message }) => message.includes("missing page.md")));
  assert.ok(problems.some(({ message }) => message === "图片缺少目标路径"));
});

const page = (source, link = `/${source.replace(/\.md$/, "")}`) => ({ source, link, text: source });
const groups = (...items) => [{ text: "Group", items }];

test("navigation accepts directory homepages and matching translation paths", (t) => {
  const sources = ["README.md", "en/README.md", "threads/part-2/my-story.md", "en/threads/part-2/my-story.md", "threads/archive/README.md", "en/threads/archive/README.md"];
  const docs = fixture(t, sources);
  const zh = groups(page("README.md", "/"), page(sources[2]), page(sources[4], "/threads/archive/"));
  const en = groups(page("en/README.md", "/en/"), page(sources[3]), page(sources[5], "/en/threads/archive/"));
  assert.deepEqual(navigationProblems(zh, en, docs), []);
});

test("navigation catches broken source/route pairs", (t) => {
  const sources = ["first.md", "en/first.md", "second.md", "en/second.md"];
  const docs = fixture(t, sources);
  const problems = navigationProblems(groups(page("first.md", "/second")), groups(page("en/first.md")), docs);
  assert.ok(problems.some((message) => message.includes("导航路由与源文件不匹配: /second")));
});

test("navigation catches bilingual reordering, group mismatch and duplicates", (t) => {
  const sources = ["first.md", "en/first.md", "second.md", "en/second.md"];
  const docs = fixture(t, sources);
  const zh = groups(page("first.md"), page("second.md"));
  const reordered = groups(page("en/second.md"), page("en/first.md"));
  assert.ok(navigationProblems(zh, reordered, docs).some((message) => message.includes("顺序不一致")));
  assert.ok(navigationProblems(zh, [], docs).some((message) => message.includes("分组数量不一致")));
  const duplicated = groups(page("first.md"), page("first.md"));
  assert.ok(navigationProblems(duplicated, reordered, docs).some((message) => message.includes("导航页面重复")));
});

test("the README mirror transforms practice and preserves suffixes without duplicate extensions", () => {
  const source = '中文 | [English](en/)\n[Start](practice.md#today) [Projects](projects.md)\n<a href="./practice.md#today">Start</a>\n<a href="./threads/chapter.md?lang=zh#practice">Read</a>';
  const expected = '中文 | [English](docs/en/README.md)\n[Start](docs/practice.md#today) [Projects](docs/projects.md)\n<a href="./docs/practice.md#today">Start</a>\n<a href="./docs/threads/chapter.md?lang=zh#practice">Read</a>';
  assert.equal(repositoryReadmeFromDocs(source), expected);
});

test("the README mirror preserves upstream reference and download handling", () => {
  const source = '[Glossary](reference/glossary.md) <a href="./downloads/guide.epub">Download</a>';
  assert.equal(repositoryReadmeFromDocs(source), '[Glossary](docs/reference/glossary.md) <a href="./docs/public/downloads/guide.epub">Download</a>');
});
