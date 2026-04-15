/**
 * V2.0 性能监控工具
 * 监控应用性能指标，支持性能优化
 */

/**
 * 性能指标接口
 */
export interface IPerformanceMetrics {
  // 加载性能
  firstContentfulPaint: number; // 首次内容绘制时间(ms)
  largestContentfulPaint: number; // 最大内容绘制时间(ms)
  firstInputDelay: number; // 首次输入延迟(ms)
  
  // 交互性能
  interactionToNextPaint: number; // 交互到下一次绘制时间(ms)
  cumulativeLayoutShift: number; // 累积布局偏移
  
  // 资源性能
  resourceLoadTime: number; // 资源加载时间(ms)
  bundleSize: number; // 包大小(bytes)
  
  // 内存使用
  memoryUsage: number; // 内存使用量(MB)
  memoryLeakDetected: boolean; // 内存泄漏检测
}

/**
 * 性能监控配置
 */
interface IPerformanceConfig {
  enabled: boolean;
  samplingRate: number; // 采样率 0-1
  reportUrl?: string; // 性能数据上报地址
  thresholds: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    memoryUsage: number;
  };
}

/**
 * 默认性能配置
 */
const defaultConfig: IPerformanceConfig = {
  enabled: true,
  samplingRate: 0.1, // 10%采样率
  thresholds: {
    firstContentfulPaint: 2000, // 2秒
    largestContentfulPaint: 2500, // 2.5秒
    firstInputDelay: 100, // 100ms
    memoryUsage: 100 // 100MB
  }
};

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private config: IPerformanceConfig;
  private metrics: IPerformanceMetrics;
  private observers: PerformanceObserver[] = [];
  
  constructor(config: Partial<IPerformanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObservers();
  }

  /**
   * 初始化性能指标
   */
  private initializeMetrics(): IPerformanceMetrics {
    return {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      interactionToNextPaint: 0,
      cumulativeLayoutShift: 0,
      resourceLoadTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      memoryLeakDetected: false
    };
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers(): void {
    if (!this.config.enabled || !window.PerformanceObserver) {
      return;
    }

    // 观察绘制性能
    this.observePaintMetrics();
    
    // 观察布局偏移
    this.observeLayoutShift();
    
    // 观察资源加载
    this.observeResourceLoading();
    
    // 观察内存使用
    this.observeMemoryUsage();
    
    // 观察用户交互
    this.observeUserInteractions();
  }

  /**
   * 观察绘制性能指标
   */
  private observePaintMetrics(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          this.metrics.largestContentfulPaint = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    this.observers.push(observer);
  }

  /**
   * 观察布局偏移
   */
  private observeLayoutShift(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          this.metrics.cumulativeLayoutShift += (entry as any).value;
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  /**
   * 观察资源加载
   */
  private observeResourceLoading(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.metrics.resourceLoadTime = Math.max(
            this.metrics.resourceLoadTime,
            entry.duration
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  /**
   * 观察内存使用
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        // 检测内存泄漏
        if (this.metrics.memoryUsage > this.config.thresholds.memoryUsage) {
          this.metrics.memoryLeakDetected = true;
          this.reportMemoryLeak();
        }
      }
    }
  }

  /**
   * 观察用户交互
   */
  private observeUserInteractions(): void {
    let firstInputTime = 0;
    let firstInputDelay = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          firstInputTime = entry.startTime;
          firstInputDelay = (entry as any).processingStart - entry.startTime;
          this.metrics.firstInputDelay = firstInputDelay;
        }
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  /**
   * 报告内存泄漏
   */
  private reportMemoryLeak(): void {
    if (this.config.reportUrl) {
      fetch(this.config.reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'memory_leak',
          metrics: this.metrics,
          timestamp: Date.now()
        })
      }).catch(() => {
        // 静默处理上报失败
      });
    }
  }

  /**
   * 获取当前性能指标
   */
  public getMetrics(): IPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 检查性能是否达标
   */
  public checkPerformance(): {
    passed: boolean;
    warnings: string[];
    errors: string[];
  } {
    const result = {
      passed: true,
      warnings: [] as string[],
      errors: [] as string[]
    };

    const { thresholds } = this.config;
    const metrics = this.metrics;

    // 检查各项指标
    if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      result.warnings.push(`首次内容绘制时间过长: ${metrics.firstContentfulPaint}ms`);
      result.passed = false;
    }

    if (metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      result.warnings.push(`最大内容绘制时间过长: ${metrics.largestContentfulPaint}ms`);
      result.passed = false;
    }

    if (metrics.firstInputDelay > thresholds.firstInputDelay) {
      result.warnings.push(`首次输入延迟过高: ${metrics.firstInputDelay}ms`);
      result.passed = false;
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      result.errors.push(`内存使用过高: ${metrics.memoryUsage}MB`);
      result.passed = false;
    }

    if (metrics.memoryLeakDetected) {
      result.errors.push('检测到内存泄漏');
      result.passed = false;
    }

    return result;
  }

  /**
   * 生成性能报告
   */
  public generateReport(): string {
    const metrics = this.metrics;
    const checkResult = this.checkPerformance();
    
    return `
# V2.0 性能监控报告

## 性能指标
- 首次内容绘制: ${metrics.firstContentfulPaint}ms
- 最大内容绘制: ${metrics.largestContentfulPaint}ms
- 首次输入延迟: ${metrics.firstInputDelay}ms
- 累积布局偏移: ${metrics.cumulativeLayoutShift.toFixed(3)}
- 资源加载时间: ${metrics.resourceLoadTime}ms
- 内存使用: ${metrics.memoryUsage}MB

## 性能检查结果
- 总体状态: ${checkResult.passed ? '✅ 通过' : '❌ 未通过'}

${checkResult.warnings.length > 0 ? `### 警告项\n${checkResult.warnings.map(w => `- ${w}`).join('\n')}` : ''}

${checkResult.errors.length > 0 ? `### 错误项\n${checkResult.errors.map(e => `- ${e}`).join('\n')}` : ''}

## 优化建议
${this.generateOptimizationSuggestions(checkResult)}
    `;
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(checkResult: any): string {
    const suggestions: string[] = [];
    const metrics = this.metrics;

    if (metrics.firstContentfulPaint > 2000) {
      suggestions.push('- 优化首屏加载，考虑代码分割和懒加载');
    }

    if (metrics.largestContentfulPaint > 2500) {
      suggestions.push('- 优化最大内容绘制，预加载关键资源');
    }

    if (metrics.firstInputDelay > 100) {
      suggestions.push('- 优化交互响应，减少主线程阻塞');
    }

    if (metrics.memoryUsage > 100) {
      suggestions.push('- 优化内存使用，检查内存泄漏');
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push('- 减少布局偏移，为图片和广告预留空间');
    }

    return suggestions.length > 0 ? suggestions.join('\n') : '当前性能表现良好，继续保持！';
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * 性能优化工具函数
 */

/**
 * 代码分割工具
 */
export const codeSplit = {
  /**
   * 动态导入组件
   */
  lazyLoad: (importFn: () => Promise<any>) => {
    return React.lazy(importFn);
  },

  /**
   * 预加载关键资源
   */
  preloadCriticalResources: (resources: string[]) => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.js') ? 'script' : 'style';
      document.head.appendChild(link);
    });
  },

  /**
   * 虚拟列表优化
   */
  virtualList: <T>({
    items,
    itemHeight,
    containerHeight,
    renderItem
  }: {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
  }) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
    
    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return (
      <div
        style={{ height: containerHeight, overflow: 'auto' }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: items.length * itemHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => (
              <div key={startIndex + index} style={{ height: itemHeight }}>
                {renderItem(item, startIndex + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

/**
 * 缓存优化工具
 */
export const cacheManager = {
  /**
   * 内存缓存
   */
  memoryCache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  /**
   * 设置缓存
   */
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    cacheManager.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },

  /**
   * 获取缓存
   */
  get: (key: string): any => {
    const cached = cacheManager.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      cacheManager.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  },

  /**
   * 清理过期缓存
   */
  cleanup: () => {
    const now = Date.now();
    for (const [key, cached] of cacheManager.memoryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        cacheManager.memoryCache.delete(key);
      }
    }
  }
};

/**
 * 图片优化工具
 */
export const imageOptimizer = {
  /**
   * 懒加载图片
   */
  lazyLoadImage: (src: string, alt: string = ''): string => {
    return `
      <img 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" 
        data-src="${src}" 
        alt="${alt}"
        class="lazy-image"
        loading="lazy"
      />
    `;
  },

  /**
   * 图片压缩
   */
  compressImage: async (file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(resolve as any, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// 导出性能监控器
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;