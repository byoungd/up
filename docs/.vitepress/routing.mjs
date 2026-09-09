import { enNavigation, zhNavigation } from "./navigation.mjs";

const directoryRoutes = new Set(
  [...zhNavigation, ...enNavigation].flatMap(({ items }) =>
    items.filter(({ source }) => /(?:^|\/)(?:README|index)\.md$/.test(source))
      .map(({ link }) => link.replace(/^\/+|\/+$/g, "")),
  ),
);

export function publicRoutePath(route, base = "/up/") {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return `${base}${clean}${clean && directoryRoutes.has(clean) ? "/" : ""}`;
}

// This function is also embedded in the page head; keep it self-contained.
export function legacyRouteTarget(hash, base = "/up/") {
  if (!hash.startsWith("#/")) return null;
  const [raw, fragment = ""] = hash.slice(2).split("#", 2);
  const queryAt = raw.indexOf("?");
  const query = new URLSearchParams(queryAt < 0 ? "" : raw.slice(queryAt + 1));
  let path;
  try {
    path = decodeURIComponent(queryAt < 0 ? raw : raw.slice(0, queryAt));
  } catch {
    return null;
  }
  if (/[\\:?#\u0000-\u001f]/.test(path) || path.split("/").some((part) => part === "." || part === "..")) {
    return null;
  }
  path = path.replace(/^\/+|\/+$/g, "")
    .replace(/(^|\/)(?:README|index)(?:\.md|\.html)?$/i, "$1")
    .replace(/\.(?:md|html)$/i, "")
    .replace(/\/+$/g, "");
  if (path === "en/threads/part-4/my-story") path = "en/threads/part-2/my-story";
  let anchor = query.get("id");
  if (!anchor && fragment) {
    try { anchor = decodeURIComponent(fragment); } catch { return null; }
  }
  query.delete("id");
  const search = query.toString();
  const directory = path === "en" || /^(?:en\/)?threads\/archive$/.test(path);
  return `${base}${encodeURI(path)}${directory ? "/" : ""}${search ? `?${search}` : ""}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}

export function legacyRedirectScript(base) {
  return `(function () {
    function redirect() {
      var target = (${legacyRouteTarget.toString()})(window.location.hash || '', ${JSON.stringify(base)});
      if (target && window.location.pathname + window.location.search + window.location.hash !== target) {
        window.location.replace(target);
      }
    }
    redirect();
    window.addEventListener('hashchange', redirect);
  })();`;
}
