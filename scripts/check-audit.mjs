#!/usr/bin/env node

// Audits the dependency tree without hiding risk.
//
// The shipped site and the book artifacts have no runtime Node dependencies:
// every dependency is a build tool. `npm audit --omit=dev` is therefore the
// gate that would block a release, and it reports nothing. This script adds a
// reviewed allowlist on top so that dev-toolchain advisories stay visible,
// expire on a date, and fail the build when a new high or critical advisory
// appears or an accepted one passes its review date.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST_FILE = join(ROOT, "scripts/audit-allowlist.json");
const BLOCKING = new Set(["high", "critical"]);

function advisories(report) {
  const found = [];
  for (const [name, entry] of Object.entries(report.vulnerabilities || {})) {
    if (!BLOCKING.has(entry.severity)) continue;
    const ids = (entry.via || [])
      .filter((item) => typeof item === "object")
      .map((item) => ({ id: item.url?.split("/").at(-1), title: item.title }));
    if (ids.length === 0) {
      ids.push({ id: `transitive:${entry.via?.join(",") || "unknown"}`, title: "transitive advisory" });
    }
    for (const { id, title } of ids) {
      found.push({ package: name, severity: entry.severity, id, title });
    }
  }
  return found;
}

function main() {
  let report;
  try {
    report = JSON.parse(
      execFileSync("npm", ["audit", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
    );
  } catch (error) {
    // npm audit exits non-zero when it finds anything; the JSON is still on stdout.
    try {
      report = JSON.parse(error.stdout);
    } catch {
      console.error("check:audit could not read `npm audit --json` output");
      process.exit(1);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const allowlist = JSON.parse(readFileSync(ALLOWLIST_FILE, "utf8"));
  const accepted = new Map((allowlist.entries || []).map((entry) => [`${entry.package}:${entry.advisory}`, entry]));
  const problems = [];

  for (const finding of advisories(report)) {
    if (!finding.id) {
      problems.push(`高危及缺失标识的告警：${finding.package} ${finding.title}`);
      continue;
    }
    const entry = accepted.get(`${finding.package}:${finding.id}`);
    if (!entry) {
      problems.push(`未登记的高危依赖告警：${finding.package} ${finding.id}（${finding.title}）`);
    } else if (entry.reviewBy < today) {
      problems.push(`${finding.package} ${finding.id} 的复核期限 ${entry.reviewBy} 已过`);
    }
  }

  if (problems.length > 0) {
    console.error(`✗ check:audit 发现 ${problems.length} 个问题：\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error("\n处理方式：升级依赖，或在 scripts/audit-allowlist.json 中登记并写明复核日期与原因。");
    process.exit(1);
  }

  const acceptedCount = (allowlist.entries || []).length;
  console.log(`✓ check:audit 通过：${acceptedCount} 条已登记的高危依赖告警均在复核期限内。`);
}

main();
