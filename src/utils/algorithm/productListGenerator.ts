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
 * 根据资金来源计算人均总价上限 (PATCH-001 改进)
 * 
 * 核心改进：将目标从「人均基础预算」改为「人均总价上限」
 * - 工会经费: 预算 / 0.8 = 上限 (如200元→250元)
 * - 其他资金: 预算 / 0.9 = 上限 (如200元→222元)
 * 
 * @param perCapitaBudget 人均预算（元）
 * @param fundSource 资金来源
 * @returns 人均总价上限（元）
 */
function calculateMaxPerCapita(perCapitaBudget: number, fundSource: string): number {
  const trimmedSource = fundSource.trim();
  let factor = 0.9; // 默认其他资金9折
  
  if (trimmedSource === '工会经费') {
    factor = 0.8; // 工会经费8折
  }
  
  const calculated = perCapitaBudget / factor;
  return Math.max(10, Math.round(calculated));
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
function filterByCategory(
  products: Product[], 
  category: string, 
  scene: Scene,
  fundSource?: string,
  totalBudget?: number,
  headCount?: number
): Product[] {
  // 首先按场景过滤
  const sceneFiltered = filterByScene(products, scene);
  
  // 如果提供了资金来源和总预算，根据资金来源计算人均金额上限并过滤商品
  let priceFiltered = sceneFiltered;
  if (fundSource && totalBudget && totalBudget > 0) {
    // 计算人均预算：如果提供了人数且大于0，则使用人均预算；否则使用总预算（向后兼容）
    const perCapitaBudget = headCount && headCount > 0 ? totalBudget / headCount : totalBudget;
    // 根据资金来源计算人均金额上限
    const maxPerCapita = calculateMaxPerCapita(perCapitaBudget, fundSource);
    // 筛选单价不超过人均上限的商品
    priceFiltered = sceneFiltered.filter(p => p.price <= maxPerCapita);
    
    // 如果价格过滤后商品不足，尝试放宽到场景过滤的所有商品（但可能触发后续警告）
    if (priceFiltered.length < MIN_ITEMS) {
      // 记录但不强制，后续会检查人均金额
      console.warn(`价格过滤后商品不足 ${MIN_ITEMS} 个，使用场景过滤结果（可能超预算）`);
      priceFiltered = sceneFiltered;
    }
  }
  
  // 然后按品类标签过滤
  const categoryFiltered = priceFiltered.filter((p) => p.category_tag === category);
  // 如果品类过滤后商品足够，返回品类过滤结果；否则返回场景过滤结果（不按品类）
  return categoryFiltered.length >= MIN_ITEMS ? categoryFiltered : priceFiltered;
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
 *     改进：确保组合后人均金额不超过上限，否则减少商品数量
 *   - total_control（按总额控制）：使用原有灵活分配策略
 */
function allocateQuantitiesWithMode(
  selected: Product[],
  totalBudget: number,
  headCount: number,
  budgetMode: BudgetMode,
  fundSource: string,
): PurchaseItem[] {
  if (budgetMode === 'per_capita') {
    // 计算人均预算和上限
    const perCapitaBudget = totalBudget / headCount;
    const maxPerCapita = calculateMaxPerCapita(perCapitaBudget, fundSource);
    
    // 按人均标准：筛选出单价总和不超过上限的商品组合
    let validProducts = [...selected];
    let totalProductPrice = validProducts.reduce((sum, p) => sum + p.price, 0);
    
    // 如果商品单价总和超过人均上限，逐步移除最贵的商品直到满足条件
    while (totalProductPrice > maxPerCapita && validProducts.length > 1) {
      // 找到最贵的商品并移除
      let maxPriceIdx = 0;
      validProducts.forEach((p, i) => {
        if (p.price > validProducts[maxPriceIdx].price) maxPriceIdx = i;
      });
      validProducts.splice(maxPriceIdx, 1);
      totalProductPrice = validProducts.reduce((sum, p) => sum + p.price, 0);
    }
    
    // 如果只剩1个商品且仍超上限，使用该商品但记录警告
    if (validProducts.length === 0) {
      validProducts = [selected[0]]; // 至少保留1个商品
    }
    
    // 每个商品数量 = 人数
    const quantities = validProducts.map(() => headCount);
    
    return validProducts.map((p, i) => ({
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
  fundSource: string,
  budgetMode: BudgetMode = 'per_capita',
  category: string = '食品',
): ProductListResult {
  if (!products || products.length === 0) {
    throw new Error('商品库为空，无法生成品单。请联系客服导入商品。');
  }
  if (totalBudget <= 0) {
    throw new Error('总预算必须大于零。');
  }
  if (headCount <= 0) {
    throw new Error('人数必须大于零。');
  }

  // Step 1：按场景和品类过滤 + 打乱
  const candidates = shuffle(filterByCategory(products, category, scene, fundSource, totalBudget, headCount));

  // 检查候选商品是否足够
  let noMatchWarning: string | undefined;
  if (candidates.length === 0) {
    throw new Error('当前商品库暂无匹配的商品。请调整场景或品类条件，或联系客服添加所需商品。');
  }
  if (candidates.length < MIN_ITEMS) {
    noMatchWarning = `当前商品库匹配商品较少（仅 ${candidates.length} 个），建议联系客服添加更多商品以获得更优方案。`;
  }

  // Step 2：随机决定本次商品数量 [MIN_ITEMS, MAX_ITEMS]，但不超过候选池大小
  const itemCount = Math.min(
    MIN_ITEMS + Math.floor(Math.random() * (MAX_ITEMS - MIN_ITEMS + 1)),
    candidates.length,
  );
  const selected = candidates.slice(0, itemCount);

  // Step 3：根据预算模式分配数量
  const items = allocateQuantitiesWithMode(selected, totalBudget, headCount, budgetMode, fundSource);

  // 检查人均金额是否超过上限
  const totalAmount = Math.round(
    items.reduce((s, it) => s + it.subtotal, 0) * 100,
  ) / 100;
  const perCapitaAmount = headCount > 0 ? totalAmount / headCount : 0;
  // 计算人均预算，然后根据资金来源计算人均金额上限
  const perCapitaBudget = headCount > 0 ? totalBudget / headCount : totalBudget;
  const maxPerCapita = calculateMaxPerCapita(perCapitaBudget, fundSource);
  
  if (perCapitaAmount >= maxPerCapita) {
    // 如果人均金额超过上限，检查是否因为商品单价过高导致
    const highPriceItems = selected.filter(p => p.price > maxPerCapita);
    if (highPriceItems.length > 0) {
      // 有单价超过上限的商品，说明价格过滤失败
      throw new Error(`当前预算下无法生成满足条件的套餐，建议：
1. 调整预算金额（当前预算：${totalBudget}元）
2. 切换资金来源类型（当前：${fundSource}）
3. 手动选择商品

详细原因：有 ${highPriceItems.length} 个商品单价超过人均上限（${maxPerCapita}元）。`);
    } else {
      // 商品单价合规，但组合后人均超标
      throw new Error(`当前预算下无法生成满足条件的套餐，建议：
1. 调整预算金额（当前预算：${totalBudget}元）
2. 切换资金来源类型（当前：${fundSource}）
3. 手动选择商品

详细原因：组合后人均金额 ${perCapitaAmount.toFixed(2)} 元超过上限 ${maxPerCapita} 元。`);
    }
  }

  // Step 4：汇总统计

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
    noMatchWarning,
  };
}

/**
 * 将品单格式化为可读文本（供报告模板使用）
 * 输出示例：
 *   1. 五常大米（每人1份，总计50份）
 *   2. 椰树椰汁（每人1箱，总计50箱）
 * 
 * 以上物资每人一份，共计50人份。
 */
export function formatItemList(items: PurchaseItem[]): string {
  // 计算总人数（假设每个商品的数量相同，代表人数）
  const peopleCount = items.length > 0 ? items[0].quantity : 0;
  
  // 格式化每个商品项
  const formattedItems = items.map((it, idx) =>
    `${idx + 1}. ${it.product.name}（每人1${it.product.unit}，总计${it.quantity}${it.product.unit}）`
  ).join('\n');
  
  // 添加总计说明
  const totalSummary = `\n\n以上物资每人一份，共计${peopleCount}人份。`;
  
  return formattedItems + totalSummary;
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
