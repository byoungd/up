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

test("narrow navigation keeps keyboard focus visible and returns it on Escape", async ({ page }, testInfo) => {
  const widths = testInfo.project.name === "mobile-chromium" ? [375] : [320, 640];
  for (const width of widths) {
    // 320 CSS pixels also covers the reflow width of a 1280px viewport at 400% zoom.
    await page.setViewportSize({ width, height: width === 320 ? 256 : 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./en/threads/part-1/0-cefr");
    const sidebar = page.locator(".VPSidebar");
    await expect(sidebar).toBeHidden();
    await expect(sidebar).toHaveAttribute("inert", "");
    await page.getByRole("button", { name: "On this page", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).not.toHaveClass("item");
    expect(await page.locator(":focus").evaluate((element) => Boolean(element.closest(".VPSidebar")))).toBe(false);

    const hamburger = page.getByRole("button", { name: "Mobile navigation", exact: true });
    await hamburger.click();
    const navigation = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
    await expect(navigation).toBeVisible();
    const languageToggle = navigation.locator(".VPNavScreenTranslations > button");
    await expect(languageToggle).toHaveAttribute("aria-expanded", "false");
    await expect(navigation.locator(".VPNavScreenTranslations .list")).toBeHidden();
    await languageToggle.press("Enter");
    await expect(languageToggle).toHaveAttribute("aria-expanded", "true");
    await expect(navigation.getByRole("link", { name: "简体中文" })).toBeVisible();
    await expectAccessible(page);
    await navigation.locator(".VPSwitchAppearance").focus();
    await page.keyboard.press("Tab");
    expect(await page.locator(":focus").evaluate((element) => Boolean(element.closest(".VPNav")))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(navigation).toHaveCount(0);
    await expect(hamburger).toBeFocused();

    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await menu.click();
    await expect(page.locator("#VPSidebarNav")).toBeFocused();
    await expectAccessible(page);
    await sidebar.locator(".VPSidebarItem.collapsible > .item").last().focus();
    await page.keyboard.press("Tab");
    await expect(sidebar.getByRole("button", { name: "Start Here", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(sidebar.locator(".VPSidebarItem.collapsible > .item").last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(menu).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
