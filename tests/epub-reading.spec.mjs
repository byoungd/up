import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import { enNavigation, publicationChapterCount, zhNavigation } from "../docs/.vitepress/navigation.mjs";

// EPUB readers lay reflowable XHTML into their own viewport; mobile browser
// emulation would otherwise impose a 980px page viewport on standalone files.
test.use({ isMobile: false });

for (const [language, label] of [["zh", "Chinese"], ["en", "English"]]) {
  test(`${label} EPUB content reads offline at 320 CSS pixels`, async ({ page, context }, testInfo) => {
    test.setTimeout(120_000);
    const staging = mkdtempSync(join(tmpdir(), `life-guide-epub-reading-${language}-`));
    try {
      execFileSync("unzip", ["-q", resolve(`docs/public/downloads/life-level-up-guide-${language}.epub`), "-d", staging]);
      const root = join(staging, "OEBPS");
      const textDir = join(root, "text");
      const files = [join(root, "nav.xhtml"), ...readdirSync(textDir).filter((file) => file.endsWith(".xhtml")).map((file) => join(textDir, file))];
      expect(files).toHaveLength(publicationChapterCount(language === "zh" ? zhNavigation : enNavigation) + 3);
      await page.setViewportSize({ width: 320, height: 760 });
      await context.setOffline(true);
      for (const file of files) {
        await test.step(file.slice(root.length + 1), async () => {
          await page.goto(pathToFileURL(file).href);
          await expect(page.locator("parsererror, button, [v-pre]")).toHaveCount(0);
          const state = await page.evaluate(async () => {
            await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
            return {
              viewport: window.innerWidth,
              width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
              missingImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.getAttribute("src")),
            };
          });
          try {
            expect(state.viewport).toBe(320);
            expect(state.missingImages).toEqual([]);
            expect(state.width).toBeLessThanOrEqual(state.viewport + 2);
          } catch (error) {
            await testInfo.attach("epub-reading-failure", { body: await page.screenshot(), contentType: "image/png" });
            throw error;
          }
        });
      }
    } finally {
      await context.setOffline(false);
      rmSync(staging, { recursive: true, force: true });
    }
  });
}
