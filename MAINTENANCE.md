# 内容与站点维护指南

这份文档说明《人生进阶指南》的日常维护、验证、预览、发布和回滚流程。

## 书稿结构

当前中文主线按“从提出问题到完成交付，再回到生活”的阅读弧线组织：

- 序章：建立作者立场与阅读契约；
- 终身学习与 AI：把问题、基线、练习、交付、验证和复盘连成系统；
- 基础能力：英语：用词汇、听说读写和 CEFR 目标打开输入；
- 实践、复盘与恢复：记录创业、关系、失败、身体与重新出发；
- 行动章节：用模板、项目和复测把方法变成可见证据；
- 旧文归档与词表：保留来路，但明确哪些内容只属于历史语境。

新增章节先判断它的读者任务和证据类型，再同步更新 `docs/.vitepress/navigation.mjs`、中英文入口和 frontmatter。不要只把新文章堆进“杂谈”或“扩展”栏目。

## 环境与命令

- 使用 Node.js 24，版本约束见 `.nvmrc`、`.node-version` 和 `package.json`。
- GitHub Actions 使用 Node.js 24 兼容的官方 major 版本；升级 action 前先查对应仓库的 release，升级后运行 CI、Pages 部署和外链检查。
- 首次安装运行 `npm ci`。
- 本地开发运行 `npm run docs:dev`。
- 完整校验运行 `npm run check`。正式出版前在 Java 21 环境另运行 `npm run book:validate`，用仓库固定并校验 SHA-256 的 EPUBCheck 5.3.0 检查两份 EPUB。
- 内容检查器的回归测试运行 `npm run test:content`；完整校验会先执行它，不需要启动浏览器。
- 修改 PDF 排版后，在已安装 `requirements-pdf.txt` 的 Python 环境中运行 `python3 tests/pdf_layout_test.py`；CI 会检查中文标题换行、代码块宽度及字符保全，再校验生成书稿。
- 生产构建运行 `npm run docs:build`；构建完成后会自动检查搜索索引、框架和主题脚本的原始与 gzip 体积预算。
- 本地预览生产产物运行 `npm run docs:preview`。
- 端到端测试运行 `npm run test:smoke`。

## 导航与生成文件

`docs/.vitepress/navigation.mjs` 是中英文导航的唯一来源。修改导航后运行：

```bash
npm run sync
```

该命令会同步：

- 根目录 `SUMMARY.md`；
- `docs/SUMMARY.md`；
- `docs/en/SUMMARY.md`；
- 根目录 `README.md`；
- 英文词表镜像；
- Recent Updates pages, Atom feed, worksheets, and book downloads/manifests.

社交分享图是静态 PNG：修改模板后显式运行 `npm run social:build`，再分别检查中英文图像的文字和排版。`npm run social:check` 只验证文件可读且尺寸为 1200 × 630；它不做跨平台像素比较，因为系统字体替代可能改变栅格结果。站点构建不会重写分享图。

CI 会再次生成同步清单中的文件，并阻止未提交的差异进入主分支。
同步脚本还会检查每个导航条目的字段、重复链接和 `source` 文件是否存在；路径写错时会在 `npm run check:navigation` 阶段失败。
它还会反向检查 `docs/` 下的所有公开 Markdown 是否都被中英文导航收录，避免新页面成为孤岛。
内容校验补充检查导航路由与源文件是否对应、中英文分组和阅读顺序是否一致。README 的路径转换由 `scripts/lib/readme.mjs` 共用，避免生成器和校验器各自维护不同规则。
书稿生成按导航分组的 `publication` 字段选取开卷（`frontmatter`）、正文（`body`）和附录（`appendix`），不依赖数组下标；无该字段的归档、词表等分组不进入书稿。`test:content` 会独立核对双语书稿源文件及顺序，确保网站导航插入新分组时不遗漏正文或附录。

Playwright 的 `test-results/` 和 `playwright-report/` 只保存失败诊断与 HTML 报告，属于生成文件，不是书稿内容；它们已被 Git 和 Markdown lint 忽略。测试失败后可以安全清理，再重新运行 `npm run check`。

重新构建后应重启已有 `docs:preview` 服务再做烟测。预览服务会缓存启动时的静态文件列表和响应长度；沿用旧进程可能让新脚本返回 404，或让更新后的电子书下载响应长度错误。未启动预览时，`test:smoke` 会自行构建并启动服务。
本地会话凭据文件 `docs/assets/session.json` 被精确加入 `.gitignore`，并由 VitePress 开发服务器、构建钩子和浏览器烟测共同拦截；任何本地会话文件都不得进入仓库或站点产物。

本地搜索按读者任务控制索引粒度：恢复、决定、家庭、项目和高意图章节保留 H2 级入口；第一部已经按技能拆成独立页面，工具模板、术语、归档、词表及低意图叙事归档使用页面级入口。H3 正文仍会并入所属页面或 H2，因此关键方法词不会消失。代码块不进入倒排索引，避免复制用工作表和重复示例放大下载体积。调整规则后必须运行 `npm run docs:build`，并确认 `check:bundle` 通过。
新增 `practice` 路线图与实操章节仅索引 H1/H2 标题；创业实验卡、持续行动计划、AI 评测记录三张新模板仅索引 H1 标题，以维持搜索下载体积预算。

## 内容规则

- 每个公开中文页面必须有完整英文对应页，反之亦然。
- 中英文对应页的一级至六级标题顺序必须一致；翻译可以不同，但章节结构不能漂移。
- 中英文对应页的 `updated` 日期必须一致；它表示稿件版本同步，不代替 `sources_checked` 的外部资料核验日期。
- 页面必须提供 `title`、`description` 和 `updated` frontmatter。
- `updated` 和 `sources_checked` 必须是真实的 `YYYY-MM-DD` 日历日期，且不能晚于项目时区 `Asia/Shanghai` 的当前日期；无效日期如 `2026-02-31` 会被拒绝。
- 研究结论、个人经验和推测应明确区分。
- AI 产品、模型能力、政策、价格和考试规则必须注明资料日期，并优先引用官方来源。
- 图片必须有描述场景或用途的替代文本；`image`、`photo`、`hotel` 等占位词会被内容校验拒绝，英文页面的 alt 也不得混入中文字符。图片不得包含 GPS、EXIF、IPTC 或 XMP 元数据。构建会为本地位图自动注入真实宽高以预留版面，外链图片和 SVG 不推测尺寸。
- 英文正文应优先使用英文表达；语言切换标签、书名/产品的官方原名和无法可靠翻译的专名可以保留原文，并在需要时提供英文解释。
- 站内链接使用 VitePress 干净路径，不新增 `#/` 路由；旧 hash 链接仅由兼容脚本处理。
- 内容校验会检查 Markdown 链接及引用、HTML `href`、图片 `src` / `srcset` 的本地目标，支持 `public` 下载资源、目录首页和 URL 编码文件名；代码示例与 HTML 注释不作为真实链接检查。
- 图片作为链接时，其图片文件和点击后的目标都须有效；HTML 图片的 `src` 不得为空。
- 外部素材必须登记在 `ATTRIBUTIONS.md`，无法确认再分发权限时不进入仓库。
- `check-content.mjs` 会验证归属表中明确写出的本地路径；删除或移动素材时必须同步更新登记，合法 glob 路径除外。
- `check-content.mjs` 还会检查 `docs/assets/` 中的图片和 SVG 是否被正文、配置或构建脚本引用；归属表和变更记录不会把文件伪装成正在使用的资产。
- `check-content.mjs` 会检查 Git 跟踪清单，拒绝 `.DS_Store`、`Thumbs.db` 和 `desktop.ini` 等系统元数据；本地忽略文件不会被删除。

## 章节发布门禁

每次新增或大幅改写页面，都按下面顺序检查：

1. **确定页面类型**：方法、个人叙事、项目披露、历史归档或模板；不同类型不要混用同一套证据标准。
2. **标记事实层级**：研究结论写来源与适用条件，个人经历写视角和误差，计划与推测明确标为待验证。
3. **核对动态信息**：产品、模型、价格、政策、考试规则和外部链接保留核验日期；没有重新检查时，不要把日期伪装成最新状态。
4. **完成隐私审查**：确认第三方授权、最少必要细节、删除请求和公开范围；健康、法律、财务与安全内容必须写清专业支持边界。
5. **同步双语语义**：英文页不逐字翻译，但必须保留任务、限制、证据等级和风险提示；新增页面必须加入 `navigation.mjs` 和烟测路由。
6. **运行发布命令**：按顺序执行 `npm run sync`、`npm run check`、`npm run docs:build` 和 `npm run test:smoke`，检查生成文件差异后再提交。烟测会从导航 source 自动生成中英文页面覆盖。

## 外链与日期策略

- 外链是任务入口，不是永久承诺；优先使用官方、稳定、可公开访问的页面，避免短链和带会话签名的地址。
- 链接失效时，保留原任务和难度，替换为同一来源的当前页面或明确标注“历史归档”；不要为了保留数量而堆入新链接。
- 平台返回 403、需要登录或依赖一次性签名的旧链接，不作为主要证据入口；保留事实背景时，改用稳定的本地章节或明确标注不可复查范围。
- AI 来源按变化速度分级复核：使用政策、安全公告、产品功能、地区和套餐用 30 天；协议规范、实现指南和快速变化的工作流用 60 天；稳定概念或研究背景用 120 天。AI 页面用 `source_review_interval: 30|60|120` 声明时效；没有该字段时默认 120 天。
- `threads/` 下文件名以 `ai-` 或数字加 `-ai` 开头的 AI 章节，双语均必须声明 `sources_checked`；新增章节会自动纳入检查。其他页面一旦声明该字段，同样按照页面的 `source_review_interval` 检查日期；纯工作表无须为了通过检查而虚构核验日期。
- `updated` 表示稿件文字被修改，`sources_checked` 表示外部资料被核验，两者不能互相替代。
- 公开文章、截图和个人故事只提供线索，不自动成为独立测评、客户案例或收益证明。

## 分支管理

- `main` 是唯一的集成与部署主分支。新工作从最新 `origin/main` 创建短期 `codex/<任务名>` 分支，通过 PR 合入；避免长期平行维护内容主线。
- 合并前先更新远端引用，检查与当前 `main` 的实际差异和三方合并结果，解决冲突后重新运行对应检查。旧分支曾通过的 CI 不能代替当前合并结果的验证。
- 保留尚有独立价值的工作，按功能审查和整合。截至 2026-10-03，远端除 `main` 外仅保留 `codex/project-audit-20260909`；其草稿 [PR #199](https://github.com/byoungd/up/pull/199) 仍有冲突，应选择性整合有用改动，保留主线后续内容与修复，不用过期分支整树覆盖当前书稿。
- 删除分支前，同时检查提交祖先关系与补丁内容。已合并分支须确认提交包含在 `main`；经 squash、cherry-pick 或选择性整合的分支，须确认有用改动已保留且剩余差异有明确处理结论，并检查开放 PR 与发布引用。不能仅凭分支年龄或名称删除。
- 清理远端分支后运行 `git fetch origin --prune`，同步清理失效的本地远端引用；本地工作分支确认无未保留工作后再删除。

旧 `master` 分支已在本次清理中删除，不再承担发布职责。历史记录中的 `master`、`origin/master` 或旧部署配置只描述当时状态，不应据此恢复旧分支或修改当前发布源。

## 发布流程

1. 运行 `npm ci`、`npm run check`、`npm run book:validate`、`npm run docs:build` 和 `npm run test:smoke`。PDF 命令使用安装了 `requirements-pdf.txt` 的 Python；需要选择特定解释器时设置 `PDF_PYTHON`。
2. 在拉取请求的 `site-preview` 构建产物中检查待发布站点。
3. 合并到 `main` 后，由 GitHub Pages Actions 工作流部署。
4. 部署后检查中文首页、英文首页、代表性章节、搜索、语言切换和旧 hash 跳转。

仓库的 Pages 发布源必须保持为 **GitHub Actions**，不要切回按分支发布的 Legacy 模式（历史配置为 `master:/docs`）；`deploy.yml` 会在发布后请求中文首页、英文首页和代表性章节，并校验每个入口的期望标题与当前提交的 `build-revision`。正文使用 VitePress clean URLs，文章入口按无尾斜杠路径检查；任何公开入口返回非成功状态、错误页面或旧构建标识都会使部署失败。

Pages 发布组启用 `cancel-in-progress`：快速连续提交时，旧的构建或部署会被取消，只允许最新提交继续发布。需要回看旧版本时，应从 Git 历史或 CI 构建产物查看，不要依赖线上页面暂时保留旧内容。

GitHub Actions 不包含分析脚本、广告或用户追踪器。

## 定期维护

- 每周定时任务检查外链；Douban、`token.love` 和 `ku0.com` 由浏览器 User-Agent 的独立 `curl` 探针检查，Lychee 负责其余外链。第三方站点短暂失败不会阻塞普通提交，但会留下可追踪的自动 issue。
- 外链检查先提取 Markdown 中的 HTTP/HTTPS 地址，避免把站内路由作为文件路径；本站 GitHub Pages 由部署检查负责。403/418/429 表示自动探测受限，不能据此确认页面内容有效；404 等失败仍会创建 issue。
- 每月至少检查一次 AI 章节；复核日期超过页面声明的 `source_review_interval` 会被内容校验阻止。
- 每季度检查依赖、安全公告、素材授权和无障碍回归。
- 合并图片前先运行 `npm run assets:sanitize`，再执行完整校验。

## 搜索数据与发布节奏

双语专题、查询意图、支持页面和复核日期维护在 [增长内容地图](GROWTH_CONTENT_MAP.md)；新增或改造页面先更新地图，再进入 Search Console 查询缺口复核。

验证和查询 Search Console 数据均由站点所有者本人执行。当前仓库未记录验证成功状态。所有者应添加以下 URL-prefix 属性：

`byoungd.github.io/up/`

只有控制台显示验证成功后才能写为已验证；不要向仓库提交验证令牌或账号凭据。

验证后先确认公开 sitemap 可访问，再从 Search Console 的 Sitemaps 报告提交以下地址：

`byoungd.github.io/up/sitemap.xml`

记录提交日期、报告状态、最后读取时间、发现的 URL 数和错误数。当前地址来自 VitePress 的 sitemap 配置与构建产物；站点 base 或域名变更时，先核对实际部署地址。

建立首个搜索基线时，在 Search Console 的“效果 / 搜索结果”报告选择 Web 搜索，并选取最近一个已完整处理的连续 28 天作为基线，记录起止日期。保存总点击、总展示、平均点击率、平均排名，并导出查询和页面维度数据；同时记下属性 URL、搜索类型、导出日期、数据来源和当期发布/改版日期。之后每月以相邻的完整 28 天区间比较，并保留原始导出；不要把点击或排名变化直接归因于单次文案改动，也不要把 Search Console 搜索数据描述为站内行为分析。所有者尚未完成验证前，把基线状态记为“待验证”，不要填造数据。

`main` 合并后继续按现有 GitHub Pages 工作流持续部署；正式书稿 Release 按季度整理一次，或在季度之间出现重要双语内容更新时提前发布。创建 Release 前，确认 EPUB/PDF 与 manifest 同步，并通过 `npm run check`、`npm run book:validate`、`npm run docs:build` 和 `npm run test:smoke`；Release 说明写明版本日期、主要变化和出版范围，附件使用该次构建的 EPUB/PDF，附上对应 manifest 或 SHA-256。未完成整套校验时不发布正式书稿 Release。

每季度首周记录一次仓库公开指标，并把带日期的表格追加到 [项目复核记录](PROJECT_REVIEW.md)，作为独立快照，不覆盖旧值。记录仓库页面显示的 Stars、Forks、Watchers、公开 Release 数，以及开放 Issue 和 Pull Request 数；同时记下采集日期（含时区）和来源页面：仓库首页 `github.com/byoungd/up`、Releases `github.com/byoungd/up/releases`、开放 Issues `github.com/byoungd/up/issues?q=is%3Aissue%20is%3Aopen`、开放 Pull Requests `github.com/byoungd/up/pulls?q=is%3Apr%20is%3Aopen`。累计指标与当日开放项口径不同，需分别比较；单季变化只用于观察，不作为改版带来增长的因果证明。每次追加一行，沿用以下字段：

| 季度 | 采集时间（Asia/Shanghai） | Stars | Forks | Watchers | 开放 Issues | 开放 PR | Release（累计 / 本季度） | 来源 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| YYYY-Qn | YYYY-MM-DD HH:mm |  |  |  |  |  |  | 仓库首页、Releases、Issues、Pull Requests |

## 回滚

迁移前的 Docsify 版本保留在 Git 历史提交 `42e6faa` 中，包括原 `docs/index.html`。若新站点发布后出现路径或索引故障，优先在 GitHub Pages 中重新运行上一次成功部署；需要恢复旧站时，从该提交创建临时回滚分支并部署其 `docs/` 目录，不覆盖当前内容分支。

回滚后应保留故障页面、URL、浏览器和时间信息，再修复 VitePress 构建并通过预览产物验证后重新发布。
