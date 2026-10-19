import { existsSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_SOURCE_REVIEW_DAYS = 120;
const SOURCE_REVIEW_INTERVALS = new Set([30, 60, 120]);
const PUBLICATION_TIME_ZONE = "Asia/Shanghai";
const GENERIC_ALT = new Set(["image", "img", "photo", "picture", "hotel", "图片", "照片", "图"]);

export function translatedSource(source, language) {
  return language === "en" ? `en/${source}` : source.replace(/^en\//, "");
}

export function parseFrontmatter(text) {
  const block = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!block) return null;
  const values = {};
  for (const line of block[1].split(/\r?\n/)) {
    const match = line.match(/^([a-zA-Z][\w-]*):\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return values;
}

export function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp;
}

export function requiresSourceReview(source) {
  return /^(?:en\/)?threads\/(?:[^/]+\/)*(?:\d+-)?ai(?:-|\.md$)/.test(source);
}

export function publicationDate(now = Date.now()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: PUBLICATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now)).map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function frontmatterProblems(text, source, now = Date.now()) {
  const values = parseFrontmatter(text);
  if (!values) return ["公开页面缺少 frontmatter"];
  const problems = [];
  for (const key of ["title", "description", "updated"]) {
    if (!values[key]) problems.push(`frontmatter 缺少 ${key}`);
  }
  if (requiresSourceReview(source) && !values.sources_checked) {
    problems.push("AI 页面缺少 sources_checked");
  }
  let sourceReviewDays = DEFAULT_SOURCE_REVIEW_DAYS;
  if (values.source_review_interval !== undefined) {
    const parsed = Number(values.source_review_interval);
    if (!Number.isInteger(parsed) || !SOURCE_REVIEW_INTERVALS.has(parsed)) {
      problems.push("source_review_interval 必须是 30、60 或 120 天");
    } else {
      sourceReviewDays = parsed;
    }
  }
  const today = calendarDate(publicationDate(now));
  for (const key of ["updated", "sources_checked"]) {
    if (!(key in values) || (key === "updated" && !values[key])) continue;
    const date = calendarDate(values[key]);
    if (date === null) {
      problems.push(`${key} 必须使用真实日历日期 YYYY-MM-DD`);
    } else if (date > today) {
      problems.push(`${key} 不能晚于项目时区 ${PUBLICATION_TIME_ZONE} 的当前日期`);
    } else if (key === "sources_checked" && today - date > sourceReviewDays * DAY) {
      problems.push(`AI 产品资料超过 ${sourceReviewDays} 天未核验`);
    }
  }
  if (values.description && values.description.length < 24) {
    problems.push("description 过短，无法区分页面内容");
  }
  if (values.topic) {
    const isEnglish = source.startsWith("en/");
    const minLength = isEnglish ? 120 : 60;
    const maxLength = isEnglish ? 155 : 100;
    if (values.description?.length < minLength || values.description?.length > maxLength) {
      problems.push(`专题页 description 长度应为 ${minLength}-${maxLength} 字符`);
    }
    if (!values.intent) problems.push("专题页 frontmatter 缺少 intent");
    if (!values.schema) problems.push("专题页 frontmatter 缺少 schema");
    if (values.socialImage && !values.socialImageAlt) problems.push("专题分享图必须提供 socialImageAlt");
  }
  if (values.schema && !["Article", "Book", "Chapter", "HowTo", "WebPage"].includes(values.schema)) {
    problems.push("schema 必须是 Article、Book、Chapter、HowTo 或 WebPage");
  }
  return problems;
}

export function bilingualMetadataProblems(chineseText, englishText) {
  const chinese = parseFrontmatter(chineseText);
  const english = parseFrontmatter(englishText);
  if (!chinese || !english) return [];
  const problems = [];
  for (const key of ["sources_checked", "source_review_interval"]) {
    if (chinese[key] !== english[key] && (chinese[key] || english[key])) {
      problems.push(`中英文稿件 ${key} 不一致: ${chinese[key] || "缺少"} vs ${english[key] || "缺少"}`);
    }
  }
  return problems;
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();
const isExternal = (target) => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target);

function destinationPath(rawTarget) {
  let target = rawTarget.trim();
  target = target.startsWith("<")
    ? target.slice(1, target.indexOf(">"))
    : target.replace(/\s+["'].*$/, "").trim();
  if (!target || isExternal(target) || target.startsWith("#")) return null;
  target = target.split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(target).replace(/\\([() ])/g, "$1");
  } catch {
    return target;
  }
}

function pageCandidates(path) {
  const extension = extname(path);
  if (extension === ".html") return pageCandidates(path.replace(/\.html$/, ""));
  if (extension) return [path];
  const candidates = [`${path}.md`, join(path, "README.md"), join(path, "index.md"), path];
  if (/\/(?:README|index)$/.test(path)) {
    candidates.push(join(dirname(path), "README.md"), join(dirname(path), "index.md"));
  }
  return candidates;
}

export function targetCandidates(file, rawTarget, docsDir, image = false) {
  const target = destinationPath(rawTarget);
  if (!target) return [];
  const path = target.startsWith("/")
    ? resolve(docsDir, `.${target}`)
    : resolve(dirname(file), target);
  const candidates = image ? [path] : pageCandidates(path);
  if (path.startsWith(`${resolve(docsDir)}${sep}`)) {
    candidates.push(resolve(docsDir, "public", relative(docsDir, path)));
  }
  return candidates;
}

// Mask examples without changing offsets, so diagnostics retain their line numbers.
function withoutExamples(text) {
  const blank = (value) => value.replace(/[^\n\r]/g, " ");
  let fence = null;
  return text
    .replace(/<!--[\s\S]*?-->/g, blank)
    .split("\n")
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence) {
        if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
        return blank(line);
      }
      if (marker) {
        fence = marker[1];
        return blank(line);
      }
      return line.replace(/(`+)([^`]|(?!\1)`)*?\1/g, blank);
    })
    .join("\n");
}

export function linkProblems(text, file, docsDir) {
  const source = withoutExamples(text);
  const problems = [];
  const lineAt = (offset) => source.slice(0, offset).split("\n").length;
  const add = (offset, message) => problems.push({ line: lineAt(offset), message });
  const checkAlt = (alt, offset) => {
    if (!alt?.trim()) {
      add(offset, "图片缺少有意义的 alt 文本");
      return;
    }
    if (GENERIC_ALT.has(alt.trim().toLowerCase())) add(offset, `图片 alt 过于泛化: "${alt.trim()}"`);
    if (relative(docsDir, file).startsWith(`en${sep}`) && /[\u3400-\u9fff]/.test(alt)) {
      add(offset, "英文页面图片 alt 不应包含中文字符");
    }
  };
  const check = (target, offset, image = false) => {
    const candidates = targetCandidates(file, target, docsDir, image);
    if (candidates.length && !candidates.some(isFile)) add(offset, `链接目标不存在: ${target}`);
  };

  // Support angle destinations, escaped parentheses, and a parenthesized path segment.
  const inline = /(!?)\[([^\[\]\n]*)\]\((<[^>\n]+>(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?|(?:\\.|[^()\\\n]|\((?:\\.|[^()\\\n])*\))*?)\)/g;
  const checkedOffsets = new Set();
  for (const match of source.matchAll(inline)) {
    checkedOffsets.add(match.index);
    if (match[1]) checkAlt(match[2], match.index);
    if (match[1] && !match[3].trim()) add(match.index, "图片缺少目标路径");
    check(match[3], match.index, Boolean(match[1]));
  }
  // An image may be the label of a link. Mask its already-checked syntax so
  // the containing link is visible without changing diagnostic offsets.
  const imagesMasked = source.replace(inline, (match, image) => image ? " ".repeat(match.length) : match);
  for (const match of imagesMasked.matchAll(inline)) {
    if (!checkedOffsets.has(match.index)) check(match[3], match.index);
  }

  const definitions = new Map();
  const referenceKey = (label) => label.trim().replace(/\s+/g, " ").toLowerCase();
  for (const match of source.matchAll(/^ {0,3}\[([^\]\n]+)\]:\s*(<[^>\n]+>|\S+)/gm)) {
    definitions.set(referenceKey(match[1]), match[2]);
    check(match[2], match.index);
  }
  for (const match of source.matchAll(/(!?)\[([^\]\n]*)\]\[([^\]\n]*)\]/g)) {
    const target = definitions.get(referenceKey(match[3] || match[2]));
    if (!target) add(match.index, `链接引用未定义: ${match[3] || match[2]}`);
    if (match[1]) {
      checkAlt(match[2], match.index);
      if (target) check(target, match.index, true);
    }
  }
  for (const match of source.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/gi)) {
    const attributes = new Map([...match[2].matchAll(/\b([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map((attribute) => [attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4]]));
    const tag = match[1].toLowerCase();
    if (attributes.has("href")) check(attributes.get("href"), match.index);
    if (tag !== "img") continue;
    checkAlt(attributes.get("alt"), match.index);
    if (attributes.has("src")) {
      const src = attributes.get("src");
      if (!src.trim()) add(match.index, "HTML 图片 src 不得为空");
      else check(src, match.index, true);
    }
    else if (!attributes.has("srcset")) add(match.index, "HTML 图片缺少 src 或 srcset 属性");
    const srcset = attributes.get("srcset");
    if (srcset && !srcset.trim().startsWith("data:")) {
      for (const candidate of srcset.split(",")) check(candidate.trim().split(/\s+/, 1)[0], match.index, true);
    }
  }
  return problems;
}

// Source coverage and required fields are checked by sync-navigation.mjs.
// This adds the route/source relationship and bilingual reading order.
export function navigationProblems(zhNavigation, enNavigation, docsDir) {
  const problems = [];
  const add = (message) => problems.push(message);
  if (zhNavigation.length !== enNavigation.length) add("中英文导航分组数量不一致");
  for (const [language, groups] of [["zh", zhNavigation], ["en", enNavigation]]) {
    const seenSources = new Set();
    for (const group of groups) {
      for (const item of group.items) {
        if (seenSources.has(item.source)) add(`导航页面重复: ${item.source}`);
        seenSources.add(item.source);
        if (item.source.startsWith("en/") !== (language === "en")) add(`导航语言不匹配: ${item.source}`);
        if (!item.link.startsWith("/") || isExternal(item.link)) {
          add(`导航必须使用站内绝对路径: ${item.link}`);
          continue;
        }
        const candidates = targetCandidates(join(docsDir, "README.md"), item.link, docsDir);
        const source = resolve(docsDir, item.source);
        if (!candidates.includes(source) || !isFile(source)) add(`导航路由与源文件不匹配: ${item.link} -> ${item.source}`);
      }
    }
  }
  zhNavigation.forEach((group, groupIndex) => {
    const englishGroup = enNavigation[groupIndex];
    if (!englishGroup) return;
    if (group.items.length !== englishGroup.items.length) add(`第 ${groupIndex + 1} 组中英文导航页面数量不一致`);
    group.items.forEach((item, itemIndex) => {
      const expected = translatedSource(item.source, "en");
      if (englishGroup.items[itemIndex]?.source !== expected) add(`中英文导航顺序不一致: ${item.source} 对应 ${expected}`);
    });
  });
  return problems;
}
