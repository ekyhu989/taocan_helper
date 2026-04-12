# AI采购方案生成工具 - 长期记忆

## 项目概述
- **项目名称**: AI采购方案生成工具
- **定位**: 仅做方案生成工具，不做电商、不做交易
- **核心功能**: 基于AI技术，为政企单位生成合规的采购申请报告和物资品单
- **技术栈**: React + Tailwind CSS + Vite + TypeScript
- **数据存储**: 本地JSON文件（商品库、mock数据）
- **AI服务**: 大模型API调用（预留接口）

## 开发规范遵循
- **术语规范**: 严禁使用"购买/下单/支付/商城/购物车"，统一替换为"采购/方案/预算/物资"
- **消费帮扶提示**: "温馨提示：为完成年度消费帮扶任务，建议在食品类采购中优先选用832平台产品，便于集中完成全年指标。"
- **合规提醒**: 人均预算超过500元时自动添加黄色提醒文案
- **公文模板**: 使用三套模板（传统节日慰问/专项活动物资/精准帮扶慰问）
- **错误处理**: 网络异常、数据异常、系统异常分别显示对应提示

## 架构组件
1. **核心逻辑层** (src/)
   - budgetValidator.ts: 预算校验与中文大写金额转换
   - productListGenerator.ts: 品单生成算法（随机组合+比例分配）
   - reportAssembler.ts: 报告组装与模板填充
   - types.ts: TypeScript类型定义
2. **UI组件层** (src/components/)
   - BasicInfoForm.jsx: 基础信息录入表单
   - SolutionPreview.jsx: 采购方案预览（品单展示）
   - ProcurementReport.jsx: 采购申请报告展示
3. **数据层** (src/data/)
   - products.json: 商品库（24个商品，含832标识）
   - mockData.js: 模拟数据（基础信息、品单、报告示例）
4. **主入口** (src/App.jsx): 视图状态管理与逻辑串联
5. **页面层** (src/pages/): 报告预览页面入口

## 已完成阶段
### 第一阶段: UI组件开发 (已完成)
- BasicInfoForm: 基础信息录入表单，包含单位名称、采购场景、人数、总预算等字段
- SolutionPreview: 采购方案预览，展示商品清单、合计金额、人均标准、832平台占比
- ProcurementReport: 采购申请报告展示，支持模板变量渲染

### 第二阶段: 逻辑工具开发 (已完成)
- budgetValidator: 预算合法性校验与中文大写金额转换
- productListGenerator: 品单生成算法（随机4-6个商品，按比例分配数量）
- reportAssembler: 报告组装器，支持三套模板变量填充

### 第三阶段: 系统集成与逻辑闭环 (已完成 - 2026-04-11)
- **主入口重构**: App.jsx扩展表单状态，包含所有字段（unitName, scene, headCount, totalBudget, fundSource, department, applicant, year, festival）
- **逻辑串联**: 集成商品数据(products.json)与表单组件，实现"生成方案"核心逻辑
  - 读取用户输入 → 调用计算工具 → 读取公文模板 → 执行字符串替换 → 生成最终报告文本
- **视图切换**: 点击"下一步"后，界面从"录入表单"平滑切换到"报告预览"
- **数据转换适配**: 转换productListResult为SolutionPreview期望格式，传递reportResult.body给ProcurementReport
- **错误处理**: 添加加载状态与异常捕获，提供用户友好的错误提示

### 第四阶段: 全链路优化 (已完成 - 2026-04-11)
- **前端交互增强**: 基础信息录入区新增两个下拉框
  - 预算模式：默认"按人均标准"（福利发放），备选"按总额控制"（公用物资）
  - 意向品类：默认"食品"，选项包括"日用品"、"文体用品"、"其它节日礼品"
- **数据库结构调整**: 
  - Product类型添加`category_tag`字段，商品库(products.json)完成数据清洗
  - 确保品类筛选严格性：食品类不出现雨伞，日用品类不出现牛奶
- **核心算法重构**:
  - 新增`BudgetMode`类型（'per_capita' | 'total_control'）
  - 扩展`generateProductList`函数支持品类筛选和预算模式差异化数量分配
  - `per_capita`模式：所有商品数量等于人数（每人一份，公平分配）
  - `total_control`模式：保持原有灵活配比算法
- **界面展示优化**:
  - 商品清单底部增加统计栏，显示"人均合计金额"
  - 计算实际人均福利价值，提升方案透明度

### 第五阶段: 字段布局优化与验证迁移 (已完成 - 2026-04-12)
- **基础信息录入页简化**: 只保留6个核心字段
  - 采购场景、人数、总预算、资金来源、预算模式、意向品类
  - 移除单位名称、申请部门、申请人字段（移至公文生成页）
- **公文生成页增强**: 添加单位名称、申请部门、申请人字段及验证
  - 三个字段为公文生成页必填项，验证逻辑迁移至此
  - 保留年份、节日（如适用）字段
- **代码结构调整**:
  - App.jsx: 分离solutionFormData（6字段）和reportFormData（5字段）
  - BasicInfoForm.jsx: 移除三个字段，保持6字段布局
  - mockData.js: 更新basicInfo结构，移除冗余字段
  - types.ts: 扩展UserInput接口，添加budgetMode和category可选字段
- **验证流程优化**:
  - 基础信息录入页：验证人数、总预算（预算校验器）
  - 公文生成页：验证单位名称、申请部门、申请人（必填项）
- **用户界面优化**:
  - 公文生成页添加表单区域，明确标注必填项
  - 错误提示位置与对应字段对齐

### 第六阶段: 公文生成页布局优化与格式统一 (已完成 - 2026-04-12)
- **公文生成页布局优化**：
  - 将"生成正式公文"按钮移到方案摘要和采购申请报告之间
  - 操作按钮区域位于方案摘要之后、公文预览之前
- **示例公文格式统一**：
  - 修改ProcurementReport组件，示例公文去掉红头格式
  - 统一示例公文与实际生成公文的格式，保持一致性
  - 更新提示文本，去掉红头相关描述
- **用户界面优化**：
  - 公文生成页布局更符合用户操作流程：方案摘要 → 填写信息 → 生成公文 → 查看结果
  - 示例公文与实际公文格式保持一致，减少用户困惑

### 第七阶段: 项目GitHub推送与版本管理 (已完成 - 2026-04-12)
- **GitHub仓库配置**：
  - 远程仓库URL：`https://github.com/ekyhu989/taocan_helper.git`
  - SSH仓库URL：`git@github.com:ekyhu989/taocan_helper.git`
- **提交记录**：
  - 提交哈希：`0729587` - 更新专家历史记录
  - 提交哈希：`79dd3a8` - 更新工作记忆：添加GitHub推送记录
- **推送状态**：
  - 成功推送到GitHub主分支
  - 所有代码修改、配置文件和工作记忆都已同步
- **技术问题解决**：
  - 解决HTTPS连接问题（临时禁用SSL验证）
  - 解决SSH主机密钥验证问题
  - 项目已完全同步到远程仓库

## 技术实现详情
### 数据流
1. **基础信息录入**：用户填写采购场景、人数、总预算等6个字段 → BasicInfoForm更新solutionFormData → App.jsx状态更新
2. **生成采购方案**：点击"生成方案" → 调用validateBudget校验人数和总预算 → 调用generateProductList生成品单（考虑预算模式和意向品类）→ 更新productListResult状态
3. **切换到公文生成页**：点击"下一步：生成公文" → 切换到report视图，显示公文生成页表单（单位名称、申请部门、申请人等字段）
4. **生成正式公文**：填写公文信息 → 点击"生成正式公文" → 验证单位名称、申请部门、申请人 → 合并solutionFormData和reportFormData → 调用assembleReport组装报告 → 更新reportResult状态
5. **报告展示**：ProcurementReport接收reportResult.body渲染报告正文，SolutionPreview显示品单预览

### 关键函数
- `validateBudget(totalBudget, headCount)`: 返回校验结果与人均预算
- `generateProductList(products, scene, totalBudget)`: 返回品单生成结果（items, totalAmount, platform832Amount等）
- `assembleReport(userInput, productResult)`: 返回报告结果（title, body, sceneLabel）

## 后续建议
1. **API集成**: 连接大模型API实现智能文本生成
2. **导出功能**: 实现Word/PDF格式报告导出
3. **商品库管理**: 提供商品信息的增删改查界面
4. **用户认证**: 添加简单的登录与权限管理
5. **部署优化**: 配置Docker容器化部署与环境变量

---
*最后更新: 2026-04-12 (第七阶段完成)*
*维护者: 高级全栈开发工程师*