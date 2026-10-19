---
title: AI Evaluation Record
description: Record scope, held-out cases, versions, mandatory checks, failures, and complete process costs to decide whether to adopt, repair, or withdraw an AI workflow.
updated: 2026-10-16
---

# AI Evaluation Record

Use with [AI Evaluation and Reliability](../threads/practice/ai-evaluation.md). Define criteria before running cases. The blank record covers one version comparison; example numbers describe neither model performance nor universal release thresholds.

## Copyable record

```markdown
# AI Evaluation — Date / Task

## Scope
- User and intended action:
- Input materials, permissions, and de-identification:
- Manual baseline and total time:
- Unsupported tasks:

## Test setup (fixed before running)
- Current version / candidate:
- Model, prompt, retrieved materials, and tool versions:
- Run date, region, memory settings, and service versions that cannot be pinned:
- The one main change:
- Development cases / held-out cases not used for tuning:
- Attempts per case and time, call-count, and spending limits:
- Conditions that must all pass:
- Quality comparisons and human scoring rubric:
- Reviewers / disagreement process:
- Relevant failures: absent sources / prompt injection / unauthorized actions / unbounded retries or duplicate side effects / transcription or image errors:
- Long-running fields: task/run IDs, checkpoints, wall-clock time, timeout, retry limit, idempotency key, and human takeover point:
- Isolation fields: clean environment, network egress allowlist, credential scope, and untrusted browser/page-input note:
- Policy fields: provider policy name, version, effective date, region, and high-risk human review:

## Case records (copy this section separately for each version)
- Version for this section:
- Use case ID / trial number, such as 07 / 2; link inputs to fixed case materials.
### Case (copy once per attempt)
- Case ID / trial number:
- Case type and fixed input location:
- Expected behavior / judging rationale:
- Supporting passage / audio or video timestamp / image region:
- Actual behavior / artifact location:
- Transcript / tool calls / authorization record location:
- Checkpoint / recovery ID / retry and idempotency record:
- Network egress, page or screenshot evidence, and credential scope:
- Final environment outcome (file, database, or user-visible state):
- First-pass acceptance / mandatory failures:
- Human revision minutes / changes:
- Final state (retain failures and timeouts):

## Results (calculate per version; retain failures and timeouts in denominators)
- First-pass accepted / all attempts:
- Mandatory failures and specific cases:
- Accepted after human revision / all attempts:
- Total minutes for preparation, execution, checking, and rework:
- Tool charges and the time valuation used:
- Total batch process cost / final accepted count:
- Evidence limits and unsupported inferences:

## Decision and follow-up
- Adopt / retain current version / repair and retest / stop:
- Cases supporting the decision:
- New regression cases and rerun scope:
- Retest triggers after model, material, tool, or memory changes; last accepted version:
- Permitted use / human takeover / withdrawal conditions:
- Exit rehearsal after switching providers, disabling memory, or disconnecting tools:
- Owner, review date, and record location:
```

If no results are accepted, mark cost per accepted result “not calculable.” Preserve total incurred cost rather than replacing it with zero.

## Worked example: public-information comparison

This hypothetical case matches the chapter: ten cases with one attempt each. A passes eight on first delivery, B passes nine, and both reach ten after human revision.

| Field | Example entry |
| --- | --- |
| Change | Extraction prompt only; materials and tools remain identical |
| Mandatory conditions | Consequential figures have sources; missing prices must not be inferred |
| Failure B-07 | Source gives no price; B writes “free”; reviewer corrects it to “not provided” |
| A costs | 120 total minutes valued at RMB 60/hour, plus RMB 6 for tools: RMB 126 |
| B costs | 100 total minutes at the same valuation, plus RMB 8 for tools: RMB 108 |
| Decision | Retain current scope; repair B before expanding use |
| Next action | Add missing, outdated, and conflicting price cases; rerun previously passing cases |
| Evidence limits | Small sample, one attempt per case; no production error-rate inference; repaired correctness does not establish autonomous reliability |

Store actual results in inspectable files. A completion record needs an artifact, test output, or system state, beyond the model's claim of success.

## Turn the record into action

Fix one main error pattern per round and check for regressions. If the process remains unclear, revisit the [AI Task Brief](ai-task-brief.md). Before offering the workflow as a service, use a [Startup Experiment](startup-experiment.md) to test demand separately from output quality.
