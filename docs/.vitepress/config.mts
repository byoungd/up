import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { defineConfig } from "vitepress";
import { bilingualRoutePairs, enNavigation, toSidebar, zhNavigation } from "./navigation.mjs";
import { worksheetBySource } from "./worksheets.mjs";

const defaultScheme = "https:" + "//";
const normalizeOrigin = (value: string | undefined, fallback: string) => {
  const candidate = value?.trim().replace(/\/+$/, "") || fallback.trim().replace(/\/+$/, "");
  return candidate.includes("://") ? candidate : defaultScheme + candidate;
};
const normalizeBase = (value: string | undefined, fallback: string) => {
  const candidate = (value ?? fallback).trim().replace(/^\/+|\/+$/g, "");
  return candidate ? `/${candidate}/` : "/";
};

const origin = normalizeOrigin(
  process.env.SITE_ORIGIN || process.env.VITEPRESS_ORIGIN || process.env.VITE_SITE_ORIGIN,
  "https://byoungd.github.io",
);
const base = normalizeBase(
  process.env.SITE_BASE || process.env.VITEPRESS_BASE || process.env.VITE_BASE,
  "/up/",
);
const siteUrl = `${origin}${base}`;
const configDir = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(configDir, "..");
const assetsDir = join(docsDir, "assets");
const buildRevision = process.env.GITHUB_SHA || process.env.BUILD_REVISION || "local";
const socialImages: Record<string, { zh: string; en: string }> = {
  "english-learning": { zh: "assets/social/english-zh.png", en: "assets/social/english-en.png" },
  "ai-learning": { zh: "assets/social/ai-zh.png", en: "assets/social/ai-en.png" },
  "real-projects": { zh: "assets/social/projects-zh.png", en: "assets/social/projects-en.png" },
  recovery: { zh: "assets/social/recovery-zh.png", en: "assets/social/recovery-en.png" },
  templates: { zh: "assets/social/templates-zh.png", en: "assets/social/templates-en.png" },
};
const defaultDescription =
  "《人生进阶指南》帮助普通人在 AI 时代持续学习、完成真实项目、穿越人生低谷并留下成长证据。";
const defaultDescriptionEn =
  "Life Level-up Guide helps ordinary people learn continuously, complete real projects, move through difficult seasons, and preserve evidence of growth in the AI era.";
const editLinkPattern = "https://github.com/byoungd/up/edit/main/docs/:path";
const bilingualRouteMap = new Map(
  bilingualRoutePairs.flatMap(({ zh, en }) => [
    [zh, { zh, en }],
    [en, { zh, en }],
  ]),
);

function rasterFiles(directory: string, output: string[] = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) rasterFiles(path, output);
    else if (/\.(?:avif|jpe?g|png|webp)$/i.test(entry.name)) output.push(path);
  }
  return output;
}

const rasterDimensions = new Map(
  await Promise.all(
    rasterFiles(assetsDir).map(async (path) => {
      const { width, height } = await sharp(path).metadata();
      return [path, width && height ? { width, height } : undefined] as const;
    }),
  ),
);

function localImagePath(source: string, pagePath?: string) {
  if (!source || /^(?:[a-z]+:|#)/i.test(source)) return undefined;
  const clean = decodeURIComponent(source.split(/[?#]/, 1)[0]);
  if (clean.startsWith("/")) return resolve(docsDir, clean.replace(/^\/+/, ""));
  if (!pagePath) return undefined;
  return resolve(dirname(pagePath), clean);
}

function absoluteRoute(route: string) {
  return `${siteUrl}${route.replace(/^\/+|\/+$/g, "")}`;
}

function pageUrl(route: string) {
  if (!route) return siteUrl;
  if (route === "en") return `${absoluteRoute(route)}/`;
  return absoluteRoute(route);
}

function normalizeAbsoluteUrl(value: string) {
  const url = new URL(value, siteUrl);
  const siteRootPath = new URL(siteUrl).pathname;
  const englishRootPath = new URL(`${siteUrl}en/`).pathname;
  if (url.pathname !== siteRootPath && url.pathname !== englishRootPath) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.toString();
}

function absoluteAsset(source: unknown, fallback: string) {
  if (typeof source !== "string" || !source.trim()) return fallback;
  const value = source.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return value;
  return `${siteUrl}${value.replace(/^\/+/, "")}`;
}

function metadataValues(value: unknown) {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim());
  }
  return [];
}

const searchHeadingContent = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i;

function splitSearchSections(file: string, html: string) {
  const normalizedFile = file.replaceAll("\\", "/");
  const titleOnly = [
    "/templates/reader-field-note.md",
    "/templates/interview-evidence.md",
    "/templates/grammar-evidence.md",
    "/templates/speaking-evidence.md",
    "/templates/listening-audit.md",
    "/templates/reading-evidence.md",
    "/templates/vocabulary-audit.md",
    "/templates/english-diagnostic.md",
    "/templates/ai-task-brief.md",
    "/templates/ai-learning-log.md",
    "/templates/startup-experiment.md",
    "/templates/consistency-plan.md",
    "/threads/part-2/narrative-and-evidence.md",
    "/threads/part-2/depression-anxiety-recovery.md",
    "/templates/ai-evaluation.md",
    "/threads/part-4/family-learning.md",
    "/threads/part-1/8-job-search-english.md",
    "/threads/part-1/grammar.md",
    "/threads/part-1/5-speaking.md",
    "/threads/part-1/4-reading.md",
    "/threads/part-1/2-vocabulary.md",
    "/threads/part-1/1-understanding.md",
  ].some((suffix) => normalizedFile.endsWith(suffix));
  const headingOnly = normalizedFile.includes("/threads/practice/") ||
    normalizedFile.includes("/topics/") ||
    normalizedFile.endsWith("/resources.md") ||
    normalizedFile.endsWith("/recent-updates.md") || [
    "/projects.md",
    "/book-downloads.md",
    "/docs/practice.md",
    "/docs/en/practice.md",
    "/docs/README.md",
    "/docs/en/README.md",
    "/threads/part-0/reader-guide.md",
    "/threads/part-5/after-90-days.md",
    "/threads/part-5/book-as-proof.md",
    "/templates/toolkit-walkthrough.md",
    "/threads/part-1/3-listening.md",
    "/threads/part-2/care-and-carry-on.md",
  ].some((suffix) => normalizedFile.endsWith(suffix));
  const pageLevelOnly =
    normalizedFile.includes("/templates/") ||
    normalizedFile.includes("/reference/") ||
    normalizedFile.includes("/threads/archive/") ||
    normalizedFile.endsWith("/threads/part-2/x-misc.md") ||
    normalizedFile.endsWith("/threads/part-2/narrative-and-evidence.md") ||
    normalizedFile.endsWith("/threads/part-2/entrepreneurship.md") ||
    normalizedFile.endsWith("/threads/part-2/relationships.md") ||
    normalizedFile.endsWith("/threads/part-2/depression-anxiety-recovery.md") ||
    normalizedFile.endsWith("/threads/part-2/communication.md") ||
    normalizedFile.endsWith("/threads/part-2/care-and-carry-on.md") ||
    normalizedFile.endsWith("/threads/part-2/return-to-life.md") ||
    normalizedFile.endsWith("/threads/part-2/decision.md") ||
    normalizedFile.includes("/threads/part-1/") ||
    normalizedFile.includes("/threads/word-list/");
  const levels = titleOnly ? "1" : headingOnly ? "12" : pageLevelOnly ? "1" : "12";
  const headings = [
    ...html.matchAll(new RegExp(`<h([${levels}]).*?>(.*?<a.*? href="#.*?".*?>.*?<\\/a>)<\\/h\\1>`, "gi")),
  ];
  let pageTitle = "";
  return headings.flatMap((match, index) => {
    const level = Number(match[1]);
    const heading = searchHeadingContent.exec(match[2]);
    const title = (heading?.[1] || "").replace(/<[^>]*>/g, "").trim();
    const anchor = heading?.[2] || "";
    const contentStart = (match.index || 0) + match[0].length;
    const contentEnd = headings[index + 1]?.index ?? html.length;
    // These navigation-heavy home pages and long-form chapters have descriptive headings; indexing
    // those headings keeps every concept discoverable without duplicating each full page in the client bundle.
    const text = titleOnly || headingOnly
      ? title
      : html.slice(contentStart, contentEnd).replace(/<[^>]*>/g, "").trim();
    if (!title || !text) return [];
    if (level === 1) pageTitle = title;
    return [{ anchor, titles: level === 1 ? [title] : [pageTitle, title].filter(Boolean), text }];
  });
}

function routeFromRelativePath(relativePath: string) {
  const clean = relativePath
    .replace(/(^|\/)(README|index)\.md$/, "$1")
    .replace(/\.md$/, "")
    .replace(/^index$/, "");
  return clean.replace(/^\/+|\/+$/g, "");
}

function privateAssetGuard() {
  let outDir = "";
  const isPrivateSession = (url = "") => {
    const pathname = decodeURIComponent(url.split("?")[0]);
    return pathname === "/assets/session.json" || pathname.endsWith("/assets/session.json");
  };

  return {
    name: "private-asset-guard",
    enforce: "post" as const,
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { statusCode: number; end: (body: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (!isPrivateSession(req.url)) {
          next();
          return;
        }
        res.statusCode = 404;
        res.end("Not found");
      });
    },
    closeBundle() {
      if (!outDir) return;
      const generatedPath = resolve(outDir, "assets/session.json");
      if (existsSync(generatedPath)) rmSync(generatedPath);
    },
  };
}

const legacyHashRedirect = `
(function () {
  var hash = window.location.hash || '';
  if (!hash.startsWith('#/')) return;
  var raw = hash.slice(2).split('?id=')[0].split('#')[0];
  var clean = raw.replace(/^\\/+|\\/+$/g, '').replace(/\\/README(?:\\.md)?$/i, '');
  var target = '${base}' + (clean ? clean + '/' : '');
  if (window.location.pathname + window.location.search !== target) window.location.replace(target);
})();`;

export default defineConfig({
  lang: "zh-CN",
  title: "人生进阶指南｜AI 时代终身学习",
  description: defaultDescription,
  base,
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ["SUMMARY.md", "en/SUMMARY.md"],
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => !item.url.includes("public/downloads/worksheets/")).map((item) => {
        const links = (item.links || []).map((link) => ({ ...link, url: normalizeAbsoluteUrl(link.url) }));
        const url = normalizeAbsoluteUrl(item.url);
        const languageOf = ({ lang, hreflang }: { lang: string; hreflang?: string }) => lang || hreflang;
        const chinese = links.find((link) => languageOf(link) === "zh-CN");
        if (!chinese || links.some((link) => languageOf(link) === "x-default")) return { ...item, url, links };
        return {
          ...item,
          url,
          links: [...links, { lang: "x-default", hreflang: "x-default", url: chinese.url }],
        };
      });
    },
  },
  markdown: {
    config(md) {
      md.core.ruler.after("inline", "defer-content-images", (state) => {
        for (const token of state.tokens) {
          if (token.type !== "inline" || !token.children) continue;
          for (const child of token.children) {
            if (child.type !== "image") continue;
            child.attrSet("loading", "lazy");
            child.attrSet("decoding", "async");
            const path = localImagePath(child.attrGet("src") || "", state.env.path);
            const dimensions = path ? rasterDimensions.get(path) : undefined;
            if (dimensions) {
              child.attrSet("width", String(dimensions.width));
              child.attrSet("height", String(dimensions.height));
            }
          }
        }
      });
    },
  },
  vite: { plugins: [privateAssetGuard()] },
  rewrites: {
    "README.md": "index.md",
    "en/README.md": "en/index.md",
    "threads/archive/README.md": "threads/archive/index.md",
    "en/threads/archive/README.md": "en/threads/archive/index.md",
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: `${base}assets/logo.svg` }],
    ["meta", { name: "theme-color", content: "#1f6f5c" }],
    ["meta", { name: "author", content: "Han Xiankai / 韩先凯 (Li Pu / 离谱) and contributors" }],
    ["meta", { name: "build-revision", content: buildRevision }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["script", {}, legacyHashRedirect],
  ],
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      title: "人生进阶指南｜AI 时代终身学习",
      description: defaultDescription,
      themeConfig: {
        siteTitle: "人生进阶指南",
        nav: [
          { text: "终身学习", link: "/templates/learning-state" },
          { text: "AI 学习", link: "/threads/part-3/1-ai-learning" },
          { text: "实践路线", link: "/practice" },
          { text: "英语专题", link: "/threads/part-1/0-cefr" },
        ],
        sidebar: toSidebar(zhNavigation),
        outline: { label: "本页目录", level: [2, 3] },
        docFooter: { prev: "上一篇", next: "下一篇" },
        editLink: { pattern: editLinkPattern, text: "编辑本页" },
        lastUpdated: { text: "最后更新" },
        returnToTopLabel: "返回顶部",
        sidebarMenuLabel: "目录",
        darkModeSwitchLabel: "外观",
        lightModeSwitchTitle: "切换到浅色模式",
        darkModeSwitchTitle: "切换到深色模式",
        langMenuLabel: "切换语言",
        skipToContentLabel: "跳转到正文",
        notFound: {
          title: "页面没有找到",
          quote: "有时不是路消失了，只是这一页已经搬走。回到主线，继续向前。",
          linkLabel: "返回《人生进阶指南》首页",
          linkText: "返回首页",
        },
      },
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      title: "Life Level-up Guide | Lifelong Learning in the AI Era",
      description: defaultDescriptionEn,
      themeConfig: {
        siteTitle: "Life Level-up Guide",
        nav: [
          { text: "Lifelong Learning", link: "/en/templates/learning-state" },
          { text: "AI Learning", link: "/en/threads/part-3/1-ai-learning" },
          { text: "Practice Map", link: "/en/practice" },
          { text: "English", link: "/en/threads/part-1/0-cefr" },
        ],
        sidebar: toSidebar(enNavigation),
        outline: { label: "On this page", level: [2, 3] },
        docFooter: { prev: "Previous", next: "Next" },
        editLink: { pattern: editLinkPattern, text: "Edit this page" },
        lastUpdated: { text: "Last updated" },
        returnToTopLabel: "Back to top",
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        lightModeSwitchTitle: "Switch to light theme",
        darkModeSwitchTitle: "Switch to dark theme",
        langMenuLabel: "Change language",
        skipToContentLabel: "Skip to content",
        notFound: {
          title: "PAGE NOT FOUND",
          quote: "Sometimes the road remains after a page has moved. Return to the guide and continue from there.",
          linkLabel: "Return to the Life Level-up Guide home page",
          linkText: "Return home",
        },
        footer: {
          message: "Content CC BY-NC 4.0; site and tooling code MIT.",
          copyright: "Copyright © 2017-present byoungd and contributors",
        },
      },
    },
  },
  themeConfig: {
    logo: "/assets/logo.svg",
    siteTitle: "人生进阶指南",
    search: {
      provider: "local",
      options: {
        _render(src, env, md) {
          if (env.relativePath.startsWith("public/downloads/worksheets/")) return "";
          const contentTokens = md
            .parse(src, env)
            .filter(({ type }) => type !== "fence" && type !== "code_block");
          const searchableTokens = [];
          const bibliographyHeadings = new Set([
            "参考资料",
            "Sources",
            "推荐的参考书",
            "Reference Book",
            "单独推荐的 YouTube 视频",
            "A Few Specific YouTube Videos",
            "按任务选择英语学习材料",
            "English Learning Resources by Task",
            "英文原版书推荐",
            "Recommended English Books",
            "微信公众号",
            "WeChat Official Accounts",
            "社区与技术文章",
            "Communities and Technical Articles",
          ]);
          let skipBibliography = false;
          for (let index = 0; index < contentTokens.length; index += 1) {
            const token = contentTokens[index];
            if (token.type === "heading_open" && token.tag === "h2") {
              const title = contentTokens[index + 1]?.content?.trim();
              skipBibliography = bibliographyHeadings.has(title);
            }
            if (!skipBibliography) searchableTokens.push(token);
          }
          return md.renderer.render(searchableTokens, md.options, env);
        },
        miniSearch: {
          _splitIntoSections(file, html) {
            return splitSearchSections(file, html);
          },
        },
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索", buttonAriaLabel: "搜索" },
              modal: {
                displayDetails: "显示详细结果",
                resetButtonTitle: "清除搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "没有找到相关内容",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "按回车键选择",
                  navigateText: "切换",
                  navigateUpKeyAriaLabel: "按上箭头选择上一项",
                  navigateDownKeyAriaLabel: "按下箭头选择下一项",
                  closeText: "关闭",
                  closeKeyAriaLabel: "按 Esc 键关闭",
                },
              },
            },
          },
        },
      },
    },
    footer: {
      message: "正文 CC BY-NC 4.0；站点与工具代码 MIT。",
      copyright: "Copyright © 2017-present byoungd and contributors",
    },
  },
  transformPageData(pageData) {
    const worksheet = worksheetBySource.get(pageData.relativePath);
    if (worksheet) {
      pageData.frontmatter.worksheetDownload = { url: worksheet.download, name: worksheet.name };
    }
    const updated = pageData.frontmatter.updated;
    const timestamp =
      updated instanceof Date
        ? updated.getTime()
        : typeof updated === "string"
          ? Date.parse(`${updated}T00:00:00Z`)
          : Number.NaN;
    if (Number.isFinite(timestamp)) {
      pageData.lastUpdated = timestamp;
    }
  },
  transformHead({ pageData }) {
    const route = routeFromRelativePath(pageData.relativePath);
    const canonical = pageUrl(route);
    const languagePair = bilingualRouteMap.get(route);
    const isEnglish = route === "en" || route.startsWith("en/");
    const isBookHome = route === "" || route === "en";
    const isChapter = route.startsWith("threads/") || route.includes("/threads/");
    const topics = metadataValues(pageData.frontmatter.topic);
    const intents = metadataValues(pageData.frontmatter.intent);
    const title = pageData.title ||
      (isEnglish ? "Life Level-up Guide | Lifelong Learning in the AI Era" : "人生进阶指南｜AI 时代终身学习");
    const description =
      pageData.frontmatter.description ||
      `${title}. ${isEnglish ? defaultDescriptionEn : defaultDescription}`;
    const defaultImage = `${siteUrl}assets/${isEnglish ? "feature-en.png" : "feature.png"}`;
    const inferredTopic = typeof pageData.frontmatter.topic === "string" ? pageData.frontmatter.topic : undefined;
    const inferredImage = inferredTopic ? socialImages[inferredTopic]?.[isEnglish ? "en" : "zh"] : undefined;
    const routeImage = inferredImage || (route.includes("/recovery") ? socialImages.recovery[isEnglish ? "en" : "zh"] : undefined) ||
      (route.endsWith("/toolkit") ? socialImages.templates[isEnglish ? "en" : "zh"] : undefined);
    const image = absoluteAsset(pageData.frontmatter.socialImage || routeImage, defaultImage);
    const imageAlt = (typeof pageData.frontmatter.socialImageAlt === "string" && pageData.frontmatter.socialImageAlt.trim()) ||
      (isEnglish ? "Life Level-up Guide book sharing cover" : "《人生进阶指南》书籍分享封面");
    const bookName = isEnglish ? "Life Level-up Guide" : "人生进阶指南";
    const bookUrl = pageUrl(isEnglish ? "en" : "");
    const updated = pageData.frontmatter.updated;
    const dateModified =
      updated instanceof Date
        ? updated.toISOString().slice(0, 10)
        : typeof updated === "string"
          ? updated.slice(0, 10)
          : undefined;
    const published = pageData.frontmatter.datePublished;
    const datePublished =
      published instanceof Date
        ? published.toISOString().slice(0, 10)
        : typeof published === "string"
          ? published.slice(0, 10)
          : undefined;
    const requestedSchema = pageData.frontmatter.schema;
    const schemaProperties = requestedSchema && typeof requestedSchema === "object" && !Array.isArray(requestedSchema)
      ? requestedSchema as Record<string, unknown>
      : {};
    const schemaType =
      (typeof requestedSchema === "string" && requestedSchema.trim()) ||
      (typeof schemaProperties["@type"] === "string" && schemaProperties["@type"]) ||
      (isBookHome ? "Book" : isChapter ? "Chapter" : "WebPage");
    const structuredData: Record<string, unknown> = {
      ...schemaProperties,
      "@context": "https://schema.org",
      "@type": schemaType,
      name: isBookHome ? bookName : title,
      headline: title,
      description,
      url: canonical,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      image,
      ...(topics.length ? { about: topics.map((name) => ({ "@type": "Thing", name })) } : {}),
      ...(topics.length ? { articleSection: topics } : {}),
      ...(topics.length || intents.length ? { keywords: [...topics, ...intents] } : {}),
      ...(intents.length ? { educationalUse: intents } : {}),
      inLanguage: isEnglish ? "en-US" : "zh-CN",
      author: {
        "@type": "Person",
        name: isEnglish ? "Han Xiankai" : "韩先凯",
        alternateName: isEnglish ? ["Li Pu", "韩先凯", "离谱"] : ["离谱", "Han Xiankai", "Li Pu"],
      },
      license: "https://creativecommons.org/licenses/by-nc/4.0/",
      ...(isBookHome
        ? {
            alternateName: isEnglish ? "人生进阶指南" : "Life Level-up Guide",
            bookFormat: "https://schema.org/EBook",
            encoding: [
              {
                "@type": "MediaObject",
                encodingFormat: "application/epub+zip",
                contentUrl: `${siteUrl}downloads/life-level-up-guide-${isEnglish ? "en" : "zh"}.epub`,
              },
              {
                "@type": "MediaObject",
                encodingFormat: "application/pdf",
                contentUrl: `${siteUrl}downloads/life-level-up-guide-${isEnglish ? "en" : "zh"}.pdf`,
              },
            ],
          }
        : {
            isPartOf: {
              "@type": "Book",
              name: bookName,
              url: bookUrl,
            },
          }),
      ...(dateModified ? { dateModified } : {}),
      ...(datePublished ? { datePublished } : {}),
    };
    const jsonLd = JSON.stringify(structuredData).replaceAll("<", "\\u003c");
    const alternateLinks = languagePair
      ? [
          ["link", { rel: "alternate", hreflang: "zh-CN", href: pageUrl(languagePair.zh) }],
          ["link", { rel: "alternate", hreflang: "en-US", href: pageUrl(languagePair.en) }],
          ["link", { rel: "alternate", hreflang: "x-default", href: pageUrl(languagePair.zh) }],
        ]
      : [];
    return [
      ["link", { rel: "canonical", href: canonical }],
      ...alternateLinks,
      ["meta", { property: "og:type", content: isBookHome ? "book" : "article" }],
      ["meta", { property: "og:site_name", content: bookName }],
      ["meta", { property: "og:locale", content: isEnglish ? "en_US" : "zh_CN" }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:image", content: image }],
      ["meta", { property: "og:image:type", content: "image/png" }],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "630" }],
      ["meta", { property: "og:image:alt", content: imageAlt }],
      ...(topics.length ? [["meta", { name: "keywords", content: topics.join(", ") }] as const] : []),
      ...(intents.length ? [["meta", { name: "intent", content: intents.join(", ") }] as const] : []),
      ...(dateModified ? [["meta", { property: "article:modified_time", content: `${dateModified}T00:00:00Z` }] as const] : []),
      ...(datePublished
        ? [["meta", { property: "article:published_time", content: `${datePublished}T00:00:00Z` }] as const]
        : []),
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: image }],
      ["meta", { name: "twitter:image:alt", content: imageAlt }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["script", { type: "application/ld+json" }, jsonLd],
    ];
  },
});
