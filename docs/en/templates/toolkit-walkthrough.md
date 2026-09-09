---
title: "Toolkit Walkthrough: Let AI Continue a 90-Day Learning Project across Sessions"
description: Use an explicitly synthetic Python-learning case to show how Learning State, an AI Task Brief, an unaided baseline, an artifact, an Evidence Chain, Weekly Review, and a Reader Field Note hand work over.
updated: 2026-09-09
---

# Toolkit Walkthrough: Let AI Continue a 90-Day Learning Project across Sessions

Many readers do not lack plans. They do not know when each worksheet should open. Another common problem appears during a three-month learning project: one AI conversation grows too long, while a new conversation seems to erase the state that came before it.

The answer is not to demand permanent memory from AI. **Let a file preserve state and let AI handle the current task.**

This page uses a Python learner preparing for a career change as a complete walkthrough. The person, tasks, code results, scores, and feedback are synthetic. They demonstrate how to fill the tools; they are not a real reader outcome and do not prove that ninety days is enough for a career transition.

## This Is Not a Success Story

The demonstration learner has these conditions:

- Can read variables, conditions, and simple loops but cannot independently complete a small program;
- Can reliably invest four 45-minute sessions each week;
- Has a ninety-day goal of independently completing a command-line tool that reads CSV, validates rows, and prints a summary;
- Will not upload company data, ask AI to write the final artifact, or repay interruption with lost sleep;
- Will not add frameworks or another course if core code still cannot be explained on day fourteen.

These conditions are demonstration boundaries. Your starting point, time, body, work, and goal may differ completely.

## Scene: Why the Plan Loses Its Memory

The initial failure is to leave everything inside one chat window:

1. Ask AI for a twelve-week plan;
2. Ask questions, practise, and revise code in the same conversation every day;
3. Depend on prior messages to preserve errors, progress, and the next step;
4. As context grows, new answers begin mixing old tasks together;
5. After opening a new conversation, reconstruct the learner from a long recollection.

Context length is not the only problem. A chat log has no stable version and does not clearly separate completed fact, AI interpretation, and next hypothesis. Learning state should not be trapped inside one provider or one conversation.

## The Job of Each of Five Tools

| Tool | Job in this case | What it does not own |
| --- | --- | --- |
| [Learning State](learning-state.md) | Preserve cross-session facts, evidence, errors, boundaries, and next task | Every line of conversation |
| [AI Task Brief](ai-task-brief.md) | Bound the current 45-minute task, input, assistance, and acceptance | The whole life plan |
| [Evidence Chain](evidence-chain.md) | Compare unaided baseline, assisted version, delayed retest, and transfer | Proving “mastery” through one score |
| [Weekly Review](weekly-review.md) | Change one variable from one week's evidence | Turning one poor week into a verdict about character |
| [Reader Field Note](reader-field-note.md) | Record whether the toolkit entered action and where it remained unusable | Public disclosure or a rating of the book |

If this is your first use of the toolkit, follow this page for one week. Do not open every other template at the same time.

## Step One: Put State outside the Conversation

The learner creates `python-learning-state.md` instead of using an AI thread as memory:

Save this main file in a private notes tool or local folder, with practice materials in `evidence/week-01/` alongside it. All paths below are relative to the main file's folder. They are naming examples within the synthetic demonstration, not code downloads supplied with the book. Paths help the learner find files; file contents provide evidence that can be checked.

```markdown
# Learning State — python-90d-v1

Updated: 2026-09-02
Main file: python-learning-state.md
Evidence location: evidence/week-01/ (relative to the main file's folder)
Ninety-day situation: independently deliver a CSV-summary command-line tool and explain input validation, error handling, and tests.
Initial baseline: day one, no AI, 25 minutes; can write variables, if, and for, and has handled only normal CSV rows; cannot independently complete input validation, separate functions, or write tests.
Reliable capacity: Monday, Wednesday, Friday, and Sunday, 45 minutes each.
Existing evidence: evidence/week-01/baseline.py; crashes on completely empty rows or empty amount fields.
Repeated errors: looking at answers first; treating running code as explained code; changing several variables and losing the cause.
Boundaries: synthetic data only; submit my version first, no AI-written final artifact; no make-up study after 23:00.
Current phase: days 1–14, calibrate.
Phase gate: if core code still cannot be explained independently on day fourteen, add no framework or new course.
Smallest next task: revise reading of a 12-row synthetic CSV so normal-row summaries and completely empty rows pass first.
Fixed functional acceptance: (1) correct valid-row count and total for normal rows; (2) skip completely empty rows; (3) report row numbers for invalid amounts and skip those rows without crashing.
Invalid amounts: an empty amount field, letters, or a negative number; these are input rules chosen for this demonstration only.
Learning evidence kept separately: functions I can explain; passing and failing tests saved; neither counts toward the three functional conditions.
Stop condition: save state when 45 minutes ends; do not stay up to finish.
```

The state file keeps only what can change the next action. Course notes, full chat logs, and every attempt belong in the evidence folder rather than on the state page. Future updates retain the goal, initial baseline, capacity, and boundaries that still apply. The latest version should be a complete snapshot that stands alone, not just a list of changes.

## Step Two: Give AI One Task at a Time

A new conversation does not ask AI to “remember me”. It receives the latest state and one task brief:

An ordinary chat does not gain file access by seeing a local path. The learner pastes the state and attaches `evidence/week-01/baseline.py` plus the necessary synthetic input for this task, or provides only the relevant excerpts. Even when a tool can read files, confirm which materials it actually read. A file whose contents were not supplied remains an index entry awaiting verification; it is not evidence already checked in this session.

```markdown
Below is my Learning State file. First restate the version, goal, current evidence, main errors, boundaries, and next task in no more than six bullets. Point out conflicts or gaps. Do not add facts that are absent; distinguish results I report from evidence you actually read this time.

This session has one task: revise reading of the synthetic CSV so normal-row summaries and completely empty rows pass first.
Process: let me submit an unaided version first; identify at most three problems that affect the result without giving full code; after I revise it, test normal and completely empty rows first and record the invalid-amount condition that has not passed. At 45 minutes, return five updates: completed, evidence, error/risk, handover, and next step. I will check them before writing them back to the main file.
```

AI's first job is to restate the state, not begin a lecture. When the restatement is wrong, repair the state or prompt before generating another plan on a false premise.

## Step Three: Save a Baseline before Asking for Help

The synthetic unaided attempt produces:

| Condition | Result | Evidence |
| --- | --- | --- |
| 25 minutes, no answer | Correct summaries for normal rows; completely empty rows and empty amounts raise exceptions; all logic in one function | `evidence/week-01/baseline.py` |
| AI identifies only three issues | Empty-row and amount validation, function ownership, and missing tests become visible | `evidence/week-01/feedback.md` |
| After revision | Normal and completely empty rows pass; invalid amounts still violate the specification; two functions can be explained and failing tests are saved | `evidence/week-01/revision.py` · `evidence/week-01/tests.md` |

The record is not “AI wrote the program”. It says the unaided version exposed issues, AI helped classify them, and the learner completed empty-row handling, function separation, and test records. The unmet invalid-amount condition became the next task. The three feedback categories and the three functional conditions are different counts.

Asking for complete code first may produce a better-looking file while erasing the baseline and any way to tell which ability belongs to the learner.

## Step Four: Put the Artifact into an Evidence Chain

Week one does not preserve the statement “learned CSV”. It records four time points:

The denominator below always refers to the same three functional conditions in the state file: normal-row summaries, completely empty rows, and invalid amounts. The third condition passes only when empty, alphabetic, and negative amounts are all handled as specified. Changing the denominator cannot improve the result. Save function explanations and failing-test locations separately; they cannot replace a failed function.

| Time point | Condition | Synthetic result | What it still cannot show |
| --- | --- | --- | --- |
| Baseline | No AI, 25 minutes | 1/3: only normal-row summaries pass; empty rows and invalid amounts fail | Understanding of error handling |
| Immediate after assistance | Three feedback points seen | 2/3: normal and completely empty rows pass; invalid amounts fail | Retention after several days |
| Day-seven delayed retest | Old code closed; parallel CSV | 2/3: the same two conditions pass; invalid amounts fail again | Adaptation to a new field |
| Transfer | Add a `currency` field and record the new requirement separately | Finds where change belongs; currency validation incomplete; excluded from the original three-condition score | Structure begins to transfer, prerequisites remain missing |

Function explanations and passing/failing cases are saved in `evidence/week-01/tests.md`; the independent day-seven version is saved in `evidence/week-01/day-07-retest.py`. Explaining two functions after immediate revision is a separate learning observation and does not change the functional count.

The result is not perfect and is more informative than “maintained a seven-day streak”. The next variable is not pandas, a web framework, and a database. It is input validation and failing tests.

## Step Five: Continue in a New Conversation

After the weekly review, the learner checks the artifacts and tests, writes changes back into the same main file, and updates the version and date. Here is the complete `v2` snapshot, retaining the goal and boundaries:

```markdown
# Learning State — python-90d-v2

Updated: 2026-09-08
Main file: python-learning-state.md
Evidence location: evidence/week-01/ (relative to the main file's folder)
Ninety-day situation: independently deliver a CSV-summary command-line tool and explain input validation, error handling, and tests.
Initial baseline: day one, no AI, 25 minutes; can write variables, if, and for, and has handled only normal CSV rows; cannot independently complete input validation, separate functions, or write tests; only normal-row summaries passed the three functional conditions.
Reliable capacity: Monday, Wednesday, Friday, and Sunday, 45 minutes each.
Current phase: days 1–14, calibrate; the day-seven retest is complete.
Completed: normal and empty CSV rows; logic separated into read_rows and summarize.
Evidence: evidence/week-01/baseline.py; evidence/week-01/feedback.md; evidence/week-01/revision.py; evidence/week-01/day-07-retest.py; evidence/week-01/tests.md.
Fixed functional acceptance: (1) correct valid-row count and total for normal rows; (2) skip completely empty rows; (3) report row numbers for invalid amounts and skip those rows without crashing.
Invalid amounts: an empty amount field, letters, or a negative number; these are input rules chosen for this demonstration only.
Delayed result: still 2/3 on day seven; (1) and (2) pass, (3) fails; this does not establish mastery of input validation.
Learning evidence kept separately: two functions could be explained after immediate revision; passing/failing tests and explanations are in evidence/week-01/tests.md.
Main error: test coverage of failure paths is incomplete; normal output causes testing to stop too early.
Boundaries retained: synthetic data, no company data; unaided answer first, no AI-written final artifact; no make-up study after 23:00; no repayment of missed time.
Phase gate: if core code still cannot be explained independently on day fourteen, add no framework or new course.
Smallest next task: write three failing tests before implementing parse_amount.
Acceptance for this task: empty, alphabetic, and negative amounts are reported with row numbers and skipped; existing normal-row and completely empty-row tests still pass; record independent explanation of the design separately.
Stop condition: save the current result and remaining errors when 45 minutes ends.
Next review: 2026-09-15.
```

After saving, the learner reopens the main file and confirms that it shows `v2`, the next task, and the review date before closing the old conversation. The new conversation uses the complete `v2`; when artifacts need checking, their relevant contents are supplied separately, without assuming a path means AI has read them. There is no need to paste tens of thousands of chat words or ask AI to infer deleted goals. **The state file preserved continuity across sessions; AI continues only from the material actually supplied this time.**

## Step Six: Complete a Reader Field Note after Seven Days

The synthetic demonstration must also inspect whether the toolkit supported action:

```markdown
Entry problem: I did not know how a new AI conversation could continue a three-month plan.
Action: created a versioned Learning State, completed one CSV task, and saved an unaided version plus retest.
What remained after seven days: could write state v2 without the old chat and begin one defined task in a new conversation.
Failed transfer: knew errors should be preserved but still did not know how to classify them.
Most useful: the five-tool responsibility table and filled state example.
Still abstract: phase gates need examples for more kinds of goals.
Cannot conclude: this workflow guarantees job readiness after ninety days.
```

The note remains private first. Only after paths, identity, and sensitive details are removed should a public version be considered.

## If the Week Is Interrupted

The state file does not require repayment of the whole plan. The first return record states facts:

```markdown
Interruption fact: no practice for seven days.
Cause evidence: two overtime evenings, one period of illness, no retest completed.
What I will not do: compress four lessons into the weekend or repay them through lost sleep.
Return action: run the previous tests, write one failing case, and update state.
24-hour acceptance: preserve the failing test and the next 25-minute entry point.
```

When health, safety, work responsibility, or relationships need priority, recovery itself can be the week's result. The plan serves life; life does not owe the plan an apology.

## Session Protocol You Can Copy

```markdown
1. Restate the submitted state version, goal, evidence, errors, boundaries, and next task.
2. Identify conflicts and missing information; do not infer unwritten history.
3. Handle one minimum task only and let me submit the unaided version first.
4. Give at most three high-impact feedback points, separating observation, interpretation, and suggestion.
5. Do not provide a complete answer unless I explicitly request it.
6. End with: completed, evidence, error/risk, handover, and next step. I will check and write these back into the complete state; do not claim to have saved them for me.
7. Treat the file as the source of truth and do not claim memory of other conversations. Mark evidence supplied only as a path, without contents you have read, as not yet verified.
```

This protocol cannot guarantee that AI never errs. It makes errors easier to detect and preserves the learner's ownership of the problem, state, and final judgment.

## What This Walkthrough Shows and Does Not Show

It shows that five tools can form a clear handover: state lives outside the conversation, the task becomes smaller, unaided and assisted versions remain separate, a delayed retest occurs, and a new conversation has a reliable entry.

It does not show that:

- The synthetic learner will persist for ninety days;
- This task difficulty fits every beginner;
- AI always makes learning faster than studying without it;
- Completing a command-line tool equals real job readiness;
- One week represents long-term transfer.

In real use, preserve your own baseline, artifacts, time, cost, and failures. The example shows how to fill the records. Reality decides whether they are useful.

## Closing: Give Memory to the File and Keep Judgment with Yourself

A long learning project should not lose its past when a chat closes, and it should not impersonate continuity merely because one chat is long.

Let the state file remember what happened. Let evidence preserve what you actually made. Let the next conversation carry only the next step. Tools may change, models may update, and the plan may shrink. As long as you know where you came from, what remains unproved, and where the next task lives, learning is not trapped inside any conversation.

Related entry points: [Learning State](learning-state.md) | [AI Task Brief](ai-task-brief.md) | [Evidence Chain](evidence-chain.md) | [Reader Field Note](reader-field-note.md)
