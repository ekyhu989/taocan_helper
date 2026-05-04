# 前端工程师 Phase 3 质量审查问题反馈

> **反馈角色**: 产品经理 (PM)  
> **反馈日期**: 2026-05-03  
> **接收角色**: frontend-developer  
> **问题来源**: Phase3_PM质量审查报告（复审）

---

## 📊 问题概览

| 问题ID | 问题描述 | 严重等级 | 责任归属 | 状态 |
|--------|---------|---------|---------|------|
| Issue-02 | Design Tokens合规性遗漏（global.css 2处硬编码） | **P0** | frontend-developer | ✅ 已修复（PM发现） |
| Issue-06 | TemplateSelector缺少onSelect回调 | P2 | frontend-developer | ⏳ 待修复 |

---

## ❌ 问题1: Design Tokens合规性审查遗漏（P0级铁律）

### 问题描述
Phase 3复审时，PM发现global.css中仍有2处硬编码颜色（滚动条样式），**前端工程师在自检时未彻底排查**。

### 问题根因
1. **审查范围不完整**：仅检查了.tsx/.ts文件，遗漏了.css文件
2. **缺乏自动化校验**：未使用grep全局搜索硬编码颜色
3. **Design Tokens意识不足**：滚动条样式认为"不重要"而使用硬编码

### 修复方案（PM已代为修复）
```css
/* src/styles/tokens.css - 新增Token */
--color-scrollbar: #C1C1C1;
--color-scrollbar-hover: #A8A8A8;

/* src/styles/global.css - 使用Token */
::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar);  /* 修复前: #c1c1c1 */
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-hover);  /* 修复前: #a8a8a8 */
}
```

### ⚠️ 经验教训（必须牢记）

**Design Tokens审查标准流程**（后续所有任务必须执行）:
```bash
# 步骤1: 全局搜索硬编码颜色（排除tokens.css定义文件）
$ grep -r "#[0-9a-fA-F]{3,8}" src/ --exclude=tokens.css

# 步骤2: 检查所有文件类型
$ grep -r "#[0-9a-fA-F]{3,8}" src/ --include="*.{tsx,ts,css,scss}" --exclude=tokens.css

# 步骤3: 验证结果为0
Found 0 matches.  ✅ 通过
```

**铁律**:
- ❌ **禁止**仅检查.tsx/.ts文件
- ❌ **禁止**认为"某些文件不重要"而跳过检查
- ✅ **必须**全局搜索所有文件类型（.tsx/.ts/.css/.scss）
- ✅ **必须**排除tokens.css（定义文件允许硬编码）
- ✅ **必须**验证grep结果为0才能提交

---

## ⚠️ 问题2: TemplateSelector缺少onSelect回调（P2级规范问题）

### 问题描述
HomePage的TemplateSelector组件缺少onSelect回调，虽然功能正常（内部已处理导航），但**不符合组件设计规范**。

### 问题根因
1. **组件设计规范意识不足**：认为"功能正常就行"，忽略外部回调的必要性
2. **状态同步缺失**：外部无法感知用户选择行为（埋点统计、日志记录等场景需要）

### 修复要求（frontend-developer立即执行）

#### 步骤1: 修改TemplateSelector组件接口
```typescript
// src/components/template/TemplateSelector.tsx

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (template: Template) => void;  // ✅ 新增可选回调
}
```

#### 步骤2: 在handleSelect中调用onSelect
```typescript
const handleSelect = useCallback(
  (template: Template) => {
    add({ type: 'success', message: `已选择模板「${template.name}」` });
    onClose();
    
    // ✅ 新增：调用外部回调
    onSelect?.(template);
    
    setTimeout(() => {
      navigate('/solution', { state: { selectedTemplate: template } });
    }, 500);
  },
  [add, navigate, onClose, onSelect]  // ✅ 添加onSelect依赖
);
```

#### 步骤3: 修改HomePage使用
```typescript
// src/pages/desktop/HomePage.tsx

<TemplateSelector
  open={isSelectorOpen}
  onClose={() => setIsSelectorOpen(false)}
  onSelect={(template) => {
    // 可选：记录用户选择、埋点统计等
    console.log('[Analytics] User selected template:', template.id);
  }}
/>
```

### 验证标准
- [ ] TemplateSelector接口包含onSelect可选属性
- [ ] handleSelect函数中调用onSelect?.(template)
- [ ] HomePage传入onSelect回调（可为空函数）
- [ ] TypeScript编译通过，无类型错误

---

## 📋 前端工程师行动清单

### 立即执行（本次会话完成）
- [ ] 修复Issue-06（TemplateSelector缺少onSelect回调）
- [ ] 验证修复结果（TypeScript编译通过）
- [ ] 提交代码

### 长期改进（后续所有任务）
- [ ] **Design Tokens审查**：每次提交前执行grep全局搜索
- [ ] **组件设计规范**：所有Modal/Selector组件必须支持外部回调
- [ ] **自检清单**：建立前端提交前自检清单（参考下方）

---

## 📝 前端提交前自检清单（必须执行）

### Code Quality检查
```bash
# 1. Design Tokens合规性
$ grep -r "#[0-9a-fA-F]{3,8}" src/ --include="*.{tsx,ts,css,scss}" --exclude=tokens.css
# 预期: Found 0 matches.

# 2. TypeScript类型检查
$ npm run type-check
# 预期: 0 errors

# 3. ESLint检查
$ npm run lint
# 预期: 0 errors
```

### 功能完整性检查
- [ ] 所有组件支持外部回调（onSelect/onChange/onSubmit等）
- [ ] 所有表单包含验证逻辑
- [ ] 所有异步操作包含loading状态
- [ ] 所有错误场景包含错误提示

### 代码规范检查
- [ ] 无硬编码颜色/间距/字体大小
- [ ] 100%使用Design Tokens
- [ ] 100%使用Lucide图标（无Emoji）
- [ ] 无any类型

---

## 💡 PM寄语

> 前端工程师是Design Tokens的**第一责任人**，每次提交前必须100%自查。  
> 本次Design Tokens遗漏是**警示信号**，说明缺乏系统性的审查流程。  
> 请立即建立自检清单，避免后续任务重复犯错。

**核心原则**:
- 🔴 **P0问题零容忍**: Design Tokens违规直接打回
- 🟡 **P2问题必须修**: 规范问题不留到下一阶段
- ✅ **自检是底线**: 不依赖PM/QA发现基础问题

---

**反馈人**: 产品经理 (PM)  
**接收人**: frontend-developer  
**反馈日期**: 2026-05-03  
**要求完成时间**: 本次会话内
