import { expect, test } from "@playwright/test";

async function contrastRatio(locator) {
  return locator.evaluate((element) => {
    const channels = (color) => color.match(/[\d.]+/g).map(Number);
    const luminance = (rgb) => rgb.slice(0, 3).reduce((sum, value, index) => {
      const channel = value / 255;
      return sum + (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index];
    }, 0);
    const foreground = channels(getComputedStyle(element).color);
    let background = [255, 255, 255];
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      const candidate = channels(getComputedStyle(ancestor).backgroundColor);
      if (candidate.length === 3 || candidate[3] === 1) {
        background = candidate;
        break;
      }
    }
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  });
}

for (const colorScheme of ["light", "dark"]) {
  test(`reading links remain legible in the ${colorScheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("./threads/part-1/0-cefr");
    await expect(page.locator("html")).toHaveClass(colorScheme === "dark" ? /\bdark\b/ : /^(?!.*\bdark\b)/);
    const link = page.locator(".vp-doc p a").first();
    await expect.poll(() => contrastRatio(link)).toBeGreaterThanOrEqual(4.5);
    await link.hover();
    await expect.poll(() => contrastRatio(link)).toBeGreaterThanOrEqual(4.5);
  });
}

for (const locale of ["zh", "en"]) {
  test(`${locale} sidebar groups expose their state and work with Space and Enter`, async ({ page }, testInfo) => {
    await page.goto(locale === "en" ? "./en/threads/part-1/0-cefr" : "./threads/part-1/0-cefr");
    if (testInfo.project.name === "mobile-chromium") await page.locator(".VPLocalNav .menu").click();

    const section = page.locator(".VPSidebarItem.collapsible").first();
    const control = section.locator(":scope > .item");
    const children = section.locator(":scope > .items");
    await expect(control).toHaveAttribute("aria-expanded", "true");
    await expect(section.getByRole("button")).toHaveCount(1);
    await expect(control).toHaveAccessibleName(locale === "en" ? "Start Here" : "开始");
    expect(await control.getAttribute("aria-controls")).toBe(await children.getAttribute("id"));

    await control.press("Space");
    await expect(control).toHaveAttribute("aria-expanded", "false");
    await expect(children).toBeHidden();
    await control.press("Enter");
    await expect(control).toHaveAttribute("aria-expanded", "true");
    await expect(children).toBeVisible();
    await section.locator(":scope > .item > .caret").click();
    await expect(control).toHaveAttribute("aria-expanded", "false");
    await expect(children).toBeHidden();
  });
}

test("printing a dark page preserves readable tables, quotations, and code", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./threads/part-1/0-cefr");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.locator(".vp-doc table").first()).toHaveCSS("display", "table");
  for (const selector of [".vp-doc td", ".vp-doc th", ".vp-doc blockquote"]) {
    await expect.poll(() => contrastRatio(page.locator(selector).first()), selector).toBeGreaterThanOrEqual(4.5);
  }

  await page.goto("./en/templates/english-diagnostic");
  await expect(page.locator(".vp-doc table").first()).toBeVisible();
  const clippedCells = await page.locator(".vp-doc th, .vp-doc td").evaluateAll((cells) =>
    cells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
  );
  expect(clippedCells).toBe(0);

  await page.goto("./templates/family-learning-agreement");
  const code = page.locator('.vp-doc [class*="language-"] code span[style]').first();
  await expect(code).toBeAttached();
  await expect.poll(() => contrastRatio(code)).toBeGreaterThanOrEqual(4.5);
});

test("wide reference tables scroll within the article across screen sizes", async ({ page }, testInfo) => {
  const widths = testInfo.project.name === "mobile-chromium" ? [375] : [641, 768, 960, 1024, 1280];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("./en/templates/english-diagnostic");
    await expect(page.locator(".vp-doc table").first()).toBeVisible();
    const dimensions = await page.evaluate(() => {
      const content = document.querySelector(".vp-doc").getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tables: [...document.querySelectorAll(".vp-doc table")].map((table) => ({
          left: table.getBoundingClientRect().left - content.left,
          right: table.getBoundingClientRect().right - content.right,
        })),
      };
    });
    expect(dimensions.overflow, `${width}px document overflow`).toBeLessThanOrEqual(1);
    for (const table of dimensions.tables) {
      expect(table.left).toBeGreaterThanOrEqual(-1);
      expect(table.right).toBeLessThanOrEqual(1);
    }
    const search = page.getByRole("button", { name: "Search", exact: true });
    await expect(search).toBeInViewport();
    const wideTable = page.locator(".vp-doc table").filter({ has: page.locator("tr > th:nth-child(7)") }).first();
    await wideTable.evaluate((table) => { table.scrollLeft = table.scrollWidth; });
    await expect.poll(() => wideTable.evaluate((table) => table.scrollLeft)).toBeGreaterThan(0);
  }
});
