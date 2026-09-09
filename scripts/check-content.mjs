#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { enNavigation, zhNavigation } from "../docs/.vitepress/navigation.mjs";
import { contentLinkErrors, createMarkdownInspector, dateErrors, navigationErrors } from "./content-integrity.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const errors = [];
const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  ".cache",
  ".codex-artifact-work",
  "outputs",
  "playwright-report",
  "test-results",
]);
const PUBLIC_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const PUBLIC_ASSET_EXTENSIONS = new Set([...PUBLIC_IMAGE_EXTENSIONS, ".svg"]);
const TEXT_SOURCE_EXTENSIONS = new Set([".md", ".mjs", ".mts", ".ts", ".css"]);
const FORBIDDEN_TRACKED_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const PUBLICATION_TIME_ZONE = "Asia/Shanghai";

function dateInTimeZone(timeZone) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

const publicationToday = dateInTimeZone(PUBLICATION_TIME_ZONE);

function addError(file, line, message) {
  errors.push({ file: relative(ROOT, file), line, message });
}

function walk(dir, extensions, output = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, extensions, output);
    else if (extensions.has(extname(name).toLowerCase())) output.push(path);
  }
  return output;
}

const inspectMarkdown = await createMarkdownInspector(DOCS);
const inspectedFiles = new Map();

function inspectFile(file) {
  if (!inspectedFiles.has(file)) {
    try {
      inspectedFiles.set(file, inspectMarkdown(readFileSync(file, "utf8"), file));
    } catch (error) {
      addError(file, 1, `Markdown 无法解析: ${error.message}`);
      inspectedFiles.set(file, { links: [], images: [], anchors: new Set(), headingShape: [] });
    }
  }
  return inspectedFiles.get(file);
}

const GENERIC_ALT = new Set(["image", "img", "photo", "picture", "hotel", "图片", "照片", "图"]);

function checkAltText(file, line, alt) {
  if (!alt?.trim()) {
    addError(file, line, "图片缺少有意义的 alt 文本");
    return;
  }
  if (GENERIC_ALT.has(alt.trim().toLowerCase())) {
    addError(file, line, `图片 alt 过于泛化: "${alt.trim()}"`);
  }
  if (file.startsWith(`${join(DOCS, "en")}${sep}`) && /[\u3400-\u9fff]/.test(alt)) {
    addError(file, line, "英文页面图片 alt 不应包含中文字符");
  }
}

function checkLinksAndAlt(file) {
  const content = inspectFile(file);
  for (const { alt, line } of content.images) checkAltText(file, line, alt);
  for (const { line, message } of contentLinkErrors(content, file, DOCS, inspectFile)) {
    addError(file, line, message);
  }
}

function parseFrontmatter(file) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const block = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!block) return null;
  const values = {};
  for (const line of block[1].split("\n")) {
    const match = line.match(/^([a-zA-Z][\w-]*):\s*(.+)$/);
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

function checkFrontmatter(file) {
  if (file.endsWith("SUMMARY.md")) return;
  const text = readFileSync(file, "utf8");
  const rawBlock = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (rawBlock) {
    rawBlock.split("\n").forEach((line, index) => {
      const value = line.match(/^[a-zA-Z][\w-]*:\s*(.+)$/)?.[1]?.trim();
      if (value && !/^['"]/.test(value) && /:\s/.test(value)) {
        addError(file, index + 2, "frontmatter 含冒号的文本值必须使用引号");
      }
    });
  }
  const frontmatter = parseFrontmatter(file);
  if (!frontmatter) {
    addError(file, 1, "公开页面缺少 frontmatter");
    return;
  }
  for (const key of ["title", "description", "updated"]) {
    if (!frontmatter[key]) addError(file, 1, `frontmatter 缺少 ${key}`);
  }
  const requireSourcesChecked = /\/(7-ai|1-ai-learning|2-ai-development-and-resource-layer)\.md$/.test(file);
  for (const message of dateErrors(frontmatter, { today: publicationToday, requireSourcesChecked })) {
    addError(file, 1, message);
  }
  if (frontmatter.description && frontmatter.description.length < 24) {
    addError(file, 1, "description 过短，无法区分页面内容");
  }
}

function checkManualBookPager(file) {
  const source = relative(DOCS, file).split(sep).join("/");
  const isBookPage = /^(?:en\/)?threads\/part-[0-6]\//.test(source) || /^(?:en\/)?projects\.md$/.test(source);
  if (!isBookPage) return;

  const manualPager = /^(?:(?:上一篇|下一篇|下一部|返回首页)[：:]|(?:Prev|Previous|Next|Next Part|Back to the home page):)/;
  readFileSync(file, "utf8").split("\n").forEach((line, index) => {
    if (manualPager.test(line.trim())) {
      addError(file, index + 1, "主书稿正文不得手写上一篇/下一篇；连续阅读由统一页脚生成");
    }
  });
}

function checkPartOneClosing(file) {
  const source = relative(DOCS, file).split(sep).join("/");
  const match = source.match(/^(en\/)?threads\/part-1\/(0-cefr|grammar|[1-7]-.+)\.md$/);
  if (!match) return;

  const headings = [...readFileSync(file, "utf8").matchAll(/^## (.+)$/gm)].map((heading) => heading[1]);
  const expected = match[1] ? /^Closing(?:[:：]|$)/ : /^结语[：:]/;
  if (!expected.test(headings.at(-1) || "")) {
    addError(file, 1, "第一部核心章节必须以双语结语收束，不能停在量表、来源或训练清单");
  }
}

function checkKeyLiteraryClosing(file) {
  const source = relative(DOCS, file).split(sep).join("/");
  const expectedClosings = new Map([
    ["threads/part-2/my-story.md", /^结语：重来不是凯旋$/],
    ["en/threads/part-2/my-story.md", /^Closing: Starting Again Is Not a Triumph$/],
    ["threads/part-2/narrative-and-evidence.md", /^结语：让故事回到生活$/],
    ["en/threads/part-2/narrative-and-evidence.md", /^Closing: Let the Story Return to Life$/],
    ["threads/part-2/entrepreneurship.md", /^结语：让野心经过现实$/],
    ["en/threads/part-2/entrepreneurship.md", /^Closing: Let Ambition Pass Through Reality$/],
    ["threads/part-3/1-ai-learning.md", /^结语：把能力留在人身上$/],
    ["en/threads/part-3/1-ai-learning.md", /^Closing: Keep the Ability with the Person$/],
  ]);
  const expected = expectedClosings.get(source);
  if (!expected) return;

  const headings = [...readFileSync(file, "utf8").matchAll(/^## (.+)$/gm)].map((heading) => heading[1]);
  if (!expected.test(headings.at(-1) || "")) {
    addError(file, 1, "关键故事与 AI 章节必须以指定文学结语收束，不能停在更新、目录或来源说明");
  }
}

function checkEntrepreneurshipStyle(file) {
  const source = relative(DOCS, file).split(sep).join("/");
  if (source !== "threads/part-2/entrepreneurship.md") return;

  const text = readFileSync(file, "utf8");
  const contrastMarkers = ["不是", "而是", "真正"].reduce(
    (total, marker) => total + (text.match(new RegExp(marker, "g")) || []).length,
    0,
  );
  if (contrastMarkers > 8) {
    addError(file, 1, "创业篇二元对举句式过密，应优先使用场景、动作与具体后果推进叙事");
  }
}

function checkBilingualParity(markdownFiles) {
  const publicFiles = markdownFiles.filter(
    (file) => file.startsWith(`${DOCS}/`) && !file.endsWith("SUMMARY.md"),
  );
  const chineseFiles = publicFiles.filter(
    (file) => !file.startsWith(`${join(DOCS, "en")}/`) && file !== join(DOCS, "README.md"),
  );
  const englishFiles = publicFiles.filter(
    (file) => file.startsWith(`${join(DOCS, "en")}/`) && file !== join(DOCS, "en/README.md"),
  );

  for (const file of chineseFiles) {
    const path = relative(DOCS, file);
    const expected = join(DOCS, "en", path);
    if (!existsSync(expected)) addError(file, 1, `缺少英文对应页: ${relative(ROOT, expected)}`);
  }
  for (const file of englishFiles) {
    const path = relative(join(DOCS, "en"), file);
    const expected = join(DOCS, path);
    if (!existsSync(expected)) addError(file, 1, `缺少中文对应页: ${relative(ROOT, expected)}`);
  }
}

function headingShape(file) {
  return inspectFile(file).headingShape;
}

function checkHeadingParity(markdownFiles) {
  const publicFiles = markdownFiles.filter(
    (file) => file.startsWith(`${DOCS}/`) && !file.endsWith("SUMMARY.md"),
  );
  const chineseFiles = publicFiles.filter(
    (file) => !file.startsWith(`${join(DOCS, "en")}/`) && file !== join(DOCS, "README.md"),
  );

  for (const file of chineseFiles) {
    const path = relative(DOCS, file);
    const expected = join(DOCS, "en", path);
    if (!existsSync(expected)) continue;
    const chineseShape = headingShape(file);
    const englishShape = headingShape(expected);
    if (chineseShape.join(",") !== englishShape.join(",")) {
      addError(
        file,
        1,
        `中英文标题层级不一致: ${chineseShape.join(",")} vs ${englishShape.join(",")}`,
      );
    }
  }
}

function checkUpdatedParity(markdownFiles) {
  const publicFiles = markdownFiles.filter(
    (file) => file.startsWith(`${DOCS}/`) && !file.endsWith("SUMMARY.md"),
  );
  const chineseFiles = publicFiles.filter(
    (file) => !file.startsWith(`${join(DOCS, "en")}/`) && file !== join(DOCS, "README.md"),
  );

  const pairs = [[join(DOCS, "README.md"), join(DOCS, "en/README.md")]];
  for (const file of chineseFiles) {
    const path = relative(DOCS, file);
    pairs.push([file, join(DOCS, "en", path)]);
  }

  for (const [file, expected] of pairs) {
    if (!existsSync(file) || !existsSync(expected)) continue;
    const chinese = parseFrontmatter(file)?.updated;
    const english = parseFrontmatter(expected)?.updated;
    if (chinese && english && chinese !== english) {
      addError(
        file,
        1,
        `中英文稿件 updated 日期不一致: ${chinese} vs ${english}`,
      );
    }
  }
}

const STALE_PATTERNS = [
  ["#/", "残留 Docsify hash 路由"],
  ["byoungd.github.io/up/#/", "残留旧 hash 站点地址"],
  ["byoungd.github.io/English-level-up-tips", "残留旧站点域名"],
  ["397865076", "公开个人 QQ 号码"],
  ["user.qzone.qq.com", "公开个人空间链接"],
  ["douyin-qr", "公开二维码资源"],
  ["2026-06 版", "过期的版本标签"],
  ["youtube.com/user/", "旧 YouTube 用户路由"],
  ["pan.baidu.com/s/1i5OLIIT", "失效网盘链接"],
  ["v.youku.com", "过期优酷链接"],
  ["zhuanlan.zhihu.com/p/444211376", "访问受限的旧知乎链接"],
  ["zhuanlan.zhihu.com/p/653380203", "访问受限的旧知乎链接"],
  ["10.1076/edre.7.1.403.3989", "已失效或错误的词汇研究 DOI"],
  ["10.1111/j.1467-9922.2011.00676.x", "指向其他文章的错误词汇研究 DOI"],
  ["scholarspace.manoa.hawaii.edu/items/dfe724c0-c66f-4afe-9164-d6c6a59585d4", "已替换的 ScholarSpace 词汇研究入口"],
  ["openaccess.wgtn.ac.nz/articles/journal_contribution/Unknown_vocabulary_density_and_reading_comprehension/12560354", "已替换的 Wellington 词汇研究入口"],
  ["Source (中文)", "英文页面混用中文来源标签"],
  ["dopamine detox method", "把多巴胺排毒写成已验证方法"],
  ["Lipu", "英文笔名拼写不一致"],
];

function checkStaleStrings(markdownFiles) {
  for (const file of markdownFiles) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const [pattern, reason] of STALE_PATTERNS) {
        if (line.includes(pattern)) addError(file, index + 1, `${reason}: "${pattern}"`);
      }
    });
  }
}

function repositoryReadmeFromDocs(source) {
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

function checkReadmeMirror() {
  const source = readFileSync(join(DOCS, "README.md"), "utf8");
  const expected = repositoryReadmeFromDocs(source);
  const actual = readFileSync(join(ROOT, "README.md"), "utf8");
  if (expected !== actual) {
    addError(join(ROOT, "README.md"), 1, "未与 docs/README.md 同步；运行 npm run sync");
  }
}

async function checkImageMetadata() {
  const files = walk(join(DOCS, "assets"), PUBLIC_IMAGE_EXTENSIONS);
  for (const file of files) {
    let metadata;
    try {
      metadata = await sharp(file).metadata();
    } catch (error) {
      addError(file, 1, `无法检查图片元数据: ${error.message}`);
      continue;
    }
    const found = ["exif", "iptc", "xmp"].filter((key) => metadata?.[key] != null);
    if (found.length) {
      addError(file, 1, `包含 EXIF/GPS 或描述元数据块: ${found.join(", ")}`);
    }
  }
}

function checkAttributionPaths() {
  const file = join(ROOT, "ATTRIBUTIONS.md");
  const lines = readFileSync(file, "utf8").split("\n");
  const codeSpan = /`([^`]+)`/g;
  lines.forEach((line, index) => {
    codeSpan.lastIndex = 0;
    let match;
    while ((match = codeSpan.exec(line))) {
      const candidate = match[1].trim();
      if (!candidate.startsWith("docs/") || candidate.includes("*")) continue;
      const path = resolve(ROOT, candidate.replace(/\/$/, ""));
      if (!path.startsWith(`${ROOT}${sep}`) || !existsSync(path)) {
        addError(file, index + 1, `归属表本地路径不存在: ${candidate}`);
      }
    }
  });
}

function checkOrphanAssets() {
  const assets = walk(join(DOCS, "assets"), PUBLIC_ASSET_EXTENSIONS);
  const sourceFiles = walk(ROOT, TEXT_SOURCE_EXTENSIONS).filter((file) => {
    if (file.startsWith(`${join(DOCS, "assets")}${sep}`)) return false;
    const name = basename(file);
    return name !== "ATTRIBUTIONS.md" && name !== "CHANGELOG.md";
  });
  const sourceText = sourceFiles.map((file) => readFileSync(file, "utf8"));

  for (const asset of assets) {
    const name = basename(asset);
    if (!sourceText.some((text) => text.includes(name))) {
      addError(asset, 1, `公共资产未在正文、配置或构建脚本中引用: ${name}`);
    }
  }
}

function checkTrackedSystemFiles() {
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT });
  } catch (error) {
    addError(join(ROOT, ".gitignore"), 1, `无法读取 Git 跟踪清单: ${error.message}`);
    return;
  }
  for (const file of tracked.toString("utf8").split("\0")) {
    if (!file || !FORBIDDEN_TRACKED_NAMES.has(basename(file))) continue;
    addError(join(ROOT, file), 1, `系统元数据文件不应被 Git 跟踪: ${file}`);
  }
}

// Public files are downloadable payloads, not VitePress manuscript sources.
// Their generated content is checked by sync-worksheets.mjs --check.
const markdownFiles = walk(ROOT, new Set([".md"]))
  .filter((file) => !file.startsWith(`${join(DOCS, "public")}${sep}`));
for (const file of markdownFiles) checkLinksAndAlt(file);
for (const file of markdownFiles.filter((path) => path.startsWith(`${DOCS}/`))) {
  checkFrontmatter(file);
  checkManualBookPager(file);
  checkPartOneClosing(file);
  checkKeyLiteraryClosing(file);
  checkEntrepreneurshipStyle(file);
}
checkBilingualParity(markdownFiles);
checkHeadingParity(markdownFiles);
checkUpdatedParity(markdownFiles);
for (const message of navigationErrors(zhNavigation, enNavigation, DOCS)) {
  addError(join(DOCS, ".vitepress/navigation.mjs"), 1, message);
}
checkStaleStrings(
  markdownFiles.filter(
    (file) =>
      file.startsWith(`${DOCS}/`) ||
      file === join(ROOT, "README.md") ||
      file === join(ROOT, "SUMMARY.md"),
  ),
);
checkReadmeMirror();
checkAttributionPaths();
checkOrphanAssets();
checkTrackedSystemFiles();
await checkImageMetadata();

if (!errors.length) {
  console.log(`✓ 内容校验通过：${markdownFiles.length} 个 Markdown 文件，双语、链接、元数据与隐私检查正常。`);
  process.exit(0);
}

console.error(`✗ 发现 ${errors.length} 个问题：\n`);
for (const error of errors) {
  const location = error.line ? `${error.file}:${error.line}` : error.file;
  console.error(`  ${location}  ${error.message}`);
}
process.exit(1);
