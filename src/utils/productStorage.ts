import defaultProducts from '../data/products.json';

const STORAGE_KEY = 'taocang_products';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  category_tag: string;
  scenes: string[];
  is832: boolean;
  description?: string;
  image_url?: string;
}

export const loadProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('加载商品数据失败:', error);
  }
  return defaultProducts as Product[];
};

export const saveProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('保存商品数据失败:', error);
  }
};

export const resetToDefault = (): Product[] => {
  localStorage.removeItem(STORAGE_KEY);
  return defaultProducts as Product[];
};

export const generateProductId = (): string => {
  return `p${Date.now()}`;
};
