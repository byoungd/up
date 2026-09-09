---
title: "Reading: From Word-by-word Translation to Claims and Evidence"
description: Begin with a real reading task and first-pass baseline, then separate language, structure, background, layout, and attention barriers while training technical documentation, source comparison, evidence checks, and delivery.
updated: 2026-09-02
sources_checked: 2026-09-02
---

# Reading: From Word-by-word Translation to Claims and Evidence

I once treated English reading as an endurance contest. My eyes moved right as quickly as possible, every unknown word stopped me for a translation, and a thickening notebook proved that I had not read for nothing. After finishing an article, however, I could rarely explain the problem the author was solving. A technical document was worse: I knew where each menu was, but not what a parameter would change.

Reading is not moving every word into another language. It is building meaning, structure, and judgment while some uncertainty remains. You need to know when to continue, when to verify, and when to separate an author's view from your own. You also need the reading to cause something after the page closes: a decision, explanation, test, or handover.

This chapter does not offer an ever-longer book list. It offers a retestable path: preserve a first pass, identify whether the barrier is language, structure, background, layout, or attention, use different passes to build a claim map and inference boundary, then close the source and explain, verify, execute, or deliver in your own words. A parallel source checks whether the method transferred.

## Chapter at a Glance

- Define whether the reading ends in an answer, decision, action, explanation, or handover.
- Preserve a timed first pass instead of allowing lookup and AI rewriting to cover the real starting point.
- Split "I cannot understand it" into vocabulary/grammar, sentence structure, background schema, layout/technical, and attention/capacity barriers.
- Give intensive, extensive, and narrow reading different jobs instead of using one speed for every source.
- Read technical documentation through version, goal, prerequisites, minimum example, constraints, failure, and verification.
- Use translation and dictionaries to remove critical barriers without replacing English structure, source location, and independent reconstruction.
- Compare definitions, evidence, dates, interests, and unstated assumptions across sources.
- Use AI to extract candidate terms, question evidence, and create parallel tasks, never to decide what the source said for you.
- Track one main source, one parallel source, and one real output for fourteen days.

## 1. Define the Reading Result

"Improve reading" is too large to start. Write the action you need after the text ends:

| Task | Material and condition | Evidence of completion |
| --- | --- | --- |
| Locate information | Notice, instruction, short report, or document with one clear question | Mark the source location and state the supporting line |
| Follow an argument | Comment, report, research abstract, or technical explanation | Map claims, reasons, evidence, limits, and unresolved questions |
| Read documentation | Guide, API page, migration note, error reference, or changelog | Run a minimum experiment and record version, input, output, and failure conditions |
| Build stamina | A novel, biography, or nonfiction text you will revisit for seven days | Keep chapter gist, changes in people/arguments, and delayed retelling |
| Synthesise sources | Two or three sources on one topic | Write a one-page comparison separating fact, inference, position, and date |
| Support a decision | Material with cost, risk, or responsibility | State choice, evidence, unknowns, next step, and exit condition |

The reader role changes the standard. An exam asks for a located answer; a project asks for version verification; a friend's story asks you to understand relationship and feeling. Different tasks need different precision. Not every page needs to become an essay.

Use the [Reading Evidence Card](../../templates/reading-evidence.md) to keep task, source, first pass, barrier, claim map, and delivery together.

## 2. Preserve an Unpolished First Pass

Choose 300-1500 words, one documentation section, or one chapter you can attempt in twenty minutes. Record before starting:

```markdown
Source title, author, origin, and version:
Publication date or documentation version:
Task and completion standard:
Reader/user:
Time limit:
Dictionary, translation, search, notes, and AI allowed:
Copyright, privacy, and retention boundary:
```

Read once without looking up every word, then write:

```markdown
One-sentence gist:
How the text moves:
Three certain details:
What the author or maintainer wants me to believe or do:
One unresolved point:
Action I would take from this understanding:
First-pass time:
```

The first pass is a comparison point, not a verdict. Do not replace it with a polished translation. For safety, medical, legal, financial, or production material, necessary professional verification comes before an artificial no-support condition.

## 3. Split "I Cannot Understand It" into Six Layers

The next action changes by layer:

| Layer | Typical signal | Next action |
| --- | --- | --- |
| Vocabulary and grammar | Key form, collocation, or syntax is unfamiliar | Check minimum necessary information and return to vocabulary/grammar evidence |
| Structure and reference | Words are known, but modifier, agent, condition, or turn is unclear | Map sentence core, pronoun reference, and connections |
| Background and schema | Language is readable, but event, field, or cultural premise is missing | Add a small trustworthy background map, then return to the source |
| Argument and evidence | Sentences are visible, but claim, example, limit, and speculation blur together | Build a claim map and return to source locations |
| Layout and technical | Small PDF, broken link, wrapped code, mixed versions, or inaccessible format | Change format, enlarge, search the current version, or record the defect |
| Attention and capacity | Fatigue, anxiety, excessive density, or loss of the main line | Shorten the section, reduce simultaneous tasks, or move to a higher-capacity time |

Unknown-word count describes the fit between source and vocabulary; it does not directly set a proficiency level. If almost every sentence blocks the gist, use easier parallel material first. Lowering the entry point does not lower the destination.

## 4. Five Reading Passes, Five Different Questions

Ten mechanical rereads are less useful than five passes with separate jobs.

### Pass One: Locate Direction

Use title, version, contents, figures, and opening paragraph to predict the real problem. Finish on a timer without looking up words and write the gist.

### Pass Two: Draw Structure

Label paragraph functions: background, problem, claim, reason, example, limit, action, or conclusion. In long sentences find the subject, core verb, condition, and turn before translating.

### Pass Three: Check Critical Evidence

Look up recurring, domain-critical, reasoning-critical, or action-changing words and sentences. Record source location, definition source, and your interpretation. Do not use a whole-paragraph translation as verification.

### Pass Four: Close Tools and Reconstruct

Without the source or dictionary, rebuild the movement in five sentences: problem, claim, evidence, limit, next action. Add one source-supported inference and one possible counterexample.

### Pass Five: Enter the Task

Turn reading into action: answer a question, run a minimum example, write a confirmation email, compare sources, explain it to a reader, or ask the next question that reduces uncertainty.

Research syntheses show strong relationships between L2 reading comprehension and language components such as vocabulary, grammar, decoding, and listening. Strategy-instruction studies also suggest that prediction, monitoring, evaluation, and problem solving can be teachable processes. These findings are correlations or context-specific interventions, not substitutes for delayed testing under your own material, time, and task conditions.

## 5. Technical Documentation: Turn Pages into Verifiable Facts

Slow documentation reading is rarely only a vocabulary problem. A page may combine version, defaults, prerequisites, examples, exceptions, deprecation, and security boundaries. Read in this order:

1. **Goal**: whose problem does this page solve, and what result should appear?
2. **Version**: which release, platform, dependency, and date apply?
3. **Prerequisites**: what permissions, environment, inputs, data, network, and prior knowledge are assumed?
4. **Minimum example**: remove decoration and run or reason through the smallest testable fragment.
5. **Parameters and constraints**: what defaults, types, ranges, order, cost, rate, and side effects matter?
6. **Failure and rollback**: what does the error mean, when must work stop, and how can it recover?
7. **Verification**: does your output match the documented claim? If not, is the gap version, environment, understanding, or documentation?

Keep a technical fact card:

```markdown
Goal and version:
Prerequisites:
Minimum input:
Expected output:
Actual output:
Failure condition/error:
Limit explicitly stated in the source:
Part I am still inferring:
Smallest next test:
```

This works for SDKs, APIs, migration guides, command-line help, and open-source READMEs. Understanding is not saving a link. It is verifying one small fact in the current version and environment.

## 6. Unknown Words, Word Families, and Translation Boundaries

Give an unfamiliar word a task role:

| Word role | Response |
| --- | --- |
| Low-frequency modifier that does not affect gist | Pass it and continue in context |
| Recurring core word | Check sense, part of speech, collocation, word family, and source example |
| Technical or institutional term | Check formal definition, version, hierarchy, and counterexample |
| Word changing negation, condition, number, or responsibility | Verify its scope and action consequence immediately |
| Expression that only sounds natural in translation | Return to English structure and author stance before inferring meaning |

Word families help guessing and coverage, but a derived form is not automatically usable. Translation can provide a background map; it cannot replace tone, logic, qualifiers, and responsibility in the source. After reading, close the translation and reconstruct in English or your strongest language, while pointing to the key source location.

## 7. Intensive, Extensive, and Narrow Reading

**Intensive reading** increases resolution: short, dense, reviewable, and focused on claims, evidence, terms, and syntax. **Extensive reading** builds stamina and continuity: longer, gist-first, and tolerant of words that do not affect the story or direction. **Narrow reading** stays with one topic or field across several sources so background and chunks recur.

Do not disguise leisure reading as intensive work, and do not turn every novel into homework. Read a long book during a walk, narrow-read technical documentation for work, and choose one short article for the evidence loop. Material should be challenging enough to teach and manageable enough to revisit; difficulty is not identity certification.

Books, abstracts, news, community discussions, product documents, and open-source READMEs can all serve. Describe whether a recommendation supports information location, argument, technical verification, stamina, or synthesis. Do not use sales, rankings, or "every native speaker should read this" in place of task fit. Record edition, access date, rights, and author or institution interest.

## 8. Multiple Sources and Cross-Cultural Logic

Sources on one topic may use different definitions, dates, evidence standards, and assumptions about responsibility. Compare them with a record like this:

```markdown
Shared question:
Definition and date in source A:
Definition and date in source B:
Strongest evidence in each:
Omitted evidence or limits:
Author/institution interest:
Which differences are factual, and which are values:
What new evidence would change my judgment:
```

What people call "foreign logic" is often a difference in structure, background, genre, or responsibility context. Break it into claim, assumption, evidence, qualifier, exception, and requested action before using a national label. Understand how the other source builds its problem before deciding whether to agree.

## 9. Divide Work among AI, Search, and Readers

| Tool/role | Useful work | What it cannot prove alone |
| --- | --- | --- |
| Reader | Search, annotate, enlarge, and record source locations and versions | Mark count is not comprehension |
| Dictionary/search | Check definition, word family, collocation, version, and primary source | One definition may not fit the context |
| AI | Extract candidate terms, ask structural questions, compare your claim map, and create parallel tasks | It may invent summary, citation, background, or author intention |
| Teacher/peer | Ask why you read it that way and inspect the inference boundary | One explanation still needs independent reconstruction |
| Real task/reader | Verify explanation, execution, decision, or handover | One smooth event is not long-term transfer |

Give AI your first pass and source locations first:

```text
Here is my gist, evidence map, and one inference for paragraphs 3-5. Point to source locations I missed. Separate what the author states, what the source supports, and what cannot be inferred. Do not rewrite the summary first. End with one parallel-source question and one counterexample I must answer alone.
```

Do not upload customer, colleague, student, family, medical, contract, or unreleased project material to an unapproved tool. For paid, legal, safety, or version-sensitive claims, return to current official documentation or qualified professional advice.

## 10. Make Reading Produce an Output

Completion evidence does not always need to be a long summary. It can be:

- a confirmation email that names version, evidence, and next step;
- a minimum technical experiment with input, output, and failure recorded;
- an explanation of gist, evidence, and limit to someone who has not read the source;
- a one-page decision memo comparing sources and listing unknowns and exit conditions;
- an answer to a parallel question on a new topic.

Feedback first asks whether the task was completed, the reader understood, and the evidence is traceable. Keep first pass, reconstruction, feedback, and delivery. Do not show only the AI-polished summary.

## 11. A Fourteen-Day Reading Experiment

| Day | Action | Evidence |
| --- | --- | --- |
| 1 | Choose a main source and real task; complete a timed first pass | Gist, structure, details, unknowns, and conditions |
| 2 | Build the six-layer barrier map | One to three task-critical barriers |
| 3 | Mark structure on a second pass | Paragraph function, sentence core, and claim map |
| 4 | Check critical terms, version, and source locations | Definition, source, word family, and limits |
| 5 | Close tools and reconstruct in five sentences | Claim, evidence, inference, and counterexample |
| 6 | Complete an explanation, test, or confirmation | Post-reading output and reader response |
| 7 | Close old notes and read parallel material | Speed, gist, evidence, and barrier comparison |
| 8 | Keep topic, change genre | Background and structure transfer |
| 9 | Keep genre, change topic | Vocabulary and inference transfer |
| 10 | Compare a second source or position | Definition, evidence, and interest differences |
| 11 | Repair only the barrier that still recurs | Third reconstruction or fact card |
| 12 | Let AI or a peer offer a counterexample | Acceptance, rejection, and source reason |
| 13 | Deliver a report, test, or handover under time pressure | Real audience result |
| 14 | Close prompts, complete a new task, and choose next cycle | Evidence to keep, downgrade, replace, or move on |

Fourteen days is not a page-count contest. It asks whether, after material, topic, or audience changes, you can still find the line, check the basis, and complete a real action.

## 12. Evidence That Reading Is Becoming Ability

- The first pass preserves the question and main line instead of being captured by one unknown word.
- You can locate whether the barrier is language, structure, background, layout, or capacity.
- You can state what the author explicitly says and what is only your inference.
- After reading documentation, you can verify a minimum example in the current version or identify a missing prerequisite.
- Faster reading does not consistently lose gist, evidence, or limits.
- You can reconstruct in your own words after closing the source.
- The reading action transfers across topic, genre, source, or device.
- You can return understanding to a reader, peer, code, decision, or next task.

Real speed is not escaping the page faster. It is spending less time in the wrong place. You begin to know which word can wait, which qualifier cannot disappear, and which beautiful conclusion must return to its source. When text is more than exam material, it becomes a road into knowledge, work, and another person's experience.

## Sources and Boundaries

- [Jeon & Yamashita (2014), L2 Reading Comprehension and Its Correlates](https://api.crossref.org/works/10.1111%2Flang.12034): the meta-analysis synthesises relationships between passage-level L2 reading comprehension and ten component variables; vocabulary, grammar, and decoding results are correlational evidence, not a causal guarantee for one exercise.
- [Jeon (2022), L2 Reading Comprehension and Its Correlates](https://api.crossref.org/works/10.1075%2Fbpa.13.03jeo): the update distinguishes language-knowledge variables from broader cognitive variables and notes that age, language distance, measurement, and proficiency affect interpretation.
- [Akkakoson (2013), The Relationship between Strategic Reading Instruction and L2 Reading Achievement](https://api.crossref.org/works/10.1111%2Fjrir.12004): a 16-week comparison with Thai university science and technology students; the chapter preserves its sample, course, and pre/post-test boundaries.
- Reading-source versions, permissions, author positions, web availability, and technical facts change. Important work should return to the current source, primary evidence, professional feedback, and real-task acceptance.

Related entry points: [Vocabulary](2-vocabulary.md) | [Grammar](grammar.md) | [Listening](3-listening.md) | [Speaking](5-speaking.md) | [Learning English with AI](7-ai.md) | [Reading Evidence Card](../../templates/reading-evidence.md) | [Evidence Chain Template](../../templates/evidence-chain.md)

## Closing: Give Words Their Weight Again

Reading is not moving the eyes across line after line as quickly as possible. Behind every worthwhile text, someone chose what to claim, which evidence was enough, what remained uncertain, and what may have been omitted or misunderstood. Slow down long enough to ask what the author claims, where the reason comes from, and which facts can be checked. One day an English document, email, or book will no longer look like a wall of unknown words. You will see structure, position, and evidence, and enter a larger conversation with questions of your own.
