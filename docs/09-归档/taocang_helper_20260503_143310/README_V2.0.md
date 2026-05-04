# AI采购方案生成工具 V2.0

<p align="center">
  <img src="./public/logo.png" alt="Logo" width="120">
</p>

<p align="center">
  <b>基层工会采购智能合规工具</b>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#更新日志">更新日志</a>
</p>

---

## 📖 项目简介

AI采购方案生成工具是一款专为基层工会设计的智能合规工具，帮助工会干事快速生成符合审计要求的采购方案、慰问方案和年度台账。

**核心定位**: 减负 + 防审计风险

**设计理念**: 
- 移动端优先，适配车间/慰问现场场景
- 合规透明化，所有计算可追溯
- 极简不臃肿，拒绝过度个性化

---

## ✨ 功能特性

### 🎯 智能方案生成

- **预算智能测算**: 根据资金来源自动计算价格约束（工会经费8折/其他资金9折）
- **商品智能匹配**: 基于预算和场景自动推荐合规商品
- **套餐自动组合**: 多目标优化算法，平衡价格、品类、合规性
- **方案对比视图**: 并排展示多版本方案，便于领导决策

### 📊 合规管理

- **832占比核算**: 自动计算贫困地区农副产品采购占比
- **合规预警体系**: 黄/橙/红三级预警，提前发现合规风险
- **政策文库**: 内置最新采购政策，支持全文检索
- **年度台账**: 自动汇总年度采购数据，支持跨年隔离

### 📱 移动端专属

- **户外强光可视**: 高对比度配色，正午阳光下清晰可读
- **单手操作**: 核心按钮全部下沉，单手完成全流程
- **振动反馈**: 操作结果通过振动感知，嘈杂环境可用
- **应急模式**: 10秒快速创建草稿，现场即开即用

### 💻 桌面端辅助

- **双视图切换**: 快捷编辑视图 + 公文排版视图
- **专业导出**: PDF/Excel高精度导出，适配打印盖章
- **批量管理**: 历史方案批量查看、导出、整理

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/ekyhu989/taocan_helper.git

# 2. 进入项目目录
cd taocan_helper

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器访问
# http://localhost:3000
```

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

---

## 🛠 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| TypeScript | 5.0.0 | 类型系统 |
| Vite | 5.0.0 | 构建工具 |

### 样式与UI

| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 3.3.6 | 原子化CSS |
| Headless UI | 1.7.0 | 无样式组件 |
| Heroicons | 2.0.0 | 图标库 |

### 工具库

| 技术 | 版本 | 用途 |
|------|------|------|
| docx | 9.6.1 | Word文档生成 |
| html2pdf.js | 0.14.0 | PDF导出 |
| crypto-js | 4.2.0 | 数据加密 |
| file-saver | 2.0.5 | 文件下载 |

### 测试

| 技术 | 版本 | 用途 |
|------|------|------|
| Jest | 30.3.0 | 测试框架 |
| React Testing Library | 16.3.2 | 组件测试 |
| Playwright | 1.40.0 | E2E测试 |

---

## 📁 项目结构

```
taocang_helper/
├── src/
│   ├── components/          # 公共组件
│   │   ├── common/         # 通用组件（双端共用）
│   │   ├── mobile/         # 移动端专用组件
│   │   └── desktop/        # 桌面端专用组件
│   ├── pages/              # 页面组件
│   │   ├── mobile/         # 移动端页面
│   │   └── desktop/        # 桌面端页面
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   │   ├── algorithm/      # 算法模块（方案生成、商品匹配）
│   │   ├── compliance/     # 合规计算（832占比、预警）
│   │   └── helpers/        # 辅助函数
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript类型定义
│   ├── constants/          # 常量定义
│   └── styles/             # 全局样式
├── docs/                   # 项目文档
│   ├── 01_产品文档/        # 需求文档、PRD
│   ├── 02_技术文档/        # 技术方案、架构设计
│   ├── 03_任务规划/        # 任务分配、Agent规范
│   └── 04_测试文档/        # 测试用例、测试报告
├── public/                 # 静态资源
│   ├── images/             # 图片资源
│   └── products.json       # 商品数据
├── tests/                  # 测试文件
├── tasks/                  # 任务日志（Agent工作记录）
├── README.md              # 项目说明
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
├── tailwind.config.js     # Tailwind配置
└── tsconfig.json          # TypeScript配置
```

---

## 📝 开发指南

### Agent协作规范

本项目采用多Agent协作开发模式：

| Agent | 职责 | 任务标识 |
|-------|------|---------|
| **GLM** | 业务逻辑、算法开发 | `GLM-V2.0-XXX` |
| **Doubao-seek** | UI组件、交互实现 | `Doubao-V2.0-XXX` |
| **DeepSeek** | 架构设计、系统集成 | `DeepSeek-V2.0-XXX` |

详细规范见：[Agent规范与协作指南](./docs/03_任务规划/V2.0_AGENT规范与协作指南.md)

### 代码规范

#### 提交信息格式

```
type: subject

# type类型
feat:     新功能
fix:      修复
docs:     文档
style:    格式
refactor: 重构
test:     测试
chore:    构建/工具

# 示例
git commit -m "feat: V2.0-001 实现价格约束算法"
git commit -m "fix: V2.0-002 修复移动端按钮错位"
```

#### 分支管理

- `main`: 主分支，稳定版本
- `develop`: 开发分支，日常开发
- `feature/xxx`: 功能分支
- `hotfix/xxx`: 紧急修复分支

### 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/V2.0-001

# 2. 开发并提交
git add .
git commit -m "feat: V2.0-001 实现xxx功能"

# 3. 推送到远程
git push origin feature/V2.0-001

# 4. 创建Pull Request（Code Review）

# 5. 合并到develop分支
```

---

## 🧪 测试策略

### 测试分层

```
┌─────────────────────────────────────────┐
│           E2E测试（Playwright）          │
│     模拟用户操作，验证完整业务流程        │
├─────────────────────────────────────────┤
│          集成测试（Jest）                │
│     验证模块间协作，API接口测试          │
├─────────────────────────────────────────┤
│          单元测试（Jest）                │
│     验证函数逻辑，组件渲染测试            │
└─────────────────────────────────────────┘
```

### 测试覆盖率要求

| 类型 | 目标覆盖率 | 优先级 |
|------|-----------|--------|
| 算法模块 | >= 90% | P0 |
| 工具函数 | >= 80% | P0 |
| 组件渲染 | >= 70% | P1 |
| 集成测试 | >= 60% | P1 |
| E2E测试 | 核心流程 | P0 |

---

## 📦 部署指南

### 腾讯云部署

```bash
# 构建生产版本
npm run build

# 部署到腾讯云CloudBase
cloudbase hosting:deploy dist -e {环境ID}
```

### Vercel部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录并部署
vercel login
vercel --prod
```

### 静态托管

构建完成后，`dist`文件夹可直接部署到任何静态托管服务：
- GitHub Pages
- Netlify
- AWS S3
- 阿里云OSS

---

## 📋 更新日志

### V2.0 (2026-04-XX) - 开发中

**新增功能**:
- 移动端独立重构，工业级现场作业工具
- 价格约束逻辑透明化，合规测算明细面板
- 临时商品备注功能，支持832平台链接导入
- 方案对比视图，多版本优劣自动标色
- 年度数据物理隔离，跨年无数据串扰
- 现场应急模式，10秒快速创建草稿
- 振动反馈机制，嘈杂环境盲操可用

**优化改进**:
- 832占比核算口径主次区分
- 合规红色预警闭环修复引导
- 单手操作热区规范，核心按钮全部下沉
- 户外强光可视性标准，高对比度配色

**移除功能**:
- ~~电子签章~~（不符合实际流程，改为物理盖章）

### V1.6 (2026-04-14)

- 政策文库合规升级
- 导航布局交互优化
- 历史方案全面升级
- 商品库管理功能升级
- 公文生成防错合规优化
- 批量操作安全防护体系
- 移动端体验专项优化
- 合规测算规则精细化
- 数据安全与灾难恢复

[查看完整更新日志](./CHANGELOG.md)

---

## 🤝 贡献指南

### 如何贡献

1. **Fork** 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 **Pull Request**

### 贡献规范

- 代码需通过 ESLint 检查
- 新功能需包含单元测试
- 提交信息需符合规范
- PR需经过Code Review

---

## 📄 许可证

[MIT](./LICENSE)

---

## 📞 联系我们

- **客服邮箱**: support@taocang-helper.com
- **技术支持**: tech@taocang-helper.com
- **项目主页**: https://github.com/ekyhu989/taocan_helper

---

<p align="center">
  Made with ❤️ by AI Development Team
</p>
