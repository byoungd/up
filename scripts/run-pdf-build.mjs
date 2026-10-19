#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedPypdf = readFileSync(join(ROOT, "requirements-pdf.txt"), "utf8")
  .match(/^pypdf==([^\s#]+)$/m)?.[1];
if (!expectedPypdf) throw new Error("requirements-pdf.txt 未声明固定的 pypdf 版本");

const configuredPython = process.env.PDF_PYTHON?.trim();
const candidates = (configuredPython ? [configuredPython] : [
  join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"),
  "python3",
]).filter(Boolean);

let python;
let selectedVersions;
const failures = [];
for (const candidate of candidates) {
  if (candidate.includes("/") && !existsSync(candidate)) {
    failures.push(`${candidate}: executable does not exist`);
    continue;
  }
  const probe = spawnSync(candidate, ["-c", [
    "import json, importlib.metadata as metadata",
    "import reportlab, pypdf, PIL",
    "print(json.dumps({\"python\": __import__(\"sys\").version.split()[0], \"pypdf\": getattr(pypdf, \"__version__\", metadata.version(\"pypdf\")), \"reportlab\": reportlab.Version, \"Pillow\": PIL.__version__}))",
  ].join("; ")], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 15_000,
  });
  if (probe.status !== 0) {
    failures.push(`${candidate}: ${probe.error?.message || probe.stderr.trim() || `exit ${probe.status}`}`);
    continue;
  }
  try {
    selectedVersions = JSON.parse(probe.stdout.trim());
  } catch {
    failures.push(`${candidate}: 依赖探测返回了无法解析的版本信息: ${probe.stdout.trim()}`);
    continue;
  }
  if (selectedVersions.pypdf !== expectedPypdf) {
    failures.push(`${candidate}: pypdf ${selectedVersions.pypdf}，需要 ${expectedPypdf}`);
    continue;
  }
  python = candidate;
  break;
}

if (!python) {
  console.error("PDF 依赖不可用；请运行 python3 -m pip install -r requirements-pdf.txt");
  console.error(`需要 pypdf==${expectedPypdf}；每个候选解释器的诊断如下：`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (configuredPython) console.error("PDF_PYTHON 已显式指定，未回退到其他 Python 解释器。");
  process.exit(1);
}

const args = process.argv.slice(2);
const commandArgs = args.length === 1 && args[0] === "--test-layout"
  ? ["-m", "unittest", "discover", "-s", join(ROOT, "tests"), "-p", "pdf_layout_test.py"]
  : [join(ROOT, "scripts/build-pdf.py"), ...args];
const result = spawnSync(python, commandArgs, {
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
