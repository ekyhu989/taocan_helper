# 任务指令 P4: 年度累计提示（Page2）

**任务类型**: 补充开发  
**优先级**: 🟡 中  
**分配给**: GLM-5.1（后端/逻辑工程师）  
**预计工时**: 1-2小时  
**状态**: 待开发

---

## 任务概述

在Page2采购方案生成页面添加年度累计提示功能，从localStorage读取历史记录计算本年度完成进度，并显示提示信息。

---

## 验收标准（必须全部完成）

### 年度累计计算
- [ ] 从localStorage读取历史记录
- [ ] 筛选当前年份的历史方案
- [ ] 累加所有历史方案的总金额
- [ ] 计算完成率 = 累计金额 ÷ 年度总预算

### 提示展示
- [ ] 在Page2页面顶部或侧边显示提示条
- [ ] 显示内容：
  - "本年度已完成 XX%"
  - "还需采购 XX 元达标"
- [ ] 根据完成率显示不同颜色：
  - <30%：红色提示
  - ≥30%：绿色提示

### 数据更新
- [ ] 生成新方案后自动更新累计数据
- [ ] 删除历史记录后自动更新累计数据

---

## 技术实现细节

### 需修改文件

1. **src/utils/historyStorage.ts**（修改或新增函数）
   - 添加`getYearlyTotal(year)`函数
   - 计算指定年份的累计采购金额

2. **src/components/SolutionPreview.jsx**（修改）
   - 添加年度累计提示组件
   - 在页面适当位置展示

### 代码示例

```typescript
// historyStorage.ts - 添加年度统计函数

/**
 * 获取指定年份的累计采购金额
 */
export const getYearlyTotal = (year: number = new Date().getFullYear()): number => {
  const history = loadHistory();
  return history
    .filter(item => {
      const itemYear = new Date(item.createdAt).getFullYear();
      return itemYear === year;
    })
    .reduce((sum, item) => sum + item.summary.totalAmount, 0);
};

/**
 * 获取年度完成进度
 */
export const getYearlyProgress = (yearlyBudget: number): {
  total: number;
  rate: number;
  remaining: number;
} => {
  const total = getYearlyTotal();
  const rate = yearlyBudget > 0 ? (total / yearlyBudget) * 100 : 0;
  const remaining = yearlyBudget * 0.3 - total;
  
  return {
    total,
    rate,
    remaining: Math.max(0, remaining),
  };
};
```

```jsx
// YearlyProgressTip.jsx - 年度累计提示组件

import { useEffect, useState } from 'react';
import { getYearlyProgress } from '../utils/historyStorage';

const YearlyProgressTip = ({ yearlyBudget = 100000 }) => {
  const [progress, setProgress] = useState({ total: 0, rate: 0, remaining: 0 });
  
  useEffect(() => {
    const data = getYearlyProgress(yearlyBudget);
    setProgress(data);
  }, [yearlyBudget]);
  
  const getTipColor = () => {
    if (progress.rate < 30) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };
  
  if (progress.total === 0) return null;
  
  return (
    <div className={`p-4 rounded-lg border ${getTipColor()}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">
          本年度已完成 {progress.rate.toFixed(1)}%
        </span>
        <span className="text-sm">
          累计采购 ¥{progress.total.toFixed(2)}
        </span>
      </div>
      {progress.rate < 30 && (
        <p className="text-sm mt-2">
          建议还需采购 ¥{progress.remaining.toFixed(0)} 元以达标30%
        </p>
      )}
    </div>
  );
};

export default YearlyProgressTip;
```

---

## UI设计要求

### Page2添加提示条
```
┌─────────────────────────────────────────────────────────┐
│  采购方案生成                                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⚠️ 本年度已完成 25.0%                           │   │
│  │     累计采购 ¥25,000                             │   │
│  │     建议还需采购 ¥5,000 元以达标30%              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  方案摘要...                                            │
│  商品清单...                                            │
└─────────────────────────────────────────────────────────┘
```

或达标后：
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✅ 本年度已完成 35.0%                           │   │
│  │     累计采购 ¥35,000                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 集成点

### 在SolutionPreview.jsx中集成
```jsx
import YearlyProgressTip from './YearlyProgressTip';

const SolutionPreview = ({ productList, ... }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 年度累计提示 */}
      <YearlyProgressTip yearlyBudget={100000} />
      
      {/* 原有内容 */}
      <div className="mt-6">
        {/* 方案摘要 */}
      </div>
    </div>
  );
};
```

---

## 依赖任务

- **前置依赖**: M1（历史方案保存与查看）
- 需要历史记录功能已完成
- 可与P2并行开发

---

## 测试用例

1. 无历史记录时不显示提示
2. 有历史记录时正确计算累计金额
3. 完成率<30%显示红色提示和建议金额
4. 完成率≥30%显示绿色提示
5. 生成新方案后提示自动更新
6. 只统计当前年份的历史记录

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 实现Page2年度累计提示`

---

**任务创建时间**: 2026-04-13  
**任务分配人**: 高级项目经理
