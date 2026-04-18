import React, { useRef, useState } from 'react';
import type { Scheme, SchemeSet } from '../../utils/schemeGenerator';

interface SchemeCardSliderProps {
  schemes: SchemeSet;
  onSchemeSelect?: (schemeType: 'balanced' | 'costEffective' | 'highQuality') => void;
  selectedType?: 'balanced' | 'costEffective' | 'highQuality';
}

export const SchemeCardSlider: React.FC<SchemeCardSliderProps> = ({
  schemes,
  onSchemeSelect,
  selectedType = 'balanced'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(
    selectedType === 'balanced' ? 0 : selectedType === 'costEffective' ? 1 : 2
  );

  const schemeList = [
    { type: 'balanced', name: '均衡推荐', scheme: schemes.balanced, color: 'blue' } as const,
    { type: 'costEffective', name: '高性价比', scheme: schemes.costEffective, color: 'green' } as const,
    { type: 'highQuality', name: '高品质甄选', scheme: schemes.highQuality, color: 'purple' } as const
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.85 + 16;
      const newIndex = Math.round(scrollLeft / cardWidth);
      const clampedIndex = Math.max(0, Math.min(2, newIndex));
      setActiveIndex(clampedIndex);
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.85 + 16;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      {/* 滑动卡片容器 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {schemeList.map((item, index) => (
          <div
            key={item.type}
            className="flex-shrink-0 w-[85%] md:w-[350px] snap-center px-2"
          >
            <SchemeCard
              type={item.type}
              name={item.name}
              scheme={item.scheme}
              color={item.color}
              isActive={index === activeIndex}
              onClick={() => {
                onSchemeSelect?.(item.type);
                scrollToCard(index);
              }}
            />
          </div>
        ))}
      </div>

      {/* 指示器 */}
      <div className="flex justify-center gap-2 mt-4">
        {schemeList.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 桌面端箭头按钮 */}
      <div className="hidden md:flex justify-center gap-4 mt-4">
        <button
          onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
        >
          ← 上一个
        </button>
        <button
          onClick={() => scrollToCard(Math.min(2, activeIndex + 1))}
          disabled={activeIndex === 2}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
        >
          下一个 →
        </button>
      </div>
    </div>
  );
};

// 单个方案卡片组件
interface SchemeCardProps {
  type: 'balanced' | 'costEffective' | 'highQuality';
  name: string;
  scheme: Scheme;
  color: 'blue' | 'green' | 'purple';
  isActive: boolean;
  onClick: () => void;
}

const SchemeCard: React.FC<SchemeCardProps> = ({
  type,
  name,
  scheme,
  color,
  isActive,
  onClick
}) => {
  // 计算品类数和商品件数
  const categoryCount = new Set(scheme.items.map(item => item.product.category)).size;
  const totalItems = scheme.items.reduce((sum, item) => sum + item.quantity, 0);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-500'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
        isActive ? `ring-2 ${classes.border} scale-[1.02]` : 'hover:shadow-xl'
      }`}
    >
      {/* 方案标签 */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${classes.bg} ${classes.text}`}>
          {name}
        </span>
        {!scheme.ratio832.passed && (
          <span className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>⚠️</span>
            832占比不足
          </span>
        )}
        {scheme.ratio832.passed && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span>✅</span>
            合规
          </span>
        )}
      </div>

      {/* 核心数据 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">人均总价</span>
          <span className="text-xl font-bold text-gray-900">
            ¥{Math.round(scheme.perCapitaPrice)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">832占比</span>
          <span className={`font-medium ${
            scheme.ratio832.passed ? 'text-green-600' : 'text-red-500'
          }`}>
            {scheme.ratio832.amountRatio.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">品类数</span>
          <span className="font-medium text-gray-900">{categoryCount}类</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">商品件数</span>
          <span className="font-medium text-gray-900">{totalItems}件</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-gray-600">总金额</span>
          <span className="font-bold text-gray-900">
            ¥{Math.round(scheme.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 商品预览 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-2">包含商品:</p>
        <div className="flex flex-wrap gap-1">
          {scheme.items.slice(0, 3).map((item, idx) => (
            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
              {item.product.name.length > 8 
                ? item.product.name.substring(0, 8) + '...' 
                : item.product.name}×{item.quantity}
            </span>
          ))}
          {scheme.items.length > 3 && (
            <span className="text-xs text-gray-500 font-medium">
              +{scheme.items.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeCardSlider;
