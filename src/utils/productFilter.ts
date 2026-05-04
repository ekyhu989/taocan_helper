/**
 * 商品过滤工具函数
 * 提供对商品标签的空值保护功能
 */

import type { Product } from './helpers/productStorage';

/**
 * 检查商品是否具有高性价比标签
 * @param product 商品对象
 * @returns 是否具有高性价比标签
 */
export function hasCostPerformanceTag(product: Product): boolean {
  return product.costPerformanceTag === '高性价比';
}

/**
 * 检查商品是否具有高品质标签
 * @param product 商品对象
 * @returns 是否具有高品质标签
 */
export function hasQualityTag(product: Product): boolean {
  return product.qualityTag === '高品质';
}

/**
 * 获取商品的高性价比标签（空值保护）
 * @param product 商品对象
 * @returns 高性价比标签，如果不存在则返回null
 */
export function getCostPerformanceTag(product: Product): '高性价比' | null {
  return product.costPerformanceTag || null;
}

/**
 * 获取商品的高品质标签（空值保护）
 * @param product 商品对象
 * @returns 高品质标签，如果不存在则返回null
 */
export function getQualityTag(product: Product): '高品质' | null {
  return product.qualityTag || null;
}

/**
 * 过滤具有高性价比标签的商品
 * @param products 商品数组
 * @returns 具有高性价比标签的商品数组
 */
export function filterByCostPerformance(products: Product[]): Product[] {
  return products.filter(hasCostPerformanceTag);
}

/**
 * 过滤具有高品质标签的商品
 * @param products 商品数组
 * @returns 具有高品质标签的商品数组
 */
export function filterByQuality(products: Product[]): Product[] {
  return products.filter(hasQualityTag);
}

/**
 * 过滤同时具有高性价比和高品质标签的商品
 * @param products 商品数组
 * @returns 同时具有两个标签的商品数组
 */
export function filterByCostPerformanceAndQuality(products: Product[]): Product[] {
  return products.filter(product => 
    hasCostPerformanceTag(product) && hasQualityTag(product)
  );
}

/**
 * 检查商品是否具有任意标签
 * @param product 商品对象
 * @returns 是否具有任意标签
 */
export function hasAnyTag(product: Product): boolean {
  return hasCostPerformanceTag(product) || hasQualityTag(product);
}

/**
 * 获取商品的所有标签
 * @param product 商品对象
 * @returns 标签数组
 */
export function getAllTags(product: Product): string[] {
  const tags: string[] = [];
  if (hasCostPerformanceTag(product)) {
    tags.push('高性价比');
  }
  if (hasQualityTag(product)) {
    tags.push('高品质');
  }
  return tags;
}