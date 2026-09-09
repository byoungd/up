---
title: AI Learning, Project Development, and Resource-layer Entrepreneurship
description: Han Xiankai's path from learning with AI to building and operating an AI resource layer, with engineering, delivery, operations, and business results kept distinct.
updated: 2026-09-01
sources_checked: 2026-09-01
---

# AI Learning, Project Development, and Resource-layer Entrepreneurship

My name is Han Xiankai, also known online as Li Pu. Many readers first found me through this English-learning project and later through my writing about software entrepreneurship, failure, recovery, and beginning again. I now disclose my role as chairman of China Token Cloud Computing Co., Ltd. and place the next stage of my work inside a more concrete question: **as AI becomes a general capability, how can an ordinary person move from learner to builder, then from builder to an entrepreneur in the resource layer?**

This is not a story about getting rich easily with AI, and it contains no return promise. It is a working map under real-world testing: what has happened, what methods may transfer, and what business outcomes must still be answered by real users, real costs, real incidents, and time. When the company failed in 2022, I saw how features that looked like AI could hide missing data, weak architecture, and unclear responsibility. Today's gates grew out of that failure.

## Keep Fact, Practice, and Result Separate

- **Already true**: I serve as chairman of China Token Cloud Computing Co., Ltd. The current homepage describes `token.love` as a unified AI gateway for enterprise and government-related scenarios, listing model access, routing and failover, usage metering, audit trails, and private/offline deployment.
- **In practice**: I use AI to learn, decompose requirements, develop projects, write tests, organise documentation, and deliver work while testing those methods in team and enterprise settings.
- **Still unverified**: whether customers will keep paying, whether unit economics will hold, whether supplier changes can be managed, and whether revenue can cover the risk.

When fact, judgment, and aspiration are mixed together, an entrepreneurship essay becomes an advertisement. Separating them makes an honest retrospective possible. When you analyse a public experience, use the [AI Case Review Template](../../templates/ai-case-review.md) to record the source and facts before writing judgment or transfer.

## How the 2022 Failure Changed Today's Gates

The problem was not a lack of code. We failed to prove the core capability, dataset, performance, security, and user value first. UI work, multi-platform support, and preset results made the product look complete, but could not answer where data came from, how results were verified, or who owned failure.

Every AI project now starts with five questions:

1. **Is the capability real?** Is it a model, retrieval, a rule, or a human process? Do not replace the explanation with a marketing label.
2. **May the data be used?** Are source, permission, sensitivity, retention, and deletion clear?
3. **How is the result accepted?** What are the test samples, edge cases, human review, and real-user standard?
4. **Can the cost be covered?** Are model, network, engineering, support, rework, compliance, and incident costs in the ledger?
5. **How do we leave safely?** Who can pause, degrade, switch, notify, roll back, and review?

If these questions have no answer, the next action is not more features. Narrow the problem and run an experiment that could disprove the assumption.

## 1. From Learner to Builder

I once treated English learning as accumulating more knowledge. Eventually I learned that the destination is not a larger collection of answers but the ability to complete a task independently. Learning with AI is the same. The result is not the length of a model's response. It is whether I can close the conversation, explain the important decisions, run the program, face the errors, and deliver the work.

I now use a working loop:

1. **State a real problem**: identify who has the problem and what counts as done;
2. **Save an unaided baseline**: expose knowledge gaps, constraints, and blind spots;
3. **Prepare trustworthy context**: provide documentation, data, existing code, organisational policy, and risk boundaries;
4. **Use AI to decompose**: compare options, create small experiments, and explain assumptions without outsourcing judgment;
5. **Build and verify actively**: use AI for prototypes, code, refactoring, tests, documentation, and debugging;
6. **Collect plural feedback**: tests, users, domain experts, sources, and security review decide together;
7. **Save state and evidence**: record completion, errors, cost, decisions, and the smallest next action.

This extends [Learning Anything with AI](1-ai-learning.md), but project development adds one hard rule: **every critical decision must be testable, explainable, or reversible**.

## 2. Building Projects with AI: Quality After Speed

AI can generate apparently complete code in minutes and spread a bad assumption across a system in minutes. My approach is not to replace the developer, but to treat AI as a high-frequency collaborator that can be questioned and must pass acceptance.

### 2.1 The project brief

Create a one-page `task-brief.md` for each project:

```markdown
# Task Brief

Real situation:
User/audience:
Decision or action to complete:
Deadline:

Known facts and sources:
Files allowed:
Data sensitivity: public / internal / confidential / restricted
Material deliberately withheld:

Final deliverable:
Format and length:
Acceptance criteria:
Items a person must confirm:

AI may:
AI may not:
Human reviewers:
Rollback or stop condition:
```

“Good experience”, “advanced architecture”, and “high intelligence” are not acceptance criteria. Use observable actions such as “a user can import a file and see an error report within ten minutes”.

### 2.2 An inspectable delivery chain

| Stage | AI may assist with | A person must confirm |
| --- | --- | --- |
| Requirements | Structure the user, scenario, constraints, and questions | Whether the problem is real and the outcome observable |
| Design | Propose architecture, interfaces, and minimum experiments | Data boundaries, dependencies, failure modes, and long-term cost |
| Prototype | Generate pages, interfaces, scripts, and sample data | Whether it solves the core task rather than merely looking good |
| Implementation | Complete code, explain changes, and generate tests | Critical logic, permissions, error handling, and maintainability |
| Validation | Run tests, static analysis, performance, and security checks | Whether tests cover real risks and results are reproducible |
| Delivery | Prepare documentation, deployment, change records, and rollback | Whether users can work, teams can take over, and failures can be traced |

Advance one logical slice at a time. Do not mix requirements, refactoring, formatting, and dependency upgrades. Preserve an unaided baseline, a working artefact, and an error/revision record so that speed can be distinguished from ability.

### 2.3 Code and release gates

```text
Here is the task brief and current code structure. Do not write code yet.
Propose two minimal implementation options and compare requirement coverage, change scope, dependencies, failure modes, test difficulty, data/permission risk, and migration cost.
Mark missing information and inference. Recommend only one slice that can be verified in one to two hours.
```

Before release preserve a version, change summary, migration steps, monitored signals, rollback trigger, owner, and user notice. Review by severity for requirement drift, data loss, permission bypass, injection, races, error handling, performance, maintainability, and test gaps.

Complete the [AI Project Scorecard](../../templates/ai-project-scorecard.md) after each pilot or release and keep an unaided baseline, assisted version, and delayed independent retest. Without all three, you cannot tell whether the tool created ability, outsourcing, or rework.

## 3. What Is the AI Resource Layer?

Models provide capabilities and applications provide the results users see. Between them lies infrastructure that makes capabilities accessible, controllable, measurable, and sustainable. I call this the **AI resource layer**.

It is more than reselling a model endpoint. It organises models, accounts, compute, data boundaries, and operating processes into a service a team can understand, use, and govern.

### 3.1 Capability map

| Resource-layer capability | Customer problem | Minimum evidence to verify it |
| --- | --- | --- |
| Multi-model access and routing | The business is locked to one supplier | Routing rules and comparison records for one task across two models |
| Identity, permissions, and quotas | Usage and accountability are unclear | Role matrix, quota policy, and audit-log sample |
| Metering, cost, and billing | Teams use AI without cost visibility | Cost report by team/project/request and reconciliation process |
| Deployment and operation | Service cannot enter approved environments | Deployment checklist, environment differences, and rollback drill |
| Observability and incidents | Latency, failure, and quality shifts cannot be explained | Request logs, error categories, alerts, and handling records |
| Data and compliance boundaries | Sensitive data flow and retention are unclear | Data-flow map, retention rules, approvals, and deletion evidence |
| Integration and support | Capability never enters the business process | Integration acceptance, on-call path, support tickets, and handover |

For the customer, the value is not one more model name. It is less duplicated integration, less uncontrolled cost, fewer interruptions when suppliers change, and a responsibility boundary the organisation can understand and govern.

### 3.2 The request lifecycle

This reference architecture is not a product promise. Every resource-layer service should be able to explain how a request moves:

**identity → permission and quota → data check → routing decision → model call → output filter → metering record → monitoring/alert → user delivery**

Each step must answer who owns it, what is recorded, what happens on failure, how long data is retained, and whether the request can be replayed or deleted. Interface forwarding without metering, permissions, logs, degradation, and audit is not reliable enterprise service.

### 3.3 Routing is not “choose the strongest model”

Routing should follow the task and its constraints:

- for low-risk, high-volume, stable tasks, consider cost and latency first;
- for complex reasoning or long context, compare quality, limits, and failure rate;
- for sensitive data, check approved scope, deployment location, and logging policy;
- during supplier failure, use degradation, retry, switching, or human takeover;
- record the version, reason, sample, and rollback for every routing change.

The strongest model is not always the right model if it is unstable, unauditable, or unaffordable.

## 4. China Token Cloud and token.love: A Business Path in Practice

China Token Cloud Computing Co., Ltd. is the company in which I currently serve as chairman. The current homepage describes `token.love` as a unified AI gateway for enterprise and government-related scenarios, listing model access, routing and failover, usage metering, audit trails, and private/offline deployment. This is a homepage product-positioning statement, not an endorsement from any third party, and it does not replace formal documentation, compliance approval, contracts, or a customer's own security review.

From a resource-layer perspective, the path can be expressed as:

**model and compute resources → unified access and routing → permissions, metering, and governance → enterprise integration → operations and continuing support**

A real product helps the customer understand where capability comes from, how cost is created, where data travels, who handles incidents, and whether migration remains possible. Specific capabilities, regions, plans, compliance scope, and service commitments must be verified against the current [token.love](https://token.love/) documentation and written agreement.

## 5. Enterprise Pilots: Solve One Acceptable Problem First

### 5.1 Discovery

Do not begin with a model demo. Ask:

- what the current process is and which step is slowest or most error-prone;
- who bears the cost, how often it occurs, and what an error affects;
- which data may be used and which data must never leave the organisation;
- which accounts, contracts, networks, permissions, and security requirements already exist;
- who will continue to use, approve, and pay if the pilot works;
- what result means “continue” and what result means “stop”.

Produce a one-page problem brief, not a one-page AI value statement.

### 5.2 Pilot

A credible pilot has scope, sample, non-goals, data boundary, owners, dates, acceptance criteria, failure exit, and a cost ceiling. Preserve the old-process baseline: human time, error rate, waiting time, rework, current cost, and user satisfaction.

During the pilot record model calls, routing, latency, failures, human takeovers, support hours, data exceptions, rework, and user feedback. Recording generated content alone cannot prove business improvement.

Use the [AI Project Scorecard](../../templates/ai-project-scorecard.md) to log test conditions, cost, independent performance, and release gates by version, so the pilot does not end as a single demo.

### 5.3 Acceptance and handover

Split acceptance into four layers:

1. **Function**: can the flow complete and are errors visible?
2. **Quality**: does output meet the business standard and can a person take over?
3. **Security**: do permissions, logs, retention, deletion, and audit pass?
4. **Operations**: who handles upgrades, incidents, cost, supplier switching, and support?

The handover package should contain architecture, data flow, permissions, environment variables, deployment, monitoring, on-call path, rollback, known issues, and the next review date.

## 6. How the Business Might Earn Money

Revenue does not come from renaming a model and adding a margin. It comes from assuming work that is expensive, fragmented, or difficult for the customer to manage. Possible value exchanges include:

- **resource-management services**: manage model access, quotas, and costs by request, team, project, or service level;
- **integration and delivery**: connect existing systems and complete deployment, permissions, logs, and acceptance;
- **managed operations**: handle upgrades, incidents, quality shifts, supplier changes, and daily support;
- **governance and security**: establish data boundaries, approval, audit, traceability, and risk response;
- **custom projects and training**: take a real business problem through design, prototype, launch, and handover.

These are not revenue promises. They are charging interfaces that can be tested one by one. Each must answer why the customer will pay, how the result will be accepted, and whether service cost can be covered over time.

### 6.1 Charging interfaces and use cases

| Charging interface | Suitable problem | Main risk | Evidence to record |
| --- | --- | --- | --- |
| One-off discovery/design fee | Clarify workflow, boundaries, and pilot | No value after the plan is delivered | Deliverable, hours, and continuation signal |
| Implementation fee | Integration, deployment, permissions, acceptance | Every customer becomes a new custom build | Scope, changes, rework, and contribution space |
| Usage/resource-management fee | Ongoing calls, projects, or team governance | Supplier prices and volume fluctuate | Calls, routing, cost, reconciliation, and caps |
| Subscription/service tier | Continuing operations, support, and governance | Promises exceed team capacity | Response time, availability target, support hours, exceptions |
| Training/advisory fee | Build team capability and governance | Learning does not become use | Objectives, work, transfer, and retest |

Formal agreements govern actual service. This public chapter discusses business logic without inventing prices, profits, customer counts, or return results.

### 6.2 The cost ledger

Resource-layer businesses can see demand while failing to see cost. Record models and compute, networking and storage, engineering, customer support, acquisition, compliance, security, incident compensation, supplier price changes, migration, taxes, and management time.

```text
contribution space = customer revenue
                    - models and infrastructure
                    - engineering and support
                    - acquisition and compliance
                    - incidents, rework, and refunds
```

Separate one-off cost from continuing cost. One-off projects are judged by delivery efficiency; continuing services by retention, support intensity, unit cost, and continuation signals. If every new customer adds calls, labour, and risk without enough value, scale can accelerate the loss.

## 7. Operations: No Runbook, No Enterprise Service

### 7.1 Minimum operations dashboard

- request volume, success rate, failure categories, and retries;
- latency distribution rather than only an average;
- cost by model, team, project, and task;
- quota breaches, data exceptions, permission denials, and human takeovers;
- supplier status, routing changes, and version changes;
- user feedback, support hours, and recurring problems.

These are recommended operating signals, not a claim that `token.love` currently provides all of them. Before launch, write indicators, owners, alert thresholds, and retention into the project agreement or internal runbook.

### 7.2 Incident handling

```text
discover → assess impact → pause risky changes → degrade/switch/take over
         → notify affected people → preserve logs and timeline → repair and verify
         → review root cause, cost, prevention → update the runbook
```

Record discovery time, affected projects, recent changes, data risk, temporary action, supplier status, recovery time, customer communication, root-cause hypothesis, and permanent repair evidence. AI can structure a timeline; it cannot replace the incident owner.

### 7.3 Supplier-switching drills

For each critical supplier prepare a backup route, degradation model, rate limit, cache or human process, data-migration plan, contract contact, and rollback test. Run a low-risk drill at least quarterly to verify that “switchable” is more than a sentence in a document.

## 8. Data, Security, and Compliance Boundaries

| Data level | Examples | Default handling |
| --- | --- | --- |
| Public | Published documents, public code, public data | Usable after checking source and licence |
| Internal | Unpublished plans, process, non-sensitive logs | Approved tools only; limit members and retention |
| Confidential | Customer records, contracts, strategy, unpublished vulnerabilities | Do not upload without explicit approval; prefer local processing or redaction |
| Restricted | Keys, identity/health data, children's data, third-party privacy | Keep out of general models; follow policy and applicable law |

A resource-layer service must answer where data enters, which suppliers see it, which logs are retained, who can read them, when data is deleted, and how deletion is evidenced. Deleting one file does not remove every history, cache, export, or backup.

## 9. A Twelve-week Validation Route

| Time | Central question | Action | Evidence to preserve |
| --- | --- | --- | --- |
| Weeks 1–2 | Which organisations have an urgent, specific problem? | Interview, observe the old process, map data | Interview notes, baseline, boundaries, stop condition |
| Weeks 3–5 | Can a minimum product reduce integration or management cost? | Build a sandbox, connect one task, run comparison tests | Working prototype, tests, failures, cost |
| Weeks 6–8 | Will the customer keep using a real process? | Small pilot, human takeover, weekly review | Usage traces, incidents, support hours, security record |
| Weeks 9–10 | Can another person reproduce delivery? | Handover, deployment, rollback drill | Runbook, permission table, handover acceptance |
| Weeks 11–12 | Do cost, quality, and charging form a combination? | Review, pricing experiment, continuation discussion | Cost ledger, proposal, continuation signal, next decision |

When evidence does not support continuing, narrow the problem, change the customer, or stop. When it does, complete security, contracts, permissions, monitoring, and handover before expanding.

## 10. Two Public-writing Practice Slices: From “Abstract” to “Frame by Frame”

Two WeChat articles about me approach AI from different directions: one is a profile of a thinking style; the other is a narrative about handling a noisy comment stream. They are not technical audits, customer case studies, or proof of income. I use them as public narrative material and translate their useful moves into experiments with explicit limits.

### 10.1 Refuse the first “most likely” answer

On 11 August 2026, TokenMany published [“Han Xiankai: The Most ‘Abstract’ Human in AI”](https://mp.weixin.qq.com/s?src=11&timestamp=1787503349&ver=6922&signature=hsfWcee*q*Okq4gsJ5TpMaWV4vZTwLean6SKtOxCC-EyAf9jWD6l1LQYDny29FqXVImHZFNFDPt*EVH*hVMN2pa91kZtuYfzI81wtV7yahnqVBsKS*c7Ls1uf9QqiEIF&new=1). It describes “abstract” as refusing ready-made answers and allowing technology, business, human behaviour, and daily life to illuminate one another. That is a literary observation about a public persona, not an independent measurement of capability.

I turn the transferable part into development habits:

1. write down the default assumption, then add at least one competing explanation;
2. compress a cross-domain idea into an experiment that can run in one or two hours;
3. mark which observations are facts and which are analogies, intuitions, or hypotheses;
4. let the experiment disprove an attractive idea and keep the failed sample in the project record.

This keeps “having a wild idea” from ending as a style of expression. The idea must pass through problem definition, a minimum prototype, tests, and retrospective before it becomes evidence another person can inspect.

### 10.2 Turn noise into a question that can be answered

On 21 August 2026, Wanli Center published [“Han Xiankai and AI: Splitting the Noise into Emotion, Frame by Frame”](https://mp.weixin.qq.com/s?src=11&timestamp=1787503349&ver=6922&signature=k7g1j*QF9lLWMGUlkAu65EFOmvokb8FoM51LNr4hgn4Q4Cc7q3t3O8Mkac7YnWTJbIVdvX-PXYdZXVHEohJieTOPR*Q2-TVAHuIg2ljgp2BMn8m7STrvovnpW01j817Y&new=1). In its narrative, comments are classified one by one and annotated with “claim, evidence, emotional intensity, expression, and answerability”; insults are first treated as “emotion samples”. This does not prove that a public-opinion product was delivered or that the analysis improved an outcome. It offers a feedback-processing frame worth testing cautiously.

In a real project I would constrain it to this workflow:

| Step | AI may assist with | A person remains responsible for |
| --- | --- | --- |
| Collect | deduplication, clustering, and recurring themes | source, permission, data minimisation, and deletion deadline |
| Separate | distinguishing claims, guesses, emotion words, and rhetorical tactics | checking evidence and refusing to turn labels into conclusions |
| Prioritise | ordering by impact, urgency, and answerability | setting priority, risk, and escalation |
| Respond | drafting several restrained replies aimed at a specific issue | facts, privacy, responsibility, and publication scope |
| Review | summarising changes, recurring misunderstandings, and open issues | deciding whether to change the product, clarify, pause, or stop |

Comments, tickets, and customer feedback may contain personal data. Without permission, do not send whole conversations, names, contact details, or identifying context to a general model. Even public data should be redacted, access-limited, and assigned a retention period. AI can queue the noise; it cannot decide who is right or carry responsibility for a public response.

The shared lesson from these articles is simple: creativity supplies a different entry point, while evidence decides whether to continue. Emotion deserves to be seen, but it enters a product or enterprise process only after facts, privacy, and responsibility have done their work.

## 11. Where the Path Loses Control

- treating model output as fact and a demonstration as product quality;
- mistaking one-off project revenue for a sustainable business;
- counting API cost while ignoring support, rework, compliance, sales, and management time;
- uploading customer data, company secrets, or third-party private material to an unapproved tool;
- becoming locked to one model or supplier without migration, degradation, or incident plans;
- promising response time, availability, or compliance that the team cannot reliably provide;
- presenting an affiliated product as an independent review or hiding the relationship;
- using more prompts to cover the absence of a real user, real cost, or real acceptance.

This project will keep a few simple rules: sources remain traceable, interests are disclosed, results can be retested, risks are not romanticised, and unknowns are named as unknowns.

## 12. What I Hope to Leave Behind

Even if this path does not become a large enough business, it should leave three things:

1. a method that helps me and the team learn and build faster without abandoning quality;
2. real work that users can use, test, and criticise;
3. a commercial record that does not delete failure, so later readers can see which judgments worked and which were only hopes at the time.

I still want to make money because revenue is one form of evidence that a value exchange can continue. It is not the only value, and it is not an ending that can be announced in advance. The more honest objective is to connect AI capability to real people, real organisations, and real responsibility, then see whether the work deserves to continue.

## Sources and Verification

- **Personal experience**: the 2022 failure, 2023 recovery, and 2026 return to AI are documented in [My Story](../part-2/my-story.md) and [Entrepreneurship](../part-2/entrepreneurship.md).
- **Project affiliations**: China Token Cloud, `token.love`, `ku0.com`, and the WeChat articles are disclosed in [Author Projects and Real-world Practice](../../projects.md); they are not independent reviews.
- **Commercial claims**: charging models, cost ledgers, and the twelve-week route are methods to test, not proof of revenue, customer count, profit, or investment return.
- **Official pages checked**: 1 September 2026. The homepage positioning for `token.love` and `ku0.com`, as well as the external article links in this chapter, were reachable; verify exact capability, service scope, region, policy, and contract commitments again in the real project.

## Return the Method to Daily Life

This chapter should not leave a reader among product names, architecture diagrams, and charging interfaces. Its useful remainder is a slower, more honest working posture: name the problem, write the boundary, and place a run, a cost, and a failure where they can be inspected.

Whether a project continues is still answered by users, teams, agreements, time, and responsibility. Visit [Author Projects and Real-world Practice](../../projects.md) to check relationships, status, and evidence boundaries; or move directly into [Part IV: Practice and Recovery](../part-4/practice-and-recovery.md) and bring the judgment here back to one small task, one week's rhythm, and one action that can be restarted.

Technology can lay a road quickly. That does not mean a person has travelled it. What carries into the next stretch is not one elegant demonstration, but the ability to keep learning, delivering, and revising under real conditions.
