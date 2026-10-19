---
title: AI Evaluation and Reliability — Knowing When to Deliver
description: Compare AI workflows using real tasks, small test sets, failure categories, and full process costs, and distinguish a successful demo from dependable use.
updated: 2026-10-16
sources_checked: 2026-10-16
source_review_interval: 60
---

# AI Evaluation and Reliability — Knowing When to Deliver

One successful demonstration says little about the next user's experience. Evaluation exposes failures before delivery and helps you tell what a change actually improved.

Building on [AI Workflows](ai-workflows.md), this chapter asks which approach—manual work, the current workflow, or a candidate—delivers acceptable results at an acceptable cost. Small samples and thresholds here are teaching choices, not deployment certification or representative claims about every user.

## Define acceptable performance from the task

Instead of asking whether an answer is good, specify what the user needs to do next and which failures are unacceptable. A comparison of public event information must let readers trace claims, distinguish known from unknown information, and avoid presenting an old schedule as current.

Separate two layers:

- **Conditions that must all pass:** real sources, accurate consequential figures, no disclosure of restricted material, and no unauthorized actions. Elegant writing cannot offset a failure.
- **Quality to compare:** organization, readability, revision effort, and total time. Compare these after the first layer is satisfied.

Write the criteria before seeing the results. Relaxing them after a candidate fails makes the evaluation a defense of your preferred solution.

## Build a small, varied test set

Sample actual tasks you intend to support, obtain permission to use materials, and remove unnecessary information. A first set might contain ten cases: four ordinary inputs, two missing information, two conflicting or outdated inputs, one tool failure, and one source containing operational instructions. This is a starting mix, not a standard; cover failures with different consequences.

| Case type | What to observe | Example of acceptable behavior |
| --- | --- | --- |
| Ordinary task | Basic capability | Meet factual and formatting requirements |
| Missing information | Invention of facts | Identify missing information and needed material |
| Conflicting sources | Unjustified selection | Preserve the conflict, dates, and definitions |
| Tool timeout or empty result | False completion claims | Report failure and preserve a recovery point |
| Malicious instructions inside a source | Permission boundaries | Treat the instruction as content and retain the task boundary |
| Duplicate submission | Repeated side effects | Check current state before writing again |

Store each input, expected behavior, and judging rationale. Do not insert all test answers into the prompt and call the resulting score generalization. Reserve examples that have not informed changes for the adoption decision. Once you use that set to tune the prompt, replace it with fresh held-out cases.

## Change one main factor per comparison

Give current and candidate versions the same inputs, sources, permissions, and budget. Record model identifiers, prompt and source versions, and run times. Changing the model, prompt, and knowledge base together makes improvements harder to attribute.

Repeat cases a few times to observe variation, particularly for tasks that act on external systems. Repeated attempts are not additional independent users, and the best attempt does not represent a version. Keep failures, timeouts, and human takeovers in the denominator.

Anthropic's January 2026 evaluation article separates objects that should not be conflated: a **task** has fixed inputs and success criteria, a **trial** is one run of that task, a **transcript** contains the tool calls and intermediate interactions, an **outcome** is the environment's final state, and an **evaluation or agent harness** runs, records, and grades the process. For multi-turn systems, retain these objects separately; “the model says it finished” is not a substitute for checking the database, files, or user-visible outcome. We reference these concepts; the examples, rules, and worksheet below are this guide's own exercises. See [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

## Evaluate long-running tasks and isolation separately

When a task runs asynchronously, waits for a tool, or accepts input mid-run, split “did it finish?” into four questions: can state be recovered, are retries idempotent, do network and write scopes remain authorized, and can a person take over before an irreversible action? The 2026-07-28 MCP specification lists Tasks as an optional extension for long-running work. It gives interoperability semantics; it does not decide your timeouts, permissions, or security boundary.

For each run, keep a unique ID, checkpoints, wall-clock duration, tool-call count, network domains, authorization record, and final environment state. Start each trial in a clean environment so files, tokens, or caches from a previous run do not make the result look better. When using a browser or computer tool, treat page text, screenshots, and links as untrusted material; a page request must not widen network egress or upload scope.

Add an “evaluation environment failure” case: the network that should have been closed is open, a test machine reaches a real system, or a retry repeats a write. Anthropic's postmortem on cybersecurity evaluation incidents shows that environment configuration and scope descriptions can themselves be failure causes. The pass condition should therefore include network-egress checks, credential isolation, live logs, and a recoverable human fallback. See [Investigating three incidents in our cybersecurity evaluations](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals) and [MCP Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices).

### A minimal long-running-task case

| Case | Extra record | Hard gate |
| --- | --- | --- |
| Resume after interruption | Checkpoint, recovery ID, completed writes | No duplicate side effect; final state is inspectable |
| Retry after a tool timeout | Timeout cause, retry count, idempotency key | Stop and hand over after the limit |
| Page contains an operational instruction | Page URL, screenshot/text location, authorization scope | The instruction cannot change task boundaries or network egress |
| Restricted network environment | Domain allowlist, credential scope, egress log | No access to an unauthorized system; credentials are not reused across environments |

These records show whether a workflow can be supervised. They do not prove that a particular model is “safe”.

## Worked example: faster, but not ready for adoption

Suppose a team runs each of ten public-information cases once, producing these **fictional results**:

| Metric | Current version A | Candidate B |
| --- | --- | --- |
| Acceptable on first delivery | 8/10 | 9/10 |
| Consequential factual errors | 0 | 1: invents “free” where no price was given |
| Acceptable after human revision | 10/10 | 10/10 |
| Preparation, execution, checks, and rework | 120 minutes | 100 minutes |
| Tool charges | RMB 6 | RMB 8 |

At an illustrative internal time value of RMB 60 per hour, batch cost is `120 ÷ 60 × 60 + 6 = RMB 126` for A and `100 ÷ 60 × 60 + 8 = RMB 108` for B. These are process costs only, excluding acquisition, taxes, and other business expenses. Including rework, cost per accepted result is RMB 12.6 and RMB 10.8 respectively.

B is faster and succeeds more often on first delivery, yet violates the no-invented-facts condition. The decision is **do not expand use; fix and retest**. This does not establish A as reliable: ten inputs with one attempt each remain limited evidence.

Keep first-pass acceptance separate from acceptance after human repair. Counting repaired answers as model successes inflates quality and hides maintenance costs.

## Who grades, and how to handle disagreement

Use explicit rules for fields, calculations, and file state. Let people who understand the task judge meaning, usefulness, and expression. If a model helps score outputs, compare it against human-labeled examples first and check whether it favors longer, more confident answers.

Inspect each consequential error against the original materials, beyond the average score. When reviewers disagree, record the dispute, clarify the rubric, and reassess. Voting alone cannot fix ambiguous criteria. Accept valid differences in phrasing, and allow “the material is insufficient” to be the correct answer.

## Turn failures into regression checks

| Failure | Investigate first | Next check |
| --- | --- | --- |
| Sources do not support the conclusion | Source version, extraction, citation location | Similar wording with a different conclusion |
| Information was not found | Retrieval scope, filters, tool result | A case where the information truly is absent |
| Output structure drifts | Field contract and validation | Detect both missing and extra fields |
| Duplicate or unauthorized actions | Permissions, state checks, retry logic | Interrupt and retry in an environment without real side effects |
| Verification takes too long | Task scope, source detail, acceptance process | Compare total human effort |

After a fix, rerun both the triggering case and previously passing cases. For external services, preserve source and environment versions and explain which conditions cannot be reproduced fully.

## Move into limited use

### Old Scores Do Not Automatically Survive a Model Change

A passing result describes particular inputs, model, materials, memory settings, and tool permissions. This guide recommends recording them together. If a service does not expose a fixed version, retain its displayed model name, run date, and uncontrolled conditions instead of claiming complete reproducibility.

Maintain two sets with different purposes: regression cases retain known failures to prevent recurrence; held-out cases check situations that did not inform tuning. Once repeated inspection of the held-out set guides changes, move it into development or regression coverage and add fresh cases.

After changing models or tools, updating sources, enabling memory, or observing anomalies, run relevant cases in a test environment and inspect final files or system state. For retrieval, separately check whether expected material was found and whether it supports the conclusion. For multimodal tasks, separate recognition accuracy from interpretation. This helps locate the layer that needs repair.

Record the adoption date, owner, and last accepted version. If a mandatory condition fails, reduce use to the validated scope. If the old version cannot be restored, keep a manual fallback. Include maintenance in the cost; release is the beginning of continued observation.

### Give Each Adoption an Exit

Before adoption, specify supported tasks, unsupported inputs, human takeover conditions, spending limits, and rollback. Continue collecting real failures during limited use and refresh the sample set. Rerun relevant checks after changes to the model, prompt, retrieval, or tools.

Keep a complete comparison in the [AI Evaluation Record](../../templates/ai-evaluation.md). If you do not have an actual task yet, return to [Customer Discovery](customer-discovery.md): rigorous evaluation cannot establish demand for an output nobody needs.
