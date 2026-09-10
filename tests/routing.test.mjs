import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { legacyRedirectScript, legacyRouteTarget, publicRoutePath } from "../docs/.vitepress/routing.mjs";
import { privateAssetGuard } from "../docs/.vitepress/private-assets.mjs";

test("canonical paths preserve directories and use clean document URLs", () => {
  for (const [route, expected] of [
    ["", "/up/"], ["en", "/up/en/"],
    ["threads/archive", "/up/threads/archive/"],
    ["en/threads/archive", "/up/en/threads/archive/"],
    ["threads/part-1/2-vocabulary", "/up/threads/part-1/2-vocabulary"],
    ["/en/projects/", "/up/en/projects"],
  ]) assert.equal(publicRoutePath(route), expected);
});

test("legacy links recover README, Markdown pages, locale, search and anchors", () => {
  for (const [hash, expected] of [
    ["#/README", "/up/"], ["#/README.md", "/up/"],
    ["#/en/README.md", "/up/en/"],
    ["#/threads/archive/README", "/up/threads/archive/"],
    ["#/threads/part-1/1-understanding.md", "/up/threads/part-1/1-understanding"],
    ["#/en/threads/part-4/my-story.md?from=old&id=narrative-boundary", "/up/en/threads/part-2/my-story?from=old#narrative-boundary"],
    ["#/en/projects#disclosure", "/up/en/projects#disclosure"],
    ["#/projects?id=%E9%A1%B9%E7%9B%AE", "/up/projects#%E9%A1%B9%E7%9B%AE"],
  ]) assert.equal(legacyRouteTarget(hash), expected);
  for (const hash of ["#section", "#/../../outside", "#/%2e%2e/outside", "#/https://example.com", "#/%ZZ", "#/a%5Cb"]) {
    assert.equal(legacyRouteTarget(hash), null);
  }
});

test("the actual embedded redirect script works without module scope", () => {
  const targets = [];
  let onHashChange;
  const location = { hash: "#/README.md", pathname: "/up/", search: "", replace: (target) => targets.push(target) };
  vm.runInNewContext(legacyRedirectScript("/up/"), {
    URLSearchParams,
    window: { location, addEventListener: (event, handler) => { assert.equal(event, "hashchange"); onHashChange = handler; } },
  });
  assert.deepEqual(targets, ["/up/"]);
  location.hash = "#/en/README.md";
  onHashChange();
  assert.deepEqual(targets, ["/up/", "/up/en/"]);
});

test("private asset middleware rejects encoded requests without reading their contents", () => {
  for (const hook of ["configureServer", "configurePreviewServer"]) {
    let handler;
    privateAssetGuard()[hook]({ middlewares: { use: (value) => { handler = value; } } });
    for (const [url, status] of [
      ["/up/assets/session.json", 404], ["/up/assets/%73ession.json?raw", 404],
      ["/@fs/project/docs/assets/session.json?import", 404],
      ["/up/assets/session.json/", 404], ["/up/%broken", 400],
      ["/up/assets/logo.svg", 200],
    ]) {
      const response = { statusCode: 200, end() {} };
      let passed = false;
      handler({ url }, response, () => { passed = true; });
      assert.equal(response.statusCode, status, url);
      assert.equal(passed, status === 200, url);
    }
  }
});

test("private assets cannot enter hashed bundles through raw or URL imports", () => {
  const guard = privateAssetGuard();
  for (const suffix of ["", "?raw", "?url", "?commonjs-proxy"]) {
    assert.throws(() => guard.load(`/project/docs/assets/session.json${suffix}`), /cannot be imported/);
  }
  assert.equal(guard.load("/project/docs/assets/logo.svg"), undefined);
  const config = { server: { fs: { deny: [".env", "*.pem"] } } };
  assert.deepEqual(guard.config(config).server.fs.deny, [".env", "*.pem", "**/assets/session.json"]);
});

test("Vite's resolved filesystem guard retains defaults and blocks session files", async () => {
  const { resolveConfig } = await import("vite");
  const config = await resolveConfig({ configFile: false, plugins: [privateAssetGuard()] }, "serve");
  for (const path of ["/project/.env", "/project/.env.local", "/project/key.pem", "/project/.git/config", "/project/docs/assets/session.json"]) {
    assert.equal(config.fsDenyGlob(path), true, path);
  }
  assert.equal(config.fsDenyGlob("/project/docs/assets/logo.svg"), false);
});
