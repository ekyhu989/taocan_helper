---
name: design-brief-builder
description: 设计规范构建器。基于需求规格生成正式设计规范文档，包括风格选择、配色系统、字体系统、组件规范、交互规范、UX指南。
status: active
source: distilled:ui-ux-pro-max-skill
github_source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
last_updated: 2026-05-01
---

# 设计规范构建器（DesignBriefBuilder）

## 🎯 技能定位

从需求规格说明书转化为结构化、可执行的设计规范文档，为设计落地提供完整约束和指导。

**核心能力来源**：蒸馏自ui-ux-pro-max-skill的99条UX指南、50+设计风格、161种配色方案、57种字体配对。

## 📥 输入

- 需求规格说明书（来自DemandSpecBuilder）
- 目标用户画像
- 品牌约束（如有）
- 技术栈选择（React/Vue/Svelte/原生等）

## 📤 输出

完整的设计规范文档，包含以下章节：

1. **产品定位与风格选择**
2. **配色系统规范**
3. **字体与排版系统**
4. **布局与响应式规范**
5. **组件设计规范**
6. **交互与动画规范**
7. **可访问性要求**
8. **性能约束**

## 🔧 执行流程

### Phase 1: 分析需求

1. **产品类型识别**
   - 从需求中识别产品类型：Landing Page / Dashboard / Admin Panel / SaaS / E-commerce / Mobile App / Portfolio / Blog
   - 确定目标用户：普通消费者 / 企业用户 / 开发者 / 管理员

2. **约束条件提取**
   - 品牌约束（主色、Logo风格、品牌调性）
   - 技术栈约束（React/Vue/Svelte/原生平台）
   - 平台约束（Web / iOS / Android / 跨平台）

### Phase 2: 风格决策

基于产品类型和目标用户，从50+设计风格中选择：

**风格匹配矩阵**（来自ui-ux-pro-max-skill）：

| 产品类型 | 推荐风格 | 理由 |
|---------|---------|------|
| SaaS Dashboard | Clean + Minimalism | 专业、高效、信息密度高 |
| E-commerce | Modern + Glassmorphism | 视觉吸引力强、突出商品 |
| Portfolio | Creative + Editorial | 个性化、艺术感 |
| Admin Panel | Enterprise + Flat | 清晰、易用、功能导向 |
| Landing Page | Bold + Gradient | 视觉冲击、转化导向 |
| Mobile App | iOS HIG / Material Design | 平台原生体验 |

**风格选择规则**：
- ❌ 禁止混用不兼容风格（如Flat + Skeuomorphic）
- ✅ 必须保持全站一致性
- ✅ 使用SVG图标，禁止使用Emoji
- ✅ 阴影、模糊、圆角必须与选择的风格对齐

### Phase 3: 配色系统

**从161种配色方案中选择**，遵循以下规则：

1. **主色选择**
   - 基于产品类型和行业：金融→蓝色系、健康→绿色系、科技→紫色系
   - 确保主色符合品牌调性

2. **语义色定义**
   ```
   - Primary: 主要操作按钮、链接
   - Secondary: 次要操作
   - Success: 成功状态（#22C55E）
   - Warning: 警告状态（#F59E0B）
   - Error: 错误状态（#EF4444）
   - Info: 信息提示（#3B82F6）
   ```

3. **对比度要求**
   - 普通文本：最低4.5:1（WCAG AA）
   - 大文本：最低3:1
   - 禁止使用灰色文字在灰色背景上

4. **暗色模式**
   - 必须同时设计Light/Dark变体
   - 保持品牌色、对比度、风格一致性

### Phase 4: 字体与排版系统

**从57种字体配对中选择**，遵循以下规则：

1. **基础字号**
   - 移动端最小16px（避免iOS自动放大）
   - Body文本行高1.5
   - 禁止使用<12px的正文

2. **行长控制**
   - 移动端：35-60字符/行
   - 桌面端：60-75字符/行

3. **字体层级**
   ```
   - H1: 32-40px（页面标题）
   - H2: 24-32px（区块标题）
   - H3: 20-24px（子标题）
   - Body: 16px（正文）
   - Caption: 14px（辅助说明）
   ```

4. **字体加载策略**
   - 使用`font-display: swap`避免文本不可见
   - 仅预加载关键字体
   - 预留字体空间避免布局偏移（CLS）

### Phase 5: 布局与响应式规范

1. **断点系统**
   ```
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1024px
   - Wide: 1440px
   ```

2. **间距系统**
   - 使用4pt/8dp增量系统（Material Design标准）
   - 推荐间距：4, 8, 12, 16, 24, 32, 48, 64

3. **触摸目标**
   - 最小尺寸：44×44pt（Apple）/ 48×48dp（Material）
   - 最小间距：8px
   - 禁止仅依赖hover状态（移动端无效）

4. **响应式规则**
   - Mobile-first设计
   - 禁止水平滚动
   - 禁止使用`disable zoom`
   - 图片/视频自适应容器

### Phase 6: 组件设计规范

针对需求中涉及的核心组件，定义：

1. **按钮（Button）**
   - 主按钮：实心填充、主色背景
   - 次按钮：描边或文字按钮
   - 禁用态：透明度50%、cursor: not-allowed
   - Loading态：禁用+旋转图标

2. **表单（Form）**
   - 必须使用可见label（禁止仅用placeholder）
   - 错误提示靠近问题字段
   - 提供helper text
   - 渐进式披露（避免一次性展示过多字段）

3. **卡片（Card）**
   - 统一圆角和阴影值
   - 内容区padding一致
   - hover态有视觉反馈

4. **导航（Navigation）**
   - 底部导航≤5个条目
   - 面包屑用于深层级
   - 支持深度链接

### Phase 7: 交互与动画规范

1. **动画时长**
   - 快速反馈：150ms
   - 标准转场：200-300ms
   - 复杂动画：≤500ms
   - 禁止装饰性动画

2. **动画类型**
   - 使用transform/opacity（GPU加速）
   - 禁止频繁修改width/height（触发reflow）
   - 尊重`prefers-reduced-motion`设置

3. **加载反馈**
   - >1s操作使用骨架屏/shimmer
   - 禁止长时间阻塞spinner
   - 输入延迟<100ms（Material标准）

### Phase 8: 可访问性（A11y）

**关键检查清单**（来自ui-ux-pro-max-skill优先级1）：

- [ ] 颜色对比度≥4.5:1
- [ ] 所有图片有alt text
- [ ] 完整的键盘导航支持
- [ ] Icon按钮有aria-label
- [ ] 表单使用label+for关联
- [ ] 标题层级h1→h6不跳跃
- [ ] 不单独使用颜色传达信息
- [ ] 支持系统文本缩放
- [ ] 模态框提供关闭/返回路径

### Phase 9: 性能约束

**关键性能指标**：

1. **图片优化**
   - 使用WebP/AVIF格式
   - 响应式图片（srcset/sizes）
   - 懒加载非关键资源
   - 声明width/height避免CLS<0.1

2. **代码分割**
   - 按路由/特性分割代码
   - 使用React Suspense / Next.js dynamic
   - 第三方脚本async/defer加载

3. **列表虚拟化**
   - 50+条目使用虚拟化列表
   - 避免DOM节点过多

4. **主线程预算**
   - 每帧工作<16ms（60fps）
   - 重任务移出主线程

## 📋 输出模板

```markdown
# [项目名称] 设计规范

## 1. 产品定位
- 产品类型：[Dashboard/Landing Page/...]
- 目标用户：[用户画像]
- 设计风格：[风格名称]

## 2. 配色系统
- Primary: #XXXXXX
- Secondary: #XXXXXX
- Success/Warning/Error: #XXXXXX
- 对比度验证：通过WCAG AA

## 3. 字体系统
- 主字体：[Font Family]
- 等宽字体：[Font Family]
- 字号层级：H1/H2/H3/Body/Caption

## 4. 布局规范
- 断点：375/768/1024/1440
- 间距系统：4pt增量
- 触摸目标：≥44×44pt

## 5. 核心组件
[按钮/表单/卡片/导航的具体规范]

## 6. 交互规范
- 动画时长：150-300ms
- 加载反馈：骨架屏
- 手势：标准平台手势

## 7. 可访问性
[A11y检查清单完成度]

## 8. 性能目标
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
```

## 🔗 上下游衔接

- **上游**：DemandSpecBuilder（需求规格说明书）
- **下游**：DesignMaker（设计落地生成）
- **协同**：QualityReviewer（设计规范符合度审查）

## 📚 蒸馏来源

本Skill核心能力蒸馏自：
- **ui-ux-pro-max-skill** (659行)
  - 50+ 设计风格库
  - 161 种配色方案
  - 57 种字体配对
  - 99 条UX指南
  - 25 种图表类型
  - 10 种技术栈适配

**蒸馏策略**：
- 保留：风格决策矩阵、配色规则、字体系统、A11y清单、性能约束
- 转化：将查询式指南转化为生成式规范
- 精简：去除代码示例，保留规范定义

---

**版本**: 1.0.0  
**蒸馏日期**: 2026-05-01  
**来源**: nextlevelbuilder/ui-ux-pro-max-skill
