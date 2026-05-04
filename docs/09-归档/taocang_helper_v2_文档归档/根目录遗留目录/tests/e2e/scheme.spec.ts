/**
 * V2.0 E2E测试 - 采购方案流程
 * 使用Playwright进行端到端测试
 */

import { test, expect } from '@playwright/test';

/**
 * 采购方案完整流程E2E测试
 */
test.describe('V2.0 采购方案完整流程E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto('http://localhost:5173');
    
    // 等待应用加载完成
    await page.waitForSelector('[data-testid="app-container"]');
  });

  /**
   * 测试场景1: 新建采购方案
   */
  test('TC-V20-010: 新建采购方案流程', async ({ page }) => {
    // 1. 点击新建方案按钮
    await page.click('[data-testid="new-scheme-button"]');
    
    // 2. 填写方案基本信息
    await page.fill('[data-testid="scheme-name-input"]', '2024年度节日慰问采购方案');
    await page.selectOption('[data-testid="year-select"]', '2024');
    await page.fill('[data-testid="budget-input"]', '50000');
    await page.fill('[data-testid="people-count-input"]', '100');
    
    // 3. 验证自动计算的人均预算
    const perCapitaBudget = await page.textContent('[data-testid="per-capita-budget"]');
    expect(perCapitaBudget).toContain('500');
    
    // 4. 选择资金来源和采购场景
    await page.click('[data-testid="fund-source-union"]');
    await page.selectOption('[data-testid="scene-select"]', 'holiday');
    
    // 5. 点击下一步
    await page.click('[data-testid="next-step-button"]');
    
    // 6. 验证进入商品选择页面
    await expect(page.locator('[data-testid="product-selection-page"]')).toBeVisible();
  });

  /**
   * 测试场景2: 商品选择和方案生成
   */
  test('TC-V20-011: 商品选择和方案生成', async ({ page }) => {
    // 1. 搜索商品
    await page.fill('[data-testid="product-search-input"]', '节日礼品');
    await page.click('[data-testid="search-button"]');
    
    // 2. 等待搜索结果加载
    await page.waitForSelector('[data-testid="product-list"]');
    
    // 3. 选择商品
    await page.click('[data-testid="product-item-0"]');
    await page.fill('[data-testid="quantity-input-0"]', '50');
    
    // 4. 验证金额计算
    const itemTotal = await page.textContent('[data-testid="item-total-0"]');
    expect(itemTotal).toContain('10000');
    
    // 5. 点击生成方案
    await page.click('[data-testid="generate-scheme-button"]');
    
    // 6. 等待方案生成完成
    await page.waitForSelector('[data-testid="scheme-preview"]');
    
    // 7. 验证方案预览
    const schemeTotal = await page.textContent('[data-testid="scheme-total-amount"]');
    expect(schemeTotal).toContain('10000');
  });

  /**
   * 测试场景3: 合规检查和保存
   */
  test('TC-V20-012: 合规检查和方案保存', async ({ page }) => {
    // 1. 查看合规检查结果
    await page.click('[data-testid="compliance-check-button"]');
    
    // 2. 等待合规检查完成
    await page.waitForSelector('[data-testid="compliance-result"]');
    
    // 3. 验证合规状态
    const budgetCompliance = await page.textContent('[data-testid="budget-compliance"]');
    expect(budgetCompliance).toContain('通过');
    
    const priceCompliance = await page.textContent('[data-testid="price-compliance"]');
    expect(priceCompliance).toContain('通过');
    
    // 4. 保存方案
    await page.click('[data-testid="save-scheme-button"]');
    
    // 5. 验证保存成功
    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible();
  });

  /**
   * 测试场景4: 双视图切换测试
   */
  test('TC-V20-013: 双视图切换功能', async ({ page }) => {
    // 1. 初始在编辑视图
    await expect(page.locator('[data-testid="edit-view"]')).toBeVisible();
    
    // 2. 切换到公文视图
    await page.click('[data-testid="document-view-button"]');
    
    // 3. 验证公文视图显示
    await expect(page.locator('[data-testid="document-view"]')).toBeVisible();
    
    // 4. 切换回编辑视图
    await page.click('[data-testid="edit-view-button"]');
    
    // 5. 验证编辑视图显示
    await expect(page.locator('[data-testid="edit-view"]')).toBeVisible();
    
    // 6. 测试快捷键切换
    await page.keyboard.press('Control+2');
    await expect(page.locator('[data-testid="document-view"]')).toBeVisible();
    
    await page.keyboard.press('Control+1');
    await expect(page.locator('[data-testid="edit-view"]')).toBeVisible();
  });

  /**
   * 测试场景5: 导出功能测试
   */
  test('TC-V20-014: 导出功能测试', async ({ page }) => {
    // 1. 打开导出面板
    await page.click('[data-testid="export-button"]');
    
    // 2. 选择导出格式
    await page.click('[data-testid="export-format-pdf"]');
    
    // 3. 配置导出选项
    await page.click('[data-testid="include-compliance"]');
    await page.click('[data-testid="include-products"]');
    
    // 4. 开始导出
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="start-export-button"]');
    
    // 5. 等待下载完成
    const download = await downloadPromise;
    
    // 6. 验证下载文件
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  /**
   * 测试场景6: 异常流程处理
   */
  test('TC-V20-015: 网络异常处理', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // 尝试保存方案
    await page.click('[data-testid="save-scheme-button"]');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // 验证重试功能
    await page.click('[data-testid="retry-button"]');
    
    // 恢复网络
    await page.unroute('**/api/**');
  });

  /**
   * 测试场景7: 边界情况测试
   */
  test('TC-V20-016: 边界值测试', async ({ page }) => {
    // 测试最大预算
    await page.fill('[data-testid="budget-input"]', '9999999');
    
    // 测试最小人数
    await page.fill('[data-testid="people-count-input"]', '1');
    
    // 验证计算正确性
    const perCapitaBudget = await page.textContent('[data-testid="per-capita-budget"]');
    expect(perCapitaBudget).toContain('9999999');
    
    // 测试空数据
    await page.fill('[data-testid="budget-input"]', '');
    await page.fill('[data-testid="people-count-input"]', '');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  /**
   * 测试场景8: 性能测试
   */
  test('TC-V20-017: 性能指标测试', async ({ page }) => {
    // 测量页面加载时间
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="app-container"]');
    const loadTime = Date.now() - startTime;
    
    // 验证加载时间在合理范围内
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
    
    // 测量交互响应时间
    const interactionStart = Date.now();
    await page.click('[data-testid="new-scheme-button"]');
    await page.waitForSelector('[data-testid="scheme-form"]');
    const interactionTime = Date.now() - interactionStart;
    
    // 验证交互响应时间
    expect(interactionTime).toBeLessThan(1000); // 1秒内响应
  });
});

/**
 * 并发操作测试
 */
test.describe('V2.0 并发操作测试', () => {
  test('TC-V20-018: 多标签页操作', async ({ browser }) => {
    // 创建多个标签页
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // 在两个标签页中同时操作
    await page1.goto('http://localhost:5173');
    await page2.goto('http://localhost:5173');
    
    // 在页面1中新建方案
    await page1.click('[data-testid="new-scheme-button"]');
    
    // 在页面2中查看方案列表
    await page2.click('[data-testid="scheme-list-button"]');
    
    // 验证两个页面都能正常工作
    await expect(page1.locator('[data-testid="scheme-form"]')).toBeVisible();
    await expect(page2.locator('[data-testid="scheme-list"]')).toBeVisible();
    
    await context.close();
  });

  test('TC-V20-019: 快速切换操作', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 快速进行多个操作
    const operations = [
      () => page.click('[data-testid="new-scheme-button"]'),
      () => page.click('[data-testid="scheme-list-button"]'),
      () => page.click('[data-testid="export-button"]'),
      () => page.click('[data-testid="settings-button"]')
    ];
    
    // 快速执行操作
    for (const operation of operations) {
      await operation();
      await page.waitForTimeout(100); // 短暂等待
    }
    
    // 验证应用状态稳定
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });
});