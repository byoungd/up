# Changelog

All notable project-level changes are documented here. Content pages retain their own `updated` date.

## Unreleased

### 2026-09-09 learning tools and accessible publication

#### Changed

- Added 42 complete editable Markdown worksheets with bilingual download/copy controls, portable source links, and generated-file validation. Download copies are excluded from page compilation and search indexing.
- Corrected the bilingual cross-session walkthrough so its current snapshot preserves the goal, initial baseline, capacity, boundaries, and next task; made evidence access, manual saving, and the three functional acceptance conditions explicit.
- Repaired mobile focus isolation, closed-sidebar tab stops, named search dialogs and options, result announcements, and focus restoration; added axe and keyboard regressions across languages, themes, and narrow viewports.
- Removed website-only controls and invalid Vue attributes from EPUB code, preserved literal worksheet content, improved narrow-table reading, and added EPUBCheck 5.3.0 plus complete offline XHTML checks.
- Fixed PDF preformatted text clipping by wrapping at measured font widths while preserving content, whitespace, and font size; added synthetic and full-publication layout regression checks and rebuilt both publication formats.
- Recorded remaining evidence needs in `QUALITY_ROADMAP.md`, including real reader outcomes, assistive technology, device performance, and common EPUB readers.
- Added an SSR HTML page-size budget of 150,000 bytes (about 146.5 KiB) to catch route-level payload growth before it reaches the compressed Pages response; the current largest page remains below the limit.
- Updated the pinned Playwright test runtime to 1.63.0 with its Chromium 153 release and refreshed the verified test counts and maintenance evidence.

### 2026-09-09 site and maintenance audit

#### Changed

- Updated pinned `sharp` to 0.35.4 to resolve its high-severity libheif advisory.
- Aligned canonical URLs and language alternates with the sitemap; repaired legacy README/Markdown routes, query and section preservation, and same-page hash changes; excluded missing pages from indexing metadata.
- Improved dark-theme link contrast, sidebar keyboard and screen-reader controls, tablet navigation, wide-table containment, and printing from dark mode.
- Replaced regular-expression-only link checks with VitePress parsing for reference links, HTML images, and real heading anchors; added calendar-date and bilingual navigation integrity checks.
- Blocked private session assets from development requests and conventional JSON, raw, URL, CSS, HTML, and `new URL()` build references, with synthetic real-build regression fixtures.
- Made missing generated mirrors recoverable without mutating check-only runs, preserved word-list editorial dates, and reported invalid explicit PDF interpreters without a silent fallback.
- Added fast Node regression tests to the standard check; made CI smoke tests reuse the validated artifact, required browser tests before Pages upload, and completed external-link failure reporting.
- Documented environment setup, explicit browser and preview selection, and the full audit in `PROJECT_REVIEW.md`.
- Added weekly grouped Dependabot updates for npm, Actions, and Python, plus source-checked migration criteria for the next Node LTS, stable VitePress 2, and accessibility standards; dependency changes remain subject to review and publication checks.

### 2026-09-07 link-audit hardening

#### Changed

- Fixed the failure pattern behind issues 193–197 by limiting Lychee to authoritative documentation sources, excluding generated README/SUMMARY noise, and adding a regression guard for the retired ScholarSpace, invalid DOI, and dead Wayback URLs that caused the historical reports.

### 2026-09-07 recovery safety refresh

#### Changed

- Rechecked the WHO suicide-prevention and mental-health-at-work boundaries, updated the Recovery sources date, and kept the chapter's capacity modes explicitly non-clinical.

### 2026-09-03 maintenance pass

#### Changed

- Added automatic cleanup for stale external-link failure issues after a successful scheduled check, so the issue list reflects current regressions instead of old resolved alerts.
- Expanded the bilingual Relationships chapter from communication advice into a fuller account of repair, restitution, reconciliation, power asymmetry, meaningful consent, withdrawal, and safe exit; upgraded the private Relationship Conversation Card to preserve those boundaries and observable follow-through.
- Rebuilt the bilingual Decision-Making chapter and Decision Brief around information gaps versus value conflicts, decision authority, affected people, meaningful consent, disconfirming evidence, and observable evidence, cost, safety, and responsibility gates.
- Rebuilt the bilingual Recovery chapter and Recovery Reset around non-clinical capacity modes, bounded support agreements, minimum necessary disclosure, staged return-to-work load tests, next-day cost, and explicit safety, basic-life, task, boundary, and review gates, with current WHO source boundaries.
- Updated the pinned PDF parser to `pypdf` 6.16.2, clearing the known denial-of-service advisories affecting the previous 6.10.0 build dependency while retaining deterministic bilingual PDF output; PDF manifests now identify the parser version that produced their semantic digest.

### 2026-09-03 editorial and release hygiene

#### Changed

- Corrected three English editorial details in the public homepage, project disclosure, and listening method; the English Reader Field Note now stays in the English locale instead of silently crossing to the Chinese route, with regression coverage for the published route and wording.

### 2026-09-02 editorial pass

#### Changed

- Reorganised the bilingual homepage guide paths into four purpose-led groups with responsive cards, numbered section cues, accessible landmarks, and a visually distinct but explicitly non-endorsing third-party resources group.
- Expanded the bilingual AI Task Brief and AI Learning Log into a governed workflow covering evaluation sets, human gates, data retention, cost, model scope, source verification, failure rollback, handover, independent production, speed debt, and delayed transfer.
- Connected the AI work papers through the glossary and regression coverage so a model response cannot masquerade as a verified deliverable or independent learning.
- Rebuilt the bilingual Learning Principles chapter and English Diagnostic around real deliveries, first-version conditions, error diagnosis, targeted repair, feedback uptake, performance-adjusted spacing, recovery and capacity modes, cross-session state, AI boundaries, and one-condition transfer.
- Renamed the bilingual diagnostic's vocabulary entry as an evidence card and connected the general protocol through the Reader's Guide, glossary, search index, attribution register, and regression coverage.
- Rebuilt the bilingual Vocabulary chapter and Evidence Card around real-task baselines, five decisions for unknown items, eight dimensions of word knowledge, receptive/productive gaps, coverage-number limits, performance-adjusted spacing, error repair, AI verification, and fourteen-day transfer.
- Connected the vocabulary path through search indexing, Reader's Guide, AI-English, glossary, attribution, technical word-list boundaries, and regression tests so card familiarity is not treated as contextual ability.
- Added a bilingual homepage recommendation for the user-supplied `OpenHuge_ai` Telegram channel as an optional AI-resource discovery source, with explicit third-party, volatility, source, privacy, copyright, and security boundaries.
- Rebuilt the bilingual Writing chapter around a real audience, unaided draft, fact and responsibility ledger, document skeleton, translation meaning contrast, five risk-ordered revision passes, feedback uptake, AI disclosure and limits, asynchronous handover, honest authorship, and a fourteen-day transfer experiment.
- Expanded the bilingual Writing Evidence Card to preserve raw drafts, sources and permissions, translation changes, revision reasons, reader retelling, feedback decisions, automated-tool use, asynchronous acceptance, delayed transfer, and the decision to sign.
- Connected the new accountable-writing path through the home pages, Reader's Guide, Toolkit, glossary, AI-English, Job-search English, search budgets, research attribution, and regression coverage while removing duplicated legacy prose from the English chapter.
- Rebuilt the bilingual Reading chapter around real tasks, a timed first-pass baseline, six-layer barrier diagnosis, five question-specific passes, technical documentation verification, translation boundaries, intensive/extensive/narrow reading, source comparison, AI limits, real output, and a fourteen-day transfer experiment.
- Expanded the bilingual Reading Evidence Card to capture source version, first pass, barrier map, claims and evidence, technical fact checks, unknown-word decisions, source comparison, delivery, and day-fourteen transfer.
- Removed volatile book/community recommendation sections from the reading method and connected the new documentation-and-delivery path through the home pages, Reader's Guide, Toolkit, glossary, AI-English, search budgets, attribution, and regression tests.
- Rebuilt the bilingual Listening chapter around a real first-pass baseline, six-layer error diagnosis, material conditions, an adjustable caption scaffold, question-specific replays, critical-segment dictation, meaning reconstruction, supported extensive listening, accent familiarity, AI boundaries, and a fourteen-day transfer experiment.
- Replaced the old bilingual Listening Resource Audit with a Listening Evidence Card that captures main and parallel material, technical conditions, no-caption evidence, scaffold removal, generation beyond shadowing, real-task action, and day-fourteen transfer.
- Removed the long, volatile listening channel/video directory and kept product self-promotion outside the manuscript, connecting the new non-advertorial method through navigation, Reader's Guide, Toolkit, glossary, AI-English, search budgets, attribution, and regression tests.
- Rebuilt the bilingual Speaking chapter around unscripted baselines, reference variety without hierarchy, accentedness/intelligibility/comprehensibility distinctions, high-impact pronunciation, generation beyond shadowing, interaction repair, listener retelling, AI limits, and a fourteen-day transfer experiment.
- Expanded the bilingual Speaking Evidence Card to capture three baseline conditions, recording consent, device and listener familiarity, actual listener recovery, comprehension effort, unfamiliar follow-ups, repair, recognition errors, and day-fourteen transfer.
- Connected the new speaking method through the home pages, Reader's Guide, Toolkit Overview, glossary, Listening, AI-English, Job-search English, search-budget rules, research attribution, and regression coverage.
- Added a bilingual Grammar chapter that starts from real-task baselines and form–meaning choices, prioritises errors by communicative impact, reconnects explicit explanation to output, and tests one structure through a fourteen-day delayed-transfer cycle.
- Added a bilingual Grammar Evidence Card and connected it through Part I, the home pages, Reader's Guide, Toolkit Overview, glossary, search index, and continuous book navigation.
- Made the existing bilingual biezou.com home-page entry an explicit third-party AI relay recommendation, while retaining current-site verification, privacy, pricing, terms, and availability boundaries.
- Added a bilingual Job-search English chapter that turns one real global or remote role into recruiter, project, technical, behavioural, asynchronous-writing, and interaction-repair tasks, with an unscripted baseline, story bank, AI integrity boundaries, fourteen-day sprint, role gates, and post-interview close.
- Added a bilingual private Job-search English Evidence Card for role mapping, unfamiliar follow-ups, asynchronous handover, repair, delayed retesting, transfer, confidentiality, recording, and permitted AI use.
- Connected CEFR, speaking, writing, AI-English, the Reader's Guide, homepage, Toolkit, glossary, and Part I reading arc to role-specific evidence rather than presenting one CEFR level as a universal hiring threshold.
- Added a bilingual Family Learning chapter for roughly middle-school-age learners, guardians, and teachers, with learner agency, role boundaries, a seven-day artifact path, a synthetic English example, five AI safety gates, capacity modes, feedback boundaries, pause conditions, and a fourteen-day decision.
- Added a bilingual private Family Learning Agreement that makes learner and guardian write separately, protects school and children's data, limits monitoring and substituted work, and reviews both learner evidence and adult support after fourteen days.
- Added a home-page and Reader's Guide route for families, integrated the optional branch between First Week Practice and Daily System, and documented UNESCO's human-centred educational AI guidance without substituting it for local school or platform rules.
- Added a bilingual private-first Reader Field Note with immediate action, three-to-seven-day retest, one-condition transfer, editorial feedback, evidence boundaries, and an explicit privacy gate before optional public sharing.
- Added a bilingual synthetic toolkit walkthrough that answers reader feedback about unclear tool use and cross-session AI state, showing a 90-day Python example from versioned Learning State through task briefing, unaided baseline, evidence, delayed retest, weekly handover, interruption recovery, and a new conversation.
- Routed the homepage, Reader's Guide, Toolkit Overview, glossary, and book case study through the private worksheet before the public GitHub issue form, and indexed the two long new pages by descriptive headings to preserve the search budget.
- Added a bilingual end-to-end case study that makes the book itself face its methods, covering baseline preservation, editorial architecture, AI responsibility, artifact chains, failed checks, release gates, reader evidence, unknowns, transfer, and project handover.
- Added a privacy-aware reader field-note issue form and bilingual homepage entry so concrete attempts, delayed results, confusion, and unsuccessful transfer can inform future editions.
- Removed fixed publication chapter counts from PDF generation and browser regression; EPUB, PDF, and tests now derive manuscript size from the shared navigation publication rules.
- Added a pinned, reproducible Noto Serif SC subsetting utility driven by the current Chinese EPUB, with upstream SHA documentation and spacing-glyph coverage checks.
- Made PDF title-page dates follow the EPUB publication metadata and moved running-header rendering to page end so chapter-opening headers no longer lag behind by one chapter.
- Made future-date validation use the project's `Asia/Shanghai` calendar date and kept the client search budget intact by indexing navigation-heavy long chapters through descriptive headings.

### 2026-09-01 editorial pass

#### Changed

- Reworked the bilingual Entrepreneurship chapter away from stacked “not X but Y” declarations and toward scenes, physical consequences, concrete business questions, and more varied narrative rhythm.
- Gave My Story, Narrative and Evidence, Entrepreneurship, and Learning Anything with AI distinct bilingual final movements, moving update logs, related reading, and source disclosures before the chapter's actual ending.
- Rewrote the final movement of all eight Part I chapters in both languages so CEFR, learning methods, vocabulary, listening, reading, speaking, writing, and AI now end with a distinct literary closing rather than a rubric, source list, or training schedule.
- Removed hand-written previous/next paragraphs from 26 bilingual book-page pairs so literary conclusions remain the true ending of each chapter, while one authoritative footer owns continuous reading across every part boundary.
- Expanded Part V with a full bilingual chapter on closing a 90-day cycle, transferring ability, choosing continuation or closure, protecting life foundations, and planning by seasons; integrated the chapter into the book's navigation and continuous reading arc.
- Made the Reader's Guide, Prologue, Part I introduction, and Afterword use one authoritative bilingual pager, keeping reference tools out of the continuous book arc and removing conflicting hand-written navigation.
- Replaced dynamic repository badges and the externally fetched GitHub icon with quiet bilingual book metadata links, removing all third-party image requests from both home pages.
- Added build-time intrinsic dimensions to local raster Markdown images so deferred media reserves its final aspect ratio before download and avoids layout shifts.
- Added deferred asynchronous loading to every Markdown image, converted the remaining oversized story and project media to WebP, and introduced a 230KB source-raster budget.
- Re-encoded and right-sized the two home-page update photos as deferred WebP assets, reducing their combined weight by more than 80% while adding intrinsic dimensions and low-priority asynchronous loading.
- Reduced the lazy bilingual search indexes by excluding repeated code blocks and merging H3 plus task-specific collections into useful parent results; added raw and gzip build budgets so the oversized-chunk warning cannot silently return.
- Added reciprocal `zh-CN`, `en-US`, and `x-default` language alternates to all 68 bilingual page pairs, mirrored them in the sitemap, and declared the dedicated navbar mark as the site icon.
- Replaced the obsolete English-guide sharing artwork with bilingual Life Level-up Guide covers, a dedicated navbar mark, generated 1200×630 PNG social images, and Book/Chapter JSON-LD metadata.
- Localised VitePress's hard-coded navigation, sidebar, pager, section-toggle, mobile-menu, and heading-permalink labels so Chinese screen readers no longer switch unexpectedly into English.
- Localised the Chinese search dialog, edit and accessibility labels, appearance controls, and missing-page copy; shortened both navbar titles to the book name so the English title cannot overlap search.
- Added a privacy-preserving reading-progress indicator, steadier long-form typography, and a clean print layout across both language editions, with desktop and mobile regression coverage.
- Reworked the bilingual resource-layer chapter ending so disclosure and verification lead back into the book's daily-practice arc instead of leaving readers at the project boundary.
- Added five bilingual part introductions that bridge the book's major transitions, define each part's questions and reading path, and state the evidence or decisions readers should carry forward.
- Reordered the bilingual sidebar and generated summaries to follow the book's five-part arc, separating life review from daily practice and moving the action plan and afterword into their proper closing sections.
- Moved the English My Story chapter from Part IV into Part II so bilingual source paths and public routes align, removed the content-check exception, and preserved the former URL with a canonical noindex redirect.
- Rebuilt the bilingual Week 1 lesson as a full “Finish the First Week” practice chapter, connecting baseline evidence, capacity-aware action, delayed retesting, transfer, weekly review, and the transition into daily systems.
- Rebuilt the bilingual miscellaneous chapter as “Echoes,” a coherent literary bridge from narrative review to recovery that separates injury, responsibility, luck, tools, and the next choice; reordered Part II and repaired its handover links.
- Connected the bilingual 90-Day Cycle Map and action chapter to Evidence Chain, Rhythm Ledger, and Learning State, clarifying which record owns each part of a long-term review.
- Clarified the bilingual Weekly Review handover protocol so Evidence Chain, Rhythm Ledger, Learning State, and 90-Day Cycle records each keep a distinct job without duplicated notes.
- Replaced the stale homepage-wide product verification date with per-entry verification guidance, keeping the biezou reference date aligned with its attribution record.
- Added a bounded bilingual homepage reference to biezou.com as an external AI relay service, with attribution, terms/privacy caveats, and browser coverage for the outbound link.
- Connected the shared Evidence Chain template to all eight bilingual foundation and AI-English chapters, so every skill path can continue from practice to delayed retention and transfer.
- Updated the bilingual Prologue contract to route readers through the current Toolkit Overview, Evidence Chain, and Rhythm Ledger before the 90-day cycle, with browser coverage for the handoffs.
- Reworked the bilingual Afterword into a fuller literary close that echoes the opening question, names the real weight of failure, and returns readers to evidence, rhythm, and practical next steps.
- Expanded the bilingual Reader's Guide with a four-stage reading arc and explicit outputs, connecting input, real-life practice, evidence, rhythm, and the 90-day cycle.
- Added return-visit routes to the bilingual Reader's Guide for the Toolkit Overview, Evidence Chain, and Rhythm Ledger, with browser coverage for choosing and resuming the right worksheet.
- Added a bilingual Evidence Chain template for baseline, immediate performance, delayed retention, transfer, evidence boundaries, and next-step decisions; linked it from the glossary, toolkit, and Evidence chapter.
- Corrected twelve bilingual pages that carried a future `updated` date and added a guard preventing publication metadata from moving ahead of the current day.
- Added a bilingual Toolkit Overview that routes readers to one appropriate worksheet by problem, connects the templates into a complete loop, and documents evidence and privacy boundaries.
- Added a standalone bilingual Rhythm Ledger template, linked it from the chapter and glossary, and protected the copy-ready handoff with browser coverage.
- Added Rhythm, Variation, Compounding, Minimum Contract, and Rhythm Ledger to the bilingual glossary, with browser coverage for the new chapter's handoffs.
- Added the bilingual Rhythm chapter as a bridge between the daily system and the 90-day plan, covering repetition, feedback, interruption recovery, and sustainable compounding.
- Switched the Hu & Nation citation from the intermittently timing-out Wellington repository page to its verified Crossref metadata record, keeping the source link stable for scheduled audits without implying full-text redistribution.
- Switched the Hu & Nation citation from the slow ScholarSpace resolver to the verified Wellington Open Access record after the scheduled runner exposed repeated repository timeouts.
- Marked two dead Wayback snapshots as unavailable and removed their 404 links while preserving the local historical text and attribution boundary.
- Replaced the slow Hu & Nation DOI resolver with its verified ScholarSpace record so the vocabulary citation remains open and the scheduled link audit avoids a false timeout.
- Limited the dedicated catalog probes to source Markdown under `docs/threads` so generated VitePress HTML cannot append quotes or tags to URLs and create false 404 reports.
- Tuned the scheduled link audit for VitePress clean URLs and anti-bot catalog/project sites: local links are excluded from Lychee, critical Douban and project entry points use dedicated curl probes, and 404/5xx failures remain strict.
- Enabled cancellation of superseded Pages deployments so a rapid sequence of commits cannot let an older build publish after a newer one.
- Added a `build-revision` meta marker to every VitePress page and made Pages health checks verify that public content belongs to the current commit, with local and CI regression coverage.
- Restored the bilingual reading handoff from Evidence to AI Development and Resource-layer Business before the 90-Day Action Plan, with browser coverage for both links.
- Replaced mixed-language `Source (中文)` labels across the English reading, listening, speaking, writing, and archive pages, synchronized their edition dates, and added a stale-text guard.
- Upgraded the official GitHub Actions used by CI, Pages, artifact upload, issue reporting, and scheduled link checks to their current Node.js 24-compatible major releases.
- Synchronized the Prologue edition dates after the English copy-edit pass so both language editions report the same manuscript version.
- Localised residual Chinese prose in the English Prologue and Reading chapter while retaining original WeChat account names as explicitly marked proper names.
- Strengthened the Pages health check from “any title” to path-specific expected titles for both locales and the Evidence chapter.
- Aligned the Pages health-check article URLs with VitePress clean URLs after the first online probe correctly exposed a trailing-slash 404.
- Fixed the Pages health check's `pipefail` false negative by using a here-string for title validation after successful HTTP responses.
- Added post-deployment HTTP checks for the bilingual home pages and Evidence chapter, and documented the required GitHub Actions Pages source so a successful build cannot silently publish a 404 site.
- Completed the Part III chapter-end handoff by connecting the resource-layer business chapter from Evidence to Author Projects and Practice, so the methods-to-reality path no longer stops at the final technical chapter.
- Closed the evidence handoff across CEFR self-checks, narrative review, AI learning, attention, and artifact delivery; chapter-end links now follow the reading path from assisted practice to delayed retest and transfer.
- Corrected two vocabulary-research DOI citations after Crossref verification, updated the attribution register, and added stale guards for the superseded identifiers.
- Added stale-string guards for the removed Zhihu URLs and documented the rule that access-restricted or one-time-signed pages cannot serve as primary evidence.
- Removed three unstable Zhihu direct links returning access-restricted responses; retained the relevant personal context in the manuscript and routed readers to stable local chapters instead.
- Added the bilingual Evidence chapter as the methodological bridge from AI-assisted learning and artifacts to delayed retention, transfer, human gates, and honest life evidence.
- Reordered the bilingual book navigation so the Reader's Guide and Prologue form the first continuous reading path before templates and topical chapters, with a regression test protecting that editorial order.
- Synchronized the bilingual home-page edition dates with the 2026-09-01 reader-guide pass, extended `updated` parity checks to both home pages, and added a smoke test for the new reading entry point.
- Added the bilingual Reader's Guide as an operational preface, separating the prologue's literary contract from practical entry routes, evidence traces, and interruption recovery.
- Added reverse navigation coverage for the Reader's Guide and a content gate requiring matching `updated` dates across Chinese and English counterparts.
- Added Daily System terms to the bilingual glossary and aligned a listening resource introduction with the guide's task-first recommendation policy.
- Reworked legacy listening recommendations so resource fit, personal preference, and learning effect are stated as separate, testable claims.
- Added matching bilingual overviews to the CEFR and Vocabulary foundation pages so readers can see the baseline-to-retest path before entering the detail.
- Connected all ten technical word lists to the bilingual Vocabulary chapter and home reading path with task-fit, version, source, and delayed-transfer boundaries.
- Localised the English VitePress reading chrome, footer, update labels, and author metadata, with desktop/mobile regression coverage.
- Hardened navigation checks to validate bilingual entry fields, duplicate links, and source-file existence before generating summaries.
- Rechecked the resource-layer chapter's official and external links on 2026-09-01, refreshed its product-positioning language, and separated homepage facts from contract and acceptance claims.
- Removed the unused `黑人问号.jpg` asset after removing its legacy reference, so the public asset directory no longer carries that outdated stereotype.
- Added a private-session asset guard across `.gitignore`, VitePress, maintenance guidance, and Playwright so local credentials cannot be published accidentally.
- Replaced a generic English image alt with a contextual description and taught content checks to reject common placeholder alt text.
- Corrected the CEFR attribution entry and added a check that explicit local paths in `ATTRIBUTIONS.md` still exist.
- Removed 21 unreferenced legacy illustrations and screenshots, refreshed the current asset register, and added orphan-asset detection to content checks.
- Added runtime image-load coverage for representative Chinese and English pages, checking descriptive alt text, completion, and non-zero natural dimensions.
- Translated the remaining English-page image alt text and added a check for Chinese characters in English image descriptions.
- Added the bilingual Narrative and Evidence chapter to connect personal stories, hindsight, responsibility, and transferable principles to the existing case-review and writing tools.
- Made route smoke coverage derive directly from navigation sources and real H1 headings, removing duplicated manual route lists and reducing future coverage drift.
- Aligned the remaining bilingual subsection structures and enabled heading-shape parity checks that ignore fenced examples.
- Clarified stale AI source-date wording as “last checked” and “verify before use” without claiming a new external verification.
- Aligned the three AI product attribution dates with the existing 2026-08-24 chapter source records.
- Added a tracked-system-file guard that rejects `.DS_Store`, `Thumbs.db`, and `desktop.ini` without touching local ignored files.
- Replaced the unstable Douban cover hotlink with a text-only reference-book link and updated the attribution register.
- Standardised the remaining English personal-story pen-name variant as “Li Pu” and added a stale-string guard.
- Added reverse navigation coverage checks so every public Markdown page must be discoverable from the bilingual navigation source.
- Linked the Narrative and Evidence chapter back from My Story and Decision-Making so reflection can return to a concrete choice.

### 2026-08-31 manuscript pass

#### Added

- Added reproducible, print-ready Chinese and English PDF 1.7 editions with embedded OFL font subsets, portrait covers, running headers, page numbers, bookmarks, page-numbered contents, offline images, exact published-file hashes, cross-platform semantic fingerprints, and homepage download links.
- Added deterministic Chinese and English EPUB 3.3 editions containing the main manuscript, glossary, and complete toolkit, with offline images, internal navigation, 1600×2560 portrait covers, integrity metadata, and homepage download links.
- Added the bilingual Recovery, Decision-Making, Relationships, and Attention chapters.
- Added the bilingual Life Practice Toolkit with reusable worksheets for decisions, attention, relationships, and recovery.
- Added the bilingual Listening Resource Audit card for choosing, testing, and retiring volatile listening materials.
- Added the bilingual Reading Evidence Card for source checks, claim maps, inference boundaries, and delayed transfer.
- Added the bilingual Speaking Evidence Card for recordings, listener feedback, interaction repair, and safe transfer.
- Added the bilingual Writing Evidence Card for drafts, layered revision, AI disclosure, reader feedback, and delivery.
- Added the bilingual 90-Day Cycle Map to connect skill evidence, weekly questions, phase gates, recovery, and final delivery.
- Added the bilingual Glossary of Terms and Methods to make the book's evidence vocabulary and chapter paths easier to navigate.
- Extended the README mirror rule to include the new `reference/` section in repository links.
- Strengthened the AI learning chapter with unaided/assisted/delayed comparisons, failure handover checks, and an explicit “speed debt” warning.
- Clarified the project-disclosure page with status labels, item-level dates, and a reader verification order.
- Expanded the AI Project Scorecard and resource-layer chapter with independent-performance evidence, test conditions, ownership, and release gates.
- Connected the English-with-AI entry page to all four skill evidence cards, delayed retesting, and the 90-day cycle.
- Added a confidence-and-reversibility check to the decision chapter so uncertainty changes action size rather than producing false precision.
- Updated the AI Learning Log Template to capture three comparison conditions, confidence, rework, and handover ownership.
- Connected attention, recovery, and relationship chapters directly to their corresponding Life Practice Toolkit sheets and the 90-Day Cycle Map.
- Added the bilingual Artifact Brief and Delivery Card so learning outputs can be scoped, reviewed, handed over, and rolled back.
- Upgraded the bilingual English Diagnostic Template with condition tracking, raw/delayed samples, evidence-card links, and a 90-day next-variable handoff.
- Upgraded the bilingual Weekly Review Template into a weekly evidence dashboard with constraints, error causes, recovery, and state handoff.
- Upgraded the bilingual Learning State Template into a versioned cross-session source of truth with evidence inventory, boundaries, handover, and review dates.

#### Changed

- Made `人生进阶指南` / `Life Level-up Guide` the primary book identity while retaining the lifelong-learning subtitle.
- Refined the personal story in both languages for accuracy, privacy, health boundaries, and a calmer literary voice.
- Reframed the listening resource catalogue around task fit, evidence, access, copyright, and a seven-day review cycle.
- Reframed reading resources around task fit, source versions, evidence boundaries, and parallel-text transfer.
- Reframed speaking practice around intelligibility, repair strategies, listener evidence, and safer real-world interaction.
- Reframed writing practice around task fit, four revision passes, source checks, and auditable delivery.
- Connected the 90-day action chapter to one cross-skill evidence chain and explicit phase gates.
- Added chapter-release gates and external-link/date guidance to the maintenance guide and pull-request template.
- Excluded Playwright-generated reports from Markdown lint so failure diagnostics cannot be mistaken for book content.
- Reworked the Week 1 sleep-and-stress lesson as an evidence-bounded language exercise, removing unsupported medical claims and adding safer source boundaries.
- Refined the entrepreneurship chapter with explicit evidence levels, personal-estimate disclosure, five reality gates, and links to the decision and project scorecards.
- Clarified the book's reading arc in the prologue, homepage map, and afterword so readers can move from a real problem to evidence cards, a 90-day cycle, and recovery when plans break.
- Reworked the historical miscellaneous notes to shorten an external quotation, remove a stereotyped image, reduce graphic school-violence detail, and label training and personal outcomes as non-general evidence.
- Refined the personal story with a narrative-boundary note, less third-party mind-reading, safer content guidance, and a more conditional statement about AI in real life.
- Added book-structure navigation and browser smoke coverage for the new pages.
- Added page-level historical, privacy, health, and safety notes to all four archived posts and their English translations, with browser coverage for each route.
- Added the bilingual Daily System chapter to bridge the book's methods and templates with minimum viable days, capacity budgets, boundaries, interruption recovery, and a seven-day practice.
- Rechecked the official `token.love` and `ku0.com` homepages, clarified current capability wording and contract boundaries, and aligned project-page attribution dates.
- Connected the AI Case Review Template to the AI chapters, project disclosure pages, and bilingual glossary so public narratives have a visible evidence path.
- Repaired the main reading arc so Miscellaneous Notes lead to Week 1, Daily System, and the 90-Day Plan, while the Afterword returns readers to the beginning.
- Standardised the English pen-name spelling as “Li Pu” across the homepage and prologue.

### Added

- VitePress static site with bilingual navigation, local search, page metadata, sitemap, and legacy hash-route migration.
- Learning-state, weekly-review, and English-diagnostic templates.
- CEFR can-do goals and 7-day, 30-day, and 12-week plans.
- Full English counterparts for entrepreneurship, archives, and word lists.
- Dual licensing, attribution register, contribution, conduct, security, and support policies.
- CI checks, scheduled link validation, image-metadata checks, and Playwright smoke tests.

### Changed

- Replaced learning-pyramid percentages, learning-style matching, fixed vocabulary-coverage claims, and fixed review intervals with evidence-aware guidance.
- Reframed AI chapters around tasks and portable state instead of a preferred provider.
- Moved affiliated products to a disclosure page and removed unnecessary public contact details.

### Removed

- Docsify runtime and unpinned CDN dependencies.
- Public references to unverified third-party and child photographs, private messages, medical records, and QR-code contact images.
