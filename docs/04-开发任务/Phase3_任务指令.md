# Phase 3 任务指令 - 核心功能开发

> **生成角色**: 产品经理 (PM)  
> **生成日期**: 2026-05-03  
> **前置条件**: Phase 2审查通过（Design Tokens/组件库/首页重构完成）  
> **执行角色**: frontend-developer + developer  
> **预计工期**: 14天（10个工作日）

---

## 📋 任务概览

| 任务ID | 任务名称 | 优先级 | 复杂度 | 负责人 | 依赖关系 | 预计工期 |
|--------|---------|--------|--------|--------|---------|---------|
| Task-012 | 模板数据模型定义 | P0 | 低 | developer | 无 | 1天 |
| Task-013 | 模板列表页开发 | P0 | 高 | frontend-developer | Task-012 | 3天 |
| Task-014 | 模板预览组件 | P0 | 中 | frontend-developer | Task-013 | 2天 |
| Task-015 | 模板选择器 | P0 | 高 | frontend-developer | Task-014 | 2天 |
| Task-016 | 变量插入编辑器 | P0 | 高 | frontend-developer | Task-015 | 3天 |
| Task-017 | 政策数据模型定义 | P0 | 低 | developer | 无 | 1天 |
| Task-018 | 政策分类检索系统 | P0 | 高 | frontend-developer | Task-017 | 3天 |
| Task-019 | 政策在线预览 | P1 | 中 | frontend-developer | Task-018 | 2天 |
| Task-020 | 收藏夹功能 | P1 | 中 | frontend-developer | Task-013, 018 | 2天 |

**总工期**: 14天（可并行执行Task-012与Task-017）

---

## 🔧 任务执行顺序

```
Task-012 (模板数据模型) ──→ Task-013 (模板列表) ──→ Task-014 (模板预览)
                                                      ↓
Task-017 (政策数据模型) ──→ Task-018 (政策检索) ──→ Task-015 (模板选择器) ──→ Task-016 (变量编辑器)
                              ↓                                              ↓
                          Task-019 (政策预览)                          Task-020 (收藏夹) ←──┘
```

**并行策略**：
- Task-012（模板模型）和Task-017（政策模型）可并行开发
- Task-013（模板列表）和Task-018（政策检索）可并行开发
- Task-020（收藏夹）依赖模板列表和政策检索，最后完成

---

## 🎯 详细任务指令

### Task-012: 模板数据模型定义

**任务信息**：
- **任务ID**: Task-012
- **优先级**: P0
- **复杂度**: 低
- **负责人**: developer
- **预计工期**: 1天

**输入文档**：
- `docs/01-需求文档/V3.0_需求规格说明书.md`（第四章 数据模型 - 4.1节）
- `docs/02-设计与规范/V3.0_设计规范文档.md`

**输出要求**：
1. `src/types/template.types.ts` - 模板数据类型定义
2. `src/data/templates.ts` - 初始模板数据（≥8个标准模板）

**验收标准**：
- ✅ Template接口完整（id/name/category/content/variables等12个字段）
- ✅ TemplateCategory枚举完整（PROCUREMENT/CONSOLATION/REQUEST/APPROVAL）
- ✅ TemplateVariable接口完整（key/label/type/required等6个字段）
- ✅ 创建≥8个初始模板数据（覆盖4个分类）
- ✅ 每个模板包含≥10个变量定义

**任务指令**：
```
请定义模板数据模型：

1. 创建src/types/template.types.ts：
   - Template接口：
     * id: string
     * name: string
     * category: TemplateCategory
     * description: string
     * content: string（含变量占位符如${单位名称}）
     * variables: TemplateVariable[]
     * previewUrl: string
     * usageCount: number
     * isFavorite: boolean
     * createdAt: Date
     * updatedAt: Date
   
   - TemplateCategory枚举：
     * PROCUREMENT = 'procurement'（采购方案）
     * CONSOLATION = 'consolation'（慰问方案）
     * REQUEST = 'request'（请示报告）
     * APPROVAL = 'approval'（批复文件）
   
   - TemplateVariable接口：
     * key: string（变量名）
     * label: string（变量说明）
     * type: 'text' | 'number' | 'date' | 'select'
     * required: boolean
     * defaultValue?: string
     * options?: string[]（select类型选项）

2. 创建src/data/templates.ts：
   - 初始化≥8个模板：
     * 采购方案（2个）：标准采购方案、紧急采购方案
     * 慰问方案（2个）：春节慰问方案、帮扶慰问方案
     * 请示报告（2个）：经费请示、活动请示
     * 批复文件（2个）：批复通知、批复意见
   - 每个模板包含：
     * 完整的content内容（使用变量占位符）
     * ≥10个variables定义
     * 合理的description说明

3. 确保TypeScript类型完整，无any类型
```

---

### Task-013: 模板列表页开发

**任务信息**：
- **任务ID**: Task-013
- **优先级**: P0
- **复杂度**: 高
- **负责人**: frontend-developer
- **预计工期**: 3天

**输入文档**：
- `docs/01-需求文档/V3.0_需求规格说明书.md`（2.3节 公文模板库）
- `src/types/template.types.ts`（Task-012产出）
- `src/data/templates.ts`（Task-012产出）
- `src/components/common/`（Phase 2产出的组件库）

**输出要求**：
1. `src/pages/template/TemplateListPage.tsx` - 模板列表页
2. `src/components/template/TemplateCard.tsx` - 模板卡片组件
3. `src/components/template/TemplateFilter.tsx` - 模板筛选组件

**验收标准**：
- ✅ 模板列表按分类展示（4个分类Tab）
- ✅ 支持模板搜索（按名称/场景）
- ✅ 支持模板排序（按使用频率/更新时间）
- ✅ 模板卡片显示：名称、描述、使用次数、收藏状态
- ✅ 100%使用Design Tokens（色彩/间距/字体）
- ✅ 100%使用Lucide图标（无Emoji）
- ✅ 响应式布局（移动端单列，桌面端双列）
- ✅ 骨架屏加载状态

**任务指令**：
```
请开发模板列表页：

1. 创建src/pages/template/TemplateListPage.tsx：
   - 页面结构：
     * 顶部：页面标题 + 搜索框
     * 中部：分类Tab（全部/采购方案/慰问方案/请示报告/批复文件）
     * 主体：模板网格列表
     * 底部：排序选择器（使用频率/更新时间）
   
   - 功能实现：
     * 从src/data/templates.ts加载模板数据
     * 分类过滤：点击Tab切换显示对应分类模板
     * 搜索功能：实时搜索模板名称和描述
     * 排序功能：支持按usageCount和updatedAt排序
     * 加载状态：使用Skeleton组件展示骨架屏

2. 创建src/components/template/TemplateCard.tsx：
   - 使用Phase 2的Card组件作为基础
   - 显示内容：
     * 模板名称（H3字号）
     * 模板描述（body2字号，灰色）
     * 使用次数（Lucide图标 + 数字）
     * 收藏图标（Lucide Star，可切换）
   - 交互：
     * 点击卡片 → 导航到模板详情页
     * 点击收藏图标 → 切换收藏状态
   - 样式：
     * 使用Card组件的variant="hover"
     * hover时显示阴影（--shadow-md）

3. 创建src/components/template/TemplateFilter.tsx：
   - 搜索框组件：
     * 使用Phase 2的Input组件
     * 带搜索图标（Lucide Search）
     * 实时搜索（防抖300ms）
   - 分类Tab组件：
     * 使用Phase 2的Button组件（variant="ghost"）
     * 激活状态使用variant="primary"

4. 路由配置：
   - 在src/App.tsx中添加路由：/templates → TemplateListPage

5. 使用Design Tokens：
   - 所有颜色使用var(--color-*)
   - 所有间距使用var(--spacing-*)
   - 所有字号使用var(--font-size-*)

6. 无障碍支持：
   - 搜索框添加aria-label="搜索模板"
   - 分类Tab添加role="tablist"
   - 模板卡片添加role="article"
```

---

### Task-014: 模板预览组件

**任务信息**：
- **任务ID**: Task-014
- **优先级**: P0
- **复杂度**: 中
- **负责人**: frontend-developer
- **预计工期**: 2天

**输入文档**：
- `src/types/template.types.ts`
- `src/components/common/Modal/Modal.tsx`（Phase 2产出）

**输出要求**：
1. `src/components/template/TemplatePreview.tsx` - 模板预览组件
2. `src/components/template/TemplatePreviewModal.tsx` - 预览弹窗

**验收标准**：
- ✅ 弹窗展示模板完整内容
- ✅ 支持变量高亮显示（橙色背景）
- ✅ 加载时间<1s
- ✅ 支持ESC键关闭弹窗
- ✅ 响应式布局（移动端全屏，桌面端最大宽度800px）

**任务指令**：
```
请开发模板预览组件：

1. 创建src/components/template/TemplatePreview.tsx：
   - 功能：
     * 渲染模板content内容
     * 高亮显示变量（使用橙色背景：--color-warning）
     * 变量格式：${变量名} → <span class="variable-highlight">${变量名}</span>
   
   - 样式：
     * 使用白色背景卡片
     * 内边距：--spacing-lg
     * 字体：--font-size-body1
     * 行高：--line-height-loose
   
   - 变量高亮样式：
     .variable-highlight {
       background-color: var(--color-warning);
       color: white;
       padding: 2px 6px;
       border-radius: var(--radius-sm);
       font-weight: 600;
     }

2. 创建src/components/template/TemplatePreviewModal.tsx：
   - 使用Phase 2的Modal组件
   - 弹窗结构：
     * 标题：模板名称
     * 内容：TemplatePreview组件
     * 底部操作按钮：
       - "取消"（variant="ghost"）
       - "选择此模板"（variant="primary"）
   
   - 交互：
     * 点击"选择此模板" → 关闭弹窗 → 触发onSelect回调
     * 点击"取消"或ESC → 关闭弹窗
   
   - 加载优化：
     * 弹窗打开时预加载模板数据
     * 显示Skeleton加载状态
     * 确保加载时间<1s

3. 集成到TemplateCard：
   - TemplateCard添加"预览"按钮
   - 点击按钮 → 打开TemplatePreviewModal
   - 传递template数据给Modal

4. 无障碍支持：
   - Modal添加aria-label="模板预览"
   - 变量高亮添加role="mark"
   - 按钮添加aria-label
```

---

### Task-015: 模板选择器

**任务信息**：
- **任务ID**: Task-015
- **优先级**: P0
- **复杂度**: 高
- **负责人**: frontend-developer
- **预计工期**: 2天

**输入文档**：
- `docs/01-需求文档/V3.0_需求规格说明书.md`（2.3.3节 交互流程）
- `src/components/template/TemplateListPage.tsx`（Task-013产出）
- `src/components/template/TemplatePreviewModal.tsx`（Task-014产出）

**输出要求**：
1. `src/components/template/TemplateSelector.tsx` - 模板选择器组件
2. 集成到首页"制定采购方案"按钮

**验收标准**：
- ✅ 从选择到确认≤3步操作
- ✅ 支持分类筛选和搜索
- ✅ 选择后自动填充表单数据
- ✅ 使用Phase 2组件库

**任务指令**：
```
请开发模板选择器：

1. 创建src/components/template/TemplateSelector.tsx：
   - 选择流程（≤3步）：
     * Step 1: 展示模板列表（分类Tab + 搜索框）
     * Step 2: 点击模板 → 弹出预览Modal
     * Step 3: 点击"选择此模板" → 确认选择
   
   - 组件结构：
     * 使用TemplateListPage的列表逻辑
     * 使用TemplatePreviewModal的预览功能
     * 添加onSelect回调函数
   
   - 状态管理：
     * selectedTemplate: Template | null
     * isPreviewOpen: boolean
     * searchQuery: string
     * activeCategory: TemplateCategory | 'all'

2. 集成到首页：
   - 修改src/pages/desktop/HomePage.tsx
   - "制定采购方案"按钮点击事件：
     * 打开TemplateSelector
     * 用户选择模板后 → 导航到/solution页面
     * 传递selectedTemplate到solution页面（使用location.state）
   
   - 路由配置：
     * 首页 → 点击按钮 → TemplateSelector → /solution?templateId=xxx

3. 用户体验优化：
   - 选择器打开时自动聚焦搜索框
   - 最近使用的模板置顶显示
   - 收藏的模板优先显示
   - 选择后显示Toast成功提示

4. 无障碍支持：
   - 选择器添加role="dialog"
   - 步骤提示添加aria-live="polite"
```

---

### Task-016: 变量插入编辑器

**任务信息**：
- **任务ID**: Task-016
- **优先级**: P0
- **复杂度**: 高
- **负责人**: frontend-developer
- **预计工期**: 3天

**输入文档**：
- `src/types/template.types.ts`（TemplateVariable接口）
- `src/components/template/TemplateSelector.tsx`（Task-015产出）

**输出要求**：
1. `src/components/template/VariableEditor.tsx` - 变量编辑器组件
2. `src/pages/solution/SolutionEditorPage.tsx` - 方案编辑页

**验收标准**：
- ✅ 支持≥10个变量编辑
- ✅ 支持4种变量类型（text/number/date/select）
- ✅ 实时预览填充效果
- ✅ 表单验证（必填项校验）
- ✅ 支持导出Word/PDF

**任务指令**：
```
请开发变量插入编辑器：

1. 创建src/components/template/VariableEditor.tsx：
   - 功能：
     * 接收template.variables数组
     * 根据变量类型渲染不同输入组件：
       - text: Input组件（文本输入）
       - number: Input组件（type="number"）
       - date: Input组件（type="date"）
       - select: Select组件（下拉选择）
     * 实时预览：右侧显示填充后的模板内容
   
   - 表单验证：
     * 必填项标记红色星号（*）
     * 失焦时验证（onBlur）
     * 提交时全量验证
     * 显示错误提示（使用Toast error类型）
   
   - 布局：
     * 左侧：变量表单（60%宽度）
     * 右侧：实时预览（40%宽度）
     * 移动端：上下布局

2. 创建src/pages/solution/SolutionEditorPage.tsx：
   - 页面结构：
     * 顶部：模板名称 + 返回按钮
     * 主体：VariableEditor组件
     * 底部：操作按钮（保存/导出/取消）
   
   - 功能：
     * 从location.state获取selectedTemplate
     * 用户填写变量 → 实时预览
     * 点击"保存" → 保存到localStorage
     * 点击"导出" → 生成Word/PDF（使用docx/jspdf库）
   
   - 导出功能：
     * 安装依赖：npm install docx jspdf
     * Word导出：使用docx库生成.docx文件
     * PDF导出：使用jspdf库生成.pdf文件
     * 文件名格式：{模板名称}_{日期}.{ext}

3. 变量表单组件：
   - 每个变量表单包含：
     * 标签：variable.label
     * 输入框：根据type渲染
     * 错误提示：验证失败时显示
     * 默认值：variable.defaultValue
   
   - 使用Phase 2的Input组件
   - 必填项添加aria-required="true"

4. 实时预览：
   - 使用TemplatePreview组件
   - 将用户填写的值替换到content中
   - 变量替换逻辑：
     * content.replace(/\$\{变量名\}/g, 用户输入值)

5. 数据持久化：
   - 自动保存：每30秒保存到localStorage
   - 手动保存：点击"保存"按钮
   - 加载时恢复：从localStorage读取草稿

6. 无障碍支持：
   - 表单添加aria-label
   - 错误提示添加aria-describedby
   - 必填项添加aria-required
```

---

### Task-017: 政策数据模型定义

**任务信息**：
- **任务ID**: Task-017
- **优先级**: P0
- **复杂度**: 低
- **负责人**: developer
- **预计工期**: 1天

**输入文档**：
- `docs/01-需求文档/V3.0_需求规格说明书.md`（第四章 数据模型 - 4.2节）

**输出要求**：
1. `src/types/policy.types.ts` - 政策数据类型定义
2. `src/data/policies.ts` - 初始政策数据（≥10个政策文件）

**验收标准**：
- ✅ Policy接口完整（id/title/category/scene/year/level等14个字段）
- ✅ PolicyCategory枚举完整（NATIONAL/LOCAL/INDUSTRY）
- ✅ PolicyScene枚举完整（HOLIDAY/ACTIVITY/CARE）
- ✅ PolicyLevel枚举完整（MANDATORY/SUGGESTION/REFERENCE）
- ✅ 创建≥10个初始政策数据（覆盖所有分类和场景）

**任务指令**：
```
请定义政策数据模型：

1. 创建src/types/policy.types.ts：
   - Policy接口：
     * id: string
     * title: string
     * category: PolicyCategory
     * scene: PolicyScene[]
     * year: number
     * level: PolicyLevel
     * content: string
     * fileUrl: string
     * fileSize: number
     * fileType: 'pdf' | 'word' | 'txt'
     * keyPoints: string[]（合规要点）
     * summary: string（政策摘要）
     * isFavorite: boolean
     * viewCount: number
     * createdAt: Date
     * updatedAt: Date
   
   - PolicyCategory枚举：
     * NATIONAL = 'national'（国家政策）
     * LOCAL = 'local'（地方政策）
     * INDUSTRY = 'industry'（行业规范）
   
   - PolicyScene枚举：
     * HOLIDAY = 'holiday'（节日慰问）
     * ACTIVITY = 'activity'（专项活动）
     * CARE = 'care'（精准帮扶）
   
   - PolicyLevel枚举：
     * MANDATORY = 'mandatory'（强制）
     * SUGGESTION = 'suggestion'（建议）
     * REFERENCE = 'reference'（参考）

2. 创建src/data/policies.ts：
   - 初始化≥10个政策文件：
     * 国家政策（4个）：覆盖节日慰问/专项活动/帮扶慰问
     * 地方政策（3个）：覆盖不同场景
     * 行业规范（3个）：覆盖不同合规等级
   - 每个政策包含：
     * 完整的content内容
     * ≥3个keyPoints（合规要点）
     * summary摘要
     * 合理的fileUrl（可使用占位符）

3. 确保TypeScript类型完整，无any类型
```

---

### Task-018: 政策分类检索系统

**任务信息**：
- **任务ID**: Task-018
- **优先级**: P0
- **复杂度**: 高
- **负责人**: frontend-developer
- **预计工期**: 3天

**输入文档**：
- `docs/01-需求文档/V3.0_需求规格说明书.md`（2.4节 政策文件分类检索系统）
- `src/types/policy.types.ts`（Task-017产出）
- `src/data/policies.ts`（Task-017产出）

**输出要求**：
1. `src/pages/policy/PolicyListPage.tsx` - 政策列表页
2. `src/components/policy/PolicyCard.tsx` - 政策卡片组件
3. `src/components/policy/PolicyFilter.tsx` - 政策筛选组件（4维度）

**验收标准**：
- ✅ 支持4维度分类筛选（类型/场景/年份/合规等级）
- ✅ 全文检索（标题+内容）响应时间<500ms
- ✅ 高级筛选支持多条件组合
- ✅ 搜索结果关键词高亮
- ✅ 响应式布局

**任务指令**：
```
请开发政策分类检索系统：

1. 创建src/pages/policy/PolicyListPage.tsx：
   - 页面结构：
     * 顶部：页面标题 + 搜索框
     * 左侧：高级筛选面板（4维度）
     * 主体：政策列表
     * 右侧：搜索结果统计
   
   - 功能实现：
     * 从src/data/policies.ts加载政策数据
     * 全文检索：搜索title和content字段
     * 高级筛选：
       - 政策类型：多选（NATIONAL/LOCAL/INDUSTRY）
       - 适用场景：多选（HOLIDAY/ACTIVITY/CARE）
       - 发布年份：单选（2024/2025/2026）
       - 合规等级：单选（MANDATORY/SUGGESTION/REFERENCE）
     * 多条件组合：AND逻辑
     * 搜索结果统计：显示"找到X个政策"

2. 创建src/components/policy/PolicyCard.tsx：
   - 使用Phase 2的Card组件
   - 显示内容：
     * 政策标题（H3字号）
     * 政策摘要（body2字号，2行截断）
     * 标签：类型、场景、年份、合规等级
     * 浏览次数（Lucide图标 + 数字）
     * 收藏图标（Lucide Star）
   
   - 标签样式：
     * 使用不同颜色区分：
       - 类型：蓝色（--color-info）
       - 场景：绿色（--color-success）
       - 年份：灰色（--color-text-secondary）
       - 合规等级：红色（--color-error，仅MANDATORY）
   
   - 交互：
     * 点击卡片 → 导航到政策详情页
     * 点击收藏图标 → 切换收藏状态

3. 创建src/components/policy/PolicyFilter.tsx：
   - 筛选面板结构：
     * 4个筛选维度（使用Phase 2的Input和Button组件）
     * 每个维度支持多选/单选
     * "重置"按钮清空所有筛选条件
   
   - 搜索框：
     * 使用Input组件
     * 带搜索图标（Lucide Search）
     * 实时搜索（防抖300ms）
     * 搜索结果高亮关键词（使用mark标签）

4. 搜索性能优化：
   - 使用防抖（debounce 300ms）
   - 确保响应时间<500ms
   - 大数据量时使用虚拟列表（可选）

5. 路由配置：
   - 在src/App.tsx中添加路由：/policies → PolicyListPage

6. 无障碍支持：
   - 筛选面板添加aria-label="政策筛选"
   - 搜索框添加aria-label="搜索政策"
   - 结果统计添加aria-live="polite"
```

---

### Task-019: 政策在线预览

**任务信息**：
- **任务ID**: Task-019
- **优先级**: P1
- **复杂度**: 中
- **负责人**: frontend-developer
- **预计工期**: 2天

**输入文档**：
- `src/types/policy.types.ts`
- `src/components/common/Modal/Modal.tsx`

**输出要求**：
1. `src/components/policy/PolicyViewer.tsx` - 政策预览组件
2. `src/pages/policy/PolicyDetailPage.tsx` - 政策详情页

**验收标准**：
- ✅ 支持3种格式预览（PDF/Word/TXT）
- ✅ 支持重点标注功能
- ✅ 支持下载政策文件
- ✅ 合规要点侧边栏展示

**任务指令**：
```
请开发政策在线预览功能：

1. 创建src/components/policy/PolicyViewer.tsx：
   - 功能：
     * 根据fileType渲染不同预览方式：
       - pdf: 使用PDF.js预览（npm install pdfjs-dist）
       - word: 显示下载按钮（浏览器不支持在线预览）
       - txt: 直接渲染文本内容
     * 右侧显示合规要点（keyPoints）
     * 支持重点标注（用户点击文本 → 高亮）
   
   - 布局：
     * 左侧：政策内容（70%宽度）
     * 右侧：合规要点侧边栏（30%宽度）
     * 移动端：上下布局

2. 创建src/pages/policy/PolicyDetailPage.tsx：
   - 页面结构：
     * 顶部：政策标题 + 返回按钮 + 下载按钮
     * 主体：PolicyViewer组件
     * 底部：操作按钮（收藏/分享/下载）
   
   - 功能：
     * 从URL参数获取policyId
     * 从src/data/policies.ts加载政策数据
     * 下载功能：
       - 使用fileUrl下载文件
       - 文件名格式：{政策标题}.{fileType}
     * 收藏功能：
       - 切换isFavorite状态
       - 保存到localStorage

3. 合规要点侧边栏：
   - 显示policy.keyPoints数组
   - 每个要点带序号
   - 使用绿色标记（--color-success）
   - 点击要点 → 滚动到政策内容对应位置

4. 重点标注功能：
   - 用户选中文本 → 弹出"标注"按钮
   - 点击标注 → 文本高亮（黄色背景）
   - 标注数据保存到localStorage

5. 下载功能：
   - 使用<a>标签的download属性
   - 或使用file-saver库（npm install file-saver）
   - 下载前显示Toast提示

6. 无障碍支持：
   - 预览区域添加aria-label="政策内容"
   - 合规要点添加role="list"
   - 下载按钮添加aria-label="下载政策文件"
```

---

### Task-020: 收藏夹功能

**任务信息**：
- **任务ID**: Task-020
- **优先级**: P1
- **复杂度**: 中
- **负责人**: frontend-developer
- **预计工期**: 2天

**输入文档**：
- `src/types/template.types.ts`
- `src/types/policy.types.ts`
- `src/components/template/TemplateCard.tsx`（Task-013产出）
- `src/components/policy/PolicyCard.tsx`（Task-018产出）

**输出要求**：
1. `src/hooks/useFavorites.ts` - 收藏夹Hook
2. `src/pages/favorites/FavoritesPage.tsx` - 收藏夹页面
3. `src/components/favorites/FavoriteItem.tsx` - 收藏项组件

**验收标准**：
- ✅ 支持收藏模板和政策（≥50个）
- ✅ 收藏数据持久化（localStorage）
- ✅ 收藏夹页面分类展示
- ✅ 支持取消收藏
- ✅ 收藏状态实时同步

**任务指令**：
```
请开发收藏夹功能：

1. 创建src/hooks/useFavorites.ts：
   - 功能：
     * 管理收藏数据（模板 + 政策）
     * 使用localStorage持久化
     * 提供API：
       - addFavorite(type, id): 添加收藏
       - removeFavorite(type, id): 取消收藏
       - isFavorite(type, id): 判断是否收藏
       - getFavorites(type): 获取收藏列表
       - clearFavorites(): 清空收藏
   
   - 数据结构：
     interface FavoriteItem {
       type: 'template' | 'policy';
       id: string;
       addedAt: Date;
     }
   
   - localStorage key: 'taocang-favorites'
   - 存储格式：JSON数组

2. 创建src/pages/favorites/FavoritesPage.tsx：
   - 页面结构：
     * 顶部：页面标题 + 收藏数量统计
     * 中部：分类Tab（全部/模板/政策）
     * 主体：收藏列表
     * 空状态：无收藏时显示提示
   
   - 功能：
     * 加载收藏数据
     * 分类过滤
     * 取消收藏功能
     * 点击收藏项 → 导航到详情页
   
   - 空状态：
     * 使用Lucide StarOff图标
     * 提示文字："暂无收藏，快去添加吧"
     * 引导按钮："浏览模板" / "浏览政策"

3. 创建src/components/favorites/FavoriteItem.tsx：
   - 根据type渲染不同组件：
     * template: 使用TemplateCard
     * policy: 使用PolicyCard
   
   - 添加"取消收藏"按钮：
     * 使用Lucide X图标
     * 点击后弹出ConfirmModal确认
     * 确认后调用removeFavorite

4. 集成到TemplateCard和PolicyCard：
   - 修改TemplateCard：
     * 使用useFavorites hook
     * 收藏图标点击 → 调用addFavorite/removeFavorite
     * 实时同步收藏状态
   
   - 修改PolicyCard：
     * 同上

5. 收藏数量限制：
   - 最多收藏50个（模板+政策总计）
   - 超过限制时显示Toast警告
   - 提示用户取消部分收藏

6. 路由配置：
   - 在src/App.tsx中添加路由：/favorites → FavoritesPage

7. 导航栏添加收藏入口：
   - 在首页导航栏添加"我的收藏"链接
   - 显示收藏数量徽章

8. 无障碍支持：
   - 收藏按钮添加aria-label="收藏"
   - 取消收藏按钮添加aria-label="取消收藏"
   - 空状态添加role="status"
```

---

## 📊 验收标准汇总

### 功能验收

| 任务ID | 核心功能 | 验收标准 |
|--------|---------|---------|
| Task-012 | 模板数据模型 | ≥8个模板，≥10个变量/模板 |
| Task-013 | 模板列表页 | 分类/搜索/排序/响应式 |
| Task-014 | 模板预览 | 弹窗预览<1s，变量高亮 |
| Task-015 | 模板选择器 | ≤3步操作，自动填充 |
| Task-016 | 变量编辑器 | ≥10个变量，4种类型，导出Word/PDF |
| Task-017 | 政策数据模型 | ≥10个政策，覆盖所有分类 |
| Task-018 | 政策检索 | 4维度筛选，响应<500ms |
| Task-019 | 政策预览 | 3种格式，合规要点，下载 |
| Task-020 | 收藏夹 | ≥50个收藏，持久化，实时同步 |

### 技术验收

| 维度 | 标准 | 检查项 |
|------|------|--------|
| Design Tokens | 100%使用 | 无硬编码颜色/间距/字体 |
| Lucide图标 | 100%使用 | 无Emoji |
| TypeScript | 类型完整 | 无any类型 |
| 无障碍支持 | WCAG AA | aria-*属性完整 |
| 响应式布局 | 移动端/桌面端 | 断点适配 |
| 性能 | 响应时间 | 搜索<500ms，加载<1s |
| 组件复用 | 使用Phase 2组件 | Button/Input/Card/Modal/Toast/Skeleton |

---

## ⚠️ 注意事项

### 必须遵守

1. **100%使用Design Tokens** - 禁止硬编码颜色/间距/字体
2. **100%使用Lucide图标** - 禁止使用Emoji
3. **TypeScript类型完整** - 禁止使用any类型
4. **使用Phase 2组件库** - 禁止重复开发基础组件
5. **无障碍支持** - 所有交互元素添加aria-*属性
6. **响应式设计** - 支持移动端和桌面端

### 开发顺序

1. 先完成数据模型（Task-012、Task-017）
2. 再开发列表页（Task-013、Task-018）
3. 然后开发详情页（Task-014、Task-019）
4. 最后开发高级功能（Task-015、Task-016、Task-020）

### 数据持久化

- 收藏数据：localStorage（key: 'taocang-favorites'）
- 草稿数据：localStorage（key: 'taocang-drafts'）
- 用户偏好：localStorage（key: 'taocang-preferences'）

### 性能要求

- 首屏加载时间 <2s
- 搜索响应时间 <500ms
- 模板预览加载 <1s
- 构建体积 <5MB（gzip）

---

## 📝 交付物清单

### 类型定义
- [ ] `src/types/template.types.ts`
- [ ] `src/types/policy.types.ts`

### 数据文件
- [ ] `src/data/templates.ts`
- [ ] `src/data/policies.ts`

### 页面组件
- [ ] `src/pages/template/TemplateListPage.tsx`
- [ ] `src/pages/solution/SolutionEditorPage.tsx`
- [ ] `src/pages/policy/PolicyListPage.tsx`
- [ ] `src/pages/policy/PolicyDetailPage.tsx`
- [ ] `src/pages/favorites/FavoritesPage.tsx`

### 业务组件
- [ ] `src/components/template/TemplateCard.tsx`
- [ ] `src/components/template/TemplateFilter.tsx`
- [ ] `src/components/template/TemplatePreview.tsx`
- [ ] `src/components/template/TemplatePreviewModal.tsx`
- [ ] `src/components/template/TemplateSelector.tsx`
- [ ] `src/components/template/VariableEditor.tsx`
- [ ] `src/components/policy/PolicyCard.tsx`
- [ ] `src/components/policy/PolicyFilter.tsx`
- [ ] `src/components/policy/PolicyViewer.tsx`
- [ ] `src/components/favorites/FavoriteItem.tsx`

### Hooks
- [ ] `src/hooks/useFavorites.ts`

---

**任务生成完毕**  
**下一步**：交由frontend-developer和developer角色执行，完成后由PM进行Phase 3质量审查。
