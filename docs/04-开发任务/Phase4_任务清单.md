# Phase 4 任务清单 - 交互体验优化

> **生成时间**: 2026-05-03  
> **生成角色**: 产品经理 (PM)  
> **需求来源**: [Phase4_交互体验优化需求规格.md](../01-需求文档/Phase4_交互体验优化需求规格.md)  
> **状态**: ⏳ 待执行

---

## 📊 任务总览

| 优先级 | 任务数 | 总工作量 | 负责人 |
|--------|--------|---------|--------|
| P0 | 4个 | 8.5天 | Frontend-Developer |
| P1 | 4个 | 6.5天 | Frontend-Developer |
| **合计** | **8个** | **15天** | **Frontend-Developer** |

---

## 🔧 P0任务（必须完成）

### Task-021: 草稿自动保存与恢复

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-021 |
| **任务名称** | 草稿自动保存与恢复 |
| **优先级** | P0 |
| **预估工作量** | 2天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | 无 |

**输入**：
- Phase 4需求规格说明书（3.1节）
- SolutionEditorPage现有代码

**输出**：
- `src/hooks/useDraftSave.ts` - 草稿保存Hook
- SolutionEditorPage集成草稿功能
- 草稿恢复弹窗组件

**验收标准**：
- ✅ 表单输入内容每30秒自动保存一次
- ✅ 关闭页面后重新打开，弹窗提示"检测到未完成的草稿，是否恢复？"
- ✅ 用户选择"恢复"后，所有已填字段自动填充
- ✅ 用户选择"放弃"后，清除LocalStorage中的草稿
- ✅ 方案导出成功后，自动清除对应草稿
- ✅ 支持多个草稿并存（按方案ID区分）

**技术要点**：
- 使用`localStorage`存储（key格式：`draft_solution_{timestamp}`）
- 使用`useEffect`监听表单变化
- 使用`useBeforeUnload`提示未保存内容

**执行指令**：
```
角色: Frontend-Developer
任务: 实现草稿自动保存与恢复功能
输入: Phase 4需求规格说明书（3.1节）
输出: useDraftSave.ts + SolutionEditorPage集成 + 草稿恢复弹窗
验收: 6项验收标准全部通过
```

---

### Task-022: 政策智能推荐（基于场景）

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-022 |
| **任务名称** | 政策智能推荐（基于场景） |
| **优先级** | P0 |
| **预估工作量** | 3天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | Task-021 |

**输入**：
- Phase 4需求规格说明书（3.2节）
- policy.types.ts现有代码
- PolicyListPage现有代码

**输出**：
- 更新`policy.types.ts`（新增`relatedScenes`字段）
- 更新10个政策数据（标注适用场景）
- PolicyFilter新增"智能推荐"模式
- PolicyListPage推荐逻辑

**验收标准**：
- ✅ 选择场景后，PolicyListPage自动筛选相关政策
- ✅ 推荐政策按相关度排序（场景匹配 > 年份新 > 浏览量高）
- ✅ 显示推荐原因标签（如"节日慰问相关"、"新疆地区适用"）
- ✅ 用户可一键查看所有政策（取消筛选）
- ✅ 推荐准确率≥80%（基于场景-政策映射表）

**技术要点**：
- 在`policy.types.ts`中新增`relatedScenes: PolicyScene[]`字段
- 更新政策数据：国家4个+地方3个+行业3个
- PolicyFilter新增推荐模式

**执行指令**：
```
角色: Frontend-Developer
任务: 实现政策智能推荐功能
输入: Phase 4需求规格说明书（3.2节）
输出: policy.types.ts更新 + 政策数据更新 + PolicyFilter推荐模式 + PolicyListPage推荐逻辑
验收: 5项验收标准全部通过
依赖: Task-021完成后开始
```

---

### Task-023: 模板场景化推荐

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-023 |
| **任务名称** | 模板场景化推荐 |
| **优先级** | P0 |
| **预估工作量** | 2天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | 无 |

**输入**：
- Phase 4需求规格说明书（3.3节）
- template.types.ts现有代码
- TemplateSelector现有代码

**输出**：
- 更新`template.types.ts`（新增`relatedScenes`字段）
- 更新10个模板数据（标注适用场景）
- TemplateCard新增`matchScore`显示
- TemplateSelector新增排序逻辑

**验收标准**：
- ✅ 模板卡片显示场景标签（如"节日慰问"、"员工活动"）
- ✅ 按匹配度降序排列（场景完全匹配 > 部分匹配 > 通用）
- ✅ 显示匹配度百分比（基于场景关键词匹配）
- ✅ 支持手动切换"全部模板"/"推荐模板"视图
- ✅ 推荐模板数量≥3个

**技术要点**：
- 在`template.types.ts`中新增`relatedScenes: TemplateScene[]`字段
- TemplateCard新增`matchScore`属性
- TemplateSelector新增排序逻辑

**执行指令**：
```
角色: Frontend-Developer
任务: 实现模板场景化推荐功能
输入: Phase 4需求规格说明书（3.3节）
输出: template.types.ts更新 + 模板数据更新 + TemplateCard matchScore + TemplateSelector排序
验收: 5项验收标准全部通过
```

---

### Task-024: 新手引导系统

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-024 |
| **任务名称** | 新手引导（首次使用） |
| **优先级** | P0 |
| **预估工作量** | 1.5天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | 无 |

**输入**：
- Phase 4需求规格说明书（3.4节）
- HomePage现有代码

**输出**：
- `src/components/guide/OnboardingGuide.tsx` - 引导组件
- `src/hooks/useOnboarding.ts` - 引导状态Hook
- HomePage集成引导

**验收标准**：
- ✅ 首次访问显示引导蒙层（共3步）
  - 第1步：高亮"选择模板"按钮
  - 第2步：高亮"填写表单"区域
  - 第3步：高亮"导出方案"按钮
- ✅ 每步支持"下一步"/"跳过引导"
- ✅ 引导完成后，localStorage标记`has_seen_guide=true`
- ✅ 用户可在设置中重新查看引导
- ✅ 引导支持键盘操作（右箭头下一步，ESC跳过）

**技术要点**：
- 使用React Portal实现蒙层
- 使用`localStorage`记录引导状态
- 使用Focus Trap确保聚焦

**执行指令**：
```
角色: Frontend-Developer
任务: 实现新手引导系统
输入: Phase 4需求规格说明书（3.4节）
输出: OnboardingGuide.tsx + useOnboarding.ts + HomePage集成
验收: 5项验收标准全部通过
```

---

## 🎯 P1任务（应该完成）

### Task-025: 方案对比功能

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-025 |
| **任务名称** | 方案对比功能 |
| **优先级** | P1 |
| **预估工作量** | 2天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | Task-021 |

**输入**：
- Phase 4需求规格说明书（3.5节）

**输出**：
- `src/components/solution/SolutionComparator.tsx` - 对比组件
- 方案列表勾选功能
- 对比弹窗

**验收标准**：
- ✅ 方案列表支持勾选（最多3个）
- ✅ 点击"对比"按钮，打开对比弹窗
- ✅ 对比视图按字段分列展示（模板/预算/标准/政策依据）
- ✅ 差异项高亮显示（红色背景）
- ✅ 支持导出对比结果（PDF）

**执行指令**：
```
角色: Frontend-Developer
任务: 实现方案对比功能
输入: Phase 4需求规格说明书（3.5节）
输出: SolutionComparator.tsx + 方案列表勾选 + 对比弹窗
验收: 5项验收标准全部通过
依赖: Task-021完成后开始
```

---

### Task-026: 政策收藏与快捷访问

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-026 |
| **任务名称** | 政策收藏与快捷访问 |
| **优先级** | P1 |
| **预估工作量** | 1天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | 无 |

**输入**：
- Phase 4需求规格说明书（3.6节）
- PolicyDetailPage现有代码
- HomePage现有代码

**输出**：
- PolicyDetailPage新增"收藏"按钮
- HomePage新增"我的收藏"区块
- `src/hooks/useFavoritePolicies.ts` - 收藏Hook

**验收标准**：
- ✅ PolicyDetailPage新增"收藏"按钮
- ✅ HomePage显示"我的收藏"区块（最多5个）
- ✅ 点击收藏政策，直接跳转到详情页
- ✅ 支持取消收藏
- ✅ 收藏数据持久化到LocalStorage

**执行指令**：
```
角色: Frontend-Developer
任务: 实现政策收藏与快捷访问功能
输入: Phase 4需求规格说明书（3.6节）
输出: PolicyDetailPage收藏按钮 + HomePage我的收藏区块 + useFavoritePolicies.ts
验收: 5项验收标准全部通过
```

---

### Task-027: 表单字段智能填充

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-027 |
| **任务名称** | 表单字段智能填充（历史数据复用） |
| **优先级** | P1 |
| **预估工作量** | 2天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | Task-021 |

**输入**：
- Phase 4需求规格说明书（3.7节）
- SolutionEditorPage现有代码

**输出**：
- `src/hooks/useSmartFill.ts` - 智能填充Hook
- SolutionEditorPage集成智能填充
- 填充提示弹窗

**验收标准**：
- ✅ 打开表单时，检测LocalStorage中的历史数据
- ✅ 显示"检测到历史数据，是否自动填充？"提示
- ✅ 用户确认后，自动填充：单位名称、联系人、联系电话、预算标准
- ✅ 用户可手动修改填充内容
- ✅ 支持清除历史数据

**执行指令**：
```
角色: Frontend-Developer
任务: 实现表单字段智能填充功能
输入: Phase 4需求规格说明书（3.7节）
输出: useSmartFill.ts + SolutionEditorPage集成 + 填充提示弹窗
验收: 5项验收标准全部通过
依赖: Task-021完成后开始
```

---

### Task-028: 导出格式预览

| 维度 | 内容 |
|------|------|
| **任务ID** | Task-028 |
| **任务名称** | 导出格式预览（所见即所得） |
| **优先级** | P1 |
| **预估工作量** | 1.5天 |
| **负责人** | Frontend-Developer |
| **依赖关系** | Task-021 |

**输入**：
- Phase 4需求规格说明书（3.8节）
- SolutionEditorPage现有导出功能

**输出**：
- `src/components/solution/ExportPreview.tsx` - 预览组件
- SolutionEditorPage集成预览

**验收标准**：
- ✅ 点击"导出"按钮后，先显示预览弹窗
- ✅ 预览内容与最终导出文件一致（所见即所得）
- ✅ 支持切换Word/PDF预览
- ✅ 预览界面显示"确认导出"和"返回修改"按钮
- ✅ 预览加载时间<1秒

**执行指令**：
```
角色: Frontend-Developer
任务: 实现导出格式预览功能
输入: Phase 4需求规格说明书（3.8节）
输出: ExportPreview.tsx + SolutionEditorPage集成
验收: 5项验收标准全部通过
依赖: Task-021完成后开始
```

---

## 📅 执行计划

### 第一批（P0并行，第1-2天）

| 任务 | 开始时间 | 结束时间 | 负责人 |
|------|---------|---------|--------|
| Task-021: 草稿自动保存 | Day 1 | Day 2 | Frontend-Developer |
| Task-023: 模板场景化推荐 | Day 1 | Day 2 | Frontend-Developer |
| Task-024: 新手引导系统 | Day 1 | Day 2 | Frontend-Developer |

### 第二批（P0依赖，第3-4天）

| 任务 | 开始时间 | 结束时间 | 负责人 | 依赖 |
|------|---------|---------|--------|------|
| Task-022: 政策智能推荐 | Day 3 | Day 5 | Frontend-Developer | Task-021 |

### 第三批（P1并行，第6-8天）

| 任务 | 开始时间 | 结束时间 | 负责人 | 依赖 |
|------|---------|---------|--------|------|
| Task-025: 方案对比功能 | Day 6 | Day 7 | Frontend-Developer | Task-021 |
| Task-026: 政策收藏 | Day 6 | Day 6 | Frontend-Developer | 无 |
| Task-027: 表单智能填充 | Day 6 | Day 7 | Frontend-Developer | Task-021 |
| Task-028: 导出预览 | Day 7 | Day 8 | Frontend-Developer | Task-021 |

**总计**: 8天完成全部P0+P1任务

---

## ⚠️ 注意事项

1. **Design Tokens合规**：所有新增组件必须使用CSS变量，禁止硬编码颜色
2. **TypeScript类型**：所有新增接口必须定义类型，禁止使用any
3. **组件规范**：所有Modal/Selector必须支持外部回调（onSelect/onChange等）
4. **提交前自检**：
   - 执行`npx tsc --noEmit`确保0 errors
   - 全局grep硬编码颜色，确保0 matches
   - 检查TODO/FIXME/HACK标记，确保已全部处理
   - 全量测试通过

---

*本文档由PM生成，Frontend-Developer执行，QA审查。*
