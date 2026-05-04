# 任务指令 M1: 历史方案保存与查看

**任务类型**: 功能增强  
**优先级**: 🟡 中  
**分配给**: 后端/逻辑工程师-GLM-5.1  
**预计工时**: 4-6小时  
**状态**: ✅ 已完成（2026-04-12）  
**完成报告**: [M1_历史方案保存与查看_完成报告.md](./M1_历史方案保存与查看_完成报告.md)

---

## 任务概述

实现历史方案保存与查看功能，系统自动保存用户生成的采购方案到历史记录，支持查看详情和快速复用，数据存储在localStorage。

---

## 验收标准（必须全部完成）

### 自动保存
- [x] 用户点击"生成正式公文"后，自动将当前方案保存到历史记录
- [x] 保存内容包含：
  - 生成时间戳
  - 单位名称
  - 采购场景
  - 慰问人数
  - 总预算
  - 商品清单（完整数据）
  - 生成的公文内容
  - 表单数据快照

### 历史列表展示
- [x] 新增"历史方案"页面/侧边栏入口
- [x] 列表按时间倒序排列（最新的在前）
- [x] 每条记录显示：
  - 生成日期和时间（格式：2026-04-12 14:30）
  - 单位名称
  - 场景标签（节日慰问/活动物资/精准帮扶）
  - 总金额
- [x] 列表支持滚动加载
- [x] 显示历史记录总数

### 详情查看
- [x] 点击历史记录可查看详情
- [x] 详情页显示完整方案信息：
  - 基础信息（场景、人数、预算等）
  - 商品清单表格
  - 832平台占比
  - 生成的公文全文

### 方案复用
- [x] 每条历史记录提供"使用此方案"按钮
- [x] 点击后将该方案的表单数据加载到主界面
- [x] 自动跳转到方案预览页
- [x] 用户可基于此数据修改后重新生成

### 删除记录
- [x] 每条历史记录提供"删除"按钮
- [x] 点击后二次确认
- [x] 确认后从列表移除

### 数据管理
- [x] 历史记录保存到localStorage
- [x] 键名：`taocang_history`
- [x] 最多保存50条记录，超出时自动删除最旧的
- [x] 提供"清空所有历史"按钮（谨慎操作，需二次确认）

---

## 技术实现细节

### 需新增文件

1. **src/components/HistoryManager.jsx**
   - 历史记录管理主组件
   - 列表展示和详情查看

2. **src/components/HistoryDetail.jsx**
   - 历史方案详情展示组件

3. **src/utils/historyStorage.ts**
   - `saveHistory(historyItem)` - 保存单条历史
   - `loadHistory()` - 加载所有历史
   - `deleteHistory(id)` - 删除单条历史
   - `clearHistory()` - 清空所有历史

### 数据结构

```typescript
interface HistoryItem {
  id: string;                    // 唯一标识，使用时间戳
  createdAt: string;             // ISO时间字符串
  solutionData: {
    formData: SolutionFormData;  // 方案表单数据（6字段）
    reportFormData: ReportFormData; // 公文表单数据（5字段）
    productList: ProductListResult; // 品单生成结果
    report: ReportResult;        // 报告生成结果
  };
  summary: {
    unitName: string;
    scene: Scene;
    sceneLabel: string;
    headCount: number;
    totalBudget: number;
    totalAmount: number;
  };
}

// 类型定义需从现有类型导入
import type { SolutionFormData, ReportFormData, ProductListResult, ReportResult, Scene } from './types';
```

### 代码示例

```typescript
// historyStorage.ts
const HISTORY_KEY = 'taocang_history';
const MAX_HISTORY = 50;

export const saveHistory = (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
  const history = loadHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  // 添加到开头
  history.unshift(newItem);
  
  // 限制数量
  if (history.length > MAX_HISTORY) {
    history.pop();
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newItem;
};

export const loadHistory = (): HistoryItem[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};
```

---

## UI设计要求

### 入口位置
建议将"历史方案"入口放在：
1. 主界面顶部导航栏（如有）
2. 或页面底部操作栏

### 历史列表布局
```
┌─────────────────────────────────────────────────────────────────────┐
│  历史方案                                            [X]            │
├─────────────────────────────────────────────────────────────────────┤
│  共 12 条记录                                                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🕐 2026-04-12 14:30                                           │   │
│  │ XX市财政局  |  节日慰问  |  总金额: ¥50,000                   │   │
│  │                                        [查看] [使用] [删除]   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🕐 2026-04-11 09:15                                           │   │
│  │ XX区工会    |  活动物资  |  总金额: ¥30,000                   │   │
│  │                                        [查看] [使用] [删除]   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [⚠️ 清空所有历史记录]                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 详情页布局
```
┌─────────────────────────────────────────────────────────────────────┐
│  < 返回列表                                          [使用此方案]   │
├─────────────────────────────────────────────────────────────────────┤
│  生成时间：2026-04-12 14:30                                          │
│                                                                     │
│  ┌─ 基础信息 ─────────────────────────────────────────────────┐   │
│  │ 单位名称：XX市财政局                                         │   │
│  │ 采购场景：传统节日慰问                                       │   │
│  │ 慰问人数：100人                                              │   │
│  │ 总预算：¥50,000                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ 商品清单 ─────────────────────────────────────────────────┐   │
│  │ [表格展示商品清单]                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ 采购申请报告 ─────────────────────────────────────────────┐   │
│  │ [公文内容预览]                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 集成点

### 在App.jsx中的集成

```typescript
// 1. 导入历史管理组件
import HistoryManager from './components/HistoryManager';

// 2. 在生成公文成功后保存历史
const handleGenerateReport = () => {
  // ... 现有生成逻辑
  
  // 保存到历史记录
  saveHistory({
    solutionData: {
      formData: solutionFormData,
      reportFormData,
      productList: productListResult,
      report: reportResult,
    },
    summary: {
      unitName: reportFormData.unitName,
      scene: solutionFormData.scene,
      sceneLabel: getSceneLabel(solutionFormData.scene),
      headCount: solutionFormData.headCount,
      totalBudget: solutionFormData.totalBudget,
      totalAmount: productListResult.totalAmount,
    },
  });
};
```

---

## 合规性要求

⚠️ **必须遵守**:
1. 界面文案使用"历史方案/方案记录"等合规术语
2. 不涉及任何交易或购买相关描述

---

## 测试用例

1. 生成公文后历史记录自动保存
2. 历史列表按时间倒序排列
3. 点击"使用此方案"正确加载数据
4. 删除单条记录后列表更新
5. 超过50条时自动删除最旧的
6. 清空所有历史记录功能正常
7. 刷新页面后历史记录不丢失

---

## 依赖任务

- 无前置依赖
- 建议与任务M2（表单数据持久化）协同开发

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 实现历史方案保存与查看`
2. 测试localStorage存储上限和自动清理逻辑

---

**任务创建时间**: 2026-04-12  
**任务分配人**: 高级项目经理
