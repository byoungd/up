# Issue 队列与分类

## 当前队列快照

截至 2026-10-19，通过 GitHub CLI 只读检查：28 个公开未关闭 issue、1 个开放 PR（#199，为草稿）；28 个 issue 均没有标签。#199 最近更新于 2026-10-03，GitHub 显示其存在冲突（`CONFLICTING`）。该快照不包含私密安全报告，也不代表维护者已回复或解决任何条目。

Issue 表单使用仓库当前存在的 GitHub 标签：`bug`、`enhancement` 和 `broken-link`。表单标题前缀保留更细的分类，便于维护者检索；GitHub 标签仅用于粗分，不代替阅读完整报告。

历史分类复核：2026-08-16

下列建议来自当时对 31 个公开未关闭 issue 的仓库内复核，不代表当前队列数量，也不代表已经在 GitHub 上改标签、回复或关闭。维护者应先阅读完整讨论，再执行关闭、锁定等操作。涉及作者或第三方关系的问题遵循最少必要原则，不通过补充私人细节来满足好奇心。

## 建议分类

| 表单标题前缀 | GitHub 标签 | 处理原则 |
| --- | --- | --- |
| `[Content]`、`[Site]`、`[Translation]` | `bug` | 核对复现、来源和影响，再修复或说明依据 |
| `[Method]`、`[Reader]` | `enhancement` | 按读者价值、维护成本、证据和隐私风险评估 |
| `[Link]` | `broken-link` | 核对目标与官方替代地址 |
| 安全或隐私问题 | 不公开加标签 | 使用 `SECURITY.md` 的私下报告渠道 |

这套标签较粗，是因为仓库当前没有更细的分类标签。若维护者日后在 GitHub 创建专用标签，应同时更新所有 Issue 表单和本表，再用表单预览或测试 issue 核验。

## 内容请求

| Issue | 主题 | 建议动作 |
| --- | --- | --- |
| [#173](https://github.com/byoungd/up/issues/173) | 初中学习者的方法 | 指向 CEFR 自测，并补充未成年人材料选择和家长反馈边界 |
| [#172](https://github.com/byoungd/up/issues/172) | 工具使用与故事更新 | 指向学习状态模板；将内容更新请求与工具问题分开处理 |
| [#151](https://github.com/byoungd/up/issues/151) | 学好英语 | 请求当前水平、目标场景和期限，避免给无条件通用计划 |
| [#134](https://github.com/byoungd/up/issues/134) | 面试英语标准 | 指向 CEFR 与口语任务，用岗位样本而非单一等级回答 |
| [#110](https://github.com/byoungd/up/issues/110) | 语法基础学习 | 指向阅读、写作和反馈章节，建议用真实输出诊断高频错误 |
| [#108](https://github.com/byoungd/up/issues/108) | 内容更新位置 | 指向站点导航、归档和 CHANGELOG，不承诺个人故事更新时间 |

## 个人问答

| Issue | 主题 | 建议动作 |
| --- | --- | --- |
| [#191](https://github.com/byoungd/up/issues/191) | 英语学习 | 信息不足，回复诊断模板并请求一个具体任务 |
| [#158](https://github.com/byoungd/up/issues/158) | 感谢分享 | 致谢后关闭，避免长期占用问题队列 |
| [#153](https://github.com/byoungd/up/issues/153) | 致敬 | 致谢后关闭 |
| [#128](https://github.com/byoungd/up/issues/128) | 面向作者的简短留言 | 视为社区留言，简短回应后关闭 |
| [#115](https://github.com/byoungd/up/issues/115) | 支持与个人感想 | 视为社区反馈，致谢后关闭 |
| [#101](https://github.com/byoungd/up/issues/101) | 阅读故事后的反馈 | 视为社区反馈，致谢后关闭 |
| [#86](https://github.com/byoungd/up/issues/86) | 写作反馈 | 视为社区反馈，致谢后关闭 |
| [#3](https://github.com/byoungd/up/issues/3) | 读者经验分享 | 保留为历史讨论，或转入 Discussions 后关闭 issue |

## 过期问题

| Issue | 主题 | 建议动作 |
| --- | --- | --- |
| [#116](https://github.com/byoungd/up/issues/116) | 旧页面跳转混乱 | 用 VitePress 干净路径和旧 hash 桥接复测，确认后以已修复关闭 |
| [#104](https://github.com/byoungd/up/issues/104) | 旧云单词本工具 | 说明当前不再以单一工具为中心，指向词汇工作流后关闭 |
| [#66](https://github.com/byoungd/up/issues/66) | 导出 MOBI | MOBI 工作流已过时；如仍有需求，应重新评估 EPUB，而非直接续做旧方案 |

## 功能建议

| Issue | 主题 | 建议动作 |
| --- | --- | --- |
| [#190](https://github.com/byoungd/up/issues/190) | AI 跨会话跟踪学习状态 | 已由学习状态、每周复盘和恢复提示词覆盖；邀请验证后关闭 |
| [#178](https://github.com/byoungd/up/issues/178) | 医疗英语工具推荐 | 先核对授权、隐私、维护状态和非赞助关系，再决定是否进入外部资源表 |
| [#131](https://github.com/byoungd/up/issues/131) | 单词与构词 | 评估为词汇篇的构词法补充，要求示例和可靠来源 |
| [#99](https://github.com/byoungd/up/issues/99) | VuePress 在线文档 | 当前 VitePress 迁移已覆盖核心诉求，致谢并说明新版后关闭 |
| [#52](https://github.com/byoungd/up/issues/52) | 区分美式与英式英语 | 作为发音和用法标注增强评估，不把一种变体写成唯一标准 |

## 隐私请求

| Issue | 主题 | 建议动作 |
| --- | --- | --- |
| [#185](https://github.com/byoungd/up/issues/185) | 作者关系状态 | 不补充私人信息，说明内容边界后关闭并锁定讨论 |
| [#168](https://github.com/byoungd/up/issues/168) | 作者关系结局 | 不补充私人信息，说明内容边界后关闭并锁定讨论 |
| [#159](https://github.com/byoungd/up/issues/159) | 追问故事人物身份 | 不确认身份；旧首页相关文字已移除，关闭并锁定讨论 |
| [#140](https://github.com/byoungd/up/issues/140) | 追问删除的个人故事 | 不恢复未经授权的第三方内容，说明归档原则后关闭 |
| [#124](https://github.com/byoungd/up/issues/124) | 追问第三方故事 | 不补充第三方信息，关闭并锁定讨论 |
| [#121](https://github.com/byoungd/up/issues/121) | 催更第三方故事 | 不补充第三方信息，关闭并锁定讨论 |
| [#105](https://github.com/byoungd/up/issues/105) | 对私人关系的评论 | 不继续公开讨论，关闭 |
| [#88](https://github.com/byoungd/up/issues/88) | 对故事人物的评论 | 不继续公开讨论，关闭 |
| [#68](https://github.com/byoungd/up/issues/68) | 对私人关系的评论 | 不继续公开讨论，关闭 |

发现图片、身份或其他隐私泄露时，不应新建公开 issue；请按 `SECURITY.md` 使用私下报告渠道。
