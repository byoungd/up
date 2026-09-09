import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { worksheetEntries } from "../docs/.vitepress/worksheets.mjs";

for (const locale of ["zh", "en"]) {
  test(`${locale} worksheets download and copy the complete editable document`, async ({ page }) => {
    const entry = worksheetEntries.find((value) => value.locale === locale && value.source.endsWith("/speaking-evidence.md"));
    const expected = readFileSync(`docs/public${entry.download}`, "utf8");
    await page.goto(`${locale === "en" ? "./en" : "."}/templates/speaking-evidence`);
    const tools = page.getByRole("region", { name: locale === "en" ? "Use this worksheet" : "使用这张工作表" });
    await expect(tools).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await tools.getByRole("link", { name: locale === "en" ? "Download Markdown" : "下载 Markdown" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(entry.name);
    expect(readFileSync(await download.path(), "utf8")).toBe(expected);

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
        write: async (items) => { window.__worksheetCopy = await (await items[0].getType("text/plain")).text(); },
      } });
    });
    await tools.getByRole("button", { name: locale === "en" ? "Copy worksheet" : "复制整张工作表" }).click();
    await expect(tools.getByRole("status")).toContainText(locale === "en" ? "Copied" : "已复制");
    expect(await page.evaluate(() => window.__worksheetCopy)).toBe(expected);
    await page.emulateMedia({ media: "print" });
    await expect(tools).toBeHidden();
  });
}

test("clipboard refusal leaves a working download and is announced", async ({ page }) => {
  await page.goto("./en/templates/learning-state");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      write: async () => { throw new Error("Permission refused"); },
    } });
  });
  const tools = page.getByRole("region", { name: "Use this worksheet" });
  await tools.getByRole("button", { name: "Copy worksheet" }).click();
  await expect(tools.getByRole("status")).toContainText("Use the Markdown download");
  await expect(tools.getByRole("link", { name: "Download Markdown" })).toBeVisible();
  await expect(tools.getByRole("button", { name: "Copy worksheet" })).toBeEnabled();
});

test("every public worksheet is present and guidance pages do not pretend to be blank forms", async ({ request, page }) => {
  const sitemap = await (await request.get("sitemap.xml")).text();
  expect(sitemap).not.toContain("public/downloads/worksheets");
  for (let index = 0; index < worksheetEntries.length; index += 4) {
    await Promise.all(worksheetEntries.slice(index, index + 4).map(async ({ download, name }) => {
      const response = await request.get(`/up${download}`);
      expect(response.status(), name).toBe(200);
      const text = await response.text();
      expect(text, name).toBe(readFileSync(`docs/public${download}`, "utf8"));
      expect(text, name).not.toMatch(/^---\n/);
    }));
  }
  for (const route of ["./templates/toolkit", "./en/templates/toolkit-walkthrough", "./threads/part-1/0-cefr"]) {
    await page.goto(route);
    await expect(page.locator(".worksheet-actions")).toHaveCount(0);
  }
});
