---
title: "Copyright, Edition, and Citation"
description: The edition, titles, byline, licence, non-medical boundary, source rules, and citation format for Still Here, and a plain statement that no publisher or ISBN is attached.
updated: 2026-11-23
---

# Copyright, Edition, and Citation

This page records how the book is named, licensed, cited, and corrected. It is not a contract or legal advice. It only puts the facts a reader needs in plain view.

## Edition and Title

The current edition is **1.1.0**, updated **23 November 2026**. The Chinese title is 人生进阶指南：一个普通人的失败、恢复与重新学习. The English title is *Still Here: A Field Guide to Beginning Again*.

Directory names such as `part-1` and `part-2` are historical theme slugs, not reading order. The reading order is the one shown in the [Book Roadmap](roadmap.md) and the table of contents.

When the edition changes, the Chinese and English EPUB and PDF are rebuilt together. Checksums are published in the [Download Center](../../book-downloads.md), and the build manifests stay in the downloads directory.

## Author and the English Edition

Author: **Han Xiankai** (韩先凯).

The Chinese text is the primary edition. The English edition is an adapted rewrite, not a literal translation: chapter structure, dates, and evidence correspond, while tone, examples, and sentence length are rewritten for English readers. If the two languages appear to disagree on a fact or a boundary, the Chinese text governs; please report the difference to the maintainer.

“Li Pu” was the author's early pen name and the name behind the 2017 *Ridiculous English Learning Guide*. It survives here and in the [Prologue](prologue.md) as a historical note, not as a title-page byline or book title. The English edition does not transliterate it.

## Licence

- Prose, translations, author-created diagrams, and templates: **CC BY-NC 4.0**. You may copy, adapt, and share them non-commercially with attribution to `byoungd and contributors`, a link to this repository, the source page, and a note of changes. Commercial use is not granted.
- Site configuration, checks, build code, and tests: **MIT**.
- Third-party quotations, images, trademarks, and product names remain with their rights holders. Inclusion in this repository does not relicense them.

This repository is an **open-content project**, not open-source software in the OSI sense; only the code portion is MIT-licensed open source. The full text is in `LICENSE.md`, `LICENSE-CONTENT.md`, and `LICENSE-CODE.md` at the repository root.

## Not Medical Advice

The chapters on depression, anxiety, recovery, sleep, and workload collect personal experience and public sources. They are not diagnosis, treatment plans, medication advice, or crisis intervention. The recovery chapters do not name drugs, doses, or tapering schedules, and they do not publish local hotline numbers that may expire.

If you are experiencing persistent low mood, sleeplessness, hopelessness, or thoughts of harming yourself, contact someone you trust and seek qualified local medical or mental-health support. Safety comes before growth. This book is not care.

## Citation and Verification

Statements in the book fall into three kinds: **research findings**, **personal experience**, and **hypotheses waiting for a test**. Only the first can be repeated as evidence. The second proves that the author lived through something. The third has to be retested by each reader on their own task.

AI products, model capabilities, prices, protocols, and vendor policies are rechecked according to how fast they change: usage policies, safety notices, product features, and plans every 30 days; specifications and implementation guides every 60 days; stable concepts every 120 days. A page's `sources_checked` date means external sources were verified; `updated` means the text changed. They do not substitute for each other.

The full rules are in [Sources, Citation, and Verification](../../reference/sources-and-citation.md), and the entry list is in the [Bibliography](../../reference/bibliography.md).

## Corrections and Feedback

- Factual errors, broken links, and translation differences: use the [issue templates](https://github.com/byoungd/up/issues/new/choose) and include the page, the original text, the source, and your suggestion.
- Security problems, exposed personal data, or unauthorised third-party images: do not post them publicly. Use the private route described in `SECURITY.md`.
- Reader field notes: the [Reader Field Note](../../templates/reader-field-note.md) is welcome, but remove unnecessary third-party identity, health, financial, and relationship details.

Corrections enter the text and the EPUB/PDF at the next release; earlier versions remain visible in the Git history.

## No Publisher or ISBN

This is an open manuscript maintained by its author. It has not been published by a publishing house, has no ISBN, and has no print distribution channel. The EPUB and PDF are produced by this repository's build scripts for personal reading and home printing. They do not carry a publisher's editorial review or endorsement.

To cite the book, use the title, author, edition, date, and URL, and note that the text is CC BY-NC 4.0. The repository includes `CITATION.cff` for tools that read that format:

```text
Han Xiankai. Still Here: A Field Guide to Beginning Again. Edition 1.1.0. 23 November 2026.
https://byoungd.github.io/up/en/
```

If a formally published edition ever exists, this page will record the publisher, the ISBN, and the mapping between editions. Until then, please do not assign an ISBN or a publisher to this book.
