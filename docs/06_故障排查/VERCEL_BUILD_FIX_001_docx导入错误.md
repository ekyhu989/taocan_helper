# Vercel构建错误修复：docx模块导入失败

## 错误信息

```
[vite]: Rollup failed to resolve import "docx" from "/vercel/path0/src/utils/helpers/exportUtils.ts".
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
`build.rollupOptions.external`
error during build:
Error: [vite]: Rollup failed to resolve import "docx" from "/vercel/path0/src/utils/helpers/exportUtils.ts".
```

## 根因分析

### 1. docx@9.6.1 是 ESM-only 包

```json
// node_modules/docx/package.json
{
  "name": "docx",
  "version": "9.6.1",
  "type": "module",           // ← ESM-only
  "main": "dist/index.umd.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

### 2. 项目 package.json 缺少 "type": "module"

项目使用 ESM 语法（`export default`）的配置文件（如 `postcss.config.js`），但 `package.json` 没有声明 `"type": "module"`，导致：
- Node.js 默认按 CommonJS 解析 `.js` 文件
- Vite 在 Vercel Linux 环境下 Rollup 无法正确解析 ESM-only 包的 `exports` 字段
- 触发 `MODULE_TYPELESS_PACKAGE_JSON` 警告

### 3. Vite 配置缺少 docx 的预构建和分包配置

`vite.config.js` 的 `optimizeDeps.include` 和 `manualChunks` 中没有包含 `docx` 和 `file-saver`，导致：
- Vite 开发服务器无法正确预构建 docx 依赖
- Rollup 在生产构建时无法正确处理 ESM-only 包的模块解析

## 修复方案（已实施）

### 修复1: vite.config.js - 添加 docx 到预构建和分包

```javascript
// vite.config.js
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@cloudbase/js-sdk'],
          pdf: ['html2pdf.js'],
          docx: ['docx', 'file-saver']    // ← 新增：文档处理库单独打包
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      '@cloudbase/js-sdk',
      'zustand',
      'html2pdf.js',
      'docx',        // ← 新增
      'file-saver'   // ← 新增
    ],
  },
}));
```

### 修复2: package.json - 添加 "type": "module"

```json
{
  "name": "taocang_helper",
  "version": "1.0.0",
  "private": true,
  "type": "module",    // ← 新增：声明为 ESM 项目
  ...
}
```

### 修复3: ReportPreviewPage.ts - 替换 require 为 import

```typescript
// 修复前（CommonJS 语法，与 "type": "module" 不兼容）
const products = require('../data/products.json');

// 修复后（ESM 语法）
import products from '../data/products.json';
```

## 本地验证结果

### 构建验证 ✅

```
vite v5.4.21 building for production...
✓ 595 modules transformed.
dist/assets/docx-D3BladHj.js               338.00 kB │ gzip:  95.04 kB   ← docx 正确打包
dist/assets/vendor-CeUSz4xA.js             139.39 kB │ gzip:  44.76 kB
dist/assets/index-DgaCJGP_.js              238.36 kB │ gzip:  77.05 kB
✓ built in 1m 12s
```

### 测试验证 ✅

- schemeGenerator.test.ts: PASS
- ECC-fullflow.test.ts: PASS
- priceConstraint.test.ts: PASS
- productMatching.test.ts: 1 个已知测试用例失败（与本次修复无关）

### 警告消除 ✅

- `MODULE_TYPELESS_PACKAGE_JSON` 警告已消除
- `CJS build of Vite's Node API is deprecated` 警告已消除

## Vercel 部署验证

- [ ] 提交代码到 Git
- [ ] 推送到远程仓库
- [ ] 确认 Vercel 自动部署成功
- [ ] 验证线上 Word 导出功能正常

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `vite.config.js` | 添加 docx/file-saver 到 manualChunks 和 optimizeDeps.include |
| `package.json` | 添加 "type": "module" |
| `src/pages/desktop/ReportPreviewPage.ts` | require → import ESM 语法 |

---
**创建时间**: 2026-04-18
**修复时间**: 2026-04-18
**状态**: 修复完成，待 Vercel 部署验证
**优先级**: P0 (阻塞部署)
