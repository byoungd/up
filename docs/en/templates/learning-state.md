---
title: Learning State Template
description: Keep goals, baselines, completed work, error evidence, and the next action in one file so a person or AI can resume responsibly.
updated: 2026-09-09
---

# Learning State Template

Copy this into a private note. It is a cross-session source of truth, not a performance diary. Do not include passwords, government IDs, exact addresses, sensitive health data, or third-party information without permission.

On first use, save a file named `learning-state.md`, or create a private note with that name in your usual notes tool, and record where the evidence folder lives. After each session, check the updates proposed by AI, then manually write them back into this main file and update its version and date. Retain the goal, initial baseline, capacity, and boundaries that still apply so the latest version is a complete snapshot. Older versions can be archived; a list of changes alone cannot ask the next conversation to reconstruct the past.

A file path helps you locate evidence; it does not mean AI has read the file. In an ordinary chat, paste the state and separately attach the files or necessary excerpts to be checked this time. With a tool that can read files, confirm which materials it actually read. When only a path is supplied and the content is unavailable, mark that evidence as “not yet verified”.

```markdown
# Learning State

State version: v1
Updated: YYYY-MM-DD
Owner:
Primary file location:
Evidence folder location (relative paths below start here):

## Goal
- Real context:
- Current main task:
- 12-week outcome:
- This week's focus:
- Acceptance criteria:
- Deadline:

## Constraints and Boundaries
- Weekly time/energy available:
- Materials and tools allowed:
- Content that must not be uploaded or published:
- AI may assist with:
- A person must confirm:

## Current Level and Baseline
- Initial baseline date and conditions:
- I can currently (separate from the initial baseline):
- Baseline sample:
- Latest score/feedback:

| Sample | Conditions | Location | Date | What it does not show yet |
| --- | --- | --- | --- | --- |
| | | | | |

## Completed
- [date] task — output/evidence location — result/next step

## Errors, Risks, and Knowledge Gaps
| Error/risk | Evidence | Likely cause/confidence | Next treatment and stop condition |
| --- | --- | --- | --- |

## Methods That Worked
- Method — conditions — evidence

## Hypotheses to Test
- Hypothesis — counterexample — next test — deadline

## Latest Handover
- Completed and evidence:
- Facts still unconfirmed:
- Open decisions:
- Cost/rework so far:
- First action when reopening:
- People to notify or consult:

## Next Action
1. Smallest next task:
2. Expected time:
3. Material needed:
4. Evidence to save:
5. Next review date:
```

## Cross-session Recovery Prompt

```text
Below is my learning-state file. In no more than six bullets, restate the state version, goal, current evidence, main errors, boundaries, and next action. Flag conflicts or missing information; do not pretend to remember another chat or invent facts absent from the file. Distinguish results I report from evidence you actually read this time; mark files supplied only as paths without content as not yet verified. Design one exercise only for the “smallest next task”: let me answer first, then give feedback against the acceptance criteria. Do not provide a complete answer unless I ask. Finish with five paste-ready updates: completed, evidence, errors/risks, handover, next action. Remind me to check them before writing them back to the main file; do not claim to have saved them for me.

[paste Learning State]
```

An AI summary is not the source of truth. Resume from the file, saved work, sources, and version number; after a weekly review, update the [Weekly Review](weekly-review.md), [Evidence Chain](evidence-chain.md), and [90-Day Cycle Map](90-day-cycle.md) by their separate jobs instead of copying the same record.
