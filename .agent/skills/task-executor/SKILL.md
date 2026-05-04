---
name: task-executor
description: 任务执行实现器。按照执行计划完成具体的代码开发、功能实现、数据库操作等任务，采用eval-first执行、任务分解和成本感知模型路由。
status: active
source: project:self-developed + distilled:everything-claude-code
github_source: distilled from blueprint, agentic-engineering
last_updated: 2026-05-01
---

# 任务执行实现器（TaskExecutor）

## 🎯 技能定位

按照执行计划完成具体的代码开发、功能实现、数据库操作等任务。

**核心能力来源**：
- 任务分解：everything-claude-code (blueprint) - 15分钟单元规则、冷启动执行
- 执行策略：everything-claude-code (agentic-engineering) - eval-first、模型路由、会话策略

## 🔧 执行流程

### 核心原则（蒸馏自agentic-engineering）

1. **执行前定义完成标准** - 明确done condition
2. **分解为agent-sized单元** - 应用15分钟单元规则
3. **按任务复杂度路由模型** - 成本感知
4. **用evals和回归检查测量** - eval-first

### Phase 1: 理解执行计划

**1.1 读取计划文件**

从ExecutionPlanner获取分阶段执行计划，理解：
- 当前步骤的任务描述
- 上下文简报（context brief）
- 依赖关系
- 验证命令
- 退出标准（exit criteria）

**1.2 冷启动准备**（蒸馏自blueprint）

每个步骤包含自包含的上下文简报，因此**无需读取 prior steps**即可执行。

检查清单：
- [ ] 理解当前步骤的目标
- [ ] 识别需要修改的文件
- [ ] 确认依赖步骤已完成
- [ ] 准备验证命令

### Phase 2: 任务分解（15-Minute Unit Rule）

**蒸馏自blueprint的15分钟单元规则**：

每个单元必须满足：
- ✅ **独立可验证** - 有明确的pass/fail标准
- ✅ **单一主导风险** - 只关注一个主要风险点
- ✅ **清晰完成条件** - 明确的done condition

**分解策略**：

```
大任务 → 多个15分钟单元
├─ 单元1: 数据库schema变更 (独立验证: migration test)
├─ 单元2: API endpoint实现 (独立验证: integration test)  
├─ 单元3: 前端组件开发 (独立验证: component test)
└─ 单元4: 集成测试 (独立验证: e2e test)
```

### Phase 3: Eval-First执行循环

**蒸馏自agentic-engineering的eval-first loop**：

```
1. 定义capability eval和regression eval
2. 运行baseline并捕获失败特征
3. 执行实现
4. 重新运行evals并比较deltas
```

**执行步骤**：

**3.1 定义Eval**（Before Coding）

```markdown
## EVAL DEFINITION: [任务名称]

### Capability Evals
- [ ] 能创建新用户账户
- [ ] 能验证邮箱格式
- [ ] 能安全哈希密码

### Regression Evals
- [ ] 现有登录仍正常工作
- [ ] 会话管理未改变
- [ ] 登出流程完整

### Success Metrics
- pass@3 > 90% (capability evals)
- pass^3 = 100% (regression evals)
```

**3.2 实现代码**

编写代码以通过定义的evals。

**3.3 运行Eval**

```bash
# 运行capability evals
[运行每个capability eval，记录PASS/FAIL]

# 运行regression evals
npm test -- --testPathPattern="existing"

# 生成报告
```

**3.4 评估结果**

```markdown
EVAL REPORT: [任务名称]
========================

Capability Evals:
- create-user:     PASS (pass@1)
- validate-email:  PASS (pass@2)
- hash-password:   PASS (pass@1)
Overall:         3/3 passed

Regression Evals:
- login-flow:      PASS
- session-mgmt:    PASS
- logout-flow:     PASS
Overall:         3/3 passed

Metrics:
pass@1: 67% (2/3)
pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

### Phase 4: 模型路由（Cost-Aware）

**蒸馏自agentic-engineering的model routing**：

按任务复杂度路由到不同模型层级：

| 模型层级 | 适用任务 | 示例 |
|---------|---------|------|
| **Haiku** (低成本) | 分类、模板转换、窄范围编辑 | 生成boilerplate代码、重命名变量 |
| **Sonnet** (中成本) | 实现和重构 | 实现API endpoint、重构模块 |
| **Opus** (高成本) | 架构、根因分析、多文件不变量 | 设计插件系统、修复复杂bug |

**升级规则**：仅当低层级模型失败且有清晰的推理差距时，才升级到高成本模型。

### Phase 5: 会话策略

**蒸馏自agentic-engineering的session strategy**：

| 场景 | 策略 | 原因 |
|------|------|------|
| 紧密耦合的单元 | 继续当前会话 | 保留上下文 |
| 主要阶段转换后 | 开始新会话 | 避免上下文污染 |
| 里程碑完成后 | 压缩上下文 | 保留关键信息，清除调试细节 |
| 活跃调试中 | 不压缩 | 保留完整调试上下文 |

### Phase 6: 质量自检

**完成每个单元后，运行自检**：

```markdown
## 自检清单

- [ ] 所有capability evals通过
- [ ] 所有regression evals通过
- [ ] 代码通过lint检查
- [ ] 测试覆盖率达标
- [ ] 无安全漏洞
- [ ] 文档已更新
- [ ] 无console.log/debug代码
```

## 📥 输入

- 分阶段执行计划（来自ExecutionPlanner）
- 设计规范（来自DesignBriefBuilder）
- 需求规格（来自DemandSpecBuilder）
- 技术方案

## 📤 输出

- 功能代码
- 数据库脚本
- API接口
- Eval报告
- 自检清单

## ⚠️ 执行约束

1. **不要跳过eval定义** - 必须先定义成功标准再编码
2. **不要一次性实现大任务** - 分解为15分钟单元
3. **不要浪费token在样式争议** - 让lint/format处理
4. **不要隐藏失败** - 记录所有eval结果
5. **成本纪律** - 跟踪每个任务的模型、token估计、重试次数、墙钟时间、成功/失败

## 🔗 上下游衔接

- **上游**：ExecutionPlanner（分阶段执行计划）
- **下游**：QualityReviewer（质量审查）
- **协同**：IssueFixer（问题修复）

---

**创建时间**: 2026-05-01  
**版本**: 0.1.0 (占位)
