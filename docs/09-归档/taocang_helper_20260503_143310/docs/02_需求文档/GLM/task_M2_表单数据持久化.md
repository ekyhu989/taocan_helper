# 任务指令 M2: 表单数据持久化

**任务类型**: 功能增强  
**优先级**: 🟡 中  
**分配给**: 后端/逻辑工程师-GLM-5.1  
**预计工时**: 2-3小时  
**状态**: ✅ 已完成（2026-04-12）  
**完成报告**: [M2_表单数据持久化_完成报告.md](./M2_表单数据持久化_完成报告.md)

---

## 任务概述

实现表单数据自动保存与恢复功能，用户填写的数据在页面刷新后不会丢失，提供"清空表单"按钮一键重置。

---

## 验收标准（必须全部完成）

### 自动保存
- [x] 基础信息录入页（solutionFormData）的6个字段实时保存到localStorage
- [x] 公文生成页（reportFormData）的5个字段实时保存到localStorage
- [x] 保存触发时机：字段值变化时防抖保存（300ms延迟）
- [x] localStorage键名：
  - 基础表单：`taocang_solution_form`
  - 公文表单：`taocang_report_form`

### 自动恢复
- [x] 页面加载时自动检查localStorage
- [x] 如有保存的数据，自动恢复到对应表单
- [x] 恢复时显示提示："已恢复上次填写的数据"
- [x] 提示在3秒后自动消失

### 清空功能
- [x] 基础信息录入页提供"清空表单"按钮
- [x] 公文生成页提供"清空表单"按钮
- [x] 点击后二次确认："确定要清空所有已填写的数据吗？"
- [x] 确认后清空表单并清除localStorage
- [x] 清空后显示提示："表单已清空"

### 场景切换保持
- [x] 从"录入表单"切换到"报告预览"时，数据不丢失
- [x] 从"报告预览"返回修改时，数据保持不变
- [x] 方案生成成功后，可选择性清除自动保存的数据

---

## 技术实现细节

### 需修改文件

1. **src/App.jsx**
   - 添加`useEffect`监听表单变化并保存
   - 添加`useEffect`在挂载时恢复数据
   - 添加清空表单的处理函数

2. **src/utils/formStorage.ts**（新增）
   - `saveSolutionForm(data)` - 保存基础表单
   - `loadSolutionForm()` - 加载基础表单
   - `saveReportForm(data)` - 保存公文表单
   - `loadReportForm()` - 加载公文表单
   - `clearAllForms()` - 清空所有表单数据

### 代码示例

```typescript
// formStorage.ts
const SOLUTION_FORM_KEY = 'taocang_solution_form';
const REPORT_FORM_KEY = 'taocang_report_form';

export const saveSolutionForm = (data: SolutionFormData) => {
  localStorage.setItem(SOLUTION_FORM_KEY, JSON.stringify(data));
};

export const loadSolutionForm = (): SolutionFormData | null => {
  const stored = localStorage.getItem(SOLUTION_FORM_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveReportForm = (data: ReportFormData) => {
  localStorage.setItem(REPORT_FORM_KEY, JSON.stringify(data));
};

export const loadReportForm = (): ReportFormData | null => {
  const stored = localStorage.getItem(REPORT_FORM_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearAllForms = () => {
  localStorage.removeItem(SOLUTION_FORM_KEY);
  localStorage.removeItem(REPORT_FORM_KEY);
};
```

```typescript
// App.jsx 中的集成
import { 
  saveSolutionForm, 
  loadSolutionForm, 
  saveReportForm, 
  loadReportForm,
  clearAllForms 
} from './utils/formStorage';

// 防抖保存
const debouncedSaveSolution = useCallback(
  debounce((data) => saveSolutionForm(data), 300),
  []
);

// 监听表单变化
useEffect(() => {
  debouncedSaveSolution(solutionFormData);
}, [solutionFormData]);

// 页面加载时恢复
useEffect(() => {
  const savedSolution = loadSolutionForm();
  const savedReport = loadReportForm();
  
  if (savedSolution) {
    setSolutionFormData(savedSolution);
    setShowRestoreNotice(true);
    setTimeout(() => setShowRestoreNotice(false), 3000);
  }
  
  if (savedReport) {
    setReportFormData(savedReport);
  }
}, []);
```

---

## UI设计要求

### 恢复提示
```
┌─────────────────────────────────────────┐
│  [✓] 已恢复上次填写的数据                │
└─────────────────────────────────────────┘
```
位置：表单区域顶部，绿色背景提示条

### 清空按钮位置
```
基础信息录入页：
┌─────────────────────────────────────────┐
│  基础信息录入                            │
│  [表单字段...]                          │
│                                         │
│  [清空表单]  [下一步：生成公文]          │
└─────────────────────────────────────────┘

公文生成页：
┌─────────────────────────────────────────┐
│  完善公文信息                            │
│  [表单字段...]                          │
│                                         │
│  [清空表单]  [生成正式公文]              │
└─────────────────────────────────────────┘
```

### 按钮样式
- 清空按钮：灰色系（bg-gray-200 text-gray-700）
- 位置：主按钮左侧
- 间距：gap-4

---

## 集成点

### 与现有代码的集成

在App.jsx中，需要：
1. 导入formStorage工具函数
2. 添加useEffect监听表单变化
3. 添加useEffect在组件挂载时恢复数据
4. 在表单底部添加清空按钮

```typescript
// 清空处理函数
const handleClearSolutionForm = () => {
  if (confirm('确定要清空所有已填写的数据吗？')) {
    setSolutionFormData({
      scene: 'holiday',
      headCount: '',
      totalBudget: '',
      fundSource: '行政福利费',
      budgetMode: 'per_capita',
      category: '食品',
    });
    localStorage.removeItem('taocang_solution_form');
  }
};
```

---

## 注意事项

1. **防抖处理**：表单字段变化频繁，必须使用防抖避免频繁写入localStorage
2. **数据安全**：不保存敏感信息（当前场景无敏感信息）
3. **数据清理**：方案生成成功后，可考虑清空自动保存数据（可选）

---

## 测试用例

1. 填写表单后刷新页面，数据正确恢复
2. 关闭浏览器重新打开，数据仍然存在
3. 点击清空按钮后表单重置
4. 清空后刷新页面，表单保持空白
5. 两阶段表单（基础+公文）数据分别保存和恢复
6. 切换视图（录入↔预览）时数据保持一致

---

## 依赖任务

- 无前置依赖
- 建议与任务M1（历史方案保存）协同开发

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 实现表单数据持久化`
2. 测试防抖逻辑不影响用户体验

---

**任务创建时间**: 2026-04-12  
**任务分配人**: 高级项目经理
