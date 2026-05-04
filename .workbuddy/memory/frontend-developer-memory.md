# Frontend-Developer角色记忆

> 最后更新：2026-05-03
> 角色：Frontend Developer（前端开发工程师）

---

## 📊 当前任务状态

### 进行中的任务
- [ ] 无

### 已完成的任务
- [x] Phase 1: 基础修复（Task-001~005）- 2026-05-03
- [x] Phase 2: 设计系统重建（Task-006~011）- 2026-05-03
- [x] Phase 3: 核心功能开发 Task-013~016（模板列表/预览/选择器/变量编辑器）- 2026-05-03
- [x] Phase 3: 核心功能开发 Task-018~020（政策检索/政策预览/收藏夹）- 2026-05-03
- [x] Phase 3 PM反馈修复（Issue-06 + TypeScript清理）- 2026-05-03
- [x] Phase 4: 交互体验优化 Task-021~028（草稿保存/政策推荐/模板推荐/新手引导/方案对比/收藏快捷/智能填充/导出预览）- 2026-05-03
- [x] Phase 4 PM审查修复（Issue-07政策智能推荐 + Issue-08方案对比组件路径）- 2026-05-04
- [x] Bug修复（BUG-001~004：变量预览占位符/政策导航路径/场景筛选逻辑/预览组件集成）- 2026-05-04

### 阻塞的任务
- [ ] 无

---

## 🎯 技术决策

### 决策1：Design Tokens CSS变量架构
- **时间**：2026-05-03
- **内容**：使用三层Token架构（primitive→semantic→component），通过:root CSS变量定义，Tailwind配置引用变量
- **原因**：实现设计规范到代码的1:1映射，支持主题切换
- **影响**：所有组件样式必须引用CSS变量，禁止硬编码

### 决策2：Lucide图标全量替换Emoji
- **时间**：2026-05-03
- **内容**：建立icon-mapping.md映射表，所有组件使用命名导入
- **原因**：V3.0去AI化，提升专业感
- **影响**：Tree-shaking配置需验证，禁止全量导入

---

## 🚨 Frontend-Developer专属踩坑

### 踩坑1：jest-dom类型声明缺失
- **问题**：src/components/**/*.test.tsx 中 toBeInTheDocument() 等匹配器报类型错误
- **解决**：在 src/vite-env.d.ts 中添加 `/// <reference types="@testing-library/jest-dom" />`
- **预防**：所有新测试文件如需jest-dom匹配器，确保类型声明文件已加载

### 踩坑2：jest testMatch未匹配src/**/*.test.tsx
- **问题**：组件测试文件放在 src/components/common/Button/Button.test.tsx 但jest找不到
- **解决**：jest.config.cjs 的 testMatch 添加 `<rootDir>/src/**/*.test.{ts,tsx}`
- **预防**：修改jest配置后需重新运行测试验证

### 踩坑3：TypeScript未使用导入导致`tsc --noEmit`报错
- **问题**：20个文件存在未使用的导入（React、MouseEvent、ReactNode、ToastOptions、fireEvent、PolicyCategory/PolicyLevel、formatDate函数）
- **解决**：批量清理19个文件中的未使用导入/变量
- **预防**：提交前必须执行 `npx tsc --noEmit`，确保0 errors

### 踩坑4：main.tsx重复引入CSS文件
- **问题**：main.tsx直接import了tokens.css和global.css，而index.css又通过@import引入了它们
- **解决**：main.tsx只保留 `import './index.css'`，index.css中按顺序@import所有样式文件
- **预防**：CSS入口统一管理，避免重复加载

### 踩坑5：useSmartFill.ts的suggestedValues导致无限重渲染
- **问题**：`suggestedValues` 使用IIFE计算，每次渲染返回新对象引用；SolutionEditorPage的useEffect依赖suggestedValues，触发setValues → 重新渲染 → 新对象 → 无限循环
- **解决**：用 `useMemo` 包裹 suggestedValues 计算，稳定引用；SolutionEditorPage添加 `initGuardRef` 防止重复初始化
- **预防**：Hook中派生状态必须用useMemo/useCallback稳定引用；页面初始化逻辑加守卫防止重复执行
- **来源**：QA E2E测试发现 BUG-006 - 2026-05-04

---

### 实现6：Phase 4交互体验优化（Task-021~028）
- **技术方案**：8个任务分三批执行，全部基于localStorage持久化，无后端依赖
- **关键代码**：
  - Task-021: src/hooks/useDraftSave.ts + src/components/draft/DraftRestoreModal.tsx
  - Task-022: src/pages/policy/PolicyListPage.tsx（智能推荐排序+推荐标签）
  - Task-023: src/types/template.types.ts（TemplateScene）+ src/components/template/TemplateFilter.tsx（场景筛选）
  - Task-024: src/hooks/useOnboarding.ts + src/components/guide/OnboardingGuide.tsx
  - Task-025: src/hooks/useSolutionHistory.ts + src/components/compare/SolutionCompareModal.tsx
  - Task-026: src/pages/policy/PolicyDetailPage.tsx（统一useFavorites）+ HomePage收藏区块
  - Task-027: src/hooks/useSmartFill.ts（历史数据智能匹配）
  - Task-028: src/components/export/ExportPreviewModal.tsx（导出前预览）
- **注意事项**：
  - 草稿自动保存30秒间隔，按templateId区分多草稿
  - 新手引导跨页面状态同步（localStorage + React Portal）
  - 方案对比最多3个，差异项红色高亮
  - 导出预览支持Word/PDF格式切换

## 💻 技术实现记录

### 实现1：通用组件库（6个组件）
- **技术方案**：每个组件独立目录，包含 .tsx + .types.ts + .test.tsx + index.ts
- **关键代码**：src/components/common/{Button,Input,Card,Modal,Toast,Skeleton}/
- **注意事项**：
  - Button使用forwardRef支持ref转发
  - Input支持text/number/select/textarea/date五种类型
  - Modal需处理ESC关闭和body overflow锁定
  - Toast使用Context API全局管理，最多显示3个
  - Skeleton使用CSS渐变动画实现shimmer效果

### 实现2：首页视觉重构
- **技术方案**：使用Button和Card组件替换原有实现，移除Emoji和渐变背景
- **关键代码**：src/pages/desktop/HomePage.tsx
- **注意事项**：
  - Hero Section背景改为纯色#F0F4F8
  - 功能卡片使用2x2 Grid布局
  - 响应式适配：移动端单列，桌面端双列

### 实现3：模板功能模块（Task-013~016）
- **技术方案**：React.lazy路由级懒加载，useFavorites统一管理收藏状态
- **关键代码**：
  - src/pages/template/TemplateListPage.tsx
  - src/components/template/{TemplateCard,TemplateFilter,TemplatePreview,TemplatePreviewModal,TemplateSelector,VariableEditor}
  - src/pages/solution/SolutionEditorPage.tsx
- **注意事项**：
  - TemplateFilter使用300ms防抖搜索
  - VariableEditor支持4种变量类型（text/number/date/select）
  - 草稿自动保存到localStorage（taocang-drafts）

### 实现4：政策功能模块（Task-018~019）
- **技术方案**：基于Task-017数据模型，多维度筛选+高亮搜索
- **关键代码**：
  - src/pages/policy/PolicyListPage.tsx
  - src/components/policy/{PolicyCard,PolicyFilter,PolicyViewer}
  - src/pages/policy/PolicyDetailPage.tsx
- **注意事项**：
  - PolicyFilter支持5个维度筛选（搜索/分类/场景/等级/年份）
  - PolicyViewer使用Tab切换（政策内容/合规要点）
  - 政策内容自动识别标题样式（第X条/X、开头）

### 实现5：收藏夹功能（Task-020）
- **技术方案**：useFavorites Hook统一封装localStorage读写，支持模板+政策双类型
- **关键代码**：
  - src/hooks/useFavorites.ts
  - src/pages/favorites/FavoritesPage.tsx
  - src/components/favorites/FavoriteItemCard.tsx
- **注意事项**：
  - localStorage key: taocang-favorites
  - 收藏状态跨页面同步（TemplateListPage/PolicyListPage/FavoritesPage）
  - TemplateListPage和PolicyListPage均已改用useFavorites

---

## 🔧 技能执行记录

### 会话1：Phase 1基础修复
- **执行技能**：code-quality, hallucination-prevention, delivery-report
- **执行结果**：通过（27个测试）
- **检查项**：HashRouter、ErrorBoundary、wechatDetector

### 会话2：Phase 2设计系统重建
- **执行技能**：code-quality, hallucination-prevention, delivery-report
- **执行结果**：通过（69个测试，含Phase 1的27个）
- **检查项**：Design Tokens、Lucide图标、全局样式、6个组件、首页重构

### 会话3：Phase 3核心功能（Task-013~016）
- **执行技能**：code-quality, hallucination-prevention, delivery-report
- **执行结果**：通过（90个测试）
- **检查项**：TemplateListPage、TemplateCard、TemplateFilter、TemplatePreview、TemplateSelector、VariableEditor、SolutionEditorPage

### 会话4：Phase 3核心功能（Task-018~020）
- **执行技能**：code-quality, hallucination-prevention, delivery-report
- **执行结果**：通过（121个测试）
- **检查项**：PolicyListPage、PolicyCard、PolicyFilter、PolicyViewer、PolicyDetailPage、useFavorites、FavoritesPage、FavoriteItemCard、路由集成

### 会话5：Phase 4交互体验优化（Task-021~028）
- **执行技能**：code-quality, hallucination-prevention, delivery-report
- **执行结果**：通过（121个测试）
- **检查项**：
  - Task-021: useDraftSave（30秒自动保存+草稿恢复弹窗+导出清除）
  - Task-022: PolicyListPage智能推荐（场景匹配排序+推荐标签+强制等级优先）
  - Task-023: TemplateScene枚举+场景筛选Tab+匹配度排序
  - Task-024: OnboardingGuide（3步Portal蒙层+键盘支持+localStorage状态）
  - Task-025: useSolutionHistory+SolutionCompareModal（最多3个对比+差异高亮+导出）
  - Task-026: PolicyDetailPage统一useFavorites+HomePage收藏快捷区块
  - Task-027: useSmartFill（字段类型智能识别+历史数据自动填充提示）
  - Task-028: ExportPreviewModal（Word/PDF预览切换+确认导出）
  - TypeScript: 0 errors（tsc --noEmit）
  - 测试: 18 suites, 121 tests passed

---

## 📋 待办事项

- [x] Phase 3 Task-018~020 审查问题修复（2026-05-03）
  - 修复Toast硬编码颜色4处
  - 修复HomePage Hero Section硬编码颜色1处
  - TemplateSelector改用useFavorites管理收藏状态
  - SolutionEditorPage实现Word/PDF导出
  - PolicyDetailPage实现政策文件下载
- [x] PM反馈修复（2026-05-03）
  - Issue-06: TemplateSelector添加onSelect可选回调，HomePage传入埋点回调
  - TypeScript: 清理20处未使用导入/变量，`tsc --noEmit` 0 errors
  - Design Tokens: 全局grep硬编码颜色，0 matches（排除tokens.css）
  - any类型检查: 0 matches
  - TODO/FIXME/HACK: 0 matches
  - 全量测试: 121 passed
- [x] Phase 4: 全部完成
- [x] Phase 4 PM审查修复（2026-05-04）
  - Issue-07: PolicyFilter新增显式"智能推荐"模式切换按钮（sparkles图标+激活态样式）
  - Issue-07: PolicyListPage推荐标签逻辑增强（未选场景时显示所有适用场景+最新政策标签）
  - Issue-08: 创建src/components/solution/SolutionComparator.tsx（符合任务清单产出路径）
  - Issue-08: HomePage引用路径从compare/SolutionCompareModal改为solution/SolutionComparator
  - TypeScript: 0 errors（tsc --noEmit）
  - Design Tokens: 全局grep硬编码颜色，0 matches
  - 全量测试: 18 suites, 121 tests passed
- [x] Bug修复（2026-05-04）
  - BUG-001: fillTemplate函数`||`改为`key in values`判断，空字符串正确替换占位符
  - BUG-002: HomePage政策文库导航路径从`/policy`修正为`/policies`
  - BUG-003: TemplateListPage的filteredTemplates添加activeScene场景过滤逻辑
  - BUG-004: TemplateListPage集成TemplatePreviewModal（点击预览打开弹窗+选择模板跳转）
  - TypeScript: 0 errors
  - Design Tokens: 0 matches
  - TODO/FIXME/HACK: 0 matches
  - 全量测试: 18 suites, 121 tests passed
- [x] BUG-001残留问题修复（2026-05-04）
  - 修复1: Input.tsx `<select>` 添加 `<option value="">请选择</option>` 占位选项
  - 修复2: SolutionEditorPage.tsx select变量自动初始化为 `v.options[0]`
  - 修复3: Input.test.tsx 补充select默认空option渲染测试 + select onChange事件测试
  - TypeScript: 0 errors
  - Design Tokens: 0 matches
  - 全量测试: 18 suites, 122 tests passed
- [x] BUG-006 无限重渲染修复（2026-05-04）
  - 修复1: useSmartFill.ts L66 用 `useMemo` 包裹 `suggestedValues` 计算（依赖 `[hasHistory, variables, history]`）
  - 修复2: SolutionEditorPage.tsx L55 添加 `initGuardRef` 初始化守卫，防止重复执行初始化逻辑
  - TypeScript: 0 errors
  - Design Tokens: 0 matches
  - 生产构建: 1447 modules, 8.71s
  - 全量测试: 18 suites, 122 tests passed

---

*本文档由Frontend-Developer角色维护，记录前端开发专属的工作上下文和决策。*
