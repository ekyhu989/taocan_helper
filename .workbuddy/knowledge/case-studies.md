# 踩坑案例库

> 记录项目实际发生的踩坑事件，避免重复犯错  
> 最后更新：2026-04-30

---

## 📌 使用说明

遇到问题时，先查本案例库是否有类似情况。如有，直接按解决方案处理。

---

## 💥 从旧项目继承的高频踩坑

### 案例1：API幻觉 - db.createCollection()

**来源**：速检云项目  
**出现次数**：2次  
**严重度**：🟡 中（代码报错）

#### 问题描述

Agent凭经验假设API存在，写了：
```javascript
await db.createCollection('customers');
```

实际应使用：
```javascript
await cloud.database().createCollection('customers');
```

#### 根因

未阅读模块源码，凭"常见用法"假设API存在。

#### 解决方案

**强制验证**：
```javascript
// 步骤1：先read_file查看db模块
read_file('src/cloudfunctions/common/database.js')

// 步骤2：确认API存在
module.exports = {
  ensureCollection: async (collectionName) => {
    const db = cloud.database();
    // 正确用法
    await db.createCollection(collectionName);
  }
}

// 步骤3：再写入调用代码
const { ensureCollection } = require('sjy-common/database');
await ensureCollection('customers');
```

#### 预防措施

✅ 已添加到：
- `.workbuddy/knowledge/api-index.md`（标记为幻觉API）
- `.agent/rules/hallucination-prevention.md`（规则1）
- 代码修改检查清单（检查项2）

---

### 案例2：数据丢失 - add缺少data包装

**来源**：速检云项目  
**出现次数**：2次  
**严重度**：🔴 高（数据全部丢失）

#### 问题描述

```javascript
// ❌ 错误：缺少 { data: } 包装，静默失败，只写_id
await db.collection('customers').add(doc);

// ✅ 正确：必须带 { data: } 包装
await db.collection('customers').add({ data: doc });
```

#### 影响范围

- 导入的客户数据全部丢失
- 只写了 `_id` 字段，其他字段未写入

#### 解决方案

**批量修复**：
```javascript
// 使用全局替换
// 查找: \.add\(([^)]+)\)
// 替换: .add({ data: $1 })

// 验证修复结果
grep_code('\.add\(', path='src/cloudfunctions/')
// 检查所有add调用是否都带{data:}包装
```

#### 预防措施

✅ 已添加到：
- `.workbuddy/knowledge/api-index.md`（标记为幻觉API）
- `.agent/rules/code-quality.md`（检查清单）
- 数据库操作检查清单（检查项2）

---

### 案例3：部署失败 - PowerShell打包不兼容

**来源**：速检云项目  
**出现次数**：1次  
**严重度**：🔴 高（部署失败）

#### 问题描述

使用PowerShell `Compress-Archive` 打包云函数：
```powershell
Compress-Archive -Path src/cloudfunctions/pay-callback/* -DestinationPath pay-callback.zip
```

部署后报 `FUNCTION_INVOCATION_FAILED`，腾讯云不兼容PowerShell打包格式。

#### 解决方案

**使用Python脚本打包**：
```bash
# 正确方式
python src/cloudfunctions/_deploy/pack_pay.py

# 或通用脚本
python src/cloudfunctions/_deploy/repack.py
```

#### 预防措施

✅ 已添加到：
- `.agent/rules/code-quality.md`（部署检查清单）
- Git提交检查清单（检查项1）

---

### 案例4：代码混乱 - replace_in_file不彻底

**来源**：速检云项目  
**出现次数**：1次  
**严重度**：🟡 中（运行时使用旧版）

#### 问题描述

使用replace_in_file时，old_str只匹配部分代码，导致旧代码残留：

```javascript
// 旧版本（残留）
async function ensureCollection(collectionName) {
  // 旧逻辑
}

// 新版本（新添加）
async function ensureCollection(collectionName) {
  // 新逻辑
}
```

运行时使用的是旧版（先定义的函数）。

#### 解决方案

**彻底替换**：
```javascript
// ✅ 正确：old_str包含完整函数定义
{
  "original_text": "async function ensureCollection(collectionName) {\n  // 旧代码\n  ...\n}",
  "new_text": "async function ensureCollection(collectionName) {\n  // 新代码\n  ...\n}"
}

// 替换后验证
grep_code('ensureCollection', path='src/cloudfunctions/common/')
// 应该只有1个匹配
```

#### 预防措施

✅ 已添加到：
- `.agent/rules/code-quality.md`（代码修改检查清单）
- 代码修改前检查（检查项4）
- 代码修改后检查（检查项3）

---

## 📝 新项目踩坑记录

### 暂无

*新项目启动，等待第一个踩坑事件...*

---

## 📊 踩坑统计

| 严重度 | 数量 | 占比 |
|--------|------|------|
| 🔴 高 | 2 | 50% |
| 🟡 中 | 2 | 50% |
| 🟢 低 | 0 | 0% |

| 类型 | 数量 | 占比 |
|------|------|------|
| API幻觉 | 1 | 25% |
| 数据操作 | 1 | 25% |
| 部署相关 | 1 | 25% |
| 代码修改 | 1 | 25% |

---

## 🔄 更新规则

- **新增案例**：每次遇到新踩坑事件，立即添加到本案例库
- **更新频率**：出现次数、影响范围、解决方案
- **关联检查清单**：每个案例必须关联到对应检查项

---

*本文档为项目知识库的重要组成部分，所有Agent员工必须遵守并持续更新。*
