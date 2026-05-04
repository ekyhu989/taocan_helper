---
name: quality-reviewer
description: 质量审查校验器。对执行成果进行全面质量审查，包括代码质量、设计规范符合度、功能完整性，采用eval-first理念和分级审查策略。集成Karpathy反模式检查。
status: active
source: github:sheng1111/AI-Code-Review-Agent + distilled:everything-claude-code + andrej-karpathy-skills
github_url: https://github.com/sheng1111/AI-Code-Review-Agent
distilled_from:
  - https://github.com/affaan-m/everything-claude-code (eval-harness, agentic-engineering)
  - https://github.com/forrestchang/andrej-karpathy-skills (4 principles, anti-patterns)
last_updated: 2026-05-01
---

# 质量审查校验器（QualityReviewer）

## 🎯 技能定位

对执行成果进行全面质量审查，采用**eval-first理念**和**分级审查策略**。

**核心能力来源**：
- 基础框架：sheng1111/AI-Code-Review-Agent（多维度代码分析）
- 增强能力：everything-claude-code (eval-harness, agentic-engineering)

## 📥 输入

- 功能代码
- 设计规范
- 验收标准
- Git diff（代码变更）

## 📤 输出

- 质量审查报告
- 问题清单（按严重度分级）
- 修复建议

## 🔧 审查维度

### 1. 安全性（Security）
- SQL注入、XSS、CSRF等常见漏洞
- 硬编码密钥、敏感信息泄露
- 第三方依赖漏洞

### 2. 性能（Performance）
- 算法复杂度分析
- 数据库查询优化
- 内存使用问题

### 3. 代码质量（Code Quality）
- 可读性、可维护性
- SOLID原则遵循情况
- 编码规范检查

### 4. 测试（Testing）
- 单元测试建议
- 边界条件检查
- 测试覆盖率

### 5. 最佳实践（Best Practices）
- 设计模式使用
- 架构规范遵循
- 代码复用度

## 🔧 审查流程（Eval-First）

### Phase 1: 定义验收标准（Before Review）

**采用eval-first理念**（蒸馏自eval-harness）：

在审查前，先明确验收标准：

```
[CAPABILITY EVAL: 功能名称]
任务: 应该实现什么
成功标准:
- [ ] 标准1
- [ ] 标准2
- [ ] 标准3
期望输出: 预期结果
```

**验收等级**：
- **Capability Evals**: 测试新功能是否按预期工作
- **Regression Evals**: 确保变更不破坏现有功能
- **Success Metrics**: 
  - pass@3 > 90%（能力评估）
  - pass^3 = 100%（回归评估，关键路径）

### Phase 2: 获取代码变更

1. **读取Git diff**或指定文件
2. **识别变更范围**：
   - 新增文件
   - 修改文件
   - 删除文件
3. **关联需求规格**：对比DemandSpecBuilder的输出

### Phase 3: 多维度分析

**5大审查维度** + **4个审查重点**（蒸馏自agentic-engineering）：

#### 维度1: 安全性（Security）- CRITICAL
- SQL注入、XSS、CSRF等常见漏洞
- 硬编码密钥、敏感信息泄露
- 第三方依赖漏洞
- 身份认证与授权缺陷

#### 维度2: 性能（Performance）- HIGH
- 算法复杂度分析（O(n²)或更差）
- 数据库查询优化（N+1查询、缺失索引）
- 内存使用问题（内存泄漏、未释放资源）
- 并发问题（死锁、竞态条件）

#### 维度3: 代码质量（Code Quality）- HIGH
- 可读性、可维护性
- SOLID原则遵循情况
- 编码规范检查
- 重复代码（DRY原则）

#### 维度4: 测试（Testing）- HIGH
- 单元测试覆盖率
- 边界条件检查
- 集成测试完整性
- 测试质量（只测试外部行为，不测试实现细节）

#### 维度5: 最佳实践（Best Practices）- MEDIUM
- 设计模式使用
- 架构规范遵循
- 代码复用度
- 错误处理完整性

### Phase 4: AI生成代码审查重点 + Karpathy反模式检查

**蒸馏自agentic-engineering的review focus**：

优先关注（按重要性排序）：
1. **不变量和边界条件** - 是否有未处理的边缘情况
2. **错误边界** - 异常处理是否完整
3. **安全和认证假设** - 权限检查是否充分
4. **隐藏耦合和滚回风险** - 是否引入隐性依赖

**蒸馏自Karpathy的反模式检查**（必须检查）：

| 反模式 | 检查项 | 失败信号 | 严重度 |
|--------|--------|----------|--------|
| **错误假设** | 代码是否基于未验证的假设？ | “我假设API总是返回X字段” | Critical |
| **隐藏困惑** | 开发者是否理解所修改的代码？ | 修改了不理解的业务逻辑 | Major |
| **过度工程** | 代码是否比需要的复杂？ | 200行可以变成50行 | Major |
| **投机功能** | 是否实现了未要求的功能？ | “考虑到未来可能需…” | Minor |
| **单用例抽象** | 是否为单一使用场景创建抽象？ | 只有一处使用的interface/factory | Minor |
| **驱动式重构** | 是否修改了无关的代码？ | diff中包含不相关的样式修改 | Minor |
| **注释/代码删除** | 是否不小心删除了注释或代码？ | 删除了不理解的“冗余”代码 | Critical |
| **复杂构建** | 是否用1000行实现100行可完成的功能？ | 过度嵌套、冗余类、过度设计 | Major |

❌ **不要浪费时间**：
- 风格分歧（当自动化format/lint已强制风格时）
- 纯格式问题（空格、换行、命名风格）

### Phase 5: 问题分级

| 严重度 | 含义 | 示例 | 处理 |
|--------|------|------|------|
| **Critical** | 安全漏洞或线上故障风险 | SQL注入、未授权访问 | 必须修复，阻塞合并 |
| **Major** | 功能正确性或可维护性问题 | 空指针异常、N+1查询 | 应该修复，建议阻塞 |
| **Minor** | 风格、可读性等轻微问题 | 变量命名、注释缺失 | 可选修复 |

### Phase 6: 生成评估报告

**采用eval-harness的报告格式**：

```markdown
EVAL REPORT: [功能名称]
========================

Capability Evals:
- [eval-1]: PASS/FAIL (pass@k)
- [eval-2]: PASS/FAIL (pass@k)
Overall: X/Y passed

Regression Evals:
- [regression-1]: PASS/FAIL
- [regression-2]: PASS/FAIL
Overall: X/Y passed (previously Y/Y)

Code Review:
- Critical: X issues
- Major: X issues
- Minor: X issues

Metrics:
pass@1: X%
pass@3: X%
pass^3: PASS/FAIL

Status: READY FOR REVIEW / NEEDS FIXES
```

## 📊 输出格式

### 总体评价
用2-3句话概括整体质量、主要风险和亮点

### 问题列表
| 严重度 | 文件 | 行号 | 问题描述 | 建议修复 | 评估类型 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Critical | `src/app.py` | 45 | SQL注入风险 | 改用参数化查询 | Capability |
| Major | `src/db.py` | 102 | N+1查询问题 | 使用JOIN优化 | Regression |

### 改进建议
提供具体的代码修改示例或diff格式补丁

### 亮点
指出代码中做得好的地方

### 评估指标
```
pass@1: X% (首次尝试成功率)
pass@3: X% (3次尝试内成功率)
pass^3: PASS/FAIL (3次连续成功)
```

### 审查者类型标记
- [Code Grader] 确定性检查（grep、lint、test）
- [Model Grader] 模型判断（开放性评估）
- [Human Review] 需要人工审查（安全、架构）

## 🔗 上下游衔接

- 上游：TaskExecutor
- 下游：IssueFixer

## ⚙️ 配置说明

原始工具基于GitHub Actions，已改造为Agent Skill格式：
- 原配置: `config.json`（模型、审查参数）
- 原脚本: `scripts/`（测试、验证脚本）
- 语言支持: 10种语言（中、英、日、韩等）

## 📚 参考来源

- GitHub: https://github.com/sheng1111/AI-Code-Review-Agent
- 文档: `README.md`, `CONFIG.md`
- 配置: `config.json`

---

**版本**: 1.0.0  
**适配日期**: 2026-05-01
