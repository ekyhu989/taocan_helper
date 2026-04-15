import defaultProducts from '../../data/products.json';

const STORAGE_KEY = 'taocang_products';
const DELETED_STORAGE_KEY = 'taocang_deleted_products';

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
  updatedAt?: string;
}

export interface DeletedProduct extends Product {
  deletedAt: string;
  restoreDeadline: string;
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
  localStorage.removeItem(DELETED_STORAGE_KEY);
  return defaultProducts as Product[];
};

export const generateProductId = (): string => {
  return `p${Date.now()}`;
};

export const loadDeletedProducts = (): DeletedProduct[] => {
  try {
    const stored = localStorage.getItem(DELETED_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('加载已删除商品数据失败:', error);
  }
  return [];
};

export const saveDeletedProducts = (products: DeletedProduct[]) => {
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('保存已删除商品数据失败:', error);
  }
};

export const softDeleteProduct = (productId: string): Product[] => {
  const products = loadProducts();
  const deletedProducts = loadDeletedProducts();
  
  const productToDelete = products.find(p => p.id === productId);
  if (!productToDelete) return products;

  const now = new Date();
  const restoreDeadline = new Date(now);
  restoreDeadline.setDate(restoreDeadline.getDate() + 7);

  const deletedProduct: DeletedProduct = {
    ...productToDelete,
    deletedAt: now.toISOString(),
    restoreDeadline: restoreDeadline.toISOString(),
  };

  const updatedProducts = products.filter(p => p.id !== productId);
  const updatedDeletedProducts = [deletedProduct, ...deletedProducts];

  saveProducts(updatedProducts);
  saveDeletedProducts(updatedDeletedProducts);

  return updatedProducts;
};

export const restoreProduct = (productId: string): Product[] => {
  const products = loadProducts();
  const deletedProducts = loadDeletedProducts();
  
  const productToRestore = deletedProducts.find(p => p.id === productId);
  if (!productToRestore) return products;

  const { deletedAt, restoreDeadline, ...restoredProduct } = productToRestore;
  restoredProduct.updatedAt = new Date().toISOString();

  const updatedProducts = [...products, restoredProduct];
  const updatedDeletedProducts = deletedProducts.filter(p => p.id !== productId);

  saveProducts(updatedProducts);
  saveDeletedProducts(updatedDeletedProducts);

  return updatedProducts;
};

export const permanentDeleteProduct = (productId: string): DeletedProduct[] => {
  const deletedProducts = loadDeletedProducts();
  const updatedDeletedProducts = deletedProducts.filter(p => p.id !== productId);
  saveDeletedProducts(updatedDeletedProducts);
  return updatedDeletedProducts;
};

export const emptyRecycleBin = (): DeletedProduct[] => {
  saveDeletedProducts([]);
  return [];
};

export const sortProductsWith832Priority = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    if (a.is832 && !b.is832) return -1;
    if (!a.is832 && b.is832) return 1;
    if (a.updatedAt && b.updatedAt) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });
};

export const isProductExists = (productName: string, products: Product[]): boolean => {
  return products.some(p => p.name === productName);
};
