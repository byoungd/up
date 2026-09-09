import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build } from "vite";
import { privateAssetGuard } from "../docs/.vitepress/private-assets.mjs";

async function buildFixture({ script = "console.log('fixture');", css, html = "", assetsInlineLimit, entryDirectory = "" } = {}) {
  // Resolve macOS /var symlinks so Rollup's entry path stays inside the root.
  const root = realpathSync(mkdtempSync(join(tmpdir(), "private-assets-test-")));
  try {
    mkdirSync(join(root, "assets"));
    mkdirSync(join(root, "public"));
    writeFileSync(join(root, "assets/session.json"), '{"fixture":"PRIVATE_ASSET_TEST_SENTINEL"}');
    writeFileSync(join(root, "assets/session-notes.json"), '{"title":"Public session notes"}');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>';
    writeFileSync(join(root, "assets/photo.svg"), svg);
    writeFileSync(join(root, "public/logo.svg"), svg);
    writeFileSync(join(root, "index.html"), `${html}<script type="module" src="/${entryDirectory ? `${entryDirectory}/` : ""}main.js"></script>`);
    writeFileSync(join(root, entryDirectory, "main.js"), `${css === undefined ? "" : 'import "./style.css";\n'}${script}`);
    if (css !== undefined) writeFileSync(join(root, entryDirectory, "style.css"), css);
    return await build({
      configFile: false,
      root,
      logLevel: "silent",
      plugins: [privateAssetGuard()],
      build: {
        outDir: join(root, "dist"),
        write: false,
        ...(assetsInlineLimit === undefined ? {} : { assetsInlineLimit }),
      },
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

for (const { name, suffix, assetsInlineLimit } of [
  { name: "default inlining", suffix: "" },
  { name: "explicit inline query", suffix: "?inline" },
  { name: "explicit no-inline query", suffix: "?no-inline" },
  { name: "hashed asset output", suffix: "", assetsInlineLimit: 0 },
]) {
  test(`private new URL assets fail real builds with ${name}`, async () => {
    await assert.rejects(
      buildFixture({
        script: `console.log(new URL("./assets/session.json${suffix}", import.meta.url).href);`,
        assetsInlineLimit,
      }),
      /Private session assets/,
    );
  });

  test(`private CSS assets fail real builds with ${name}`, async () => {
    await assert.rejects(
      buildFixture({ css: `body { background-image: url("./assets/session.json${suffix}") }`, assetsInlineLimit }),
      /Private session assets/,
    );
  });
}

test("private HTML asset references fail before inline or hashed publication", async () => {
  await assert.rejects(buildFixture({ html: '<img src="/assets/session.json">' }), /Private session assets/);
});

test("relative new URL references from inside assets cannot inline private files", async () => {
  await assert.rejects(
    buildFixture({ script: 'console.log(new URL("./session.json", import.meta.url).href);', entryDirectory: "assets" }),
    /Private session assets/,
  );
});

test("relative CSS references from inside assets cannot inline private files", async () => {
  await assert.rejects(
    buildFixture({ css: 'body { background-image: url("./session.json") }', entryDirectory: "assets" }),
    /Private session assets/,
  );
});

test("escaped JavaScript and CSS paths cannot hide private asset references", async () => {
  await assert.rejects(
    buildFixture({ script: 'console.log(new URL("./assets/sess\\x69on.json", import.meta.url).href);' }),
    /Private session assets/,
  );
  await assert.rejects(
    buildFixture({ css: 'body { background-image: url("./assets/sess\\69 on.json") }' }),
    /Private session assets/,
  );
});

test("ordinary source and public assets still compile, including similarly named files", async () => {
  const result = await buildFixture({
    script: [
      'console.log(new URL("./assets/photo.svg", import.meta.url).href);',
      'console.log(new URL("./assets/session-notes.json", import.meta.url).href);',
      'console.log(new URL("/logo.svg", import.meta.url).href);',
    ].join("\n"),
    css: 'body { background-image: url("./assets/photo.svg") }',
    html: '<img src="/logo.svg">',
    assetsInlineLimit: 0,
  });
  assert.ok(result.output.some(({ fileName }) => /^assets\/photo-.+\.svg$/.test(fileName)));
  assert.ok(result.output.some(({ fileName }) => /^assets\/session-notes-.+\.json$/.test(fileName)));
  assert.ok(result.output.some(({ fileName }) => fileName === "index.html"));
});
