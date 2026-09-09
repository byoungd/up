import { existsSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { createMarkdownRenderer } from "vitepress";

const isFile = (path) => existsSync(path) && statSync(path).isFile();
const isExternal = (target) => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target);

// Use the site's parser so references, nested parentheses, code fences, custom
// heading IDs and duplicate heading slugs have the same meaning as in the book.
export async function createMarkdownInspector(docsRoot) {
  const markdown = await createMarkdownRenderer(docsRoot, { highlight: (source) => source });

  return (source, file) => {
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, (block) =>
      block.replace(/[^\r\n]/g, ""),
    );
    const tokens = markdown.parse(body, { path: file });
    const links = [];
    const images = [];
    const anchors = new Set();
    const headingShape = [];

    function inspectHtml(content, line) {
      const html = content
        .replace(/(<(script|style)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>)([\s\S]*?)(<\/\2\s*>|$)/gi,
          (_match, opening, _tag, rawText, closing) => `${opening}${rawText.replace(/[^\n]/g, " ")}${closing}`)
        .replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "));
      const tags = /<([a-z][\w:-]*)(\s+(?:[^"'<>]|"[^"]*"|'[^']*')*)?\s*\/?>/gi;
      for (const match of html.matchAll(tags)) {
        const attrs = new Map();
        const attributes = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        for (const attr of (match[2] || "").matchAll(attributes)) {
          attrs.set(attr[1].toLowerCase(), markdown.utils.unescapeAll(attr[2] ?? attr[3] ?? attr[4] ?? ""));
        }
        const tagLine = line + html.slice(0, match.index).split("\n").length - 1;
        if (attrs.has("id")) anchors.add(attrs.get("id"));
        if (match[1].toLowerCase() === "a" && attrs.has("name")) anchors.add(attrs.get("name"));
        if (attrs.has("href")) links.push({ target: attrs.get("href"), line: tagLine });
        if (match[1].toLowerCase() === "img") {
          images.push({ alt: attrs.get("alt"), line: tagLine });
          if (attrs.has("src")) links.push({ target: attrs.get("src"), line: tagLine });
        }
      }
    }

    function inspectTokens(items, parentLine = 1) {
      let line = parentLine;
      for (const token of items) {
        if (token.map) line = token.map[0] + 1;
        if (token.type === "heading_open") {
          headingShape.push(Number(token.tag.slice(1)));
        }
        if (token.attrGet("id")) anchors.add(token.attrGet("id"));
        if (token.type === "link_open" && token.attrGet("class") !== "header-anchor") {
          links.push({ target: token.attrGet("href"), line });
        }
        if (token.type === "image") {
          images.push({ alt: token.content, line });
          links.push({ target: token.attrGet("src"), line });
        }
        if (token.type === "html_block" || token.type === "html_inline") inspectHtml(token.content, line);
        if (token.children) inspectTokens(token.children, line);
        if (token.type === "html_inline") line += token.content.split("\n").length - 1;
        if (token.type === "softbreak" || token.type === "hardbreak") line += 1;
      }
    }

    inspectTokens(tokens);
    return { links, images, anchors, headingShape };
  };
}

export function resolveContentTarget(file, rawTarget, docsRoot) {
  const target = rawTarget?.trim();
  if (!target) return null;
  if (/^(?:javascript|vbscript|file):/i.test(target.replace(/[\u0000-\u0020]/g, ""))) {
    return { error: `公开链接不能使用可执行或本地文件协议: ${target}` };
  }
  if (isExternal(target)) return null;
  const hashIndex = target.indexOf("#");
  const pathname = (hashIndex < 0 ? target : target.slice(0, hashIndex)).split("?")[0];
  let decodedPath;
  let fragment;
  try {
    decodedPath = decodeURIComponent(pathname);
    fragment = hashIndex < 0 ? "" : decodeURIComponent(target.slice(hashIndex + 1));
  } catch {
    return { error: `链接包含无效的 URL 编码: ${target}` };
  }
  // Browsers interpret text directives separately from the element ID.
  fragment = fragment.split(":~:")[0];
  if (!decodedPath) return { file, fragment };

  const path = decodedPath.startsWith("/")
    ? resolve(docsRoot, `.${decodedPath}`)
    : resolve(dirname(file), decodedPath);
  const candidates = [];
  const extension = extname(path).toLowerCase();
  if (extension === ".html") candidates.push(path.slice(0, -5) + ".md");
  if (!extension) candidates.push(`${path}.md`);
  candidates.push(path);
  if (!extension || /(?:^|\/)index\.html$/.test(decodedPath)) {
    const directory = extension === ".html" ? dirname(path) : path;
    candidates.push(join(directory, "index.md"), join(directory, "README.md"));
  }
  if (basename(path) === "index") candidates.push(join(dirname(path), "README.md"));
  if (path === docsRoot || path.startsWith(`${docsRoot}${sep}`)) {
    candidates.push(join(docsRoot, "public", relative(docsRoot, path)));
  }
  const resolved = candidates.find(isFile);
  return resolved ? { file: resolved, fragment } : { error: `链接目标不存在: ${target}`, candidates };
}

export function contentLinkErrors(content, file, docsRoot, inspectFile) {
  const errors = [];
  for (const { target, line } of content.links) {
    const resolved = resolveContentTarget(file, target, docsRoot);
    if (!resolved) continue;
    if (resolved.error) {
      errors.push({ line, message: resolved.error });
      continue;
    }
    if (resolved.fragment && resolved.fragment.toLowerCase() !== "top" && extname(resolved.file) === ".md") {
      if (!inspectFile(resolved.file).anchors.has(resolved.fragment)) {
        errors.push({ line, message: `链接锚点不存在: ${target}` });
      }
    }
  }
  return errors;
}

export function validCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function dateErrors(values, { today, requireSourcesChecked = false, maxSourceAge = 120 }) {
  const errors = [];
  for (const key of ["updated", "sources_checked"]) {
    const value = values[key];
    if (!value) {
      if (key === "sources_checked" && requireSourcesChecked) errors.push("AI 页面缺少 sources_checked");
      continue;
    }
    if (!validCalendarDate(value)) {
      errors.push(`${key} 必须使用有效的 YYYY-MM-DD 日期`);
      continue;
    }
    if (value > today) errors.push(`${key} 不能晚于项目时区 Asia/Shanghai 的当前日期`);
    if (key === "sources_checked" && requireSourcesChecked) {
      const ageInDays = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${value}T00:00:00Z`)) / 86_400_000;
      if (ageInDays > maxSourceAge) errors.push(`AI 产品资料超过 ${maxSourceAge} 天未核验`);
    }
  }
  return errors;
}

export function navigationErrors(chinese, english, docsRoot) {
  const errors = [];
  const normalizeRoute = (route) => route.replace(/^\/+|\/+$/g, "");
  for (const [locale, groups] of [["中文", chinese], ["英文", english]]) {
    const routes = new Set();
    const sources = new Set();
    for (const { items } of groups) {
      for (const { link, source } of items) {
        const route = normalizeRoute(link);
        if (routes.has(route)) errors.push(`${locale}导航存在重复路由: ${link}`);
        if (sources.has(source)) errors.push(`${locale}导航存在重复来源: ${source}`);
        routes.add(route);
        sources.add(source);
        const target = resolveContentTarget(join(docsRoot, "README.md"), link, docsRoot);
        if (!target?.file || target.file !== resolve(docsRoot, source)) {
          errors.push(`${locale}导航链接与来源不一致: ${link} -> ${source}`);
        }
      }
    }
  }
  if (chinese.length !== english.length) errors.push("中英文导航分组数量不一致");
  for (let index = 0; index < Math.min(chinese.length, english.length); index += 1) {
    const zhItems = chinese[index].items;
    const enItems = english[index].items;
    if (zhItems.length !== enItems.length) errors.push(`中英文导航第 ${index + 1} 组条目数量不一致`);
    for (let itemIndex = 0; itemIndex < Math.min(zhItems.length, enItems.length); itemIndex += 1) {
      const zh = zhItems[itemIndex];
      const en = enItems[itemIndex];
      if (normalizeRoute(en.link) !== normalizeRoute(`/en/${normalizeRoute(zh.link)}`) || en.source !== `en/${zh.source}`) {
        errors.push(`中英文导航顺序或来源不一致: ${zh.link} vs ${en.link}`);
      }
    }
  }
  return errors;
}
