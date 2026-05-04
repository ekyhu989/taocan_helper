# V2.0 API接口文档

## 📋 文档概述

- **项目名称**: AI采购方案生成工具 V2.0
- **版本**: 2.0.0
- **最后更新**: 2026-04-15
- **文档类型**: API接口文档

## 🏗️ Store API

### SchemeStore API

#### 状态定义

```typescript
interface ISchemeState {
  // 当前方案
  currentScheme: IScheme | null;
  // 方案历史
  schemeHistory: IScheme[];
  // 草稿列表
  drafts: IScheme[];
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 筛选条件
  filter: ISchemeFilter;
}
```

#### 核心方法

##### 方案管理

```typescript
// 创建新方案
createScheme: (config: ISchemeConfig) => Promise<IScheme>

// 更新方案
updateScheme: (schemeId: string, updates: Partial<IScheme>) => Promise<IScheme>

// 删除方案
deleteScheme: (schemeId: string) => Promise<void>

// 获取方案详情
getScheme: (schemeId: string) => Promise<IScheme>

// 获取方案列表
listSchemes: (filter?: ISchemeFilter) => Promise<IScheme[]>
```

##### 商品管理

```typescript
// 添加商品到方案
addItemToScheme: (schemeId: string, item: ISchemeItem) => Promise<IScheme>

// 从方案移除商品
removeItemFromScheme: (schemeId: string, itemId: string) => Promise<IScheme>

// 更新商品信息
updateItemInScheme: (schemeId: string, itemId: string, updates: Partial<ISchemeItem>) => Promise<IScheme>
```

##### 合规检查

```typescript
// 执行合规检查
checkCompliance: (schemeId: string) => Promise<IComplianceResult>

// 获取合规报告
getComplianceReport: (schemeId: string) => Promise<IComplianceReport>
```

### ViewStore API

#### 状态定义

```typescript
interface IViewState {
  // 当前视图模式
  currentView: TViewMode;
  // 视图配置
  viewConfig: IViewConfig;
  // 最后编辑时间
  lastEditTime: Date | null;
}
```

#### 核心方法

```typescript
// 设置当前视图
setCurrentView: (view: TViewMode) => void

// 切换视图
toggleView: () => void

// 更新视图配置
updateViewConfig: (config: Partial<IViewConfig>) => void

// 检查未保存更改
hasUnsavedChanges: () => boolean

// 注册快捷键
registerViewShortcuts: () => (() => void)
```

### AnnualDataStore API

#### 状态定义

```typescript
interface IAnnualDataState {
  // 当前年份
  currentYear: number;
  // 年度数据
  annualData: Record<string, any>;
}
```

#### 核心方法

```typescript
// 获取年度数据键名
getAnnualKey: (key: string) => string

// 获取年度数据
getAnnualData: <T>(key: string, defaultValue?: T) => T | undefined

// 设置年度数据
setAnnualData: <T>(key: string, data: T) => void

// 清除年度数据
clearAnnualData: (key: string) => void

// 切换年份
switchYear: (year: number) => void
```

## 📊 导出API

### PDF导出API

```typescript
// 生成PDF文档
generatePdfDocument: (
  scheme: IScheme,
  config?: Partial<IPdfExportConfig>
) => Promise<IPdfExportResult>

// 批量导出PDF
batchExportPdf: (
  schemes: IScheme[],
  config?: Partial<IPdfExportConfig>
) => Promise<IPdfExportResult[]>
```

#### PDF导出配置

```typescript
interface IPdfExportConfig {
  format: 'pdf';
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  watermark: boolean;
  pageNumbers: boolean;
  pageSetup: {
    margin: { top: number; bottom: number; left: number; right: number };
    header?: string;
    footer?: string;
  };
  quality: 'standard' | 'high' | 'print';
}
```

### Excel导出API

```typescript
// 生成Excel文档
generateExcelDocument: (
  scheme: IScheme,
  config?: Partial<IExcelExportConfig>
) => Promise<IExcelExportResult>

// 批量导出Excel
batchExportExcel: (
  schemes: IScheme[],
  config?: Partial<IExcelExportConfig>
) => Promise<IExcelExportResult[]>

// 导出审计格式Excel
exportAuditExcel: (scheme: IScheme) => Promise<IExcelExportResult>

// 导出简化版Excel
exportSimpleExcel: (scheme: IScheme) => Promise<IExcelExportResult>
```

#### Excel导出配置

```typescript
interface IExcelExportConfig {
  format: 'excel';
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  auditFormat: boolean;
  multiSheet: boolean;
  hiddenSheets: boolean;
  styling: boolean;
}
```

## 🚀 性能API

### 性能监控API

```typescript
// 性能监控器类
class PerformanceMonitor {
  // 获取性能指标
getMetrics: () => IPerformanceMetrics

// 检查性能是否达标
checkPerformance: () => {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

// 生成性能报告
generateReport: () => string

// 销毁监控器
destroy: () => void
}
```

#### 性能指标定义

```typescript
interface IPerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
  cumulativeLayoutShift: number;
  resourceLoadTime: number;
  bundleSize: number;
  memoryUsage: number;
  memoryLeakDetected: boolean;
}
```

### 代码分割API

```typescript
// 代码分割工具
const codeSplit = {
  // 动态导入组件
  lazyLoad: (importFn: () => Promise<any>) => React.LazyExoticComponent<any>
  
  // 预加载关键资源
  preloadCriticalResources: (resources: string[]) => void
  
  // 虚拟列表优化
  virtualList: <T>(config: VirtualListConfig<T>) => JSX.Element
}
```

### 缓存管理API

```typescript
// 缓存管理器
const cacheManager = {
  // 设置缓存
  set: (key: string, data: any, ttl?: number) => void
  
  // 获取缓存
  get: (key: string) => any
  
  // 清理过期缓存
  cleanup: () => void
}
```

## 🔧 工具函数API

### 数据恢复API

```typescript
// 数据恢复管理器
class DataRecoveryManager {
  // 设置三要素
  setThreeFactors: (companyName: string, purchaserName: string, phoneNumber: string) => IValidationResult
  
  // 获取备份信息
  getBackupInfo: () => IBackupInfo[]
  
  // 恢复数据
  recoverData: (backupId: string) => Promise<IRecoveryResult>
  
  // 清除会话
  clearSession: () => void
}
```

### 合规检查API

```typescript
// 预算验证器
const budgetValidator = {
  // 验证预算合规
  validateBudget: (scheme: IScheme) => IBudgetValidationResult
  
  // 检查预算使用率
  checkBudgetUsage: (scheme: IScheme) => number
}

// 价格验证器
const priceValidator = {
  // 验证价格合规
  validatePrices: (items: ISchemeItem[]) => IPriceValidationResult
  
  // 检查价格限制
  checkPriceLimits: (items: ISchemeItem[], limits: IPriceLimits) => boolean
}
```

## 📱 组件API

### ViewSwitcher组件

#### Props接口

```typescript
interface ViewSwitcherProps {
  // 当前视图模式
  currentView?: TViewMode;
  // 视图切换回调
  onViewChange?: (view: TViewMode) => void;
  // 自定义样式类名
  className?: string;
  // 是否显示未保存提示
  showUnsavedIndicator?: boolean;
}
```

#### 方法

```typescript
// 切换到编辑视图
switchToEditView: () => void

// 切换到公文视图
switchToDocumentView: () => void

// 获取视图显示名称
getViewDisplayName: (view: TViewMode) => string

// 获取视图图标
getViewIcon: (view: TViewMode) => string
```

### ExportPanel组件

#### Props接口

```typescript
interface ExportPanelProps {
  // 要导出的方案
  scheme: IScheme;
  // 批量导出的方案列表
  schemes?: IScheme[];
  // 导出完成回调
  onExportComplete?: (result: IExportResult) => void;
  // 导出错误回调
  onExportError?: (error: string) => void;
  // 自定义样式类名
  className?: string;
}
```

#### 导出配置

```typescript
interface IExportSettings {
  format: 'pdf' | 'excel';
  quality: 'standard' | 'high' | 'print';
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  watermark: boolean;
  pageNumbers: boolean;
  auditFormat: boolean;
  multiSheet: boolean;
  hiddenSheets: boolean;
  styling: boolean;
  pageSetup: {
    margin: { top: number; bottom: number; left: number; right: number };
    header: string;
    footer: string;
  };
}
```

## 🔄 路由API

### 桌面端路由

```typescript
// 路由配置
interface IRouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  viewMode?: 'edit' | 'document';
  requiresAuth?: boolean;
  title?: string;
  icon?: string;
}

// 路由工具函数
const desktopRoutes = {
  // 获取当前路由
  getCurrentRoute: (pathname: string) => IRouteConfig | undefined
  
  // 导航到指定路径
  navigateTo: (path: string) => void
  
  // 获取视图相关路由
  getViewRoutes: (viewMode: 'edit' | 'document') => IRouteConfig[]
  
  // 路由变化监听
  useRouteChange: (callback: (route: IRouteConfig) => void) => void
}
```

## 📊 类型定义API

### 核心类型

```typescript
// 采购方案类型
type TSchemeStatus = 'draft' | 'completed' | 'archived';
type TProcurementScene = 'holiday' | 'sports' | 'other';
type TFundSource = 'union' | 'other';

// 商品类型
type TProductCategory = 'food' | 'daily' | 'sports' | 'gift' | 'other';
type TProductStatus = 'active' | 'inactive' | 'deleted';
type TProductSource = 'official' | 'custom' | 'platform832';

// 合规类型
type TComplianceLevel = 'pass' | 'warning' | 'error';
type TComplianceRuleType = 'budget' | 'price' | 'platform832' | 'category' | 'quantity';
```

### 接口定义

```typescript
// 采购方案接口
interface IScheme {
  id: string;
  name: string;
  year: number;
  status: TSchemeStatus;
  config: ISchemeConfig;
  items: ISchemeItem[];
  compliance: IComplianceResult;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
}

// 商品项接口
interface ISchemeItem {
  id: string;
  name: string;
  category: TProductCategory;
  unit: string;
  price: number;
  quantity: number;
  totalPrice: number;
  is832Platform: boolean;
  supplier?: string;
  notes?: string;
}

// 合规结果接口
interface IComplianceResult {
  budgetCompliance: IBudgetCompliance;
  priceCompliance: IPriceCompliance;
  platform832Compliance: IPlatform832Compliance;
  categoryCompliance: ICategoryCompliance;
}
```

## 🔧 错误处理API

### 错误类型

```typescript
// 业务错误
type TBusinessError = 
  | 'INVALID_BUDGET'
  | 'EXCEEDED_BUDGET'
  | 'INVALID_PRODUCT'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED';

// 错误处理接口
interface IErrorHandler {
  // 处理错误
  handleError: (error: Error, context?: string) => void;
  
  // 显示错误提示
  showError: (message: string, type?: 'error' | 'warning' | 'info') => void;
  
  // 记录错误日志
  logError: (error: Error, metadata?: Record<string, any>) => void;
}
```

## 📈 使用示例

### 基本使用示例

```typescript
// 创建采购方案
const createSchemeExample = async () => {
  const schemeStore = useSchemeStore();
  
  const config: ISchemeConfig = {
    totalBudget: 50000,
    peopleCount: 100,
    perCapitaBudget: 500,
    fundSource: 'union',
    scene: 'holiday',
    unitName: '测试单位'
  };
  
  const scheme = await schemeStore.createScheme(config);
  console.log('创建方案成功:', scheme);
};

// 导出PDF示例
const exportPdfExample = async () => {
  const scheme = await schemeStore.getScheme('scheme-001');
  
  const config: Partial<IPdfExportConfig> = {
    quality: 'print',
    watermark: true,
    pageNumbers: true
  };
  
  const result = await generatePdfDocument(scheme, config);
  
  if (result.success) {
    console.log('导出成功:', result.fileName);
  } else {
    console.error('导出失败:', result.error);
  }
};
```

---

## 📝 更新日志

### V2.0.0 (2026-04-15)

#### 新增API
- SchemeStore完整CRUD操作
- ViewStore双视图管理
- AnnualDataStore年度数据隔离
- 导出功能完整API
- 性能监控API

#### 改进API
- 完整的TypeScript类型定义
- 错误处理机制
- 缓存管理API
- 代码分割工具

---

**文档维护**: 请确保API文档与实际代码实现保持同步，API变更应及时更新文档。