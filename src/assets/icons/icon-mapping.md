# Lucide 图标替换映射表

> **版本**: V3.0  
> **用途**: 指导全项目Emoji → Lucide图标替换  
> **规则**: 所有新代码严禁使用Emoji，必须使用Lucide图标

---

## 一、功能图标映射

| V2.0 (Emoji) | V3.0 (Lucide) | 导入名 | 用途 |
|-------------|---------------|--------|------|
| 🛒 | `ShoppingCart` | `import { ShoppingCart } from 'lucide-react'` | 采购、购物车 |
| 📝 | `FileEdit` | `import { FileEdit } from 'lucide-react'` | 制定方案、编辑 |
| 📊 | `BarChart3` | `import { BarChart3 } from 'lucide-react'` | 合规测算、统计 |
| 📚 | `BookOpen` | `import { BookOpen } from 'lucide-react'` | 政策文库、阅读 |
| 📦 | `Package` | `import { Package } from 'lucide-react'` | 商品库、包裹 |
| 🚀 | `Rocket` | `import { Rocket } from 'lucide-react'` | 立即制定、启动 |

---

## 二、状态图标映射

| V2.0 (Emoji) | V3.0 (Lucide) | 导入名 | 用途 |
|-------------|---------------|--------|------|
| ✓ / ✅ | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` | 成功、通过 |
| ⚠️ | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` | 警告、提示 |
| ✕ / ❌ | `XCircle` | `import { XCircle } from 'lucide-react'` | 错误、失败 |
| ℹ️ | `Info` | `import { Info } from 'lucide-react'` | 信息、帮助 |
| ⏳ | `Clock` | `import { Clock } from 'lucide-react'` | 等待、时间 |
| 🔍 | `Search` | `import { Search } from 'lucide-react'` | 搜索、查找 |
| 🔗 | `Link` | `import { Link } from 'lucide-react'` | 链接、关联 |
| 📎 | `Paperclip` | `import { Paperclip } from 'lucide-react'` | 附件 |

---

## 三、操作图标映射

| V2.0 (Emoji/文字) | V3.0 (Lucide) | 导入名 | 用途 |
|------------------|---------------|--------|------|
| + | `Plus` | `import { Plus } from 'lucide-react'` | 新增 |
| ✏️ | `Pencil` | `import { Pencil } from 'lucide-react'` | 编辑 |
| 🗑️ | `Trash2` | `import { Trash2 } from 'lucide-react'` | 删除 |
| 👁️ | `Eye` | `import { Eye } from 'lucide-react'` | 查看 |
| 📥 | `Download` | `import { Download } from 'lucide-react'` | 下载 |
| 📤 | `Upload` | `import { Upload } from 'lucide-react'` | 上传 |
| 📋 | `Copy` | `import { Copy } from 'lucide-react'` | 复制 |
| 💾 | `Save` | `import { Save } from 'lucide-react'` | 保存 |
| 🖨️ | `Printer` | `import { Printer } from 'lucide-react'` | 打印 |
| ⚙️ | `Settings` | `import { Settings } from 'lucide-react'` | 设置 |
| ← | `ArrowLeft` | `import { ArrowLeft } from 'lucide-react'` | 返回 |
| → | `ArrowRight` | `import { ArrowRight } from 'lucide-react'` | 下一步 |
| ✕ | `X` | `import { X } from 'lucide-react'` | 关闭 |
| ⋮ | `MoreVertical` | `import { MoreVertical } from 'lucide-react'` | 更多操作 |
| 🔄 | `RefreshCw` | `import { RefreshCw } from 'lucide-react'` | 刷新 |
| 📁 | `FolderOpen` | `import { FolderOpen } from 'lucide-react'` | 打开文件夹 |
| 🏷️ | `Tag` | `import { Tag } from 'lucide-react'` | 标签 |
| 📅 | `Calendar` | `import { Calendar } from 'lucide-react'` | 日期选择 |
| 📧 | `Mail` | `import { Mail } from 'lucide-react'` | 邮件 |
| 👤 | `User` | `import { User } from 'lucide-react'` | 用户 |
| 🏠 | `Home` | `import { Home } from 'lucide-react'` | 首页 |
| 📖 | `BookOpen` | `import { BookOpen } from 'lucide-react'` | 文档 |
| 🧮 | `Calculator` | `import { Calculator } from 'lucide-react'` | 计算器 |

---

## 四、加载/空状态图标

| 场景 | Lucide 图标 | 导入名 |
|------|------------|--------|
| 加载中 | `Loader2` | `import { Loader2 } from 'lucide-react'` |
| 空状态 | `Inbox` | `import { Inbox } from 'lucide-react'` |
| 无数据 | `FileX` | `import { FileX } from 'lucide-react'` |
| 网络错误 | `WifiOff` | `import { WifiOff } from 'lucide-react'` |
| 搜索无结果 | `SearchX` | `import { SearchX } from 'lucide-react'` |

---

## 五、Tree-shaking 规范

```tsx
// ✅ 正确：命名导入，支持 Tree-shaking
import { ShoppingCart, FileEdit, CheckCircle } from 'lucide-react';

// ❌ 错误：全量导入，无法 Tree-shaking
import * as Icons from 'lucide-react';

// ❌ 错误：默认导入不存在
import Lucide from 'lucide-react';
```

---

## 六、图标尺寸规范

| 尺寸 | 用途 | className |
|------|------|-----------|
| 16px | 小按钮、标签内 | `w-4 h-4` |
| 20px | 默认尺寸、导航 | `w-5 h-5` |
| 24px | 大按钮、卡片图标 | `w-6 h-6` |
| 32px | 空状态、强调图标 | `w-8 h-8` |

---

## 七、图标颜色规范

| 场景 | 颜色方式 | 示例 |
|------|---------|------|
| 跟随文字 | `currentColor` | `<Icon className="text-primary" />` |
| 主色强调 | `var(--color-primary)` | `<Icon className="text-primary" />` |
| 成功状态 | `var(--color-success)` | `<Icon className="text-success" />` |
| 警告状态 | `var(--color-warning)` | `<Icon className="text-warning" />` |
| 错误状态 | `var(--color-error)` | `<Icon className="text-error" />` |
| 禁用状态 | `var(--color-text-disabled)` | `<Icon className="text-text-disabled" />` |

---

*本文档由 Task-007 生成，供 Task-008/009/010/011 使用*
