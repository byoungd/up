import { enNavigation, zhNavigation } from "./navigation.mjs";

const guidancePages = new Set(["toolkit", "toolkit-walkthrough"]);

export const worksheetEntries = [...zhNavigation, ...enNavigation]
  .flatMap(({ items }) => items)
  .flatMap(({ source }) => {
    const match = source.match(/^(en\/)?templates\/([^/]+)\.md$/);
    if (!match || guidancePages.has(match[2])) return [];
    const locale = match[1] ? "en" : "zh";
    const name = `${match[2]}.${locale}.md`;
    return [{ source, locale, name, download: `/downloads/worksheets/${name}` }];
  });

export const worksheetBySource = new Map(worksheetEntries.map((entry) => [entry.source, entry]));
