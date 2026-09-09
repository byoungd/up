#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createMarkdownRenderer } from "vitepress";
import { enNavigation, publicationSections, zhNavigation } from "../docs/.vitepress/navigation.mjs";
import { configureEpubMarkdown, escapeXml, makeXhtml } from "./epub-rendering.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const PUBLIC = join(DOCS, "public");
const { values: options } = parseArgs({ options: { check: { type: "boolean" }, "output-dir": { type: "string" } } });
const OUTPUT_DIR = options["output-dir"] ? resolve(options["output-dir"]) : join(PUBLIC, "downloads");
const ONLINE_ROOT = "https://byoungd.github.io/up/";
const checkOnly = options.check;
const fixedTime = new Date("1980-01-01T00:00:00Z");
const zipEnv = { ...process.env, TZ: "UTC" };

const editions = [
  {
    key: "zh",
    file: "life-level-up-guide-zh.epub",
    navigation: zhNavigation,
    lang: "zh-CN",
    title: "人生进阶指南",
    subtitle: "AI 时代终身学习指南",
    creator: "韩先凯",
    frontMatter: "开卷",
    appendices: "附录与工具箱",
    contents: "目录",
    landmarks: "阅读导航",
    coverLabel: "封面",
    startLabel: "开始阅读",
    accessibilitySummary: "本书采用可调整字号的流式排版，提供目录、标题结构、表格列标题和图片替代文字。部分插图中的细节没有完整的文字描述；外部参考链接需要联网。",
    coverAlt: "《人生进阶指南》封面",
    description: "从英语、AI、真实项目与人生低谷出发，建立能够复测、迁移、恢复并承担责任的终身学习系统。",
    coverSource: join(PUBLIC, "assets/cover-portrait.png"),
  },
  {
    key: "en",
    file: "life-level-up-guide-en.epub",
    navigation: enNavigation,
    lang: "en-US",
    title: "Life Level-up Guide",
    subtitle: "Lifelong Learning Guide for the AI Era",
    creator: "Han Xiankai",
    frontMatter: "Front Matter",
    appendices: "Appendices and Toolkit",
    contents: "Contents",
    landmarks: "Reading navigation",
    coverLabel: "Cover",
    startLabel: "Start reading",
    accessibilitySummary: "Reflowable text supports font resizing, a table of contents, structured headings, table column headers, and image alternatives. Some illustrations do not have complete text descriptions of their details. External reference links require an internet connection.",
    coverAlt: "Life Level-up Guide cover",
    description: "A lifelong-learning system for English, AI, real projects, difficult seasons, evidence, transfer, recovery, and responsibility.",
    coverSource: join(PUBLIC, "assets/cover-portrait-en.png"),
  },
];

const allNavigationItems = [...zhNavigation, ...enNavigation].flatMap(({ items }) => items);
const sourceToRoute = new Map(allNavigationItems.map(({ source, link }) => [source, link]));
const routeToSource = new Map(
  allNavigationItems.map(({ source, link }) => [link.replace(/^\/+|\/+$/g, ""), source]),
);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseFrontmatter(file) {
  const source = readFileSync(file, "utf8");
  const block = source.match(/^---\n([\s\S]*?)\n---\n/);
  const values = {};
  if (block) {
    for (const line of block[1].split("\n")) {
      const match = line.match(/^([a-zA-Z][\w-]*):\s*(.+)$/);
      if (match) values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return {
    body: block ? source.slice(block[0].length) : source,
    values,
  };
}

function normalizeSource(path) {
  return normalize(path).split(sep).join("/").replace(/^\.\//, "");
}

function sourceForRoute(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return routeToSource.get(clean);
}

function resolveMarkdownTarget(source, rawPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    decoded = rawPath;
  }
  if (decoded.startsWith("/")) return sourceForRoute(decoded);

  const candidate = normalizeSource(join(dirname(source), decoded));
  const choices = extname(candidate)
    ? [candidate]
    : [`${candidate}.md`, join(candidate, "README.md")];
  return choices.find((choice) => existsSync(join(DOCS, choice)));
}

function onlineUrlForSource(source, hash = "", query = "") {
  const configured = sourceToRoute.get(source);
  let route = configured;
  if (!route) {
    if (source === "README.md") route = "/";
    else if (source === "en/README.md") route = "/en/";
    else if (source.endsWith("/README.md")) route = `/${source.slice(0, -"README.md".length)}`;
    else route = `/${source.replace(/\.md$/, "")}`;
  }
  return `${ONLINE_ROOT.replace(/\/$/, "")}${route}${query}${hash}`;
}

function onlineUrlForUnresolvedPath(source, rawPath, hash = "", query = "") {
  const normalized = rawPath.startsWith("/")
    ? rawPath.replace(/^\/+/, "")
    : normalizeSource(join(dirname(source), rawPath));
  return `${ONLINE_ROOT}${normalized}${query}${hash}`;
}

function mediaType(file) {
  const extension = extname(file).toLowerCase();
  return {
    ".css": "text/css",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".xhtml": "application/xhtml+xml",
  }[extension];
}

function walk(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, output);
    else output.push(path);
  }
  return output;
}

function rewriteHtmlAttributes(content, source, rewriteLink, rewriteImage) {
  return content
    .replace(/\bhref=(['"])(.*?)\1/gi, (_match, quote, href) => `href=${quote}${rewriteLink(href, source)}${quote}`)
    .replace(/\bsrc=(['"])(.*?)\1/gi, (_match, quote, src) => `src=${quote}${rewriteImage(src, source)}${quote}`)
    .replace(/\s+(?:target|loading|decoding|fetchpriority)=(['"])[^'"]*\1/gi, "");
}

function unescapeXml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function validateEpubRoot(epubRoot, edition, chapterRecords) {
  const oebps = join(epubRoot, "OEBPS");
  const opf = readFileSync(join(oebps, "package.opf"), "utf8");
  const files = new Set(walk(oebps).map((file) => normalizeSource(relative(oebps, file))));
  const manifestItems = [...opf.matchAll(/<item\s+([^>]+)\/>/g)].map((match) => {
    const attributes = Object.fromEntries(
      [...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], unescapeXml(attribute[2])]),
    );
    return attributes;
  });
  const manifestById = new Map(manifestItems.map((item) => [item.id, item]));
  const manifestFiles = new Set(manifestItems.map(({ href }) => normalizeSource(href)));

  for (const file of files) {
    if (file === "package.opf") continue;
    if (!manifestFiles.has(file)) throw new Error(`${edition.file}: manifest 未收录 ${file}`);
  }
  for (const file of manifestFiles) {
    if (!files.has(file)) throw new Error(`${edition.file}: manifest 目标不存在 ${file}`);
  }

  const spineIds = [...opf.matchAll(/<itemref\s+idref="([^"]+)"\s*\/>/g)].map((match) => match[1]);
  if (spineIds.length !== chapterRecords.length + 2) {
    throw new Error(`${edition.file}: spine 数量错误: ${spineIds.length}`);
  }
  for (const id of spineIds) {
    if (!manifestById.has(id)) throw new Error(`${edition.file}: spine 引用未声明资源 ${id}`);
  }

  const xhtmlFiles = [...files].filter((file) => file.endsWith(".xhtml"));
  for (const file of xhtmlFiles) {
    const content = readFileSync(join(oebps, file), "utf8");
    for (const match of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href = unescapeXml(match[1]);
      if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(href)) continue;
      const [pathAndQuery, rawHash = ""] = href.split("#", 2);
      const cleanPath = pathAndQuery.split("?", 1)[0];
      const targetFile = normalizeSource(cleanPath ? join(dirname(file), cleanPath) : file);
      if (!files.has(targetFile)) throw new Error(`${edition.file}: ${file} 链接到不存在的 ${href}`);
      if (rawHash) {
        let hash;
        try {
          hash = decodeURIComponent(rawHash);
        } catch {
          hash = rawHash;
        }
        const targetContent = readFileSync(join(oebps, targetFile), "utf8");
        const escapedId = escapeXml(hash);
        if (!targetContent.includes(`id="${escapedId}"`)) {
          throw new Error(`${edition.file}: ${file} 链接到不存在的锚点 ${href}`);
        }
      }
    }
  }

  const nav = readFileSync(join(oebps, "nav.xhtml"), "utf8");
  const toc = nav.match(/<nav epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || "";
  const navLinks = [...toc.matchAll(/<a href="([^"]+)"/g)].map((match) => match[1]);
  if (navLinks.length !== chapterRecords.length + 1) {
    throw new Error(`${edition.file}: 导航条目数量错误: ${navLinks.length}`);
  }
}

function bookCss(lang) {
  const isChinese = lang.startsWith("zh");
  return `:root { color-scheme: light dark; }
body {
  font-family: ${isChinese ? '"Noto Serif CJK SC", "Songti SC", SimSun, serif' : 'Georgia, "Times New Roman", serif'};
  line-height: 1.72;
  margin: 5%;
  orphans: 2;
  widows: 2;
  overflow-wrap: break-word;
  hyphens: auto;
}
main { max-width: 42rem; margin: 0 auto; }
h1, h2, h3, h4 { line-height: 1.3; page-break-after: avoid; }
h1 { font-size: 1.8em; margin: 0 0 1.2em; }
h2 { font-size: 1.35em; margin-top: 2.2em; }
h3 { font-size: 1.12em; margin-top: 1.8em; }
p, li { text-align: ${isChinese ? "justify" : "left"}; }
a { color: inherit; text-decoration: underline; text-decoration-thickness: 0.06em; }
blockquote { border-left: 0.18em solid #737373; margin: 1.4em 0; padding-left: 1em; color: #555; }
img { display: block; height: auto; margin: 1.6em auto; max-width: 100%; }
table { border-collapse: collapse; font-size: 0.86em; margin: 1.5em 0; width: 100%; }
th, td { border: 1px solid #999; padding: 0.45em; vertical-align: top; overflow-wrap: anywhere; }
pre { background: #f3f3f3; border: 1px solid #ddd; overflow-wrap: anywhere; word-wrap: break-word; padding: 0.8em; white-space: pre-wrap; }
code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 0.9em; }
.book-meta, .guide-paths { margin: 1.3em 0; }
.guide-path { display: block; margin: 0.7em 0; text-decoration: none; }
.guide-path strong { display: block; }
.cover { margin: 0; padding: 0; text-align: center; }
.cover img { height: auto; margin: 0 auto; max-height: 90vh; max-width: 100%; }
@media (prefers-color-scheme: dark) {
  blockquote { color: #ccc; }
  pre { background: #222; border-color: #555; }
}
`;
}

function containerXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>
`;
}

async function buildEdition(edition, markdown, tempBase) {
  const sections = publicationSections(edition.navigation, edition);
  const items = sections.flatMap(({ items }) => items);
  const sourceToChapter = new Map(
    items.map(({ source }, index) => [source, `chapter-${String(index + 1).padStart(3, "0")}.xhtml`]),
  );
  const epubRoot = join(tempBase, `${edition.key}-root`);
  const textDir = join(epubRoot, "OEBPS/text");
  const stylesDir = join(epubRoot, "OEBPS/styles");
  const assetsDir = join(epubRoot, "OEBPS/assets");
  const metaDir = join(epubRoot, "META-INF");
  for (const directory of [textDir, stylesDir, assetsDir, metaDir]) mkdirSync(directory, { recursive: true });

  writeFileSync(join(epubRoot, "mimetype"), "application/epub+zip");
  writeFileSync(join(metaDir, "container.xml"), containerXml());
  writeFileSync(join(stylesDir, "book.css"), bookCss(edition.lang));
  copyFileSync(edition.coverSource, join(assetsDir, "cover.png"));

  const imageTargets = new Map();
  const rewriteImage = (href, source) => {
    if (/^(?:https?:|data:|\/\/)/i.test(href)) return href;
    const clean = href.split(/[?#]/, 1)[0];
    let absolute;
    if (clean.startsWith("/assets/")) absolute = join(PUBLIC, clean.replace(/^\/+/, ""));
    else absolute = resolve(dirname(join(DOCS, source)), clean);
    if (!existsSync(absolute)) throw new Error(`${source}: EPUB 图片不存在: ${href}`);
    let target;
    if (absolute.startsWith(`${join(DOCS, "assets")}${sep}`)) {
      target = `assets/${normalizeSource(relative(join(DOCS, "assets"), absolute))}`;
    } else if (absolute.startsWith(`${PUBLIC}${sep}`)) {
      target = `assets/public/${normalizeSource(relative(PUBLIC, absolute))}`;
    } else {
      throw new Error(`${source}: EPUB 图片不在公开资源目录: ${href}`);
    }
    imageTargets.set(absolute, target);
    return `../${target}`;
  };

  const rewriteLink = (href, source) => {
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(href) || href.startsWith("#")) return href;
    const hashIndex = href.indexOf("#");
    const queryIndex = href.indexOf("?");
    const pathEnd = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? href.length;
    const rawPath = href.slice(0, pathEnd);
    const query = queryIndex >= 0 ? href.slice(queryIndex, hashIndex >= 0 ? hashIndex : href.length) : "";
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
    if (!rawPath) return `${query}${hash}`;
    const targetSource = resolveMarkdownTarget(source, rawPath);
    if (!targetSource) return onlineUrlForUnresolvedPath(source, rawPath, hash, query);
    const chapter = sourceToChapter.get(targetSource);
    return chapter ? `${chapter}${hash}` : onlineUrlForSource(targetSource, hash, query);
  };

  const chapterRecords = [];
  let latestUpdated = "1970-01-01";
  for (const [index, item] of items.entries()) {
    const sourceFile = join(DOCS, item.source);
    const { body, values } = parseFrontmatter(sourceFile);
    latestUpdated = [latestUpdated, values.updated || "1970-01-01"].sort().at(-1);
    const env = { path: item.source, relativePath: item.source };
    const tokens = markdown.parse(body, env);
    const visit = (token) => {
      if (token.type === "link_open") token.attrSet("href", rewriteLink(token.attrGet("href"), item.source));
      if (token.type === "image") token.attrSet("src", rewriteImage(token.attrGet("src"), item.source));
      if (token.type === "html_block" || token.type === "html_inline") {
        token.content = rewriteHtmlAttributes(token.content, item.source, rewriteLink, rewriteImage);
      }
      for (const child of token.children || []) visit(child);
    };
    for (const token of tokens) visit(token);
    const rendered = markdown.renderer.render(tokens, markdown.options, env);
    const filename = sourceToChapter.get(item.source);
    const title = values.title || item.text;
    writeFileSync(
      join(textDir, filename),
      makeXhtml({ lang: edition.lang, title, body: rendered, epubType: item.source.endsWith("README.md") ? "preface" : "chapter" }),
    );
    chapterRecords.push({
      id: `chapter-${String(index + 1).padStart(3, "0")}`,
      filename,
      source: item.source,
      title,
    });
  }

  for (const [absolute, target] of [...imageTargets.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const destination = join(epubRoot, "OEBPS", target);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(absolute, destination);
  }

  const coverBody = `<section class="cover" epub:type="cover"><img src="../assets/cover.png" alt="${escapeXml(edition.coverAlt)}" /></section>`;
  writeFileSync(
    join(textDir, "cover.xhtml"),
    makeXhtml({ lang: edition.lang, title: edition.title, body: coverBody, epubType: "cover" }),
  );

  const titleBody = `<section class="title-page" epub:type="titlepage">
  <h1>${escapeXml(edition.title)}</h1>
  <p class="subtitle">${escapeXml(edition.subtitle)}</p>
  <p class="author">${escapeXml(edition.creator)}</p>
  <p>${escapeXml(edition.description)}</p>
  <p><a href="${ONLINE_ROOT}">${ONLINE_ROOT}</a></p>
  <p>CC BY-NC 4.0 · ${latestUpdated}</p>
</section>`;
  writeFileSync(
    join(textDir, "title.xhtml"),
    makeXhtml({ lang: edition.lang, title: edition.title, body: titleBody, epubType: "titlepage" }),
  );

  const navSections = sections
    .map(({ text, items }) => {
      const links = items
        .map(({ source, text: label }) => `        <li><a href="text/${sourceToChapter.get(source)}">${escapeXml(label)}</a></li>`)
        .join("\n");
      return `      <li><span>${escapeXml(text)}</span>\n        <ol>\n${links}\n        </ol>\n      </li>`;
    })
    .join("\n");
  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${edition.lang}" xml:lang="${edition.lang}">
<head><meta charset="utf-8" /><title>${escapeXml(edition.contents)}</title><link rel="stylesheet" type="text/css" href="styles/book.css" /></head>
<body><nav epub:type="toc" id="toc"><h1>${escapeXml(edition.contents)}</h1><ol>
      <li><a href="text/title.xhtml">${escapeXml(edition.title)}</a></li>
${navSections}
    </ol></nav>
<nav epub:type="landmarks" aria-label="${escapeXml(edition.landmarks)}" hidden="hidden"><ol>
  <li><a epub:type="cover" href="text/cover.xhtml">${escapeXml(edition.coverLabel)}</a></li>
  <li><a epub:type="bodymatter" href="text/${chapterRecords[0].filename}">${escapeXml(edition.startLabel)}</a></li>
</ol></nav></body>
</html>
`;
  writeFileSync(join(epubRoot, "OEBPS/nav.xhtml"), navXhtml);

  const manifestImages = [...imageTargets.values()].sort().map((target, index) => {
    const type = mediaType(target);
    if (!type) throw new Error(`EPUB 不支持图片类型: ${target}`);
    return `    <item id="image-${String(index + 1).padStart(3, "0")}" href="${escapeXml(target)}" media-type="${type}" />`;
  });
  const manifestChapters = chapterRecords.map(
    ({ id, filename }) => `    <item id="${id}" href="text/${filename}" media-type="application/xhtml+xml" />`,
  );
  const spine = chapterRecords.map(({ id }) => `    <itemref idref="${id}" />`);
  const identifier = `${ONLINE_ROOT}downloads/${edition.file}`;
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${edition.lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${escapeXml(identifier)}</dc:identifier>
    <dc:title>${escapeXml(edition.title)}</dc:title>
    <dc:language>${edition.lang}</dc:language>
    <dc:creator>${escapeXml(edition.creator)}</dc:creator>
    <dc:description>${escapeXml(edition.description)}</dc:description>
    <dc:rights>CC BY-NC 4.0</dc:rights>
    <dc:source>${ONLINE_ROOT}</dc:source>
    <meta property="dcterms:modified">${latestUpdated}T00:00:00Z</meta>
    <meta property="schema:accessMode">textual</meta>
    <meta property="schema:accessMode">visual</meta>
    <meta property="schema:accessModeSufficient">textual,visual</meta>
    <meta property="schema:accessibilityFeature">alternativeText</meta>
    <meta property="schema:accessibilityFeature">readingOrder</meta>
    <meta property="schema:accessibilityFeature">structuralNavigation</meta>
    <meta property="schema:accessibilityFeature">tableOfContents</meta>
    <meta property="schema:accessibilityHazard">none</meta>
    <meta property="schema:accessibilitySummary">${escapeXml(edition.accessibilitySummary)}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
    <item id="css" href="styles/book.css" media-type="text/css" />
    <item id="cover-image" href="assets/cover.png" media-type="image/png" properties="cover-image" />
    <item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml" />
    <item id="title-page" href="text/title.xhtml" media-type="application/xhtml+xml" />
${manifestChapters.join("\n")}
${manifestImages.join("\n")}
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" />
    <itemref idref="title-page" />
${spine.join("\n")}
  </spine>
</package>
`;
  writeFileSync(join(epubRoot, "OEBPS/package.opf"), opf);

  const navPoints = [
    { id: "cover", title: edition.title, href: "text/cover.xhtml" },
    { id: "title-page", title: edition.title, href: "text/title.xhtml" },
    ...chapterRecords.map(({ id, title, filename }) => ({ id, title, href: `text/${filename}` })),
  ];
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="${edition.lang}">
  <head><meta name="dtb:uid" content="${escapeXml(identifier)}" /></head>
  <docTitle><text>${escapeXml(edition.title)}</text></docTitle>
  <navMap>
${navPoints.map(({ id, title, href }, index) => `    <navPoint id="${id}" playOrder="${index + 1}"><navLabel><text>${escapeXml(title)}</text></navLabel><content src="${href}" /></navPoint>`).join("\n")}
  </navMap>
</ncx>
`;
  writeFileSync(join(epubRoot, "OEBPS/toc.ncx"), ncx);

  validateEpubRoot(epubRoot, edition, chapterRecords);

  for (const file of walk(epubRoot)) utimesSync(file, fixedTime, fixedTime);
  const output = join(tempBase, edition.file);
  execFileSync("zip", ["-X0", output, "mimetype"], { cwd: epubRoot, env: zipEnv, stdio: "ignore" });
  const entries = walk(epubRoot)
    .map((file) => normalizeSource(relative(epubRoot, file)))
    .filter((file) => file !== "mimetype")
    .sort();
  execFileSync("zip", ["-X9", output, ...entries], { cwd: epubRoot, env: zipEnv, stdio: "ignore" });
  execFileSync("unzip", ["-tqq", output], { stdio: "ignore" });
  const listed = execFileSync("unzip", ["-Z1", output], { encoding: "utf8" }).trim().split("\n");
  if (listed[0] !== "mimetype") throw new Error(`${edition.file}: mimetype 必须是首个 ZIP 条目`);
  const mimetype = execFileSync("unzip", ["-p", output, "mimetype"], { encoding: "utf8" });
  if (mimetype !== "application/epub+zip") throw new Error(`${edition.file}: mimetype 内容错误`);

  const sourceDigest = sha256(
    items
      .map(({ source }) => `${source}\0${sha256(readFileSync(join(DOCS, source)))}`)
      .join("\n"),
  );
  const buffer = readFileSync(output);
  if (buffer.length > 8_000_000) throw new Error(`${edition.file}: EPUB 超过 8MB 预算`);
  return {
    output,
    metadata: {
      file: edition.file,
      language: edition.lang,
      chapters: chapterRecords.length,
      images: imageTargets.size + 1,
      bytes: buffer.length,
      sha256: sha256(buffer),
      sourceSha256: sourceDigest,
    },
  };
}

const tempBase = mkdtempSync(join(tmpdir(), "life-level-up-epub-"));
try {
  const markdown = await createMarkdownRenderer(DOCS, { config: configureEpubMarkdown });
  const built = [];
  for (const edition of editions) built.push(await buildEdition(edition, markdown, tempBase));
  const manifest = `${JSON.stringify({
    version: 1,
    standard: "EPUB 3.3",
    scope: "Main manuscript, glossary, and toolkit; archive and word lists remain online-only.",
    outputs: Object.fromEntries(built.map(({ metadata }) => [metadata.language, metadata])),
  }, null, 2)}\n`;

  if (checkOnly) {
    for (const { output, metadata } of built) {
      const committed = join(OUTPUT_DIR, metadata.file);
      if (!existsSync(committed) || !readFileSync(committed).equals(readFileSync(output))) {
        throw new Error(`${relative(ROOT, committed)} 未与书稿同步；运行 npm run book:build`);
      }
    }
    const manifestFile = join(OUTPUT_DIR, "epub-manifest.json");
    if (!existsSync(manifestFile) || readFileSync(manifestFile, "utf8") !== manifest) {
      throw new Error(`${relative(ROOT, manifestFile)} 未与 EPUB 产物同步；运行 npm run book:build`);
    }
    console.log("EPUB editions are in sync");
  } else {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const { output, metadata } of built) copyFileSync(output, join(OUTPUT_DIR, metadata.file));
    writeFileSync(join(OUTPUT_DIR, "epub-manifest.json"), manifest);
    for (const { metadata } of built) {
      console.log(`updated ${relative(ROOT, join(OUTPUT_DIR, metadata.file))} (${metadata.chapters} chapters, ${metadata.bytes} bytes)`);
    }
  }
} finally {
  rmSync(tempBase, { recursive: true, force: true });
}
