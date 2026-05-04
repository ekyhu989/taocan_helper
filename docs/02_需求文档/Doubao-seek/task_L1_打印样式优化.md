# 任务指令 L1: 打印样式优化

**任务类型**: 体验优化  
**优先级**: 🟢 低  
**分配给**: UI-Doubao-seek  
**预计工时**: 2-3小时  
**状态**: ✅ 已完成  
**完成时间**: 2026-04-12

---

## 任务概述

为公文预览区域添加打印专用样式，优化直接打印采购申请报告的效果，确保打印出的公文格式规范。

---

## 验收标准（必须全部完成）

### 打印按钮
- [x] 在公文预览区域添加"打印"按钮
- [x] 按钮位于导出按钮旁边
- [x] 点击后调用浏览器打印对话框

### 打印样式
- [x] 隐藏打印时不需要的元素：
  - 导航按钮（上一步、下一步）
  - 操作按钮（导出Word、导出PDF、打印）
  - 提示条和通知
  - 示例标识标签
- [x] 保留打印需要的元素：
  - 公文标题
  - 公文正文
  - 落款信息

### 页面格式
- [x] 打印时背景色和边框正常显示
- [x] 页边距合理（建议2cm）
- [x] 内容不被截断
- [x] 分页合理（长文档正确处理）
- [x] 字体大小适合阅读（建议12-14pt）

### 打印预览
- [x] 浏览器打印预览效果良好
- [x] Chrome/Edge/Firefox兼容

---

## 技术实现细节

### 已修改文件

1. **src/index.css**
   - 添加`@media print`样式规则

2. **src/components/ProcurementReport.jsx**
   - 添加打印按钮
   - 为打印区域添加ID标识

### 代码示例

```css
/* index.css */
@media print {
  /* 隐藏不需要的元素 */
  .no-print,
  button,
  .btn,
  nav,
  .nav,
  .alert,
  .notification {
    display: none !important;
  }

  /* 确保打印区域可见 */
  .print-only,
  #report-content {
    display: block !important;
  }

  /* 页面设置 */
  @page {
    margin: 2cm;
    size: A4;
  }

  /* 背景色和边框保留 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 字体大小 */
  body {
    font-size: 12pt;
    line-height: 1.6;
  }

  /* 标题样式 */
  h1 {
    font-size: 18pt;
    text-align: center;
    margin-bottom: 20pt;
  }

  h2 {
    font-size: 14pt;
    margin-top: 16pt;
    margin-bottom: 8pt;
  }

  /* 段落样式 */
  p {
    margin-bottom: 8pt;
    text-indent: 2em;
  }

  /* 避免元素跨页断裂 */
  table, tr, td {
    page-break-inside: avoid;
  }

  /* 强制分页点（可选） */
  .page-break {
    page-break-after: always;
  }
}
```

```typescript
// ProcurementReport.jsx 中的打印按钮
const handlePrint = () => {
  window.print();
};

// 按钮JSX
<button 
  onClick={handlePrint}
  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 no-print"
>
  🖨️ 打印
</button>
```

---

## UI设计要求

### 按钮布局（结合任务H2的导出按钮）
```
┌─────────────────────────────────────────────────────────┐
│  [📄 导出Word]  [📑 导出PDF]  [🖨️ 打印]                │
└─────────────────────────────────────────────────────────┘
```

### 打印效果预览
```
打印输出：
┌─────────────────────────────────────────┐
│                                         │
│        关于2026年春节职工慰问品          │
│          采购方案的申请报告              │
│                                         │
│  致：XX市财政局工会委员会               │
│                                         │
│  一、申请事由                            │
│     [正文内容...]                       │
│                                         │
│  二、慰问对象及标准                      │
│     [正文内容...]                       │
│                                         │
│  [表格内容...]                          │
│                                         │
│        申请部门：行政部                  │
│        申请人：王明                      │
│        日期：2026年1月15日             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 集成说明

此任务已与响应式布局优化（L2任务）合并实现，打印按钮已添加到导出按钮区域。

---

## 测试用例

1. ✅ 点击打印按钮弹出打印对话框
2. ✅ 打印预览中不显示操作按钮
3. ✅ 打印预览中公文格式正确
4. ✅ 实际打印效果与预览一致
5. ✅ 多页文档分页正确
6. ✅ 背景色和边框正常打印

---

## 依赖任务

- **前置依赖**: 任务H2（Word/PDF导出功能）- 已完成
- 与L2（响应式布局优化）合并实现

---

## 提交要求

1. ✅ 完成功能后，在Git提交信息中标注：`style: 优化打印样式`
2. ✅ 测试各浏览器打印效果

---

**任务创建时间**: 2026-04-12  
**任务分配人**: 高级项目经理
