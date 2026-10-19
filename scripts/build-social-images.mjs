#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "docs", "public", "assets", "social");
const checkOnly = process.argv.includes("--check");

const themes = [
  {
    slug: "english",
    bg: "#E7F0EA",
    accent: "#23665C",
    pale: "#A9CEC0",
    signal: "#E5A83B",
    zh: { label: "ENGLISH SKILLS", lines: ["英语能力", "诊断与复测"], detail: "听 · 说 · 读 · 写   |   先留证据，再看变化" },
    en: { label: "ENGLISH SKILLS", lines: ["English baseline", "and retest"], detail: "Listening · Speaking · Reading · Writing" },
  },
  {
    slug: "ai",
    bg: "#F2E9DD",
    accent: "#9A4E2F",
    pale: "#DCA77F",
    signal: "#326D69",
    zh: { label: "AI LEARNING", lines: ["AI 学习", "可靠工作流"], detail: "来源 · 验收 · 成本 · 人工复核" },
    en: { label: "AI LEARNING", lines: ["AI learning", "that delivers"], detail: "Sources · acceptance · cost · human review" },
  },
  {
    slug: "projects",
    bg: "#E9EEF4",
    accent: "#355D85",
    pale: "#AFC4DB",
    signal: "#D59A37",
    zh: { label: "REAL PROJECTS", lines: ["真实项目", "从问题到交付"], detail: "求职 · 协作 · 用户验证 · 可见作品" },
    en: { label: "REAL PROJECTS", lines: ["From real", "problem to proof"], detail: "Jobs · collaboration · user validation · work" },
  },
  {
    slug: "recovery",
    bg: "#E8EFE9",
    accent: "#4C765F",
    pale: "#B6CCB9",
    signal: "#CB765E",
    zh: { label: "RECOVERY & RHYTHM", lines: ["恢复也需要", "节律与边界"], detail: "先照顾安全与容量，再增加可承担的行动" },
    en: { label: "RECOVERY & RHYTHM", lines: ["Recovery needs", "rhythm and room"], detail: "Care for safety and capacity before adding load" },
  },
  {
    slug: "templates",
    bg: "#F0E8E5",
    accent: "#854C48",
    pale: "#D8B9AD",
    signal: "#44746D",
    zh: { label: "PRACTICE TEMPLATES", lines: ["把经验留下", "成为行动证据"], detail: "基线 · 练习 · 复测 · 下一步" },
    en: { label: "PRACTICE TEMPLATES", lines: ["Turn practice", "into evidence"], detail: "Baseline · practice · retest · next step" },
  },
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function motif(theme, slug) {
  if (slug === "english") {
    return `<circle cx="204" cy="315" r="128" fill="${theme.pale}"/><circle cx="204" cy="315" r="84" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="3"/><path d="M112 315h34l17-38 28 76 25-55 20 34h46" fill="none" stroke="${theme.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="330" cy="202" r="20" fill="${theme.signal}"/><circle cx="89" cy="215" r="9" fill="${theme.accent}"/>`;
  }
  if (slug === "ai") {
    return `<path d="M100 382 178 246 272 332 354 190" fill="none" stroke="${theme.accent}" stroke-width="5" stroke-dasharray="9 11"/><circle cx="100" cy="382" r="26" fill="${theme.signal}"/><circle cx="178" cy="246" r="34" fill="${theme.pale}" stroke="${theme.accent}" stroke-width="3"/><circle cx="272" cy="332" r="30" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="3"/><circle cx="354" cy="190" r="24" fill="${theme.accent}"/><path d="M178 246v-75m94 161 55 63" stroke="${theme.signal}" stroke-width="4"/>`;
  }
  if (slug === "projects") {
    return `<path d="M90 412c52-8 45-132 108-132s54 103 114 103 38-157 111-176" fill="none" stroke="${theme.accent}" stroke-width="8" stroke-linecap="round"/><circle cx="90" cy="412" r="18" fill="${theme.signal}"/><circle cx="198" cy="280" r="20" fill="${theme.pale}" stroke="${theme.accent}" stroke-width="4"/><circle cx="312" cy="383" r="20" fill="${theme.pale}" stroke="${theme.accent}" stroke-width="4"/><circle cx="423" cy="207" r="24" fill="${theme.signal}"/><path d="m410 207 9 9 18-20" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (slug === "recovery") {
    return `<path d="M60 420h410" stroke="${theme.accent}" stroke-width="3"/><circle cx="263" cy="282" r="100" fill="${theme.pale}"/><path d="M75 420c50-36 88-60 135-60 36 0 52 17 83 17 45 0 65-46 112-46 26 0 45 9 65 22" fill="none" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round"/><path d="M122 330c25-45 62-70 110-75" fill="none" stroke="${theme.signal}" stroke-width="10" stroke-linecap="round"/><circle cx="380" cy="199" r="13" fill="${theme.signal}"/>`;
  }
  return `<rect x="98" y="174" width="290" height="256" rx="10" fill="${theme.pale}"/><rect x="124" y="148" width="290" height="256" rx="10" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="4"/><path d="M166 218h182M166 264h182M166 310h132" stroke="${theme.accent}" stroke-width="5" stroke-linecap="round"/><rect x="166" y="345" width="20" height="20" rx="3" fill="${theme.signal}"/><path d="m171 355 5 5 10-12" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/><circle cx="385" cy="370" r="32" fill="${theme.signal}"/><path d="m372 370 9 9 17-20" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function svg(theme, language) {
  const content = theme[language];
  const titleSize = language === "en" ? 49 : 58;
  const lines = content.lines.map((line, index) => `<text x="590" y="${275 + index * 76}" font-size="${titleSize}" font-weight="700" fill="#202B2B">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${theme.bg}"/>
<path d="M0 0h1200v630H0z" fill="none" stroke="${theme.accent}" stroke-width="2" opacity=".16"/>
<path d="M0 0h28v630H0z" fill="${theme.accent}"/>
<g>${motif(theme, theme.slug)}</g>
<text x="590" y="150" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="20" font-weight="700" letter-spacing="2" fill="${theme.accent}">${escapeXml(content.label)}</text>
${lines}
<path d="M590 438h500" stroke="${theme.accent}" stroke-width="2" opacity=".35"/>
<text x="590" y="485" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="22" fill="#394544">${escapeXml(content.detail)}</text>
<text x="590" y="553" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="16" font-weight="700" letter-spacing="1" fill="${theme.accent}">${language === "zh" ? "人生进阶指南  /  韩先凯" : "LIFE LEVEL-UP GUIDE  /  HAN XIANKAI"}</text>
</svg>`;
}

async function build() {
  const stale = [];
  for (const theme of themes) {
    for (const language of ["zh", "en"]) {
      const file = join(OUTPUT_DIR, `${theme.slug}-${language}.png`);
      if (checkOnly) {
        try {
          const metadata = await sharp(file).metadata();
          if (metadata.format === "png" && metadata.width === 1200 && metadata.height === 630) continue;
        } catch {
          // Report missing or unreadable assets in the shared validation result.
        }
        stale.push(file);
        continue;
      }

      const buffer = await sharp(Buffer.from(svg(theme, language))).png().toBuffer();
      mkdirSync(dirname(file), { recursive: true });
      if (!existsSync(file) || !readFileSync(file).equals(buffer)) {
        writeFileSync(file, buffer);
        console.log(`updated ${file.replace(`${ROOT}/`, "")}`);
      }
    }
  }
  if (stale.length) {
    console.error(`Social images must be readable 1200x630 PNG files: ${stale.map((file) => file.replace(`${ROOT}/`, "")).join(", ")}`);
    process.exitCode = 1;
  } else if (checkOnly) {
    console.log("Social images are readable 1200x630 PNG files");
  }
}

await build();
