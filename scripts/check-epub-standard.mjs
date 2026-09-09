#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// Pin both the validator and its complete dependency archive. Never execute a
// downloaded JAR before the release archive's checksum has been verified.
const VERSION = "5.3.0";
const ARCHIVE_URL = `https://github.com/w3c/epubcheck/releases/download/v${VERSION}/epubcheck-${VERSION}.zip`;
const ARCHIVE_SHA256 = "6c07e68584b2e2ce2f89fe06e1246dfead3eb36b46b340e7d93524f29dcff6c5";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { values: options } = parseArgs({
  options: {
    "input-dir": { type: "string" },
    "reports-dir": { type: "string" },
    archive: { type: "string" },
  },
});
const inputDir = resolve(options["input-dir"] || join(ROOT, "docs/public/downloads"));
const editions = ["life-level-up-guide-zh.epub", "life-level-up-guide-en.epub"];
const java = process.env.EPUBCHECK_JAVA || "java";

function run(command, args, timeout = 120_000) {
  execFileSync(command, args, { stdio: "inherit", timeout });
}

// Fail before downloading if the Java runtime or publication inputs are absent.
for (const edition of editions) {
  if (!existsSync(join(inputDir, edition))) throw new Error(`Missing EPUB: ${join(inputDir, edition)}`);
}
run(java, ["-version"], 15_000);

const staging = mkdtempSync(join(tmpdir(), "life-guide-epubcheck-"));
try {
  const archive = join(staging, `epubcheck-${VERSION}.zip`);
  if (options.archive) {
    copyFileSync(resolve(options.archive), archive);
  } else {
    run("curl", [
      "--fail", "--location", "--silent", "--show-error", "--proto", "=https", "--proto-redir", "=https",
      "--connect-timeout", "15", "--max-time", "120", "--retry", "2",
      "--retry-max-time", "300", "--output", archive, ARCHIVE_URL,
    ], 330_000);
  }
  const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
  if (digest !== ARCHIVE_SHA256) {
    throw new Error(`EPUBCheck ${VERSION} archive checksum mismatch: expected ${ARCHIVE_SHA256}, got ${digest}`);
  }
  run("unzip", ["-q", archive, "-d", staging], 30_000);
  const jar = join(staging, `epubcheck-${VERSION}`, "epubcheck.jar");
  const reportsDir = options["reports-dir"] ? resolve(options["reports-dir"]) : join(staging, "reports");
  mkdirSync(reportsDir, { recursive: true });
  let failures = 0;
  for (const edition of editions) {
    console.log(`Validating ${edition} with EPUBCheck ${VERSION}`);
    try {
      run(java, ["-jar", jar, "--failonwarnings", "--json", join(reportsDir, `${edition}.json`), join(inputDir, edition)]);
    } catch (error) {
      console.error(`${edition}: ${error.message}`);
      failures += 1;
    }
  }
  if (failures) throw new Error(`${failures} EPUB edition(s) failed EPUBCheck. Review the validator output and JSON reports.`);
  console.log(`Both EPUB editions pass EPUBCheck ${VERSION} without errors or warnings.`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
