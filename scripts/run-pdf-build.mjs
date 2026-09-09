#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = process.env.PDF_PYTHON ? [process.env.PDF_PYTHON] : [
  "python3",
  join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"),
];

let python;
const failures = [];
for (const candidate of candidates) {
  if (candidate.includes("/") && !existsSync(candidate)) {
    failures.push(`${candidate}: executable does not exist`);
    continue;
  }
  const probe = spawnSync(candidate, ["-c", "import reportlab, pypdf, PIL"], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 15_000,
  });
  if (probe.status === 0) {
    python = candidate;
    break;
  }
  failures.push(`${candidate}: ${probe.error?.message || probe.stderr.trim() || `exit ${probe.status}`}`);
}

if (!python) {
  console.error("PDF 依赖不可用；请运行 python3 -m pip install -r requirements-pdf.txt");
  if (process.env.PDF_PYTHON) console.error("PDF_PYTHON 已显式指定，未回退到其他 Python 解释器。");
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

const result = spawnSync(python, [join(ROOT, "scripts/build-pdf.py"), ...process.argv.slice(2)], {
  cwd: ROOT,
  encoding: "utf8",
  env: {
    ...process.env,
    PYTHONHASHSEED: "0",
    SOURCE_DATE_EPOCH: "946684800",
    TZ: "UTC",
  },
  stdio: "inherit",
});
if (result.error) console.error(`PDF build could not start: ${result.error.message}`);
if (result.signal) console.error(`PDF build terminated by ${result.signal}`);
process.exit(result.status ?? 1);
