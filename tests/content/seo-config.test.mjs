import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

const configPath = new URL("../../docs/.vitepress/config.mts", import.meta.url).href;
const previewOrigin = "https:" + "//preview.example";
const previewRoot = `${previewOrigin}/staging/docs/`;

test("SEO URLs share the normalized origin and base", () => {
  const script = `
    const { default: config } = await import(${JSON.stringify(configPath)});
    const items = config.sitemap.transformItems([
      {
        url: ${JSON.stringify(previewRoot)},
        links: [
          { lang: "zh-CN", url: ${JSON.stringify(previewRoot)} },
          { lang: "en-US", url: ${JSON.stringify(`${previewRoot}en/`)} },
        ],
      },
      {
        url: ${JSON.stringify(`${previewRoot}threads/sample/`)},
        links: [],
      },
    ]);
    console.log(JSON.stringify({ base: config.base, hostname: config.sitemap.hostname, items }));
  `;
  const result = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    env: {
      ...process.env,
      SITE_ORIGIN: "preview.example",
      SITE_BASE: "staging/docs",
    },
  }));

  assert.equal(result.base, "/staging/docs/");
  assert.equal(result.hostname, `${previewRoot}`);
  assert.deepEqual(result.items.map(({ url }) => url), [
    previewRoot,
    `${previewRoot}threads/sample`,
  ]);
  assert.deepEqual(result.items[0].links.map(({ lang, url }) => ({ lang, url })), [
    { lang: "zh-CN", url: previewRoot },
    { lang: "en-US", url: `${previewRoot}en/` },
    { lang: "x-default", url: previewRoot },
  ]);
});

test("blank origin falls back and slash-only base targets the site root", () => {
  const script = `
    const { default: config } = await import(${JSON.stringify(configPath)});
    console.log(JSON.stringify({ base: config.base, hostname: config.sitemap.hostname }));
  `;
  const result = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    env: {
      ...process.env,
      SITE_ORIGIN: "   ",
      SITE_BASE: "///",
    },
  }));

  assert.equal(result.base, "/");
  assert.equal(result.hostname, "https://byoungd.github.io/");
});
