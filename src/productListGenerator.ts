/**
 * 品单生成器
 * ─────────────────────────────────────────
 * 职责：
 *   1. 从商品库中按场景筛选候选商品
 *   2. 随机挑选 4~6 个商品（规范 §3.2.2）
 *   3. 按"按比例分配金额"策略分配数量，使合计金额贴近总预算
 *   4. 计算 832 平台商品占比
 *   5. 附加消费帮扶提示文案
 *
 * 算法说明（规范明确"不做复杂凑价，只做简单组合+自动核算"）：
 *   Step 1  按场景过滤商品 → 候选池
 *   Step 2  Fisher-Yates shuffle 后取前 N 个（N ∈ [4,6]）
 *   Step 3  对每个商品，按其价格在总价中占比分配金额份额
 *           quantity = floor(份额 / price)，至少保证每个商品 1 份
 *   Step 4  若剩余金额 ≥ 某商品单价，把剩余预算补到最贵的商品上
 *
 * 消费帮扶提示文案来源：开发规范 §2.2.2
 */

import type { Product, ProductListResult, PurchaseItem, Scene, BudgetMode } from './types';

/** 消费帮扶标准提示文案（来自规范 §2.2.2） */
const HINT_832 =
  '温馨提示：为完成年度消费帮扶任务，建议在食品类采购中优先选用832平台产品，便于集中完成全年指标。';

/** 每次生成的商品数量范围 */
const MIN_ITEMS = 4;
const MAX_ITEMS = 6;

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/**
 * Fisher-Yates 洗牌（不修改原数组）
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 按场景过滤商品库
 * 兜底：若过滤后商品不足 MIN_ITEMS，直接使用全库商品
 */
function filterByScene(products: Product[], scene: Scene): Product[] {
  const filtered = products.filter((p) => p.scenes.includes(scene));
  return filtered.length >= MIN_ITEMS ? filtered : products;
}

/**
 * 按品类标签过滤商品库
 * 兜底：若过滤后商品不足 MIN_ITEMS，回退到只按场景过滤（不按品类）
 */
function filterByCategory(products: Product[], category: string, scene: Scene): Product[] {
  // 首先按场景过滤
  const sceneFiltered = filterByScene(products, scene);
  // 然后按品类标签过滤
  const categoryFiltered = sceneFiltered.filter((p) => p.category_tag === category);
  // 如果品类过滤后商品足够，返回品类过滤结果；否则返回场景过滤结果（不按品类）
  return categoryFiltered.length >= MIN_ITEMS ? categoryFiltered : sceneFiltered;
}

// ─────────────────────────────────────────────
// 数量分配核心算法
// ─────────────────────────────────────────────

/**
 * 在给定的总预算内，为已选商品分配数量
 *
 * 策略：
 *   1. 确保每个商品至少 1 份
 *   2. 剩余预算按商品单价比例分配额外数量
 *   3. 最后若仍有余量，全部追加到价格最高的商品上
 */
function allocateQuantities(
  selected: Product[],
  totalBudget: number,
): PurchaseItem[] {
  // 第一轮：每个商品先分 1 份
  let remaining = totalBudget;
  const quantities = selected.map((p) => {
    remaining -= p.price;
    return 1;
  });

  if (remaining < 0) {
    // 极端情况：某些商品单价之和就已超预算，退化到全部 1 份
    // 此处不报错，由调用方根据 totalAmount vs budget 判断
    return selected.map((p, i) => ({
      product: p,
      quantity: quantities[i],
      subtotal: p.price * quantities[i],
    }));
  }

  // 第二轮：将剩余预算按单价比例分配额外份数
  const totalPrice = selected.reduce((s, p) => s + p.price, 0);
  for (let i = 0; i < selected.length; i++) {
    const share = (selected[i].price / totalPrice) * remaining;
    const extra = Math.floor(share / selected[i].price);
    quantities[i] += extra;
    remaining -= extra * selected[i].price;
  }

  // 第三轮：把剩余金额（不足一份的零头）补给单价最高的商品
  let maxPriceIdx = 0;
  selected.forEach((p, i) => {
    if (p.price > selected[maxPriceIdx].price) maxPriceIdx = i;
  });
  const extraFromRemainder = Math.floor(remaining / selected[maxPriceIdx].price);
  quantities[maxPriceIdx] += extraFromRemainder;

  return selected.map((p, i) => ({
    product: p,
    quantity: quantities[i],
    subtotal: Math.round(p.price * quantities[i] * 100) / 100,
  }));
}

/**
 * 根据预算模式分配数量
 * 
 * 策略：
 *   - per_capita（按人均标准）：所有商品数量必须等于人数（或人数的整数倍）
 *   - total_control（按总额控制）：使用原有灵活分配策略
 */
function allocateQuantitiesWithMode(
  selected: Product[],
  totalBudget: number,
  headCount: number,
  budgetMode: BudgetMode,
): PurchaseItem[] {
  if (budgetMode === 'per_capita') {
    // 按人均标准：每个商品数量 = 人数（或人数 × 整数倍）
    // 计算每个商品的最大可能倍数（基于单价）
    const quantities = selected.map(p => {
      // 确保每人至少一份
      return headCount;
    });
    
    // 计算总金额
    const totalAmount = selected.reduce((sum, p, i) => sum + p.price * quantities[i], 0);
    
    // 如果总金额超过预算，需要调整（这里简化处理：如果超预算，仍返回但会有警告）
    return selected.map((p, i) => ({
      product: p,
      quantity: quantities[i],
      subtotal: Math.round(p.price * quantities[i] * 100) / 100,
    }));
  } else {
    // total_control：使用原有算法
    return allocateQuantities(selected, totalBudget);
  }
}

// ─────────────────────────────────────────────
// 主函数
// ─────────────────────────────────────────────

/**
 * 生成品单
 *
 * @param products    商品库（完整列表）
 * @param scene       当前采购场景
 * @param totalBudget 总预算（元）
 * @returns ProductListResult
 * @throws Error 当商品库为空时
 */
export function generateProductList(
  products: Product[],
  scene: Scene,
  totalBudget: number,
  headCount: number,
  budgetMode: BudgetMode = 'per_capita',
  category: string = '食品',
): ProductListResult {
  if (!products || products.length === 0) {
    throw new Error('商品库为空，无法生成品单。');
  }
  if (totalBudget <= 0) {
    throw new Error('总预算必须大于零。');
  }

  // Step 1：按场景和品类过滤 + 打乱
  const candidates = shuffle(filterByCategory(products, category, scene));

  // Step 2：随机决定本次商品数量 [MIN_ITEMS, MAX_ITEMS]，但不超过候选池大小
  const itemCount = Math.min(
    MIN_ITEMS + Math.floor(Math.random() * (MAX_ITEMS - MIN_ITEMS + 1)),
    candidates.length,
  );
  const selected = candidates.slice(0, itemCount);

  // Step 3：根据预算模式分配数量
  const items = allocateQuantitiesWithMode(selected, totalBudget, headCount, budgetMode);

  // Step 4：汇总统计
  const totalAmount = Math.round(
    items.reduce((s, it) => s + it.subtotal, 0) * 100,
  ) / 100;

  const platform832Amount = Math.round(
    items
      .filter((it) => it.product.is832)
      .reduce((s, it) => s + it.subtotal, 0) * 100,
  ) / 100;

  const budgetUsageRate =
    totalBudget > 0
      ? Math.round((totalAmount / totalBudget) * 10000) / 10000
      : 0;

  const platform832Rate =
    totalAmount > 0
      ? Math.round((platform832Amount / totalAmount) * 10000) / 10000
      : 0;

  return {
    items,
    totalAmount,
    budgetUsageRate,
    platform832Amount,
    platform832Rate,
    hint832: HINT_832,
  };
}

/**
 * 将品单格式化为可读文本（供报告模板使用）
 * 输出示例：
 *   1. 五常大米（10份 × 58元）    ¥580.00
 *   2. 椰树椰汁（10份 × 45元）    ¥450.00
 */
export function formatItemList(items: PurchaseItem[]): string {
  return items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.product.name}（${it.quantity}${it.product.unit} × ${it.product.price}元）`,
    )
    .join('\n');
}

// ─────────────────────────────────────────────
// 品单手动调整辅助函数
// ─────────────────────────────────────────────

/**
 * 重新计算品单汇总数据（用于手动调整后刷新统计）
 *
 * 不修改商品列表，只重新计算：
 *   - totalAmount（合计金额）
 *   - budgetUsageRate（预算使用率）
 *   - platform832Amount（832平台商品金额）
 *   - platform832Rate（832商品占比）
 *
 * @param items       当前的商品行列表
 * @param totalBudget 原始总预算（用于计算使用率）
 */
export function recalculateSolution(
  items: PurchaseItem[],
  totalBudget: number,
): Pick<ProductListResult, 'totalAmount' | 'budgetUsageRate' | 'platform832Amount' | 'platform832Rate'> {
  const totalAmount = Math.round(
    items.reduce((s, it) => s + it.subtotal, 0) * 100,
  ) / 100;

  const platform832Amount = Math.round(
    items
      .filter((it) => it.product.is832)
      .reduce((s, it) => s + it.subtotal, 0) * 100,
  ) / 100;

  const budgetUsageRate =
    totalBudget > 0
      ? Math.round((totalAmount / totalBudget) * 10000) / 10000
      : 0;

  const platform832Rate =
    totalAmount > 0
      ? Math.round((platform832Amount / totalAmount) * 10000) / 10000
      : 0;

  return { totalAmount, budgetUsageRate, platform832Amount, platform832Rate };
}
