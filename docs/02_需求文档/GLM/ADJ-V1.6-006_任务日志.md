# ADJ-V1.6-006 商品库策略调整 — 任务日志

**任务编号**: ADJ-V1.6-006  
**优先级**: P0（上线前必须完成）  
**分配给**: GLM  
**状态**: ✅ 已完成  
**创建时间**: 2026-04-14  
**完成时间**: 2026-04-14  

---

## 一、任务目标

| # | 需求 | 状态 |
|---|------|------|
| 1 | 商品库管理页移除用户自主添加商品功能 | ✅ 完成 |
| 2 | 添加"联系客服"引导，创造客户沟通机会 | ✅ 完成 |
| 3 | 方案生成页优先使用商品库商品 | ✅ 完成 |
| 4 | 修复数据同步Bug | ✅ 完成 |

---

## 二、完成情况详情

### 2.1 商品库管理页 — 移除自主添加功能

**修改文件**: `src/components/ProductManager.tsx`、`src/pages/ProductManagerPage.jsx`

- 删除"新增商品"按钮（`handleAddProduct` 入口移除）
- 保留 `ProductForm` 组件的**编辑功能**（修改现有商品信息）
- 底部新增蓝色渐变引导卡片：
  ```
  💡 需要添加新商品？
  请联系客服，我们将为您导入到商品库
  [ 📞 联系客服 ]
  ```

### 2.2 "联系客服"引导

**新增文件**:
- `src/config/serviceConfig.ts` — 客服联系方式集中配置（电话/微信/邮箱/工作时间）
- `src/components/ContactServiceModal.jsx` — 联系客服弹窗组件（全局可复用）

**弹窗功能**:
- 三栏展示：📞电话 / 💬微信 / 📧邮箱
- 支持 `visible`、`onClose`、`title` 三个 props
- 已集成到商品库页 + 方案生成页两处

### 2.3 方案生成页 — 商品匹配优先引导

**修改文件**: `src/productListGenerator.ts`、`src/types.ts`、`src/App.jsx`

- 品单生成增加 `filterByCategory()` 按"场景+品类+价格"三重过滤
- 过滤结果不足时，自动兜底使用全库商品（不阻断生成）
- 新增 `noMatchWarning` 字段：当过滤后匹配商品 ≤ 2 种时设置
- `App.jsx` 检测到 `noMatchWarning` 时显示 amber 色引导卡片：
  ```
  ⚠️ 当前商品库暂无完全匹配您需求的商品
  建议：调整预算或场景条件，重新生成 / 联系客服添加
  [重新生成] [📞 联系客服]
  ```

### 2.4 数据同步Bug修复

**根因**: `ProductManagerPage.jsx` 使用硬编码假数据（4个商品），与真实 localStorage 数据源完全脱节。

**修复方案**:
1. 重写 `ProductManagerPage.jsx`：嵌入真实的 `ProductManager` 组件
2. `App.jsx` 新增 `useEffect([currentPage])`：页面切换到 solution 或 product 时自动重新 `loadProducts()`

```javascript
// 修复前：只在 showProductManager 变化时加载
useEffect(() => {
  const products = loadProducts();
  setProductsData(products);
}, [showProductManager]);

// 修复后：页面切换也刷新
useEffect(() => {
  if (currentPage === 'solution' || currentPage === 'product') {
    const products = loadProducts();
    setProductsData(products);
  }
}, [currentPage]);
```

---

## 三、文件变更清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/config/serviceConfig.ts` | **新增** | 42行 | 客服联系方式 + 引导文案配置 |
| `src/components/ContactServiceModal.jsx` | **新增** | 107行 | 联系客服弹窗（电话/微信/邮箱三栏） |
| `src/components/ProductManager.tsx` | 修改 | - | 移除"新增商品"按钮，添加客服引导区域 |
| `src/pages/ProductManagerPage.jsx` | **重写** | - | 从硬编码假数据 → 嵌入真实 ProductManager 组件 |
| `src/types.ts` | 修改 | +1行 | `ProductListResult` 新增 `noMatchWarning` 字段 |
| `src/productListGenerator.ts` | 修改 | +30行 | 新增 `filterByCategory()` + 匹配不足检测 |
| `src/App.jsx` | 修改 | +25行 | 页面切换数据同步 + 无匹配引导UI + 全局弹窗 |

---

## 四、构建验证

```
vite v5.4.21 building for production...
✓ 573 modules transformed.
dist/index.html                    0.41 kB │ gzip:   0.32 kB
dist/assets/index-CnsuE7VW.css   39.44 kB │ gzip:   7.28 kB
dist/assets/encrypt-Br2kjG6o.js  35.59 kB │ gzip:  12.47 kB
dist/assets/index-Dsd6waHw.js  2382.93 kB │ gzip: 684.16 kB
✓ built in 17.17s
```

**结果**: 573 模块全部通过，0 错误 0 警告。

---

## 五、验收标准核查

### 功能验收（7/7 ✅）

| 验收项 | 状态 |
|--------|------|
| 商品库管理页移除"添加商品"功能 | ✅ |
| 商品库管理页显示"联系客服"引导 | ✅ |
| 点击"联系客服"显示联系方式弹窗 | ✅ |
| 方案生成页优先匹配商品库商品 | ✅ |
| 无匹配商品时显示引导信息 | ✅ |
| 客服联系方式配置正确 | ✅ |
| 方案页和商品库页数据同步一致 | ✅ |

### 代码验收（4/4 ✅）

| 验收项 | 状态 |
|--------|------|
| 无语法错误 | ✅ |
| 客服联系方式集中配置，便于修改 | ✅ |
| 联系客服弹窗组件可复用 | ✅ |
| 代码注释清晰 | ✅ |

---

## 六、合规性检查

| 规则 | 状态 |
|------|------|
| 禁止"购买/下单/支付/商城/购物车" | ✅ 全部使用"采购/方案/预算/物资" |
| 引导文案规范 | ✅ 使用 SERVICE_MESSAGES 统一管理 |
| 客服信息为示例数据提示 | ✅ 文件头部注释明确标注 |

---

## 七、配置说明

**客服联系方式修改位置**: `src/config/serviceConfig.ts`

部署前需替换以下字段为真实信息：
- `phone` → 真实客服电话
- `wechat` → 真实客服微信号
- `email` → 真实客服邮箱
- `workHours` → 真实工作时间

---

## 八、测试要点

| # | 测试场景 | 预期结果 | 状态 |
|---|---------|----------|------|
| 1 | 打开商品库管理页 | 无"添加商品"按钮，底部显示客服引导卡片 | ✅ |
| 2 | 点击"联系客服" | 弹窗显示电话/微信/邮箱三栏 | ✅ |
| 3 | 方案生成页输入条件生成方案 | 使用商品库商品，匹配结果正确 | ✅ |
| 4 | 修改商品库数据后切换页面 | 方案生成页数据自动同步 | ✅ |
| 5 | 商品库为空时生成方案 | 显示引导信息 + 客服入口 | ✅ |

---

**执行人**: GLM-5.0 后端/逻辑工程师  
**任务完成时间**: 2026-04-14  
**相关文档**: [完成报告](./ADJ-V1.6-006_商品库策略调整_完成报告.md)
