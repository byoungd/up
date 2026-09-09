---
title: "AI Task Brief: From Problem to Human Acceptance"
description: Before an AI learning or project task, define the real action, data boundary, sources, evaluation set, human ownership, cost, failure handling, and handover.
updated: 2026-09-02
---

# AI Task Brief: From Problem to Human Acceptance

Copy this into a private project directory before a model call. It is not a prompt collection. It is permission to start: when task, data, sources, acceptance, or ownership remain unclear, do not ask a model for the final result yet.

Do not include passwords, identity documents, precise addresses, medical privacy, children's data, customer records, unpublished vulnerabilities, or unauthorised third-party material. Redact sensitive material or use an organisation-approved environment.

## 1. Task and Ownership

```markdown
# AI Task Brief - YYYY-MM-DD

Real situation:
User/audience:
Decision or action to complete:
Why now:
Deadline and non-negotiable checkpoints:
Final owner and human reviewer:
Who is affected if this is delayed or not done:
```

Replace “learn AI” or “build an intelligent assistant” with an observable action, such as “a user can import a file in ten minutes and see an explainable report with sources and errors”.

## 2. Inputs, Sources, and Data Boundary

| Input/claim | Type | Source, version, location | May reach model? | Verifier | Expiry condition |
| --- | --- | --- | --- | --- | --- |
| | fact / inference / experience / user data / third-party | | public / redacted / approved / prohibited | | |

```markdown
Files and fields allowed:
Material deliberately withheld:
Data sensitivity: public / internal / confidential / restricted
Collection, transfer, retention, and deletion dates:
Required consent obtained:
Copyright, licence, citation, and authorship requirements:
Minimum data scope the model can see:
```

A source is not automatically true. Each critical claim must return to an original passage, version, data definition, or direct observation. Model links, numbers, and quotations still require human verification.

## 3. Output and Evaluation Set

```markdown
Final deliverable:
Format, length, and audience:
Observable definition of done:
Hard gates that must pass:
Acceptable variation:
Content that must not appear:
```

Build a small, realistic evaluation set instead of only model-friendly examples:

| Sample | Input condition | Expected result | Unacceptable result | Actual result | Evidence location |
| --- | --- | --- | --- | --- | --- |
| Normal case | | | | | |
| Boundary case | | | | | |
| Missing/conflicting input | | | | | |
| Redacted historical case | | | | | |

Acceptance should answer whether facts are traceable, the action is complete, errors are visible, permissions are correct, and failure can stop. Fluent, fast, or human-like is not an acceptance standard.

## 4. AI's Working Scope

```markdown
AI may: ask / classify / propose explanations / give counterexamples / transcribe
        / draft / suggest tests
AI may not: make final factual decisions / invent sources / approve for the owner
             / cross permissions / complete a prohibited exam or application
             / publish or execute automatically
Mode: diagnosis / assistance / candidate generation / batch processing / other
Model, version, region, and call date:
Prompt, system instruction, or workflow version location:
```

Ask the model to restate goal, input, limits, unknowns, and acceptance before generation. Version prompts, and never treat one chat window as the project's only record.

## 5. Human Gates

| Gate | Who confirms | Passing evidence | If it fails |
| --- | --- | --- | --- |
| Source gate | | Original link, version, location | Mark unverified; do not circulate |
| Fact gate | | Sample checks and data definition | Delete or downgrade claim |
| Privacy/permission gate | | Scope, consent, access record | Stop and redact |
| Quality gate | | Evaluation set, edge cases, real feedback | Repair, narrow, or reject |
| Cost gate | | Tokens, time, human rework, budget | Downgrade or stop |
| Ownership gate | | Named approval and disclosure | Do not publish or execute |

Critical decisions cannot be approved only by the generator, an automated score, or one developer alone. High-risk domains return to current primary sources and qualified professionals.

## 6. Cost, Retention, and Reversibility

```markdown
Call volume, time, and cost ceiling:
Human review and rework budget:
Does data enter training, logs, or third-party retention:
Acceptable latency and downgrade path:
Version that can be withdrawn, rerun, or restored:
Release scope and pilot audience:
```

A cheap call that causes a privacy incident, wrong decision, or major rework is not cheap in reality. Record human time, review, failure, reruns, and communication in addition to model fees.

## 7. Failure, Pause, and Rollback

| Trigger | Immediate action | Notify | Recovery/rollback location |
| --- | --- | --- | --- |
| Source or version cannot be found | Stop circulation; return to original | | |
| Evaluation hard gate fails | Block release or automatic action | | |
| Input crosses permission boundary | Stop upload; revoke access | | |
| Cost/latency exceeds ceiling | Downgrade, throttle, or stop | | |
| Real user reports harm | Remove, preserve evidence, escalate | | |

Without a named stop owner, notification path, and known-good version, the task is not ready for a real workflow.

## 8. Handover and Public Disclosure

```markdown
Current state: not started / experiment / internal pilot / limited release / delivered / stopped
Completed work and evidence locations:
Open questions and risks:
Smallest next task:
Handover owner, date, and access:
What readers/users need to know about AI involvement:
Source, privacy, copyright, and conflict-of-interest note:
```

The next operator should not search chat history to discover what to do. Public work should state which step used a tool, which facts a person confirmed, and which content remains a candidate.

## 9. Preflight Check

- [ ] Audience, action, deadline, and owner are explicit.
- [ ] Input fields, sensitivity, consent, copyright, and retention are confirmed.
- [ ] Critical sources, versions, and expiry conditions are traceable.
- [ ] Normal, boundary, conflict, and redacted historical cases are in the evaluation set.
- [ ] AI may/may-not scope is explicit.
- [ ] Human gates, cost ceiling, stop conditions, and rollback location are named.
- [ ] Handover, disclosure, and next review date are set.
