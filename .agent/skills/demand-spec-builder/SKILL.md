---
name: demand-spec-builder
description: 需求规格构建器。将模糊需求转化为标准化、可量化、可执行的需求规格说明书，包括能力定义、约束解析、实现契约、验收标准。集成brainstorming、office-hours、CEO review最佳实践。
status: active
source: github:mattpocock/skills + distilled:everything-claude-code + superpowers + gstack
github_url: https://github.com/mattpocock/skills
distilled_from:
  - https://github.com/affaan-m/everything-claude-code (product-capability, eval-harness)
  - https://github.com/obra/superpowers (brainstorming, spec self-review, HARD-GATE)
  - https://github.com/garrytan/gstack (office-hours, plan-ceo-review)
last_updated: 2026-05-01
---

# 需求规格构建器（DemandSpecBuilder）

## 🎯 技能定位

将初始需求转化为标准化需求规格说明书，暴露隐藏的约束、不变量和接口定义。

**核心能力来源**：
- 基础模板：mattpocock/skills (to-prd)
- 增强能力：everything-claude-code (product-capability, eval-harness)

## 🔧 执行流程

### Phase 0: 强制门禁检查（HARD-GATE）

**来自superpowers的HARD-GATE机制**：

<HARD-GATE>
在需求规格未完成用户批准前，**绝对禁止**进入实现阶段。
无论需求看起来多简单（"只是个todo列表"、"就改个按钮"），都必须完整走通本流程。
"简单"需求是未检验假设导致最多浪费工作的地方。
规格可以很短（几句话），但**必须**呈现并获得用户批准。
</HARD-GATE>

**反模式**："这太简单了，不需要规格"
- ❌ 每个需求都必须走这个流程
- ✅ 简单需求的规格可以很短，但必须呈现并获批

### Phase 1: 需求理解与重述（+office-hours 6个强制问题）

**核心原则**（蒸馏自product-capability）：
- ❌ 不虚构产品真相，明确标记未解决的问题
- ✅ 分离用户可见承诺与实现细节
- ✅ 区分固定策略、架构偏好和待决策项
- ✅ 如与现有约束冲突，明确指出而非模糊处理

**1.1 探索代码库**（来自to-prd原版）

如果尚未了解，先探索repo理解当前代码库状态。
使用项目的领域词汇，尊重相关区域的ADRs（架构决策记录）。

**1.2 office-hours 6个强制问题**（蒸馏自gstack/office-hours）

**必须**在需求文档中回答以下6个问题（Startup Mode）：

| # | 问题 | 目的 | 示例 |
|---|------|------|------|
| 1 | **Who has this pain?** 谁有这个痛点？ | 验证真实需求，不是假设 | "食品检测机构的实验室管理员，每天处理200+样本，当前手动录入Excel" |
| 2 | **How do they solve it today?** 他们现在怎么解决？ | 了解现有方案和痛点 | "Excel表格+微信群沟通，容易遗漏和出错" |
| 3 | **What's your wedge?** 你的切入点是什么？ | 最窄的可交付功能 | "先做样本录入自动化，不做完整的实验室管理" |
| 4 | **Why you?** 为什么是你做？ | 独特优势和资源 | "已有检测数据API，3天内可交付MVP" |
| 5 | **What's the risk?** 最大风险是什么？ | 识别关键风险 | "检测机构不愿意改变现有流程" |
| 6 | **How do you learn?** 如何快速验证？ | 学习/验证策略 | "先找2家友好用户试用1周，收集反馈" |

⚠️ **如果这6个问题回答薄弱，需求将会偏离目标**

**1.3 压缩需求为一个精确陈述**

```
CAPABILITY（能力定义）
- 用户或操作员是谁
- 交付后有什么新能力  
- 什么结果会因为此而改变
```

⚠️ **如果这个陈述薄弱，实现将会偏离目标**

### Phase 2: 多方案探索（brainstorming）

**来自superpowers/brainstorming的多方案探索**：

**2.1 评估需求规模**
- 如果需求涉及多个独立子系统（如"构建包含聊天、文件存储、计费、分析的平台"），**立即标记**
- 不要花时间在细节上优化需要首先分解的项目
- 帮助用户分解为子项目：独立部分是什么？如何关联？构建顺序？

**2.2 提出2-3个方案**（带权衡分析）

对于适当规模的需求，提出2-3个不同方案：

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| 方案A | ... | ... | ⭐⭐⭐ |
| 方案B | ... | ... | ⭐⭐ |
| 方案C | ... | ... | ⭐ |

**2.3 给出你的推荐**
- 说明你推荐哪个方案及原因
- 引导用户选择，但尊重用户决定

**2.4 勾勒主要模块**（来自to-prd原版）

勾勒需要构建或修改的主要模块以完成实现。
**主动寻找机会提取深度模块**（深模块 vs 浅模块）：
- 深模块：封装大量功能，接口简单，很少变化，可独立测试
- 浅模块：功能少，接口复杂，变化频繁

**2.5 与用户确认**
- 确认方案是否符合用户期望
- 确认模块划分是否合理
- 确认哪些模块需要编写测试

### Phase 3: 能力约束解析（+CEO review 10维度审查）

提取必须在实现前成立的约束条件（这些通常只存在于高级工程师记忆中）：

| 约束类型 | 示例 | 重要性 |
|---------|------|--------|
| 业务规则 | "只有付费用户可以导出" | CRITICAL |
| 范围边界 | "不包含移动端适配" | HIGH |
| 不变量 | "用户数据永不删除" | CRITICAL |
| 信任边界 | "第三方API不可信" | HIGH |
| 数据归属 | "用户拥有其内容" | MEDIUM |
| 生命周期转换 | "草稿→发布→归档" | HIGH |
| 滚回/迁移要求 | "必须支持灰度发布" | HIGH |
| 失败恢复预期 | "网络中断后自动重试" | MEDIUM |

**3.1 CEO review 10维度审查**（蒸馏自gstack/plan-ceo-review）

对需求进行10个维度的严格审查：

| 维度 | 检查项 | 失败信号 |
|------|--------|----------|
| 1. 战略对齐 | 是否符合产品愿景？ | "这是个酷功能，但跟核心业务无关" |
| 2. 用户价值 | 解决真实痛点吗？ | "用户可能不会用这个功能" |
| 3. 市场差异 | 有竞争优势吗？ | "竞争对手都有这个功能" |
| 4. 技术可行 | 现有技术栈支持吗？ | "需要引入全新的技术栈" |
| 5. 资源投入 | ROI合理吗？ | "开发2周，只有10%用户会用" |
| 6. 范围控制 | 范围可控吗？ | "这个功能会越做越大" |
| 7. 依赖风险 | 有外部依赖吗？ | "依赖第三方API，不稳定" |
| 8. 数据安全 | 有安全风险吗？ | "需要处理敏感用户数据" |
| 9. 可维护性 | 后续维护成本高吗？ | "需要专人维护这个功能" |
| 10. 退出策略 | 如果不成功怎么办？ | "上线后很难下线" |

### Phase 4: 实现契约定义

生成SRS风格的能力计划：

```
IMPLEMENTATION CONTRACT（实现契约）
├─ Capability Summary: 能力摘要
├─ Explicit Non-Goals: 明确的非目标
├─ Actors and Surfaces: 参与者和界面
├─ Required States and Transitions: 必需状态和转换
├─ Interfaces/Inputs/Outputs: 接口/输入/输出
├─ Data Model Implications: 数据模型影响
├─ Security/Billing/Policy Constraints: 安全/计费/策略约束
├─ Observability Requirements: 可观测性要求
└─ Open Questions: 阻塞实现的开放问题
```

### Phase 7: 规格自审（Spec Self-Review）

**来自superpowers的spec self-review机制**：

在提交用户审查前，**必须**完成以下4项检查：

**1. Placeholder扫描**
- 是否有"TBD"、"TODO"、未完成章节、模糊需求？
- **行动**：立即修复，不要留给用户

**2. 内部一致性检查**
- 各章节是否有矛盾？
- 架构设计与功能描述是否匹配？
- **行动**：修正所有矛盾

**3. 范围检查**
- 这个需求是否足够聚焦，可以写入单个实现计划？
- 还是需要分解为多个子需求？
- **行动**：如果太大，立即分解

**4. 歧义检查**
- 是否有任何需求可以被两种不同方式解释？
- **行动**：选择一种解释，使其明确

**修复后无需重新审查** - 直接修复并继续。

### Phase 8: 用户审查门禁

**HARD-GATE：用户必须审查书面规格**

在规格自审通过后，**必须**请用户审查书面规格：

> "规格已撰写并保存至 `<path>`。请在开始写实现计划前审查它，告诉我是否需要修改。"

**等待用户响应**。如果用户要求修改：
- 进行修改
- 重新运行规格自审循环
- **只有用户批准后**才能继续

### Phase 9: 过渡到实现

**用户批准后，调用execution-planner技能创建详细实现计划**

**绝对禁止**调用任何其他实现技能。execution-planner是唯一下一步。

### Phase 6: 验收标准定义（Eval-First）

**采用eval-first理念**（蒸馏自eval-harness）：

```
[CAPABILITY EVAL: 功能名称]
任务: Claude应该完成什么
成功标准:
- [ ] 标准1
- [ ] 标准2
- [ ] 标准3
期望输出: 预期结果描述
```

**验收等级**：
- pass@1: 首次尝试成功率
- pass@3: 3次尝试内成功率（目标>90%）
- pass^3: 3次连续成功（用于关键路径）

### Phase 10: 生成需求规格文档

使用以下模板生成PRD：

```markdown
## Problem Statement（问题陈述）

用户面临的问题，从用户视角描述。

## Solution（解决方案）

问题的解决方案，从用户视角描述。

## User Stories（用户故事）

一个**超长的、编号的**用户故事列表。格式：

1. As an <actor>, I want a <feature>, so that <benefit>

示例：
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending

这个列表应该非常全面，覆盖功能的所有方面。

## Implementation Decisions（实现决策）

实现决策列表，包括：
- 将要构建/修改的模块
- 将要修改的模块接口
- 开发者的技术澄清
- 架构决策
- Schema变更
- API契约
- 特定交互

**不要**包含具体文件路径或代码片段（会很快过时）。

## Testing Decisions（测试决策）

测试决策列表，包括：
- 什么是好测试的描述（只测试外部行为，不测试实现细节）
- 哪些模块将被测试
- 测试的先例（代码库中类似的测试）

## Capability Constraints（能力约束）[新增]

- 业务规则: [...]
- 不变量: [...]
- 信任边界: [...]
- 状态转换: [...]

## Acceptance Criteria（验收标准）[新增]

[Capability Eval定义]

## Out of Scope（范围外）

不在本PRD范围内的事物描述。

## Open Questions（开放问题）[新增]

阻塞实现的决策或产品澄清。

## Further Notes（进一步说明）

关于功能的进一步说明。
```

## ⚠️ 不可协商规则

（蒸馏自product-capability的non-negotiable rules）

1. **不虚构产品真相** - 明确标记未解决的问题
2. **分离承诺与实现** - 用户可见承诺 ≠ 实现细节
3. **明确约束类型** - 固定策略 vs 架构偏好 vs 待决策
4. **冲突必须指出** - 如与现有约束冲突，明确说明
5. **优先可复用产物** - 一个能力清单 > 零散的临时笔记
6. **不要面试用户** - 基于已有知识综合，不要问用户
7. **使用领域词汇** - 尊重项目的领域词汇和ADRs
8. **HARD-GATE** - 规格未批准前，禁止进入实现阶段
9. **6个强制问题** - 必须在需求文档中回答office-hours的6个问题
10. **10维度审查** - 必须完成CEO review的10维度审查
11. **规格自审** - 必须完成4项自审检查后提交用户
12. **多方案探索** - 必须提出2-3个方案供用户选择

## 🔗 上下游衔接

- **上游**：无（初始技能）
- **下游**：DesignBriefBuilder（设计规范构建）
- **协同**：ExecutionPlanner（执行计划生成）
