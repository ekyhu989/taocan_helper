# AI采购方案生成工具 - 界面开发 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目基础结构与 Mock 数据准备
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 准备项目目录结构（如需要）
  - 创建 Mock 数据文件，包含基础信息、商品列表、公文内容等
  - 定义 Mock 数据结构
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-1.1: Mock 数据文件包含所有必要字段
  - `human-judgement` TR-1.2: Mock 数据符合政务系统规范，术语使用正确
- **Notes**: 确保 Mock 数据包含人均预算超过 500 元的测试场景

## [x] Task 2: 基础信息录入页组件实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用 React + Tailwind CSS 实现表单组件
  - 包含字段：单位名称（文本输入）、采购场景（下拉选择）、人数（数字输入）、总预算（数字输入）、资金来源（文本标签）、申请部门（文本输入）、申请人（文本输入）
  - 实现人均预算计算与黄色提示 UI
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 表单字段齐全，布局清晰专业
  - `human-judgement` TR-2.2: 人均预算超 500 元时显示黄色提示文案
  - `human-judgement` TR-2.3: 界面风格符合政务系统规范
- **Notes**: 使用 Mock 数据预设表单值，展示超标和不超标两种场景

## [x] Task 3: 采购方案预览页组件实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用 React + Tailwind CSS 实现商品卡片/列表组件
  - 展示商品信息：名称、单价、数量、小计
  - 实现价格汇总区域：商品合计、人均标准
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-3.1: 商品卡片/列表展示清晰完整
  - `human-judgement` TR-3.2: 价格汇总信息正确展示
  - `human-judgement` TR-3.3: 界面风格统一专业
- **Notes**: 商品数量建议 5-8 个，覆盖不同品类

## [ ] Task 4: 采购申请报告页组件实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用 React + Tailwind CSS 实现公文展示组件
  - 包含标题、主送单位、正文、品单列表、消费帮扶提示、落款等公文要素
  - 确保消费帮扶提示文案与规范完全一致
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-4.1: 公文格式规范，要素齐全
  - `programmatic` TR-4.2: 消费帮扶提示文案与规范完全一致
  - `human-judgement` TR-4.3: 术语使用正确，无禁用词汇
- **Notes**: 参考 docs/公文模板库.md 中的格式

## [ ] Task 5: 主应用与视图切换实现
- **Priority**: P0
- **Depends On**: Task 2, Task 3, Task 4
- **Description**: 
  - 创建主 App 组件，实现单页应用视图切换逻辑
  - 首页显示基础信息录入页（BasicInfoForm）
  - 添加"生成方案"按钮到表单页底部
  - 实现表单轻量级校验：检查人数和总预算是否为空
  - 校验通过后，切换到预览与报告页，同时显示采购方案预览和采购申请报告
  - 为空时显示提示"请填写完整信息"
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-5.1: 首页正确显示基础信息录入表单
  - `human-judgement` TR-5.2: 点击"生成方案"且校验通过后，页面切换到预览与报告页
  - `human-judgement` TR-5.3: 人数或总预算为空时，显示"请填写完整信息"提示
  - `human-judgement` TR-5.4: 预览与报告页同时显示采购方案预览和采购申请报告
- **Notes**: 使用 React state 管理视图切换状态

## [ ] Task 6: 界面整体优化与统一
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 统一所有页面的视觉风格
  - 优化间距、字体、颜色等设计细节
  - 确保响应式布局在桌面端显示良好
  - 优化页面切换过渡效果
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-5, AC-7
- **Test Requirements**:
  - `human-judgement` TR-6.1: 所有页面视觉风格统一
  - `human-judgement` TR-6.2: 界面简洁专业，符合政务系统规范
  - `human-judgement` TR-6.3: 桌面端布局展示良好
  - `human-judgement` TR-6.4: 页面切换流畅自然
- **Notes**: 可参考政务系统常见设计风格（简洁、蓝白为主）
