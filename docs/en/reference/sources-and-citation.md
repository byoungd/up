---
title: "Sources, Citation, and Verification"
description: How Still Here separates research findings, personal experience, and untested hypotheses, how AI material is rechecked, and how to cite the book correctly.
updated: 2026-11-23
---

# Sources, Citation, and Verification

This book does not want any sentence treated as beyond challenge. This page covers three things: how statements are classified, how often external material is rechecked, and how to cite and correct the book.

## Three Kinds of Statements

**Research findings** come from published studies, official guidance, or specifications. They describe results obtained under particular samples, materials, measures, and conditions. They cannot be rewritten as a guarantee for one person. When the book cites them, it keeps the author, year, link, and limits; primary sources are used where they can be checked, and marketing pages are not accepted as a substitute.

**Personal experience** proves only what the author lived through. It can be part of the evidence, but it is not a law: one failure does not show that everyone should avoid the same road, and one recovery does not show that one method works for everyone. Read a personal story as a scene, not a prescription.

**Untested hypotheses** are inferences about the future, made by the author or the reader. They may be right, and the next experiment may overturn them. The book tries to mark “if … then …” conditions; a judgment without such a marker can be treated as a hypothesis.

When the three are mixed, the result is prose that sounds right and fails in use. While reading, ask first: which kind of statement is this?

## Recheck Rules for AI Material

AI products, model capabilities, prices, plans, protocols, and vendor policies change quickly. The book rechecks them by how fast they move:

- **30 days**: usage policies, safety notices, product features, regions, and plans. Pages declare `source_review_interval: 30`.
- **60 days**: specifications, implementation guides, and fast-moving workflows.
- **120 days**: relatively stable concepts, research background, and historical facts.

The rules:

1. Prefer official documentation, formal specifications, or first-party announcements over second-hand blogs.
2. Record the verification date (`sources_checked`) separately from the text revision date (`updated`).
3. A product entry point is a page that can be rechecked, not a current feature list or an outcome guarantee.
4. Mark pages that can no longer be verified as historical; do not keep using them as current evidence.
5. Policies, prices, and capabilities must return to formal terms, official pages, and actual acceptance.

If a product description here is out of date, please report it in the way described below.

## How to Cite This Book

When citing, include the title, author, edition, date, and URL, and note that the text is CC BY-NC 4.0:

```text
Han Xiankai. Still Here: A Field Guide to Beginning Again. Edition 1.1.0. 23 November 2026.
https://byoungd.github.io/up/en/
```

Chinese edition:

```text
韩先凯. 人生进阶指南：一个普通人的失败、恢复与重新学习. 1.1.0 版. 2026-11-23.
https://byoungd.github.io/up/
```

The repository root contains [`CITATION.cff`](https://github.com/byoungd/up/blob/main/CITATION.cff) with machine-readable citation data. The book has no DOI and no ISBN; please do not add one. When citing a specific chapter, include the chapter title and page address so a reader can return to the text.

## Reporting a Source Error

If you find that:

- a cited research finding does not match the original;
- a link is broken or points to a different page;
- a product description is out of date;
- the Chinese and English editions disagree on a fact;

use the [issue templates](https://github.com/byoungd/up/issues/new/choose) and include the page, the sentence, the source you believe is correct, and the date you checked it. For personal data, unauthorised images, or security problems, do not post publicly; use the private route in `SECURITY.md`.

Maintainers verify the source first and then change the text. Changing a date without checking the content does not count as verification.

## Bibliography

The subject list of sources is in the [Bibliography](bibliography.md). It includes only material the book actually cites and is deliberately selective. Papers and books are not distributed with the repository; readers reach them through their DOI or official link.
