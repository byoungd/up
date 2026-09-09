import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  bilingualRoutePairs,
  enNavigation,
  publicationChapterCount,
  toSidebar,
  zhNavigation,
} from "../docs/.vitepress/navigation.mjs";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const headingFromSource = (source) => {
  const file = resolve(process.cwd(), "docs", source);
  const heading = readFileSync(file, "utf8").match(/^# (.+)$/m)?.[1];
  if (!heading) throw new Error(`导航 source 缺少一级标题: ${source}`);
  return heading;
};

const structuredDataFromPage = async (page) =>
  JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());

const routesFromNavigation = (groups) =>
  groups.flatMap(({ items }) =>
    items.map(({ link, source }) => [link === "/" ? "./" : `.${link}`, headingFromSource(source)]),
  );

const routes = [...routesFromNavigation(zhNavigation), ...routesFromNavigation(enNavigation)];
const expectedBuildRevision = process.env.GITHUB_SHA || process.env.BUILD_REVISION || "local";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

test("start here leads from the home page into the reader guide and prologue", () => {
  const zhStart = zhNavigation.find(({ text }) => text === "开始");
  const enStart = enNavigation.find(({ text }) => text === "Start Here");
  expect(zhStart?.items.slice(0, 3).map(({ source }) => source)).toEqual([
    "README.md",
    "threads/part-0/reader-guide.md",
    "threads/part-0/prologue.md",
  ]);
  expect(enStart?.items.slice(0, 3).map(({ source }) => source)).toEqual([
    "en/README.md",
    "en/threads/part-0/reader-guide.md",
    "en/threads/part-0/prologue.md",
  ]);
});

test("navigation follows the five-part book arc", () => {
  expect(zhNavigation.slice(1, 7).map(({ text }) => text)).toEqual([
    "第一部：打开输入",
    "第二部：把自己放回生活",
    "第三部：借工具放大能力",
    "第四部：实践与恢复",
    "第五部：行动与长期改变",
    "后记",
  ]);
  expect(enNavigation.slice(1, 7).map(({ text }) => text)).toEqual([
    "Part I: Open Input",
    "Part II: Return to Life",
    "Part III: Amplify Ability",
    "Part IV: Practice and Recovery",
    "Part V: Long-Term Action",
    "Afterword",
  ]);
});

test("every part opens with a bilingual introduction", () => {
  expect(zhNavigation.slice(1, 6).map(({ items }) => items[0].source)).toEqual([
    "threads/part-1/open-input.md",
    "threads/part-2/return-to-life.md",
    "threads/part-3/amplify-ability.md",
    "threads/part-4/practice-and-recovery.md",
    "threads/part-5/long-term-action.md",
  ]);
  expect(enNavigation.slice(1, 6).map(({ items }) => items[0].source)).toEqual([
    "en/threads/part-1/open-input.md",
    "en/threads/part-2/return-to-life.md",
    "en/threads/part-3/amplify-ability.md",
    "en/threads/part-4/practice-and-recovery.md",
    "en/threads/part-5/long-term-action.md",
  ]);
});

test("every public navigation route has one bilingual counterpart", () => {
  const zhRoutes = zhNavigation.flatMap(({ items }) => items.map(({ link }) => link.replace(/^\/+|\/+$/g, "")));
  const enRoutes = enNavigation.flatMap(({ items }) => items.map(({ link }) => link.replace(/^\/+|\/+$/g, "")));
  expect(bilingualRoutePairs).toHaveLength(zhRoutes.length);
  expect(bilingualRoutePairs.map(({ zh }) => zh)).toEqual(zhRoutes);
  expect(bilingualRoutePairs.map(({ en }) => en).sort()).toEqual(enRoutes.sort());
});

test("reference collections follow the book and stay collapsed by default", () => {
  expect(zhNavigation.slice(7).map(({ text }) => text)).toEqual(["工具箱", "旧文归档", "词表"]);
  expect(enNavigation.slice(7).map(({ text }) => text)).toEqual(["Toolkit", "Archive", "Word Lists"]);
  expect(toSidebar(zhNavigation).slice(0, 7).every(({ collapsed }) => collapsed === false)).toBe(true);
  expect(toSidebar(zhNavigation).slice(7).every(({ collapsed }) => collapsed === true)).toBe(true);
  expect(toSidebar(enNavigation).slice(0, 7).every(({ collapsed }) => collapsed === false)).toBe(true);
  expect(toSidebar(enNavigation).slice(7).every(({ collapsed }) => collapsed === true)).toBe(true);
});

test("the toolkit begins with a worked example and private reader evidence", () => {
  const zhToolkit = zhNavigation.find(({ text }) => text === "工具箱");
  const enToolkit = enNavigation.find(({ text }) => text === "Toolkit");
  expect(zhToolkit?.items.slice(0, 5).map(({ source }) => source)).toEqual([
    "templates/toolkit-walkthrough.md",
    "templates/evidence-chain.md",
    "templates/reader-field-note.md",
    "templates/family-learning-agreement.md",
    "templates/learning-state.md",
  ]);
  expect(enToolkit?.items.slice(0, 5).map(({ source }) => source)).toEqual([
    "en/templates/toolkit-walkthrough.md",
    "en/templates/evidence-chain.md",
    "en/templates/reader-field-note.md",
    "en/templates/family-learning-agreement.md",
    "en/templates/learning-state.md",
  ]);
});

test("Part I places grammar between vocabulary and listening", () => {
  const zhPart = zhNavigation.find(({ text }) => text === "第一部：打开输入");
  const enPart = enNavigation.find(({ text }) => text === "Part I: Open Input");
  expect(zhPart?.items.slice(3, 6).map(({ source }) => source)).toEqual([
    "threads/part-1/2-vocabulary.md",
    "threads/part-1/grammar.md",
    "threads/part-1/3-listening.md",
  ]);
  expect(enPart?.items.slice(3, 6).map(({ source }) => source)).toEqual([
    "en/threads/part-1/2-vocabulary.md",
    "en/threads/part-1/grammar.md",
    "en/threads/part-1/3-listening.md",
  ]);
});

test("life-review chapters move from story through echoes into recovery", () => {
  const zhPractice = zhNavigation.find(({ text }) => text === "第二部：把自己放回生活");
  const enPractice = enNavigation.find(({ text }) => text === "Part II: Return to Life");
  expect(zhPractice?.items.slice(1, 5).map(({ source }) => source)).toEqual([
    "threads/part-2/my-story.md",
    "threads/part-2/narrative-and-evidence.md",
    "threads/part-2/x-misc.md",
    "threads/part-2/recovery.md",
  ]);
  expect(enPractice?.items.slice(1, 5).map(({ source }) => source)).toEqual([
    "en/threads/part-2/my-story.md",
    "en/threads/part-2/narrative-and-evidence.md",
    "en/threads/part-2/x-misc.md",
    "en/threads/part-2/recovery.md",
  ]);
});

test("practice chapters move from the first week through family learning into systems and rhythm", () => {
  const zhPractice = zhNavigation.find(({ text }) => text === "第四部：实践与恢复");
  const enPractice = enNavigation.find(({ text }) => text === "Part IV: Practice and Recovery");
  expect(zhPractice?.items.slice(-4).map(({ source }) => source)).toEqual([
    "threads/part-4/week-1.md",
    "threads/part-4/family-learning.md",
    "threads/part-4/daily-system.md",
    "threads/part-4/rhythm-and-compounding.md",
  ]);
  expect(enPractice?.items.slice(-4).map(({ source }) => source)).toEqual([
    "en/threads/part-4/week-1.md",
    "en/threads/part-4/family-learning.md",
    "en/threads/part-4/daily-system.md",
    "en/threads/part-4/rhythm-and-compounding.md",
  ]);
});

test("long-term action moves from a 90-day cycle through a real case into handover", () => {
  const zhAction = zhNavigation.find(({ text }) => text === "第五部：行动与长期改变");
  const enAction = enNavigation.find(({ text }) => text === "Part V: Long-Term Action");
  expect(zhAction?.items.map(({ source }) => source)).toEqual([
    "threads/part-5/long-term-action.md",
    "threads/part-5/90-day-plan.md",
    "threads/part-5/book-as-proof.md",
    "threads/part-5/after-90-days.md",
  ]);
  expect(enAction?.items.map(({ source }) => source)).toEqual([
    "en/threads/part-5/long-term-action.md",
    "en/threads/part-5/90-day-plan.md",
    "en/threads/part-5/book-as-proof.md",
    "en/threads/part-5/after-90-days.md",
  ]);
});

test("reader field notes ask for action, delayed evidence, revision, and privacy", () => {
  const template = readFileSync(
    resolve(process.cwd(), ".github/ISSUE_TEMPLATE/reader-field-note.yml"),
    "utf8",
  );
  for (const field of ["problem", "action", "delayed_result", "revision", "privacy"]) {
    expect(template).toContain(`id: ${field}`);
  }
  expect(template).toContain("A small or unsuccessful attempt is useful evidence.");
  expect(template).toContain("no private customer data");
  expect(template).toContain("separated what I observed from what I infer or hope");
});

test("main book chapters leave continuous reading to the authoritative pager", () => {
  const manualPager = /^(?:(?:上一篇|下一篇|下一部|返回首页)[：:]|(?:Prev|Previous|Next|Next Part|Back to the home page):)/m;
  const sources = [...zhNavigation.slice(1, 7), ...enNavigation.slice(1, 7)]
    .flatMap(({ items }) => items.map(({ source }) => source))
    .filter((source) => /(?:^|\/)threads\/part-[0-6]\//.test(source) || /^(?:en\/)?projects\.md$/.test(source));

  for (const source of sources) {
    const text = readFileSync(resolve(process.cwd(), "docs", source), "utf8");
    expect(text, source).not.toMatch(manualPager);
  }
});

test("Part I core chapters end with a bilingual literary closing", () => {
  const zhPart = zhNavigation.find(({ text }) => text === "第一部：打开输入");
  const enPart = enNavigation.find(({ text }) => text === "Part I: Open Input");
  const cases = [
    ...(zhPart?.items.slice(1).map(({ source }) => ({ source, ending: /^结语[：:]/ })) || []),
    ...(enPart?.items.slice(1).map(({ source }) => ({ source, ending: /^Closing(?:[:：]|$)/ })) || []),
  ];

  expect(cases).toHaveLength(
    (zhPart?.items.slice(1).length || 0) + (enPart?.items.slice(1).length || 0),
  );
  for (const { source, ending } of cases) {
    const text = readFileSync(resolve(process.cwd(), "docs", source), "utf8");
    const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    expect(headings.at(-1), source).toMatch(ending);
  }
});

test("key story, narrative, entrepreneurship, and AI chapters end on their literary movement", () => {
  const cases = [
    ["threads/part-2/my-story.md", "结语：重来不是凯旋"],
    ["en/threads/part-2/my-story.md", "Closing: Starting Again Is Not a Triumph"],
    ["threads/part-2/narrative-and-evidence.md", "结语：让故事回到生活"],
    ["en/threads/part-2/narrative-and-evidence.md", "Closing: Let the Story Return to Life"],
    ["threads/part-2/entrepreneurship.md", "结语：让野心经过现实"],
    ["en/threads/part-2/entrepreneurship.md", "Closing: Let Ambition Pass Through Reality"],
    ["threads/part-3/1-ai-learning.md", "结语：把能力留在人身上"],
    ["en/threads/part-3/1-ai-learning.md", "Closing: Keep the Ability with the Person"],
    ["threads/part-4/family-learning.md", "结语：不要替孩子走完那条路"],
    ["en/threads/part-4/family-learning.md", "Closing: Do Not Walk the Road in the Learner's Place"],
    ["threads/part-5/book-as-proof.md", "结语：作品也要接受自己的审判"],
    ["en/threads/part-5/book-as-proof.md", "Closing: Let the Work Face Its Own Judgment"],
  ];

  for (const [source, ending] of cases) {
    const text = readFileSync(resolve(process.cwd(), "docs", source), "utf8");
    const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    expect(headings.at(-1), source).toBe(ending);
  }
});

test("grammar turns rules into meaning decisions and delayed evidence", () => {
  const cases = [
    {
      chapter: "threads/part-1/grammar.md",
      card: "templates/grammar-evidence.md",
      chapterTerms: ["语法不是把句子变复杂", "明确讲解之后，必须重新使用", "十四天语法实验"],
      cardTerms: ["意思改变", "第 3–7 天", "它是否区分错误、歧义、语域和风格"],
    },
    {
      chapter: "en/threads/part-1/grammar.md",
      card: "en/templates/grammar-evidence.md",
      chapterTerms: ["Grammar Is Not Sentence Decoration", "Explicit Explanation Must Return to Use", "A Fourteen-Day Grammar Experiment"],
      cardTerms: ["meaning-changing", "Days 3–7", "Did it separate error, ambiguity, register, and style"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.1111%2F0023-8333.00136");
    expect(chapterText).toContain("grammar-evidence.md");
    expect(cardText).toContain("part-1/grammar.md");
  }
});

test("speaking prioritises intelligibility, variation, repair, and transfer", () => {
  const cases = [
    {
      chapter: "threads/part-1/5-speaking.md",
      card: "templates/speaking-evidence.md",
      chapterTerms: ["选择参考变体，不制造高低等级", "把口音、可理解度与理解难度分开", "跟读不是终点", "十四天口语实验"],
      cardTerms: ["设备 / 麦克风", "保存听众实际听见的内容", "语音识别分数", "第 14 天"],
    },
    {
      chapter: "en/threads/part-1/5-speaking.md",
      card: "en/templates/speaking-evidence.md",
      chapterTerms: ["Choose a Reference Variety without Creating a Hierarchy", "Separate Accentedness, Intelligibility, and Comprehensibility", "Shadowing Is Not the Destination", "A Fourteen-Day Speaking Experiment"],
      cardTerms: ["Device / microphone", "Preserve What the Listener Actually Heard", "Recognition scores", "Day 14"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.2307%2F3588486");
    expect(chapterText).toContain("speaking-evidence.md");
    expect(cardText).toContain("part-1/5-speaking.md");
    expect(chapterText).not.toContain("cop /ɑ/");
  }
});

test("listening turns repeated playback into diagnosis, reconstruction, and transfer", () => {
  const cases = [
    {
      chapter: "threads/part-1/3-listening.md",
      card: "templates/listening-audit.md",
      chapterTerms: ["保存一次真实首听", "不把所有失败都叫“听不懂”", "字幕是一架可以撤走的梯子", "十四天听力实验"],
      cardTerms: ["保存无字幕首听", "建立六层错误地图", "使用支架阶梯", "意义重构"],
    },
    {
      chapter: "en/threads/part-1/3-listening.md",
      card: "en/templates/listening-audit.md",
      chapterTerms: ["Preserve a Real First Pass", "Do Not Call Every Failure \"I Did Not Understand\"", "Captions Are a Ladder That Can Be Removed", "A Fourteen-Day Listening Experiment"],
      cardTerms: ["Preserve a No-Caption First Pass", "Build the Six-Layer Error Map", "Use the Scaffold Ladder", "meaning reconstruction"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.1111%2Fj.1467-9922.2009.00559.x");
    expect(chapterText).toContain("listening-audit.md");
    expect(cardText).toContain("part-1/3-listening.md");
    expect((chapterText.match(/https?:\/\//g) || []).length, chapter).toBeLessThanOrEqual(4);
    expect(chapterText).not.toContain("Echo Loop");
  }
});

test("reading turns word-by-word translation into verification and delivery", () => {
  const cases = [
    {
      chapter: "threads/part-1/4-reading.md",
      card: "templates/reading-evidence.md",
      chapterTerms: ["保存一次未经修饰的首读", "把“读不懂”拆成六层", "技术文档：把页面读成可验证的事实", "十四天阅读实验"],
      cardTerms: ["保存未经修饰的首读", "建立六层障碍地图", "技术文档事实卡", "多来源比较与真实输出"],
    },
    {
      chapter: "en/threads/part-1/4-reading.md",
      card: "en/templates/reading-evidence.md",
      chapterTerms: ["Preserve an Unpolished First Pass", "Split \"I Cannot Understand It\" into Six Layers", "Technical Documentation: Turn Pages into Verifiable Facts", "A Fourteen-Day Reading Experiment"],
      cardTerms: ["Preserve an Unpolished First Pass", "Build a Six-Layer Barrier Map", "Technical Documentation Fact Card", "Compare Sources and Deliver an Output"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.1111%2Flang.12034");
    expect(chapterText).toContain("reading-evidence.md");
    expect(cardText).toContain("part-1/4-reading.md");
    expect((chapterText.match(/https?:\/\//g) || []).length, chapter).toBeLessThanOrEqual(4);
    expect(chapterText).not.toContain("Animal Farm");
    expect(chapterText).not.toContain("WeChat Official Accounts");
  }
});

test("vocabulary turns card familiarity into contextual retrieval", () => {
  const cases = [
    {
      chapter: "threads/part-1/2-vocabulary.md",
      card: "templates/vocabulary-audit.md",
      chapterTerms: ["保存一次未经修饰的首遇", "为未知项做五种决定", "一个词至少包含八个问题", "十四天词汇实验"],
      cardTerms: ["保存未经查词的首遇", "建立未知项决策队列", "记录八个维度", "做延迟保持与迁移"],
    },
    {
      chapter: "en/threads/part-1/2-vocabulary.md",
      card: "en/templates/vocabulary-audit.md",
      chapterTerms: ["Preserve an Unpolished First Encounter", "Make Five Decisions about Unknown Items", "One Word Contains at Least Eight Questions", "A Fourteen-Day Vocabulary Experiment"],
      cardTerms: ["Preserve a No-Lookup First Encounter", "Build an Unknown-Item Decision Queue", "Record Eight Dimensions", "Test Delayed Retention and Transfer"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.3138%2Fcmlr.63.1.59");
    expect(chapterText).toContain("vocabulary-audit.md");
    expect(cardText).toContain("part-1/2-vocabulary.md");
    expect((chapterText.match(/https?:\/\//g) || []).length, chapter).toBeLessThanOrEqual(8);
  }
});

test("learning principles turn effort into a complete evidence loop", () => {
  const cases = [
    {
      chapter: "threads/part-1/1-understanding.md",
      diagnostic: "templates/english-diagnostic.md",
      chapterTerms: ["一次完整学习回路", "首版是测量，不是判决", "诊断错误，而不是审判自己", "把状态放在会话之外", "让能力跨条件移动"],
      diagnosticTerms: ["定义诊断边界", "四项首版任务", "按影响评分，不按感觉评分", "为每项只选一个首要障碍", "延迟复测与迁移"],
    },
    {
      chapter: "en/threads/part-1/1-understanding.md",
      diagnostic: "en/templates/english-diagnostic.md",
      chapterTerms: ["One Complete Learning Loop", "A First Version Is a Measure, Not a Verdict", "Diagnose the Error Instead of Judging the Person", "Keep State Outside the Session", "Make Ability Move Across Conditions"],
      diagnosticTerms: ["Define the Diagnostic Boundary", "Four First-version Tasks", "Score Impact, Not Feeling", "Choose One Primary Barrier per Skill", "Delayed Retest and Transfer"],
    },
  ];

  for (const { chapter, diagnostic, chapterTerms, diagnosticTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const diagnosticText = readFileSync(resolve(process.cwd(), "docs", diagnostic), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of diagnosticTerms) expect(diagnosticText, diagnostic).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.1177%2F1529100612453266");
    expect(chapterText).toContain("english-diagnostic.md");
    expect(diagnosticText).toContain("evidence-chain.md");
    expect((chapterText.match(/https?:\/\//g) || []).length, chapter).toBeLessThanOrEqual(8);
  }
});

test("AI work papers keep evaluation, human gates, and independent transfer visible", () => {
  const cases = [
    {
      brief: "templates/ai-task-brief.md",
      log: "templates/ai-learning-log.md",
      briefTerms: ["输入、来源与数据边界", "输出与评估集", "人工门", "失败、暂停与回滚", "开始前检查"],
      logTerms: ["无 AI 基线", "交互与来源核验", "三次对照", "延迟保持与交接", "下一周期决定"],
    },
    {
      brief: "en/templates/ai-task-brief.md",
      log: "en/templates/ai-learning-log.md",
      briefTerms: ["Inputs, Sources, and Data Boundary", "Output and Evaluation Set", "Human Gates", "Failure, Pause, and Rollback", "Preflight Check"],
      logTerms: ["Unaided Baseline", "Interaction and Source Verification", "Three Comparisons", "Delayed Retention and Handover", "Next Cycle Decision"],
    },
  ];

  for (const { brief, log, briefTerms, logTerms } of cases) {
    const briefText = readFileSync(resolve(process.cwd(), "docs", brief), "utf8");
    const logText = readFileSync(resolve(process.cwd(), "docs", log), "utf8");
    for (const term of briefTerms) expect(briefText, brief).toContain(term);
    for (const term of logTerms) expect(logText, log).toContain(term);
    expect(briefText).toContain("AI Task Brief");
    expect(logText).toContain("AI Learning Log");
    expect(logText).toContain("evidence-chain.md");
  }
});

test("writing turns tool polish into accountable revision and delivery", () => {
  const cases = [
    {
      chapter: "threads/part-1/6-writing.md",
      card: "templates/writing-evidence.md",
      chapterTerms: ["保存未经修饰的初稿", "先建立事实与责任账本", "翻译不是代写", "十四天写作实验"],
      cardTerms: ["保存无辅助初稿", "记录翻译的意义变化", "记录反馈吸收", "评分与署名决定"],
    },
    {
      chapter: "en/threads/part-1/6-writing.md",
      card: "en/templates/writing-evidence.md",
      chapterTerms: ["Preserve an Unpolished Draft", "Build a Fact and Responsibility Ledger", "Translation Is Not Authorship", "A Fourteen-Day Writing Experiment"],
      cardTerms: ["Preserve an Unaided Draft", "Record Translation Meaning Changes", "Record Feedback Uptake", "Score and Decide Whether to Sign"],
    },
  ];

  for (const { chapter, card, chapterTerms, cardTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const cardText = readFileSync(resolve(process.cwd(), "docs", card), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of cardTerms) expect(cardText, card).toContain(term);
    expect(chapterText).toContain("api.crossref.org/works/10.1111%2Fmodl.12189");
    expect(chapterText).toContain("writing-evidence.md");
    expect(cardText).toContain("part-1/6-writing.md");
    expect((chapterText.match(/https?:\/\//g) || []).length, chapter).toBeLessThanOrEqual(3);
    expect(chapterText).not.toContain("Welcome to the writing chapter");
  }
});

test("the entrepreneurship chapter advances through scenes instead of stacked binary contrasts", () => {
  const text = readFileSync(
    resolve(process.cwd(), "docs/threads/part-2/entrepreneurship.md"),
    "utf8",
  );
  const contrastMarkers = ["不是", "而是", "真正"].reduce(
    (total, marker) => total + (text.match(new RegExp(marker, "g")) || []).length,
    0,
  );
  expect(contrastMarkers).toBeLessThanOrEqual(8);
});

test("relationships separate repair from reconciliation and protect consent under unequal power", () => {
  const cases = [
    {
      chapter: "threads/part-2/relationships.md",
      toolkit: "templates/life-practice-toolkit.md",
      chapterTerms: [
        "修复：不是把关系恢复成原样",
        "修复不等于和好",
        "权力差异：让拒绝真的有出口",
        "沉默不是自动同意，依赖也不是空白授权",
      ],
      toolkitTerms: [
        "谁掌握更多资源、评价权、账号、信息或退出成本",
        "对方是否可以安全地拒绝、暂停或退出这次谈话",
        "哪个修复可以被观察，而不以原谅或和好为条件",
      ],
    },
    {
      chapter: "en/threads/part-2/relationships.md",
      toolkit: "en/templates/life-practice-toolkit.md",
      chapterTerms: [
        "Repair: Do Not Restore the Old Arrangement",
        "Repair does not require reconciliation",
        "Power Differences: Make Refusal a Real Option",
        "Silence is not automatic consent, and dependence is not a blank authorisation",
      ],
      toolkitTerms: [
        "Who holds more resources, evaluation power, account access, information, or exit cost",
        "Can the other person safely refuse, pause, or leave this conversation",
        "What repair can be observed without requiring forgiveness or reconciliation",
      ],
    },
  ];

  for (const { chapter, toolkit, chapterTerms, toolkitTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const toolkitText = readFileSync(resolve(process.cwd(), "docs", toolkit), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of toolkitTerms) expect(toolkitText, toolkit).toContain(term);
  }
});

test("decisions separate uncertainty from values and name authority, disconfirming evidence, and stop gates", () => {
  const cases = [
    {
      chapter: "threads/part-2/decision.md",
      toolkit: "templates/life-practice-toolkit.md",
      chapterTerms: [
        "先判断：缺信息，还是价值冲突",
        "把决定权、影响和执行分开",
        "把停止条件写成能被看见的信号",
        "什么证据会推翻当前选择",
      ],
      toolkitTerms: [
        "问题类型：信息不足 / 结果不确定 / 价值冲突 / 身份防卫",
        "最终决定者及其权限依据",
        "触发后采取：暂停 / 停止 / 回滚 / 升级求助",
      ],
      glossary: "reference/glossary.md",
      glossaryTerms: ["价值冲突", "决定权", "推翻证据", "停止门槛"],
    },
    {
      chapter: "en/threads/part-2/decision.md",
      toolkit: "en/templates/life-practice-toolkit.md",
      chapterTerms: [
        "Ask First: Missing Information or Conflicting Values?",
        "Separate Decision Authority, Impact, and Execution",
        "Write Stop Conditions as Observable Signals",
        "What evidence would overturn this choice",
      ],
      toolkitTerms: [
        "Problem type: missing information / outcome uncertainty / value conflict / identity defence",
        "Final decision owner and basis of authority",
        "Action when triggered: pause / stop / roll back / escalate for help",
      ],
      glossary: "en/reference/glossary.md",
      glossaryTerms: ["Value conflict", "Decision authority", "Disconfirming evidence", "Stop gate"],
    },
  ];

  for (const { chapter, toolkit, glossary, chapterTerms, toolkitTerms, glossaryTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const toolkitText = readFileSync(resolve(process.cwd(), "docs", toolkit), "utf8");
    const glossaryText = readFileSync(resolve(process.cwd(), "docs", glossary), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of toolkitTerms) expect(toolkitText, toolkit).toContain(term);
    for (const term of glossaryTerms) expect(glossaryText, glossary).toContain(term);
  }
});

test("recovery separates safety, reduced load, and rebuilding before a bounded return to work", () => {
  const cases = [
    {
      chapter: "threads/part-2/recovery.md",
      toolkit: "templates/life-practice-toolkit.md",
      glossary: "reference/glossary.md",
      chapterTerms: [
        "先选择今天的恢复模式",
        "复工不是开关，而是一次逐级试载",
        "求助要具体，也要保留主体性",
        "安全 / 降档 / 重建",
        "WHO：Mental health at work",
      ],
      toolkitTerms: [
        "今天的模式：安全 / 降档 / 重建",
        "支持者不能替我做",
        "第二天需要检查的代价",
        "复查日期与有权暂停的人",
      ],
      glossaryTerms: ["恢复模式", "复工试载", "支持协议"],
    },
    {
      chapter: "en/threads/part-2/recovery.md",
      toolkit: "en/templates/life-practice-toolkit.md",
      glossary: "en/reference/glossary.md",
      chapterTerms: [
        "Choose Today's Recovery Mode First",
        "Returning to Work Is a Load Test, Not a Switch",
        "Ask for Specific Help Without Giving Away Your Life",
        "Safety / reduced load / rebuilding",
        "WHO: Mental health at work",
      ],
      toolkitTerms: [
        "Today's mode: safety / reduced load / rebuilding",
        "What a supporter must not do in my place",
        "Next-day cost to check",
        "Review date and person authorised to pause",
      ],
      glossaryTerms: ["Recovery mode", "Return-to-work load test", "Support agreement"],
    },
  ];

  for (const { chapter, toolkit, glossary, chapterTerms, toolkitTerms, glossaryTerms } of cases) {
    const chapterText = readFileSync(resolve(process.cwd(), "docs", chapter), "utf8");
    const toolkitText = readFileSync(resolve(process.cwd(), "docs", toolkit), "utf8");
    const glossaryText = readFileSync(resolve(process.cwd(), "docs", glossary), "utf8");
    for (const term of chapterTerms) expect(chapterText, chapter).toContain(term);
    for (const term of toolkitTerms) expect(toolkitText, toolkit).toContain(term);
    for (const term of glossaryTerms) expect(glossaryText, glossary).toContain(term);
    expect(chapterText).toContain("sources_checked: 2026-09-07");
  }
});

test("the scheduled link audit checks authoritative sources and retires the 193-197 failure URLs", () => {
  const workflow = readFileSync(resolve(process.cwd(), ".github/workflows/links.yml"), "utf8");
  for (const source of [
    '"ATTRIBUTIONS.md"',
    '"docs/README.md"',
    '"docs/en/README.md"',
    '"docs/threads/**/*.md"',
    '"docs/en/threads/**/*.md"',
  ]) {
    expect(workflow).toContain(source);
  }
  for (const retiredUrl of [
    "scholarspace\\.manoa\\.hawaii\\.edu",
    "doi\\.org/10\\.64152/10125/66973",
    "10\\.1076/edre\\.7\\.1\\.403\\.3989",
    "web\\.archive\\.org/web/20160424221725",
  ]) {
    expect(workflow).toContain(retiredUrl);
  }
  expect(workflow).toContain("if grep -REni");
  expect(workflow).toContain("A retired URL from the 193-197 failure series has returned.");
});

for (const [route, heading] of routes) {
  test(`${route} renders`, async ({ page }) => {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { level: 1, name: new RegExp(escapeRegExp(heading)) }),
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });
}

test("page metadata follows the route", async ({ page }) => {
  await page.goto("./threads/part-1/2-vocabulary");
  await expect(page).toHaveTitle(/词汇篇/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /词汇/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/threads/part-1/2-vocabulary",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://byoungd.github.io/up/threads/part-1/2-vocabulary",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/assets\/feature\.png$/);
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
  await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/threads/part-1/2-vocabulary",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/en/threads/part-1/2-vocabulary",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/threads/part-1/2-vocabulary",
  );
  const chapterData = await structuredDataFromPage(page);
  expect(chapterData).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Chapter",
    inLanguage: "zh-CN",
    author: { "@type": "Person", name: "韩先凯" },
    isPartOf: { "@type": "Book", name: "人生进阶指南", url: "https://byoungd.github.io/up/" },
  });
  expect(chapterData.dateModified).toBe("2026-09-02");
});

test("home metadata follows the lifelong-learning positioning", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/人生进阶指南/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /AI 时代.*真实项目.*低谷/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "人生进阶指南｜AI 时代终身学习",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "book");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/assets\/feature\.png$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /书籍分享封面/);
  await expect(page.locator('meta[name="build-revision"]')).toHaveAttribute(
    "content",
    expectedBuildRevision,
  );
  const zhBookData = await structuredDataFromPage(page);
  expect(zhBookData).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Book",
    name: "人生进阶指南",
    alternateName: "Life Level-up Guide",
    bookFormat: "https://schema.org/EBook",
    inLanguage: "zh-CN",
    author: { "@type": "Person", name: "韩先凯" },
    encoding: [
      { "@type": "MediaObject", encodingFormat: "application/epub+zip" },
      { "@type": "MediaObject", encodingFormat: "application/pdf" },
    ],
  });

  await page.goto("./en/");
  await expect(page).toHaveTitle(/Life Level-up Guide/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/en/",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /learning continuously.*AI era/i,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/assets\/feature-en\.png$/);
  const enBookData = await structuredDataFromPage(page);
  expect(enBookData).toMatchObject({
    "@type": "Book",
    name: "Life Level-up Guide",
    alternateName: "人生进阶指南",
    inLanguage: "en-US",
    author: { "@type": "Person", name: "Han Xiankai" },
    encoding: [
      { "@type": "MediaObject", encodingFormat: "application/epub+zip" },
      { "@type": "MediaObject", encodingFormat: "application/pdf" },
    ],
  });
});

test("home pages expose deterministic bilingual EPUB editions", async ({ page, request }) => {
  const manifestResponse = await request.get("downloads/epub-manifest.json");
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain("application/json");
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ version: 1, standard: "EPUB 3.3" });

  const editions = [
    {
      language: "zh-CN",
      label: "下载中文 EPUB",
      href: "./downloads/life-level-up-guide-zh.epub",
      chapters: publicationChapterCount(zhNavigation),
    },
    {
      language: "en-US",
      label: "Download English EPUB",
      href: "./downloads/life-level-up-guide-en.epub",
      chapters: publicationChapterCount(enNavigation),
    },
  ];

  await page.goto("./");
  for (const edition of editions) {
    const link = page.getByRole("link", { name: edition.label, exact: true });
    await expect(link).toHaveAttribute("href", edition.href);
    await expect(link).toHaveAttribute("download", "");

    const output = manifest.outputs[edition.language];
    expect(output.chapters).toBe(edition.chapters);
    expect(output.images).toBeGreaterThan(1);
    expect(output.bytes).toBeGreaterThan(1_000_000);
    expect(output.bytes).toBeLessThan(8_000_000);
    const response = await request.get(`downloads/${output.file}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/epub+zip");
    const body = await response.body();
    expect(body.subarray(0, 2).toString("ascii")).toBe("PK");
    expect(body.length).toBe(output.bytes);
    expect(sha256(body)).toBe(output.sha256);
  }

  await page.goto("./en/");
  await expect(page.getByRole("link", { name: "Download English EPUB", exact: true })).toHaveAttribute(
    "href",
    "../downloads/life-level-up-guide-en.epub",
  );
  await expect(page.getByRole("link", { name: "下载中文 EPUB", exact: true })).toHaveAttribute(
    "href",
    "../downloads/life-level-up-guide-zh.epub",
  );
});

test("home pages expose reproducible print-ready bilingual PDF editions", async ({ page, request }) => {
  const manifestResponse = await request.get("downloads/pdf-manifest.json");
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain("application/json");
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ version: 2, format: "PDF 1.7", pageSize: "6 × 9.6 in" });
  expect(manifest.inspector).toEqual({ name: "pypdf", version: "6.16.2" });

  const editions = [
    {
      language: "zh-CN",
      label: "下载中文 PDF",
      href: "./downloads/life-level-up-guide-zh.pdf",
      chapters: publicationChapterCount(zhNavigation),
    },
    {
      language: "en-US",
      label: "Download English PDF",
      href: "./downloads/life-level-up-guide-en.pdf",
      chapters: publicationChapterCount(enNavigation),
    },
  ];

  await page.goto("./");
  for (const edition of editions) {
    const link = page.getByRole("link", { name: edition.label, exact: true });
    await expect(link).toHaveAttribute("href", edition.href);
    await expect(link).toHaveAttribute("download", "");

    const output = manifest.outputs[edition.language];
    expect(output.chapters).toBe(edition.chapters);
    expect(output.pages).toBeGreaterThan(200);
    expect(output.bytes).toBeGreaterThan(500_000);
    expect(output.bytes).toBeLessThan(8_000_000);
    expect(output.semanticSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(output.outlineEntries).toBeGreaterThan(500);
    expect(output.linkAnnotations).toBeGreaterThan(500);
    expect(output.images).toBeGreaterThan(10);
    if (edition.language === "zh-CN") {
      const embeddedNotoFonts = output.fonts.filter(
        (font) => font.name.startsWith("Noto") && font.embedded,
      );
      expect(embeddedNotoFonts.map((font) => font.name)).toEqual(
        expect.arrayContaining(["NotoSans-Regular", "NotoSerifSC-Bold", "NotoSerifSC-Regular"]),
      );
    }
    const response = await request.get(`downloads/${output.file}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    const body = await response.body();
    expect(body.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(body.length).toBe(output.bytes);
    expect(sha256(body)).toBe(output.sha256);
  }

  await page.goto("./en/");
  await expect(page.getByRole("link", { name: "Download English PDF", exact: true })).toHaveAttribute(
    "href",
    "../downloads/life-level-up-guide-en.pdf",
  );
  await expect(page.getByRole("link", { name: "下载中文 PDF", exact: true })).toHaveAttribute(
    "href",
    "../downloads/life-level-up-guide-zh.pdf",
  );
});

test("brand and social assets load at their declared dimensions", async ({ page, request }) => {
  await page.goto("./");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/up/assets/logo.svg");
  const rasterAssets = [
    { path: "assets/feature.png", dimensions: { width: 1200, height: 630 } },
    { path: "assets/feature-en.png", dimensions: { width: 1200, height: 630 } },
    { path: "assets/cover-portrait.png", dimensions: { width: 1600, height: 2560 } },
    { path: "assets/cover-portrait-en.png", dimensions: { width: 1600, height: 2560 } },
  ];
  for (const { path, dimensions: expectedDimensions } of rasterAssets) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const dimensions = await page.evaluate(
      (source) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = reject;
          image.src = source;
        }),
      `./${path}`,
    );
    expect(dimensions).toEqual(expectedDimensions);
  }

  const logo = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = reject;
        image.src = "./assets/logo.svg";
      }),
  );
  expect(logo).toEqual({ width: 48, height: 48 });

  const sitemapResponse = await request.get("sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain('hreflang="zh-CN" href="https://byoungd.github.io/up/threads/part-1/2-vocabulary"');
  expect(sitemap).toContain('hreflang="en-US" href="https://byoungd.github.io/up/en/threads/part-1/2-vocabulary"');
  expect(sitemap).toContain('hreflang="x-default" href="https://byoungd.github.io/up/threads/part-1/2-vocabulary"');
});

test("AI resource-layer chapter has metadata and navigation", async ({ page }, testInfo) => {
  await page.goto("./threads/part-3/2-ai-development-and-resource-layer");
  await expect(page).toHaveTitle(/AI 学习、项目开发与资源层创业/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /韩先凯.*AI 资源层创业/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/threads/part-3/2-ai-development-and-resource-layer",
  );
  if (testInfo.project.name === "mobile-chromium") await page.locator(".VPLocalNav .menu").click();
  await expect(
    page.getByRole("link", { name: "AI 开发与资源层创业", exact: true }).first(),
  ).toBeVisible();

  await page.goto("./en/threads/part-3/2-ai-development-and-resource-layer");
  await expect(page).toHaveTitle(/AI Learning, Project Development/);
  if (testInfo.project.name === "mobile-chromium") await page.locator(".VPLocalNav .menu").click();
  await expect(
    page.getByRole("link", {
      name: "AI Development and Resource-layer Business",
      exact: true,
    }).first(),
  ).toBeVisible();
});

test("resource-layer work returns from verification to disclosure and daily practice", async ({ page }) => {
  await page.goto("./threads/part-3/2-ai-development-and-resource-layer");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { name: "让方法回到日常" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "作者项目与现实实践", exact: true }).last()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "第四部：实践与恢复", exact: true }).last()).toBeVisible();

  await page.goto("./en/threads/part-3/2-ai-development-and-resource-layer");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { name: "Return the Method to Daily Life" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Author Projects and Real-world Practice", exact: true }).last()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Part IV: Practice and Recovery", exact: true }).last()).toBeVisible();
});

test("legacy Docsify hash route redirects once", async ({ page }) => {
  await page.goto("./#/threads/part-1/1-understanding");
  await expect(page).toHaveURL(/\/up\/threads\/part-1\/1-understanding$/);
  await expect(page.getByRole("heading", { level: 1, name: /认知篇/ })).toBeVisible();
});

test("legacy English story route redirects to the aligned Part II path", async ({ page }) => {
  await page.goto("./en/threads/part-4/my-story?from=legacy#narrative-boundary");
  await expect(page).toHaveURL(
    /\/up\/en\/threads\/part-2\/my-story\?from=legacy#narrative-boundary$/,
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "My Story: Failure, Recovery, and Starting Again" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://byoungd.github.io/up/en/threads/part-2/my-story",
  );
});

test("local search uses the current language and returns a result", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  const zhSearchBox = page.locator(".VPLocalSearchBox");
  const zhInput = zhSearchBox.locator("input");
  await expect(zhInput).toBeVisible();
  await expect(zhSearchBox.locator('button[title="关闭搜索"]')).toHaveCount(1);
  await expect(zhSearchBox.locator('button[title="显示详细结果"]')).toHaveCount(1);
  await expect(zhSearchBox.locator('button[title="清除搜索"]')).toHaveCount(1);
  await zhInput.fill("学习状态");
  await expect(zhSearchBox.getByRole("option", { name: /学习状态/ }).first()).toBeVisible();
  await expect(zhSearchBox).toContainText("选择");
  await expect(zhSearchBox).toContainText("切换");
  await expect(zhSearchBox).toContainText("关闭");

  await page.keyboard.press("Escape");
  await expect(zhSearchBox).toBeHidden();
  await page.goto("./en/");
  const enSearchButton = page.getByRole("button", { name: "Search", exact: true });
  const [enTitleBox, enSearchButtonBox] = await Promise.all([
    page.locator(".VPNavBarTitle").boundingBox(),
    enSearchButton.boundingBox(),
  ]);
  expect(enTitleBox?.x + (enTitleBox?.width || 0)).toBeLessThanOrEqual(enSearchButtonBox?.x || 0);
  await enSearchButton.click();
  const enSearchBox = page.locator(".VPLocalSearchBox");
  const enInput = enSearchBox.locator("input");
  await expect(enInput).toBeVisible();
  await expect(enSearchBox.locator('button[title="Close search"]')).toHaveCount(1);
  await enInput.fill("Learning State");
  await expect(enSearchBox.getByRole("option", { name: /Learning State/ }).first()).toBeVisible();
});

test("page-level search keeps nested chapter text discoverable", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  const zhSearchBox = page.locator(".VPLocalSearchBox");
  await zhSearchBox.locator("input").fill("十四天不是写作速成期限");
  await expect(zhSearchBox.getByRole("option", { name: /写作篇/ }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.goto("./en/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const enSearchBox = page.locator(".VPLocalSearchBox");
  await enSearchBox.locator("input").fill("Fourteen days is not a writing-fluency deadline");
  await expect(enSearchBox.getByRole("option", { name: /Writing/ }).first()).toBeVisible();
});

test("heading-only search keeps long-form chapters and tools discoverable without indexing their full prose", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  const zhSearchBox = page.locator(".VPLocalSearchBox");
  await zhSearchBox.locator("input").fill("目标必须有到期日与退出门");
  await expect(zhSearchBox.getByRole("option", { name: /目标必须有到期日与退出门/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("作品也要接受自己的审判");
  await expect(zhSearchBox.getByRole("option", { name: /作品也要接受自己的审判/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("把记忆交给文件，把判断留给自己");
  await expect(zhSearchBox.getByRole("option", { name: /把记忆交给文件，把判断留给自己/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("家庭学习篇：把成长还给孩子");
  await expect(zhSearchBox.getByRole("option", { name: /家庭学习篇：把成长还给孩子/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("求职英语篇：把能力带进面试与远程协作");
  await expect(zhSearchBox.getByRole("option", { name: /求职英语篇：把能力带进面试与远程协作/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("语法篇：让结构服务于意思");
  await expect(zhSearchBox.getByRole("option", { name: /语法篇：让结构服务于意思/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("语法证据卡：从规则识别到真实表达");
  await expect(zhSearchBox.getByRole("option", { name: /语法证据卡：从规则识别到真实表达/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("口语篇：让意思清楚到达");
  await expect(zhSearchBox.getByRole("option", { name: /口语篇：让意思清楚到达/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("口语证据卡：从口音焦虑到可验证互动");
  await expect(zhSearchBox.getByRole("option", { name: /口语证据卡：从口音焦虑到可验证互动/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("听力篇：从声音辨认到真实理解");
  await expect(zhSearchBox.getByRole("option", { name: /听力篇：从声音辨认到真实理解/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("听力证据卡：从播放时长到意义重构");
  await expect(zhSearchBox.getByRole("option", { name: /听力证据卡：从播放时长到意义重构/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("阅读篇：从逐词翻译到观点与证据");
  await expect(zhSearchBox.getByRole("option", { name: /阅读篇：从逐词翻译到观点与证据/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("阅读证据卡：从读完摘要到真实交付");
  await expect(zhSearchBox.getByRole("option", { name: /阅读证据卡：从读完摘要到真实交付/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("词汇篇：从眼熟到在真实任务中调用");
  await expect(zhSearchBox.getByRole("option", { name: /词汇篇：从眼熟到在真实任务中调用/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("词汇证据卡：从卡片眼熟到情境调用");
  await expect(zhSearchBox.getByRole("option", { name: /词汇证据卡：从卡片眼熟到情境调用/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("认知篇：把努力变成可验证的学习");
  await expect(zhSearchBox.getByRole("option", { name: /认知篇：把努力变成可验证的学习/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("英语能力诊断：四项基线与迁移记录");
  await expect(zhSearchBox.getByRole("option", { name: /英语能力诊断：四项基线与迁移记录/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("AI 任务简报：从问题到人工验收");
  await expect(zhSearchBox.getByRole("option", { name: /AI 任务简报：从问题到人工验收/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("AI 学习记录：从工具协作到独立能力");
  await expect(zhSearchBox.getByRole("option", { name: /AI 学习记录：从工具协作到独立能力/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("写作篇：从初稿到可验证修订");
  await expect(zhSearchBox.getByRole("option", { name: /写作篇：从初稿到可验证修订/ }).first()).toBeVisible();
  await zhSearchBox.locator("input").fill("写作证据卡：从工具润色到署名交付");
  await expect(zhSearchBox.getByRole("option", { name: /写作证据卡：从工具润色到署名交付/ }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.goto("./en/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const enSearchBox = page.locator(".VPLocalSearchBox");
  await enSearchBox.locator("input").fill("Every Goal Needs an Expiry Date");
  await expect(enSearchBox.getByRole("option", { name: /Every Goal Needs an Expiry Date/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Let the Work Face Its Own Judgment");
  await expect(enSearchBox.getByRole("option", { name: /Let the Work Face Its Own Judgment/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Give Memory to the File and Keep Judgment with Yourself");
  await expect(enSearchBox.getByRole("option", { name: /Give Memory to the File and Keep Judgment with Yourself/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Family Learning: Return Ownership of Growth to the Learner");
  await expect(enSearchBox.getByRole("option", { name: /Family Learning: Return Ownership of Growth to the Learner/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Job-search English: Bring Ability into Interviews and Remote Work");
  await expect(enSearchBox.getByRole("option", { name: /Job-search English: Bring Ability into Interviews and Remote Work/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Grammar: Let Structure Serve Meaning");
  await expect(enSearchBox.getByRole("option", { name: /Grammar: Let Structure Serve Meaning/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Grammar Evidence Card: From Rule Recognition to Real Expression");
  await expect(enSearchBox.getByRole("option", { name: /Grammar Evidence Card: From Rule Recognition to Real Expression/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Speaking: Make Meaning Arrive");
  await expect(enSearchBox.getByRole("option", { name: /Speaking: Make Meaning Arrive/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Speaking Evidence Card: From Accent Anxiety to Verifiable Interaction");
  await expect(enSearchBox.getByRole("option", { name: /Speaking Evidence Card: From Accent Anxiety to Verifiable Interaction/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Listening: From Sound Recognition to Real Understanding");
  await expect(enSearchBox.getByRole("option", { name: /Listening: From Sound Recognition to Real Understanding/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Listening Evidence Card: From Playback Time to Meaning Reconstruction");
  await expect(enSearchBox.getByRole("option", { name: /Listening Evidence Card: From Playback Time to Meaning Reconstruction/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Reading: From Word-by-word Translation to Claims and Evidence");
  await expect(enSearchBox.getByRole("option", { name: /Reading: From Word-by-word Translation to Claims and Evidence/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Reading Evidence Card: From Finished Summary to Real Delivery");
  await expect(enSearchBox.getByRole("option", { name: /Reading Evidence Card: From Finished Summary to Real Delivery/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Vocabulary: From Familiarity to Retrieval in Real Tasks");
  await expect(enSearchBox.getByRole("option", { name: /Vocabulary: From Familiarity to Retrieval in Real Tasks/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Vocabulary Evidence Card: From Card Familiarity to Contextual Retrieval");
  await expect(enSearchBox.getByRole("option", { name: /Vocabulary Evidence Card: From Card Familiarity to Contextual Retrieval/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Learning Principles: Turn Effort into Verifiable Learning");
  await expect(enSearchBox.getByRole("option", { name: /Learning Principles: Turn Effort into Verifiable Learning/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("English Diagnostic: Four-skill Baseline and Transfer Record");
  await expect(enSearchBox.getByRole("option", { name: /English Diagnostic: Four-skill Baseline and Transfer Record/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("AI Task Brief: From Problem to Human Acceptance");
  await expect(enSearchBox.getByRole("option", { name: /AI Task Brief: From Problem to Human Acceptance/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("AI Learning Log: From Tool Collaboration to Independent Ability");
  await expect(enSearchBox.getByRole("option", { name: /AI Learning Log: From Tool Collaboration to Independent Ability/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Writing: From Draft to Verifiable Revision");
  await expect(enSearchBox.getByRole("option", { name: /Writing: From Draft to Verifiable Revision/ }).first()).toBeVisible();
  await enSearchBox.locator("input").fill("Writing Evidence Card: From Tool Polish to Accountable Delivery");
  await expect(enSearchBox.getByRole("option", { name: /Writing Evidence Card: From Tool Polish to Accountable Delivery/ }).first()).toBeVisible();
});

test("Part I literary closings remain discoverable after bibliography pruning", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  const zhSearchBox = page.locator(".VPLocalSearchBox");
  await zhSearchBox.locator("input").fill("听见声音背后的人");
  await expect(zhSearchBox.getByRole("option", { name: /听力篇/ }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.goto("./en/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const enSearchBox = page.locator(".VPLocalSearchBox");
  await enSearchBox.locator("input").fill("Hear the Person Behind the Sound");
  await expect(enSearchBox.getByRole("option", { name: /Listening/ }).first()).toBeVisible();
});

test("story and AI literary closings remain discoverable", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  const zhSearchBox = page.locator(".VPLocalSearchBox");
  await zhSearchBox.locator("input").fill("重来不是凯旋");
  await expect(zhSearchBox.getByRole("option", { name: /我的故事/ }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.goto("./en/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const enSearchBox = page.locator(".VPLocalSearchBox");
  await enSearchBox.locator("input").fill("Keep the Ability with the Person");
  await expect(enSearchBox.getByRole("option", { name: /Learning Anything with AI/ }).first()).toBeVisible();
});

test("language navigation and representative image work", async ({ page }) => {
  await page.goto("./projects");
  const image = page.getByRole("img", { name: /token\.love 产品页面存档/ });
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty("complete", true);

  await page.goto("./en/");
  await expect(page.getByRole("heading", { level: 1, name: "Life Level-up Guide" })).toBeVisible();
  let lifelongLearning = page.getByRole("link", {
    name: "Lifelong Learning",
    exact: true,
  });
  if ((await lifelongLearning.count()) === 0) {
    await page.getByRole("button", { name: "mobile navigation" }).click();
    lifelongLearning = page.getByRole("link", {
      name: "Lifelong Learning",
      exact: true,
    });
  }
  await expect(lifelongLearning).toBeVisible();
});

test("home page shows the latest updates", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 2, name: "现实仍在继续" })).toBeVisible();
  const partnerPhoto = page.getByRole("img", { name: "韩先凯与伴侣的合影" });
  const readersPhoto = page.getByRole("img", { name: "韩先凯在 Agentic DB 大会与读者合影" });
  await expect(partnerPhoto).toBeVisible();
  await expect(readersPhoto).toBeVisible();
  for (const image of [partnerPhoto, readersPhoto]) {
    await expect(image).toHaveAttribute("src", /\.webp$/);
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("decoding", "async");
    await expect(image).toHaveAttribute("fetchpriority", "low");
    await expect(image).toHaveAttribute("width", /^\d+$/);
    await expect(image).toHaveAttribute("height", /^\d+$/);
  }
});

test("home pages use book metadata without third-party image requests", async ({ page, request }) => {
  const externalImages = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.resourceType() === "image" && url.hostname !== "127.0.0.1") externalImages.push(url.href);
  });

  await page.goto("./");
  const zhMeta = page.locator(".book-meta");
  await expect(zhMeta).toContainText("持续更新书稿");
  await expect(zhMeta.getByRole("link", { name: "源码与勘误" })).toHaveAttribute(
    "href",
    "https://github.com/byoungd/up",
  );
  await expect(zhMeta.getByRole("link", { name: "读者实践回执" })).toHaveAttribute(
    "href",
    "./templates/reader-field-note",
  );
  await expect(zhMeta.getByRole("link", { name: "正文 CC BY-NC 4.0" })).toHaveAttribute(
    "href",
    "https://creativecommons.org/licenses/by-nc/4.0/",
  );
  await expect(page.locator(".VPSocialLink")).toHaveCount(0);
  expect(externalImages).toEqual([]);

  await page.goto("./en/");
  const enMeta = page.locator(".book-meta");
  await expect(enMeta).toContainText("Living manuscript");
  await expect(enMeta.getByRole("link", { name: "Source and corrections" })).toBeVisible();
  await expect(enMeta.getByRole("link", { name: "Reader Field Note" })).toHaveAttribute(
    "href",
    "./templates/reader-field-note",
  );
  const readerFieldNoteUrl = new URL(
    await enMeta.getByRole("link", { name: "Reader Field Note" }).getAttribute("href"),
    page.url(),
  );
  const readerFieldNoteResponse = await request.get(readerFieldNoteUrl.href);
  expect(readerFieldNoteResponse.status()).toBe(200);
  const readerFieldNoteHtml = await readerFieldNoteResponse.text();
  expect(readerFieldNoteHtml).toContain("Reader Field Note");
  expect(readerFieldNoteHtml).not.toContain("读者现场回执");
  await expect(enMeta.getByRole("link", { name: "Text CC BY-NC 4.0" })).toBeVisible();
  expect(externalImages).toEqual([]);
});

test("English homepage and listening copy keep the editorial corrections", async ({ page }) => {
  await page.goto("./en/");
  await expect(page.locator(".latest-update").nth(1)).toContainText(
    "Han Xiankai met readers and peers face to face",
  );

  const projects = readFileSync(resolve(process.cwd(), "docs/en/projects.md"), "utf8");
  expect(projects).toContain("It is a disclosure, not a purchase");

  const listening = readFileSync(
    resolve(process.cwd(), "docs/en/threads/part-1/3-listening.md"),
    "utf8",
  );
  expect(listening).toContain("recurrently misheard chunk");
  expect(listening).not.toContain("recurringly misheard chunk");
});

test("latest home photos stay within the deferred media budget", async ({ page, request }) => {
  await page.goto("./");
  const images = [
    page.getByRole("img", { name: "韩先凯与伴侣的合影" }),
    page.getByRole("img", { name: "韩先凯在 Agentic DB 大会与读者合影" }),
  ];
  let total = 0;
  for (const image of images) {
    const source = await image.getAttribute("src");
    expect(source).toMatch(/\.webp$/);
    const response = await request.get(source);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/webp");
    const size = (await response.body()).byteLength;
    expect(size).toBeLessThan(220_000);
    total += size;
  }
  expect(total).toBeLessThan(280_000);
});

test("deferred story media reserves its intrinsic layout space", async ({ page }) => {
  await page.goto("./threads/part-2/my-story");
  const image = page.getByRole("img", { name: "软件产品页面" });
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(image).toHaveAttribute("width", "1440");
  await expect(image).toHaveAttribute("height", "1266");
  const box = await image.boundingBox();
  expect(box?.width).toBeGreaterThan(0);
  expect(box?.height).toBeGreaterThan(0);
  expect((box?.width || 0) / (box?.height || 1)).toBeCloseTo(1440 / 1266, 2);
});

test("home pages link to the reader guide", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("link", { name: "阅读指南", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /家庭与中学生学习/ })).toHaveAttribute(
    "href",
    "./threads/part-4/family-learning",
  );
  await expect(page.getByRole("link", { name: /海外求职与远程协作/ })).toHaveAttribute(
    "href",
    "./threads/part-1/8-job-search-english",
  );
  await expect(page.getByRole("link", { name: /语法基础与真实表达/ })).toHaveAttribute(
    "href",
    "./threads/part-1/grammar",
  );
  await expect(page.locator('main a[href="./threads/part-1/5-speaking"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: /写作与异步交付/ })).toHaveAttribute(
    "href",
    "./threads/part-1/6-writing",
  );

  await page.goto("./en/");
  await expect(page.getByRole("link", { name: "Reader's Guide", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Family and Middle-School Learning/ })).toHaveAttribute(
    "href",
    "./threads/part-4/family-learning",
  );
  await expect(page.getByRole("link", { name: /Global Job Search and Remote Work/ })).toHaveAttribute(
    "href",
    "./threads/part-1/8-job-search-english",
  );
  await expect(page.getByRole("link", { name: /Grammar for Real Expression/ })).toHaveAttribute(
    "href",
    "./threads/part-1/grammar",
  );
  await expect(page.locator('main a[href="./threads/part-1/5-speaking"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Writing and Asynchronous Delivery/ })).toHaveAttribute(
    "href",
    "./threads/part-1/6-writing",
  );
});

test("home guide paths are grouped by purpose and keep third-party resources distinct", async ({ page }) => {
  await page.goto("./");
  const zhGroups = page.locator("main .guide-path-group");
  await expect(zhGroups).toHaveCount(4);
  await expect(zhGroups.nth(0).getByRole("heading", { level: 2, name: "建立基础" })).toBeVisible();
  await expect(zhGroups.nth(1).getByRole("heading", { level: 2, name: "借工具放大能力" })).toBeVisible();
  await expect(zhGroups.nth(2).getByRole("heading", { level: 2, name: "进入真实生活" })).toBeVisible();
  await expect(zhGroups.nth(3).getByRole("heading", { level: 2, name: "第三方资源" })).toBeVisible();
  await expect(zhGroups.nth(0).locator(".guide-path")).toHaveCount(4);
  await expect(zhGroups.nth(1).locator(".guide-path")).toHaveCount(2);
  await expect(zhGroups.nth(2).locator(".guide-path")).toHaveCount(4);
  await expect(zhGroups.nth(3).locator(".guide-path")).toHaveCount(2);
  await expect(zhGroups.nth(3)).toHaveClass(/guide-path-group-external/);

  await page.goto("./en/");
  const enGroups = page.locator("main .guide-path-group");
  await expect(enGroups).toHaveCount(4);
  await expect(enGroups.nth(0).getByRole("heading", { level: 2, name: "Build the Foundation" })).toBeVisible();
  await expect(enGroups.nth(1).getByRole("heading", { level: 2, name: "Amplify Ability with Tools" })).toBeVisible();
  await expect(enGroups.nth(2).getByRole("heading", { level: 2, name: "Enter Real Life" })).toBeVisible();
  await expect(enGroups.nth(3).getByRole("heading", { level: 2, name: "Third-party Resources" })).toBeVisible();
  await expect(enGroups.nth(3)).toHaveClass(/guide-path-group-external/);
});

test("home pages expose biezou as a bounded external AI reference", async ({ page }) => {
  await page.goto("./");
  const zhBiezou = page.locator('a[href="https://biezou.com/"]').first();
  await expect(zhBiezou).toBeVisible();
  await expect(zhBiezou).toContainText("AI 中转推荐：biezou.com");
  await expect(zhBiezou).toContainText("第三方可选入口");
  await expect(zhBiezou).toHaveAttribute("target", "_blank");
  await expect(zhBiezou).toHaveAttribute("rel", /noopener/);

  await page.goto("./en/");
  const enBiezou = page.locator('a[href="https://biezou.com/"]').first();
  await expect(enBiezou).toBeVisible();
  await expect(enBiezou).toContainText("AI Relay Recommendation: biezou.com");
  await expect(enBiezou).toContainText("optional third-party entry point");
  await expect(enBiezou).toHaveAttribute("target", "_blank");
  await expect(enBiezou).toHaveAttribute("rel", /noopener/);
});

test("home pages expose OpenHuge_ai as a bounded Telegram resource reference", async ({ page }) => {
  await page.goto("./");
  const zhOpenHuge = page.locator('a[href="https://t.me/OpenHuge_ai"]').first();
  await expect(zhOpenHuge).toBeVisible();
  await expect(zhOpenHuge).toContainText("AI 资源 TG 频道：OpenHuge_ai");
  await expect(zhOpenHuge).toContainText("第三方 Telegram 频道推荐");
  await expect(zhOpenHuge).toHaveAttribute("target", "_blank");
  await expect(zhOpenHuge).toHaveAttribute("rel", /noopener/);

  await page.goto("./en/");
  const enOpenHuge = page.locator('a[href="https://t.me/OpenHuge_ai"]').first();
  await expect(enOpenHuge).toBeVisible();
  await expect(enOpenHuge).toContainText("AI Resources on Telegram: OpenHuge_ai");
  await expect(enOpenHuge).toContainText("third-party Telegram channel");
  await expect(enOpenHuge).toHaveAttribute("target", "_blank");
  await expect(enOpenHuge).toHaveAttribute("rel", /noopener/);
});

test("home pages explain per-entry product verification dates", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText(/产品与服务条目的核验日期以各自页面/)).toBeVisible();

  await page.goto("./en/");
  await expect(page.getByText(/Check dates for product and service entries are recorded per page/)).toBeVisible();
});

test("evidence chapter hands off to practice and action", async ({ page }) => {
  await page.goto("./threads/part-3/5-evidence-and-transfer");
  const zhMain = page.locator("main");
  await expect(
    zhMain.getByRole("link", { name: "AI 开发与资源层创业", exact: true }),
  ).toBeVisible();
  await expect(
    zhMain.getByRole("link", { name: "行动篇：九十天，把生活交还给自己", exact: true }),
  ).toBeVisible();

  await page.goto("./en/threads/part-3/5-evidence-and-transfer");
  const enMain = page.locator("main");
  await expect(
    enMain.getByRole("link", { name: "AI Development and Resource-layer Business", exact: true }),
  ).toBeVisible();
  await expect(
    enMain.getByRole("link", { name: "90-Day Action Plan", exact: true }),
  ).toBeVisible();
});

test("rhythm chapter bridges the daily system and 90-day plan", async ({ page }) => {
  await page.goto("./threads/part-4/rhythm-and-compounding");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "四种会复利的东西" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "术语与方法索引", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本模板", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "九十天行动篇", exact: true }).first()).toBeVisible();

  await page.goto("./en/threads/part-4/rhythm-and-compounding");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Four Things That Compound" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Glossary of Terms and Methods", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger Template", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "90-Day Action Plan", exact: true }).first()).toBeVisible();
});

test("toolkit overview routes readers by problem", async ({ page }) => {
  await page.goto("./templates/toolkit");
  await expect(page.locator("main")).toContainText("第一次使用？先做四行");
  await expect(page.getByRole("link", { name: "工具箱实战", exact: true }).first()).toBeVisible();
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "先回答：我现在卡在哪里？" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "学习状态", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "生活进阶工作表", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "家庭学习共同协议", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "求职英语证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "语法证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "口语证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "听力证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "阅读证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "词汇证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "写作证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/toolkit");
  await expect(page.locator("main")).toContainText("First time here? Start with four lines.");
  await expect(page.getByRole("link", { name: "Toolkit Walkthrough", exact: true }).first()).toBeVisible();
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "First Ask: Where Am I Stuck?" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Learning State", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Life Practice Toolkit", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Family Learning Agreement", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Job-search English Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Grammar Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Speaking Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Listening Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Reading Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Vocabulary Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Writing Evidence Card", exact: true }).first()).toBeVisible();
});

test("writing pages preserve authorship, feedback uptake, and async delivery", async ({ page }) => {
  await page.goto("./threads/part-1/6-writing");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /先建立事实与责任账本/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /翻译不是代写/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /AI 是编辑助手，不是隐形作者/ })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "写作证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./templates/writing-evidence");
  const zhCard = page.locator("main");
  await expect(zhCard.getByRole("heading", { level: 2, name: /保存无辅助初稿/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /记录反馈吸收/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /检查异步交付/ })).toBeVisible();

  await page.goto("./en/threads/part-1/6-writing");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /Build a Fact and Responsibility Ledger/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Translation Is Not Authorship/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /AI Is an Editorial Assistant, Not a Hidden Author/ })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Writing Evidence Card", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/writing-evidence");
  const enCard = page.locator("main");
  await expect(enCard.getByRole("heading", { level: 2, name: /Preserve an Unaided Draft/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Record Feedback Uptake/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Check Asynchronous Delivery/ })).toBeVisible();
});

test("reading pages turn technical documents into verifiable delivery", async ({ page }) => {
  await page.goto("./threads/part-1/4-reading");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /保存一次未经修饰的首读/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /技术文档：把页面读成可验证的事实/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /多来源与跨文化逻辑/ })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "阅读证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./templates/reading-evidence");
  const zhCard = page.locator("main");
  await expect(zhCard.getByRole("heading", { level: 2, name: /保存未经修饰的首读/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /技术文档事实卡/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /多来源比较与真实输出/ })).toBeVisible();

  await page.goto("./en/threads/part-1/4-reading");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /Preserve an Unpolished First Pass/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Technical Documentation: Turn Pages into Verifiable Facts/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Multiple Sources and Cross-Cultural Logic/ })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Reading Evidence Card", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/reading-evidence");
  const enCard = page.locator("main");
  await expect(enCard.getByRole("heading", { level: 2, name: /Preserve an Unpolished First Pass/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Technical Documentation Fact Card/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Compare Sources and Deliver an Output/ })).toBeVisible();
});

test("listening pages turn replay into diagnosis, reconstruction, and transfer", async ({ page }) => {
  await page.goto("./threads/part-1/3-listening");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /保存一次真实首听/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /字幕是一架可以撤走的梯子/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /精听与泛听承担不同工作/ })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "听力证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./templates/listening-audit");
  const zhCard = page.locator("main");
  await expect(zhCard.getByRole("heading", { level: 2, name: /保存无字幕首听/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /使用支架阶梯/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /做延迟保持与迁移/ })).toBeVisible();
  await expect(zhCard).toContainText("播放次数不是结果");

  await page.goto("./en/threads/part-1/3-listening");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /Preserve a Real First Pass/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Captions Are a Ladder That Can Be Removed/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Intensive and Extensive Listening Have Different Jobs/ })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Listening Evidence Card", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/listening-audit");
  const enCard = page.locator("main");
  await expect(enCard.getByRole("heading", { level: 2, name: /Preserve a No-Caption First Pass/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Use the Scaffold Ladder/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Test Delayed Retention and Transfer/ })).toBeVisible();
  await expect(enCard).toContainText("Play count is not a result");
});

test("speaking pages turn accent anxiety into listener evidence and repair", async ({ page }) => {
  await page.goto("./threads/part-1/5-speaking");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /选择参考变体，不制造高低等级/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /把口音、可理解度与理解难度分开/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /互动修复不是补救，是能力/ })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "口语证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./templates/speaking-evidence");
  const zhCard = page.locator("main");
  await expect(zhCard.getByRole("heading", { level: 2, name: /保存三种无稿基线/ })).toBeVisible();
  await expect(zhCard.getByRole("heading", { level: 2, name: /保存听众实际听见的内容/ })).toBeVisible();
  await expect(zhCard).toContainText("语音识别分数会受麦克风、噪声、网络、模型和口音影响");

  await page.goto("./en/threads/part-1/5-speaking");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /Choose a Reference Variety without Creating a Hierarchy/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Separate Accentedness, Intelligibility, and Comprehensibility/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Interaction Repair Is Ability, Not Remediation/ })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Speaking Evidence Card", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/speaking-evidence");
  const enCard = page.locator("main");
  await expect(enCard.getByRole("heading", { level: 2, name: /Preserve Three Unscripted Baselines/ })).toBeVisible();
  await expect(enCard.getByRole("heading", { level: 2, name: /Preserve What the Listener Actually Heard/ })).toBeVisible();
  await expect(enCard).toContainText("Recognition scores change with microphone, noise, network, model, and accent");
});

test("job-search English maps one real role into interview and remote-work evidence", async ({ page }) => {
  await page.goto("./threads/part-1/8-job-search-english");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /CEFR 是坐标，不是录用线/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /从岗位描述提取语言地图/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /互动修复是面试能力/ })).toBeVisible();
  await expect(zhMain).toContainText("远程岗位还在测试写作");
  await expect(zhMain).toContainText("虚构项目、职责、数据、客户或结果");
  await expect(zhMain.getByRole("link", { name: "求职英语证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "口语证据卡", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "写作证据卡", exact: true }).first()).toBeVisible();

  await page.goto("./en/threads/part-1/8-job-search-english");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /CEFR Is a Coordinate, Not a Hiring Cut-off/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Extract a Language Map from the Job Description/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Repair Is Interview Ability/ })).toBeVisible();
  await expect(enMain).toContainText("Remote Roles Also Test Writing");
  await expect(enMain).toContainText("Invent projects, responsibilities, data, customers, or results");
  await expect(enMain.getByRole("link", { name: "Job-search English Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Writing Evidence Card", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Speaking Evidence Card", exact: true }).first()).toBeVisible();
});

test("job-search evidence cards preserve unfamiliar follow-ups, async writing, and integrity", async ({ page }) => {
  await page.goto("./templates/interview-evidence");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "岗位语言地图" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "听力与修复" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "十四天比较" })).toBeVisible();
  await expect(zhMain).toContainText("未经明确允许，不在真实面试中使用隐蔽实时提示");
  await expect(zhMain.getByRole("heading", { level: 2, name: "面试后关账" })).toBeVisible();

  await page.goto("./en/templates/interview-evidence");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Role Language Map" })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: "Listening and Repair" })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: "Fourteen-Day Comparison" })).toBeVisible();
  await expect(enMain).toContainText("Do not use covert real-time prompting in a live interview");
  await expect(enMain.getByRole("heading", { level: 2, name: "Post-interview Close" })).toBeVisible();
});

test("family learning protects learner agency, school reality, and children's data", async ({ page }) => {
  const source = "https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research";

  await page.goto("./threads/part-4/family-learning");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: /四个角色，不互相代替/ })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: /AI 进入家庭前，先过五道门/ })).toBeVisible();
  await expect(zhMain).toContainText("孩子拥有参与权，不等于独自承担所有责任");
  await expect(zhMain).toContainText("默认不上传姓名、学校、班级");
  await expect(zhMain.getByRole("link", { name: /UNESCO/ }).first()).toHaveAttribute("href", source);
  await expect(zhMain.getByRole("link", { name: "家庭学习共同协议", exact: true }).first()).toBeVisible();

  await page.goto("./en/threads/part-4/family-learning");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: /Four Roles That Do Not Replace One Another/ })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: /Five Gates before AI Enters the Home/ })).toBeVisible();
  await expect(enMain).toContainText("Participation does not mean the learner carries every responsibility alone");
  await expect(enMain).toContainText("Do not upload names, school, class");
  await expect(enMain.getByRole("link", { name: /UNESCO/ }).first()).toHaveAttribute("href", source);
  await expect(enMain.getByRole("link", { name: "Family Learning Agreement", exact: true }).first()).toBeVisible();
});

test("family learning agreements make the learner speak first and review adult support", async ({ page }) => {
  await page.goto("./templates/family-learning-agreement");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "分别写，再一起读" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 3, name: "学习者先写" })).toBeVisible();
  await expect(zhMain).toContainText("成人明确不做");
  await expect(zhMain).toContainText("不代写、代答或让 AI 代做");
  await expect(zhMain.getByRole("heading", { level: 2, name: /两周复盘：学习者先说/ })).toBeVisible();

  await page.goto("./en/templates/family-learning-agreement");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Write Separately, Then Read Together" })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 3, name: "Learner First" })).toBeVisible();
  await expect(enMain).toContainText("The adult explicitly will not");
  await expect(enMain).toContainText("Write or answer in the learner's place");
  await expect(enMain.getByRole("heading", { level: 2, name: /Two-Week Review: Learner Speaks First/ })).toBeVisible();
});

test("toolkit walkthrough keeps learning state outside the AI conversation", async ({ page }) => {
  await page.goto("./templates/toolkit-walkthrough");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "第一步：把状态放到会话外" })).toBeVisible();
  await expect(zhMain).toContainText("状态文件保存了跨会话的连续性；AI 只根据本次实际提供的材料继续");
  await expect(zhMain.getByRole("link", { name: "学习状态", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "读者实践回执", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/toolkit-walkthrough");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Step One: Put State outside the Conversation" })).toBeVisible();
  await expect(enMain).toContainText("The state file preserved continuity across sessions; AI continues only from the material actually supplied this time");
  await expect(enMain.getByRole("link", { name: "Learning State", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Reader Field Note", exact: true }).first()).toBeVisible();
});

test("reader field notes remain private first and retest after delay", async ({ page }) => {
  const publicForm = "https://github.com/byoungd/up/issues/new?template=reader-field-note.yml";

  await page.goto("./templates/reader-field-note");
  const zhMain = page.locator("main");
  await expect(zhMain).toContainText("公开分享始终是可选项");
  await expect(zhMain.getByRole("heading", { level: 2, name: "第二次填写：三到七天后" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "公开读者回执", exact: true })).toHaveAttribute("href", publicForm);

  await page.goto("./en/templates/reader-field-note");
  const enMain = page.locator("main");
  await expect(enMain).toContainText("Public sharing is always optional");
  await expect(enMain.getByRole("heading", { level: 2, name: "Second Pass: Three to Seven Days Later" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "public Reader Field Note", exact: true })).toHaveAttribute("href", publicForm);
});

test("evidence chain template preserves comparable stages", async ({ page }) => {
  await page.goto("./templates/evidence-chain");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "保存未经修饰的基线" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "做一次延迟保持" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据篇：变化要如何被看见", exact: true })).toBeVisible();

  await page.goto("./en/templates/evidence-chain");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Save an Unaided Baseline" })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: "Test Delayed Retention" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence: How Change Becomes Visible", exact: true })).toBeVisible();
});

test("reader guide routes return visits to the right tools", async ({ page }) => {
  await page.goto("./threads/part-0/reader-guide");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "工具箱总览", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据篇", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "家庭学习篇：把成长还给孩子", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "家庭学习共同协议", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "语法篇：让结构服务于意思", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "语法证据卡", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "口语篇：让意思清楚到达", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "口语证据卡", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "听力篇：从声音辨认到真实理解", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "听力证据卡", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "词汇篇：从眼熟到在真实任务中调用", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "词汇证据卡", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "阅读篇：从逐词翻译到观点与证据", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "阅读证据卡", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "写作篇：从初稿到可验证修订", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "写作证据卡", exact: true })).toBeVisible();

  await page.goto("./en/threads/part-0/reader-guide");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Toolkit Overview", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Family Learning: Return Ownership of Growth to the Learner", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Family Learning Agreement", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Grammar: Let Structure Serve Meaning", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Grammar Evidence Card", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Speaking: Make Meaning Arrive", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Speaking Evidence Card", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Listening: From Sound Recognition to Real Understanding", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Listening Evidence Card", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Vocabulary: From Familiarity to Retrieval in Real Tasks", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Vocabulary Evidence Card", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Reading: From Word-by-word Translation to Claims and Evidence", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Reading Evidence Card", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Writing: From Draft to Verifiable Revision", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Writing Evidence Card", exact: true })).toBeVisible();
});

test("echoes chapter separates harm, responsibility, and the next choice", async ({ page }) => {
  await page.goto("./threads/part-2/x-misc");
  const zhMain = page.locator("main");
  await expect(
    zhMain.getByRole("heading", { level: 1, name: "回声篇：不要把逃避写成浪漫" }),
  ).toBeVisible();
  await expect(zhMain.getByText(/暴力不是教育，我不该被伤害/)).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "给旧故事一张新的读法" })).toBeVisible();
  await expect(
    zhMain.getByRole("link", { name: "恢复篇：先把自己接住", exact: true }).first(),
  ).toBeVisible();

  await page.goto("./en/threads/part-2/x-misc");
  const enMain = page.locator("main");
  await expect(
    enMain.getByRole("heading", { level: 1, name: "Echoes: Do Not Romanticise Avoidance" }),
  ).toBeVisible();
  await expect(enMain.getByText(/violence is not education, and I should not have been hurt/i)).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: "Give an Old Story a New Reading" })).toBeVisible();
  await expect(
    enMain
      .getByRole("link", { name: "Recovery: Catch Yourself Before You Push Forward", exact: true })
      .first(),
  ).toBeVisible();
});

test("first-week practice turns a baseline into a reviewable next step", async ({ page }) => {
  await page.goto("./threads/part-4/week-1");
  const zhMain = page.locator("main");
  await expect(
    zhMain.getByRole("heading", { level: 1, name: "实践篇：先把第一周过完" }),
  ).toBeVisible();
  await expect(
    zhMain.getByRole("heading", { level: 2, name: "七天不求满格，只求能够回来" }),
  ).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "每周复盘模板", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "家庭学习篇", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "生活系统篇", exact: true })).toBeVisible();

  await page.goto("./en/threads/part-4/week-1");
  const enMain = page.locator("main");
  await expect(
    enMain.getByRole("heading", { level: 1, name: "Practice: Finish the First Week" }),
  ).toBeVisible();
  await expect(
    enMain.getByRole("heading", {
      level: 2,
      name: "Across Seven Days, Practise Returning Rather Than Being Perfect",
    }),
  ).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Weekly Review Template", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Family Learning", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Daily System", exact: true })).toBeVisible();
});

test("part introductions state a reading contract and hand off to the first chapter", async ({ page }) => {
  await page.goto("./threads/part-1/open-input");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 1, name: "第一部：打开输入" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "本部要回答的问题" })).toBeVisible();
  const zhFooter = page.locator(".VPDocFooter .prev-next");
  await expect(zhFooter.locator(".pager-link.prev")).toHaveAttribute(
    "href",
    "/up/threads/part-0/prologue",
  );
  await expect(zhFooter.locator(".pager-link.next")).toHaveAttribute(
    "href",
    "/up/threads/part-1/0-cefr",
  );

  await page.goto("./en/threads/part-5/long-term-action");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 1, name: "Part V: Long-Term Action" })).toBeVisible();
  await expect(enMain.getByRole("heading", { level: 2, name: "Questions for This Part" })).toBeVisible();
  await expect(
    enMain.getByRole("link", { name: "90-Day Action Plan: Return Your Life to Yourself", exact: true }),
  ).toBeVisible();
  await expect(
    enMain.getByRole("link", { name: "After Ninety Days: Let Change Remain in Life", exact: true }),
  ).toBeVisible();
  const enFooter = page.locator(".VPDocFooter .prev-next");
  await expect(enFooter.locator(".pager-link.prev")).toHaveAttribute(
    "href",
    "/up/en/threads/part-4/rhythm-and-compounding",
  );
  await expect(enFooter.locator(".pager-link.next")).toHaveAttribute(
    "href",
    "/up/en/threads/part-5/90-day-plan",
  );
});

test("post-cycle chapter turns short-term effort into a long-term handover", async ({ page }) => {
  await page.goto("./threads/part-5/after-90-days");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 1, name: "九十天以后：把改变留在生活里" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "先关账，再许愿" })).toBeVisible();
  await expect(zhMain.getByRole("heading", { level: 2, name: "目标必须有到期日与退出门" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "每周复盘", exact: true })).toBeVisible();

  await page.goto("./en/threads/part-5/after-90-days");
  const enMain = page.locator("main");
  await expect(
    enMain.getByRole("heading", { level: 1, name: "After Ninety Days: Let Change Remain in Life" }),
  ).toBeVisible();
  await expect(
    enMain.getByRole("heading", { level: 2, name: "Close the Books Before Making Another Wish" }),
  ).toBeVisible();
  await expect(
    enMain.getByRole("heading", { level: 2, name: "Every Goal Needs an Expiry Date and an Exit Gate" }),
  ).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Weekly Review", exact: true })).toBeVisible();
});

test("afterword closes the book with a return path", async ({ page }) => {
  await page.goto("./threads/part-6/afterword");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "给未来的读者" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "工具箱总览", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true })).toBeVisible();

  await page.goto("./en/threads/part-6/afterword");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "To the Reader Ahead" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Toolkit Overview", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true })).toBeVisible();
});

test("book boundary pagers follow the reading arc without duplicate manual navigation", async ({ page }) => {
  const cases = [
    {
      route: "./threads/part-0/reader-guide",
      previous: "/up/",
      next: "/up/threads/part-0/prologue",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-0/prologue",
      previous: "/up/threads/part-0/reader-guide",
      next: "/up/threads/part-1/open-input",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-1/open-input",
      previous: "/up/threads/part-0/prologue",
      next: "/up/threads/part-1/0-cefr",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-1/2-vocabulary",
      previous: "/up/threads/part-1/1-understanding",
      next: "/up/threads/part-1/grammar",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-1/grammar",
      previous: "/up/threads/part-1/2-vocabulary",
      next: "/up/threads/part-1/3-listening",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-1/7-ai",
      previous: "/up/threads/part-1/6-writing",
      next: "/up/threads/part-1/8-job-search-english",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-1/8-job-search-english",
      previous: "/up/threads/part-1/7-ai",
      next: "/up/threads/part-2/return-to-life",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-2/entrepreneurship",
      previous: "/up/threads/part-2/relationships",
      next: "/up/threads/part-3/amplify-ability",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./projects",
      previous: "/up/threads/part-3/2-ai-development-and-resource-layer",
      next: "/up/threads/part-4/practice-and-recovery",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-4/week-1",
      previous: "/up/threads/part-4/practice-and-recovery",
      next: "/up/threads/part-4/family-learning",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-4/family-learning",
      previous: "/up/threads/part-4/week-1",
      next: "/up/threads/part-4/daily-system",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-4/daily-system",
      previous: "/up/threads/part-4/family-learning",
      next: "/up/threads/part-4/rhythm-and-compounding",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-4/rhythm-and-compounding",
      previous: "/up/threads/part-4/daily-system",
      next: "/up/threads/part-5/long-term-action",
      manual: /^(?:上一篇|下一篇|下一部)[：:]/,
    },
    {
      route: "./threads/part-5/long-term-action",
      previous: "/up/threads/part-4/rhythm-and-compounding",
      next: "/up/threads/part-5/90-day-plan",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-5/90-day-plan",
      previous: "/up/threads/part-5/long-term-action",
      next: "/up/threads/part-5/book-as-proof",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-5/book-as-proof",
      previous: "/up/threads/part-5/90-day-plan",
      next: "/up/threads/part-5/after-90-days",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-5/after-90-days",
      previous: "/up/threads/part-5/book-as-proof",
      next: "/up/threads/part-6/afterword",
      manual: /^(?:上一篇|下一篇)[：:]/,
    },
    {
      route: "./threads/part-6/afterword",
      previous: "/up/threads/part-5/after-90-days",
      next: "/up/",
      manual: /^(?:上一篇|下一篇|返回首页)[：:]/,
    },
    {
      route: "./en/threads/part-0/reader-guide",
      previous: "/up/en/",
      next: "/up/en/threads/part-0/prologue",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-0/prologue",
      previous: "/up/en/threads/part-0/reader-guide",
      next: "/up/en/threads/part-1/open-input",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-1/open-input",
      previous: "/up/en/threads/part-0/prologue",
      next: "/up/en/threads/part-1/0-cefr",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-1/2-vocabulary",
      previous: "/up/en/threads/part-1/1-understanding",
      next: "/up/en/threads/part-1/grammar",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-1/grammar",
      previous: "/up/en/threads/part-1/2-vocabulary",
      next: "/up/en/threads/part-1/3-listening",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-1/7-ai",
      previous: "/up/en/threads/part-1/6-writing",
      next: "/up/en/threads/part-1/8-job-search-english",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-1/8-job-search-english",
      previous: "/up/en/threads/part-1/7-ai",
      next: "/up/en/threads/part-2/return-to-life",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-2/entrepreneurship",
      previous: "/up/en/threads/part-2/relationships",
      next: "/up/en/threads/part-3/amplify-ability",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/projects",
      previous: "/up/en/threads/part-3/2-ai-development-and-resource-layer",
      next: "/up/en/threads/part-4/practice-and-recovery",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-4/week-1",
      previous: "/up/en/threads/part-4/practice-and-recovery",
      next: "/up/en/threads/part-4/family-learning",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-4/family-learning",
      previous: "/up/en/threads/part-4/week-1",
      next: "/up/en/threads/part-4/daily-system",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-4/daily-system",
      previous: "/up/en/threads/part-4/family-learning",
      next: "/up/en/threads/part-4/rhythm-and-compounding",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-4/rhythm-and-compounding",
      previous: "/up/en/threads/part-4/daily-system",
      next: "/up/en/threads/part-5/long-term-action",
      manual: /^(?:Previous|Next|Next Part|Back to the home page):/,
    },
    {
      route: "./en/threads/part-5/long-term-action",
      previous: "/up/en/threads/part-4/rhythm-and-compounding",
      next: "/up/en/threads/part-5/90-day-plan",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-5/90-day-plan",
      previous: "/up/en/threads/part-5/long-term-action",
      next: "/up/en/threads/part-5/book-as-proof",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-5/book-as-proof",
      previous: "/up/en/threads/part-5/90-day-plan",
      next: "/up/en/threads/part-5/after-90-days",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-5/after-90-days",
      previous: "/up/en/threads/part-5/book-as-proof",
      next: "/up/en/threads/part-6/afterword",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
    {
      route: "./en/threads/part-6/afterword",
      previous: "/up/en/threads/part-5/after-90-days",
      next: "/up/en/",
      manual: /^(?:Previous|Next|Back to the home page):/,
    },
  ];

  for (const entry of cases) {
    await page.goto(entry.route);
    const footer = page.locator(".VPDocFooter .prev-next");
    await expect(footer.locator(".pager-link.prev")).toHaveAttribute("href", entry.previous);
    await expect(footer.locator(".pager-link.next")).toHaveAttribute("href", entry.next);
    const manualParagraphs = page.locator("main .vp-doc p").filter({ hasText: entry.manual });
    await expect(manualParagraphs).toHaveCount(0);
  }
});

test("prologue contract points to the current toolkit", async ({ page }) => {
  await page.goto("./threads/part-0/prologue");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "工具箱总览", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本", exact: true }).first()).toBeVisible();

  await page.goto("./en/threads/part-0/prologue");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Toolkit Overview", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger", exact: true }).first()).toBeVisible();
});

test("foundation chapters hand off to the shared evidence chain", async ({ page }) => {
  await page.goto("./threads/part-1/0-cefr");
  await expect(page.locator("main").getByRole("link", { name: "证据链模板", exact: true }).first()).toBeVisible();
  await page.goto("./threads/part-1/7-ai");
  await expect(page.locator("main").getByRole("link", { name: "证据链模板", exact: true }).first()).toBeVisible();

  await page.goto("./en/threads/part-1/0-cefr");
  await expect(page.locator("main").getByRole("link", { name: "Evidence Chain Template", exact: true }).first()).toBeVisible();
  await page.goto("./en/threads/part-1/7-ai");
  await expect(page.locator("main").getByRole("link", { name: "Evidence Chain Template", exact: true }).first()).toBeVisible();
});

test("weekly review explains the handover between core records", async ({ page }) => {
  await page.goto("./templates/weekly-review");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("heading", { level: 2, name: "写回后的交接入口" })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true })).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本", exact: true })).toBeVisible();

  await page.goto("./en/templates/weekly-review");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("heading", { level: 2, name: "Handover Links" })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true })).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger", exact: true })).toBeVisible();
});

test("90-day planning connects gates, evidence, and rhythm", async ({ page }) => {
  await page.goto("./templates/90-day-cycle");
  const zhMain = page.locator("main");
  await expect(zhMain.getByRole("link", { name: "证据链模板", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "节律账本", exact: true }).first()).toBeVisible();
  await expect(zhMain.getByRole("link", { name: "学习状态", exact: true }).first()).toBeVisible();

  await page.goto("./en/templates/90-day-cycle");
  const enMain = page.locator("main");
  await expect(enMain.getByRole("link", { name: "Evidence Chain Template", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Rhythm Ledger", exact: true }).first()).toBeVisible();
  await expect(enMain.getByRole("link", { name: "Learning State", exact: true }).first()).toBeVisible();
});

test("English chrome uses English labels and author metadata", async ({ page }, testInfo) => {
  await page.goto("./en/threads/part-1/0-cefr");
  await expect(page.locator('meta[name="author"]')).toHaveAttribute(
    "content",
    /Han Xiankai.*Li Pu/,
  );
  await expect(page.locator("#doc-outline-aria-label")).toHaveText("On this page");
  await expect(page.locator(".VPLastUpdated")).toContainText("Last updated");
  if (testInfo.project.name === "mobile-chromium") {
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "On this page" })).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: "Change language" })).toBeVisible();
  }
});

test("site chrome and missing pages follow the current language", async ({ page }) => {
  await page.goto("./threads/part-1/0-cefr");
  await expect(page.locator(".VPSkipLink")).toHaveText("跳转到正文");
  await expect(page.locator(".edit-link-button")).toHaveText("编辑本页");
  await expect(page.locator(".VPSwitchAppearance").first()).toHaveAttribute("title", /切换到.+模式/);
  await expect(page.locator("#main-nav-aria-label")).toHaveText("主导航");
  await expect(page.locator("#sidebar-aria-label")).toHaveText("侧栏导航");
  await expect(page.locator("#doc-footer-aria-label")).toHaveText("章节导航");
  await expect(page.locator(".VPNavBarHamburger")).toHaveAttribute("aria-label", "移动端导航");
  await expect(page.locator(".VPSidebarItem .caret").first()).toHaveAttribute("aria-label", "展开或收起分组");
  await expect(page.locator(".header-anchor").first()).toHaveAttribute("aria-label", /固定链接$/);

  await page.goto("./definitely-missing-reader-route");
  const zhNotFound = page.locator(".NotFound");
  await expect(zhNotFound.getByRole("heading", { name: "页面没有找到" })).toBeVisible();
  await expect(zhNotFound).toContainText("有时不是路消失了，只是这一页已经搬走");
  await expect(zhNotFound.getByRole("link", { name: "返回《人生进阶指南》首页" })).toHaveText("返回首页");

  await page.goto("./en/threads/part-1/0-cefr");
  await expect(page.locator(".VPSkipLink")).toHaveText("Skip to content");
  await expect(page.locator(".edit-link-button")).toHaveText("Edit this page");
  await expect(page.locator(".VPSwitchAppearance").first()).toHaveAttribute("title", /Switch to .+ theme/);
  await expect(page.locator("#main-nav-aria-label")).toHaveText("Main Navigation");
  await expect(page.locator("#sidebar-aria-label")).toHaveText("Sidebar Navigation");
  await expect(page.locator("#doc-footer-aria-label")).toHaveText("Pager");
  await expect(page.locator(".VPNavBarHamburger")).toHaveAttribute("aria-label", "Mobile navigation");
  await expect(page.locator(".VPSidebarItem .caret").first()).toHaveAttribute("aria-label", "Toggle section");
  await expect(page.locator(".header-anchor").first()).toHaveAttribute("aria-label", /^Permalink to/);

  await page.goto("./en/definitely-missing-reader-route");
  const enNotFound = page.locator(".NotFound");
  await expect(enNotFound.getByRole("heading", { name: "PAGE NOT FOUND" })).toBeVisible();
  await expect(enNotFound).toContainText("Sometimes the road remains after a page has moved");
  await expect(enNotFound.getByRole("link", { name: "Return to the Life Level-up Guide home page" })).toHaveText("Return home");
});

test("long-form reading progress and typography remain stable", async ({ page }, testInfo) => {
  await page.goto("./threads/part-3/2-ai-development-and-resource-layer");
  const progress = page.locator("[data-reading-progress]");
  await expect(progress).toBeVisible();
  await expect.poll(async () => Number(await progress.getAttribute("data-progress"))).toBeLessThan(5);
  const progressBox = await progress.boundingBox();
  expect(progressBox?.y).toBe(0);
  expect(progressBox?.height).toBe(2);

  const typography = await page.evaluate(() => {
    const heading = document.querySelector(".vp-doc h1");
    const paragraph = document.querySelector(".vp-doc p");
    const headingStyles = heading ? getComputedStyle(heading) : null;
    const paragraphStyles = paragraph ? getComputedStyle(paragraph) : null;
    return {
      headingSize: Number.parseFloat(headingStyles?.fontSize || "0"),
      lineHeight: Number.parseFloat(paragraphStyles?.lineHeight || "0"),
      paragraphSize: Number.parseFloat(paragraphStyles?.fontSize || "0"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(typography.lineHeight / typography.paragraphSize).toBeGreaterThanOrEqual(1.75);
  expect(typography.overflow).toBeLessThanOrEqual(1);
  expect(typography.headingSize).toBe(testInfo.project.name === "mobile-chromium" ? 32 : 42);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => Number(await progress.getAttribute("data-progress"))).toBeGreaterThan(95);
});

test("print view keeps the manuscript and removes site chrome", async ({ page }) => {
  await page.goto("./en/threads/part-4/daily-system");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator(".VPNav")).toBeHidden();
  await expect(page.locator(".VPSidebar")).toBeHidden();
  await expect(page.locator("[data-reading-progress]")).toBeHidden();
});

test("private session asset is never publicly served", async ({ request }) => {
  const response = await request.get("assets/session.json");
  expect(response.status()).toBe(404);
});

test("representative pages load every local image with descriptive alt text", async ({ page }) => {
  const routes = [
    "./",
    "./en/",
    "./projects",
    "./en/projects",
    "./threads/part-1/5-speaking",
    "./en/threads/part-1/5-speaking",
    "./threads/part-1/6-writing",
    "./en/threads/part-1/6-writing",
    "./threads/part-2/entrepreneurship",
    "./en/threads/part-2/entrepreneurship",
    "./threads/part-2/my-story",
    "./en/threads/part-2/my-story",
  ];

  for (const route of routes) {
    await page.goto(route);
    const images = page.locator("main img");
    const count = await images.count();
    expect(count, `${route} should contain at least one image`).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute("loading", "lazy");
      await expect(image).toHaveAttribute("decoding", "async");
      const source = await image.getAttribute("src");
      if (source?.startsWith("/up/assets/") && !source.endsWith(".svg")) {
        await expect(image).toHaveAttribute("width", /^\d+$/);
        await expect(image).toHaveAttribute("height", /^\d+$/);
      }
      if ((await image.getAttribute("loading")) === "lazy") await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      await expect(image).toHaveAttribute("alt", /\S+/);
      await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test("keyboard focus reaches navigation", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute("href", /#VPContent|\/up\//);
});
