export interface EmergencyConfig {
  totalBudget: number;
  peopleCount: number;
  scene: string;
}

export interface EmergencyProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface EmergencyScheme {
  id: string;
  title: string;
  status: 'draft' | 'emergency';
  config: EmergencyConfig;
  products: EmergencyProduct[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyProductTemplates: Record<string, string[]> = {
  spring: ['大米', '面粉', '食用油', '坚果礼盒', '牛奶'],
  midautumn: ['月饼礼盒', '茶叶', '水果礼盒', '红酒', '坚果'],
  special: ['办公用品', '活动用品', '纪念品', '饮料', '食品'],
  difficulty: ['粮油', '食品', '生活用品', '保暖用品', '慰问金']
};

function generateRandomProduct(name: string, priceRange: [number, number]): EmergencyProduct {
  const price = Math.round(
    Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0]
  );
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    price,
    quantity: 1
  };
}

export function generateEmergencyScheme(config: EmergencyConfig): EmergencyScheme {
  const { totalBudget, peopleCount, scene } = config;
  const productNames = emergencyProductTemplates[scene] || emergencyProductTemplates.special;
  
  const numProducts = Math.min(5, productNames.length, Math.floor(totalBudget / 100) + 2);
  const selectedNames = productNames.slice(0, numProducts);
  
  const perCapitaBudget = totalBudget / peopleCount;
  const productPriceRange: [number, number] = [
    Math.max(50, perCapitaBudget * 0.5),
    Math.min(300, perCapitaBudget * 1.2)
  ];

  const products: EmergencyProduct[] = selectedNames.map((name) =>
    generateRandomProduct(name, productPriceRange)
  );

  let totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  
  while (totalAmount > totalBudget && products.length > 1) {
    products.pop();
    totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  const scheme: EmergencyScheme = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: `${getSceneName(scene)}应急方案`,
    status: 'emergency',
    config,
    products,
    totalAmount,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return scheme;
}

function getSceneName(scene: string): string {
  const names: Record<string, string> = {
    spring: '春节慰问',
    midautumn: '中秋慰问',
    special: '专项活动',
    difficulty: '困难帮扶'
  };
  return names[scene] || '采购';
}
