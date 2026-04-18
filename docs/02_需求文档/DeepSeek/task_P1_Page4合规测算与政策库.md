# 任务指令 P1: Page4 合规测算与政策库

**任务类型**: 补充开发  
**优先级**: 🔴 高  
**分配给**: DeepSeek（高级全栈开发工程师）  
**预计工时**: 3-4小时  
**状态**: 待开发

---

## 任务概述

开发Page4合规测算与政策库模块，包含年度进度测算和政策文库两个子页面，作为独立入口供用户查看年度采购完成进度和相关政策文件。

---

## 验收标准（必须全部完成）

### 年度进度测算页面
- [ ] 输入表单：
  - 年度总预算（数字输入框，必填）
  - 已完成采购金额（数字输入框，默认0）
- [ ] 自动计算：
  - 完成率 = 已完成金额 ÷ 年度总预算 × 100%
  - 还需采购金额 = 年度总预算 × 30% - 已完成金额
  - **年度人均金额 = 年度总预算 ÷ 单位人数**（从基础信息获取）
- [ ] **2000元年度上限校验**（核心功能）：
  - 当 年度人均金额 > 2000元 时，显示**橙色警告**
  - 警告文案："⚠️ 年度人均预算超过2000元上限，请调整预算方案"
  - 警告样式：醒目的橙色边框+背景色
- [ ] 可视化展示：
  - 三色进度条（832完成率）：
    - <30%：红色（未达标）
    - 30%-100%：黄色（进行中）
    - ≥100%：绿色（已完成）
  - 大字号显示完成率（如"35%"）
  - 文字提示：是否达标及建议

### 政策文库页面
- [ ] 政策文档列表：
  - 新疆维吾尔自治区基层工会经费收支管理办法
  - 关于进一步推进脱贫地区农副产品采购的通知
  - 832平台采购操作指南
- [ ] 访问方式：
  - 外部链接跳转（优先）
  - 或PDF在线预览

### 页面导航
- [ ] 底部导航栏或独立入口按钮进入Page4
- [ ] Page4内部Tab切换（测算/政策）

---

## 技术实现细节

### 需新增文件

1. **src/pages/CompliancePage.jsx**（新建）
   - Page4主页面组件
   - 包含Tab切换（测算/政策）

2. **src/components/ComplianceCalculator.jsx**（新建）
   - 年度进度测算组件
   - 表单输入和计算逻辑

3. **src/components/PolicyLibrary.jsx**（新建）
   - 政策文库组件
   - 政策文档列表展示

### 代码示例

```jsx
// CompliancePage.jsx
const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'policy'
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">合规测算与政策库</h1>
      
      {/* Tab切换 */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          年度进度测算
        </button>
        <button 
          className={activeTab === 'policy' ? 'active' : ''}
          onClick={() => setActiveTab('policy')}
        >
          政策文库
        </button>
      </div>
      
      {/* 内容区 */}
      {activeTab === 'calculator' && <ComplianceCalculator />}
      {activeTab === 'policy' && <PolicyLibrary />}
    </div>
  );
};
```

```jsx
// ComplianceCalculator.jsx
const ComplianceCalculator = () => {
  const [totalBudget, setTotalBudget] = useState('');
  const [completedAmount, setCompletedAmount] = useState(0);
  const headCount = 100; // 从基础信息或localStorage获取
  const MAX_ANNUAL_PER_CAPITA = 2000; // 年度人均上限
  
  const completionRate = totalBudget > 0 ? (completedAmount / totalBudget) * 100 : 0;
  const remainingAmount = totalBudget * 0.3 - completedAmount;
  const perCapitaAmount = totalBudget / headCount;
  const isOverLimit = perCapitaAmount > MAX_ANNUAL_PER_CAPITA;
  
  const getProgressColor = () => {
    if (completionRate < 30) return 'bg-red-500';
    if (completionRate < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-6">
      {/* 2000元年度上限警告 */}
      {isOverLimit && (
        <div className="bg-orange-100 border border-orange-400 text-orange-700 p-4 rounded">
          <strong>⚠️ 合规警告</strong><br/>
          年度人均预算 {perCapitaAmount.toFixed(0)} 元，超过 2000 元上限，请调整预算方案
        </div>
      )}
      
      {/* 输入表单 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>年度总预算（元）</label>
          <input 
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
          />
        </div>
        <div>
          <label>已完成采购金额（元）</label>
          <input 
            type="number"
            value={completedAmount}
            onChange={(e) => setCompletedAmount(Number(e.target.value))}
          />
        </div>
      </div>
      
      {/* 人均金额显示 */}
      <div className="text-sm text-gray-600">
        年度人均预算：<span className={isOverLimit ? 'text-orange-600 font-bold' : ''}>
          {perCapitaAmount.toFixed(0)} 元
        </span>
        {isOverLimit && <span className="text-orange-600 ml-2">（超标）</span>}
      </div>
      
      {/* 进度展示 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="text-4xl font-bold text-center mb-4">
          {completionRate.toFixed(1)}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${getProgressColor()}`}
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
        <p className="mt-4 text-center">
          {completionRate < 30 
            ? `未达标，建议还需采购 ${remainingAmount.toFixed(0)} 元` 
            : completionRate < 100 
              ? '进行中，已达到最低要求'
              : '已完成年度采购任务'}
        </p>
      </div>
    </div>
  );
};
```

---

## UI设计要求

### 年度测算页面布局
```
┌─────────────────────────────────────────────────────────┐
│  合规测算与政策库                                        │
│  [年度进度测算] [政策文库]                               │
├─────────────────────────────────────────────────────────┤
│  年度总预算        已完成采购金额                        │
│  [________]        [________]                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              35.0%                              │   │
│  │                                                 │   │
│  │  [████████████░░░░░░░░░░░░░░░░░░░░]            │   │
│  │                                                 │   │
│  │  进行中，已达到最低要求                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 政策文库页面布局
```
┌─────────────────────────────────────────────────────────┐
│  合规测算与政策库                                        │
│  [年度进度测算] [政策文库]                               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 新疆维吾尔自治区基层工会经费收支管理办法      │   │
│  │    [查看详情]                                    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 关于进一步推进脱贫地区农副产品采购的通知      │   │
│  │    [查看详情]                                    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 832平台采购操作指南                           │   │
│  │    [查看详情]                                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 集成点

### 在App.jsx中添加路由
```jsx
import CompliancePage from './pages/CompliancePage';

// 在路由或视图切换中添加
{currentView === 'compliance' && <CompliancePage />}
```

### 添加导航入口
在底部导航栏或页面菜单中添加：
```jsx
<button onClick={() => setCurrentView('compliance')}>
  📊 合规测算
</button>
```

---

## 测试用例

### 832完成率进度条测试
1. 输入年度预算10万，已完成2万，显示完成率20%（红色）
2. 输入年度预算10万，已完成5万，显示完成率50%（黄色）
3. 输入年度预算10万，已完成10万，显示完成率100%（绿色）
4. 计算还需采购金额 = 10万×30% - 已完成

### 2000元年度上限测试（核心）
5. 单位人数100人，年度预算18万（人均1800元）→ 无警告（正常）
6. 单位人数100人，年度预算20万（人均2000元）→ 无警告（临界值）
7. 单位人数100人，年度预算25万（人均2500元）→ **橙色警告**（超标）
8. 单位人数50人，年度预算12万（人均2400元）→ **橙色警告**（超标）

### 政策文库测试
9. 政策文档链接可正常跳转
10. 新疆工会经费收支管理办法链接正确

---

## 依赖任务

- 无前置依赖
- 可独立开发

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 实现Page4合规测算与政策库`

---

**任务创建时间**: 2026-04-13  
**任务分配人**: 高级项目经理
