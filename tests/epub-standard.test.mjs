import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

test("EPUB standard validation rejects a substituted archive before executing its contents", (t) => {
  const root = mkdtempSync(join(tmpdir(), "life-guide-epub-standard-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const scratch = join(root, "tmp");
  mkdirSync(scratch);
  for (const language of ["zh", "en"]) writeFileSync(join(root, `life-level-up-guide-${language}.epub`), "fixture");
  const archive = join(root, "substituted.zip");
  writeFileSync(archive, "untrusted replacement archive");
  const sentinel = join(root, "jar-executed");
  const java = join(root, "java-fixture");
  writeFileSync(java, `#!/usr/bin/env node\nif (process.argv.includes('-jar')) { require('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'executed'); }\n`);
  chmodSync(java, 0o755);

  const result = spawnSync(process.execPath, [resolve("scripts/check-epub-standard.mjs"), "--input-dir", root, "--archive", archive], {
    encoding: "utf8",
    env: { ...process.env, EPUBCHECK_JAVA: java, TMPDIR: scratch },
    timeout: 15_000,
  });
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /archive checksum mismatch/);
  assert.equal(existsSync(sentinel), false, "unverified JAR must never run");
  assert.deepEqual(readdirSync(scratch), [], "temporary tooling must be removed after failure");
});
