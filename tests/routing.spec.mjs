import { expect, test } from "@playwright/test";
import { bilingualRoutePairs } from "../docs/.vitepress/navigation.mjs";
import { publicRoutePath } from "../docs/.vitepress/routing.mjs";

test("canonical URLs and language alternates agree with the sitemap for every page", async ({ request }) => {
  test.setTimeout(60_000);
  const sitemap = await (await request.get("sitemap.xml")).text();
  const routes = bilingualRoutePairs.flatMap(({ zh, en }) => [zh, en].map((route) => ({ route, zh, en })));
  for (let index = 0; index < routes.length; index += 4) {
    await Promise.all(routes.slice(index, index + 4).map(async ({ route, zh, en }) => {
      const path = publicRoutePath(route);
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      const canonical = `https://byoungd.github.io${path}`;
      expect(html, path).toContain(`rel="canonical" href="${canonical}"`);
      expect(sitemap, path).toContain(`<loc>${canonical}</loc>`);
      for (const [language, target] of [["zh-CN", zh], ["en-US", en], ["x-default", zh]]) {
        const alternate = `hreflang="${language}" href="https://byoungd.github.io${publicRoutePath(target)}"`;
        expect(html, path).toContain(alternate);
        expect(sitemap, path).toContain(alternate);
      }
    }));
  }
});

test("legacy Markdown links reach their page and preserve a real section anchor", async ({ page }) => {
  for (const [path, heading] of [
    ["./#/README.md", /人生进阶指南/],
    ["./#/en/README", /Life Level-up Guide/],
    ["./#/threads/part-1/1-understanding.md", /认知篇/],
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveText(heading);
    await expect(page).not.toHaveURL(/#\/|\.md\/?$/);
  }
  const anchor = await page.locator("main h2[id]").first().getAttribute("id");
  await page.goto(`./#/threads/part-1/1-understanding.md?from=legacy&id=${encodeURIComponent(anchor)}`);
  await expect(page).toHaveURL(new RegExp(`\\?from=legacy#${encodeURIComponent(anchor)}$`));
  await expect(page.locator(`[id="${anchor}"]`)).toBeInViewport();
});

test("missing pages are not advertised as indexable book content", async ({ request }) => {
  const html = await (await request.get("404.html")).text();
  expect(html).toContain('name="robots" content="noindex"');
  expect(html).not.toContain('rel="canonical"');
  expect(html).not.toContain('type="application/ld+json"');
});
