---
title: "Learning Anything with AI: From Real Problems to Verifiable Delivery"
description: Based on Han Xiankai's product failure, recovery, and return to AI practice, this chapter builds a practical loop of problems, baselines, practice, delivery, verification, and review.
updated: 2026-09-01
sources_checked: 2026-08-24
---

# Learning Anything with AI: From Real Problems to Verifiable Delivery

My name is Han Xiankai, also known online as Li Pu. Many readers first met me through English learning, then through stories about software, restaurants, a failed company, disrupted health, and a return to technology and AI. I now treat AI as learning infrastructure, not a button that thinks on my behalf.

The method comes from an uncomfortable fact: an answer can be complete while a product has no users; code can run while its data and security have no foundation; a person can sound clever in a chat and still be unable to perform alone after the chat closes. A real learning result survives without AI: you can explain, judge, perform, transfer, and leave evidence another person can inspect.

## Quick Overview

- define the real outcome before deciding where AI enters;
- compare an unaided baseline, an assisted version, and a delayed independent retest;
- put sources, permissions, privacy, cost, and ownership into the task boundary;
- save state at the end so the next session does not depend on chat memory.

## Where the Method Comes From

The following are personal records, not research findings or a universal promise. Read each case in four steps: what happened, which judgment failed, what principle followed, and what you can practise today.

If you are analysing a public profile, an AI project experience, or your own failure record, copy the [AI Case Review Template](../../templates/ai-case-review.md) first. Separate source, facts, judgment, outcome, and transferable principle. The template cannot prove an outcome for you, but it can stop a narrative from quietly becoming a conclusion.

### 2015–2016: From a Dead End to Real Users

After setbacks around an internship and graduation, I returned home. In 2016 I started `bt0.com`, a small movie website, and later accepted web-design work. It was not a grand product, but it had real users, feedback, and traces of use.

The easy mistake was to treat “I can build it” as “people need it”. What changed my judgment was not another technology lesson. It was seeing people use, review, and leave because of a detail.

**Principle**: learning starts with a real problem; work exposes gaps better than collected answers.

**Try today**: choose a problem someone near you actually has. Without AI, write one page naming the audience, action, completion standard, and three things you do not know.

### 2017–2022: From Front-end Refactoring to Organisational Constraints

In 2017 I joined a software company serving lawyers and law firms. I moved from front-end developer to team leader, general manager, and partner. The early product came from outsourcing and changing requirements; I later led a Vue rewrite, but the released product went a long time without a sale.

The lesson was that effort, refactoring, and feature count cannot replace problem discovery, user validation, and team coordination. One person learning to code does not mean an organisation has learned to deliver.

**Principle**: write learning as a real task, not “understand a topic”; every step needs an audience and acceptance standard.

**Try today**: replace “learn product management” with “write a one-page brief for a real user in 45 minutes and let that user reject one assumption”.

### 2022: Mistaking Search and Presets for AI

Sales fell sharply in 2022. When my high-school desk mate joined, we discovered an old project structure, performance and security problems, and “big data” and “AI” features without a real dataset or training foundation. Some features were essentially search and preset results.

We had spent too much effort on UI, multi-platform support, and feature accumulation before confirming that the core capability and data existed. The company eventually closed. Better demonstrations could not erase the loss or the responsibility.

**Principle**: a demo is not a capability, a model answer is not a fact, and generation speed is not delivery quality. Important claims must return to sources, tests, users, and an accountable person.

**Try today**: ask AI to explain a familiar topic. Then, without the chat, write its sources, a counterexample, an unknown, and one test that could disprove it. What you cannot write is a learning gap.

### 2023: Recovering the Ability to Act

After the company failed, I closed GitHub, left many groups, played games, and lost the boundaries of daily life. Returning home, the first step was not founding another company. It was eating, sleeping, going outside, facing the past, and reducing tasks to a scale I could complete.

**Principle**: a learning system must include energy, health, and ordinary responsibilities. Consistency beats short bursts, and a difficult season should not be judged by a dramatic reversal.

**Try today**: reserve 5–15 minutes for one saved action: organise a page, run a test, listen to a clip, or write three sentences. Record what happened instead of hiding in a plan.

### 2026: Returning to AI and Physical Industries

In 2026, as chairman of China Token Cloud Computing Co., Ltd., I returned to technology, enterprise services, and physical-industry practice. I am exploring AI for agriculture, forestry, animal husbandry, fisheries, and other real settings, and plan to offer basic training for rural cooperatives. This is a direction and a personal plan, not proof of revenue, customer count, or impact.

**Principle**: AI must eventually enter a real workflow and accept constraints around cost, permissions, privacy, user feedback, failure, and rollback.

**Try today**: for one organisational problem, write where data enters, who can see it, what passes acceptance, how work stops when it fails, and which human responsibility you will own.

## The Seven-step Loop

1. **Define a real outcome**: situation, audience, action, deadline, and acceptance criteria.
2. **Save an unaided baseline**: attempt the task first and expose gaps and blind spots.
3. **Prepare trustworthy material**: prefer official documents, books, papers, data, code, and real cases.
4. **Design guided practice**: ask AI to question, explain, compare, hint, and create parallel tasks without doing the critical step.
5. **Produce actively**: close the material and explain, code, write, calculate, demonstrate, or decide.
6. **Use plural feedback**: sources, tests, experts, users, and security review join AI in judging the result.
7. **Update state**: save work, errors, cost, open questions, and the smallest next task.

Without step one, AI turns a wish into an answer. Without step two, you cannot see growth. Without steps six and seven, errors return in the next conversation.

## One-page Task Brief

Copy the complete [AI Task Brief](../../templates/ai-task-brief.md) into a private project directory. The block below keeps only the minimum fields. Redact sensitive material; never send passwords, identity documents, customer records, or third-party private data to a general model.

```markdown
# AI Task Brief

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
Human reviewer:
Rollback or stop condition:
```

“Good experience”, “advanced architecture”, and “learn AI” are not acceptance criteria. Use observable actions, such as “a user can import a file in ten minutes and receive an explainable error report”.

## A Minimal Session Protocol

Before starting, ask AI only to restate the boundary:

```text
Restate in no more than eight bullets: goal, audience, inputs, acceptance criteria, constraints, unknowns, and what you cannot verify.
List the sources you intend to use. Mark source-free facts as unverified.
Do not produce the final deliverable. Identify the three risks most likely to cause rework.
```

During the work, advance one inspectable slice:

```text
Break the task into the smallest verifiable slices. Advance one slice at a time and state input, assumption, change, check, and next step.
If a prerequisite conflicts, pause and ask. Do not silently replace the requirement. Keep failed approaches and reasons.
```

At the end, create a state update instead of a polished essay:

```text
Based only on what happened in this session, output:
1. completed work and evidence location;
2. judgments confirmed by a source, test, or person;
3. recurring errors, risks, and open questions;
4. the smallest next task, acceptance criteria, and required material.
Do not claim to remember another session or turn inference into fact.
```

## Different Outputs Need Different Evidence

| Output | Minimum evidence | Stronger evidence |
| --- | --- | --- |
| Explanation | Primary source, key terms, uncertainty | Closed-book restatement, counterexample, transfer task |
| Code | Run result, basic tests | Boundary tests, static checks, security review, real samples |
| Research | Primary link for material facts | Cross-source verification, definitions, dates, counterexamples |
| Prose | Audience, purpose, facts, structure | Real-reader feedback, revision record, version comparison |
| Decision | Options, assumptions, cost, risks | Small experiment, decision log, after-action review |
| Teaching | Goal and practice result | Independent transfer, delayed retest, changing errors |

For high-risk content, “not yet confirmed” is more professional than a fluent guess.

## Three Comparisons: Prove What AI Changed

Use the [AI Learning Log](../../templates/ai-learning-log.md) to keep three samples of the same task:

1. **Unaided baseline**: complete it independently and record time, quality, bottlenecks, and confidence;
2. **Assisted version**: let AI do only the agreed work and record prompts, sources, accepted/rejected suggestions, and rework;
3. **Delayed independent version**: after 3–7 days, close the chat and answer key, then repeat under a related condition.

| Comparison result | Cautious interpretation |
| --- | --- |
| Assisted and independent versions both improve | AI may have supplied useful scaffolding that remained yours |
| Assisted improves while independent regresses | The product improved, but a critical step may have been outsourced |
| Time falls while rework and errors rise | You gained speed and accumulated “speed debt” |
| Confidence rises while accuracy is flat or lower | Calibrate confidence before granting the tool more access |

Record task completion, quality, independent performance, rework, cost, and transfer. One comparison cannot prove causation, but it is more inspectable than “AI feels useful”.

## Common Failures and Handover

| Failure point | Signal | Immediate action |
| --- | --- | --- |
| Fabricated fact | No source, version, or data location can be found | Stop sharing; return to a primary source and mark it unverified |
| Requirement drift | The answer grows complete but stops answering the original task | Paste the brief again and ask for conflicts and unknowns |
| Privacy leak | Input contains customer, identity, health, or key material | Stop upload; redact or use an approved environment |
| False completion | Code runs without boundary tests, or prose reads well without citations | Run the smallest acceptance test; fluency is not completion |
| Session dependency | You cannot explain the next step outside the chat | Save it in the [AI Learning Log](../../templates/ai-learning-log.md) and [Learning State](../../templates/learning-state.md) |

At handover, save the current goal, completed work and evidence location, unconfirmed facts, errors and risks, cost, smallest next task, and stop/rollback condition. A chat window is a temporary workspace, not the project’s only archive.

## From Learning to Delivery

When a task becomes code or a team project, add three gates:

- **Explainable**: the owner can explain important decisions without the chat;
- **Testable**: real inputs, edge cases, permissions, and failure paths are checked;
- **Reversible**: someone knows who pauses, who is notified, and how to recover from risk or outage.

Use a portable directory:

```text
00-brief/       task brief and acceptance criteria
01-baseline/    unaided sample and initial tests
02-sources/     primary material, licences, source index
03-working/     drafts, experiments, prompts
04-output/      deliverable, recording, build artefact
05-feedback/    user feedback and error categories
06-decisions/   decision log and open questions
07-operations/  permissions, monitoring, deployment, rollback
learning-state.md
```

## Data, Privacy, and Copyright

| Level | Examples | Default handling |
| --- | --- | --- |
| Public | Published documents, public code, public data | Check source and licence before use |
| Internal | Unpublished plans, processes, non-sensitive logs | Approved tools only; limit members and retention |
| Confidential | Customer records, contracts, commercial strategy, unpublished vulnerabilities | No upload without approval; prefer local work or redaction |
| Restricted | Keys, identity/health data, children's data, third-party private material | Keep out of general models; follow policy and law |

Deleting a file does not delete history, shared links, exports, caches, or backups. Public articles can contain personal data too; confirm permission, minimum necessary scope, and retention before processing them.

## Seven Days, Thirty Days, Twelve Weeks

### Seven days: one reproducible micro-delivery

- write the brief and acceptance criteria;
- save an unaided baseline;
- complete a one-to-three-hour deliverable with the loop;
- save sources, prompts, tests, feedback, and state;
- record where AI helped, misled, and what remains without it.

### Thirty days: one repeatable workflow

- complete four loops for a recurring task;
- compare time, quality, rework, cost, and independent performance;
- remove steps that do not improve the result;
- conduct a failure retrospective, not only a success demo.

### Twelve weeks: delivery to a real user or organisation

- obtain real-audience feedback every two to four weeks;
- complete fact, test, security, privacy, copyright, cost, and handover review;
- export the material and state, then write a retrospective and next-cycle decision;
- if evidence is weak, narrow the problem, change the audience, or stop instead of adding prompts.

Put the three comparisons and cycle result into the [90-Day Cycle Map](../../templates/90-day-cycle.md), changing one variable in the next cycle.

## Sources and Verification

- **Personal experience**: mainly [My Story](../part-2/my-story.md), [Entrepreneurship](../part-2/entrepreneurship.md), and [Author Projects and Practice](../../projects.md). These are personal records, not universal rules.
- **Product information**: official help pages listed in [Learning English with AI](../part-1/7-ai.md); features, regions, and plans change.
- **Project status**: China Token Cloud, `token.love`, public articles, and physical-industry plans carry affiliations or unverified scope; none is an independent review or proof of revenue.
- **Last checked**: 24 August 2026. Recheck official product pages, external links, and project status before updating or using this guidance.

## Closing: Keep the Ability with the Person

AI readily creates more than wrong answers. It creates a premature sense of completion. The explanation is fluent, the code runs, the plan is arranged, and we begin to believe the problem has been understood. Answers can arrive much faster than judgment forms.

Learning worth continuing should leave something the conversation cannot carry away: a more accurate question, a traceable source, a failed test, a judgment changed by evidence, an artifact another person can use, and a person who still knows what to do after the tool closes.

Learning is not asking AI to arrive on your behalf. It is using the tool to reach what you could not yet see, then checking the ground yourself. Close the window, explain the work to a real person, complete the next step, and carry the result. If the ability follows you out of the conversation, it has begun to remain.
