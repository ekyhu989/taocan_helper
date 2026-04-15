# ADJ-V1.6-008 修复"重新生成"按钮无反应 — 任务日志

**任务编号**: ADJ-V1.6-008  
**优先级**: P0（阻塞上线）  
**分配给**: GLM  
**状态**: ✅ 已完成  
**创建时间**: 2026-04-14  
**完成时间**: 2026-04-14  

---

## 一、问题描述

方案生成页面的"重新生成"按钮点击后无反应，用户无法重新生成方案。

---

## 二、根因分析

排查 `src/App.jsx` 后发现 **3 个叠加 Bug**：

### Bug 1（核心问题）：按钮绑定了错误的处理函数

导航栏"重新生成"按钮（约第638行）和无匹配引导区的"重新生成"按钮（约第760行）绑定的是 `handleRegenerateSolution`，而该函数的逻辑是：

```javascript
const handleRegenerateSolution = () => {
  setIsExampleMode(true);       // ← 回到示例模式
  setProductListResult(null);   // ← 清空方案数据
  setOriginalProductListResult(null);
  setIsAdjusted(false);
  setIsReportGenerated(false);
  setReportResult(null);
  setErrorMessage('');
};
```

**实际效果**：点击后方案消失、界面回到示例状态 → 用户感觉"按钮没反应"（因为期望是重新生成一组新方案，结果方案被清空了）。

### Bug 2：两个"重新生成"按钮行为不一致

| 按钮 | 位置 | 绑定函数 | 实际行为 |
|------|------|---------|---------|
| 主按钮 | 方案生成区底部 | `handleGenerateSolution` ✅ | 重新跑生成逻辑 |
| 导航栏按钮 | 顶部导航栏 | `handleRegenerateSolution` ❌ | 清空方案回示例 |
| 引导区按钮 | 无匹配警告区 | `handleRegenerateSolution` ❌ | 清空方案回示例 |

### Bug 3：无 loading 反馈

`handleGenerateSolution` 有 `setLoading(true)`，但方案生成页没有任何 loading 指示器 UI，按钮文案也不随 loading 状态变化，用户无法感知点击已生效。

---

## 三、修复方案

### 修复策略

1. **删除 `handleRegenerateSolution`**：该函数的"清空回示例"行为不是用户预期
2. **所有"重新生成"按钮统一绑定 `handleGenerateSolution`**：真正重新调用生成逻辑
3. **添加 loading 文案**：按钮显示"⏳ 生成中..."
4. **添加内联错误提示**：方案生成页按钮下方显示红色错误文字

### 具体修改

#### 1. 删除 `handleRegenerateSolution`（第371行）

```diff
- const handleRegenerateSolution = () => {
-   setIsExampleMode(true);
-   setProductListResult(null);
-   ...
- };
+ // 注意：旧版 handleRegenerateSolution 已移除
+ // 导航栏和无匹配引导区的"重新生成"按钮统一绑定 handleGenerateSolution
```

#### 2. 导航栏"重新生成"按钮（第636-644行）

```diff
- <button onClick={handleRegenerateSolution} className="...">
-   <span>↻</span>
-   <span className="hidden sm:inline">重新生成</span>
+ <button onClick={handleGenerateSolution} disabled={loading}
+   className="... disabled:opacity-50 disabled:cursor-not-allowed">
+   <span>{loading ? '⏳' : '↻'}</span>
+   <span className="hidden sm:inline">{loading ? '生成中...' : '重新生成'}</span>
  </button>
```

#### 3. 无匹配引导区"重新生成"按钮（第760行）

```diff
- <button onClick={handleRegenerateSolution} className="...">
-   {SERVICE_MESSAGES.schemeGenerator.btnRegenerate}
+ <button onClick={handleGenerateSolution} disabled={loading}
+   className="... disabled:opacity-50 disabled:cursor-not-allowed">
+   {loading ? '⏳ 生成中...' : SERVICE_MESSAGES.schemeGenerator.btnRegenerate}
  </button>
```

#### 4. 主按钮添加 loading 文案（第704行）

```diff
- {isExampleMode ? '生成我的方案' : '重新生成方案'}
+ {loading ? '⏳ 生成中...' : (isExampleMode ? '生成我的方案' : '重新生成方案')}
```

#### 5. 新增内联错误提示（按钮下方）

```jsx
{errorMessage && currentPage === 'solution' && (
  <p className="mt-3 text-center text-sm text-red-600 font-medium">{errorMessage}</p>
)}
```

---

## 四、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/App.jsx` | 修改 | 删除 handleRegenerateSolution；3个按钮统一绑定 handleGenerateSolution；添加 loading 文案和内联错误提示 |

---

## 五、验收标准核查

| 验收项 | 状态 | 说明 |
|--------|------|------|
| "重新生成"按钮点击后有反应 | ✅ | 显示"⏳ 生成中..."loading 文案 |
| 表单验证失败时显示错误提示 | ✅ | 按钮下方红色内联提示 |
| 验证通过后成功重新生成方案 | ✅ | 直接调用 handleGenerateSolution |
| 重新生成与首次生成逻辑一致 | ✅ | 统一调用同一函数 |
| 无语法错误 | ✅ | linter 0 error |

---

## 六、测试要点

| # | 测试场景 | 预期结果 |
|---|---------|----------|
| 1 | 首次生成方案 → 点击导航栏"重新生成" | 按钮显示loading → 方案刷新为新随机组合 |
| 2 | 方案已生成 → 点击底部"重新生成方案"主按钮 | 同上，行为一致 |
| 3 | 触发无匹配警告 → 点击"重新尝试" | 方案重新生成，警告可能消失 |
| 4 | 生成中 → 等待 loading 完成 | 按钮禁用态，文案变为"生成中..." |
| 5 | 不填人数/预算 → 点击生成 | 按钮下方显示红色错误提示 |

---

## 七、Lint 验证

```
Linter: 0 errors, 0 warnings
```

---

**执行人**: GLM-5.0 后端/逻辑工程师  
**完成时间**: 2026-04-14  
**任务文档**: `docs/02_需求文档/GLM/V1.6_ADJ-8_修复重新生成按钮.md`
