---
title: AI Project Scorecard Template
description: Evaluate an AI project with quality, time, rework, cost, safety, user feedback, and rollback status instead of generation speed alone.
updated: 2026-08-31
---

# AI Project Scorecard Template

Complete this after each release or pilot. Every number should lead back to a test, ledger, feedback record, or operations log.

```markdown
# AI Project Scorecard — YYYY-MM-DD

Project/version:
Owner:
User and situation:
Test conditions and sample scope:
Locations of baseline, assisted, and delayed independent retest:

| Metric | Result | Evidence location | Change from last time |
| --- | --- | --- | --- |
| Task completion | | | |
| First-pass acceptance | | | |
| Average/high-percentile latency | | | |
| Human time and rework | | | |
| Model/infrastructure cost | | | |
| Delayed independent performance | | | |
| Security/privacy issues | | | |
| User feedback | | | |

## Gates
- Facts and sources checked: yes / no
- Tests and edge cases covered: yes / no
- Permissions and data scope confirmed: yes / no
- Pause/degrade/rollback path works: yes / no
- Owner can explain critical decisions without the chat: yes / no

## Release Gates

| Gate | Evidence location | Owner | Date | Pass |
| --- | --- | --- | --- | --- |
| Requirements and acceptance criteria | | | | yes / no |
| Real samples and boundary tests | | | | yes / no |
| Permissions, privacy, and retention | | | | yes / no |
| Cost ceiling and monitoring | | | | yes / no |
| Pause, degrade, rollback, and notice | | | | yes / no |

## Decision
- Keep:
- Adjust:
- Stop:
- Smallest next experiment:
```
