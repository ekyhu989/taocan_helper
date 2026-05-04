# Vercel 部署指南（推荐）

> 最适合智能采购助手的部署方案：零维护、零费用、自动部署。

---

## 🎯 为什么选择 Vercel

| 维度 | Vercel | 腾讯云 | 对比结论 |
|------|--------|--------|---------|
| **维护成本** | ⭐ 零维护 | ⭐⭐ 需偶尔登录检查 | Vercel完胜 |
| **部署难度** | ⭐ 一键自动 | ⭐⭐ 需配置 | Vercel更简单 |
| **费用** | ⭐ 完全免费 | ⭐ 免费额度内 | 两者都免费 |
| **更新发布** | ⭐ Git推送自动部署 | ⭐⭐ 需手动上传 | Vercel更省心 |
| **访问速度** | ⭐⭐⭐ 国内可用 | ⭐⭐⭐⭐⭐ 国内快 | 腾讯云略胜 |

**结论**: Vercel维护最简单，适合不想折腾服务器的人。

---

## 🚀 部署步骤（5分钟完成）

### 步骤1: 准备GitHub仓库

确保代码已推送到GitHub：
```bash
cd e:/taocang_helper
git push origin main
```

仓库地址: `https://github.com/ekyhu989/taocan_helper`

---

### 步骤2: 导入项目到Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 授权GitHub，选择 `ekyhu989/taocan_helper`
5. 点击 "Import"

---

### 步骤3: 配置构建设置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Framework Preset** | Vite | 项目使用Vite构建 |
| **Build Command** | `npm run build` | 构建命令 |
| **Output Directory** | `dist` | 输出目录 |
| **Install Command** | `npm install` | 安装依赖 |

点击 "Deploy"

---

### 步骤4: 等待部署完成

- Vercel自动构建并部署
- 约1-2分钟完成
- 获得默认域名：`taocan-helper.vercel.app`

---

### 步骤5: 验证部署

1. 访问 `https://taocan-helper.vercel.app`
2. 测试所有功能正常
3. ✅ 部署完成！

---

## 🔄 后续更新（零维护）

### 自动部署

Vercel与GitHub集成，代码推送自动部署：

```bash
# 1. 本地修改代码
# 2. 提交并推送
git add .
git commit -m "更新功能"
git push origin main

# 3. Vercel自动检测并重新部署
# 4. 约1分钟后，线上自动更新
```

**无需任何额外操作！**

---

### 预览部署

Pull Request自动创建预览环境：
- 团队成员可预览修改
- 确认无误后合并
- 合并后自动部署到生产环境

---

## 🌐 自定义域名（可选）

### 添加自己的域名

1. Vercel控制台 → Project Settings → Domains
2. 输入你的域名，如 `taocang.example.com`
3. 按提示配置DNS解析
4. 自动申请SSL证书（免费）

### 国内域名建议

- 阿里云万网购买域名
- 配置DNS解析到Vercel
- 无需备案（Vercel服务器在国外）

---

## 📊 免费额度说明

| 资源 | 免费额度 | 项目用量估算 |
|------|---------|-------------|
| **部署次数** | 无限 | 足够 |
| **带宽** | 100GB/月 | 足够（小型项目<10GB） |
| **构建时间** | 6000分钟/月 | 足够 |
| **团队成员** | 1人 | 足够 |

**结论**: 免费版完全够用，无需付费。

---

## ⚠️ 注意事项

### 国内访问

- Vercel服务器在国外，国内访问稍慢
- 但本项目是工具型应用，非高频访问，影响不大
- 如需要更快，可考虑后续迁移到国内CDN

### 数据存储

- 本项目使用localStorage，无后端
- 数据存在用户浏览器，不涉及服务器存储
- 符合Vercel静态网站托管场景

---

## 🆚 与腾讯云对比

| 场景 | 推荐 |
|------|------|
| 不想折腾、快速上线 | ✅ Vercel |
| 零维护、自动更新 | ✅ Vercel |
| 国内访问速度优先 | 腾讯云 |
| 政府项目合规要求 | 腾讯云 |
| 未来需要微信小程序 | 腾讯云 |

**本项目建议**: Vercel（维护简单）

---

## 📞 部署支持

如遇到问题：
1. 查看Vercel官方文档：https://vercel.com/docs
2. 查看构建日志（Vercel控制台）
3. 联系DeepSeek协助

---

**部署难度**: ⭐ 极低（5分钟完成）  
**维护成本**: ⭐ 零维护  
**年费用**: ¥0  
**推荐指数**: ⭐⭐⭐⭐⭐
