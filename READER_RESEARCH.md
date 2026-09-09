# Reader research protocol

This protocol turns the remaining quality question into a small, privacy-preserving observation: can a new reader find the right entry, complete a first useful action, preserve evidence, and return to the task later? It is a research aid for maintainers, not a claim that the book works for everyone.

## Before inviting anyone

- Ask for voluntary participation and explain the purpose, duration, recording choice, retention period, and deletion contact in plain language.
- Do not require an account, public post, screen recording, voice recording, location, employer, school, health, relationship, financial, customer, or private project information.
- Use a synthetic task or the participant's own non-sensitive task. Let the participant skip a question or stop without explaining why.
- Collect only a random session code, language edition, device class, viewport/zoom condition, starting question, and the minimum outcome needed to improve the path.
- Store notes privately with access limited to the maintainers who need them. Delete raw recordings and identifying notes after the stated retention period; retain only de-identified findings and the decision they changed.

## Plain-language opening script

Read this before the first task and invite questions:

> This is a voluntary 25–35 minute usability observation of the reading path. I am testing the pages and instructions, not your intelligence, English level, work, or learning outcome. You may skip any question, stop at any time, or ask me to delete your notes under the retention plan we just discussed. Please use a non-sensitive task and do not show passwords, customer information, health details, private messages, or anything you are not authorised to share. I will record only a random session code and the minimum non-sensitive conditions needed to improve the path. May we begin?

Do not treat silence as consent. Record the participant's yes, no, or decision to stop before continuing. If the participant reveals sensitive material, pause the task, ask them to close or redact it, and do not copy it into the observation record.

## One 25–35 minute session

1. **Entry:** Give the reader only a realistic question, such as “I want a first speaking practice task” or “I need to carry a Python learning state into a new AI conversation.” Do not explain the correct route.
2. **Find:** Record the first page they choose, the time to first meaningful action, and every place they hesitate or backtrack. Do not correct them during this phase.
3. **Act:** Ask them to complete one small output: fill the four-line start, save a baseline, or download/copy one worksheet. Record whether they know what completion means without maintainer help.
4. **Return:** Ask them to close the page and describe what they would bring to a new session or a seven-day retest. Check whether they can locate the saved worksheet and its next review point.
5. **Debrief:** Ask which wording, field, route, or boundary was unclear; distinguish observed behavior from the participant's interpretation and preference.

Use a task script with the same wording for comparable sessions. A maintainer may clarify safety or privacy, but should not silently teach the intended route during the first attempt.

## Neutral closing script

End with the same questions each time:

> The observation is complete. Before I explain anything, what would you carry into a new session or a seven-day retest? Which wording, route, field, or boundary was unclear? Is there anything in my notes you want removed? I will separate what I observed from what you think it means, and I will not publish a quote, image, recording, or identifying detail without separate permission.

Only after the participant answers may the maintainer explain the intended route or show an alternative. Record that explanation as post-task assistance; do not rewrite the first-attempt result.

## Minimum observation record

```markdown
Session code:
Date and language edition:
Device class / viewport / zoom:
Starting question:
First route and time to first meaningful action:
First saved output and time:
Where the reader hesitated or backtracked:
What the reader thought the completion standard was:
What they would carry into a new session:
Seven-day retest status: not yet / attempted / completed / stopped
Observed facts:
Participant interpretation or preference:
Privacy-safe product change considered:
Decision: keep / revise / remove / gather more evidence
Evidence retained after deletion:
```

Do not convert one person's preference into a universal rule. Look for repeated task failures across at least three readers or two independent sessions before changing shared navigation, wording, or safeguards. A single severe privacy, safety, or accessibility failure is an immediate stop condition even without repetition.

## Analysis and release gate

Group findings by task and language, then compare first route, time to first action, completion, abandonment, and delayed return. Preserve counterexamples and failed attempts. For every proposed change, write the observed trigger, the smallest change, the risk introduced, and the regression test or manual check that will catch it.

After a change, repeat the same task script with a fresh reader or a deliberately different condition. Do not publish participant quotes, screenshots, recordings, or outcome claims without explicit permission and a separate privacy review. Do not describe this protocol as a clinical, educational, hiring, or efficacy study.

## English summary

Run a voluntary, private 25–35 minute observation. Give a realistic question without teaching the route. Measure first route, time to first useful action, saved output, hesitation, completion understanding, and whether the reader can return with a state file or worksheet after the page is closed. Collect only a random code and non-sensitive context. Delete raw material on schedule, keep de-identified decisions, repeat the task after changes, and never present a small usability sample as proof of learning effectiveness.
