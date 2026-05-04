# 核心记忆

> 每周提炼更新一次，记录项目核心知识和经验  
> 最后更新：2026-05-03 
> **维护负责人**：Product Manager（PM）  
> **更新时机**：任务完成后即时提炼 + 每周五定期更新 

---

## 📚 记忆架构说明

### 记忆分层
1. **项目级记忆**（本文件）- 所有角色共享
   - 项目基本信息
   - 核心架构决策
   - 全局踩坑记录
   - 项目进度状态

2. **角色级记忆**（角色专属）- 每个角色独立
   - `pm-memory.md` - PM专属记忆
   - `designer-memory.md` - Designer专属记忆
   - `developer-memory.md` - Developer专属记忆
   - `frontend-developer-memory.md` - Frontend-Developer专属记忆
   - `qa-memory.md` - QA专属记忆
   - `devops-memory.md` - DevOps专属记忆

3. **会话级记忆**（临时）- 每次会话独立
   - `sessions/[角色]-session-*.md` - 会话记录

### 记忆加载规则
- 新会话开始：读取 MEMORY.md + 对应角色记忆 + 最新会话记录
- 任务完成：更新角色专属记忆
- 会话结束：保存会话记录，提炼更新角色记忆

---

## 📊 项目状态

- **当前版本**：3.0.0（V3.0迭代升级中）
- **开发进度**：Phase 3 QA回归测试中（4个Bug已修复），Phase 4 PM审查完全通过，Phase 2 QA测试计划生成中
- **V3.0进度（8环节）**：
  - ✅ 环节1-需求：需求规格说明书确认通过（921行）
  - ✅ 环节2-设计：设计规范文档审查通过（1005行，10章节）
  - ✅ 环节3-方案：技术架构方案审查通过
  - ✅ 环节4-计划：Phase 1/2/3/4任务指令已生成
  - ✅ 环节5-执行：Phase 1/2/3/4全部完成（28个任务）
  - ✅ 环节6-审查：Phase 3 PM审查完全通过，QA回归测试中（4个Bug已修复）；Phase 4 PM审查完全通过
  - ✅ 环节7-修复：Phase 3的6个问题已全部修复；Phase 4的2个问题已全部修复
  - ⏳ 环节8-发布：待全部Phase完成后进入
- **质量审查机制**：每个Phase必须PM+QA双审查通过，方可进入下一Phase
- **本周完成**：
  - ✅ V3.0需求规格说明书（921行）
  - ✅ V3.0设计规范文档（1005行）
  - ✅ V3.0技术架构方案（1203行）
  - ✅ V3.0任务清单（765行，31个任务）
  - ✅ Phase 1: 基础修复（5个任务，100%通过）
  - ✅ Phase 2: 设计系统重建（6个任务，100%通过）
  - ✅ Phase 3: 核心功能开发（9个任务，PM审查完全通过）
    * Task-012: 模板数据模型（template.types.ts + 10个模板）
    * Task-013: 模板列表页（TemplateListPage + TemplateCard + TemplateFilter）
    * Task-014: 模板预览（TemplatePreview + TemplatePreviewModal）
    * Task-015: 模板选择器（TemplateSelector，已集成到HomePage）
    * Task-016: 变量编辑器（VariableEditor + SolutionEditorPage + 导出功能）
    * Task-017: 政策数据模型（policy.types.ts + 10个政策）
    * Task-018: 政策检索系统（PolicyListPage + PolicyFilter，4维度筛选）
    * Task-019: 政策在线预览（PolicyViewer + PolicyDetailPage + 下载功能）
    * Task-020: 收藏夹功能（useFavorites + FavoritesPage + FavoriteItemCard）
  - ✅ Phase 4: 交互体验优化（8个任务，PM审查完全通过）
    * Task-021: 草稿自动保存与恢复（useDraftSave.ts 136行）
    * Task-022: 政策智能推荐（PolicyFilter + PolicyListPage，smartRecommend模式）
    * Task-023: 模板场景化推荐（TemplateSelector + TemplateCard）
    * Task-024: 新手引导系统（OnboardingGuide 305行 + useOnboarding 66行）
    * Task-025: 方案对比功能（SolutionComparator.tsx 261行）
    * Task-026: 政策收藏与快捷访问（useFavorites + FavoritesPage）
    * Task-027: 表单智能填充（useSmartFill + SolutionEditorPage）
    * Task-028: 导出格式预览（ExportPreviewModal + SolutionEditorPage）
  - ✅ Phase 3质量审查（初版6个问题，复审全部修复）
    * Issue-01: TemplateSelector集成到HomePage ✅
    * Issue-02: Design Tokens违规（7处硬编码颜色）✅
      - Toast.tsx（4处）：改用bg-success/10等
      - HomePage.tsx（1处）：改用var(--color-bg-light)
      - global.css（2处）：新增--color-scrollbar Token
    * Issue-03: select类型变量未实现 ✅
    * Issue-04: 导出功能未实现（Word/PDF）✅
    * Issue-05: 政策文件下载功能未实现 ✅
    * Issue-06: TemplateSelector缺少onSelect回调 ✅（Frontend-Developer已修复，HomePage已传入埋点回调）
  - ✅ Phase 4质量审查（初版2个问题，复审全部修复）
    * Issue-07: Task-022政策智能推荐逻辑不完整 ✅（PolicyFilter新增smartRecommend字段+按钮）
    * Issue-08: Task-025方案对比功能未实现 ✅（SolutionComparator.tsx已创建261行）
  - ✅ Phase 1 QA测试报告（Task-005，302行，27单元+6浏览器测试，33/33用例通过）
  - ✅ PM质量审查报告（Phase 1/2/3/4）
  - ✅ Designer设计规范审查（通过，10章节全覆盖）
  - ✅ Designer架构方案设计一致性审查（9项通过，5项差异发现）
  - ✅ 项目看板建立（docs/07-项目管理/项目看板.md）
  - ✅ PM角色边界优化（product-manager.json规则25-29，AGENTS.md全局铁律）
  - ✅ Phase 4需求规格（8个任务，P0: 4个+P1: 4个，总工作量15天）
  - ✅ Phase 3 QA测试计划（30个用例，5天完成）
  - ✅ Phase 3 QA测试报告（72.7%通过率，4个Bug已修复待验证：BUG-001~004）
  - ✅ Phase 2 QA测试计划（11个用例，简化版，生成中）
  - ✅ PM+QA双审查机制确立（每个Phase必须双审查通过）
- **下周计划**：
  - [ ] QA回归测试Phase 3（验证BUG-001~004修复）
  - [ ] Phase 3 QA通过后，执行Phase 4 QA测试
  - [ ] Phase 2 QA测试计划生成完成，转发QA执行
  - [ ] Phase 3+4双审查通过后，进入Phase 5

---

## 🎯 核心经验

### 经验1：防幻觉优先

**描述**：所有代码写入前必须验证API存在

**操作步骤**：
1. read_file查看模块源码
2. search_codebase搜索使用示例
3. 确认API签名后再调用

**注意事项**：
- 禁止凭经验假设API存在
- 不确定时必须询问用户
- 记录到api-index.md

---

### 经验2：上下文精准控制

**描述**：按任务复杂度分配上下文预算，避免token浪费

**操作步骤**：
1. 判断任务类型（小/中/大）
2. 匹配routes.json路由
3. 按预算加载文档（15-20%/25-35%/40-50%）

**注意事项**：
- 禁止全盘扫描整个项目
- 必须加载核心文档（hallucination-prevention.md等）
- 超过预算必须缩小范围

---

### 经验3：强制检查点

**描述**：所有关键操作必须经过检查清单验证

**检查清单**：
- 代码修改前（4项）
- 代码修改后（5项）
- Git提交前（6项）
- 部署前（6项）

**注意事项**：
- 缺少任何一项 = 违规
- 必须输出检查结果
- 发现问题立即修复

---

## 🚨 高频踩坑（从旧项目继承）

### 踩坑1：API幻觉

- **问题**：db.createCollection()不存在
- **解决**：使用cloud.database().createCollection()
- **预防**：已添加到api-index.md和hallucination-prevention.md

### 踩坑2：数据丢失

- **问题**：add(doc)缺少{data:}包装，静默失败
- **解决**：add({data: doc})
- **预防**：已添加到api-index.md和检查清单

### 踩坑3：部署失败

- **问题**：PowerShell打包不兼容腾讯云
- **解决**：使用_deploy/pack_*.py脚本
- **预防**：已添加到code-quality.md和检查清单

### 踩坑4：代码混乱

- **问题**：replace_in_file不彻底，新旧版本并存
- **解决**：old_str包含完整代码块，替换后验证
- **预防**：已添加到code-quality.md和检查清单

---

*本文档事件驱动更新，保持项目知识持续沉淀。*
