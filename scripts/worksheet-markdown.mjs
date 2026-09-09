import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { enNavigation, zhNavigation } from "../docs/.vitepress/navigation.mjs";
import { publicRoutePath } from "../docs/.vitepress/routing.mjs";

const site = "https://byoungd.github.io";
const base = "/up/";
const routes = new Map([...zhNavigation, ...enNavigation].flatMap(({ items }) => items.map(({ source, link }) => [source, link])));
const parse = (source) => fromMarkdown(source, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });

function preserveFormLines(node) {
  if (!node.children) return;
  if (node.type === "paragraph") {
    node.children = node.children.flatMap((child) => {
      if (child.type !== "text" || !child.value.includes("\n")) return [child];
      return child.value.split("\n").flatMap((value, index) => [
        ...(index ? [{ type: "break" }] : []), { type: "text", value },
      ]);
    });
  }
  node.children.forEach(preserveFormLines);
}

function portableUrl(value, source) {
  if (value.startsWith("#")) return value;
  if (/^(?:https?:|mailto:|tel:|\/\/)/i.test(value)) return value;
  if (/^[a-z][\w+.-]*:/i.test(value)) throw new Error(`Unsupported worksheet link scheme: ${value}`);
  // Site-root paths are relative to the book's deployment base, not its host.
  const url = new URL(value.startsWith("/") ? `${base}${value.replace(/^\/+/, "")}` : value, `${site}${base}${source}`);
  const relative = decodeURIComponent(url.pathname.slice(base.length));
  const route = routes.get(relative);
  if (route) url.pathname = publicRoutePath(route, base);
  return url.href;
}

export function worksheetMarkdown(source, { source: sourcePath, locale }) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const body = frontmatter ? source.slice(frontmatter[0].length) : source;
  const updated = frontmatter?.[1].match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  const tree = parse(body);

  function transform(parent, depth = 1) {
    if (!parent.children) return;
    const result = [];
    for (const child of parent.children) {
      if (child.type === "heading") depth = child.depth;
      if (child.type === "code" && child.lang?.toLowerCase() === "markdown") {
        const form = parse(child.value);
        preserveFormLines(form);
        for (const node of form.children) {
          if (node.type === "heading") node.depth = Math.min(6, depth + node.depth);
        }
        transform(form, depth);
        result.push(...form.children);
        continue;
      }
      if (["link", "image", "definition"].includes(child.type)) child.url = portableUrl(child.url, sourcePath);
      transform(child, depth);
      result.push(child);
    }
    parent.children = result;
  }
  transform(tree);
  const sourceUrl = `${site}${publicRoutePath(routes.get(sourcePath) || sourcePath.replace(/\.md$/, ""), base)}`;
  const credit = locale === "en"
    ? `Source: [Life Level-up Guide](${sourceUrl})${updated ? ` · Manuscript updated: ${updated}` : ""}. Content: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).`
    : `来源：[人生进阶指南](${sourceUrl})${updated ? ` · 稿件更新：${updated}` : ""}。内容许可：[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)。`;
  return `${toMarkdown(tree, { extensions: [gfmToMarkdown()], bullet: "-", fences: true }).trim()}\n\n---\n\n${credit}\n`;
}
