export interface FestivalTemplate {
  name: string;
  products: Array<{
    name: string;
    spec: string;
    price: number;
    isPlatform832: boolean;
    category?: string;
  }>;
}

export const festivalTemplates: Record<string, FestivalTemplate> = {
  spring: {
    name: '春节礼包',
    products: [
      { name: '大米', spec: '5kg', price: 35, isPlatform832: true, category: '食品' },
      { name: '食用油', spec: '5L', price: 58, isPlatform832: true, category: '食品' },
      { name: '牛奶', spec: '1箱', price: 65, isPlatform832: false, category: '食品' },
      { name: '坚果礼盒', spec: '1盒', price: 128, isPlatform832: true, category: '食品' },
      { name: '水果礼盒', spec: '1盒', price: 88, isPlatform832: false, category: '食品' },
    ],
  },
  eidAlAdha: {
    name: '古尔邦节礼包',
    products: [
      { name: '羊肉', spec: '2kg', price: 180, isPlatform832: false, category: '食品' },
      { name: '大米', spec: '5kg', price: 35, isPlatform832: true, category: '食品' },
      { name: '食用油', spec: '5L', price: 58, isPlatform832: true, category: '食品' },
      { name: '干果礼盒', spec: '1盒', price: 98, isPlatform832: true, category: '食品' },
      { name: '蜂蜜', spec: '1瓶', price: 68, isPlatform832: false, category: '食品' },
    ],
  },
  eidAlFitr: {
    name: '肉孜节礼包',
    products: [
      { name: '馕', spec: '10个', price: 30, isPlatform832: false, category: '食品' },
      { name: '羊肉', spec: '2kg', price: 180, isPlatform832: false, category: '食品' },
      { name: '大米', spec: '5kg', price: 35, isPlatform832: true, category: '食品' },
      { name: '水果礼盒', spec: '1盒', price: 88, isPlatform832: false, category: '食品' },
      { name: '干果礼盒', spec: '1盒', price: 98, isPlatform832: true, category: '食品' },
    ],
  },
};

export const getFestivalTemplateNames = () => {
  return Object.entries(festivalTemplates).map(([key, template]) => ({
    key,
    name: template.name,
  }));
};
