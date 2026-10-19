#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { enNavigation, zhNavigation } from "../docs/.vitepress/navigation.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const OUTPUT = join(DOCS, "public", "feeds", "updates.xml");
const CHANGELOG = join(ROOT, "CHANGELOG.md");
const zhUpdatesOutput = join(DOCS, "recent-updates.md");
const enUpdatesOutput = join(DOCS, "en", "recent-updates.md");
const configuredOrigin = process.env.SITE_ORIGIN || process.env.VITEPRESS_ORIGIN || process.env.VITE_SITE_ORIGIN || "byoungd.github.io";
const normalizedOrigin = /^https?:\/\//i.test(configuredOrigin) ? configuredOrigin : `https://${configuredOrigin}`;
const rawBase = process.env.SITE_BASE || process.env.VITEPRESS_BASE || process.env.VITE_BASE || "/up/";
const normalizedBase = !rawBase || rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;
const SITE_URL = `${normalizedOrigin.replace(/\/+$/, "")}${normalizedBase}`;
const CHANGELOG_URL = "https:" + "//github.com/byoungd/up/blob/main/CHANGELOG.md";
const MAX_ITEMS = 20;
const checkOnly = process.argv.includes("--check");

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

function frontmatter(source) {
  const text = readFileSync(join(DOCS, source), "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!field) continue;
    fields[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return fields;
}

function routeUrl(link) {
  const route = link.replace(/^\/+/, "").replace(/\/+$/, "");
  return route ? `${SITE_URL}${route}` : SITE_URL;
}

function feedItems() {
  return [...recentItems("zh"), ...recentItems("en")]
    .sort((left, right) => right.updated.localeCompare(left.updated) || left.url.localeCompare(right.url))
    .slice(0, MAX_ITEMS * 2);
}

function changelogItems(language) {
  const lines = readFileSync(CHANGELOG, "utf8").split("\n");
  const items = [];
  let date = "";
  let sectionLanguage = "";
  for (const line of lines) {
    const dateHeading = line.match(/^## (\d{4}-\d{2}-\d{2})\s*$/);
    if (dateHeading) {
      date = dateHeading[1];
      sectionLanguage = "";
      continue;
    }
    if (/^## /.test(line)) {
      date = "";
      sectionLanguage = "";
      continue;
    }
    const languageHeading = line.match(/^### (zh-CN|en-US)\s*$/);
    if (languageHeading) {
      sectionLanguage = languageHeading[1];
      continue;
    }
    const bullet = line.match(/^- (.+)$/);
    if (!bullet) continue;
    if (!date) continue;
    const inferredLanguage = sectionLanguage || (/\p{Script=Han}/u.test(bullet[1]) ? "zh-CN" : "en-US");
    if (inferredLanguage !== (language === "en" ? "en-US" : "zh-CN")) continue;
    items.push({
      title: language === "en" ? "Project update" : "项目更新",
      description: bullet[1],
      updated: date,
      url: CHANGELOG_URL,
      language: inferredLanguage,
    });
  }
  return items;
}

function recentItems(language) {
  const groups = language === "en" ? enNavigation : zhNavigation;
  const seen = new Set();
  const pages = groups
    .flatMap((group) => group.items)
    .filter((item) => {
      if (seen.has(item.source) || item.source.endsWith("recent-updates.md")) return false;
      seen.add(item.source);
      return true;
    })
    .map((item) => {
      const meta = frontmatter(item.source);
      if (!meta.updated || !meta.title || !meta.description) return null;
      return {
        title: meta.title,
        description: meta.description,
        updated: meta.updated,
        url: routeUrl(item.link),
        pageLink: `.${item.link.replace(/^\/en/, "") || "/"}`,
        language: language === "en" ? "en-US" : "zh-CN",
      };
    })
    .filter(Boolean);
  return [...changelogItems(language), ...pages]
    .sort((left, right) => right.updated.localeCompare(left.updated) || left.url.localeCompare(right.url))
    .slice(0, MAX_ITEMS);
}

function atomDate(date) {
  return `${date}T00:00:00+08:00`;
}

function buildFeed() {
  const items = feedItems();
  const latest = items[0]?.updated ?? "2026-01-01";
  const entries = items.map((item) => `  <entry>
    <title xml:lang="${item.language}">${escapeXml(item.title)}</title>
    <id>${escapeXml(item.url)}</id>
    <link href="${escapeXml(item.url)}" />
    <updated>${atomDate(item.updated)}</updated>
    <summary xml:lang="${item.language}">${escapeXml(item.description)}</summary>
  </entry>`).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">
  <title>人生进阶指南 / Life Level-up Guide</title>
  <subtitle>英语、AI 学习、真实项目与长期改变的近期更新</subtitle>
  <id>${SITE_URL}feeds/updates.xml</id>
  <link href="${SITE_URL}feeds/updates.xml" rel="self" />
  <link href="${SITE_URL}" />
  <updated>${atomDate(latest)}</updated>
${entries}
</feed>
`;
}

function relativeRecentLink(item) {
  return item.pageLink || "./";
}

function buildRecentPage(language) {
  const isEnglish = language === "en";
  const items = recentItems(language);
  const latest = items[0]?.updated ?? "2026-01-01";
  const title = isEnglish ? "Recent Updates | Life Level-up Guide" : "最近更新｜人生进阶指南";
  const description = isEnglish
    ? "Recent changes from the Life Level-up Guide changelog and page review dates, with links to bilingual topic hubs and practice pages."
    : "从项目变更日志和页面复核日期生成的近期更新，连接英语、AI、真实项目与实践入口。";
  const heading = isEnglish ? "# Recent Updates" : "# 最近更新";
  const intro = isEnglish
    ? "This list combines dated project changes from the changelog with the latest reviewed pages."
    : "本页合并项目变更日志与页面 updated 日期，列出最近二十条更新，方便返回继续实践。";
  const entries = items.map((item) => {
    const target = item.pageLink || item.url;
    const summary = item.description.replaceAll("\\n", " ");
    return `- **${item.updated}** · [${item.title}](${target})${summary ? ` — ${summary}` : ""}`;
  }).join("\n");
  const followup = isEnglish
    ? `## Continue\n\n- [English Diagnostic Hub](topics/english-diagnostic.md)\n- [AI Learning Workflow Hub](topics/ai-learning-workflows.md)\n- [Real Projects, Jobs, and Entrepreneurship](topics/real-projects.md)\n- [Third-party Resources](resources.md)\n\nSubscribe to the [Atom feed](${SITE_URL}feeds/updates.xml).`
    : `## 按主题继续\n\n- [英语能力诊断入口](topics/english-diagnostic.md)\n- [AI 学习工作流入口](topics/ai-learning-workflows.md)\n- [真实项目、求职与创业入口](topics/real-projects.md)\n- [第三方资源目录](resources.md)\n\n订阅 [Atom feed](${SITE_URL}feeds/updates.xml) 获取机器可读更新。`;
  return `---\ntitle: ${title}\ndescription: ${description}\nupdated: ${latest}\n---\n\n${heading}\n\n${intro}\n\n## ${isEnglish ? "Latest 20 updates" : "最近二十条"}\n\n${entries}\n\n${followup}\n`;
}

const outputs = new Map([
  [OUTPUT, buildFeed()],
  [zhUpdatesOutput, buildRecentPage("zh")],
  [enUpdatesOutput, buildRecentPage("en")],
]);
if (checkOnly) {
  const stale = [...outputs].filter(([file, expected]) => !existsSync(file) || readFileSync(file, "utf8") !== expected);
  if (stale.length) {
    for (const [file] of stale) console.error(`${file.replace(`${ROOT}/`, "")}: generated update output is not up to date`);
    process.exit(1);
  }
  console.log("Recent updates pages and Atom feed are up to date");
} else {
  for (const [file, expected] of outputs) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, expected);
    console.log(`updated ${file.replace(`${ROOT}/`, "")}`);
  }
}
