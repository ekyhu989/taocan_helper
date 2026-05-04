/**
 * 商品相关类型定义
 * V2.0 严格类型约束
 */

import type { TProcurementScene } from './scheme';

/** 商品分类 */
export type TProductCategory = 'food' | 'daily' | 'sports' | 'gift' | 'other';

/** 商品状态 */
export type TProductStatus = 'active' | 'inactive' | 'deleted';

/** 商品来源 */
export type TProductSource = 'official' | 'custom' | 'platform832';

/** 商品实体 */
export interface IProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: TProductCategory;
  categoryTag: string;
  scenes: TProcurementScene[];
  is832: boolean;
  source: TProductSource;
  status: TProductStatus;
  supplier?: string;
  specifications?: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/** 商品创建参数 */
export interface IProductCreateParams {
  name: string;
  unit: string;
  price: number;
  category: TProductCategory;
  categoryTag: string;
  scenes: TProcurementScene[];
  is832: boolean;
  source?: TProductSource;
  supplier?: string;
  specifications?: string;
  imageUrl?: string;
  description?: string;
}

/** 商品更新参数 */
export interface IProductUpdateParams {
  name?: string;
  unit?: string;
  price?: number;
  category?: TProductCategory;
  categoryTag?: string;
  scenes?: TProcurementScene[];
  is832?: boolean;
  supplier?: string;
  specifications?: string;
  imageUrl?: string;
  description?: string;
  status?: TProductStatus;
}

/** 商品筛选条件 */
export interface IProductFilter {
  category?: TProductCategory;
  scenes?: TProcurementScene[];
  is832?: boolean;
  source?: TProductSource;
  status?: TProductStatus;
  priceRange?: { min?: number; max?: number };
  searchText?: string;
}

/** 商品匹配结果 */
export interface IProductMatchResult {
  product: IProduct;
  matchScore: number;
  reasons: string[];
  priceCompliance: boolean;
  categoryMatch: boolean;
  sceneMatch: boolean;
}

/** 商品导入参数 */
export interface IProductImportParams {
  products: IProductCreateParams[];
  source: TProductSource;
  overrideExisting?: boolean;
}

/** 商品导入结果 */
export interface IProductImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    product: IProductCreateParams;
    error: string;
  }>;
}

/** 临时商品 */
export interface ITemporaryProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: string;
  is832: boolean;
  platform832Url?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationTicket?: string;
  createdAt: Date;
  schemeId: string;
}