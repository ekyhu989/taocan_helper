# Frontend-Developer 会话记录

> **日期**: 2026-05-04
> **角色**: Frontend-Developer
> **任务**: Bug修复（BUG-001~004）

---

## 任务背景

修复PM质量审查后发现的4个Bug，包括2个P1严重Bug和2个P2一般Bug。

---

## 修复内容

### BUG-001 [P1] 变量编辑器实时预览占位符未替换

**问题**: `fillTemplate`函数使用`values[key] || match`，当值为空字符串时（falsy），返回原始占位符`${变量名}`。

**修复**: `src/components/template/VariableEditor.tsx`
```tsx
// 修复前
return values[key] || match;
// 修复后
return key in values ? values[key] : match;
```

**影响**: 用户清空字段后，实时预览正确显示空内容而非`${变量名}`占位符。

---

### BUG-002 [P1] 首页政策文库导航路径错误

**问题**: HomePage中政策文库导航到`/policy`（PolicyLibraryPage占位页），实际功能页在`/policies`（PolicyListPage）。

**修复**: `src/pages/desktop/HomePage.tsx` L62
```tsx
// 修复前
path: '/policy',
// 修复后
path: '/policies',
```

---

### BUG-003 [P2] 模板场景筛选UI存在但逻辑未实现

**问题**: TemplateFilter已渲染场景筛选Tab（全部场景/节日慰问/员工活动/困难帮扶/通用），但TemplateListPage的`filteredTemplates` useMemo中完全缺少`activeScene`过滤逻辑。

**修复**: `src/pages/template/TemplateListPage.tsx`
```tsx
// 在filteredTemplates中添加场景过滤
if (activeScene !== 'all') {
  result = result.filter((t) =>
    t.relatedScenes.includes(activeScene as TemplateScene)
  );
}
```

同时更新useMemo依赖数组加入`activeScene`。

---

### BUG-004 [P2] 模板预览组件已开发但列表页未集成

**问题**: TemplatePreviewModal组件已存在，但TemplateListPage的`handlePreview`仅`console.log`，未打开预览弹窗。

**修复**: `src/pages/template/TemplateListPage.tsx`
1. 导入`TemplatePreviewModal`
2. 添加`previewTemplate`状态
3. `handlePreview`设置`previewTemplate`
4. JSX底部添加`<TemplatePreviewModal>`组件
5. `onSelect`回调导航到`/solution`

---

## 验证结果

| 检查项 | 结果 |
|--------|------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| 全量测试 (`jest --ci`) | 18 suites, 121 tests passed |
| Design Tokens 硬编码颜色 | 0 matches |
| TODO/FIXME/HACK | 0 matches |

---

## 修改文件清单

1. `src/components/template/VariableEditor.tsx` - BUG-001
2. `src/pages/desktop/HomePage.tsx` - BUG-002
3. `src/pages/template/TemplateListPage.tsx` - BUG-003 + BUG-004

---

## 遗留问题

- 无

---

*会话结束，记忆已更新到 frontend-developer-memory.md*
