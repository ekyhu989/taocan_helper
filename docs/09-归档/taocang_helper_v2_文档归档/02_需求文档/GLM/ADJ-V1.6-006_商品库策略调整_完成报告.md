# ADJ-V1.6-006: 商品库策略调整 — 完成报告

**任务编号**: ADJ-V1.6-006  
**优先级**: P0（上线前必须完成）  
**执行人**: GLM-5.0 后端/逻辑工程师  
**完成时间**: 2026-04-14  
**状态**: ✅ 已完成  

---

## 一、任务执行摘要

完成商品库策略调整，核心变更：
1. **移除用户自主添加商品功能** — 商品库管理页不再提供"新增商品"入口
2. **添加"联系客服"引导** — 用户需添加商品时引导联系官方客服
3. **方案生成页匹配优先引导** — 商品库不足时显示引导建议
4. **修复数据同步 Bug** — `ProductManagerPage` 从假数据改为真实组件

---

## 二、修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/config/serviceConfig.ts` | **新增** | 客服联系方式集中配置（电话/微信/邮箱/工作时间） |
| `src/components/ContactServiceModal.jsx` | **新增** | 联系客服弹窗组件（全局复用） |
| `src/components/ProductManager.tsx` | 修改 | 移除"新增商品"按钮 → 添加客服引导区域 + 弹窗 |
| `src/pages/ProductManagerPage.jsx` | **重写** | 从硬编码假数据改为嵌入真实 ProductManager 组件 |
| `src/types.ts` | 修改 | `ProductListResult` 添加 `noMatchWarning` 可选字段 |
| `src/productListGenerator.ts` | 修改 | 品单生成增加匹配不足检测 + `noMatchWarning` 返回 |
| `src/App.jsx` | 修改 | 方案页无匹配引导 UI + 全局联系客服弹窗 + 数据同步修复 |

---

## 三、验收标准对照表

### 功能验收

| 验收项 | 状态 | 实现方式 |
|--------|------|----------|
| 商品库管理页移除"添加商品"功能 | ✅ | 删除 `handleAddProduct` 按钮调用，保留 `ProductForm` 编辑功能 |
| 商品库管理页显示"联系客服"引导 | ✅ | 底部蓝色渐变卡片：💡 需要添加新商品？→ 联系客服按钮 |
| 点击"联系客服"显示联系方式弹窗 | ✅ | `ContactServiceModal` 弹窗：电话/微信/邮箱三栏展示 |
| 方案生成页优先匹配商品库商品 | ✅ | `filterByCategory` 按场景+品类+价格三重过滤，兜底使用全库 |
| 无匹配商品时显示引导信息 | ✅ | `noMatchWarning` 字段 → 方案页 amber 色引导卡片 |
| 客服联系方式配置正确 | ✅ | `src/config/serviceConfig.ts` 集中配置，一键修改 |
| 方案页和商品库页数据同步一致 | ✅ | `useEffect([currentPage])` 页面切换时重新 `loadProducts()` |

### 代码验收

| 验收项 | 状态 | 实现方式 |
|--------|------|----------|
| 无语法错误 | ✅ | 573 模块全部通过构建 |
| 客服联系方式集中配置 | ✅ | `serviceConfig.ts` 单文件管理 |
| 联系客服弹窗组件可复用 | ✅ | `ContactServiceModal` 支持 `visible/onClose/title` 三个 props |
| 代码注释清晰 | ✅ | 每个文件头部含 JSDoc 说明 |

---

## 四、新增文件详解

### 4.1 `src/config/serviceConfig.ts`

```typescript
export const SERVICE_CONFIG = {
  phone: '400-8888-6688',     // 客服电话
  wechat: 'taocang_service',  // 客服微信号
  email: 'service@taocang.com',
  workHours: '工作日 9:00-18:00',
  companyName: '淘仓智能采购平台',
};

export const SERVICE_MESSAGES = {
  productLibrary: { title, desc, btnText },   // 商品库页引导文案
  schemeGenerator: { title, suggestions, ... }, // 方案页引导文案
};
```

**配置位置**：`src/config/serviceConfig.ts`  
**部署前替换**：将示例数据替换为真实客服信息即可。

### 4.2 `src/components/ContactServiceModal.jsx`

可复用弹窗组件，三栏展示：
- 📞 客服电话 + 工作时间
- 💬 客服微信号 + 添加提示
- 📧 客服邮箱

**调用方式**：
```jsx
<ContactServiceModal
  visible={showContactModal}
  onClose={() => setShowContactModal(false)}
  title="联系客服"  // 可选自定义标题
/>
```

---

## 五、数据同步 Bug 修复

### 问题分析

**根因**：`ProductManagerPage.jsx` 使用硬编码假数据（4个商品），与真实商品库完全脱节。方案生成页使用 `loadProducts()` 从 localStorage 读取，两者数据源不一致。

### 修复方案

1. **重写 `ProductManagerPage.jsx`**：嵌入真实的 `ProductManager` 组件，共用 `localStorage` 数据源
2. **增加页面切换同步**：`App.jsx` 新增 `useEffect([currentPage])`，切换到 `solution` 或 `product` 页时自动重新 `loadProducts()`

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

## 六、UI 变更展示

### 商品库管理页（底部引导）
```
┌──────────────────────────────────────────────┐
│ 💡 需要添加新商品？                           │
│ 请联系客服，我们将为您导入到商品库。           │
│                        [ 📞 联系客服 ]        │
└──────────────────────────────────────────────┘
```

### 方案生成页（无匹配引导）
```
┌──────────────────────────────────────────────┐
│ ⚠️ 当前商品库暂无完全匹配您需求的商品          │
│                                               │
│ 建议：                                        │
│   • 调整预算或场景条件，重新生成               │
│   • 联系客服添加您需要的商品到商品库           │
│                                               │
│ [重新生成]  [📞 联系客服]                      │
└──────────────────────────────────────────────┘
```

### 联系客服弹窗
```
┌──────────────────────────────────────────────┐
│  📞 联系客服                    淘仓智能采购平台 │
├──────────────────────────────────────────────┤
│  📞 客服电话                                   │
│     400-8888-6688                              │
│     工作日 9:00-18:00                          │
├──────────────────────────────────────────────┤
│  💬 客服微信                                   │
│     taocang_service                            │
│     搜索微信号或扫描二维码添加                   │
├──────────────────────────────────────────────┤
│  📧 客服邮箱                                   │
│     service@taocang.com                        │
├──────────────────────────────────────────────┤
│            [ 关闭 ]                             │
└──────────────────────────────────────────────┘
```

---

## 七、构建验证

```
vite v5.4.21 building for production...
✓ 573 modules transformed.
dist/index.html                    0.41 kB │ gzip:   0.32 kB
dist/assets/index-CnsuE7VW.css   39.44 kB │ gzip:   7.28 kB
dist/assets/encrypt-Br2kjG6o.js  35.59 kB │ gzip:  12.47 kB
dist/assets/index-Dsd6waHw.js  2382.93 kB │ gzip: 684.16 kB
✓ built in 17.17s
```

**编译结果**: 573 模块全部通过，0 错误 0 警告（chunk size 警告为既有问题，非本次引入）。

---

## 八、合规性检查

| 规则 | 状态 |
|------|------|
| 禁止使用"购买/下单/支付/商城/购物车" | ✅ 全部使用"采购/方案/预算/物资" |
| 引导文案规范 | ✅ 使用 SERVICE_MESSAGES 统一管理 |
| 客服信息为示例数据提示 | ✅ 文件头部注释明确标注 |

---

## 九、配置说明

**客服联系方式修改位置**: `src/config/serviceConfig.ts`

部署前需替换以下字段为真实信息：
- `phone` → 真实客服电话
- `wechat` → 真实客服微信号
- `email` → 真实客服邮箱
- `workHours` → 真实工作时间

---

**任务完成时间**: 2026-04-14  
**执行人**: GLM-5.0 后端/逻辑工程师  
