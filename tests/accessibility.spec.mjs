import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const accessibilityTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const representativeRoutes = [
  "./",
  "./en/",
  "./threads/part-1/0-cefr",
  "./en/threads/part-1/0-cefr",
  "./templates/family-learning-agreement",
  "./templates/learning-state",
  "./en/templates/learning-state",
  "./en/templates/english-diagnostic",
];

async function expectAccessible(page) {
  const result = await new AxeBuilder({ page }).withTags(accessibilityTags).analyze();
  expect(result.violations).toEqual([]);
}

for (const colorScheme of ["light", "dark"]) {
  for (const route of representativeRoutes) {
    test(`${colorScheme} accessibility of ${route}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(route);
      await expect(page.locator(".VPSidebarItem .caret").first()).not.toHaveAttribute("role");
      await expectAccessible(page);
    });
  }
}

for (const locale of ["zh", "en"]) {
  test(`${locale} search names its controls, exposes the active result, and restores focus`, async ({ page }) => {
    const route = locale === "en" ? "./en/" : "./";
    const label = locale === "en" ? "Search" : "搜索";
    await page.goto(route);
    const trigger = page.getByRole("button", { name: label, exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: label, exact: true });
    const input = dialog.getByRole("combobox", { name: label, exact: true });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(input).toBeFocused();
    await input.fill("CEFR");
    const options = dialog.getByRole("option");
    await expect(options.first()).toBeVisible();
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expectAccessible(page);

    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /^localsearch-item-\d+$/);
    const activeId = await input.getAttribute("aria-activedescendant");
    const activeOption = page.locator(`[id="${activeId}"]`);
    await expect(activeOption).toHaveAttribute("role", "option");
    await expect(activeOption).toHaveAttribute("aria-selected", "true");
    await expect(activeOption).toHaveAttribute("href", /\/up\/(?:en\/)?(?:threads|reference|templates)\//);
    await expect(input).toBeFocused();
    const destination = await activeOption.getAttribute("href");
    await input.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(new URL(destination, page.url()).href);

    await trigger.click();
    await expect(input).toBeFocused();
    await input.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.press("Enter");
    await input.fill("CEFR");
    await expect(options.first()).toBeVisible();
    await expect(options.first()).toHaveAttribute("href", /\/threads\/part-1\//);
    const firstDestination = await options.first().getAttribute("href");
    await options.first().click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(new URL(firstDestination, page.url()).href);
  });
}

test("search restores the keyboard shortcut origin and announces no results", async ({ page }) => {
  await page.goto("./en/threads/part-1/0-cefr");
  const origin = page.locator(".vp-doc p a").first();
  await origin.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search", exact: true });
  const input = dialog.getByRole("combobox", { name: "Search", exact: true });
  await input.fill("qzxv987654321");
  await expect(dialog.locator(".no-results")).toBeVisible();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await expect(dialog.getByRole("status")).toContainText("qzxv987654321");
  await input.press("ArrowDown");
  await input.press("ArrowUp");
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await expectAccessible(page);
  await page.keyboard.press("Escape");
  await expect(origin).toBeFocused();
});
