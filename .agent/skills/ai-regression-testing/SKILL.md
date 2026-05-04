---
name: ai-regression-testing
description: Regression testing strategies for AI-assisted development. Sandbox-mode API testing without database dependencies, automated bug-check workflows, and patterns to catch AI blind spots where the same model writes and reviews code.
status: active
source: github:affaan-m/everything-claude-code
github_url: https://github.com/affaan-m/everything-claude-code
last_updated: 2026-05-01
---

# AI Regression Testing

测试策略专门为AI辅助设计，解决**同一个模型既写代码又审查代码**导致的系统性盲点问题。

**蒸馏自**：https://github.com/affaan-m/everything-claude-code (skills/ai-regression-testing)

## 🎯 技能定位

当AI编写代码后，自动化的回归测试可以捕获AI审查遗漏的bug。

**核心问题**：
```
AI编写修复 → AI审查修复 → AI说"看起来正确" → Bug仍然存在
```

**真实案例**（生产环境观察）：
- 修复1：添加notification_settings到API响应 → 忘记添加到SELECT查询 → AI审查遗漏
- 修复2：添加到SELECT查询 → TypeScript编译错误 → AI审查修复1但没捕获SELECT问题
- 修复3：改为SELECT * → 修复了生产路径，忘记沙箱路径 → AI**再次**遗漏（第4次出现）
- 修复4：**测试立即捕获**，首次运行PASS

**模式**：沙箱/生产路径不一致是**AI引入回归的#1原因**

## 🔧 何时激活

- AI Agent已修改API路由或后端逻辑
- 发现并修复了bug - 需要防止重新引入
- 项目有沙箱/mock模式可用于无DB测试
- 运行bug-check或类似审查命令后
- 存在多个代码路径（沙箱vs生产、功能开关等）

## 📋 核心策略

### 策略1：沙箱模式API测试

大多数有AI友好架构的项目都有沙箱/mock模式。这是快速、无DB API测试的关键。

**测试辅助函数**：

```typescript
// 创建测试请求
function createTestRequest(url, options) {
  const { method = "GET", body, headers = {}, sandboxUserId } = options || {};
  const reqHeaders = { ...headers };
  
  if (sandboxUserId) {
    reqHeaders["x-sandbox-user-id"] = sandboxUserId;
  }
  
  return new NextRequest(url, { method, headers: reqHeaders, body });
}

// 强制沙箱模式 - 无需数据库
process.env.SANDBOX_MODE = "true";
```

### 策略2：编写回归测试

**关键原则**：**为发现的bug写测试，不为正常工作的代码写测试**

```typescript
// 定义契约 - 响应中必须包含的字段
const REQUIRED_FIELDS = [
  "id",
  "email",
  "full_name",
  "notification_settings"  // ← bug后发现缺失
];

describe("GET /api/user/profile", () => {
  it("返回所有必需字段", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { status, json } = await parseResponse(res);
    
    expect(status).toBe(200);
    for (const field of REQUIRED_FIELDS) {
      expect(json.data).toHaveProperty(field);
    }
  });
  
  // 回归测试 - 这个bug被AI引入了4次
  it("notification_settings不为undefined (BUG-R1回归)", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { json } = await parseResponse(res);
    
    expect("notification_settings" in json.data).toBe(true);
  });
});
```

## 🚨 4大常见AI回归模式

### 模式1：沙箱/生产路径不匹配

**频率**：最常见（4次回归中3次）

❌ **失败模式**：
```typescript
// AI只在生产路径添加字段
if (isSandboxMode()) {
  return { data: { id, email, name } };  // 缺少新字段
}
return { data: { id, email, name, notification_settings } };
```

✅ **正确模式**：
```typescript
// 两个路径必须返回相同结构
if (isSandboxMode()) {
  return { data: { id, email, name, notification_settings: null } };
}
return { data: { id, email, name, notification_settings } };
```

**捕获测试**：
```typescript
it("沙箱和生产返回相同字段", async () => {
  const res = await GET(createTestRequest("/api/user/profile"));
  const { json } = await parseResponse(res);
  
  for (const field of REQUIRED_FIELDS) {
    expect(json.data).toHaveProperty(field);
  }
});
```

### 模式2：SELECT子句遗漏

**频率**：常见（使用Supabase/Prisma添加新列时）

❌ **失败模式**：
```typescript
// 新字段添加到响应但未添加到SELECT
const { data } = await supabase
  .from("users")
  .select("id, email, name")  // 缺少notification_settings
  .single();

return { data: { ...data, notification_settings: data.notification_settings } };
// → notification_settings永远是undefined
```

✅ **正确模式**：
```typescript
// 使用SELECT *或显式包含新字段
const { data } = await supabase
  .from("users")
  .select("*")
  .single();
```

### 模式3：错误状态泄漏

**频率**：中等（向现有组件添加错误处理时）

❌ **失败模式**：
```typescript
catch (err) {
  setError("加载失败");
  // reservations仍显示之前标签页的数据！
}
```

✅ **正确模式**：
```typescript
catch (err) {
  setReservations([]);  // 清除过期数据
  setError("加载失败");
}
```

### 模式4：乐观更新无正确回滚

❌ **失败模式**：
```typescript
const handleRemove = async (id: string) => {
  setItems(prev => prev.filter(i => i.id !== id));
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  // 如果API失败，UI中项目消失但仍在数据库中
};
```

✅ **正确模式**：
```typescript
const handleRemove = async (id: string) => {
  const prevItems = [...items];
  setItems(prev => prev.filter(i => i.id !== id));
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API错误");
  } catch {
    setItems(prevItems);  // 回滚
    alert("删除失败");
  }
};
```

## 🔗 Bug-Check工作流集成

### 工作流定义

```
用户："bug检查" 或 "/bug-check"
  │
  ├─ 步骤1：npm run test（强制，不可跳过）
  │   ├─ FAIL → 最高优先级bug（机械发现，无需AI判断）
  │   └─ PASS → 继续
  │
  ├─ 步骤2：npm run build（TypeScript检查）
  │   ├─ FAIL → 类型错误（机械发现）
  │   └─ PASS → 继续
  │
  ├─ 步骤3：AI代码审查（已知盲点）
  │   ├─ 沙箱/生产路径一致性
  │   ├─ API响应形状匹配前端期望
  │   ├─ SELECT子句完整性
  │   ├─ 错误处理与回滚
  │   └─ 乐观更新竞态条件
  │
  └─ 步骤4：每个修复提议回归测试
      └─ 下次bug-check捕获修复是否破坏
```

## 📊 测试策略：在发现bug的地方测试

**不要追求100%覆盖率**，而是：

```
在/api/user/profile发现bug → 为profile API写测试
在/api/user/messages发现bug → 为messages API写测试
在Dashboard组件发现bug → 为Dashboard写测试
```

**结果**：
- 测试套件有机增长，针对**实际失败的地方**
- 每次bug-check自动捕获回归
- AI无法再引入相同的bug

## 🎯 QA工程师使用指南

### 审查阶段

1. **检查代码变更范围**
   - 是否修改了API路由？
   - 是否添加了新字段？
   - 是否有沙箱/生产双路径？

2. **运行现有回归测试**
   ```bash
   npm run test
   npm run build
   ```

3. **为新功能编写回归测试**
   - 定义响应契约（必需字段）
   - 测试沙箱/生产路径一致性
   - 测试边界条件和错误路径

### 修复验证阶段

1. **重新运行完整测试集**
2. **执行回归测试确保无破坏**
3. **验证所有Critical和High问题已修复**
4. **为新修复添加回归测试**

## ⚠️ 不可协商规则

1. **测试优先** - 修复bug前先写回归测试
2. **沙箱/生产一致性** - 两个路径必须返回相同结构
3. **SELECT完整性** - 新字段必须添加到查询
4. **错误状态清理** - 错误时清除过期数据
5. **乐观更新回滚** - API失败时恢复UI状态
6. **机械验证** - 测试失败是最高优先级bug，无需AI判断

## 🔗 上下游衔接

- **上游**：TaskExecutor（代码实现）
- **下游**：IssueFixer（问题修复）
- **协同**：QualityReviewer（代码审查）

---

**版本**: 1.0.0  
**下载日期**: 2026-05-01  
**来源**: affaan-m/everything-claude-code (172K stars)
