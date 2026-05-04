# 任务指令 P3: 添加采购地区、节日类型字段

**任务类型**: 补充开发  
**优先级**: 🔴 高  
**分配给**: Doubao-seek（UI工程师）  
**预计工时**: 2-3小时  
**状态**: 待开发

---

## 任务概述

在Page1基础信息录入页面添加采购地区和节日类型字段，采购地区默认为"新疆地区"（只读），节日类型根据采购场景联动选择（春节/古尔邦节/肉孜节/其他）。

---

## 验收标准（必须全部完成）

### 采购地区字段
- [ ] 字段位置：表单顶部（第一个字段）
- [ ] 默认值："新疆地区"
- [ ] 状态：只读（disabled）或文本显示（不可编辑）
- [ ] 样式：与其他表单字段一致

### 节日类型字段
- [ ] 字段位置：采购场景下方
- [ ] 联动逻辑：
  - 采购场景=传统节日慰问时：显示节日类型下拉框
  - 采购场景=其他时：隐藏或禁用节日类型
- [ ] 选项列表：
  - 春节
  - 古尔邦节
  - 肉孜节
  - 其他
- [ ] 默认值：根据当前时间智能推荐（可选）

### 数据传递
- [ ] 字段值保存到formData
- [ ] 值传递到公文生成页面
- [ ] 公文模板中使用节日类型变量替换

---

## 技术实现细节

### 需修改文件

1. **src/components/BasicInfoForm.jsx**（修改）
   - 添加采购地区字段（只读）
   - 添加节日类型字段（联动显示）

2. **src/data/mockData.js**（修改）
   - 添加地区和节日默认值
   - 添加节日选项列表

3. **src/reportAssembler.ts**（修改）
   - 公文模板添加节日类型变量

### 代码示例

```jsx
// BasicInfoForm.jsx - 添加字段

const BasicInfoForm = ({ formData, onDataChange }) => {
  // 节日类型选项
  const festivalOptions = [
    { value: 'spring', label: '春节' },
    { value: 'eid', label: '古尔邦节' },
    { value: 'nowruz', label: '肉孜节' },
    { value: 'other', label: '其他' },
  ];
  
  // 是否显示节日类型（仅传统节日慰问场景）
  const showFestival = formData.scene === 'holiday';
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 采购地区 - 只读 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            采购地区
          </label>
          <input
            type="text"
            value="新疆地区"
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">默认为新疆地区</p>
        </div>
        
        {/* 采购场景 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            采购场景 <span className="text-red-500">*</span>
          </label>
          <select
            name="scene"
            value={formData.scene}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="holiday">传统节日慰问</option>
            <option value="activity">专项活动物资</option>
            <option value="care">精准帮扶慰问</option>
          </select>
        </div>
        
        {/* 节日类型 - 联动显示 */}
        {showFestival && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              节日类型 <span className="text-red-500">*</span>
            </label>
            <select
              name="festival"
              value={formData.festival || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">请选择节日</option>
              {festivalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* 其他原有字段... */}
      </div>
    </div>
  );
};
```

```typescript
// mockData.js - 更新默认值

const mockData = {
  basicInfo: {
    region: '新疆地区',        // 新增：采购地区
    scene: 'holiday',
    festival: '',             // 新增：节日类型
    headCount: '',
    totalBudget: '',
    fundSource: '行政福利费',
    budgetMode: 'per_capita',
    category: '食品',
  },
  
  festivalOptions: [          // 新增：节日选项
    { value: 'spring', label: '春节' },
    { value: 'eid', label: '古尔邦节' },
    { value: 'nowruz', label: '肉孜节' },
    { value: 'other', label: '其他' },
  ],
  
  // ... 其他数据
};
```

```typescript
// reportAssembler.ts - 更新模板变量

const getFestivalLabel = (festival: string): string => {
  const labels: Record<string, string> = {
    spring: '春节',
    eid: '古尔邦节',
    nowruz: '肉孜节',
    other: '节日',
  };
  return labels[festival] || '节日';
};

// 在assembleReport函数中
const vars: TemplateVars = {
  // ... 其他变量
  festival: getFestivalLabel(festival),
  region: '新疆地区',  // 添加地区变量
};
```

---

## UI设计要求

### 表单布局更新
```
┌─────────────────────────────────────────────────────────┐
│  基础信息录入                                            │
├─────────────────────────────────────────────────────────┤
│  采购地区                                                │
│  [新疆地区          ] （只读）                           │
│                                                         │
│  采购场景              节日类型（联动显示）              │
│  [传统节日慰问 ▼]    [春节 ▼]                           │
│                                                         │
│  人数                  总预算                            │
│  [100              ]  [50000           ]                │
│                                                         │
│  ...其他字段...                                         │
└─────────────────────────────────────────────────────────┘
```

### 场景切换效果
- 选择"传统节日慰问"：节日类型下拉框显示
- 选择"专项活动物资"：节日类型隐藏，清空值
- 选择"精准帮扶慰问"：节日类型隐藏，清空值

---

## 集成点

### 在App.jsx中更新formData结构
```typescript
const [solutionFormData, setSolutionFormData] = useState({
  region: '新疆地区',        // 新增
  scene: 'holiday',
  festival: '',             // 新增
  headCount: '',
  totalBudget: '',
  fundSource: '行政福利费',
  budgetMode: 'per_capita',
  category: '食品',
});
```

### 更新types.ts类型定义
```typescript
interface SolutionFormData {
  region: string;           // 新增
  scene: Scene;
  festival?: string;        // 新增（可选）
  headCount: number | '';
  totalBudget: number | '';
  fundSource: string;
  budgetMode: BudgetMode;
  category: string;
}
```

---

## 测试用例

1. 采购地区默认显示"新疆地区"且不可编辑
2. 选择"传统节日慰问"时显示节日类型下拉框
3. 选择"专项活动物资"时节日类型隐藏
4. 节日类型选项包含春节、古尔邦节、肉孜节、其他
5. 选择的节日类型正确传递到公文生成
6. 公文中节日类型变量正确替换

---

## 依赖任务

- 无前置依赖
- 可与P2（三方询价单）并行开发

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 添加采购地区和节日类型字段`

---

**任务创建时间**: 2026-04-13  
**任务分配人**: 高级项目经理
