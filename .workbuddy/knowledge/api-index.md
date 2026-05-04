# 项目API索引

> **防幻觉核心文档** - 所有API必须在此注册  
> 最后更新：2026-04-30

---

## 📌 使用说明

1. **新项目启动时**：逐步添加已验证的API
2. **使用API前**：先查此索引，确认已验证
3. **发现新API**：验证后立即添加到索引
4. **发现幻觉API**：添加到"禁止使用"列表

---

## ✅ 已验证API

### 云数据库API（示例）

```javascript
// ✅ 正确：创建集合
await cloud.database().createCollection('customers');

// ✅ 正确：添加数据（必须带data包装）
await db.collection('customers').add({ data: doc });

// ✅ 正确：查询数据
const result = await db.collection('customers').where({ _openid: openid }).get();

// ✅ 正确：更新数据
await db.collection('customers').doc(id).update({ data: { name: 'new' } });

// ✅ 正确：删除数据
await db.collection('customers').doc(id).remove();
```

### sjy-common模块API（示例）

```javascript
// ✅ 正确：响应处理
const { success, error } = require('sjy-common/response');

// ✅ 正确：数据库操作
const { ensureCollection } = require('sjy-common/database');

// ✅ 正确：工具函数
const { formatDate, generateId } = require('sjy-common/utils');
```

### 云函数API（示例）

```javascript
// ✅ 正确：云函数入口
exports.main = async (event, context) => {
  // ...
};

// ✅ 正确：返回格式
return success({ data: result });
return error('错误信息');
```

---

## ❌ 幻觉API（禁止使用）

### 数据库API幻觉

```javascript
// ❌ 错误：API不存在
await db.createCollection('customers');
// ✅ 正确：cloud.database().createCollection()

// ❌ 错误：缺少data包装，静默失败
await db.collection('customers').add(doc);
// ✅ 正确：await db.collection('customers').add({ data: doc });

// ❌ 错误：API签名错误
await db.collection('customers').update({ name: 'new' });
// ✅ 正确：await db.collection('customers').doc(id).update({ data: { name: 'new' } });
```

### 模块API幻觉

```javascript
// ❌ 错误：相对路径（打包后失效）
const response = require('../../common/response');
// ✅ 正确：const { success, error } = require('sjy-common/response');

// ❌ 错误：模块不存在
const validator = require('sjy-common/validator');
// ✅ 正确：先read_file确认模块存在
```

---

## 📝 API注册模板

### 添加新API

```markdown
### [模块名称]API

```javascript
// ✅ 正确：[API描述]
[API调用示例]

// 说明：[参数说明、返回值、注意事项]
```
```

### 标记幻觉API

```markdown
### [模块名称]幻觉API

```javascript
// ❌ 错误：[错误描述]
[错误示例]
// ✅ 正确：[正确用法]
[正确示例]
```
```

---

## 🔄 更新记录

| 日期 | 操作 | 内容 | 更新人 |
|------|------|------|--------|
| 2026-04-30 | 初始化 | 创建API索引模板 | PM |

---

*本文档持续更新，所有Agent必须遵守。*
