---
title: "The Resource Layer and Enterprise Services: A Practice Note"
description: An appendix case study on moving from learner to builder to the AI resource layer, covering why enterprises pay, how delivery is accepted, security boundaries, and a twelve-week validation.
updated: 2026-11-23
sources_checked: 2026-11-23
source_review_interval: 60
---

# The Resource Layer and Enterprise Services: A Practice Note

This page holds the enterprise and business half of [AI Learning, Project Development, and Resource-layer Entrepreneurship](../part-3/2-ai-development-and-resource-layer.md). It sits in the appendices as a case study rather than in the main reading arc. It records a real piece of the author's practice, and it records which conclusions are still waiting for evidence.

Disclosure: Han Xiankai chairs China Token Cloud Computing Co., Ltd. What follows describes the resource-layer problem the company serves, the working method the author uses, and the charging interfaces that can be verified one by one. It is not a revenue promise, a product advertisement, or an endorsement by any third party. Concrete capabilities, regions, plans, and compliance scope are governed by formal documentation and written agreements. The dated project disclosure is on [Author Projects and Practice](../../projects.md).

## What This Page Answers

How does an ordinary person move from “I can learn with AI” to “I can deliver with AI”, and then to “I can manage AI capability for someone else”? Along the way: why a customer would pay, what counts as a completed delivery, who is responsible when something fails, and when to stop.

This page discusses commercial logic and engineering boundaries only. The method — the learning loop, task briefs, code gates, and evidence cards — stays in [Part III](../part-3/1-ai-learning.md) and in the practice pages on [AI Workflows](ai-workflows.md) and [AI Evaluation](ai-evaluation.md).

## From Learner to Builder to the Resource Layer

The author's path has three stages, and each produces a different kind of evidence:

1. **Learner**: using English, programming, and AI to finish real tasks. The evidence is the work, the error record, and the retest.
2. **Builder**: using AI to assist with requirements, prototypes, code, tests, documentation, and delivery. The evidence is a system that runs, an acceptance record, and a rollback plan.
3. **Resource layer**: turning scattered models, accounts, compute, data boundaries, and organisational process into a service that a team can connect, control, meter, and govern. The evidence is a customer trial, a cost ledger, an operating record, and a decision to continue.

There is no automatic promotion between stages. Being able to learn does not mean being able to deliver; being able to deliver does not mean being able to run a service. Each step widens the scope of responsibility: from your own result to a customer's data, cost, and failures.

## Why an Enterprise Would Pay

An enterprise usually pays not for “one more model name” but to carry work that is expensive, scattered, or hard to manage:

- the business depends on a single vendor and switching is costly;
- nobody can say who may use the system, how much, or what happened afterwards;
- it works, but nobody knows what a team or project spends;
- the service cannot enter the network and environment the organisation has approved;
- latency, failures, and quality swings cannot be explained;
- the flow, retention, and approval of sensitive data are unclear;
- the capability never reaches a business process, and nobody owns it when something breaks.

The value of a resource layer is fewer repeated integrations, less uncontrolled cost, and one more responsibility surface that an organisation can understand and manage.

### Charging Interfaces and Fit

| Charging interface | What it addresses | Main risk | What must be recorded |
| --- | --- | --- | --- |
| One-off diagnosis or design fee | Clarifying process, boundaries, and a pilot | No follow-on value after the document | Deliverables, hours, follow-on signal |
| Implementation fee | Integration, deployment, permissions, acceptance | Every customer is custom, nothing repeats | Scope, change, rework, margin |
| Usage or resource-management fee | Ongoing management by call, project, or team | Vendor pricing and usage swings | Calls, routing, cost, reconciliation, cap |
| Subscription or service-level fee | Ongoing operations, support, governance | The promise exceeds the team's capacity | Response time, availability, support hours, exceptions |
| Training and advisory fee | Building a team's ability to use and govern | Trained but unused; effects hard to attribute | Objectives, assignments, transfer, retest |

These are **charging interfaces that can be verified one by one**, not revenue forecasts. Each must answer three questions: why the customer would pay, how the result is accepted, and whether the cost of service can be covered over time. Actual contracts follow the parties' written agreement. Published writing here does not invent prices, profit, customer counts, or outcomes.

### The Cost Ledger

A resource-layer business easily sees demand and misses cost. Record at least:

```text
Contribution margin = customer revenue
                      - models and infrastructure
                      - engineering and support
                      - acquisition and compliance
                      - incidents, rework, and refunds
```

Keep one-off and recurring costs separate. A one-off project is judged by delivery efficiency; a recurring service is judged by retention, support intensity, unit cost, and renewal signals. If each new customer adds only usage, labour, and risk, growth may deepen the loss.

## How an AI Delivery Is Accepted

Acceptance has four layers. If any layer lacks evidence, the work is not finished:

1. **Function**: can the process complete, are errors visible, can a person take over exceptions.
2. **Quality**: does output meet the business standard, which cases regressed after a change, is human review still within budget.
3. **Security**: do permissions, logs, retention, deletion, and audit pass.
4. **Operations**: who owns upgrades, incidents, cost, vendor switching, and user support.

The handover package includes at least: architecture diagram, data-flow diagram, permission matrix, environment variables, deployment steps, monitoring dashboard, on-call and escalation path, rollback method, known issues, and the next review date. Without a runbook there is no enterprise service.

Before release, record the version, change summary, migration steps, monitoring metrics, rollback triggers, owner, and user notice. After release, register test conditions, cost, independent performance, and release gates per version in the [AI Project Scorecard](../../templates/ai-project-scorecard.md), so the pilot does not end as a single demo.

## Data, Permissions, and Security Boundaries

A resource layer handles other people's data, so boundaries come before features:

- **Least privilege**: roles, quotas, visibility, and call records are designed separately; deny by default, authorise item by item.
- **Data tiers**: public, internal, confidential, and restricted material are handled separately; restricted data never enters an unapproved path.
- **Traceability**: every call records time, subject, task, model, route, and result state; retention and deletion are written down.
- **Exit**: the customer can export, migrate, and delete data, and knows how long migration takes.
- **A protocol is not a guarantee**: the [MCP specification (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28) lowers the cost of repeated integration, but it does not perform a system's security review. External servers, tool descriptions, and web content are untrusted input until checked.
- **Human takeover**: high-risk actions must be pausable, degradable, switchable, and reversible. Who may stop them belongs in the runbook.

The same boundaries apply to personal practice. The recording habits you build while learning determine whether you can explain, in an enterprise setting, where data goes, who is responsible, and what happens when something fails.

## A Twelve-Week Validation and Its Stop Conditions

A reversible resource-layer pilot can run for twelve weeks. Each stage leaves evidence, and the work may stop at any stage.

**Weeks 1–4: define the problem and the baseline.** Walk the customer's current process and record manual time, errors, waiting, rework, and current cost. Produce a one-page problem brief, the data boundary, and the acceptance standard. No demo, no outcome promise.

**Weeks 5–8: a bounded pilot.** Choose one slice that can be accepted. Write down scope, sample, non-goals, owner, cost cap, and exit conditions. Record the new process at the same time: calls, routing, latency, failures, human takeover, and support hours.

**Weeks 9–12: acceptance and decision.** Accept across function, quality, security, and operations; complete the handover package; hold one review: continue, narrow the scope, change the problem, or stop. Stopping is not failure; it puts the evidence into the next decision.

**Stop conditions** (pause and review if any appears):

- key data cannot be confirmed as authorised, or cannot be deleted;
- error rate, latency, or support cost exceeds the written cap;
- the acceptance standard keeps moving during the pilot;
- the customer cannot say who uses it, who pays, and who is responsible;
- the team cannot honour a service level it has already promised.

## Limits and Next Steps

The limits deserve to be stated plainly:

- this records the author's own practice and judgment, not a third-party audit or an industry benchmark;
- the company's product capabilities, regions, plans, and compliance scope follow formal documentation and written agreements, and they change;
- whether customers keep paying, whether unit economics hold, and whether cost stays controllable at scale are still waiting for real results;
- the book provides no prices, profit, customer counts, or revenue figures, and no public narrative here should be read as investment advice.

The next step can be small: choose one real problem, write the boundary in an [AI Task Brief](../../templates/ai-task-brief.md), record the process in an [AI Case Review](../../templates/ai-case-review.md), and then decide whether a pilot is worth starting. The resource layer is not a more advanced road. It is simply a more specific way of saying “carrying part of someone else's work”. The method and the lessons from failure stay in [Part III](../part-3/1-ai-learning.md); the smallest experiments on the business side are in [From Problems to First Customers](customer-discovery.md) and [A Sustainable Small Business](sustainable-business.md).
