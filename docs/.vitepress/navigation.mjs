const page = (text, link, source = `${link.replace(/^\//, "")}.md`) => ({
  text,
  link,
  source,
});

export const zhNavigation = [
  {
    text: "开始",
    items: [
      page("人生进阶指南", "/", "README.md"),
      page("阅读指南：把书放回生活", "/threads/part-0/reader-guide"),
      page("序章：先不要急着改变人生", "/threads/part-0/prologue"),
      page("术语与方法索引", "/reference/glossary"),
      page("工具箱总览", "/templates/toolkit"),
    ],
  },
  {
    text: "第一部：打开输入",
    items: [
      page("第一部导语：打开输入", "/threads/part-1/open-input"),
      page("CEFR 目标与自测", "/threads/part-1/0-cefr"),
      page("1. 认知与训练原则", "/threads/part-1/1-understanding"),
      page("2. 词汇系统", "/threads/part-1/2-vocabulary"),
      page("语法篇：让结构服务于意思", "/threads/part-1/grammar"),
      page("3. 听力训练", "/threads/part-1/3-listening"),
      page("4. 阅读训练", "/threads/part-1/4-reading"),
      page("5. 口语训练", "/threads/part-1/5-speaking"),
      page("6. 写作训练", "/threads/part-1/6-writing"),
      page("7. 用 AI 学英语", "/threads/part-1/7-ai"),
      page("8. 求职英语与远程协作", "/threads/part-1/8-job-search-english"),
    ],
  },
  {
    text: "第二部：把自己放回生活",
    items: [
      page("第二部导语：把自己放回生活", "/threads/part-2/return-to-life"),
      page("我的故事", "/threads/part-2/my-story"),
      page("叙事与证据篇：不把经历写成命运", "/threads/part-2/narrative-and-evidence"),
      page("回声篇：不要把逃避写成浪漫", "/threads/part-2/x-misc"),
      page("恢复篇：先把自己接住", "/threads/part-2/recovery"),
      page("选择篇：在不确定中做决定", "/threads/part-2/decision"),
      page("关系篇：在关系中成为成年人", "/threads/part-2/relationships"),
      page("创业篇：从野心到使命", "/threads/part-2/entrepreneurship"),
    ],
  },
  {
    text: "第三部：借工具放大能力",
    items: [
      page("第三部导语：借工具放大能力", "/threads/part-3/amplify-ability"),
      page("使用 AI 学习一切", "/threads/part-3/1-ai-learning"),
      page("注意力篇：把注意力还给自己", "/threads/part-3/3-attention-and-judgment"),
      page("作品篇：把学会变成做出", "/threads/part-3/4-artifacts-and-delivery"),
      page("证据篇：变化要如何被看见", "/threads/part-3/5-evidence-and-transfer"),
      page("AI 开发与资源层创业", "/threads/part-3/2-ai-development-and-resource-layer"),
      page("作者项目与现实实践", "/projects"),
    ],
  },
  {
    text: "第四部：实践与恢复",
    items: [
      page("第四部导语：实践与恢复", "/threads/part-4/practice-and-recovery"),
      page("实践篇：先把第一周过完", "/threads/part-4/week-1"),
      page("家庭学习篇：把成长还给孩子", "/threads/part-4/family-learning"),
      page("生活系统篇：把改变安放在日子里", "/threads/part-4/daily-system"),
      page("节律篇：让小事穿过时间", "/threads/part-4/rhythm-and-compounding"),
    ],
  },
  {
    text: "第五部：行动与长期改变",
    items: [
      page("第五部导语：行动与长期改变", "/threads/part-5/long-term-action"),
      page("行动篇：九十天，把生活交还给自己", "/threads/part-5/90-day-plan"),
      page("案例篇：让这本书证明它的方法", "/threads/part-5/book-as-proof"),
      page("九十天以后：把改变留在生活里", "/threads/part-5/after-90-days"),
    ],
  },
  {
    text: "后记",
    items: [
      page("进阶不是离开原来的自己", "/threads/part-6/afterword"),
    ],
  },
  {
    text: "工具箱",
    items: [
      page("工具箱实战：AI 跨会话学习", "/templates/toolkit-walkthrough"),
      page("证据链模板", "/templates/evidence-chain"),
      page("读者实践回执", "/templates/reader-field-note"),
      page("家庭学习共同协议", "/templates/family-learning-agreement"),
      page("学习状态模板", "/templates/learning-state"),
      page("节律账本模板", "/templates/rhythm-ledger"),
      page("每周复盘模板", "/templates/weekly-review"),
      page("英语能力诊断", "/templates/english-diagnostic"),
      page("求职英语证据卡", "/templates/interview-evidence"),
      page("语法证据卡", "/templates/grammar-evidence"),
      page("词汇证据卡", "/templates/vocabulary-audit"),
      page("听力证据卡", "/templates/listening-audit"),
      page("阅读证据卡", "/templates/reading-evidence"),
      page("口语证据卡", "/templates/speaking-evidence"),
      page("写作证据卡", "/templates/writing-evidence"),
      page("九十日行动总表", "/templates/90-day-cycle"),
      page("作品简报与交付卡", "/templates/artifact-brief"),
      page("AI 任务简报", "/templates/ai-task-brief"),
      page("AI 学习记录", "/templates/ai-learning-log"),
      page("AI 经历案例复盘", "/templates/ai-case-review"),
      page("AI 项目评分卡", "/templates/ai-project-scorecard"),
      page("生活进阶工作表", "/templates/life-practice-toolkit"),
    ],
  },
  {
    text: "旧文归档",
    items: [
      page("归档说明", "/threads/archive/", "threads/archive/README.md"),
      page("终于有了一个写字的地方", "/threads/archive/a-place-to-write"),
      page("简单介绍下去年和现在的我", "/threads/archive/last-year-and-now"),
      page("到底该不该扶老人", "/threads/archive/help-the-elderly"),
      page("博客临时更名公告", "/threads/archive/blog-renaming-notice"),
    ],
  },
  {
    text: "词表",
    items: [
      ...["Common", "Go", "Java", "JavaScript", "PHP", "Prompt", "Python", "Swift", "Rust", "VibeCoding"].map((name) =>
        page(name === "VibeCoding" ? "Vibe Coding" : name, `/threads/word-list/${name}`),
      ),
    ],
  },
];

export const enNavigation = [
  {
    text: "Start Here",
    items: [
      page("Life Level-up Guide", "/en/", "en/README.md"),
      page("Reader's Guide: Put the Book Back into Life", "/en/threads/part-0/reader-guide"),
      page("Prologue: Do Not Rush to Change Your Life", "/en/threads/part-0/prologue"),
      page("Glossary of Terms and Methods", "/en/reference/glossary"),
      page("Toolkit Overview", "/en/templates/toolkit"),
    ],
  },
  {
    text: "Part I: Open Input",
    items: [
      page("Part I Introduction: Open Input", "/en/threads/part-1/open-input"),
      page("CEFR Goals and Self-check", "/en/threads/part-1/0-cefr"),
      page("1. Learning Principles", "/en/threads/part-1/1-understanding"),
      page("2. Vocabulary", "/en/threads/part-1/2-vocabulary"),
      page("Grammar: Let Structure Serve Meaning", "/en/threads/part-1/grammar"),
      page("3. Listening", "/en/threads/part-1/3-listening"),
      page("4. Reading", "/en/threads/part-1/4-reading"),
      page("5. Speaking", "/en/threads/part-1/5-speaking"),
      page("6. Writing", "/en/threads/part-1/6-writing"),
      page("7. Learning English with AI", "/en/threads/part-1/7-ai"),
      page("8. Job-search English and Remote Work", "/en/threads/part-1/8-job-search-english"),
    ],
  },
  {
    text: "Part II: Return to Life",
    items: [
      page("Part II Introduction: Return to Life", "/en/threads/part-2/return-to-life"),
      page("My Story", "/en/threads/part-2/my-story"),
      page("Narrative and Evidence: Do Not Turn Experience into Fate", "/en/threads/part-2/narrative-and-evidence"),
      page("Echoes: Do Not Romanticise Avoidance", "/en/threads/part-2/x-misc"),
      page("Recovery: Catch Yourself Before You Push Forward", "/en/threads/part-2/recovery"),
      page("Decision-Making: Choosing Under Uncertainty", "/en/threads/part-2/decision"),
      page("Relationships: Becoming an Adult in Connection", "/en/threads/part-2/relationships"),
      page("Entrepreneurship: From Ambition to Purpose", "/en/threads/part-2/entrepreneurship"),
    ],
  },
  {
    text: "Part III: Amplify Ability",
    items: [
      page("Part III Introduction: Amplify Ability", "/en/threads/part-3/amplify-ability"),
      page("Learning Anything with AI", "/en/threads/part-3/1-ai-learning"),
      page("Attention: Return Your Attention to Yourself", "/en/threads/part-3/3-attention-and-judgment"),
      page("Artifacts: Turn Learning into Something Made", "/en/threads/part-3/4-artifacts-and-delivery"),
      page("Evidence: How Change Becomes Visible", "/en/threads/part-3/5-evidence-and-transfer"),
      page(
        "AI Development and Resource-layer Business",
        "/en/threads/part-3/2-ai-development-and-resource-layer",
      ),
      page("Author Projects and Practice", "/en/projects"),
    ],
  },
  {
    text: "Part IV: Practice and Recovery",
    items: [
      page("Part IV Introduction: Practice and Recovery", "/en/threads/part-4/practice-and-recovery"),
      page("Practice: Finish the First Week", "/en/threads/part-4/week-1"),
      page("Family Learning: Return Ownership to the Learner", "/en/threads/part-4/family-learning"),
      page("Daily System: Put Change into the Day", "/en/threads/part-4/daily-system"),
      page("Rhythm: Let Small Things Travel Through Time", "/en/threads/part-4/rhythm-and-compounding"),
    ],
  },
  {
    text: "Part V: Long-Term Action",
    items: [
      page("Part V Introduction: Long-Term Action", "/en/threads/part-5/long-term-action"),
      page("90-Day Action Plan", "/en/threads/part-5/90-day-plan"),
      page("Case Study: Let the Book Prove Its Method", "/en/threads/part-5/book-as-proof"),
      page("After Ninety Days: Let Change Remain in Life", "/en/threads/part-5/after-90-days"),
    ],
  },
  {
    text: "Afterword",
    items: [
      page("Progress Is Not Leaving Yourself Behind", "/en/threads/part-6/afterword"),
    ],
  },
  {
    text: "Toolkit",
    items: [
      page("Toolkit Walkthrough: AI Learning across Sessions", "/en/templates/toolkit-walkthrough"),
      page("Evidence Chain", "/en/templates/evidence-chain"),
      page("Reader Field Note", "/en/templates/reader-field-note"),
      page("Family Learning Agreement", "/en/templates/family-learning-agreement"),
      page("Learning State", "/en/templates/learning-state"),
      page("Rhythm Ledger", "/en/templates/rhythm-ledger"),
      page("Weekly Review", "/en/templates/weekly-review"),
      page("English Diagnostic", "/en/templates/english-diagnostic"),
      page("Job-search English Evidence Card", "/en/templates/interview-evidence"),
      page("Grammar Evidence Card", "/en/templates/grammar-evidence"),
      page("Vocabulary Evidence Card", "/en/templates/vocabulary-audit"),
      page("Listening Evidence Card", "/en/templates/listening-audit"),
      page("Reading Evidence Card", "/en/templates/reading-evidence"),
      page("Speaking Evidence Card", "/en/templates/speaking-evidence"),
      page("Writing Evidence Card", "/en/templates/writing-evidence"),
      page("90-Day Cycle Map", "/en/templates/90-day-cycle"),
      page("Artifact Brief and Delivery Card", "/en/templates/artifact-brief"),
      page("AI Task Brief", "/en/templates/ai-task-brief"),
      page("AI Learning Log", "/en/templates/ai-learning-log"),
      page("AI Case Review", "/en/templates/ai-case-review"),
      page("AI Project Scorecard", "/en/templates/ai-project-scorecard"),
      page("Life Practice Toolkit", "/en/templates/life-practice-toolkit"),
    ],
  },
  {
    text: "Archive",
    items: [
      page("Archive Notes", "/en/threads/archive/", "en/threads/archive/README.md"),
      page("A Place to Write", "/en/threads/archive/a-place-to-write"),
      page("Last Year and Now", "/en/threads/archive/last-year-and-now"),
      page("Should We Help an Elderly Stranger?", "/en/threads/archive/help-the-elderly"),
      page("Temporary Blog Renaming Notice", "/en/threads/archive/blog-renaming-notice"),
    ],
  },
  {
    text: "Word Lists",
    items: [
      ...["Common", "Go", "Java", "JavaScript", "PHP", "Prompt", "Python", "Swift", "Rust", "VibeCoding"].map((name) =>
        page(name === "VibeCoding" ? "Vibe Coding" : name, `/en/threads/word-list/${name}`),
      ),
    ],
  },
];

export function publicationSections(navigation, { frontMatter = "", appendices = "" } = {}) {
  const [start, ...rest] = navigation;
  return [
    { text: frontMatter, items: start.items.slice(1, 3) },
    ...rest.slice(0, 6),
    {
      text: appendices,
      items: [...start.items.slice(3), ...navigation[7].items],
    },
  ];
}

export function publicationChapterCount(navigation) {
  return publicationSections(navigation).reduce((total, section) => total + section.items.length, 0);
}

const normalizeRoute = (link) => link.replace(/^\/+|\/+$/g, "");
const zhRoutes = zhNavigation.flatMap(({ items }) => items.map(({ link }) => normalizeRoute(link)));
const enRoutes = new Set(enNavigation.flatMap(({ items }) => items.map(({ link }) => normalizeRoute(link))));

export const bilingualRoutePairs = zhRoutes.map((zh) => {
  const en = zh ? `en/${zh}` : "en";
  if (!enRoutes.has(en)) throw new Error(`缺少英文对应路由: /${zh}`);
  return { zh, en };
});

const collapsedGroups = new Set(["工具箱", "旧文归档", "词表", "Toolkit", "Archive", "Word Lists"]);

export function toSidebar(groups) {
  return groups.map(({ text, items }) => ({
    text,
    collapsed: collapsedGroups.has(text),
    items: items.map(({ text: itemText, link }) => ({ text: itemText, link })),
  }));
}
