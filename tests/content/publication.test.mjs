import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  enNavigation,
  publicationChapterCount,
  publicationSections,
  zhNavigation,
} from "../../docs/.vitepress/navigation.mjs";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "../../docs");
const sources = (sections) => sections.flatMap(({ items }) => items.map(({ source }) => source));
const unprefixed = (source) => source.replace(/^en\//, "");
const opening = [
  "threads/part-0/copyright.md",
  "threads/part-0/prologue.md",
  "threads/part-0/reader-guide.md",
  "threads/part-0/for-whom.md",
  "threads/part-0/roadmap.md",
];
const introductions = [
  "threads/part-2/return-to-life.md",
  "threads/part-1/open-input.md",
  "threads/part-3/amplify-ability.md",
  "threads/part-4/practice-and-recovery.md",
  "threads/part-5/long-term-action.md",
];

function markdownFiles(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if ([".vitepress", "assets", "public"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) markdownFiles(path, output);
    else if (entry.name.endsWith(".md")) output.push(relative(DOCS, path).replaceAll("\\", "/"));
  }
  return output;
}

// Derive coverage from source files, independently of publication flags.
// This fails when an eligible chapter is omitted from navigation or misclassified.
const bookFiles = markdownFiles(DOCS).filter((source) =>
  /^(?:threads\/(?:part-[0-6]|practice)\/|templates\/|reference\/|(?:projects|practice)\.md$)/.test(unprefixed(source)),
);

for (const [language, navigation, labels] of [
  ["zh", zhNavigation, { frontMatter: "开卷", appendices: "附录" }],
  ["en", enNavigation, { frontMatter: "Opening", appendices: "Appendices" }],
]) {
  test(`${language}: publication includes every book and practice source exactly once`, () => {
    const actual = sources(publicationSections(navigation));
    const expected = bookFiles.filter((source) => source.startsWith("en/") === (language === "en"));
    assert.deepEqual([...actual].sort(), [...expected].sort());
    assert.equal(new Set(actual).size, actual.length, "a chapter must not be published twice");
    assert.equal(publicationChapterCount(navigation), expected.length);
    assert.ok(actual.every((source) => !/^(?:README\.md$|threads\/(?:archive|word-list)\/)/.test(unprefixed(source))));
  });

  test(`${language}: opening precedes six parts, afterword, then reference and practice appendices`, () => {
    const sections = publicationSections(navigation, labels);
    assert.equal(sections.length, 9);
    assert.equal(sections[0].text, labels.frontMatter);
    assert.equal(sections.at(-1).text, labels.appendices);
    assert.deepEqual(sources([sections[0]]).map(unprefixed), opening);
    const bodySections = sections.slice(1, -1);
    assert.equal(bodySections.length, 7);
    assert.deepEqual(bodySections.slice(0, 5).map(({ items }) => unprefixed(items[0].source)), introductions);
    assert.deepEqual(bodySections.slice(0, 5).map(({ text }) => text), language === "zh" ? [
      "第一部：把自己放回生活", "第二部：重新学习，打开输入", "第三部：借工具放大能力",
      "第四部：实践与恢复", "第五部：行动与长期改变",
    ] : [
      "Part I: Return to Life", "Part II: Learning Again, Opening Input", "Part III: Amplify Ability",
      "Part IV: Practice and Recovery", "Part V: Long-Term Action",
    ]);
    const partSix = bodySections.at(-2);
    assert.match(partSix.text, language === "zh" ? /^第六部/ : /^Part VI/);
    assert.ok(partSix.items.length >= 1);
    assert.ok(partSix.items.every(({ source }) => {
      const normalized = unprefixed(source);
      return normalized.startsWith("threads/part-6/") && normalized !== "threads/part-6/afterword.md";
    }));
    assert.equal(bodySections.at(-1).text, language === "zh" ? "后记" : "Afterword");
    assert.deepEqual(sources([bodySections.at(-1)]).map(unprefixed), ["threads/part-6/afterword.md"]);
    const appendixSources = sources([sections.at(-1)]).map(unprefixed);
    assert.deepEqual(appendixSources.slice(0, 3), [
      "reference/glossary.md", "reference/sources-and-citation.md", "reference/bibliography.md",
    ]);
    assert.deepEqual(appendixSources.slice(-6), [
      "threads/practice/ai-evaluation.md", "threads/part-5/book-as-proof.md", "projects.md",
      "threads/part-3/2-ai-development-and-resource-layer.md", "threads/practice/resource-layer-business.md",
      "reference/reading-map.md",
    ]);
    assert.deepEqual(appendixSources, [
      "reference/glossary.md", "reference/sources-and-citation.md", "reference/bibliography.md",
      "templates/toolkit.md", "templates/toolkit-walkthrough.md", "templates/evidence-chain.md",
      "templates/reader-field-note.md", "templates/family-learning-agreement.md", "templates/learning-state.md",
      "templates/rhythm-ledger.md", "templates/weekly-review.md", "templates/english-diagnostic.md",
      "templates/interview-evidence.md", "templates/grammar-evidence.md", "templates/vocabulary-audit.md",
      "templates/listening-audit.md", "templates/reading-evidence.md", "templates/speaking-evidence.md",
      "templates/writing-evidence.md", "templates/90-day-cycle.md", "templates/artifact-brief.md",
      "templates/ai-task-brief.md", "templates/ai-trend-radar.md", "templates/ai-learning-log.md",
      "templates/ai-case-review.md", "templates/ai-project-scorecard.md", "templates/startup-experiment.md",
      "templates/consistency-plan.md", "templates/ai-evaluation.md", "templates/life-practice-toolkit.md",
      "practice.md", "threads/practice/customer-discovery.md", "threads/practice/sustainable-business.md",
      "threads/practice/discipline-and-consistency.md", "threads/practice/ai-workflows.md",
      "threads/practice/ai-evaluation.md", "threads/part-5/book-as-proof.md", "projects.md",
      "threads/part-3/2-ai-development-and-resource-layer.md", "threads/practice/resource-layer-business.md",
      "reference/reading-map.md",
    ]);
  });

  test(`${language}: moving or adding non-publication groups cannot change the book`, () => {
    const baseline = publicationSections(navigation, labels);
    const published = navigation.filter(({ publication }) => publication);
    const extras = navigation.filter(({ publication }) => !publication).reverse();
    const newGroup = { text: "Website-only announcement", items: [{ text: "News", link: "/news", source: "news.md" }] };
    const moved = [extras[0], published[0], newGroup, ...published.slice(1, 4), ...extras.slice(1), ...published.slice(4)];
    assert.deepEqual(publicationSections(moved, labels), baseline);
    assert.equal(publicationChapterCount(moved), publicationChapterCount(navigation));
  });

  test(`${language}: semantic roles work away from fixed positions and preserve body order`, () => {
    const front = navigation.find(({ publication }) => publication === "frontmatter");
    const body = navigation.filter(({ publication }) => publication === "body");
    const appendices = navigation.filter(({ publication }) => publication === "appendix");
    const extras = navigation.filter(({ publication }) => !publication);
    const reorderedBody = [body[2], body[0], body[1], ...body.slice(3)];
    const moved = [...extras, appendices[0], ...reorderedBody, ...appendices.slice(1), front];
    const sections = publicationSections(moved, labels);
    assert.deepEqual(sources([sections[0]]).map(unprefixed), opening);
    assert.deepEqual(sections.slice(1, -1).map(({ text }) => text), reorderedBody.map(({ text }) => text));
    assert.deepEqual(sources(sections.slice(1, -1)), sources(reorderedBody));
    assert.deepEqual([...sources(sections)].sort(), [...sources(publicationSections(navigation))].sort());
  });
}

test("published Chinese and English sources have identical chapter order", () => {
  assert.deepEqual(
    sources(publicationSections(enNavigation)).map(unprefixed),
    sources(publicationSections(zhNavigation)),
  );
});

test("publication fails explicitly if its opening group is missing", () => {
  assert.throws(
    () => publicationSections(zhNavigation.filter(({ publication }) => publication !== "frontmatter")),
    /requires a frontmatter group/,
  );
});
