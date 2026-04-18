# 智能采购助手 - Agent团队配置

## 团队结构

```
Orchestrator (项目经理)
    ├── Doubao-seek (前端开发工程师)
    └── DeepSeek (全栈开发工程师)
```

## Agent角色

### Orchestrator
- **职责**：任务分配、进度跟踪、质量把控、团队协调
- **配置**：`.workbuddy/agents/Orchestrator.md`

### Doubao-seek
- **职责**：UI组件开发、页面布局、交互实现
- **配置**：`.workbuddy/agents/Doubao-seek.md`
- **技能**：Agent Team Orchestration, Agent Memory

### DeepSeek
- **职责**：业务逻辑、数据管理、复杂功能实现
- **配置**：`.workbuddy/agents/DeepSeek.md`
- **技能**：Agent Team Orchestration, Agent Memory, 腾讯云CloudBase

## 已安装技能

| 技能名称 | 用途 | 安装状态 |
|---------|------|---------|
| Agent Team Orchestration | 团队协作和任务管理 | ✅ 已安装 |
| Agent Memory | 记忆持久化 | ✅ 已安装 |
| 腾讯云CloudBase | 云开发能力 | ✅ 已安装 |

## 任务分配

### V1.6任务分配

**Doubao-seek**（5个任务）：
- V1.6-1: 导航布局交互优化
- V1.6-3: 历史方案全面升级
- V1.6-4: 商品库管理功能升级
- V1.6-6: 批量操作安全防护体系
- V1.6-7: 移动端体验专项优化

**DeepSeek**（5个任务）：
- V1.6-2: 政策文库合规升级
- V1.6-5: 公文生成防错合规优化
- V1.6-8: 合规测算规则精细化
- V1.6-9: 数据安全与灾难恢复
- V1.6-10: 审计汇报PPT一键生成

## 工作流程

### 任务生命周期
```
Inbox → Assigned → In Progress → Review → Done | Failed
```

### 任务交接规范
每次任务交接必须包含：
1. **做了什么**：功能实现总结
2. **产物位置**：文件路径列表
3. **如何验证**：测试步骤和命令
4. **已知问题**：未完成或需要注意的地方
5. **下一步**：建议的后续操作

## 记忆管理

### 记忆协议
- **会话开始**：加载相关记忆和上下文
- **会话结束**：记录经验和重要事实
- **定期更新**：维护项目状态和技术决策

### 记忆存储
- 项目记忆：`MEMORY.md`
- 每日日志：`YYYY-MM-DD.md`
- Agent记忆：`AgentMemory`数据库

## 沟通渠道

- **任务文档**：`docs/02_需求文档/`
- **工作记忆**：`.workbuddy/memory/`
- **代码仓库**：GitHub

## 质量要求

1. 所有功能需通过验收标准
2. 代码需推送到GitHub
3. 向后兼容V1.5功能
4. 遵循项目合规要求

---

**创建时间**：2026-04-14  
**版本**：V1.6团队配置